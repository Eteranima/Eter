/* ===================================================================
   10. COMBATE — MODELO (lógica pura, sem desenho)
   =================================================================== */

/* --- Stats efetivos (buffs + condições) -------------------------- */
function buffMult(u, stat){
  let m = 1;
  for (const b of u.buffs) if (b.stat === stat) m *= b.mult;
  return m;
}
function ailMult(u, key){
  let m = 1;
  for (const a of (u.ail || [])) { const d = AILMENTS[a.id]; if (d && d[key] !== undefined) m *= d[key]; }
  return m;
}
const eATK = u => Math.max(1, u.atk * buffMult(u,'atk') * ailMult(u,'atkMod'));
const eDEF = u => Math.max(0, u.def * buffMult(u,'def') * ailMult(u,'defMod')
                             * (u.guarding ? 2.2 : 1) * (u.broken > 0 ? POISE.breakDef : 1));
const eSPD = u => Math.max(1, u.spd * buffMult(u,'spd') * ailMult(u,'spdMod'));
/* O piso de 0,15 existe para Cegueira não virar impossibilidade. Pavor
   é a exceção declarada: `accMod:0` zera mesmo, e sem este desvio o
   alvo apavorado ainda acertaria 15% dos golpes. */
const eACC = u => {
  const m = ailMult(u, 'accMod');
  return m === 0 ? 0 : clamp(0.95 * m, 0.15, 1);
};

/* --- QUEBRA DE POSTURA (chefes e elites) ---------------------------
   Um chefe com 4-5 mil de vida e uma IA que reparte AoE não cria
   decisão nenhuma: o jogador bate o melhor golpe todo turno e reza.
   A postura muda isso — ela é uma SEGUNDA barra que só quebra com o
   tipo certo de agressão:

     · dano bruto conta pouco (fator 1)
     · vantagem elemental conta MUITO (×1.5) — o anel volta a importar
     · crítico e golpes pesados (`poise` na skill) empurram mais
     · Ressonância e Habilidade Conjunta são as marretas (×2,2 / ×2,6)

   Ao zerar, o chefe fica QUEBRADO por `turns` turnos DELE: perde a vez
   imediatamente, a DEF cai à metade e ele recebe +60% de dano. Depois
   se recompõe com a barra maior (`growth`), então a segunda quebra é
   mais cara que a primeira e a luta não vira loop.

   Fora da quebra a barra regenera `regen` do máximo por rodada: quebrar
   exige CONCENTRAR dano, não acumular arranhões ao longo de dez turnos.
   Só entra em quem tem `poise` no bestiário — criatura comum morre antes
   de a mecânica dizer qualquer coisa. */
const POISE = {
  breakVuln:1.6,    // dano recebido enquanto quebrado
  breakDef:0.5,     // DEF enquanto quebrado
  turns:2,          // turnos DELE perdidos ao quebrar
  /* Quanto do dano vira postura. É a MANIVELA ÚNICA de calibração do
     sistema inteiro: mexer aqui move todos os chefes de uma vez, sem
     precisar reescrever a tabela do bestiário.
     Medido com `medirChefe`: em 1,00 os chefes quebravam 3-4 vezes por
     luta e perdiam metade dos turnos (party terminava a 83% de vida).
     Em 0,55 estabiliza em ~1,5 quebra por luta em TODOS eles — do
     Selo Quebrado à Coroa —, que é a cadência certa: a janela é rara,
     grande, e vale planejar para ela. */
  rate:0.55,
  regen:0.05,       // fração do máximo recuperada por rodada
  /* `growth` é a trava mais importante do sistema, e foi medida:
     com 1,15 o chefe quebrava 3 a 4 vezes por luta e perdia METADE dos
     turnos — a party terminava a 83% de vida, o que não é luta de
     chefe, é fila. Com 1,45 a segunda quebra custa 45% mais que a
     primeira e a terceira quase o dobro, o que estabiliza em 1-2
     quebras por luta: a janela continua valendo muito, mas não é
     renovável à vontade. NÃO baixe isto sem rodar `medirChefe`. */
  growth:1.45,      // a barra cresce a cada quebra
  growthCap:3.5,    // …até este teto sobre o valor original
  strong:1.5, weak:0.6,   // multiplicador por vantagem/resistência elemental
  crit:1.4,
  ult:2.2, combo:2.6,     // Ressonância e Conjunta são as marretas
};

/** Quanto de postura um golpe tira. Função pura — é o que o teste mede. */
function poiseDamage(dmg, o = {}){
  const el = o.em > 1 ? POISE.strong : o.em < 1 ? POISE.weak : 1;
  const kind = o.combo ? POISE.combo : o.ult ? POISE.ult : 1;
  return Math.max(1, Math.round(dmg * POISE.rate * el * (o.crit ? POISE.crit : 1) * (o.poise ?? 1) * kind));
}
/** Tem barra de postura? Só quem o bestiário declarou. */
const hasPoise = u => !!u && u.maxPoise > 0;

/** Núcleo do dano. Função pura — é o que o autoteste verifica. */
function calcDamage(src, skill, tgt, o = {}){
  const atk = o.atk ?? eATK(src);
  const def = o.def ?? eDEF(tgt);
  const raw = skill.phys ? atk * 2.2 : (skill.power || 0) + atk * 0.9;
  const mitig = 1 - def / (def + 70);
  const em = elemMult(skill.elem, tgt.element, tgt.res);
  const crit = o.crit ?? false;
  const varc = o.variance ?? 1;
  /* Vulnerabilidade: Exposto (Vento) faz o alvo receber mais de TUDO.
     Postura QUEBRADA entra pelo mesmo lugar e MULTIPLICA — é o que
     transforma a janela de quebra num pico real de dano em vez de um
     enfeite. Passar `vuln` explicitamente ignora os dois (usado nos
     testes de fórmula pura). */
  const vuln = o.vuln ?? (ailMult(tgt, 'vulnMod') * (tgt.broken > 0 ? POISE.breakVuln : 1)
                          /* SUBMERSO: o corpo não está onde o golpe cai.
                             Não é imunidade — imunidade transforma dois
                             turnos de luta em dois turnos de espera. É
                             uma penalidade forte o bastante para o
                             jogador preferir usar o turno em cura ou
                             preparo, que é o que a mecânica quer ensinar.
                             EXPOSTO é o contrário: a janela paga pela
                             ultimate. */
                          * (tgt.submerso ? 0.35 : 1)
                          * (tgt.exposto > 0 ? 1.6 : 1));
  let dmg = raw * mitig * em * (crit ? 1.7 : 1) * varc * vuln;
  /* EXECUÇÃO (`execute`) — a assinatura da Scythe. O golpe cresce à
     medida que o alvo se aproxima do fim: em alvo INTEIRO vale o dano
     base, e no fim do fôlego dele chega a `1 + execute`. É o que dá a
     ela uma pergunta de TIMING em vez de "aperte o mais forte sempre".
     Deliberadamente NÃO é morte instantânea: contra chefe, um `execute`
     que matasse apagaria a fase final inteira. */
  if (skill.execute){
    const faltando = 1 - clamp(tgt.hp / Math.max(1, tgt.maxHp), 0, 1);
    dmg *= 1 + skill.execute * faltando;
  }
  if (o.guard ?? tgt.guarding) dmg *= 0.45;
  return {dmg:Math.max(1, Math.round(dmg)), em, crit, vuln};
}
function calcHeal(src, skill){
  return Math.max(1, Math.round((skill.power || 0) + eATK(src) * 0.5));
}
function critChance(u){ return clamp(0.06 + eSPD(u) / 400, 0.03, 0.4); }
function chanceAcerto(u){
  if (!G.modificadorCombate) return eACC(u);
  return u.side === 'ally' ? 1 : 0.5;
}
function chanceCritico(u){ return G.modificadorCombate && u.side === 'ally' ? 0.7 : critChance(u); }
function multiplicadorDanoCombate(src, tgt){
  if (!G.modificadorCombate) return 1;
  if (src.side === 'ally') return 1.2;
  if (tgt.side === 'ally') return 0.7;
  return 1;
}

function addAil(u, id){
  const d = AILMENTS[id]; if (!d) return false;
  if (elemMult(d.el, u.element, u.res) <= 0) return false;   // imune ao elemento
  const cur = u.ail.find(a => a.id === id);
  if (cur){ cur.turns = Math.max(cur.turns, d.turns); return false; }
  u.ail.push({id, turns:d.turns});
  return true;
}
function isAlive(u){ return u.hp > 0; }
/* Modo Mestre: HP/MP do próprio grupo baixam normalmente mas nunca
   zeram — dano e custo continuam visíveis, só não derrubam ninguém
   nem travam habilidade por falta de mana. O piso é uma FRAÇÃO do
   máximo (não 1 fixo): com 1 fixo a barra desaba pro vermelho no
   primeiro golpe grande e fica ali, parecendo bug. Com piso em 20%
   do máximo a barra continua reagindo a cada golpe, só não zera. */
function gmInfinito(u){ return !!G.gameMaster && u.side === 'ally'; }
function gmPisoHp(u){ return Math.max(1, Math.ceil(u.maxHp * 0.2)); }
function gmPisoMp(u){ return Math.max(1, Math.ceil(u.maxMp * 0.2)); }

/* --- Escala pelo tamanho do grupo --------------------------------
   O bestiário inteiro foi medido contra um grupo cheio. Agora o jogo
   começa com UMA pessoa, e os mesmos números viram parede:

     rodadas para matar   = HP_inimigo / (N × dano_por_herói)
     % da party perdida   = dano_inimigo / (N × HP_por_herói)

   As duas contas têm N no denominador, então escalar HP e ATK do inimigo
   por N/PARTY_SIZE mantém as duas invariantes — a luta dura o mesmo e
   machuca o mesmo, com 1 ou com 5. É a mesma matemática que a v4.0 usou
   ao cair de 5 para 3 (medido: vazão 60%, vida 58%, escala 0,6).

   Linear puro, sem piso. Tentei antes um piso de 0,34 imaginando que a
   conta fosse otimista na ponta (sozinho todo golpe cai em você, um
   nocaute já é derrota). `medirBalanco()` desmentiu: com 0,34 o pátio
   solo dava 53% de vitória — uma derrota a cada duas lutas — enquanto o
   linear puro entrega números irmãos dos do grupo cheio:

     pátio Nv5 solo   3,1 rodadas · 95% vitória · vale 54%
     pátio Nv5 com 5  3,4 rodadas · 98% vitória · vale 60%

   Sozinho fica um pouco mais tenso, que é exatamente a sensação certa.
   NÃO recolocar piso sem medir de novo.

   Chefe é o único com piso, e por um motivo diferente: a IA dele reparte
   golpe em área justamente para não matar ninguém de um golpe, e essa
   compensação não faz sentido contra grupo pequeno. Com grupo cheio o
   piso não tem efeito nenhum (max(0,5; 1) = 1), então o balanceamento
   medido do chefe continua intocado. */
/* Quanto o eco de um chefe cresce por revanche, e onde para. */
const REVANCHE_PASSO = 0.22, REVANCHE_TETO = 5;
/* Quanto a revanche paga, e a chance do item que na primeira vez era
   garantido. Baixo de propósito: o rematch existe para medir força,
   não para imprimir néctar. */
const REVANCHE_PAGA = 0.35, REVANCHE_GARANTIDO = 0.25;

function escalaGrupo(n, boss){
  const s = clamp(n, 1, PARTY_SIZE) / PARTY_SIZE;
  if (!boss) return {hp:s, atk:s};
  const b = Math.max(0.5, s);
  return {hp:b, atk:Math.min(1, b + 0.12)};
}

/* --- Construção de unidades -------------------------------------- */
function makeEnemyUnit(id, idx, n = null){
  const d = BESTIARY[id];
  /* `n` é o tamanho do grupo em campo. Vem por parâmetro (e não de
     activeParty() aqui dentro) para que `medirBalanco()` e o autoteste
     possam medir qualquer tamanho sem mexer no estado global. */
  const E = escalaGrupo(n == null ? activeParty().length : n, !!d.boss);
  /* REVANCHE (v5.24): o eco do chefe endurece a cada vez.

     Sem isso o rematch vira treino de boneco: o grupo que venceu na
     raça volta vinte níveis depois e ganha sem apertar botão. O degrau é
     de 22% por vitória e para em cinco — a partir daí o número já não
     é o que decide a luta, e um chefe com HP de sete dígitos só faz o
     jogador segurar o botão de atacar por mais tempo. */
  const R = (d.boss && G.revanches) ? Math.min(REVANCHE_TETO, G.revanches[id] || 0) : 0;
  const kR = 1 + R * REVANCHE_PASSO;
  const hp = Math.max(1, Math.round(d.base.hp * E.hp * kR));
  const u = {
    key:id, name:d.name + (R ? ` +${R}` : ''), element:d.element, lvl:d.lvl + R, shape:d.shape, sprite:d.sprite,
    color:d.color, accent:d.accent, res:d.res || null, boss:!!d.boss,
    hp, maxHp:hp, mp:999, maxMp:999,
    atk:Math.max(1, Math.round(d.base.atk * E.atk * kR)),
    def:Math.round(d.base.def * (1 + R * 0.10)), spd:d.base.spd,
    revanche:R, lvl_:d.lvl + R,
    skills:d.skills.slice(), exp:d.exp, gold:d.gold, drops:d.drops || [],
    side:'enemy', ail:[], buffs:[], guarding:false, idx,
    bx:0, by:0, lungeT:0, hurtT:0, dieT:0, float:rnd(6.28),
    /* Quadro de ataque (v5.32): `drawEnemyUnit` mostra `arteAtaque` no
       lugar do sprite parado enquanto `arteHoldT` > 0, se a habilidade
       em uso tiver um `arte` próprio. Sem isso, `arte` só existia para
       o autoteste conferir — nunca aparecia em jogo. `arteHoldT` é de
       propósito MAIS LONGO que o avanço físico (`lungeT`, que vai e
       volta em ~0,3s — rápido demais para ler um sprite novo); a arte
       fica na tela por conta própria, sem depender da animação de
       movimento. Ver `execute()` em combat/27-controller.js. */
    arteAtaque:null, arteHoldT:0,
    /* Postura acompanha a MESMA escala do HP: sem isso, um chefe
       enfraquecido para grupo pequeno continuaria com a barra cheia de
       um grupo de cinco e nunca quebraria jogando sozinho. */
    maxPoise:0, poise:0, poiseBase:0, broken:0, breaks:0,
    /* Boss em fases (v5.23). `fase` é o índice em `d.fases`; `submerso`
       tira o corpo do alcance até ele agir; `exposto` é a janela depois
       da ultimate. Criatura sem `fases` fica com tudo em zero e nada
       destes caminhos roda. */
    fase:0, submerso:false, exposto:0, dobrou:false,
    defBase:d.base.def, spdBase:d.base.spd, armaduraRompida:false,
    /* `def` da criatura guarda a referência à ENTRADA do bestiário —
       é dela que `checarFase` lê `fases`. O atributo de defesa é
       `u.def` numérico em todo o resto do código, então a entrada mora
       em `defs` para os dois não brigarem. */
    defs:d,
    breakT:0,          // brilho do momento da quebra (só visual)
  };
  if (d.poise){
    u.poiseBase = Math.max(1, Math.round(d.poise * E.hp));
    u.maxPoise = u.poiseBase; u.poise = u.maxPoise;
  }
  return u;
}
function prepAlly(c){
  c.side = 'ally'; c.ail = c.ail || []; c.buffs = []; c.guarding = false;
  c.lungeT = 0; c.hurtT = 0; c.dieT = 0;
  c.reso = c.reso || 0;
  c.res = gearResist(c);        // resistência elemental do equipamento
  c.maxPoise = 0; c.poise = 0; c.broken = 0;   // party não tem barra de postura
  c.comboSpent = false; c.skipTurn = false; c.tauntT = 0;
  return c;
}

/* --- Sufixos para inimigos repetidos (Lobo A / Lobo B) ----------- */
function labelEnemies(list){
  const counts = {};
  list.forEach(u => counts[u.key] = (counts[u.key] || 0) + 1);
  const seen = {};
  list.forEach(u => {
    if (counts[u.key] > 1){
      seen[u.key] = (seen[u.key] || 0) + 1;
      u.name = `${u.name} ${String.fromCharCode(64 + seen[u.key])}`;
    }
  });
}

/** Itens utilizáveis em combate: sem equipamento e sem os de campo. */
function battleItems(){
  /* Fora do combate: item de campo e petisco de pet. Material nem entra,
     porque não é 'consumable'. */
  return Bag.list().filter(id => ITEMS[id].kind === 'consumable' &&
                                 ITEMS[id].use !== 'field' && ITEMS[id].use !== 'pet');
}

/* Duas formações para os até 5 do grupo: a compacta serve ao chibi 2×;
   a espaçada abre lugar para arte de batalha grande (escolhida sozinha
   em `layout()`). O líder é sempre o índice 0. */
