const SKILLS = {
  // Tinta — Seiji
  ink_cut:   {name:'Tinta Cortante', cost:6,  power:22, elem:'ink', type:'atk', target:'one',
              desc:'Lâmina de tinta negra.'},
  ink_stain: {name:'Mancha Viva',    cost:12, power:30, elem:'ink', type:'atk', target:'one',
              status:{id:'blind',chance:0.55}, desc:'Tinta que devora a visão.'},
  ink_flood: {name:'Maré de Nanquim',cost:22, power:26, elem:'ink', type:'atk', target:'all',
              desc:'Inunda o campo de tinta viva.'},
  // Gelo — Ophelia
  ice_shard: {name:'Estilhaço Glacial', cost:7, power:24, elem:'ice', type:'atk', target:'one',
              desc:'Fragmentos de gelo afiado.'},
  ice_deep:  {name:'Geada Profunda', cost:14, power:35, elem:'ice', type:'atk', target:'one',
              status:{id:'freeze',chance:0.45}, desc:'Congela a alma exposta.'},
  mend:      {name:'Orvalho',        cost:9,  power:95, elem:'none', type:'heal', target:'ally',
              desc:'Cura um aliado.'},
  mend_all:  {name:'Névoa Serena',   cost:20, power:72, elem:'none', type:'heal', target:'allies',
              desc:'Cura toda a party.'},
  // Trevas — Marin
  dark_veil: {name:'Véu Sombrio',    cost:6,  power:20, elem:'darkness', type:'atk', target:'one',
              desc:'Sombra que corta.'},
  eclipse:   {name:'Eclipse',        cost:14, power:32, elem:'darkness', type:'atk', target:'one',
              status:{id:'dread',chance:0.5}, desc:'Escuridão total.'},
  drain:     {name:'Sanguessuga',    cost:16, power:26, elem:'darkness', type:'atk', target:'one',
              drain:0.5, desc:'Converte metade do dano em HP.'},
  // Fogo — Gabriel
  fire_fist: {name:'Punho Ígneo',    cost:5,  power:20, elem:'fire', type:'atk', target:'one',
              desc:'Soco em chamas.'},
  blaze:     {name:'Labareda',       cost:11, power:34, elem:'fire', type:'atk', target:'one',
              status:{id:'burn',chance:0.5}, desc:'Pilar de fogo.'},
  bulwark:   {name:'Muralha Viva',   cost:12, power:0, elem:'none', type:'buff', target:'allies',
              buff:{def:1.5,turns:3}, desc:'DEF da party +50% por 3 turnos.'},
  // Eletricidade — Max
  jolt:      {name:'Descarga',       cost:5,  power:21, elem:'electricity', type:'atk', target:'one',
              desc:'Arco voltaico direto.'},
  storm:     {name:'Tempestade Viva',cost:16, power:28, elem:'electricity', type:'atk', target:'all',
              status:{id:'shock',chance:0.4}, desc:'Raios caem do céu negro.'},
  haste:     {name:'Pulso Acelerado',cost:10, power:0, elem:'electricity', type:'buff', target:'ally',
              buff:{spd:1.6,turns:3}, desc:'SPD do alvo +60% por 3 turnos.'},
  // Vento — Eden
  gale_cut:  {name:'Brisa Cortante', cost:6,  power:22, elem:'wind', type:'atk', target:'one',
              desc:'O ar afiado passa e corta.'},
  breath:    {name:'Alento',         cost:12, power:45, elem:'none', type:'heal', target:'allies',
              desc:'Cura a party inteira. Fraco, mas alcança todos.'},
  updraft:   {name:'Corrente Ascendente', cost:13, power:26, elem:'wind', type:'atk', target:'one',
              status:{id:'exposed',chance:0.6}, desc:'Arranca a guarda: o alvo passa a sofrer mais.'},
  stormeye:  {name:'Olho da Tempestade', cost:24, power:24, elem:'wind', type:'atk', target:'all',
              status:{id:'exposed',chance:0.35}, desc:'Abre todos os inimigos de uma vez.'},

  /* ================= v4.8: SEGUNDA METADE DA CURVA =================
     Até a v4.7 todo mundo terminava de aprender no nível 11 e o resto
     da progressão era só número subindo. Estas entradas cobrem do 12 ao
     31 e, mais importante, ampliam o VERBO de cada personagem em vez de
     repetir o mesmo golpe mais forte:
       · `poise` alto  → ferramenta de quebrar postura de chefe
       · type 'debuff' → enfraquecer o inimigo (a Tinta é quem faz isso)
       · type 'revive' → reanimar sem gastar Pena
       · `cure` na cura → limpar condição junto
       · `taunt`       → puxar o alvo para o Guardião
     ================================================================= */

  // --- Tinta (Seiji): quem apaga o que o inimigo é ---
  ink_seal:  {name:'Selo de Nanquim', cost:18, power:38, elem:'ink', type:'debuff', target:'one',
              buff:{def:0.7, atk:0.85, turns:3},
              desc:'Escreve limites no inimigo: DEF −30% e ATK −15% por 3 turnos.'},
  ink_verse: {name:'Verso Cortante',  cost:20, power:48, elem:'ink', type:'atk', target:'one',
              poise:1.4, desc:'Uma frase curta, dita bem devagar.'},
  ink_erase: {name:'Apagar o Nome',   cost:30, power:56, elem:'ink', type:'atk', target:'one',
              status:{id:'blind',chance:0.8}, poise:1.8,
              desc:'Não fere o corpo. Fere o registro de que ele existe.'},
  ink_deluge:{name:'Dilúvio de Tinta',cost:38, power:46, elem:'ink', type:'atk', target:'all',
              status:{id:'blind',chance:0.4}, desc:'A página inteira alaga.'},
  ink_margin:{name:'Margem Protegida',cost:26, power:0,  elem:'ink', type:'buff', target:'allies',
              buff:{def:1.4, spd:1.15, turns:4}, desc:'DEF +40% e SPD +15% da party por 4 turnos.'},

  // --- Gelo (Ophelia): a que segura o grupo de pé ---
  ice_lance: {name:'Lança de Geada',  cost:16, power:46, elem:'ice', type:'atk', target:'one',
              poise:1.4, desc:'Uma estaca só, no lugar certo.'},
  cleanse:   {name:'Água Limpa',      cost:14, power:110, elem:'none', type:'heal', target:'ally',
              cure:true, desc:'Cura e lava todas as condições do alvo.'},
  ice_grave: {name:'Sepultura Branca',cost:30, power:50, elem:'ice', type:'atk', target:'all',
              status:{id:'freeze',chance:0.4}, poise:1.5, desc:'O chão fecha por cima de todos.'},
  recall:    {name:'Retorno',         cost:40, power:60, elem:'none', type:'revive', target:'fallen',
              desc:'Reanima um aliado caído com 60% do HP.'},
  mend_deep: {name:'Maré Serena',     cost:34, power:150, elem:'none', type:'heal', target:'allies',
              desc:'Cura pesada em toda a party.'},

  /* ============ v5.30: A GERAÇÃO ANTERIOR ==========================
     Trinta e duas habilidades, oito por professor. O ramo de cada uma
     sai de `ramoDaSkill`, que lê `type` e `target` — não há lista
     paralela para desencontrar. A conta por personagem é 3 Lâmina /
     2 Maré / 3 Voz, que é a proporção que deixa a árvore redonda em vez
     de com um galho comprido e dois tocos.

     Potências seguem a curva do elenco existente: nível 1 na casa dos
     25, nível 28 na casa dos 80. Quem entra tarde entra forte, não
     entra quebrado. ============================================== */

  // --- Sangue (Amanda): quem manda, e a ordem vale como golpe ---
  am_lamina: {name:'Lâmina Herdeira',  cost:6,  power:26, elem:'fire', type:'atk', target:'one',
              phys:true, desc:'O gume que ela não precisou pedir.'},
  am_fenda:  {name:'Fenda Dimensional',cost:14, power:40, elem:'fire', type:'atk', target:'one',
              phys:true, poise:1.4, desc:'Abre o espaço onde o inimigo estava. A lâmina passa junto.'},
  am_ordem:  {name:'Ordem de Marcha',  cost:16, power:0,  elem:'none',  type:'buff', target:'allies',
              buff:{atk:1.3, spd:1.2, turns:3}, desc:'ATK +30% e SPD +20% da party por 3 turnos.'},
  am_asa:    {name:'Asa Vermelha',     cost:22, power:32, elem:'fire', type:'atk', target:'all',
              phys:true, status:{id:'burn',chance:0.4}, desc:'A sombra do dragão passa por cima de todos.'},
  am_selo:   {name:'Selo de Brasa',    cost:20, power:36, elem:'fire', type:'debuff', target:'one',
              buff:{atk:0.7, def:0.85, turns:3}, desc:'Marca o alvo com o que ele ia gastar. ATK −30%.'},
  am_coroa:  {name:'Coroa Sem Peso',   cost:26, power:0,  elem:'none',  type:'buff', target:'allies',
              buff:{def:1.45, turns:4}, desc:'DEF da party +45% por 4 turnos.'},
  am_dracon: {name:'Chamado Dracônico',cost:38, power:52, elem:'fire', type:'atk', target:'all',
              status:{id:'burn',chance:0.5}, desc:'Ele vem porque ela chamou. Só por isso.'},
  am_herdeira:{name:'Direito de Herança',cost:34,power:78, elem:'fire', type:'atk', target:'one',
              phys:true, poise:1.8, desc:'O trono não se pede. Se toma.'},

  // --- Fogo (Abel): quem lê o inimigo antes de queimá-lo ---
  ab_leitura:{name:'Leitura Fria',     cost:6,  power:24, elem:'fire',  type:'atk', target:'one',
              desc:'Ele já sabia onde ia doer.'},
  ab_nota:   {name:'Nota de Rodapé',   cost:12, power:0,  elem:'none',  type:'debuff', target:'one',
              buff:{def:0.7, spd:0.85, turns:3}, desc:'DEF −30% e SPD −15% do alvo por 3 turnos.'},
  ab_runa:   {name:'Runa no Braço',    cost:13, power:38, elem:'fire',  type:'atk', target:'one',
              status:{id:'burn',chance:0.5}, desc:'A runa acende sozinha quando ele entende algo.'},
  ab_indice: {name:'Índice de Fraquezas',cost:24,power:0, elem:'none',  type:'debuff', target:'all',
              status:{id:'exposed',chance:0.7}, desc:'Todo mundo fica com a guarda anotada.'},
  ab_pagina: {name:'Página Incendiária',cost:20,power:34, elem:'fire',  type:'atk', target:'all',
              status:{id:'burn',chance:0.35}, desc:'Ele arranca a folha e ela pega no ar.'},
  ab_calculo:{name:'Cálculo Frio',     cost:22, power:0,  elem:'none',  type:'buff', target:'allies',
              buff:{atk:1.35, turns:3}, desc:'ATK da party +35% por 3 turnos.'},
  ab_tomo:   {name:'Tomo Aberto',      cost:36, power:50, elem:'fire',  type:'atk', target:'all',
              status:{id:'burn',chance:0.5}, desc:'O livro não é arma. O que está nele é.'},
  ab_conclusao:{name:'Conclusão',      cost:32, power:82, elem:'fire',  type:'atk', target:'one',
              poise:1.6, desc:'Ele fala pouco porque só fala no fim.'},

  // --- Sem elemento (Orfeu): poder que não foi dado ---
  or_golpe:  {name:'Golpe Seco',       cost:5,  power:28, elem:'none',  type:'atk', target:'one',
              phys:true, desc:'Sem éter, sem aviso, sem enfeite.'},
  or_guarda: {name:'Guarda Fechada',   cost:10, power:0,  elem:'none',  type:'buff', target:'self',
              buff:{def:1.7, turns:3}, taunt:3, desc:'DEF +70% por 3 turnos, e o inimigo mira nele.'},
  or_absorver:{name:'Absorver',        cost:14, power:34, elem:'none',  type:'atk', target:'one',
              phys:true, drain:0.55, desc:'Ele tira do inimigo o que nunca lhe deram.'},
  or_rodada: {name:'Rodada Baixa',     cost:18, power:30, elem:'none',  type:'atk', target:'all',
              phys:true, status:{id:'rooted',chance:0.4}, desc:'Corta na altura em que todos se apoiam.'},
  or_disciplina:{name:'Disciplina',    cost:20, power:0,  elem:'none',  type:'buff', target:'allies',
              buff:{atk:1.2, def:1.3, turns:4}, desc:'ATK +20% e DEF +30% da party por 4 turnos.'},
  or_contra: {name:'Contragolpe',      cost:19, power:48, elem:'none',  type:'atk', target:'one',
              phys:true, poise:1.6, desc:'Ele esperava esse movimento desde o começo.'},
  or_vazio:  {name:'Punho Vazio',      cost:34, power:46, elem:'none',  type:'atk', target:'all',
              phys:true, poise:1.3, desc:'Nada dentro do golpe. Só o golpe.'},
  or_conquista:{name:'Poder Conquistado',cost:30,power:86, elem:'none', type:'atk', target:'one',
              phys:true, poise:2.0, desc:'Não é dom. É a conta de vinte anos.'},

  // --- Eletricidade (Snoopy): abre a guarda e some antes da resposta ---
  sn_faisca: {name:'Fagulha',          cost:6,  power:27, elem:'electricity', type:'atk', target:'one',
              phys:true, desc:'Sai da mão como quem espanta mosca.'},
  sn_marca:  {name:'Marca do Filhote', cost:11, power:0,  elem:'none',  type:'debuff', target:'one',
              status:{id:'exposed',chance:0.75}, buff:{def:0.8, turns:3},
              desc:'O dragãozinho decide de quem é a vez. O alvo passa a sofrer mais.'},
  sn_passo:  {name:'Passo Curto',      cost:14, power:0,  elem:'none',  type:'buff', target:'self',
              buff:{spd:1.8, atk:1.25, turns:3}, desc:'SPD +80% e ATK +25% por 3 turnos.'},
  sn_sopro:  {name:'Sopro Pequeno',    cost:20, power:31, elem:'electricity', type:'atk', target:'all',
              status:{id:'shock',chance:0.4}, desc:'Pequeno para o dragão. Não para você.'},
  sn_corrente:{name:'Corrente Curta',  cost:22, power:52, elem:'electricity', type:'atk', target:'one',
              poise:1.6, status:{id:'shock',chance:0.5}, desc:'Um fio só, do pulso dele ao pescoço do outro.'},
  sn_garra:  {name:'Garra Emprestada', cost:18, power:48, elem:'electricity', type:'atk', target:'one',
              phys:true, poise:1.4, desc:'A garra é dele. A mira é do Snoopy.'},
  sn_voo:    {name:'Voo Rasante',      cost:32, power:48, elem:'electricity', type:'atk', target:'all',
              status:{id:'exposed',chance:0.45}, desc:'Passa baixo o bastante para todos se abaixarem.'},
  sn_despertar:{name:'Despertar do Filhote',cost:34,power:84, elem:'electricity', type:'atk', target:'one',
              phys:true, poise:1.7, status:{id:'stun',chance:0.35},
              desc:'Um dia ele vai ser grande. Hoje já basta.'},
  // --- Trevas (Marin): quem transforma um turno em dois ---
  shadowstep:{name:'Passo de Sombra', cost:12, power:0,  elem:'darkness', type:'buff', target:'self',
              buff:{spd:1.8, atk:1.2, turns:3}, desc:'SPD +80% e ATK +20% por 3 turnos.'},
  rend:      {name:'Dilaceração',     cost:22, power:54, elem:'darkness', type:'atk', target:'one',
              status:{id:'bleed',chance:0.55}, poise:1.5, desc:'Abre e deixa aberto.'},
  darknight: {name:'Noite Fechada',   cost:30, power:46, elem:'darkness', type:'atk', target:'all',
              status:{id:'dread',chance:0.4}, desc:'A sala perde o teto e as paredes.'},
  abyss:     {name:'Abismo Pessoal',  cost:36, power:78, elem:'darkness', type:'atk', target:'one',
              poise:2.2, desc:'Um buraco do tamanho exato de uma pessoa.'},
  souldrain: {name:'Beber a Alma',    cost:32, power:60, elem:'darkness', type:'atk', target:'one',
              drain:0.75, desc:'Converte 75% do dano em HP.'},

  // --- Fogo (Gabriel): o único que decide em quem o inimigo bate ---
  flamewall: {name:'Muro de Chamas',  cost:20, power:36, elem:'fire', type:'atk', target:'all',
              status:{id:'burn',chance:0.45}, desc:'Uma linha de fogo entre você e eles.'},
  taunt:     {name:'Provocar',        cost:8,  power:0,  elem:'fire', type:'buff', target:'self',
              buff:{def:1.6, turns:3}, taunt:3,
              desc:'DEF +60% e o inimigo passa a mirar em você por 3 turnos.'},
  hammer:    {name:'Marreta Ígnea',   cost:24, power:58, elem:'fire', type:'atk', target:'one',
              poise:2.4, desc:'Feita para quebrar postura, não para matar.'},
  emberguard:{name:'Guarda de Brasa', cost:28, power:0,  elem:'fire', type:'buff', target:'allies',
              buff:{def:1.5, atk:1.2, turns:4}, desc:'DEF +50% e ATK +20% da party por 4 turnos.'},
  furnace:   {name:'Fornalha',        cost:42, power:64, elem:'fire', type:'atk', target:'all',
              status:{id:'burn',chance:0.6}, poise:1.6, desc:'O ar acaba antes do fogo.'},

  // --- Eletricidade (Max): quem age antes de todo mundo ---
  chain:     {name:'Corrente Dupla',  cost:16, power:44, elem:'electricity', type:'atk', target:'one',
              status:{id:'shock',chance:0.4}, desc:'O arco vai e volta.'},
  overload:  {name:'Sobrecarga',      cost:22, power:40, elem:'electricity', type:'atk', target:'all',
              status:{id:'shock',chance:0.5}, desc:'Tudo que conduz, conduz demais.'},
  blitz:     {name:'Investida Relâmpago', cost:20, power:0, elem:'electricity', type:'atk', target:'one',
              phys:true, poise:1.9, desc:'Ataque físico puro, na velocidade do raio.'},
  haste_all: {name:'Pulso Coletivo',  cost:30, power:0,  elem:'electricity', type:'buff', target:'allies',
              buff:{spd:1.4, turns:4}, desc:'SPD de toda a party +40% por 4 turnos.'},
  thunderfall:{name:'Queda do Céu',   cost:44, power:68, elem:'electricity', type:'atk', target:'all',
              status:{id:'shock',chance:0.55}, poise:1.5, desc:'O céu desce inteiro, de uma vez.'},

  // --- Vento (Eden): quem faz o resto do grupo bater mais ---
  tailwind:  {name:'Vento a Favor',   cost:18, power:0,  elem:'wind', type:'buff', target:'allies',
              buff:{atk:1.3, spd:1.15, turns:4}, desc:'ATK +30% e SPD +15% da party por 4 turnos.'},
  windblade: {name:'Lâmina de Ar',    cost:18, power:48, elem:'wind', type:'atk', target:'one',
              poise:1.5, desc:'O corte chega antes do som.'},
  cleanwind: {name:'Ar Limpo',        cost:22, power:70, elem:'none', type:'heal', target:'allies',
              cure:true, desc:'Cura o grupo e limpa todas as condições.'},
  cyclone:   {name:'Ciclone',         cost:34, power:54, elem:'wind', type:'atk', target:'all',
              status:{id:'exposed',chance:0.55}, poise:1.4, desc:'Abre todo mundo e mantém aberto.'},
  worldbreath:{name:'Fôlego do Mundo',cost:40, power:210, elem:'none', type:'heal', target:'allies',
              desc:'A maior cura em área do jogo.'},

  /* --- Terra (Ava Rosa Groot): a que segura o chão sob o grupo ------
     Ava é a SEGUNDA suporte de fato do elenco, e o desenho dela evita
     virar uma terceira Ophelia/Eden: a Ophelia cura forte em um alvo, a
     Eden cura fraco em todos e abre o inimigo. A Ava quase não cura —
     ela PREVINE: DEF, escudo que absorve, limpeza e uma reanimação. */
  root_lash: {name:'Chicote de Raiz', cost:6,  power:22, elem:'earth', type:'atk', target:'one',
              status:{id:'rooted', chance:0.3}, desc:'A raiz sobe pelo tornozelo e puxa.'},
  bark_ward: {name:'Casca Viva',      cost:10, power:0,  elem:'earth', type:'buff', target:'ally',
              buff:{def:1.6, turns:3}, desc:'DEF do alvo +60% por 3 turnos.'},
  bloom:     {name:'Florada',         cost:12, power:60, elem:'none', type:'heal', target:'ally',
              desc:'Cura um aliado. Devagar, mas sem cobrar caro.'},
  stonehide: {name:'Pele de Pedra',   cost:20, power:0,  elem:'earth', type:'buff', target:'allies',
              buff:{def:1.45, turns:4}, desc:'DEF da party +45% por 4 turnos.'},
  quake:     {name:'Tremor',          cost:22, power:34, elem:'earth', type:'atk', target:'all',
              status:{id:'rooted', chance:0.5}, poise:1.6,
              desc:'O chão sobe de uma vez sob todos eles.'},
  deeproot:  {name:'Raiz Profunda',   cost:18, power:44, elem:'earth', type:'atk', target:'one',
              drain:0.4, poise:1.4, desc:'Bebe do que prende e devolve como vida.'},
  greenmend: {name:'Seiva Clara',     cost:24, power:90, elem:'none', type:'heal', target:'allies',
              cure:true, desc:'Cura a party e lava todas as condições.'},
  gaia_wall: {name:'Muralha de Gaia', cost:30, power:0,  elem:'earth', type:'buff', target:'allies',
              buff:{def:1.7, atk:1.15, turns:4},
              desc:'DEF +70% e ATK +15% da party por 4 turnos.'},
  regrowth:  {name:'Rebrota',         cost:42, power:70, elem:'none', type:'revive', target:'fallen',
              desc:'Reanima um aliado caído com 70% do HP.'},

  /* --- Veneno (Scythe): a que tira o turno antes de tirar o HP -----
     A Marin também é assassina, mas de Trevas e de PICO: ela mata rápido
     e apanha feio. A Scythe trabalha por SUBTRAÇÃO — Pavor, veneno que
     corrói e um golpe que só compensa em alvo já condenado. Em chefe ela
     é a resposta para a rodada em que o golpe grande vem. */
  toxin_cut: {name:'Corte Toxina',    cost:6,  power:23, elem:'poison', type:'atk', target:'one',
              desc:'A lâmina passa untada.'},
  wither:    {name:'Definhar',        cost:13, power:30, elem:'poison', type:'atk', target:'one',
              status:{id:'bleed', chance:0.5}, desc:'Abre e deixa apodrecendo.'},
  /* O Pavor é a assinatura dela e por isso NÃO fere: o preço da condição
     mais forte do jogo é abrir mão do dano naquele turno. */
  dreadcut:  {name:'Ceifar o Ânimo',  cost:22, power:0,  elem:'poison', type:'atk', target:'one',
              status:{id:'terror', chance:0.85}, poise:1.5,
              desc:'Não corta o corpo. Corta a vontade de continuar.'},
  venom_veil:{name:'Véu de Miasma',   cost:24, power:26, elem:'poison', type:'atk', target:'all',
              status:{id:'terror', chance:0.4}, desc:'O ar fica pesado e ninguém quer olhar.'},
  creeping:  {name:'Peçonha Lenta',   cost:18, power:40, elem:'poison', type:'debuff', target:'one',
              buff:{atk:0.75, spd:0.8, turns:3},
              desc:'ATK −25% e SPD −20% por 3 turnos.'},
  scythe_arc:{name:'Arco da Foice',   cost:20, power:52, elem:'poison', type:'atk', target:'one',
              poise:1.8, desc:'Um único arco, no ponto em que dobra.'},
  /* Executar cresce conforme o alvo cai: é o que dá à Scythe uma pergunta
     de TIMING em vez de "aperte o mais forte". */
  reaping:   {name:'Colheita',        cost:30, power:64, elem:'poison', type:'atk', target:'one',
              execute:0.9, poise:2.0,
              desc:'Vale mais quanto menos o alvo tiver. Em alvo inteiro, decepciona.'},
  last_rites:{name:'Extrema-Unção',   cost:38, power:58, elem:'poison', type:'atk', target:'all',
              status:{id:'terror', chance:0.5}, poise:1.6,
              desc:'Ela ergue a taça e todo mundo entende o brinde.'},

  /* --- Cinzas (Madao): o que aguenta porque não tem pressa ----------
     Elemento de combate próprio desde que Cinzas deixou de ser só a
     identidade da árvore dele (ID interno continua `blood`, ver
     ELEM.blood). O status continua sendo queimadura de propósito: cinza
     é o que sobra depois do fogo, então o efeito do golpe ainda "queima"
     — só a fraqueza/resistência do golpe é que mudou de família. Metade
     do repertório dele é sustentação, não dano. */
  cardboard: {name:'Papelão',        cost:16, power:0,  elem:'blood', type:'buff', target:'self',
              buff:{def:2.1, turns:4}, papelao:true,
              desc:'Ergue a caixa. DEF +110% por 4 turnos — e sim, é uma caixa.'},
  m_punch:   {name:'Soco Sem Vontade',cost:5,  power:19, elem:'blood', type:'atk', target:'one',
              desc:'Ele acerta. Não parecia que ia, mas acerta.'},
  m_ember:   {name:'Cinza de Cigarro',cost:11, power:31, elem:'blood', type:'atk', target:'one',
              status:{id:'burn', chance:0.45}, desc:'Caiu ali. Ele nem olhou.'},
  m_nap:     {name:'Cochilo Tático',  cost:12, power:70, elem:'none', type:'heal', target:'self',
              desc:'Fecha os olhos um instante e volta melhor. Ninguém explica.'},
  m_shrug:   {name:'Deixa Comigo',    cost:18, power:0,  elem:'blood', type:'buff', target:'allies',
              buff:{def:1.4, turns:3}, desc:'DEF da party +40% por 3 turnos.'},
  m_flare:   {name:'Punho de Brasa Real', cost:22, power:52, elem:'blood', type:'atk', target:'one',
              poise:1.7, desc:'Uma vez por luta ele leva a sério.'},
  m_box_all: {name:'Caixa Coletiva',  cost:26, power:0,  elem:'blood', type:'buff', target:'allies',
              buff:{def:1.65, atk:1.1, turns:4}, desc:'Tem caixa pra todo mundo. DEF +65% e ATK +10%.'},
  m_bonfire: {name:'Fogueira de Rua', cost:34, power:44, elem:'blood', type:'atk', target:'all',
              status:{id:'burn', chance:0.55}, desc:'Ele acende o que sobrou e o beco inteiro esquenta.'},
  m_last:    {name:'Última Migalha',  cost:40, power:120, elem:'none', type:'heal', target:'allies',
              cure:true, desc:'Divide o que não tinha. Cura o grupo e limpa condição.'},

  // Inimigos
  e_claw:    {name:'Garra Sombria',  cost:0, power:18, elem:'darkness', type:'atk', target:'one'},
  e_veil:    {name:'Véu Negro',      cost:0, power:24, elem:'darkness', type:'atk', target:'one',
              status:{id:'dread',chance:0.35}},
  e_smash:   {name:'Esmagar',        cost:0, power:26, elem:'none', type:'atk', target:'one'},
  e_guard:   {name:'Defesa Pétrea',  cost:0, power:0,  elem:'none', type:'buff', target:'self',
              buff:{def:1.8,turns:2}},
  e_drainlf: {name:'Drenar Vida',    cost:0, power:20, elem:'blood', type:'atk', target:'one', drain:0.6},
  e_fury:    {name:'Fúria Vermelha', cost:0, power:30, elem:'blood', type:'atk', target:'one',
              status:{id:'bleed',chance:0.5}},
  e_bite:    {name:'Mordida',        cost:0, power:16, elem:'none', type:'atk', target:'one'},
  e_howl:    {name:'Uivo Elemental', cost:0, power:14, elem:'none', type:'atk', target:'all'},
  e_spark:   {name:'Faísca Errante', cost:0, power:19, elem:'electricity', type:'atk', target:'one',
              status:{id:'shock',chance:0.4}},
  e_frost:   {name:'Sopro Gélido',   cost:0, power:22, elem:'ice', type:'atk', target:'all',
              status:{id:'freeze',chance:0.25}},
  e_lance:   {name:'Lança de Aurora',cost:0, power:26, elem:'light', type:'atk', target:'one',
              status:{id:'stun',chance:0.3}},
  e_gnaw:    {name:'Roer o Nome',    cost:0, power:23, elem:'ink', type:'atk', target:'one',
              status:{id:'blind',chance:0.45}},
  e_ember:   {name:'Brasa Torta',    cost:0, power:24, elem:'fire', type:'atk', target:'one',
              status:{id:'burn',chance:0.4}},
  e_gust:    {name:'Rajada Suja',    cost:0, power:20, elem:'wind', type:'atk', target:'all',
              status:{id:'exposed',chance:0.3}},
  e_talon:   {name:'Garra de Pena',  cost:0, power:26, elem:'wind', type:'atk', target:'one'},
  e_web:     {name:'Fio de Nanquim', cost:0, power:24, elem:'ink', type:'atk', target:'one',
              status:{id:'blind',chance:0.4}},
  e_venom:   {name:'Peçonha Lenta',  cost:0, power:22, elem:'blood', type:'atk', target:'one',
              status:{id:'bleed',chance:0.45}},
  /* --- v4.8: criaturas das três regiões novas --- */
  e_cinder:  {name:'Cuspe de Brasa', cost:0, power:28, elem:'fire', type:'atk', target:'one',
              status:{id:'burn',chance:0.45}},
  e_ashfall: {name:'Chuva de Cinzas',cost:0, power:22, elem:'fire', type:'atk', target:'all',
              status:{id:'blind',chance:0.3}},
  e_root:    {name:'Raiz Sufocante', cost:0, power:32, elem:'none', type:'atk', target:'one'},
  e_thornshot:{name:'Espinho Lançado',cost:0,power:27, elem:'wind', type:'atk', target:'one',
              status:{id:'bleed',chance:0.4}},
  e_pyre:    {name:'Pira Improvisada',cost:0,power:26, elem:'fire', type:'atk', target:'all',
              status:{id:'burn',chance:0.35}},
  e_rustcut: {name:'Corte Enferrujado',cost:0,power:34,elem:'none', type:'atk', target:'one',
              status:{id:'bleed',chance:0.45}},
  e_undertow:{name:'Ressaca',        cost:0, power:28, elem:'ice', type:'atk', target:'all'},
  e_grasp:   {name:'Mão de Afogado', cost:0, power:33, elem:'blood', type:'atk', target:'one', drain:0.5},
  e_song:    {name:'Canto Submerso', cost:0, power:26, elem:'electricity', type:'atk', target:'all',
              status:{id:'shock',chance:0.4}},
  e_gulp:    {name:'Engolir',        cost:0, power:44, elem:'none', type:'atk', target:'one'},
  e_brine:   {name:'Salmoura',       cost:0, power:31, elem:'ice', type:'atk', target:'one',
              status:{id:'freeze',chance:0.4}},
  e_glass:   {name:'Estilhaço de Vidro',cost:0,power:36,elem:'light',type:'atk', target:'one'},
  e_mirror:  {name:'Devolver o Golpe',cost:0,power:40, elem:'light', type:'atk', target:'one',
              status:{id:'stun',chance:0.25}},
  e_moth:    {name:'Pó Astral',      cost:0, power:27, elem:'ink', type:'atk', target:'all',
              status:{id:'blind',chance:0.45}},
  e_stomp:   {name:'Pisar',          cost:0, power:52, elem:'none', type:'atk', target:'one'},
  e_nameless:{name:'Golpe Sem Nome', cost:0, power:46, elem:'darkness', type:'atk', target:'one',
              status:{id:'dread',chance:0.5}},
  e_herald:  {name:'Trombeta Menor', cost:0, power:34, elem:'light', type:'atk', target:'all',
              status:{id:'stun',chance:0.25}},
  e_void:    {name:'Vazio Aberto',   cost:0, power:38, elem:'darkness', type:'atk', target:'one', drain:0.6},
  e_wither:  {name:'Definhar',       cost:0, power:0,  elem:'darkness', type:'debuff', target:'one',
              buff:{atk:0.8, def:0.85, turns:3}},

  /* --- Arquivo Esquecido (v5.24) ---------------------------------- */
  e_rasura:  {name:'Rasura',          cost:0, power:44, elem:'ink', type:'atk', target:'one',
              status:{id:'blind',chance:0.5}},
  e_indexar: {name:'Indexar',         cost:0, power:0,  elem:'none', type:'debuff', target:'all',
              buff:{def:0.8, spd:0.85, turns:3}},
  e_citacao: {name:'Citação Direta',  cost:0, power:38, elem:'ink', type:'atk', target:'all'},
  e_errata:  {name:'Errata',          cost:0, power:52, elem:'light', type:'atk', target:'one',
              status:{id:'exposed',chance:0.45}},
  e_lacrar:  {name:'Lacrar',          cost:0, power:0,  elem:'none', type:'buff', target:'self',
              buff:{def:1.8, turns:2}},

  /* Chefe do Arquivo. `arte` fica de fora: o Arquivista usa os sprites
     de FASE, e um quadro por golpe seria arte que não existe. */
  b_apagar:  {name:'Apagar o Verbete',cost:0, power:56, elem:'ink', type:'atk', target:'one',
              status:{id:'blind',chance:0.6}, poise:1.3,
              desc:'Não fere: retira a linha em que o nome estava.'},
  b_indice:  {name:'Índice Remissivo',cost:0, power:36, elem:'ink', type:'atk', target:'all',
              status:{id:'bleed',chance:0.3}, poise:1.4,
              desc:'Toda página aponta para todas as outras, ao mesmo tempo.'},
  b_reescrever:{name:'Reescrever',    cost:0, power:300, elem:'none', type:'heal', target:'self',
              desc:'Ele volta a ser o que estava escrito antes do golpe.'},
  b_colofao: {name:'Colofão',         cost:0, power:62, elem:'ink', type:'atk', target:'all',
              status:{id:'terror',chance:0.45}, poise:2, exausto:true,
              desc:'A última página. Depois dela, ele fica exposto.'},

  // Chefe
  /* --- v4.8: os três chefes novos. Repare que todos têm um golpe de
     RECOMPOSIÇÃO: é o que dá sentido à barra de postura — se o jogador
     não quebrar, o chefe se recupera e a luta reinicia. --- */
  b_ember:   {name:'Coração de Brasa',cost:0, power:34, elem:'fire', type:'atk', target:'all',
              status:{id:'burn',chance:0.5}},
  b_pyreburst:{name:'Explosão da Pira',cost:0,power:52, elem:'fire', type:'atk', target:'one',
              status:{id:'burn',chance:0.7}},
  b_relight: {name:'Reacender',      cost:0, power:200, elem:'none', type:'heal', target:'self'},
  b_flood:   {name:'Enchente',       cost:0, power:36, elem:'ice', type:'atk', target:'all',
              status:{id:'freeze',chance:0.3}},
  b_drown:   {name:'Afogar',         cost:0, power:48, elem:'blood', type:'atk', target:'one', drain:0.8},
  b_gate:    {name:'Fechar a Comporta',cost:0,power:0, elem:'none', type:'buff', target:'self',
              buff:{def:1.7, turns:3}},
  b_crown:   {name:'Coroação',       cost:0, power:40, elem:'light', type:'atk', target:'all',
              status:{id:'stun',chance:0.3}},
  b_shatter: {name:'Estilhaçar',     cost:0, power:60, elem:'light', type:'atk', target:'one'},
  b_annul:   {name:'Anular',         cost:0, power:0,  elem:'light', type:'debuff', target:'all',
              buff:{atk:0.8, spd:0.85, turns:3}},
  b_recompose:{name:'Recompor',      cost:0, power:260, elem:'none', type:'heal', target:'self'},

  /* --- Dono do Pântano (v5.23) ------------------------------------
     Oito habilidades do moveset. Cada uma carrega o `arte` do quadro que
     o combate mostra durante o golpe: é o que faz a luta ter silhueta
     própria em vez de o mesmo boneco piscando oito vezes.

     `submerge` e `emerge` são a marca da luta. Submerso, ele não é
     alvo de golpe único e sofre menos de área; sai da água ao agir. */
  b_bite:    {name:'Mordida',           cost:0, power:52, elem:'poison', type:'atk', target:'one',
              status:{id:'bleed',chance:0.4}, poise:1.3, emerge:true,
              arte:'boss_pantano_mordida',
              desc:'A cabeça recua, a mandíbula abre e fecha sobre o alvo.'},
  b_tail:    {name:'Cauda Giratória',   cost:0, power:34, elem:'none', type:'atk', target:'all',
              poise:1.5, emerge:true, arte:'boss_pantano_cauda',
              desc:'Varre a região inteira com a cauda segmentada.'},
  b_charge:  {name:'Investida Submersa',cost:0, power:58, elem:'none', type:'atk', target:'one',
              poise:1.4, emerge:true, arte:'boss_pantano_investida',
              desc:'Atravessa a arena sob a água e emerge em alta velocidade.'},
  b_grab:    {name:'Surgir e Agarrar',  cost:0, power:44, elem:'poison', type:'atk', target:'one',
              status:{id:'rooted',chance:0.75}, emerge:true, arte:'boss_pantano_agarrar',
              desc:'Emerge sob um personagem e o prende entre as presas.'},
  b_eyes:    {name:'Olhos na Água',     cost:0, power:0,  elem:'none', type:'buff', target:'self',
              buff:{def:1.6, spd:1.3, turns:2}, submerge:true, arte:'boss_pantano_olhos',
              desc:'Some sob a água. Só os olhos ficam.'},
  b_shards:  {name:'Lançar Fragmentos', cost:0, power:30, elem:'none', type:'atk', target:'all',
              status:{id:'bleed',chance:0.35}, emerge:true, arte:'boss_pantano_fragmentos',
              desc:'Arranca placas da própria carapaça e as lança.'},
  b_spikes:  {name:'Espinhos na Lama',  cost:0, power:38, elem:'earth', type:'atk', target:'all',
              status:{id:'rooted',chance:0.45}, arte:'boss_pantano_espinhos',
              desc:'Os fragmentos enterrados emergem como espinhos.'},
  b_fury:    {name:'Fúria do Pântano',  cost:0, power:64, elem:'poison', type:'atk', target:'all',
              status:{id:'terror',chance:0.5}, poise:2, emerge:true, exausto:true,
              arte:'boss_pantano_furia',
              desc:'O pântano inteiro vira arma. Depois dela, ele fica exposto.'},

  b_judge:   {name:'Juízo Silencioso',cost:0, power:32, elem:'light', type:'atk', target:'all',
              status:{id:'stun',chance:0.25}},
  b_sever:   {name:'Selo Rompido',   cost:0, power:34, elem:'darkness', type:'atk', target:'one',
              status:{id:'dread',chance:0.6}},
  b_collapse:{name:'Colapso do Véu', cost:0, power:30, elem:'darkness', type:'atk', target:'all'},
  b_feed:    {name:'Devorar Éter',   cost:0, power:26, elem:'blood', type:'atk', target:'one', drain:1.0},
  b_regen:   {name:'Reintegrar',     cost:0, power:120, elem:'none', type:'heal', target:'self'},

  /* --- Vharok, a Alcateia do Vazio (Poço de Decantação) -------------
     O design original (`ALCATEIA_DO_VAZIO.md`) é escrito para combate
     em tempo real — telegraphs em milissegundos, esquiva direcional,
     leitura de padrão do jogador. Nada disso existe no motor, que é
     por turno. A tradução usa mecanismos JÁ TESTADOS em vez de inventar
     um sistema de invisibilidade novo:
       · "Sumiço Sombrio" reaproveita `submerge`/`submerso` do Dono do
         Pântano (reduz dano recebido em 65%, não é imunidade — mesmo
         contrato, outra pele) em vez de tornar o alvo intocável;
       · "Marca da Presa" usa a condição `marked` nova (ver AILMENTS em
         data/02-elements-status.js) em vez de rastro de pegada em tela;
       · a leitura de padrão do jogador (fase 3) e os telegraphs visuais
         (fase 2, investida em 3 passagens) ficam de fora: exigiriam
         histórico de ação do jogador e um sistema de aviso que o motor
         de combate por turno não tem hoje — registrado como pendência,
         não simulado com números arbitrários. */
  b_watch:      {name:'Olhos na Escuridão', cost:0, power:0, elem:'darkness', type:'buff', target:'self',
                 buff:{atk:1.25, turns:2}, submerge:true, arte:'boss_vharok_olhos',
                 desc:'O corpo se desfaz em fumaça. Só os olhos ficam, contando os passos de todo mundo.'},
  b_lonebite:   {name:'Bote Isolado',       cost:0, power:56, elem:'darkness', type:'atk', target:'one',
                 emerge:true, poise:1.5, arte:'boss_vharok_bote',
                 desc:'Sai da escuridão direto em quem está mais sozinho da formação.'},
  b_circle:     {name:'Rodeio Sombrio',     cost:0, power:34, elem:'darkness', type:'atk', target:'all',
                 status:{id:'dread',chance:0.5}, arte:'boss_vharok_rodeio',
                 desc:'Duas sombras fecham o círculo enquanto ele observa de fora.'},
  b_mark:       {name:'Marca da Presa',     cost:0, power:18, elem:'darkness', type:'atk', target:'one',
                 status:{id:'marked',chance:0.85}, arte:'boss_vharok_marca',
                 desc:'Um sigilo gravado na presa. A alcateia não perde mais essa trilha.'},
  b_finalcharge:{name:'Investida Final',    cost:0, power:80, elem:'darkness', type:'atk', target:'one',
                 poise:2.1, exausto:true, arte:'boss_vharok_investida',
                 desc:'Atravessa a arena três vezes. Na última, já não sobra fôlego pra fugir.'},

  /* ============ v5.31: TRÊS QUE JÁ TINHAM ARTE E NÃO TINHAM FICHA ====
     Beatriz Demeter, Calder Pell e Carmila Reachforth chegaram com
     sprite de campo e retrato prontos, sem UMA linha de design. Curva
     de potência e nível idêntica à da geração anterior (v5.30): base
     alta, aprende em 1/1/8/12/15/20/24/28, 3 Lâmina / 2 Maré / 3 Voz. */

  // --- Luz (Beatriz Demeter): julga antes de golpear ---
  bt_corte:     {name:'Corte Consagrado', cost:6,  power:26, elem:'light', type:'atk', target:'one',
                 phys:true, desc:'A espada não é o que fere. É o que ela carrega.'},
  bt_veredito:  {name:'Veredito',         cost:11, power:0,  elem:'light', type:'debuff', target:'one',
                 status:{id:'stun',chance:0.35}, desc:'Ela decide antes de golpear. Ele só descobre depois.'},
  bt_disciplina:{name:'Disciplina de Ordem',cost:14,power:0, elem:'light', type:'buff', target:'self',
                 buff:{def:1.5, turns:3}, desc:'DEF +50% por 3 turnos. Guarda fechada, luz acesa.'},
  bt_circulo:   {name:'Círculo de Luz',   cost:22, power:32, elem:'light', type:'atk', target:'all',
                 status:{id:'stun',chance:0.3}, desc:'Um círculo se fecha e prende quem está dentro.'},
  bt_juramento: {name:'Juramento',        cost:20, power:0,  elem:'light', type:'buff', target:'allies',
                 buff:{def:1.4, turns:3}, desc:'DEF da party +40% por 3 turnos. Ela jurou proteger, não vencer sozinha.'},
  bt_exorcismo: {name:'Exorcismo',        cost:28, power:54, elem:'light', type:'atk', target:'one',
                 poise:1.6, status:{id:'stun',chance:0.4}, desc:'Não sobra espaço pro que estava escondido ali.'},
  bt_alvorada:  {name:'Alvorada',         cost:38, power:50, elem:'light', type:'atk', target:'all',
                 status:{id:'stun',chance:0.35}, desc:'A luz chega em todo lugar ao mesmo tempo.'},
  bt_sentenca:  {name:'Sentença Final',   cost:34, power:82, elem:'light', type:'atk', target:'one',
                 phys:true, poise:2.0, desc:'O julgamento acabou três golpes atrás. Isto é só a sentença.'},

  // --- Trevas (Calder Pell): cobra o preço depois, nunca na hora ---
  cp_toque:     {name:'Toque Selado',     cost:6,  power:25, elem:'darkness', type:'atk', target:'one',
                 desc:'Ele mal encosta. O resto é a maldição trabalhando.'},
  cp_pacto:     {name:'Pacto Rompido',    cost:11, power:0,  elem:'darkness', type:'debuff', target:'one',
                 buff:{atk:0.75, turns:3}, desc:'ATK do alvo −25% por 3 turnos. Cláusula que ele não leu.'},
  cp_correntes: {name:'Correntes de Estrela',cost:15,power:0, elem:'darkness', type:'debuff', target:'one',
                 buff:{def:0.7, spd:0.85, turns:3}, desc:'DEF −30% e SPD −15% do alvo por 3 turnos.'},
  cp_ordalia:   {name:'Ordália',          cost:20, power:34, elem:'darkness', type:'atk', target:'all',
                 status:{id:'dread',chance:0.4}, desc:'Todo mundo responde pela mesma pergunta.'},
  cp_juramento_negro:{name:'Juramento Negro',cost:18,power:0, elem:'darkness', type:'buff', target:'self',
                 buff:{atk:1.3, turns:3}, desc:'ATK +30% por 3 turnos. Ele já sabia que ia chegar aqui.'},
  cp_veredicto: {name:'Veredito das Sombras',cost:28,power:52, elem:'darkness', type:'atk', target:'one',
                 poise:1.5, status:{id:'dread',chance:0.5}, desc:'A sentença estava escrita desde a primeira cena.'},
  cp_colheita:  {name:'Colheita',         cost:36, power:44, elem:'darkness', type:'atk', target:'all',
                 drain:0.4, desc:'Ele não tira só a vida. Tira o que sobrou depois.'},
  cp_ultimo_selo:{name:'Último Selo',     cost:34, power:80, elem:'darkness', type:'atk', target:'one',
                 poise:1.8, desc:'Não é pressa. É o último passo de um plano longo.'},

  // --- Cinzas (Carmila Reachforth): cada golpe enche a taça ---
  cm_unha:      {name:'Unha de Espinho',  cost:6,  power:25, elem:'blood', type:'atk', target:'one',
                 phys:true, desc:'Corta fino. O resto ela bebe depois.'},
  cm_convite:   {name:'Convite',          cost:10, power:0,  elem:'blood', type:'debuff', target:'one',
                 status:{id:'bleed',chance:0.5}, desc:'Ela nunca precisa insistir duas vezes.'},
  cm_veia:      {name:'Sangue Emprestado',cost:14, power:0,  elem:'blood', type:'buff', target:'ally',
                 buff:{atk:1.3, turns:3}, desc:'ATK do alvo +30% por 3 turnos. Ela reparte o que já tomou.'},
  cm_banquete:  {name:'Banquete',         cost:20, power:32, elem:'blood', type:'atk', target:'all',
                 drain:0.35, desc:'A mesa é grande o bastante para todos os presentes.'},
  cm_pacto:     {name:'Pacto de Sangue',  cost:18, power:0,  elem:'blood', type:'buff', target:'allies',
                 buff:{atk:1.25, spd:1.1, turns:3}, desc:'ATK +25% e SPD +10% da party por 3 turnos.'},
  cm_sede:      {name:'Sede Antiga',      cost:28, power:48, elem:'blood', type:'atk', target:'one',
                 drain:0.55, poise:1.4, status:{id:'bleed',chance:0.4}, desc:'Séculos de fome não se satisfazem devagar.'},
  cm_enxame:    {name:'Enxame de Espinhos',cost:38,power:44, elem:'blood', type:'atk', target:'all',
                 status:{id:'bleed',chance:0.4}, desc:'Cada espinho encontra a própria veia.'},
  cm_ceia_eterna:{name:'Ceia Eterna',     cost:36, power:78, elem:'blood', type:'atk', target:'one',
                 drain:0.65, poise:1.9, desc:'Ela já bebeu de reis. Este não vai durar muito mais.'},
};

/* --- Ultimates (Ressonância) — 1 por personagem ------------------- */
