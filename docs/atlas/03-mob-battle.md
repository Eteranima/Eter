# Atlas — Mob em Battle

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: `BESTIARY` em `src/scripts/monsters/09-bestiary.js`, pasta
`src/assets/monsters/mob_*` e `boss_*`.

## Especificação

- **Imagem única, SEM grade** — mesmo esquema do personagem em battle:
  um corpo parado. Ataques usam arte extra separada (ver
  `08-skill-combate.md`).
- **Altura padrão: `300px` EXATOS.** É a convenção usada em todos os
  ~90 mobs mais recentes do jogo — use sempre esse valor pra mob novo.
- **Altura legada (não usar em arte nova):** `150px` — só existe em 11
  mobs antigos (aranha, cavaleiro, esqueleto, fantasma, goblin, harpia,
  ladino, lobo, mago, orc, slime, treant). Se algum desses for
  redesenhado, sobe pra 300px, não mantém 150px.
- **Bosses:** cada fase de um chefe (`f1`, `f2`, `f3`...) é uma imagem
  própria. Altura entre **200px e 300px** dependendo da pose da fase —
  quando o chefe tiver várias fases, especifique a altura exata de
  CADA fase antes de gerar (não misture fases em alturas diferentes
  sem essa lista).
- **Largura:** livre, pela proporção real da criatura — vai de ~90px
  até ~420px nos mobs existentes, sem problema.

## Regra para mob NOVO

Altura **sempre 300px exatos** pra mob comum. Pra chefe com fases,
combine a altura de cada fase antes de gerar (pode ser a mesma altura
nas 5 fases, ou crescente conforme a criatura fica mais imponente —
mas precisa estar definida por escrito, não "no olho").
