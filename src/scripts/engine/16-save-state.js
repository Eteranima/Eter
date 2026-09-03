/* ===================================================================
   6. SAVE / LOAD
   =================================================================== */
/* --- Três slots de save (v5.26) -------------------------------------

   O slot 0 usa a chave ANTIGA, sem sufixo. Não é preguiça: é o que faz
   um save feito antes desta versão continuar aparecendo, no lugar de
   sumir e o jogador achar que perdeu trinta horas. Os slots 1 e 2 são
   novos e ganham sufixo.

   `Save.slot` é o slot em uso. Tudo o mais — cristal, menu, autoteste —
   continua chamando `Save.write()` sem argumento e escreve no slot
   certo sozinho. */
const SAVE_SLOTS = 3;

const Save = {
  slot:0,
  chave(i = this.slot){ return i === 0 ? SAVE_KEY : `${SAVE_KEY}:s${i}`; },
  available(){ try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; } catch(e){ return false; } },

  /** O cabeçalho de um slot, para a tela de seleção. Nunca lança. */
  resumo(i){
    const s = this.read(i);
    if (!s) return {slot:i, vazio:true};
    const lider = (s.party || [])[s.leader || 0] || (s.party || [])[0] || {};
    return {
      slot:i, vazio:false,
      nome:lider.name || '—', lvl:lider.lvl || 1,
      mapa:MAPS[s.map]?.name || s.map || '—',
      grupo:(s.party || []).length,
      playtime:s.playtime || 0, at:s.at || 0, v:s.v || '?',
    };
  },
  write(){
    const data = {
      v: APP_VERSION, at: Date.now(), playtime: G.playtime,
      map: G.mapId, x: G.player.tx, y: G.player.ty, dir: G.player.dir,
      leader: G.leader, gold: G.gold, items: G.items, flags: G.flags,
      pinnedItems: G.pinnedItems,
      steps: G.steps,
      squad: G.squad.slice(),   // lista de nomes em campo (v4.3+)
      recruits: {...G.recruits}, // missão → quem ela ainda vai trazer (v4.4+)
      pets: {...G.pets}, petAtivo: G.petAtivo,   // (v4.9+) só nível e EXP
      difficulty: G.difficulty, moldura: G.moldura, tema: G.tema,
      modificadorCombate: G.modificadorCombate,
      gameMaster: G.gameMaster,
      quests: G.quests, kills: G.kills, cacada: G.cacada, vistos: G.vistos,
      cristais: G.cristais,     // rede de viagem rápida (v5.22)
      visitados: G.visitados,   // nevoeiro do mapa (v5.22)
      revanches: G.revanches,   // ecos de chefe já derrubados (v5.24)
      party: G.party.map(p => ({
        name:p.name, lvl:p.lvl, exp:p.exp, hp:p.hp, mp:p.mp,
        /* `skills` continua sendo gravado mesmo sendo derivado da
           árvore: é o que permite a um save desta versão ser lido por
           uma build antiga sem o elenco ficar mudo. */
        skills:p.skills.slice(), tree:(p.tree || []).slice(),
        bonusPontos:p.bonusPontos || 0,
        ult:p.ult, inParty:p.inParty,
        gear:{...p.gear},
      })),
    };
    try { localStorage.setItem(this.chave(), JSON.stringify(data)); return true; }
    catch(e){ console.warn('save falhou', e); return false; }
  },
  read(i = this.slot){
    try { const s = localStorage.getItem(this.chave(i)); return s ? JSON.parse(s) : null; }
    catch(e){ return null; }
  },
  exists(i = this.slot){ return !!this.read(i); },
  erase(i = this.slot){ try { localStorage.removeItem(this.chave(i)); } catch(e){} },
  /** Algum slot tem jogo? É o que decide se a tela inicial tem o que continuar. */
  algum(){ for (let i = 0; i < SAVE_SLOTS; i++) if (this.exists(i)) return true; return false; },
};
const modificadorDoSave = s => s?.modificadorCombate === true;

/* ===================================================================
   7. ESTADO DE JOGO
   =================================================================== */
/* Tamanho do grupo em campo. O elenco tem 6; entram até 5 por vez, e
   quem sobra fica no banco ganhando EXP reduzido (RESERVE_EXP).
   MUDAR ESTE NÚMERO INVALIDA O BALANCEAMENTO — a vida e o ataque das
   criaturas foram derivados da vazão de dano de 5 atores por rodada.

   O teto é 5, e não 6, para preservar uma escolha relevante de formação:
   manter parte do elenco na reserva exige decidir quem entra em cada
   combate. */
const PARTY_SIZE = 5;

const G = {
  scene:'TITLE',          // TITLE | CHOOSE | FIELD | DIALOGUE | MENU | SHOP | BATTLE | CUTSCENE | GAMEOVER
  playtime:0,
  party:[],               // elenco JÁ RECRUTADO (começa com 1, chega a 6)
  recruits:{},            // missão pendente → nome que ela traz
  squad:[],               // nomes em campo, na ordem da formação (até 5)
  leader:0,               // quem anda na frente, índice dentro do grupo
  gold:120, items:{potion:3, ether:1}, flags:{},
  pinnedItems:[],         // favoritos da loja, para a aba de compra rápida (v-atual)
  difficulty:'normal',
  quests:{},              // id da missão → {estado, progresso}
  kills:{},               // chave da criatura → total abatido
  cristais:{},            // rede de viagem rápida: mapa:x:y → ponto
  visitados:{},           // id do mapa → true, o nevoeiro do mapa
  revanches:{},           // id do chefe → quantas vezes o eco já caiu
  tema:'relogio',         // tema de interface (ver TEMAS)
  modificadorCombate:false,
  gameMaster:false,       // Modo Mestre (código secreto no título, v5.32)
  pets:{},                // id do pet → {lvl, exp}. Só os já conquistados.
  /* Contador de caça (v5.29). `cacada` é quantas mortes daquela espécie
     desde o último drop de raridade máxima — é ele que multiplica a
     chance. `vistos` é quantas vezes a espécie APARECEU, que o Bestiário
     usa para decidir o quanto revela. Os dois são por espécie e
     independentes: matar lobo não mexe no contador da harpia. */
  cacada:{}, vistos:{},
  petAtivo:null,          // id do pet que acompanha o grupo (um por vez)
  mapId:null, map:null,
  player:{tx:0, ty:0, px:0, py:0, dir:'down', moving:false, moveT:0, animT:0, fromX:0, fromY:0},
  followers:[],
  steps:0, stepsToEnc:0,
  camera:{x:0, y:0},
  banner:{text:'', t:0},
};

const ModificadorCombate = {
  janelaMs:10000, ciclos:0, inicio:0, aguardandoLigar:false,
  reset(){ this.ciclos = 0; this.inicio = 0; this.aguardandoLigar = false; },
  registrarSom(mudo, agora = performance.now()){
    if (this.inicio && agora - this.inicio > this.janelaMs) this.reset();
    if (mudo){ if (!this.inicio) this.inicio = agora; this.aguardandoLigar = true; return false; }
    if (!this.aguardandoLigar) return false;
    this.aguardandoLigar = false; this.ciclos++;
    if (this.ciclos < 3) return false;
    G.modificadorCombate = !G.modificadorCombate; this.reset(); return true;
  },
  alternarSom(){
    Sound.init(); const mudo = Sound.toggleMute();
    if (this.registrarSom(mudo)) Sound.sfx('crit'); else Sound.sfx('confirm');
  },
};

function makeChar(def, lvl = 5){
  const c = {
    name:def.name, element:def.element, role:def.role,
    sheet:def.sheet, portrait:def.portrait, base:def.base, grow:def.grow, learn:def.learn,
    lvl:1, exp:0, hp:0, mp:0, maxHp:0, maxMp:0, atk:0, def:0, spd:0,
    skills:[], tree:[], ult:ULTIMATES[def.name] ? def.name : null,
    reso:0,                   // gauge de Ressonância 0..100
    res:null,                 // tabela de resistência elemental (vem do equipamento)
    gear:{weapon:null, armor:null, accessory:null},
    ail:[], buffs:[], guarding:false, inParty:true,
  };
  c.lvl = lvl;
  syncArvore(c); recalcStats(c);
  c.hp = c.maxHp; c.mp = c.maxMp;
  return c;
}

/** Soma de um atributo vindo das três peças equipadas. */
function gearBonus(c, stat){
  let n = 0;
  for (const slot of Object.keys(SLOTS)){
    const it = ITEMS[c.gear?.[slot]];
    if (it?.equip?.[stat]) n += it.equip[stat];
  }
  return n;
}
/** Elemento do ataque básico — vem da arma, ou neutro sem arma. */
function weaponElem(c){ return ITEMS[c.gear?.weapon]?.equip?.elem || 'none'; }

function recalcStats(c){
  const n = c.lvl - 1, b = c.base, g = c.grow;
  /* Três fontes somam no atributo final: nível, equipamento e as
     passivas da árvore. A árvore entra aqui e não em `base` porque
     `base` é tabela fixa do personagem — o que o jogador comprou é
     estado dele, e tem que sumir junto se ele redefinir a árvore. */
  c.maxHp = Math.max(1, Math.round(b.hp  + g.hp  * n) + gearBonus(c,'hp')  + treeBonus(c,'hp'));
  c.maxMp = Math.max(0, Math.round(b.mp  + g.mp  * n) + gearBonus(c,'mp')  + treeBonus(c,'mp'));
  c.atk   = Math.max(1, Math.round(b.atk + g.atk * n) + gearBonus(c,'atk') + treeBonus(c,'atk'));
  c.def   = Math.max(0, Math.round(b.def + g.def * n) + gearBonus(c,'def') + treeBonus(c,'def'));
  c.spd   = Math.max(1, Math.round(b.spd + g.spd * n) + gearBonus(c,'spd') + treeBonus(c,'spd'));
  c.hp = clamp(c.hp, 0, c.maxHp); c.mp = clamp(c.mp, 0, c.maxMp);
  c.res = gearResist(c);
}

/* Resistência elemental vinda do equipamento.
   Multiplicam-se entre si: duas peças de 0,8 contra Fogo dão 0,64.
   O resultado vai para `c.res`, que é EXATAMENTE o mesmo campo que o
   bestiário usa — `elemMult` já sabe ler os dois. O gauge de
   Ressonância mora em `c.reso` justamente para não colidir com isto:
   antes os dois dividiam `res` e o primeiro golpe em um inimigo
   sobrescrevia a tabela de resistência dele com um número. */
function gearResist(c){
  let out = null;
  for (const slot of Object.keys(SLOTS)){
    const it = ITEMS[c.gear?.[slot]];
    if (!it?.equip?.resist) continue;
    out = out || {};
    for (const [el, m] of Object.entries(it.equip.resist))
      out[el] = (out[el] ?? 1) * m;
  }
  return out;
}

/** Equipa `id` em `c`, devolvendo à bolsa o que estava no slot. */
function equipItem(c, id){
  const it = ITEMS[id];
  if (!it || it.kind !== 'equip') return {ok:false, why:'Item não equipável.'};
  if (!Bag.take(id)) return {ok:false, why:'Você não tem esse item.'};
  const slot = it.slot;
  const antigo = c.gear[slot];
  if (antigo) Bag.add(antigo);
  c.gear[slot] = id;
  recalcStats(c);
  return {ok:true, text:`${c.name} equipou ${it.name}.`, replaced:antigo};
}
function unequipItem(c, slot){
  const id = c.gear[slot];
  if (!id) return {ok:false, why:'Nada equipado aí.'};
  c.gear[slot] = null;
  Bag.add(id);
  recalcStats(c);
  return {ok:true, text:`${c.name} guardou ${ITEMS[id].name}.`};
}

/* Peso de cada atributo ao COMPARAR equipamentos. ATK e DEF entram
   direto na fórmula de dano, então pesam mais; HP e MP são reservas
   grandes e valem pouco por ponto — sem esses pesos um amuleto de
   +70 HP ganharia de qualquer arma. */
const PESO_EQUIP = {atk:3, def:2.2, spd:1.5, hp:0.22, mp:0.3};

/** Quanto `id` vale para `c`, em pontos comparáveis entre slots. */
function valorEquip(c, id){
  const e = ITEMS[id]?.equip;
  if (!e) return 0;
  let v = 0;
  for (const [k, w] of Object.entries(PESO_EQUIP)) v += (e[k] || 0) * w;
  /* Resistência é multiplicador: 0.7 corta 30% do dano daquele elemento. */
  if (e.resist) for (const m of Object.values(e.resist)) v += (1 - m) * 12;
  if (e.combo)   v += -e.combo * 0.6;
  if (e.poiseUp) v += e.poiseUp * 12;
  /* Desempate temático: a arma do elemento do personagem mantém o ataque
     básico alinhado com as habilidades dele. */
  if (e.elem && e.elem === c.element) v += 1.5;
  return v;
}

/** Equipa o melhor de cada slot em `alvos`.
 *
 *  Tudo o que está equipado volta para a bolsa antes da escolha, senão
 *  quem já tem a peça boa nunca a cede. Com mais de um personagem a
 *  disputa é gulosa pelo maior ganho: a cada rodada sai o par
 *  (personagem, peça) de maior valor, e cada um leva no máximo uma peça
 *  por slot. Só entra o que tem valor positivo — assim um item que só
 *  tem penalidade fica na bolsa em vez de ser vestido.
 *
 *  Devolve o número de slots que de fato MUDARAM. */
function autoEquipar(alvos){
  const antes = alvos.map(c => ({...c.gear}));
  for (const slot of Object.keys(SLOTS)){
    for (const c of alvos) if (c.gear[slot]){ Bag.add(c.gear[slot]); c.gear[slot] = null; }
    const livres = alvos.slice();
    while (livres.length){
      let melhor = null;
      for (const c of livres)
        for (const id of Bag.list()){
          const it = ITEMS[id];
          if (it.kind !== 'equip' || it.slot !== slot) continue;
          const v = valorEquip(c, id);
          if (v > 0 && (!melhor || v > melhor.v)) melhor = {c, id, v};
        }
      if (!melhor) break;
      Bag.take(melhor.id);
      melhor.c.gear[slot] = melhor.id;
      livres.splice(livres.indexOf(melhor.c), 1);
    }
  }
  for (const c of alvos) recalcStats(c);
  return alvos.reduce((n, c, i) =>
    n + Object.keys(SLOTS).filter(s => c.gear[s] !== antes[i][s]).length, 0);
}

/* ---------- Bestiário (v5.29) ----------
   Só entra na lista quem já apareceu em alguma luta. Ordenado por nível
   e depois por nome: é assim que o jogador percorre o mundo, e ordenar
   por id daria uma lista que não quer dizer nada para quem joga. */
function bestiarioVisto(){
  return Object.keys(BESTIARY)
    .filter(id => (G.vistos?.[id] || 0) > 0)
    .sort((a, b) => BESTIARY[a].lvl - BESTIARY[b].lvl ||
                    BESTIARY[a].name.localeCompare(BESTIARY[b].name));
}

/* Quanto a ficha revela, de 0 a 3. Os degraus são de ABATE, não de
   tempo: 0 é o palpite, 1 mostra o item, 2 mostra a chance-base e o
   multiplicador, 3 mostra a conta fechada. Chefe pula direto para o
   topo — ele aparece pouco por definição, e esconder número de chefe
   seria esconder para sempre. */
const GRAUS_BESTIARIO = [3, 10, 25];
function grauBestiario(id){
  if (BESTIARY[id]?.boss) return 3;
  const n = G.kills?.[id] || 0;
  let g = 0;
  for (const passo of GRAUS_BESTIARIO) if (n >= passo) g++;
  return g;
}

/* ---------- cura fora de combate (v5.26) ----------
   Buff e debuff duram TURNOS, e em campo não há turno — usá-los aqui
   seria só queimar MP. Por isso só cura e reanimação saem do combate. */
function skillsDeCampo(c){
  return (c.skills || []).filter(id => {
    const s = SKILLS[id];
    return s && (s.type === 'heal' || s.type === 'revive');
  });
}

/** Tudo o que o grupo pode lançar AGORA, do mais barato ao mais caro:
 *  em campo quase sempre se quer o gasto menor que resolve. Quem está
 *  caído não conjura. */
function curasDisponiveis(party = G.party){
  const out = [];
  for (const c of party){
    if (!isAlive(c)) continue;
    for (const id of skillsDeCampo(c))
      out.push({quem:c, id, s:SKILLS[id], custo:SKILLS[id].cost || 0});
  }
  return out.sort((a, b) => a.custo - b.custo || a.s.name.localeCompare(b.s.name));
}

/** Lança `id` de `quem` em `alvo`, fora de combate.
 *
 *  O MP só sai quando a habilidade tem efeito: gastar 34 MP curando
 *  quem já está com a vida cheia é o tipo de engano que o menu deve
 *  impedir, não registrar. Devolve {ok, text} ou {ok:false, why}. */
function usarCuraEmCampo(quem, id, alvo){
  const s = SKILLS[id];
  if (!s || (s.type !== 'heal' && s.type !== 'revive'))
    return {ok:false, why:'Isso não se usa fora de combate.'};
  if (!(quem.skills || []).includes(id)) return {ok:false, why:`${quem.name} não conhece isso.`};
  if (!isAlive(quem)) return {ok:false, why:`${quem.name} está caído.`};
  const custo = s.cost || 0;
  if (quem.mp < custo) return {ok:false, why:`${quem.name} não tem MP.`};

  const alvos = s.target === 'self'   ? [quem]
              : s.target === 'allies' ? G.party.slice()
              : [alvo].filter(Boolean);
  if (!alvos.length) return {ok:false, why:'Escolha um alvo.'};

  if (s.type === 'revive'){
    const caidos = alvos.filter(a => !isAlive(a));
    if (!caidos.length) return {ok:false, why:'Ninguém caído para reanimar.'};
    quem.mp -= custo;
    for (const t of caidos){
      t.hp = Math.max(1, Math.round(t.maxHp * (s.power || 50) / 100));
      t.ail = []; t.buffs = [];
    }
    return {ok:true, text:`${caidos.map(t => t.name).join(', ')} volta a si.`};
  }

  /* Cura não levanta caído — é a regra do combate, e mudá-la em campo
     tornaria a reanimação inútil. */
  const vivos = alvos.filter(t => isAlive(t) && (t.hp < t.maxHp || (s.cure && t.ail.length)));
  if (!vivos.length) return {ok:false, why:'Ninguém precisa disso agora.'};
  quem.mp -= custo;
  let total = 0, limpos = 0;
  for (const t of vivos){
    const real = Math.min(Math.round(calcHeal(quem, s) * ailMult(t, 'healMod')), t.maxHp - t.hp);
    t.hp += real; total += real;
    if (s.cure && t.ail.length){ t.ail = []; limpos++; }
  }
  return {ok:true, text:`${s.name}: +${total} HP${limpos ? ` · ${limpos} limpo(s)` : ''}.`};
}
/* Save anterior à árvore guardava `skills` — uma lista de ids ganhos por
   nível. Converter isso em nós comprados é o único jeito de não roubar
   progresso de quem já jogava: quem tinha a habilidade continua com ela,
   e os pontos correspondentes aparecem como JÁ GASTOS.

   `pagar:false` é para save realmente antigo, onde as habilidades vieram
   de graça pelo nível: cobrar retroativamente deixaria o personagem
   devendo pontos. Nesse caso a compra é cortesia da migração, e os nós
   de corrente no caminho vêm junto — senão a árvore ficaria com buracos
   impossíveis de preencher. */
function migrarSkillsParaArvore(c, skills, pagar = false){
  const arv = arvoreDe(c);
  if (!Array.isArray(c.tree)) c.tree = [];
  const querer = new Set(skills || []);
  for (const n of Object.values(arv)){
    if (n.tipo !== 'skill' || !querer.has(n.skill)) continue;
    // puxa a corrente inteira até a raiz, senão o nó fica órfão
    let alvo = n.id;
    const caminho = [];
    while (alvo && !c.tree.includes(alvo)){
      caminho.unshift(alvo);
      alvo = arv[alvo]?.req?.[0];
    }
    for (const id of caminho) if (!c.tree.includes(id)) c.tree.push(id);
  }
  syncArvore(c);
  /* Se a migração gastou mais do que o nível pagaria, a diferença entra
     como crédito em vez de dívida: o personagem fica com saldo ZERO, não
     negativo. Saldo negativo quebraria `podeAprender` de um jeito que só
     apareceria no save de outra pessoa, muito depois. */
  if (!pagar){
    const falta = -pontosLivres(c);
    if (falta > 0) c.bonusPontos = (c.bonusPontos || 0) + falta;
  }
}
/** Ordem em que o elenco restante entra, e em qual missão cada um vem.
 *  Devolve {questId: nome}. Só existe porque o protagonista é escolhido:
 *  com mapa fixo, escolher a Ophelia faria o Zelador oferecer a Ophelia. */
function montarRecrutas(inicial){
  const resto = PARTY_DEFS.map(d => d.name).filter(n => n !== inicial);
  if (!CURANDEIROS.includes(inicial)){
    const i = resto.findIndex(n => CURANDEIROS.includes(n));
    if (i > 0) resto.unshift(resto.splice(i, 1)[0]);   // cura na primeira missão
  }
  const mapa = {};
  RECRUIT_QUESTS.forEach((q, k) => { if (resto[k]) mapa[q] = resto[k]; });
  return mapa;
}

/** Remonta o mapa quest→personagem a partir de quem AINDA falta. Usado
 *  ao carregar um save anterior à v4.4, que não guardava `recruits`. */
function montarRecrutasDoQueFalta(jaTem, quests){
  const falta = PARTY_DEFS.map(d => d.name).filter(n => !jaTem.includes(n));
  /* Só as missões AINDA não entregues podem trazer alguém — pendurar um
     recruta numa missão já concluída o tornaria inalcançável. */
  const livres = RECRUIT_QUESTS.filter(q => quests?.[q]?.st !== 'feita');
  const mapa = {};
  if (!livres.length || !falta.length) return mapa;
  /* Pode faltar mais gente do que missão livre (save adulterado, ou save
     antigo cujas missões já foram entregues antes de existir
     recrutamento). Nesse caso a ÚLTIMA missão livre entrega o resto de
     uma vez: melhor um recruta duplo do que um personagem inalcançável.
     Por isso o valor do mapa pode ser um nome OU uma lista. */
  livres.forEach((q, k) => {
    if (k < livres.length - 1){ if (falta[k]) mapa[q] = falta[k]; }
    else { const resto = falta.slice(k); if (resto.length) mapa[q] = resto.length > 1 ? resto : resto[0]; }
  });
  return mapa;
}
/** O valor de `G.recruits[q]` é um nome ou uma lista — normaliza. */
const recrutasDaQuest = v => !v ? [] : Array.isArray(v) ? v.slice() : [v];

/* --- PETS ----------------------------------------------------------
   Estado mínimo: quais já foram conquistados e qual acompanha o grupo.
   Tudo que é tabela (formas, poder, elemento) mora em PETS e NÃO é
   gravado — assim reequilibrar um pet não exige migrar save nenhum. */

/** Conquista um pet. Idempotente, e o primeiro entra ativo sozinho. */
function ganharPet(id){
  if (!PETS[id] || G.pets[id]) return null;
  G.pets[id] = {lvl:1, exp:0};
  if (!G.petAtivo) G.petAtivo = id;
  return G.pets[id];
}
const petsDono = () => Object.keys(G.pets).filter(id => PETS[id]);
/** {id, dados, forma, prox} do pet ativo, ou null. */
function petAtivo(){
  const id = G.petAtivo;
  if (!id || !PETS[id] || !G.pets[id]) return null;
  const d = G.pets[id];
  return {id, dados:d, def:PETS[id], forma:petForma(id, d.lvl), prox:petProxForma(id, d.lvl)};
}
function trocarPet(id){
  if (id !== null && !G.pets[id]) return false;
  G.petAtivo = id; return true;
}
/** Dá EXP ao pet ativo. Devolve as evoluções que aconteceram. */
function darPetExp(n){
  const p = petAtivo();
  if (!p || n <= 0) return [];
  const evolucoes = [];
  p.dados.exp += Math.round(n);
  while (p.dados.exp >= petExpToNext(p.dados.lvl)){
    p.dados.exp -= petExpToNext(p.dados.lvl);
    const antes = petForma(p.id, p.dados.lvl);
    p.dados.lvl++;
    const depois = petForma(p.id, p.dados.lvl);
    if (depois !== antes) evolucoes.push({id:p.id, lvl:p.dados.lvl, de:antes.name, para:depois.name});
  }
  return evolucoes;
}
/** O dono do pet está em campo? Vale bônus de dano/cura. */
function petComDono(id){
  const dono = PETS[id]?.dono;
  return !!dono && G.squad.includes(dono);
}

/* Desenho procedural do pet — placeholder honesto, igual ao boneco
   procedural dos NPCs sem folha. Forma varia pelo TIPO da forma atual
   (bicho de ataque é mais anguloso, de cura é mais redondo), o bastante
   para o jogador distinguir de longe qual está acompanhando. */
function desenharPet(pet, x, y){
  const P = pet.def, F = pet.forma, E = ELEM[P.elem] || ELEM.none;
  const t = Date.now();
  const r = 6 + Math.min(4, Math.floor(pet.dados.lvl / 10) * 2);   // cresce ao evoluir

  /* Com arte cadastrada, desenha a arte; sem, o boneco procedural.
     Os dois caminhos convivem de propósito — os sete pets não vão
     ganhar sprite no mesmo dia, e um pet sem arte não pode sumir. */
  const img = petArte(F, 'campo');
  if (img){
    const alt = 30 + Math.min(10, Math.floor(pet.dados.lvl / 11) * 5);  // cresce ao evoluir
    const larg = (img.naturalWidth / img.naturalHeight) * alt;
    ctx.save();
    ctx.globalAlpha = .3; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, y + 4, larg * .3, alt * .12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.drawImage(img, Math.round(x - larg / 2), Math.round(y - alt + 4), larg, alt);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.beginPath(); ctx.ellipse(x, y + r + 3, r * 0.9, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = E.glow; ctx.shadowBlur = 8;
  ctx.fillStyle = P.cor;
  if (F.tipo === 'atk'){
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r * .6); ctx.lineTo(x - r, y + r * .6);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(x, y, r, r * .82, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.shadowBlur = 0;
  const pisca = Math.sin(t / 380) * .4 + .6;
  ctx.globalAlpha = pisca;
  ctx.fillStyle = P.acento;
  ctx.fillRect(x - r * .45, y - r * .1, 2.5, 2.5);
  ctx.fillRect(x + r * .2, y - r * .1, 2.5, 2.5);
  ctx.restore();
}

/** Traz alguém para o elenco. Idempotente: recrutar duas vezes (save
 *  antigo, missão reentregue) não duplica nem reseta o personagem. */
function recrutar(nome){
  const def = PARTY_DEFS.find(d => d.name === nome);
  if (!def || charByName(nome)) return null;
  /* Entra no nível de quem está na frente, não no nível 5 fixo: alguém
     recrutado depois do chefe chegaria 10 níveis atrás e seria peso
     morto — e o jogador não escolheu a ordem para ser punido por ela. */
  const ref = squadChars()[0] || G.party[0];
  const c = makeChar(def, Math.max(5, ref ? ref.lvl : 5));
  G.party.push(c);
  if (G.squad.length < PARTY_SIZE){ G.squad.push(nome); rebuildFollowers(); }
  return c;
}

function newGame(inicial){
  const def = PARTY_DEFS.find(d => d.name === inicial) || PARTY_DEFS[0];
  // o elenco COMEÇA com uma pessoa; os outros cinco entram por missão
  G.party = [makeChar(def, 5)];
  G.squad = [def.name];
  G.recruits = montarRecrutas(def.name);
  G.leader = 0;
  G.gold = 120; G.items = {potion:3, ether:1}; G.flags = {};
  G.pinnedItems = [];
  G.difficulty = 'normal';
  G.quests = {}; G.kills = {}; G.cacada = {}; G.vistos = {};
  G.cristais = {}; G.visitados = {};   // rede e nevoeiro (v5.22)
  G.revanches = {};                    // ecos de chefe (v5.24)
  G.pets = {}; G.petAtivo = null;
  G.moldura = 'nenhuma';
  G.tema = 'relogio';
  G.modificadorCombate = false;
  G.gameMaster = false;
  G.playtime = 0;
  G.steps = 0;            // zera o relógio junto: jogo novo começa de manhã
  sanitizeSquad();
  loadMap('patio');
}
function loadFromSave(s){
  /* O elenco vem do save, não de PARTY_DEFS. Antes da v4.4 todo mundo
     existia desde o início, então montar os seis e sobrepor dava no
     mesmo; agora o elenco é justamente o que o jogador já recrutou, e
     recriar os seis devolveria de graça quem ele ainda não conquistou.
     Save antigo (sem `recruits`) tem os seis em `s.party` e cai aqui com
     os seis — continua carregando igual, que é o esperado. */
  const elenco = (s.party || []).map(p => p.name).filter(n => PARTY_DEFS.some(d => d.name === n));
  G.party = (elenco.length ? elenco : [PARTY_DEFS[0].name])
    .map(n => makeChar(PARTY_DEFS.find(d => d.name === n), 5));
  /* Sem `recruits` no save o mapa é remontado a partir de quem falta —
     assim um save antigo com os seis fica sem nada a recrutar (correto),
     e um save meio caminho volta a oferecer só o que sobrou. */
  G.recruits = s.recruits && typeof s.recruits === 'object'
    ? s.recruits
    : montarRecrutasDoQueFalta(G.party.map(c => c.name), s.quests);
  for (const sp of (s.party || [])){
    const c = G.party.find(p => p.name === sp.name); if (!c) continue;
    c.lvl = sp.lvl ?? 5; c.exp = sp.exp ?? 0;
    // saves anteriores à v3.1 não tinham equipamento — daí o fallback
    for (const slot of Object.keys(SLOTS)){
      const id = sp.gear?.[slot];
      c.gear[slot] = (id && ITEMS[id]?.kind === 'equip' && ITEMS[id].slot === slot) ? id : null;
    }
    /* v5.0+ o save guarda a ÁRVORE (`tree`), que é a fonte da verdade.
       Save anterior guardava só `skills`, e aí a árvore é reconstruída a
       partir dela. Os dois caminhos terminam em `syncArvore`, então o
       resto do jogo não precisa saber de qual veio. */
    c.bonusPontos = Math.max(0, sp.bonusPontos || 0);
    if (Array.isArray(sp.tree)){
      c.tree = sp.tree.slice();
      syncArvore(c);
    } else {
      c.tree = [];
      migrarSkillsParaArvore(c, sp.skills);
    }
    recalcStats(c);
    c.hp = clamp(sp.hp ?? c.maxHp, 0, c.maxHp);
    c.mp = clamp(sp.mp ?? c.maxMp, 0, c.maxMp);
    c.inParty = sp.inParty !== false;
  }
  /* Grupo. Quatro formatos possíveis de save:
       v4.3+  s.squad é uma LISTA de nomes — o grupo em campo
       v4.1-2 s.teams — dois times, cada um com mapa e posição próprios
       v4.0   s.squads (dois grupos) + s.squad como ÍNDICE do ativo
       ≤v3    nada — monta o padrão

     Os dois formatos de duas equipes juntam tudo num grupo só: quem
     estava em campo entra primeiro, o outro time completa até o teto e
     o excedente cai no banco. Ninguém some do elenco — a diferença é
     estar dentro ou fora da formação. */
  let nomes = null;
  if (Array.isArray(s.squad)){
    nomes = s.squad.slice();                                   // v4.3+
  } else if (Array.isArray(s.teams) && s.teams.length === 2){   // v4.1-2
    const ativo = s.team === 1 ? 1 : 0;
    nomes = [...(s.teams[ativo]?.squad || []), ...(s.teams[ativo ? 0 : 1]?.squad || [])];
    G.leader = s.teams[ativo]?.leader || 0;
  } else if (Array.isArray(s.squads) && s.squads.length === 2){ // v4.0
    const ativo = s.squad === 1 ? 1 : 0;
    nomes = [...(s.squads[ativo] || []), ...(s.squads[ativo ? 0 : 1] || [])];
  }
  G.squad = nomes || defaultSquad();
  if (typeof s.leader === 'number') G.leader = s.leader;

  G.difficulty = DIFFICULTIES[s.difficulty] ? s.difficulty : 'normal';
  /* Save de antes das molduras — ou com uma moldura que não existe mais —
     volta para o traço original em vez de ficar sem canto nenhum. */
  G.moldura = MOLDURAS.some(m => m.id === s.moldura) ? s.moldura : 'nenhuma';
  // Save sem tema acompanha o relógio: dia dourado, noite fria. Saves
  // existentes com uma escolha explícita continuam exatamente nela.
  G.tema = TEMAS.some(t => t.id === s.tema) ? s.tema : 'relogio';
  G.modificadorCombate = modificadorDoSave(s);
  G.gameMaster = s.gameMaster === true;
  G.quests = s.quests || {}; G.kills = s.kills || {};
  /* Save anterior à v5.29 não tem contador: entra zerado, que é o
     estado honesto — o jogo não sabe quantos lobos você matou antes de
     existir contagem, e chutar daria drop de graça. */
  G.cacada = (s.cacada && typeof s.cacada === 'object') ? s.cacada : {};
  G.vistos = (s.vistos && typeof s.vistos === 'object') ? s.vistos : {};
  /* Save anterior à v5.22 não tem rede: começa vazia e o primeiro
     cristal tocado a inaugura. Ninguém perde progresso — perde-se
     só o atalho, que não existia naquele save. */
  G.cristais = (s.cristais && typeof s.cristais === 'object') ? s.cristais : {};
  G.visitados = (s.visitados && typeof s.visitados === 'object') ? s.visitados : {};
  G.revanches = (s.revanches && typeof s.revanches === 'object') ? s.revanches : {};
  /* Save de antes da v4.9 não tem pets: entra sem nenhum, que é o
     estado correto — pet se conquista, não se ganha ao carregar. */
  G.pets = (s.pets && typeof s.pets === 'object') ? s.pets : {};
  /* v5.27 renomeou os ids junto com a troca de bicho. Sem esta linha o
     descarte logo abaixo levaria embora TODO pet conquistado antes da
     v5.27 — o nível e a EXP dele junto. Objeto novo, nunca no lugar:
     `salamandra` está nos dois lados do mapa. */
  G.pets = Object.fromEntries(Object.entries(G.pets)
    .map(([id, d]) => [PET_RENOMEADO[id] || id, d]));
  for (const id of Object.keys(G.pets)) if (!PETS[id]) delete G.pets[id];
  const ativoRenomeado = PET_RENOMEADO[s.petAtivo] || s.petAtivo;
  G.petAtivo = (ativoRenomeado && G.pets[ativoRenomeado]) ? ativoRenomeado : null;
  G.gold = s.gold ?? 0;
  G.items = s.items || {}; G.flags = s.flags || {}; G.playtime = s.playtime || 0;
  /* Save de antes desta versão não tem favoritos de loja: entra vazio,
     que é o estado correto (nunca inventar pin que o jogador não fez). */
  G.pinnedItems = Array.isArray(s.pinnedItems) ? s.pinnedItems.filter(id => ITEMS[id]) : [];
  sanitizeSquad();

  // posição: v4.1-2 guardava por time, os demais na raiz do save
  const ativo = s.team === 1 ? 1 : 0;
  const pos = Array.isArray(s.teams) ? s.teams[ativo]?.pos : null;
  const mapa = Array.isArray(s.teams) ? s.teams[ativo]?.mapId : s.map;
  loadMap(MAPS[mapa] ? mapa : 'patio',
          pos ? pos.tx : s.x, pos ? pos.ty : s.y, pos ? pos.dir : s.dir);
  G.steps = (Array.isArray(s.teams) ? s.teams[ativo]?.steps : s.steps) || 0;
}

/* --- Modo Mestre (v5.32) -------------------------------------------
   Armado por um código secreto na tela de título (ver
   `verificarCodigoMestre` em `ui/30-title.js`) e aplicado aqui, sobre
   uma partida já pronta — jogo novo ou save carregado. Não cria
   sistema paralelo nenhum: usa exatamente os mecanismos que o jogo já
   tem (recrutar, a árvore do Grimório, o registro de cristal, a
   mochila). Não mexe em ouro nem em nível — só remove travas de
   progressão, para quem quer testar/mostrar o jogo sem precisar
   avançar horas antes. */
function ativarGameMaster(){
  for (const d of PARTY_DEFS) recrutar(d.name);

  for (const c of G.party){
    c.tree = Object.keys(arvoreDe(c));
    syncArvore(c);
    recalcStats(c);
    c.hp = c.maxHp; c.mp = c.maxMp;
  }

  for (const [id, m] of Object.entries(MAPS)){
    if (m.spawn) registrarCristal(id, m.spawn.x, m.spawn.y);
    G.visitados[id] = true;
  }

  for (const id of Object.keys(ITEMS)) Bag.add(id, ITEMS[id].kind === 'equip' ? 1 : 20);

  G.gameMaster = true;
}

/* --- Itens ------------------------------------------------------- */
const Bag = {
  count(id){ return G.items[id] || 0; },
  add(id, n = 1){ G.items[id] = (G.items[id] || 0) + n; },
  take(id, n = 1){ if (this.count(id) < n) return false; G.items[id] -= n; if (!G.items[id]) delete G.items[id]; return true; },
  list(){ return Object.keys(G.items).filter(k => ITEMS[k] && G.items[k] > 0); },
};
