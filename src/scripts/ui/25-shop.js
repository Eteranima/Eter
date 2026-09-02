/* ===================================================================
   9d. LOJA
   =================================================================== */
const SELL_RATE = 0.5;
const Shop = {
  id:null, mode:'buy', cur:{buy:{i:0}, sell:{i:0}}, msg:'', msgT:0, prev:'FIELD',

  open(id){
    if (!SHOPS[id]) return;
    this.id = id; this.mode = 'buy'; this.cur.buy.i = 0; this.cur.sell.i = 0;
    this.msg = ''; this.msgT = 0;
    this.prev = G.scene === 'DIALOGUE' ? 'FIELD' : G.scene;
    G.scene = 'SHOP'; Sound.sfx('confirm');
  },
  close(){ G.scene = this.prev || 'FIELD'; Sound.sfx('cancel'); },
  toast(t){ this.msg = t; this.msgT = 2; },

  get shop(){ return SHOPS[this.id]; },
  /** Estoque visível: entradas travadas por flag só aparecem depois. */
  stock(){
    return this.shop.stock
      .map(e => typeof e === 'string' ? {id:e} : e)
      .filter(e => !e.need || G.flags[e.need])
      .map(e => e.id)
      .filter(id => ITEMS[id]);
  },
  sellable(){ return Bag.list(); },
  priceOf(id){ return ITEMS[id].price ?? 0; },
  sellPrice(id){ return Math.floor((ITEMS[id].price ?? 0) * SELL_RATE); },

  tab:0, qtd:1,

  /** Lista já filtrada pela aba atual. */
  listaAtual(){
    const base = this.mode === 'buy' ? this.stock() : this.sellable();
    const f = SHOP_TABS[this.tab].filtro;
    return base.filter(id => f(ITEMS[id]));
  },

  update(dt){
    if (this.msgT > 0) this.msgT -= dt;
    if (Input.pressed('cancel') || Input.pressed('menu')) return this.close();
    // TAB alterna comprar/vender · ◄ ► trocam a categoria
    if (Input.pressed('swap')){
      this.mode = this.mode === 'buy' ? 'sell' : 'buy';
      this.qtd = 1; Sound.sfx('cursor');
    }
    if (Input.pressed('right')){ this.tab = (this.tab + 1) % SHOP_TABS.length; this.qtd = 1; Sound.sfx('cursor'); }
    if (Input.pressed('left')){ this.tab = (this.tab + SHOP_TABS.length - 1) % SHOP_TABS.length; this.qtd = 1; Sound.sfx('cursor'); }

    const lista = this.listaAtual();
    const cur = this.cur[this.mode];
    const antes = cur.i;
    navList(cur, Math.max(1, lista.length), 1, false);   // ◄► já trocam de aba
    if (cur.i !== antes) this.qtd = 1;
    if (!lista.length) return;
    const id = lista[cur.i % lista.length], it = ITEMS[id];

    // quantidade: equipamento é sempre 1
    const maxQ = it.kind === 'equip' ? 1
      : this.mode === 'buy' ? Math.max(1, Math.min(99, Math.floor(G.gold / Math.max(1, this.priceOf(id)))))
      : Bag.count(id);
    if (Input.pressed('up') === false && Input.pressed('down') === false){ /* nav já tratou */ }
    if (Input.isDown('run')){                       // Shift + ◄► ajusta a quantidade
      if (Input.pressed('right')) this.qtd = clamp(this.qtd + 1, 1, maxQ);
      if (Input.pressed('left'))  this.qtd = clamp(this.qtd - 1, 1, maxQ);
    }
    this.qtd = clamp(this.qtd, 1, Math.max(1, maxQ));

    if (Input.pressed('confirm')){
      if (this.mode === 'buy'){
        const total = this.priceOf(id) * this.qtd;
        if (G.gold < total){ Sound.sfx('deny'); this.toast('Ouro insuficiente.'); return; }
        G.gold -= total; Bag.add(id, this.qtd); Sound.sfx('chest');
        this.toast(`Comprou ${it.name}${this.qtd > 1 ? ` ×${this.qtd}` : ''}.`);
      } else {
        const total = this.sellPrice(id) * this.qtd;
        if (!Bag.take(id, this.qtd)){ Sound.sfx('deny'); return; }
        G.gold += total; Sound.sfx('confirm');
        this.toast(`Vendeu ${it.name}${this.qtd > 1 ? ` ×${this.qtd}` : ''} por ${total}₢.`);
        const rest = this.listaAtual();
        if (cur.i >= rest.length) cur.i = Math.max(0, rest.length - 1);
      }
      this.qtd = 1;
    }
  },

  draw(){
    drawField();
    ctx.fillStyle = 'rgba(4,4,10,.72)'; ctx.fillRect(0, 0, W, H);
    panel(20, 20, W - 40, H - 40);
    pxText(this.shop.name, 42, 52, {size:11, color:'#b89aff'});
    pxText(`${G.gold}₢`, W - 42, 52, {size:10, color:'#eaca3a', align:'right'});
    pxText(this.mode === 'buy' ? 'COMPRAR' : 'VENDER', 42, 74,
           {size:9, color:this.mode === 'buy' ? '#7ada7a' : '#eaca3a'});
    uiText('TAB comprar/vender · ◄► categoria · Shift+◄► quantidade · X sai',
           W - 42, 74, {size:11, color:'#5a4a7a', align:'right'});

    // abas de categoria
    SHOP_TABS.forEach((t, i) => {
      const on = this.tab === i, x = 42 + i * 104;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.3)'; ctx.fillRect(x - 8, 84, 98, 24); }
      pxText(t.nome, x, 100, {size:8, color:on ? '#fff' : '#6a5a8a'});
    });

    const lista = this.listaAtual();
    const cur = this.cur[this.mode];
    if (!lista.length){
      uiText(this.mode === 'buy' ? 'Nada nesta categoria.' : 'Nada para vender aqui.',
             42, 150, {size:14, color:'#6a5a8a'});
      this.drawToast(); return;
    }
    const idx = cur.i % lista.length;
    const vis = 8, ini = clamp(idx - 3, 0, Math.max(0, lista.length - vis));
    lista.slice(ini, ini + vis).forEach((id, k) => {
      const i = ini + k, it = ITEMS[id], y = 142 + k * 30, on = idx === i;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.22)'; ctx.fillRect(34, y - 17, 430, 26); }
      drawItemMark(it, 40, y - 4);
      pxText(it.name, 66, y, {size:8, color:on ? '#fff' : '#a89ac0'});
      const preco = this.mode === 'buy' ? this.priceOf(id) : this.sellPrice(id);
      pxText(`${preco}₢`, 400, y, {size:8, color:'#eaca3a', align:'right'});
      const tem = Bag.count(id);
      if (tem) pxText(`×${tem}`, 452, y, {size:7, color:'#6a5a8a', align:'right'});
    });

    // painel de detalhe do item selecionado
    const id = lista[idx], sel = ITEMS[id];
    const dx = 486, dw = W - 486 - 34;
    panel(dx, 130, dw, H - 130 - 96, {alpha:.55, accent:'#4a3a6a'});
    /* A marca grande do detalhe só entra quando há ÍCONE: o quadradinho
       de cor do fallback é pequeno demais para justificar o recuo e
       acabava desenhado por cima do nome do item. */
    if (sel.icon) drawItemMark(sel, dx + 16, 152, 32);
    pxText(sel.name, dx + (sel.icon ? 54 : 16), 158, {size:9, color:sel.color || '#d0c8e0'});
    wrapUI(sel.desc || '', dw - 32, 12).forEach((ln, k) =>
      uiText(ln, dx + 16, 180 + k * 18, {size:12, color:'#8a7aaa'}));

    if (sel.equip){
      // comparação com o que cada um já usa
      pxText('SE EQUIPAR:', dx + 16, 244, {size:7, color:'#6a5a8a'});
      const slot = sel.slot;
      G.party.forEach((c, i) => {
        const y = 266 + i * 26;
        const atual = ITEMS[c.gear[slot]];
        const delta = ['atk','def','spd','hp','mp'].map(k => {
          const n = (sel.equip[k] || 0) - (atual?.equip?.[k] || 0);
          return n ? `${k.toUpperCase()}${n > 0 ? '+' : ''}${n}` : null;
        }).filter(Boolean);
        const bom = delta.some(d => d.includes('+'));
        pxText(c.name, dx + 16, y, {size:7, color:ELEM[c.element].glow});
        pxText(delta.length ? delta.join(' ') : 'sem mudança',
               dx + dw - 16, y, {size:7, align:'right',
               color:delta.length ? (bom ? '#7ada7a' : '#da8a8a') : '#5a4a6a'});
      });
      let ey = 266 + G.party.length * 26 + 8;
      if (sel.equip.elem){
        pxText(`ataque básico: ${ELEM[sel.equip.elem].name}`, dx + 16, ey,
               {size:7, color:ELEM[sel.equip.elem].glow});
        ey += 18;
      }
      // resistência elemental e bônus de mecânica (Conjunta / Postura)
      if (sel.equip.resist){
        for (const [el, m] of Object.entries(sel.equip.resist)){
          pxText(`${ELEM[el].icon} ${ELEM[el].name} ${Math.round((1 - m) * 100)}% menos dano`,
                 dx + 16, ey, {size:7, color:ELEM[el].glow});
          ey += 16;
        }
      }
      if (sel.equip.combo){
        pxText(`Conjunta custa ${-sel.equip.combo} MP a menos`, dx + 16, ey, {size:7, color:'#b89aff'});
        ey += 16;
      }
      if (sel.equip.poiseUp){
        pxText(`dano de Postura +${Math.round(sel.equip.poiseUp * 100)}%`, dx + 16, ey, {size:7, color:'#ffd24a'});
        ey += 16;
      }
    } else {
      // quantidade, só para consumível
      const preco = this.mode === 'buy' ? this.priceOf(id) : this.sellPrice(id);
      pxText(`quantidade  < ${this.qtd} >`, dx + 16, 262, {size:9, color:"#fff"});
      pxText(`total ${preco * this.qtd}₢`, dx + 16, 288, {size:9, color:'#eaca3a'});
      if (this.mode === 'buy')
        pxText(`sobra ${G.gold - preco * this.qtd}₢`, dx + 16, 312,
               {size:8, color:G.gold >= preco * this.qtd ? '#6a5a8a' : '#da6a6a'});
    }
    this.drawToast();
  },

  drawToast(){
    if (this.msgT <= 0) return;
    const w = Math.max(240, this.msg.length * 8 + 40);
    panel(W / 2 - w / 2, H - 62, w, 36, {accent:'#7a5aba'});
    pxText(this.msg, W / 2, H - 38, {size:8, color:'#dcd0ff', align:'center'});
  },
};

function fmtTime(s){
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = Math.floor(s % 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

/** Aplica um item de cura/revive. Retorna {ok, text|why}. */
function applyItem(it, c){
  if (it.revive){
    if (c.hp > 0) return {ok:false, why:`${c.name} não está caído.`};
    c.hp = Math.max(1, Math.floor(c.maxHp * it.revive)); c.ail = [];
    return {ok:true, text:`${c.name} voltou a si!`};
  }
  if (c.hp <= 0) return {ok:false, why:`${c.name} está caído.`};
  const parts = [];
  /* `hpPct` cura uma FRAÇÃO do máximo. Existe porque um número fixo
     envelhece: 180 HP é generoso no nível 5 e irrelevante no 25. */
  const curaHp = (it.hp || 0) + (it.hpPct ? Math.round(c.maxHp * it.hpPct) : 0);
  if (curaHp){
    if (c.hp >= c.maxHp) return {ok:false, why:`${c.name} está com HP cheio.`};
    const heal = Math.min(curaHp, c.maxHp - c.hp); c.hp += heal; parts.push(`+${heal} HP`);
  }
  const curaMp = (it.mp || 0) + (it.mpPct ? Math.round(c.maxMp * it.mpPct) : 0);
  if (curaMp){
    if (c.mp >= c.maxMp && !parts.length) return {ok:false, why:`${c.name} está com MP cheio.`};
    const g = Math.min(curaMp, c.maxMp - c.mp); c.mp += g; if (g) parts.push(`+${g} MP`);
  }
  if (it.cure){
    if (!c.ail.length && !parts.length) return {ok:false, why:`${c.name} não tem condições.`};
    if (c.ail.length) parts.push('condições removidas');
    c.ail = [];
  }
  if (it.reso !== undefined){
    if ((c.reso || 0) >= 100 && !parts.length) return {ok:false, why:`${c.name} já ressoa.`};
    const g = Math.min(it.reso, 100 - (c.reso || 0));
    c.reso = clamp((c.reso || 0) + it.reso, 0, 100);
    if (g > 0) parts.push(`+${g}% Ressonância`);
  }
  if (it.buff){
    c.buffs = c.buffs || [];
    for (const [stat, mult] of Object.entries(it.buff)){
      if (stat === 'turns') continue;
      /* +1 turno igual às habilidades de buff: a rodada em que o item é
         usado consome um tick, então sem o +1 o "3 turnos" da descrição
         seria mentira. */
      c.buffs.push({stat, mult, turns:(it.buff.turns || 3) + 1});
    }
    parts.push('reforçado');
  }
  if (!parts.length) return {ok:false, why:`${c.name} não precisa disso agora.`};
  return {ok:true, text:`${c.name}: ${parts.join(', ')}`};
}
