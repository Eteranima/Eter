# Especificação de arte — Vertical Slice (next/)

O que falta pra tirar os placeholders de código e colocar arte de
verdade. Cada item diz onde a imagem entra no código (pra eu já saber
encaixar assim que você mandar) e por que é diferente do jogo antigo.

## Diferença importante em relação ao jogo antigo (`src/`)

O jogo antigo usa **fundo verde-chroma** (`#00FF00`) porque o motor 2D
faz remoção de chave de cor. **A nova arquitetura não faz isso** — o
mundo é 3D de verdade (Three.js/WebGL) e os personagens são sprites
"billboard" com **canal alpha real** (transparência de verdade dentro
do próprio arquivo). Então:

> **Toda imagem de personagem/prop precisa ser PNG com alpha real,
> nunca fundo verde-chroma.** Se abrir o arquivo e o fundo aparecer
> xadrez/transparente no seu editor (Photoshop, Aseprite, GIMP), tá
> certo. Se aparecer verde sólido, tá no formato errado pra cá.

Resolução: pixel art, mesmo estilo/paleta do jogo já existente. Sem
anti-aliasing suavizando borda (mantém o pixel nítido — o motor já
desenha com `image-rendering: pixelated`).

---

## 1. Pose de ataque do jogador — PRIORIDADE ALTA

**Onde entra**: `entities/sprite-billboard.js` (`criarBillboardDirecional`) trocaria de folha durante o golpe; hoje o "ataque" é só um efeito de código (`aplicarFatorEscala` em `player.js`) esticando o sprite de andar — funciona como placeholder, mas não é golpe de verdade.

**Arquivo**: `kael_ataque_sheet.png` (mesma personagem/folha reaproveitada — se quiser trocar o personagem jogável depois, é só gerar a folha de ataque compatível com a folha de andar nova).

**Grade — EXATAMENTE igual à folha de andar já usada** (`kael_sheet.png`, 336×512):
- 3 colunas × 4 linhas, cada célula **112×128px**
- Linha 0 = de costas pra câmera ("up" — o jogador afastando-se, ver seção técnica abaixo)
- Linha 1 = de lado, olhando pra esquerda ("left")
- Linha 2 = de lado, olhando pra direita ("right")
- Linha 3 = de frente pra câmera ("down" — o jogador vindo na direção de quem olha)
- Colunas = frames do golpe, em ordem: **preparação → impacto → recuperação**

**Nota técnica sobre as direções** (só pra quem for desenhar entender o porquê): a câmera fica sempre atrás do personagem. "down" (linha 3, de frente) é usado quando o personagem anda NA DIREÇÃO da câmera (câmera vê o rosto dele voltando); "up" (linha 0, de costas) é quando ele anda PRA LONGE da câmera (câmera vê as costas dele). Isso é herdado do motor antigo (`DIR_ROW` em `15-render.js`) — mesma convenção, só reaproveitada aqui.

**Formato**: PNG, alpha real, 336×512px total (mesma resolução da folha de andar).

---

## 2. Ícones da hotbar — PRIORIDADE MÉDIA

**Onde entra**: `index.html` (`#skill-label`, `#magic-label`, `#item-label`) — hoje é só texto ("Skill", "Magia", "Poção"); eu troco por `<img>` assim que tiver os arquivos.

Três arquivos, **128×128px cada**, PNG com alpha real:
- `icone_skill.png` — representando **Golpe Giratório** (`combat/skills.js`): uma lâmina girando/arco de corte.
- `icone_magia.png` — representando **Lança de Éter em Chamas** (`combat/magic.js`, elemento fogo): uma lança/pico de chama.
- `icone_pocao.png` — representando **Poção de Éter Vital** (`items/consumables.js`): um frasco com líquido brilhante.

---

## 3. Texturas de terreno — PRIORIDADE MÉDIA (só visual, não bloqueia nada)

**Onde entra**: `world/map.js` — hoje cada plataforma é uma cor sólida (`MeshStandardMaterial({color:...})`); eu troco pra `MeshStandardMaterial({map: textura})` assim que tiver os arquivos.

Quatro arquivos **tileable** (repetem sem emenda visível ao lado uma da outra), **256×256px**, PNG ou JPG (sem alpha necessário — são superfícies sólidas, não sprites recortados):
- `chao_grama.png` — o chão principal externo.
- `chao_escada.png` — pedra dos degraus (leste, subindo) e do subsolo (sul, descendo).
- `chao_ponte.png` — madeira da ponte entre as duas plataformas altas.
- `chao_subsolo.png` — piso do subsolo (mais escuro, tipo caverna/masmorra).

---

## 4. Favicon — PRIORIDADE BAIXA

**Onde entra**: `index.html` (`<link rel="icon">`, ainda nem existe — hoje o navegador tenta buscar um `favicon.ico` padrão e dá 404 no console, inofensivo mas polui o log).

Um arquivo **64×64px**, PNG com alpha real, algum símbolo simples do Éter (não precisa ser elaborado).

---

## 5. Reação de dano / morte do mob — PRIORIDADE BAIXA (nice-to-have)

**Onde entra**: `entities/sprite-billboard.js` (`piscarImpacto`, hoje só tinge o sprite de vermelho por 110ms via código) e `entities/mob.js` (ao morrer, hoje o sprite simplesmente some, `sprite.visible = false`).

Se quiser mais adiante: um frame extra de "atingido" e um frame de "caído" pra `mob_ashwolf` e `mob_shade` — mas isso é polimento, não impede nada de funcionar.

---

## Como me mandar

Pode mandar os arquivos com esses nomes exatos direto na conversa, ou
me avisar onde estão — eu coloco em `next/assets/` no lugar certo e
troco o código que hoje usa o placeholder. Não precisa mandar tudo de
uma vez: dá pra ir item por item, começando pelo item 1 (é o que mais
muda a sensação do combate).
