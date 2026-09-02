# Pendências de design — próximas updates

Registro de decisões de design já tomadas pelo usuário mas **ainda não
implementadas**. Cada item aqui é observação para quando formos mexer
nele — não mexer agora.

---

## 1. Tirar monstros da Stone Reach Academy e do Pátio — entregue no P0

Decisão (2026-08-26), entregue no P0: a Academia e o Pátio Central não
declaram encontros nem mobs hostis. Essas áreas são de convivência e
NPCs — sem combate ambiente.

Monstros continuam existindo normalmente nos mapas que fazem sentido
ter criatura (masmorras, subterrâneo, deserto, pântano, etc.). A missão
do Zelador preserva o mesmo ID, alvo e progresso de save, mas rastreia
Lobos de Éter no Subterrâneo Selado antes que cheguem ao pátio.

O fundo de batalha exclusivo do Pátio foi removido do catálogo porque
não existe mais caminho de combate que o consuma. As formações históricas
permanecem como catálogo de conteúdo, mas nenhum mapa da Academia ativa
encontro para essa região.

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

## 3. Mob no modo World (arte + engine) — base entregue no P0

O P0 introduziu a entidade de mapa em `17-world.js`, o ciclo de
combate/respawn em `18-day-night.js`, patrulha em `19-world-map.js` e
desenho em `20-field-view.js`. O Subterrâneo Selado é o recorte inicial:
três mobs visíveis, com combate real, sem encontro aleatório e sem
persistir derrota ou temporizador no save.

Ver `docs/ATLAS-SPRITES.md`, seção 4: o suporte atual é arte estática a
84px. A grade 3×4 e mobs condicionais de missão continuam pendentes e
devem ser projetados junto da missão que os consumir. A expansão para
outras áreas requer equilibrar cada mapa e preservar as quests que hoje
dependem de encontros aleatórios.
