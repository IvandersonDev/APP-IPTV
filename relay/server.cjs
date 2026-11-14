// Servidor de pareamento do BLACK PLUS TV: recebe o link da lista enviado pelo celular e entrega à TV.
// Sem dependências (Node 18+). Guarda tudo só em memória, por no máximo 2 minutos, e apaga depois de entregue.
//   PORT=8787 HOST=127.0.0.1 TRUST_PROXY=1 node server.cjs
// Coloque um proxy com HTTPS na frente (Caddy ou nginx): a página do celular precisa de HTTPS para criptografar.
'use strict';
const http = require('http');

const PORT = +process.env.PORT || 8787;
const HOST = process.env.HOST || '127.0.0.1';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const TTL_MS = 2 * 60 * 1000;   // o código/QR vale 2 minutos; depois a TV gera outro sozinha
const LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY = 8 * 1024;
const MAX_SESSIONS = 5000;
const ID_RE = /^[2-9A-HJ-NP-Z]{8}$/;

const sessions = new Map();   // id -> { st: 'w'|'r', p: payload, exp: ms }
const hits = new Map();       // limite simples por IP: chave -> { n, reset }
const stats = { criadas: 0, consultas: 0, envios_ok: 0, envios_erro: 0, ultimo_erro: '', ultimo_envio_em: 0, pagina_aberta: 0 };   // só contadores: nunca o conteúdo

function sweep() { const now = Date.now(); sessions.forEach((v, k) => { if (v.exp <= now) sessions.delete(k); }); hits.forEach((v, k) => { if (v.reset <= now) hits.delete(k); }); }
setInterval(sweep, 30 * 1000).unref();

function limited(ip, kind, max, windowMs) {
  const key = kind + ':' + ip, now = Date.now();
  let h = hits.get(key);
  if (!h || h.reset <= now) { h = { n: 0, reset: now + windowMs }; hits.set(key, h); }
  h.n++;
  return h.n > max;
}

function clientIp(req) {
  if (TRUST_PROXY) { const f = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim(); if (f) return f; }
  return req.socket.remoteAddress || 'x';
}

function send(res, status, obj, extra) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(status, Object.assign({
    'content-type': typeof obj === 'string' ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer'
  }, extra || {}));
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const parts = [];
    req.on('data', c => { n += c.length; if (n > MAX_BODY) { reject(new Error('grande')); req.destroy(); } else parts.push(c); });
    req.on('end', () => resolve(Buffer.concat(parts).toString('utf8')));
    req.on('error', reject);
  });
}

function validPayload(p) {
  if (!p || typeof p !== 'object') return null;
  if (p.enc === true) {
    if (typeof p.iv !== 'string' || typeof p.c !== 'string') return null;
    if (p.iv.length > 40 || p.c.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(p.iv + p.c)) return null;
    return { enc: true, iv: p.iv, c: p.c };
  }
  if (typeof p.url !== 'string' || !/^https?:\/\/[^\s/]+/i.test(p.url) || p.url.length > 3000) return null;
  const name = typeof p.name === 'string' ? p.name.slice(0, 60) : '';
  return { enc: false, url: p.url, name };
}

async function handle(req, res) {
  const u = new URL(req.url, 'http://x');
  const ip = clientIp(req);
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/p')) {
    stats.pagina_aberta++;
    return send(res, 200, PHONE_HTML, { 'content-security-policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'" });
  }
  if (req.method === 'GET' && u.pathname === '/saude') return send(res, 200, Object.assign({ ok: true, sessoes: sessions.size, ultimo_envio_ha_s: stats.ultimo_envio_em ? Math.round((Date.now() - stats.ultimo_envio_em) / 1000) : null }, stats, { ultimo_envio_em: undefined }));
  const m = /^\/api\/s\/([^/]+)$/.exec(u.pathname);
  if (!m) return send(res, 404, { erro: 'nao encontrado' });
  const id = decodeURIComponent(m[1]).toUpperCase().replace(/-/g, '');
  if (!ID_RE.test(id)) return send(res, 400, { erro: 'codigo invalido' });
  const now = Date.now();
  let s = sessions.get(id);
  if (s && s.exp <= now) { sessions.delete(id); s = null; }

  if (req.method === 'POST') {            // a TV abre uma sessão
    if (limited(ip, 'novo', 30, LIMIT_WINDOW_MS)) return send(res, 429, { erro: 'muitas tentativas' });
    if (s) return send(res, 409, { erro: 'codigo em uso' });
    if (sessions.size >= MAX_SESSIONS) return send(res, 503, { erro: 'servidor ocupado' });
    sessions.set(id, { st: 'w', exp: now + TTL_MS }); stats.criadas++;
    return send(res, 201, { ok: true, ttl: TTL_MS / 1000 });
  }
  if (req.method === 'GET') {             // a TV consulta
    stats.consultas++;
    if (!s) return send(res, 404, { st: 'gone' });
    if (s.st === 'w') return send(res, 200, { st: 'waiting', ttl: Math.max(0, Math.round((s.exp - now) / 1000)) });
    sessions.delete(id);                  // entrega uma única vez
    return send(res, 200, { st: 'ready', p: s.p });
  }
  if (req.method === 'PUT') {             // o celular envia
    if (limited(ip, 'envio', 20, 60 * 1000)) return send(res, 429, { erro: 'muitas tentativas' });
    if (!s) { stats.envios_erro++; stats.ultimo_erro = 'codigo nao encontrado ou expirado'; return send(res, 404, { erro: 'codigo nao encontrado ou expirado' }); }
    if (s.st !== 'w') { stats.envios_erro++; stats.ultimo_erro = 'ja recebida'; return send(res, 409, { erro: 'esta TV ja recebeu uma lista' }); }
    let body;
    try { body = JSON.parse(await readBody(req)); } catch (e) { return send(res, 400, { erro: 'corpo invalido' }); }
    const p = validPayload(body);
    if (!p) { stats.envios_erro++; stats.ultimo_erro = 'dados invalidos'; return send(res, 400, { erro: 'dados invalidos' }); }
    s.st = 'r'; s.p = p; stats.envios_ok++; stats.ultimo_envio_em = Date.now();
    return send(res, 200, { ok: true });
  }
  return send(res, 405, { erro: 'metodo nao permitido' });
}

const PHONE_HTML = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="referrer" content="no-referrer"><title>Enviar lista para a TV</title>
<style>
  :root { --bg:#0b0e15; --card:#151a24; --line:#2a3345; --text:#f3f5f9; --muted:#9aa4b6; --gold:#f5b942; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:16px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif; padding:20px; }
  main { max-width:520px; margin:0 auto; }
  h1 { font-size:24px; margin:8px 0 4px; } p { color:var(--muted); margin:0 0 18px; }
  label { display:block; font-size:12px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin:16px 0 6px; font-weight:700; }
  input, textarea { width:100%; background:var(--card); color:var(--text); border:1px solid var(--line); border-radius:12px; padding:14px; font:inherit; }
  textarea { min-height:120px; resize:vertical; word-break:break-all; }
  input:focus, textarea:focus { outline:2px solid var(--gold); border-color:transparent; }
  button { width:100%; margin-top:20px; padding:16px; border:0; border-radius:999px; background:var(--gold); color:#1a1203; font:700 17px inherit; cursor:pointer; }
  button:disabled { opacity:.5; }
  .msg { margin-top:16px; padding:14px; border-radius:12px; display:none; }
  .ok { background:#14301f; border:1px solid #1f6b3a; display:block; } .err { background:#3a1717; border:1px solid #7a2a2a; display:block; }
  .tag { display:inline-block; font-size:12px; padding:3px 10px; border-radius:99px; background:#1b2231; color:var(--muted); margin-top:4px; }
</style></head><body><main>
<h1>Enviar lista para a TV</h1>
<p>Cole o link da lista e toque em Enviar. Ela aparece na TV.</p>
<div id="codebox" style="display:none"><label for="code">Código mostrado na TV</label><input id="code" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="ABCD-EFGH" maxlength="9"></div>
<label for="url">Link da lista</label>
<textarea id="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="http://servidor/get.php?username=...&password=..."></textarea>
<label for="name">Nome (opcional)</label>
<input id="name" autocomplete="off" maxlength="60" placeholder="Minha lista">
<button id="send">Enviar para a TV</button>
<div id="msg" class="msg"></div>
<span id="mode" class="tag"></span>
</main>
<script>
(function () {
  var $ = function (i) { return document.getElementById(i); };
  var hash = location.hash.slice(1), parts = hash.split('.'), id = '', keyB64 = '';
  if (parts.length === 2 && /^[2-9A-HJ-NP-Z]{8}$/i.test(parts[0]) && parts[1].length >= 40) { id = parts[0].toUpperCase(); keyB64 = parts[1]; }
  history.replaceState(null, '', location.pathname);   // tira a chave do endereço visível
  var secure = !!(window.crypto && crypto.subtle) && !!keyB64;
  if (!id) $('codebox').style.display = 'block';
  $('mode').textContent = secure ? 'Criptografia de ponta a ponta ativa' : 'Envio pelo código (conexão HTTPS)';
  function b64u(buf) { var s = '', b = new Uint8Array(buf); for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var r = atob(s), a = new Uint8Array(r.length); for (var i = 0; i < r.length; i++) a[i] = r.charCodeAt(i); return a; }
  function show(t, ok) { var m = $('msg'); m.className = 'msg ' + (ok ? 'ok' : 'err'); m.textContent = t; }
  $('send').onclick = async function () {
    var url = $('url').value.trim(), name = $('name').value.trim(), sid = id;
    if (!sid) sid = $('code').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[2-9A-HJ-NP-Z]{8}$/.test(sid)) return show('Confira o código da TV (8 letras e números).', false);
    if (!/^https?:\\/\\/[^\\s/]+/i.test(url)) return show('O link precisa começar com http:// ou https://', false);
    $('send').disabled = true;
    try {
      var body;
      if (secure) {
        var key = await crypto.subtle.importKey('raw', unb64u(keyB64), 'AES-GCM', false, ['encrypt']);
        var iv = crypto.getRandomValues(new Uint8Array(12));
        var data = new TextEncoder().encode(JSON.stringify({ url: url, name: name }));
        var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: new TextEncoder().encode(sid) }, key, data);
        body = { enc: true, iv: b64u(iv), c: b64u(ct) };
      } else body = { enc: false, url: url, name: name };
      var r = await fetch('/api/s/' + sid, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      var j = await r.json().catch(function () { return {}; });
      if (r.ok) { show('Pronto! Veja a TV: confirme para adicionar a lista.', true); $('url').value = ''; }
      else if (r.status === 404) show('Este QR expirou. Olhe a TV: ela já mostra um código novo. Leia o novo QR.', false);
      else show(j.erro || ('Erro ' + r.status), false);
    } catch (e) { show('Não foi possível enviar: ' + (e && e.message), false); }
    $('send').disabled = false;
  };
})();
</script></body></html>`;

function start(port, host) {
  return http.createServer((req, res) => { handle(req, res).catch(() => { try { send(res, 500, { erro: 'falha interna' }); } catch (e) {} }); })
    .listen(port || PORT, host || HOST, () => console.log('Pareamento BLACK PLUS TV ouvindo em http://' + (host || HOST) + ':' + (port || PORT)));
}
if (require.main === module) start();
module.exports = { handle, start, PHONE_HTML, sessions };
