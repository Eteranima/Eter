const SLOTS = {weapon:'Arma', armor:'Armadura', accessory:'Talismã'};
/* Rótulos dos bônus de equipamento nas telas. Os dois últimos são da
   v4.8 e não são atributos de ficha: mexem em MECÂNICA (custo da
   Conjunta e dano de Postura), então precisam de nome legível. */
const STAT_LABEL = {hp:'HP', mp:'MP', atk:'ATK', def:'DEF', spd:'SPD',
                    combo:'CONJ.MP', poiseUp:'POSTURA'};

const ITEMS = {
  // --- consumíveis ---
  potion:  {kind:'consumable', name:'Poção',            desc:'Restaura 60 HP de um aliado.',        use:'ally',   hp:60,  price:60,  icon:'icon_pocao', color:'#5aba5a'},
  hipot:   {kind:'consumable', name:'Poção Maior',      desc:'Restaura 180 HP de um aliado.',       use:'ally',   hp:180, price:220, icon:'icon_pocao_grande', color:'#5aba5a'},
  megapot: {kind:'consumable', name:'Poção Suprema',    desc:'Restaura 420 HP de um aliado.',       use:'ally',   hp:420, price:600, color:'#7ada7a'},
  ether:   {kind:'consumable', name:'Elixir de Éter',   desc:'Restaura 30 MP de um aliado.',        use:'ally',   mp:30,  price:120, icon:'icon_eter', color:'#5a8afa'},
  hiether: {kind:'consumable', name:'Éter Destilado',   desc:'Restaura 90 MP de um aliado.',        use:'ally',   mp:90,  price:420, color:'#8ab0fa'},
  antidote:{kind:'consumable', name:'Sal Purificador',  desc:'Remove todas as condições.',          use:'ally',   cure:true, price:80, icon:'icon_sal', color:'#dad0a0'},
  phoenix: {kind:'consumable', name:'Pena de Ressurgir',desc:'Revive um aliado com 50% do HP.',     use:'fallen', revive:0.5, price:400, icon:'icon_fenix', color:'#eaca3a'},
  bomb:    {kind:'consumable', name:'Frasco Ígneo',     desc:'Causa 120 de dano de Fogo a um inimigo.', use:'enemy', power:120, elem:'fire', price:150, icon:'icon_bomba', color:'#e85a30'},
  shard:   {kind:'consumable', name:'Estilhaço Polar',  desc:'Causa 120 de dano de Gelo a um inimigo.', use:'enemy', power:120, elem:'ice',  price:150, color:'#5aaaea'},
  tent:    {kind:'consumable', name:'Tenda de Campo',   desc:'Restaura HP/MP da party (só no campo).', use:'field', full:true, price:300, icon:'icon_tenda', color:'#b0a080'},
  elixir:  {kind:'consumable', name:'Elixir Perfeito',  desc:'Restaura TODO o HP e MP de um aliado.', use:'ally', hp:9999, mp:9999, price:900, color:'#ffe44a'},
  gale:    {kind:'consumable', name:'Frasco de Vendaval',desc:'Causa 120 de dano de Vento a um inimigo.', use:'enemy', power:120, elem:'wind', price:150, color:'#a8ffd0'},

  /* --- v4.8: consumíveis de EFEITO, não só de número ---------------
     A bolsa antiga resolvia uma pergunta só ("quanto de HP falta?").
     Estes resolvem perguntas de combate: abrir a postura de um chefe,
     comprar um turno de ATK, tirar todo mundo do chão de uma vez,
     sair de uma luta que deu errado. `use` novo:
       'party'   → o grupo inteiro, sem escolher alvo
       'enemies' → todos os inimigos vivos
       'escape'  → fuga garantida (só em combate)  */
  medkit:  {kind:'consumable', name:'Bandagem Rúnica',  desc:'Restaura 45% do HP máximo de um aliado.', use:'ally', hpPct:0.45, price:300, icon:'icon_bandagem', color:'#7ada7a'},
  dew:     {kind:'consumable', name:'Orvalho Engarrafado', desc:'Restaura 140 HP de TODO o grupo.',    use:'party', hp:140, price:520, color:'#5aba9a'},
  panacea: {kind:'consumable', name:'Panaceia',         desc:'Remove todas as condições do grupo.',    use:'party', cure:true, price:260, color:'#dad0a0'},
  rebirth: {kind:'consumable', name:'Cinza de Fênix',   desc:'Revive TODOS os caídos com 40% do HP.',  use:'party', revive:0.4, price:1500, color:'#ffb04a'},
  focustea:{kind:'consumable', name:'Chá de Foco',      desc:'Enche 40% da Ressonância de um aliado.', use:'ally', reso:40, price:380, icon:'icon_cha', color:'#b89aff'},
  warcry:  {kind:'consumable', name:'Tônico de Fúria',  desc:'ATK do alvo +45% por 3 turnos.',         use:'ally', buff:{atk:1.45, turns:3}, price:320, color:'#e05a5a'},
  aegis:   {kind:'consumable', name:'Óleo de Escudo',   desc:'DEF do alvo +60% por 3 turnos.',         use:'ally', buff:{def:1.6, turns:3},  price:320, icon:'icon_oleo', color:'#8ab0fa'},
  swift:   {kind:'consumable', name:'Essência Veloz',   desc:'SPD do alvo +50% por 3 turnos.',         use:'ally', buff:{spd:1.5, turns:3},  price:300, color:'#a8ffd0'},
  ironspike:{kind:'consumable',name:'Cravo de Ferro',   desc:'60 de dano e 240 de POSTURA num inimigo.', use:'enemy', power:60, elem:'none', poiseHit:240, price:420, color:'#ffd24a'},
  smoke:   {kind:'consumable', name:'Fumaça Cinzenta',  desc:'Fuga garantida (não funciona contra chefe).', use:'escape', price:90, icon:'icon_fumaca', color:'#8a8a9a'},
  voltflask:{kind:'consumable',name:'Frasco Voltaico',  desc:'120 de dano de Eletricidade a um inimigo.', use:'enemy', power:120, elem:'electricity', price:150, color:'#ffe44a'},
  inkflask:{kind:'consumable', name:'Frasco de Nanquim',desc:'120 de dano de Tinta. Pode cegar.',      use:'enemy', power:120, elem:'ink', status:{id:'blind',chance:0.5}, price:180, color:'#5a8afa'},
  umbraflask:{kind:'consumable',name:'Frasco Umbral',   desc:'120 de dano de Trevas. Pode apavorar.',  use:'enemy', power:120, elem:'darkness', status:{id:'dread',chance:0.5}, price:180, color:'#9a6aba'},
  sunflask:{kind:'consumable', name:'Frasco Solar',     desc:'130 de dano de Luz. Pode atordoar.',     use:'enemy', power:130, elem:'light', status:{id:'stun',chance:0.3}, price:210, color:'#ffff88'},
  bloodflask:{kind:'consumable',name:'Frasco Escarlate',desc:'120 de dano de Sangue. Pode sangrar.',   use:'enemy', power:120, elem:'blood', status:{id:'bleed',chance:0.5}, price:180, color:'#cc3a3a'},
  bigbomb: {kind:'consumable', name:'Carga Cindária',   desc:'200 de dano de Fogo em TODOS os inimigos.', use:'enemies', power:200, elem:'fire', price:700, color:'#ff8844'},
  nectar:  {kind:'consumable', name:'Néctar do Mundo',  desc:'Restaura TODO o HP e MP do grupo.',      use:'party', hp:9999, mp:9999, price:2400, color:'#ffe44a'},
  stone:   {kind:'consumable', name:'Pedra de Retorno', desc:'Volta ao Pátio Central (só no campo).',  use:'field', warp:{map:'patio', x:19, y:13, dir:'down'}, price:240, color:'#b89aff'},

  /* --- v4.9: MATERIAIS ----------------------------------------------
     `kind:'material'` não se usa: cai da criatura, ocupa a bolsa e serve
     de moeda de missão. Existe porque as missões da v4.8 viraram todas
     "mate N bichos" — com material dropado, "traga N garras" é uma
     missão de COLETA que depende de matar, mas com sorte no meio, o que
     dá textura diferente. Vendem-se por pouco: é lixo com dono. */
  m_presa:  {kind:'material', name:'Presa Cindária',   desc:'Dente de lobo de cinzas, ainda morno.',            price:60,  icon:'icon_material_presa', color:'#e85a30'},
  m_seiva:  {kind:'material', name:'Seiva Calcinada',  desc:'Resina preta que escorre de tronco queimado.',     price:80,  icon:'icon_material_seiva', color:'#8a6a3a'},
  m_escama: {kind:'material', name:'Escama Afogada',   desc:'Placa fria arrancada de algo que vivia na água.',  price:110, icon:'icon_material_escama', color:'#5aaaea'},
  m_caco:   {kind:'material', name:'Caco Cantante',    desc:'Lasca de vidro da Coroa. Zumbe quando encostada.', price:150, icon:'icon_material_caco', color:'#e8e8ff'},
  m_pluma:  {kind:'material', name:'Pluma de Éter',    desc:'Pena que não cai — fica parada no ar.',            price:130, color:'#a8ffd0'},
  m_casulo: {kind:'material', name:'Casulo Morno',     desc:'Alguma coisa se mexe lá dentro. Devagar.',         price:200, color:'#d0b060'},

  /* --- v4.9: PETISCOS (dão EXP de pet) ------------------------------ */
  p_racao:  {kind:'consumable', name:'Ração de Ninho', desc:'Dá 120 de EXP ao pet ativo.',  use:'pet', petExp:120,  price:180, icon:'icon_racao', color:'#c8a060'},
  p_bolo:   {kind:'consumable', name:'Bolo de Éter',   desc:'Dá 400 de EXP ao pet ativo.',  use:'pet', petExp:400,  price:520, color:'#e0b070'},
  p_banquete:{kind:'consumable',name:'Banquete do Ninhal', desc:'Dá 1200 de EXP ao pet ativo.', use:'pet', petExp:1200, price:1400, color:'#ffd24a'},

  // --- armas (o elemento passa para o ataque básico) ---
  w_treino:{kind:'equip', name:'Lâmina de Treino',  slot:'weapon', icon:'icon_sword', equip:{atk:5},                      price:120, color:'#9a9aa8',
            desc:'Aço da academia. Sem graça, mas corta.'},
  w_tinta: {kind:'equip', name:'Estilete de Nanquim',slot:'weapon', icon:'icon_sword_red',equip:{atk:9, elem:'ink'},          price:380, color:'#5a8afa',
            desc:'Ataque básico passa a ser de Tinta.'},
  w_gelo:  {kind:'equip', name:'Foice de Geada',    slot:'weapon', icon:'icon_axe', equip:{atk:9, elem:'ice'},          price:380, color:'#88ccff',
            desc:'Ataque básico passa a ser de Gelo.'},
  w_brasa: {kind:'equip', name:'Punho de Brasa',    slot:'weapon', icon:'icon_shuriken', equip:{atk:12, elem:'fire'},        price:560, color:'#ff8844',
            desc:'Ataque básico passa a ser de Fogo.'},
  w_umbra: {kind:'equip', name:'Adaga Umbral',      slot:'weapon', icon:'icon_sword_red', equip:{atk:11, spd:3, elem:'darkness'}, price:540, color:'#9a6aba',
            desc:'Leve e cruel. Ataque básico de Trevas.'},
  w_volt:  {kind:'equip', name:'Bastão Voltaico',   slot:'weapon', icon:'icon_staff', equip:{atk:11, elem:'electricity'}, price:520, color:'#ffe44a',
            desc:'Ataque básico passa a ser de Eletricidade.'},
  w_brisa: {kind:'equip', name:'Leque de Brisa',    slot:'weapon', icon:'icon_shuriken', equip:{atk:10, spd:2, elem:'wind'}, price:500, color:'#a8ffd0',
            desc:'Leve como quem não quer bater. Ataque básico de Vento.'},
  w_selo:  {kind:'equip', name:'Lâmina do Selo',    slot:'weapon', icon:'icon_sword', equip:{atk:18, spd:2, elem:'light'},price:1600, color:'#ffff88',
            desc:'Forjada do que restou do Selo. Ataque básico de Luz.'},

  // --- v4.8: armas das três regiões novas ---
  w_carvao:{kind:'equip', name:'Machado de Carvão', slot:'weapon', icon:'icon_axe', equip:{atk:15, def:2, elem:'fire'}, price:820, color:'#e85a30',
            desc:'Pesado e quente. Ataque básico de Fogo.'},
  w_grimo: {kind:'equip', name:'Grimório Vivo',     slot:'weapon', icon:'icon_book', equip:{atk:14, mp:30, elem:'ink'},  price:1120, color:'#5a8afa',
            desc:'Ele vira as próprias páginas. Ataque básico de Tinta.'},
  w_mare:  {kind:'equip', name:'Tridente da Cisterna',slot:'weapon', icon:'icon_spear',equip:{atk:17, def:3, elem:'ice'}, price:1240, color:'#88ccff',
            desc:'Trazido da água parada. Ataque básico de Gelo.'},
  w_arco:  {kind:'equip', name:'Arco de Corrente',  slot:'weapon', icon:'icon_bow', equip:{atk:16, spd:4, elem:'electricity'}, price:1280, color:'#ffe44a',
            desc:'A corda é um fio vivo. Ataque básico de Eletricidade.'},
  w_cinza: {kind:'equip', name:'Lança Cindária',    slot:'weapon', icon:'icon_spear_red', equip:{atk:21, spd:1, elem:'fire'}, price:1450, color:'#ff8844',
            desc:'Da mata que ninguém apagou. Ataque básico de Fogo.'},
  w_pluma2:{kind:'equip', name:'Alabarda de Pluma', slot:'weapon', icon:'icon_spear', equip:{atk:19, spd:5, elem:'wind'}, price:1620, color:'#a8ffd0',
            desc:'Longa e quase sem peso. Ataque básico de Vento.'},
  w_veu:   {kind:'equip', name:'Foice do Véu',      slot:'weapon', icon:'icon_axe', equip:{atk:22, spd:3, elem:'darkness'}, price:1780, color:'#9a6aba',
            desc:'Corta antes de aparecer. Ataque básico de Trevas.'},
  w_sangria:{kind:'equip',name:'Kris Escarlate',    slot:'weapon', icon:'icon_sword_red', equip:{atk:24, elem:'blood'},       price:2100, color:'#cc3a3a',
            desc:'Bebe primeiro, pergunta depois. Ataque básico de Sangue.'},
  w_aurora:{kind:'equip', name:'Alabarda Aurora',   slot:'weapon', icon:'icon_spear', equip:{atk:27, spd:2, elem:'light'},price:3300, color:'#ffff88',
            desc:'Recolhida na Coroa de Vidro. Ataque básico de Luz.'},
  w_astro: {kind:'equip', name:'Estilete Astral',   slot:'weapon', icon:'icon_sword_red', equip:{atk:31, spd:5, mp:20, elem:'ink'}, price:4600, color:'#b89aff',
            desc:'Escreve no ar e o ar obedece. Ataque básico de Tinta.'},

  // --- armaduras ---
  a_tunica:{kind:'equip', name:'Túnica de Aluno',   slot:'armor', equip:{def:4, hp:15},   price:100, color:'#8a8a9a',
            desc:'Uniforme reforçado.'},
  a_manto: {kind:'equip', name:'Manto Reforçado',   slot:'armor', equip:{def:8, hp:40},   price:320, color:'#7a6a8a',
            desc:'Tecido tratado com éter.'},
  a_coura: {kind:'equip', name:'Couraça Selada',    slot:'armor', equip:{def:14, hp:80, spd:-2}, price:720, color:'#b0a080',
            desc:'Pesada. Protege como uma parede.'},
  a_veste: {kind:'equip', name:'Veste do Abismo',   slot:'armor', equip:{def:18, hp:120, mp:20}, price:1500, color:'#6a3a8a',
            desc:'Tecida no escuro que sobrou.'},

  /* --- v4.8: armaduras com RESISTÊNCIA ELEMENTAL -------------------
     `resist` multiplica o dano daquele elemento. Duas peças com 0,8
     contra Fogo dão 0,64 (ver `gearResist`). É o que finalmente deixa
     o jogador RESPONDER ao anel elemental em vez de só sofrer com ele:
     entrar na Mata Cindária com o casaco certo é uma decisão. */
  a_casco: {kind:'equip', name:'Casaco de Cinzas',  slot:'armor', equip:{def:11, hp:60, resist:{fire:0.7}}, price:900, color:'#a06a4a',
            desc:'Curtido em cinza quente. Segura Fogo (−30%).'},
  a_bruma: {kind:'equip', name:'Manto de Bruma',    slot:'armor', equip:{def:12, hp:50, spd:4, resist:{wind:0.7}}, price:1200, color:'#a8ffd0',
            desc:'Leve e escorregadio. Segura Vento (−30%).'},
  a_escama:{kind:'equip', name:'Escama de Cisterna',slot:'armor', equip:{def:16, hp:95, resist:{ice:0.7, electricity:0.8}}, price:1700, color:'#5aaaea',
            desc:'Da água parada. Segura Gelo (−30%) e Eletricidade (−20%).'},
  a_vidro: {kind:'equip', name:'Cota de Vidro',     slot:'armor', equip:{def:20, hp:110, mp:25, resist:{light:0.7, darkness:0.8}}, price:2700, color:'#e8e8ff',
            desc:'Ela racha e continua inteira. Segura Luz (−30%) e Trevas (−20%).'},
  a_astral:{kind:'equip', name:'Paramento Astral',  slot:'armor', equip:{def:25, hp:165, mp:40, spd:-2, resist:{light:0.75, darkness:0.75, ink:0.85}}, price:4900, color:'#b89aff',
            desc:'A última peça da Coroa. Segura Luz, Trevas e Tinta.'},

  // --- talismãs ---
  t_foco:  {kind:'equip', name:'Anel de Foco',      slot:'accessory', equip:{mp:25},         price:220, color:'#5a8afa',
            desc:'Amplia a reserva de éter.'},
  t_agil:  {kind:'equip', name:'Broche Ágil',       slot:'accessory', equip:{spd:5},         price:260, color:'#7ada7a',
            desc:'Você age mais cedo na ordem de turno.'},
  t_vital: {kind:'equip', name:'Amuleto Vital',     slot:'accessory', equip:{hp:70},         price:340, color:'#5aba5a',
            desc:'O corpo aguenta mais.'},
  t_resson:{kind:'equip', name:'Selo Ressonante',   slot:'accessory', equip:{mp:20, atk:5},  price:900, color:'#b89aff',
            desc:'Recompensa da Profa. Lina. Zumbe junto do peito.'},
  t_pluma: {kind:'equip', name:'Pluma de Vento',    slot:'accessory', equip:{spd:8, def:-2}, price:480, color:'#a8ffd0',
            desc:'Age muito antes. Protege muito menos.'},
  t_elo:   {kind:'equip', name:'Elo de Grupo',      slot:'accessory', equip:{hp:40, mp:15, def:3}, price:700, color:'#8ab0fa',
            desc:'Feito para grupo cheio: quanto mais gente em campo, mais vale o que segura todo mundo de pé.'},

  /* --- v4.8: talismãs que mexem nas MECÂNICAS NOVAS ----------------
     `combo` desconta o custo de MP da Habilidade Conjunta (por pessoa)
     e `poiseUp` amplia o dano de POSTURA de quem está com a peça.
     São os dois únicos bônus do jogo que não são um número de ficha —
     existem para que a build responda às mecânicas, e não só à tabela. */
  t_brasa: {kind:'equip', name:'Anel de Brasa',     slot:'accessory', equip:{atk:8, resist:{ice:0.75}}, price:720, color:'#ff8844',
            desc:'Quente o bastante para o gelo pensar duas vezes.'},
  t_corda: {kind:'equip', name:'Corda de Prata',    slot:'accessory', equip:{hp:60, mp:30}, price:920, color:'#d0d0e8',
            desc:'Amarra o éter ao corpo. Simples e eficiente.'},
  t_espelho:{kind:'equip',name:'Espelho Trincado',  slot:'accessory', equip:{def:6, resist:{light:0.7, darkness:0.7}}, price:1150, color:'#c8c8ff',
            desc:'Devolve metade do que tentaram te mostrar.'},
  t_sino:  {kind:'equip', name:'Sino de Sintonia',  slot:'accessory', equip:{mp:40, atk:5, combo:-5}, price:1350, color:'#b89aff',
            desc:'Habilidade Conjunta custa 5 MP a menos para quem usa.'},
  t_martelo:{kind:'equip',name:'Martelo de Bolso',  slot:'accessory', equip:{atk:6, poiseUp:0.35}, price:1500, color:'#ffd24a',
            desc:'Dano de POSTURA +35%. Feito para quebrar chefe, não para matar.'},
  t_olho:  {kind:'equip', name:'Olho de Vidro',     slot:'accessory', equip:{spd:7, atk:6}, price:1450, color:'#8affe0',
            desc:'Você vê o golpe antes de ele sair.'},
  t_coroa: {kind:'equip', name:'Coroa Menor',       slot:'accessory', equip:{hp:90, mp:45, atk:8, def:6, spd:4}, price:5400, color:'#ffe44a',
            desc:'O que restou de quem mandava aqui. Serve em qualquer cabeça.'},
  /* Drop de Vharok, a Alcateia do Vazio (Tumba de Cristal Fosco). Acessório
     de velocidade porque ele é o chefe mais rápido do jogo — a mesma ideia
     que o define em combate. */
  t_presa: {kind:'equip', name:'Presa do Vazio',    slot:'accessory', equip:{spd:8, atk:7}, price:4600, color:'#7137b8',
            desc:'Ainda pulsa como se estivesse contando os seus passos.'},

  /* --- Arquivo Esquecido (v5.24), nível 40-46 --------------------- */
  m_folha:  {kind:'material', name:'Folha Solta',      desc:'Caiu de alguma coisa. Ainda está escrevendo sozinha.', price:180, color:'#5a8afa'},
  m_lacre:  {kind:'material', name:'Lacre Rompido',    desc:'Cera de um selo que alguém abriu por dentro.',         price:320, color:'#8a1a1a'},

  /* v5.28 — um material por região nova. Cada um sustenta UMA missão de
     coleta, e o preço acompanha a faixa de nível da região: material que
     vale pouco vira lixo de bolsa, material que vale muito vira farm. */
  m_valvula:{kind:'material', name:'Válvula Enferrujada',desc:'Girava alguma coisa. Hoje só range.',              price:70,  color:'#8a6a4a'},
  m_junco:  {kind:'material', name:'Junco Afogado',    desc:'Verde por fora, preto por dentro. Cheira a fundo de água.', price:130, color:'#3a8a6a'},
  m_esporo: {kind:'material', name:'Esporo Podre',     desc:'Explode em pó se você apertar. Não aperte.',        price:170, color:'#8aba4a'},
  m_carapaca:{kind:'material',name:'Carapaça Solar',   desc:'Casco de besouro que guardou calor de dia demais.', price:420, color:'#e8c860'},
  w_verbete:{kind:'equip', name:'Verbete Afiado',   slot:'weapon', icon:'icon_book', equip:{atk:35, mp:34, spd:3, elem:'ink'}, price:5600, color:'#5a8afa',
            desc:'Uma definição curta o bastante para cortar. Ataque básico de Tinta.'},
  a_encader:{kind:'equip', name:'Encadernação',     slot:'armor', equip:{def:28, hp:180, mp:30, resist:{ink:0.7, darkness:0.85}}, price:5400, color:'#2a4a8a',
            desc:'Capa dura de um volume que não abre mais. Segura Tinta.'},
  t_marcador:{kind:'equip', name:'Marcador de Página', slot:'accessory', equip:{mp:60, spd:6, atk:5}, price:4200, color:'#9ae44a',
            desc:'Guarda o lugar. Quem o carrega volta mais depressa ao que sabia.'},
};

/* --- Lojas -------------------------------------------------------- */
/* `need` opcional: item só aparece depois da flag. Venda = 50% do preço. */
const SHOPS = {
  academia: {name:'Empório da Academia', stock:[
    'potion','hipot','ether','antidote','phoenix','bomb','shard','gale','tent',
    'smoke','medkit','panacea',
    'w_treino','w_brisa','a_tunica','t_foco','t_agil','t_pluma',
    {id:'w_tinta', need:'warden_defeated'}, {id:'w_gelo', need:'warden_defeated'},
    {id:'a_manto', need:'warden_defeated'}, {id:'t_vital', need:'warden_defeated'},
    {id:'t_elo',   need:'warden_defeated'},
  ]},
  /* Porto Lúmina prepara exploração sem antecipar armas nem saltar a
     curva de poder que continua ligada aos chefes. */
  lumina: {name:'Mercado da Maré', stock:[
    'potion','hipot','ether','antidote','tent','smoke','gale','shard',
    'medkit','p_racao','t_corda','t_pluma',
  ]},
  errante: {name:'Mercador Errante', stock:[
    'megapot','hiether','phoenix','tent','elixir','medkit','smoke','panacea',
    'w_brasa','w_umbra','w_volt','a_coura','t_elo','t_corda',
    {id:'w_selo', need:'echo_defeated'}, {id:'a_veste', need:'echo_defeated'},
    {id:'warcry', need:'echo_defeated'}, {id:'aegis', need:'echo_defeated'},
    {id:'swift',  need:'echo_defeated'}, {id:'stone', need:'echo_defeated'},
  ]},

  /* --- v4.8: uma loja por região nova ------------------------------
     Cada uma vende o que a região SEGUINTE cobra, e não o que a atual
     já resolveu — é assim que a loja vira preparação e não troféu.
     A do acampamento abre a gaveta boa quando a Chama cai; a da
     cisterna, quando o Afogado cai. */
  acampamento: {name:'Acampamento da Mata', stock:[
    'potion','hipot','megapot','ether','hiether','antidote','panacea','phoenix',
    'tent','medkit','smoke','stone','bomb','gale','ironspike','warcry','aegis','swift',
    'w_carvao','w_grimo','a_casco','a_bruma','t_brasa','t_corda',
    {id:'w_cinza',  need:'cinder_defeated'}, {id:'rebirth', need:'cinder_defeated'},
    {id:'dew',      need:'cinder_defeated'}, {id:'focustea', need:'cinder_defeated'},
    {id:'bigbomb',  need:'cinder_defeated'},
  ]},
  /* Loja do Ninhal. É a única que vende petisco — o pet é o produto
     dela, e centralizar isso dá motivo para o jogador voltar. */
  ninhal: {name:'Feira do Ninhal', stock:[
    'potion','hipot','ether','hiether','antidote','panacea','phoenix','tent','medkit','stone',
    'p_racao','p_bolo',
    'w_carvao','a_bruma','t_corda','t_agil',
    {id:'p_banquete', need:'ninho_defeated'}, {id:'rebirth', need:'ninho_defeated'},
    {id:'t_olho',     need:'ninho_defeated'},
  ]},
  cisterna: {name:'Contrabando da Cisterna', stock:[
    'megapot','hiether','phoenix','rebirth','panacea','dew','medkit','focustea',
    'ironspike','smoke','stone','shard','voltflask','bloodflask','inkflask',
    'w_mare','w_arco','a_escama','t_sino','t_olho',
    {id:'w_pluma2', need:'deluge_defeated'}, {id:'w_veu',    need:'deluge_defeated'},
    {id:'w_sangria',need:'deluge_defeated'}, {id:'t_espelho',need:'deluge_defeated'},
    {id:'nectar',   need:'deluge_defeated'},
  ]},
  coroa: {name:'Mercador de Vidro', stock:[
    'megapot','hiether','elixir','nectar','rebirth','phoenix','panacea','dew',
    'focustea','ironspike','bigbomb','sunflask','umbraflask','warcry','aegis','swift','stone',
    'w_aurora','a_vidro','t_martelo','t_espelho','t_olho',
    {id:'w_astro', need:'crown_defeated'}, {id:'a_astral', need:'crown_defeated'},
    {id:'t_coroa', need:'crown_defeated'},
  ]},
  /* v5.24 — Arquivo Esquecido. Pós-Coroa, então o estoque é o topo do
     que existe; o desconto de mercado de rua fica no preço, não na
     qualidade. */
  margem: {name:'Mercadora de Margem', stock:[
    'hipot','hiether','nectar','antidote','panacea','phoenix','rebirth',
    'w_verbete','a_encader','t_marcador',
  ]},

  /* v5.28 — uma loja por região nova. Mesmo contrato das outras: cada
     uma vende o que a região SEGUINTE cobra, não o que esta já
     resolveu. O Bueiro (nv 8) é o primeiro lugar do jogo onde se compra
     `panacea`, porque o Esgoto é onde o veneno começa a doer. */
  bueiro: {name:'Ferreiro de Bueiro', stock:[
    'potion','hipot','ether','antidote','panacea','phoenix','tent','smoke','bomb',
    'w_gelo','w_volt','a_manto','t_foco','t_agil','t_vital',
    {id:'w_brasa', need:'warden_defeated'}, {id:'a_coura', need:'warden_defeated'},
  ]},
  margem_lago: {name:'Trocadora da Margem', stock:[
    'potion','hipot','megapot','ether','hiether','antidote','panacea','phoenix',
    'tent','medkit','smoke','gale','shard','ironspike',
    'w_umbra','w_brisa','a_coura','t_elo','t_corda','t_pluma',
    {id:'w_selo',  need:'echo_defeated'}, {id:'a_veste', need:'echo_defeated'},
    {id:'t_resson',need:'echo_defeated'},
  ]},
  brejo: {name:'Sucateiro do Brejo', stock:[
    'hipot','megapot','hiether','antidote','panacea','phoenix','rebirth',
    'tent','medkit','dew','bomb','bigbomb','ironspike','warcry','aegis',
    'w_carvao','w_grimo','a_casco','a_bruma','t_brasa','t_corda','t_martelo',
    {id:'w_cinza', need:'cinder_defeated'}, {id:'a_escama', need:'cinder_defeated'},
  ]},
  duna: {name:'Vidraceiro Errante', stock:[
    'megapot','hiether','elixir','nectar','rebirth','phoenix','panacea','dew',
    'focustea','bigbomb','sunflask','umbraflask','warcry','aegis','swift','stone',
    'w_astro','a_astral','t_coroa','t_olho','t_martelo',
  ]},
};

/* Abas da loja. `slot` casa com ITEMS.slot; consumíveis não têm slot. */
const SHOP_TABS = [
  {id:'todos',     nome:'Tudo',      filtro:() => true},
  {id:'consumo',   nome:'Consumo',   filtro:it => it.kind === 'consumable'},
  {id:'weapon',    nome:'Armas',     filtro:it => it.slot === 'weapon'},
  {id:'armor',     nome:'Armaduras', filtro:it => it.slot === 'armor'},
  {id:'accessory', nome:'Talismãs',  filtro:it => it.slot === 'accessory'},
];

/* --- Habilidades -------------------------------------------------- */
/* type: atk | heal | buff | debuff   target: one | all | ally | allies | self */
