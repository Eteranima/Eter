# Atlas — Arte de Skill em Combate

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: campo `arte` em `SKILLS` (`src/scripts/data/04-skills.js`),
consumido por `src/scripts/combat/27-controller.js`
(`u.arteAtaque`/`u.arteHoldT`) e desenhado em `28-view.js`.

## Especificação

- **Imagem única** — não é sheet, é a pose do golpe num instante só.
- **Altura de referência: `230px`.** Faixa aceitável: **200px a
  260px**, conforme a pose exigir, mas combine o valor exato antes de
  gerar uma leva inteira de golpes pro mesmo personagem/chefe, pra não
  sair cada um numa escala diferente.
- **Largura:** livre, pela pose (já variou de ~180px até ~540px no
  jogo) — uma pose de golpe largo (ex.: investida, rodeio) pode ser
  bem mais larga que alta, é esperado.
- **Tempo de exibição no jogo:** fixo em `1.1 segundos` por golpe,
  independente da arte — dá folga de sobra, não precisa desenhar
  quadro de animação, é uma pose só.
- **Cuidado ao extrair de uma prancha com várias poses:** recorte por
  CONTORNO REAL de cada pose (silhueta inteira), nunca por grade fixa
  de célula — uma pose que se espalha além de uma célula sai cortada
  se for fatiada por posição em vez de pela forma real.

## Regra para golpe NOVO

Defina a altura exata (dentro de 200–260px) ANTES de desenhar a leva
inteira de golpes de um personagem, e mantenha essa altura igual em
todos os golpes dele — só a largura varia pose a pose.
