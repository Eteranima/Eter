/* ===================================================================
   13b. ESCOLHA DO PROTAGONISTA
   O jogo começa com uma pessoa só e o resto do elenco entra por missão.
   Escolher quem é essa pessoa é a primeira decisão do jogador, e ela
   vale por horas — então a tela mostra o que muda de verdade: elemento,
   papel, os números do nível 5 comparados ao resto do elenco, as
   habilidades que já vêm prontas e uma frase honesta sobre a vida solo.
   Comparar contra o elenco (e não em absoluto) é o que torna a barra
   legível: "mais vida que todo mundo" é a informação útil, "90 de HP"
   não é, porque o jogador ainda não tem régua nenhuma.
   =================================================================== */
/* Caixas fixas da tela de escolha, iguais às do combate: painel de
   detalhe em x 60..740 / y 250..542, texto começando em x 262. O
   autoteste trava esses números — foi assim que o estouro da frase de
   apresentação apareceu (ela quebrava em 600px numa faixa de 478). */
const ESCOLHA_PAINEL = {x:60, y:250, w:W - 120, h:292};
/* Quantas cartas cabem de uma vez na tela de escolha. Nove é o maior
   número que ainda deixa a carta com 80 px — o piso abaixo do qual
   retrato e nome não convivem. */
const ESCOLHA_VISIVEIS = 9;
const ESCOLHA_TEXTO_X = 262;
const ESCOLHA_TEXTO_W = ESCOLHA_PAINEL.x + ESCOLHA_PAINEL.w - ESCOLHA_TEXTO_X - 12;

/** Desenha o fundo de região (mesma folha `battle_bg_*` do combate,
 *  animada do mesmo jeito — ver FUNDO_BATALHA/desenharFundoEmArte em
 *  combat/28-view.js) cobrindo a tela, numa opacidade dada. Sem folha
 *  para o cenário (personagem sem `cenario`, ou arte ainda não
 *  carregada), não desenha nada — quem chama já tem o gradiente padrão
 *  por baixo, então nunca fica em branco. */
function desenharCenarioEscolha(cenario, alpha){
  if (!cenario || alpha <= 0) return;
  const img = arteUI('battle_bg_' + cenario);
  if (!img) return;
  const cols = Math.max(1, Math.round((img.naturalWidth  || img.width)  / W));
  const rows = Math.max(1, Math.round((img.naturalHeight || img.height) / H));
  const total = cols * rows;
  const passo = Math.floor(Date.now() / (1000 / FUNDO_BATALHA.fps));
  const i = ((passo % total) + total) % total;
  const cw = (img.naturalWidth  || img.width)  / cols;
  const ch = (img.naturalHeight || img.height) / rows;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch, 0, 0, W, H);
  ctx.restore();
}

const Escolha = {
  cur:{i:0}, t:0,
  /* Transição de cenário: quando o cursor muda de personagem, o fundo
     do personagem anterior desbota enquanto o novo entra — sem isso a
     troca de região seria um corte seco a cada aperto de seta, e o
     "lugar diferente no mapa" pedido vira ruído em vez de imersão. */
  _cenAtual:null, _cenAnterior:null, _fadeT:1,

  open(){ this.cur.i = 0; this.t = 0; this._cenAtual = PARTY_DEFS[0]?.cenario || null;
          this._cenAnterior = null; this._fadeT = 1; G.scene = 'CHOOSE'; },

  /** Maior valor do elenco em cada atributo — a régua das barras. */
  tetos(){
    const m = {hp:1, mp:1, atk:1, def:1, spd:1};
    for (const d of PARTY_DEFS){
      const c = makeChar(d, 5);
      for (const k of Object.keys(m)){
        const v = k === 'hp' ? c.maxHp : k === 'mp' ? c.maxMp : c[k];
        if (v > m[k]) m[k] = v;
      }
    }
    return m;
  },

  update(dt){
    this.t += dt;
    navList(this.cur, PARTY_DEFS.length);
    const cen = PARTY_DEFS[this.cur.i]?.cenario || null;
    if (cen !== this._cenAtual){
      this._cenAnterior = this._cenAtual; this._cenAtual = cen; this._fadeT = 0;
    }
    this._fadeT = Math.min(1, this._fadeT + dt / 0.35);
    if (Input.pressed('cancel')){ Sound.sfx('cancel'); G.scene = 'TITLE'; Title.refresh(); return; }
    if (Input.pressed('confirm')){
      Sound.sfx('confirm');
      const nome = PARTY_DEFS[this.cur.i].name;
      FX.fade(() => {
        newGame(nome);
        if (GM_PENDENTE){ ativarGameMaster(); GM_PENDENTE = false; }
        G.scene = 'FIELD';
      });
    }
  },

  draw(){
    const t = Date.now();
    const g = ctx.createRadialGradient(W / 2, 180, 30, W / 2, H / 2, 480);
    g.addColorStop(0, '#1c1132'); g.addColorStop(1, '#07070c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    /* Cenário de origem: o gradiente acima é a base que nunca falha
       (personagem sem cenário, ou arte ainda carregando); por cima
       entra a região do personagem atual, cruzando com a do anterior
       enquanto `_fadeT` sobe — ver update(). */
    desenharCenarioEscolha(this._cenAnterior, 1 - this._fadeT);
    desenharCenarioEscolha(this._cenAtual, this._fadeT);
    ctx.fillStyle = 'rgba(5,4,10,0.62)'; ctx.fillRect(0, 0, W, H);

    pxText('QUEM COMEÇA', W / 2, 46, {size:15, color:'#b89aff', align:'center', glow:'#7a4aca', blur:18});
    uiText('Você joga sozinho até a primeira missão. O resto do elenco entra depois, um por missão entregue.',
           W / 2, 72, {size:13, color:'#6a5a8a', align:'center'});

    /* Uma fileira só — é o que deixa a comparação imediata — mas agora
       com JANELA em vez de espremer o elenco inteiro.

       Derivar a largura do total funcionou até doze: com treze a carta
       caía para 54 px e o retrato deixava de conviver com o nome na
       mesma carta. Espremer mais era escolher entre ver o rosto e ler o
       nome. A janela resolve os dois e não tem teto: entra mais gente e
       a carta continua do mesmo tamanho, só anda mais.

       O mesmo recurso das listas de item e do Bestiário, pelo mesmo
       motivo — só que aqui o excedente ficava INVISÍVEL e selecionável,
       que é pior que rolar. */
    const gap = 6, margem = 24, VIS = Math.min(PARTY_DEFS.length, ESCOLHA_VISIVEIS);
    const cw = Math.min(116, Math.floor((W - margem + gap) / VIS) - gap);
    const total = VIS * (cw + gap) - gap;
    const ini = clamp(this.cur.i - Math.floor((VIS - 1) / 2), 0, Math.max(0, PARTY_DEFS.length - VIS));
    const x0 = (W - total) / 2, cy = 96, chh = 132;
    if (ini > 0)
      pxText('‹', x0 - 14, cy + 70, {size:14, color:'#6a5a8a', align:'center'});
    if (ini + VIS < PARTY_DEFS.length)
      pxText('›', x0 + total + 14, cy + 70, {size:14, color:'#6a5a8a', align:'center'});
    PARTY_DEFS.slice(ini, ini + VIS).forEach((d, k) => {
      const i = ini + k, on = this.cur.i === i, x = x0 + k * (cw + gap);
      const E = ELEM[d.element];
      const y = cy - (on ? 5 : 0);
      panel(x, y, cw, chh, {accent:on ? E.glow : '#3a3450', alpha:on ? 0.98 : 0.7});
      /* Os retratos NÃO são quadrados (vão de 38×64 a 56×64), então a
         altura é fixa e a largura sai da proporção real. Forçar 60×60
         espremia a Max e alargava o Seiji — o mesmo erro que já tinha
         sido corrigido no desenho dos inimigos. */
      const img = spriteImages[d.portrait];
      if (img?.complete && (img.naturalWidth || img.width)){
        const ih = img.naturalHeight || img.height, iw = img.naturalWidth || img.width;
        const dh = 60, dw = Math.round(iw / ih * dh);
        const ix = x + cw / 2 - dw / 2, iy = y + 12;
        ctx.save();
        if (!on) ctx.globalAlpha = 0.55;
        ctx.drawImage(img, ix, iy, dw, dh);
        ctx.strokeStyle = on ? E.glow : '#3a3450'; ctx.lineWidth = 1;
        ctx.strokeRect(Math.floor(ix) + 0.5, iy + 0.5, dw, dh);
        ctx.restore();
      }
      /* O corpo do nome encolhe quando ele não cabe na carta. "Ava Rosa
         Groot" em tamanho 9 mede mais que a carta inteira e vazava por
         cima das vizinhas — e o nome é escolha do jogador, não minha,
         então quem cede é a fonte. */
      const passo = 9 * 0.62;                     // largura média por letra
      const tam = d.name.length * passo > cw - 8
                ? Math.max(6, Math.floor((cw - 8) / (d.name.length * 0.62)))
                : 9;
      pxText(d.name, x + cw / 2, y + 92, {size:tam, color:on ? '#fff' : '#8a7aaa', align:'center'});
      uiText(d.role, x + cw / 2, y + 110, {size:12, color:on ? E.glow : '#5a4a7a', align:'center'});
      uiText(E.name, x + cw / 2, y + 126, {size:11, color:on ? '#8a7aaa' : '#453a5a', align:'center'});
      if (on){
        const b = Math.sin(t / 200) * 3;
        pxText('▼', x + cw / 2, y - 8 + b, {size:9, color:E.glow, align:'center'});
      }
    });

    // --- painel de detalhe do escolhido ---
    const d = PARTY_DEFS[this.cur.i], c = makeChar(d, 5), E = ELEM[d.element], M = this.tetos();
    const py = ESCOLHA_PAINEL.y, ph = ESCOLHA_PAINEL.h;
    panel(ESCOLHA_PAINEL.x, py, ESCOLHA_PAINEL.w, ph, {accent:E.glow});

    // arte grande, quando existe (o mesmo caminho de desenho do combate)
    const art = battleArtOf(d.name);
    if (art) drawBattleArt(art, 152, py + ph - 26, {glow:E.glow, time:this.t});
    else {
      const img = spriteImages[d.portrait];
      if (img?.complete && (img.naturalWidth || img.width)){
        const ih = img.naturalHeight || img.height, iw = img.naturalWidth || img.width;
        const dh = 132, dw = Math.round(iw / ih * dh);
        ctx.drawImage(img, 152 - dw / 2, py + 46, dw, dh);
      }
    }

    const bx = ESCOLHA_TEXTO_X;
    pxText(d.name, bx, py + 40, {size:14, color:E.glow, glow:E.main, blur:10});
    uiText(`${d.role} · ${E.name} · nível 5`, bx, py + 62, {size:13, color:'#8a7aaa'});

    // barras comparativas
    const STATS = [['hp','Vida',c.maxHp], ['mp','Éter',c.maxMp], ['atk','Ataque',c.atk],
                   ['def','Defesa',c.def], ['spd','Rapidez',c.spd]];
    STATS.forEach(([k, rot, v], i) => {
      const y = py + 92 + i * 22;
      uiText(rot, bx, y + 8, {size:12, color:'#7a6a9a'});
      bar(bx + 62, y, 150, 8, v / M[k], '#2a2040', E.main);
      uiText(String(v), bx + 220, y + 8, {size:12, color:'#b0a4c8'});
    });

    /* Frase de origem (lore), no vão vazio entre as colunas de stat/
       skill (terminam perto de py+210) e o pitch de jogabilidade
       (começa em py+ph-52=py+240) — não disputa espaço com nenhum dos
       dois. Some sem quebrar nada em personagem sem `lore` (guest ou
       futuro), já que só desenha quando o campo existe. */
    if (d.lore) uiText(`"${d.lore}"`, bx, py + 224, {size:12, color:'#6a5a86'});

    // o que já vem destravado de graça na árvore
    const prontas = c.skills.map(id => SKILLS[id]).filter(Boolean);
    uiText('Já sabe:', bx + 268, py + 100, {size:12, color:'#7a6a9a'});
    prontas.slice(0, 4).forEach((s, i) => {
      uiText(`${s.name}  ·  ${ELEM[s.elem].name}`, bx + 268, py + 120 + i * 20,
             {size:12, color:'#c0b4d8'});
    });
    /* O resto não vem mais por nível: vem por escolha na árvore. A frase
       precisa dizer isso, senão promete algo que o jogo não faz mais. */
    const naArvore = Object.values(TREES[d.name] || {})
                           .filter(n => n.tipo === 'skill' && !n.inicial).length;
    if (naArvore)
      uiText(`+${naArvore} na árvore, na ordem que você quiser`,
             bx + 268, py + 120 + Math.min(4, prontas.length) * 20 + 6,
             {size:11, color:'#5a4a7a'});

    /* A frase quebra dentro do painel, não na largura da tela: o texto
       começa em `bx` e o painel acaba em W-60, então a largura útil é a
       diferença. Usar W-200 aqui fazia as seis frases vazarem a borda. */
    wrapUI(d.pitch, ESCOLHA_TEXTO_W, 13).forEach((ln, i) =>
      uiText(ln, bx, py + ph - 52 + i * 18, {size:13, color:'#9a8ab0'}));

    pxText('< > escolher    Z confirmar    X voltar', W / 2, H - 20,
           {size:8, color:'#5a4a7a', align:'center'});
  },
};
