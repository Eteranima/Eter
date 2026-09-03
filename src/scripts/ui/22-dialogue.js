/* ===================================================================
   9. MENSAGENS (caixa de diálogo com máquina de escrever)
   =================================================================== */
/* Dialogue Sprite (v5.32) — arte grande de corpo inteiro ao lado da
   caixa de texto, referência: tela de diálogo do jogo Hades enviada
   pelo usuário. Nome do falante (`L.speaker`) → chave em SPRITE_DATA
   (ver bloco "Dialogue Sprites" em 00-assets.js). Uma linha pode
   forçar outro sprite (ex.: traje alternativo) com `L.dialogSprite`,
   que tem prioridade sobre a busca por nome. */
const DIALOGUE_SPRITES = {
  'Gabriel':              'dlg_gabriel',
  'Max':                  'dlg_max',
  'Ava Rosa Groot':       'dlg_ava',
  'Ophelia':              'dlg_ophelia',
  'Orfeu Bauss':          'dlg_orfeu',
  'Scythe':               'dlg_scythe',
  'Abel Nomikos':         'dlg_abel',
  'Kael Archimedes':      'dlg_kael',
  'Seiji':                'dlg_seiji',
  'Beatriz Demeter':      'dlg_beatriz',
  'Calder Pell':          'dlg_calderpell',
  'Carmila Reachforth':   'dlg_carmila',
  'Farnese':              'dlg_farnese',
  'Malquior Morningstar': 'dlg_malquior',
  'Sebastian Crowley':    'dlg_sebastian',
};

/* Direção NATIVA de cada arte de diálogo. Em uma conversa automática a
   composição leva o líder para a esquerda e o NPC para a direita; esta tabela
   vira somente a arte que estiver olhando para fora. Não use um espelho
   genérico: Ava, Abel, Orfeu e Seiji já olham para a direita, enquanto Max,
   Gabriel, Calder, Carmila e Sebastian olham para a esquerda. */
const DIALOGUE_SPRITE_FACING = {
  'Gabriel':'left', 'Max':'left', 'Ava Rosa Groot':'right', 'Ophelia':'left',
  'Orfeu Bauss':'right', 'Scythe':'left', 'Abel Nomikos':'right',
  'Kael Archimedes':'left', 'Seiji':'right', 'Beatriz Demeter':'left',
  'Calder Pell':'left', 'Carmila Reachforth':'left', 'Farnese':'left',
  'Malquior Morningstar':'left', 'Sebastian Crowley':'left',
};

function dialogueMirrorForCenter(speaker, side){
  const facing = DIALOGUE_SPRITE_FACING[speaker];
  return (side === 'left' && facing === 'left') || (side === 'right' && facing === 'right');
}

/* Uma linha aceita `participants` com no máximo duas presenças:
   {speaker, dialogSprite, sheet, side:'left'|'right', mirror, focus}. O campo
   `speaker` da linha continua sendo o falante ativo. Em duplas, artes `dlg_*`
   conhecidas se voltam automaticamente para o centro; `mirror` ainda pode
   sobrescrever esse padrão. `simultaneous:true` ou `focus:'all'` deixam a
   dupla clara. */
function dialogueParticipants(line){
  const raw = Array.isArray(line.participants) && line.participants.length
    ? line.participants.slice(0, 2)
    : [{speaker:line.speaker, dialogSprite:line.dialogSprite,
        side:line.side, mirror:line.mirror, focus:line.focus}];
  const allFocused = line.simultaneous || line.focus === 'all' || line.focus === 'both';

  return raw.map((entry, index) => {
    const participant = typeof entry === 'string' ? {speaker:entry} : {...entry};
    const side = participant.side === 'right' ? 'right'
      : participant.side === 'left' ? 'left'
      : raw.length > 1 && index === 1 ? 'right' : 'left';
    const lineFocus = typeof line.focus === 'string' && !allFocused
      ? line.focus === side || line.focus === participant.speaker
      : null;
    const focus = allFocused ? true
      : participant.focus ?? lineFocus ?? participant.speaker === line.speaker;
    const dialogSprite = participant.dialogSprite ??
      (participant.speaker === line.speaker ? line.dialogSprite : undefined);
    const hasDedicatedSprite = !!dialogueSpriteKey({...participant, dialogSprite});
    const mirror = participant.mirror ?? (raw.length === 2 && hasDedicatedSprite
      ? dialogueMirrorForCenter(participant.speaker, side)
      : false);
    return {...participant, dialogSprite, side, mirror, focus:!!focus};
  });
}

/* Só assets dedicados `dlg_*` podem entrar nesta camada. Isso impede que
   uma sheet de mundo (mesmo carregada em `spriteImages`) seja ampliada
   inteira por engano na caixa de diálogo. */
function dialogueSpriteKey(participant){
  const key = participant.dialogSprite || DIALOGUE_SPRITES[participant.speaker];
  return typeof key === 'string' && key.startsWith('dlg_') ? key : null;
}

/* Quando alguém ainda não tem arte de diálogo, a conversa continua legível:
   recortamos SOMENTE o quadro parado da direção voltada ao centro. A sheet
   inteira nunca entra no balão, e uma `dialogSprite` inválida não consegue
   burlar essa regra. */
function dialogueFallbackSheet(participant){
  if (participant.sheet && FRAME_INFO[participant.sheet]) return participant.sheet;
  return PARTY_DEFS.find(c => c.name === participant.speaker)?.sheet || null;
}

function dialogueSpriteSource(participant){
  const key = dialogueSpriteKey(participant);
  const dialog = key && spriteImages[key];
  const dialogW = dialog?.naturalWidth || dialog?.width;
  const dialogH = dialog?.naturalHeight || dialog?.height;
  if (dialog?.complete && dialogW && dialogH)
    return {kind:'dialogue', img:dialog, sx:0, sy:0, sw:dialogW, sh:dialogH};

  const sheet = dialogueFallbackSheet(participant);
  if (!hasSheet(sheet)) return null;
  const info = FRAME_INFO[sheet];
  const dir = participant.dir || (participant.side === 'right' ? 'left' : 'right');
  return {
    kind:'sheet', img:spriteImages[sheet],
    sx:Math.min(1, info.cols - 1) * info.fw,
    sy:(DIR_ROW[dir] ?? DIR_ROW.down) * info.fh,
    sw:info.fw, sh:info.fh,
  };
}

function drawDialogueSprite(participant){
  const source = dialogueSpriteSource(participant);
  if (!source) return;

  const ih = H * (source.kind === 'sheet' ? 0.64 : 0.92);
  const iw = source.sw / source.sh * ih;
  const x = participant.side === 'right' ? W - 18 - iw : 18;
  const y = H - ih;
  /* A orientação de uma sheet vem da sua linha direcional, nunca de espelho:
     assim um fallback não altera o quadro correto do personagem. */
  const mirror = source.kind === 'dialogue' && participant.mirror;
  ctx.save();
  if (participant.focus){
    ctx.shadowColor = 'rgba(230,216,255,.82)';
    ctx.shadowBlur = 20;
  } else {
    ctx.filter = 'brightness(.48) saturate(.32)';
    ctx.globalAlpha = .86;
  }
  if (mirror){
    ctx.translate(x + iw, y);
    ctx.scale(-1, 1);
    ctx.drawImage(source.img, source.sx, source.sy, source.sw, source.sh, 0, 0, iw, ih);
  } else ctx.drawImage(source.img, source.sx, source.sy, source.sw, source.sh, x, y, iw, ih);
  ctx.restore();
}

const Msg = {
  active:false, lines:[], i:0, shown:0, onEnd:null, prev:null,
  cur:{i:0},                     // cursor da escolha
  CPS:58,

  start(lines, onEnd){
    if (!lines || !lines.length) { onEnd?.(); return; }
    this.lines = lines.slice(); this.i = 0; this.shown = 0; this.onEnd = onEnd || null;
    this.active = true; this.cur.i = 0;
    this.prev = G.scene; G.scene = 'DIALOGUE';
  },
  get line(){ return this.lines[this.i]; },
  get complete(){ return this.shown >= (this.line?.text.length || 0); },
  /** Escolhas só aparecem depois do texto terminar de escrever. */
  get choices(){
    const ch = this.line?.choices;
    if (!ch || !this.complete) return null;
    const vis = ch.filter(o => !o.when || o.when(G));
    return vis.length ? vis : null;
  },

  finish(){
    this.active = false;
    G.scene = this.prev === 'DIALOGUE' ? 'FIELD' : (this.prev || 'FIELD');
    const cb = this.onEnd; this.onEnd = null; cb?.();
  },
  advance(){
    this.i++; this.shown = 0; this.cur.i = 0;
    if (this.i >= this.lines.length) this.finish();
  },
  /** Executa a opção escolhida e emenda as falas de resposta. */
  choose(opt){
    Sound.sfx('confirm');
    if (opt.set) for (const [k, v] of Object.entries(opt.set)) G.flags[k] = v;
    const extra = opt.run ? opt.run(G) : null;
    const seguintes = opt.then || extra;
    this.i++; this.shown = 0; this.cur.i = 0;
    if (Array.isArray(seguintes) && seguintes.length){
      const anterior = this.lines[this.i - 1];
      const norm = seguintes.map(l => normalizeLine(l, {name:anterior?.speaker}, {
        participants:anterior?.participants,
      }));
      this.lines.splice(this.i, 0, ...norm);
    }
    if (this.i >= this.lines.length) this.finish();
  },

  update(dt){
    if (!this.active) return;
    if (!this.complete) this.shown += this.CPS * dt;

    const ch = this.choices;
    if (ch){
      navList(this.cur, ch.length);
      if (Input.pressed('confirm')) this.choose(ch[this.cur.i % ch.length]);
      return;                                   // escolha trava o avanço
    }
    if (Input.pressed('confirm') || Input.pressed('cancel')){
      if (!this.complete){ this.shown = this.line.text.length; }
      else { Sound.sfx('cursor'); this.advance(); }
    }
  },

  draw(){
    if (!this.active) return;
    const L = this.line;
    /* Sprites inteiros ancorados no chão, atrás da caixa. O ouvinte vai
       primeiro para que o falante claro fique visualmente em foco. */
    dialogueParticipants(L)
      .sort((a, b) => Number(a.focus) - Number(b.focus))
      .forEach(drawDialogueSprite);
    /* Retrato DENTRO do balão foi removido de propósito (v5.32): quem
       identifica quem fala agora é o Dialogue Sprite de corpo inteiro
       desenhado acima. `L.portrait` continua existindo nos dados (menu,
       bestiário, etc. usam), só não é mais desenhado aqui. */
    const bh = 116, by = H - bh - 12;
    panel(12, by, W - 24, bh);
    let tx = 28, ty = by + 30;
    if (L.speaker){
      pxText(L.speaker, tx, by + 26, {size:9, color:'#b89aff'});
      ty = by + 52;
    } else ty = by + 34;
    const text = L.text.slice(0, Math.floor(this.shown));
    wrapUI(text, W - tx - 44, 15).forEach((ln, k) => uiText(ln, tx, ty + k * 22, {size:15}));

    const ch = this.choices;
    if (ch){
      const cw = 340, cy = by - ch.length * 30 - 20;
      panel(W - cw - 22, cy, cw, ch.length * 30 + 18, {accent:'#7a5aba'});
      ch.forEach((o, k) => {
        const on = this.cur.i % ch.length === k, y = cy + 28 + k * 30;
        if (on){ ctx.fillStyle = 'rgba(120,86,200,.26)'; ctx.fillRect(W - cw - 12, y - 17, cw - 20, 26); }
        pxText((on ? '▸ ' : '  ') + o.label, W - cw - 2, y, {size:8, color:on ? '#fff' : '#9a8ab0'});
      });
    } else if (this.complete){
      const bl = Math.sin(Date.now() / 260) > 0 ? 1 : .25;
      pxText('▼', W - 34, by + bh - 14, {size:8, color:`rgba(184,154,255,${bl})`, align:'right'});
    }
    if (this.lines.length > 1)
      pxText(`${this.i + 1}/${this.lines.length}`, W - 34, by + 24, {size:7, color:'#5a4a7a', align:'right'});
  },
};
