# Referência aprovada — novo padrão de chibi World

Esta é a leitura técnica da prancha aprovada pelo usuário (2026-08-30)
pra virar o padrão de TODO personagem no modo World daqui pra frente.
Use este arquivo como checklist ao gerar cada personagem novo — o
objetivo é que qualquer artista/gerador de imagem reproduza a MESMA
estrutura, só trocando o personagem.

## 1. Estrutura da prancha

- **Grade: 3 colunas × 4 linhas = 12 células**, sem espaço/margem
  entre elas — célula encostada na vizinha, sem grid visível.
- **Fundo: verde-chroma sólido (`#00FF00`) atrás das 12 células e
  entre elas** — é uma única imagem grande, não 12 arquivos separados.
- Célula em formato retrato (mais alta que larga) — o personagem
  ocupa quase toda a altura da célula, com uma faixa de respiro em
  cima da cabeça e embaixo do pé.

## 2. O que cada linha representa (direção)

Segue exatamente a mesma convenção já usada no motor
(`DIR_ROW` em `15-render.js`) — **não inventar ordem nova**:

| Linha | Direção | O que muda entre as 3 colunas |
|---|---|---|
| 1 (topo) | De frente (baixo) | Pose quase estática, variação sutil de balanço/respiro — não é passada de perna larga |
| 2 | Perfil, olhando pra esquerda | Ciclo de caminhada: perna recuada → centro → perna avançada |
| 3 | Perfil, olhando pra direita | Mesmo ciclo de caminhada, mas espelhado — repare que os acessórios (o livro, os fragmentos) trocam de lado em relação à linha 2 |
| 4 (base) | De costas (cima) | Pose quase estática de costas, mesma lógica da linha 1 |

**Nota importante sobre a linha 3 (direita):** no motor atual, a
direção "direita" pode ser gerada por espelhamento automático da
"esquerda" em vez de desenhada à mão (fica marcado em código,
`right = mirror(left)`) — se for esse o caminho escolhido, a linha 3
desta prancha pode ser OMITIDA e a prancha cai pra 3×3 (9 células). Se
for desenhada à mão (como está aqu), mantenha os detalhes assimétricos
(cabelo, livro, dobra da capa) coerentes com o espelho da linha 2, não
uma pose nova.

## 3. Identidade visual fixa do personagem (o que NÃO muda entre poses)

Todo elemento abaixo tem que se repetir de forma consistente nas 12
células — é o que garante que a folha inteira "seja a mesma pessoa"
em movimento, e não 12 desenhos soltos parecidos:

- **Silhueta e proporção do corpo** idênticas nas 12 poses (altura da
  cabeça, comprimento do tronco e da perna) — nenhuma pose pode ficar
  mais alta/baixa que as outras.
- **Objeto de identidade em mãos**: o personagem segura um item
  aberto (livro/grimório) — esse item aparece em TODAS as 12 poses,
  não só numa arte de destaque.
- **Acessórios flutuantes ao redor do corpo** (fragmentos/estilhaços
  brilhantes e molduras ornamentadas, num tom de verde-água/turquesa
  que contrasta com o fundo verde-chroma): aparecem nas 12 poses,
  reposicionados de forma orgânica ao redor do corpo — não fixos no
  mesmo pixel, mas presentes em toda pose.
- **Paleta e figurino fixos**: sobretudo/casaco longo em tom claro
  (creme/branco) com detalhe dourado bordado, colete escuro por baixo,
  gravata escura, calça escura, botas escuras, cabelo escuro cacheado
  com uma mecha rebelde pra cima, óculos redondos.
- **Pé ancorado na mesma linha de base** em todas as 12 células — é
  por onde o motor posiciona o personagem no chão; variação de altura
  do pé entre poses causa "flutuação" visível ao trocar de quadro.

## 4. Diferença pro chibi antigo (o que mudou de propósito)

- Nível de detalhe muito maior (sombreado, textura de tecido, brilho
  nos acessórios) — não é mais um boneco liso de poucas cores.
- Rosto com feições legíveis (óculos, olhar) mesmo em tamanho pequeno.
- Os acessórios flutuantes (fragmentos/molduras) são um elemento NOVO
  que o chibi antigo não tinha — cada personagem provavelmente vai
  ganhar o próprio conjunto de acessórios-assinatura no lugar dos
  fragmentos de cristal (ex.: chamas pro Gabriel, folhas pra Ava Rosa
  Groot, sombras pra Marin) — combine isso PERSONAGEM A PERSONAGEM
  antes de gerar, não repita fragmento de cristal pra todo mundo.

## 5. Ponto em aberto — resolução final por célula

O motor hoje espera cada célula em **64px de altura fixa** (folha
completa de `fw × 3` por `256px` de altura — ver
`01-chibi-personagem-world.md`), e desde a última atualização
(`15-render.js`) a LARGURA de cada célula é auto-detectada a partir do
arquivo, então trocar de personagem não exige mexer em código.

Só que 64px de altura por quadro é pouco pra manter a riqueza de
detalhe desta referência sem virar uma mancha de pixel na hora de
reduzir. Duas saídas possíveis — **decidir isso ANTES de gerar a leva
inteira dos 16 personagens**, porque muda o pipeline de entrega:

- **(a) Gerar nesta resolução alta e deixar o motor exibir maior.**
  Precisa de uma mudança de código pra subir o `fh` fixo de 64px pra
  um valor maior (ex.: 128px ou mais) — mexe em todo o desenho de
  personagem no campo, não só nesse personagem.
- **(b) Gerar nesta resolução alta como MASTER e entregar também a
  versão reduzida pro jogo** (64px de altura por quadro, mesma arte,
  escalada pra baixo com cuidado pra não perder a leitura do rosto/
  acessórios). O motor não muda; cada personagem chega em duas
  versões (master + jogo).

Nenhuma das duas está implementada ainda — é decisão de pipeline, não
de código pronto. Recomendo (b) pra não mexer no motor de novo antes
de ver o resultado reduzido de pelo menos um personagem em jogo.
