/* ===================================================================
   8f. MAPA DO MUNDO  (v5.22)
   ===================================================================
   Um mapa de metroidvania: as salas já visitadas desenhadas no lugar
   onde ficam UMAS EM RELAÇÃO ÀS OUTRAS, ligadas pelas passagens, com o
   grupo marcado onde está.

   O jogo nunca teve coordenadas de mundo — cada mapa é uma grade solta
   e as passagens só dizem "vá para lá". A posição de cada sala é
   DEDUZIDA daí: a porta fica em (x,y) da sala de origem e leva à casa
   (tx,ty) da sala de destino, então a de destino tem de ficar onde
   aquela casa encoste na porta, do lado para onde a porta aponta. Isso
   dá um mapa espacialmente honesto sem escrever um único número de
   posição à mão — e continua honesto se alguém acrescentar uma sala. */

/** Casas de passagem de um mapa, na MESMA ordem que `loadMap` usa. */
function varrerPassagens(def){
  const linhas = (def.grid || def.rows || []).map(String);
  const out = [];
  for (let y = 0; y < linhas.length; y++)
    for (let x = 0; x < linhas[y].length; x++){
      const t = TILEDEF[linhas[y][x]];
      if (t && t.warp) out.push({x, y});
    }
  return out;
}

/** Passagens de um mapa com origem e destino, sem precisar carregá-lo. */
function ligacoesDoMapa(id){
  const def = MAPS[id]; if (!def) return [];
  const tiles = varrerPassagens(def);
  return (def.warps || [])
    .map((wp, i) => tiles[i] ? {...wp, ...tiles[i]} : null)
    .filter(w => w && MAPS[w.to]);
}

function tamanhoDoMapa(def){
  const linhas = (def.grid || def.rows || []).map(String);
  return {w: Math.max(1, ...linhas.map(l => l.length)), h: Math.max(1, linhas.length)};
}

/* O layout é o mesmo em toda partida — os mapas são dados fixos — então
   vale calcular uma vez. Invalidar não é preciso: `MAPS` não muda em
   tempo de execução. */
let _layoutMundo = null;

function layoutMundo(){
  if (_layoutMundo) return _layoutMundo;
  const dim = {}, pos = {};
  for (const [id, def] of Object.entries(MAPS)) dim[id] = tamanhoDoMapa(def);

  const raiz = MAPS.patio ? 'patio' : Object.keys(MAPS)[0];
  pos[raiz] = {ox:0, oy:0};
  const arestas = [];

  const bate = (id, ox, oy, ignorar) => {
    const d = dim[id];
    for (const [o, p] of Object.entries(pos)){
      if (o === id || o === ignorar) continue;
      const dp = dim[o];
      if (Math.min(ox + d.w, p.ox + dp.w) - Math.max(ox, p.ox) + 2 > 0 &&
          Math.min(oy + d.h, p.oy + dp.h) - Math.max(oy, p.oy) + 2 > 0) return true;
    }
    return false;
  };

  /* Coloca já sem sobrepor, em vez de colocar e separar depois.

     A primeira versão empurrava os pares sobrepostos num laço de
     relaxamento, e ele não convergia: com quinze salas grandes num grafo
     não planar, duas delas ficavam se empurrando em sentidos opostos
     para sempre e o pátio acabava dentro da Mata Cindária. Aqui a sala
     nasce no encaixe da porta e, se aquilo estiver ocupado, desliza para
     FORA ao longo da própria direção da passagem até achar vaga — o que
     termina sempre, e termina do lado certo. */
  const fila = [raiz];
  const vistos = new Set([raiz]);
  while (fila.length){
    const a = fila.shift();
    for (const w of ligacoesDoMapa(a)){
      const [dx, dy] = DIRV[w.dir] || [0, -1];
      arestas.push({de:a, para:w.to, x:w.x, y:w.y, tx:w.tx, ty:w.ty});
      if (vistos.has(w.to)) continue;
      vistos.add(w.to);
      const alvoX = pos[a].ox + w.x + dx - w.tx;
      const alvoY = pos[a].oy + w.y + dy - w.ty;
      let ox = alvoX, oy = alvoY;

      /* Vaga mais próxima do encaixe, em anéis.

         A primeira versão deslizava ao longo da passagem até caber. Numa
         cadeia longa isso atravessa o mundo: a Galeria, que sai da
         Câmara do Selo, descia 190 casas empurrando por todas as salas
         do caminho e o mapa virava uma linha fina num vazio. Procurar em
         anel acha a vaga LIVRE mais perto do encaixe — normalmente ao
         lado, que é onde uma sala vizinha deve estar. */
      if (bate(w.to, ox, oy)){
        busca:
        for (let raio = 1; raio <= 90; raio++){
          for (let k = -raio; k <= raio; k++){
            /* Perpendicular à passagem primeiro. Deslocar de lado
               preserva "está acima/abaixo"; deslocar ao longo destrói. */
            const cands = dy
              ? [[alvoX + k, alvoY + (k === -raio || k === raio ? 0 : raio * Math.sign(dy))],
                 [alvoX + raio * Math.sign(k || 1), alvoY + k]]
              : [[alvoX + (k === -raio || k === raio ? 0 : raio * Math.sign(dx || 1)), alvoY + k],
                 [alvoX + k, alvoY + raio * Math.sign(k || 1)]];
            for (const [cx, cy] of cands)
              if (!bate(w.to, cx, cy)){ ox = cx; oy = cy; break busca; }
          }
        }
      }
      pos[w.to] = {ox, oy, alvoX:pos[a].ox + w.x + dx - w.tx,
                           alvoY:pos[a].oy + w.y + dy - w.ty};
      fila.push(w.to);
    }
  }
  /* Compactação. O deslize afasta o quanto for preciso para caber, e
     numa cadeia longa isso acumula: a Galeria acabava 144 casas abaixo
     do pátio, com o mapa inteiro virando uma linha fina no meio de um
     vazio. Aqui cada sala volta andando em direção ao encaixe ideal
     enquanto não encostar em ninguém. Preserva a invariante — nada se
     sobrepõe — e devolve o mapa a um tamanho legível. */
  for (let passe = 0; passe < 40; passe++){
    let mexeu = false;
    for (const [id, p] of Object.entries(pos)){
      if (p.alvoX === undefined) continue;
      for (const eixo of ['ox', 'oy']){
        const alvo = eixo === 'ox' ? p.alvoX : p.alvoY;
        if (p[eixo] === alvo) continue;
        const passo = p[eixo] < alvo ? 1 : -1;
        const teste = {ox:p.ox, oy:p.oy}; teste[eixo] += passo;
        if (!bate(id, teste.ox, teste.oy)){ p[eixo] += passo; mexeu = true; }
      }
    }
    if (!mexeu) break;
  }

  // sala isolada (sem passagem que chegue nela) vai para o lado, não some
  let solto = 0;
  for (const id of Object.keys(MAPS)){
    if (pos[id]) continue;
    let ox = -80 - (solto++) * 50, oy = 0;
    for (let k = 0; k < 200 && bate(id, ox, oy); k++) oy += 8;
    pos[id] = {ox, oy};
  }

  return (_layoutMundo = {pos, dim, arestas});
}

/* Zona da tela do mapa. Sai daqui o desenho E o autoteste. */
const MAPA_TELA = {
  quadro: {x:16,  y:56,  w:552, h:496},
  lista:  {x:584, y:56,  w:200, h:496},
};

const Mapa = {
  aberto:false, cx:0, cy:0, esc:1, sel:0, area:'patio', _prev:'FIELD',

  open(){
    if (this.aberto) return;
    this.aberto = true; this._prev = G.scene; G.scene = 'MAPA';
    this.area = MAPS[G.mapId] ? G.mapId : (MAPS.patio ? 'patio' : Object.keys(MAPS)[0]);
    this.sel = Math.max(0, this.destinos().findIndex(d => d.mapa === this.area));
    this.enquadrar();
    Sound.sfx('confirm');
  },
  close(){
    if (!this.aberto) return;
    this.aberto = false; G.scene = this._prev === 'MAPA' ? 'FIELD' : this._prev;
    Sound.sfx('cancel');
  },

  /** Salas que o jogador já pisou. É o nevoeiro do metroidvania. */
  visitadas(){
    const L = layoutMundo();
    return Object.keys(L.pos).filter(id => G.visitados[id]);
  },

  /** O atlas é completo: toda entrada de MAPS ganha lugar e ligação,
     mesmo antes de a party alcançá-la. Visita só muda a leitura e a
     possibilidade de viagem, nunca esconde uma área que existe. */
  areas(){ return Object.keys(layoutMundo().pos); },

  /** Escala e centro que fazem o atlas inteiro — ou uma área focada —
     caber no quadro. Escala subpixel é intencional para o mapa completo. */
  enquadrar(ids = this.areas()){
    const L = layoutMundo(), Q = MAPA_TELA.quadro;
    if (!ids.length){ this.esc = 1; this.cx = this.cy = 0; return; }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const id of ids){
      const p = L.pos[id], d = L.dim[id];
      x0 = Math.min(x0, p.ox); y0 = Math.min(y0, p.oy);
      x1 = Math.max(x1, p.ox + d.w); y1 = Math.max(y1, p.oy + d.h);
    }
    this.esc = clamp(Math.min((Q.w - 24) / Math.max(1, x1 - x0),
                              (Q.h - 24) / Math.max(1, y1 - y0)), .22, 9);
    this.cx = (x0 + x1) / 2; this.cy = (y0 + y1) / 2;
  },

  /** Cristais da rede que dá para escolher aqui. */
  destinos(){
    return cristaisDescobertos().filter(c => G.visitados[c.mapa]);
  },

  selecionar(id){
    if (!MAPS[id]) return false;
    this.area = id;
    const i = this.destinos().findIndex(d => d.mapa === id);
    if (i >= 0) this.sel = i;
    Sound.sfx('cursor');
    return true;
  },
  destinoDaArea(id = this.area){ return this.destinos().find(d => d.mapa === id) || null; },
  viajarSelecionada(){
    const d = this.destinoDaArea();
    if (!d) { Sound.sfx('deny'); return false; }
    if (d.mapa === G.mapId && d.x === G.player.tx && d.y === G.player.ty){
      Sound.sfx('deny'); return false;
    }
    this.close();
    return viajarPara(d.k);
  },

  update(dt){
    if (!this.aberto) return;
    if (Input.pressed('cancel') || Input.pressed('mapa') || Input.pressed('menu')){
      this.close(); return;
    }
    const dest = this.destinos();
    if (dest.length){
      if (Input.pressed('up'))   { this.sel = (this.sel - 1 + dest.length) % dest.length; this.area = dest[this.sel].mapa; Sound.sfx('cursor'); }
      if (Input.pressed('down')) { this.sel = (this.sel + 1) % dest.length; this.area = dest[this.sel].mapa; Sound.sfx('cursor'); }
    }
    if (Input.pressed('confirm')) this.viajarSelecionada();
    // deslocar a vista com os ombros do controle / A e D não usados
    const v = 90 * dt / Math.max(0.6, this.esc);
    if (Input.isDown('left'))  this.cx -= v;
    if (Input.isDown('right')) this.cx += v;
    if (Clique.roda) this.esc = clamp(this.esc * (Clique.roda < 0 ? 1.14 : .88), .22, 12);
  },

  draw(){
    drawField();
    ctx.fillStyle = 'rgba(4,4,10,.80)'; ctx.fillRect(0, 0, W, H);
    const Q = MAPA_TELA.quadro, LI = MAPA_TELA.lista;
    const L = layoutMundo(), vis = this.visitadas(), areas = this.areas();

    pxText('ATLAS DO MUNDO', 20, 40, {size:12, color:'#7ad0ff'});
    uiText(`${areas.length} áreas integradas · ${vis.length} exploradas`,
           222, 40, {size:12, color:'#7a9aa8'});

    panel(Q.x, Q.y, Q.w, Q.h);
    /* Controles por clique: o atlas inteiro abre pequeno; foco e zoom
       deixam qualquer sala legível sem esconder o resto da topologia. */
    const controle = (x, texto, acao) => {
      Clique.add(x, Q.y + 10, 46, 18, acao);
      ctx.fillStyle = Clique.emCima(x, Q.y + 10, 46, 18) ? 'rgba(122,208,255,.22)' : 'rgba(20,34,52,.88)';
      ctx.fillRect(x, Q.y + 10, 46, 18);
      pxText(texto, x + 23, Q.y + 23, {size:7, color:'#b8e8ff', align:'center'});
    };
    controle(Q.x + 10, 'TUDO', () => this.enquadrar());
    controle(Q.x + 60, 'FOCO', () => this.enquadrar([this.area]));
    controle(Q.x + Q.w - 106, '−', () => { this.esc = clamp(this.esc * .8, .22, 12); });
    controle(Q.x + Q.w - 56, '+', () => { this.esc = clamp(this.esc * 1.25, .22, 12); });
    ctx.save();
    ctx.beginPath(); ctx.rect(Q.x + 4, Q.y + 4, Q.w - 8, Q.h - 8); ctx.clip();

    const e = this.esc;
    const px0 = Q.x + Q.w / 2 - this.cx * e, py0 = Q.y + Q.h / 2 - this.cy * e;
    const TX = (id, x) => px0 + (L.pos[id].ox + x) * e;
    const TY = (id, y) => py0 + (L.pos[id].oy + y) * e;

    // Todas as conexões entram no atlas; as já percorridas brilham mais.
    for (const a of L.arestas){
      const aberta = G.visitados[a.de] && G.visitados[a.para];
      ctx.strokeStyle = aberta ? 'rgba(122,208,255,.72)' : 'rgba(80,96,120,.32)';
      ctx.lineWidth = aberta ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(TX(a.de, a.x + .5), TY(a.de, a.y + .5));
      ctx.lineTo(TX(a.para, a.tx + .5), TY(a.para, a.ty + .5));
      ctx.stroke();
    }

    for (const id of areas){
      const def = MAPS[id], d = L.dim[id];
      const linhas = (def.grid || def.rows || []).map(String);
      const aqui = id === G.mapId, explorada = !!G.visitados[id], selecionada = id === this.area;

      if (explorada){
        // chão da sala, casa por casa. Em visão ampla, pixels subunitários
        // evitam que a área cresça artificialmente por causa de Math.ceil.
        const lado = e < 1 ? e : Math.ceil(e);
        for (let y = 0; y < d.h; y++){
          const linha = linhas[y] || '';
          for (let x = 0; x < d.w; x++){
            const td = TILEDEF[linha[x]];
            const cor = td && COR_MINIMAPA[td.id];
            if (!cor) continue;
            ctx.fillStyle = cor;
            ctx.fillRect(TX(id, x), TY(id, y), lado, lado);
          }
        }
      } else {
        ctx.fillStyle = '#182332';
        ctx.fillRect(TX(id, 0), TY(id, 0), d.w * e, d.h * e);
      }
      // Contorno: área atual, selecionada, explorada e ainda oculta têm
      // leituras diferentes, sem esconder nenhuma sala existente.
      ctx.strokeStyle = aqui ? '#ffe44a' : selecionada ? '#7ad0ff' : explorada ? 'rgba(140,170,210,.7)' : 'rgba(86,104,126,.58)';
      ctx.lineWidth = aqui || selecionada ? 2 : 1;
      ctx.strokeRect(TX(id, 0) - 1, TY(id, 0) - 1, d.w * e + 2, d.h * e + 2);

      const rx = TX(id, 0), ry = TY(id, 0), rw = d.w * e, rh = d.h * e;
      const ix = Math.max(Q.x + 4, rx), iy = Math.max(Q.y + 4, ry);
      const ax = Math.min(Q.x + Q.w - 4, rx + rw), ay = Math.min(Q.y + Q.h - 4, ry + rh);
      if (ax > ix && ay > iy) Clique.add(ix, iy, ax - ix, ay - iy, () => this.selecionar(id));

      /* O nome vai DENTRO da sala, não em cima dela. Fora, ele cai sobre
         a sala vizinha assim que duas ficam encostadas — e elas ficam,
         porque o encaixe pela porta é justamente o que as cola. */
      if (e >= 1.45){
        const rot = def.name.replace(/^Stone Reach — /, '');
        const larg = rot.length * 8 + 8;
        ctx.fillStyle = 'rgba(8,6,16,.78)';
        ctx.fillRect(TX(id, d.w / 2) - larg / 2, TY(id, 0) + 1, larg, 12);
        pxText(rot, TX(id, d.w / 2), TY(id, 0) + 10,
               {size:7, color:aqui ? '#ffe44a' : explorada ? '#c8d8f0' : '#71839b', align:'center'});
      }
    }

    /* Marcadores por cima de tudo: cristais seguem sendo descobertos, e
       a party permanece a única posição em tempo real do atlas. */
    for (const c of cristaisDescobertos()){
      if (!G.visitados[c.mapa] || !L.pos[c.mapa]) continue;
      marcadorMini(TX(c.mapa, c.x + .5), TY(c.mapa, c.y + .5), 'save');
    }
    if (G.map && L.pos[G.mapId]){
      const x = TX(G.mapId, G.player.tx + .5), y = TY(G.mapId, G.player.ty + .5);
      const pulso = 3 + Math.sin(Date.now() / 260) * 1.6;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, pulso, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7ad0ff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, pulso + 3, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();

    /* Registro repetido depois das salas: garante que controles de visão
       ficam acima de uma área do atlas que por acaso toque o topo. */
    Clique.add(Q.x + 10, Q.y + 10, 46, 18, () => this.enquadrar());
    Clique.add(Q.x + 60, Q.y + 10, 46, 18, () => this.enquadrar([this.area]));
    Clique.add(Q.x + Q.w - 106, Q.y + 10, 46, 18, () => { this.esc = clamp(this.esc * .8, .22, 12); });
    Clique.add(Q.x + Q.w - 56, Q.y + 10, 46, 18, () => { this.esc = clamp(this.esc * 1.25, .22, 12); });

    /* --- ficha da área e viagem rápida ---------------------------- */
    panel(LI.x, LI.y, LI.w, LI.h, {accent:'#4a3a6a'});
    const selecionada = MAPS[this.area] || MAPS[G.mapId];
    const explorada = !!G.visitados[this.area];
    const atalho = this.destinoDaArea();
    pxText('ÁREA SELECIONADA', LI.x + 14, LI.y + 28, {size:8, color:'#7ad0ff'});
    wrapUI(selecionada?.name.replace(/^Stone Reach — /, '') || '—', LI.w - 28, 12)
      .slice(0, 2).forEach((ln, i) => uiText(ln, LI.x + 14, LI.y + 54 + i * 15,
        {size:12, color:explorada ? '#e8f4ff' : '#8aa0b8'}));
    uiText(explorada ? 'Explorada' : 'Ainda não explorada', LI.x + 14, LI.y + 91,
           {size:11, color:explorada ? '#a8ffd0' : '#7a8a9e'});
    if (atalho){
      const by = LI.y + 110;
      Clique.add(LI.x + 12, by, LI.w - 24, 28, () => this.viajarSelecionada());
      ctx.fillStyle = Clique.emCima(LI.x + 12, by, LI.w - 24, 28) ? 'rgba(122,208,255,.28)' : 'rgba(30,72,90,.52)';
      ctx.fillRect(LI.x + 12, by, LI.w - 24, 28);
      pxText('VIAJAR AO CRISTAL', LI.x + LI.w / 2, by + 18, {size:8, color:'#c8f4ff', align:'center'});
    } else {
      wrapUI(explorada ? 'Nenhum cristal de viagem nesta área.' : 'Explore a área para encontrar seu cristal.', LI.w - 28, 11)
        .slice(0, 2).forEach((ln, i) => uiText(ln, LI.x + 14, LI.y + 116 + i * 14,
          {size:11, color:'#7a8da2'}));
    }

    pxText('REDE DE CRISTAIS', LI.x + 14, LI.y + 168, {size:8, color:'#b89aff'});
    const dest = this.destinos();
    if (!dest.length){
      wrapUI('Toque num cristal de éter para abrir a rede de ressonância.',
             LI.w - 28, 12).forEach((ln, i) =>
        uiText(ln, LI.x + 14, LI.y + 196 + i * 16, {size:12, color:'#7a6a9a'}));
    } else {
      dest.forEach((c, i) => {
        const y = LI.y + 198 + i * 30;
        if (y > LI.y + LI.h - 60) return;
        const on = i === this.sel % dest.length;
        Clique.add(LI.x + 8, y - 16, LI.w - 16, 30, () => {
          if (this.sel === i){
            this.area = c.mapa;
            this.viajarSelecionada();
          } else { this.sel = i; this.area = c.mapa; Sound.sfx('cursor'); }
        });
        if (on || Clique.emCima(LI.x + 8, y - 16, LI.w - 16, 30)){
          ctx.fillStyle = on ? 'rgba(120,86,200,.26)' : 'rgba(120,86,200,.12)';
          ctx.fillRect(LI.x + 8, y - 16, LI.w - 16, 30);
        }
        const eAqui = c.mapa === G.mapId;
        pxText((on ? '▸' : ' ') + (eAqui ? '◈' : '◇'), LI.x + 14, y,
               {size:8, color:on ? '#ffe44a' : '#6a5a8a'});
        wrapUI(c.nome.replace(/^Stone Reach — /, ''), LI.w - 52, 12)
          .slice(0, 1).forEach(ln =>
            uiText(ln, LI.x + 38, y + 2, {size:12, color:on ? '#fff' : '#a898c0'}));
      });
    }
    uiText('Clique: inspeciona · roda: zoom', LI.x + LI.w / 2, LI.y + LI.h - 36,
           {size:11, color:'#5a4a7a', align:'center'});
    uiText('Z viaja · M ou X fecha', LI.x + LI.w / 2, LI.y + LI.h - 20,
           {size:11, color:'#5a4a7a', align:'center'});
  },
};

/* --- Mobs e NPCs ------------------------------------------------- */
function updateWorldMobs(dt){
  const mobs = G.map?.mobs || [], now = Date.now();
  for (const mob of mobs){
    if (mob.defeated){ respawnWorldMob(mob, now); continue; }
    if (mob.engaging) continue;
    if (updateMover(mob, dt, MOVE_DUR * 1.9)) mob.wait = rnd(3.5, 1.5);
    if (mob.moving) continue;
    mob.wait -= dt;
    if (mob.wait > 0) continue;
    mob.wait = rnd(3, 1);
    const dir = pick(['up','down','left','right']);
    const [dx, dy] = DIRV[dir], nx = mob.tx + dx, ny = mob.ty + dy;
    mob.dir = dir;
    if (Math.abs(nx - mob.homeX) > mob.patrol || Math.abs(ny - mob.homeY) > mob.patrol) continue;
    if (!isSafeWorldMobTile(nx, ny, mob)) continue;
    mob.fromX = mob.tx; mob.fromY = mob.ty; mob.tx = nx; mob.ty = ny;
    mob.moving = true; mob.moveT = 0;
  }
}
function updateNPCs(dt){
  for (const n of G.map.npcs){
    if (updateMover(n, dt, MOVE_DUR * 1.6)) n.wait = rnd(4, 1.5);
    if (n.moving || n.busy || !n.wander) continue;
    n.wait -= dt;
    if (n.wait > 0) continue;
    n.wait = rnd(3, 1);
    const dir = pick(['up','down','left','right']);
    const [dx, dy] = DIRV[dir];
    const nx = n.tx + dx, ny = n.ty + dy;
    n.dir = dir;
    if (Math.abs(nx - n.homeX) > 3 || Math.abs(ny - n.homeY) > 3) continue;
    if (!isSafeWorldActorTile(nx, ny, n)) continue;
    n.fromX = n.tx; n.fromY = n.ty; n.tx = nx; n.ty = ny; n.moving = true; n.moveT = 0;
  }
}

/* --- Update do campo --------------------------------------------- */
function updateField(dt){
  const p = G.player;
  const dur = stepDuration();
  /* v5.32 — tempo parado, só pra Madao trocar pro chibi de campo agora
     que ele existe (ver drawActor em 20-field-view.js). Zera a cada
     passo; ninguém mais consulta, então não precisa entrar no save. */
  p.idleT = p.moving ? 0 : (p.idleT || 0) + dt;
  if (updateMover(p, dt, dur)) onStepComplete();
  G.followers.forEach(f => updateMover(f, dt, dur));
  if (!p.moving && G.scene === 'FIELD'){
    if      (Input.isDown('up'))    tryStep('up');
    else if (Input.isDown('down'))  tryStep('down');
    else if (Input.isDown('left'))  tryStep('left');
    else if (Input.isDown('right')) tryStep('right');
    /* Botão segurado sobre o MAPA anda; sobre a HUD, não — senão clicar
       num botão faria o personagem sair andando junto. */
    else if (Clique.segurando && !Clique.sob() && !Msg.active) passoParaPonteiro();
  }
  /* Atalhos da HUD. Só valem em FIELD: durante diálogo ou cena, `C` e os
     outros já têm dono, e abrir a bolsa no meio de uma fala seria roubo
     de foco. */
  if (G.scene === 'FIELD' && !Msg.active){
    for (const b of BOTOES_RAPIDOS)
      if (Input.pressed(b.id === 'menu' ? 'menu' : b.id)){
        /* Página nula = não é página do menu. Hoje só o mapa, que é uma
           tela própria; o resto continua abrindo o menu direto na sua. */
        if (b.pagina === null) Mapa.open(); else Menu.abrirEm(b.pagina);
        break;
      }
  }
  updateWorldMobs(dt);
  updateNPCs(dt);
  updateCamera(dt);
  if (G.banner.t > 0) G.banner.t -= dt;
}

function updateCamera(dt){
  const m = G.map;
  if (!m) return;
  /* Durante uma cena a câmera pode largar o jogador e ir para outro ator
     ou para uma casa fixa — é o que dá o "pan" de cutscene. `speed` mais
     baixa = deslocamento mais lento e mais cinematográfico. */
  const foco = Cut.focus();
  const ax = foco ? foco.px : G.player.px;
  const ay = foco ? foco.py : G.player.py;
  const tx = ax - W / 2 + TILE / 2;
  const ty = ay - H / 2 + TILE / 2;
  const maxX = Math.max(0, m.w * TILE - W), maxY = Math.max(0, m.h * TILE - H);
  const gx = clamp(tx, 0, maxX), gy = clamp(ty, 0, maxY);
  // câmera segue com suavização — some quando o mapa é menor que a tela
  const k = 1 - Math.pow(foco ? Math.pow(0.0001, foco.speed / 6) : 0.0001, dt);
  G.camera.x = m.w * TILE <= W ? (m.w * TILE - W) / 2 : lerp(G.camera.x, gx, k);
  G.camera.y = m.h * TILE <= H ? (m.h * TILE - H) / 2 : lerp(G.camera.y, gy, k);
}
