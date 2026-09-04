const RESERVE_EXP = 0.5;

/* ===================================================================
   2b. MAPAS
   Autoria em texto. Marcadores especiais ('+' porta, 'S' escada,
   '$' baú) são varridos em ordem de leitura e casados com as listas
   `warps` / `chests` — assim ninguém precisa contar colunas à mão.
   Linhas curtas são preenchidas e as bordas são seladas no carregamento.
   =================================================================== */

const TILEDEF = {
  '.': {id:'grass',  solid:false, enc:true},
  ',': {id:'path',   solid:false},
  'd': {id:'dirt',   solid:false, enc:true},
  'x': {id:'crack',  solid:false, enc:true},
  '#': {id:'wall',   solid:true},
  'T': {id:'tree',   solid:true, tall:true},
  '~': {id:'water',  solid:true},
  'f': {id:'floor',  solid:false},
  'c': {id:'carpet', solid:false},
  /* v5.28 — MESMO DESENHO de `f` e `,`, mas com encontro ligado.
     `floor` e `path` são o chão dos ACAMPAMENTOS e das estradas, onde
     monstro não pode nascer, e o encontro é gatilhado pelo TILE (`enc`),
     não pelo mapa. Três regiões inteiras foram escritas com esse chão
     — Ninhal, Coroa de Vidro e Arquivo — e por isso nunca rolaram um
     único encontro, mesmo declarando `encounter`. O jogador chegou na
     Coroa e não encontrou nada; as missões de caça do Ninhal eram
     impossíveis de fechar. A causa era esta linha faltando, não a
     frequência das formações. Há teste travando isso agora. */
  'o': {id:'floor',  solid:false, enc:true},   // salão com encontro
  'p': {id:'path',   solid:false, enc:true},   // estrada com encontro
  'b': {id:'shelf',  solid:true, tall:true},
  '=': {id:'table',  solid:true, tall:true},
  '^': {id:'pillar', solid:true, tall:true},
  'B': {id:'brazier',solid:true, light:true, tall:true},
  'r': {id:'rubble', solid:true, tall:true},
  /* O ponto de save virou objeto ALTO para poder ser um pedestal de
     verdade: alto só muda o desenho (base no chão, cresce para cima, e
     entra na ordenação por Y). Continua atravessável, como sempre foi. */
  '*': {id:'save',   solid:false, save:true, tall:true},
  '$': {id:'chest',  solid:true, chest:true},
  '+': {id:'door',   solid:false, warp:true},
  'S': {id:'stairs', solid:false, warp:true},
};

const MAPS = {
  patio: {
    name:'Stone Reach — Pátio Central',
    onEnter:{scene:'abertura_patio', flag:'cena_abertura'},
    /* A Academia é área segura: a tensão começa na descida para o
       Subterrâneo, nunca no espaço de convivência dos NPCs. */
    fill:'.', region:'patio', outdoor:true, encounter:null, bgm:'field',
    tint:'rgba(30,20,60,0.18)',
    /* Decoração do pacote de props. Cada peça ocupa UMA casa e cresce
       para cima; `solido` só onde faz sentido esbarrar. Mover qualquer
       uma é mexer num número aqui — não é redesenhar o mapa em texto.
       Estes são poucos e de propósito: o pátio já tem 48 árvores, e
       encher o gramado tiraria o lugar de andar. */
    decor:[
      {x:4,  y:3,  s:'prop_flores', text:'Flores-de-éter — abrem só onde o chão está calmo há muito tempo.'},
      {x:36, y:3,  s:'prop_flores_rosa', text:'Estas nasceram rosadas depois que o Selo foi erguido. Ninguém sabe explicar o porquê.'},
      {x:2,  y:14, s:'prop_tronco', text:'Um tronco velho, bom para sentar entre uma aula e outra.'},
      {x:36, y:14, s:'prop_caixa',  solido:true, text:'Caixas do empório, ainda fechadas. Melhor não bulir.'},
      {x:37, y:14, s:'prop_barril', solido:true, text:'Cheira a éter destilado. Selado — não é para beber.'},
      {x:20, y:1,  s:'prop_poco',   solido:true, text:'A água lá no fundo reflete um brilho que não é do céu.'},
      {x:1,  y:6,  s:'prop_placa',
       text:'PLACA — "Bem-vindo(a) a Stone Reach. Silêncio nos jardins após o toque de recolher."'},
      {x:38, y:6,  s:'prop_fogueira', text:'O fogo arde estável, sem fumaça. Éter, de novo.'},
      {x:13, y:2,  s:'prop_academia_stone_reach', solido:true,
       text:'A fachada da Academia ainda ostenta o brasão original, gasto pelo tempo mas legível.'},
      {x:18, y:20, s:'prop_portao_stone_reach',
       text:'O portão sul de Stone Reach — pedra maciça, gravada com o mesmo selo que mantém o Subterrâneo fechado.'},
    ],
    rows:[
      '########################################',
      '#######................................#',
      '#####..................................#',
      '###....############...........#####....#',
      '#......#ffffffffff#...........#fff#....#',
      '#..TT..#ffffffffff#..T.....T..#fff#..T.#',
      '#......#####+######...........##+##....#',
      '#..........,,,,,.................,.....#',
      '#....,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#....,......~~~~~~....,......$....,....#',
      '#....,......~~~~~~....,...........,....#',
      '#....,,,,,,,~~~~~~,,,,,,,,,,,,,,,,,....#',
      '#....,......~~~~~~....,...........,....#',
      '#....,................,......*....,....#',
      '#+...,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....#',
      '#....,...........T....,....T......,....#',
      '#..T.,................,...........,.T..#',
      '#....,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....#',
      '#......................................#',
      '#..TT.........TT..........TT.......TT..#',
      '#.................S....................#',
      '########################################',
    ],
    spawn:{x:19,y:13,dir:'down'},
    warps:[
      {to:'hall',  tx:15, ty:11, dir:'up'},   // porta grande (1º '+') → entrada sul do salão
      {to:'annex', tx:7,  ty:5,  dir:'up'},   // anexo        (2º '+') → porta do anexo
      /* Acesso oeste seguro desde o começo. Entra antes da escada sul
         porque o marcador está acima dela na leitura da grade. */
      {to:'porto_lumina', tx:34, ty:14, dir:'right'},
      /* v4.8 — portão sul. Fica na ÚLTIMA linha jogável de propósito:
         a varredura de tiles é em ordem de leitura, então uma passagem
         nova só pode entrar no fim da lista sem renumerar as antigas.
         Travado até o Eco cair: a Mata Cindária é conteúdo de nível 19+
         e mandar o jogador para lá no começo seria um convite a morrer. */
      {to:'ashwood', tx:12, ty:2, dir:'down', needFlag:'echo_defeated',
       blockedMsg:'O portão sul está lacrado. Enquanto o Subterrâneo não estiver resolvido, ninguém sai de Stone Reach.'},
    ],
    chests:[ {item:'potion', qty:2} ],
    npcs:[
      {x:15,y:8,  name:'Aluno', sheet:'npc_aluno', wander:true,
       lines:['Você ouviu os boatos? Dizem que algo se mexe nos subterrâneos da academia...',
              'A diretora Felt mandou trancar todas as entradas. Mas eu vi luz lá embaixo ontem.']},
      // Missão em 3 estados, controlada por flags: oferta → aceita → entregue.
      {x:31,y:13, name:'Profa. Lina', sheet:'npc_lina',
       lines: G => {
         if (G.flags.lina_paga)
           return ['O Selo está quebrado e mesmo assim você voltou inteiro.',
                   'Guarde bem esse talismã. Ele zumbe quando o éter mente.'];
         if (G.flags.lina_aceita && G.flags.warden_defeated)
           return [{text:'Você desceu. E voltou. ...Então era verdade.'},
                   {text:'Pegue. Eu ia dar isso ao meu melhor aluno, e acho que já dei.',
                    choices:[
                      {label:'Aceitar o Selo Ressonante', set:{lina_paga:true},
                       run:() => { Bag.add('t_resson'); G.gold += 600; Sound.sfx('levelup');
                                   return ['Recebeu Selo Ressonante e 600₢!',
                                           'Equipe pelo menu: Equipar → Talismã.']; }},
                      {label:'Recusar (por enquanto)',
                       then:['Orgulho é caro. Volte quando cansar dele.']},
                    ]}];
         if (G.flags.lina_aceita)
           return ['O subterrâneo fica abaixo do Salão Principal. A escada existe, apesar do que dizem.',
                   'Confirme o que há lá embaixo. E volte. Essa parte não é opcional.'];
         return [{text:'Alunos de Stone Reach devem manter o controle sobre seu éter.'},
                 {text:'Perder o equilíbrio emocional é o primeiro passo para a corrupção elemental.'},
                 {text:'...Você não veio aqui para ouvir isso. Posso lhe pedir uma coisa?',
                  choices:[
                    {label:'Pode pedir.', set:{lina_aceita:true},
                     then:['Algo se mexe abaixo do Salão Principal. A diretora nega.',
                           'Desça. Confirme. Volte vivo. Nessa ordem.',
                           'Se voltar, eu tenho algo que vale a caminhada.']},
                    {label:'Agora não.',
                     then:['Compreendo. A oferta fica de pé.']},
                  ]}];
       }},
      {x:26,y:8, name:'Balconista', sheet:'npc_balconista', shop:'academia',
       lines:['Empório da Academia. Preço de aluno, que é caro do mesmo jeito.']},
      {x:19,y:17, name:'Kael Archimedes', sheet:'npc_kael', portrait:'kael_archimedes_portrait',
       lines:['O Polar Cross não é um conceito teórico. É a convergência dos quatro eixos elementais.',
              'Se vocês querem sobreviver ao que está vindo, vão precisar entender isso.',
              '...E não, eu não vou explicar de novo. Prestem atenção da próxima vez.']},
      {x:9,y:19,  name:'Zelador', sheet:'npc_zelador', wander:true, quest:'q_zelador',
       lines:['Cerca boa não deixa bicho subir. O problema é o que tem embaixo dela.']},
      /* Retrato dlg_farnese já cadastrado em DIALOGUE_SPRITES (22-dialogue.js)
         desde antes desta entrada existir — o corpo de campo é genérico
         (npc_viajante), o retrato grande de diálogo liga sozinho pelo nome. */
      {x:5,y:13, name:'Farnese', sheet:'npc_eremita',
       lines:['Não sou aluna daqui. Só uma pesquisadora seguindo o rastro de um éter que não deveria existir.',
              'Se perguntarem, diga que nunca me viu. Funciona melhor assim.']},
      /* Guest-tutorial (v5.32, ver GUEST_ALLIES): o único dos nove
         sempre disponível, sem `needFlag` — é o primeiro contato do
         jogador com a mecânica de área, antes de qualquer chefe. */
      {x:34,y:17, name:'Abel Nomikos', sheet:'abel_sheet',
       lines: G => {
         if (G.flags.abel_licao)
           return ['Fogo em área não escolhe quem queima primeiro. É por isso que ensino essa antes de qualquer outra.',
                   'Continue treinando. O resto do elenco vai cobrar isso de você.'];
         return [
           {text:'Fogo em área não escolhe quem queima primeiro. Quer ver o que quero dizer?'},
           {text:'Não é perigoso — é só uma forma que a lição toma.',
            choices:[
              {label:'Ver a demonstração', set:{abel_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.abel})); return null; }},
              {label:'Agora não', then:['Continue treinando. O resto do elenco vai cobrar isso de você.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:10,y:6, text:'PLACA — "Academia Stone Reach · Salão Principal. Mantenha o éter contido nos corredores."'},
    ],
    /* `need` espera o Eco cair; `flag` garante que toca uma vez só.
       O tile fica DUAS casas antes do portão, para a cena terminar com
       o jogador ainda de frente para ele. */
    triggers:[ {x:19, y:18, scene:'portao_sul', flag:'cena_portao', need:'echo_defeated'} ],
  },

  /* Porto seguro: água bloqueia; os três píeres de calçamento mantêm a
     rota percorrível. Props continuam fora da gramática compacta de tiles. */
  porto_lumina: {
    name:'Porto Lúmina', fill:'.', region:'porto_lumina', outdoor:true, encounter:null, bgm:'field',
    tint:'rgba(18,72,84,0.14)',
    /* Mantém `,` passável como caminho em toda a gramática de MAPS,
       mas aqui o chão é um cais de cedro, não calçamento de Stone Reach. */
    tileArt:{',':'tile_cais_lumina'},
    rows:[
      '######################################',
      '#....................................#',
      '#.TTTT........................TTTT...#',
      '#~~~~~~~~~~~~~~~,....................#',
      '#~~~~~~~~~~~~~~~,.#................#.#',
      '#~~~~~~~~~~~~~~~,.#ffffffffffffffff#.#',
      '#~~~~~~~~~~~~~~~,.#................#.#',
      '#~~~~~~~~~~~~~~~,.#................#.#',
      '#~~~~~~,,,,,,,,,,,,,,....+...........#',
      '#~~~~~~~~~~~~~~~,.....#............#.#',
      '#~~~~~~~~~~~~~~~,.....#ffffffffffff#.#',
      '#~~~~~~~~~~~~~~~,.....#............#.#',
      '#~~~~~~~~~~~~~~~,.....#............#.#',
      '#~~~~,,,,,,,,,,,,,,,,..........+.....#',
      '#~~~~~~~~~~~~~~~,,,,,,,,,,,,,,,,,,,,+#',
      '#~~~~~~~~~~~~~~~,....................#',
      '#~~~~~~~~~~~~~~~,....................#',
      '#~~~~~~~~~~~~~~~,.......#..........#.#',
      '#~~~~~~,,,,,,,,,,,,,,...#ffffffffff#.#',
      '#~~~~~~~~~~~~~~~,.......#..........#.#',
      '#~~~~~~~~~~~~~~~,.......#..........#.#',
      '######################################',
    ],
    spawn:{x:34, y:14, dir:'left'},
    /* As portas internas aparecem antes da saída leste na varredura da
       grade; a lista respeita exatamente essa ordem de leitura. */
    warps:[
      {to:'mesa_ambar', tx:8, ty:9, dir:'up'},
      {to:'mercado_mare', tx:8, ty:9, dir:'up'},
      {to:'patio', tx:1, ty:14, dir:'left'},
    ],
    chests:[],
    decor:[
      {x:7, y:8, s:'prop_barco_lumina', solido:true,
       text:'O Vento de Coral range contra as cordas. A vela turquesa está recolhida, mas o casco parece pronto para partir.'},
      {x:10, y:13, s:'prop_barco_pesca_lumina', solido:true,
       text:'Um barco de pesca traz redes secando ao sol. Alguém deixou uma concha azul no banco do remo.'},
      {x:7, y:18, s:'prop_barco_pesca_lumina', solido:true,
       text:'O pequeno casco balança vazio. Na popa, uma placa pintada diz apenas: "volto com a maré".'},
      {x:25,y:7, s:'prop_taverna_lumina', solido:true,
       text:'A taverna do cais ainda não abriu. Uma placa na porta promete: "Ao anoitecer, com a maré."'},
      {x:30,y:12,s:'prop_loja_lumina',solido:true,
       text:'A loja está fechada por hoje. As redes na vitrine secam mais devagar do que o dono promete.'},
      {x:20,y:4, s:'prop_placa',
       text:'PLACA — "PORTO LÚMINA · Cais do Sol, Mercado da Maré, Mesa de Âmbar".'},
      {x:18,y:16,s:'prop_placa',
       text:'PLACA DO CAIS — "Barcos atracados não são passagens. Pergunte antes de subir."'},
      {x:21,y:8,s:'prop_lampiao', text:'O lampião do píer queima óleo de peixe. O cheiro só incomoda quem não é daqui.'},
      {x:21,y:13,s:'prop_lampiao', text:'Aceso mesmo de dia — a névoa do cais engana a hora.'},
      {x:21,y:18,s:'prop_lampiao', text:'Este lampião pisca fora de ritmo. Ninguém consertou; ninguém reclamou.'},
      {x:17,y:3,s:'prop_flores_campo', text:'Flores de campo crescendo entre as pedras do píer. O sal não parece incomodá-las.'},
      {x:36,y:16,s:'prop_flores_rosa', text:'Flores rosadas, plantadas longe da água — a única parte do cais que não cheira a peixe.'},
      {x:23,y:20,s:'prop_barril',solido:true, text:'Barril vazio, virado de lado. Serve de banco para quem espera o barco.'},
      {x:22,y:20,s:'prop_caixa',solido:true, text:'Caixa de apetrechos de pesca. Alguém escreveu "NÃO MEXER" em três idiomas diferentes.'},
    ],
    npcs:[
      {x:18,y:8,name:'Iara, Mestra do Cais',sheet:'npc_viajante',
       lines:['Píer molhado, passo curto. O mar não precisa correr para derrubar ninguém.',
              'Stone Reach olha para dentro. Lúmina olha para o que chega. Os dois jeitos cobram seu preço.']},
      {x:19,y:13,name:'Nilo, Marinheiro',sheet:'npc_rapaz',wander:true,
       lines:['O Vento de Coral é da Iara. Eu só amarro as cordas e finjo que sei para onde ele vai.',
              'Um dia esses barcos vão atravessar o horizonte. Hoje, contentam-se com a maré.']},
    ],
    signs:[],
  },

  /* O comércio é um interior próprio: usa o estoque Lumina já definido,
     mas separa compra e conversa da circulação estreita do cais. */
  mercado_mare: {
    name:'Mercado da Maré', fill:'f', region:'porto_lumina', outdoor:false, encounter:null, bgm:'field',
    tint:'rgba(20,82,78,0.16)',
    rows:[
      '###################',
      '#bbbbbbbbbbbbbbbbb#',
      '#bfffffffBfffffffb#',
      '#bffbbfffffffbbffb#',
      '#bfffffffffffffffb#',
      '#bfffffffffffffffb#',
      '#bfffffffffffffffb#',
      '#bffbbfffffffbbffb#',
      '#bfffffffffffffffb#',
      '#bfffffff+fffffffb#',
      '###################',
    ],
    spawn:{x:8,y:9,dir:'up'},
    warps:[ {to:'porto_lumina', tx:30, ty:13, dir:'down'} ],
    chests:[],
    decor:[
      {x:2,y:2,s:'prop_lampiao',text:'A lâmpada cobre o balcão de dourado. O vidro verde foi polido com areia da maré baixa.'},
      {x:14,y:2,s:'prop_lampiao',text:'A chama azul do lampião é pequena e comum; Maira a chama de "luz para escolher sem pressa".'},
      {x:2,y:8,s:'prop_caixa',solido:true,text:'Caixa de rações seladas com cera coral. Cada uma traz um desenho diferente de peixe.'},
      {x:14,y:8,s:'prop_barril',solido:true,text:'Barril de água limpa para viajantes. Um fio turquesa marca o nível que ainda pode ser servido.'},
      {x:5,y:5,s:'prop_mesa_mercado',solido:true,text:'O balcão traz uma balança de latão, tecido teal e cerâmica coral. Nada aqui precisa ser violeta para parecer éter.'},
      {x:12,y:5,s:'prop_mesa_mercado',solido:true,text:'As mercadorias foram separadas por cor, não por preço: seco, frágil e espera de maré.'},
      {x:8,y:2,s:'prop_estandarte',text:'O estandarte tem listras de açafrão, coral e azul-marinho: as cores dos turnos de trabalho do cais.'},
    ],
    npcs:[
      {x:8,y:4,name:'Maira, Feirante',sheet:'npc_estudante',shop:'lumina',
       lines:['Chegou cedo: peixe, pomada, corda e uma ou duas coisas que a maré não devolveu.',
              'Não vendo promessa de viagem. Só o que cabe na mochila.']},
      {x:13,y:6,name:'Cássio, Estoquista',sheet:'npc_veterano',
       lines:['Ração vai à esquerda, corda à direita e vidro longe da água. É assim que o porto continua inteiro.',
              'A cor da etiqueta conta o que não cabe no preço: amarelo é seco, coral é frágil, azul espera a maré.']},
    ],
    signs:[
      {x:2,y:1,text:'PLACA DE MADEIRA — "MERCADO DA MARÉ · provisões para a estrada, não promessas de travessia".'},
    ],
  },

  /* Interior pequeno e social: não cura nem vende, para a Mesa de Âmbar
     ter identidade própria sem tomar o lugar da enfermaria ou do mercado. */
  mesa_ambar: {
    name:'Mesa de Âmbar', fill:'f', region:'porto_lumina', outdoor:false, encounter:null, bgm:'field',
    tint:'rgba(76,42,20,0.18)',
    rows:[
      '#################',
      '#bbbbbbbbbbbbbbb#',
      '#bffffBffffBfffb#',
      '#bff==ffff==fffb#',
      '#bffffccccfffffb#',
      '#bff^fccccf^fffb#',
      '#bffffccccfffffb#',
      '#bff==ffff==fffb#',
      '#bfffffffffffffb#',
      '#bffffff+ffffffb#',
      '#################',
    ],
    spawn:{x:8,y:9,dir:'up'},
    warps:[ {to:'porto_lumina', tx:25, ty:8, dir:'down'} ],
    chests:[],
    decor:[
      {x:2,y:8,s:'prop_barril',solido:true,text:'Barril de caldo cítrico. A tampa tem a cor do sol, mas o cheiro é de mar.'},
      {x:14,y:8,s:'prop_barril',solido:true,text:'Barril de água doce. A etiqueta diz: "não confundir com a outra".'},
      {x:2,y:2,s:'prop_lampiao',text:'A luz do lampião é âmbar, não mágica. Às vezes o comum é o luxo.'},
      {x:14,y:2,s:'prop_lampiao',text:'O vidro azul do lampião vem das redes de uma pescadora. Ele colore a fumaça de verde.'},
      {x:8,y:2,s:'prop_estandarte',text:'Um estandarte coral e turquesa mostra uma onda atravessando um sol dourado.'},
    ],
    npcs:[
      {x:8,y:4,name:'Tavio, Taverneiro',sheet:'npc_capataz',
       lines:['A Mesa de Âmbar serve caldo, notícia e silêncio. O último custa mais caro.',
              'Se o porto parece tranquilo demais, sente perto da janela. A água sempre conta primeiro.']},
      {x:8,y:8,name:'Bia, Navegadora',sheet:'npc_serva',
       lines:['As cores dos barcos não são enfeite. Coral volta antes do pôr do sol; turquesa só sai com mar manso.',
              'Aprendi a ler a água antes de aprender a ler papel. A água mente menos.']},
    ],
    signs:[
      {x:14,y:1,text:'QUADRO DE GIZ — "Caldo de peixe · pão de algas · notícia da manhã". A última linha foi apagada várias vezes.'},
    ],
  },

  hall: {
    name:'Stone Reach — Salão Principal',
    fill:'f', region:'hall', outdoor:false, encounter:null, bgm:'field',
    tint:'rgba(20,14,40,0.34)',
    rows:[
      '##############################',
      '#bbbbbb#ffffffffffffff#bbbbbb#',
      '#ffffff#ffffffffffffff#ffffff#',
      '#ff==ff+ffff^ffff^ffff+ff==ff#',
      '#ffffff#ffffffffffffff#ffffff#',
      '#########fccccccccccf#########',
      '#fffffffffccccccccccfffffffff#',
      '#ff^fffffBccccccccccBffff^fff#',
      '#ffffffffffccccccccffffffffff#',
      '#fffffffffffcccccc$ffffffffff#',
      '#ff^fffffffffcccc*ffffff^ffff#',
      '#ffffffffffffffffffffffffffff#',
      '#####f#ffffffff+ffffff########',
      '#####fr#######################',
      '#####Sr#######################',
      '##############################',
    ],
    spawn:{x:15,y:11,dir:'up'},
    warps:[
      {to:'library',   tx:11, ty:8,  dir:'up'},   // 1º '+' ala oeste  → porta da biblioteca
      {to:'library',   tx:11, ty:8,  dir:'up'},   // 2º '+' ala leste  → mesma sala
      {to:'patio',     tx:12, ty:7,  dir:'down'}, // 3º '+' saída sul  → porta do pátio
      {to:'undercroft',tx:5,  ty:2,  dir:'down'}, // 'S'    escada     → topo do subterrâneo
    ],
    chests:[ {item:'ether', qty:2} ],
    npcs:[
      {x:12,y:6, name:'Bibliotecária', sheet:'npc_bibliotecaria', quest:'q_bibliotecaria',
       lines:['O salão fecha ao anoitecer. Ordens da diretora.',
              'Aquela escada ali atrás... não existe. Entendido?']},
      {x:20,y:8, name:'Veterano', sheet:'npc_veterano', quest:'q_veterano',
       lines:['Cada elemento supera dois outros e apanha de dois outros. Decore o anel.',
              'Fogo e Gelo se odeiam. Luz e Trevas também. Nesses casos, ambos batem forte.']},
    ],
    signs:[
      {x:2, y:1, text:'QUADRO DE AVISOS — "Combate elemental só nas arenas de treino." Alguém acrescentou embaixo: "Ninguém nunca seguiu isso."'},
    ],
  },

  library: {
    name:'Stone Reach — Ala de Estudos',
    fill:'f', region:'hall', outdoor:false, encounter:null, bgm:'field',
    tint:'rgba(24,16,44,0.38)',
    rows:[
      '######################',
      '#bbbbbbbb##bbbbbbbbbb#',
      '#ffffffff##ffffffffff#',
      '#ff====fffffffff==fff#',
      '#ffffffffffffffffffff#',
      '#bbbb#fffff^^fffff#bb#',
      '#ffff#ffffffffffff#ff#',
      '#ffff#ffff$fffffff#ff#',
      '#ffffffffffffffffffff#',
      '#########ff+ff########',
      '######################',
    ],
    spawn:{x:11,y:8,dir:'up'},
    warps:[ {to:'hall', tx:8, ty:3, dir:'right'} ],   // volta pela porta oeste do salão
    chests:[ {item:'hipot', qty:1} ],
    npcs:[
      {x:6,y:4, name:'Estudante', sheet:'npc_estudante',
       lines:['"Ressonância": quando o éter de um mago transborda, o corpo vira condutor.',
              'Dizem que dá pra sentir. Um zumbido no peito. Aí é só soltar.']},
      /* Retrato dlg_malquior já cadastrado em DIALOGUE_SPRITES; corpo de
         campo genérico (npc_encapuzado), retrato liga sozinho pelo nome.
         Guest-tutorial: uma luta de demonstração de 1-2 rodadas contra
         uma "tinta que aprendeu a se mexer" (não é o Subterrâneo de
         verdade vazando pra área segura — é só a forma que a lição
         toma). Ensina a marcar alvo. Flag trava em uma vez só.
         v5.32 — `needFlag` gradua a aparição: só depois do Eco caído,
         pra não competir com o Abel (sempre disponível) logo de cara. */
      {x:17,y:6, name:'Malquior Morningstar', sheet:'npc_encapuzado', needFlag:'echo_defeated',
       lines: G => {
         if (G.flags.malquior_licao)
           return ['Os livros bons não estão nas prateleiras. Estão em quem os leu e não voltou a ser o mesmo.',
                   'Continue lendo. Eu não mordo. Ainda.'];
         return [
           {text:'Os livros bons não estão nas prateleiras. Estão em quem os leu e não voltou a ser o mesmo.'},
           {text:'Quer ver uma coisa? Não é perigoso — é só tinta que aprendeu a se mexer.',
            choices:[
              {label:'Ver a demonstração', set:{malquior_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.malquior})); return null; }},
              {label:'Agora não', then:['Continue lendo. Eu não mordo. Ainda.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:16,y:3, text:'LIVRO ABERTO — "Guarde-se quando o inimigo respirar fundo. Metade do dano é metade do luto."'},
    ],
  },

  annex: {
    name:'Stone Reach — Anexo Oeste',
    fill:'f', region:'hall', outdoor:false, encounter:null, bgm:'field',
    tint:'rgba(20,16,36,0.32)',
    rows:[
      '################',
      '#bbbb##ffffffff#',
      '#ffff##ff====ff#',
      '#ff^fffffffffff#',
      '#ffffffff$fffff#',
      '#ffff##ffffffff#',
      '#####ff+ff######',
      '################',
    ],
    spawn:{x:8,y:5,dir:'up'},
    warps:[ {to:'patio', tx:32, ty:7, dir:'down'} ],
    chests:[ {item:'phoenix', qty:1} ],
    npcs:[
      {x:13,y:2, name:'Enfermeira', sheet:'npc_enfermeira', quest:'q_enfermeira',
       lines:['Sente-se. Você está drenado.', '...Pronto. Party inteira restaurada. Não faça disso um hábito.'],
       heal:true},
      /* Retrato dlg_sebastian já cadastrado em DIALOGUE_SPRITES; corpo de
         campo genérico (npc_batedor), retrato liga sozinho pelo nome.
         Guest-tutorial: mesma ideia de Malquior na Biblioteca, mas
         ensinando a provocar (puxar o alvo do inimigo). Flag trava em
         uma vez só. `needFlag`: só depois do chefe de Ashpyre cair. */
      {x:4,y:3, name:'Sebastian Crowley', sheet:'npc_batedor', needFlag:'cinder_defeated',
       lines: G => {
         if (G.flags.sebastian_licao)
           return ['A enfermaria é um bom lugar para observar quem finge estar bem.',
                   'Não se preocupe comigo. Eu só... visito.'];
         return [
           {text:'A enfermaria é um bom lugar para observar quem finge estar bem.'},
           {text:'Deixe eu mostrar uma coisa — nada que a Enfermeira precise saber.',
            choices:[
              {label:'Ver a demonstração', set:{sebastian_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.sebastian})); return null; }},
              {label:'Agora não', then:['Não se preocupe comigo. Eu só... visito.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:15, y:1, text:'PLACA — "Anexo Oeste · Enfermaria. Traga o ferido, não o orgulho."'},
    ],
  },

  undercroft: {
    name:'Subterrâneo Selado',
    /* P0 de mobs no campo: este é o primeiro mapa que troca a rolagem
       por encontros visíveis. Os estados abaixo são só configuração;
       morte, respawn e patrulha nascem em runtime no carregamento. */
    fill:'x', region:'undercroft', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(10,6,24,0.5)',
    rows:[
      '##################################',
      '#####Sxx##########################',
      '#####xxx######xxxxxxxxx###########',
      '#####xxxxxxxxxxxxxxxxxx###########',
      '#####xxx######xxx###xxx###########',
      '#####xxx######xxx###xxxxxxxxxx####',
      '#####xxx##B###xxx###xxx#####xx####',
      '#####xxxxxxxxxxxx###xxx#####xx####',
      '#####xxx######rrr###xxx#####$x####',
      '#####xxx###########xxxx#####xx####',
      '#xxxxxxx###########xxx##rrrrxx####',
      '#xxx################xxxxxxxxxx####',
      '#xxx#####xxxxxx#####xxx###########',
      '#xxxxxxxxxxxxxx#####xxx###########',
      '#xxx#####xxxxxx###B#xxx###########',
      '#xxx#####xxx$xx#####xxx###########',
      '#xxx#####xxxxxx#####xxx###########',
      '#xxxxxxxxxxxxxxxxxxxxxx###########',
      '#xxx##############xxxxx###########',
      '#*xx##############xxxxx###########',
      '#xxx##############xxx+xS##########',
      '##################################',
    ],
    spawn:{x:6,y:1,dir:'down'},
    /* A varredura casa marcador com passagem em ordem de LEITURA. O 'S'
       do esgoto entrou À DIREITA do '+' do santuário, na mesma linha:
       é a única posição que acrescenta uma saída no fim da lista sem
       renumerar as duas antigas. */
    warps:[
      {to:'hall',    tx:5,  ty:13, dir:'up'},   // 'S' de volta ao salão
      {to:'sanctum', tx:10, ty:9,  dir:'up'},   // '+' porta do santuário
      {to:'esgoto',  tx:2,  ty:2,  dir:'down'}, // 'S' (à direita) → bueiro
    ],
    chests:[ {item:'ether', qty:3}, {item:'hipot', qty:2} ],
    npcs:[],
    mobs:[
      /* Os lobos que o Zelador rastreia não entram mais na Academia:
         formam a primeira patrulha hostil da descida. */
      {id:'rastros_lobos', x:18, y:3,  visual:'wolf',  formation:[['wolf', 2]], patrol:1},
      {id:'golem_sombra',  x:21, y:7,  visual:'golem', formation:[['golem', 1], ['shade', 1]], patrol:1},
      {id:'servo_inverno', x:12, y:12, visual:'frost', formation:[['frost', 1]], patrol:1},
    ],
    signs:[
      {x:9,y:6, text:'INSCRIÇÃO — "O que foi selado aqui não dorme. Apenas espera ser lembrado."'},
    ],
  },

  sanctum: {
    name:'Câmara do Selo',
    fill:'x', region:'undercroft', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(14,4,26,0.55)',
    rows:[
      '#####################',
      '#####xxxxxSxxxxx#####',
      '###xxxxxxxxxxxxxxx###',
      '##xxxx^xxxxxxx^xxxx##',
      '##xxxxxxxxxxxxxxxxx##',
      '##xxxxxxxxxxxxxxxxx##',
      '##xxxxxxxxxxxxxxxxx##',
      '##xxxx^xxxxxxx^xxxx##',
      '###xxxxxxxxxxxxxxx###',
      '####xxxxx*xxxxxx#####',
      '#########x+x#########',
      '#####################',
    ],
    spawn:{x:10,y:9,dir:'up'},
    warps:[
      // 'S' (linha 1) vem antes do '+' (linha 10) na ordem de varredura
      {to:'deepway', tx:4, ty:2, dir:'down', needFlag:'warden_defeated',
       blockedMsg:'A escada desce para um breu que engole a luz da tocha. Algo ainda a guarda.'},
      {to:'undercroft', tx:21, ty:19, dir:'up'},
    ],
    chests:[],
    /* Guest-tutorial (v5.32, ver GUEST_ALLIES): Ava só aparece depois
       que o Guardião do Selo cai — é a primeira lição pós-chefe,
       esperando bem onde a vitória aconteceu. */
    npcs:[
      {x:13,y:7, name:'Ava Rosa Groot', sheet:'ava_sheet', needFlag:'warden_defeated',
       lines: G => {
         if (G.flags.ava_licao)
           return ['O chão ainda lembra do Guardião. Um escudo bom faz o grupo esquecer mais rápido.',
                   'Volte sempre que precisar respirar.'];
         return [
           {text:'Vocês derrubaram o que segurava esta câmara. Impressionante — e um pouco imprudente.'},
           {text:'Deixe eu mostrar uma forma mais segura de aguentar o próximo.',
            choices:[
              {label:'Ver a demonstração', set:{ava_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.ava})); return null; }},
              {label:'Agora não', then:['Volte sempre que precisar respirar.']},
            ]},
         ];
       }},
    ],
    decor:[
      {x:10, y:3, s:'prop_altar_selo', solido:true,
       text:'O altar rachado ainda pulsa com o resto de um selo antigo. É daqui que ele nunca deveria ter saído.'},
    ],
    signs:[
      {x:6, y:3, text:'INSCRIÇÃO NA PEDRA — "O que se sela, também se lembra."'},
    ],
    boss:{id:'warden', x:10, y:4, flag:'warden_defeated',
          intro:['Algo enorme se desdobra da parede. Não tem rosto — tem memória.',
                 'O SELO QUEBRADO: "Vocês vieram lembrar. Que gentileza."'],
          outro:['O Selo Quebrado se desfaz em cinzas de éter.',
                 'Atrás de onde ele estava, uma escada continua descendo — agora aberta.']},
  },

  deepway: {
    name:'Galeria Profunda',
    /* v5.31 — troca encontro aleatório por mob visível, mesma regra do
       Subterrâneo Selado (P0). Fecha o trio: Selado e Câmara já eram
       mob/seguro, só a Galeria ainda rolava passo. */
    fill:'x', region:'deepway', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(8,4,20,0.56)',
    rows:[
      '##############################',
      '####S#########################',
      '####xx########################',
      '#####xxxxxxxxxxxxxxxxxxxx#####',
      '#####x##################x#####',
      '#####x##xxxxxxxxxxxx####x#####',
      '#####x##xxxxx$xxxxxx####x#####',
      '#####xxxxxxxxxxxxxxx####x#####',
      '#####x##xxxxxxxxxBxx####x#####',
      '#####x##xxxxxxxxxxxx####x#####',
      '#####x##################x#####',
      '#####xxxxxxxx*xxxxxxxxxxx#####',
      '#####x##################x#####',
      '#####x###xxxxxxxxxx#####x#####',
      '#####x###xxxxxxxxxx#####x#####',
      '####+xxxxxxxxxxxxxx#####x#####',
      '#####x###xxxxxxxxxx#####x#####',
      '#####x###xxxx$xxxxx#####x#####',
      '#####x##################x#####',
      '#####xxxxxxxxxxxxxxxxxxxx#####',
      '###########xxxxxx#############',
      '##############################',
    ],
    spawn:{x:4,y:2,dir:'down'},
    /* O '+' da parede oeste é beco sem saída de propósito: uma porta no
       meio de corredor faria o jogador teleportar só de passar por ele. */
    warps:[
      {to:'sanctum', tx:10, ty:2, dir:'down'},
      {to:'lago', tx:2, ty:10, dir:'right'},   // '+' oeste → fenda do lago
    ],
    chests:[ {item:'hiether', qty:2}, {item:'a_coura', qty:1} ],
    npcs:[
      {x:12,y:8, name:'Mercador Errante', sheet:'npc_mercador', shop:'errante', quest:'q_mercador',
       lines: G => G.flags.echo_defeated
         ? ['Você matou o Eco. Agora eu vendo o que sobrou dele. Negócio é negócio.']
         : ['Não pergunte como cheguei aqui. Pergunte o que eu tenho.',
            'Preço de fim de mundo, mas você não tem concorrência.']},
    ],
    signs:[
      {x:13,y:12, text:'INSCRIÇÃO — "O Primeiro não foi selado. Foi esquecido. É pior."'},
    ],
    mobs:[
      {id:'ocos_galeria',  x:10, y:6,  visual:'hollow',   formation:[['hollow',2]], patrol:1},
      {id:'guarda_luz',    x:17, y:6,  visual:'sentinel', formation:[['sentinel',1],['revenant',1]], patrol:1},
      {id:'teceloas',      x:14, y:14, visual:'weaver',   formation:[['weaver',1],['harpy',1]], patrol:1},
    ],
    boss:{id:'echo', x:13, y:20, flag:'echo_defeated',
          intro:['A galeria termina num rosto que é só contorno — luz onde deveria haver alguém.',
                 'O ECO DO PRIMEIRO: "Vocês lembraram de mim. Eu preferia o contrário."'],
          outro:['O Eco se apaga como quem finalmente é permitido esquecer.',
                 'A Galeria fica em silêncio. Pela primeira vez, um silêncio comum.']},
  },

  /* ===================================================================
     v4.8 — AS TRÊS REGIÕES NOVAS
     Cada uma é um par: um mapa de EXPLORAÇÃO (acampamento, missões,
     loja, encontros) e uma sala de CHEFE isolada. O par existe porque
     chefe com encontro aleatório na mesma sala é uma armadilha: o
     jogador chega no chefe sem MP e culpa o jogo, com razão.

     A corrente é: Pátio →(Eco morto)→ Mata Cindária → Clareira da Pira
     →(Chama morta)→ Cisterna → Comporta →(Afogado morto)→ Coroa de
     Vidro → Cume. Cada porta travada diz POR QUE está travada.
     =================================================================== */

  ashwood: {
    name:'Mata Cindária',
    onEnter:{scene:'chegada_mata', flag:'cena_mata'},
    /* v5.31 — mob visível em vez de encontro por passo, mesma regra do
       Subterrâneo (P0). Fica fora do acampamento cercado, na mata aberta. */
    fill:'.', region:'ashwood', outdoor:true, encounter:null, bgm:'field',
    tint:'rgba(60,24,10,0.22)',
    rows:[
      '##################################',
      '#...........S....................#',
      '#..TT.......,....TT..............#',
      '#...........,....................#',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#,...BffffffffffffB..............#',
      '#,...ff==ffff==fff...............#',
      '#,...fffff$ffffffff..............#',
      '#,...ffffffff*fffff..............#',
      '#,...ffffffffffffff..............#',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#...TT...........T...........TT..#',
      '#................,...............#',
      '#..TT............,..........TT...#',
      '#................,...............#',
      '#...TT..T........,......T....T...#',
      '#................,...............#',
      '#....TT..........,.........TT....#',
      '#................+.......S.......#',
      '##################################',
    ],
    spawn:{x:12, y:2, dir:'down'},
    warps:[
      {to:'patio',   tx:19, ty:19, dir:'up'},    // 'S' (linha 1) → portão sul do pátio
      {to:'ashpyre', tx:9,  ty:2,  dir:'down'},  // '+' (linha 18) → clareira da pira
      /* v4.9 — trilha leste para o Ninhal. Entrou À DIREITA do '+' na
         MESMA linha de propósito: a varredura de tiles é em ordem de
         leitura, então esta é a única posição que acrescenta uma
         passagem no fim da lista sem renumerar as duas antigas. */
      {to:'nests',   tx:9,  ty:2,  dir:'down'},  // 'S' (linha 18, à direita) → Ninhal
    ],
    chests:[ {item:'a_casco', qty:1} ],
    decor:[
      {x:4,y:8,s:'prop_acampamento_cinzas',solido:true,
       text:'O acampamento foi montado entre troncos que ainda soltam cinza. A lona teal e o braseiro de cobre mantêm a vigília em cores de gente viva.'},
    ],
    npcs:[
      {x:6,y:9,  name:'Batedora', sheet:'npc_batedor', quest:'q_batedora',
       lines:['Cinza no chão é pegada apagada. Ande pelo caminho batido se quiser voltar.']},
      {x:9,y:9,  name:'Lenhador', sheet:'npc_ruivo', quest:'q_lenhador',
       lines:['Trinta anos cortando lenha e foi aqui que a lenha resolveu revidar.']},
      {x:13,y:9, name:'Guarda-Fogo', sheet:'npc_kael', portrait:'kael_archimedes_portrait', quest:'q_guardafogo',
       lines:['Fogo não perdoa distração. Nem eu, mas eu pelo menos aviso antes.']},
      {x:17,y:9, name:'Alquimista', sheet:'npc_escriba', shop:'acampamento', quest:'q_alquimista',
       lines:['Bem-vindo ao acampamento. Preço de fim de mundo, mas o mundo é este aqui mesmo.']},
      {x:20,y:6, name:'Enfermeira do Acampamento', sheet:'npc_serva', heal:true,
       lines:['Sente-se antes de cair.', '...Pronto. Grupo inteiro de pé. Não abuse.']},
    ],
    mobs:[
      {id:'alcateia_cinza',   x:25, y:2,  visual:'ashwolf',   formation:[['ashwolf',2]], patrol:1},
      {id:'tronco_e_brasa',   x:22, y:12, visual:'charwood',  formation:[['charwood',1],['emberling',2]], patrol:1},
      {id:'mago_de_cinzas',   x:10, y:16, visual:'cindermage',formation:[['cindermage',1],['ashwolf',1]], patrol:1},
    ],
    signs:[
      {x:4,y:11, text:'TÁBUA PREGADA NA ÁRVORE — "A mata não queimou. A mata AINDA está queimando. Não é a mesma coisa."'},
    ],
  },

  ashpyre: {
    name:'Clareira da Pira',
    fill:'d', region:'ashwood', outdoor:true, encounter:null, bgm:'dungeon',
    tint:'rgba(80,20,4,0.34)',
    rows:[
      '###################',
      '#########+#########',
      '#####ddddddddd#####',
      '###ddddddddddddd###',
      '##ddddddddddddddd##',
      '#ddddddBdddBdddddd#',
      '#ddddddddddddddddd#',
      '#ddddddddddddddddd#',
      '#ddddddddddddddddd#',
      '#ddddddddd*dddddddd',
      '##ddddddddddddddd##',
      '###ddddddddddddd###',
      '#####ddddSdddd#####',
      '###################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[
      {to:'ashwood', tx:17, ty:17, dir:'up'},     // '+' (linha 1) → volta à mata
      {to:'cistern', tx:9,  ty:2,  dir:'down', needFlag:'cinder_defeated',
       blockedMsg:'A pira ainda arde sobre o alçapão. Enquanto a Chama lembrar, ninguém desce.'},
    ],
    chests:[],
    npcs:[],
    signs:[
      {x:7,y:5, text:'BRASEIRO — a lenha aqui nunca acaba. Alguém repõe, ou nada disso é lenha.'},
    ],
    triggers:[ {x:9, y:4, scene:'pira_antes', flag:'cena_pira'} ],
    boss:{id:'cinder', x:9, y:6, flag:'cinder_defeated',
          intro:['No meio da clareira, o fogo tem forma de gente sentada.',
                 'A CHAMA QUE LEMBRA: "Eu queimo porque me pediram. Ninguém veio me dizer que parasse."'],
          cena:'pira_depois'},
  },

  /* ===================================================================
     v4.9 — NINHAL DE ÉTER
     Região dos pets, pendurada na Mata Cindária em vez de no fim da
     corrente: o jogador precisa de horas COM o bicho, e um sistema
     desbloqueado no último mapa é um sistema que ninguém usa.

     Desenhado LARGO desde o primeiro rascunho — dois pátios de criação
     com quatro casas de folga em volta de cada NPC. É resposta direta
     ao que quebrou no `spire`: lá os corredores tinham uma casa e os
     NPCs viraram parede. Há teste travando a regra agora.
     =================================================================== */
  nests: {
    name:'Ninhal de Éter',
    onEnter:{scene:'chegada_ninhal', flag:'cena_ninhal'},
    /* v5.31 — mob visível na pastagem aberta ao sul dos dois pátios de
       criação, longe dos NPCs de missão. */
    fill:'.', region:'nests', outdoor:true, encounter:null, bgm:'field',
    tint:'rgba(20,40,30,0.20)',
    rows:[
      '##############################',
      '#########S####################',
      '#######pppppp#################',
      '#####pppppppppp###############',
      '###ppppppppppppppppppppp######',
      '###ppfffffffpppfffffffpp######',
      '###ppfff*fffpppff$ffffpp######',
      '###ppfffffffpppfffffffpp######',
      '###ppppppppppppppppppppp######',
      '###ppTTpppppppppppppTTpp######',
      '###ppppppppppppppppppppp######',
      '###ppppppppppppppppppppp######',
      '###ppTpppppppppppppppTpp######',
      '###ppppppppppppppppppppp######',
      '#####ppppppppppppppppp########',
      '#########pppppppp#############',
      '#########ppp+pppp#############',
      '##############################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[
      {to:'ashwood',    tx:17, ty:13, dir:'down'},  // 'S' (linha 1) → mata
      {to:'nests_deep', tx:9,  ty:2,  dir:'down'},  // '+' (linha 16) → chocadeira
    ],
    chests:[ {item:'p_bolo', qty:2} ],
    npcs:[
      {x:6,y:6,  name:'Tratadora', sheet:'npc_serva', quest:'q_plumas',
       lines:['Aqui a gente não doma nada. A gente cuida, e às vezes o bicho decide ficar.']},
      /* Um NPC dá UMA missão (`npc.quest` é um id só), então cada missão
         do Ninhal precisa de dono próprio. Há teste que pega missão
         órfã — foi ele que cobrou estes dois. */
      {x:5,y:6,  name:'Parteira de Ninho', sheet:'npc_bibliotecaria', quest:'q_casulos',
       lines:['Um em cinco vinga. Todo ano é assim e todo ano eu me surpreendo.']},
      {x:16,y:6, name:'Pastor de Cria', sheet:'npc_rapaz', quest:'q_cornudas',
       lines:['Cria solta é cria morta. Eu conto de hora em hora e nunca bate.']},
      {x:10,y:6, name:'Caçador de Ninho', sheet:'npc_arqueiro', quest:'q_presas',
       lines:['Caçar pra alimentar ninho é a única caçada que eu ainda respeito.']},
      {x:19,y:6, name:'Ferreiro do Ninhal', sheet:'npc_ferreiro', quest:'q_escamas',
       lines:['Placa de cascudo fica mais dura depois de molhada. Ninguém sabe explicar.']},
      {x:21,y:6, name:'Vigia do Ninhal', sheet:'npc_arqueiro', quest:'q_ladroes',
       lines:['Nove anos vigiando. Sei diferenciar bicho com fome de bicho com plano.']},
      {x:11,y:11, name:'Guardiã de Ninho', sheet:'npc_camponesa', quest:'q_dragao',
       lines:['Tem um ovo aqui que não é daqui. Não pergunte agora — eu ainda não sei responder.']},
      {x:15,y:11, name:'Mercador de Ninho', sheet:'npc_cigana', shop:'ninhal',
       lines:['Petisco, ração e o que mais o bicho aceitar. Preço de quem tem monopólio.']},
    ],
    mobs:[
      {id:'ninhada_solta', x:8,  y:10, visual:'ninho',  formation:[['ninho',2],['cascudo',1]], patrol:1},
      {id:'bando_ladrao',  x:18, y:10, visual:'cornuda',formation:[['cornuda',1],['ladraninho',2]], patrol:1},
      {id:'enxame_matriz', x:8,  y:13, visual:'matriz', formation:[['matriz',1],['vespao',2]], patrol:1},
      {id:'ceifa_larvar',  x:18, y:13, visual:'pilhador',formation:[['pilhador',1],['larva',1],['matriarca',1]], patrol:1},
    ],
    signs:[
      {x:6,y:9, text:'TÁBUA — "Não corra perto do ninho. Cria não distingue pressa de ataque."'},
    ],
  },

  nests_deep: {
    name:'A Chocadeira',
    fill:'.', region:'nests', outdoor:true, encounter:null, bgm:'dungeon',
    tint:'rgba(16,32,24,0.34)',
    rows:[
      '###################',
      '#########+#########',
      '#####,,,,,,,,,#####',
      '###,,,,,,,,,,,,,###',
      '##,,,,,,,,,,,,,,,##',
      '#,,,,,,TTT,,,,,,,,#',
      '#,,,,,,,,,,,,,,,,,#',
      '#,,,,,,,,,,,,,,,,,#',
      '#,,,,,,,,,,,,,,,,,#',
      '#,,,,,,,,*,,,,,,,,#',
      '##,,,,,,,,,,,,,,,##',
      '###,,,,,,,,,,,,,###',
      '#####,,,,,,,,,#####',
      '###################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[ {to:'nests', tx:12, ty:15, dir:'up'} ],
    chests:[],
    /* Guest-tutorial (v5.32, ver GUEST_ALLIES): Orfeu só aparece depois
       que A Que Choca cai. */
    npcs:[
      {x:14,y:10, name:'Orfeu Bauss', sheet:'orfeu_sheet', needFlag:'ninho_defeated',
       lines: G => {
         if (G.flags.orfeu_licao)
           return ['Ela chocou seis e você derrubou a sétima. Aprenda a esperar o golpe antes de responder.',
                   'Continue de pé. É a parte que mais importa.'];
         return [
           {text:'Você derrubou a mãe da ninhada. Eu vi de longe — respeito.'},
           {text:'Quer aprender a virar o golpe do inimigo contra ele?',
            choices:[
              {label:'Ver a demonstração', set:{orfeu_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.orfeu})); return null; }},
              {label:'Agora não', then:['Continue de pé. É a parte que mais importa.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:8,y:5, text:'ÁRVORE MARCADA — dezenas de riscos. Alguém contou cada cria que saiu daqui.'},
    ],
    triggers:[ {x:9, y:4, scene:'chocadeira_antes', flag:'cena_chocadeira'} ],
    boss:{id:'ninhomae', x:9, y:7, flag:'ninho_defeated',
          intro:['O que parecia um monte de folhas se levanta, e continua se levantando.',
                 'A QUE CHOCA: "Vocês levaram seis. Eu deixei. Este é meu."'],
          cena:'chocadeira_depois'},
  },

  cistern: {
    name:'Cisterna Afogada',
    onEnter:{scene:'chegada_cisterna', flag:'cena_cisterna'},
    /* v5.31 — mob visível no salão largo, longe do entulho e dos NPCs. */
    fill:'x', region:'cistern', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(6,20,34,0.52)',
    /* v4.8.1 — REDESENHADO pelo mesmo motivo do `spire`: quatro dos
       cinco NPCs estavam parados em corredor de uma casa. Aqui não
       chegava a trancar nada (havia desvio pelas fileiras paralelas),
       mas andar era um jogo de esquiva. Agora é um salão largo com
       entulho `r` como obstáculo — obstáculo que dá para contornar,
       que é diferente de gargalo. */
    rows:[
      '################################',
      '#########S######################',
      '#######xxxxxxxxxx###############',
      '#######xxxxxxxxxx###############',
      '####xxxxxxxxxxxxxxxxxxxx########',
      '####x~~~~xxxxxxxx~~~~~~x########',
      '####x~~~~xxxxxxxx~~~~~~x########',
      '####xxxxxxxxxxxxxxxxxxxx########',
      '####xxxxrxxxxxxxxxxrxxxx########',
      '####xxxxxxxx$xxxxxxxxxxx########',
      '####xxxxxxxrxxxxrxxxxxxx########',
      '####xxxxxxxxxxxxxxxxxxxx########',
      '####xxxxxxx*xxxxxxxxxxxx########',
      '####xxxxrxxxxxxxxxxrxxxx########',
      '####x~~~~~~~~~~~~~~~~~~x########',
      '####xxxxxxxxxxxxxxxxxxxx########',
      '#########xxxxxxxx###############',
      '#########xxxxxxxx###############',
      '#########xxxx+xxx###############',
      '################################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[
      {to:'ashpyre',      tx:9, ty:11, dir:'up'},    // 'S' (linha 1) → clareira
      {to:'cistern_deep', tx:9, ty:2,  dir:'down'},  // '+' (linha 18) → comporta
    ],
    chests:[ {item:'a_escama', qty:1} ],
    decor:[
      {x:23,y:15,s:'prop_comporta_eter',solido:true,
       text:'Uma comporta de latão, pedra molhada e vidro teal regula a água com a paciência de uma máquina antiga. A luz âmbar indica que ainda há pressão.'},
    ],
    npcs:[
      {x:6,y:8,  name:'Engenheira', sheet:'npc_professor', quest:'q_comporta',
       lines:['Esta cisterna foi feita para guardar água limpa. Alguém mudou o projeto no meio.']},
      {x:6,y:10, name:'Escriturário', sheet:'npc_clerigo', quest:'q_contagem',
       lines:['Eu não vim salvar ninguém. Eu vim anotar. É o que eu sei fazer.']},
      {x:21,y:8, name:'Mergulhador', sheet:'npc_ruivo', quest:'q_canto',
       lines:['Nunca mergulhe ouvindo. Quem ouve, desce e não sobe.']},
      {x:21,y:10, name:'Enfermeira de Campo', sheet:'npc_anciana', quest:'q_aguaeter', heal:true,
       lines:['Deite aí. Eu conserto o que der.', '...Pronto. Grupo restaurado. Vá com calma.']},
      {x:13,y:11, name:'Contrabandista', sheet:'npc_encapuzado', shop:'cisterna',
       lines:['Eu vendo o que a água devolve. E a água devolve muita coisa.']},
      {x:16,y:7, name:'Anciã da Comporta', sheet:'npc_camponesa', quest:'q_sanguessuga',
       lines:['Três sanguessugas pálidas presas no cano principal. Raras, graças ao éter — e famintas por causa disso.']},
    ],
    mobs:[
      {id:'comporta_presa', x:9,  y:11, visual:'sluicewarden', formation:[['sluicewarden',1],['drowned',2]], patrol:1},
      {id:'canto_afogado',  x:19, y:11, visual:'siren',        formation:[['siren',2],['paleleech',1]], patrol:1},
    ],
    signs:[
      {x:3,y:9, text:'PLACA ENFERRUJADA — "Nível máximo permitido: 2 m. Assinado: Diretoria, há muito tempo."'},
    ],
  },

  cistern_deep: {
    name:'A Comporta',
    fill:'x', region:'cistern', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(4,16,30,0.58)',
    rows:[
      '###################',
      '#########+#########',
      '#####xxxxxxxxx#####',
      '###xxxxxxxxxxxxx###',
      '##xxxxxxxxxxxxxxx##',
      '#xxxxxxBxxxBxxxxxx#',
      '#xxxxxxxxxxxxxxxxx#',
      '#xxxx~~~~~~~~~xxxxx',
      '#xxxxxxxxxxxxxxxxx#',
      '#xxxxxxxxx*xxxxxxxx',
      '##xxxxxxxxxxxxxxx##',
      '###xxxxxxxxxxxxx###',
      '#####xxxxSxxxx#####',
      '###################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[
      {to:'cistern', tx:13, ty:17, dir:'up'},     // '+' (linha 1) → volta à cisterna
      {to:'spire',   tx:9,  ty:2,  dir:'down', needFlag:'deluge_defeated',
       blockedMsg:'A comporta está fechada por dentro. Alguém a segura — e ainda respira.'},
    ],
    chests:[],
    /* Guest-tutorial (v5.32, ver GUEST_ALLIES): Beatriz só aparece
       depois que o Dono do Pântano cai. */
    npcs:[
      {x:14,y:10, name:'Beatriz Demeter', sheet:'beatriz_sheet', needFlag:'deluge_defeated',
       lines: G => {
         if (G.flags.beatriz_licao)
           return ['A água aqui ainda carrega o que ele era. Cure o grupo inteiro antes que carregue vocês também.',
                   'Vá em paz. E com o grupo de pé.'];
         return [
           {text:'Vocês tiraram o que afundava tudo daqui. Bom trabalho — mas ninguém saiu ileso, eu vejo.'},
           {text:'Deixe eu mostrar como curar todo mundo de uma vez.',
            choices:[
              {label:'Ver a demonstração', set:{beatriz_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.beatriz})); return null; }},
              {label:'Agora não', then:['Vá em paz. E com o grupo de pé.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:7,y:5, text:'MARCA NA PAREDE — riscos de unha contando dias. Param no dia noventa e um.'},
    ],
    triggers:[ {x:9, y:4, scene:'comporta_antes', flag:'cena_comporta'} ],
    /* v5.23: o Dono do Pântano assume a alcova. A flag continua sendo
       `deluge_defeated` de propósito — é ela que o resto do capítulo
       consulta, e trocar o nome apagaria o progresso de quem já venceu
       aqui num save anterior. */
    /* v-atual: retrato calmo próprio (boss_pantano_retrato) — antes o
       nome vinha cru dentro do texto porque não havia arte para o
       speaker acender de verdade (ver Msg.draw() em 22-dialogue.js). */
    boss:{id:'swampking', x:9, y:6, flag:'deluge_defeated', retrato:'boss_pantano_retrato',
          intro:['A lama se abre e o que sai dela não é água: é carapaça, e é antiga.',
                 '"Tudo que afunda nestas águas é meu."',
                 '"Saia."'],
          cena:'comporta_depois'},
  },

  spire: {
    name:'Coroa de Vidro',
    onEnter:{scene:'chegada_coroa', flag:'cena_coroa'},
    /* v5.31 — mob visível nos dois salões largos do topo, longe dos
       corredores de uma casa que o teste de travessia protege. */
    fill:'o', region:'spire', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(30,28,10,0.42)',
    /* v4.8.1 — REDESENHADO. A versão anterior era um anel de corredores
       de UMA casa, e NPC é sólido (`isSolid` conta npcs): a Astrônoma e
       o Último Arauto viraram paredes literais e trancaram a porta do
       chefe, o cristal de save e o Eremita. Passou de 113 para 231
       tiles alcançáveis. Regra que ficou: corredor de mapa com NPC tem
       de ter no mínimo DUAS casas de largura. Há teste travando isso. */
    rows:[
      '##############################',
      '#########S####################',
      '#######oooooo#################',
      '#######oooooo#################',
      '###oooooooooooooooooooo#######',
      '###oooooooooooooooooooo#######',
      '###ooo##oooooooo##ooooo#######',
      '###ooo##o^oooo^o##ooooo#######',
      '###ooo##oooooooo##ooooo#######',
      '###ooo##oo$coooo##ooooo#######',
      '###ooo##oooooooo##ooooo#######',
      '###ooo##o^oooo^o##ooooo#######',
      '###ooo##oooooooo##ooooo#######',
      '###oooooooooooooooooooo#######',
      '###oooooooooooooooooooo#######',
      '###oooo*ooooooooooooooo#######',
      '#########oooooooo#############',
      '#########oooo+ooo#############',
      '##############################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[
      {to:'cistern_deep', tx:9, ty:11, dir:'up'},   // 'S' (linha 1) → comporta
      {to:'spire_top',    tx:9, ty:2,  dir:'down'}, // '+' (linha 17) → cume
    ],
    chests:[ {item:'w_astro', qty:1} ],
    decor:[
      {x:7,y:13,s:'prop_cristal_vidro',solido:true,
       text:'O fragmento de vidro pálido reflete uma coroa que não está no teto. As pequenas incrustações douradas continuam mornas.'},
      {x:22,y:14,s:'prop_cristal_vidro',solido:true,
       text:'Uma lâmina de cristal cresce da pedra como se tivesse escolhido sozinha onde ficar.'},
    ],
    npcs:[
      {x:4,y:8,  name:'Vidraceiro', sheet:'npc_nobre', quest:'q_cacos',
       lines:['Eu conserto vidro. Aqui o vidro conserta a si mesmo, e é isso que me assusta.']},
      {x:5,y:14, name:'Astrônoma', sheet:'npc_bibliotecaria', quest:'q_reflexo',
       lines:['Todo espelho aqui mostra uma versão que fez outra escolha. Nenhuma parece feliz.']},
      {x:19,y:14, name:'Eremita', sheet:'npc_eremita', quest:'q_vazio',
       lines:['Eu subi para ficar sozinho. Descobri que sozinho já estava ocupado.']},
      {x:21,y:8, name:'Último Arauto', sheet:'npc_kael', portrait:'kael_archimedes_portrait', quest:'q_antescoroa',
       lines:['Eu anunciei a Coroa. Passei o resto da vida tentando desanunciar.']},
      {x:11,y:10, name:'Mercador de Vidro', sheet:'npc_cigana', shop:'coroa',
       lines:['No fim do mundo o preço é honesto: caro. Não tem pra quem reclamar.']},
      {x:15,y:13, name:'Herdeiro Renegado', sheet:'npc_nobre', quest:'q_penumbra',
       lines:['A Coroa não tem espelho que não esteja rachado. Seis vazantes saem de cada racha.']},
    ],
    mobs:[
      {id:'asas_vidro',    x:8,  y:4, visual:'glasswing',    formation:[['glasswing',3],['lesserherald',1]], patrol:1},
      {id:'racha_espelho', x:15, y:4, visual:'crackmirror',  formation:[['crackmirror',2],['voidling',2]], patrol:1},
      {id:'vazante_solta', x:20, y:5, visual:'voidling',     formation:[['voidling',1],['glasswing',2]], patrol:1},
    ],
    signs:[
      {x:2,y:8, text:'INSCRIÇÃO EM VIDRO — "A Coroa não coroou ninguém. Ela esperou, e esperar bastou."'},
    ],
  },

  spire_top: {
    name:'Coroa de Vidro — Cume',
    fill:'f', region:'spire', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(40,36,12,0.44)',
    rows:[
      '###################',
      '#########+#########',
      '#####fffffffff#####',
      '###fffffffffffff###',
      '##fffffffffffffff##',
      '#ffffff^fff^ffffff#',
      '#fffffffffffffffff#',
      '#fffffffffffffffff#',
      '#fffffffffffffffff#',
      '#ffffffff*ffffffff#',
      '##fffffffffffffff##',
      '###fffffffffffff###',
      '#####ffffSfffS#####',
      '###################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    /* A ordem importa: as passagens casam com as casas '+' e 'S' na
       ordem de LEITURA do mapa. O '+' está na linha 1 e a escada nova na
       linha 12, então ela entra depois. */
    warps:[
      {to:'spire', tx:13, ty:16, dir:'up'},
      {to:'arquivo', tx:12, ty:2, dir:'down', needFlag:'crown_defeated',
       blockedMsg:'O chão de vidro não abre. Ainda há uma coroa parada no ar acima de você.'},
      /* v5.28 — a segunda escada do Cume, à direita da primeira. Mesma
         trava: o vidro só se abre depois que a Coroa cai. Uma leva ao
         Arquivo, embaixo; a outra ao Deserto, que é o que sobra do vidro
         quando ele termina de virar areia. */
      {to:'deserto', tx:16, ty:2, dir:'down', needFlag:'crown_defeated',
       blockedMsg:'O vidro do chão range mas não cede. A coroa ainda está inteira lá em cima.'},
    ],
    chests:[],
    /* Guest-tutorial (v5.32, ver GUEST_ALLIES): Calder só aparece
       depois que a Coroa Sem Cabeça cai. */
    npcs:[
      {x:14,y:10, name:'Calder Pell', sheet:'calderpell_sheet', needFlag:'crown_defeated',
       lines: G => {
         if (G.flags.calder_licao)
           return ['A coroa nunca teve cabeça pra vestir. Vocês, ao menos, saem daqui com alguma coisa a mais.',
                   'Volte quando quiser tirar mais do que dão.'];
         return [
           {text:'Uma coroa sem ninguém pra vestir. Curioso o que sobra quando a vaidade cai.'},
           {text:'Deixe eu mostrar como tirar vida de quem tenta tirar a sua.',
            choices:[
              {label:'Ver a demonstração', set:{calder_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.calder})); return null; }},
              {label:'Agora não', then:['Volte quando quiser tirar mais do que dão.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:6, y:1, text:'GRAVURA NA PAREDE — "Aqui, a Coroa ainda sonha que tem cabeça."'},
    ],
    triggers:[ {x:9, y:4, scene:'coroa_antes', flag:'cena_coroa_antes'} ],
    boss:{id:'crown', x:9, y:6, flag:'crown_defeated',
          intro:['No topo não há trono. Há uma coroa parada no ar, na altura exata de uma cabeça que não existe.',
                 'A COROA SEM CABEÇA: "Ninguém nunca me vestiu. Vocês também não vão."'],
          cena:'final'},
  },
  /* ================= v5.24: O ARQUIVO ESQUECIDO ====================
     Pós-Coroa. O piso de vidro do Cume cede e desce num depósito de
     registros que a água tomou. Duas salas: o arquivo e a prateleira do
     fundo, onde o Arquivista espera.

     Reaproveita a gramática de tiles inteira — `b` (estante) e `~`
     (água) fazem o cenário sozinhos, sem letra nova. ================ */
  arquivo: {
    name:'O Arquivo Esquecido',
    /* v5.31 — mob visível na fileira aberta do topo, longe das estantes
       e da poça central. */
    fill:'o', region:'arquivo', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(10,14,38,0.52)',
    decor:[
      {x:3,  y:3,  s:'prop_estante_arquivo', solido:true,
       text:'Estante alta, lotada até o teto. Ninguém arruma isso há anos.'},
      {x:20, y:3,  s:'prop_estante_arquivo', solido:true,
       text:'Os lombos estão úmidos, mas o texto ainda segura.'},
      {x:3,  y:13, s:'prop_estante_baixa', solido:true,
       text:'Estante baixa, meio vazia. Os livros que sobraram estão emprestados a si mesmos.'},
      {x:20, y:13, s:'prop_estante_baixa', solido:true,
       text:'Alguém empilhou o que restou por ordem de tamanho, não de assunto.'},
      {x:11, y:2,  s:'prop_lampiao', text:'A chama não tremula. Nem com a corrente de ar da poça central.'},
      {x:6,  y:9,  s:'prop_entulho_grande',
       text:'Entulho de uma estante que desabou. Ainda dá para ler um título, de cabeça para baixo.'},
      {x:17, y:9,  s:'prop_entulho_grande',
       text:'Páginas soltas, coladas umas nas outras pela umidade.'},
    ],
    rows:[
      '########################',
      '#oooooooooo++oooooooooo#',
      '#obbbbooooooooooobbbboo#',
      '#oooooooooooooooooooooo#',
      '#obbooo~~~~~~~~~~ooobbo#',
      '#oooooo~~~~~~~~~~oooooo#',
      '#oo$ooo~~~~~~~~~~ooo$oo#',
      '#oooooo~~~~~~~~~~oooooo#',
      '#obbooo~~~~~~~~~~ooobbo#',
      '#oooooooooo*ooooooooooo#',
      '#oooooooooooooooooooooo#',
      '#obbbboooooooooooobbbbo#',
      '#oooooooooooooooooooooo#',
      '#ooooooooooSoooooooooooo',
      '########################',
    ],
    spawn:{x:12, y:2, dir:'down'},
    warps:[
      {to:'spire_top', tx:9, ty:11, dir:'up'},     // 1º '+' → volta ao Cume
      {to:'spire_top', tx:9, ty:11, dir:'up'},     // 2º '+' → a mesma escada
      {to:'arquivo_fundo', tx:9, ty:2, dir:'down'},// 'S' → última prateleira
    ],
    chests:[
      {x:3,  y:6, item:'hiether'},
      {x:20, y:6, item:'a_encader'},
    ],
    npcs:[
      {x:14, y:11, name:'Arquivista Aposentado', sheet:'npc_clerigo', dir:'left', quest:'q_arquivo_indice',
       lines:['Eu catalogava isto aqui. Antes de a água entrar.',
              'Ainda catalogo. Só que agora o acervo se mexe.']},
      {x:8,  y:11, name:'Copista', sheet:'npc_viajante', dir:'right', quest:'q_arquivo_lacre',
       lines:['Copio o que sobrou. Não porque alguém vá ler.',
              'Porque quando eu paro, some.']},
      {x:18, y:12, name:'Mercadora de Margem', sheet:'npc_mercador', dir:'up', shop:'margem', quest:'q_ecos',
       lines:['Vendo o que acho no chão. O chão aqui é generoso.']},
      {x:15, y:10, name:'Curador Substituto', sheet:'npc_professor', dir:'down', quest:'q_curador',
       lines:['Os índices andam soltos de novo. Ficha que devia ficar parada anda pela estante.']},
    ],
    mobs:[
      {id:'indices_soltos', x:9,  y:3, visual:'indice', formation:[['indice',2],['errata',1]], patrol:1},
      {id:'copistas_vivos', x:16, y:3, visual:'codice', formation:[['codice',1],['redator',1],['revisor',1]], patrol:1},
    ],
    signs:[
      {x:2,  y:2,  text:'PLACA DE LATÃO — "Acervo Geral. Silêncio." Alguém riscou "Geral" e escreveu "Todo".'},
      {x:21, y:11, text:'FICHA SOLTA — só o número. O verbete que ela apontava não está mais aqui.'},
    ],
  },

  arquivo_fundo: {
    name:'A Última Prateleira',
    fill:'f', region:'arquivo', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(6,10,32,0.6)',
    decor:[
      {x:2,  y:4,  s:'prop_estante_arquivo', solido:true,
       text:'Prateleira vazia. A poeira aqui é mais funda que a de cima.'},
      {x:16, y:4,  s:'prop_estante_arquivo', solido:true,
       text:'Um único livro, sem título na lombada. Ninguém o abriu ainda.'},
      {x:9,  y:11, s:'prop_lampiao', text:'A luz mal alcança a prateleira do fundo. Foi feito assim de propósito.'},
    ],
    rows:[
      '###################',
      '#########+#########',
      '#####fffffffff#####',
      '###fffffffffffff###',
      '##fffffffffffffff##',
      '#ffff^fffffffffff##',
      '#fffffffffffffffff#',
      '#fffff~~~~~~~fffff#',
      '#fffffffffffffffff#',
      '#ffffffff*ffffffff#',
      '##fffffffffffffff##',
      '###fffffffffffff###',
      '#####fffffffff#####',
      '###################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[ {to:'arquivo', tx:11, ty:12, dir:'up'} ],
    chests:[],
    /* Guest-tutorial (v5.32, ver GUEST_ALLIES): Amanda só aparece
       depois que o Arquivista cai. */
    npcs:[
      {x:14,y:10, name:'Amanda Felt', sheet:'amanda_sheet', needFlag:'arquivista_defeated',
       lines: G => {
         if (G.flags.amanda_licao)
           return ['Ninguém constava no arquivo dele. Vocês, pelo menos, ficaram — na ficha errada, mas ficaram.',
                   'Volte se precisar abrir uma guarda de novo.'];
         return [
           {text:'Uma ficha em branco onde devia haver um nome. Isso aqui vale mais que qualquer registro.'},
           {text:'Deixe eu mostrar como abrir a guarda de todo mundo de uma vez.',
            choices:[
              {label:'Ver a demonstração', set:{amanda_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.amanda})); return null; }},
              {label:'Agora não', then:['Volte se precisar abrir uma guarda de novo.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:5,  y:5, text:'ETIQUETA — "Vol. 1 de 1". Não havia segundo volume. Nunca houve.'},
    ],
    boss:{id:'arquivista', x:9, y:6, flag:'arquivista_defeated',
          intro:['A prateleira do fundo não tem livro nenhum. Tem uma coisa dobrada no lugar deles.',
                 'O ARQUIVISTA: "Nome, procedência, data de entrada."',
                 'O ARQUIVISTA: "Você não consta."'],
          outro:['O que estava dobrado se desdobra e não volta a caber.',
                 'No lugar onde ele estava sobra uma ficha em branco. É a primeira coisa deste arquivo que ninguém escreveu.']},
  },

  /* ================= v5.28: AS QUATRO REGIÕES QUE FALTAVAM ==========
     O pacote de arte trouxe criatura para dez regiões e o jogo só tinha
     seis. Em vez de espalhar bicho de deserto pela Mata, as quatro
     regiões foram escritas — e o lugar de cada uma na curva é o VÃO que
     ela fecha, não um capricho:

       Esgoto    nv  8-11   pendurado no Subterrâneo, fecha 7→12
       Lago      nv 14-18   fenda oeste da Galeria, fecha 13→19
       Podridão  nv 19-23   do outro lado do Lago, paralela à Mata
       Deserto   nv 37-40   segunda escada do Cume, fecha 36→41

     Cada região é um par: um mapa de EXPLORAÇÃO com cristal, loja e
     missões, e um mapa de FUNDO sem encontro, que é onde mora o baú
     bom. É a mesma gramática das regiões da v4.8 — sem chefe, porque
     chefe novo pede fases, arte e revanche, e isso é outra entrega.
     ================================================================= */

  esgoto: {
    name:'Galerias de Esgoto',
    /* v5.31 — mob visível só nos dois cruzamentos de verdade do labirinto
       (o resto daqui é cano de uma casa, e mob bloqueia igual a NPC). */
    fill:'x', region:'esgoto', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(18,26,10,0.5)',
    rows:[
      '##############################',
      '#Sxx##########################',
      '#xxx##########################',
      '#xxxxxxxxxxx##################',
      '#xxx#######x##################',
      '#xxx#######x#####xxxxxxxx#####',
      '#xxx#######x#####x######x#####',
      '#xxxxxxxxxxxxxxxxx######x#####',
      '#xxx#######x#####x######x#####',
      '#*xx#######x#####x###$xxx#####',
      '#xxx#######x#####x######x#####',
      '#xxxxxx####x#####xxxxxxxx#####',
      '#####x####xx##################',
      '#####xxxxxx###################',
      '#####x########################',
      '#####xxxxxxxxxxxxxxxx#########',
      '#####x##############x#########',
      '#####x####~~~~~~####x#########',
      '#####x####~~~~~~####x#########',
      '#####xxxxxxxxxxxxxxxx#########',
      '###########+##################',
      '##############################',
    ],
    spawn:{x:2, y:2, dir:'down'},
    warps:[
      {to:'undercroft', tx:22, ty:20, dir:'up'},   // 'S' → volta ao Subterrâneo
      {to:'esgoto_fundo', tx:9, ty:2, dir:'down'}, // '+' → poço de decantação
    ],
    chests:[ {item:'hipot', qty:2} ],
    npcs:[
      {x:2,y:5, name:'Encanador Aposentado', sheet:'npc_anciana', quest:'q_valvulas',
       lines:['Quarenta anos nestes canos. Nunca vi a água subir sozinha.',
              'Se subir até aqui, corra. Eu não corro mais.']},
      {x:3,y:9, name:'Cobradora de Fossa', sheet:'npc_capataz', quest:'q_coletores',
       lines:['A Academia paga por metro de galeria limpa. Não paga bem, mas paga.']},
      {x:2,y:11, name:'Ferreiro de Bueiro', sheet:'npc_ferreiro', shop:'bueiro',
       lines:['Tudo que eu vendo já foi cano. Não pergunte de qual.']},
    ],
    /* Só um mob: o labirinto é cano de uma casa quase inteiro, e o único
       outro cruzamento de verdade (11,7) é a passagem vertical única do
       mapa — bloqueá-la tranca a rota, o mesmo defeito do `spire`. */
    mobs:[
      {id:'praga_alagada', x:17, y:7, visual:'coletor', formation:[['coletor',1],['mosca',1],['ra_imunda',1]], patrol:0},
    ],
    signs:[
      {x:6,y:4, text:'CHAPA REBITADA — "GALERIA 3. NÍVEL DA ÁGUA: SEGURO." O ponteiro está quebrado no vermelho.'},
      {x:19,y:16, text:'PICHAÇÃO — "não beba / não toque / não conte a ninguém que você desceu"'},
    ],
  },

  esgoto_fundo: {
    name:'Poço de Decantação',
    fill:'x', region:'esgoto', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(14,22,8,0.58)',
    rows:[
      '###################',
      '#########+#########',
      '#####xxxxxxxxx#####',
      '###xxxxxxxxxxxxx###',
      '##xxxx~~~~~~~xxxx##',
      '##xxx~~~~~~~~~xxx##',
      '##xxx~~~~~~~~~xxx##',
      '##xxxx~~~~~~~xxxx##',
      '###xxxxxxxxxxxxx###',
      '####xxx$xxx$xxx####',
      '#####xxxxxxxxx#####',
      '###################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[ {to:'esgoto', tx:11, ty:19, dir:'up'} ],
    chests:[ {item:'a_manto', qty:1}, {item:'t_vital', qty:1} ],
    npcs:[],
    signs:[
      {x:4,y:2, text:'PLACA SUBMERSA — "AQUI A ÁGUA DESCANSA." Descansar não era o verbo que eles queriam.'},
    ],
  },

  lago: {
    name:'Lago Afogado',
    /* v5.31 — mob visível na margem aberta ao sul do acampamento. */
    fill:'.', region:'lago', outdoor:true, encounter:null, bgm:'field',
    tint:'rgba(10,34,44,0.28)',
    rows:[
      '##################################',
      '#..............T.................#',
      '#..TT..........,.........TT......#',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#,...BffffffffffB................#',
      '#,...ff==ffff==ff....~~~~~~~~....#',
      '#,...fffff$ffffff...~~~~~~~~~~...#',
      '#,...ffff*fffffff..~~~~~~~~~~~~..#',
      '#,...ffffffffffff..~~~~~~~~~~~~..#',
      '#,,,,,,,,,,,,,,,,,.~~~~~~~~~~~~..#',
      '#+...............,..~~~~~~~~~~...#',
      '#...TT...........,...~~~~~~~~....#',
      '#................,...............#',
      '#..TT............,..........TT...#',
      '#................,...............#',
      '#....TT..........,........TT.....#',
      '#................,...............#',
      '#................S...........+...#',
      '##################################',
    ],
    spawn:{x:2, y:10, dir:'right'},
    /* Ordem de leitura: o '+' oeste (linha 10) vem antes da escada e da
       porta da linha 17. É por isso que a Galeria é a primeira da lista
       mesmo sendo a passagem de VOLTA. */
    warps:[
      {to:'deepway',    tx:5,  ty:15, dir:'right'}, // '+' oeste → Galeria
      {to:'lago_fundo', tx:9,  ty:2,  dir:'down'},  // 'S' → templo submerso
      {to:'podridao',   tx:2,  ty:9,  dir:'down'},  // '+' leste → Baixios
    ],
    chests:[ {item:'a_bruma', qty:1} ],
    npcs:[
      {x:7,y:8,  name:'Pescadora Sem Rede', sheet:'npc_menina', quest:'q_juncos',
       lines:['Rede não pega o que mora aqui. Pega o que já morreu, e isso não se come.']},
      {x:11,y:8, name:'Barqueiro', sheet:'npc_rapaz', quest:'q_serpente',
       lines:['Atravesso quem paga. Volto sozinho, se a serpente estiver com fome.']},
      {x:14,y:8, name:'Trocadora da Margem', sheet:'npc_mercador', shop:'margem_lago',
       lines:['Tudo aqui foi tirado do fundo. Tudo aqui foi de alguém. As duas coisas.']},
      {x:6,y:5,  name:'Curandeira da Margem', sheet:'npc_camponesa', heal:true,
       lines:['Sente. Você está com água nos pulmões e não percebeu.',
              '...Pronto. Da próxima vez respire antes de mergulhar.']},
    ],
    mobs:[
      {id:'garcas_da_margem', x:10, y:12, visual:'garca',        formation:[['garca',2],['naiade',1]], patrol:1},
      {id:'serpente_baixios', x:25, y:12, visual:'serpente_lago',formation:[['sapo_lotus',1],['serpente_lago',1]], patrol:1},
    ],
    signs:[
      {x:4,y:13, text:'ESTACA DE MADEIRA — "NÍVEL DA ÁGUA EM 1104". A marca está três metros acima da sua cabeça.'},
    ],
  },

  lago_fundo: {
    name:'Templo Submerso',
    fill:'f', region:'lago', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(6,28,40,0.55)',
    rows:[
      '#####################',
      '#########S###########',
      '#####fffffffff#######',
      '###fffffffffffff#####',
      '##ff^fffffffff^ff####',
      '##fffff~~~~~fffff####',
      '##fffff~~~~~fffff####',
      '##ff^fffffffff^ff####',
      '###fffff*ffffff######',
      '####ff$fffff$ff######',
      '#####fffffffff#######',
      '#####################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[ {to:'lago', tx:17, ty:16, dir:'up'} ],
    chests:[ {item:'w_mare', qty:1}, {item:'t_corda', qty:1} ],
    npcs:[],
    signs:[
      {x:4,y:4, text:'BAIXO-RELEVO — uma cidade inteira desenhada de cabeça para baixo. O lago está no lugar do céu.'},
    ],
  },

  podridao: {
    name:'Baixios da Podridão',
    /* v5.31 — mob visível na faixa aberta do topo e na trilha leste,
       fora do labirinto de câmaras estreitas. */
    fill:'d', region:'podridao', outdoor:true, encounter:null, bgm:'field',
    tint:'rgba(34,40,8,0.34)',
    rows:[
      '##################################',
      '#..d..T....d.......T.....d.......#',
      '#dd..dd...ddd.....dd....ddd......#',
      '#..ddddddddddddddddddddddddddd...#',
      '#..d####################d........#',
      '#..d#fBffffffBf#########d........#',
      '#..d#ff==ff==ff#########d....TT..#',
      '#..d#fff$ff*fff#########d........#',
      '#..d#ffffffffff#########d........#',
      '#+.dddddddddddddddddddddd........#',
      '#..d##########d#########d........#',
      '#..d##########d#########d........#',
      '#..ddddddddddddddddddddddddd.....#',
      '#..d#######d########d######d.....#',
      '#..d#######d########d######d.....#',
      '#..ddddddddddddddddddddddddd.....#',
      '#..........d.......d.............#',
      '#....TT....d.......d.....+.......#',
      '##################################',
    ],
    spawn:{x:2, y:9, dir:'right'},
    warps:[
      {to:'lago',           tx:29, ty:17, dir:'left'},  // '+' oeste → Lago
      {to:'podridao_fundo', tx:9,  ty:2,  dir:'down'},  // '+' sul → alagado
    ],
    chests:[ {item:'a_casco', qty:1} ],
    npcs:[
      {x:6,y:8,  name:'Coveiro de Turfa', sheet:'npc_viajante', quest:'q_esporos',
       lines:['Cavo raso porque o fundo não segura. Sobe tudo de novo em três dias.']},
      {x:10,y:8, name:'Herbolária Amarga', sheet:'npc_escriba', quest:'q_carnicais',
       lines:['Tudo que cresce aqui cura alguma coisa e mata outra. O ofício é escolher qual.']},
      {x:13,y:8, name:'Sucateiro do Brejo', sheet:'npc_capataz', shop:'brejo',
       lines:['Se apodrece, eu não compro. Se enferruja, a gente conversa.']},
    ],
    mobs:[
      {id:'ratada_turfa', x:10, y:3, visual:'rato_peste', formation:[['rato_peste',2],['lesma',1]], patrol:1},
      {id:'carnicais_leste', x:28, y:6, visual:'carnical', formation:[['carnical',1],['ent_podre',1]], patrol:1},
    ],
    signs:[
      {x:5,y:17, text:'TÁBUA MEIO ENTERRADA — "ROÇA DA ACADEMIA — COLHEITA DE OUTONO". Não é outono há muito tempo.'},
    ],
  },

  podridao_fundo: {
    name:'Alagado de Esporos',
    fill:'d', region:'podridao', outdoor:true, encounter:null, bgm:'dungeon',
    tint:'rgba(28,36,6,0.44)',
    rows:[
      '#####################',
      '#########+###########',
      '#####ddddddddd#######',
      '###ddddddddddddd#####',
      '##ddTddddddddTddd####',
      '##ddd~~~~~~~dddd#####',
      '##ddd~~~~~~~dddd#####',
      '##ddTddddddddTddd####',
      '###dddd*dddddddd#####',
      '####dd$ddddd$dd######',
      '#####ddddddddd#######',
      '#####################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[ {to:'podridao', tx:25, ty:17, dir:'up'} ],
    chests:[ {item:'t_espelho', qty:1}, {item:'panacea', qty:3} ],
    npcs:[],
    signs:[
      {x:4,y:4, text:'PLACA DE INTERDIÇÃO — "ÁREA FECHADA POR ORDEM DA DIRETORIA". A ordem apodreceu junto.'},
    ],
  },

  deserto: {
    name:'Deserto de Vidro Moído',
    /* v5.31 — mob visível na duna aberta, longe dos pilares e do
       acampamento. */
    fill:'d', region:'deserto', outdoor:true, encounter:null, bgm:'field',
    tint:'rgba(70,58,14,0.3)',
    rows:[
      '##################################',
      '#.......S........................#',
      '#.......,........................#',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#,...BffffffffffB................#',
      '#,...ff==ffff==ff................#',
      '#,...fff$ff*fffff................#',
      '#,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,#',
      '#................,...............#',
      '#..^.............,......^........#',
      '#................,...............#',
      '#................,...............#',
      '#.....^..........,.........^.....#',
      '#................,...............#',
      '#................,...............#',
      '#..^.............,......^........#',
      '#................,...............#',
      '#................+...............#',
      '##################################',
    ],
    spawn:{x:8, y:2, dir:'down'},
    warps:[
      {to:'spire_top', tx:11, ty:12, dir:'up'},     // 'S' → volta ao Cume
      {to:'deserto_fundo', tx:9, ty:2, dir:'down'}, // '+' → tumba
    ],
    chests:[ {item:'t_olho', qty:1} ],
    npcs:[
      {x:6,y:6,  name:'Cartógrafa de Areia', sheet:'npc_nobre', quest:'q_carapacas',
       lines:['Desenho o deserto toda manhã. Toda tarde ele desmente o desenho.']},
      {x:10,y:6, name:'Caravaneiro Cego', sheet:'npc_encapuzado', quest:'q_mumias',
       lines:['Não preciso enxergar. Aqui tudo tem a mesma cor de qualquer jeito.']},
      {x:14,y:6, name:'Vidraceiro Errante', sheet:'npc_professor', shop:'duna',
       lines:['Este chão foi uma coroa. Moída, ela vale mais — porque agora dá para carregar.']},
      {x:6,y:4,  name:'Aguadeira', sheet:'npc_menina', heal:true,
       lines:['Beba. Não pergunte de onde veio.',
              '...Pronto. Grupo de pé. A água aqui é cara, então não desperdice o descanso.']},
    ],
    mobs:[
      {id:'chacais_duna',    x:12, y:10, visual:'chacal',      formation:[['chacal',2],['mumia',1]], patrol:1},
      {id:'escaravelhos_sol',x:22, y:14, visual:'escaravelho', formation:[['escaravelho',1],['salamandra_areia',1]], patrol:1},
    ],
    signs:[
      {x:3,y:9, text:'MARCO DE PEDRA — "COROA DE VIDRO — 0 KM". Você está em cima dela. Ela é a areia.'},
    ],
  },

  deserto_fundo: {
    name:'Tumba de Cristal Fosco',
    fill:'f', region:'deserto', outdoor:false, encounter:null, bgm:'dungeon',
    tint:'rgba(48,40,10,0.5)',
    /* Cinemática de revelação na primeira entrada — mesma gramática de
       SCENES.abertura_patio, câmera+barras+tremor em vez de caixa de
       texto parada. `onEnter` só toca uma vez (flag). */
    onEnter:{scene:'vharok_reveal', flag:'viu_vharok_intro'},
    rows:[
      '#####################',
      '#########+###########',
      '#####fffffffff#######',
      '###fffffffffffff#####',
      '##ff^fffffffff^ff####',
      '##fffffffffffffff####',
      '##fffffB###Bfffff####',
      '##ff^fffffffff^ff####',
      '###fffff*ffffff######',
      '####ff$fffff$ff######',
      '#####fffffffff#######',
      '#####################',
    ],
    spawn:{x:9, y:2, dir:'down'},
    warps:[ {to:'deserto', tx:17, ty:16, dir:'up'} ],
    chests:[ {item:'a_astral', qty:1}, {item:'t_coroa', qty:1} ],
    /* Guest-tutorial (v5.32, ver GUEST_ALLIES): Scythe é a última das
       nove — só aparece depois do Vharok, o chefe final. Lição de
       encerramento: um golpe único e devastador. */
    npcs:[
      {x:10,y:10, name:'Scythe', sheet:'scythe_sheet', needFlag:'vharok_defeated',
       lines: G => {
         if (G.flags.scythe_licao)
           return ['Ele pediu pra ver até onde vocês conseguiam fugir. Vocês nem tentaram.',
                   'Guarde essa lição. Nem toda luta precisa de mais que um golpe.'];
         return [
           {text:'Chegar até aqui já diz o bastante. Mas ainda falta uma coisa pra aprender.'},
           {text:'Às vezes a luta inteira se resolve num golpe só. Quer ver?',
            choices:[
              {label:'Ver a demonstração', set:{scythe_licao:true},
               run(){ FX.battleWipe(() => Battle.begin(['shade'], {guest:GUEST_ALLIES.scythe})); return null; }},
              {label:'Agora não', then:['Guarde essa lição. Nem toda luta precisa de mais que um golpe.']},
            ]},
         ];
       }},
    ],
    signs:[
      {x:4,y:4, text:'LÁPIDE SEM NOME — só a data. É a mesma data em todas as outras vinte lápides.'},
    ],
    /* A cinemática de revelação já tocou (`onEnter`, acima) na primeira
       vez que se entra na sala — `intro` aqui é só a fala curta bem
       antes do combate, padrão de todo chefe. `cena` troca o outro de
       texto simples por uma cutscene de vitória de verdade; o motor já
       faz isso sozinho (ver Battle.onFinish em combat/27-controller.js,
       "cena no chefe: em vez de despejar duas linhas de texto..."). */
    boss:{id:'vharok', x:9, y:5, flag:'vharok_defeated',
          intro:['Mostre-me até onde consegue fugir.'],
          cena:'vharok_outro'},
  },

};
