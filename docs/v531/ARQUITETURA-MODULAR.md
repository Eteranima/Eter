# Arquitetura modular do Éter 5.31

## Decisão

A versão recebida no GEP-32 era `5.31.0`, SHA-256
`522e6772ca9ba07d0259ba6a210962887b0263113573c3803035da25949bb39f`, com
39.108.725 bytes. Desses, aproximadamente 28,55 MB eram 514 imagens Base64.
O jogo não foi reescrito: imagens, CSS e blocos JavaScript foram extraídos
mecanicamente, mantendo a ordem e o escopo léxico dos scripts clássicos.

O resultado possui 38 módulos. Nenhum módulo de regra excede 300 KB e cada
asset possui tamanho e hash no catálogo. O monólito passa a ser apenas uma
entrada de migração preservada fora do Git; `src/` é a fonte editável.

## Camadas

| Camada | Responsabilidade |
|---|---|
| `src/assets/` | personagens, monstros, pets, interface, mundo e fontes locais |
| `scripts/data/` | elementos, condições, dificuldade, itens, habilidades, ultimates, conjuntas e pets |
| `scripts/characters/` | elenco, estatísticas, progressão e Grimório |
| `scripts/monsters/` | bestiário, raridade, drops e formações |
| `scripts/world/` | missões, EXP, tiles e mapas |
| `scripts/engine/` | áudio, input, render, save, campo, relógio, loop e efeitos |
| `scripts/combat/` | fórmula, estado/IA do combate e desenho |
| `scripts/ui/` | HUD, diálogo, menus, loja, título e seleção |
| `scripts/scenes/` | motor de cutscene e roteiros |
| `scripts/tests/` | autoteste embutido, atualmente 1.351 asserções |

Os scripts continuam clássicos e são carregados sequencialmente. Essa escolha
é transitória e intencional: convertê-los diretamente em ES modules exigiria
inventar centenas de imports/exports e misturaria refatoração arquitetural com
uma atualização funcional sem baseline. A próxima refatoração pode introduzir
módulos ES por domínio, um de cada vez, sempre mantendo o autoteste verde.

## Build e integridade

`tools/migrar_html_modular.py` é um conversor de ingresso, usado somente para
reproduzir a migração do monólito original. Ele:

1. extrai cada Data URI para arquivo binário;
2. registra SHA-256, tamanho, chave e caminho em `asset-catalog.json`;
3. substitui a importação remota de fontes por WOFF2 locais;
4. separa o JavaScript por marcadores estruturais;
5. preserva a espera de fontes e imagens antes do autoteste remoto.

`tools/construir_modular.py` é o build normal. Ele rejeita módulo ausente,
asset alterado, hash divergente, fonte remota ou imagem embutida no índice e
materializa a árvore pública de forma atômica.

## Compatibilidade

- O identificador de save continua `eter-anima:jrpg:v3`.
- Existem três slots de save, com leitura das estruturas anteriores.
- IDs de habilidades e nós do Grimório são preservados porque aparecem no
  save; nomes de arquivo não fazem parte do estado do jogador.
- O jogo continua estático, anônimo e sem API, HML, OIDC, banco ou multiplayer.
- A árvore `public/` vigente não foi substituída neste trabalho; a 5.31 deve
  passar por promoção funcional separada.
