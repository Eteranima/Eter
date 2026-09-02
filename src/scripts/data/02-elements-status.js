/* ===================================================================
   2. DADOS DO JOGO
   Tudo aqui é conteúdo puro — nenhuma lógica. Para adicionar
   personagem/inimigo/mapa/item, basta editar estas tabelas.
   =================================================================== */

const ELEM = {
  fire:        {main:'#e85a30', glow:'#ff8844', name:'Fogo',          icon:'🜂'},
  ice:         {main:'#5aaaea', glow:'#88ccff', name:'Gelo',          icon:'❆'},
  darkness:    {main:'#6a3a8a', glow:'#9a6aba', name:'Trevas',        icon:'☾'},
  ink:         {main:'#2a4a8a', glow:'#5a8afa', name:'Tinta',         icon:'✒'},
  light:       {main:'#eaea5a', glow:'#ffff88', name:'Luz',           icon:'✶'},
  /* Rebatizado de "Sangue" para "Cinzas" quando o Madao passou a lutar
     nesta posição do anel (era só a identidade da árvore dele; virou o
     elemento de combate de verdade). O ID interno continua `blood` —
     mudar a chave obrigaria trocar toda referência em skills, itens,
     bestiário e nas 10 Conjuntas já cadastradas para ela, sem nenhum
     ganho funcional. Paleta trocada de vermelho para cinza-marrom, a
     mesma da árvore do Madao (`IDENTIDADE_ARVORE.Madao.paleta`). */
  blood:       {main:'#7a6a5a', glow:'#c8a878', name:'Cinzas',        icon:'✹'},
  electricity: {main:'#cca800', glow:'#ffe44a', name:'Eletricidade',  icon:'⚡'},
  wind:        {main:'#5aba90', glow:'#a8ffd0', name:'Vento',         icon:'🜁'},
  /* v5.1: Terra (Ava Rosa Groot) e Veneno (Scythe). Verde-musgo para a
     terra e verde-ácido para o veneno — próximos no nome, distantes no
     tom, senão as duas barras de condição viram a mesma mancha. */
  earth:       {main:'#7a6a3a', glow:'#c8b060', name:'Terra',         icon:'🜃'},
  poison:      {main:'#4a8a2a', glow:'#9ae44a', name:'Veneno',        icon:'☠'},
  none:        {main:'#aaaaaa', glow:'#cccccc', name:'Neutro',        icon:'◇'},
};

/* Anel elemental circulante: cada elemento supera os DOIS seguintes
   e é superado pelos DOIS anteriores. Mesma convenção da ficha de RPG.
   Além do anel existem duplas rivais (super eficaz nos dois sentidos). */
/* Vento entrou entre Fogo e Sangue. Essa posição foi escolhida por ser a
   que MENOS mexe no que já estava balanceado: só duas relações mudam
   (Fogo perde vantagem sobre Trevas e Gelo perde sobre Sangue; ambos
   passam a superar Vento). Todo o resto do anel e as duplas rivais
   continuam idênticos, e os chefes usam `res` próprio, então não sentem.
   Leitura: o fogo consome o ar · o vento dispersa sangue e varre a sombra
   · o gelo imobiliza o ar parado. */
/* v5.1 — Veneno e Terra entram no anel. Cada inserção custa DUAS
   relações antigas (os dois elementos anteriores ao ponto de entrada
   perdem a vantagem mais distante deles), e não há posição que escape
   disso. Escolhi as posições pela LEITURA, aceitando o custo:

     Veneno entre Vento e Sangue — o veneno entra no sangue, e é o fogo
       que o queima antes de agir e o vento que o dispersa. Custa a
       vantagem do Fogo sobre Sangue e a do Vento sobre Trevas.
     Terra entre Tinta e Eletricidade — a terra aterra o raio, que é a
       relação mais intuitiva que a Terra tem. Custa a vantagem da Tinta
       sobre Gelo e a da Luz sobre Eletricidade.

   Leitura completa do que é novo: o fogo queima o veneno antes de ele
   agir · o vento dispersa o vapor · o veneno entra no sangue e apodrece
   o que a sombra alimenta · a luz revela o que a terra esconde · a
   tinta redesenha o mapa da terra · a terra aterra o raio e racha a
   pedra de gelo. */
const ELEM_RING   = ['fire','wind','poison','blood','darkness','light','ink','earth','electricity','ice'];
const ELEM_RIVALS = [['fire','ice'], ['light','darkness']];
const MULT_STRONG = 1.6, MULT_WEAK = 0.65;

const ELEM_CHART = (() => {
  const chart = {};
  for (const a of Object.keys(ELEM)) { chart[a] = {}; for (const d of Object.keys(ELEM)) chart[a][d] = 1; }
  const n = ELEM_RING.length;
  ELEM_RING.forEach((a, i) => {
    for (let k = 1; k <= 2; k++) {
      const d = ELEM_RING[(i + k) % n];
      chart[a][d] = MULT_STRONG;
      chart[d][a] = MULT_WEAK;
    }
  });
  for (const [a,b] of ELEM_RIVALS) { chart[a][b] = MULT_STRONG; chart[b][a] = MULT_STRONG; }
  return chart;
})();

/** Multiplicador elemental de `atkEl` contra um alvo.
 *  `res` permite override por criatura (0 = imune, negativo = absorve). */
function elemMult(atkEl, defEl, res) {
  if (!atkEl || atkEl === 'none') return 1;
  if (res && res[atkEl] !== undefined) return res[atkEl];
  return (ELEM_CHART[atkEl] && ELEM_CHART[atkEl][defEl]) ?? 1;
}

/* --- Condições de combate --------------------------------------- */
const AILMENTS = {
  burn:   {name:'Queimadura', el:'fire',        icon:'🔥', turns:3, dot:0.06, atkMod:0.85,
           msg:'está em chamas'},
  freeze: {name:'Congelado',  el:'ice',         icon:'❆',  turns:2, spdMod:0.5, skip:0.35,
           msg:'está congelado'},
  shock:  {name:'Choque',     el:'electricity', icon:'⚡', turns:3, skip:0.30,
           msg:'está paralisado'},
  bleed:  {name:'Sangrando',  el:'blood',       icon:'❥',  turns:3, dot:0.08, healMod:0.5,
           msg:'está sangrando'},
  blind:  {name:'Cegueira',   el:'ink',         icon:'✒',  turns:3, accMod:0.6,
           msg:'não enxerga'},
  /* `dread` se chamava "Pavor" e era só −25% de DEF. O nome foi para a
     condição da Scythe, que é a que faz jus a ele; a mecânica antiga
     ficou intacta sob o nome Assombro. Renomear em vez de fortalecer é
     de propósito: `dread` é aplicado por Eclipse, Noite Fechada e quatro
     inimigos, e dar a eles "perde o turno" viraria o jogo do avesso. */
  dread:  {name:'Assombro',   el:'darkness',    icon:'☾',  turns:3, defMod:0.75,
           msg:'está assombrado'},
  stun:   {name:'Atordoado',  el:'light',       icon:'✶',  turns:1, skip:1,
           msg:'está atordoado'},
  /* Exposto é a única condição que AMPLIFICA dano em vez de reduzir algo.
     É a assinatura do Vento e o motivo de a Eden não ser uma segunda
     Ophelia: ela não cura mais forte, ela faz o time inteiro bater mais. */
  exposed:{name:'Exposto',    el:'wind',        icon:'🜁', turns:3, vulnMod:1.25,
           msg:'está exposto'},
  /* PAVOR — a assinatura da Scythe. Duas mordidas em vez de uma:
       · `skipOnce` faz o alvo perder O PRÓXIMO turno, uma vez só;
       · `accMod:0` zera a pontaria enquanto a condição durar, então
         quando ele finalmente age, erra.
     Os dois juntos, e não um `skip` de duas rodadas, porque perder dois
     turnos seguidos por uma habilidade só não deixa decisão nenhuma
     para o outro lado — assim o inimigo VOLTA a agir, e erra.
     `accMod:0` é o único zero da tabela; foi por causa dele que `eACC`
     precisou de uma exceção ao piso de 15%. */
  terror: {name:'Pavor',      el:'poison',      icon:'☠',  turns:2, accMod:0, skipOnce:true,
           msg:'está tomado de pavor'},
  /* A condição da Terra é de CONTROLE, não de dano — combina com a Ava,
     que impede em vez de ferir. Tirar SPD atrasa o turno do alvo na
     ordem de iniciativa, que é o jeito da Terra de "segurar" alguém. */
  rooted: {name:'Enraizado',  el:'earth',       icon:'🜃', turns:2, spdMod:0.45,
           msg:'está preso ao chão'},
  /* MARCADO — assinatura de Vharok, a Alcateia do Vazio (Poço de
     Decantação). Não é elemental (`el:'none'`, sem entrada em
     EL_AILMENT) porque nasce só da habilidade Marca da Presa, não de
     um ataque comum do elemento dele. Mesmo campo `vulnMod` de Exposto:
     o alvo marcado é o que a alcateia falha em perder de vista. */
  marked: {name:'Marcado',    el:'none',        icon:'🐾', turns:3, vulnMod:1.3,
           msg:'foi marcado como presa'},
};
const EL_AILMENT = {fire:'burn', ice:'freeze', electricity:'shock', blood:'bleed',
                    ink:'blind', darkness:'dread', light:'stun', wind:'exposed',
                    earth:'rooted', poison:'terror', none:null};

/* --- Dificuldade ---------------------------------------------------
   Mexe só em multiplicadores de combate, nunca nas tabelas do bestiário
   — assim o balanceamento medido continua sendo a referência do
   "Normal", e os outros modos são desvios conhecidos a partir dele.
     dmgIn  = dano que a party RECEBE
     dmgOut = dano que a party CAUSA
   Modos difíceis pagam mais EXP e ouro para compensar o risco. */
const DIFFICULTIES = {
  tranquilo: {name:'Tranquilo',  dmgIn:0.65, dmgOut:1.20, exp:0.90, gold:0.90,
              desc:'Para quem veio pela história. Erros perdoam.'},
  normal:    {name:'Normal',     dmgIn:1.00, dmgOut:1.00, exp:1.00, gold:1.00,
              desc:'Como o jogo foi medido e balanceado.'},
  severo:    {name:'Severo',     dmgIn:1.40, dmgOut:0.90, exp:1.25, gold:1.25,
              desc:'Recurso importa. Guardar e curar deixam de ser opcionais.'},
  implacavel:{name:'Implacável', dmgIn:1.85, dmgOut:0.80, exp:1.50, gold:1.60,
              desc:'Um erro custa um personagem. Elemento errado custa a luta.'},
};
const DIFF_ORDER = ['tranquilo','normal','severo','implacavel'];
const diff = () => DIFFICULTIES[G.difficulty] || DIFFICULTIES.normal;

/* --- Itens -------------------------------------------------------- */
/* kind: 'consumable' (usável) | 'equip' (equipável).
   Equipamento some da bolsa ao ser equipado e volta ao ser retirado —
   assim a contagem da bolsa nunca duplica um item vestido. */
