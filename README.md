# APP-IPTV

## BLACK PLUS TV

Aplicativo Android e Android TV para assistir às listas M3U e contas Xtream Codes do próprio usuário, com suporte ao acesso por código, usuário e senha.

### Instalação pela TV

1. Abra o **Downloader by AFTVnews** na TV.
2. Abra o [download direto do BLACK PLUS TV (APK)](https://github.com/IvandersonDev/APP-IPTV/releases/latest/download/BLACK-PLUS-TV.apk).
3. Aguarde o download e autorize a instalação, se solicitado.

**Android / Android TV — versão 1.0.15:** visual novo, menu inicial para escolher **TV ao vivo, Filmes ou Séries**, banner de destaque e fileiras horizontais, faixa **Continuar** (último canal, filme e série em andamento), ícones próprios (não dependem das fontes da TV) e carregamento muito mais rápido: links `get.php?username=...&password=...` passam a usar a API Xtream do servidor, e o catálogo fica em cache. Também é possível **adicionar uma lista pelo celular lendo um QR code** (veja abaixo). Mantém o login por **Código + Usuário + Senha**, as capas e o servidor Xtream opcional. O identificador continua `com.ivandersondev.blackplustv`, sem conflito com o Assist Plus original. Requer Android 5.0 ou superior e espaço livre suficiente.

**Validação Android 1.0.15:** APK compilado e assinado com a mesma chave de desenvolvimento da versão anterior (a atualização mantém listas e login), com os testes automatizados de lógica (login, 30 trocas de canal, filmes e busca) aprovados no computador. **Não foi instalado nem testado em Android TV, TV Box físico ou emulador** — valide antes de distribuir em escala.

**Atenção:** nenhuma versão `.apk` funciona nativamente em TVs LG com webOS. Para LG, consulte a seção abaixo sobre o pacote `.ipk` experimental.

Endereço direto para copiar no Downloader:

`https://github.com/IvandersonDev/APP-IPTV/releases/latest/download/BLACK-PLUS-TV.apk`

Página de versões: https://github.com/IvandersonDev/APP-IPTV/releases

**Integridade do APK v1.0.15 (SHA-256):**

`779aecac7cb414f6d58cf498ddef60b645c2da9327318a71239cf6bd35fad23e`

Antes de instalar, confira o hash do APK baixado com o SHA-256 publicado. Não desinstale a versão anterior para atualizar, pois isso pode apagar a lista e o token salvos.

**Smart TVs Philco:** confirme o sistema da televisão antes de usar o APK. Modelos Android TV/Google TV compatíveis podem instalar APK; TVs Roku TV e outros sistemas não executam APK Android nativamente.

### LG Smart TV (webOS)

Para TVs LG com webOS, use o aplicativo **BLACK PLUS TV webOS 1.1.17 Beta** (`.ipk`) da [pré-versão LG](https://github.com/IvandersonDev/APP-IPTV/releases/tag/webos-v1.1.17-beta.1). Ele é diferente do `.apk` Android.

O `.ipk` é um aplicativo instalado na TV e aparece no launcher; não é um link para abrir no navegador.

**Instalação em TV LG:** instale o aplicativo **Developer Mode** pela loja de aplicativos da TV LG; entre com uma conta de desenvolvedor da LG, ative Developer Mode e Key Server. Conecte a TV e um computador na mesma rede; no computador, use o **webOS Dev Manager** para adicionar a TV e instalar o pacote `.ipk`. O Downloader de APKs Android e o pendrive comum não instalam aplicativos webOS.

**Estado da versão webOS:** a **1.1.17 Beta** traz o mesmo visual, menu inicial, fileiras, cache e QR code da versão Android, empacotada pelo **LG webOS `ares-package` oficial**. Foi instalada, aberta e usada na LG 55UT8050PSA (listas, API Xtream, adicionar lista por QR code, reprodução e botão Voltar). A compatibilidade depende do modelo da TV, dos codecs e das restrições do provedor; o player da LG costuma recusar MPEG-TS e alguns MKV (prefira links com `output=m3u8`/HLS ou `.mp4`). O pacote `.ipk` não deve ser confundido com o APK Android.

**SHA-256 da versão LG 1.1.17 Beta:**

`b170a2fbd53d3bf33f5ce28fe87e0174305b95f24d41b61e0598b0783dd44a6b`

Versões anteriores: 1.1.0 Beta, SHA-256 `d7b6c413085b1996f5d03c990a7e5e789319cc4a7196ef231a9a17fd26106e9a`.

### Adicionar lista pelo celular (QR code)

Em **Adicionar lista**, a TV mostra um QR code e um código curto. Você lê o QR com a câmera do celular, cola o link da lista na página que abrir e toca em **Enviar**; a TV recebe e pede a sua confirmação antes de adicionar.

- O link é **criptografado no celular** (AES-GCM) com uma chave que existe só dentro do QR code e nunca vai ao servidor.
- O servidor guarda tudo **só na memória, por no máximo 2 minutos**, e apaga assim que a TV recebe. Se o tempo acabar, a TV gera outro código sozinha.
- Sem QR (ou sem internet), continua dando para **digitar o link na própria TV**.
- O app usa por padrão o servidor `https://blackplus-pair.discloud.dev`. O código do servidor está em [`relay/`](relay/) (Node.js, sem dependências) e pode ser hospedado por você; veja [`relay/README.md`](relay/README.md).

> O aplicativo não fornece canais, filmes ou séries. Utilize apenas serviços e listas aos quais você tem acesso autorizado.

### Distribuição

O APK é disponibilizado como arquivo de uma **GitHub Release**, e não como um arquivo versionado no repositório Git. Assim a instalação pode usar um link HTTPS direto e o repositório permanece leve.

O projeto Android e as configurações locais permanecem no computador de desenvolvimento.
