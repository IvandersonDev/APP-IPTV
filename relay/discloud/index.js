// Ponto de entrada para a Discloud (site): porta 8080, atrás do proxy HTTPS da própria Discloud.
process.env.TRUST_PROXY = '1';
require('./server.cjs').start(8080, '0.0.0.0');
