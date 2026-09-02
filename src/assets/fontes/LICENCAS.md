# Fontes servidas pelo próprio domínio

O Éter Anima não depende de servidor de terceiro para carregar. As duas
famílias abaixo são redistribuídas sob a SIL Open Font License 1.1, que permite
hospedagem própria desde que a licença acompanhe os arquivos.

| Família | Arquivos | Autoria | Licença |
|---|---|---|---|
| Inter | `inter-latin.woff2`, `inter-latin-ext.woff2` | Rasmus Andersson | SIL OFL 1.1 |
| Press Start 2P | `press-start-2p-latin.woff2`, `press-start-2p-latin-ext.woff2` | CodeMan38 | SIL OFL 1.1 |

Só os subconjuntos latino e latino estendido são servidos: são os que o jogo
usa em português. O publicador copia estes arquivos para `public/assets/fontes`
e gera as declarações `@font-face` correspondentes, removendo qualquer
`@import` externo que venha no HTML colado — inclusive em versões futuras.

Texto completo da licença: <https://openfontlicense.org>
