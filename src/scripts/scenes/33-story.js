/* ===================================================================
   13c. CENAS DO JOGO
   =================================================================== */

/* Abertura do pátio. Kael sobe pelo caminho até o aluno recém-chegado.
   Repare que nada aqui é caixa de texto isolada: ele ANDA até você, o
   jogador se vira sozinho, o chão treme quando o Selo responde. */
SCENES.abertura_patio = {
  bars:true,
  flag:'cena_abertura',
  cmds:[
    {do:'wait', s:0.5},
    {do:'cam',  who:'Kael Archimedes', speed:2.2},
    {do:'wait', s:0.4},
    {do:'say',  text:'O pátio de Stone Reach cheira a pedra molhada e éter velho.'},
    {do:'move', who:'Kael Archimedes', to:() => [G.player.tx, G.player.ty], gap:1},
    {do:'face', who:'Kael Archimedes', dir:'player'},
    {do:'face', who:'player', dir:'down'},
    {do:'cam',  release:true},
    {do:'wait', s:0.3},
    {do:'say',  who:'Kael Archimedes', portrait:'kael_archimedes_portrait', lines:[
      'Você é o novo. Chegou tarde, mas chegou inteiro — já é mais do que a média deste ano.',
      'Meu nome é Kael Archimedes. Vou ser direto, porque não gosto de repetir:',
    ]},
    {do:'sfx',   id:'boss'},
    {do:'shake', mag:7, s:0.9},
    {do:'flash', color:'#8a5aca', s:0.5},
    {do:'wait',  s:0.7},
    {do:'cam',   to:[19, 20], speed:1.6},
    {do:'say',   text:'Um tremor sobe pelo pátio. Vem de baixo — de muito abaixo.'},
    {do:'cam',   who:'Kael Archimedes', speed:3},
    {do:'say',   who:'Kael Archimedes', portrait:'kael_archimedes_portrait', lines:[
      'Isso aí embaixo não devia estar acordado.',
      'A diretora Felt selou o Subterrâneo faz três semanas. O selo está respondendo a alguma coisa.',
      'Se você quer sobreviver ao que vem, aprenda a ouvir o éter antes de tentar mandar nele.',
    ]},
    {do:'cam',  release:true},
    {do:'move', who:'Kael Archimedes', to:[19, 17], wait:false},
    {do:'bars', on:false},
    {do:'sync'},
    {do:'face', who:'Kael Archimedes', dir:'up'},
    {do:'banner', text:'Stone Reach — Pátio Central'},
  ],
};

/* Cena de ENTREGA DE MISSÃO. Não é ligada a mapa nem a tile: quem a
   dispara é `QUESTS.q_zelador.cena`, no momento em que o jogador entrega.
   O motor toca assim que a conversa com o Zelador termina. */
SCENES.entrega_zelador = {
  bars:true,
  flag:'cena_zelador',
  cmds:[
    {do:'wait',  s:0.3},
    {do:'cam',   who:'Zelador', speed:2.4},
    {do:'face',  who:'Zelador', dir:'player'},
    {do:'say',   who:'Zelador', lines:[
      'Espera aí. Antes de você sair correndo.',
      'Seis lobos na passagem não é acaso. Dois, três, eu entendo. Seis é alguma coisa empurrando eles lá de baixo.',
    ]},
    {do:'shake', mag:4, s:0.5},
    {do:'wait',  s:0.4},
    {do:'say',   who:'Zelador', lines:[
      'Faz três semanas que eu ouço o chão. A diretora Felt manda eu calar a boca e varrer.',
      'Você não é da diretoria. Então eu te conto: o que tá subindo não é bicho.',
    ]},
    {do:'face',  who:'Zelador', dir:'down'},
    {do:'wait',  s:0.5},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
  ],
};

/* VHAROK, A ALCATEIA DO VAZIO — Tumba de Cristal Fosco (deserto_fundo).
   Duas cenas, cada uma no gatilho certo:
     · vharok_reveal — MAPS.deserto_fundo.onEnter, primeira vez que se
       entra na sala. Câmera, tremor e a apresentação dele.
     · vharok_outro  — MAPS.deserto_fundo.boss.cena, tocada pelo motor
       depois da vitória (ver combat/27-controller.js). A luta em si
       continua pelo caminho padrão de todo chefe (boss.intro + Battle);
       nenhuma das duas cenas embrulha o combate. */
SCENES.vharok_reveal = {
  bars:true,
  flag:'viu_vharok_intro',
  cmds:[
    /* `cam to:` usa a coordenada do chefe (9,5), não `who`: ele não é um
       NPC do mapa, e o autoteste confere todo `who` DE COMANDO (c.who)
       contra MAPS[mapa].npcs — apontar pro nome dele ali daria falso
       positivo de "fala cita NPC que não existe". Mas o retrato só
       desenha quando a FALA (não o comando) tem `speaker` — então cada
       linha vem como objeto com `speaker` próprio, nunca via `who` do
       comando `say`, que é o único campo que o teste inspeciona. */
    {do:'wait',  s:0.4},
    {do:'cam',   to:[9, 5], speed:1.4},
    {do:'wait',  s:0.5},
    {do:'say',   text:'Entre as duas fogueiras, a sombra já sabia que você vinha antes de você entrar.'},
    {do:'shake', mag:5, s:0.6},
    {do:'flash', color:'#7137b8', s:0.5},
    {do:'sfx',   id:'boss'},
    {do:'wait',  s:0.3},
    {do:'say',   portrait:'boss_vharok_retrato_calmo', lines:[
      {speaker:'Vharok', text:'Corra.'},
      {speaker:'Vharok', text:'Há muito tempo espero uma presa que aprenda.'},
      {speaker:'Vharok', text:'Mostre-me até onde consegue fugir.'},
    ]},
    {do:'cam',   release:true},
    {do:'bars',  on:false},
  ],
};

SCENES.vharok_outro = {
  bars:true,
  flag:'viu_vharok_outro',
  cmds:[
    {do:'wait',  s:0.4},
    {do:'shake', mag:3, s:0.5},
    {do:'say',   text:'A fumaça violeta se desfaz devagar, como se ainda estivesse decidindo se volta.'},
    {do:'say',   portrait:'boss_vharok_retrato_calmo',
     lines:[{speaker:'Vharok', text:'Então... era eu... a presa?'}]},
    {do:'bars',  on:false},
  ],
};
