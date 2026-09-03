# Diretriz de arte — cenários

## Padrão vigente

Os cenários usam pixel art de fantasia em leitura de 32 px: contorno escuro,
volumes simples, materiais reconhecíveis e pixels nítidos. Tiles de chão são
quadrados, opacos e repetíveis; props têm fundo transparente e a base alinhada
ao pé da célula. Nenhum cenário publicado depende de uma forma geométrica
procedural para mesa, estante, árvore, pilar, entulho, save ou braseiro.

## Cor

Cor é informação local, não um filtro global. Madeira, pedra, folhagem,
metal, água e tecido têm cores próprias; cada lugar combina esses materiais
de maneira diferente. Violeta fica reservado a éter, selos e Trevas, sem
dominar porto, cidade ou interiores.

## Contrato de asset

- Todo tile alto declarado em `TALL_ART` precisa apontar para uma chave de
  `SPRITE_DATA` catalogada.
- Novos props entram em `src/assets/world/`, com WebP e alpha quando forem
  objetos isolados.
- A grade continua sendo 32 px em tela. Uma peça pode ter mais altura, mas
  ocupa uma única célula de colisão e é desenhada pela base.
- O autoteste verifica que cada tile alto possui sprite; falha de registro não
  pode degradar uma sala para desenho de fallback.

## Ordem de unificação

1. Tiles e props usados pelos mapas publicados.
2. Interiores sociais e comércio, incluindo variações específicas de local.
3. Cenas de batalha e fundos regionais.
4. Interface, ícones de item e efeitos, mantendo a cor semântica de combate.
