/* ===================================================================
   13d. CENAS DA v4.8 — RASCUNHO PARA REESCRITA
   -------------------------------------------------------------------
   TUDO ABAIXO É TEXTO PROVISÓRIO. A estrutura (onde dispara, o que a
   câmera faz, quando treme, qual flag grava) está montada e testada;
   as FALAS são para serem trocadas. Reescrever é seguro desde que:

     · o `flag:` de cada cena continue existindo e único
       (é ele que faz a cena tocar uma vez só e sobreviver ao save);
     · `who:` cite um NPC que EXISTE no mapa onde a cena roda
       (o motor devolve o controle se não achar, mas a cena fica muda);
     · `to:[x,y]` caia em chão pisável do mapa (o caminho em L desvia,
       mas não atravessa parede);
     · depois de mexer, rodar `?test` — há asserções que pegam comando
       inválido, cena órfã e gatilho em cima de parede.

   COMANDOS DISPONÍVEIS (motor na seção 13b)
     say    {who, text}  ·  {who, lines:[...]}  ·  portrait:'kael_archimedes_portrait'
            Uma linha pode ter escolhas:
              {do:'say', lines:[{text:'?', choices:[
                 {label:'Sim', set:{minha_flag:true}, then:['...']},
                 {label:'Não', then:['...']}]}]}
     wait   {s:0.5}
     move   {who, to:[x,y]} · {who, dir:'down', steps:2} · {gap:1} para
            uma casa antes · {wait:false} não bloqueia (use `sync` depois)
     face   {who, dir:'up'|'down'|'left'|'right'|'player'}
     sync   {}                     espera os movimentos soltos
     cam    {who} · {to:[x,y], speed:1..6} · {release:true}
     bars   {on:true|false}        barras de cinema
     fade   {}                     escurece e volta
     warp   {map, x, y, dir}
     flash  {color:'#ffaa55', s:0.5}   ·  shake {mag:6, s:0.5}
     sfx    {id:'boss'}            ids em Sound.sfx (seção 3)
     bgm    {id:'dungeon'}         ou {} para silenciar
     flag   {k:'minha_flag', v:true}
     banner {text:'...'}
     battle {foes:['wolf'], boss:false}   luta e VOLTA para a cena
     run    {fn:G => {...}}        escotilha para qualquer coisa

   ONDE CADA UMA DISPARA (já ligado nos dados)
     portao_sul        pátio, tile (19,18), só depois do Eco
     chegada_mata      ao entrar na Mata Cindária
     entrega_batedora  ao entregar a missão "Trilha de Cinzas"
     pira_antes        Clareira da Pira, tile (9,4), antes do chefe
     pira_depois       ao derrotar A Chama Que Lembra
     chegada_cisterna  ao entrar na Cisterna Afogada
     entrega_comporta  ao entregar "Ferrugem na Comporta"
     comporta_antes    A Comporta, tile (9,4), antes do chefe
     comporta_depois   ao derrotar O Que Ficou na Água
     chegada_coroa     ao entrar na Coroa de Vidro
     coroa_antes       Cume, tile (9,4), antes do chefe
     entrega_arauto    ao entregar "Antes da Coroa"
     final             ao derrotar A Coroa Sem Cabeça

   NPCs disponíveis por mapa (para o `who:`)
     patio      Aluno · Profa. Lina · Balconista · Kael Archimedes · Zelador
     ashwood    Batedora · Lenhador · Guarda-Fogo · Alquimista ·
                Enfermeira do Acampamento
     cistern    Engenheira · Escriturário · Mergulhador ·
                Enfermeira de Campo · Contrabandista
     spire      Vidraceiro · Astrônoma · Eremita · Último Arauto ·
                Mercador de Vidro
   Nos mapas de chefe (ashpyre, cistern_deep, spire_top) não há NPC:
   as cenas de lá são só narração, câmera e efeito.
   =================================================================== */

/* --- PÁTIO: o portão sul se abre ---------------------------------- */
SCENES.portao_sul = {
  bars:true,
  flag:'cena_portao',
  cmds:[
    {do:'wait', s:0.3},
    {do:'cam',  to:[19, 20], speed:2},
    {do:'say',  text:'O portão sul está aberto. Ninguém o abriu — a tranca simplesmente não está mais ali.'},
    {do:'shake', mag:3, s:0.6},
    {do:'say',  text:'Do outro lado o ar chega quente e com gosto de cinza, e é meio-dia de um dia frio.'},
    {do:'cam',  release:true},
    {do:'face', who:'player', dir:'down'},
    {do:'bars', on:false},
    {do:'banner', text:'O caminho para a Mata Cindária está aberto'},
  ],
};

/* --- MATA CINDÁRIA: chegada --------------------------------------- */
SCENES.chegada_mata = {
  bars:true,
  flag:'cena_mata',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'bgm',   id:'field'},
    {do:'say',   text:'A mata não terminou de queimar. Ela está queimando devagar, há tempo demais para isso ainda ser um incêndio.'},
    {do:'move',  who:'player', dir:'down', steps:2},
    {do:'cam',   to:[12, 8], speed:2.2},
    {do:'say',   text:'Mais abaixo, entre duas fileiras de tochas, alguém montou acampamento no meio disso.'},
    {do:'cam',   who:'Batedora', speed:3},
    {do:'move',  who:'Batedora', to:() => [G.player.tx, G.player.ty], gap:1},
    {do:'face',  who:'Batedora', dir:'player'},
    {do:'cam',   release:true},
    {do:'say',   who:'Batedora', lines:[
      'Para aí. Se você veio pela trilha, veio pelo único lugar que ainda dá.',
      'Regra do acampamento: não corra, não grite, e não apague brasa com a mão.',
      'Se precisar de alguma coisa, é lá embaixo. Se precisar de conselho, é agora: aqui tudo é fogo. Vista-se de acordo.',
    ]},
    {do:'move',  who:'Batedora', to:[6, 9], wait:false},
    {do:'bars',  on:false},
    {do:'sync'},
    {do:'face',  who:'Batedora', dir:'down'},
    {do:'banner', text:'Mata Cindária'},
  ],
};

/* --- MATA CINDÁRIA: entrega da missão da Batedora ------------------ */
SCENES.entrega_batedora = {
  bars:true,
  flag:'cena_batedora',
  cmds:[
    {do:'wait',  s:0.3},
    {do:'cam',   who:'Batedora', speed:2.4},
    {do:'face',  who:'Batedora', dir:'player'},
    {do:'say',   who:'Batedora', lines:[
      'Oito. Eu contei pelos uivos que pararam, não pela sua palavra. Não leve a mal.',
      'Agora a parte que eu não disse antes: lobo de cinza não desce sozinho. Alguma coisa lá em cima empurra.',
    ]},
    {do:'shake', mag:4, s:0.5},
    {do:'flash', color:'#ff8844', s:0.4},
    {do:'wait',  s:0.4},
    {do:'say',   who:'Batedora', lines:[
      'Tá vendo? De hora em hora ela respira. A clareira da pira fica no fim da trilha sul.',
      'Eu não vou. Já perdi gente demais tentando conversar com fogo.',
    ]},
    {do:'face',  who:'Batedora', dir:'down'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
  ],
};

/* --- CLAREIRA DA PIRA: antes do chefe ------------------------------ */
SCENES.pira_antes = {
  bars:true,
  flag:'cena_pira',
  cmds:[
    {do:'wait',  s:0.3},
    {do:'bgm'},
    {do:'cam',   to:[9, 6], speed:1.8},
    {do:'say',   text:'A pira está acesa e não há lenha nenhuma embaixo dela.'},
    {do:'wait',  s:0.5},
    {do:'flash', color:'#ffaa55', s:0.6},
    {do:'shake', mag:6, s:0.7},
    {do:'say',   text:'O fogo se ajeita como quem se senta melhor na cadeira. Depois fica parado, esperando.'},
    {do:'cam',   release:true},
    {do:'face',  who:'player', dir:'down'},
    {do:'bars',  on:false},
  ],
};

/* --- CLAREIRA DA PIRA: depois do chefe ----------------------------- */
SCENES.pira_depois = {
  bars:true,
  flag:'cena_pira_fim',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'cam',   to:[9, 6], speed:2},
    {do:'say',   text:'A Chama se apaga como quem finalmente recebe a ordem que passou anos esperando.'},
    {do:'wait',  s:0.4},
    {do:'shake', mag:8, s:0.9},
    {do:'sfx',   id:'door'},
    {do:'say',   text:'Onde ela estava, a pedra cede num alçapão. Vem frio de baixo — e barulho de água parada.'},
    {do:'cam',   to:[9, 12], speed:2.4},
    {do:'say',   text:'A escada desce mais do que a luz da tocha alcança.'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
    {do:'banner', text:'A Cisterna está aberta'},
  ],
};

/* --- CISTERNA: chegada -------------------------------------------- */
/* --- NINHAL DE ÉTER: chegada (v4.9) -------------------------------- */
SCENES.chegada_ninhal = {
  bars:true,
  flag:'cena_ninhal',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'bgm',   id:'field'},
    {do:'say',   text:'A trilha leste sai da cinza e entra em mato verde de repente, como se alguém tivesse traçado a linha com régua.'},
    {do:'move',  who:'player', dir:'down', steps:2},
    {do:'cam',   to:[12, 8], speed:2.2},
    {do:'say',   text:'Dois pátios cercados, cheios de coisa pequena se mexendo. E barulho — muito barulho, todo ele pequeno.'},
    {do:'cam',   who:'Tratadora', speed:3},
    {do:'move',  who:'Tratadora', to:() => [G.player.tx, G.player.ty], gap:1},
    {do:'face',  who:'Tratadora', dir:'player'},
    {do:'cam',   release:true},
    {do:'say',   who:'Tratadora', lines:[
      'Pisa devagar. Cria não distingue pressa de ataque, e eu não vou explicar isso duas vezes.',
      'Aqui a gente não doma. A gente cuida, alimenta, e num dia qualquer o bicho decide que vai junto.',
      'Se quiser um, vai ter que trabalhar por ele. Todo mundo aqui trabalhou.',
    ]},
    {do:'move',  who:'Tratadora', to:[6, 6], wait:false},
    {do:'bars',  on:false},
    {do:'sync'},
    {do:'face',  who:'Tratadora', dir:'down'},
    {do:'banner', text:'Ninhal de Éter'},
  ],
};

/* --- A CHOCADEIRA: antes do chefe ---------------------------------- */
SCENES.chocadeira_antes = {
  bars:true,
  flag:'cena_chocadeira',
  cmds:[
    {do:'wait',  s:0.3},
    {do:'bgm'},
    {do:'cam',   to:[9, 7], speed:1.8},
    {do:'say',   text:'O fundo do ninhal é um monte de folha seca do tamanho de uma casa.'},
    {do:'wait',  s:0.5},
    {do:'shake', mag:5, s:0.8},
    {do:'say',   text:'O monte respira. Não é vento: é lento demais e fundo demais para ser vento.'},
    {do:'cam',   release:true},
    {do:'face',  who:'player', dir:'down'},
    {do:'bars',  on:false},
  ],
};

/* --- A CHOCADEIRA: depois do chefe --------------------------------- */
SCENES.chocadeira_depois = {
  bars:true,
  flag:'cena_chocadeira_fim',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'cam',   to:[9, 7], speed:2},
    {do:'say',   text:'A Que Choca se desfaz em folha seca, e a folha seca continua sendo só folha seca.'},
    {do:'wait',  s:0.5},
    {do:'sfx',   id:'chest'},
    {do:'say',   text:'No meio do monte, um casulo intacto. Morno. Ela morreu em cima dele e não saiu.'},
    {do:'wait',  s:0.4},
    {do:'say',   text:'Não dá para saber se ela protegia a cria ou se a cria era o que restava dela. Talvez não seja pergunta diferente.'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
    {do:'banner', text:'A Chocadeira está em silêncio'},
  ],
};

SCENES.chegada_cisterna = {
  bars:true,
  flag:'cena_cisterna',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'bgm',   id:'dungeon'},
    {do:'say',   text:'A água aqui embaixo não corre. Ela espera, e o som que faz é de alguém respirando devagar.'},
    {do:'move',  who:'player', dir:'down', steps:2},
    {do:'cam',   to:[13, 10], speed:2.2},
    {do:'say',   text:'Numa saliência seca, três ou quatro pessoas montaram um posto. Ninguém olha para a água.'},
    {do:'cam',   who:'Escriturário', speed:3},
    {do:'face',  who:'Escriturário', dir:'player'},
    {do:'say',   who:'Escriturário', lines:[
      'Não pise onde a água chega. Ela não puxa. Ela só espera você decidir sozinho.',
      'Se você vier a se afogar aqui, eu anoto o seu nome. É o que eu sei fazer.',
    ]},
    {do:'face',  who:'Escriturário', dir:'down'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
    {do:'banner', text:'Cisterna Afogada'},
  ],
};

/* --- CISTERNA: entrega da missão da Engenheira --------------------- */
SCENES.entrega_comporta = {
  bars:true,
  flag:'cena_engenheira',
  cmds:[
    {do:'wait',  s:0.3},
    {do:'cam',   who:'Engenheira', speed:2.4},
    {do:'face',  who:'Engenheira', dir:'player'},
    {do:'say',   who:'Engenheira', lines:[
      'Com os guardas fora, deu para ler o mecanismo inteiro. E eu queria não ter lido.',
      'A comporta não travou. Ela foi FECHADA. Por dentro. E continua sendo segurada.',
    ]},
    {do:'wait',  s:0.4},
    {do:'shake', mag:5, s:0.6},
    {do:'say',   who:'Engenheira', lines:[
      'Isso aí não é a estrutura assentando. É alguém do outro lado mudando de posição.',
      'Leve a escama. Se você for lá, vai precisar de alguma coisa entre você e o frio.',
    ]},
    {do:'face',  who:'Engenheira', dir:'down'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
  ],
};

/* --- A COMPORTA: antes do chefe ------------------------------------ */
SCENES.comporta_antes = {
  bars:true,
  flag:'cena_comporta',
  cmds:[
    {do:'wait',  s:0.3},
    {do:'bgm'},
    {do:'cam',   to:[9, 7], speed:1.8},
    {do:'say',   text:'A água da sala está mais alta que a do corredor. Ela não deveria conseguir isso.'},
    {do:'wait',  s:0.5},
    {do:'shake', mag:5, s:0.8},
    {do:'say',   text:'A superfície se ergue no meio, sem onda e sem vento, até ficar da altura de uma pessoa em pé.'},
    {do:'flash', color:'#8ad8ff', s:0.5},
    {do:'cam',   release:true},
    {do:'face',  who:'player', dir:'down'},
    {do:'bars',  on:false},
  ],
};

/* --- A COMPORTA: depois do chefe ----------------------------------- */
SCENES.comporta_depois = {
  bars:true,
  flag:'cena_comporta_fim',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'cam',   to:[9, 7], speed:2},
    {do:'say',   text:'A água desaba e volta a ser só água. Leva um segundo inteiro para parar de parecer alguém.'},
    {do:'wait',  s:0.4},
    {do:'sfx',   id:'door'},
    {do:'shake', mag:7, s:0.9},
    {do:'say',   text:'A comporta cede pela primeira vez em noventa e um dias, e o nível baixa até a canela.'},
    {do:'cam',   to:[9, 12], speed:2.4},
    {do:'say',   text:'Atrás dela, uma escada de vidro sobe. Ela reflete a tocha muitas vezes mais do que deveria.'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
    {do:'banner', text:'A Coroa de Vidro está aberta'},
  ],
};

/* --- COROA DE VIDRO: chegada -------------------------------------- */
SCENES.chegada_coroa = {
  bars:true,
  flag:'cena_coroa',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'bgm',   id:'dungeon'},
    {do:'flash', color:'#fff4c0', s:0.7},
    {do:'say',   text:'Lá dentro é claro. Não há tocha, janela nem fogo: a claridade está no próprio vidro.'},
    {do:'move',  who:'player', dir:'down', steps:2},
    {do:'cam',   to:[11, 8], speed:2.2},
    {do:'say',   text:'Cada parede devolve o grupo inteiro. Em algumas devoluções falta alguém.'},
    {do:'cam',   who:'Astrônoma', speed:3},
    {do:'face',  who:'Astrônoma', dir:'player'},
    {do:'say',   who:'Astrônoma', lines:[
      'Não conte os reflexos. Sério. Já vi gente contar e não gostar do resultado.',
      'A torre inteira é um instrumento de medida. O problema é que ela mede quem entra.',
    ]},
    {do:'face',  who:'Astrônoma', dir:'down'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
    {do:'banner', text:'Coroa de Vidro'},
  ],
};

/* --- COROA DE VIDRO: entrega da missão do Último Arauto ------------ */
SCENES.entrega_arauto = {
  bars:true,
  flag:'cena_arauto',
  cmds:[
    {do:'wait',  s:0.3},
    {do:'cam',   who:'Último Arauto', speed:2.4},
    {do:'face',  who:'Último Arauto', dir:'player'},
    {do:'say',   who:'Último Arauto', portrait:'kael_archimedes_portrait', lines:[
      'Silêncio. Cinco trombetas a menos. Ela não sabe mais que você está vindo.',
      'Eu anunciei a Coroa quando era jovem e achava que anunciar era o mesmo que entender.',
    ]},
    {do:'wait',  s:0.4},
    {do:'say',   who:'Último Arauto', portrait:'kael_archimedes_portrait', lines:[
      'Ela nunca mandou em ninguém. Só ficou lá em cima, esperando alguém aceitar ser mandado.',
      'Leve o paramento. E suba sabendo disso: a coisa mais perigosa da torre é concordar com ela.',
    ]},
    {do:'face',  who:'Último Arauto', dir:'down'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
  ],
};

/* --- CUME: antes do chefe ------------------------------------------ */
SCENES.coroa_antes = {
  bars:true,
  flag:'cena_coroa_antes',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'bgm'},
    {do:'cam',   to:[9, 6], speed:1.6},
    {do:'say',   text:'No topo não há trono, nem altar, nem corpo.'},
    {do:'wait',  s:0.6},
    {do:'flash', color:'#ffffff', s:0.8},
    {do:'say',   text:'Há uma coroa parada no ar, na altura exata de uma cabeça que nunca existiu.'},
    {do:'shake', mag:4, s:0.6},
    {do:'say',   text:'Ela vira devagar, como se ajustasse o tamanho para a pessoa que acabou de entrar.'},
    {do:'cam',   release:true},
    {do:'face',  who:'player', dir:'down'},
    {do:'bars',  on:false},
  ],
};

/* --- CUME: o fim --------------------------------------------------- */
SCENES.final = {
  bars:true,
  flag:'cena_final',
  cmds:[
    {do:'wait',  s:0.6},
    {do:'bgm'},
    {do:'cam',   to:[9, 6], speed:1.6},
    {do:'say',   text:'A Coroa cai. Só isso: cai, e faz o barulho de qualquer coisa de vidro caindo.'},
    {do:'wait',  s:0.8},
    {do:'shake', mag:10, s:1.2},
    {do:'flash', color:'#ffffff', s:1},
    {do:'say',   text:'A torre inteira se apaga de baixo para cima, andar por andar, como quem fecha a casa para dormir.'},
    {do:'fade'},
    {do:'wait',  s:0.4},
    {do:'say',   text:'Sem a luz do vidro, o teto do cume vira só um teto. E acima dele, pela primeira vez em muito tempo, há céu.'},
    {do:'wait',  s:0.5},
    {do:'say',   lines:[
      'Nada aqui foi selado. Nada foi vencido, tampouco.',
      'Só apagaram uma luz que ninguém tinha coragem de apagar antes.',
    ]},
    {do:'bgm',   id:'field'},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
    {do:'banner', text:'A Coroa Sem Cabeça foi derrubada'},
  ],
};
