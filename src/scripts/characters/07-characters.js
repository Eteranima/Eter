const BATTLE_ART = {
  /* v5.30 — a arte destes quatro mora em SPRITE_DATA, embutida por
     `assets/_elenco.py`, e não colada aqui: são 400 KB de base64 que não
     têm por que engordar uma tabela que se lê à mão. O arquivo 02 carrega
     antes deste, então a referência já existe quando esta linha roda. */
  'Amanda Felt':  {w:106, h:152, src:SPRITE_DATA.amanda_battle},
  'Abel Nomikos': {w:97,  h:152, src:SPRITE_DATA.abel_battle},
  'Orfeu Bauss':  {w:99,  h:152, src:SPRITE_DATA.orfeu_battle},
  Snoopy:         {w:92,  h:152, src:SPRITE_DATA.snoopy_battle},
  Seiji: {w:96, h:152, src:'assets/characters/seiji-src.webp'},
  Ophelia: {w:95, h:152, src:'assets/characters/ophelia-src.webp'},
  Marin: {w:101, h:152, src:'assets/characters/marin-src.webp'},
  Gabriel: {w:93, h:152, src:'assets/characters/gabriel-src.webp'},
  Max: {w:94, h:152, src:'assets/characters/max-src.webp'},
  Eden: {w:63, h:152, src:'assets/characters/eden-src.webp'},
  'Ava Rosa Groot': {w:97, h:152, src:'assets/characters/ava-rosa-groot-src.webp'},
  Madao: {w:77, h:152, src:'assets/characters/madao-src.webp'},
  /* Papelão e Vitória são os outros dois estados do Madao. */
  'Madao Papelão': {w:78, h:152, src:'assets/characters/madao-papel-o-src.webp'},
  'Madao Vitória': {w:83, h:152, src:'assets/characters/madao-vit-ria-src.webp'},
  /* O Lycan é a arte mais LARGA do jogo (braços abertos) e por isso é a
     mais baixa: a formação de batalha tem teto de 104px de largura — o
     aliado da esquerda fica em x=530 e o painel de comandos termina em
     478. Passar disso invade o painel e joga a sobreposição entre corpos
     acima de 25%. Numa criatura agachada, ceder altura é o que menos
     custa; ceder o layout custaria a leitura da tela inteira.
     A forma Lycan entra no MESMO BATTLE_ART: `battleArtOf` procura por
     NOME, e é trocando o nome do ator que a transformação aparece. */
  'Gabriel Lycan': {w:104, h:134, src:'assets/characters/gabriel-lycan-src.webp'},
  Scythe: {w:90, h:152, src:'assets/characters/scythe-src.webp'},
  /* v5.31 — Beatriz, Calder e Carmila nunca ganharam um "-src.webp"
     dedicado: a arte que existe pra elas é a mesma catalogada para o
     diálogo (`dlg_*`), mas em corpo inteiro e na mesma qualidade das
     outras artes de combate — não é um busto reaproveitado. Se um dia
     chegar arte de batalha própria, troque só o `src` aqui. */
  'Beatriz Demeter': {w:98, h:152, src:'assets/characters/dlg_beatriz.webp'},
  'Calder Pell': {w:100, h:152, src:'assets/characters/dlg_calderpell.webp'},
  'Carmila Reachforth': {w:96, h:152, src:'assets/characters/dlg_carmila.webp'},
};

/* --- Party -------------------------------------------------------- */
/* NOTA DE SPRITES: `sheet`/`portrait` apontam para chaves de SPRITE_DATA.
   O mapeamento atual foi herdado da v2.6 (ex.: Seiji usa `kael_sheet`).
   Para trocar por arte definitiva basta editar estas duas linhas por
   personagem — nada mais no código referencia os nomes das folhas. */
/* `pitch` é a frase da tela de escolha do protagonista. Ela existe para
   informar a DECISÃO, não para vender o personagem: quem escolhe está
   escolhendo com quem vai jogar sozinho a primeira região inteira, então
   a frase diz honestamente como é a vida solo dele. */
const PARTY_DEFS = [
  {name:'Seiji',   element:'ink',         role:'Escriba',   sheet:'kael_sheet',    portrait:'kael_portrait',
   base:{hp:85, mp:40, atk:18, def:12, spd:15}, grow:{hp:9, mp:5, atk:2.2, def:1.6, spd:1.5},
   learn:[[1,'ink_cut'],[1,'ink_stain'],[8,'ink_flood'],[12,'ink_seal'],[15,'ink_verse'],[20,'ink_erase'],[24,'ink_margin'],[28,'ink_deluge']],
   pitch:'Nada de extremo e nada de buraco. Começo mais seguro para quem não conhece o jogo.'},
  {name:'Ophelia', element:'ice',         role:'Curandeira',sheet:'ophelia_sheet', portrait:'ophelia_portrait',
   base:{hp:70, mp:55, atk:14, def:10, spd:13}, grow:{hp:7, mp:8, atk:1.6, def:1.4, spd:1.4},
   learn:[[1,'ice_shard'],[1,'mend'],[6,'ice_deep'],[10,'mend_all'],[13,'ice_lance'],[16,'cleanse'],[20,'ice_grave'],[25,'recall'],[29,'mend_deep']],
   pitch:'Cura desde o nível 1: quase não morre, mas as lutas demoram. Sobrevive a erros.'},
  {name:'Marin',   element:'darkness',    role:'Assassina', sheet:'marin_sheet',   portrait:'marin_portrait',
   base:{hp:75, mp:50, atk:20, def:9,  spd:16}, grow:{hp:8, mp:6, atk:2.6, def:1.2, spd:1.9},
   learn:[[1,'dark_veil'],[1,'eclipse'],[7,'drain'],[12,'shadowstep'],[16,'rend'],[20,'darknight'],[25,'abyss'],[30,'souldrain']],
   pitch:'Bate primeiro e bate forte, mas apanha feio. Sozinha, é corrida contra o relógio.'},
  {name:'Gabriel', element:'fire',        role:'Guardião',  sheet:'gabriel_sheet', portrait:'gabriel_portrait',
   base:{hp:90, mp:35, atk:22, def:14, spd:11}, grow:{hp:11,mp:4, atk:2.4, def:2.1, spd:1.1},
   learn:[[1,'fire_fist'],[1,'blaze'],[9,'bulwark'],[12,'flamewall'],[14,'taunt'],[18,'hammer'],[23,'emberguard'],[29,'furnace']],
   pitch:'Mais vida e mais defesa que todo mundo. Aguenta o começo solo na base do couro.'},
  {name:'Max',     element:'electricity', role:'Vanguarda', sheet:'max_sheet',     portrait:'max_portrait',
   base:{hp:78, mp:42, atk:19, def:11, spd:17}, grow:{hp:8, mp:6, atk:2.3, def:1.5, spd:2.1},
   learn:[[1,'jolt'],[1,'haste'],[8,'storm'],[12,'chain'],[15,'overload'],[19,'blitz'],[24,'haste_all'],[30,'thunderfall']],
   pitch:'O mais rápido do elenco — costuma agir duas vezes antes do inimigo se mexer.'},
  /* Eden é a segunda curandeira, mas NÃO é uma segunda Ophelia:
     a Ophelia cura forte em um alvo, a Eden cura fraco em TODOS desde o
     nível 1 e abre o inimigo com Exposto, fazendo o time bater mais. */
  {name:'Eden',     element:'wind',        role:'Oráculo',   sheet:'eden_sheet',     portrait:'eden_portrait',
   base:{hp:72, mp:52, atk:15, def:10, spd:15}, grow:{hp:7, mp:7, atk:1.7, def:1.3, spd:1.6},
   learn:[[1,'gale_cut'],[1,'breath'],[6,'updraft'],[11,'stormeye'],[14,'tailwind'],[16,'windblade'],[20,'cleanwind'],[25,'cyclone'],[31,'worldbreath']],
   pitch:'Cura fraca em todos e abre o inimigo com Exposto. Brilha em grupo, sofre sozinha.'},
  /* v5.1 — os dois que entram por último no elenco.
     A Ava não é uma terceira curandeira: ela quase não cura, ela impede
     o dano antes dele acontecer. Tem o maior DEF do elenco e o menor ATK.
     A Scythe divide o papel de assassina com a Marin, mas por outro
     caminho: a Marin é pico e a Scythe é subtração — tira o turno do
     inimigo com Pavor antes de tirar o HP. */
  {name:'Ava Rosa Groot', element:'earth', role:'Druida',
   sheet:'ava_sheet', portrait:'ava_portrait',
   base:{hp:88, mp:50, atk:13, def:16, spd:10}, grow:{hp:10, mp:7, atk:1.4, def:2.3, spd:1.0},
   learn:[[1,'root_lash'],[1,'bark_ward'],[7,'bloom'],[11,'stonehide'],[15,'quake'],
          [19,'deeproot'],[23,'greenmend'],[27,'gaia_wall'],[31,'regrowth']],
   pitch:'Aguenta mais que todo mundo e quase não bate. Sozinha, empaca; em grupo, ninguém cai.'},
  {name:'Scythe', element:'poison', role:'Ceifadora',
   sheet:'scythe_sheet', portrait:'scythe_portrait',
   base:{hp:74, mp:48, atk:21, def:10, spd:18}, grow:{hp:8, mp:6, atk:2.5, def:1.3, spd:2.0},
   learn:[[1,'toxin_cut'],[1,'wither'],[8,'dreadcut'],[12,'creeping'],[16,'scythe_arc'],
          [20,'venom_veil'],[25,'reaping'],[30,'last_rites']],
   pitch:'Tira o turno do inimigo antes de tirar a vida. Rápida, letal e de vidro.'},
  /* Madao NÃO divide mais elemento de combate com ninguém: virou Cinzas
     (ID interno `blood`, reaproveitando a posição de Sangue no anel —
     ver comentário em ELEM.blood), a mesma família da identidade da
     árvore dele, que antes era só cosmética. Continua com o menor ATK
     do elenco depois da Ava; a mudança troca fraqueza/resistência e
     conjuntas, não o resto do balanceamento. */
  {name:'Madao', element:'blood', role:'Vagabundo',
   sheet:'madao_sheet', portrait:'madao_portrait',
   base:{hp:92, mp:38, atk:15, def:15, spd:12}, grow:{hp:11, mp:5, atk:1.6, def:2.2, spd:1.2},
   learn:[[1,'m_punch'],[1,'cardboard'],[6,'m_nap'],[10,'m_ember'],[14,'m_shrug'],
          [18,'m_flare'],[22,'m_box_all'],[26,'m_bonfire'],[30,'m_last']],
   pitch:'Regenera sozinho fora da luta e se esconde atrás de uma caixa. Não morre, só desiste devagar.'},
  /* ============ v5.30: A GERAÇÃO ANTERIOR ENTRA EM CAMPO ============
     Quatro professores de Stone Reach viram jogáveis. Chegam com curva
     de 29 anos de ofício: base alta e crescimento MENOR que o dos
     alunos, porque quem já está formado cresce menos. No fim da curva
     empatam com o elenco; no meio, adiantam.

     `geracao` separa aluno de professor, e é o que a regra de pet
     consulta — pet se conquista no Ninhal, que é coisa de estudante.
     A exceção é a Amanda: o dragão da diretora já era dela no jogo
     antes de ela ser jogável, e agora tem dono de verdade.

     NOTA DE CÂNONE: o documento diz que a Amanda "não é jogável — ela é
     a diretora". A arte de combate que chegou diz o contrário, e a arte
     ganhou. Reverter é apagar a entrada dela daqui. */
  {name:'Orfeu Bauss', element:'none',  role:'Lutador', geracao:'anterior',
   sheet:'orfeu_sheet',  portrait:'orfeu_portrait',
   base:{hp:132, mp:34, atk:24, def:20, spd:17}, grow:{hp:10, mp:3.4, atk:2.1, def:1.8, spd:1.3},
   learn:[[1,'or_golpe'],[1,'or_guarda'],[8,'or_absorver'],[12,'or_rodada'],[15,'or_disciplina'],
          [20,'or_contra'],[24,'or_vazio'],[28,'or_conquista']],
   pitch:'Lutador sem elemento nenhum, e é essa a graça: não há fraqueza elemental para explorar.'},
  {name:'Abel Nomikos', element:'fire',  role:'Mago', geracao:'anterior',
   sheet:'abel_sheet',   portrait:'abel_portrait',
   base:{hp:104, mp:58, atk:23, def:14, spd:16}, grow:{hp:8, mp:5.2, atk:2.2, def:1.4, spd:1.3},
   learn:[[1,'ab_leitura'],[1,'ab_nota'],[8,'ab_runa'],[12,'ab_indice'],[15,'ab_pagina'],
          [20,'ab_calculo'],[24,'ab_tomo'],[28,'ab_conclusao']],
   pitch:'Mago de Fogo, dano mágico. Desmonta o inimigo antes de queimá-lo.'},
  {name:'Snoopy',  element:'electricity', role:'Assassino', geracao:'anterior',
   sheet:'snoopy_sheet', portrait:'snoopy_portrait',
   base:{hp:112, mp:52, atk:22, def:16, spd:19}, grow:{hp:8.6, mp:4.8, atk:2.1, def:1.5, spd:1.5},
   learn:[[1,'sn_faisca'],[1,'sn_marca'],[8,'sn_passo'],[12,'sn_sopro'],[15,'sn_corrente'],
          [20,'sn_garra'],[24,'sn_voo'],[28,'sn_despertar']],
   pitch:'Marca o alvo, acelera e cai em cima. Frágil, mas escolhe quem morre primeiro.'},
  {name:'Amanda Felt', element:'fire', role:'Cavaleira', geracao:'anterior',
   sheet:'amanda_sheet', portrait:'amanda_portrait',
   base:{hp:140, mp:56, atk:27, def:21, spd:20}, grow:{hp:9.4, mp:4.6, atk:2.0, def:1.6, spd:1.2},
   learn:[[1,'am_lamina'],[1,'am_fenda'],[8,'am_ordem'],[12,'am_asa'],[15,'am_selo'],
          [20,'am_coroa'],[24,'am_dracon'],[28,'am_herdeira']],
   pitch:'Cavaleira de Fogo, dano físico. A base mais alta do elenco e o crescimento mais lento.'},

  /* ============ v5.31: TRÊS QUE JÁ TINHAM SPRITE E SHEET ============
     Beatriz Demeter, Calder Pell e Carmila Reachforth chegaram ao
     catálogo de assets prontos (sheet de campo + retrato) sem NENHUMA
     ficha de personagem em lugar nenhum — nem stats, nem elemento, nem
     habilidade. `geracao:'anterior'` porque nenhum dos três lê como
     estudante recém-chegado; mesma curva de base/crescimento da v5.30
     (base alta, cresce menos, empata com o elenco lá na frente). Sem pet
     de Ninhal, como todo `anterior`. Elemento: Beatriz fecha Luz, a
     única das dez afinidades do anel sem NENHUM personagem jogável até
     aqui; Calder e Carmila repetem Trevas/Cinzas, que já eram únicas —
     duplicar elemento é o padrão já usado em Fogo (3×) e Eletricidade
     (2×), não uma exceção. */
  {name:'Beatriz Demeter', element:'light', role:'Paladina', geracao:'anterior',
   sheet:'beatriz_sheet', portrait:'dlg_beatriz',
   base:{hp:118, mp:50, atk:24, def:17, spd:16}, grow:{hp:9, mp:4.6, atk:2.1, def:1.7, spd:1.3},
   learn:[[1,'bt_corte'],[1,'bt_veredito'],[8,'bt_disciplina'],[12,'bt_circulo'],[15,'bt_juramento'],
          [20,'bt_exorcismo'],[24,'bt_alvorada'],[28,'bt_sentenca']],
   pitch:'Atordoa antes de cortar, mas gasta luz rápido demais pra abusar sozinha. Boa entrada, ruim em maratona.'},
  {name:'Calder Pell', element:'darkness', role:'Ocultista', geracao:'anterior',
   sheet:'calderpell_sheet', portrait:'dlg_calderpell',
   base:{hp:100, mp:64, atk:20, def:15, spd:15}, grow:{hp:7.6, mp:5.8, atk:1.9, def:1.5, spd:1.3},
   learn:[[1,'cp_toque'],[1,'cp_pacto'],[8,'cp_correntes'],[12,'cp_ordalia'],[15,'cp_juramento_negro'],
          [20,'cp_veredicto'],[24,'cp_colheita'],[28,'cp_ultimo_selo']],
   pitch:'Não corre atrás de nada — mas sozinho, a maldição demora pra fechar o cerco, e ele apanha esperando.'},
  {name:'Carmila Reachforth', element:'blood', role:'Condessa', geracao:'anterior',
   sheet:'carmila_sheet', portrait:'dlg_carmila',
   base:{hp:108, mp:54, atk:23, def:16, spd:18}, grow:{hp:8.2, mp:5.0, atk:2.0, def:1.6, spd:1.5},
   learn:[[1,'cm_unha'],[1,'cm_convite'],[8,'cm_veia'],[12,'cm_banquete'],[15,'cm_pacto'],
          [20,'cm_sede'],[24,'cm_enxame'],[28,'cm_ceia_eterna']],
   pitch:'Cada golpe reabastece ela, então sozinha aguenta mais do que parece. Só não tem com quem repartir o excedente.'},
];

/* ===================================================================
   4b. ÁRVORE DE HABILIDADES
   -------------------------------------------------------------------
   Até a v4.9 habilidade caía no colo por nível (`def.learn`). A árvore
   troca isso por gasto de PONTO DE ALMA: subir de nível dá pontos, e o
   jogador decide a ordem. O elenco não muda — as habilidades são as
   MESMAS de `SKILLS`; o que muda é como se chega nelas.

   A árvore é GERADA, não escrita à mão. São seis personagens e ~50
   habilidades, e uma tabela manual desse tamanho envelhece mal: bastaria
   alguém acrescentar uma habilidade em `SKILLS` para a árvore ficar
   mentindo. Aqui a fonte da verdade continua sendo `def.learn` — a
   ordem de aprendizado vira a ordem da árvore, então rebalancear um
   personagem é mexer numa linha só, como antes.

   FORMA (a da imagem de referência, adaptada): um núcleo no centro e
   ramos saindo dele. Na referência os ramos são os elementos; aqui cada
   personagem tem UM elemento só, então ramificar por elemento daria
   três galhos idênticos. O que de fato divide o repertório de cada um é
   o VERBO da habilidade, e isso já está nos dados (`type`/`target`):

     · Lâmina  — atacar um alvo         (type 'atk', target 'one')
     · Maré    — atacar todos           (type 'atk', target 'all')
     · Voz     — curar, buffar, debuffar, reanimar

   Cada ramo é uma corrente: para chegar na habilidade seguinte é
   preciso comprar a passiva que vem antes. É ela que cria o custo de
   oportunidade — sem gasto obrigatório no meio, "árvore" seria só uma
   lista de compras. Fora da corrente pendem FOLHAS opcionais, que dão
   atributo e não travam nada: são elas que o jogador sacrifica quando
   quer chegar rápido no fim de um ramo.
   =================================================================== */
