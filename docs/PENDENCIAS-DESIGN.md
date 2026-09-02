# Pendências de design — próximas updates

Registro de decisões de design já tomadas pelo usuário mas **ainda não
implementadas**. Cada item aqui é observação para quando formos mexer
nele — não mexer agora.

---

## 1. Tirar monstros da Stone Reach Academy e do Pátio

Decisão (2026-08-26): a Academia e o Pátio Central não devem ter
NENHUM encontro de monstro daqui pra frente. Essas áreas passam a ser
só de NPCs — sem combate ambiente.

Monstros continuam existindo normalmente nos mapas que fazem sentido
ter criatura (masmorras, subterrâneo, deserto, pântano, etc.) — a
mudança é só remover formações/spawns de mob dos mapas de academia.

Mapas afetados a levantar quando for fazer: todo `MAPS[...]` cujo
`.zona` ou nome indique Stone Reach / Pátio (`abertura_patio` e afins
em `12-maps.js`), removendo `formacoes`/spawns de mob desses mapas
especificamente — não altera o resto do mundo.

## 2. Elenco de NPCs da Academia — todas as raças do livro, vivendo em harmonia

Decisão (2026-08-26): próxima leva de NPCs vai substituir os
figurantes genéricos atuais por personagens factíveis e importantes
pra trama de Éter Anima, seguindo o livro-base:

- Lycans, Vampiros, Elfos, Mortos-Vivos e Humanos convivendo na
  Academia como comunidade única.
- Diálogos devem reforçar, quando fizer sentido, a importância da
  aliança entre as raças para enfrentar os Demônios (tema central do
  livro).
- Esses NPCs entregam quest e fazem o jogador progredir nessas áreas
  (ver item 1: eles substituem o papel que hoje é ocupado por combate
  ambiente).

Isso depende de ter primeiro a estrutura de raça jogável/NPC descrita
em `ATUALIZACAO_BASE_SKILL_TREE.md` e guardada (ainda não ativa) em
`src/scripts/data/38-skilltree-reservado.js` — ao criar esses NPCs,
aproveitar `RESERVADO_RACAS` como referência de identidade racial
(o que cada raça É), mesmo sem o sistema mecânico de raça estar ligado
ainda.

## 3. Mob no modo World (arte + engine)

Ver `docs/ATLAS-SPRITES.md`, seção 4: dimensão já definida (parado:
84px de exibição, igual ao boss de campo; andando: grade 3×4 igual ao
chibi). Falta o motor: hoje só NPC e boss de mapa têm entrada própria
em `18-day-night.js`/`20-field-view.js` — um "mob comum" de bloqueio
de passagem (ex.: 5 lobos numa passagem, liberados por uma skill de
dano em área ensinada pelo Abel) precisa de um tipo de entidade novo
no mapa, com gatilho de missão pra sumir ao ser "vencido"/dissipado.
Combate de verdade contra eles pode ou não ser necessário dependendo
de como a missão for desenhada (pode ser só um evento de campo, sem
abrir tela de batalha).
