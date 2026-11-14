# Servidor de pareamento (QR code) — BLACK PLUS TV

Programa pequeno em Node.js, **sem dependências**, que leva o link da lista do celular até a TV.
Guarda tudo só na memória, por no máximo 2 minutos, e apaga assim que a TV recebe.

## Como funciona

1. A TV pede uma sessão (`POST /api/s/<codigo>`) e mostra um QR com `https://SEU-DOMINIO/p#<codigo>.<chave>`.
2. O celular abre a página, **criptografa o link no próprio navegador** (AES-GCM, chave que só existe no QR) e envia (`PUT`).
3. A TV consulta a cada 2,5 s (`GET`), recebe, decifra e pede a sua confirmação antes de adicionar.

A parte depois do `#` (a chave) nunca é enviada ao servidor. Se alguém digitar só o código no celular (sem QR),
o envio vai sem criptografia de ponta a ponta, mas só por HTTPS, e apaga em seguida.

## Hospedado na Discloud (o que está em uso hoje)

Pasta `discloud/`: `index.js` (porta 8080), `server.cjs`, `package.json` e `discloud.config` (`TYPE=site`, `ID=blackplus-pair`).
O app é enviado como `blackplus-pair.zip` em *Aplicações > Upload* e atende em **https://blackplus-pair.discloud.dev**
(HTTPS já incluso). É preciso reservar antes o subdomínio em *Domínios > Criar subdomínio*. Teste: `/saude`.

## Instalar em uma VPS própria (Debian/Ubuntu)

Requisitos: Node 18+, um domínio ou subdomínio apontando para a VPS (ex.: `pair.seudominio.com`) e as portas 80/443 abertas.

```bash
sudo mkdir -p /opt/blackplus-pair && sudo cp server.cjs /opt/blackplus-pair/
sudo useradd --system --no-create-home --shell /usr/sbin/nologin blackplus
sudo cp blackplus-pair.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now blackplus-pair
curl http://127.0.0.1:8787/saude        # deve responder {"ok":true,...}
```

HTTPS é obrigatório (a página do celular só criptografa em conexão segura). O jeito mais simples é o **Caddy**,
que obtém o certificado sozinho. Arquivo `/etc/caddy/Caddyfile`:

```
pair.seudominio.com {
    reverse_proxy 127.0.0.1:8787
}
```

```bash
sudo systemctl reload caddy
curl https://pair.seudominio.com/saude
```

(Com nginx: `proxy_pass http://127.0.0.1:8787;` e `proxy_set_header X-Forwarded-For $remote_addr;`.)

## Ligar a TV ao servidor

Sem recompilar o app, a partir do computador (com a TV em modo desenvolvedor):

```bash
node tools/definir_relay.cjs https://pair.seudominio.com
```

Para tirar: `node tools/definir_relay.cjs --limpar`. Sem servidor definido, o app continua só com a digitação.

## Segurança e limites

- Limites por IP: 30 sessões novas em 10 min e 20 envios por minuto; no máximo 5.000 sessões ao mesmo tempo.
- O servidor não registra o conteúdo enviado. Não coloque logs de corpo no proxy.
- O código tem 8 caracteres (40 bits) e vale 2 minutos (depois a TV gera outro sozinha); a TV sempre mostra o endereço da lista recebida (sem a senha) e pede a sua confirmação antes de adicionar.
- Reinicie o serviço quando quiser: as sessões em andamento se perdem, e a TV gera outra sozinha.
