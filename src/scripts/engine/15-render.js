/* ===================================================================
   5. RENDER HELPERS
   =================================================================== */
/* GLIFOS QUE A PRESS START 2P NÃO TEM.
   A fonte é ASCII imprimível e mais nada. Tudo fora disso cai numa fonte
   de fallback: `▸ ▼ ▲` ainda aparecem (só que fora do estilo pixel), mas
   `◄ ►` não desenham em nada — viram um ponto. Medido no próprio
   navegador comparando a largura do glifo com a do "M" (10px na PS2P,
   5,5px quando é fallback).

   Por isso setas horizontais em `pxText` usam `<` e `>`, que são ASCII de
   verdade. Em `uiText` (Inter) qualquer um deles funciona. */
const PX_SEM_GLIFO = /[◄►]/;

function pxText(str, x, y, o = {}){
  ctx.save();
  ctx.font = FONT_PX(o.size ?? 10);
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  if (o.glow){ ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur ?? 8; }
  if (o.shadow !== false){ ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillText(str, x + 1, y + 1); }
  ctx.fillStyle = o.color || '#e0ddd4';
  ctx.fillText(str, x, y);
  ctx.restore();
}
function uiText(str, x, y, o = {}){
  ctx.save();
  ctx.font = (o.weight ? o.weight + ' ' : '') + FONT_UI(o.size ?? 14);
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  ctx.fillStyle = o.color || '#d4d0c8';
  ctx.fillText(str, x, y);
  ctx.restore();
}
function measureUI(str, size = 14){ ctx.save(); ctx.font = FONT_UI(size); const w = ctx.measureText(str).width; ctx.restore(); return w; }

/* ===================================================================
   IDENTIDADE VISUAL — "Éter"
   O kit de HUD gerado como imagem tinha dois defeitos fatais: as barras
   e retratos vinham PINTADOS na arte (barra pintada não enche), e nada
   era 9-slice (esticar deformava o losango do topo e os cantos).
   Então a moldura é desenhada em código: escala para qualquer tamanho,
   nunca deforma, e não amarra o jogo a uma resolução.
   =================================================================== */
const UI = {
  fill0:'#181334', fill1:'#0b0918',      // preenchimento, topo → base
  borda:'#8a6ada', bordaClara:'#c0a6ff', // moldura
  gema:'#7ad0ff', ouro:'#e8c25a',        // gemas de topo e base
  sombra:'rgba(0,0,0,.55)',
};

/* --- TEMAS DE INTERFACE --------------------------------------------
   A interface inteira é violeta: são 167 cores distintas no código de
   desenho, e a grande maioria delas é a MESMA família roxa em tons
   diferentes (#b89aff no título, #6a5a8a no texto apagado, #7a5aba na
   borda, e por aí vai). Trocar isso à mão seria reescrever cento e
   cinquenta chamadas de desenho e errar em algumas.

   Então o tema não reescreve chamada nenhuma: ele gira o MATIZ da cor
   no momento em que ela entra no canvas. `instalarTema` troca os
   acessores de `fillStyle`, `strokeStyle` e `shadowColor` do contexto
   por versões que passam a cor por `corDoTema` antes de pintar.

   A regra que faz isso ser seguro em vez de temerário:

     o tema move a cor que é DECORAÇÃO e não encosta na cor que
     SIGNIFICA alguma coisa.

   Vida é verde, mana é azul, ouro é dourado, perigo é vermelho, e cada
   elemento tem a sua cor — nada disso pode virar outra coisa porque o
   jogador escolheu um tema âmbar. Duas travas garantem isso:

   1. Só gira matiz dentro de BANDA_CROMO (238°–292°), que é onde vive
      todo o violeta da interface. Verde (120°), azul de mana (220°),
      dourado (49°) e vermelho (0°) estão fora e passam intactos. Cinza
      e preto têm saturação ~0, não têm matiz, e também passam.
   2. O que é semântico E cai dentro da banda entra em CORES_FIXAS e é
      devolvido sem tocar. É o caso de Trevas (#6a3a8a, 280°), que é
      violeta de nascença: sem esta trava, um tema verde apagaria a
      identidade do elemento junto com a moldura.

   CORES_FIXAS é montada a partir de ELEM, então elemento novo entra
   protegido sozinho — ninguém precisa lembrar de vir aqui. */
const BANDA_CROMO = [238, 292];
const MATIZ_BASE  = (BANDA_CROMO[0] + BANDA_CROMO[1]) / 2;   // 265°, o violeta do Éter

/* `gema` é escolhida à mão, e não girada junto. A gema do topo é ciano
   (201°), 64° abaixo do violeta da interface; girar preservando essa
   distância manda o ciano para magenta num tema quente, que não é uma
   gema quente — é outra cor gritando no meio da tela. Distância de matiz
   não sobrevive à rotação, então aqui vale escolher.
   A gema da BASE é dourada e continua dourada em todos: ela é a mesma
   moeda do resto do jogo. */
const TEMAS = [
  {id:'eter',    nome:'Éter',     giro:   0, sat:1.00, luz:1.00, gema:'#7ad0ff'},
  {id:'brasa',   nome:'Brasa',    giro:-244, sat:1.05, luz:1.00, gema:'#ffa86a'},
  {id:'musgo',   nome:'Musgo',    giro:-137, sat:0.90, luz:0.98, gema:'#9ae8a0'},
  {id:'abissal', nome:'Abissal',  giro: -70, sat:1.00, luz:1.00, gema:'#6ae8e0'},
  {id:'ferrugem',nome:'Ferrugem', giro:-232, sat:0.75, luz:1.02, gema:'#e8b48a'},
  {id:'cinza',   nome:'Cinza',    giro:   0, sat:0.10, luz:1.08, gema:'#c0c0cc'},
  /* Este não é um tema fixo: é o mockup de Porto Lúmina, que tem a
     interface DOURADA de dia e VIOLETA à noite. Os valores aqui são os
     do dia; `temaDoRelogio` interpola até os da noite conforme a hora.
     Fica na lista para poder ser escolhido em Opções como os outros. */
  {id:'relogio', nome:'Segue o relógio', giro:-220, sat:0.92, luz:1.04,
   gema:'#ffd88a', segueRelogio:true},
];

/* Os dois extremos entre os quais o tema do relógio caminha. */
const RELOGIO_NOITE = {giro:0, sat:1.00, luz:1.00, gema:'#7ad0ff'};
/* Quantização. O tema do relógio muda de valor a cada passo do jogador,
   e `corDoTema` guarda o resultado numa memória indexada pelo id do
   tema. Sem arredondar, cada instante viraria um id novo e a memória
   cresceria para sempre — 12 degraus dão transição lisa e no máximo 13
   entradas de cache. */
const PASSOS_TEMA_RELOGIO = 12;

/* Quanto a luz da hora está FRIA, de 0 (dourado) a 1 (violeta).

   A primeira tentativa usou o escurecimento geral, e errou o alvo: às
   22h a interface só tinha andado 70% do caminho e saía ciano, quando o
   mockup à noite é claramente violeta. O escuro mede a hora, mas não é
   o que separa dia de noite naquela arte — o que separa é a luz virar
   AZUL. Então a conta é a razão entre o azul e o vermelho da luz:

     entardecer  B/R 0,56  → dourado (o poente continua quente)
     meio-dia    B/R 1,00  → dourado
     anoitecer   B/R 1,32  → meio caminho
     noite       B/R 1,69  → violeta
     madrugada   B/R 1,77  → violeta

   De quebra o poente fica certo: com o escuro, a interface já era meio
   violeta às 18h e brigava com o céu alaranjado. */
const FRIO_QUENTE = 0.90, FRIO_FRIO = 1.77;
function friezaDaHora(){
  if (typeof luzAgora !== 'function') return 0;
  const m = luzAgora().mult;
  const razao = m[2] / Math.max(0.001, m[0]);
  return clamp((razao - FRIO_QUENTE) / (FRIO_FRIO - FRIO_QUENTE), 0, 1);
}

function temaDoRelogio(base){
  const e = friezaDaHora();
  const q = Math.round(e * PASSOS_TEMA_RELOGIO) / PASSOS_TEMA_RELOGIO;
  return {
    id:'relogio:' + q, nome:base.nome, segueRelogio:true,
    giro:lerp(base.giro, RELOGIO_NOITE.giro, q),
    sat: lerp(base.sat,  RELOGIO_NOITE.sat,  q),
    luz: lerp(base.luz,  RELOGIO_NOITE.luz,  q),
    gema:q < 0.5 ? base.gema : RELOGIO_NOITE.gema,
  };
}
const temaAtual = () => {
  const t = TEMAS.find(x => x.id === G.tema) || TEMAS[0];
  return t.segueRelogio ? temaDoRelogio(t) : t;
};

/** Cores que ignoram o tema: as que significam alguma coisa, e as que o
 *  próprio tema já escolheu (girá-las seria girar duas vezes). */
const CORES_FIXAS = new Set([
  ...Object.values(ELEM).flatMap(e => [e.main, e.glow]),
  ...TEMAS.map(t => t.gema),
  RELOGIO_NOITE.gema,
]);

/* Conversões. Só o que o transform precisa — matiz, saturação, luz. */
function hexParaRGB(c){
  if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
  return [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
}
function rgbParaHSL(r, g, b){
  r/=255; g/=255; b/=255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn;
  const l = (mx + mn) / 2;
  if (!d) return [0, 0, l];
  const s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r)      h = ((g - b) / d + (g < b ? 6 : 0));
  else if (mx === g) h = (b - r) / d + 2;
  else               h = (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslParaRGB(h, s, l){
  h = ((h % 360) + 360) % 360;
  if (!s) { const v = Math.round(l * 255); return [v, v, v]; }
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h <  60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] :
    h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
}

/** Aplica o tema a UM valor de cor. Devolve o próprio valor quando não há
 *  nada a fazer — é o caminho normal e precisa ser barato. */
function transformarCor(cor, t){
  let r, g, b, a = null;
  if (cor[0] === '#'){
    if (cor.length !== 4 && cor.length !== 7) return cor;   // #rrggbbaa e afins: passa
    [r, g, b] = hexParaRGB(cor);
  } else if (cor.startsWith('rgb')){
    const n = cor.match(/[\d.]+/g);
    if (!n || n.length < 3) return cor;
    r = +n[0]; g = +n[1]; b = +n[2];
    if (n.length > 3) a = +n[3];
  } else {
    return cor;                                             // nome CSS, gradiente já resolvido
  }
  let [h, s, l] = rgbParaHSL(r, g, b);
  if (s < 0.06) {
    // acinzentado: não tem matiz para girar. Só o tema cinza mexe na luz.
    if (t.luz === 1) return cor;
    l = clamp(l * t.luz, 0, 1);
  } else if (h >= BANDA_CROMO[0] && h <= BANDA_CROMO[1]){
    h += t.giro;
    s = clamp(s * t.sat, 0, 1);
    l = clamp(l * t.luz, 0, 1);
  } else {
    return cor;                                             // cor com significado: intacta
  }
  const [nr, ng, nb] = hslParaRGB(h, s, l);
  return a === null ? `rgb(${nr},${ng},${nb})` : `rgba(${nr},${ng},${nb},${a})`;
}

/* O transform roda a cada `fillStyle =` — centenas de vezes por quadro.
   A memória por cor+tema faz o custo virar uma busca em Map depois do
   primeiro quadro. */
const _memoTema = new Map();
function corDoTema(cor){
  const t = temaAtual();
  if (t.giro === 0 && t.sat === 1 && t.luz === 1) return cor;   // tema Éter: identidade
  if (CORES_FIXAS.has(cor)) return cor;
  const chave = t.id + '|' + cor;
  let v = _memoTema.get(chave);
  if (v === undefined){ v = transformarCor(cor, t); _memoTema.set(chave, v); }
  return v;
}

/** Troca os acessores de cor do contexto pelos que aplicam o tema.
 *  Gradiente e padrão não são string e passam direto — é o que mantém
 *  o corpo do painel (que é gradiente) desenhando como sempre. */
/* Guarda os acessores originais. Existe uma coisa no jogo que é cor e
   NÃO é interface: a luz do dia. O tema gira o violeta da moldura; girar
   junto a cor do entardecer seria pintar o céu de acordo com o menu.
   `pintarSemTema` é a porta dos fundos para esses casos — e é a única,
   de propósito. */
const COR_CRUA = {};
function pintarSemTema(prop, valor){
  if (COR_CRUA[prop]) COR_CRUA[prop].set.call(ctx, valor);
  else ctx[prop] = valor;
}

function instalarTema(alvo){
  for (const prop of ['fillStyle', 'strokeStyle', 'shadowColor']){
    const base = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, prop);
    if (!base) continue;
    COR_CRUA[prop] = base;
    Object.defineProperty(alvo, prop, {
      configurable:true,
      get(){ return base.get.call(this); },
      set(v){ base.set.call(this, typeof v === 'string' ? corDoTema(v) : v); },
    });
  }
  /* O CORPO do painel é gradiente, e parada de gradiente não passa por
     `fillStyle`. Sem isto o tema pintaria a borda e o texto e deixaria o
     miolo roxo — que foi exatamente o que apareceu na primeira prova. */
  for (const met of ['createLinearGradient', 'createRadialGradient']){
    const base = CanvasRenderingContext2D.prototype[met];
    if (!base) continue;
    alvo[met] = function(...args){
      const g = base.apply(this, args);
      const add = g.addColorStop.bind(g);
      g.addColorStop = (off, cor) => add(off, typeof cor === 'string' ? corDoTema(cor) : cor);
      return g;
    };
  }
}
/* `ctx` nasce na parte 03, que roda antes desta — então já existe aqui.
   Instalar na origem é o que garante que NENHUM desenho escape do tema:
   não há como alguém pintar sem passar por este contexto. */
instalarTema(ctx);

/** Losango (a "gema" que marca o centro das bordas e os cantos). */
function gema(cx, cy, r, cor, brilho){
  ctx.save();
  if (brilho){ ctx.shadowColor = cor; ctx.shadowBlur = r * 2.6; }
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * .62, cy);
  ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r * .62, cy);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/** Janela padrão do jogo, na identidade nova. */
/* --- MOLDURAS ------------------------------------------------------
   Os cantos em L do `panel` são desenhados a traço. Estas 25 molduras
   trocam esse traço por arte, e como TODO painel do jogo passa por
   `panel`, escolher uma muda a ordem de turno, o HUD do grupo, a caixa
   de log e o menu de uma vez só.
   'nenhuma' é o padrão e não é ausência de opção: é o desenho original,
   que continua sendo o que aparece em painel apertado, onde a arte não
   caberia sem virar borrão. */
const MOLDURAS = [
  {id:'nenhuma', nome:'Traço original', canto:null, emblema:null},
  {id:'m01', nome:'Azul-Profundo', canto:'ui_canto_01', emblema:'ui_embl_01'},
  {id:'m02', nome:'Azul-Profundo 2', canto:'ui_canto_02', emblema:'ui_embl_02'},
  {id:'m03', nome:'Esmeralda', canto:'ui_canto_03', emblema:'ui_embl_03'},
  {id:'m04', nome:'Violeta', canto:'ui_canto_04', emblema:'ui_embl_04'},
  {id:'m05', nome:'Violeta 2', canto:'ui_canto_05', emblema:'ui_embl_05'},
  {id:'m06', nome:'Dourada', canto:'ui_canto_06', emblema:'ui_embl_06'},
  {id:'m07', nome:'Dourada 2', canto:'ui_canto_07', emblema:'ui_embl_07'},
  {id:'m08', nome:'Âmbar', canto:'ui_canto_08', emblema:'ui_embl_08'},
  {id:'m09', nome:'Violeta 3', canto:'ui_canto_09', emblema:'ui_embl_09'},
  {id:'m10', nome:'Sombria', canto:'ui_canto_10', emblema:'ui_embl_10'},
  {id:'m11', nome:'Dourada 3', canto:'ui_canto_11', emblema:'ui_embl_11'},
  {id:'m12', nome:'Dourada 4', canto:'ui_canto_12', emblema:'ui_embl_12'},
  {id:'m13', nome:'Esmeralda 2', canto:'ui_canto_13', emblema:'ui_embl_13'},
  {id:'m14', nome:'Escarlate', canto:'ui_canto_14', emblema:'ui_embl_14'},
  {id:'m15', nome:'Azul-Profundo 3', canto:'ui_canto_15', emblema:'ui_embl_15'},
  {id:'m16', nome:'Dourada 5', canto:'ui_canto_16', emblema:'ui_embl_16'},
  {id:'m17', nome:'Violeta 4', canto:'ui_canto_17', emblema:'ui_embl_17'},
  {id:'m18', nome:'Dourada 6', canto:'ui_canto_18', emblema:'ui_embl_18'},
  {id:'m19', nome:'Azul-Profundo 4', canto:'ui_canto_19', emblema:'ui_embl_19'},
  {id:'m20', nome:'Violeta 5', canto:'ui_canto_20', emblema:'ui_embl_20'},
  {id:'m21', nome:'Âmbar 2', canto:'ui_canto_21', emblema:'ui_embl_21'},
  {id:'m22', nome:'Âmbar 3', canto:'ui_canto_22', emblema:'ui_embl_22'},
  {id:'m23', nome:'Violeta 6', canto:'ui_canto_23', emblema:'ui_embl_23'},
  {id:'m24', nome:'Sombria 2', canto:'ui_canto_24', emblema:'ui_embl_24'},
  {id:'m25', nome:'Âmbar 4', canto:'ui_canto_25', emblema:'ui_embl_25'},
  /* Tirada do mockup de combate. As 25 acima são arte de pacote; esta
     é o desenho do próprio jogo, redesenhado em geometria a partir do
     mockup — por isso é a única que fica nítida em qualquer tamanho. */
  {id:'mock', nome:'Éter Combate', canto:'ui_canto_mock', emblema:'ui_embl_mock'},
];
const molduraAtual = () =>
  MOLDURAS.find(m => m.id === G.moldura) || MOLDURAS[0];

function panel(x, y, w, h, o = {}){
  const a  = o.alpha ?? 0.94;
  const ac = o.accent || UI.borda;
  const gem = o.gem || temaAtual().gema || UI.gema;
  // canto acompanha o accent: painel dourado não ganha canto violeta
  const canto = o.accent ? ac : UI.bordaClara;
  const pequeno = Math.min(w, h) < 46;    // painel apertado: versão enxuta
  ctx.save();

  // corpo
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, `rgba(24,19,52,${a})`);
  g.addColorStop(1, `rgba(11,9,24,${a})`);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);

  // brilho interno no topo, que dá o volume do kit
  const gi = ctx.createLinearGradient(x, y, x, y + Math.min(h * .5, 40));
  gi.addColorStop(0, 'rgba(140,110,220,.13)');
  gi.addColorStop(1, 'rgba(140,110,220,0)');
  ctx.fillStyle = gi; ctx.fillRect(x + 2, y + 2, w - 4, Math.min(h * .5, 40));

  // moldura: fio fino por fora, fio quase invisível por dentro
  ctx.strokeStyle = ac; ctx.lineWidth = 1;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.strokeStyle = 'rgba(255,255,255,.05)';
  ctx.strokeRect(x + 5.5, y + 5.5, w - 11, h - 11);

  /* Arte de canto, quando há moldura escolhida. Painel pequeno continua
     no traço: a 28px a arte já perde o desenho, e em caixa de 40px de
     altura viraria mancha. */
  const mold = molduraAtual();
  const arteCanto = (!pequeno && mold.canto) ? spriteImages[mold.canto] : null;
  if (arteCanto && (arteCanto.complete ?? true) && (arteCanto.naturalWidth || arteCanto.width)){
    const L = Math.round(Math.min(30, w * .30, h * .30));
    /* Espelhado nos quatro cantos a partir de UMA arte: o pacote traz só
       o canto superior-esquerdo, e girar no desenho evita guardar quatro
       vezes a mesma imagem. */
    for (const [ex, ey] of [[1,1],[-1,1],[1,-1],[-1,-1]]){
      ctx.save();
      ctx.translate(ex > 0 ? x : x + w, ey > 0 ? y : y + h);
      ctx.scale(ex, ey);
      ctx.drawImage(arteCanto, 0, 0, L, L);
      ctx.restore();
    }
    ctx.shadowBlur = 0;
    const cxg = clamp(x + w / 2, 8, W - 8);
    if (o.gemaTopo !== false) gema(cxg, clamp(y + 1.5, 7, H - 7), 7, gem, true);
    if (o.gemaBase !== false) gema(cxg, clamp(y + h - 1.5, 5, H - 5), 5, UI.ouro, false);
    ctx.restore();
    return;
  }

  if (!pequeno){
    // cantos em L — grossos e com brilho, é o que dá o desenho ao painel
    const L = Math.min(20, w * .24, h * .24);
    ctx.strokeStyle = canto; ctx.lineWidth = 3;
    ctx.lineCap = 'square';
    ctx.shadowColor = ac; ctx.shadowBlur = 6;
    [[x+1.5,y+1.5,1,1],[x+w-1.5,y+1.5,-1,1],[x+1.5,y+h-1.5,1,-1],[x+w-1.5,y+h-1.5,-1,-1]]
      .forEach(([cx, cy, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(cx + sx * L, cy); ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + sy * L); ctx.stroke();
      });
    ctx.shadowBlur = 0;
    // gemas: ciano no topo, dourada embaixo.
    // Painel colado na borda da tela empurra a gema para dentro — senão ela
    // sai cortada pela metade, que foi o que apareceu no menu e na ordem de turno.
    const cx = clamp(x + w / 2, 8, W - 8);
    /* `gemaTopo:false` para painel PEQUENO, tipo botão de HUD: num quadro
       de 54px a gema de 7px vira mancha no meio do ícone em vez de
       enfeite de canto. */
    if (o.gemaTopo !== false) gema(cx, clamp(y + 1.5, 7, H - 7), 7, gem, true);
    // gemaBase:false para painéis que usam a base como área útil
    if (o.gemaBase !== false) gema(cx, clamp(y + h - 1.5, 5, H - 5), 5, UI.ouro, false);
  }
  ctx.restore();
}

/** Barra: canal chanfrado, ponta em losango e brilho na crista —
 *  o desenho do kit, mas com o preenchimento vivo. */
function bar(x, y, w, h, ratio, c1, c2, o = {}){
  ratio = clamp(ratio, 0, 1);
  const grosso = h >= 7;
  ctx.save();

  // canal
  ctx.fillStyle = o.bg || '#0d0a1c'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(x + 1, y + 1, w - 2, 1);

  // rastro do dano recente
  if (o.ghost !== undefined && o.ghost > ratio){
    ctx.fillStyle = 'rgba(230,110,110,.5)';
    ctx.fillRect(x + 1, y + 1, (w - 2) * clamp(o.ghost, 0, 1), h - 2);
  }
  // preenchimento
  const larg = (w - 2) * ratio;
  if (larg > 0){
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(x + 1, y + 1, larg, h - 2);
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x + 1, y + 1, larg, 1);
    if (grosso){
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(x + 1, y + h - 2, larg, 1);
    }
  }
  // moldura
  ctx.strokeStyle = 'rgba(140,110,220,.55)'; ctx.lineWidth = 1;
  ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
  // ponta em losango: só quando pedida, e na CRISTA do preenchimento,
  // para acompanhar o valor em vez de virar enfeite fixo
  if (o.cap && grosso && larg > 2) gema(x + 1 + larg, y + h / 2, h * .68, o.cap, true);
  ctx.restore();
}

/* --- Sprites --------------------------------------------------- */
/* As folhas de NPC foram remontadas na mesma grade da party: 3×4 de
   56×64. A arte de origem tinha 1 pose por direção, então as três
   colunas são o mesmo desenho com 1px de deslocamento vertical nas
   pontas — vira um bob discreto em vez de ficar totalmente parado. */
const NPC_SHEETS = ['npc_aluno','npc_lina','npc_balconista','npc_kael','npc_zelador',
                    'npc_bibliotecaria','npc_veterano','npc_estudante','npc_enfermeira',
                    'npc_mercador',
  /* v5.30 — dezoito figurantes novos. Antes deles 47 NPCs dividiam as
     dez folhas de cima, e a Batedora era a mesma veterana da Cobradora
     de Fossa. Recortados em `assets/_folha_npc.py`. */
                    'npc_anciana','npc_arqueiro','npc_batedor',
                    'npc_camponesa','npc_capataz','npc_cigana',
                    'npc_clerigo','npc_encapuzado','npc_eremita',
                    'npc_escriba','npc_ferreiro','npc_menina',
                    'npc_nobre','npc_professor','npc_rapaz',
                    'npc_ruivo','npc_serva','npc_viajante'];

/* Altura exibida em TELA de todo chibi de campo, sempre — não muda
   com a resolução da arte fonte de cada personagem (ver drawActor).
   64px é o tamanho clássico já calibrado contra TILE=32 e o resto do
   cenário; subir isso aumenta TODO personagem no mapa de uma vez. */
const DISPLAY_FH = 96;
const FRAME_INFO = {
  gabriel_sheet:{fw:42, fh:128, cols:3, rows:4},
  kael_sheet:   {fw:56, fh:128, cols:3, rows:4},
  ophelia_sheet:{fw:56, fh:128, cols:3, rows:4},
  max_sheet:    {fw:68, fh:128, cols:3, rows:4},
  // Folha própria do Marin, remontada a partir da arte de 1254×1254:
  // as 4 direções vieram das linhas frente/esquerda/direita/costas do
  // original e foram realinhadas pelos PÉS na grade 3×4 do jogo.
  marin_sheet:  {fw:56, fh:128, cols:3, rows:4},
  eden_sheet:   {fw:56, fh:128, cols:3, rows:4},
  // v5.1 — remontadas de arte 4x4 pelo mesmo caminho da folha do Marin
  ava_sheet:    {fw:53, fh:128, cols:3, rows:4},
  scythe_sheet: {fw:57, fh:128, cols:3, rows:4},
  gabriel_lycan_sheet: {fw:59, fh:128, cols:3, rows:4},
  madao_sheet: {fw:36, fh:128, cols:3, rows:4},
  /* v5.30 — a geração anterior. Remontadas de arte 3x3 em
     `assets/_folha_chibi.py`: as nove poses viraram quatro direções, com
     `right` espelhado de `left` porque a arte só traz um perfil. */
  amanda_sheet:{fw:55, fh:128, cols:3, rows:4},
  abel_sheet:{fw:41, fh:128, cols:3, rows:4},
  orfeu_sheet:{fw:30, fh:128, cols:3, rows:4},
  snoopy_sheet:{fw:43, fh:128, cols:3, rows:4},
  // v5.32 — forma Papelão do Madao (chibi ainda sem uso em campo, ver 00-assets.js)
  madao_papelao_sheet:{fw:64, fh:64, cols:3, rows:4},
  // v5.32 — Elijah (boss anunciado, arquivos completos ainda pendentes)
  elijah_sheet:{fw:56, fh:64, cols:3, rows:4},
  elijah_corrompido_sheet:{fw:56, fh:64, cols:3, rows:4},
  // v5.32 — 2º traje da Ava e NPCs novos da Academia (sem uso em campo ainda)
  ava_outfit2_sheet:{fw:64, fh:64, cols:3, rows:4},
  beatriz_sheet:{fw:64, fh:64, cols:3, rows:4},
  calderpell_sheet:{fw:64, fh:64, cols:3, rows:4},
  carmila_sheet:{fw:64, fh:64, cols:3, rows:4},
};
/* Largura por folha: as dezoito novas variam de 26 a 40 px, e a média de
   56 das antigas cortaria braço de umas e daria vão nas outras. */
const NPC_FW = {"npc_anciana": 33, "npc_arqueiro": 32, "npc_batedor": 29, "npc_camponesa": 30, "npc_capataz": 31, "npc_cigana": 35, "npc_clerigo": 32, "npc_encapuzado": 35, "npc_eremita": 34, "npc_escriba": 29, "npc_ferreiro": 32, "npc_menina": 40, "npc_nobre": 31, "npc_professor": 32, "npc_rapaz": 28, "npc_ruivo": 31, "npc_serva": 29, "npc_viajante": 31};
for (const k of NPC_SHEETS) FRAME_INFO[k] = {fw:NPC_FW[k] || 56, fh:128, cols:3, rows:4};

/* Correção de arte por folha, aplicada no carregamento.
   A folha do Gabriel veio com um bloco claro solto no rodapé dos três
   quadros virados para a direita — em jogo aparecia como se o cabelo
   estivesse duplicado embaixo do boneco. `minPx` alto de propósito:
   pega o artefato (≈130 px) sem tocar em pé levantado de caminhada
   (≈30 px), que é um fragmento legítimo e bem menor.
   >>> Ao substituir por arte definitiva, apague a entrada daqui. <<< */
const SHEET_CLEANUP = {
  gabriel_sheet: {dropDetachedBelow:55, minPx:100},
};

/** Remove fragmentos soltos do rodapé de cada quadro de uma folha.
 *  Puro: recebe imagem + grade, devolve um canvas novo. */
function cleanSheet(img, fi, cfg){
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  if (!fi || !w || !h) return img;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.drawImage(img, 0, 0);
  const dat = g.getImageData(0, 0, w, h), D = dat.data;
  const minY = cfg.dropDetachedBelow, minPx = cfg.minPx ?? 100;
  let blobs = 0, removed = 0;

  for (let r = 0; r < fi.rows; r++) for (let c = 0; c < fi.cols; c++){
    const ox = c * fi.fw, oy = r * fi.fh;
    const idx = (x, y) => ((oy + y) * w + (ox + x)) * 4;
    const on  = (x, y) => D[idx(x, y) + 3] > 200;
    const lab = Array.from({length:fi.fh}, () => new Array(fi.fw).fill(0));
    const comps = []; let id = 0;
    for (let y = 0; y < fi.fh; y++) for (let x = 0; x < fi.fw; x++){
      if (!on(x, y) || lab[y][x]) continue;
      id++; const stack = [[x, y]], px = []; lab[y][x] = id; let y0 = Infinity;
      while (stack.length){
        const [a, b] = stack.pop(); px.push([a, b]); if (b < y0) y0 = b;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){
          const p = a + dx, q = b + dy;
          if (p < 0 || q < 0 || p >= fi.fw || q >= fi.fh || lab[q][p] || !on(p, q)) continue;
          lab[q][p] = id; stack.push([p, q]);
        }
      }
      comps.push({px, y0, n:px.length});
    }
    if (comps.length < 2) continue;
    comps.sort((a, b) => b.n - a.n);          // [0] = o personagem
    for (const k of comps.slice(1)){
      if (k.n < minPx || k.y0 < minY) continue;
      blobs++; removed += k.n;
      for (const [a, b] of k.px) D[idx(a, b) + 3] = 0;
    }
  }
  g.putImageData(dat, 0, 0);
  // faz o canvas passar pelas mesmas checagens de uma <img>
  cv.complete = true; cv.naturalWidth = w; cv.naturalHeight = h;
  cv.cleanup = {blobs, removed};
  return cv;
}

const spriteImages = {};
let spritesLoaded = 0;
const totalSprites = Object.keys(SPRITE_DATA).length;
for (const [key, src] of Object.entries(SPRITE_DATA)){
  const img = new Image();
  img.onload = () => {
    spritesLoaded++;
    /* Folha de chibi (3 cols × 4 linhas): tanto a largura (`fw`) quanto
       a altura (`fh`) do quadro vêm do arquivo de verdade, não de um
       número fixo cadastrado em FRAME_INFO — que vira só um chute
       inicial, sobrescrito assim que a imagem carrega. Isso é o que
       deixa uma arte nova (ver docs/atlas/01-chibi-personagem-world.md
       e docs/atlas/01b-REFERENCIA-chibi-world-novo-padrao.md) funcionar
       só trocando o arquivo, em QUALQUER resolução que o artista
       entregar — sem editar código nem travar num tamanho de pipeline
       fixo. */
    const info = FRAME_INFO[key];
    if (info && info.cols === 3 && info.rows === 4){
      const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
      info.fw = Math.round(w / info.cols);
      info.fh = Math.round(h / info.rows);
    }
    const fix = SHEET_CLEANUP[key];
    if (fix){
      const cleaned = cleanSheet(img, FRAME_INFO[key], fix);
      if (cleaned.cleanup?.blobs) spriteImages[key] = cleaned;
    }
  };
  img.onerror = () => { spritesLoaded++; console.warn('sprite falhou:', key); };
  img.src = src;
  spriteImages[key] = img;
}
const DIR_ROW = {down:0, left:1, right:2, up:3};
/* Folhas de 3 colunas usam a do meio como parado: 1 → 0 → 1 → 2. */
const WALK_CYCLE = [1, 0, 1, 2];

/* --- Arte de batalha ---------------------------------------------
   Carrega em paralelo aos sprites do mapa. Falha de carregamento é
   tolerada de propósito: o personagem volta ao chibi em vez de sumir. */
const battleArt = {};
for (const [nome, cfg] of Object.entries(BATTLE_ART)){
  if (!cfg || !cfg.src || !cfg.w || !cfg.h){
    console.warn('BATTLE_ART: entrada inválida (precisa de src, w e h):', nome);
    continue;
  }
  const img = new Image();
  const rec = {...cfg, img, ok:false,
               frames:Math.max(1, cfg.frames || 1), fps:cfg.fps || 4,
               scale:cfg.scale || 1, anchorY:cfg.anchorY ?? 1};
  img.onload  = () => { rec.ok = true; };
  img.onerror = () => console.warn(`BATTLE_ART: não carregou "${cfg.src}" (${nome}) — usando o chibi.`);
  img.src = cfg.src;
  battleArt[nome] = rec;
}
/** Devolve a arte de batalha pronta, ou null (aí o combate usa o chibi). */
function battleArtOf(nome){
  const a = battleArt[nome];
  if (!a || !a.ok) return null;
  return ((a.img.naturalWidth ?? a.img.width) > 0) ? a : null;   // aceita <img> ou <canvas>
}
/** Qual arte de combate um ator usa AGORA. A ordem é o contrato: a de
 *  vitória vem primeiro, senão o Madao apareceria com a caixa erguida na
 *  tela de vitória, quando a luta já acabou e não há mais o que aparar. */
function arteDeCombate(u){
  if (!u) return null;
  if (u.name === MADAO.dono){
    if (Battle.phase === 'VICTORY' && battleArtOf(MADAO.arteVitoria)) return MADAO.arteVitoria;
    /* Derivado do CONTADOR, não de um segundo campo booleano: dois
       estados para a mesma coisa dessincronizam na primeira vez que
       alguém esquecer de zerar um dos dois. */
    if (u.papelaoT > 0 && battleArtOf(MADAO.artePapelao)) return MADAO.artePapelao;
  }
  if (u.lycan) return LYCAN.arte;
  return u.name;
}

/** true se ALGUÉM do time tem arte grande — decide a formação usada. */
function anyBattleArt(lista){ return lista.some(c => !!battleArtOf(c.name)); }

/** Desenha um quadro da arte de batalha com o pé em (px,py). */
function drawBattleArt(art, px, py, o = {}){
  const t = o.time ?? (Date.now() / 1000);
  const f = art.frames > 1 ? Math.floor(t * art.fps) % art.frames : 0;
  const dw = art.w * art.scale * (o.scale ?? 1);
  const dh = art.h * art.scale * (o.scale ?? 1);
  ctx.save();
  ctx.globalAlpha *= (o.alpha ?? 1);
  if (o.glow){ ctx.shadowColor = o.glow; ctx.shadowBlur = 18; }
  ctx.translate(px, py - dh * art.anchorY + dh);
  if (art.flip) ctx.scale(-1, 1);
  ctx.drawImage(art.img, f * art.w, 0, art.w, art.h, -dw / 2, -dh, dw, dh);
  ctx.restore();
}

/* Tile animado por arte: escolhe o quadro pelo relógio E pela posição do
   tile. O `+ x + y` é o que herda o comportamento do desenho procedural
   antigo, onde a fase da senoide dependia de `x`/`y`: sem ele, um lago
   inteiro pulsaria em uníssono, que é justamente o efeito de "tela
   piscando" que a versão procedural evitava. */
function quadroTile(chaves, ms, x, y){
  const i = (Math.floor(Date.now() / ms) + x + y) % chaves.length;
  const img = spriteImages[chaves[i]];
  return (img && (img.complete ?? true) && (img.naturalWidth || img.width)) ? img : null;
}
const TILE_AGUA  = ['tile_agua_0','tile_agua_1','tile_agua_2'];
/* Arte de cenário por id de tile. Quem não estiver aqui — ou estiver com
   a chave ausente — continua caindo no desenho procedural de sempre; é o
   mesmo par de caminhos usado em pet, arma e tile animado, e é o que
   permite a arte chegar aos poucos sem o mapa ficar com buraco. */
const TILE_ART = {
  grass:'tile_grass', path:'tile_path',  dirt:'tile_dirt',   crack:'tile_crack',
  wall:'tile_wall',   floor:'tile_floor', carpet:'tile_carpet',
  door:'tile_door',   stairs:'tile_stairs',
  /* `water` NÃO entra aqui. Ele já tem arte ANIMADA de três quadros
     (`TILE_AGUA`), e o atalho de `drawTileArt` roda antes do switch —
     pôr uma imagem estática nesta tabela congelaria a água. */
};
/* Fila de ícones de condição. Cada uma que tem arte vira um desenho de
   16px; as que não têm continuam no glifo unicode, no MESMO lugar da
   fila. Misturar os dois é feio, mas é honesto — e é melhor que inventar
   um ícone que não quer dizer aquela condição. Devolve a largura usada,
   para quem chama seguir escrevendo depois. */
function drawAilments(lista, x, y, o = {}){
  const lado = o.lado || 14, gap = 2;
  let cx = x;
  const itens = lista.map(a => {
    const d = AILMENTS[a.id];
    const img = spriteImages['ail_' + a.id];
    const temArte = img && (img.complete ?? true) && (img.naturalWidth || img.width);
    return {d, img: temArte ? img : null};
  });
  const larg = itens.length * lado + Math.max(0, itens.length - 1) * gap;
  if (o.align === 'right')  cx = x - larg;
  if (o.align === 'center') cx = x - larg / 2;
  for (const it of itens){
    if (it.img) ctx.drawImage(it.img, Math.round(cx), Math.round(y - lado / 2), lado, lado);
    else pxText(it.d.icon, cx + lado / 2, y + 4,
                {size:Math.round(lado * .62), color:o.color || '#ffb0b0', align:'center'});
    cx += lado + gap;
  }
  return larg;
}

function arteTile(chave){
  const img = chave && spriteImages[chave];
  return (img && (img.complete ?? true) && (img.naturalWidth || img.width)) ? img : null;
}
const TILE_BRASA = ['tile_brasa_0','tile_brasa_1','tile_brasa_2'];

/** Marca de um item numa lista. Com `icon` cadastrado desenha o ícone;
 *  sem ele, cai no quadradinho da cor do item — que era o único visual
 *  que existia antes. Os dois caminhos convivem de propósito: só as 18
 *  armas têm ícone, e os ~60 consumíveis e acessórios não podem ficar
 *  sem marca nenhuma por causa disso. */
function drawItemMark(it, x, y, lado = 20){
  const img = it && it.icon && spriteImages[it.icon];
  if (img && (img.complete ?? true) && (img.naturalWidth || img.width)){
    ctx.drawImage(img, Math.round(x), Math.round(y - lado / 2), lado, lado);
    return;
  }
  ctx.fillStyle = (it && it.color) || '#888';
  ctx.fillRect(Math.round(x + lado / 2 - 4), Math.round(y - 4), 8, 8);
}

/** A arte do pet no contexto pedido. 'batalha' prefere `spriteBatalha`
 *  e cai em `sprite` quando o pet não tem arte própria de combate — o
 *  elenco de pets não vai ganhar as duas leituras no mesmo dia, e um pet
 *  sumir do combate por falta de UMA das duas seria pior que reaproveitar
 *  a do campo. Devolve null quando não há arte nenhuma: aí quem chama usa
 *  o desenho procedural. */
function petArte(forma, contexto = 'campo'){
  if (!forma) return null;
  const chaves = contexto === 'batalha'
    ? [forma.spriteBatalha, forma.sprite]
    : [forma.sprite];
  for (const k of chaves){
    const img = k && spriteImages[k];
    if (img && (img.complete ?? true) && (img.naturalWidth || img.width)) return img;
  }
  return null;
}

/** Aceita <img> ou <canvas> (folhas passadas por `cleanSheet`). */
function hasSheet(key){
  const img = spriteImages[key];
  if (!key || !img || !FRAME_INFO[key]) return false;
  const w = img.naturalWidth ?? img.width;
  return (img.complete ?? true) && w > 0;
}

/** Desenha um personagem. `px,py` = pé do sprite (centro-baixo). */
function drawActor(a, px, py, o = {}){
  const scale = o.scale ?? 1, alpha = o.alpha ?? 1;
  const dir = a.dir || 'down';
  const frame = a.moving ? WALK_CYCLE[Math.floor(a.animT / ANIM_STEP) % 4] : 1;
  ctx.save();
  ctx.globalAlpha *= alpha;
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,.34)';
  ctx.beginPath(); ctx.ellipse(px, py + 1, 11 * scale, 4 * scale, 0, 0, Math.PI * 2); ctx.fill();
  if (o.glow){ ctx.shadowColor = o.glow; ctx.shadowBlur = 16 * scale; }
  if (hasSheet(a.sheet)){
    const info = FRAME_INFO[a.sheet];
    const sx = (frame % info.cols) * info.fw;
    const sy = (DIR_ROW[dir] ?? 0) * info.fh;
    /* Tamanho em TELA é sempre DISPLAY_FH, não a altura real do
       arquivo — resolução da arte fonte (64px numa folha, 362px
       noutra) é só nitidez, nunca tamanho do personagem no mapa. Sem
       isso, um personagem com arte em resolução maior (ex.: Ophelia,
       362px de quadro) apareceria gigante ao lado de quem ainda está
       na resolução clássica (64px) — mesmo bug que já intrigou o
       usuário. */
    const dh = DISPLAY_FH * scale, dw = (info.fw / info.fh) * dh;
    ctx.drawImage(spriteImages[a.sheet], sx, sy, info.fw, info.fh, px - dw / 2, py - dh + 6 * scale, dw, dh);
  } else {
    drawPlaceholderActor(px, py, dir, frame, scale, a);
  }
  ctx.restore();
}

/** Boneco procedural para quem ainda não tem sprite.
 *  Determinístico a partir de `cfg.color`/`cfg.hair` — basta preencher
 *  `sheet:'algum_sheet'` depois e ele desaparece sozinho. */
function drawPlaceholderActor(px, py, dir, frame, scale, cfg = {}){
  const s = scale, body = cfg.color || '#6a6a8a', hair = cfg.hair || '#3a3a4a', skin = cfg.skin || '#e8d0b0';
  const bob = frame === 0 ? -1 : frame === 2 ? 1 : 0;
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(px + x*s, py + y*s, w*s, h*s); };
  // pernas
  R(-6, -8 + (bob>0?1:0), 5, 8, '#2a2a3a');
  R( 1, -8 + (bob<0?1:0), 5, 8, '#2a2a3a');
  // tronco / manto
  R(-9, -26 + bob, 18, 19, body);
  ctx.globalAlpha *= .35; R(-9, -26 + bob, 18, 4, '#ffffff'); ctx.globalAlpha /= .35;
  // braços
  R(-11, -24 + bob, 3, 12, body);
  R(  8, -24 + bob, 3, 12, body);
  // cabeça
  R(-8, -40 + bob, 16, 15, skin);
  R(-9, -42 + bob, 18, 8, hair);
  if (dir === 'left')  R(-9, -40 + bob, 5, 13, hair);
  if (dir === 'right') R( 4, -40 + bob, 5, 13, hair);
  if (dir === 'up')    R(-9, -40 + bob, 18, 13, hair);
  else {
    const ex = dir === 'left' ? -5 : dir === 'right' ? 1 : -4;
    R(ex, -33 + bob, 2, 3, '#1a1a2a');
    if (dir === 'down') R(2, -33 + bob, 2, 3, '#1a1a2a');
  }
  // contorno
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1;
  ctx.strokeRect(px - 9*s, py - 42*s + bob*s, 18*s, 35*s);
}

/* --- Texto multi-linha ------------------------------------------- */

/** Quebra na fonte de PIXEL, que é monoespaçada em `size` px por glifo.

    `wrapUI` mede com `measureText` porque a fonte de interface é
    proporcional; a de pixel não é, e medir nela custa uma troca de
    contexto por palavra sem ganhar precisão nenhuma. */
function wrapPx(str, maxW, size){
  const porLinha = Math.max(1, Math.floor(maxW / (size + 1)));
  const out = [];
  for (const para of String(str).split('\n')){
    let line = '';
    for (const word of para.split(' ')){
      const t = line ? line + ' ' + word : word;
      if (t.length > porLinha && line){ out.push(line); line = word; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

function wrapUI(str, maxW, size){
  ctx.save(); ctx.font = FONT_UI(size);
  const out = [];
  for (const para of String(str).split('\n')){
    let line = '';
    for (const word of para.split(' ')){
      const t = line ? line + ' ' + word : word;
      if (ctx.measureText(t).width > maxW && line){ out.push(line); line = word; }
      else line = t;
    }
    out.push(line);
  }
  ctx.restore();
  return out;
}
