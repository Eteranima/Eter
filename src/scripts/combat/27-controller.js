/* ===================================================================
   ZONAS DA TELA DE COMBATE (v5.9 — layout do mockup)
   Uma fonte só de verdade para onde cada coisa mora. O desenho lê daqui,
   os lugares dos corpos derivam daqui e o autoteste confere contra daqui
   — antes as três coisas repetiam os mesmos números à mão, e mudar o
   layout significava caçar 478 e 598 espalhados por três arquivos.

   A tela é 800×600. O mockup é 1499×1049, mais largo; encaixar por
   largura (×0,534) deixa 40 px de folga na altura, que foi para a faixa
   do campo — é ela que aperta, porque a arte de batalha tem 152 px.

     topo      y   6..100   turno atual · ordem de turno · alvo
     campo     y 100..358   os corpos
     base      y 364..536   comandos · detalhe · grupo
     atalhos   y 544..592   a régua de teclas
   =================================================================== */
const HUD = {
  turno:   {x:  8, y:  6, w:238, h: 92},
  ordem:   {x:252, y:  6, w:296, h: 74},
  alvo:    {x:554, y:  6, w:238, h: 80},
  cmd:     {x:  8, y:364, w:170, h:172},
  detalhe: {x:184, y:420, w:226, h:116},
  grupo:   {x:416, y:396, w:376, h:140},
  atalhos: {x:  8, y:544, w:784, h: 48},
  /* O mockup não tem caixa de log: ele é um retrato de um instante, e
     um retrato não precisa contar o que acabou de acontecer. O jogo
     precisa. A faixa vai na sobra entre o pé dos corpos (358) e o
     topo do painel de grupo (396) — o único vão horizontal que o
     layout novo deixou, e sobra justamente onde o olho já está. */
  log:     {x:184, y:362, w:608, h: 32},
  campo:   {y0:100, y1:358},          // faixa livre entre o topo e a base
  inimigos:{x0: 36, x1:440},          // metade esquerda do campo
};
const zonaFim = z => ({x0:z.x, y0:z.y, x1:z.x + z.w, y1:z.y + z.h});

const ALLY_SPOTS       = [{x:552,y:492},{x:602,y:462},{x:652,y:432},
                          {x:702,y:402},{x:752,y:372}];
/* Layout da arte grande — derivado das áreas livres da tela, não do olho:
     painel de comandos  x   8..478 / y 464..592
     HUD da party        x 598..792 / y   8..278
   A arte real chega a 101×152, então a caixa de cada um é x±50 e 152 de
   altura. Isso obriga o centro a ficar em x 529..750 — 221 px para cinco
   corpos de 101. Não cabe em fileira: são 3 na frente e 2 atrás, e a
   fileira de trás sobe 126 px, o bastante para a sobreposição entre
   vizinhos cair para ~21% (o autoteste trava em 25%).
   Índices 0-2 = frente (o líder é o 0), 3-4 = retaguarda. */
/* Com o layout do mockup os painéis tomaram a base da tela inteira, e a
   party subiu para dentro da faixa do campo. O pé da fileira da frente
   fica no fim da faixa (358) e o da retaguarda 94 px acima — o bastante
   para a cabeça de trás (y 112) não encostar no topo (100) e ainda
   aparecer por cima do ombro de quem está na frente.
   Os 90 px entre vizinhos da mesma fileira são os mesmos de antes: é a
   distância que segura a sobreposição abaixo dos 25% com arte de 104. */
const ALLY_SPOTS_LARGE = [{x:562,y:356},{x:652,y:356},{x:742,y:356},
                          {x:607,y:262},{x:697,y:262}];
/* Lugar do pet no campo de batalha. Fica no corredor entre a faixa dos
   inimigos (x 40..470) e a do grupo (x 530..790) — à frente da party,
   que é onde um bicho que entra na briga deveria estar. As duas versões
   acompanham a formação, como as dos aliados: com arte grande o grupo
   desce, e o pet desce junto para não flutuar sozinho lá em cima.
   O autoteste trava que esta caixa não invade o painel de comandos nem a
   faixa dos inimigos — foi medindo, não no olho. */
/* A tela de combate não tem canto vazio: inimigos ocupam x 40..470, o
   grupo x 480..790 e os painéis a base inteira à esquerda. Em vez de
   procurar um buraco que não existe, o pet fica À FRENTE da linha do
   grupo — que é onde um bicho que entra na briga deveria estar, e é o
   único lugar em que ele não some atrás de alguém. O `y` maior que o da
   primeira fileira é o que garante isso: a lista de desenho é ordenada
   por Y, então quem tem Y maior é pintado por último. */
const PET_SPOT       = {x:520, y:330};   // formação compacta (chibi)
const PET_SPOT_LARGE = {x:520, y:356};   // formação espaçada (arte grande)
const PET_ALT_BATALHA = 84;     // altura de desenho do pet em combate
/* Quanto o pet avança na direção do inimigo ao agir. Entra na conta do
   lugar dele: os inimigos estão à ESQUERDA, então o avanço empurra o
   pet para dentro do painel de log (x 8..478) se a posição de descanso
   não reservar essa folga. Foi exatamente esse o defeito da primeira
   tentativa — a caixa media o pet PARADO e o painel comia a perna dele
   justamente no quadro em que o jogador olha. */
const PET_AVANCO = 24;

/* --- FORMA LYCAN (Gabriel) -----------------------------------------
   O Guardião vira lobo quando a luta começa a doer. É a única segunda
   forma do elenco e o desenho dela é de TROCA, não de upgrade: ele bate
   e corre mais, e defende menos — o guardião deixa de guardar.

   A transformação é marcada por FLAG (`u.lycan`) e não trocando o nome
   do ator. Trocar o nome apareceria bonito no log e quebraria tudo que
   casa por nome: `charByName`, a lista do grupo e a conta de EXP da
   reserva, que compara `emCampo` por nome.

   `limiar` é fração de HP RESTANTE: 0.8 significa "ao cair para 80% ou
   menos". É o número pedido; se a intenção for a transformação
   desesperada, no fim do fôlego, é este 0.8 que vira 0.2. */
const LYCAN = {
  dono:'Gabriel', limiar:0.8,
  arte:'Gabriel Lycan', sheet:'gabriel_lycan_sheet',
  buff:{atk:1.35, spd:1.25, def:0.9},
  grito:'O Gabriel para de segurar. O que levanta já não é o Gabriel.',
};

/* A forma no CAMPO sai do HP direto, não da flag de combate. São dois
   regimes de propósito:
     · em combate a flag é PEGAJOSA — quem virou não desvira ao ser
       curado, senão uma cura na hora errada desfaria a virada e a
       mecânica viraria sorte;
     · no campo não há turno nem cura no meio da ação, então ler o HP é o
       comportamento certo: descansou e voltou acima do limiar, volta a
       andar como gente.
   Sem esta função a folha do Lycan ficava embutida e INALCANÇÁVEL: o
   único lugar que a usava era o ramo `else` de `drawAllyUnit`, que só
   roda para quem NÃO tem arte de combate — e o Gabriel tem. */
function emFormaLycan(c){
  return !!c && c.name === LYCAN.dono && c.hp > 0
      && c.hp <= c.maxHp * LYCAN.limiar;
}
/** A folha de campo de um personagem, já considerando a segunda forma. */
const folhaDe = c => (emFormaLycan(c) && spriteImages[LYCAN.sheet]) ? LYCAN.sheet : c?.sheet;

/* --- MADAO: papelão, vitória e regeneração -------------------------
   Três estados de arte para o mesmo ator. Ficam declarados juntos porque
   a ordem entre eles IMPORTA e uma lista solta esconderia isso: vitória
   ganha de papelão, senão a tela de vitória mostraria a caixa erguida
   quando a luta já acabou. */
const MADAO = {
  dono:'Madao',
  artePapelao:'Madao Papelão',
  arteVitoria:'Madao Vitória',
  /* Regeneração FORA do combate, contada em passos. Por passo seria
     imperceptível; por segundo premiaria deixar o jogo parado. O passo é
     a moeda do campo — é ela que o encontro aleatório também usa. */
  passosPorCura:12,
  curaPorTique:0.02,        // 2% do HP máximo
};

const ATTACK_CMD = {name:'Atacar', power:0, elem:'none', type:'atk', target:'one', phys:true,
                    desc:'Ataque físico básico.'};
/* Colunas do painel de comandos. Três, e não duas, porque a lista pode
   chegar a 7 (Ressonância + Conjunta) e a quarta linha não cabe nos
   128 px do painel. Navegação e desenho leem a MESMA constante — foi
   justamente a divergência entre os dois que já matou as setas ◄►. */
/* O menu de comandos virou COLUNA (era grade de 3): é o desenho do
   mockup e cabe inteiro na zona `HUD.cmd`, com os 7 comandos do caso
   mais cheio em 7 linhas de 24. */
const CMD_COLS = 1, CMD_COL_W = 154;

/* Formato das listas do combate (habilidade, item, conjunta).

   ESTE NÚMERO É O MESMO PARA NAVEGAR E PARA DESENHAR, e precisa
   continuar sendo. Quando o layout do mockup transformou as listas de
   duas colunas em uma, o DESENHO virou coluna única mas o `navList`
   continuou recebendo 2 — e a navegação passou a andar em ziguezague
   sobre uma lista que já era vertical: ▲▼ pulavam um item e ◄► davam a
   impressão de estar mortas. Uma constante só é o que impede a dupla de
   voltar a discordar. */
const LISTA_COLS = 1, LISTA_LINHAS = 5;
/* Fases em que o ator ainda está escolhendo o que fazer. Existe para
   que "quem está com o turno" seja UMA lista, e não cinco cópias. */
const PHASES_INPUT = ['INPUT','SKILL','COMBO','ITEM','TARGET'];

const Battle = {
  active:false, phase:'INTRO', t:0,
  onFinish:null,          // gancho: cena que espera o resultado desta luta
  allies:[], enemies:[], units:[], order:[], turnIdx:0, round:1,
  actor:null, log:[], seq:[], animT:0, animDur:0,
  cmd:{i:0}, skillCur:{i:0}, itemCur:{i:0}, targetCur:{i:0}, comboCur:{i:0},
  pendingSkill:null, pendingItem:null, pendingIsUlt:false, comboMate:null,
  isBoss:false, revanche:false, result:null, escapeTries:0,

  /* ---------- ciclo de vida ---------- */
  begin(enemyIds, opts = {}){
    this.active = true; this.isBoss = !!opts.boss;
    this.revanche = !!opts.revanche;
    this.allies = activeParty().map(prepAlly);
    // escala pelo grupo que REALMENTE entrou na luta
    this.enemies = enemyIds.map((id, i) => makeEnemyUnit(id, i, this.allies.length));
    labelEnemies(this.enemies);
    /* "Encontrados" do Bestiário: conta o que APARECEU, não o que
       morreu. É o número que decide o quanto a ficha revela, e ver a
       criatura já é o primeiro passo de conhecê-la — inclusive quando a
       luta termina em fuga. */
    if (!G.vistos) G.vistos = {};
    for (const e of this.enemies) G.vistos[e.key] = (G.vistos[e.key] || 0) + 1;
    this.layout();
    this.units = [...this.allies, ...this.enemies];
    this.round = 1; this.log = []; this.result = null; this.escapeTries = 0;
    this.rolarPet();          // o pet pode se meter já na primeira rodada
    this.pushLog(this.enemies.length > 1
      ? `${this.enemies.length} inimigos bloqueiam o caminho!`
      : `${this.enemies[0].name} apareceu!`);
    /* Também aqui, e não só em `finish`: a invariante é "toda luta começa
       em forma humana", e ela não pode depender de a luta anterior ter
       terminado pelo caminho normal. */
    for (const a of this.allies){
      a.lycan = false; a.papelaoT = 0;
      a.buffs = a.buffs.filter(b => !b.lycan);
    }
    /* Fase 1 aplicada na largada: é ela que põe o sprite, o repertório e
       os modificadores do Guardião, e é ela que solta a primeira fala. */
    for (const e of this.enemies) if (e.defs?.fases) this.aplicarFase(e, 0);
    G.scene = 'BATTLE';
    Sound.bgm(this.isBoss ? 'boss' : 'battle');
    this.phase = 'INTRO'; this.t = 0;
    this.buildOrder();
  },
  layout(){
    const spots = anyBattleArt(this.allies) ? ALLY_SPOTS_LARGE : ALLY_SPOTS;
    this.allies.forEach((a, i) => { const s = spots[i % spots.length]; a.bx = s.x; a.by = s.y; });
    /* Faixa dos inimigos: x 40..470. O limite superior existe porque o
       aliado mais à esquerda começa em ~492 — com sprite de até 174 px
       de largura, espalhar até 430 fazia o terceiro inimigo encostar na
       party. O desencontro vertical separa quem se sobrepõe. */
    const n = this.enemies.length;
    this.enemies.forEach((e, i) => {
      const I = HUD.inimigos, meio = (I.x0 + I.x1) / 2;
      e.bx = n === 1 ? meio : I.x0 + 90 + i * ((I.x1 - I.x0 - 180) / (n - 1));
      e.by = HUD.campo.y1 - 46 + (i % 2 ? 30 : 0) + (e.boss ? 18 : 0);
    });
  },
  pushLog(s){ this.log.push(s); if (this.log.length > 4) this.log.shift(); },

  buildOrder(){
    this.order = this.units.filter(isAlive)
      .map(u => ({u, roll:eSPD(u) * rnd(1.12, 0.88)}))
      .sort((a, b) => b.roll - a.roll).map(o => o.u);
    this.turnIdx = -1;
  },

  nextTurn(){
    if (this.checkEnd()) return;
    /* O pet entra ANTES do primeiro ator da rodada, e fora da ordem de
       turno. Deixá-lo fora de `this.order` é deliberado: o bestiário
       inteiro foi calibrado sobre "5 atores por rodada", e enfiar um
       sexto ali mudaria a vazão de dano de todas as lutas do jogo. */
    if (this.petPendente){ this.petPendente = false; if (this.petAct()) return; }
    /* Golpe em sequência do desespero: o mesmo ator age de novo antes de
       a ordem andar. Só enquanto ele estiver vivo e a luta não tiver
       acabado — encadear golpes de um boss já morto é o jeito clássico
       de a tela de vitória chegar depois de um game over. */
    const a = this.actor;
    if (a && a.side === 'enemy' && a.golpesRestantes > 0 && isAlive(a) && !this.checkEnd()){
      a.golpesRestantes--;
      this.pushLog(`${a.name} não para.`);
      this.wait(0.45, () => this.enemyAct(a));
      return;
    }
    this.turnIdx++;
    while (this.turnIdx < this.order.length && !isAlive(this.order[this.turnIdx])) this.turnIdx++;
    if (this.turnIdx >= this.order.length){ this.newRound(); return; }
    this.actor = this.order[this.turnIdx];
    this.actor.guarding = false;
    this.beginActorTurn();
  },
  newRound(){
    this.round++;
    for (const u of this.units){
      if (!isAlive(u)) continue;
      u.buffs = u.buffs.filter(b => --b.turns > 0);
      u.comboSpent = false;                 // a Conjunta volta a estar disponível
      if (u.tauntT > 0) u.tauntT--;
      if (u.papelaoT > 0) u.papelaoT--;
      /* Janela de exposição depois da ultimate. Fecha sozinha; enquanto
         aberta, o boss é alvo fácil e não dobra golpe. É o preço que o
         documento cobra pela Fúria do Pântano. */
      if (u.exposto > 0) u.exposto--;
      /* Postura regenera por RODADA, não por golpe: quebrar exige
         concentrar dano, e não somar arranhões ao longo de dez turnos. */
      if (hasPoise(u) && u.broken <= 0 && u.poise < u.maxPoise)
        u.poise = Math.min(u.maxPoise, u.poise + Math.round(u.maxPoise * POISE.regen));
    }
    this.buildOrder();
    this.rolarPet();
    this.nextTurn();
  },

  /* --- PET ----------------------------------------------------------
     Sorteia uma vez por rodada se o pet vai se meter. A rolagem fica
     separada da execução para o autoteste poder forçar (`petPendente`)
     sem depender de sorte. */
  petLungeT:0,               // avanço do pet quando ele entra na luta

  rolarPet(){
    const p = petAtivo();
    this.petPendente = !!p && chance(petChance(p.dados.lvl));
  },

  /** O pet age. Devolve true se assumiu o quadro (agendou a volta). */
  petAct(){
    const p = petAtivo();
    if (!p) return false;
    const vivos = this.allies.filter(isAlive);
    const alvos = this.enemies.filter(isAlive);
    if (!vivos.length || !alvos.length) return false;

    const F = p.forma, E = ELEM[p.def.elem] || ELEM.none;
    const bonus = petComDono(p.id) ? PET_BONUS_DONO : 1;
    /* O pet bate a partir do NÍVEL DELE, não do ATK de ninguém: se
       herdasse o ATK do dono, trocar de dono viraria exploit e a
       evolução do pet deixaria de importar. */
    const atkPet = 8 + p.dados.lvl * 2.4;

    this.startAnim(1);
    this.petLungeT = 0.001;      // mesma convenção do `lungeT`: sobe até 1 e zera
    this.pushLog(`${F.name} entra na luta!`);
    Sound.sfx('buff');
    FX.flash(E.glow, 0.22);

    this.schedule(0.25, () => {
      if (F.tipo === 'heal'){
        const cura = this.allies.filter(isAlive);
        const lista = F.alvo === 'all' ? cura
                    : [cura.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]];
        for (const t of lista){
          if (!t) continue;
          const real = Math.min(Math.round(F.power * bonus), t.maxHp - t.hp);
          t.hp += real;
          FX.popup(t.bx, t.by - 70, '+' + real, '#7ada7a');
          FX.burst(t.bx, t.by - 40, p.def.elem, 12);
          this.pushLog(`${t.name} recupera ${real} HP.`);
        }
        return;
      }
      if (F.tipo === 'buff'){
        for (const t of this.allies.filter(isAlive)){
          for (const [stat, mult] of Object.entries(F.buff || {})){
            if (stat === 'turns') continue;
            t.buffs.push({stat, mult, turns:(F.buff.turns || 3) + 1});
          }
          FX.popup(t.bx, t.by - 70, '▲', '#b89aff');
        }
        this.pushLog('O grupo inteiro se firma.');
        return;
      }
      if (F.tipo === 'debuff'){
        for (const t of alvos){
          for (const [stat, mult] of Object.entries(F.buff || {})){
            if (stat === 'turns') continue;
            t.buffs.push({stat, mult, turns:(F.buff.turns || 3) + 1});
          }
          FX.popup(t.bx, t.by - 70, '▼', '#da8aff');
        }
        this.pushLog('Os inimigos hesitam.');
        return;
      }
      // ataque
      const lista = F.alvo === 'all' ? alvos : [pick(alvos)];
      const skill = {power:F.power, elem:p.def.elem, type:'atk', poise:1.2};
      const antes = this.pendingSkill, antesUlt = this.pendingIsUlt;
      this.pendingSkill = skill; this.pendingIsUlt = false;
      for (const t of lista){
        const r = calcDamage({atk:atkPet, buffs:[], ail:[]}, skill, t,
                             {atk:atkPet * bonus, variance:rnd(1.06, 0.94)});
        /* O pet não é da party para efeito de `applyDamage` (não enche
           Ressonância de ninguém), mas o dano dele CONTA como do grupo:
           passa `side:'ally'` para valer postura e dificuldade certas. */
        this.applyDamage({side:'ally', element:p.def.elem}, t, r, F.name);
        if (F.drenar){
          const alvoCura = vivos.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
          if (alvoCura){
            const cura = Math.min(Math.round(r.dmg * F.drenar), alvoCura.maxHp - alvoCura.hp);
            alvoCura.hp += cura;
            if (cura > 0){
              FX.popup(alvoCura.bx, alvoCura.by - 80, '+' + cura, '#7ada7a');
              this.pushLog(`${alvoCura.name} absorve ${cura} HP.`);
            }
          }
        }
        if (F.status && chance(F.status.chance) && isAlive(t)){
          if (addAil(t, F.status.id)) this.pushLog(`${t.name} ${AILMENTS[F.status.id].msg}!`);
        }
      }
      this.pendingSkill = antes; this.pendingIsUlt = antesUlt;
    });
    this.schedule(1, () => { if (!this.checkEnd()) this.nextTurn(); });
    return true;
  },

  /** Início do turno: condições causam dano e podem roubar a vez. */
  beginActorTurn(){
    const u = this.actor;
    let skip = false, msg = [];
    for (let i = u.ail.length - 1; i >= 0; i--){
      const a = u.ail[i], d = AILMENTS[a.id];
      if (d.dot){
        const dmg = Math.max(1, Math.round(u.maxHp * d.dot));
        u.hp = Math.max(gmInfinito(u) ? gmPisoHp(u) : 0, u.hp - dmg);
        FX.popup(u.bx, u.by - 70, String(dmg), ELEM[d.el].glow);
        msg.push(`${u.name} ${d.msg} (−${dmg})`);
        u.hurtT = 0.3;
      }
      if (d.skip && chance(d.skip)) skip = true;
      /* `skipOnce` rouba UM turno, no primeiro tique, e depois só o
         resto da condição continua valendo. A marca fica no registro da
         condição (`a`), não na definição (`d`), senão dois alvos
         apavorados dividiriam o mesmo controle. */
      if (d.skipOnce && !a.skipUsado){ skip = true; a.skipUsado = true; }
      if (--a.turns <= 0){ u.ail.splice(i, 1); msg.push(`${u.name}: ${d.name} passou.`); }
    }
    msg.forEach(m => this.pushLog(m));
    if (!isAlive(u)){ this.onDeath(u); this.wait(0.5, () => this.nextTurn()); return; }
    /* Quem foi arrastado para uma Conjunta já agiu: o turno dele foi
       gasto no golpe conjunto, e é esse o preço que torna a mecânica
       uma escolha em vez de dano grátis. */
    if (u.skipTurn){
      u.skipTurn = false;
      this.pushLog(`${u.name} já gastou o turno na Conjunta.`);
      this.wait(0.45, () => this.nextTurn());
      return;
    }
    /* Quebrado: perde a vez e SÓ se recompõe ao consumir o último turno.
       A vulnerabilidade dura enquanto `broken > 0`, então a janela real
       de castigo é de duas rodadas inteiras. */
    if (u.broken > 0){
      skip = true;
      u.broken--;
      this.pushLog(`${u.name} está sem eixo e perde a vez!`);
      if (u.broken <= 0){
        u.poise = u.maxPoise;
        this.pushLog(`${u.name} recompõe a postura — a barra voltou maior.`);
      }
    }
    if (skip){
      this.pushLog(`${u.name} não consegue agir!`);
      this.wait(0.7, () => this.nextTurn());
      return;
    }
    if (u.side === 'ally'){
      this.phase = 'INPUT'; this.cmd.i = 0;
    } else {
      /* Quantos golpes ele dá NESTE turno. Decidido aqui, uma vez, e não
         dentro de `enemyAct` — senão o segundo golpe sortearia um
         terceiro e a fase final viraria um turno infinito. */
      u.golpesRestantes = this.golpesDoTurno(u) - 1;
      this.phase = 'ENEMY';
      this.wait(0.55, () => this.enemyAct(u));
    }
  },

  wait(sec, fn){ this.phase = 'ANIM'; this.animT = 0; this.animDur = sec; this.seq = [{at:sec, fn}]; },
  schedule(sec, fn){ this.seq.push({at:sec, fn}); this.animDur = Math.max(this.animDur, sec); },
  startAnim(dur){ this.phase = 'ANIM'; this.animT = 0; this.animDur = dur; this.seq = []; },

  /* ---------- comandos do jogador ---------- */
  commands(){
    const u = this.actor;
    const list = [
      {id:'attack', label:'Atacar',      desc:ATTACK_CMD.desc},
      {id:'skill',  label:'Habilidade',  desc:'Técnicas elementais (custam MP).'},
    ];
    if (u.ult && u.reso >= 100)
      list.push({id:'ult', label:'★ Ressonância', desc:ULTIMATES[u.ult].desc, hot:true});
    if (this.comboPartners(u).length)
      list.push({id:'combo', label:'⁂ Conjunta',
                 desc:'Golpe de dois elementos. O parceiro gasta o turno junto.', hot:true});
    list.push({id:'item',  label:'Item',    desc:'Usar um item da bolsa.'});
    list.push({id:'guard', label:'Guardar', desc:'Dano recebido cai bem menos e a Ressonância sobe.'});
    list.push({id:'flee',  label:'Fugir',   desc:this.isBoss ? 'Impossível nesta batalha.' : 'Tentar escapar.'});
    return list;
  },

  /** Parceiros com quem `u` pode soltar uma Conjunta AGORA.
   *  Vale para a IA de medição e para a interface — uma fonte só. */
  comboPartners(u){
    if (!u || u.side !== 'ally' || u.comboSpent) return [];
    return this.allies
      .filter(p => p !== u && isAlive(p) && !p.comboSpent && !p.skipTurn)
      .map(p => ({mate:p, combo:comboOf(u, p)}))
      .filter(o => o.combo && u.mp >= comboCost(u, o.combo) && o.mate.mp >= comboCost(o.mate, o.combo));
  },

  chooseCommand(id){
    const u = this.actor;
    if (id === 'combo'){
      if (!this.comboPartners(u).length){ Sound.sfx('deny'); return; }
      this.phase = 'COMBO'; this.comboCur.i = 0; return;
    }
    // a arma equipada define o elemento do ataque básico
    if (id === 'attack'){
      this.pendingSkill = {...ATTACK_CMD, elem:weaponElem(u)};
      this.pendingIsUlt = false; this.toTarget(); return;
    }
    if (id === 'skill'){ this.phase = 'SKILL'; this.skillCur.i = 0; return; }
    if (id === 'item'){ this.phase = 'ITEM'; this.itemCur.i = 0; return; }
    if (id === 'ult'){
      const U = ULTIMATES[u.ult];
      // `type` deixa de ser fixo em 'atk': a Ressonância da Eden cura.
      this.pendingSkill = {...U, type:U.type || 'atk', cost:0, ult:true};
      this.pendingIsUlt = true;
      if (U.target === 'all')    { this.execute(this.enemies.filter(isAlive)); return; }
      if (U.target === 'allies') { this.execute(this.allies.filter(isAlive)); return; }
      if (U.target === 'self')   { this.execute([u]); return; }
      this.toTarget(); return;
    }
    if (id === 'guard'){
      u.guarding = true; u.reso = clamp((u.reso || 0) + 14, 0, 100);
      this.pushLog(`${u.name} assume a guarda.`);
      Sound.sfx('guard');
      this.wait(0.45, () => this.nextTurn());
      return;
    }
    if (id === 'flee'){
      if (this.isBoss){ Sound.sfx('deny'); this.pushLog('Não há para onde correr.'); return; }
      this.escapeTries++;
      const ps = sum(this.allies.filter(isAlive).map(eSPD)) / Math.max(1, this.allies.filter(isAlive).length);
      const es = sum(this.enemies.filter(isAlive).map(eSPD)) / Math.max(1, this.enemies.filter(isAlive).length);
      const p = clamp(0.35 + (ps - es) * 0.04 + this.escapeTries * 0.12, 0.15, 0.95);
      if (chance(p)){
        Sound.sfx('cancel'); this.pushLog('Fugiram com sucesso!');
        this.phase = 'ANIM'; this.wait(0.6, () => this.finish('flee'));
      } else {
        Sound.sfx('deny'); this.pushLog('Não conseguiram fugir!');
        this.wait(0.6, () => this.nextTurn());
      }
      return;
    }
  },

  chooseSkill(id){
    const s = SKILLS[id]; const u = this.actor;
    if (u.mp < s.cost && !gmInfinito(u)){ Sound.sfx('deny'); return; }
    this.pendingSkill = {...s, id}; this.pendingIsUlt = false;
    if (s.target === 'all'){ this.execute(this.enemies.filter(isAlive)); return; }
    if (s.target === 'allies'){ this.execute(this.allies.filter(isAlive)); return; }
    if (s.target === 'self'){ this.execute([u]); return; }
    if (s.target === 'fallen'){
      const caidos = this.allies.filter(a => !isAlive(a));
      if (!caidos.length){ Sound.sfx('deny'); this.pushLog('Ninguém caiu.'); return; }
    }
    this.toTarget();
  },
  /** Dispara a Conjunta: cobra os dois, queima o turno do parceiro. */
  chooseCombo(o){
    const u = this.actor, C = o.combo, p = o.mate;
    const cu = comboCost(u, C), cp = comboCost(p, C);
    if (!C || (!gmInfinito(u) && u.mp < cu) || (!gmInfinito(p) && p.mp < cp)){ Sound.sfx('deny'); return; }
    u.mp = Math.max(gmInfinito(u) ? gmPisoMp(u) : 0, u.mp - cu);
    p.mp = Math.max(gmInfinito(p) ? gmPisoMp(p) : 0, p.mp - cp);
    u.comboSpent = true; p.comboSpent = true;
    p.skipTurn = true;                       // o parceiro gasta o turno junto
    this.comboMate = p;
    this.pendingSkill = {...C, id:comboKey(u.element, p.element), type:'atk',
                         combo:true, cost:0,
                         /* média dos dois ATK: juntar quem bate rende mais
                            que juntar quem sobra — é o incentivo certo. */
                         atkOverride:(eATK(u) + eATK(p)) * 0.62};
    this.pendingIsUlt = false; this.pendingItem = null;
    p.lungeT = 0.001;
    this.pushLog(`${u.name} + ${p.name} sincronizam o éter!`);
    if (C.target === 'all'){ this.execute(this.enemies.filter(isAlive)); return; }
    this.toTarget();
  },

  chooseItem(id){
    const it = ITEMS[id];
    this.pendingItem = id; this.pendingSkill = null;
    /* Os `use` da v4.8 não pedem alvo: ou pegam o grupo inteiro, ou o
       lado inteiro, ou encerram a luta. Resolver aqui evita uma tela de
       alvo com uma opção só, que é ruído puro. */
    if (it.use === 'escape'){
      this.pendingItem = null;
      if (this.isBoss){ Sound.sfx('deny'); this.pushLog('Não há para onde correr.'); this.phase = 'ITEM'; return; }
      Bag.take(id);
      Sound.sfx('cancel'); this.pushLog(`${this.actor.name} usa ${it.name}. Fugiram!`);
      this.startAnim(0.8);
      this.schedule(0.7, () => this.finish('flee'));
      return;
    }
    if (it.use === 'enemies'){
      const pool = this.enemies.filter(isAlive);
      if (!pool.length){ Sound.sfx('deny'); this.pendingItem = null; this.phase = 'ITEM'; return; }
      this.execute(pool); return;
    }
    if (it.use === 'party'){
      const pool = it.revive ? this.allies.filter(a => !isAlive(a)) : this.allies.filter(isAlive);
      if (!pool.length){ Sound.sfx('deny'); this.pendingItem = null; this.phase = 'ITEM'; return; }
      this.execute(pool); return;
    }
    this.phase = 'TARGET'; this.targetCur.i = 0;
    this.targetSide = it.use === 'enemy' ? 'enemy' : 'ally';
    this.targetPool = it.use === 'enemy' ? this.enemies.filter(isAlive)
                     : it.use === 'fallen' ? this.allies.filter(a => !isAlive(a))
                     : this.allies.filter(isAlive);
    if (!this.targetPool.length){ Sound.sfx('deny'); this.phase = 'ITEM'; }
  },
  toTarget(){
    const s = this.pendingSkill;
    this.phase = 'TARGET'; this.targetCur.i = 0;
    if (s.type === 'revive'){ this.targetSide = 'ally'; this.targetPool = this.allies.filter(a => !isAlive(a)); }
    else if (s.type === 'heal' || s.type === 'buff'){ this.targetSide = 'ally'; this.targetPool = this.allies.filter(isAlive); }
    else { this.targetSide = 'enemy'; this.targetPool = this.enemies.filter(isAlive); }
    if (!this.targetPool.length){ Sound.sfx('deny'); this.phase = 'INPUT'; }
  },

  /* ---------- execução ---------- */
  execute(targets){
    const u = this.actor, s = this.pendingSkill, itemId = this.pendingItem;
    this.startAnim(0.95);

    if (itemId){
      const it = ITEMS[itemId];
      Bag.take(itemId);
      this.pushLog(`${u.name} usa ${it.name}.`);
      this.schedule(0.25, () => {
        for (const t of targets){
          if (it.power){
            this.pendingSkill = {elem:it.elem || 'none'};   // usado pelo efeito de partícula
            const r = calcDamage(u, {power:it.power, elem:it.elem, type:'atk'}, t, {variance:rnd(1.06,0.94)});
            this.applyDamage(u, t, r, it.name);
            /* `poiseHit` é postura PURA, independente do dano: é o que
               transforma o Cravo de Ferro numa ferramenta de chefe em
               vez de uma bomba fraca. */
            if (it.poiseHit && hasPoise(t) && t.broken <= 0 && isAlive(t)){
              t.poise = Math.max(0, t.poise - it.poiseHit);
              FX.popup(t.bx + 26, t.by - 96, `−${it.poiseHit} postura`, '#ffd24a');
              if (t.poise <= 0) this.breakPoise(t);
            }
            if (it.status && chance(it.status.chance) && isAlive(t)){
              if (addAil(t, it.status.id)) this.pushLog(`${t.name} ${AILMENTS[it.status.id].msg}!`);
            }
          } else {
            const res = applyItem(it, t);
            if (res.ok){ FX.popup(t.bx, t.by - 70, '＋', '#5aba5a'); this.pushLog(res.text); Sound.sfx('heal'); }
            else this.pushLog(res.why);
          }
        }
      });
      this.pendingItem = null;
      this.schedule(0.95, () => this.afterAction());
      return;
    }

    if (s.cost) u.mp = Math.max(gmInfinito(u) ? gmPisoMp(u) : 0, u.mp - s.cost);
    if (this.pendingIsUlt){
      u.reso = 0; Sound.sfx('ult'); FX.flash(ELEM[s.elem].glow, 0.35); FX.shake(9, 0.5);
      /* Corte dramático da Ressonância: um instante de respiro antes do
         golpe (hitstop), o nome da própria ultimate como cartela — até
         aqui toda Ressonância só se distinguia da Conjunta pelo flash
         maior — e uma explosão de partículas do elemento no corpo de
         quem golpeia, não no alvo (o alvo já ganha a dele no impacto,
         ver `FX.burst` mais abaixo). */
      FX.hitstop(0.12);
      FX.popup(W / 2, 140, s.name.toUpperCase(), ELEM[s.elem].glow, true);
      FX.burst(u.bx, u.by - 40, s.elem, 26);
    }
    else if (s.combo){ Sound.sfx('ult'); FX.flash(ELEM[s.elem].glow, 0.28); FX.shake(7, 0.42); }
    this.pushLog(`${u.name} usa ${s.name}!`);

    // animação: avanço → impacto → volta
    u.lungeT = 0.001;
    if (u.side === 'enemy' && s.arte){ u.arteAtaque = s.arte; u.arteHoldT = 1.1; }
    const impactAt = this.pendingIsUlt ? 0.5 : s.combo ? 0.42 : 0.3;
    this.animDur = this.pendingIsUlt ? 1.5 : s.combo ? 1.25 : 0.95;

    this.schedule(impactAt, () => {
      if (!this.pendingIsUlt) Sound.sfx(s.phys ? 'hit' : s.type === 'heal' ? 'heal' : s.type === 'buff' ? 'buff' : 'magic');
      for (const t of targets){
        if (s.type === 'heal'){
          if (!isAlive(t)){ this.pushLog(`${t.name} está caído — precisa de reanimação.`); continue; }
          const amount = Math.round(calcHeal(u, s) * ailMult(t, 'healMod'));
          const real = Math.min(amount, t.maxHp - t.hp);
          t.hp += real;
          FX.popup(t.bx, t.by - 70, '+' + real, '#7ada7a');
          FX.burst(t.bx, t.by - 40, 'light', 14);
          this.pushLog(`${t.name} recupera ${real} HP.`);
          // cura que também LIMPA: é o que separa "curandeira" de "poção viva"
          if (s.cure && t.ail.length){ t.ail = []; this.pushLog(`${t.name} está limpo das condições.`); }
          continue;
        }
        /* Reanimação em habilidade. Antes só existia em item, o que
           fazia a Pena de Ressurgir ser obrigatória em toda luta longa. */
        if (s.type === 'revive'){
          if (isAlive(t)){ this.pushLog(`${t.name} não está caído.`); continue; }
          t.hp = Math.max(1, Math.round(t.maxHp * (s.power || 50) / 100));
          t.ail = []; t.buffs = []; t.dieT = 0;
          FX.popup(t.bx, t.by - 70, '✚', '#ffe44a', true);
          FX.burst(t.bx, t.by - 40, 'light', 24);
          Sound.sfx('levelup');
          this.pushLog(`${t.name} volta a si com ${t.hp} HP!`);
          continue;
        }
        if (s.type === 'buff' || s.type === 'debuff'){
          for (const [stat, mult] of Object.entries(s.buff || {})){
            if (stat === 'turns') continue;
            t.buffs.push({stat, mult, turns:(s.buff.turns || 3) + 1});
          }
          /* Provocar: obriga o inimigo a mirar em quem provocou. É a
             única forma de o Guardião realmente PROTEGER alguém — DEF
             alta não serve de nada se a IA mira sempre no mais fraco. */
          if (s.taunt) t.tauntT = s.taunt + 1;
          /* Papelão troca a arte enquanto o buff durar. `papelaoT` conta
             junto com o buff (mesma duração) para a caixa não ficar
             erguida depois que a defesa já caiu — desenho mentindo sobre
             o estado é pior que desenho pobre. */
          if (s.papelao) t.papelaoT = (s.buff.turns || 3) + 1;
          if (s.type === 'debuff' && s.status && chance(s.status.chance) && isAlive(t))
            if (addAil(t, s.status.id)) this.pushLog(`${t.name} ${AILMENTS[s.status.id].msg}!`);
          FX.popup(t.bx, t.by - 70, s.type === 'buff' ? '▲' : '▼',
                   s.type === 'buff' ? '#b89aff' : '#da8aff');
          FX.burst(t.bx, t.by - 40, s.elem, 12);
          this.pushLog(s.type === 'buff' ? `${t.name} está reforçado.` : `${t.name} está enfraquecido.`);
          continue;
        }
        // ataque
        if (!chance(chanceAcerto(u))){
          FX.popup(t.bx, t.by - 70, 'errou', '#8a8a9a');
          Sound.sfx('miss'); this.pushLog(`${u.name} errou o golpe.`);
          continue;
        }
        const crit = chance(chanceCritico(u));
        const r = calcDamage(u, s, t, {crit, variance:rnd(1.07, 0.93), atk:s.atkOverride});
        this.applyDamage(u, t, r, s.name);
        if (s.drain){
          const heal = Math.round(r.dmg * s.drain);
          u.hp = Math.min(u.maxHp, u.hp + heal);
          FX.popup(u.bx, u.by - 80, '+' + heal, '#7ada7a');
          this.pushLog(`${u.name} absorve ${heal} HP.`);
        }
        if (s.status && chance(s.status.chance) && isAlive(t)){
          if (addAil(t, s.status.id)) this.pushLog(`${t.name} ${AILMENTS[s.status.id].msg}!`);
        }
      }
      u.reso = clamp((u.reso || 0) + 10, 0, 100);
    });
    this.schedule(this.animDur, () => this.afterAction());
  },

  applyDamage(src, tgt, r, label){
    // dificuldade entra aqui, num ponto só, depois de toda a fórmula
    const D = diff();
    r.dmg = Math.max(1, Math.round(r.dmg * (src.side === 'ally' ? D.dmgOut : D.dmgIn) *
      multiplicadorDanoCombate(src, tgt)));
    tgt.hp = Math.max(gmInfinito(tgt) ? gmPisoHp(tgt) : 0, tgt.hp - r.dmg);
    tgt.hurtT = 0.34;
    /* Ressonância mora em `reso`. `res` é a tabela de resistência
       elemental — escrever o gauge ali apagava a tabela do inimigo no
       primeiro golpe (o Selo Quebrado perdia a fraqueza a Luz). */
    if (tgt.side === 'ally') tgt.reso = clamp((tgt.reso || 0) + 14, 0, 100);
    if (src.side === 'ally' && isAlive(tgt)) this.hitPoise(src, tgt, r);
    /* Fase troca no instante em que o HP cruza o limiar. Esperar o turno
       dele deixaria o jogador levando um golpe do repertório que acabou
       de terminar — o tipo de coisa que parece bug. */
    if (tgt.defs?.fases) this.checarFase(tgt);
    FX.popup(tgt.bx, tgt.by - 70, String(r.dmg),
             r.crit ? '#ffe44a' : r.em > 1 ? '#ff9a6a' : r.em < 1 ? '#8aa0c0' : '#ffffff', r.crit);
    FX.burst(tgt.bx, tgt.by - 40, src.side === 'ally' ? (this.pendingSkill?.elem || 'none') : src.element, r.crit ? 22 : 14);
    FX.shake(r.crit ? 8 : 4, r.crit ? 0.32 : 0.16);
    FX.hitstop(r.crit ? 0.09 : 0.04);
    if (r.crit) Sound.sfx('crit');
    let eff = r.em > 1 ? ' Super eficaz!' : r.em < 1 && r.em > 0 ? ' Pouco eficaz...' : r.em <= 0 ? ' Sem efeito.' : '';
    this.pushLog(`${tgt.name} sofre ${r.dmg}${r.crit ? ' CRÍTICO!' : ''}${eff}`);
    if (!isAlive(tgt)) this.onDeath(tgt);
    else this.checarLycan(tgt);
  },

  /** Vira lobo ao cruzar o limiar. Só desce — quem se transformou não
   *  volta ao curar acima do limiar, senão uma cura no momento errado
   *  desfaria a virada e a mecânica viraria sorte. */
  checarLycan(u){
    if (!u || u.lycan || u.name !== LYCAN.dono || u.side !== 'ally') return;
    if (u.hp > u.maxHp * LYCAN.limiar) return;
    u.lycan = true;
    /* O bônus entra pelo MESMO sistema de buff que o resto do combate
       usa, com duração longa: assim `eATK`/`eDEF`/`eSPD` já o enxergam e
       nenhuma fórmula precisou saber que Lycan existe. */
    /* Uma entrada POR ATRIBUTO, no formato que `buffMult` lê
       (`{stat, mult}`). Empurrar `{atk:..., spd:...}` de uma vez não
       estoura e não faz nada — o buff some em silêncio, que foi
       exatamente o que o teste pegou. */
    for (const [stat, mult] of Object.entries(LYCAN.buff))
      u.buffs.push({stat, mult, turns:999, lycan:true});
    this.pushLog(LYCAN.grito);
    Sound.sfx('levelup');
    FX.flash('#ff8844', 0.32);
    FX.burst(u.bx, u.by - 40, 'fire', 26);
    FX.shake(9, 0.36);
  },

  /* --- postura ------------------------------------------------------
     Chamado só quando a party bate em quem tem barra. Separado de
     applyDamage porque a regra é de DESIGN, não de aritmética de dano:
     quem quebra é quem escolhe o elemento certo e concentra o golpe. */
  hitPoise(src, tgt, r){
    if (!hasPoise(tgt) || tgt.broken > 0) return;
    const s = this.pendingSkill || {};
    // Martelo de Bolso e afins: bônus de POSTURA vindo do equipamento.
    const gear = 1 + (src.gear ? gearBonus(src, 'poiseUp') : 0);
    const pd = poiseDamage(r.dmg, {em:r.em, crit:r.crit, poise:(s.poise ?? 1) * gear,
                                   ult:!!this.pendingIsUlt, combo:!!s.combo});
    tgt.poise = Math.max(0, tgt.poise - pd);
    if (tgt.poise > 0) return;
    this.breakPoise(tgt);
  },
  breakPoise(u){
    u.broken = POISE.turns;
    u.breaks++;
    u.breakT = 1;
    u.buffs = u.buffs.filter(b => b.stat !== 'def');   // a guarda de pedra cai junto
    u.guarding = false;
    /* A barra volta MAIOR a cada quebra (com teto): a segunda janela
       custa mais que a primeira, então repetir a receita não basta. */
    u.maxPoise = Math.min(Math.round(u.poiseBase * POISE.growthCap),
                          Math.round(u.maxPoise * POISE.growth));
    this.pushLog(`POSTURA QUEBRADA — ${u.name} perde o eixo!`);
    FX.popup(u.bx, u.by - 108, 'QUEBRA!', '#ffe44a', true);
    FX.burst(u.bx, u.by - 50, 'light', 30);
    FX.flash('#ffe9a0', 0.3); FX.shake(11, 0.5); FX.hitstop(0.12);
    Sound.sfx('crit');
  },

  onDeath(u){
    u.dieT = 0.001;
    this.pushLog(u.side === 'ally' ? `${u.name} caiu!` : `${u.name} foi derrotado!`);
    if (u.side === 'ally'){ u.ail = []; u.buffs = []; }
  },

  afterAction(){
    this.comboMate = null;
    if (this.checkEnd()) return;
    this.nextTurn();
  },

  /* ---------- IA inimiga ---------- */
  /* ---------- boss em fases (v5.23) ----------

     Fase é um pacote: repertório, corpo, atributos e uma fala. A troca
     acontece quando o HP cruza o limiar, e acontece NA HORA — esperar o
     turno dele deixaria o jogador levando um golpe da fase que acabou
     de terminar, que é o tipo de coisa que parece bug. */
  aplicarFase(u, i){
    const f = u.defs?.fases?.[i]; if (!f) return;
    u.fase = i;
    if (f.sprite) u.sprite = f.sprite;
    if (f.skills) u.skills = f.skills.slice();
    /* Os modificadores são sobre a BASE, não sobre o valor corrente:
       aplicar em cima do que já estava multiplicaria fase após fase e a
       defesa da fase 4 sairia menor que a de um rato. */
    if (f.mod){
      u.def = Math.round(u.defBase * (f.mod.def ?? 1));
      u.spd = Math.round(u.spdBase * (f.mod.spd ?? 1));
    }
    u.armaduraRompida = f.armadura === false;
    u.desespero = !!f.desespero;
    if (f.fala) this.pushLog(`${u.name}: "${f.fala}"`);
    if (i > 0){
      Sound.sfx('boss');
      FX.shake(0.35, 6);
      this.pushLog(`— ${f.nome} —`);
    }
  },

  /** Cruzou limiar? Troca de fase. Chamado sempre que o boss leva dano. */
  checarFase(u){
    const fases = u.defs?.fases; if (!fases || !isAlive(u)) return;
    const frac = u.hp / u.maxHp;
    let alvo = u.fase;
    for (let i = fases.length - 1; i > u.fase; i--)
      if (frac <= fases[i].ate){ alvo = i; break; }
    if (alvo !== u.fase) this.aplicarFase(u, alvo);
  },

  /** Quantos golpes o boss dá neste turno. */
  golpesDoTurno(u){
    /* Desespero é "mais ataques em sequência", do documento. Dois é o
       teto: três com uma ultimate em área dentro mataria o grupo antes
       de o jogador poder responder, e a fase final tem de ser tensa, não
       impossível. */
    return (u.desespero && !u.exposto && chance(0.55)) ? 2 : 1;
  },

  /* Prioridade de IA do Dono do Pântano, traduzida do documento.

     A ordem importa e não é decorativa: é ela que dá a leitura de
     "observa → expulsa → se irrita → entra em desespero". Uma escolha
     puramente aleatória entre as mesmas oito habilidades daria os mesmos
     números e nenhuma personalidade. */
  escolhaDoPantano(u, vivos){
    const tem = k => u.skills.includes(k);
    const frac = u.hp / u.maxHp;

    // exposto depois da Fúria: ele não ataca, arqueja
    if (u.exposto > 0) return tem('b_bite') ? 'b_bite' : pick(u.skills);

    // a ultimate, uma vez, quando o desespero começa
    if (frac <= 0.20 && tem('b_fury') && !u.usouFuria){ u.usouFuria = true; return 'b_fury'; }

    /* Submerso, ele não dá as caras: ou agarra quem ficou sozinho, ou
       atravessa a arena. É a emboscada que "Olhos na Água" prepara. */
    if (u.submerso){
      const isolado = vivos.length > 1 && vivos.some(a => a.hp / a.maxHp < 0.45);
      if (isolado && tem('b_grab')) return 'b_grab';
      if (tem('b_charge')) return 'b_charge';
    }

    // carapaça rompida: controla o espaço antes de bater
    if (u.armaduraRompida){
      if (tem('b_spikes') && chance(0.3)) return 'b_spikes';
      if (tem('b_shards') && chance(0.4)) return 'b_shards';
    }

    /* Olhos na Água não se repete em seguida — a regra do documento. Ela
       é preparação, e preparação duas vezes seguidas é só perder turno. */
    if (tem('b_eyes') && !u.submerso && u.ultima !== 'b_eyes' && chance(0.28)) return 'b_eyes';

    // cauda quando há gente demais em pé; mordida quando sobrou pouca
    if (tem('b_tail') && vivos.length >= 3 && chance(0.45)) return 'b_tail';
    if (tem('b_bite') && chance(0.5)) return 'b_bite';
    /* A ultimate sai do sorteio depois de usada. Sem isto ela voltava
       por acaso e deixava de ser o clímax que o documento pede — vira
       só o golpe mais forte da lista. */
    const pool = u.skills.filter(k => !(k === 'b_fury' && u.usouFuria));
    return pick(pool.length ? pool : u.skills);
  },

  enemyAct(u){
    const alliesAlive = this.allies.filter(isAlive);
    if (!alliesAlive.length){ this.checkEnd(); return; }
    let id = u.defs?.fases ? this.escolhaDoPantano(u, alliesAlive) : pick(u.skills);
    // Chefe age uma vez por rodada contra cinco heróis; sem preferência
    // por golpe em área ele não ameaça party nenhuma. Metade dos turnos
    // vira AoE — é isso que sustenta a dificuldade, não dano absurdo.
    if (u.boss && !u.defs?.fases){
      const areas = u.skills.filter(k => SKILLS[k].target === 'all');
      if (areas.length && chance(0.5)) id = pick(areas);
    }
    // chefe usa cura quando está mal
    if (u.boss && u.hp < u.maxHp * 0.32 && u.skills.includes('b_regen') && chance(0.5)) id = 'b_regen';
    const sk = SKILLS[id];
    u.ultima = id;
    /* Emerge/submerge ANTES do golpe: o sprite e o alcance do turno têm
       de casar com o que o log vai dizer. */
    if (sk.emerge) u.submerso = false;
    if (sk.submerge) u.submerso = true;
    if (sk.exausto) u.exposto = 2;
    this.pendingSkill = {...sk, id}; this.pendingIsUlt = false; this.pendingItem = null;
    let targets;
    if (sk.type === 'heal' || sk.target === 'self') targets = [u];
    else if (sk.target === 'all') targets = alliesAlive;
    else {
      /* Provocação vem ANTES de qualquer preferência: é o contrato da
         habilidade e, sem isso, "Provocar" seria um buff de DEF com
         nome bonito. */
      const provocando = alliesAlive.filter(a => a.tauntT > 0);
      const pool = provocando.length ? provocando : alliesAlive;
      // mira quem está mais fraco com alguma frequência
      targets = [chance(0.4)
        ? pool.slice().sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]
        : pick(pool)];
    }
    this.execute(targets);
  },

  /* ---------- fim ---------- */
  checkEnd(){
    if (this.enemies.every(e => !isAlive(e))){ this.victory(); return true; }
    if (this.allies.every(a => !isAlive(a))){ this.defeat(); return true; }
    return false;
  },

  victory(){
    this.phase = 'VICTORY';
    Sound.stopBgm(); Sound.sfx('victory');
    const survivors = this.allies.filter(isAlive);
    const D = diff();
    /* A revanche paga menos, e o que ela NÃO paga é o item garantido.

       Chefe larga `nectar`, `rebirth` e escama com probabilidade 1 — de
       propósito, é o prêmio de fechar a área. Repetir isso num rematch
       farmável imprimiria consumível infinito. Na revanche o garantido
       vira sorteio de 25%, e o resto do saque continua igual. */
    const kRev = this.revanche ? REVANCHE_PAGA : 1;
    const exp = Math.round(sum(this.enemies.map(e => e.exp)) * D.exp * kRev);
    const gold = Math.round(sum(this.enemies.map(e => e.gold)) * D.gold * kRev);
    /* Abates e saque, criatura por criatura.
     *
     * CONTADOR DE CAÇA (v5.29). Cada espécie tem um contador de mortes
     * desde o último drop da raridade MÁXIMA dela, e esse contador
     * multiplica a chance daquele topo:
     *
     *     chance = min(100%, base × contador)
     *
     * O contador só zera quando o topo cai. Item inferior não zera —
     * é essa a diferença entre "proteção contra azar" e "loteria que
     * se reinicia sozinha". Farm longo continua valendo: quem matou
     * 40 sem ver o épico está a 40× da chance-base, não no mesmo
     * lugar de quem começou agora.
     *
     * O incremento é FEITO AQUI DENTRO, uma criatura de cada vez, e não
     * num laço separado antes. Com dois bichos da mesma espécie na
     * mesma luta isso importa: se o primeiro larga o topo e zera, o
     * segundo entra com contador 1 — que é "a próxima morte volta a
     * contar de 1", como manda a regra —, e não com zero, que daria
     * chance nenhuma. */
    if (!G.kills) G.kills = {};
    if (!G.cacada) G.cacada = {};
    const drops = [];
    for (const e of this.enemies){
      if (isAlive(e)) continue;
      G.kills[e.key] = (G.kills[e.key] || 0) + 1;
      G.cacada[e.key] = (G.cacada[e.key] || 0) + 1;

      const topo = dropMaximo(e.key);
      const noTopo = new Set(topo ? topo.itens.map(([i]) => i) : []);
      for (const [item, p] of e.drops){
        if (noTopo.has(item)) continue;                 // o topo é sorteado à parte
        if (chance(this.revanche && p >= 1 ? REVANCHE_GARANTIDO : p)) drops.push(item);
      }
      if (topo && chance(chanceDeCaca(e.key, G.cacada[e.key]))){
        drops.push(sortearDoTopo(topo.itens));
        G.cacada[e.key] = 0;
      }
    }
    G.gold += gold;
    drops.forEach(d => Bag.add(d));
    /* Com 6 no elenco e até 5 em campo, quem fica de fora precisa receber
       alguma coisa — senão a reserva trava atrás e trocar de grupo vira
       punição. Metade do EXP mantém a rotação viável sem tornar o
       revezamento irrelevante. */
    const emCampo = new Set(this.allies.map(a => a.name));
    const reserva = G.party.filter(c => !emCampo.has(c.name) && c.hp > 0);
    const ups = [];
    for (const c of reserva){
      c.exp += Math.round(exp * RESERVE_EXP);
      while (c.exp >= expToNext(c.lvl)){
        c.exp -= expToNext(c.lvl); c.lvl++;
        recalcStats(c); c.hp = c.maxHp; c.mp = c.maxMp;
        ups.push({name:c.name, lvl:c.lvl, reserva:true, gains:{hp:0,mp:0,atk:0,def:0,spd:0},
                  pontos:PONTOS_POR_NIVEL});
      }
    }
    for (const c of survivors){
      c.exp += exp;
      while (c.exp >= expToNext(c.lvl)){
        c.exp -= expToNext(c.lvl); c.lvl++;
        const before = {hp:c.maxHp, mp:c.maxMp, atk:c.atk, def:c.def, spd:c.spd};
        recalcStats(c);
        c.hp = c.maxHp; c.mp = c.maxMp;
        ups.push({name:c.name, lvl:c.lvl,
          gains:{hp:c.maxHp - before.hp, mp:c.maxMp - before.mp, atk:c.atk - before.atk,
                 def:c.def - before.def, spd:c.spd - before.spd},
          pontos:PONTOS_POR_NIVEL});
      }
    }
    if (ups.length) setTimeout(() => Sound.sfx('levelup'), 900);
    /* O pet ganha uma FRAÇÃO do EXP da luta, e é EXP A MAIS — não sai da
       conta de ninguém. Dividir com o elenco tornaria levar pet uma
       punição, e a curva do elenco já foi calibrada sem ele. */
    const petAntes = petAtivo();
    const petUps = darPetExp(exp * PET_EXP_SHARE);
    if (petUps.length) setTimeout(() => Sound.sfx('levelup'), 1400);
    this.result = {exp, gold, drops, ups, petUps, pet:petAntes ? petAtivo() : null};
    this.t = 0;
  },

  defeat(){
    this.phase = 'DEFEAT'; this.t = 0;
    Sound.stopBgm(); Sound.sfx('defeat');
  },

  finish(kind){
    this.active = false;
    // limpa estado de batalha dos personagens (HP/MP/EXP permanecem)
    this.petLungeT = 0;
    /* A forma some ao fim da luta: é estado de COMBATE, não do personagem.
       Sem isto o Gabriel entraria transformado na luta seguinte, já com o
       bônus, e a virada deixaria de ser um momento. */
    for (const a of this.allies){ a.lycan = false; a.papelaoT = 0; }
    for (const a of this.allies){ a.buffs = []; a.guarding = false; a.lungeT = 0; a.hurtT = 0; a.dieT = 0;
                                 a.comboSpent = false; a.skipTurn = false; a.broken = 0; }
    this.comboMate = null;
    /* Se uma cena pediu esta luta, ela retoma o controle no lugar do
       campo — senão o jogador cairia solto no meio de uma cutscene. */
    const gancho = this.onFinish;
    /* REVANCHE: a flag já está de pé e a cena já rodou. Repetir os dois
       reabriria a porta trancada e tocaria o desfecho do capítulo de
       novo — o chefe morreria uma segunda "primeira vez". */
    if (G.map?.boss && kind === 'victory' && this.isBoss && this.revanche){
      const id = G.map.boss.id;
      G.revanches[id] = Math.min(REVANCHE_TETO, (G.revanches[id] || 0) + 1);
      G.scene = 'FIELD';
      Sound.bgm(G.map?.def?.bgm || 'field');
      if (gancho){ this.onFinish = null; gancho(kind); return; }
      Msg.start([{speaker:'', text:
        `O eco de ${BESTIARY[id].name} se desfaz — e volta a se juntar, mais duro.` +
        (G.revanches[id] >= REVANCHE_TETO ? '\nEle não tem mais como endurecer.' : '')}]);
      return;
    }
    if (G.map?.boss && kind === 'victory' && this.isBoss){
      G.flags[G.map.boss.flag] = true;
      const outro = G.map.boss.outro || [];
      /* `cena` no chefe: em vez de despejar duas linhas de texto, a
         vitória pode entregar uma CENA inteira (câmera, tremor, o chão
         se abrindo). Vai para a fila e sobe quando o campo reassumir —
         tocar aqui pegaria o jogo ainda desmontando a batalha.
         `outro` continua valendo para quem não tem cena. */
      const cena = G.map.boss.cena;
      G.map.boss = null;
      G.scene = 'FIELD';
      Sound.bgm(G.map?.def?.bgm || 'field');
      if (gancho){ this.onFinish = null; gancho(kind); return; }
      if (cena && SCENES[cena]){ Cut.queue(cena); return; }
      if (outro.length) Msg.start(outro.map(t => ({speaker:'', text:t})));
      return;
    }
    G.scene = 'FIELD';
    Sound.bgm(G.map?.def?.bgm || 'field');
    if (gancho){ this.onFinish = null; gancho(kind); }
  },

  gameOver(){
    this.active = false;
    /* Morrer no meio de uma cena encerra a cena SEM gravar a flag: a
       história não pode ser perdida por causa de uma derrota. */
    if (Cut.active) Cut.abort();
    G.party.forEach(c => { c.hp = Math.max(1, Math.floor(c.maxHp * 0.35)); c.mp = Math.floor(c.maxMp * 0.35); c.ail = []; });
    const s = Save.read();
    FX.fade(() => {
      if (s) loadFromSave(s);
      else { const sp = MAPS.patio.spawn; loadMap('patio', sp.x, sp.y, sp.dir); }
      G.scene = 'FIELD';
      Msg.start([{speaker:'', text:'A party desperta perto do último cristal de éter. O corpo dói. A memória, mais.'}]);
    });
  },

  /* ---------- update ---------- */
  update(dt){
    this.t += dt;
    // brilho elemental de quem está escolhendo a ação (emitido aqui, não no draw)
    if (this.actor && PHASES_INPUT.includes(this.phase) && chance(0.5))
      FX.burst(this.actor.bx, this.actor.by - 50, this.actor.element, 1);
    for (const u of this.units){
      if (u.hurtT > 0) u.hurtT = Math.max(0, u.hurtT - dt);
      if (u.dieT > 0) u.dieT = Math.min(1, u.dieT + dt * 2.2);
      if (u.breakT > 0) u.breakT = Math.max(0, u.breakT - dt * 0.7);
      if (u.lungeT > 0) u.lungeT = u.lungeT >= 1 ? 0 : Math.min(1, u.lungeT + dt * 3.4);
      if (u.arteHoldT > 0){
        u.arteHoldT = Math.max(0, u.arteHoldT - dt);
        if (u.arteHoldT === 0) u.arteAtaque = null;
      }
    }
    /* O pet avança mais devagar que os combatentes de propósito: a ação
       dele dura ~1s e um avanço de 0,3s terminaria antes do golpe sair. */
    if (this.petLungeT > 0)
      this.petLungeT = this.petLungeT >= 1 ? 0 : Math.min(1, this.petLungeT + dt * 1.5);
    switch(this.phase){
      case 'INTRO':
        if (this.t > 0.85 || Input.pressed('confirm')) this.nextTurn();
        break;
      case 'ANIM': {
        this.animT += dt;
        for (let i = this.seq.length - 1; i >= 0; i--)
          if (this.animT >= this.seq[i].at){ const f = this.seq[i].fn; this.seq.splice(i, 1); f(); }
        break; }
      case 'INPUT':   this.updateInput(); break;
      case 'SKILL':   this.updateSkill(); break;
      case 'COMBO':   this.updateCombo(); break;
      case 'ITEM':    this.updateItem(); break;
      case 'TARGET':  this.updateTarget(); break;
      case 'VICTORY':
        if (this.t > 0.5 && (Input.pressed('confirm') || Input.pressed('cancel'))) this.finish('victory');
        break;
      case 'DEFEAT':
        if (this.t > 1.2 && (Input.pressed('confirm') || Input.pressed('cancel'))) this.gameOver();
        break;
    }
  },
  /* Todas as listas do combate são coluna única (`LISTA_COLS`), e
     `navList` já trata isso: numa coluna só, ◄► andam de um em um igual
     a ▲▼, em vez de ficarem surdas. Ficar surdo a metade do direcional
     passa impressão de travamento — no D-pad do celular ainda mais. */
  updateInput(){
    const cmds = this.commands();
    navList(this.cmd, cmds.length, CMD_COLS);
    if (Input.pressed('confirm')){ Sound.sfx('confirm'); this.chooseCommand(cmds[this.cmd.i].id); }
  },
  updateCombo(){
    const list = this.comboPartners(this.actor);
    if (!list.length){ this.phase = 'INPUT'; return; }
    navList(this.comboCur, list.length);
    if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.phase = 'INPUT'; return; }
    if (Input.pressed('confirm')){
      Sound.sfx('confirm');
      this.chooseCombo(list[this.comboCur.i % list.length]);
    }
  },
  updateSkill(){
    const list = this.actor.skills;
    navList(this.skillCur, list.length, LISTA_COLS);
    if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.phase = 'INPUT'; return; }
    if (Input.pressed('confirm') && list.length){
      const id = list[this.skillCur.i];
      if (this.actor.mp < SKILLS[id].cost && !gmInfinito(this.actor)){ Sound.sfx('deny'); return; }
      Sound.sfx('confirm'); this.chooseSkill(id);
    }
  },
  updateItem(){
    const list = battleItems();
    navList(this.itemCur, list.length, LISTA_COLS);
    if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.phase = 'INPUT'; return; }
    if (Input.pressed('confirm') && list.length){ Sound.sfx('confirm'); this.chooseItem(list[this.itemCur.i]); }
  },
  updateTarget(){
    /* Alguns alvos são CAÍDOS de propósito (Pena de Ressurgir, Retorno).
       A condição antiga era ilegível e não cobria habilidade nenhuma —
       só item. */
    const querCaidos = ITEMS[this.pendingItem]?.use === 'fallen' || this.pendingSkill?.type === 'revive';
    this.targetPool = this.targetPool.filter(u => querCaidos ? !isAlive(u) : isAlive(u));
    if (!this.targetPool.length){ this.phase = 'INPUT'; return; }
    navList(this.targetCur, this.targetPool.length);
    if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.pendingItem = null; this.phase = 'INPUT'; return; }
    if (Input.pressed('confirm')){
      Sound.sfx('confirm');
      this.execute([this.targetPool[this.targetCur.i % this.targetPool.length]]);
    }
  },
};
