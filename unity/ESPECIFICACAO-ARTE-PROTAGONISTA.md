# Especificação de arte — Protagonista (projeto Unity)

Folha de sprite do personagem jogável, pra reaproveitar na nova
arquitetura em Unity. Mundo/câmera/altura são 3D de verdade, mas o
personagem continua arte 2D pixelada (technique tipo HD-2D/Octopath) —
um sprite que sempre encara a câmera, trocando de quadro conforme anda.

## Formato do arquivo

- **PNG com canal alpha real** (transparência genuína dentro do
  próprio arquivo) — **nunca fundo verde-chroma**. Se abrir no editor
  de imagem e o fundo aparecer verde sólido em vez de xadrez/
  transparente, está no formato errado pra cá.
- Pixel art nítida — sem anti-aliasing suavizando as bordas do
  desenho.
- Mesma paleta/estilo já usado no projeto (personagens existentes em
  `src/assets/characters/`).

## Grade (sprite sheet)

- **3 colunas × 4 linhas**, cada quadro **128×128 pixels**.
- Folha completa: **384×512 pixels** (3×128 de largura, 4×128 de
  altura).
- Nenhum espaçamento/margem entre quadros — cada célula da grade
  encosta na vizinha, sem padding.

| Linha | Direção | Descrição |
|---|---|---|
| 0 (topo) | Costas | Personagem andando **pra longe** da câmera |
| 1 | Esquerda | Personagem de lado, olhando pra **esquerda** |
| 2 | Direita | Personagem de lado, olhando pra **direita** |
| 3 (base) | Frente | Personagem andando **em direção** à câmera |

| Coluna | Frame |
|---|---|
| 0 (esquerda) | Passo 1 da caminhada |
| 1 (meio) | **Pose parada/idle** |
| 2 (direita) | Passo 2 da caminhada (espelho do passo 1) |

Ou seja: pra qualquer direção, o quadro do MEIO daquela linha é sempre
a pose parada; os dois quadros das pontas são os passos alternados do
ciclo de andar.

## Ancoragem

O pé do personagem deve estar sempre na mesma altura em pixels dentro
de cada quadro de 128×128 (a base do desenho encostada perto da borda
inferior da célula) — é o ponto usado como âncora no jogo (o "pé" fica
grudado no chão, o desenho cresce pra cima a partir dali).

## Nome do arquivo

`protagonista_sheet.png` (ou o nome que preferir — só me avisa qual
usou).

## Depois de gerado

Manda o arquivo que eu coloco em `unity/Assets/Art/Characters/` e
troco a referência no código — não precisa mexer em nada no projeto
Unity, é só a imagem.
