# Atlas — Mob no modo World

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

O motor aceita, desde o P0, entidades declaradas em `MAPS[id].mobs`.
Elas vivem somente na instância do mapa (não entram no save), bloqueiam
a própria casa, iniciam combate ao toque/interação e voltam após 10 a
15 segundos quando vencidas. A primeira aplicação é o Subterrâneo
Selado; outros mapas só passam a usar mobs após revisão de conteúdo.

A versão atual desenha a arte estática em `84px` e patrulha por casas.
`drawFieldMob()` em `src/scripts/engine/20-field-view.js` mantém a
compatibilidade com imagens únicas já cadastradas no bestiário. A grade
animada continua uma opção futura, não um requisito para configurar um
mob.

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

## 4.2 — Mob que anda/patrulha com frames próprios (futuro)

Uso típico: uma missão em que o mob precisa se mover antes do combate
começar.

- **Grade 3 colunas × 4 linhas**, igual ao chibi de personagem
  (`01-chibi-personagem-world.md`).
- **Altura do quadro: `64px` EXATOS.**
- **Largura do quadro:** livre por criatura, mas fixa dentro da mesma
  folha (todas as 12 células da MESMA criatura usam a MESMA largura).

## Antes de gerar

Confirme com quem for integrar qual das duas variantes a missão
precisa. Para o motor atual, a imagem única é a variante suportada e
suficiente; a grade animada exige ampliar o renderizador de mobs sem
alterar a ordem dos scripts nem o contrato de save.
