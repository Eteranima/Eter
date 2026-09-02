# Atlas — Mob no modo World `[PROPOSTO]`

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Esta categoria ainda **não existe em código** — hoje só existe
`drawFieldBoss()` (`src/scripts/engine/20-field-view.js`) pra desenhar
um chefe fixo no mapa. As duas variantes abaixo usam a convenção que o
motor já aplica pra algo equivalente, pra a arte já sair compatível
quando o motor for ligado. Fonte: `dh = 84` em `drawFieldBoss`
(campo parado) e `FRAME_INFO` em `15-render.js` (campo andando, mesma
grade do chibi de personagem).

## 4.1 — Mob parado / de bloqueio de passagem

Uso típico: os 5 lobos tampando a passagem numa missão.

- **Imagem única, SEM grade.**
- **Altura de EXIBIÇÃO no jogo: `84px` EXATOS.** Esse é o tamanho final
  na tela, não o tamanho do arquivo fonte.
- **Resolução do arquivo fonte:** gere em **3× a 4× esse tamanho**
  (≈250px a 340px de altura) na MESMA proporção largura/altura que a
  criatura deve ter em 84px — o motor reduz a imagem, então resolução
  maior evita pixelizar; proporção errada distorce a criatura ao
  escalar.
- **Largura do arquivo fonte:** `largura_desejada_em_84px × (resolução_fonte / 84)`.

## 4.2 — Mob que anda/patrulha

Uso típico: uma missão em que o mob precisa se mover antes do combate
começar.

- **Grade 3 colunas × 4 linhas**, igual ao chibi de personagem
  (`01-chibi-personagem-world.md`).
- **Altura do quadro: `64px` EXATOS.**
- **Largura do quadro:** livre por criatura, mas fixa dentro da mesma
  folha (todas as 12 células da MESMA criatura usam a MESMA largura).

## Antes de gerar

Confirme com quem for integrar qual das duas variantes a missão
precisa — "parado" é bem mais simples de plugar no motor hoje; "andando"
depende de um tipo de entidade de mapa que ainda precisa ser
construído no motor.
