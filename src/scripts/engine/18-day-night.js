/* ===================================================================
   7b. CICLO DE DIA E NOITE
   O relógio anda em PASSOS, não em segundos. É a mesma moeda que o
   encontro aleatório e a regeneração do Madao já usam, e traz três
   coisas de graça:
     · o mundo não envelhece enquanto o menu está aberto ou o jogo
       está parado — anoitecer porque o jogador foi almoçar seria
       castigo por pausar;
     · o save já grava passos, então a hora atravessa o save;
     · o autoteste consegue provar o ciclo inteiro sem esperar relógio
       de verdade: é só somar passos.

   Um dia leva DIA_EM_PASSOS passos. 900 dá cerca de doze minutos de
   caminhada por volta completa — tempo suficiente para uma ida e volta
   a uma masmorra acontecer sob a mesma luz, e curto o bastante para
   quem quer ver a noite não precisar de expedição.
   =================================================================== */
const DIA_EM_PASSOS = 900;
const MINUTOS_DIA   = 24 * 60;

/* As fases são âncoras, não gavetas: `luzAgora` interpola entre a fase
   atual e a seguinte, senão o mundo mudaria de cor num estalo no passo
   exato da virada. `cor` é o véu que cai sobre o campo — de madrugada
   pesado e azul, ao meio-dia inexistente. */
/* A luz do dia é MULTIPLICAÇÃO por canal, não véu de alfa por cima.

   A diferença não é de gosto, é do que cada conta faz com a cor. Véu de
   alfa mistura tudo com um cinza-azulado: a grama e a pedra caminham
   juntas para a mesma cor, e a cena perde a diferença entre as coisas —
   fica tela escurecida, não noite. Multiplicação rebaixa CADA canal por
   um fator: o verde da grama continua sendo o canal forte dela, só que
   mais fundo. A cena escurece guardando quem é quem.

   Os números da noite não foram escolhidos: foram MEDIDOS no par de
   mockups de Porto Lúmina, que traz a mesma cena de dia e de noite.
   Comparando três trechos sem lampião por perto (grama, calçada, copa de
   árvore), a noite de lá é exatamente

       R × 0,402    G × 0,317    B × 0,681

   — quase todo o vermelho e o verde vão embora, o azul fica.

   A DIREÇÃO é essa; a PROFUNDIDADE não pôde ser copiada, e o motivo está
   medido. Luminância média, só a área de mundo:

       mockup    dia 136,1   noite  48,9   razão 0,359
       jogo      dia  46,4   noite  17,1   razão 0,369

   A razão bate quase exata — aplicar o número medido dá uma noite tão
   escura quanto a de Porto Lúmina, proporcionalmente. Só que o MEIO-DIA
   do jogo (46,4) já é mais escuro que a NOITE do mockup (48,9): a arte
   daqui parte de um terço do brilho de lá, e Porto Lúmina ainda acende
   lampião, coisa que este jogo não tem. O resultado foi tela quase preta,
   com o chão sumindo.

   Então a noite daqui usa a direção medida NORMALIZADA — o vetor inteiro
   multiplicado até o canal mais forte (o azul) chegar a 1. A cor da noite
   é a mesma de Porto Lúmina; o que muda é que ela para de escurecer além
   do que a mudança de cor já escurece. Dá luminância 0,53 do meio-dia,
   que é onde o chão ainda se lê.
   Multiplicação só escurece; meio-dia é [1,1,1], que é a referência. */
const FASES = [
  {id:'madrugada',  nome:'Madrugada',  hora: 0, mult:[0.530, 0.420, 0.940]},
  {id:'amanhecer',  nome:'Amanhecer',  hora: 5, mult:[0.720, 0.600, 0.880]},
  {id:'manha',      nome:'Manhã',      hora: 8, mult:[0.940, 0.950, 1.000]},
  {id:'meiodia',    nome:'Meio-dia',   hora:12, mult:[1.000, 1.000, 1.000]},
  {id:'tarde',      nome:'Tarde',      hora:15, mult:[1.000, 0.960, 0.900]},
  {id:'entardecer', nome:'Entardecer', hora:18, mult:[1.000, 0.740, 0.560]},
  {id:'anoitecer',  nome:'Anoitecer',  hora:20, mult:[0.740, 0.580, 0.980]},
  {id:'noite',      nome:'Noite',      hora:22, mult:[0.590, 0.470, 1.000]},
];
/* O que foi medido no mockup, guardado porque é dado e não chute: se um
   dia a arte do campo clarear, a noite pode voltar a ser exatamente esta. */
const NOITE_MEDIDA = [0.402, 0.317, 0.681];

/* Jogo novo tem zero passos, e zero passos precisa ser uma hora em que se
   sai de casa — não meia-noite. O relógio começa às 8h e o deslocamento
   vale para tudo que deriva dele. */
const HORA_INICIAL = 8;
const PASSO_ZERO   = Math.round(HORA_INICIAL / 24 * DIA_EM_PASSOS);

/** Minuto do dia (0..1439) correspondente ao passo atual. */
function minutoDoDia(passos = G.steps){
  const p = passos + PASSO_ZERO;
  const frac = (((p % DIA_EM_PASSOS) + DIA_EM_PASSOS) % DIA_EM_PASSOS) / DIA_EM_PASSOS;
  return Math.floor(frac * MINUTOS_DIA);
}
const horaDoDia = (passos = G.steps) => minutoDoDia(passos) / 60;
/** Em que dia o jogo está. Vira à meia-noite, não no passo zero — por
 *  isso conta com o mesmo deslocamento que o relógio. */
const diaDoJogo = (passos = G.steps) =>
  Math.floor((passos + PASSO_ZERO) / DIA_EM_PASSOS) + 1;

function fasesVizinhas(h){
  let i = 0;
  for (let k = 0; k < FASES.length; k++) if (h >= FASES[k].hora) i = k;
  const j = (i + 1) % FASES.length;
  // a última fase fecha o ciclo na primeira do dia seguinte (+24h)
  const fim = j === 0 ? FASES[0].hora + 24 : FASES[j].hora;
  const t = fim === FASES[i].hora ? 0 : clamp((h - FASES[i].hora) / (fim - FASES[i].hora), 0, 1);
  return [FASES[i], FASES[j], t];
}

/* A fase em que o relógio ESTÁ — a última âncora que passou, não a mais
   próxima. A diferença aparece na virada: às 23h faltam 60 minutos para
   a madrugada e a âncora dela é a mais perto, mas quem está lá fora
   ainda está na noite. Âncora serve para interpolar cor; nome de fase é
   o lugar onde se está. */
function faseAtual(passos = G.steps){
  return fasesVizinhas(horaDoDia(passos))[0];
}

/* Noite sai da própria fase, e não de um par de horas repetido aqui:
   mexer numa âncora de FASES move o escuro e o perigo junto, sem deixar
   para trás uma regra que ninguém lembra de atualizar. */
const FASES_NOTURNAS = new Set(['anoitecer', 'noite', 'madrugada']);
const ehNoite = (passos = G.steps) => FASES_NOTURNAS.has(faseAtual(passos).id);

/** O véu de luz do momento: cor já interpolada e pronta para o campo. */
function luzAgora(passos = G.steps){
  const [a, b, t] = fasesVizinhas(horaDoDia(passos));
  const m = [0, 1, 2].map(k => lerp(a.mult[k], b.mult[k], t));
  const c = m.map(v => Math.round(clamp(v, 0, 1) * 255));
  /* `escuro` é quanta luz foi embora, de 0 (meio-dia) a 1 (breu). Serve
     para quem só precisa saber a intensidade — o desenho usa `css`. */
  const escuro = 1 - (m[0] + m[1] + m[2]) / 3;
  return {mult:m, r:c[0], g:c[1], b:c[2], escuro,
          css:`rgb(${c[0]},${c[1]},${c[2]})`};
}

/** Relógio para a tela: "Dia 2 · 19:20". */
function relogioTexto(passos = G.steps){
  const m = minutoDoDia(passos);
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `Dia ${diaDoJogo(passos)} · ${hh}:${mm}`;
}

/* À noite o mato fica mais perigoso: o contador de encontro sai menor,
   então a criatura vem antes. É o único efeito do ciclo sobre a regra do
   jogo, e é de propósito — dia e noite que só troca a cor da tela é
   filtro, não sistema; dia e noite que mexe em dano ou em preço mandaria
   o jogador dormir para jogar direito, que é tédio disfarçado de
   estratégia. Andar com mais medo à noite é o custo certo. */
const ENC_NOITE = 0.65;

function onStepComplete(){
  const faseAntes = faseAtual();
  G.steps++;
  /* A virada só é anunciada a céu aberto. Dentro da masmorra o jogador
     não tem como ver que amanheceu, e o aviso soaria vindo do nada. */
  if (G.map?.def.outdoor && faseAtual().id !== faseAntes.id)
    showBanner(`${faseAtual().nome} · ${relogioTexto()}`);
  regenMadao();
  const t = tileAt(G.player.tx, G.player.ty);
  if (G.steps % 2 === 0) Sound.sfx('step');
  // passagem (pode estar travada por flag)
  const wp = G.map.warps.find(w => w.x === G.player.tx && w.y === G.player.ty);
  if (wp){
    if (wp.needFlag && !G.flags[wp.needFlag]){
      Sound.sfx('deny');
      Msg.start([{speaker:'', text:wp.blockedMsg || 'Está trancado.'}]);
      return;
    }
    Sound.sfx('door');
    FX.fade(() => loadMap(wp.to, wp.tx, wp.ty, wp.dir));
    return;
  }
  // gatilho de cena pisado no chão
  /* `flag` = "só uma vez"; `need` = "só depois que tal coisa aconteceu".
     São coisas diferentes e a v4.8 precisa das duas: a cena do portão
     sul fica num tile que o jogador pisa desde o começo do jogo, mas só
     faz sentido depois do Eco. */
  const gat = (G.map.def.triggers || []).find(g =>
    g.x === G.player.tx && g.y === G.player.ty &&
    (!g.flag || !G.flags[g.flag]) && (!g.need || G.flags[g.need]));
  if (gat){ Cut.play(gat.scene); return; }
  // encontro aleatório
  if (t.enc && G.map.def.encounter){
    G.stepsToEnc--;
    if (G.stepsToEnc <= 0){ resetEncounterCounter(); triggerEncounter(); }
  }
}

function triggerEncounter(){
  const pool = FORMATIONS[G.map.def.region];
  if (!pool || !pool.length) return;
  Sound.sfx('encounter');
  FX.battleWipe(() => Battle.begin(buildFormation(pick(pool))));
}
function buildFormation(spec){
  const out = [];
  for (const [id, n] of spec) for (let i = 0; i < n; i++) out.push(id);
  return out;
}

/* Um encontro de mob só desaparece com vitória. Fuga conserva a entidade
   no lugar; derrota recarrega o mapa e, como mob não é save, recompõe o
   estado transitório sem gravar progresso artificial. */
function defeatWorldMob(mob, now = Date.now()){
  if (!mob || mob.defeated) return false;
  mob.defeated = true; mob.engaging = false; mob.moving = false;
  mob.respawnAt = now + rnd(15, 10) * 1000;
  return true;
}
function respawnWorldMob(mob, now = Date.now()){
  if (!mob?.defeated || now < mob.respawnAt) return false;
  /* Não nasce em cima do grupo, de outro mob ou de objeto interativo.
     Se o ponto ainda estiver ocupado, tenta de novo logo; o mínimo de
     10 s já foi respeitado e o mapa continua transitável. */
  if (!isSafeWorldMobTile(mob.homeX, mob.homeY, mob)){
    mob.respawnAt = now + 500;
    return false;
  }
  Object.assign(mob, {tx:mob.homeX, ty:mob.homeY, px:mob.homeX * TILE, py:mob.homeY * TILE,
    fromX:mob.homeX, fromY:mob.homeY, moving:false, moveT:0, wait:rnd(3, 1),
    defeated:false, engaging:false, respawnAt:0});
  return true;
}
function startWorldMobBattle(mob){
  if (!mob || mob.defeated || mob.engaging || G.scene !== 'FIELD') return false;
  mob.engaging = true;
  Sound.sfx('encounter');
  FX.battleWipe(() => {
    Battle.begin(buildFormation(mob.formation));
    Battle.onFinish = kind => {
      /* `gameOver()` recarrega um mapa novo sem chamar o gancho. Se uma
         luta futura chegar a este callback obsoleto, ela não pode tocar
         a instância já descartada. */
      if (!G.map?.mobs?.includes(mob)) return;
      if (kind === 'victory') defeatWorldMob(mob);
      else mob.engaging = false;
    };
  });
  return true;
}

/* --- Falas ------------------------------------------------------- */
/** `npc.lines` aceita:
 *   - array de strings                      → fala simples
 *   - array de objetos {text, choices, ...}  → fala com escolha
 *   - função (G) => qualquer um dos acima    → fala condicional a flags
 *  Normaliza tudo para o formato que o Msg consome. */
function npcLines(npc){
  // NPC com missão: a fala dela tem prioridade sobre a fala solta
  if (npc.quest && QUESTS[npc.quest]) return questLines(npc).map(l => normalizeLine(l, npc));
  let raw = typeof npc.lines === 'function' ? npc.lines(G) : npc.lines;
  if (!Array.isArray(raw)) raw = [raw];
  return raw.map(l => normalizeLine(l, npc));
}
function normalizeLine(l, npc){
  const base = typeof l === 'string' ? {text:l} : {...l};
  return {
    ...base,
    speaker: base.speaker ?? npc?.name ?? '',
    portrait: base.portrait ?? npc?.portrait,
    text: base.text || '',
  };
}
/** Ajuda a escrever falas ramificadas nos dados dos mapas. */
function setFlag(k, v = true){ G.flags[k] = v; }
function flag(k){ return !!G.flags[k]; }

/* --- Missões ------------------------------------------------------
   Toda a conversa é gerada a partir da tabela QUESTS: um NPC vira
   dador de missão só ganhando o campo `quest:'<id>'`. */
const questState = id => G.quests?.[id]?.st || null;

/** Quanto já foi feito, no formato {feito, alvo}. */
function questProgress(id){
  const q = QUESTS[id], st = G.quests?.[id];
  if (!q) return {feito:0, alvo:0};
  if (q.tipo === 'hunt'){
    const base = st?.base ?? 0;
    return {feito:clamp((G.kills?.[q.alvo] || 0) - base, 0, q.qtd), alvo:q.qtd};
  }
  return {feito:Math.min(Bag.count(q.item), q.qtd), alvo:q.qtd};
}
const questReady = id => { const p = questProgress(id); return p.feito >= p.alvo; };

function acceptQuest(id){
  const q = QUESTS[id]; if (!q) return;
  G.quests[id] = {st:'ativa', base:q.tipo === 'hunt' ? (G.kills?.[q.alvo] || 0) : 0};
}
/** Paga o prêmio e fecha. Devolve as linhas a exibir. */
function completeQuest(id){
  const q = QUESTS[id];
  if (q.tipo === 'collect' && !Bag.take(q.item, q.qtd)) return ['Ainda falta material.'];
  G.quests[id] = {st:'feita', base:0};
  /* `cena` na missão dispara uma cutscene na ENTREGA. Não dá para tocar
     agora: ainda estamos dentro da caixa de diálogo do NPC. Vai para a
     fila e sobe assim que o campo reassumir — que é exatamente quando a
     conversa termina. */
  if (q.cena) Cut.queue(q.cena);
  const ganhos = [];
  if (q.premio.gold){ G.gold += q.premio.gold; ganhos.push(`${q.premio.gold}₢`); }
  for (const it of (q.premio.itens || [])){ Bag.add(it); ganhos.push(ITEMS[it].name); }
  Sound.sfx('levelup');
  const linhas = [`Recompensa: ${ganhos.join(', ')}.`];

  /* Missão que entrega PET. Igual ao recrutamento: o prêmio não é um
     número, é uma coisa nova para o jogador cuidar. Idempotente — se a
     missão for reentregue (save adulterado), `ganharPet` não duplica. */
  if (q.premio.pet && PETS[q.premio.pet]){
    const novo = !G.pets[q.premio.pet];
    ganharPet(q.premio.pet);
    if (novo){
      const P = PETS[q.premio.pet], F = petForma(q.premio.pet, 1);
      Sound.sfx('levelup');
      linhas.push(`${F.name} (${ELEM[P.elem].name}) agora acompanha o grupo!`);
      if (P.dono) linhas.push(`Com ${P.dono} em campo, ele age com mais força.`);
      if (G.petAtivo !== q.premio.pet)
        linhas.push('Troque quem acompanha em Menu → Pets.');
    }
  }

  /* O prêmio de verdade é gente. Cada missão da lista de recrutamento
     traz alguém do elenco — é assim que a party de 1 vira a party de 6.
     A entrada sai do mapa e não da tabela QUESTS porque o protagonista é
     escolhido pelo jogador (ver `montarRecrutas`). */
  const chegando = recrutasDaQuest(G.recruits?.[id]);
  if (chegando.length){
    if (G.recruits) delete G.recruits[id];
    for (const novo of chegando){
      if (!recrutar(novo)) continue;
      const c = charByName(novo);
      Sound.sfx('levelup');
      linhas.push(`${novo} (${c.role} · ${ELEM[c.element].name}) entrou para o grupo!`);
      if (!G.squad.includes(novo))
        linhas.push(`O grupo está cheio — ${novo} espera no banco. Troque em Menu → Grupo.`);
    }
  }
  return linhas;
}
/** Missões que o jogador aceitou e ainda não entregou. */
const activeQuests = () => Object.keys(QUESTS).filter(id => questState(id) === 'ativa');
/** Diário: ativas primeiro (prontas no topo), concluídas embaixo. */
function questJournal(){
  return Object.keys(QUESTS)
    .filter(id => questState(id))
    .map(id => ({id, st:questState(id), pronta:questState(id) === 'ativa' && questReady(id)}))
    .sort((a, b) => (b.pronta - a.pronta) || (a.st === 'feita') - (b.st === 'feita'));
}

/** Constrói a fala de um NPC dador, conforme o estado da missão. */
function questLines(npc){
  const id = npc.quest, q = QUESTS[id], st = questState(id);
  if (st === 'feita') return q.depois.map(t => ({speaker:npc.name, text:t}));
  if (st === 'ativa'){
    const p = questProgress(id);
    if (!questReady(id))
      return [...q.andamento.map(t => ({speaker:npc.name, text:t})),
              {speaker:'', text:`【${q.titulo}】 ${p.feito}/${p.alvo}`}];
    return [{speaker:npc.name, text:q.entrega[0]},
            {speaker:npc.name, text:q.entrega[1] || '', choices:[
              {label:'Entregar', run:() => completeQuest(id)},
              {label:'Ainda não', then:['Sem pressa.']},
            ]}];
  }
  // ainda não ofertada
  const linhas = q.oferta.map(t => ({speaker:npc.name, text:t}));
  linhas[linhas.length - 1] = {...linhas[linhas.length - 1], choices:[
    {label:`Aceitar — ${q.resumo}`, run:() => { acceptQuest(id); Sound.sfx('confirm');
      return ['Missão anotada. Veja o progresso no menu → Missões.']; }},
    {label:'Agora não', then:['A oferta fica de pé.']},
  ]};
  return linhas;
}

/* --- Interação --------------------------------------------------- */
function interact(){
  const p = G.player;
  const [dx, dy] = DIRV[p.dir];
  const tx = p.tx + dx, ty = p.ty + dy;

  const npc = G.map.npcs.find(n => n.tx === tx && n.ty === ty);
  if (npc){
    npc.dir = {up:'down', down:'up', left:'right', right:'left'}[p.dir];
    npc.busy = true;
    Msg.start(npcLines(npc), () => {
      npc.busy = false;
      if (npc.heal){ G.party.forEach(c => { c.hp = c.maxHp; c.mp = c.maxMp; c.ail = []; });
        Sound.sfx('heal'); showBanner('Party restaurada'); }
      if (npc.shop) Shop.open(npc.shop);
    });
    return;
  }
  const mob = worldMobAt(tx, ty);
  if (mob){ startWorldMobBattle(mob); return; }
  const boss = G.map.boss;
  if (boss && boss.eco && boss.tx === tx && boss.ty === ty){
    const n = G.revanches[boss.id] || 0;
    const teto = n >= REVANCHE_TETO;
    Sound.sfx('confirm');
    Msg.start([{speaker:'Eco', text:
      `O que sobrou de ${boss.name} ainda ronda esta sala.` +
      (n ? `\nJá caiu ${n} vez${n > 1 ? 'es' : ''} desde então${teto ? ', e não endurece mais' : ''}.`
         : '\nEle não esqueceu.'),
      choices:[
        {label:teto ? 'Enfrentar o eco' : `Enfrentar o eco (+${n + 1})`, run(){
          FX.battleWipe(() => Battle.begin([boss.id], {boss:true, revanche:true}));
          return null;
        }},
        {label:'Deixar quieto', run(){ return null; }},
      ]}]);
    return;
  }
  if (boss && boss.tx === tx && boss.ty === ty){
    /* `boss.retrato` é opcional (nem todo chefe tem um retrato calmo
       próprio ainda); sem ele a fala continua exatamente como antes
       (sem nome de quem fala, texto cru — é assim que os chefes sem
       retrato escrevem o próprio nome dentro do texto, ex. "O
       ARQUIVISTA: ..."). Com retrato, o nome vira `speaker` de verdade,
       porque é isso que acende o retrato em Msg.draw(). */
    Msg.start(boss.intro.map(t => ({
      speaker: boss.retrato ? boss.name : '', text:t, portrait:boss.retrato || undefined,
    })), () => {
      Sound.sfx('boss');
      FX.battleWipe(() => Battle.begin([boss.id], {boss:true}));
    });
    return;
  }
  const sign = G.map.signs.find(s => s.x === tx && s.y === ty);
  if (sign){ Msg.start([{speaker:'', text:sign.text}]); return; }

  const chest = G.map.chests.find(c => c.x === tx && c.y === ty);
  if (chest){
    const key = `chest:${G.mapId}:${chest.x},${chest.y}`;
    if (G.flags[key]){ Msg.start([{speaker:'', text:'O baú está vazio.'}]); return; }
    G.flags[key] = true;
    Bag.add(chest.item, chest.qty);
    Sound.sfx('chest');
    Msg.start([{speaker:'Achado', text:`Encontrou ${ITEMS[chest.item].name} ×${chest.qty}!`}]);
    return;
  }
  const t = tileAt(tx, ty);
  if (t.save || tileAt(p.tx, p.ty).save){ useCrystal(); return; }
  if (t.id === 'water'){ Msg.start([{speaker:'', text:'A água reflete cinco rostos cansados.'}]); return; }
  if (t.id === 'shelf'){ Msg.start([{speaker:'', text:'Tratados de éter, na maioria ilegíveis.'}]); return; }
  if (t.id === 'brazier'){ Msg.start([{speaker:'', text:'A chama arde sem consumir nada. Éter puro.'}]); return; }
}

/* --- Rede de cristais -------------------------------------------

   Cristal tocado é cristal na rede, e a rede é o que permite viajar.
   A chave é mapa:x:y porque um mapa pode ter mais de um — e porque
   assim registrar duas vezes o mesmo é idempotente de graça. */
const chaveCristal = (mapa, x, y) => `${mapa}:${x}:${y}`;

function registrarCristal(mapa, x, y){
  const k = chaveCristal(mapa, x, y);
  if (G.cristais[k]) return false;
  G.cristais[k] = {mapa, x, y, nome:MAPS[mapa]?.name || mapa, em:G.steps};
  return true;
}

/** Cristais já tocados, na ordem em que foram descobertos. */
function cristaisDescobertos(){
  return Object.entries(G.cristais)
    .map(([k, c]) => ({...c, k}))
    .sort((a, b) => (a.em || 0) - (b.em || 0));
}

function descansarNoCristal(){
  G.party.forEach(c => { c.hp = c.maxHp; c.mp = c.maxMp; c.ail = []; c.reso = Math.max(c.reso || 0, 30); });
}

/** Leva o grupo para um cristal da rede. Não valida: quem chama já sabe. */
function viajarPara(k){
  const d = G.cristais[k]; if (!d) return false;
  Sound.sfx('save');
  /* `FX.fade` existe para a viagem não ser um corte seco de mapa. É a
     mesma transição das portas — reusar é o que faz a viagem parecer
     parte do jogo em vez de um teletransporte de depuração. */
  FX.fade(() => {
    loadMap(d.mapa, d.x, d.y);
    G.player.dir = 'down';
    Msg.start([{speaker:'Cristal de Éter', text:`A ressonância deposita a party em ${d.nome}.`}]);
  });
  return true;
}

function useCrystal(){
  const novo = registrarCristal(G.mapId, G.player.tx, G.player.ty);
  const aqui = chaveCristal(G.mapId, G.player.tx, G.player.ty);
  const rede = cristaisDescobertos().filter(c => c.k !== aqui);

  const opcoes = [
    {label:'Descansar e salvar', run(){
      descansarNoCristal();
      const ok = Save.write();
      Sound.sfx('save');
      return [{speaker:'Cristal de Éter', text:
        'A ressonância percorre a party. HP e MP restaurados.' +
        (ok ? '\nProgresso salvo.' : '\n(Não foi possível salvar neste navegador.)')}];
    }},
  ];
  /* Viajar só aparece quando há PARA ONDE. Uma opção que sempre diz
     "você não conhece outro cristal" é uma opção que ensina o jogador a
     não ler o menu. */
  if (rede.length){
    opcoes.push({label:`Viajar (${rede.length})`, run(){
      return [{speaker:'Cristal de Éter', text:'Para onde a ressonância deve levar?',
               choices:[
                 ...rede.map(c => ({label:c.nome, run(){ viajarPara(c.k); return null; }})),
                 {label:'Ficar', run(){ return null; }},
               ]}];
    }});
  }
  opcoes.push({label:'Sair', run(){ return null; }});

  Sound.sfx('confirm');
  Msg.start([{speaker:'Cristal de Éter',
    text:(novo ? 'Um novo ponto entra na rede de ressonância.\n' : '') +
         'O cristal responde ao toque.',
    choices:opcoes}]);
}
