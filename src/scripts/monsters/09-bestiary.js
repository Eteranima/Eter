const RARIDADES = ['comum', 'incomum', 'raro', 'epico', 'lendario'];
const RARIDADE = {
  comum:    {nome:'Comum',    cor:'#9a9aae', glow:'#c8c8d8'},
  incomum:  {nome:'Incomum',  cor:'#5aba5a', glow:'#9ae49a'},
  raro:     {nome:'Raro',     cor:'#5a8afa', glow:'#a8c8ff'},
  epico:    {nome:'Épico',    cor:'#b89aff', glow:'#d8c8ff'},
  lendario: {nome:'Lendário', cor:'#eaca3a', glow:'#ffe88a'},
};

function raridadeDe(id){
  const it = ITEMS[id];
  if (!it) return 'comum';
  if (it.rar) return it.rar;
  const p = it.price || 0;
  if (it.kind === 'equip') return p <= 1200 ? 'raro' : p <= 3500 ? 'epico' : 'lendario';
  /* Teto `incomum` para consumível e material, por caro que seja o
     Néctar. Se um deles pudesse alcançar `raro`, a Poção Maior dividiria
     o topo com o Machado de Carvão — e aí o contador zeraria na poção,
     que é justamente o item que ninguém está caçando. */
  return p <= 200 ? 'comum' : 'incomum';
}
const nivelRaridade = id => RARIDADES.indexOf(raridadeDe(id));

/** O TOPO da tabela de loot de uma criatura: a raridade máxima que ela
 *  larga, todos os itens dessa raridade e a chance-base somada.
 *
 *  Somada porque a raridade máxima é UMA categoria, não três sorteios:
 *  se o bicho pode largar três épicos, qualquer um dos três zera o
 *  contador, então a chance que o contador multiplica é a de sair
 *  ALGUM deles.
 *
 *  Devolve null quando não há o que multiplicar — sem drop, ou com o
 *  topo já garantido (`p >= 1`), que é o prêmio de chefe de primeira
 *  vez e não é sorteio nenhum. Memorizado: o combate consulta isto a
 *  cada morte, e a tabela não muda em tempo de execução. */
const _topoCache = {};
function dropMaximo(id){
  if (id in _topoCache) return _topoCache[id];
  const drops = (BESTIARY[id]?.drops || []).filter(([i]) => ITEMS[i]);
  if (!drops.length) return (_topoCache[id] = null);
  const alto = Math.max(...drops.map(([i]) => nivelRaridade(i)));
  const itens = drops.filter(([i]) => nivelRaridade(i) === alto);
  const base = sum(itens.map(([, p]) => p));
  const r = base >= 1 ? null : {rar:RARIDADES[alto], itens, base};
  return (_topoCache[id] = r);
}

/** Chance como o jogador lê. Uma casa decimal só quando faz diferença:
 *  "0,5%" precisa dela, "18%" não ganha nada com ",0". */
function pct(x){
  const v = x * 100;
  return (v < 10 && v % 1 >= 0.05 ? v.toFixed(1).replace('.', ',') : Math.round(v)) + '%';
}

/* Teto do multiplicador: chance nunca passa de 100%. */
function chanceDeCaca(id, contador){
  const t = dropMaximo(id);
  if (!t) return 0;
  return Math.min(1, t.base * Math.max(0, contador));
}

/** Sorteia UM item entre os do topo, proporcional à chance de cada um.
 *  Com um item só é ele mesmo; com três, o mais provável sai mais. */
function sortearDoTopo(itens){
  const total = sum(itens.map(([, p]) => p));
  let r = Math.random() * total;
  for (const [id, p] of itens){ r -= p; if (r <= 0) return id; }
  return itens[itens.length - 1][0];
}

/* --- Bestiário ---------------------------------------------------- */
/* shape: humanoid | golem | beast | wisp | boss — usado pelo desenho
   procedural enquanto não houver sprite. `sprite` usa SPRITE_DATA. */
/* BALANCEAMENTO — números derivados de medição, não de chute.
   Com 5 personagens agindo por rodada a party despeja 240-450 de dano
   POR RODADA, então vida de inimigo precisa ser contada nessa moeda:
       HP do grupo ≈ 3,5 × (dano da party por rodada)
   O dano do inimigo foi calibrado para tirar ~15% da vida da party por
   rodada — uma luta de ~3,5 rodadas custa metade dos recursos, o que
   dá tensão sem causar wipe. EXP/ouro acompanham a duração maior.
   Reequilibrar? Rode `medirBalanco()` no console (ver seção 15). */
const BESTIARY = {
  shade:  {name:'Sombra Corrompida', element:'darkness', lvl:4, shape:'humanoid', sprite:'mob_shade',
           base:{hp:480,atk:34,def:10,spd:12}, skills:['e_claw','e_veil'], exp:120, gold:70,
           drops:[['a_manto',0.06],['potion',0.4]], color:'#3a2050', accent:'#6a3a8a'},
  golem:  {name:'Golem de Pedra',    element:'none',     lvl:5, shape:'golem', sprite:'mob_golem',
           base:{hp:850,atk:110,def:20,spd:6}, skills:['e_smash','e_guard'], exp:165, gold:105,
           drops:[['a_tunica',0.06],['potion',0.35],['ether',0.25]], color:'#4a4a52', accent:'#7a7a86',
           res:{electricity:0.6, ink:1.3}},
  wraith: {name:'Espectro de Sangue', element:'blood',   lvl:5, shape:'wisp', sprite:'mob_wraith',
           base:{hp:470,atk:72,def:8,spd:19}, skills:['e_drainlf','e_fury'], exp:150, gold:95,
           drops:[['t_foco',0.06],['antidote',0.35]], color:'#6a1a1a', accent:'#cc3a3a'},
  wolf:   {name:'Lobo de Éter',      element:'none',     lvl:3, shape:'beast', sprite:'mob_wolf',
           base:{hp:360,atk:28,def:8,spd:18}, skills:['e_bite','e_howl'], exp:88, gold:46,
           drops:[['t_foco',0.06],['potion',0.3]], color:'#3d3d50', accent:'#6a6a8a'},
  spark:  {name:'Fátua Voltaica',    element:'electricity', lvl:4, shape:'wisp', sprite:'mob_spark',
           base:{hp:320,atk:40,def:7,spd:22}, skills:['e_spark'], exp:110, gold:78,
           drops:[['w_treino',0.06],['ether',0.4]], color:'#7a6a10', accent:'#ffe44a'},
  frost:  {name:'Servo do Inverno',  element:'ice',      lvl:6, shape:'humanoid', sprite:'mob_frost',
           base:{hp:640,atk:95,def:14,spd:11}, skills:['e_frost','e_claw'], exp:190, gold:120,
           drops:[['w_treino',0.06],['hipot',0.25],['ether',0.35]], color:'#2a4a6a', accent:'#88ccff'},
  warden: {name:'O Selo Quebrado',   element:'darkness', lvl:10, shape:'boss', sprite:'mob_warden', boss:true,
           base:{hp:3800,atk:72,def:20,spd:14}, poise:500,
           skills:['b_sever','b_collapse','b_feed','b_regen'], exp:1400, gold:1600,
           drops:[['phoenix',1],['hipot',1],['megapot',1]], color:'#1a0f28', accent:'#b06aea',
           res:{light:1.9, darkness:0.55}},

  // --- Galeria Profunda (pós-chefe) ---
  revenant:{name:'Renascido',        element:'blood',    lvl:12, shape:'humanoid', sprite:'mob_revenant',
            base:{hp:720,atk:160,def:17,spd:14}, skills:['e_fury','e_drainlf','e_claw'],
            exp:330, gold:230, drops:[['w_gelo',0.06],['hipot',0.4],['antidote',0.3]],
            color:'#5a1420', accent:'#d05a5a'},
  sentinel:{name:'Sentinela de Luz',  element:'light',   lvl:13, shape:'golem', sprite:'mob_sentinel',
            base:{hp:880,atk:165,def:26,spd:11}, skills:['e_smash','e_guard','e_lance'],
            exp:400, gold:290, drops:[['t_elo',0.05],['hiether',0.35],['megapot',0.2]],
            color:'#6a6450', accent:'#ffff9a', res:{darkness:1.8, light:0.4}},
  hollow: {name:'Oco Faminto',       element:'ink',      lvl:12, shape:'wisp', sprite:'mob_hollow',
           base:{hp:600,atk:150,def:12,spd:20}, skills:['e_gnaw','e_drainlf'],
           exp:300, gold:210, drops:[['t_pluma',0.05],['ether',0.45]], color:'#161a3a', accent:'#5a8afa'},
  /* --- Faixa média (nv 7-10): preenchem o vão entre o Subterrâneo e a
     Galeria, e cobrem os dois elementos que nenhum inimigo usava. --- */
  goblin: {name:'Aprendiz Deformado', element:'fire', lvl:7, shape:'humanoid', sprite:'mob_goblin',
           base:{hp:670,atk:97,def:11,spd:16}, skills:['e_ember','e_claw'], exp:210, gold:130,
           drops:[['w_tinta',0.06],['potion',0.35],['bomb',0.15]], color:'#4a6a2a', accent:'#8aba4a'},
  harpy:  {name:'Arauto de Penas',    element:'wind', lvl:9, shape:'beast', sprite:'mob_harpy',
           base:{hp:715,atk:110,def:13,spd:22}, skills:['e_talon','e_gust'], exp:250, gold:160,
           drops:[['w_brisa',0.05],['ether',0.35],['gale',0.2]], color:'#3a2a4a', accent:'#a8ffd0'},
  weaver: {name:'Tecelã de Nanquim',  element:'ink',  lvl:10, shape:'beast', sprite:'mob_weaver',
           base:{hp:800,atk:120,def:16,spd:17}, skills:['e_web','e_venom'], exp:280, gold:180,
           drops:[['w_umbra',0.05],['antidote',0.4],['hipot',0.2]], color:'#3a1a4a', accent:'#8a4aca'},

  echo:   {name:'O Eco do Primeiro', element:'light',    lvl:18, shape:'boss', sprite:'mob_echo', boss:true,
           base:{hp:4800,atk:105,def:24,spd:19}, poise:900,
           skills:['b_judge','b_collapse','b_feed','b_regen','b_sever'], exp:3200, gold:4000,
           drops:[['megapot',1],['phoenix',1],['hiether',1]], color:'#2a2418', accent:'#ffef9a',
           res:{darkness:1.7, light:0.5}},

  /* ================= v4.8: MATA CINDÁRIA (nv 19-24) =================
     Primeira região do pós-jogo. Tudo aqui é FOGO, e é de propósito:
     é a região que ensina que armadura com `resist` existe. Quem entra
     com o Casaco de Cinzas passa; quem entra sem, aprende. ============ */
  emberling:{name:'Brasa Errante',   element:'fire',  lvl:19, shape:'wisp', sprite:'mob_emberling',
           base:{hp:760,atk:153,def:18,spd:24}, skills:['e_cinder','e_pyre'],
           exp:520, gold:340, drops:[['t_resson',0.04],['bomb',0.45],['potion',0.3]],
           color:'#7a2a10', accent:'#ff8844', res:{ice:1.6, fire:0.4}},
  ashwolf: {name:'Lobo de Cinzas',   element:'fire',  lvl:20, shape:'beast', sprite:'mob_ashwolf',
           base:{hp:830,atk:158,def:20,spd:27}, skills:['e_bite','e_cinder','e_ashfall'],
           exp:560, gold:360, drops:[['t_corda',0.04],['m_presa',0.8],['potion',0.3]],
           color:'#4a2418', accent:'#e85a30'},
  thornling:{name:'Espinho Vivo',    element:'wind',  lvl:20, shape:'beast', sprite:'mob_thornling',
           base:{hp:800,atk:155,def:22,spd:25}, skills:['e_thornshot','e_web'],
           exp:545, gold:350, drops:[['w_grimo',0.04],['antidote',0.35],['gale',0.2]],
           color:'#2a4a20', accent:'#8aba4a', res:{fire:1.5}},
  charwood:{name:'Tronco Queimado',  element:'none',  lvl:21, shape:'golem', sprite:'mob_charwood',
           base:{hp:1000,atk:164,def:34,spd:12}, skills:['e_root','e_smash','e_guard'],
           exp:640, gold:420, drops:[['w_carvao',0.05],['m_seiva',0.45],['hipot',0.25]],
           color:'#3a2a18', accent:'#8a6a3a', res:{fire:0.5, ice:1.4, wind:1.3}},
  cindermage:{name:'Bruxo de Cinzas',element:'fire',  lvl:22, shape:'humanoid', sprite:'mob_cindermage',
           base:{hp:870,atk:169,def:24,spd:26}, skills:['e_ember','e_pyre','e_wither'],
           exp:670, gold:450, drops:[['a_coura',0.05],['hiether',0.3],['bomb',0.45]],
           color:'#5a1a10', accent:'#ffaa44', res:{fire:0.5, ink:1.4}},
  ashknight:{name:'Cavaleiro Calcinado',element:'fire',lvl:24, shape:'humanoid', sprite:'mob_ashknight',
           base:{hp:980,atk:180,def:32,spd:22}, skills:['e_rustcut','e_cinder','e_guard'],
           exp:740, gold:500, drops:[['megapot',0.2],['w_carvao',0.05]],
           color:'#5a3418', accent:'#ff9a5a', res:{fire:0.45, ice:1.5}},
  cinder:  {name:'A Chama Que Lembra',element:'fire', lvl:26, shape:'boss', sprite:'mob_cinder', boss:true,
           base:{hp:6100,atk:235,def:30,spd:24}, poise:1100,
           skills:['b_ember','b_pyreburst','b_relight','e_ashfall','e_wither'],
           exp:6000, gold:7000,
           drops:[['nectar',1],['rebirth',1],['a_casco',1]],
           color:'#3a1408', accent:'#ff9a3a', res:{ice:1.9, fire:0.35}},

  /* ================= v4.8: CISTERNA AFOGADA (nv 25-30) ==============
     Água parada: Gelo e Sangue. É a região que castiga quem só tem uma
     resposta — metade dos bichos resiste a Gelo e a outra metade cura
     em cima de você. ================================================= */
  drowned: {name:'Afogado',          element:'blood', lvl:25, shape:'humanoid', sprite:'mob_drowned',
           base:{hp:950,atk:215,def:28,spd:20}, skills:['e_grasp','e_rustcut'],
           exp:820, gold:530, drops:[['w_mare',0.04],['m_escama',0.7],['antidote',0.3]],
           color:'#28323a', accent:'#7aa0b0', res:{blood:0.5, electricity:1.6}},
  paleleech:{name:'Sanguessuga Pálida',element:'blood',lvl:25, shape:'beast', sprite:'mob_paleleech',
           base:{hp:900,atk:218,def:24,spd:29}, skills:['e_drainlf','e_venom'],
           exp:830, gold:540, drops:[['w_arco',0.04],['antidote',0.45]],
           color:'#4a2a3a', accent:'#d08aa0', res:{blood:0.5, fire:1.5}},
  tidewisp:{name:'Fátua da Maré',    element:'ice',   lvl:26, shape:'wisp', sprite:'mob_tidewisp',
           base:{hp:920,atk:220,def:22,spd:31}, skills:['e_brine','e_undertow'],
           exp:860, gold:560, drops:[['t_olho',0.04],['ether',0.4],['shard',0.25]],
           color:'#183a4a', accent:'#88ccff', res:{ice:0.4, electricity:1.7}},
  gulper:  {name:'Bocarra da Cisterna',element:'none',lvl:27, shape:'beast', sprite:'mob_gulper',
           base:{hp:1150,atk:228,def:34,spd:17}, skills:['e_gulp','e_smash'],
           exp:940, gold:610, drops:[['w_pluma2',0.04],['megapot',0.25],['hiether',0.2]],
           color:'#2a3a2a', accent:'#6a9a6a'},
  sluicewarden:{name:'Guarda da Comporta',element:'ice',lvl:28,shape:'golem', sprite:'mob_sluicewarden',
           base:{hp:1260,atk:233,def:44,spd:15}, skills:['e_smash','e_guard','e_brine'],
           exp:1000, gold:660, drops:[['hiether',0.35],['a_escama',0.05]],
           color:'#2a4450', accent:'#a0d8f0', res:{ice:0.4, electricity:1.8, fire:1.3}},
  siren:   {name:'Cantora Submersa', element:'electricity', lvl:29, shape:'humanoid', sprite:'mob_siren',
           base:{hp:1090,atk:240,def:30,spd:33}, skills:['e_song','e_spark','e_wither'],
           exp:1050, gold:700, drops:[['w_arco',0.04],['hiether',0.35],['voltflask',0.25]],
           color:'#1a3a5a', accent:'#7ae0ff', res:{electricity:0.4, ice:1.4}},
  /* O DONO DO PÂNTANO — boss da sala da comporta (v5.23).

     Substitui "O Que Ficou na Água" no mesmo lugar: o moveset entregue
     é explicitamente para o boss daquela sala, e duas criaturas
     disputando a mesma alcova seria conteúdo órfão. O antigo fica na
     tabela, sem mapa que o chame, para save velho não quebrar.

     `fases` é o que faz esta luta ser diferente das outras cinco. Cada
     fase troca o repertório, o corpo e os atributos, e a troca é
     anunciada por uma fala. Os limiares são os do documento. */
  swampking:{name:'O Dono do Pântano', element:'poison', lvl:32, shape:'boss', boss:true,
           sprite:'boss_pantano_f1',
           base:{hp:7800,atk:268,def:46,spd:24}, poise:1500,
           skills:['b_bite','b_tail','b_charge'],
           fases:[
             {ate:1.00, nome:'O Guardião', sprite:'boss_pantano_f1',
              skills:['b_bite','b_tail','b_charge'],
              mod:{def:1.35, spd:0.9}, fala:'Saia.'},
             {ate:0.70, nome:'A Água é Minha', sprite:'boss_pantano_f2',
              skills:['b_charge','b_grab','b_eyes','b_tail','b_bite'],
              mod:{def:1.15, spd:1.0}, fala:'Estas águas são minhas.'},
             {ate:0.45, nome:'Carapaça Rompida', sprite:'boss_pantano_f3',
              skills:['b_shards','b_spikes','b_bite','b_grab','b_charge'],
              mod:{def:0.78, spd:1.25}, armadura:false, fala:'Pare de destruir.'},
             {ate:0.20, nome:'O Pântano Não Morrerá Comigo', sprite:'boss_pantano_f4',
              skills:['b_fury','b_tail','b_shards','b_grab','b_charge','b_spikes'],
              mod:{def:0.7, spd:1.45}, armadura:false, desespero:true,
              fala:'NÃO TOQUE NO MEU PÂNTANO!'},
           ],
           exp:9800, gold:11500,
           drops:[['nectar',1],['rebirth',1],['a_escama',1]],
           color:'#2a3a22', accent:'#9ae44a', res:{poison:0.3, fire:1.6, electricity:1.4, ice:0.8}},

  deluge:  {name:'O Que Ficou na Água',element:'ice', lvl:32, shape:'boss', sprite:'mob_deluge', boss:true,
           base:{hp:7200,atk:265,def:38,spd:26}, poise:1450,
           skills:['b_flood','b_drown','b_gate','b_recompose','e_undertow'],
           exp:9500, gold:11000,
           drops:[['nectar',1],['rebirth',1],['a_escama',1]],
           color:'#10283a', accent:'#8ad8ff', res:{fire:1.9, ice:0.3, electricity:1.5}},

  /* ================= v4.8: COROA DE VIDRO (nv 31-38) ================
     Fim de jogo. Luz e Trevas ao mesmo tempo, e o Colosso é o primeiro
     inimigo COMUM com barra de postura — é o campo de treino antes da
     Coroa. ============================================================ */
  glasswing:{name:'Asa de Vidro',    element:'light', lvl:31, shape:'beast', sprite:'mob_glasswing',
           base:{hp:955,atk:241,def:32,spd:38}, skills:['e_glass','e_talon'],
           exp:1300, gold:860, drops:[['w_veu',0.04],['m_caco',0.55],['hiether',0.25]],
           color:'#5a5a4a', accent:'#ffffcc', res:{light:0.4, darkness:1.7}},
  crackmirror:{name:'Reflexo Rachado',element:'light',lvl:32, shape:'humanoid', sprite:'mob_crackmirror',
           base:{hp:1010,atk:248,def:36,spd:34}, skills:['e_mirror','e_glass','e_wither'],
           exp:1380, gold:900, drops:[['m_caco',0.5],['megapot',0.25],['t_espelho',0.04]],
           color:'#6a6a7a', accent:'#e8e8ff', res:{light:0.5, ink:1.4}},
  starmoth:{name:'Traça Astral',     element:'ink',   lvl:32, shape:'wisp', sprite:'mob_starmoth',
           base:{hp:970,atk:243,def:30,spd:40}, skills:['e_moth','e_gnaw'],
           exp:1360, gold:890, drops:[['w_sangria',0.03],['m_caco',0.5],['hiether',0.3]],
           color:'#1a1a3a', accent:'#8a8aff', res:{ink:0.4, light:1.5}},
  voidling:{name:'Cria do Vazio',    element:'darkness', lvl:33, shape:'wisp', sprite:'mob_voidling',
           base:{hp:1030,atk:252,def:32,spd:36}, skills:['e_void','e_nameless'],
           exp:1440, gold:940, drops:[['w_selo',0.04],['umbraflask',0.25],['hiether',0.3]],
           color:'#100a1a', accent:'#9a6aba', res:{darkness:0.4, light:1.8}},
  glasscolossus:{name:'Colosso de Vidro',element:'none',lvl:35, shape:'golem', sprite:'mob_glasscolossus',
           base:{hp:1360,atk:261,def:52,spd:16}, poise:520,
           skills:['e_stomp','e_guard','e_smash'],
           exp:1650, gold:1080, drops:[['megapot',0.35],['t_martelo',0.05]],
           color:'#4a5060', accent:'#cfe4ff', res:{electricity:0.6, wind:1.4}},
  nightblade:{name:'Lâmina Sem Nome',element:'darkness', lvl:35, shape:'humanoid', sprite:'mob_nightblade',
           base:{hp:1115,atk:270,def:38,spd:41}, skills:['e_nameless','e_claw','e_void'],
           exp:1700, gold:1120, drops:[['w_veu',0.04],['megapot',0.3]],
           color:'#180f24', accent:'#b06aea', res:{darkness:0.45, light:1.7}},
  lesserherald:{name:'Arauto Menor', element:'light', lvl:36, shape:'humanoid', sprite:'mob_lesserherald',
           base:{hp:1235,atk:275,def:46,spd:30}, skills:['e_herald','e_lance','e_guard'],
           exp:1780, gold:1160, drops:[['nectar',0.15],['w_aurora',0.04]],
           color:'#6a6450', accent:'#fff4a0', res:{light:0.35, darkness:1.9}},
  /* ================= v4.9: NINHAL DE ÉTER (nv 21-27) ================
     Região dos pets. Fica em paralelo à Mata Cindária de propósito: o
     jogador precisa de tempo de jogo COM o bicho, e desbloquear pet no
     fim do jogo seria entregar um sistema que ninguém chega a usar.
     Todo bicho daqui derruba material — é o que sustenta as missões de
     coleta, que a rodada passada não teve. */
  ninho:    {name:'Cria de Ninho',    element:'wind',  lvl:21, shape:'beast', sprite:'mob_ninho',
           base:{hp:800,atk:158,def:20,spd:26}, skills:['e_bite','e_thornshot'],
           exp:560, gold:340, drops:[['a_casco',0.04],['m_pluma',0.75],['potion',0.3]],
           color:'#3a5a4a', accent:'#a8ffd0'},
  cascudo:  {name:'Cascudo de Éter',  element:'none',  lvl:22, shape:'beast', sprite:'mob_cascudo',
           base:{hp:1050,atk:166,def:36,spd:14}, skills:['e_smash','e_guard'],
           exp:620, gold:390, drops:[['t_brasa',0.05],['m_escama',0.75],['hipot',0.25]],
           color:'#4a4030', accent:'#c8a060', res:{electricity:0.7}},
  matriz:   {name:'Matriz do Ninhal', element:'blood', lvl:24, shape:'humanoid', sprite:'mob_matriz',
           base:{hp:980,atk:180,def:24,spd:30}, skills:['e_talon','e_fury','e_gust'],
           exp:700, gold:450, drops:[['a_bruma',0.04],['m_casulo',0.6],['m_pluma',0.65]],
           color:'#5a2a3a', accent:'#e08aa0'},
  ladraninho:{name:'Ladrão de Ovos',  element:'darkness', lvl:23, shape:'humanoid', sprite:'mob_ladraninho',
           base:{hp:900,atk:174,def:22,spd:33}, skills:['e_claw','e_veil'],
           exp:660, gold:520, drops:[['w_umbra',0.05],['m_casulo',0.55],['ether',0.35]],
           color:'#2a2038', accent:'#9a6aba'},
  cornuda:  {name:'Cornuda Cindária', element:'fire',  lvl:26, shape:'beast', sprite:'mob_cornuda',
           base:{hp:1180,atk:192,def:28,spd:28}, skills:['e_cinder','e_bite','e_ashfall'],
           exp:790, gold:520, drops:[['a_veste',0.04],['m_presa',0.8],['m_seiva',0.3]],
           color:'#5a2a18', accent:'#ff8844'},
  ninhomae: {name:'A Que Choca',      element:'wind',  lvl:29, shape:'boss', sprite:'mob_ninhomae', boss:true,
           base:{hp:6400,atk:205,def:30,spd:27}, poise:1150,
           skills:['e_gust','e_talon','b_relight','e_wither','e_thornshot'],
           exp:6200, gold:6800,
           drops:[['m_casulo',1],['p_banquete',1],['nectar',1]],
           color:'#2a3a2a', accent:'#c8ffd0', res:{fire:1.6, wind:0.4}},

  crown:   {name:'A Coroa Sem Cabeça',element:'light',lvl:40, shape:'boss', sprite:'mob_crown', boss:true,
           base:{hp:7000,atk:315,def:48,spd:34}, poise:1900,
           skills:['b_crown','b_shatter','b_annul','b_recompose','b_judge','e_herald'],
           exp:16000, gold:20000,
           drops:[['nectar',1],['rebirth',1],['t_coroa',1],['a_astral',1]],
           color:'#3a3420', accent:'#fff0a0', res:{darkness:1.8, light:0.3, ink:0.7}},
  /* ================= v5.24: O ARQUIVO ESQUECIDO (nv 40-46) =========
     Pós-Coroa. Um depósito de registros que a água tomou, atrás da
     comporta do Cume. O tema é o que o capítulo inteiro vinha dizendo —
     "O Primeiro não foi selado. Foi esquecido. É pior." — virado
     bicho: aqui tudo que ataca é uma forma de registro.

     Toda criatura daqui é RECOLOR: aproveita silhueta e folha de sprite
     de quem já existe, com cor e repertório próprios. Está assumido, e
     é o que permite uma área inteira sem esperar arte. ============= */
  indice:  {name:'Índice Vivo',      element:'ink',      lvl:40, shape:'wisp', sprite:'mob_indice',
           base:{hp:1180,atk:288,def:34,spd:42}, skills:['e_rasura','e_indexar'],
           exp:1500, gold:980, drops:[['a_veste',0.04],['m_folha',0.45],['hiether',0.2]],
           color:'#1a2a5a', accent:'#5a8afa', res:{ink:0.4, light:1.5}},
  nota:    {name:'Nota de Rodapé',   element:'ink',      lvl:40, shape:'beast', sprite:'mob_nota',
           base:{hp:1250,atk:296,def:38,spd:39}, skills:['e_web','e_rasura'],
           exp:1520, gold:940, drops:[['t_martelo',0.04],['m_folha',0.5],['megapot',0.2]],
           color:'#20305a', accent:'#7aa0e8', res:{ink:0.5, fire:1.6}},
  marginalia:{name:'Marginália',     element:'darkness', lvl:41, shape:'wisp', sprite:'mob_marginalia',
           base:{hp:1210,atk:302,def:32,spd:45}, skills:['e_veil','e_citacao','e_wither'],
           exp:1580, gold:1010, drops:[['m_folha',0.4],['t_marcador',0.03]],
           color:'#2a1a44', accent:'#9a6aba', res:{darkness:0.4, light:1.7}},
  errata:  {name:'Errata',           element:'light',    lvl:42, shape:'humanoid', sprite:'mob_errata',
           base:{hp:1330,atk:314,def:40,spd:41}, skills:['e_errata','e_glass'],
           exp:1680, gold:1080, drops:[['t_marcador',0.02],['m_lacre',0.3],['hiether',0.25]],
           color:'#6a6650', accent:'#ffffcc', res:{light:0.45, darkness:1.6}},
  codice:  {name:'Códice Lacrado',   element:'none',     lvl:42, shape:'golem', sprite:'mob_codice',
           base:{hp:2050,atk:300,def:58,spd:16}, poise:900,
           skills:['e_lacrar','e_smash','e_stomp'],
           exp:1900, gold:1250, drops:[['m_lacre',0.5],['a_encader',0.04]],
           color:'#3a3020', accent:'#c8b060', res:{ink:0.6, electricity:1.4}},
  redator: {name:'O Redator',        element:'blood',    lvl:43, shape:'humanoid', sprite:'mob_redator',
           base:{hp:1520,atk:330,def:46,spd:36}, skills:['e_rustcut','e_citacao','e_fury'],
           exp:1820, gold:1160, drops:[['m_lacre',0.35],['w_verbete',0.03]],
           color:'#4a1a24', accent:'#cc3a3a', res:{blood:0.4, ink:0.8, light:1.4}},
  revisor: {name:'O Revisor Sem Olhos', element:'ink',   lvl:44, shape:'humanoid', sprite:'mob_revisor',
           base:{hp:1420,atk:344,def:38,spd:44}, skills:['e_rasura','e_citacao','e_indexar','e_nameless'],
           exp:1980, gold:1320, drops:[['w_astro',0.02],['m_folha',0.6],['m_lacre',0.3],['hiether',0.3]],
           color:'#141c3a', accent:'#5a8afa', res:{ink:0.35, fire:1.5, light:1.3}},

  /* O ARQUIVISTA — chefe da Última Prateleira.

     Segundo chefe em FASES do jogo, e de propósito: o sistema nasceu no
     Dono do Pântano e um sistema com um usuário só é um caso especial
     disfarçado de mecanismo. Três estágios aqui, contra quatro lá, e
     sem submersão — o repertório dele é apagar, indexar e reescrever.

     Os sprites são RECOLOR monocromático das variantes do pacote do
     Pântano (`assets/_arquivista.py`): a luminância remapeada numa rampa
     de nanquim, que lê como criatura feita do que foi escrito em vez de
     "o mesmo bicho pintado de azul". Placeholder assumido. */
  arquivista:{name:'O Arquivista',   element:'ink',      lvl:45, shape:'boss', boss:true,
           sprite:'boss_arquivo_f1',
           base:{hp:9400,atk:352,def:52,spd:34}, poise:1800,
           skills:['b_apagar','b_indice'],
           fases:[
             {ate:1.00, nome:'Ordem Alfabética', sprite:'boss_arquivo_f1',
              skills:['b_apagar','b_indice','e_lacrar'],
              mod:{def:1.3, spd:0.92}, fala:'Você não consta.'},
             {ate:0.62, nome:'Fora de Catálogo', sprite:'boss_arquivo_f2',
              skills:['b_indice','b_apagar','b_reescrever','e_citacao'],
              mod:{def:1.0, spd:1.15}, fala:'Então eu te escrevo. E depois te apago.'},
             {ate:0.25, nome:'Colofão', sprite:'boss_arquivo_f3',
              skills:['b_colofao','b_indice','b_apagar','e_citacao','e_errata'],
              mod:{def:0.74, spd:1.4}, armadura:false, desespero:true,
              fala:'NADA AQUI FOI LIDO. NADA AQUI SERÁ.'},
           ],
           exp:14000, gold:16000,
           drops:[['nectar',1],['t_marcador',1],['m_lacre',1]],
           color:'#141c3a', accent:'#7aa0e8',
           res:{ink:0.25, light:1.7, fire:1.4, darkness:0.7}},

  /* ============ v5.26: ARTE PRÓPRIA POR REGIÃO ======================
     Até aqui o bestiário inteiro dividia doze sprites genéricos: o Lobo
     de Éter, o Lobo de Cinzas e a Cornuda Cindária eram o MESMO lobo. As
     folhas do MOBS.zip trouxeram bicho desenhado por região, e estas 24
     criaturas entram justamente onde o recolor mais doía — quatro por
     região, com arte que só aparece ali.

     Números seguem os vizinhos de cada região, não uma tabela nova: um
     mob novo no Pátio tem que caber entre o Lobo (nv 3) e o Golem (nv
     5), senão ele deixa de ser variedade e vira parede. */

  // --- Pátio da Academia (nv 3-6) ---
  familiar:{name:'Familiar de Tinta', element:'ink',   lvl:3, shape:'beast', sprite:'mob_familiar',
           base:{hp:340,atk:30,def:7,spd:21}, skills:['e_claw','e_veil'], exp:92, gold:52,
           drops:[['t_agil',0.06],['potion',0.3],['ether',0.2]], color:'#14101f', accent:'#5a8afa'},
  homunculo:{name:'Homúnculo de Giz', element:'none',  lvl:4, shape:'humanoid', sprite:'mob_homunculo',
           base:{hp:520,atk:38,def:14,spd:9}, skills:['e_smash','e_guard'], exp:118, gold:66,
           drops:[['t_vital',0.06],['potion',0.4]], color:'#c8c4b8', accent:'#f0ece0', res:{ink:1.4}},
  livro:   {name:'Livro Vivente',     element:'ink',   lvl:5, shape:'golem', sprite:'mob_livro',
           base:{hp:600,atk:82,def:18,spd:8}, skills:['e_gnaw','e_guard'], exp:160, gold:100,
           drops:[['t_agil',0.06],['ether',0.4],['potion',0.25]], color:'#2a2038', accent:'#8a6a3a',
           res:{ink:0.6, fire:1.5}},
  vigia:   {name:'Vigia Arcano',      element:'electricity', lvl:6, shape:'wisp', sprite:'mob_vigia',
           base:{hp:430,atk:88,def:9,spd:24}, skills:['e_spark','e_veil'], exp:185, gold:130,
           drops:[['t_vital',0.06],['ether',0.45],['hipot',0.2]], color:'#102438', accent:'#8affe0',
           res:{electricity:0.5, ink:1.3}},

  // --- Subterrâneo (nv 5-7) ---
  troglodita:{name:'Troglodita Cego', element:'none',  lvl:5, shape:'humanoid', sprite:'mob_troglodita',
           base:{hp:610,atk:86,def:13,spd:13}, skills:['e_claw','e_howl'], exp:155, gold:96,
           drops:[['a_manto',0.06],['potion',0.4]], color:'#4a4238', accent:'#a09080'},
  minhoca: {name:'Minhoca de Pedra',  element:'none',  lvl:6, shape:'beast', sprite:'mob_minhoca',
           base:{hp:880,atk:92,def:26,spd:7}, skills:['e_smash','e_guard'], exp:200, gold:118,
           drops:[['a_tunica',0.06],['potion',0.35],['hipot',0.2]], color:'#585048', accent:'#9a8a70',
           res:{electricity:0.6, ice:1.3}},
  fungo:   {name:'Fungo Errante',     element:'darkness', lvl:6, shape:'golem', sprite:'mob_fungo',
           base:{hp:700,atk:90,def:16,spd:12}, skills:['e_venom','e_root'], exp:205, gold:124,
           drops:[['t_foco',0.06],['antidote',0.5],['ether',0.25]], color:'#3a2050', accent:'#b06aea',
           res:{fire:1.6, darkness:0.6}},
  escavador:{name:'Escavador Ossudo', element:'darkness', lvl:7, shape:'humanoid', sprite:'mob_escavador',
           base:{hp:660,atk:104,def:15,spd:18}, skills:['e_rustcut','e_claw'], exp:225, gold:150,
           drops:[['w_gelo',0.06],['hipot',0.25],['ether',0.3]], color:'#4a4030', accent:'#c8b878'},

  // --- Mata Cindária (nv 20-23) ---
  coruja:  {name:'Coruja de Fuligem', element:'wind',  lvl:20, shape:'beast', sprite:'mob_coruja',
           base:{hp:790,atk:156,def:19,spd:33}, skills:['e_talon','e_gust'], exp:555, gold:365,
           drops:[['t_espelho',0.04],['m_pluma',0.6],['gale',0.2]], color:'#2a2622', accent:'#b0a48a',
           res:{fire:1.4}},
  veado:   {name:'Veado de Brasa',    element:'fire',  lvl:21, shape:'beast', sprite:'mob_veado',
           base:{hp:900,atk:162,def:22,spd:29}, skills:['e_cinder','e_bite','e_ashfall'],
           exp:600, gold:390, drops:[['t_resson',0.04],['m_presa',0.7],['m_seiva',0.3]],
           color:'#3a1c12', accent:'#ff7a3a', res:{fire:0.5, ice:1.4}},
  espectro:{name:'Espectro Fumegante',element:'darkness', lvl:22, shape:'wisp', sprite:'mob_espectro',
           base:{hp:820,atk:170,def:18,spd:34}, skills:['e_wither','e_veil','e_drainlf'],
           exp:650, gold:430, drops:[['t_elo',0.05],['hiether',0.3],['antidote',0.3]],
           color:'#242028', accent:'#a09aa8', res:{darkness:0.45, light:1.7}},
  javali:  {name:'Javali Chamuscado', element:'fire',  lvl:23, shape:'beast', sprite:'mob_javali',
           base:{hp:1080,atk:176,def:30,spd:21}, skills:['e_stomp','e_cinder','e_fury'],
           exp:710, gold:470, drops:[['t_espelho',0.04],['m_presa',0.75],['megapot',0.15]],
           color:'#2e1c14', accent:'#e86a30', res:{fire:0.5, wind:1.3}},

  // --- Ninhal de Éter (nv 22-26) ---
  vespao:  {name:'Vespão de Ovos',    element:'wind',  lvl:22, shape:'beast', sprite:'mob_vespao',
           base:{hp:860,atk:168,def:20,spd:36}, skills:['e_venom','e_talon'], exp:620, gold:400,
           drops:[['w_grimo',0.04],['m_casulo',0.6],['antidote',0.4]], color:'#4a3a18', accent:'#e8c860'},
  pilhador:{name:'Corvo Pilhador',    element:'darkness', lvl:23, shape:'beast', sprite:'mob_pilhador',
           base:{hp:880,atk:172,def:21,spd:35}, skills:['e_talon','e_veil'], exp:655, gold:560,
           drops:[['w_volt',0.05],['m_pluma',0.7],['ether',0.35]], color:'#1c1828', accent:'#8a6aba'},
  larva:   {name:'Larva Real',        element:'none',  lvl:25, shape:'golem', sprite:'mob_larva',
           base:{hp:1320,atk:178,def:40,spd:9}, skills:['e_gulp','e_guard','e_smash'],
           exp:760, gold:500, drops:[['t_sino',0.04],['m_casulo',0.75],['m_escama',0.4]],
           color:'#5a5040', accent:'#e0d0a0', res:{electricity:0.7, fire:1.4}},
  matriarca:{name:'Aranha Matriarca', element:'blood', lvl:26, shape:'beast', sprite:'mob_matriarca',
           base:{hp:1200,atk:194,def:29,spd:27}, skills:['e_web','e_venom','e_drainlf'],
           exp:800, gold:530, drops:[['t_martelo',0.04],['m_casulo',0.7],['m_escama',0.45]],
           color:'#2a1830', accent:'#a05ac0', res:{blood:0.5, fire:1.4}},

  // --- Coroa de Vidro (nv 32-35) ---
  prismatico:{name:'Besouro Prismático', element:'light', lvl:32, shape:'beast', sprite:'mob_prismatico',
           base:{hp:1060,atk:246,def:40,spd:28}, skills:['e_glass','e_guard'],
           exp:1370, gold:900, drops:[['w_pluma2',0.04],['m_caco',0.6],['hipot',0.3]],
           color:'#3a3a5a', accent:'#c8a8ff', res:{light:0.45, ink:1.4}},
  estilhacado:{name:'Servo Estilhaçado', element:'ice', lvl:33, shape:'humanoid', sprite:'mob_estilhacado',
           base:{hp:1000,atk:254,def:33,spd:37}, skills:['e_glass','e_frost','e_rustcut'],
           exp:1420, gold:930, drops:[['a_escama',0.04],['m_caco',0.55],['hiether',0.3]],
           color:'#1a2a4a', accent:'#a8d8ff', res:{ice:0.45, fire:1.5}},
  harpiavidro:{name:'Harpia de Cristal', element:'ice', lvl:34, shape:'beast', sprite:'mob_harpiavidro',
           base:{hp:1050,atk:258,def:34,spd:41}, skills:['e_talon','e_gust','e_glass'],
           exp:1500, gold:980, drops:[['w_veu',0.04],['m_caco',0.55],['gale',0.25]],
           color:'#26405a', accent:'#cfe8ff', res:{ice:0.45, electricity:1.6}},
  vitrea:  {name:'Sentinela Vítrea',  element:'light', lvl:35, shape:'golem', sprite:'mob_vitrea',
           base:{hp:1420,atk:264,def:54,spd:18}, poise:540,
           skills:['e_lance','e_guard','e_glass'],
           exp:1680, gold:1100, drops:[['a_vidro',0.03],['m_caco',0.6],['megapot',0.3]],
           color:'#3a4a60', accent:'#e8f4ff', res:{light:0.4, darkness:1.7, electricity:1.4}},

  // --- Cisterna (nv 25-28) ---
  geleia:  {name:'Geleia Pluvial',    element:'ice',   lvl:25, shape:'wisp', sprite:'mob_geleia',
           base:{hp:940,atk:214,def:20,spd:30}, skills:['e_brine','e_undertow'],
           exp:840, gold:545, drops:[['w_cinza',0.04],['ether',0.45],['antidote',0.3]],
           color:'#153a4a', accent:'#7ae0ff', res:{ice:0.45, electricity:1.8}},
  racano:  {name:'Rã de Cano',        element:'none',  lvl:26, shape:'beast', sprite:'mob_racano',
           base:{hp:1080,atk:222,def:30,spd:24}, skills:['e_gulp','e_venom'],
           exp:880, gold:575, drops:[['w_selo',0.04],['antidote',0.45],['hipot',0.3]],
           color:'#2a3a22', accent:'#8aba4a'},
  espirito:{name:'Espírito da Água Estagnada', element:'darkness', lvl:27, shape:'wisp', sprite:'mob_espirito',
           base:{hp:1000,atk:230,def:24,spd:34}, skills:['e_drainlf','e_wither','e_brine'],
           exp:950, gold:620, drops:[['a_escama',0.04],['hiether',0.35],['umbraflask',0.15]],
           color:'#123a38', accent:'#7affd8', res:{darkness:0.5, light:1.7}},
  caranguejo:{name:'Caranguejo de Ferro', element:'none', lvl:28, shape:'golem', sprite:'mob_caranguejo',
           base:{hp:1400,atk:236,def:50,spd:14}, poise:480,
           skills:['e_smash','e_guard','e_stomp'],
           exp:1010, gold:670, drops:[['w_mare',0.04],['megapot',0.3],['hiether',0.25]],
           color:'#3a3428', accent:'#b09060', res:{electricity:0.6, ice:1.3}},

  /* ============ v5.28: AS QUATRO REGIÕES QUE FALTAVAM ===============
     O pacote de arte trouxe dez regiões; seis já existiam. Estas quatro
     entraram para dar casa às outras, e o lugar delas na curva não é
     decoração — são exatamente os VÃOS que o jogo tinha:

       Esgoto    nv  8-11   entre o Subterrâneo (7) e a Galeria (12)
       Lago      nv 14-18   entre a Galeria (13) e a Mata (19)
       Podridão  nv 19-23   rota paralela à Mata, mesma faixa
       Deserto   nv 37-40   entre a Coroa (36) e o Arquivo (41)

     Os números saem de interpolar os vizinhos de cada vão, não de uma
     tabela nova: um mob de nv 9 tem que caber entre o Aprendiz
     Deformado (7) e o Oco Faminto (12), senão vira parede. ========== */

  // --- Galerias de Esgoto (nv 8-11) ---
  mosca:   {name:'Mosca de Dreno',    element:'poison', lvl:8,  shape:'beast', sprite:'mob_mosca',
           base:{hp:640,atk:105,def:12,spd:24}, skills:['e_venom','e_talon'],
           exp:230, gold:140, drops:[['t_pluma',0.05],['antidote',0.5],['m_valvula',0.35]],
           color:'#3a4a20', accent:'#9ae44a', res:{poison:0.5}},
  ra_imunda:{name:'Rã Imunda',        element:'poison', lvl:9,  shape:'beast', sprite:'mob_ra_imunda',
           base:{hp:790,atk:112,def:18,spd:14}, skills:['e_gulp','e_venom'],
           exp:255, gold:158, drops:[['w_volt',0.05],['potion',0.4],['m_valvula',0.4]],
           color:'#2a4a2a', accent:'#8aba4a'},
  limo:    {name:'Limo Tóxico',       element:'poison', lvl:10, shape:'wisp', sprite:'mob_limo',
           base:{hp:700,atk:118,def:14,spd:12}, skills:['e_venom','e_wither'],
           exp:280, gold:172, drops:[['w_brasa',0.05],['antidote',0.55],['ether',0.3]],
           color:'#4a5a10', accent:'#c8e07a', res:{poison:0.4, fire:1.5}},
  coletor: {name:'Coletor Mutante',   element:'blood',  lvl:11, shape:'golem', sprite:'mob_coletor',
           base:{hp:1000,atk:128,def:26,spd:10}, poise:320,
           skills:['e_smash','e_guard','e_drainlf'],
           exp:330, gold:215, drops:[['w_tinta',0.06],['hipot',0.35],['m_valvula',0.5]],
           color:'#4a3a28', accent:'#b09060', res:{poison:0.5, electricity:1.4}},

  // --- Lago Afogado (nv 14-18) ---
  garca:   {name:'Garça Sombria',     element:'darkness', lvl:14, shape:'beast', sprite:'mob_garca',
           base:{hp:820,atk:152,def:16,spd:32}, skills:['e_talon','e_veil'],
           exp:420, gold:280, drops:[['a_coura',0.05],['m_pluma',0.5],['ether',0.3]],
           color:'#241c34', accent:'#8a6aba'},
  naiade:  {name:'Náiade Afogada',    element:'ice',    lvl:15, shape:'humanoid', sprite:'mob_naiade',
           base:{hp:880,atk:156,def:18,spd:26}, skills:['e_brine','e_song','e_undertow'],
           exp:460, gold:310, drops:[['t_brasa',0.05],['m_junco',0.45],['hiether',0.25]],
           color:'#1a4a4a', accent:'#7ae0d0', res:{ice:0.45, electricity:1.7}},
  sapo_lotus:{name:'Sapo de Lótus',   element:'earth',  lvl:16, shape:'golem', sprite:'mob_sapo_lotus',
           base:{hp:1060,atk:158,def:32,spd:12}, skills:['e_gulp','e_root','e_guard'],
           exp:510, gold:340, drops:[['w_carvao',0.05],['m_junco',0.5],['hipot',0.3]],
           color:'#2a4a28', accent:'#e8a0c8', res:{earth:0.5, wind:1.4}},
  serpente_lago:{name:'Serpente Lacustre', element:'ice', lvl:18, shape:'beast', sprite:'mob_serpente_lago',
           base:{hp:1160,atk:168,def:26,spd:25}, poise:360,
           skills:['e_bite','e_undertow','e_brine'],
           exp:600, gold:400, drops:[['a_casco',0.04],['m_junco',0.55],['m_escama',0.35]],
           color:'#1a3a34', accent:'#5aba9a', res:{ice:0.5, fire:1.4}},

  // --- Baixios da Podridão (nv 19-23) ---
  rato_peste:{name:'Rato Pestilento', element:'poison', lvl:19, shape:'beast', sprite:'mob_rato_peste',
           base:{hp:770,atk:153,def:16,spd:31}, skills:['e_bite','e_venom'],
           exp:530, gold:345, drops:[['w_brasa',0.05],['m_esporo',0.5],['antidote',0.4]],
           color:'#3a2a24', accent:'#a08a5a', res:{poison:0.45}},
  lesma:   {name:'Lesma de Mofo',     element:'poison', lvl:20, shape:'wisp', sprite:'mob_lesma',
           base:{hp:910,atk:157,def:28,spd:8}, skills:['e_venom','e_wither','e_guard'],
           exp:570, gold:370, drops:[['a_bruma',0.04],['m_esporo',0.6],['panacea',0.15]],
           color:'#4a5a20', accent:'#c8e07a', res:{poison:0.35, ice:1.5}},
  carnical:{name:'Carniçal Putrefacto',element:'blood', lvl:21, shape:'humanoid', sprite:'mob_carnical',
           base:{hp:960,atk:168,def:22,spd:19}, skills:['e_claw','e_drainlf','e_fury'],
           exp:625, gold:410, drops:[['t_corda',0.04],['m_esporo',0.45],['hipot',0.3]],
           color:'#4a2028', accent:'#c07a6a', res:{blood:0.45, light:1.6}},
  ent_podre:{name:'Ent Podre',        element:'earth',  lvl:23, shape:'golem', sprite:'mob_ent_podre',
           base:{hp:1140,atk:176,def:38,spd:9}, poise:420,
           skills:['e_root','e_smash','e_venom'],
           exp:715, gold:470, drops:[['w_brisa',0.05],['m_esporo',0.65],['m_seiva',0.35]],
           color:'#33301c', accent:'#8a9a4a', res:{earth:0.5, fire:1.5, poison:0.6}},

  // --- Deserto de Vidro Moído (nv 37-40) ---
  chacal:  {name:'Chacal das Dunas',  element:'wind',   lvl:37, shape:'beast', sprite:'mob_chacal',
           base:{hp:1100,atk:278,def:32,spd:47}, skills:['e_bite','e_gust','e_talon'],
           exp:1840, gold:1200, drops:[['w_aurora',0.03],['m_carapaca',0.4],['megapot',0.3]],
           color:'#5a4a30', accent:'#e0c890'},
  escaravelho:{name:'Escaravelho Solar',element:'light',lvl:38, shape:'golem', sprite:'mob_escaravelho',
           base:{hp:1420,atk:282,def:54,spd:18}, poise:600,
           skills:['e_stomp','e_guard','e_lance'],
           exp:1980, gold:1300, drops:[['w_sangria',0.03],['m_carapaca',0.6],['hiether',0.3]],
           color:'#6a5a20', accent:'#ffe44a', res:{light:0.4, darkness:1.7}},
  mumia:   {name:'Múmia Errante',     element:'darkness', lvl:39, shape:'humanoid', sprite:'mob_mumia',
           base:{hp:1240,atk:288,def:40,spd:26}, skills:['e_wither','e_grasp','e_nameless'],
           exp:2050, gold:1340, drops:[['a_vidro',0.03],['m_carapaca',0.45],['umbraflask',0.2]],
           color:'#4a4030', accent:'#c8b878', res:{darkness:0.45, fire:1.6, light:1.4}},
  salamandra_areia:{name:'Salamandra Arenosa', element:'fire', lvl:40, shape:'beast', sprite:'mob_salamandra_areia',
           base:{hp:1330,atk:294,def:44,spd:34}, poise:520,
           skills:['e_cinder','e_bite','e_ashfall'],
           exp:2160, gold:1420, drops:[['w_aurora',0.03],['m_carapaca',0.5],['nectar',0.12]],
           color:'#6a4a18', accent:'#ffb04a', res:{fire:0.4, ice:1.6}},

  /* ================= Vharok, a Alcateia do Vazio ====================
     Chefe da Tumba de Cristal Fosco (`deserto_fundo`). Nível 42: entre
     o topo do Deserto (salamandra_areia, 40 — igual à Coroa) e o
     Arquivista (45), a mesma posição que todo chefe de masmorra
     profunda ocupa acima da região que o cerca.

     Design original em `ALCATEIA_DO_VAZIO.md` — ver comentário grande
     junto das habilidades `b_watch`/`b_lonebite`/`b_circle`/`b_mark`/
     `b_finalcharge` em data/04-skills.js para o que foi e o que não foi
     traduzido do combate em tempo real para o motor por turno. Poise
     mais baixo que Crown/Arquivista (é o chefe mais rápido do jogo,
     não o mais resistente); resistente ao próprio elemento, fraco à
     Luz — a mesma luz que o design descreve removendo a Marca. */
  vharok: {name:'Vharok, a Alcateia do Vazio', element:'darkness', lvl:42, shape:'beast',
           sprite:'boss_vharok_f1', retrato:'boss_vharok_retrato_calmo', boss:true,
           base:{hp:7900, atk:335, def:44, spd:40}, poise:1750,
           skills:['b_watch','b_lonebite','b_circle','b_mark'],
           fases:[
             {ate:1.00, nome:'À Espreita', sprite:'boss_vharok_f1',
              skills:['b_watch','b_circle'],
              mod:{spd:0.9}, fala:'Corra.'},
             {ate:0.80, nome:'Sumiço Sombrio', sprite:'boss_vharok_f2',
              skills:['b_watch','b_lonebite','b_circle'],
              mod:{spd:1.0}, fala:'Agora você vale a caça.'},
             {ate:0.60, nome:'Caçador Adaptativo', sprite:'boss_vharok_f3',
              skills:['b_mark','b_circle','b_lonebite','b_watch'],
              mod:{def:0.95, spd:1.1}, fala:'Eu vi o seu padrão.'},
             {ate:0.40, nome:'Fúria Crescente', sprite:'boss_vharok_f4',
              skills:['b_lonebite','b_mark','b_circle','b_watch'],
              mod:{atk:1.2, spd:1.25}, armadura:false, fala:'Mais rápido. Ou morra.'},
             {ate:0.20, nome:'Caçada Final', sprite:'boss_vharok_f5',
              skills:['b_finalcharge','b_lonebite','b_mark'],
              mod:{def:0.65, spd:1.5}, armadura:false, desespero:true,
              fala:'Chega de sombras. Eu mesmo o alcançarei.'},
           ],
           exp:15000, gold:17000,
           drops:[['nectar',1],['rebirth',1],['t_presa',1]],
           color:'#171522', accent:'#b96bff',
           res:{darkness:0.3, light:1.8}},

  /* Elijah Corrompido (v5.32) — chefe secreto opcional, só depois de
     vharok_defeated (ver Elijah em world/12-maps.js, undercroft).
     `elijah_sheet`/`elijah_corrompido_sheet` são folhas de CAMPO (grade
     3×4 direcional, formato de personagem/NPC) — Elijah as usa andando
     no mundo nas duas formas, antes e depois da corrupção. Nenhuma das
     duas serve pra retrato de combate (formato incompatível com o resto
     do bestiário, que usa arte de monstro dedicada); a luta reaproveita
     `mob_shade` de propósito, não por falta de arte — é a revelação: a
     corrupção dele sempre teve a mesma cara de toda Sombra Corrompida
     que o jogador já derrotou o jogo inteiro. */
  elijah_corrompido:{name:'Elijah, o Que Vazou', element:'darkness', lvl:44, shape:'humanoid',
           sprite:'mob_shade', boss:true,
           base:{hp:11000, atk:380, def:52, spd:42}, poise:2200,
           skills:['el_fragmento','el_colapso','el_dreno_final'],
           exp:22000, gold:25000,
           drops:[['a_astral',1],['t_coroa',1],['rebirth',1],['elixir',1]],
           color:'#0c0a16', accent:'#6a2aea',
           res:{darkness:0.25, light:1.6}},

};

/* --- Formações de encontro por região ----------------------------- */
