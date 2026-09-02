# Atlas — Ícone e Fundo de Skill Tree

> **Fundo: VERDE puro (`#00FF00`) no ícone. O fundo/pergaminho da
> árvore (seção 9.2) é ele mesmo o fundo — não leva verde por cima.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: pasta `src/assets/ui/`.

## 9.1 — Ícone do nó (a habilidade em si)

- Prefixo de referência no jogo: `hab_*`
- **Tamanho: `64×64px` EXATOS.** Todo ícone de skill tree usa esse
  tamanho, sem exceção — hoje já são 76 ícones cadastrados nessa
  medida.
- Desenhe o símbolo centralizado, com uma margem de respiro (não
  encoste o desenho nas 4 bordas do quadrado).

## 9.2 — Fundo/pergaminho da árvore (por elemento)

- Prefixo de referência: `tree_bg_<elemento>`
- **Tamanho base: `400×340px` EXATOS.**
- **Variante de alta resolução: `536×544px` EXATOS** (mesma arte,
  maior — sufixo `-2`).
- Já existe um fundo por elemento (fogo, gelo, vento, terra,
  eletricidade, trevas, veneno, tinta). Elemento novo na skill tree
  precisa gerar as DUAS resoluções, com o mesmo estilo de pergaminho
  desbotado/grimório dos demais.

## Regra para ícone/fundo NOVO

Ícone sempre 64×64px exatos. Fundo sempre nas duas resoluções exatas
acima — nunca gere só uma das duas achando que dá pra escalar depois,
a versão "-2" tem detalhe próprio, não é um redimensionamento simples
da base.
