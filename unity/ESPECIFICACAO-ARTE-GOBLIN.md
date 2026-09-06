# Especificação de arte — Goblin animado (projeto Unity)

Folha de sprite ANIMADA do mob Goblin, pra substituir a pose única
estática que está em uso hoje (`mob_goblin.png`, reaproveitada do jogo
2D antigo). Mesma técnica do protagonista: mundo/câmera/altura são 3D
de verdade, mas o inimigo continua arte 2D pixelada (sprite que sempre
encara a câmera, trocando de quadro conforme anda).

## Referência de estilo — MANTER O MESMO GOBLIN

Basear a arte em `src/assets/monsters/mob_goblin.png` (o arquivo já
usado no jogo atual): pele verde escamosa, orelhas pontudas grandes,
tanga/cinto de couro cru, adaga curva numa mão, postura corcunda de
combate. **É o mesmo personagem, só precisa ganhar as 4 direções e o
ciclo de andar** — não é pra redesenhar o visual dele do zero.

## Formato do arquivo

- **PNG com canal alpha real** (transparência genuína) — nunca fundo
  verde-chroma.
- Pixel art nítida — sem anti-aliasing suavizando as bordas do
  desenho.
- Mesma paleta já estabelecida no `mob_goblin.png` de referência.

## Grade (sprite sheet)

- **3 colunas × 4 linhas**, cada quadro **128×128 pixels**.
- Folha completa: **384×512 pixels** (3×128 de largura, 4×128 de
  altura).
- Nenhum espaçamento/margem entre quadros — cada célula da grade
  encosta na vizinha, sem padding.
- **Cuidado com o defeito que já apareceu na arte do protagonista**:
  se alguma pose for desenhada mais alta que 128px, ela vaza pra
  célula vizinha (cabeça cortada numa linha, fragmento solto grudado
  na quina de outra). Cada pose precisa caber inteira dentro da
  própria célula de 128×128, com uma folga de uns 8-15px no topo da
  cabeça/orelhas.

| Linha | Direção | Descrição |
|---|---|---|
| 0 (topo) | Costas | Goblin andando **pra longe** da câmera |
| 1 | Esquerda | Goblin de lado, olhando pra **esquerda** |
| 2 | Direita | Goblin de lado, olhando pra **direita** |
| 3 (base) | Frente | Goblin andando **em direção** à câmera |

| Coluna | Frame |
|---|---|
| 0 (esquerda) | Passo 1 da caminhada |
| 1 (meio) | **Pose parada/idle** |
| 2 (direita) | Passo 2 da caminhada (espelho do passo 1) |

Ou seja: pra qualquer direção, o quadro do MEIO daquela linha é sempre
a pose parada; os dois quadros das pontas são os passos alternados do
ciclo de andar.

## Ancoragem

O pé do goblin deve estar sempre na mesma altura em pixels dentro de
cada quadro de 128×128 (a base do desenho encostada perto da borda
inferior da célula) — é o ponto usado como âncora no jogo (o "pé" fica
grudado no chão, o desenho cresce pra cima a partir dali). Mesma regra
já usada no protagonista.

## Nome do arquivo

`mob_goblin_sheet.png` (ou o nome que preferir — só avisar qual usou).

## Depois de gerado

Manda o arquivo que eu coloco em `unity/Assets/Art/Monsters/` (troca
pra `Assets/Art/Npcs/` na verdade, porque é essa pasta que já sabe
fatiar grade 3×4 — `Assets/Art/Monsters/` hoje é só pra sprite de pose
única) e ligo a animação de andar no `Mob.cs`, que já persegue o
jogador mas ainda usa sprite parado.
