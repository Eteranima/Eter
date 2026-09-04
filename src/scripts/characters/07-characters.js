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
  /* v5.31 — Beatriz e Calder nunca ganharam um "-src.webp" dedicado: a
     arte que existe pra eles é a mesma catalogada para o diálogo
     (`dlg_*`), mas em corpo inteiro e na mesma qualidade das outras
     artes de combate — não é um busto reaproveitado. v5.32: os dois
     saíram de PARTY_DEFS (viraram guests-tutoriais, ver GUEST_ALLIES),
     mas a entrada aqui continua servindo — é ela que desenha os dois
     na luta de demonstração. Se um dia chegar arte de batalha própria,
     troque só o `src` aqui. */
  'Beatriz Demeter': {w:98, h:152, src:'assets/characters/dlg_beatriz.webp'},
  'Calder Pell': {w:100, h:152, src:'assets/characters/dlg_calderpell.webp'},
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
/* v5.32 — `lore` e `cenario` alimentam a tela de escolha (ui/31-
   character-select.js): cada personagem passou a ter uma frase de
   origem (distinta do `pitch`, que é sobre jogabilidade solo) e um
   fundo de região (mesma arte usada em `battle_bg_*` no combate) que
   representa de onde ele vem — o "lugar no mapa" pedido pelo usuário.
   Nenhum dos dois é lido por save nem por combate: existem só pra essa
   tela. Cobre a lacuna documentada em docs/06-PERSONAGENS.md — "o
   elenco tem papel mecânico, não voz". */
const PARTY_DEFS = [
  {name:'Seiji',   element:'ink',         role:'Escriba',   sheet:'kael_sheet',    portrait:'kael_portrait',
   base:{hp:85, mp:40, atk:18, def:12, spd:15}, grow:{hp:9, mp:5, atk:2.2, def:1.6, spd:1.5},
   learn:[[1,'ink_cut'],[1,'ink_stain'],[8,'ink_flood'],[12,'ink_seal'],[15,'ink_verse'],[20,'ink_erase'],[24,'ink_margin'],[28,'ink_deluge']],
   pitch:'Nada de extremo e nada de buraco. Começo mais seguro para quem não conhece o jogo.',
   lore:'O Códice Sem Fundo é o que sobra dele quando o resto da Academia esquece.', cenario:'arquivo'},
  {name:'Ophelia', element:'ice',         role:'Curandeira',sheet:'ophelia_sheet', portrait:'ophelia_portrait',
   base:{hp:70, mp:55, atk:14, def:10, spd:13}, grow:{hp:7, mp:8, atk:1.6, def:1.4, spd:1.4},
   learn:[[1,'ice_shard'],[1,'mend'],[6,'ice_deep'],[10,'mend_all'],[13,'ice_lance'],[16,'cleanse'],[20,'ice_grave'],[25,'recall'],[29,'mend_deep']],
   pitch:'Cura desde o nível 1: quase não morre, mas as lutas demoram. Sobrevive a erros.',
   lore:'Aprendeu a tratar o frio dos outros tratando o próprio primeiro.', cenario:'cistern'},
  {name:'Marin',   element:'darkness',    role:'Assassina', sheet:'marin_sheet',   portrait:'marin_portrait',
   base:{hp:75, mp:50, atk:20, def:9,  spd:16}, grow:{hp:8, mp:6, atk:2.6, def:1.2, spd:1.9},
   learn:[[1,'dark_veil'],[1,'eclipse'],[7,'drain'],[12,'shadowstep'],[16,'rend'],[20,'darknight'],[25,'abyss'],[30,'souldrain']],
   pitch:'Bate primeiro e bate forte, mas apanha feio. Sozinha, é corrida contra o relógio.',
   lore:'Não fala de antes de Stone Reach. A Hora Sem Estrelas prefere assim.', cenario:'deepway'},
  {name:'Gabriel', element:'fire',        role:'Guardião',  sheet:'gabriel_sheet', portrait:'gabriel_portrait',
   base:{hp:90, mp:35, atk:22, def:14, spd:11}, grow:{hp:11,mp:4, atk:2.4, def:2.1, spd:1.1},
   learn:[[1,'fire_fist'],[1,'blaze'],[9,'bulwark'],[12,'flamewall'],[14,'taunt'],[18,'hammer'],[23,'emberguard'],[29,'furnace']],
   pitch:'Mais vida e mais defesa que todo mundo. Aguenta o começo solo na base do couro.',
   lore:'Cresceu ouvindo forja, não conversa. Guarda o calor pra ninguém se queimar.', cenario:'ashwood'},
  {name:'Max',     element:'electricity', role:'Vanguarda', sheet:'max_sheet',     portrait:'max_portrait',
   base:{hp:78, mp:42, atk:19, def:11, spd:17}, grow:{hp:8, mp:6, atk:2.3, def:1.5, spd:2.1},
   learn:[[1,'jolt'],[1,'haste'],[8,'storm'],[12,'chain'],[15,'overload'],[19,'blitz'],[24,'haste_all'],[30,'thunderfall']],
   pitch:'O mais rápido do elenco — costuma agir duas vezes antes do inimigo se mexer.',
   lore:'Nunca chegou atrasado uma vez na vida, e é o único orgulho que admite ter.', cenario:'spire'},
  /* Eden é a segunda curandeira, mas NÃO é uma segunda Ophelia:
     a Ophelia cura forte em um alvo, a Eden cura fraco em TODOS desde o
     nível 1 e abre o inimigo com Exposto, fazendo o time bater mais. */
  {name:'Eden',     element:'wind',        role:'Oráculo',   sheet:'eden_sheet',     portrait:'eden_portrait',
   base:{hp:72, mp:52, atk:15, def:10, spd:15}, grow:{hp:7, mp:7, atk:1.7, def:1.3, spd:1.6},
   learn:[[1,'gale_cut'],[1,'breath'],[6,'updraft'],[11,'stormeye'],[14,'tailwind'],[16,'windblade'],[20,'cleanwind'],[25,'cyclone'],[31,'worldbreath']],
   pitch:'Cura fraca em todos e abre o inimigo com Exposto. Brilha em grupo, sofre sozinha.',
   lore:'Fala pouco porque o vento já carrega o aviso um passo antes de qualquer golpe.', cenario:'nests'},
  /* v5.32 — Ava Rosa Groot e Scythe saíram do elenco jogável e viraram
     guests-tutoriais (ver GUEST_ALLIES, mais abaixo): a Ava ensina
     escudo em grupo, a Scythe ensina golpe único devastador. Motivo:
     pedido explícito do usuário — travar personagens específicos como
     ajuda de IA em vez de membros recrutáveis normais. GUEST_ALLIES dá
     a cada um stats e UMA habilidade novos, pensados só pra lição — o
     kit antigo (`learn`, em SKILLS) fica órfão no arquivo de skills,
     sem quebrar nada (nenhum autoteste exige skill sem dono). */
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
   pitch:'Regenera sozinho fora da luta e se esconde atrás de uma caixa. Não morre, só desiste devagar.',
   lore:'A caixa de papelão não é covardia. É o único abrigo que nunca o abandonou.', cenario:'podridao'},
  /* ============ v5.30: A GERAÇÃO ANTERIOR ENTRA EM CAMPO ============
     Quatro professores de Stone Reach viraram jogáveis nesta leva.
     Chegavam com curva de 29 anos de ofício: base alta e crescimento
     MENOR que o dos alunos, porque quem já está formado cresce menos.

     v5.32 — Orfeu Bauss, Abel Nomikos e Amanda Felt saíram do elenco
     jogável (viraram guests-tutoriais, ver GUEST_ALLIES: contra-ataque,
     área e quebra de armadura, respectivamente). Só o Snoopy, dos
     quatro, continua aqui. */
  {name:'Snoopy',  element:'electricity', role:'Assassino', geracao:'anterior',
   sheet:'snoopy_sheet', portrait:'snoopy_portrait',
   base:{hp:112, mp:52, atk:22, def:16, spd:19}, grow:{hp:8.6, mp:4.8, atk:2.1, def:1.5, spd:1.5},
   learn:[[1,'sn_faisca'],[1,'sn_marca'],[8,'sn_passo'],[12,'sn_sopro'],[15,'sn_corrente'],
          [20,'sn_garra'],[24,'sn_voo'],[28,'sn_despertar']],
   pitch:'Marca o alvo, acelera e cai em cima. Frágil, mas escolhe quem morre primeiro.',
   lore:'Marca primeiro, sente depois. Se é que sente.', cenario:'esgoto'},

  /* ============ v5.31/v5.32: TRÊS QUE JÁ TINHAM SPRITE E SHEET ======
     Beatriz Demeter, Calder Pell e Carmila Reachforth chegaram ao
     catálogo de assets prontos (v5.31) e viraram jogáveis por uma leva.
     v5.32 — nenhum dos três continua em PARTY_DEFS: Beatriz e Calder
     viraram guests-tutoriais (cura em grupo e dreno de vida, ver
     GUEST_ALLIES); Carmila saiu do elenco jogável sem virar guest —
     pedido do usuário, sem mecânica de tutorial associada a ela. A
     missão que a recrutava (`q_sanguessuga`) agora paga em equipamento
     em vez de companheira (ver 11-quests.js e RECRUIT_QUESTS). */
];

/* --- Guests-tutoriais ----------------------------------------------
   Nenhum destes 9 é PARTY_DEFS: nunca são recrutados, nunca entram em
   G.party/G.squad, nunca são salvos. Existem só para uma luta de
   demonstração de 1-2 rodadas (gancho em Battle.begin({guest:...}),
   ver makeGuestAlly() em engine/16-save-state.js e guestAct() em
   combat/27-controller.js) — o padrão "Wally leva você até o mato e
   captura um Pokémon" que o usuário pediu: um NPC entra na luta,
   mostra UMA mecânica em segundos e sai, sem virar personagem de
   verdade. Estatística fixa (nível 5 equivalente), sem base/grow/
   learn/árvore — não precisa, porque nunca ganha EXP nem persiste.

   v5.32 — sete destes nove (todos menos Malquior/Sebastian, que já
   eram NPC-only) SAÍRAM de PARTY_DEFS nesta versão: eram personagem
   jogável shipado, e o usuário pediu explicitamente para travá-los
   como ajuda de IA em vez de membro recrutável. `sheet`/`portrait`
   reaproveitam a arte de campo/diálogo que cada um já tinha como
   jogável — é a mesma pessoa, só o papel mudou.

   GRADUAL POR FLAG: cada um só aparece no mundo (ver `needFlag` na
   entrada de `npcs` em world/12-maps.js, filtrado em engine/17-world.js)
   depois de um marco de progresso — Abel é o único sempre disponível
   desde o início. Mecânica e local, na ordem em que se desbloqueiam:
     Abel      → área              · Pátio (sempre)
     Ava       → escudo em grupo   · Câmara do Selo, após warden_defeated
     Malquior  → marcar alvo       · Biblioteca, após echo_defeated
     Sebastian → provocar          · Anexo, após cinder_defeated
     Orfeu     → contra-ataque     · A Chocadeira, após ninho_defeated
     Beatriz   → cura em grupo     · A Comporta, após deluge_defeated
     Calder    → dreno de vida     · Coroa de Vidro (Cume), após crown_defeated
     Amanda    → quebra de guarda  · A Última Prateleira, após arquivista_defeated
     Scythe    → golpe devastador  · Tumba de Cristal Fosco, após vharok_defeated */
const GUEST_ALLIES = {
  abel: {name:'Abel Nomikos', element:'fire', role:'Mago',
    sheet:'abel_sheet', portrait:'abel_portrait',
    hp:120, mp:50, atk:24, def:13, spd:15, guestSkill:'guest_area',
    licao:'Habilidade em área acerta todo mundo de uma vez — poucos alvos sobrevivem a isso por muito tempo.'},
  ava: {name:'Ava Rosa Groot', element:'earth', role:'Druida',
    sheet:'ava_sheet', portrait:'ava_portrait',
    hp:150, mp:40, atk:12, def:20, spd:10, guestSkill:'guest_escudo',
    licao:'Um escudo em todo o grupo custa o turno de quem lança, mas paga a diferença nas rodadas seguintes.'},
  malquior: {name:'Malquior Morningstar', element:'darkness', role:'Ocultista',
    sheet:'npc_encapuzado', portrait:'dlg_malquior',
    hp:130, mp:40, atk:20, def:12, spd:14, guestSkill:'guest_marca',
    licao:'Marcar todo mundo de uma vez custa o turno, mas ninguém escapa da mira depois disso.'},
  sebastian: {name:'Sebastian Crowley', element:'light', role:'Guardião',
    sheet:'npc_batedor', portrait:'dlg_sebastian',
    hp:150, mp:40, atk:14, def:18, spd:12, guestSkill:'guest_provocar',
    licao:'Provocar puxa o golpe pra quem aguenta — o resto do grupo respira um turno.'},
  orfeu: {name:'Orfeu Bauss', element:'none', role:'Lutador',
    sheet:'orfeu_sheet', portrait:'orfeu_portrait',
    hp:170, mp:30, atk:26, def:19, spd:16, guestSkill:'guest_contra',
    licao:'Esperar o golpe errado do inimigo vale mais que apressar o seu.'},
  beatriz: {name:'Beatriz Demeter', element:'light', role:'Paladina',
    sheet:'beatriz_sheet', portrait:'dlg_beatriz',
    hp:140, mp:55, atk:20, def:16, spd:15, guestSkill:'guest_cura',
    licao:'Curar todo mundo de uma vez custa o turno inteiro — vale quando ninguém pode cair agora.'},
  calder: {name:'Calder Pell', element:'darkness', role:'Ocultista',
    sheet:'calderpell_sheet', portrait:'dlg_calderpell',
    hp:125, mp:60, atk:22, def:14, spd:14, guestSkill:'guest_dreno',
    licao:'Cada ponto tirado do inimigo é um ponto que volta pra você.'},
  amanda: {name:'Amanda Felt', element:'fire', role:'Cavaleira',
    sheet:'amanda_sheet', portrait:'amanda_portrait',
    hp:165, mp:45, atk:25, def:20, spd:17, guestSkill:'guest_quebra',
    licao:'Quebrar a guarda de todo mundo de uma vez abre o caminho pro resto do grupo.'},
  scythe: {name:'Scythe', element:'poison', role:'Ceifadora',
    sheet:'scythe_sheet', portrait:'scythe_portrait',
    hp:110, mp:45, atk:30, def:12, spd:19, guestSkill:'guest_nuke',
    licao:'Um golpe só, pensado pra encerrar a luta ali mesmo.'},
};

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
