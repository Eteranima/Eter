/* ===================================================================
   7c. HUD DE CAMPO
   Mesmas regras da HUD de combate: as zonas moram numa tabela só, o
   desenho lê dali e o autoteste confere contra dali. O que mudou desde
   a v5.10 é que o campo deixou de ser texto solto no canto e passou a
   ter as mesmas peças do mockup de Porto Lúmina — placa do lugar,
   recursos, minimapa, cartões do grupo e a régua de botões.

   A 800×600 o mockup não cabe copiado: ele é 1536×1024, quase o triplo
   de área, e reproduzi-lo em escala deixaria o mapa do tamanho de um
   selo. Então as peças são as mesmas, em tamanho de HUD e não de moldura
   — o mapa continua sendo o que ocupa a tela.
   =================================================================== */
const HUD_MUNDO = {
  local:    {x:  8, y:  8, w:238, h: 34},
  missao:   {x:  8, y: 46, w:238, h: 80},
  recursos: {x:552, y:  8, w:240, h: 34},
  minimapa: {x:664, y: 50, w:128, h:128},
  grupo:    {x:  8, y:472, w:216, h:120},
  botoes:   {x:502, y:544, w:290, h: 48},
  atalhos:  {x:232, y:552, w:264, h: 40},
};

/* Os cinco botões da HUD. `pagina` é a mesma id de `Menu.ROOT`, então
   botão e menu não podem discordar sobre para onde vão. */
const BOTOES_RAPIDOS = [
  {id:'mapa',    pagina:null,     tecla:'M', rotulo:'Mapa',    icone:'ui_menu_missoes'},
  {id:'bolsa',   pagina:'items',  tecla:'I', rotulo:'Bolsa',    icone:'ui_menu_inventario'},
  {id:'arvore',  pagina:'skills', tecla:'K', rotulo:'Árvore',   icone:'ui_menu_habilidades'},
  {id:'missoes', pagina:'quests', tecla:'J', rotulo:'Missões',  icone:'ui_menu_missoes'},
  {id:'status',  pagina:'status', tecla:'U', rotulo:'Status',   icone:'ui_menu_grupo'},
  {id:'menu',    pagina:'root',   tecla:'C', rotulo:'Menu',     icone:'ui_menu_config'},
];

/* Cor de cada tipo de chão no minimapa. Não é a cor da arte: é a cor que
   faz o DESENHO do mapa aparecer numa moeda de 128px, onde textura não
   se lê e só a mancha comunica. Chão que dá para pisar é claro, parede é
   escura, e o que interessa (porta, baú, save) é dourado. */
const COR_MINIMAPA = {
  grass:'#3c6b39', path:'#8a8270', dirt:'#6b5a42', crack:'#4a4458',
  floor:'#6a6480', carpet:'#7a4a6a', water:'#2a4a8a',
  wall:'#241f30', tree:'#274a26', shelf:'#3a3048', table:'#3a3048',
  pillar:'#3a3048', rubble:'#332b3a', brazier:'#8a5a2a',
  door:'#e8c25a', stairs:'#e8c25a', chest:'#eaca3a', save:'#7ad0ff',
};
const MINI_TILES = 21;      // quantos tiles cabem no diâmetro

/* Que marcador um NPC merece. Missão pronta vence missão em andamento,
   que vence loja: é a ordem do que o jogador quer achar primeiro. */
function marcaDoNPC(n){
  if (n.quest){
    const st = questState(n.quest);
    if (st === 'ativa' && questReady(n.quest)) return 'missao';
    if (!st) return 'missao';          // ainda por aceitar
  }
  if (n.shop) return 'loja';
  return null;
}

/* Os marcadores do minimapa. Chave semântica: a arte vem dos ícones da
   legenda do mockup de mundo, e sem ela cai num losango colorido — que
   é ruim, mas ainda diz onde a coisa está. */
const MARCA_MINI = {
  loja:      {arte:'ui_leg_loja',       cor:'#7ad0ff'},
  missao:    {arte:'ui_leg_missao',     cor:'#ffe44a'},
  save:      {arte:'ui_leg_salvamento', cor:'#a8ffd0'},
  teleporte: {arte:'ui_leg_teleporte',  cor:'#8ab0fa'},
  evento:    {arte:'ui_leg_evento',     cor:'#c8a0ff'},
};
function marcadorMini(x, y, tipo){
  const d = MARCA_MINI[tipo]; if (!d) return;
  const a = arteUI(d.arte);
  if (a) ctx.drawImage(a, Math.round(x) - 5, Math.round(y) - 5, 10, 10);
  else {
    ctx.save(); ctx.fillStyle = d.cor;
    ctx.beginPath();
    ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 4, y);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

/** O minimapa: uma janela redonda do mapa em volta do jogador. */
function drawMinimapa(){
  const z = HUD_MUNDO.minimapa, m = G.map;
  const cx = z.x + z.w / 2, cy = z.y + z.h / 2, r = z.w / 2 - 4;
  ctx.save();
  // fundo e recorte redondo
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,8,22,.82)'; ctx.fill();
  if (m){
    ctx.save(); ctx.clip();
    const passo = (r * 2) / MINI_TILES;
    const px = G.player.px / TILE, py = G.player.py / TILE;
    const meio = MINI_TILES / 2;
    const c0 = Math.floor(px - meio) - 1, c1 = Math.ceil(px + meio) + 1;
    const r0 = Math.floor(py - meio) - 1, r1 = Math.ceil(py + meio) + 1;
    for (let y = r0; y <= r1; y++){
      if (y < 0 || y >= m.h) continue;
      for (let x = c0; x <= c1; x++){
        if (x < 0 || x >= m.w) continue;
        const td = TILEDEF[m.grid[y][x]];
        const cor = td && COR_MINIMAPA[td.id];
        if (!cor) continue;
        ctx.fillStyle = cor;
        ctx.fillRect(Math.round(cx + (x - px) * passo), Math.round(cy + (y - py) * passo),
                     Math.ceil(passo), Math.ceil(passo));
      }
    }
    /* Marcadores. A regra é a mesma da legenda do mockup, mas só entra o
       que o jogo REALMENTE tem: loja e save existem, pousada não existe
       neste jogo e por isso não tem marcador — legenda que promete o que
       não há é pior que legenda curta.
       Ordem de desenho = ordem de importância: o ponto de NPC comum vai
       primeiro e pode ser tapado; missão e loja vão por cima. */
    for (const n of m.npcs){
      const nx = cx + (n.px / TILE - px) * passo, ny = cy + (n.py / TILE - py) * passo;
      if ((nx-cx)**2 + (ny-cy)**2 > r*r) continue;
      const marca = marcaDoNPC(n);
      if (marca) marcadorMini(nx, ny, marca);
      else { ctx.fillStyle = '#c8b0ff'; ctx.fillRect(Math.round(nx) - 1, Math.round(ny) - 1, 3, 3); }
    }
    // save e baú saem do próprio mapa, não de NPC
    for (let y = r0; y <= r1; y++){
      if (y < 0 || y >= m.h) continue;
      for (let x = c0; x <= c1; x++){
        if (x < 0 || x >= m.w) continue;
        const td = TILEDEF[m.grid[y][x]];
        if (!td) continue;
        const mx = cx + (x - px) * passo, my = cy + (y - py) * passo;
        if ((mx-cx)**2 + (my-cy)**2 > r*r) continue;
        if (td.save) marcadorMini(mx + passo/2, my + passo/2, 'save');
        else if (td.warp) marcadorMini(mx + passo/2, my + passo/2, 'teleporte');
      }
    }
    if (m.boss){
      const bx = cx + (m.boss.tx - px) * passo, by = cy + (m.boss.ty - py) * passo;
      if ((bx-cx)**2 + (by-cy)**2 <= r*r)
        pxText('!', bx, by + 3, {size:8, color:'#ff6a6a', align:'center', glow:'#ff2a2a'});
    }
    ctx.restore();
  }
  // o jogador fica sempre no centro, apontando para onde anda
  const ang = {up:-Math.PI/2, down:Math.PI/2, left:Math.PI, right:0}[G.player.dir] || 0;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
  ctx.fillStyle = '#ffe44a'; ctx.shadowColor = '#ffb020'; ctx.shadowBlur = 6;
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  // moldura e norte
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = UI.borda; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  pxText('N', cx, z.y + 8, {size:7, color:'#a89ac0', align:'center'});
  // nome do lugar, embaixo, como no mockup
  const nome = MAPS[G.mapId]?.name || '';
  if (nome){
    const curto = (nome.includes('—') ? nome.split('—').pop() : nome).trim().slice(0, 18);
    panel(z.x + 4, z.y + z.h - 2, z.w - 8, 20, {alpha:.8, gemaBase:false});
    pxText(curto, cx, z.y + z.h + 12, {size:6, color:'#c0b4d8', align:'center'});
  }
}

/* Andar com o mouse. Sem busca de caminho: o passo vai no eixo em que a
   distância é maior e, se aquele lado estiver bloqueado, tenta o outro.
   É o suficiente para contornar quina e parede reta, que é o caso comum
   de um mapa de grade — e é previsível, que importa mais aqui do que ser
   esperto: o jogador vê para onde o boneco vai antes de soltar o botão. */
function passoParaPonteiro(){
  const p = G.player;
  const alvoX = Math.floor((Clique.x + G.camera.x) / TILE);
  const alvoY = Math.floor((Clique.y + G.camera.y) / TILE);
  const dx = alvoX - p.tx, dy = alvoY - p.ty;
  if (!dx && !dy) return;
  const horiz = Math.abs(dx) >= Math.abs(dy);
  const primeiro = horiz ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  const segundo  = horiz ? (dy > 0 ? 'down' : dy < 0 ? 'up' : null)
                         : (dx > 0 ? 'right' : dx < 0 ? 'left' : null);
  const livre = d => { const [ax, ay] = DIRV[d]; return !isSolid(p.tx + ax, p.ty + ay); };
  if (livre(primeiro)) tryStep(primeiro);
  else if (segundo && livre(segundo)) tryStep(segundo);
  else p.dir = primeiro;          // encostou: ao menos vira para o lado certo
}

/* Clique no mundo (não na HUD). Casa vizinha = interagir; longe, quem
   move é o segurar do botão. */
function cliqueNoMundo(){
  const p = G.player;
  const tx = Math.floor((Clique.x + G.camera.x) / TILE);
  const ty = Math.floor((Clique.y + G.camera.y) / TILE);
  const dx = tx - p.tx, dy = ty - p.ty;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return;
  p.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
  if (!p.moving) interact();
}

/* O que está na casa à frente. É a MESMA busca que `interact()` faz, e
   por isso o atalho na tela nunca promete o que a tecla não vai
   entregar. Devolve só o rótulo, que é tudo que a HUD precisa. */
function alvoNaFrente(){
  const m = G.map, p = G.player;
  if (!m) return null;
  const [dx, dy] = DIRV[p.dir] || [0, 0];
  const tx = p.tx + dx, ty = p.ty + dy;
  const npc = m.npcs.find(n => n.tx === tx && n.ty === ty);
  if (npc) return npc.shop ? 'Comprar' : 'Falar';
  if (m.boss && m.boss.tx === tx && m.boss.ty === ty)
    return m.boss.eco ? 'Eco' : 'Enfrentar';
  if ((m.signs || []).some(s => s.x === tx && s.y === ty)) return 'Ler';
  if ((m.decor || []).some(d => d.x === tx && d.y === ty && d.text)) return 'Examinar';
  if ((m.chests || []).some(c => c.x === tx && c.y === ty && !G.flags[c.flag])) return 'Abrir';
  const t = tileAt(tx, ty);
  if (t && t.save) return 'Salvar';
  return null;
}

/* A régua do rodapé. Vive no vão entre os cartões do grupo e os botões —
   é o único espaço horizontal que sobrou, e fica embaixo, onde o olho
   procura ajuda de comando.

   O nome tem `Campo` no fim de propósito: o combate já tem uma
   `drawZonaAtalhos`, e como os dez arquivos viram um script só, dois
   nomes iguais não dão erro — o último a ser declarado simplesmente
   engole o primeiro. Foi o que aconteceu na primeira volta: a régua do
   COMBATE apareceu no meio do campo. O `build.sh` agora recusa nomes
   repetidos. */
function drawAtalhosCampo(){
  const z = HUD_MUNDO.atalhos;
  const alvo = alvoNaFrente();
  const linhas = [
    [['Z', alvo || 'Confirmar'], ['X', 'Voltar']],
    [['Shift', 'Correr'],        ['TAB', 'Líder']],
  ];
  panel(z.x, z.y, z.w, z.h, {alpha:.6, gemaBase:false, gemaTopo:false});
  const cap = arteUI('ui_tecla');
  linhas.forEach((linha, li) => {
    linha.forEach(([tecla, rot], ci) => {
      const x = z.x + 8 + ci * (z.w - 16) / 2, y = z.y + 12 + li * 16;
      const lw = Math.max(13, tecla.length * 5 + 8);
      if (cap) ctx.drawImage(cap, x, y - 8, lw, 11);
      else {
        ctx.fillStyle = 'rgba(20,16,42,.9)'; ctx.fillRect(x, y - 8, lw, 11);
        ctx.strokeStyle = '#5a4a7a'; ctx.lineWidth = 1;
        ctx.strokeRect(x + .5, y - 7.5, lw - 1, 10);
      }
      pxText(tecla, x + lw / 2, y, {size:5, color:'#d0c8e0', align:'center'});
      /* O rótulo do Z muda com o que está na frente, e fica amarelo
         quando há algo: é o aviso de "dá para fazer alguma coisa aqui". */
      uiText(rot, x + lw + 5, y + 1,
             {size:10, color:(li === 0 && ci === 0 && alvo) ? '#ffe44a' : '#8a7aaa'});
    });
  });
}

/** A missão que o painel mostra: a que está PRONTA para entregar tem
 *  prioridade sobre as em andamento — é a informação que muda o que o
 *  jogador faz agora. Sem missão ativa, devolve null e o painel some. */
function missaoAtiva(){
  const ativas = activeQuests();
  if (!ativas.length) return null;
  const id = ativas.find(q => questReady(q)) || ativas[0];
  return {id, q:QUESTS[id], p:questProgress(id), pronta:questReady(id)};
}

/* Painel de objetivo atual. Só existe quando há missão: painel vazio
   ocupando canto de tela é pior que canto de tela vazio. */
function drawZonaMissao(){
  const m = missaoAtiva();
  if (!m) return;
  const z = HUD_MUNDO.missao;
  panel(z.x, z.y, z.w, z.h, {alpha:.74, gemaBase:false,
                             accent:m.pronta ? '#7ada7a' : null});
  pxText('OBJETIVO ATUAL', z.x + 10, z.y + 16, {size:6, color:'#8a7aaa'});

  const mk = arteUI('ui_marcador_missao');
  if (mk) ctx.drawImage(mk, z.x + 10, z.y + 22, 12, 12);
  pxText(m.q.titulo.slice(0, 22), z.x + (mk ? 26 : 10), z.y + 32,
         {size:7, color:m.pronta ? '#9ada9a' : '#ffe44a'});

  uiText(m.q.resumo.slice(0, 46), z.x + 10, z.y + 48, {size:11, color:'#a89ac0'});

  // barra de progresso: "6 de 6" é mais claro que uma barra sozinha
  const frac = m.p.alvo ? m.p.feito / m.p.alvo : 0;
  bar(z.x + 10, z.y + 56, z.w - 64, 5, frac,
      m.pronta ? '#3a8a3a' : '#6a3a9a', m.pronta ? '#7ada7a' : '#b89aff');
  pxText(`${m.p.feito}/${m.p.alvo}`, z.x + z.w - 10, z.y + 61,
         {size:6, color:'#c0b4d8', align:'right'});

  const cap = arteUI('ui_tecla');
  if (cap) ctx.drawImage(cap, z.x + 10, z.y + z.h - 17, 13, 11);
  pxText('J', z.x + 16, z.y + z.h - 9, {size:5, color:'#d0c8e0', align:'center'});
  uiText(m.pronta ? 'pronta para entregar' : 'ver detalhes',
         z.x + 28, z.y + z.h - 8,
         {size:11, color:m.pronta ? '#9ada9a' : '#7a6a9a'});
}

/** Placa do lugar: emblema + nome, sempre visível. */
function drawZonaLocal(){
  const z = HUD_MUNDO.local;
  panel(z.x, z.y, z.w, z.h, {alpha:.78, gemaBase:false});
  const em = arteUI('ui_emblema_local');
  if (em) ctx.drawImage(em, z.x + 5, z.y + 5, 24, 24);
  /* O nome dos mapas vem como "Região — Lugar". O mockup separa as duas
     coisas: o título grande é a cidade e o rótulo do minimapa é o bairro.
     Aqui é a mesma divisão, e de quebra o nome para de ser cortado no
     meio da palavra para caber na placa. */
  const inteiro = MAPS[G.mapId]?.name || '—';
  const regiao = inteiro.includes('—') ? inteiro.split('—')[0].trim() : inteiro;
  pxText(regiao.slice(0, 24), z.x + (em ? 34 : 12), z.y + 22, {size:8, color:'#c8b0ff'});
}

/** Ouro, relógio e o sol/lua da hora. */
function drawZonaRecursos(){
  const z = HUD_MUNDO.recursos;
  panel(z.x, z.y, z.w, z.h, {alpha:.78, gemaBase:false});
  const mo = arteUI('ui_icone_ouro');
  if (mo) ctx.drawImage(mo, z.x + 8, z.y + 9, 16, 16);
  pxText(`${G.gold}`, z.x + (mo ? 30 : 10), z.y + 22, {size:8, color:'#eaca3a'});
  // divisória entre dinheiro e tempo: são duas leituras diferentes
  ctx.fillStyle = 'rgba(140,110,220,.3)';
  ctx.fillRect(z.x + z.w * .46, z.y + 7, 1, z.h - 14);
  pxText(relogioTexto(), z.x + z.w - 30, z.y + 15, {size:6, color:'#c0b4d8', align:'right'});
  pxText(faseAtual().nome, z.x + z.w - 30, z.y + 27,
         {size:6, align:'right', color:ehNoite() ? '#8ab0fa' : '#c8b090'});
  const astro = arteUI(ehNoite() ? 'ui_icone_lua' : 'ui_icone_sol');
  if (astro) ctx.drawImage(astro, z.x + z.w - 25, z.y + 8, 18, 18);
  else pxText(ehNoite() ? '☾' : '☀', z.x + z.w - 16, z.y + 24,
              {size:10, color:ehNoite() ? '#8ab0fa' : '#ffd24a', align:'center'});
}

/** Cartões do grupo: retrato, nome, vida e mana. */
function drawZonaGrupoCampo(){
  const z = HUD_MUNDO.grupo, ap = activeParty();
  if (!ap.length) return;
  const lh = Math.min(24, (z.h - 8) / ap.length);
  panel(z.x, z.y, z.w, Math.min(z.h, ap.length * lh + 8), {alpha:.6, gemaBase:false});
  ap.forEach((c, i) => {
    const y = z.y + 6 + i * lh, E = ELEM[c.element], vivo = c.hp > 0;
    desenharRetrato(c, z.x + 5, y, 18, lh - 3, {alpha:vivo ? 1 : .3});
    pxText(c.name.slice(0, 7), z.x + 27, y + 10,
           {size:6, color:vivo ? E.glow : '#6a5a5a'});
    bar(z.x + 84, y + 3, 92, 5, c.hp / c.maxHp, '#3a8a3a', '#5aba5a');
    bar(z.x + 84, y + 10, 92, 4, c.mp / c.maxMp, '#3a5a9a', '#5a8afa');
    if (c.reso >= 100)
      pxText('★', z.x + z.w - 10, y + 11, {size:7, color:'#ffe44a', glow:'#ffb020', align:'right'});
  });
}

/** A régua de botões. Cada um abre o menu direto na sua página. */
function drawBotoesRapidos(){
  const z = HUD_MUNDO.botoes;
  const n = BOTOES_RAPIDOS.length;
  const larg = (z.w - (n - 1) * 4) / n;
  BOTOES_RAPIDOS.forEach((b, i) => {
    const x = z.x + i * (larg + 4);
    /* Registra o botão para o mouse. A ação é a MESMA que a tecla
       dispara, então clicar e apertar levam ao mesmo lugar sem um
       segundo caminho de código para manter em pé. */
    Clique.add(x, z.y, larg, z.h, b.id === 'menu' ? 'menu' : b.id);
    const sob = Clique.emCima(x, z.y, larg, z.h);
    panel(x, z.y, larg, z.h, {alpha:sob ? .92 : .72, gemaBase:false, gemaTopo:false});
    /* O realce é CLARIDADE, não cor. Trocar o `accent` não servia: o tema
       gira o matiz de tudo junto, então a cor de destaque virava a mesma
       cor da borda normal e os cinco botões ficavam idênticos. Um véu
       branco sobrevive a qualquer tema porque branco não tem matiz. */
    if (sob){
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      ctx.fillRect(x + 2, z.y + 2, larg - 4, z.h - 4);
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, z.y + 1, larg - 2, z.h - 2);
      ctx.restore();
    }
    const ic = arteUI(b.icone);
    if (ic) ctx.drawImage(ic, x + larg / 2 - 11, z.y + 4, 22, 22);
    else pxText(b.rotulo.slice(0, 1), x + larg / 2, z.y + 21,
                {size:11, color:'#c8b0ff', align:'center'});
    pxText(b.rotulo, x + larg / 2, z.y + 36, {size:6, color:'#a89ac0', align:'center'});
    // a tecla, no canto, do jeito que o mockup mostra
    const cap = arteUI('ui_tecla');
    if (cap) ctx.drawImage(cap, x + larg - 15, z.y + 2, 13, 11);
    pxText(b.tecla, x + larg - 9, z.y + 10, {size:5, color:'#d0c8e0', align:'center'});
  });
}

function drawFieldHUD(){
  /* O aviso de mapa novo continua, mas agora é só o BANNER de chegada: o
     nome fixo do lugar mudou de lugar e vive na placa, que não some. */
  if (G.banner.t > 0){
    const a = clamp(G.banner.t, 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    const larg = Math.max(220, G.banner.text.length * 9 + 28);
    panel(W / 2 - larg / 2, 200, larg, 34, {alpha:.86});
    pxText(G.banner.text, W / 2, 222, {size:9, color:'#b89aff', align:'center'});
    ctx.restore();
  }
  drawZonaLocal();
  drawZonaMissao();
  drawZonaRecursos();
  drawMinimapa();
  drawZonaGrupoCampo();
  drawAtalhosCampo();
  drawBotoesRapidos();
  // quem ficou no banco: linha discreta acima dos cartões
  const banco = benchNames();
  if (banco.length)
    pxText(`reserva: ${banco.join(', ').slice(0, 30)}`, HUD_MUNDO.grupo.x + 4,
           HUD_MUNDO.grupo.y - 10, {size:6, color:'#6a6288'});
}
