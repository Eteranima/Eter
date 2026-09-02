/* ===================================================================
   11. COMBATE — VIEW
   =================================================================== */
/* --- Fundo de batalha em arte, com animação ------------------------

   A folha é uma grade de células de 800×600 — o tamanho da tela. O
   número de quadros NÃO é configurado em lugar nenhum: sai da divisão
   das dimensões da imagem pelas da tela. Uma folha 3200×1800 é 4×3 =
   12 quadros; uma imagem 800×600 solta é 1×1 = um quadro, ou seja, um
   papel de parede estático pelo mesmo caminho de código. Fixar o
   número numa constante seria mais um lugar para desencontrar da arte.

   Sem folha, `drawBattleBG` desenha o fundo procedural de sempre. É o
   mesmo contrato dos tiles, das molduras e dos ícones. */
const FUNDO_BATALHA = {
  fps: 6,
  /* Vai-e-volta: 1→N→1 em vez de 1→N→1 cortado. Dá quase o dobro de
     passos pelo preço dos mesmos quadros e nunca tem emenda, mas só
     serve para movimento que pulsa. Deriva direcional em vai-e-volta
     parece que a névoa deu meia-volta. */
  vaivem: false,
};

/** A folha de fundo da luta atual, ou null.
 *
 *  O MAPA ganha da região quando tem folha própria. É o que dá cara
 *  separada à sala de chefe: a Última Prateleira é o salão apodrecido no
 *  fim do Arquivo, e repetir ali a estante do corredor jogaria fora a
 *  única tela em que o jogador para para olhar. Sem folha de mapa, cai
 *  na da região; sem nenhuma das duas, no fundo procedural. */
function folhaFundoBatalha(){
  const m = G.map?.id, r = G.map?.def.region;
  return (m && arteUI('battle_bg_' + m)) || (r && arteUI('battle_bg_' + r)) || null;
}

/** Desenha um quadro da folha cobrindo a tela. false = não há folha. */
function desenharFundoEmArte(){
  const img = folhaFundoBatalha();
  if (!img) return false;
  const cols = Math.max(1, Math.round((img.naturalWidth  || img.width)  / W));
  const rows = Math.max(1, Math.round((img.naturalHeight || img.height) / H));
  const total = cols * rows;
  let i = 0;
  if (total > 1){
    const passo = Math.floor(Date.now() / (1000 / FUNDO_BATALHA.fps));
    if (FUNDO_BATALHA.vaivem){
      const ciclo = total * 2 - 2;              // 1..N..2
      const k = ((passo % ciclo) + ciclo) % ciclo;
      i = k < total ? k : ciclo - k;
    } else {
      i = ((passo % total) + total) % total;
    }
  }
  const cw = (img.naturalWidth  || img.width)  / cols;
  const ch = (img.naturalHeight || img.height) / rows;
  ctx.drawImage(img, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch, 0, 0, W, H);

  /* Véu no rodapé.

     A régua de atalhos é o único pedaço da HUD sem painel atrás — ela
     escreve direto sobre o fundo. Com o procedural isso nunca foi
     problema, porque ele é escuro ali por construção. Com arte, é:
     medido nas sete regiões, o contraste do texto da régua fica entre 16
     e 26 níveis, menos na Coroa de Vidro, que é branca e cai para 14.

     Escurece só de y=500 para baixo, onde 84% da tela já está atrás de
     painel — custa quase nada de arte e recupera a régua.

     Cinza puro, não preto-azulado: `transformarCor` gira qualquer matiz
     dentro de [238,292], e um véu levemente azul cai bem no meio dessa
     faixa. Com saturação zero ele não tem matiz para girar e o tema do
     menu não mexe nele. */
  const veu = ctx.createLinearGradient(0, 500, 0, H);
  veu.addColorStop(0, 'rgba(7,7,7,0)');
  veu.addColorStop(1, 'rgba(7,7,7,.62)');
  ctx.fillStyle = veu;
  ctx.fillRect(0, 500, W, H - 500);
  return true;
}

function drawBattleBG(){
  /* Arte manda. Ela já traz céu, chão, silhueta e névoa pintados; somar
     o procedural por cima sujaria a pintura em vez de completá-la. */
  if (desenharFundoEmArte()) return;
  const region = G.map?.def.region || 'patio';
  const t = Date.now();
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  if (region === 'undercroft'){ sky.addColorStop(0, '#140a20'); sky.addColorStop(1, '#07050c'); }
  else { sky.addColorStop(0, '#181228'); sky.addColorStop(1, '#0a0810'); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  const gr = ctx.createRadialGradient(300, 150, 20, 300, 150, 340);
  gr.addColorStop(0, Battle.isBoss ? 'rgba(120,30,140,.32)' : 'rgba(60,30,100,.3)');
  gr.addColorStop(1, 'rgba(10,8,16,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

  // silhuetas de fundo
  ctx.fillStyle = region === 'undercroft' ? '#100c1c' : '#12101f';
  for (let i = 0; i < 7; i++){
    const bx = i * 130 - 40, bh = 90 + ((i * 37) % 70);
    ctx.fillRect(bx, 300 - bh, 96, bh);
    ctx.beginPath(); ctx.moveTo(bx - 6, 300 - bh); ctx.lineTo(bx + 48, 300 - bh - 34);
    ctx.lineTo(bx + 102, 300 - bh); ctx.closePath(); ctx.fill();
  }
  // chão
  const gg = ctx.createLinearGradient(0, 300, 0, H);
  gg.addColorStop(0, region === 'undercroft' ? '#171024' : '#16121f');
  gg.addColorStop(1, '#0b0812');
  ctx.fillStyle = gg; ctx.fillRect(0, 300, W, H - 300);
  ctx.strokeStyle = 'rgba(110,70,170,.09)'; ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++){ ctx.beginPath(); ctx.moveTo(i * 45 - 90, 300); ctx.lineTo(i * 62 - 190, H); ctx.stroke(); }
  for (let i = 0; i < 9; i++){ const y = 300 + i * i * 4.6 + 8; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // névoa
  ctx.globalAlpha = .12 + Math.sin(t / 2200) * .04;
  ctx.fillStyle = Battle.isBoss ? '#8a3aca' : '#4a3a7a';
  ctx.fillRect(0, 285, W, 40); ctx.globalAlpha = 1;
}

function drawEnemyUnit(u, targeted){
  const t = Date.now();
  const dead = !isAlive(u);
  const alpha = dead ? Math.max(0, 1 - u.dieT) : 1;
  if (alpha <= 0) return;
  const lunge = u.lungeT > 0 ? Math.sin(u.lungeT * Math.PI) * 34 : 0;
  const float = Math.sin(t / 760 + u.float) * (u.shape === 'wisp' ? 8 : 4);
  const x = u.bx + lunge, y = u.by + float;
  const E = ELEM[u.element];
  const flash = u.hurtT > 0 && Math.floor(u.hurtT * 30) % 2 === 0;
  const S = u.boss ? 1.85 : 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (dead){ ctx.translate(x, y); ctx.rotate(u.dieT * 0.5); ctx.translate(-x, -y); }
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,.36)';
  ctx.beginPath(); ctx.ellipse(u.bx, u.by + 6, 34 * S, 10 * S, 0, 0, Math.PI * 2); ctx.fill();

  ctx.shadowColor = E.glow; ctx.shadowBlur = (targeted ? 26 : 14) * (u.boss ? 1.6 : 1);
  const body = flash ? '#ffffff' : u.color, accent = flash ? '#ffdddd' : u.accent;
  const R = (dx, dy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x + dx * S, y + dy * S, w * S, h * S); };

  /* Quadro de ataque: durante o avanço (`lungeT`), troca pelo desenho
     próprio da habilidade em uso, se ela tiver um (`arteAtaque`, ver
     execute() em 27-controller.js). Sem sprite de ataque, continua no
     mesmo desenho parado — nunca fica sem nada na tela. */
  const spriteAtual = (u.arteAtaque && spriteImages[u.arteAtaque]?.complete
                        && spriteImages[u.arteAtaque].naturalWidth) ? u.arteAtaque : u.sprite;
  if (spriteAtual && spriteImages[spriteAtual]?.complete && spriteImages[spriteAtual].naturalWidth){
    // altura fixa, largura pela proporção real — forçar 170×136 achatava a arte
    const img = spriteImages[spriteAtual];
    /* A altura do chefe é limitada pela FAIXA DO CAMPO, não pelo fator
       de escala. Este caminho nunca tinha rodado: o Dono do Pântano é o
       primeiro chefe com arte, e 230 × 1,85 dá 425 px numa faixa de 258
       — a criatura entrava por dentro dos painéis do topo. */
    const faixa = HUD.campo.y1 - HUD.campo.y0;
    const alvo = u.boss ? Math.min(230 * S, faixa - 20) : 150 * S;
    const dh = alvo, dw = img.naturalWidth / img.naturalHeight * alvo;
    if (flash) ctx.globalAlpha = alpha * .5;
    ctx.drawImage(img, x - dw / 2, y - dh, dw, dh);
  } else switch(u.shape){
    case 'golem':
      R(-38, -86, 76, 62, body); R(-30, -80, 60, 26, accent);
      R(-46, -74, 12, 44, body); R(34, -74, 12, 44, body);
      R(-28, -24, 22, 26, body); R(6, -24, 22, 26, body);
      R(-22, -74, 14, 12, E.glow); R(8, -74, 14, 12, E.glow);
      break;
    case 'beast':
      R(-44, -52, 84, 34, body); R(30, -66, 30, 28, body);
      R(52, -62, 12, 8, accent);
      R(-40, -18, 12, 20, body); R(-16, -18, 12, 20, body);
      R(12, -18, 12, 20, body);  R(30, -18, 12, 20, body);
      R(-52, -60, 16, 12, body);
      R(44, -58, 7, 6, E.glow); R(34, -58, 7, 6, E.glow);
      break;
    case 'wisp': {
      const pulse = Math.sin(t / 300 + u.float) * .16 + 1;
      ctx.fillStyle = body; ctx.beginPath();
      ctx.ellipse(x, y - 44 * S, 30 * S * pulse, 40 * S * pulse, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = accent; ctx.globalAlpha = alpha * .7; ctx.beginPath();
      ctx.ellipse(x, y - 48 * S, 17 * S * pulse, 24 * S * pulse, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha;
      R(-12, -56, 8, 9, E.glow); R(4, -56, 8, 9, E.glow);
      for (let i = 0; i < 3; i++){
        ctx.globalAlpha = alpha * .3;
        ctx.fillStyle = E.glow;
        ctx.fillRect(x - 26 + i * 22 + Math.sin(t / 240 + i) * 7, y - 12, 4, 12);
      }
      ctx.globalAlpha = alpha;
      break; }
    case 'boss': {
      const br = Math.sin(t / 900) * 6;
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(x, y - 190 - br); ctx.lineTo(x + 76, y - 40); ctx.lineTo(x + 46, y);
      ctx.lineTo(x - 46, y); ctx.lineTo(x - 76, y - 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = accent; ctx.globalAlpha = alpha * .55;
      ctx.beginPath(); ctx.moveTo(x, y - 150 - br); ctx.lineTo(x + 40, y - 40);
      ctx.lineTo(x - 40, y - 40); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = alpha;
      const ep = Math.sin(t / 220) * .35 + .65;
      ctx.globalAlpha = alpha * ep; ctx.fillStyle = E.glow;
      ctx.fillRect(x - 34, y - 122 - br, 22, 9); ctx.fillRect(x + 12, y - 122 - br, 22, 9);
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 5; i++){
        const a = t / 1400 + i * 1.25;
        ctx.fillStyle = E.glow; ctx.globalAlpha = alpha * .5;
        ctx.fillRect(x + Math.cos(a) * 96 - 3, y - 90 + Math.sin(a) * 52 - 3, 7, 7);
      }
      ctx.globalAlpha = alpha;
      break; }
    default: // humanoid
      R(-26, -96, 52, 54, body); R(-20, -90, 40, 22, accent);
      R(-34, -84, 10, 40, body); R(24, -84, 10, 40, body);
      R(-20, -42, 16, 42, body); R(4, -42, 16, 42, body);
      R(-16, -84, 12, 10, E.glow); R(4, -84, 12, 10, E.glow);
      ctx.globalAlpha = alpha * .35; ctx.fillStyle = E.main;
      ctx.fillRect(x - 30 * S, y - 100 * S, 60 * S, 100 * S); ctx.globalAlpha = alpha;
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  if (dead) return;
  // barra + condições
  const bw = u.boss ? 200 : 92;
  bar(u.bx - bw / 2, u.by + 14, bw, 6, u.hp / u.maxHp, '#8a2a2a', '#e05a5a');
  /* Barra de POSTURA logo abaixo da vida. Dourada enquanto cheia,
     branca pulsando quando quebrada — é a única informação que diz ao
     jogador se vale insistir no elemento certo ou trocar de plano. */
  let baseY = u.by + 30;
  if (hasPoise(u)){
    const q = u.broken > 0;
    const pulso = q ? (Math.sin(Date.now() / 110) * .3 + .7) : 1;
    ctx.save(); ctx.globalAlpha = pulso;
    bar(u.bx - bw / 2, u.by + 22, bw, 5, q ? 1 : u.poise / u.maxPoise,
        '#5a4410', q ? '#ffffff' : '#ffd24a');
    ctx.restore();
    pxText(q ? `QUEBRADO ${u.broken}` : 'POSTURA', u.bx - bw / 2, u.by + 38,
           {size:6, color:q ? '#fff8c0' : '#bba85a'});
    baseY = u.by + 40;
  }
  pxText(u.name, u.bx, baseY + 6, {size:7, color:targeted ? '#fff' : E.glow, align:'center'});
  if (u.ail.length)
    drawAilments(u.ail, u.bx, baseY + 16, {lado:14, align:'center'});
  if (u.breakT > 0){
    ctx.save(); ctx.globalAlpha = u.breakT * .8;
    pxText('◈ POSTURA QUEBRADA ◈', u.bx, u.by - 150, {size:8, color:'#ffe44a', align:'center', glow:'#ffb020', blur:14});
    ctx.restore();
  }
  if (targeted){
    const b = Math.sin(Date.now() / 180) * 4;
    pxText('▼', u.bx, u.by - 130 + b, {size:14, color:'#ffe44a', align:'center', glow:'#ffb020'});
  }
}

function drawAllyUnit(u, active){
  const dead = !isAlive(u);
  const lunge = u.lungeT > 0 ? -Math.sin(u.lungeT * Math.PI) * 46 : 0;
  const hurt = u.hurtT > 0 ? Math.sin(u.hurtT * 50) * 4 : 0;
  const x = u.bx + lunge + hurt, y = u.by;
  const E = ELEM[u.element];
  const flash = u.hurtT > 0 && Math.floor(u.hurtT * 30) % 2 === 0;
  const t = Date.now();
  // altura ocupada pelo combatente — chibi é 64×2; arte grande varia
  /* Transformado, o desenho procura por OUTRO nome no BATTLE_ART. É só
     aqui e no chibi que a forma importa — o resto do combate continua
     vendo o Gabriel de sempre. */
  const nomeArte = arteDeCombate(u);
  const artRef = battleArtOf(nomeArte);
  const altura = artRef ? artRef.h * artRef.scale : 128;
  if (active){
    const ay = y - altura - 14 + Math.sin(t / 200) * 4;
    ctx.save(); ctx.shadowColor = E.glow; ctx.shadowBlur = 12; ctx.fillStyle = E.glow;
    ctx.beginPath(); ctx.moveTo(x, ay + 12); ctx.lineTo(x - 8, ay); ctx.lineTo(x + 8, ay); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = E.main;
    ctx.beginPath(); ctx.ellipse(x, y + 2, 34, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const art = battleArtOf(nomeArte);
  ctx.save();
  if (flash) ctx.filter = 'brightness(3)';
  if (art){
    // sombra maior, proporcional à arte de batalha
    ctx.save();
    ctx.globalAlpha *= dead ? .12 : .34;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(u.bx, y + 2, art.w * art.scale * .34, art.h * art.scale * .07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // respiração leve só quando parado, para não brigar com o avanço
    const bob = u.lungeT > 0 ? 0 : Math.sin(t / 900 + u.bx) * 1.6;
    drawBattleArt(art, x, y + bob, {alpha:dead ? .28 : 1, glow:active ? E.glow : null});
  } else {
    drawActor({sheet:u.lycan ? LYCAN.sheet : u.sheet, dir:'left', moving:u.lungeT > 0,
               animT:Date.now() / 1000, color:E.main},
              x, y, {scale:2, alpha:dead ? .28 : 1, glow:active ? E.glow : null});
  }
  ctx.restore();
  if (dead) pxText('✕', x, y - altura * .45, {size:16, color:'#8a4a4a', align:'center'});
  if (u.guarding) pxText('◈', x + 26, y - altura * .34, {size:10, color:'#8ac0ff'});
}

/* --- O pet no campo de batalha -------------------------------------
   Até a v5.0 o pet agia em combate só por texto no log, um flash e uma
   partícula: quem trouxe a salamandra não via a salamandra. Aqui ela
   aparece de verdade, com a leitura BÍPEDE — de pé, katana sacada —
   enquanto a quadrúpede continua sendo a que acompanha no campo.

   O pet não é uma unidade: não tem HP, não entra na ordem de turno e não
   pode ser alvo. Então não passa por `drawAllyUnit`; é desenhado à parte
   e entra na mesma lista ordenada por Y, só para respeitar a profundidade
   de quem está à frente de quem. */
function petSpotBatalha(){
  return anyBattleArt(Battle.allies) ? PET_SPOT_LARGE : PET_SPOT;
}

/** Caixa que o pet ocupa na tela. Existe separada do desenho porque o
 *  autoteste mede ela para garantir que não invade o painel nem os
 *  inimigos. */
function petCaixaBatalha(){
  const p = petAtivo();
  const s = petSpotBatalha();
  const img = p && petArte(p.forma, 'batalha');
  const alt = PET_ALT_BATALHA;
  const larg = img ? (img.naturalWidth / img.naturalHeight) * alt : alt * 0.9;
  /* Pior caso, não caso parado: x0 já desconta o avanço. É essa a caixa
     que o autoteste compara com os painéis. */
  return {x0:s.x - larg / 2 - PET_AVANCO, x1:s.x + larg / 2,
          y0:s.y - alt, y1:s.y, larg, alt};
}

function drawPetBatalha(){
  const p = petAtivo();
  if (!p) return;
  const s = petSpotBatalha();
  const E = ELEM[p.def.elem] || ELEM.none;
  const t = Date.now();
  const B = Battle;

  /* Avanço quando o pet age: o mesmo vocabulário do `lungeT` dos
     combatentes, para a entrada dele não parecer de outro jogo. */
  const avanco = B.petLungeT > 0 ? -Math.sin(B.petLungeT * Math.PI) * PET_AVANCO : 0;
  const agindo = B.petLungeT > 0;
  const bob = agindo ? 0 : Math.sin(t / 820) * 2;
  const x = s.x + avanco, y = s.y + bob;

  const img = petArte(p.forma, 'batalha');
  if (!img){
    // sem arte, cai no mesmo boneco procedural do campo
    desenharPet(p, x, y - 14);
    return;
  }
  const alt = PET_ALT_BATALHA;
  const larg = (img.naturalWidth / img.naturalHeight) * alt;

  ctx.save();
  ctx.globalAlpha = .34; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(s.x, s.y + 2, larg * .32, alt * .07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.save();
  if (agindo){ ctx.shadowColor = E.glow; ctx.shadowBlur = 16; }
  ctx.drawImage(img, Math.round(x - larg / 2), Math.round(y - alt), Math.round(larg), alt);
  ctx.restore();

  /* Nome só enquanto age: fixo, competiria com os nomes dos combatentes
     e o campo de batalha já é cheio. */
  if (agindo)
    pxText(p.forma.name, s.x, s.y - alt - 20,
           {size:7, color:E.glow, align:'center', glow:E.main, blur:8});
}

/* --- peças da HUD de combate (layout do mockup) --------------------
   Toda arte de interface entra pelo mesmo portão: `arteUI(chave)`
   devolve a imagem se ela existir em SPRITE_DATA e null se não existir.
   Quem desenha decide o que fazer com o null — e sempre desenha algo.
   É o mesmo contrato dos tiles, dos ícones de arma e das molduras: a
   arte melhora a tela, a ausência dela não apaga nada.
   Os nomes das chaves estão em assets/semantico/ com um PNG vazio do
   tamanho certo para cada uma; trocar o PNG e reembutir é o caminho
   inteiro, sem tocar em código. */
function arteUI(chave){
  const img = chave && spriteImages[chave];
  return (img && (img.complete ?? true) && (img.naturalWidth || img.width)) ? img : null;
}

/* Qual imagem representa um personagem numa caixinha de HUD.

   Preferência: BUSTO de rosto, se existir; chibi de corpo inteiro, se
   não. Rosto lê muito melhor num quadro de 50px — corpo inteiro naquele
   tamanho vira um borrão com cabeça. Mas os bustos chegam aos poucos
   (três dos nove vieram do mockup), então os dois caminhos convivem, e
   quem ainda não tem rosto continua aparecendo.

   Os `*_portrait` do jogo são uma MISTURA: uns são rosto (56x64), outros
   corpo inteiro (89x64). Por isso quem desenha não pode supor formato —
   ver `desenharRetrato`, que é por onde todo mundo passa. */
function retratoDe(c){
  if (!c) return null;
  const chave = 'busto_' + String(c.name).toLowerCase().replace(/[^a-z]/g, '_');
  const b = arteUI(chave);
  if (b) return {img:b, busto:true};
  const p = c.portrait && spriteImages[c.portrait];
  if (p && (p.complete ?? true) && (p.naturalWidth || p.width))
    return {img:p, busto:false};
  return null;
}

/** Desenha o retrato de alguém dentro de uma caixa. Devolve se desenhou.
 *
 *  CONTER, sempre — nunca cobrir. Cobrir cortava: o retrato tem
 *  proporção 0,93 e a caixa do cartão de grupo é 1,7, então encher a
 *  caixa jogava fora 56% da altura e sobrava a testa. Era esse o
 *  "sprite bugado" do Seiji e da Ophelia: os dois têm busto, e busto é
 *  justamente a arte que a caixa larga cortava. Quem tinha chibi
 *  escapava por acaso, porque chibi é mais largo que alto.
 *
 *  Conter mostra a arte inteira em QUALQUER caixa, seja ela larga,
 *  alta ou quadrada, e vale para rosto e corpo sem precisar saber qual
 *  é qual — o que importa porque os `*_portrait` são uma mistura. */
function desenharRetrato(c, x, y, w, h, o = {}){
  const r = retratoDe(c);
  if (!r || w <= 0 || h <= 0) return false;
  const iw = r.img.naturalWidth || r.img.width;
  const ih = r.img.naturalHeight || r.img.height;
  if (!iw || !ih) return false;
  const e = Math.min(w / iw, h / ih);
  const lw = iw * e, lh = ih * e;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(r.img, x + (w - lw) / 2, y + (h - lh) / 2, lw, lh);
  ctx.restore();
  return true;
}

/** Zona da HUD: arte se houver, `panel()` se não houver. */
function zona(z, o = {}){
  const a = arteUI(o.arte);
  if (a) ctx.drawImage(a, z.x, z.y, z.w, z.h);
  else panel(z.x, z.y, z.w, z.h, o);
  if (o.titulo) pxText(o.titulo, z.x + 12, z.y + 16,
                       {size:7, color:o.corTitulo || '#b89aff'});
}

/** Barra de HP/MP com rótulo e número, do jeito que o mockup mostra.
 *  Abaixo de ~96 px não cabem rótulo, barra e número na mesma linha — a
 *  barra saía com largura NEGATIVA no cartão de 68 px do grupo de cinco.
 *  Nesse caso o número sobe para a linha de cima e a barra fica com a
 *  largura inteira, que é o que importa ler de longe. */
const LARG_BARRA_LARGA = 96;
function barraVital(x, y, larg, rot, v, vmax, c1, c2, cn){
  const n = `${Math.max(0, Math.round(v))}`;
  if (larg >= LARG_BARRA_LARGA){
    pxText(rot, x, y + 5, {size:6, color:c2});
    bar(x + 20, y, larg - 54, 6, v / Math.max(1, vmax), c1, c2);
    pxText(n, x + larg, y + 5, {size:7, color:cn, align:'right'});
  } else {
    pxText(rot, x, y - 1, {size:6, color:c2});
    pxText(n, x + larg, y - 1, {size:6, color:cn, align:'right'});
    bar(x, y + 2, larg, 5, v / Math.max(1, vmax), c1, c2);
  }
}

/* O losango da fila de turnos. O mockup desenha o retrato recortado
   dentro dele; aqui o recorte é feito na hora com `clip`, para não
   precisar de uma arte por personagem. */
function losangoTurno(cx, cy, r, u, ativo){
  const arte = arteUI(ativo ? 'ui_losango_ativo' : 'ui_losango');
  const cor = u.side === 'ally' ? ELEM[u.element].glow : '#e06a6a';
  /* Inimigo não tem retrato, mas TEM sprite — usar a arte dele é melhor
     que as duas letras do nome, que era o que aparecia. */
  const chave = u.portrait || u.sprite;
  const img = chave && spriteImages[chave];
  const temArte = img && (img.complete ?? true) && (img.naturalWidth || img.width);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy);
  ctx.closePath();
  if (temArte){
    ctx.save(); ctx.clip();
    const alt = r * 2.1, larg = (img.naturalWidth / img.naturalHeight) * alt;
    ctx.globalAlpha = ativo ? 1 : .72;
    // retrato de gente é enquadrado pela cabeça; bicho, pelo corpo inteiro
    ctx.drawImage(img, cx - larg / 2, cy - alt * (u.portrait ? .58 : .5), larg, alt);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(12,10,26,.85)'; ctx.fill();
    pxText(u.name.slice(0, 2), cx, cy + 4, {size:8, color:cor, align:'center'});
  }
  ctx.strokeStyle = ativo ? '#fff' : cor;
  ctx.lineWidth = ativo ? 2 : 1;
  if (ativo){ ctx.shadowColor = cor; ctx.shadowBlur = 8; }
  ctx.stroke();
  ctx.restore();

  if (arte) ctx.drawImage(arte, cx - r - 2, cy - r - 2, (r + 2) * 2, (r + 2) * 2);
  // a seta embaixo marca quem age agora, como no mockup
  if (ativo){
    const s = arteUI('ui_seta_aliado');
    if (s) ctx.drawImage(s, cx - 7, cy + r + 1, 14, 12);
    else {
      ctx.fillStyle = '#8ab0fa';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + r + 2); ctx.lineTo(cx + 6, cy + r + 2);
      ctx.lineTo(cx, cy + r + 11); ctx.closePath(); ctx.fill();
    }
  }
}

/* --- 1. TURNO ATUAL ------------------------------------------------ */
function drawZonaTurno(){
  const z = HUD.turno, u = Battle.actor;
  zona(z, {arte:'ui_zona_turno', titulo:'TURNO ATUAL',
           accent:u ? ELEM[u.element].main : null});
  if (!u) return;
  const E = ELEM[u.element];

  // retrato: busto se houver, chibi se não
  const cx = z.x + 12, cy = z.y + 24, cw = 52, ch = 56;
  ctx.save();
  ctx.fillStyle = 'rgba(10,8,22,.7)'; ctx.fillRect(cx, cy, cw, ch);
  ctx.restore();
  desenharRetrato(u, cx, cy, cw, ch);
  ctx.strokeStyle = E.main; ctx.lineWidth = 1;
  ctx.strokeRect(cx + .5, cy + .5, cw - 1, ch - 1);

  const tx = cx + cw + 10;
  pxText(u.name.slice(0, 9), tx, z.y + 30, {size:10, color:'#fff'});
  /* Nível e elemento em LINHAS diferentes: lado a lado, nome comprido
     empurrava o nível para cima do elemento. */
  pxText(`Nv${u.lvl}`, z.x + z.w - 12, z.y + 28, {size:7, color:'#a89ac0', align:'right'});
  const ie = arteUI('ui_elem_' + u.element);
  const rot = E.name.toUpperCase();
  if (ie) ctx.drawImage(ie, z.x + z.w - 22 - rot.length * 5, z.y + 33, 10, 10);
  pxText(`${ie ? '' : E.icon} ${rot}`, z.x + z.w - 12, z.y + 42,
         {size:6, color:E.glow, align:'right'});

  barraVital(tx, z.y + 46, z.w - (tx - z.x) - 12, 'HP', u.hp, u.maxHp, '#3a8a3a', '#5aba5a', '#9ada9a');
  barraVital(tx, z.y + 60, z.w - (tx - z.x) - 12, 'MP', u.mp, u.maxMp, '#3a5a9a', '#5a8afa', '#8ab0fa');
  // ressonância: fio fino, como no HUD antigo
  bar(tx, z.y + 72, z.w - (tx - z.x) - 12, 3, (u.reso || 0) / 100,
      '#6a3a9a', u.reso >= 100 ? '#ffe44a' : '#b89aff');
  if (u.ail.length) drawAilments(u.ail, z.x + 12, z.y + z.h - 8, {lado:13, align:'left'});
}

/* --- 2. ORDEM DE TURNO --------------------------------------------- */
function drawZonaOrdem(){
  const z = HUD.ordem;
  zona(z, {arte:'ui_zona_ordem', titulo:'ORDEM DE TURNO', alpha:.86});
  const fila = Battle.order.slice(Math.max(0, Battle.turnIdx), Battle.turnIdx + 7).filter(isAlive);
  if (!fila.length) return;
  const r = 20, passo = Math.min(42, (z.w - 24) / Math.max(1, fila.length));
  const y = z.y + 46;
  fila.forEach((u, i) => losangoTurno(z.x + 20 + i * passo, y, i === 0 ? r : r - 3, u, i === 0));
}

/* --- 3. ALVO SELECIONADO ------------------------------------------- */
function drawZonaAlvo(){
  const z = HUD.alvo;
  const alvo = Battle.phase === 'TARGET'
    ? Battle.targetPool[Battle.targetCur.i % Math.max(1, Battle.targetPool.length)]
    : null;
  zona(z, {arte:'ui_zona_alvo', titulo:'ALVO SELECIONADO',
           accent:alvo ? '#c04a4a' : '#4a3a6a', corTitulo:alvo ? '#e08a8a' : '#6a5a8a'});
  if (!alvo){
    uiText('nenhum alvo escolhido', z.x + 12, z.y + 44, {size:12, color:'#5a4a7a'});
    return;
  }
  const E = ELEM[alvo.element];
  const m = arteUI('ui_mira');
  if (m) ctx.drawImage(m, z.x + z.w - 30, z.y + 8, 18, 18);
  pxText(alvo.name.slice(0, 16), z.x + 12, z.y + 40, {size:9, color:'#fff'});
  pxText(`Nv${alvo.lvl || '?'}`, z.x + z.w - 34, z.y + 40, {size:7, color:'#a89ac0', align:'right'});
  pxText(`${E.icon} ${E.name.toUpperCase()}`, z.x + z.w - 12, z.y + 54,
         {size:6, color:E.glow, align:'right'});
  barraVital(z.x + 12, z.y + 62, z.w - 24, 'HP', alvo.hp, alvo.maxHp, '#8a2a2a', '#da4a4a', '#ffb0b0');
}

/* Opacidade do HUD do grupo. Nomeada porque é requisito, não gosto: o
   cartão precisa deixar ver o que está atrás dele. Opaco, ele virava um
   bloco escuro tapando o chão da batalha — e, na vitória, tapando a pose
   de quem ganhou, que é a única hora em que ela aparece. */
const GRUPO_OPACIDADE = {zona:0.55, cartaoAtivo:0.68, cartaoInativo:0.44};

/* --- 6. GRUPO ------------------------------------------------------ */
function drawZonaGrupo(){
  const z = HUD.grupo, P = Battle.allies;
  zona(z, {arte:'ui_zona_grupo', titulo:'GRUPO', alpha:GRUPO_OPACIDADE.zona});
  const n = Math.max(1, P.length);
  const cw = (z.w - 16 - (n - 1) * 4) / n, cy = z.y + 24, ch = z.h - 32;
  P.forEach((c, i) => {
    const cx = z.x + 8 + i * (cw + 4);
    const E = ELEM[c.element];
    const ativo = Battle.actor === c && PHASES_INPUT.includes(Battle.phase);
    const arte = arteUI('ui_cartao');
    if (arte) ctx.drawImage(arte, cx, cy, cw, ch);
    else panel(cx, cy, cw, ch,
               {alpha:ativo ? GRUPO_OPACIDADE.cartaoAtivo : GRUPO_OPACIDADE.cartaoInativo,
                accent:ativo ? E.main : '#3a2a5a', gemaBase:false});
    pxText(c.name.slice(0, 8), cx + 8, cy + 16,
           {size:7, color:isAlive(c) ? E.glow : '#7a5a5a'});
    pxText(`Nv${c.lvl}`, cx + cw - 8, cy + 16, {size:6, color:'#8a7aaa', align:'right'});
    // retrato: a caixa vai do nome até as barras, sem sobra desperdiçada
    desenharRetrato(c, cx + 2, cy + 20, cw - 4, ch - 50, {alpha:isAlive(c) ? 1 : .3});
    barraVital(cx + 6, cy + ch - 24, cw - 12, 'HP', c.hp, c.maxHp, '#3a8a3a', '#5aba5a', '#9ada9a');
    barraVital(cx + 6, cy + ch - 10, cw - 12, 'MP', c.mp, c.maxMp, '#3a5a9a', '#5a8afa', '#8ab0fa');
    if (c.ail.length) drawAilments(c.ail, cx + cw - 8, cy + 30, {lado:11, align:'right'});
    if (c.reso >= 100)
      pxText('★', cx + 8, cy + 30, {size:8, color:'#ffe44a', glow:'#ffb020'});
    if (!isAlive(c))
      pxText('caído', cx + cw / 2, cy + ch / 2, {size:7, color:'#da6a6a', align:'center'});
  });
}

/* --- 7. RÉGUA DE ATALHOS ------------------------------------------- */
/* Sai da tabela de Input, não de uma lista escrita à mão: rebind de
   tecla que não aparecesse aqui viraria mentira na tela. */
const ATALHOS_COMBATE = [
  {t:'Z', r:'Confirmar'}, {t:'X', r:'Voltar'}, {t:'C', r:'Info'},
  {t:'←→', r:'Trocar alvo'}, {t:'TAB', r:'Pausa'},
];
function drawZonaAtalhos(){
  const z = HUD.atalhos;
  zona(z, {arte:'ui_zona_atalhos', alpha:.62, gemaBase:false});
  const passo = (z.w - 24) / ATALHOS_COMBATE.length;
  ATALHOS_COMBATE.forEach((a, i) => {
    const x = z.x + 14 + i * passo, y = z.y + z.h / 2;
    const cap = arteUI('ui_tecla');
    const lw = Math.max(16, a.t.length * 7 + 8);
    if (cap) ctx.drawImage(cap, x, y - 9, lw, 18);
    else {
      ctx.fillStyle = 'rgba(20,16,42,.9)'; ctx.fillRect(x, y - 9, lw, 18);
      ctx.strokeStyle = '#5a4a7a'; ctx.lineWidth = 1;
      ctx.strokeRect(x + .5, y - 8.5, lw - 1, 17);
    }
    pxText(a.t, x + lw / 2, y + 4, {size:6, color:'#d0c8e0', align:'center'});
    uiText(a.r, x + lw + 7, y + 5, {size:12, color:'#7a6a9a'});
  });
}

/* --- 5. LOG -------------------------------------------------------- */
function drawZonaLog(){
  if (!Battle.log.length) return;
  const z = HUD.log;
  const linhas = Battle.log.slice(-2);
  zona(z, {arte:'ui_zona_log', alpha:.72, gemaBase:false});
  linhas.forEach((l, i) => uiText(l, z.x + 12, z.y + 14 + i * 14,
    {size:12, color:i === linhas.length - 1 ? '#e8e2d8' : '#8a8296'}));
}

/* Na hora de mirar, clicar no corpo é o gesto óbvio. A caixa sai da
   posição de batalha da própria criatura, e só existe na fase de mira —
   fora dela, clicar num inimigo não deveria fazer nada. */
function registrarAlvosClicaveis(){
  if (Battle.phase !== 'TARGET') return;
  (Battle.targetPool || []).forEach((u, i) => {
    if (u.bx === undefined) return;
    Clique.add(u.bx - 48, u.by - 120, 96, 124, Clique.escolher(Battle.targetCur, i));
  });
}

function drawBattleHUD(){
  registrarAlvosClicaveis();
  drawZonaLog();
  drawZonaTurno();
  drawZonaOrdem();
  drawZonaAlvo();
  drawZonaGrupo();
  drawZonaAtalhos();
}

/* Ícone de cada comando. Chave semântica: trocar o PNG em
   assets/semantico/ui_cmd_<id>.png e reembutir troca o desenho. */
const ICONE_CMD = {attack:'ui_cmd_atacar', skill:'ui_cmd_habilidade',
                   ult:'ui_cmd_ressonancia', combo:'ui_cmd_conjunta',
                   item:'ui_cmd_item', guard:'ui_cmd_guardar', flee:'ui_cmd_fugir'};

/** Uma linha da lista de comandos, com ícone à esquerda. */
function linhaComando(x, y, larg, rot, on, o = {}){
  /* `cursor`+`i` tornam a linha clicável. Quem desenha uma lista que o
     jogador escolhe passa os dois; quem desenha rótulo solto, não. */
  if (o.cursor) Clique.add(x, y - 15, larg, 22, Clique.escolher(o.cursor, o.i));
  const sob = o.cursor && Clique.emCima(x, y - 15, larg, 22);
  if (sob && !on){ ctx.fillStyle = 'rgba(120,86,200,.14)'; ctx.fillRect(x, y - 15, larg, 22); }
  if (on){
    const sel = arteUI('ui_selecao_linha');
    if (sel) ctx.drawImage(sel, x, y - 15, larg, 22);
    else {
      ctx.fillStyle = 'rgba(120,86,200,.28)'; ctx.fillRect(x, y - 15, larg, 22);
      ctx.strokeStyle = '#8ab0fa'; ctx.lineWidth = 1;
      ctx.strokeRect(x + .5, y - 14.5, larg - 1, 21);
    }
    const cur = arteUI('ui_cursor');
    if (cur) ctx.drawImage(cur, x + larg - 16, y - 12, 14, 16);
  }
  const ic = arteUI(o.icone);
  if (ic) ctx.drawImage(ic, x + 5, y - 12, 14, 14);
  pxText(rot, x + (ic ? 24 : 8), y,
         {size:8, color:o.cor || (on ? '#fff' : '#9a8ab0'),
          glow:o.glow || null, blur:6});
  if (o.direita)
    pxText(o.direita, x + larg - (on ? 20 : 6), y,
           {size:7, color:o.corDireita || '#8a7aaa', align:'right'});
}

/** Painel de detalhe: o que a ação escolhida faz. */
function drawZonaDetalhe(titulo, corpo, pares, cor){
  const z = HUD.detalhe;
  zona(z, {arte:'ui_zona_detalhe', alpha:.9});
  if (titulo) pxText(titulo, z.x + 12, z.y + 22, {size:9, color:cor || '#8ab0fa'});
  if (corpo){
    const largTexto = pares && pares.length ? z.w * .56 : z.w - 24;
    quebrarUI(corpo, z.x + 12, z.y + 42, largTexto, 15,
              {size:12, color:'#a89ac0'});
  }
  if (pares && pares.length){
    const cx = z.x + z.w - 12;
    ctx.save();
    ctx.strokeStyle = 'rgba(140,110,220,.35)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(z.x + z.w * .60, z.y + 16); ctx.lineTo(z.x + z.w * .60, z.y + z.h - 12);
    ctx.stroke(); ctx.restore();
    pares.slice(0, 3).forEach((p, i) => {
      const y = z.y + 30 + i * 30;
      pxText(p[0], cx, y, {size:6, color:'#b89aff', align:'right'});
      pxText(p[1], cx, y + 16, {size:9, color:p[2] || '#fff', align:'right'});
    });
  }
}

/** Texto de UI quebrado em linhas dentro de uma largura. */
function quebrarUI(txt, x, y, larg, alt, o = {}){
  const palavras = String(txt).split(/\s+/);
  let linha = '', n = 0;
  for (const p of palavras){
    const teste = linha ? linha + ' ' + p : p;
    if (measureUI(teste, o.size ?? 12) > larg && linha){
      uiText(linha, x, y + n * alt, o); linha = p; n++;
      if (n > 3) return;
    } else linha = teste;
  }
  if (linha) uiText(linha, x, y + n * alt, o);
}

function drawBattleMenu(){
  const B = Battle, z = HUD.cmd;

  if (B.phase === 'INPUT'){
    const cmds = B.commands();
    zona(z, {arte:'ui_zona_comandos', titulo:'COMANDOS',
             accent:B.actor ? ELEM[B.actor.element].main : null});
    const lh = Math.min(24, (z.h - 34) / Math.max(1, cmds.length));
    cmds.forEach((c, i) => {
      linhaComando(z.x + 8, z.y + 40 + i * lh, z.w - 16, c.label, B.cmd.i === i,
                   {cursor:B.cmd, i, icone:ICONE_CMD[c.id],
                    cor:c.hot ? '#ffe44a' : (B.cmd.i === i ? '#fff' : '#9a8ab0'),
                    glow:c.hot ? '#ffb020' : null});
    });
    const cur = cmds[B.cmd.i];
    if (cur){
      const pares = [];
      if (cur.id === 'attack') pares.push(['DANO FÍSICO', '100%'], ['ACERTO',
        `${Math.round(clamp(0.95 * ailMult(B.actor, 'accMod'), 0, 1) * 100)}%`]);
      drawZonaDetalhe(cur.label, cur.desc, pares,
                      cur.hot ? '#ffe44a' : '#8ab0fa');
    }
    return;
  }

  if (B.phase === 'COMBO'){
    const list = B.comboPartners(B.actor);
    zona(z, {arte:'ui_zona_comandos', titulo:'CONJUNTA', accent:'#b89aff'});
    const ini = gridWindow(B.comboCur.i, list.length, LISTA_COLS, LISTA_LINHAS);
    list.slice(ini, ini + LISTA_LINHAS).forEach((o, k) => {
      const i = ini + k;
      linhaComando(z.x + 8, z.y + 40 + k * 24, z.w - 16,
                   `${ELEM[B.actor.element].icon}${ELEM[o.mate.element].icon} ${o.combo.name}`.slice(0, 15),
                   B.comboCur.i === i, {cursor:B.comboCur, i, icone:'ui_cmd_conjunta'});
    });
    const cur = list[B.comboCur.i % Math.max(1, list.length)];
    if (cur) drawZonaDetalhe(cur.combo.name, cur.combo.desc,
      [['PODER', `${cur.combo.power}`],
       ['CUSTO', `${comboCost(B.actor, cur.combo)}+${comboCost(cur.mate, cur.combo)}`, '#8ab0fa'],
       ['COM', cur.mate.name.slice(0, 9), ELEM[cur.mate.element].glow]], '#b89aff');
    return;
  }

  if (B.phase === 'SKILL'){
    const list = B.actor.skills;
    zona(z, {arte:'ui_zona_comandos', titulo:'HABILIDADE', accent:'#7a5aba'});
    const ini = gridWindow(B.skillCur.i, list.length, LISTA_COLS, LISTA_LINHAS);
    list.slice(ini, ini + LISTA_LINHAS).forEach((id, k) => {
      const i = ini + k, s = SKILLS[id], can = B.actor.mp >= s.cost;
      linhaComando(z.x + 8, z.y + 40 + k * 24, z.w - 16, s.name.slice(0, 13),
                   B.skillCur.i === i,
                   {cursor:B.skillCur, i,
                    cor:!can ? '#5a4a5a' : (B.skillCur.i === i ? '#fff' : '#9a8ab0'),
                    direita:`${s.cost}`,
                    corDireita:can ? ELEM[s.elem].glow : '#5a4a5a'});
    });
    if (list.length > LISTA_LINHAS)
      pxText(`${B.skillCur.i + 1}/${list.length}`, z.x + z.w - 8, z.y + z.h - 8,
             {size:6, color:'#6a5a8a', align:'right'});
    const cur = SKILLS[list[B.skillCur.i]];
    if (cur) drawZonaDetalhe(cur.name, cur.desc || '',
      [['ELEMENTO', ELEM[cur.elem].name.toUpperCase(), ELEM[cur.elem].glow],
       ['PODER', `${cur.power || '—'}`],
       ['CUSTO', `${cur.cost} MP`, '#8ab0fa']], ELEM[cur.elem].glow);
    return;
  }

  if (B.phase === 'ITEM'){
    const list = battleItems();
    zona(z, {arte:'ui_zona_comandos', titulo:'ITEM', accent:'#7a5aba'});
    if (!list.length) pxText('bolsa vazia', z.x + 12, z.y + 46, {size:7, color:'#6a5a8a'});
    const ini = gridWindow(B.itemCur.i, list.length, LISTA_COLS, LISTA_LINHAS);
    list.slice(ini, ini + LISTA_LINHAS).forEach((id, k) => {
      const i = ini + k, it = ITEMS[id];
      linhaComando(z.x + 8, z.y + 40 + k * 24, z.w - 16, it.name.slice(0, 12),
                   B.itemCur.i === i, {cursor:B.itemCur, i, icone:it.icon,
                                       direita:'×' + Bag.count(id)});
    });
    if (list.length > LISTA_LINHAS)
      pxText(`${B.itemCur.i + 1}/${list.length}`, z.x + z.w - 8, z.y + z.h - 8,
             {size:6, color:'#6a5a8a', align:'right'});
    const cur = ITEMS[list[B.itemCur.i]];
    if (cur) drawZonaDetalhe(cur.name, cur.desc, [], '#8ab0fa');
    return;
  }

  if (B.phase === 'TARGET'){
    zona(z, {arte:'ui_zona_comandos', titulo:'ALVO', accent:'#c04a4a'});
    pxText('← → escolhe', z.x + 12, z.y + 46, {size:7, color:'#b89aff'});
    pxText('Z confirma', z.x + 12, z.y + 64, {size:7, color:'#6a5a8a'});
    pxText('X volta',    z.x + 12, z.y + 82, {size:7, color:'#6a5a8a'});
    const tg = B.targetPool[B.targetCur.i % Math.max(1, B.targetPool.length)];
    if (tg){
      const pares = [['HP', `${tg.hp}/${tg.maxHp}`]];
      let nota = '';
      if (B.pendingSkill && B.pendingSkill.type === 'atk'){
        const m = elemMult(B.pendingSkill.elem, tg.element, tg.res);
        nota = m > 1 ? 'Vantagem elemental.' : m < 1 ? 'Resistência elemental.' : 'Dano neutro.';
        pares.push(['ELEMENTO', m > 1 ? '▲' : m < 1 ? '▼' : '=',
                    m > 1 ? '#7ada7a' : m < 1 ? '#da7a7a' : '#a89ac0']);
      }
      drawZonaDetalhe(tg.name, nota, pares, '#e08a8a');
    }
    return;
  }

  // fases sem entrada (INTRO, resolução): a zona fica, vazia
  zona(z, {arte:'ui_zona_comandos', titulo:'COMANDOS', alpha:.6});
}

/* A caixa de vitória fica NA METADE ESQUERDA, e não no centro.

   Centralizada, ela caía exatamente em cima do grupo — que é o único
   momento do jogo em que se vê a pose de vitória do personagem. Ganhar
   e não poder olhar para quem ganhou é o pior lugar possível para pôr
   uma caixa de texto.

   A metade esquerda é o lado dos inimigos, e depois da vitória não há
   mais inimigo nenhum ali. O espaço já estava vago. */
const VITORIA_CAIXA = {x:10, larg:HUD.inimigos.x1 + 46};

function drawVictory(){
  const R = Battle.result; if (!R) return;
  const h = 190 + R.ups.length * 46 + (R.drops.length ? 26 : 0) + (R.pet ? 30 : 0);
  const larg = VITORIA_CAIXA.larg;
  const x = VITORIA_CAIXA.x;
  const y = clamp(H / 2 - h / 2, HUD.campo.y0 - 40, H - h - 10);
  const cx = x + larg / 2;
  panel(x, y, larg, h, {accent:'#7a5aba'});
  pxText('VITÓRIA', cx, y + 44, {size:16, color:'#ffe44a', align:'center', glow:'#ffb020', blur:14});
  pxText(`+${R.exp} EXP`, cx, y + 84, {size:9, color:'#b89aff', align:'center'});
  pxText(`+${R.gold} ₢`, cx, y + 108, {size:9, color:'#eaca3a', align:'center'});
  let ly = y + 140;
  if (R.drops.length){
    const names = {}; R.drops.forEach(d => names[d] = (names[d] || 0) + 1);
    uiText('Obteve: ' + Object.entries(names).map(([k, v]) => `${ITEMS[k].name} ×${v}`).join(', '),
           cx, ly, {size:13, color:'#9ada9a', align:'center'});
    ly += 26;
  }
  R.ups.forEach(u => {
    pxText(`${u.name} chegou ao nível ${u.lvl}!`, cx, ly, {size:9, color:'#ffe44a', align:'center'});
    uiText(`HP+${u.gains.hp} MP+${u.gains.mp} ATK+${u.gains.atk} DEF+${u.gains.def} SPD+${u.gains.spd}`,
           cx, ly + 20, {size:12, color:'#8a9ab0', align:'center'});
    if (u.pontos)
      uiText(`+${u.pontos} pontos de alma · gaste em Menu → Habilidades`,
             cx, ly + 38, {size:12, color:'#b89aff', align:'center'});
    ly += 46 + (u.pontos ? 10 : 0);
  });
  /* Linha do pet. Só aparece quando existe pet ativo — a tela de
     vitória já é apertada e não pode ganhar espaço vazio à toa. */
  if (R.pet){
    const lista = R.petUps || [];
    const evo = lista[lista.length - 1];
    pxText(evo ? `${evo.de} evoluiu para ${evo.para}!` : `${R.pet.forma.name} Nv${R.pet.dados.lvl}`,
           cx, ly, {size:8, color:evo ? '#ffe44a' : '#a8ffd0', align:'center'});
    uiText(evo ? 'O bicho mudou de forma.' : `+${Math.round(R.exp * PET_EXP_SHARE)} EXP de pet`,
           cx, ly + 18, {size:12, color:'#7a8a9a', align:'center'});
  }
  pxText('▼ Z', cx, y + h - 18, {size:8, color:'#6a5a8a', align:'center'});
}

function drawBattle(){
  drawBattleBG();
  const B = Battle;
  const targeted = B.phase === 'TARGET' ? B.targetPool[B.targetCur.i % Math.max(1, B.targetPool.length)] : null;
  const drawList = [
    ...B.enemies.map(u => ({y:u.by, fn:() => drawEnemyUnit(u, targeted === u)})),
    ...B.allies.map(u => ({y:u.by, fn:() => drawAllyUnit(u, B.actor === u && PHASES_INPUT.includes(B.phase))})),
  ];
  // o pet entra na MESMA lista, para a profundidade sair certa
  if (petAtivo()) drawList.push({y:petSpotBatalha().y, fn:drawPetBatalha});
  drawList.sort((a, b) => a.y - b.y).forEach(d => d.fn());
  FX.drawParticles();
  if (targeted && targeted.side === 'ally'){
    const b = Math.sin(Date.now() / 180) * 4;
    pxText('▼', targeted.bx, targeted.by - 116 + b, {size:14, color:'#7ada7a', align:'center', glow:'#3a8a3a'});
  }
  drawBattleHUD();
  if (B.phase === 'VICTORY') drawVictory();
  else if (B.phase === 'DEFEAT'){
    ctx.fillStyle = `rgba(8,2,4,${clamp(B.t / 1.4, 0, .82)})`; ctx.fillRect(0, 0, W, H);
    pxText('DERROTA', W / 2, H / 2 - 10, {size:22, color:'#da4a4a', align:'center', glow:'#8a1a1a', blur:20});
    if (B.t > 1.2) uiText('Z para continuar', W / 2, H / 2 + 30, {size:14, color:'#8a6a6a', align:'center'});
  }
  else if (B.phase === 'INTRO'){
    pxText(B.log[0] || '', W / 2, 120, {size:11, color:'#ffb0b0', align:'center', glow:'#8a2a2a'});
  }
  else drawBattleMenu();
  FX.drawPopups();
}
