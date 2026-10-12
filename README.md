# APP-IPTV

## BLACK PLUS TV

Aplicativo Android e Android TV para assistir às listas M3U e contas Xtream Codes do próprio usuário, com suporte ao acesso por código, usuário e senha.

### Instalação pela TV

1. Abra o **Downloader by AFTVnews** na TV.
2. Abra o [download direto do BLACK PLUS TV (APK)](https://github.com/IvandersonDev/APP-IPTV/releases/latest/download/BLACK-PLUS-TV.apk).
3. Aguarde o download e autorize a instalação, se solicitado.

**Android / Android TV — versão 1.0.13:** preserva login por **Código + Usuário + Senha**, capas de filmes/séries e servidor Xtream opcional. Acrescenta proteção contra saída involuntária durante erros de TV ao vivo, melhoria na troca rápida de canais e limpeza de recursos do ExoPlayer/VLC. O aplicativo mantém o identificador independente `com.ivandersondev.blackplustv`, sem conflito com o Assist Plus original. Requer Android 5.0 ou superior e espaço livre suficiente.

**Validação Android 1.0.13:** APK compilado e assinado com a mesma chave de desenvolvimento da versão anterior; atualização `adb install -r` instalada no emulador Android Studio sem remoção dos dados; inicialização e 15 trocas de canal na interface sem saída involuntária; testes automatizados de erros, 30 zaps e login aprovados. A reprodução integral em Android TV/TV Box físico continua pendente de confirmação — valide antes de distribuir em escala.

**Atenção:** nenhuma versão `.apk` funciona nativamente em TVs LG com webOS. Para LG, consulte a seção abaixo sobre o pacote `.ipk` experimental.

Endereço direto para copiar no Downloader:

`https://github.com/IvandersonDev/APP-IPTV/releases/latest/download/BLACK-PLUS-TV.apk`

Página de versões: https://github.com/IvandersonDev/APP-IPTV/releases

**Integridade do APK v1.0.13 (SHA-256):**

`80dd491669ad598eef30f158280fc6f3dfaeecc6a94ed8bf5421bf5f3c4f2a4d`

Antes de instalar, confira o hash do APK baixado com o SHA-256 publicado. Não desinstale a versão anterior para atualizar, pois isso pode apagar a lista e o token salvos.

**Smart TVs Philco:** confirme o sistema da televisão antes de usar o APK. Modelos Android TV/Google TV compatíveis podem instalar APK; TVs Roku TV e outros sistemas não executam APK Android nativamente.

### LG Smart TV (webOS)

Para TVs LG com webOS, use o aplicativo **BLACK PLUS TV webOS 1.1.0 Beta** (`.ipk`) da [pré-versão LG](https://github.com/IvandersonDev/APP-IPTV/releases/tag/webos-v1.1.0-beta.1). Ele é diferente do `.apk` Android.

O `.ipk` é um aplicativo instalado na TV e aparece no launcher; não é um link para abrir no navegador.

**Instalação em TV LG:** instale o aplicativo **Developer Mode** pela loja de aplicativos da TV LG; entre com uma conta de desenvolvedor da LG, ative Developer Mode e Key Server. Conecte a TV e um computador na mesma rede; no computador, use o **webOS Dev Manager** para adicionar a TV e instalar o pacote `.ipk`. O Downloader de APKs Android e o pendrive comum não instalam aplicativos webOS.

**Estado da versão webOS:** o pacote público 1.1.0 é uma beta antiga. Versões posteriores até a **1.1.5 Beta** foram desenvolvidas e testadas localmente na LG 55UT8050PSA, com reprodução real, login, botão Voltar e troca de canais validados, mas a 1.1.5 ainda não foi publicada neste repositório. Cada versão é empacotada pelo **LG webOS `ares-package` oficial**. A compatibilidade depende do modelo da TV, codecs e restrições do provedor. O pacote `.ipk` não deve ser confundido com o APK Android.

**SHA-256 da versão LG 1.1.0 Beta:**

`d7b6c413085b1996f5d03c990a7e5e789319cc4a7196ef231a9a17fd26106e9a`

> O aplicativo não fornece canais, filmes ou séries. Utilize apenas serviços e listas aos quais você tem acesso autorizado.

### Distribuição

O APK é disponibilizado como arquivo de uma **GitHub Release**, e não como um arquivo versionado no repositório Git. Assim a instalação pode usar um link HTTPS direto e o repositório permanece leve.

O projeto Android e as configurações locais permanecem no computador de desenvolvimento.
