# Índice — Atlas de Sprites (Éter Anima v5.31)

Cada arquivo aqui é uma ficha técnica separada, pronta pra mandar
isolada pra quem for gerar a arte de uma categoria específica. Todo
número foi medido nos arquivos reais do jogo ou lido direto do código
que desenha aquela categoria — não é estimativa (as duas exceções,
mob-world parado e andando, ainda não existem em código; são marcadas
`[PROPOSTO]` no próprio arquivo).

## Regras que valem para TODO arquivo desta pasta

1. **Fundo VERDE, sem exceção.** Toda arte deve ser entregue com fundo
   sólido em verde-chroma (`#00FF00` puro), nunca branco, nunca
   transparente na entrega, nunca xadrez. É o que permite remover o
   fundo por chroma key sem perder pixel de borda do personagem/objeto
   (cabelo, chama, brilho). Fundo branco ou cinza já causou problema
   real nesta produção (contornos comidos, halo residual) — verde puro
   é o único que dá margem segura de separação por cor.
2. **As medidas são EXATAS, não arredondadas.** Se o arquivo diz
   `152px de altura`, a arte final tem que sair em exatos 152px de
   altura (ou no múltiplo de escala indicado, quando o arquivo pedir
   uma resolução-fonte maior pra depois reduzir). Não é "por volta
   de", não é "parecido" — é o valor exato, porque o motor do jogo
   posiciona e recorta por esse número. Errar a medida quebra o
   alinhamento em jogo (chão cortado, pé flutuando, quadro de
   animação puxando pedaço errado da folha).
3. Formato de entrega: `.png` (com o fundo verde, não use `.webp` na
   entrega — a conversão final pro formato do jogo é feita depois,
   por quem for integrar).

## Arquivos

| Arquivo | Categoria |
|---|---|
| `01-chibi-personagem-world.md` | Chibi de personagem — modo World |
| `02-personagem-battle.md` | Personagem em Battle |
| `03-mob-battle.md` | Mob em Battle |
| `04-mob-world.md` | Mob no modo World `[PROPOSTO]` |
| `05-piso.md` | Piso (tiles de chão) |
| `06-agua.md` | Água |
| `07-edificios.md` | Edifícios (casas, castelo, lojas) |
| `08-skill-combate.md` | Arte de skill em combate |
| `09-skill-tree.md` | Ícone e fundo de Skill Tree |
| `10-hud-world.md` | HUD de World (campo) |
| `11-hud-menu.md` | HUD de Menu |
| `12-hud-combate.md` | HUD de Combate |
| `13-retratos.md` | Retratos e bustos (diálogo/cutscene) — complementar |
