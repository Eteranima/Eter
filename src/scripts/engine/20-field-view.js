/* ===================================================================
   8b. DESENHO DO CAMPO
   =================================================================== */
function drawTileArt(ch, x, y, sx, sy, T2){
  const t = Date.now();
  const id = TILEDEF[ch]?.id;

  /* Atalho da arte, antes do `switch`. Fica fora dele de propósito: com
     11 tiles cobertos, repetir o mesmo `if` em 11 ramos convidaria a
     esquecer um. `save` e `chest` NÃO passam por aqui — os dois compõem
     duas camadas e são tratados nos ramos deles. */
  if (id !== 'save' && id !== 'chest'){
    /* Um mapa pode trocar a pele de um caractere sem trocar a sua
       gramática. Porto Lúmina, por exemplo, continua usando `,` como
       caminho passável, mas o mostra em tábuas de cais. */
    const chaveLocal = G.map?.def?.tileArt?.[ch];
    const arte = arteTile(chaveLocal || TILE_ART[id]);
    if (arte){ ctx.drawImage(arte, sx, sy, T2, T2); return; }
  }

  switch(id){
    case 'grass':
      ctx.fillStyle = '#2a4a2a'; ctx.fillRect(sx, sy, T2, T2);
      ctx.fillStyle = '#234023';
      if ((x + y) % 3 === 0) ctx.fillRect(sx + 8, sy + 12, 3, 6);
      if ((x * 3 + y) % 5 === 0) ctx.fillRect(sx + 20, sy + 6, 3, 5);
      if ((x * 7 + y * 3) % 11 === 0){ ctx.fillStyle = '#3a5a30'; ctx.fillRect(sx + 13, sy + 18, 4, 4); }
      break;
    case 'path':
      ctx.fillStyle = '#565040'; ctx.fillRect(sx, sy, T2, T2);
      ctx.fillStyle = '#4a4436';
      ctx.fillRect(sx, sy + (y % 2 ? 16 : 0), T2, 1); ctx.fillRect(sx + ((x * 13 + y * 7) % 24), sy, 1, T2);
      if ((x + y) % 4 === 0){ ctx.fillStyle = '#605a48'; ctx.fillRect(sx + 5, sy + 5, 5, 4); }
      break;
    case 'dirt':
      ctx.fillStyle = '#4a3e30'; ctx.fillRect(sx, sy, T2, T2);
      ctx.fillStyle = '#413528'; if ((x * 5 + y) % 3 === 0) ctx.fillRect(sx + 6, sy + 14, 8, 3);
      break;
    case 'crack':
      ctx.fillStyle = '#22202e'; ctx.fillRect(sx, sy, T2, T2);
      ctx.fillStyle = '#1a1826';
      ctx.fillRect(sx, sy, T2, 1); ctx.fillRect(sx, sy, 1, T2);
      if ((x * 3 + y * 5) % 7 === 0){ ctx.strokeStyle = '#15131f'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx + 4, sy + 6); ctx.lineTo(sx + 14, sy + 18); ctx.lineTo(sx + 11, sy + 27); ctx.stroke(); }
      break;
    case 'wall':
      ctx.fillStyle = '#39303f'; ctx.fillRect(sx, sy, T2, T2);
      ctx.fillStyle = '#47404f'; ctx.fillRect(sx + 1, sy + 1, T2 - 2, 14);
      ctx.fillStyle = '#413a49'; ctx.fillRect(sx + 1, sy + 17, T2 - 2, 14);
      ctx.fillStyle = '#2e2734';
      ctx.fillRect(sx + (y % 2 ? 16 : 0), sy, 1, 16); ctx.fillRect(sx + (y % 2 ? 0 : 16), sy + 16, 1, 16);
      ctx.fillRect(sx, sy + 15, T2, 1);
      break;
    case 'floor':
      ctx.fillStyle = (x + y) % 2 ? '#3a3444' : '#353040'; ctx.fillRect(sx, sy, T2, T2);
      ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.strokeRect(sx + .5, sy + .5, T2 - 1, T2 - 1);
      break;
    case 'carpet':
      ctx.fillStyle = '#4a2440'; ctx.fillRect(sx, sy, T2, T2);
      ctx.fillStyle = '#5c2e50'; ctx.fillRect(sx + 3, sy + 3, T2 - 6, T2 - 6);
      ctx.fillStyle = '#8a5a3a'; if ((x + y) % 2 === 0) ctx.fillRect(sx + 14, sy + 14, 4, 4);
      break;
    case 'water': {
      /* 520 ms por quadro: a deriva da água é LENTA de propósito, e era
         esse o período da senoide que a versão procedural usava. */
      const arte = quadroTile(TILE_AGUA, 520, x, y);
      if (arte){ ctx.drawImage(arte, sx, sy, T2, T2); break; }
      ctx.fillStyle = '#26356a'; ctx.fillRect(sx, sy, T2, T2);
      const w = Math.sin(t / 520 + x * .7) * 3, w2 = Math.cos(t / 640 + y * .5) * 3;
      ctx.fillStyle = '#38508f'; ctx.fillRect(sx + 4 + w, sy + 8, 12, 2);
      ctx.fillRect(sx + 12 + w2, sy + 20, 10, 2);
      ctx.fillStyle = 'rgba(160,200,255,.16)'; ctx.fillRect(sx + 18 + w, sy + 5, 5, 1);
      break; }
    case 'save': {
      drawTileArt(',', x, y, sx, sy, T2);
      const pl = Math.sin(t / 400) * .3 + .7;
      ctx.save(); ctx.shadowColor = '#b89aff'; ctx.shadowBlur = 14 * pl;
      ctx.fillStyle = `rgba(150,110,230,${pl})`;
      ctx.beginPath(); ctx.moveTo(sx + 16, sy + 2); ctx.lineTo(sx + 25, sy + 16);
      ctx.lineTo(sx + 16, sy + 30); ctx.lineTo(sx + 7, sy + 16); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(225,210,255,${pl * .6})`; ctx.fillRect(sx + 14, sy + 10, 4, 10);
      ctx.restore(); break; }
    case 'door':
      ctx.fillStyle = '#2c2432'; ctx.fillRect(sx, sy, T2, T2);
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(sx + 4, sy + 1, 24, 31);
      ctx.fillStyle = '#8a6a3a'; ctx.fillRect(sx + 6, sy + 3, 20, 27);
      ctx.fillStyle = '#5a3a1a'; ctx.fillRect(sx + 15, sy + 3, 2, 27);
      ctx.fillStyle = '#eaca3a'; ctx.fillRect(sx + 21, sy + 16, 3, 3);
      break;
    case 'stairs':
      ctx.fillStyle = '#2a2634'; ctx.fillRect(sx, sy, T2, T2);
      for (let i = 0; i < 4; i++){
        ctx.fillStyle = `rgba(90,80,110,${.75 - i * .16})`;
        ctx.fillRect(sx + i * 3, sy + i * 8, T2 - i * 6, 7);
      }
      break;
    case 'chest': {
      const aberto = !!G.flags[`chest:${G.mapId}:${x},${y}`];
      const arteBau = arteTile(aberto ? 'tile_chest_open' : 'tile_chest');
      if (arteBau){ ctx.drawImage(arteBau, sx, sy, T2, T2); break; }
      drawTileArt('f', x, y, sx, sy, T2);
      const opened = aberto;
      ctx.fillStyle = opened ? '#4a3a20' : '#6a4a1a'; ctx.fillRect(sx + 5, sy + 12, 22, 15);
      ctx.fillStyle = opened ? '#5a4a30' : '#8a6a2a'; ctx.fillRect(sx + 7, sy + 14, 18, 11);
      ctx.fillStyle = opened ? '#3a3020' : '#eaca3a'; ctx.fillRect(sx + 14, sy + 17, 4, 5);
      ctx.fillStyle = opened ? '#3a2a12' : '#5a3a0a';
      ctx.fillRect(sx + 5, opened ? sy + 6 : sy + 9, 22, opened ? 5 : 4);
      break; }
    default:
      ctx.fillStyle = '#2a2636'; ctx.fillRect(sx, sy, T2, T2);
  }
}

/** Objetos altos (árvore/estante/pilar/braseiro) entram no y-sort. */
/* ===================================================================
   PROPS DE CENÁRIO
   O pacote traz 149 peças isoladas; o jogo carrega as que usa (ver
   assets/_props.py). Cada uma é desenhada com a BASE no pé da casa e
   centrada nela: a peça ocupa uma casa no chão e cresce para cima,
   exatamente como os objetos altos que já existiam. Assim uma torre de
   3 casas de altura continua sendo um obstáculo de uma casa só, e o
   personagem passa por trás dela sem truque nenhum — a lista de desenho
   já é ordenada por Y.
   =================================================================== */
function desenharProp(chave, sx, sy, o = {}){
  const img = chave && spriteImages[chave];
  if (!img || !(img.complete ?? true) || !(img.naturalWidth || img.width)) return false;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const e = o.escala ?? 1;
  const lw = Math.round(iw * e), lh = Math.round(ih * e);
  const bx = sx + TILE / 2, by = sy + TILE - (o.recuo ?? 2);
  if (o.sombra !== false){
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.32)';
    ctx.beginPath();
    ctx.ellipse(bx, by - 1, Math.min(lw * .40, TILE * .58), 5, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }
  ctx.drawImage(img, Math.round(bx - lw / 2), by - lh, lw, lh);
  return true;
}

/* Tile alto -> peça de cenário. Todo tipo alto usado nos mapas tem arte
   própria; o renderizador não deve voltar ao traço procedural em uma sala
   publicada. Mesa e estante usam peças geradas para a grade de 32px. */
const TALL_ART = {
  tree:   'prop_arvore',
  shelf:  'prop_estante_interior',
  table:  'prop_mesa_interior',
  pillar: 'prop_pilar',
  rubble: 'prop_entulho',
  save:   'prop_save',
};

function drawTallTile(ch, x, y, sx, sy){
  const t = Date.now();
  const idAlto = TILEDEF[ch].id;
  /* Uma variação por posição, para uma fileira de árvores não sair toda
     igual. É determinística (sai do x,y), então a mata não pisca. */
  if (idAlto === 'tree' && (x * 7 + y * 13) % 3 === 0 &&
      desenharProp('prop_arvore_escura', sx, sy)) return;
  if (TALL_ART[idAlto] && desenharProp(TALL_ART[idAlto], sx, sy)) return;
  switch(TILEDEF[ch].id){
    case 'tree':
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath();
      ctx.ellipse(sx + 16, sy + 29, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a3420'; ctx.fillRect(sx + 13, sy + 4, 7, 26);
      const sw = Math.sin(t / 900 + x) * 1.5;
      ctx.fillStyle = '#1e4020'; ctx.beginPath(); ctx.arc(sx + 16 + sw, sy - 6, 17, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a5a2a'; ctx.beginPath(); ctx.arc(sx + 12 + sw, sy - 10, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#356a30'; ctx.beginPath(); ctx.arc(sx + 20 + sw, sy - 14, 8, 0, Math.PI * 2); ctx.fill();
      break;
    case 'shelf':
      ctx.fillStyle = '#3a2a1e'; ctx.fillRect(sx, sy - 18, TILE, TILE + 18);
      ctx.fillStyle = '#4a3626'; ctx.fillRect(sx + 2, sy - 16, TILE - 4, TILE + 14);
      for (let i = 0; i < 3; i++){
        ctx.fillStyle = '#2a1e14'; ctx.fillRect(sx + 2, sy - 16 + i * 15, TILE - 4, 3);
        for (let b = 0; b < 5; b++){
          ctx.fillStyle = ['#7a3a4a','#3a5a7a','#6a6a3a','#5a3a6a','#3a6a5a'][(x + y + i + b) % 5];
          ctx.fillRect(sx + 4 + b * 5, sy - 12 + i * 15, 4, 10);
        }
      }
      break;
    case 'pillar':
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath();
      ctx.ellipse(sx + 16, sy + 29, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a4458'; ctx.fillRect(sx + 5, sy - 46, 22, 76);
      ctx.fillStyle = '#5a5468'; ctx.fillRect(sx + 7, sy - 46, 8, 76);
      ctx.fillStyle = '#39344a'; ctx.fillRect(sx + 2, sy - 52, 28, 8); ctx.fillRect(sx + 2, sy + 24, 28, 7);
      break;
    case 'brazier': {
      /* 120 ms por quadro: a chama bruxuleia RÁPIDO, mesmo período da
         senoide procedural. A sombra do chão continua sendo desenhada
         aqui e não vem na arte — assim ela acompanha o tint da região. */
      const arteB = quadroTile(TILE_BRASA, 120, x, y);
      if (arteB){
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath();
        ctx.ellipse(sx + 16, sy + 29, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
        const h = arteB.naturalHeight || arteB.height;
        const w = (arteB.naturalWidth || arteB.width);
        ctx.drawImage(arteB, sx + 16 - w / 2, sy + 31 - h, w, h);
        break;
      }
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath();
      ctx.ellipse(sx + 16, sy + 29, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a3040'; ctx.fillRect(sx + 13, sy + 4, 6, 25);
      ctx.fillStyle = '#4a4252'; ctx.fillRect(sx + 6, sy - 4, 20, 9);
      const f = Math.sin(t / 120 + x) * 3;
      ctx.save(); ctx.shadowColor = '#ff9a3a'; ctx.shadowBlur = 22;
      ctx.fillStyle = '#ff8a2a'; ctx.beginPath();
      ctx.moveTo(sx + 16, sy - 22 - f); ctx.lineTo(sx + 23, sy - 3); ctx.lineTo(sx + 9, sy - 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffdc6a'; ctx.beginPath();
      ctx.moveTo(sx + 16, sy - 14 - f * .6); ctx.lineTo(sx + 20, sy - 4); ctx.lineTo(sx + 12, sy - 4); ctx.closePath(); ctx.fill();
      ctx.restore(); break; }
    case 'table':
      ctx.fillStyle = '#4a3626'; ctx.fillRect(sx + 1, sy + 6, TILE - 2, 18);
      ctx.fillStyle = '#5c4432'; ctx.fillRect(sx + 1, sy + 6, TILE - 2, 5);
      ctx.fillStyle = '#33241a'; ctx.fillRect(sx + 3, sy + 24, 4, 6); ctx.fillRect(sx + TILE - 7, sy + 24, 4, 6);
      break;
    case 'rubble':
      ctx.fillStyle = '#332e3e'; ctx.fillRect(sx, sy + 10, TILE, 22);
      ctx.fillStyle = '#413a4e'; ctx.fillRect(sx + 3, sy + 6, 12, 12); ctx.fillRect(sx + 17, sy + 12, 11, 10);
      ctx.fillStyle = '#282434'; ctx.fillRect(sx + 8, sy + 20, 8, 6);
      break;
  }
}

function drawField(){
  const m = G.map, cam = G.camera;
  /* Registrada PRIMEIRO de propósito: `Clique.resolver` percorre de trás
     para frente, então quem chega depois (a HUD) ganha. O mundo é o
     último a ser considerado, que é o certo — ele está por baixo. */
  Clique.add(0, 0, W, H, cliqueNoMundo, {fundo:true});
  ctx.fillStyle = '#07070c'; ctx.fillRect(0, 0, W, H);
  const c0 = Math.max(0, Math.floor(cam.x / TILE)), r0 = Math.max(0, Math.floor(cam.y / TILE));
  const c1 = Math.min(m.w, c0 + Math.ceil(W / TILE) + 2), r1 = Math.min(m.h, r0 + Math.ceil(H / TILE) + 3);

  // camada de chão
  for (let y = r0; y < r1; y++) for (let x = c0; x < c1; x++){
    const ch = m.grid[y][x], td = TILEDEF[ch];
    const sx = Math.round(x * TILE - cam.x), sy = Math.round(y * TILE - cam.y);
    if (td && td.tall) drawTileArt(m.def.outdoor ? '.' : 'f', x, y, sx, sy, TILE);
    else drawTileArt(ch, x, y, sx, sy, TILE);
  }

  // camada com ordenação por Y (objetos altos + atores)
  const drawables = [];
  for (let y = r0; y < r1; y++) for (let x = c0; x < c1; x++){
    const ch = m.grid[y][x], td = TILEDEF[ch];
    if (td && td.tall) drawables.push({y:y * TILE + TILE, fn:() =>
      drawTallTile(ch, x, y, Math.round(x * TILE - cam.x), Math.round(y * TILE - cam.y))});
  }
  /* A decoração entra na MESMA fila dos atores: é isso que faz o
     personagem passar por trás de uma torre e na frente de um barril,
     sem nenhuma regra a mais. */
  for (const d of m.decor)
    drawables.push({y:d.y * TILE + TILE, fn:() =>
      desenharProp(d.s, Math.round(d.x * TILE - cam.x), Math.round(d.y * TILE - cam.y), d)});
  for (const mob of (m.mobs || [])) if (!mob.defeated) drawables.push({y:mob.py + TILE, fn:() =>
    drawFieldMob(mob, cam)});
  for (const n of m.npcs) drawables.push({y:n.py + TILE, fn:() =>
    drawActor(n, n.px - cam.x + TILE / 2, n.py - cam.y + TILE, {})});

  if (m.boss) drawables.push({y:m.boss.ty * TILE + TILE, fn:() => drawFieldBoss(m.boss, cam)});
  for (let i = G.followers.length - 1; i >= 0; i--){
    const f = G.followers[i];
    drawables.push({y:f.py + TILE, fn:() =>
      drawActor({...f, sheet:folhaDe(f.char) || f.sheet},
                f.px - cam.x + TILE / 2, f.py - cam.y + TILE, {})});
  }
  const p = G.player, lead = leaderChar();
  /* Sem líder o campo não desenha o boneco, mas TAMBÉM não estoura.
     Acontecia num caso real: qualquer tela que desenha o campo por
     baixo (menu, loja) rodando antes de o elenco existir derrubava o
     jogo com "cannot read 'sheet' of undefined". */
  /* Madao parado (v5.32): depois de alguns segundos sem andar, troca pra
     forma Papelão em campo também — até aqui só existia em combate
     (`papelaoT`, ver combat/27-controller.js). `madao_papelao_sheet`
     estava catalogada desde a v5.32 sem nenhum consumidor (ver
     00-assets.js); aqui ela finalmente aparece, e a piada bate com a
     própria descrição dele ("se esconde atrás de uma caixa"). Some
     assim que ele volta a andar — `p.idleT` zera a cada passo. */
  const folhaLider = lead && lead.name === 'Madao' && (p.idleT || 0) > 4 && spriteImages.madao_papelao_sheet
    ? 'madao_papelao_sheet' : lead && folhaDe(lead);
  if (lead) drawables.push({y:p.py + TILE, fn:() => {
    drawActor({...p, sheet:folhaLider}, p.px - cam.x + TILE / 2, p.py - cam.y + TILE, {});
    pxText(lead.name, p.px - cam.x + TILE / 2, p.py - cam.y - 40,
      {size:7, color:ELEM[lead.element].glow, align:'center', glow:ELEM[lead.element].main, blur:6});
  }});
  /* O pet acompanha SEM ocupar casa: ele flutua ao lado do líder em vez
     de entrar na fila de seguidores. É de propósito — seguidor ocupa
     tile e vira obstáculo, e o jogo acabou de apanhar por causa de
     obstáculo em corredor. Um companheiro que não bloqueia nada é a
     escolha certa aqui. Arte ainda é procedural: entra na fila de
     sprites junto com o resto. */
  {
    const pet = petAtivo();
    if (pet){
      const t = Date.now();
      /* O afastamento lateral tem que passar da LARGURA do chibi, senão o
         pet nasce embaixo do líder e a arte some. E ele entra na fila
         DEPOIS do líder (`+1`): flutuando ao lado, ficar por cima é o que
         parece certo — por baixo, some de novo em qualquer aproximação. */
      const px2 = p.px - cam.x + TILE / 2 + Math.sin(t / 700) * 5 + 30;
      const py2 = p.py - cam.y + TILE - 6 + Math.cos(t / 520) * 4;
      drawables.push({y:p.py + TILE + 1, fn:() => desenharPet(pet, px2, py2)});
    }
  }
  drawables.sort((a, b) => a.y - b.y).forEach(d => d.fn());

  // atmosfera
  if (m.def.tint){ ctx.fillStyle = m.def.tint; ctx.fillRect(0, 0, W, H); }
  /* O véu de dia e noite só cai onde há céu. Debaixo da terra a hora não
     muda nada do que o jogador vê, e escurecer a cisterna às 20h seria
     inventar uma janela que não existe. O véu vem DEPOIS do tint do mapa
     e ANTES da vinheta: o tint é a cor do lugar, a luz é a cor da hora, e
     a vinheta fecha as bordas por cima das duas. */
  if (m.def.outdoor){
    const luz = luzAgora();
    if (luz.escuro > 0.003){
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      /* Sem passar pelo tema: a cor da hora não é cor de interface. Um
         tema âmbar não pode pintar o entardecer de outra cor — e o
         `anoitecer` cai bem dentro da faixa de matiz que o tema gira,
         então isto não é precaução, é conserto. */
      pintarSemTema('fillStyle', luz.css);
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }
  const vg = ctx.createRadialGradient(W/2, H/2, H*0.32, W/2, H/2, H*0.82);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  drawFieldHUD();
}

/* Até a v5.32 isto desenhava um triângulo genérico com dois olhos —
   um placeholder que TODO chefe usava no campo, mesmo já tendo arte
   própria de batalha havia versões. A regra do projeto é não ter
   placeholder nenhum quando existe arte real, então agora usa o mesmo
   sprite da batalha (`b.sprite`, carregado em `loadMap`). O triângulo
   só continua existindo como rede de segurança para o caso hipotético
   de um chefe sem sprite nenhum — nenhum dos existentes cai nesse
   caminho hoje. */
function drawFieldBoss(b, cam){
  const sx = b.tx * TILE - cam.x + TILE / 2, sy = b.ty * TILE - cam.y + TILE;
  const t = Date.now(), fl = Math.sin(t / 700) * 5;
  const img = b.sprite && spriteImages[b.sprite];
  const pronta = img?.complete && (img.naturalWidth || img.width);
  ctx.save();
  if (b.eco) ctx.globalAlpha = 0.42;
  else {
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath();
    ctx.ellipse(sx, sy + 2, 34, 10, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowColor = b.accent; ctx.shadowBlur = b.eco ? 16 : 30;

  if (pronta){
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const dh = 84, dw = iw / ih * dh;
    ctx.drawImage(img, sx - dw / 2, sy - dh + fl, dw, dh);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.moveTo(sx, sy - 92 + fl); ctx.lineTo(sx + 32, sy - 10 + fl);
    ctx.lineTo(sx - 32, sy - 10 + fl); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    const ep = Math.sin(t / 260) * .35 + .65;
    ctx.globalAlpha *= ep; ctx.fillStyle = b.accent;
    ctx.fillRect(sx - 14, sy - 52 + fl, 9, 5); ctx.fillRect(sx + 5, sy - 52 + fl, 9, 5);
  }
  ctx.restore();
  if (b.eco){
    const n = G.revanches[b.id] || 0;
    pxText(n >= REVANCHE_TETO ? '◇' : '◈', sx, sy - 104 + fl,
           {size:11, color:'#9a8aca', align:'center', glow:'#5a4a8a'});
  } else {
    pxText('!', sx, sy - 104 + fl, {size:14, color:'#ff6a6a', align:'center', glow:'#ff2a2a'});
  }
}

/* As artes de criatura existentes são imagens únicas, não sheets 3×4.
   Mantemos a altura de 84 px prevista para mob estático e só animamos a
   posição da entidade; se uma arte falhar, o marcador procedural deixa
   o encontro utilizável em vez de sumir ou quebrar o campo. */
function drawFieldMob(mob, cam){
  const sx = mob.px - cam.x + TILE / 2, sy = mob.py - cam.y + TILE;
  const fl = Math.sin(Date.now() / 640 + mob.homeX * .7 + mob.homeY) * 2;
  const img = mob.sprite && spriteImages[mob.sprite];
  const pronta = img?.complete && (img.naturalWidth || img.width);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.beginPath();
  ctx.ellipse(sx, sy + 1, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = mob.accent || '#b89aff'; ctx.shadowBlur = 16;
  if (pronta){
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const dh = 84, dw = iw / ih * dh;
    ctx.drawImage(img, sx - dw / 2, sy - dh + fl, dw, dh);
  } else {
    ctx.fillStyle = mob.color || '#4a405c';
    ctx.beginPath(); ctx.arc(sx, sy - 28 + fl, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = mob.accent || '#d8c8ff';
    ctx.fillRect(sx - 8, sy - 31 + fl, 5, 4); ctx.fillRect(sx + 3, sy - 31 + fl, 5, 4);
  }
  ctx.restore();
  pxText('!', sx, sy - 92 + fl, {size:13, color:'#ff8a8a', align:'center', glow:'#7a2020'});
}
