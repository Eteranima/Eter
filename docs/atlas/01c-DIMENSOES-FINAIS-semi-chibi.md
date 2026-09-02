# Dimensões finais — Semi-Chibi de Personagem (modo World)

Documento de fechamento da leva de sprites feita nesta sessão
(Gabriel, Gabriel Lycan, Max, Ophelia, Madao Papelão, Elijah).
Substitui os números de resolução fixa dos arquivos anteriores
(`01-chibi-personagem-world.md`, `01b-REFERENCIA-...md`) — a mecânica
mudou: **resolução da arte e tamanho em tela agora são independentes**.

## O que mudou no motor (`15-render.js`)

1. **`fw` e `fh` (tamanho de cada quadro na folha) são auto-detectados
   do arquivo real** — o número cadastrado no código é só um chute
   inicial, sobrescrito assim que a imagem carrega. Não precisa mais
   avisar nem travar numa resolução-fonte específica.
2. **`DISPLAY_FH = 96`** — o tamanho que o personagem aparece NO MAPA,
   fixo, igual pra todo mundo, **independente da resolução do
   arquivo**. A largura em tela é calculada mantendo a proporção real
   do quadro (`fw/fh`), então a arte nunca estica nem achata.

Na prática: dá pra desenhar um personagem em 64×64px por quadro e
outro em 362×362px por quadro que os dois vão aparecer do MESMO
tamanho em jogo — a diferença é só nitidez (resolução mais alta ==
mais nítido ao aproximar/em telas grandes), nunca o tamanho do
boneco.

## Estrutura da folha (não mudou)

- **Grade: 3 colunas × 4 linhas = 12 poses**, sem margem entre células.
- **Fundo: verde-chroma**, mas repare no ponto de atenção abaixo — nem
  toda entrega usou o mesmo tom de verde.
- **Linha = direção** (mesma convenção de sempre):
  1. de frente (baixo)
  2. perfil esquerda
  3. perfil direita
  4. de costas (cima)
- **Coluna = passo da caminhada**: recuada → parada/centro → avançada.

## Resolução da arte fonte — livre, com uma faixa recomendada

Não existe mais um valor único obrigatório. As entregas desta sessão
vieram em duas faixas bem diferentes e as duas funcionam:

| Entrega | Resolução por quadro | Arquivo completo |
|---|---|---|
| Gabriel, Gabriel Lycan, Max, Madao Papelão, Elijah (normal e corrompido) | 64×64px | ~168–204 × 256px |
| Ophelia (leva mais recente, padrão de referência do Kael) | 362×362px | 1086×1448px |

**Recomendação pra próximos personagens:** seguir a faixa da Ophelia
(quadro entre 320px e 400px) quando o personagem tiver bastante
detalhe (bordado, acessórios, cabelo com mecha) — é a faixa que
mantém a leitura do rosto/roupa nítida mesmo reduzida a 96px em tela.
Pra personagem mais simples, 64px por quadro ainda é aceitável, mas
gera uma imagem visivelmente mais "lisa" ao lado de quem está na
resolução maior — não é errado, só é perceptível.

## ⚠️ Ponto de atenção: tom do verde de fundo

A entrega da Ophelia usou um verde mais escuro e com ruído (~RGB
28,198,28) em vez do verde puro (`#00FF00`) das entregas anteriores.
O motor de remoção de fundo aqui do lado teve que se adaptar (detectar
a cor real usada em vez de assumir `#00FF00` fixo) — funcionou, mas
**o ideal pras próximas entregas é fechar o verde em `#00FF00` puro e
sólido**, sem ruído/gradiente, do jeito que já está pedido em
`00-INDICE.md`. Facilita a limpeza e evita qualquer franja residual
na borda do personagem.

## Resumo pra gerar o próximo personagem

| Item | Valor |
|---|---|
| Grade | 3 colunas × 4 linhas |
| Fundo | Verde puro `#00FF00`, sólido, sem ruído |
| Resolução por quadro (recomendada) | 320–400px por lado, quadrado |
| Resolução por quadro (mínima aceitável) | 64×64px |
| Tamanho final em jogo | Sempre 96px de altura — automático, não depende da resolução entregue |
| Formato de entrega | `.png` |
