# APP-IPTV

## BLACK PLUS TV

Aplicativo Android e Android TV para assistir às listas M3U e contas Xtream Codes do próprio usuário, com suporte ao acesso por código, usuário e senha.

### Instalação pela TV

1. Abra o **Downloader by AFTVnews** na TV.
2. Abra o [download direto do BLACK PLUS TV (APK)](https://github.com/IvandersonDev/APP-IPTV/releases/latest/download/BLACK-PLUS-TV.apk).
3. Aguarde o download e autorize a instalação, se solicitado.

**Android / Android TV — versão 1.0.11:** inclui a correção definitiva das capas de filmes e séries em WebViews antigos, além do acesso por servidor Xtream opcional. O identificador independente `com.ivandersondev.blackplustv` evita conflito de assinatura com o Assist Plus original. A edição nova pode ser instalada ao lado da antiga, mas as listas e credenciais não são importadas automaticamente. Requer Android 5.0 ou superior e espaço livre suficiente.

**Atenção:** nenhuma versão `.apk` funciona nativamente em TVs LG com webOS. Para LG, consulte a seção abaixo sobre o pacote `.ipk` experimental.

Endereço direto para copiar no Downloader:

`https://github.com/IvandersonDev/APP-IPTV/releases/latest/download/BLACK-PLUS-TV.apk`

Página de versões: https://github.com/IvandersonDev/APP-IPTV/releases

**Integridade do APK v1.0.11 (SHA-256):**

`d7332fcd2c1c80da686fbe100ae7598b6e885a28baf9e4245f6a0ff80733d81d`

O arquivo foi baixado integralmente do GitHub para conferência: o hash publicado coincide com o build local assinado.

### LG Smart TV (webOS)

Para TVs LG com webOS, use o aplicativo **BLACK PLUS TV webOS 1.1.0 Beta** (`.ipk`) da [pré-versão LG](https://github.com/IvandersonDev/APP-IPTV/releases/tag/webos-v1.1.0-beta.1). Ele é diferente do `.apk` Android.

O `.ipk` é um aplicativo instalado na TV e aparece no launcher; não é um link para abrir no navegador.

**Instalação em TV LG:** instale o aplicativo **Developer Mode** pela loja de aplicativos da TV LG; entre com uma conta de desenvolvedor da LG, ative Developer Mode e Key Server. Conecte a TV e um computador na mesma rede; no computador, use o **webOS Dev Manager** para adicionar a TV e instalar o pacote `.ipk`. O Downloader de APKs Android e o pendrive comum não instalam aplicativos webOS.

**Estado da versão webOS:** pacote gerado com o **LG webOS `ares-package` oficial**, passou pelo `ares-package --check`, leitura de manifesto e verificação sintática do JavaScript. **Ainda não foi instalado/testado em uma LG física.** O login por código, Xtream/M3U, as capas e a reprodução precisam ser validados na TV: o acesso HTTP pode ser bloqueado pelo CORS do provedor e os codecs/formatos variam com o webOS. Por isso o download LG é beta, e não uma versão final certificada.

**SHA-256 da versão LG 1.1.0 Beta:**

`a94413d59881fd74ff60ca4d948ef526a5d50705249be2ff1c868b1fa3aa7f6f`

> O aplicativo não fornece canais, filmes ou séries. Utilize apenas serviços e listas aos quais você tem acesso autorizado.

### Distribuição

O APK é disponibilizado como arquivo de uma **GitHub Release**, e não como um arquivo versionado no repositório Git. Assim a instalação pode usar um link HTTPS direto e o repositório permanece leve.

O projeto Android e as configurações locais permanecem no computador de desenvolvimento.
