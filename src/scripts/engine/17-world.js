/* ===================================================================
   8. MAPA / CAMPO
   =================================================================== */
function normalizeRows(rows, fill){
  const w = Math.max(...rows.map(r => r.length));
  return rows.map((r, y) => {
    let s = r.padEnd(w, fill).split('');
    s[0] = '#'; s[w-1] = '#';
    if (y === 0 || y === rows.length - 1) s = s.map(() => '#');
    return s;
  });
}
function tileAt(x, y){
  const m = G.map; if (!m || y < 0 || y >= m.h || x < 0 || x >= m.w) return TILEDEF['#'];
  return TILEDEF[m.grid[y][x]] || TILEDEF['#'];
}
function isSolid(x, y){
  if (tileAt(x, y).solid) return true;
  /* Decoração só bloqueia quando pede. Um arbusto de flores não deve
     parar ninguém; um poço, sim. */
  if (G.map.decorSolido && G.map.decorSolido.has(x + ',' + y)) return true;
  for (const n of G.map.npcs) if (n.tx === x && n.ty === y) return true;
  if (worldMobAt(x, y)) return true;
  /* O eco NÃO bloqueia: ele é sombra, e trancar o caminho de volta
     numa alcova sem saída prenderia quem só quis olhar. */
  if (G.map.boss && !G.map.boss.eco && G.map.boss.tx === x && G.map.boss.ty === y) return true;
  return false;
}
function nearestFree(x, y){
  if (!isSolid(x, y)) return {x, y};
  for (let r = 1; r < 8; r++)
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
      if (!isSolid(x + dx, y + dy)) return {x:x + dx, y:y + dy};
  return {x, y};
}

/* --- Mobs de campo ------------------------------------------------
   Eles pertencem à instância carregada do mapa, não ao save: entrar de
   novo numa área recompõe seus encontros a partir da definição. Isso
   mantém o contrato de save intacto e impede que um estado transitório
   de patrulha vire dado persistido. */
function worldMobAt(x, y){
  return G.map?.mobs?.find(m => !m.defeated && m.tx === x && m.ty === y) || null;
}
function isSafeWorldMobTile(x, y, self = null){
  const m = G.map, t = tileAt(x, y);
  if (!m || !t || t.solid || t.warp || t.chest || t.save) return false;
  if (m.decorSolido?.has(x + ',' + y)) return false;
  if (m.npcs.some(n => n.tx === x && n.ty === y)) return false;
  if (m.boss && m.boss.tx === x && m.boss.ty === y) return false;
  if (m.mobs?.some(n => n !== self && !n.defeated && n.tx === x && n.ty === y)) return false;
  if ((m.signs || []).some(s => s.x === x && s.y === y)) return false;
  if ((m.def.triggers || []).some(g => g.x === x && g.y === y)) return false;
  if (G.player?.tx === x && G.player?.ty === y) return false;
  if (G.followers?.some(f => f.tx === x && f.ty === y)) return false;
  return true;
}
function nearestSafeWorldMobTile(x, y){
  if (isSafeWorldMobTile(x, y)) return {x, y};
  for (let r = 1; r < 8; r++)
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
      if (isSafeWorldMobTile(x + dx, y + dy)) return {x:x + dx, y:y + dy};
  return null;
}
function makeWorldMob(spec){
  const formation = (spec.formation || []).filter(([id, n]) => BESTIARY[id] && n > 0);
  const art = BESTIARY[spec.visual] || BESTIARY[formation[0]?.[0]];
  const p = art && nearestSafeWorldMobTile(spec.x, spec.y);
  if (!p || !formation.length){
    console.warn(`[${G.map?.id}] mob inválido:`, spec?.id || spec?.visual || 'sem id');
    return null;
  }
  return {...spec, formation, tx:p.x, ty:p.y, px:p.x * TILE, py:p.y * TILE,
    homeX:p.x, homeY:p.y, dir:'down', moving:false, moveT:0, animT:0,
    fromX:p.x, fromY:p.y, wait:rnd(3, 1), patrol:Math.max(0, spec.patrol ?? 1),
    sprite:art.sprite, color:art.color, accent:art.accent,
    defeated:false, engaging:false, respawnAt:0};
}

function loadMap(id, sx, sy, sdir){
  const def = MAPS[id];
  if (!def){ console.error('mapa inexistente:', id); return; }
  /* Pisou, descobriu. É o nevoeiro do mapa, e mora aqui — em `loadMap` —
     porque é o único caminho por onde se entra numa sala: porta, escada,
     viagem rápida e carregamento de save passam todos por aqui. */
  G.visitados[id] = true;
  const grid = normalizeRows(def.rows, def.fill);
  const m = {
    id, def, grid, w:grid[0].length, h:grid.length,
    name:def.name, warps:[], chests:[], signs:def.signs || [], npcs:[], mobs:[], boss:null,
    /* Decoração: peças do pacote posicionadas por casa, SEM entrar na
       gramática de tiles. Pôr cada prop como uma letra nova no mapa em
       texto encheria o alfabeto e obrigaria a redesenhar o mapa inteiro
       para mover um barril. Uma lista de coordenadas move um barril
       mexendo num número. */
    decor:(def.decor || []).filter(d => d && d.s),
    decorSolido:new Set((def.decor || []).filter(d => d && d.s && d.solido)
                                          .map(d => d.x + ',' + d.y)),
  };
  // Varre marcadores na ordem de leitura e casa com as listas declaradas.
  const warpTiles = [], chestTiles = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++){
    const t = TILEDEF[grid[y][x]];
    if (t && t.warp)  warpTiles.push({x, y});
    if (t && t.chest) chestTiles.push({x, y});
  }
  (def.warps || []).forEach((wp, i) => { if (warpTiles[i]) m.warps.push({...wp, ...warpTiles[i]}); });
  (def.chests || []).forEach((ch, i) => { if (chestTiles[i]) m.chests.push({...ch, ...chestTiles[i]}); });
  if (warpTiles.length !== (def.warps||[]).length)
    console.warn(`[${id}] ${warpTiles.length} tiles de passagem para ${(def.warps||[]).length} destinos`);

  G.map = m;   // NPCs/boss precisam de isSolid, que lê G.map
  m.npcs = (def.npcs || []).map(n => {
    const p = nearestFree(n.x, n.y);
    return {...n, tx:p.x, ty:p.y, px:p.x * TILE, py:p.y * TILE, homeX:p.x, homeY:p.y,
            dir:'down', moving:false, moveT:0, animT:0, fromX:p.x, fromY:p.y, wait:rnd(3, 1)};
  });
  /* O chefe fica na alcova mesmo depois de vencido — como ECO.

     v5.24: antes ele simplesmente sumia, e com ele sumia a única luta
     do jogo que vale medir força contra. O eco não mexe na flag do
     capítulo (a porta continua aberta, a cena não repete) e endurece a
     cada queda; é só o corpo que volta, não o progresso. */
  if (def.boss){
    const b = BESTIARY[def.boss.id];
    m.boss = {...def.boss, tx:def.boss.x, ty:def.boss.y, name:b.name,
              color:b.color, accent:b.accent, el:b.element, sprite:b.sprite,
              retrato:b.retrato || null,
              eco:!!G.flags[def.boss.flag]};
  }
  G.mapId = id;

  const spawn = def.spawn || {x:1, y:1};
  const p = nearestFree(sx ?? spawn.x, sy ?? spawn.y);
  Object.assign(G.player, {tx:p.x, ty:p.y, px:p.x * TILE, py:p.y * TILE,
    dir:sdir || spawn.dir || 'down', moving:false, moveT:0, animT:0, fromX:p.x, fromY:p.y});
  G.followers = [];
  activeParty().forEach((c, i) => { if (i > 0) G.followers.push(
    {char:c, tx:p.x, ty:p.y, px:p.x * TILE, py:p.y * TILE, dir:G.player.dir,
     moving:false, moveT:0, animT:0, fromX:p.x, fromY:p.y, sheet:c.sheet}); });
  for (const spec of (def.mobs || [])){
    const mob = makeWorldMob(spec);
    if (mob) m.mobs.push(mob);
  }
  resetEncounterCounter();
  showBanner(m.name);
  if (Sound.ready) Sound.bgm(def.bgm || 'field');
  const oe = def.onEnter;
  if (oe && (!oe.flag || !G.flags[oe.flag]) && !Cut.active) Cut.queue(oe.scene);
}

/* --- Grupo ------------------------------------------------------- */
const charByName = n => G.party.find(c => c.name === n);
/** Personagens em campo, na ordem da formação. */
function squadChars(){
  return G.squad.map(charByName).filter(Boolean);
}
/** Nomes do elenco que ficaram de fora — o banco. */
function benchNames(){
  const usados = new Set(G.squad);
  return G.party.filter(c => !usados.has(c.name)).map(c => c.name);
}
function benchChars(){ return benchNames().map(charByName).filter(Boolean); }
/** Grupo padrão: os primeiros do elenco até encher. */
function defaultSquad(){
  return G.party.slice(0, PARTY_SIZE).map(c => c.name);
}
/** Garante grupo válido: sem repetido, sem nome fantasma, sem estourar,
 *  e nunca vazio — grupo vazio trava o jogo no campo e no combate. */
function sanitizeSquad(){
  const vistos = new Set();
  G.squad = (G.squad || [])
    .filter(n => charByName(n) && !vistos.has(n) && vistos.add(n))
    .slice(0, PARTY_SIZE);
  if (!G.squad.length) G.squad = defaultSquad();
  G.leader = clamp(G.leader, 0, Math.max(0, G.squad.length - 1));
}

/** Põe alguém do banco em campo. Com o grupo cheio, troca pelo `alvo`. */
function entrarNoGrupo(nome, alvo = -1){
  if (!charByName(nome) || G.squad.includes(nome)) return false;
  if (alvo >= 0 && alvo < G.squad.length) G.squad[alvo] = nome;
  else if (G.squad.length < PARTY_SIZE) G.squad.push(nome);
  else return false;
  sanitizeSquad(); rebuildFollowers();
  return true;
}
/** Tira alguém de campo. O último não sai — grupo vazio trava o jogo.
 *  `G.leader` é posição, não nome: remover alguém antes dele desloca a
 *  lista e passaria a liderança para outra pessoa sem ninguém pedir.
 *  Por isso a liderança é reancorada pelo nome. */
function sairDoGrupo(nome){
  const i = G.squad.indexOf(nome);
  if (i < 0 || G.squad.length <= 1) return false;
  const lider = G.squad[clamp(G.leader, 0, G.squad.length - 1)];
  G.squad.splice(i, 1);
  const novo = G.squad.indexOf(lider);
  G.leader = novo >= 0 ? novo : 0;
  sanitizeSquad(); rebuildFollowers();
  return true;
}

function activeParty(){
  /* Grupo vazio não é estado válido em lugar nenhum do jogo, e falha em
     silêncio: o campo desenha ninguém e o combate começa com 0 aliados,
     perdendo na primeira rodada sem erro no console. Remontar aqui custa
     nada e transforma um bug mudo num grupo jogável. */
  if (!G.squad.length) sanitizeSquad();
  const list = squadChars();
  if (!list.length) return [];
  const l = list.splice(clamp(G.leader, 0, list.length - 1), 1)[0];   // o líder anda na frente
  return [l, ...list];
}
function leaderChar(){ return activeParty()[0] || G.party[0]; }

/** Alterna quem anda na frente. */
function swapLeader(){
  const n = squadChars().length;
  if (n < 2) return;
  G.leader = (G.leader + 1) % n;
  rebuildFollowers();
  Sound.sfx('cursor');
  showBanner('Líder: ' + leaderChar().name);
}
function rebuildFollowers(){
  const list = activeParty().slice(1);
  G.followers = list.map((c, i) => {
    const prev = G.followers[i];
    return {char:c, sheet:c.sheet,
      tx:prev?.tx ?? G.player.tx, ty:prev?.ty ?? G.player.ty,
      px:prev?.px ?? G.player.px, py:prev?.py ?? G.player.py,
      fromX:prev?.fromX ?? G.player.tx, fromY:prev?.fromY ?? G.player.ty,
      dir:prev?.dir ?? G.player.dir, moving:false, moveT:0, animT:0};
  });
}
function resetEncounterCounter(){
  const e = G.map?.def.encounter;
  if (!e){ G.stepsToEnc = Infinity; return; }
  let n = rndInt(e[0], e[1]);
  // a noite encurta a trégua, mas só onde o céu conta (ver ENC_NOITE)
  if (G.map?.def.outdoor && ehNoite()) n = Math.max(1, Math.round(n * ENC_NOITE));
  G.stepsToEnc = n;
}
function showBanner(text){ G.banner = {text, t:2.6}; }

/* --- Movimento --------------------------------------------------- */
const DIRV = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};

function tryStep(dir){
  const p = G.player;
  if (p.moving) return;
  p.dir = dir;
  const [dx, dy] = DIRV[dir];
  const nx = p.tx + dx, ny = p.ty + dy;
  const mob = worldMobAt(nx, ny);
  if (mob){ startWorldMobBattle(mob); return; }
  if (isSolid(nx, ny)) return;
  // followers seguem a trilha: cada um vai para onde estava o da frente
  const trail = [{x:p.tx, y:p.ty, dir}];
  G.followers.forEach(f => trail.push({x:f.tx, y:f.ty, dir:f.dir}));
  G.followers.forEach((f, i) => {
    const t = trail[i];
    if (t.x === f.tx && t.y === f.ty) return;
    f.fromX = f.tx; f.fromY = f.ty; f.tx = t.x; f.ty = t.y;
    f.dir = f.tx > f.fromX ? 'right' : f.tx < f.fromX ? 'left' : f.ty > f.fromY ? 'down' : 'up';
    f.moving = true; f.moveT = 0;
  });
  p.fromX = p.tx; p.fromY = p.ty; p.tx = nx; p.ty = ny; p.moving = true; p.moveT = 0;
}

function stepDuration(){ return Input.isDown('run') ? MOVE_DUR * RUN_MULT : MOVE_DUR; }

function updateMover(a, dt, dur){
  if (!a.moving) return false;
  a.animT += dt;
  a.moveT += dt / dur;
  if (a.moveT >= 1){
    a.moveT = 1; a.moving = false;
    a.px = a.tx * TILE; a.py = a.ty * TILE;
    return true;                      // completou um passo
  }
  a.px = lerp(a.fromX * TILE, a.tx * TILE, a.moveT);
  a.py = lerp(a.fromY * TILE, a.ty * TILE, a.moveT);
  return false;
}

/* A regeneração do Madao. Fora do combate e contada em PASSOS: por
   segundo premiaria deixar o jogo parado, e por batalha não seria "fora
   do combate". O passo é a moeda do campo — é a mesma que o encontro
   aleatório usa.
   Cura só a ELE: é a habilidade dele, não uma fonte de cura para o
   grupo, que tornaria a Ophelia e a Eden dispensáveis fora da luta. */
function regenMadao(){
  const c = charByName(MADAO.dono);
  if (!c || c.hp <= 0 || c.hp >= c.maxHp) return;
  if (G.steps % MADAO.passosPorCura !== 0) return;
  const antes = c.hp;
  c.hp = Math.min(c.maxHp, c.hp + Math.max(1, Math.round(c.maxHp * MADAO.curaPorTique)));
  if (c.hp > antes && c.hp === c.maxHp) showBanner(`${c.name} está inteiro de novo.`);
}
