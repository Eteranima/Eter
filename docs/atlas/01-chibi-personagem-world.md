# Atlas — Chibi de Personagem (modo World)

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: `FRAME_INFO` em `src/scripts/engine/15-render.js` +
registro por personagem em `src/scripts/characters/07-characters.js`.

## Atualização (2026-08-26): novo estilo de referência

Decisão do usuário: toda a leva de chibis do modo World vai ser
substituída por um estilo novo — ilustração mais detalhada (linha
fina, sombreado, acessórios com brilho/detalhe dourado), no mesmo
espírito da referência aprovada (personagem parado, corpo inteiro,
fundo verde-chroma). **Mobs NÃO entram nessa leva** — só os
personagens jogáveis/elenco nomeado da tabela abaixo.

O upgrade de estilo não muda a estrutura técnica da grade — o motor
continua lendo 3×4 células de 64px de altura cada (ver seção
"Grade da folha"). O que muda é só o nível de acabamento da arte
dentro de cada célula. Ou seja: a arte de referência que você mandou
(corpo inteiro, pose única, fundo verde) precisa ser desdobrada em
**12 poses** por personagem (3 poses de caminhada × 4 direções) pra
virar a folha completa — não é a mesma imagem única reaproveitada nas
12 células.

### Checklist por pose (o que cada uma das 12 células precisa ter)

- Mesma altura de cabeça, tronco e perna em todas as 12 (senão o
  personagem "pula" de tamanho ao virar ou andar).
- Pé sempre na mesma linha de base dentro da célula (o motor ancora
  pelo pé — variação de alguns pixels já causa "flutuação" visível).
- As 3 colunas de cada linha = 3 momentos do passo: perna esquerda à
  frente, parado/centro, perna direita à frente (ciclo de caminhada
  simples, sem correr).
- As 4 linhas = as 4 direções (frente, esquerda, direita, costas) —
  direita pode ser a arte de esquerda espelhada, se preferir economizar
  uma pose.
- Acessórios que "flutuam" na pose de referência (o livro, os
  fragmentos de cristal/espelho ao redor) — decida se eles acompanham
  o personagem em toda pose de caminhada ou se ficam só na arte de
  battle/retrato; senão ficam duplicando/tremendo ao andar.

## Grade da folha (estrutura técnica, não muda)

- **3 colunas × 4 linhas**, sempre.
- **Altura do quadro: `64px` EXATOS** — fixa pra todo personagem, sem exceção.
- **Largura do quadro (`fw`):** varia por personagem, valor exato na tabela abaixo.
- **Tamanho do arquivo completo:** `fw × 3` de largura, `64 × 4 = 256px` de altura, sempre.
- **Linha = direção:**
  - linha 0 = de frente (baixo)
  - linha 1 = de lado, olhando pra esquerda
  - linha 2 = de lado, olhando pra direita
  - linha 3 = de costas (cima)
- **Coluna = passo da caminhada:** a pose PARADA é a coluna do meio
  (índice 1). As colunas 0 e 2 são os dois extremos do passo.

## Lista de personagens pra refazer no estilo novo (mobs excluídos)

| Personagem | fw atual (px) | Arquivo completo (fw×3 × 256) |
|---|---:|---|
| Gabriel | 42 | 126×256 |
| Gabriel Lycan | 59 | 177×256 |
| Ophelia | 56 | 168×256 |
| Marin | 56 | 168×256 |
| Seiji | 56 (mesmo padrão dos demais; sem `fw` cadastrado ainda — usar 56 como base) | 168×256 |
| Scythe | 57 | 171×256 |
| Ava Rosa Groot | 53 | 159×256 |
| Madao | 36 | 108×256 |
| Madao Papelão | 36 (mesma base do Madao) | 108×256 |
| Madao Vitória | 36 (mesma base do Madao) | 108×256 |
| Max | 68 | 204×256 |
| Eden | 56 | 168×256 |
| Kael Archimedes | 56 | 168×256 |
| Amanda Felt | 55 | 165×256 |
| Abel Nomikos | 41 | 123×256 |
| Orfeu Bauss | 30 | 90×256 |
| Snoopy | 43 | 129×256 |

`fw` pode ser reajustado pra cima ou pra baixo no redesenho, já que o
estilo novo tende a ser mais detalhado/potencialmente mais largo que o
chibi atual — só precisa vir combinado por escrito ANTES de gerar a
leva inteira, porque toda a folha daquele personagem (12 células) usa
o mesmo valor.

## Regra para personagem NOVO (fora da lista acima)

Escolha um `fw` fixo pra aquele personagem, valendo igual nas 12
células da folha dele. A altura de 64px por célula não muda nunca.
