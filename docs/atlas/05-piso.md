# Atlas — Piso (tiles de chão)

> **Fundo: VERDE puro (`#00FF00`) só nas partes que devem ficar
> transparentes (ex.: tile com buraco, borda irregular). Tile de piso
> normal já é opaco por natureza — preenche o quadrado inteiro.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: `TILE = 32` em `src/scripts/core/01-config.js` + pasta
`src/assets/world/tile_*.webp`.

## Especificação

- **Tamanho base: `32×32px` EXATOS.** 1 tile = 1 arquivo, sem grade
  interna — cada arquivo é um quadrado de chão pronto pra repetir lado
  a lado.
- **Variante de alta resolução: `64×64px` EXATOS** (mesma arte, o
  dobro do tamanho) — gere as DUAS versões pra todo piso novo, com o
  sufixo `-2` na de 64×64 (ex.: `tile_grama-2`).
- **Tiles já existentes:** chão, grama, terra, caminho, parede, escada,
  porta, tapete, rachadura, baú, baú aberto.
- **Tile animado (ex.: brasa):** 3 quadros de 32×32 EXATOS cada,
  entregues como 3 arquivos separados OU empilhados verticalmente num
  único arquivo de `32×96px` EXATOS (32 de largura, 96 = 32×3 de
  altura) — confirme qual das duas formas antes de gerar.

## Regra para tile NOVO

Sempre múltiplo exato de 32px, sem margem nem borda de segurança —
o tile precisa encostar perfeitamente no vizinho quando repetido lado
a lado, então qualquer pixel de sobra na borda vira uma linha visível
errada em jogo.
