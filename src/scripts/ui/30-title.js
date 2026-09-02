/* ===================================================================
   13. TELA DE TÍTULO
   =================================================================== */
/* --- Tela inicial: seleção de slot (v5.26) --------------------------

   Três slots, cada um com o cabeçalho do jogo que guarda. Escolher um
   slot vazio começa jogo novo NELE; escolher um cheio continua dali.

   O slot vira `Save.slot` ANTES de qualquer coisa acontecer — é o que
   garante que um jogo novo escreva no slot que a pessoa apontou, e não
   por cima do que estava no slot 0. */
/* --- Código secreto do Modo Mestre (v5.32) ---------------------------
   3× baixo, 2× cima, 2× baixo, em até 15s, usando as mesmas setas que já
   navegam a lista de saves — nenhuma tecla nova, nenhum menu escondido.
   Acertar arma `GM_PENDENTE`; a ativação de verdade (`ativarGameMaster`,
   em `engine/16-save-state.js`) só acontece quando a partida está
   pronta — depois de `loadFromSave` ou de `newGame`, não aqui. */
const GM_CODIGO = ['down','down','down','up','up','down','down'];
const GM_JANELA_MS = 15000;
let gmBuffer = [];
let GM_PENDENTE = false;

function verificarCodigoMestre(){
  const agora = Date.now();
  const dir = Input.pressed('down') ? 'down' : Input.pressed('up') ? 'up' : null;
  if (dir){
    gmBuffer.push({dir, t:agora});
    const cauda = gmBuffer.slice(-GM_CODIGO.length).map(e => e.dir);
    if (cauda.length === GM_CODIGO.length &&
        cauda.every((d, i) => d === GM_CODIGO[i])){
      GM_PENDENTE = true;
      gmBuffer = [];
      Sound.sfx('confirm');
    }
  }
  // a janela desliza: toque parado por 15s some do buffer sozinho
  gmBuffer = gmBuffer.filter(e => agora - e.t <= GM_JANELA_MS);
}

const Title = {
  cur:{i:0}, apagarArm:0, apagarAlvo:-1,

  refresh(){
    this.cur.i = 0;
    this.apagarArm = 0; this.apagarAlvo = -1;
    /* Abre no último slot usado, se ele tiver jogo. Voltar ao título
       para trocar de save e cair sempre no slot 1 seria hostil. */
    if (Save.exists(Save.slot)) this.cur.i = Save.slot;
  },

  slots(){ return Array.from({length:SAVE_SLOTS}, (_, i) => Save.resumo(i)); },

  update(dt){
    if (this.apagarArm > 0) this.apagarArm -= dt;
    verificarCodigoMestre();
    navList(this.cur, SAVE_SLOTS);
    const i = this.cur.i % SAVE_SLOTS;

    /* Apagar pede duas confirmações e o segundo toque só vale para o
       MESMO slot: um save de trinta horas não se perde num toque. */
    if (Input.pressed('reset')){
      if (!Save.exists(i)){ Sound.sfx('deny'); return; }
      if (this.apagarArm > 0 && this.apagarAlvo === i){
        Save.erase(i); Sound.sfx('deny');
        this.apagarArm = 0; this.apagarAlvo = -1;
      } else {
        this.apagarArm = 2.5; this.apagarAlvo = i; Sound.sfx('deny');
      }
      return;
    }

    if (Input.pressed('confirm')){
      Sound.init(); Sound.resume(); Sound.sfx('confirm');
      Save.slot = i;
      const s = Save.read(i);
      FX.fade(() => {
        if (s){
          loadFromSave(s);
          if (GM_PENDENTE){ ativarGameMaster(); GM_PENDENTE = false; }
          G.scene = 'FIELD';
          return;
        }
        Escolha.open();     // slot vazio: passa pela escolha do protagonista
      });
    }
  },

  draw(){
    const t = Date.now();
    const g = ctx.createRadialGradient(W / 2, H / 2 - 40, 30, W / 2, H / 2, 460);
    g.addColorStop(0, '#1e1236'); g.addColorStop(1, '#07070c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 46; i++){
      const a = (i * 137.5 + t / 40) % 360, r = 90 + (i * 37) % 300;
      const x = W / 2 + Math.cos(a * Math.PI / 180) * r;
      const y = H / 2 + Math.sin(a * Math.PI / 180) * r * .55;
      ctx.globalAlpha = .12 + Math.sin(t / 700 + i) * .1;
      ctx.fillStyle = ['#b89aff','#5a8afa','#ff8844','#88ccff','#ffe44a'][i % 5];
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
    pxText('ÉTER ANIMA', W / 2, 130, {size:24, color:'#b89aff', align:'center', glow:'#7a4aca', blur:26});
    pxText('Stone Reach Academy', W / 2, 166, {size:9, color:'#6a5a8a', align:'center'});

    const cx = W / 2 - 230, larg = 460, alt = 84;
    this.slots().forEach((r, i) => {
      const y = 216 + i * (alt + 12), on = this.cur.i % SAVE_SLOTS === i;
      Clique.add(cx, y, larg, alt, Clique.escolher(this.cur, i));
      const sob = Clique.emCima(cx, y, larg, alt);
      panel(cx, y, larg, alt, {accent:on ? '#b89aff' : '#3a3450'});
      if (on || sob){
        ctx.fillStyle = on ? 'rgba(120,86,200,.20)' : 'rgba(120,86,200,.10)';
        ctx.fillRect(cx + 4, y + 4, larg - 8, alt - 8);
      }
      pxText(String(i + 1), cx + 26, y + 48, {size:16, color:on ? '#ffe44a' : '#5a4a7a'});

      if (r.vazio){
        pxText('Novo Jogo', cx + 62, y + 40, {size:11, color:on ? '#fff' : '#7a6a9a'});
        uiText('slot vazio', cx + 62, y + 62, {size:12, color:'#5a4a7a'});
      } else {
        pxText(`${r.nome} · Nv${r.lvl}`, cx + 62, y + 34,
               {size:10, color:on ? '#fff' : '#9a8ab0'});
        uiText(r.mapa, cx + 62, y + 56, {size:12, color:'#8a7aa8'});
        uiText(`${r.grupo} no grupo · ${fmtTime(r.playtime)}`, cx + 62, y + 74,
               {size:11, color:'#5a4a7a'});
        const d = new Date(r.at);
        uiText(r.at ? d.toLocaleDateString() : '', cx + larg - 16, y + 74,
               {size:11, color:'#5a4a7a', align:'right'});
        pxText('v' + r.v, cx + larg - 16, y + 34, {size:7, color:'#4a4068', align:'right'});
      }
    });

    const aviso = this.apagarArm > 0
      ? `R de novo apaga o slot ${this.apagarAlvo + 1}`
      : 'Z escolhe · setas movem · R apaga o slot';
    uiText(aviso, W / 2, 534,
           {size:12, color:this.apagarArm > 0 ? '#ffa06a' : '#5a4a7a', align:'center'});
    if (!Save.available())
      uiText('Este navegador não guarda progresso — o jogo roda, mas não salva.',
             W / 2, 558, {size:11, color:'#c08a6a', align:'center'});

    if (GM_PENDENTE)
      pxText('MODO MESTRE ARMADO', W / 2, 200,
             {size:10, color:'#ffe44a', align:'center', glow:'#c9a84c', blur:14});
  },
};
