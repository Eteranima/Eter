/* ===================================================================
   13b. CENAS — motor de eventos scriptados
   -------------------------------------------------------------------
   Uma cena é uma LISTA DE COMANDOS executada em ordem, com o input do
   jogador travado. Cada comando é um objeto `{do:'...'}` e o motor só
   passa para o próximo quando o atual termina.

   É isto que separa "NPC parado soltando caixa de texto" de direção
   cinematográfica: aqui o personagem anda sozinho, a câmera larga o
   jogador, a tela ganha barras e o texto entra na hora certa.

   Exemplo mínimo:
     SCENES.exemplo = {
       bars:true, flag:'viu_exemplo',
       cmds:[
         {do:'cam',  who:'Kael Archimedes', speed:3},
         {do:'move', who:'Kael Archimedes', to:[19,14]},
         {do:'face', who:'Kael Archimedes', dir:'player'},
         {do:'say',  who:'Kael Archimedes', text:'Você demorou.'},
         {do:'cam',  release:true},
       ],
     };

   COMANDOS
     say    {who, text, portrait} | {lines:[…]}   fala (delega ao Msg)
     wait   {s}                                   pausa, em segundos
     move   {who, to:[x,y]|dir+steps|path:[…]}    anda
            · `to` aceita função (G) => [x,y], resolvida na hora
            · {gap:1} para uma casa antes do destino
            · {wait:false} não bloqueia — use `sync` depois
            · {party:false} o jogador anda sem arrastar o grupo
     face   {who, dir}      dir aceita 'player' para virar-se ao jogador
     sync   {}                                    espera os movimentos soltos
     cam    {who} | {to:[x,y]} | {release:true}   foco da câmera (speed: 1-6)
     bars   {on}                                  barras de cinema
     fade   {}                                    escurece e volta
     warp   {map, x, y, dir}                      troca de mapa com fade
     flash  {color, s} · shake {mag, s} · sfx {id} · bgm {id}
     flag   {k, v}                                grava em G.flags
     banner {text}
     battle {foes:[…], boss}                      luta e VOLTA para a cena
     run    {fn}                                  escotilha de fuga

   DISPARO
     MAPS[id].onEnter  = {scene, flag}            ao entrar no mapa
     MAPS[id].triggers = [{x, y, scene, flag}]    ao pisar no tile
   O `flag` faz a cena tocar UMA vez: ao terminar ela é gravada, e o
   save volta com o mundo já sabendo disso.

   Segurar/apertar CANCELAR liga o avanço rápido (3×) — cena longa não
   pode virar pedágio em quem já viu.
   =================================================================== */
const SCENES = {};

/** Resolve o "who" de um comando para um ator com tx/ty/px/py/dir. */
function cutActor(who){
  if (who == null || who === 'player' || who === 'lider') return G.player;
  if (typeof who === 'number') return G.followers[who] || null;
  return G.map?.npcs.find(n => n.name === who)
      || (G.map?.boss?.name === who ? G.map.boss : null);
}

/* Caminho em L, desviando pelo eixo livre quando o preferido está
   bloqueado. Não é A*: se encurralar, entrega o que conseguiu andar em
   vez de travar a cena — numa cutscene, chegar perto e continuar é
   sempre melhor que congelar o jogo. */
function cutPath(a, tx, ty, max = 80){
  const out = [];
  let x = a.tx, y = a.ty, guarda = 0;
  while ((x !== tx || y !== ty) && guarda++ < max){
    const dx = tx - x, dy = ty - y;
    const h = dx > 0 ? 'right' : dx < 0 ? 'left' : null;
    const v = dy > 0 ? 'down'  : dy < 0 ? 'up'   : null;
    const ordem = Math.abs(dx) >= Math.abs(dy) ? [h, v] : [v, h];
    let andou = false;
    for (const d of ordem){
      if (!d) continue;
      const [ux, uy] = DIRV[d];
      if (isSolid(x + ux, y + uy)) continue;
      x += ux; y += uy; out.push(d); andou = true; break;
    }
    if (!andou) break;
  }
  return out;
}

const CUT_CMD = {
  wait:{
    start(){ this.st.t = 0; },
    update(c, dt){ this.st.t += dt; return this.st.t >= (c.s ?? 0.5); },
  },

  say:{
    start(c){
      this.st.pronto = false;
      const ator = cutActor(c.who);
      /* Uma fala roteirizada de NPC segue a mesma composição da interação
         livre: líder à esquerda, interlocutor à direita. Cenas que já
         declararam participantes (inclusive `[]` deliberado) continuam
         soberanas, assim como falas do próprio jogador e narração. */
      const participants = c.participants !== undefined ? c.participants
        : ator && ator !== G.player && !G.followers.includes(ator) && ator.sheet
          ? npcDialogueParticipants(ator)
          : undefined;
      const context = participants !== undefined ? {participants} : {};
      const linhas = c.lines
        ? c.lines.map(l => normalizeLine(l, {name:c.who, portrait:c.portrait}, context))
        /* Copia o comando inteiro antes de normalizar: uma cena de uma
           linha também pode declarar `participants`, `simultaneous` ou
           `dialogSprite`, sem perder a apresentação cinematográfica. */
        : [normalizeLine({...c, text:c.text || '', speaker:c.who ?? c.speaker ?? '',
                          portrait:c.portrait}, null, context)];
      Msg.start(linhas, () => { this.st.pronto = true; });
    },
    update(){ return this.st.pronto; },
  },

  move:{
    start(c){
      const a = cutActor(c.who);
      if (!a){ this.st.mv = null; return; }
      let dirs = [];
      if (c.path) dirs = c.path.slice();
      else if (c.to){
        const alvo = typeof c.to === 'function' ? c.to(G) : c.to;
        dirs = cutPath(a, alvo[0], alvo[1]);
      } else if (c.dir) dirs = Array(Math.max(1, c.steps ?? 1)).fill(c.dir);
      if (c.gap) dirs = dirs.slice(0, Math.max(0, dirs.length - c.gap));
      const mv = {
        a, dirs, i:0, done:dirs.length === 0,
        dur:c.dur ?? (a === G.player ? MOVE_DUR : MOVE_DUR * 1.3),
        party:a === G.player && c.party !== false,
      };
      this.movers.push(mv);
      this.st.mv = mv;
    },
    update(c){ return c.wait === false ? true : !this.st.mv || this.st.mv.done; },
  },

  face:{
    start(c){
      const a = cutActor(c.who); if (!a) return;
      if (c.dir === 'player' || c.dir === 'jogador'){
        const dx = G.player.tx - a.tx, dy = G.player.ty - a.ty;
        a.dir = Math.abs(dx) >= Math.abs(dy)
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up');
      } else if (typeof c.dir === 'string' && DIRV[c.dir]) a.dir = c.dir;
    },
    update(){ return true; },
  },

  sync:{ update(){ return this.movers.every(m => m.done); } },

  cam:{
    start(c){
      if (c.release){ this.cam = null; return; }
      this.cam = {
        actor: c.who != null ? cutActor(c.who) : null,
        tx:c.to?.[0], ty:c.to?.[1],
        speed:clamp(c.speed ?? 3, 0.5, 6),
      };
    },
    update(c, dt){
      if (c.release || c.wait === false || !this.cam) return true;
      const f = this.focus(); if (!f) return true;
      const m = G.map; if (!m) return true;
      /* Rede de segurança: se por qualquer motivo a câmera não convergir,
         a cena segue em 3s em vez de travar o jogo para sempre. */
      this.st.t = (this.st.t || 0) + dt;
      if (this.st.t > 3) return true;
      /* Mapa menor que a tela fica CENTRADO e nunca alcança o alvo —
         era exatamente aqui que a espera viraria trava. */
      const fixX = m.w * TILE <= W, fixY = m.h * TILE <= H;
      const gx = fixX ? (m.w * TILE - W) / 2 : clamp(f.px - W / 2 + TILE / 2, 0, m.w * TILE - W);
      const gy = fixY ? (m.h * TILE - H) / 2 : clamp(f.py - H / 2 + TILE / 2, 0, m.h * TILE - H);
      return (fixX || Math.abs(G.camera.x - gx) < 8)
          && (fixY || Math.abs(G.camera.y - gy) < 8);
    },
  },

  bars:{
    start(c){ this.barsOn = c.on !== false; },
    update(c){ return c.on !== false ? this.bars >= 0.99 : this.bars <= 0.01; },
  },

  fade:{
    start(c){ FX.fade(() => c.then?.(G)); },
    update(){ return !FX.trans; },
  },

  warp:{
    start(c){
      this.st.pronto = false;
      FX.fade(() => {
        loadMap(c.map, c.x, c.y, c.dir);
        for (const n of G.map.npcs) n.busy = true;   // a cena continua no comando
        this.cam = null;
        this.st.pronto = true;
      });
    },
    update(){ return !FX.trans && this.st.pronto; },
  },

  flash:{ start(c){ FX.flash(c.color || '#c8b0ff', c.s ?? 0.4); }, update(){ return true; } },
  shake:{ start(c){ FX.shake(c.mag ?? 6, c.s ?? 0.4); },          update(){ return true; } },
  sfx:{   start(c){ Sound.sfx(c.id); },                            update(){ return true; } },
  bgm:{   start(c){ c.id ? Sound.bgm(c.id) : Sound.stopBgm(); },   update(){ return true; } },
  flag:{  start(c){ G.flags[c.k] = c.v ?? true; },                 update(){ return true; } },
  banner:{start(c){ showBanner(c.text || ''); },                   update(){ return true; } },
  run:{   start(c){ c.fn?.(G); },                                  update(){ return true; } },

  battle:{
    start(c){
      this.st.pronto = false;
      Battle.onFinish = () => {
        Battle.onFinish = null;
        G.scene = 'CUTSCENE';
        this.st.pronto = true;
      };
      FX.battleWipe(() => Battle.begin(c.foes || [], {boss:!!c.boss}));
    },
    update(){ return this.st.pronto; },
  },
};

const Cut = {
  active:false, id:null, cmds:[], i:0, cur:null, st:null,
  movers:[], cam:null, bars:0, barsOn:false, fast:false,
  onEnd:null, flagFim:null, pending:null,

  /** Enfileira uma cena para começar assim que o campo assumir.
      Não atropela uma já na fila: duas cenas no mesmo quadro (entrar no
      mapa E entregar missão) fariam a primeira sumir sem tocar. */
  queue(id){
    if (!SCENES[id]){ console.warn('[cena] fila para cena inexistente:', id); return false; }
    if (this.pending) return false;
    this.pending = id; return true;
  },

  play(id, onEnd){
    const sc = SCENES[id];
    if (!sc){ console.warn('[cena] inexistente:', id); onEnd?.(); return false; }
    if (this.active) return false;
    this.active = true; this.id = id;
    this.cmds = sc.cmds.slice(); this.i = 0; this.cur = null; this.st = null;
    this.movers = []; this.cam = null; this.fast = false;
    this.barsOn = !!sc.bars; this.flagFim = sc.flag || null;
    this.onEnd = onEnd || null;
    G.scene = 'CUTSCENE';
    if (G.map) for (const n of G.map.npcs) n.busy = true;   // congela a perambulação
    return true;
  },

  /** Fim normal: grava a flag de "já vi" e devolve o controle. */
  stop(){ this._encerrar(true); },
  /** Fim anormal (game over no meio): NÃO grava a flag, senão a cena
      seria pulada para sempre por causa de uma derrota. */
  abort(){ this._encerrar(false); },

  _encerrar(gravarFlag){
    if (!this.active) return;
    if (gravarFlag && this.flagFim) G.flags[this.flagFim] = true;
    this.active = false; this.cur = null; this.st = null;
    this.cmds = []; this.movers = []; this.cam = null;
    this.barsOn = false; this.fast = false;
    if (G.map) for (const n of G.map.npcs) n.busy = false;
    if (Battle.onFinish) Battle.onFinish = null;
    G.scene = 'FIELD';
    const cb = this.onEnd; this.onEnd = null; this.flagFim = null;
    if (gravarFlag) cb?.();
  },

  /** Alvo da câmera durante a cena, ou null para "segue o jogador". */
  focus(){
    if (!this.active || !this.cam) return null;
    const c = this.cam;
    return {
      px: c.actor ? c.actor.px : (c.tx ?? 0) * TILE,
      py: c.actor ? c.actor.py : (c.ty ?? 0) * TILE,
      speed: c.speed,
    };
  },

  updateMovers(dt){
    for (const mv of this.movers){
      if (mv.done) continue;
      const a = mv.a;
      if (a.moving){ updateMover(a, dt, mv.dur); continue; }
      if (mv.i >= mv.dirs.length){ mv.done = true; continue; }
      const d = mv.dirs[mv.i++];
      if (mv.party) tryStep(d);
      else {
        a.dir = d;
        const [dx, dy] = DIRV[d];
        const nx = a.tx + dx, ny = a.ty + dy;
        if (isSolid(nx, ny)){ mv.done = true; continue; }
        a.fromX = a.tx; a.fromY = a.ty; a.tx = nx; a.ty = ny;
        a.moving = true; a.moveT = 0;
      }
      if (!a.moving) mv.done = true;   // bloqueado por alguém: encerra sem travar
    }
    // o grupo acompanha o líder mesmo fora do updateField
    G.followers.forEach(f => updateMover(f, dt, MOVE_DUR));
  },

  update(dt){
    if (!this.active) return;
    if (Input.pressed('cancel')) this.fast = !this.fast;
    if (this.fast || Input.isDown('run')) dt *= 3;

    this.bars = clamp(this.bars + (this.barsOn ? dt : -dt) * 4, 0, 1);
    this.updateMovers(dt);
    updateCamera(dt);
    if (G.banner.t > 0) G.banner.t -= dt;

    /* Comandos instantâneos (flag, sfx, face…) resolvem vários por
       quadro; o `guarda` evita que uma cena mal formada rode em laço. */
    let guarda = 0;
    while (this.active && guarda++ < 64){
      if (!this.cur){
        if (this.i >= this.cmds.length){ this.stop(); return; }
        this.cur = this.cmds[this.i++];
        this.st = {};
        const h = CUT_CMD[this.cur.do];
        if (!h){ console.warn('[cena] comando desconhecido:', this.cur.do); this.cur = null; continue; }
        h.start?.call(this, this.cur);
        if (!this.active) return;                 // um comando pode ter encerrado tudo
        if (G.scene !== 'CUTSCENE') return;       // say/battle/warp assumiram a cena
      }
      const h = CUT_CMD[this.cur.do];
      const pronto = h.update ? h.update.call(this, this.cur, dt) : true;
      if (!pronto) break;
      this.cur = null;
    }
  },

  draw(){
    if (this.bars <= 0.01) return;
    const h = Math.round(56 * easeOut(this.bars));
    ctx.save();
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, W, h);
    ctx.fillRect(0, H - h, W, h);
    ctx.strokeStyle = 'rgba(120,86,200,.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h + .5); ctx.lineTo(W, h + .5);
    ctx.moveTo(0, H - h - .5); ctx.lineTo(W, H - h - .5); ctx.stroke();
    ctx.restore();
    if (this.active && this.fast)
      pxText('▶▶', W - 14, H - 18, {size:8, color:'#7a6a9a', align:'right'});
  },
};
