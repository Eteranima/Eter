/* ===================================================================
   9b. LISTA COM CURSOR — widget reaproveitado por todos os menus
   =================================================================== */
function navList(state, len, cols = 1, lr = true){
  if (len <= 0) return false;
  const before = state.i;
  if (Input.pressed('down'))  state.i += cols;
  if (Input.pressed('up'))    state.i -= cols;
  /* Numa lista de coluna única esquerda/direita não têm para onde ir, e
     ficar surdo a metade do direcional passa impressão de travamento —
     principalmente no D-pad do celular. Então elas andam de um em um,
     igual a cima/baixo. Em grade, andam de coluna.
     `lr:false` é para quem já usa ◄► para outra coisa (a loja troca de
     categoria com elas); sem isso a tecla dispararia as duas ações. */
  if (lr){
    if (Input.pressed('right')) state.i += 1;
    if (Input.pressed('left'))  state.i -= 1;
  }
  state.i = ((state.i % len) + len) % len;
  if (state.i !== before){ Sound.sfx('cursor'); return true; }
  return false;
}

/* Primeiro índice da janela visível de uma lista em grade maior que a
   caixa. Rola por LINHA e tenta manter o cursor no meio, então o item
   escolhido nunca fica fora da tela — que era o caso da lista de itens
   em combate, desenhada com `slice(0,6)` enquanto o cursor percorria a
   bolsa inteira. */
/* --- Navegação na árvore de habilidades ----------------------------
   A árvore é um grafo espalhado, não uma lista: "para baixo" ali quer
   dizer "o nó mais próximo que fica para baixo", e não "o próximo
   índice". Por isso ela não usa `navList`. A ordem estável de
   `treeOrdem` existe só para o cursor ter um índice que sobrevive entre
   quadros — quem manda no movimento é a geometria. */
/* Onde o painel da direita do menu fica. Estava escrito à mão dentro de
   `drawMenu`; virou constante porque a geometria da árvore agora é lida
   também pelo autoteste, e duas cópias do mesmo número são duas cópias
   que divergem. */
const MENU_PAINEL = {x:232, y:24, w:W - 232 - 24, h:H - 48};
/* Como o alvo de uma cura aparece na lista de campo. `fallen` não entra
   porque a coluna já diz "reanima" nesse caso. */
const ALVO_CURA = {ally:'um aliado', allies:'o grupo', self:'em si'};

/* Raio de cada tipo de nó da árvore, ANTES da escala do ajuste.

   v5.16: habilidade subiu de 11 para 14 e folha/passiva caiu de 7 para 6,
   para caber um ícone de 16 px dentro do nó de habilidade. Não é gosto: a
   distância entre um nó de habilidade e o vizinho mais próximo é medida
   pelo autoteste em todas as nove árvores, e ele reprova se a soma dos
   dois raios não deixar folga. */
/* Raio de cada tipo de nó da árvore, ANTES da escala do ajuste.

   v5.31: os raios saem de TIPOS_NO, que é onde a hierarquia do spec
   mora — núcleo maior que apocalipse, apocalipse maior que
   convergência, convergência maior que habilidade, conta minúscula.
   Esta tabela ficou só como piso para tipo desconhecido. */
const ARVORE_RAIO = {skill:14, core:15, passiva:6, folha:6};

/** Raio de desenho de um nó, antes da escala. Conta ganha um piso de 6:
 *  no papel ela tem raio 5, mas abaixo de 6 px o anel de estado some e
 *  o jogador não vê mais o que já comprou. */
const raioTipo = t => t === 'conta' ? 6
                    : (TIPOS_NO[t] ? TIPOS_NO[t].raio : ARVORE_RAIO.folha);

/* Cor de cada atributo, para o nó de passiva e de folha. Eles não têm
   ícone — são pontos de atributo — e sem cor própria viravam trinta
   bolinhas idênticas em que ninguém distinguia ATK de HP sem passar o
   cursor. Fora da banda que o tema gira: são cores com significado. */
const COR_STAT = {atk:'#e07a5a', def:'#5a9ad0', spd:'#7ad0a0',
                  hp:'#d05a7a', mp:'#8a7ad0'};
const ARVORE_MARGEM = 22;

/* Limites do zoom, direto do spec §26. O padrão é 1, que é o
   enquadramento que mostra a árvore inteira. */
const ZOOM_ARVORE = {min:0.65, padrao:1, max:1.75, passo:0.15};

/* Onde cada peça do grimório mora na tela.

   v5.31: a tela virou grimório e ganhou rodapé de comandos, porque
   agora há comandos DEMAIS para caber em duas linhas de dica no canto
   da barra lateral — comprar, remover, zoom, centralizar, trocar,
   redefinir e sair. E ganhou a faixa de caminhos com os NOMES do
   personagem ("Caminho do Aço Quente"), não mais "Lâmina". */
const ARVORE_TELA = {
  faixa:  {x:24,  y:84,  w:520, h:26},   // as três barras de caminho
  grafo:  {x:24,  y:116, w:520, h:412},  // só isto sofre zoom e pan
  ficha:  {x:552, y:84,  w:224, h:444},
  rodape: {x:24,  y:540, w:752, h:48},
};

/* A câmera do grafo. Vive fora do save de propósito: é enquadramento,
   não progresso, e um save que guardasse zoom devolveria o jogador a um
   canto qualquer da árvore ao carregar. */
const VistaArvore = {
  zoom:ZOOM_ARVORE.padrao, px:0, py:0,
  reset(){ this.zoom = ZOOM_ARVORE.padrao; this.px = 0; this.py = 0; },
  aplicarZoom(d){
    const z = clamp(this.zoom + d, ZOOM_ARVORE.min, ZOOM_ARVORE.max);
    if (z === this.zoom) return false;
    /* O pan escala junto: sem isto, dar zoom out depois de arrastar
       jogava a árvore para longe, porque o deslocamento em pixels
       continuava valendo o que valia no zoom antigo. */
    const k = z / this.zoom;
    this.px *= k; this.py *= k; this.zoom = z;
    return true;
  },
  /* Centraliza no nó pedido — é o "centralizar no nó selecionado" do
     spec. Recebe a coordenada de árvore, não a de tela. */
  centrarEm(n){ if (!n) return this.reset(); this.px = -n.x; this.py = -n.y; },
};

/** Geometria completa da árvore de `c` dentro da área do grafo.

    Uma função só, lida pelo desenho E pelo autoteste. A versão anterior
    calculava tudo dentro de `drawTree`, e não havia como um teste
    perguntar "esse nó encosta no vizinho?" sem recopiar a conta — que é
    exatamente o jeito de o teste continuar passando depois que o desenho
    muda.

    `vista` é opcional e vale 1x sem deslocamento quando não vem: é o que
    mantém o autoteste medindo o ENQUADRAMENTO PADRÃO, que é o único que
    o jogo garante. */
function geometriaArvore(c, area = ARVORE_TELA.grafo, vista = null){
  const nos = Object.values(arvoreDe(c));
  const gx = area.x, gy = area.y, gw = area.w, gh = area.h;
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  for (const n of nos){
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
  }
  /* `esc0` é o ajuste que faz a árvore INTEIRA caber na janela. O zoom
     multiplica isso: 1 é sempre "vejo tudo", e é por isso que o mínimo
     do spec (0,65) não corta nada — só afasta. */
  const esc0 = Math.min((gw - ARVORE_MARGEM * 2) / Math.max(1, maxX - minX),
                        (gh - ARVORE_MARGEM * 2) / Math.max(1, maxY - minY));
  const zoom = vista ? vista.zoom : 1;
  const esc = esc0 * zoom;
  /* O tamanho do nó cresce com o zoom, senão dar zoom afastaria os nós
     sem tornar um ícone mais legível — que é a única razão de existir
     um zoom aqui. O teto de 1,6 evita que o núcleo vire um prato. */
  const kNo = Math.min(1.6, clamp(esc0, 0.6, 1.15) * zoom);

  /* Pan preso: a árvore nunca sai inteira de vista. O limite é meia
     janela além da borda do desenho — sobra sempre algo na tela. */
  const larg = (maxX - minX) * esc, alt = (maxY - minY) * esc;
  const limX = Math.max(0, (larg - gw) / 2) + gw * 0.35;
  const limY = Math.max(0, (alt - gh) / 2) + gh * 0.35;
  const px = vista ? clamp(vista.px * esc0, -limX, limX) : 0;
  const py = vista ? clamp(vista.py * esc0, -limY, limY) : 0;

  const cx = gx + gw / 2 - ((minX + maxX) / 2) * esc + px;
  const cy = gy + gh / 2 - ((minY + maxY) / 2) * esc + py;
  return {
    nos, gx, gy, gw, gh, esc, esc0, zoom, kNo, limX, limY,
    sx: n => cx + n.x * esc,
    sy: n => cy + n.y * esc,
    raio: n => raioTipo(n.tipo) * kNo,
    /* De volta: dado um ponto da tela, que coordenada de árvore é. Serve
       ao arraste do mouse. */
    inv: (x, y) => ({x:(x - cx) / esc, y:(y - cy) / esc}),
  };
}

/** Glifo de um nó que não tem ícone de habilidade.
 *
 *  Desenhado, não escrito. O spec §19 é explícito em não usar círculos
 *  genéricos, e núcleo, apocalipse, convergência, passiva e mecânica não
 *  têm arte própria — são cinco formas diferentes montadas com traço, o
 *  que também garante que um personagem novo nunca apareça com um buraco
 *  no lugar do glifo. */
function desenharGlifoNo(n, x, y, r, cor, E){
  ctx.save();
  ctx.strokeStyle = cor; ctx.fillStyle = cor;
  ctx.lineWidth = Math.max(1.2, r * 0.09);
  ctx.lineJoin = 'round';
  const anel = (k, ini, fim) => {
    ctx.beginPath(); ctx.arc(x, y, r * k, ini, fim); ctx.stroke();
  };
  if (n.tipo === 'core'){
    /* Núcleo: o glifo do elemento dentro de um losango. É o maior e o
       mais desenhado da tela, como o spec §18 pede. */
    ctx.beginPath();
    ctx.moveTo(x, y - r * .72); ctx.lineTo(x + r * .72, y);
    ctx.lineTo(x, y + r * .72); ctx.lineTo(x - r * .72, y);
    ctx.closePath(); ctx.stroke();
    uiText(E.icon, x, y + r * .34, {size:Math.round(r * .9), color:cor, align:'center'});
  } else if (n.tipo === 'ultimate'){
    // Apocalipse: estrela de oito pontas — nenhum outro nó tem pontas.
    ctx.beginPath();
    for (let i = 0; i < 16; i++){
      const a = i * Math.PI / 8, k = i % 2 ? .32 : .82;
      const px = x + Math.cos(a) * r * k, py = y + Math.sin(a) * r * k;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
  } else if (n.tipo === 'convergencia'){
    // Convergência: dois arcos que se encontram. Dois caminhos, um nó.
    anel(.68, Math.PI * .15, Math.PI * .85);
    anel(.68, Math.PI * 1.15, Math.PI * 1.85);
    ctx.beginPath(); ctx.arc(x, y, r * .22, 0, Math.PI * 2); ctx.fill();
  } else if (n.tipo === 'passiva'){
    // Passiva única: hexágono cheio — algo que simplesmente É.
    ctx.beginPath();
    for (let i = 0; i < 6; i++){
      const a = i * Math.PI / 3 - Math.PI / 2;
      const px = x + Math.cos(a) * r * .62, py = y + Math.sin(a) * r * .62;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = .35; ctx.fill(); ctx.globalAlpha = 1;
  } else if (n.tipo === 'mecanica'){
    // Mecânica: engrenagem. É a peça que faz o personagem funcionar.
    for (let i = 0; i < 6; i++){
      const a = i * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r * .42, y + Math.sin(a) * r * .42);
      ctx.lineTo(x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82);
      ctx.stroke();
    }
    anel(.42, 0, Math.PI * 2);
  } else {
    ctx.beginPath(); ctx.arc(x, y, r * .5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

const treeOrdem = c => Object.keys(arvoreDe(c)).sort();

/** Nó mais próximo de `id` na direção (dx,dy). null se não houver. */
function noVizinho(c, id, dx, dy){
  const arv = arvoreDe(c), de = arv[id];
  if (!de) return null;
  let melhor = null, melhorPeso = Infinity;
  for (const n of Object.values(arv)){
    if (n.id === id) continue;
    const vx = n.x - de.x, vy = n.y - de.y;
    /* Projeção na direção pedida tem que ser positiva E dominar o
       desvio lateral, senão "para cima" pegaria um nó que está
       basicamente ao lado. */
    const frente = vx * dx + vy * dy;
    const lado = Math.abs(vx * dy - vy * dx);
    if (frente <= 0 || lado > frente * 1.6) continue;
    const peso = frente + lado * 2;      // premia quem está alinhado
    if (peso < melhorPeso){ melhorPeso = peso; melhor = n.id; }
  }
  return melhor;
}

function gridWindow(i, len, cols, rows){
  const linhas = Math.ceil(len / cols), linha = Math.floor(i / cols);
  const topo = clamp(linha - Math.floor((rows - 1) / 2), 0, Math.max(0, linhas - rows));
  return topo * cols;
}
