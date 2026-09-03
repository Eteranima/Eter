/* ===================================================================
   4. INPUT — teclado + toque + mouse, com detecção de borda
   =================================================================== */
const Input = {
  down:{}, hit:{}, _vk:{},
  BIND:{
    ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
    w:'up', s:'down', a:'left', d:'right', W:'up', S:'down', A:'left', D:'right',
    z:'confirm', Z:'confirm', Enter:'confirm', ' ':'confirm',
    x:'cancel', X:'cancel', Escape:'cancel', Backspace:'cancel',
    c:'menu', C:'menu',
    /* Atalhos da HUD de campo: cada um abre o menu direto na página.
       v5.22: `m` virou MAPA, que é o que a tecla quer dizer em todo
       metroidvania. O mudo, que morava nela desde o começo, mudou para
       `n` — perder o atalho de som é menos custoso que ensinar o mundo
       inteiro que aqui M não abre mapa. */
    m:'mapa',    M:'mapa',
    n:'mute',    N:'mute',
    i:'bolsa',   I:'bolsa',
    k:'arvore',  K:'arvore',
    j:'missoes', J:'missoes',
    u:'status',  U:'status',
    r:'reset', R:'reset',        // redefinir a árvore de habilidades
    p:'pin', P:'pin',            // fixar/desafixar item na loja (favoritos)
    /* Zoom e centralizar, do grimório. Ficam em teclas que nenhuma
       outra tela usa, para que valham em qualquer lugar que venha a
       precisar de câmera. */
    '+':'zoomIn', '=':'zoomIn', '-':'zoomOut', '_':'zoomOut',
    f:'centrar', F:'centrar',
    Tab:'swap',
    Shift:'run',
  },

  /* Teclas que disparam uma ação A MAIS da que a BIND diz.
     ESC e X são as duas o "cancelar" do jogo inteiro, e continuam
     sendo — mas o grimório precisa distinguir uma da outra, porque lá
     X REMOVE um nó e ESC sai da tela (spec §14 e §4). Em vez de
     reescrever `cancel` em vinte lugares, ESC passa a disparar também
     `sair`, e só quem se importa com a diferença escuta `sair`. */
  EXTRA:{Escape:'sair', Backspace:'sair'},
  isDown(a){ return !!this.down[a] || !!this._vk[a]; },
  pressed(a){ return !!this.hit[a]; },
  anyPressed(){ return Object.keys(this.hit).length > 0; },
  _set(a, v){
    if (v && !this.down[a]) this.hit[a] = true;
    this.down[a] = v;
  },
  vSet(a, v){
    if (v && !this._vk[a]) this.hit[a] = true;
    this._vk[a] = v;
  },
  endFrame(){
    this.hit = {};
    /* Clique é um toque instantâneo: liga a ação num quadro e solta no
       fim dele. Sem isto a ação ficaria segurada para sempre, porque o
       mouse não tem "soltar" ligado a ela. */
    if (this._soltarDepois){ this._vk[this._soltarDepois] = false; this._soltarDepois = null; }
  },

  install(){
    addEventListener('keydown', e => {
      const a = this.BIND[e.key], x = this.EXTRA[e.key];
      if (a){ e.preventDefault(); this._set(a, true); }
      if (x) this._set(x, true);
      Sound.init(); Sound.resume();
    });
    addEventListener('keyup', e => {
      const a = this.BIND[e.key], x = this.EXTRA[e.key];
      if (a) this._set(a, false);
      if (x) this._set(x, false);
    });
    addEventListener('blur', () => { this.down = {}; this._vk = {}; });

    // Botões de toque: pointer events cobrem dedo E mouse.
    const bindBtn = (el, action) => {
      const on = e => { e.preventDefault(); el.classList.add('held'); this.vSet(action, true);
                        Sound.init(); Sound.resume(); el.setPointerCapture?.(e.pointerId); };
      const off = e => { e.preventDefault(); el.classList.remove('held'); this.vSet(action, false); };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointercancel', off);
      el.addEventListener('pointerleave', off);
    };
    document.querySelectorAll('.pad[data-dir]').forEach(el => bindBtn(el, el.dataset.dir));
    document.querySelectorAll('.act[data-btn]').forEach(el => bindBtn(el, el.dataset.btn));

    /* Tela cheia fica FORA do mapa de ações do jogo de propósito: é
       comando do navegador, não do personagem, e precisa rodar dentro do
       próprio gesto de toque (um `vSet` consumido no frame seguinte já
       estaria fora do gesto e o pedido seria negado). */
    const full = document.getElementById('btn-full');
    if (full){
      if (!Tela.suportada()) document.body.classList.add('sem-fullscreen');
      full.addEventListener('pointerdown', e => {
        e.preventDefault(); full.classList.add('held');
        Sound.init(); Sound.resume(); Tela.alternar();
      });
      full.addEventListener('pointerup', () => full.classList.remove('held'));
      full.addEventListener('pointercancel', () => full.classList.remove('held'));
    }

    if (matchMedia('(hover:none), (pointer:coarse)').matches || 'ontouchstart' in window)
      document.body.classList.add('touch');
  },
};

/* ===================================================================
   4a-1. CONTROLE (Gamepad API)
   O joystick entra pela mesma porta do toque: `Input.vSet`. Assim ele
   não precisa saber o que é menu, campo ou batalha — vira direcional e
   botão, e o resto do jogo continua lendo `Input.pressed('confirm')`
   como sempre leu.

   O direcional é DISCRETO de propósito: analógico contínuo num jogo de
   grade faria o personagem andar em diagonal impossível e o cursor de
   menu disparar. A zona morta de 0,5 é alta pelo mesmo motivo — meio
   caminho do manche já é intenção clara.
   =================================================================== */
const ZONA_MORTA = 0.5;
const BOTOES_CONTROLE = {
  0:'confirm',   // A / cruz
  1:'cancel',    // B / círculo
  2:'bolsa',     // X / quadrado
  3:'arvore',    // Y / triângulo
  4:'run', 5:'run',        // os dois ombros correm: serve para canhoto
  6:'swap',      // gatilho esquerdo: troca quem anda na frente
  7:'status',    // gatilho direito
  8:'missoes',   // select / share
  9:'menu',      // start / options
  12:'up', 13:'down', 14:'left', 15:'right',   // direcional digital
};

const Controle = {
  ativo:false, _antes:{},
  /* De onde vêm os controles. Existe como método, e não como chamada
     direta a `navigator`, para o autoteste poder ligar um controle
     falso: sem isso o mapeamento de botão só seria testável com um
     joystick de verdade na mão, ou seja, nunca. */
  fonte(){ return navigator.getGamepads ? navigator.getGamepads() : []; },
  /** Lê o primeiro controle conectado e traduz para ações. */
  ler(){
    const lista = this.fonte() || [];
    let gp = null;
    for (const g of lista) if (g && g.connected){ gp = g; break; }
    const agora = {};
    if (gp){
      for (const [i, acao] of Object.entries(BOTOES_CONTROLE)){
        const b = gp.buttons[i];
        if (b && (b.pressed || b.value > 0.5)) agora[acao] = true;
      }
      // manche esquerdo tratado como direcional
      const [ex, ey] = [gp.axes[0] || 0, gp.axes[1] || 0];
      if (ex < -ZONA_MORTA) agora.left = true;
      if (ex >  ZONA_MORTA) agora.right = true;
      if (ey < -ZONA_MORTA) agora.up = true;
      if (ey >  ZONA_MORTA) agora.down = true;
    }
    this.ativo = !!gp;
    /* Só avisa o Input quando MUDA. Chamar `vSet(a, true)` todo quadro
       com o botão segurado não repetiria o `hit` (o próprio vSet trava
       isso), mas soltar precisa de um `false` explícito — senão a ação
       fica presa depois que o dedo sai. */
    const acoes = new Set([...Object.keys(agora), ...Object.keys(this._antes)]);
    for (const a of acoes){
      const v = !!agora[a];
      if (v !== !!this._antes[a]) Input.vSet(a, v);
    }
    this._antes = agora;
  },
};

/* ===================================================================
   4a-2. MOUSE — áreas clicáveis
   O jogo desenha tudo em canvas, então não existe botão para o mouse
   acertar: é preciso dizer onde as coisas estão. O registro é
   preenchido PELO DESENHO, a cada quadro, e por isso a regra sai de
   graça: só dá para clicar no que está na tela. Painel que não foi
   desenhado não registrou área nenhuma.

   O clique é resolvido no começo do quadro seguinte, contra as áreas do
   quadro anterior — que são exatamente as que o jogador estava vendo
   quando clicou.
   =================================================================== */
const Clique = {
  areas:[], x:-1, y:-1, dentro:false, segurando:false, _pend:null,
  roda:0,                          // acúmulo da roda do mouse neste quadro

  novoQuadro(){ this.areas.length = 0; this.roda = 0; },
  /** `acao` pode ser o nome de uma ação de Input ou uma função. */
  add(x, y, w, h, acao, o = {}){ this.areas.push({x, y, w, h, acao, ...o}); },
  /** A área de INTERFACE sob o ponteiro, para o desenho destacá-la e
   *  para o campo saber que ali não se anda.
   *
   *  Área marcada `fundo` não conta: o mundo se registra como uma área
   *  do tamanho da tela para receber cliques, e sem esta exceção ela
   *  responderia "sim, tem interface aqui" em todo lugar — foi o que
   *  travou o andar com o mouse na primeira volta. Para `resolver` ela
   *  continua valendo, só que por último. */
  sob(){
    if (!this.dentro) return null;
    for (let i = this.areas.length - 1; i >= 0; i--){
      const a = this.areas[i];
      if (a.fundo) continue;
      if (this.x >= a.x && this.x <= a.x + a.w && this.y >= a.y && this.y <= a.y + a.h) return a;
    }
    return null;
  },
  /* Clicar numa linha de lista faz o MESMO que levar o cursor até ela e
     apertar confirmar. Um caminho só de decisão: o clique não sabe o que
     a lista faz, só onde pôr o cursor. */
  escolher(cursor, i){
    return () => { cursor.i = i; Input.vSet('confirm', true); Input._soltarDepois = 'confirm'; };
  },
  emCima(x, y, w, h){
    return this.dentro && this.x >= x && this.x <= x + w && this.y >= y && this.y <= y + h;
  },
  /** Resolve o clique pendente. Devolve true se alguma área o consumiu. */
  resolver(){
    const p = this._pend; this._pend = null;
    if (!p) return false;
    for (let i = this.areas.length - 1; i >= 0; i--){
      const a = this.areas[i];
      if (p.x >= a.x && p.x <= a.x + a.w && p.y >= a.y && p.y <= a.y + a.h){
        if (typeof a.acao === 'function') a.acao();
        else Input.vSet(a.acao, true), Input._soltarDepois = a.acao;
        Sound.sfx('cursor');
        return true;
      }
    }
    return false;
  },

  instalar(alvo){
    const paraCanvas = e => {
      const r = alvo.getBoundingClientRect();
      return {x:(e.clientX - r.left) * (alvo.width / r.width),
              y:(e.clientY - r.top) * (alvo.height / r.height)};
    };
    alvo.addEventListener('pointermove', e => {
      const p = paraCanvas(e); this.x = p.x; this.y = p.y; this.dentro = true;
    });
    alvo.addEventListener('pointerleave', () => { this.dentro = false; this.segurando = false; });
    alvo.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      const p = paraCanvas(e); this.x = p.x; this.y = p.y;
      this.dentro = true; this.segurando = true; this._pend = p;
    });
    addEventListener('pointerup', () => { this.segurando = false; });
    /* Roda do mouse: guarda o acúmulo do quadro para quem quiser ler.
       Quem não lê, ignora — e o `endFrame` zera, para que uma rolada não
       valha por dois quadros. */
    alvo.addEventListener('wheel', e => { e.preventDefault(); this.roda += e.deltaY; },
                          {passive:false});
    alvo.addEventListener('contextmenu', e => {
      /* Botão direito = cancelar. Sem isto o menu do navegador abre por
         cima do jogo, que é o pior resultado possível do clique direito. */
      e.preventDefault(); Input.vSet('cancel', true); Input._soltarDepois = 'cancel';
    });
  },
};

/* ===================================================================
   4b. TELA CHEIA
   No celular a barra de endereço come 60-120px de altura, e ela é a
   diferença entre o canvas caber ou não. A API de fullscreen é a única
   forma de recuperar esse espaço — CSS não tira barra de navegador.

   Duas armadilhas conhecidas:
   - O pedido SÓ é aceito dentro de um gesto do usuário. Chamar no boot
     falha silenciosamente; por isso o gatilho é o botão ⛶ e a opção no
     menu, ambos disparados por toque.
   - iPhone não tem `requestFullscreen` em `<div>`/`<canvas>` no Safari.
     Lá o pedido simplesmente não existe — a função devolve false e a
     interface some, em vez de oferecer um botão que não faz nada.
   =================================================================== */
const Tela = {
  alvo(){ return document.documentElement; },
  suportada(){
    const e = this.alvo();
    return !!(e.requestFullscreen || e.webkitRequestFullscreen || e.mozRequestFullScreen);
  },
  ativa(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); },
  async entrar(){
    const e = this.alvo();
    const f = e.requestFullscreen || e.webkitRequestFullscreen || e.mozRequestFullScreen;
    if (!f) return false;
    try { await f.call(e); } catch(err){ return false; }
    /* Travar a orientação só funciona já em fullscreen, e só em parte
       dos Android. Falhar aqui não é erro: o jogo continua girando
       junto com o aparelho, que é o comportamento de antes. */
    try { await screen.orientation?.lock?.('landscape'); } catch(err){}
    return true;
  },
  async sair(){
    try { await (document.exitFullscreen?.call(document) ?? document.webkitExitFullscreen?.call(document)); }
    catch(err){}
    try { screen.orientation?.unlock?.(); } catch(err){}
  },
  alternar(){ return this.ativa() ? this.sair() : this.entrar(); },
};
