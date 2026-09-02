/* =====================================================================
   ÉTER ANIMA — Stone Reach Academy
   Motor JRPG. Fonte em src/, montado por build.ps1. v4.9.0
   --------------------------------------------------------------------
   Ordem dos módulos (um arquivo por bloco em src/):
     0  SPRITE_DATA (base64, gerado)      8  Field / mundo
     1  Config + Util                     9  Mensagens e menus (canvas)
     2  Dados (elementos/status/itens…)  10  Combate (modelo)
     3  Áudio (sintetizado, sem assets)  11  Combate (view + controle)
     4  Input (teclado + toque + mouse)  12  FX (shake/flash/hitstop/pop)
     5  Render helpers                   13  Loop principal + boot
     6  Save/Load (localStorage)        13b Cenas (cutscenes) + roteiros
     7  Estado de jogo                   14  Autoteste  (abra com ?test)
   ===================================================================== */

// --- SPRITE LOADING ---
const SPRITE_DATA = {"gabriel_sheet": "assets/characters/gabriel_sheet.webp", "ophelia_sheet": "assets/characters/ophelia_sheet.webp", "kael_sheet": "assets/characters/kael_sheet.png", "seiji_portrait": "assets/characters/seiji_portrait.png", "gabriel_portrait": "assets/characters/gabriel_portrait.png", "ophelia_portrait": "assets/characters/ophelia_portrait.png", "kael_portrait": "assets/characters/kael_portrait.png", "max_sheet": "assets/characters/max_sheet.png", "max_portrait": "assets/characters/max_portrait.png", "marin_portrait": "assets/characters/marin_portrait.png", "marin_sheet": "assets/characters/marin_sheet.png", "eden_sheet": "assets/characters/eden_sheet.png", "eden_portrait": "assets/characters/eden_portrait.png", "mob_aranha": "assets/monsters/mob_aranha.png", "mob_cavaleiro": "assets/monsters/mob_cavaleiro.png", "mob_esqueleto": "assets/monsters/mob_esqueleto.png", "mob_fantasma": "assets/monsters/mob_fantasma.png", "mob_goblin": "assets/monsters/mob_goblin.png", "mob_harpia": "assets/monsters/mob_harpia.png", "mob_ladino": "assets/monsters/mob_ladino.png", "mob_lobo": "assets/monsters/mob_lobo.png", "mob_mago": "assets/monsters/mob_mago.png", "mob_orc": "assets/monsters/mob_orc.png", "mob_slime": "assets/monsters/mob_slime.png", "mob_treant": "assets/monsters/mob_treant.png", "npc_aluno": "assets/world/npc_aluno.png", "npc_balconista": "assets/world/npc_balconista.png", "npc_bibliotecaria": "assets/world/npc_bibliotecaria.png", "npc_enfermeira": "assets/world/npc_enfermeira.png", "npc_estudante": "assets/world/npc_estudante.png", "npc_kael": "assets/world/npc_kael.png", "npc_lina": "assets/world/npc_lina.png", "npc_mercador": "assets/world/npc_mercador.png", "npc_veterano": "assets/world/npc_veterano.png", "npc_zelador": "assets/world/npc_zelador.png"};


/* ELENCO_V51_BLOCO — folhas e retratos da Ava Rosa Groot e da Scythe.
   As folhas vieram de arte 4x4 (frente/esquerda/costas/direita) e foram
   remontadas na grade 3x4 do jogo alinhando pelos PÉS, igual à do Marin.
   A ordem das linhas da origem NÃO é a do jogo — lá as costas vêm antes
   da direita —, então as duas últimas foram trocadas na conversão. */
Object.assign(SPRITE_DATA, {
  ava_sheet: "assets/characters/ava_sheet.webp",
  scythe_sheet: "assets/characters/scythe_sheet.webp",
  ava_portrait: "assets/characters/ava_portrait.webp",
  scythe_portrait: "assets/characters/scythe_portrait.webp",
});
/* ICONES_ARMA_BLOCO — ícones 24x24 das armas. Vieram com fundo PRETO
   e uma franja verde de um chroma anterior; os dois saíram por
   inundação a partir da borda, que preserva o contorno escuro do
   desenho — chave por cor apagaria o contorno junto com o fundo.
   Entram no mesmo SPRITE_DATA para reusar carregador e cache. */
Object.assign(SPRITE_DATA, {
  icon_axe: "assets/ui/icon_axe.webp",
  icon_book: "assets/ui/icon_book.webp",
  icon_bow: "assets/ui/icon_bow.webp",
  icon_shuriken: "assets/ui/icon_shuriken.webp",
  icon_spear: "assets/ui/icon_spear.webp",
  icon_spear_red: "assets/ui/icon_spear_red.webp",
  icon_staff: "assets/ui/icon_staff.webp",
  icon_sword: "assets/ui/icon_sword.webp",
  icon_sword_red: "assets/ui/icon_sword_red.webp",
});
/* TILES_ANIMADOS_BLOCO — 3 quadros de água (32x32, opacos e tileáveis)
   e 3 de braseiro (32x96, com alfa). Os dois tiles eram desenhados
   proceduralmente com uma senoide em cima do relógio; a arte troca o
   desenho, mas o CICLO continua no código, porque é ele que garante
   que tiles vizinhos não pisquem em uníssono. */
Object.assign(SPRITE_DATA, {
  tile_agua_0: "assets/world/tile_agua_0.webp",
  tile_agua_1: "assets/world/tile_agua_1.webp",
  tile_agua_2: "assets/world/tile_agua_2.webp",
  tile_brasa_0: "assets/world/tile_brasa_0.webp",
  tile_brasa_1: "assets/world/tile_brasa_1.webp",
  tile_brasa_2: "assets/world/tile_brasa_2.webp",
});
/* TILES_CENARIO_BLOCO — os 11 tiles de chão, parede e mobília, 32x32.
   A água NÃO entra aqui: ela já tem os três quadros animados, que
   substituem a versão estática deste mesmo lote.
   Todos foram reamostrados pegando o CENTRO de cada bloco da grade
   de origem, e não pela média — média borraria a pixel art. */
Object.assign(SPRITE_DATA, {
  tile_grass: "assets/world/tile_grass.webp",
  tile_path: "assets/world/tile_path.webp",
  tile_dirt: "assets/world/tile_dirt.webp",
  tile_crack: "assets/world/tile_crack.webp",
  tile_wall: "assets/world/tile_wall.webp",
  tile_floor: "assets/world/tile_floor.webp",
  tile_carpet: "assets/world/tile_carpet.webp",
  tile_door: "assets/world/tile_door.webp",
  tile_stairs: "assets/world/tile_stairs.webp",
  tile_chest: "assets/world/tile_chest.webp",
  tile_chest_open: "assets/world/tile_chest_open.webp",
});
/* ICONES_CONDICAO_BLOCO — 16x16 para as condições que ganharam arte.
   Só entram as que o desenho LÊ como a condição certa; Sangramento,
   Cegueira, Assombro e Exposto continuam no glifo unicode porque o
   pacote não trouxe nada que se pareça com elas, e um ícone errado
   é pior que um símbolo. */
Object.assign(SPRITE_DATA, {
  ail_burn: "assets/ui/ail_burn.webp",
  ail_shock: "assets/ui/ail_shock.webp",
  ail_freeze: "assets/ui/ail_freeze.webp",
  ail_rooted: "assets/ui/ail_rooted.webp",
  ail_terror: "assets/ui/ail_terror.webp",
  ail_stun: "assets/ui/ail_stun.webp",
});
/* MOLDURAS_BLOCO — 25 pares canto+emblema. Cada arquivo de origem
   trazia os dois JUNTOS; a separação é geométrica: o canto encosta na
   borda de cima ou da esquerda, o emblema flutua solto. O canto é
   ancorado no topo-esquerdo (e não centrado) porque `panel` o espelha
   para os outros três cantos. */
Object.assign(SPRITE_DATA, {
  ui_canto_01: "assets/ui/ui_canto_01.webp",
  ui_embl_01: "assets/ui/ui_embl_01.webp",
  ui_canto_02: "assets/ui/ui_canto_02.webp",
  ui_embl_02: "assets/ui/ui_embl_02.webp",
  ui_canto_03: "assets/ui/ui_canto_03.webp",
  ui_embl_03: "assets/ui/ui_embl_03.webp",
  ui_canto_04: "assets/ui/ui_canto_04.webp",
  ui_embl_04: "assets/ui/ui_embl_04.webp",
  ui_canto_05: "assets/ui/ui_canto_05.webp",
  ui_embl_05: "assets/ui/ui_embl_05.webp",
  ui_canto_06: "assets/ui/ui_canto_06.webp",
  ui_embl_06: "assets/ui/ui_embl_06.webp",
  ui_canto_07: "assets/ui/ui_canto_07.webp",
  ui_embl_07: "assets/ui/ui_embl_07.webp",
  ui_canto_08: "assets/ui/ui_canto_08.webp",
  ui_embl_08: "assets/ui/ui_embl_08.webp",
  ui_canto_09: "assets/ui/ui_canto_09.webp",
  ui_embl_09: "assets/ui/ui_embl_09.webp",
  ui_canto_10: "assets/ui/ui_canto_10.webp",
  ui_embl_10: "assets/ui/ui_embl_10.webp",
  ui_canto_11: "assets/ui/ui_canto_11.webp",
  ui_embl_11: "assets/ui/ui_embl_11.webp",
  ui_canto_12: "assets/ui/ui_canto_12.webp",
  ui_embl_12: "assets/ui/ui_embl_12.webp",
  ui_canto_13: "assets/ui/ui_canto_13.webp",
  ui_embl_13: "assets/ui/ui_embl_13.webp",
  ui_canto_14: "assets/ui/ui_canto_14.webp",
  ui_embl_14: "assets/ui/ui_embl_14.webp",
  ui_canto_15: "assets/ui/ui_canto_15.webp",
  ui_embl_15: "assets/ui/ui_embl_15.webp",
  ui_canto_16: "assets/ui/ui_canto_16.webp",
  ui_embl_16: "assets/ui/ui_embl_16.webp",
  ui_canto_17: "assets/ui/ui_canto_17.webp",
  ui_embl_17: "assets/ui/ui_embl_17.webp",
  ui_canto_18: "assets/ui/ui_canto_18.webp",
  ui_embl_18: "assets/ui/ui_embl_18.webp",
  ui_canto_19: "assets/ui/ui_canto_19.webp",
  ui_embl_19: "assets/ui/ui_embl_19.webp",
  ui_canto_20: "assets/ui/ui_canto_20.webp",
  ui_embl_20: "assets/ui/ui_embl_20.webp",
  ui_canto_21: "assets/ui/ui_canto_21.webp",
  ui_embl_21: "assets/ui/ui_embl_21.webp",
  ui_canto_22: "assets/ui/ui_canto_22.webp",
  ui_embl_22: "assets/ui/ui_embl_22.webp",
  ui_canto_23: "assets/ui/ui_canto_23.webp",
  ui_embl_23: "assets/ui/ui_embl_23.webp",
  ui_canto_24: "assets/ui/ui_canto_24.webp",
  ui_embl_24: "assets/ui/ui_embl_24.webp",
  ui_canto_25: "assets/ui/ui_canto_25.webp",
  ui_embl_25: "assets/ui/ui_embl_25.webp",
});
/* RETRATOS_V53_BLOCO — retratos novos dos oito. SOBRESCREVE as chaves
   de SPRITE_DATA de propósito: `Object.assign` depois vence, então
   trocar a arte é acrescentar aqui, sem caçar base64 no meio da
   linha gigante lá de cima. Recortados no BUSTO (62% de cima da
   arte): a 64px de altura, o corpo inteiro deixaria o rosto com uns
   8px e nenhum deles seria reconhecível.
   `kael_portrait` continua com o nome antigo — é o do Seiji, e
   renomear a chave quebraria save e PARTY_DEFS por nada. */
Object.assign(SPRITE_DATA, {
  kael_portrait: "assets/characters/kael_portrait-2.webp",
  ophelia_portrait: "assets/characters/ophelia_portrait-2.webp",
  marin_portrait: "assets/characters/marin_portrait-2.webp",
  gabriel_portrait: "assets/characters/gabriel_portrait-2.webp",
  max_portrait: "assets/characters/max_portrait-2.webp",
  eden_portrait: "assets/characters/eden_portrait-2.webp",
  ava_portrait: "assets/characters/ava_portrait-2.webp",
  scythe_portrait: "assets/characters/scythe_portrait-2.webp",
});
/* Kael Archimedes (o mentor NPC) usava por engano a chave
   `kael_portrait` — que, apesar do nome, é o retrato do Seiji (ver
   comentário acima; renomear quebraria save/PARTY_DEFS). Isso fazia
   o Kael de verdade falar com o rosto do Seiji na caixa de diálogo.
   Chave própria, recortada do dlg_kael (bloco de Dialogue Sprites). */
Object.assign(SPRITE_DATA, {
  kael_archimedes_portrait: "assets/characters/kael_archimedes_portrait.webp",
});
/* LYCAN_BLOCO — a segunda forma do Gabriel. A folha de campo veio de
   uma grade 3x3: linha 0 são três poses de frente, linha 1 traz
   esquerda, COSTAS e direita. Só existe UMA pose de costas, então a
   fileira "up" repete o mesmo quadro — de costas o lobo quase não é
   visto, e três quadros iguais lêem como parado, não como defeito. */
Object.assign(SPRITE_DATA, {
  gabriel_lycan_sheet: "assets/characters/gabriel_lycan_sheet.webp",
});
/* ARVORE_FUNDO_BLOCO — pano de fundo elemental da tela de árvore.
   Os arquivos de origem eram MOCKUPS da tela inteira. Fica só o MIOLO
   (15,5% a 66% da altura): mais acima vinha o TÍTULO do mockup, que
   brigava com o nome do personagem no cabeçalho, e mais abaixo o
   painel de detalhe dele, que vazava como texto fantasma no rodapé.
   Entram como ATMOSFERA em opacidade baixa; os nós que valem são os
   gerados, e desenham por cima. Lossy de propósito — é fundo borrado,
   não pixel art. Tinta e Veneno não vieram no pacote e caem no painel
   liso de sempre.
   DESFOCADOS: sem o borrão, os anéis de nó desenhados no mockup lêem
   como nós de verdade ainda não comprados, e o jogador tenta navegar
   até eles. O desfoque é o que separa fundo de conteúdo. */
Object.assign(SPRITE_DATA, {
  tree_bg_ice: "assets/ui/tree_bg_ice.webp",
  tree_bg_electricity: "assets/ui/tree_bg_electricity.webp",
  tree_bg_darkness: "assets/ui/tree_bg_darkness.webp",
  tree_bg_fire: "assets/ui/tree_bg_fire.webp",
  tree_bg_earth: "assets/ui/tree_bg_earth.webp",
  tree_bg_wind: "assets/ui/tree_bg_wind.webp",
});
/* MADAO_BLOCO — o nono do elenco. A folha de campo veio JÁ na grade
   3x4 e JÁ na ordem do jogo (frente, esquerda, direita, costas): é a
   primeira que não precisou de remontagem nenhuma.
   Três artes de combate porque ele tem três estados: normal, com a
   caixa erguida (Papelão) e a de vitória. */
Object.assign(SPRITE_DATA, {
  madao_sheet: "assets/characters/madao_sheet.webp",
  madao_portrait: "assets/characters/madao_portrait.webp",
});
/* Forma Papelão do Madao, chibi de campo (v5.32) — hoje só usada em
   battle art (`papelaoT`, ver 27-controller.js); registrada aqui pra
   ficar pronta se o Papelão ganhar representação no mapa também. */
Object.assign(SPRITE_DATA, {
  madao_papelao_sheet: "assets/characters/madao_papelao_sheet.png",
});
/* Elijah (v5.32) — chegou como boss anunciado, resto dos arquivos
   ainda vem depois. Só os sprites de campo (normal + corrompido)
   registrados por enquanto; SEM entrada em BESTIARY/personagens —
   isso espera a definição completa dele. */
Object.assign(SPRITE_DATA, {
  elijah_sheet: "assets/characters/elijah_sheet.png",
  elijah_corrompido_sheet: "assets/characters/elijah_corrompido_sheet.png",
});
/* 2º traje da Ava (v5.32) — sem mecânica de troca de roupa ainda,
   registrado pronto pra quando existir. */
Object.assign(SPRITE_DATA, {
  ava_outfit2_sheet: "assets/characters/ava_outfit2_sheet.webp",
});
/* NPCs novos da Academia (v5.32) — Beatriz Demeter, Calder Pell,
   Carmila Reachforth. Só o sprite de campo por enquanto, SEM entrada
   de NPC/diálogo no mapa ainda (ver docs/atlas/PENDENCIAS-DESIGN.md,
   item 2 — elenco multirracial da Academia). */
Object.assign(SPRITE_DATA, {
  beatriz_sheet: "assets/characters/beatriz_sheet.webp",
  calderpell_sheet: "assets/characters/calderpell_sheet.webp",
  carmila_sheet: "assets/characters/carmila_sheet.webp",
});
/* Dialogue Sprites (v5.32) — arte grande de corpo inteiro mostrada ao
   lado da caixa de diálogo (referência: tela de diálogo do jogo
   Hades, enviada pelo usuário). Ver DIALOGUE_SPRITES em
   22-dialogue.js pro mapeamento nome-do-falante → chave aqui. */
Object.assign(SPRITE_DATA, {
  dlg_gabriel: "assets/characters/dlg_gabriel.webp",
  dlg_ava: "assets/characters/dlg_ava.webp",
  dlg_ava_outfit2: "assets/characters/dlg_ava_outfit2.webp",
  dlg_ophelia: "assets/characters/dlg_ophelia.webp",
  dlg_orfeu: "assets/characters/dlg_orfeu.webp",
  dlg_scythe: "assets/characters/dlg_scythe.webp",
  dlg_abel: "assets/characters/dlg_abel.webp",
  dlg_kael: "assets/characters/dlg_kael.webp",
  dlg_seiji: "assets/characters/dlg_seiji.webp",
  dlg_beatriz: "assets/characters/dlg_beatriz.webp",
  dlg_calderpell: "assets/characters/dlg_calderpell.webp",
  dlg_carmila: "assets/characters/dlg_carmila.webp",
  dlg_farnese: "assets/characters/dlg_farnese.webp",
  dlg_malquior: "assets/characters/dlg_malquior.webp",
  dlg_sebastian: "assets/characters/dlg_sebastian.webp",
});
/* PET_SPRITES_BLOCO — artes de pet, geradas fora e preparadas por
   ferramentas/preparar-pet.ps1. Entram no MESMO SPRITE_DATA para
   reaproveitar o carregador, o cache e os testes de integridade que
   já existem — nenhum caminho de código novo. */
Object.assign(SPRITE_DATA, {
  /* A salamandra tem DUAS artes com papéis distintos: a quadrúpede
     acompanha o grupo no campo e a bípede — de pé, com a katana sacada —
     é a que entra em combate. É a mesma criatura em duas leituras, e
     trocar por contexto custa uma chave a mais aqui. */
  pet_salamandra_1_batalha: "assets/pets/pet_salamandra_1_batalha.png",
  pet_salamandra_1: "assets/pets/pet_salamandra_1.png",
});

/* v5.8 — moldura tirada do mockup de combate. O canto é redesenhado
   em geometria (ver assets/mockup-combate/_extrair.py e o gerador ao
   lado): recorte de JPEG a 30px traria o ruído da compressão e o
   preenchimento escuro do painel grudado no ornamento. */
Object.assign(SPRITE_DATA, {
  "ui_canto_mock": "assets/ui/ui_canto_mock.webp",
  "ui_embl_mock": "assets/ui/ui_embl_mock.webp",
});

/* >>> SLOTS SEMANTICOS DA HUD (gerado por assets/_embutir.py) */
/* 189 de 219 slots preenchidos. Os que faltam caem no
   desenho procedural — a tela continua inteira sem eles. */
Object.assign(SPRITE_DATA, {
  "battle_bg_arquivo": "assets/world/battle_bg_arquivo.webp",
  "battle_bg_arquivo_fundo": "assets/world/battle_bg_arquivo_fundo.webp",
  "battle_bg_ashwood": "assets/world/battle_bg_ashwood.webp",
  "battle_bg_cistern": "assets/world/battle_bg_cistern.webp",
  "battle_bg_deepway": "assets/world/battle_bg_deepway.webp",
  "battle_bg_deserto": "assets/world/battle_bg_deserto.webp",
  "battle_bg_esgoto": "assets/world/battle_bg_esgoto.webp",
  "battle_bg_lago": "assets/world/battle_bg_lago.webp",
  "battle_bg_nests": "assets/world/battle_bg_nests.webp",
  "battle_bg_patio": "assets/world/battle_bg_patio.webp",
  "battle_bg_podridao": "assets/world/battle_bg_podridao.webp",
  "battle_bg_spire": "assets/world/battle_bg_spire.webp",
  "battle_bg_undercroft": "assets/world/battle_bg_undercroft.webp",
  "boss_arquivo_f1": "assets/monsters/boss_arquivo_f1.webp",
  "boss_arquivo_f2": "assets/monsters/boss_arquivo_f2.webp",
  "boss_arquivo_f3": "assets/monsters/boss_arquivo_f3.webp",
  "boss_pantano_agarrar": "assets/monsters/boss_pantano_agarrar.webp",
  "boss_pantano_cauda": "assets/monsters/boss_pantano_cauda.webp",
  "boss_pantano_espinhos": "assets/monsters/boss_pantano_espinhos.webp",
  "boss_pantano_f1": "assets/monsters/boss_pantano_f1.webp",
  "boss_pantano_f2": "assets/monsters/boss_pantano_f2.webp",
  "boss_pantano_f3": "assets/monsters/boss_pantano_f3.webp",
  "boss_pantano_f4": "assets/monsters/boss_pantano_f4.webp",
  "boss_pantano_fragmentos": "assets/monsters/boss_pantano_fragmentos.webp",
  "boss_pantano_furia": "assets/monsters/boss_pantano_furia.webp",
  "boss_pantano_investida": "assets/monsters/boss_pantano_investida.webp",
  "boss_pantano_mordida": "assets/monsters/boss_pantano_mordida.webp",
  "boss_pantano_olhos": "assets/monsters/boss_pantano_olhos.webp",
  "boss_pantano_retrato": "assets/monsters/boss_pantano_retrato.webp",
  "busto_abel_nomikos": "assets/misc/busto_abel_nomikos.webp",
  "busto_amanda_felt": "assets/misc/busto_amanda_felt.webp",
  "busto_eden": "assets/misc/busto_eden.webp",
  "busto_ophelia": "assets/misc/busto_ophelia.webp",
  "busto_orfeu_bauss": "assets/misc/busto_orfeu_bauss.webp",
  "busto_seiji": "assets/misc/busto_seiji.webp",
  "busto_snoopy": "assets/misc/busto_snoopy.webp",
  "hab_abyss": "assets/ui/hab_abyss.webp",
  "hab_bark_ward": "assets/ui/hab_bark_ward.webp",
  "hab_blaze": "assets/ui/hab_blaze.webp",
  "hab_blitz": "assets/ui/hab_blitz.webp",
  "hab_bloom": "assets/ui/hab_bloom.webp",
  "hab_breath": "assets/ui/hab_breath.webp",
  "hab_bulwark": "assets/ui/hab_bulwark.webp",
  "hab_cardboard": "assets/ui/hab_cardboard.webp",
  "hab_chain": "assets/ui/hab_chain.webp",
  "hab_cleanse": "assets/ui/hab_cleanse.webp",
  "hab_cleanwind": "assets/ui/hab_cleanwind.webp",
  "hab_creeping": "assets/ui/hab_creeping.webp",
  "hab_cyclone": "assets/ui/hab_cyclone.webp",
  "hab_dark_veil": "assets/ui/hab_dark_veil.webp",
  "hab_darknight": "assets/ui/hab_darknight.webp",
  "hab_deeproot": "assets/ui/hab_deeproot.webp",
  "hab_drain": "assets/ui/hab_drain.webp",
  "hab_dreadcut": "assets/ui/hab_dreadcut.webp",
  "hab_eclipse": "assets/ui/hab_eclipse.webp",
  "hab_emberguard": "assets/ui/hab_emberguard.webp",
  "hab_fire_fist": "assets/ui/hab_fire_fist.webp",
  "hab_flamewall": "assets/ui/hab_flamewall.webp",
  "hab_furnace": "assets/ui/hab_furnace.webp",
  "hab_gaia_wall": "assets/ui/hab_gaia_wall.webp",
  "hab_gale_cut": "assets/ui/hab_gale_cut.webp",
  "hab_greenmend": "assets/ui/hab_greenmend.webp",
  "hab_hammer": "assets/ui/hab_hammer.webp",
  "hab_haste": "assets/ui/hab_haste.webp",
  "hab_haste_all": "assets/ui/hab_haste_all.webp",
  "hab_ice_deep": "assets/ui/hab_ice_deep.webp",
  "hab_ice_grave": "assets/ui/hab_ice_grave.webp",
  "hab_ice_lance": "assets/ui/hab_ice_lance.webp",
  "hab_ice_shard": "assets/ui/hab_ice_shard.webp",
  "hab_ink_cut": "assets/ui/hab_ink_cut.webp",
  "hab_ink_deluge": "assets/ui/hab_ink_deluge.webp",
  "hab_ink_erase": "assets/ui/hab_ink_erase.webp",
  "hab_ink_flood": "assets/ui/hab_ink_flood.webp",
  "hab_ink_margin": "assets/ui/hab_ink_margin.webp",
  "hab_ink_seal": "assets/ui/hab_ink_seal.webp",
  "hab_ink_stain": "assets/ui/hab_ink_stain.webp",
  "hab_ink_verse": "assets/ui/hab_ink_verse.webp",
  "hab_jolt": "assets/ui/hab_jolt.webp",
  "hab_last_rites": "assets/ui/hab_last_rites.webp",
  "hab_m_bonfire": "assets/ui/hab_m_bonfire.webp",
  "hab_m_box_all": "assets/ui/hab_m_box_all.webp",
  "hab_m_ember": "assets/ui/hab_m_ember.webp",
  "hab_m_flare": "assets/ui/hab_m_flare.webp",
  "hab_m_last": "assets/ui/hab_m_last.webp",
  "hab_m_nap": "assets/ui/hab_m_nap.webp",
  "hab_m_punch": "assets/ui/hab_m_punch.webp",
  "hab_m_shrug": "assets/ui/hab_m_shrug.webp",
  "hab_mend": "assets/ui/hab_mend.webp",
  "hab_mend_all": "assets/ui/hab_mend_all.webp",
  "hab_mend_deep": "assets/ui/hab_mend_deep.webp",
  "hab_overload": "assets/ui/hab_overload.webp",
  "hab_quake": "assets/ui/hab_quake.webp",
  "hab_reaping": "assets/ui/hab_reaping.webp",
  "hab_recall": "assets/ui/hab_recall.webp",
  "hab_regrowth": "assets/ui/hab_regrowth.webp",
  "hab_rend": "assets/ui/hab_rend.webp",
  "hab_root_lash": "assets/ui/hab_root_lash.webp",
  "hab_scythe_arc": "assets/ui/hab_scythe_arc.webp",
  "hab_shadowstep": "assets/ui/hab_shadowstep.webp",
  "hab_souldrain": "assets/ui/hab_souldrain.webp",
  "hab_stonehide": "assets/ui/hab_stonehide.webp",
  "hab_storm": "assets/ui/hab_storm.webp",
  "hab_stormeye": "assets/ui/hab_stormeye.webp",
  "hab_tailwind": "assets/ui/hab_tailwind.webp",
  "hab_taunt": "assets/ui/hab_taunt.webp",
  "hab_thunderfall": "assets/ui/hab_thunderfall.webp",
  "hab_toxin_cut": "assets/ui/hab_toxin_cut.webp",
  "hab_updraft": "assets/ui/hab_updraft.webp",
  "hab_venom_veil": "assets/ui/hab_venom_veil.webp",
  "hab_windblade": "assets/ui/hab_windblade.webp",
  "hab_wither": "assets/ui/hab_wither.webp",
  "hab_worldbreath": "assets/ui/hab_worldbreath.webp",
  "prop_arbusto": "assets/world/prop_arbusto.webp",
  "prop_bau_ferro": "assets/world/prop_bau_ferro.webp",
  "prop_bau_madeira": "assets/world/prop_bau_madeira.webp",
  "prop_bau_ouro": "assets/world/prop_bau_ouro.webp",
  "prop_biblioteca": "assets/world/prop_biblioteca.webp",
  "prop_braseiro": "assets/world/prop_braseiro.webp",
  "prop_cachoeira": "assets/world/prop_cachoeira.webp",
  "prop_capim": "assets/world/prop_capim.webp",
  "prop_capim_seco": "assets/world/prop_capim_seco.webp",
  "prop_casa_grande": "assets/world/prop_casa_grande.webp",
  "prop_casa_media": "assets/world/prop_casa_media.webp",
  "prop_casa_pequena": "assets/world/prop_casa_pequena.webp",
  "prop_entulho_grande": "assets/world/prop_entulho_grande.webp",
  "prop_estalagem": "assets/world/prop_estalagem.webp",
  "prop_estante": "assets/world/prop_estante.webp",
  "prop_estante_baixa": "assets/world/prop_estante_baixa.webp",
  "prop_flores_campo": "assets/world/prop_flores_campo.webp",
  "prop_forja": "assets/world/prop_forja.webp",
  "prop_igreja": "assets/world/prop_igreja.webp",
  "prop_junco": "assets/world/prop_junco.webp",
  "prop_lampiao": "assets/world/prop_lampiao.webp",
  "prop_loja": "assets/world/prop_loja.webp",
  "prop_moinho": "assets/world/prop_moinho.webp",
  "prop_muro_pedra": "assets/world/prop_muro_pedra.webp",
  "prop_muro_ruina": "assets/world/prop_muro_ruina.webp",
  "prop_palicada": "assets/world/prop_palicada.webp",
  "prop_portao": "assets/world/prop_portao.webp",
  "prop_ruinas": "assets/world/prop_ruinas.webp",
  "prop_sebe": "assets/world/prop_sebe.webp",
  "prop_taverna": "assets/world/prop_taverna.webp",
  "prop_templo": "assets/world/prop_templo.webp",
  "prop_tocha_azul": "assets/world/prop_tocha_azul.webp",
  "prop_torre": "assets/world/prop_torre.webp",
  "prop_vitorias_regias": "assets/world/prop_vitorias_regias.webp",
  "tile_carpet": "assets/world/tile_carpet-2.webp",
  "tile_crack": "assets/world/tile_crack-2.webp",
  "tile_dirt": "assets/world/tile_dirt-2.webp",
  "tile_door": "assets/world/tile_door-2.webp",
  "tile_floor": "assets/world/tile_floor-2.webp",
  "tile_grass": "assets/world/tile_grass-2.webp",
  "tile_path": "assets/world/tile_path-2.webp",
  "tile_stairs": "assets/world/tile_stairs-2.webp",
  "tile_wall": "assets/world/tile_wall-2.webp",
  "tree_bg_darkness": "assets/ui/tree_bg_darkness-2.webp",
  "tree_bg_earth": "assets/ui/tree_bg_earth-2.webp",
  "tree_bg_electricity": "assets/ui/tree_bg_electricity-2.webp",
  "tree_bg_fire": "assets/ui/tree_bg_fire-2.webp",
  "tree_bg_ice": "assets/ui/tree_bg_ice-2.webp",
  "tree_bg_ink": "assets/ui/tree_bg_ink.webp",
  "tree_bg_poison": "assets/ui/tree_bg_poison.webp",
  "tree_bg_wind": "assets/ui/tree_bg_wind-2.webp",
  "ui_cmd_atacar": "assets/ui/ui_cmd_atacar.webp",
  "ui_cmd_guardar": "assets/ui/ui_cmd_guardar.webp",
  "ui_cmd_habilidade": "assets/ui/ui_cmd_habilidade.webp",
  "ui_cmd_item": "assets/ui/ui_cmd_item.webp",
  "ui_cursor": "assets/ui/ui_cursor.webp",
  "ui_elem_darkness": "assets/ui/ui_elem_darkness.webp",
  "ui_elem_ice": "assets/ui/ui_elem_ice.webp",
  "ui_elem_wind": "assets/ui/ui_elem_wind.webp",
  "ui_emblema_local": "assets/ui/ui_emblema_local.webp",
  "ui_icone_lua": "assets/ui/ui_icone_lua.webp",
  "ui_icone_ouro": "assets/ui/ui_icone_ouro.webp",
  "ui_icone_sol": "assets/ui/ui_icone_sol.webp",
  "ui_leg_evento": "assets/ui/ui_leg_evento.webp",
  "ui_leg_loja": "assets/ui/ui_leg_loja.webp",
  "ui_leg_missao": "assets/ui/ui_leg_missao.webp",
  "ui_leg_salvamento": "assets/ui/ui_leg_salvamento.webp",
  "ui_leg_teleporte": "assets/ui/ui_leg_teleporte.webp",
  "ui_marcador_missao": "assets/ui/ui_marcador_missao.webp",
  "ui_menu_config": "assets/ui/ui_menu_config.webp",
  "ui_menu_grupo": "assets/ui/ui_menu_grupo.webp",
  "ui_menu_habilidades": "assets/ui/ui_menu_habilidades.webp",
  "ui_menu_inventario": "assets/ui/ui_menu_inventario.webp",
  "ui_menu_missoes": "assets/ui/ui_menu_missoes.webp",
  "ui_mira": "assets/ui/ui_mira.webp",
  "ui_seta_aliado": "assets/ui/ui_seta_aliado.webp",
  "ui_tecla": "assets/ui/ui_tecla.webp",
});
/* <<< FIM DOS SLOTS SEMANTICOS */

/* >>> PROPS DE CENARIO (gerado por assets/_props.py) */
/* 21 de 150 props do pacote, sem perda.
   Os outros continuam em assets/props/, a uma linha de distância. */
Object.assign(SPRITE_DATA, {
  "prop_arvore": "assets/world/prop_arvore.webp",
  "prop_arvore_escura": "assets/world/prop_arvore_escura.webp",
  "prop_barco": "assets/world/prop_barco.webp",
  "prop_barril": "assets/world/prop_barril.webp",
  "prop_caixa": "assets/world/prop_caixa.webp",
  "prop_cerca": "assets/world/prop_cerca.webp",
  "prop_cristal": "assets/world/prop_cristal.webp",
  "prop_entulho": "assets/world/prop_entulho.webp",
  "prop_estandarte": "assets/world/prop_estandarte.webp",
  "prop_flores": "assets/world/prop_flores.webp",
  "prop_flores_rosa": "assets/world/prop_flores_rosa.webp",
  "prop_fogueira": "assets/world/prop_fogueira.webp",
  "prop_gruta": "assets/world/prop_gruta.webp",
  "prop_obelisco": "assets/world/prop_obelisco.webp",
  "prop_pilar": "assets/world/prop_pilar.webp",
  "prop_placa": "assets/world/prop_placa.webp",
  "prop_poco": "assets/world/prop_poco.webp",
  "prop_save": "assets/world/prop_save.webp",
  "prop_tocha": "assets/world/prop_tocha.webp",
  "prop_tronco": "assets/world/prop_tronco.webp",
  "prop_tumulo": "assets/world/prop_tumulo.webp",
});
/* <<< FIM DOS PROPS */

/* >>> ARTE DE CRIATURAS (gerado por assets/_mobs.py) */
/* 89 criaturas recortadas das folhas de fundo verde,
   sem perda, a 300 px de altura. Ver assets/_mob_recorte.py. */
Object.assign(SPRITE_DATA, {
  "mob_ashknight": "assets/monsters/mob_ashknight.webp",
  "mob_ashwolf": "assets/monsters/mob_ashwolf.webp",
  "mob_caranguejo": "assets/monsters/mob_caranguejo.webp",
  "mob_carnical": "assets/monsters/mob_carnical.webp",
  "mob_cascudo": "assets/monsters/mob_cascudo.webp",
  "mob_chacal": "assets/monsters/mob_chacal.webp",
  "mob_charwood": "assets/monsters/mob_charwood.webp",
  "mob_cinder": "assets/monsters/mob_cinder.webp",
  "mob_cindermage": "assets/monsters/mob_cindermage.webp",
  "mob_codice": "assets/monsters/mob_codice.webp",
  "mob_coletor": "assets/monsters/mob_coletor.webp",
  "mob_cornuda": "assets/monsters/mob_cornuda.webp",
  "mob_coruja": "assets/monsters/mob_coruja.webp",
  "mob_crackmirror": "assets/monsters/mob_crackmirror.webp",
  "mob_crown": "assets/monsters/mob_crown.webp",
  "mob_deluge": "assets/monsters/mob_deluge.webp",
  "mob_drowned": "assets/monsters/mob_drowned.webp",
  "mob_echo": "assets/monsters/mob_echo.webp",
  "mob_emberling": "assets/monsters/mob_emberling.webp",
  "mob_ent_podre": "assets/monsters/mob_ent_podre.webp",
  "mob_errata": "assets/monsters/mob_errata.webp",
  "mob_escaravelho": "assets/monsters/mob_escaravelho.webp",
  "mob_escavador": "assets/monsters/mob_escavador.webp",
  "mob_espectro": "assets/monsters/mob_espectro.webp",
  "mob_espirito": "assets/monsters/mob_espirito.webp",
  "mob_estilhacado": "assets/monsters/mob_estilhacado.webp",
  "mob_familiar": "assets/monsters/mob_familiar.webp",
  "mob_frost": "assets/monsters/mob_frost.webp",
  "mob_fungo": "assets/monsters/mob_fungo.webp",
  "mob_garca": "assets/monsters/mob_garca.webp",
  "mob_geleia": "assets/monsters/mob_geleia.webp",
  "mob_glasscolossus": "assets/monsters/mob_glasscolossus.webp",
  "mob_glasswing": "assets/monsters/mob_glasswing.webp",
  "mob_goblin": "assets/monsters/mob_goblin-2.webp",
  "mob_golem": "assets/monsters/mob_golem.webp",
  "mob_gulper": "assets/monsters/mob_gulper.webp",
  "mob_harpiavidro": "assets/monsters/mob_harpiavidro.webp",
  "mob_harpy": "assets/monsters/mob_harpy.webp",
  "mob_hollow": "assets/monsters/mob_hollow.webp",
  "mob_homunculo": "assets/monsters/mob_homunculo.webp",
  "mob_indice": "assets/monsters/mob_indice.webp",
  "mob_javali": "assets/monsters/mob_javali.webp",
  "mob_ladraninho": "assets/monsters/mob_ladraninho.webp",
  "mob_larva": "assets/monsters/mob_larva.webp",
  "mob_lesma": "assets/monsters/mob_lesma.webp",
  "mob_lesserherald": "assets/monsters/mob_lesserherald.webp",
  "mob_limo": "assets/monsters/mob_limo.webp",
  "mob_livro": "assets/monsters/mob_livro.webp",
  "mob_marginalia": "assets/monsters/mob_marginalia.webp",
  "mob_matriarca": "assets/monsters/mob_matriarca.webp",
  "mob_matriz": "assets/monsters/mob_matriz.webp",
  "mob_minhoca": "assets/monsters/mob_minhoca.webp",
  "mob_mosca": "assets/monsters/mob_mosca.webp",
  "mob_mumia": "assets/monsters/mob_mumia.webp",
  "mob_naiade": "assets/monsters/mob_naiade.webp",
  "mob_nightblade": "assets/monsters/mob_nightblade.webp",
  "mob_ninho": "assets/monsters/mob_ninho.webp",
  "mob_ninhomae": "assets/monsters/mob_ninhomae.webp",
  "mob_nota": "assets/monsters/mob_nota.webp",
  "mob_paleleech": "assets/monsters/mob_paleleech.webp",
  "mob_pilhador": "assets/monsters/mob_pilhador.webp",
  "mob_prismatico": "assets/monsters/mob_prismatico.webp",
  "mob_ra_imunda": "assets/monsters/mob_ra_imunda.webp",
  "mob_racano": "assets/monsters/mob_racano.webp",
  "mob_rato_peste": "assets/monsters/mob_rato_peste.webp",
  "mob_redator": "assets/monsters/mob_redator.webp",
  "mob_revenant": "assets/monsters/mob_revenant.webp",
  "mob_revisor": "assets/monsters/mob_revisor.webp",
  "mob_salamandra_areia": "assets/monsters/mob_salamandra_areia.webp",
  "mob_sapo_lotus": "assets/monsters/mob_sapo_lotus.webp",
  "mob_sentinel": "assets/monsters/mob_sentinel.webp",
  "mob_serpente_lago": "assets/monsters/mob_serpente_lago.webp",
  "mob_shade": "assets/monsters/mob_shade.webp",
  "mob_siren": "assets/monsters/mob_siren.webp",
  "mob_sluicewarden": "assets/monsters/mob_sluicewarden.webp",
  "mob_spark": "assets/monsters/mob_spark.webp",
  "mob_starmoth": "assets/monsters/mob_starmoth.webp",
  "mob_thornling": "assets/monsters/mob_thornling.webp",
  "mob_tidewisp": "assets/monsters/mob_tidewisp.webp",
  "mob_troglodita": "assets/monsters/mob_troglodita.webp",
  "mob_veado": "assets/monsters/mob_veado.webp",
  "mob_vespao": "assets/monsters/mob_vespao.webp",
  "mob_vigia": "assets/monsters/mob_vigia.webp",
  "mob_vitrea": "assets/monsters/mob_vitrea.webp",
  "mob_voidling": "assets/monsters/mob_voidling.webp",
  "mob_warden": "assets/monsters/mob_warden.webp",
  "mob_weaver": "assets/monsters/mob_weaver.webp",
  "mob_wolf": "assets/monsters/mob_wolf.webp",
  "mob_wraith": "assets/monsters/mob_wraith.webp",
});
/* <<< FIM DA ARTE DE CRIATURAS */

/* >>> ARTE DE PETS (gerado por assets/_pets.py) */
/* 31 formas de pet, sem perda, a 240 px de altura.
   Dentro de um mesmo bicho as três formas dividem a altura da tela,
   então evoluir aparece como crescer. Ver assets/_pet_recorte.py. */
Object.assign(SPRITE_DATA, {
  "pet_coelho_1": "assets/pets/pet_coelho_1.webp",
  "pet_coelho_2": "assets/pets/pet_coelho_2.webp",
  "pet_coelho_3": "assets/pets/pet_coelho_3.webp",
  "pet_corvo_1": "assets/pets/pet_corvo_1.webp",
  "pet_corvo_2": "assets/pets/pet_corvo_2.webp",
  "pet_corvo_3": "assets/pets/pet_corvo_3.webp",
  "pet_dragonete_1": "assets/pets/pet_dragonete_1.webp",
  "pet_dragonete_2": "assets/pets/pet_dragonete_2.webp",
  "pet_dragonete_3": "assets/pets/pet_dragonete_3.webp",
  "pet_falcao_1": "assets/pets/pet_falcao_1.webp",
  "pet_falcao_2": "assets/pets/pet_falcao_2.webp",
  "pet_falcao_3": "assets/pets/pet_falcao_3.webp",
  "pet_homunculo_1": "assets/pets/pet_homunculo_1.webp",
  "pet_homunculo_2": "assets/pets/pet_homunculo_2.webp",
  "pet_homunculo_3": "assets/pets/pet_homunculo_3.webp",
  "pet_lince_1": "assets/pets/pet_lince_1.webp",
  "pet_lince_2": "assets/pets/pet_lince_2.webp",
  "pet_lince_3": "assets/pets/pet_lince_3.webp",
  "pet_morcego_1": "assets/pets/pet_morcego_1.webp",
  "pet_morcego_2": "assets/pets/pet_morcego_2.webp",
  "pet_morcego_3": "assets/pets/pet_morcego_3.webp",
  "pet_polvo_1": "assets/pets/pet_polvo_1.webp",
  "pet_polvo_2": "assets/pets/pet_polvo_2.webp",
  "pet_polvo_3": "assets/pets/pet_polvo_3.webp",
  "pet_salamandra_1": "assets/pets/pet_salamandra_1-2.webp",
  "pet_salamandra_1_batalha": "assets/pets/pet_salamandra_1_batalha-2.webp",
  "pet_salamandra_2": "assets/pets/pet_salamandra_2.webp",
  "pet_salamandra_3": "assets/pets/pet_salamandra_3.webp",
  "pet_sapo_1": "assets/pets/pet_sapo_1.webp",
  "pet_sapo_2": "assets/pets/pet_sapo_2.webp",
  "pet_sapo_3": "assets/pets/pet_sapo_3.webp",
});
/* <<< FIM DA ARTE DE PETS */

/* >>> ELENCO NOVO (gerado por assets/_elenco.py) */
/* 30 entradas: folhas de campo, figurantes, arte de
   combate e retratos. Bustos saem por assets/semantico/. */
Object.assign(SPRITE_DATA, {
  "abel_sheet": "assets/characters/abel_sheet.webp",
  "amanda_sheet": "assets/characters/amanda_sheet.webp",
  "orfeu_sheet": "assets/characters/orfeu_sheet.webp",
  "snoopy_sheet": "assets/characters/snoopy_sheet.webp",
  "npc_anciana": "assets/world/npc_anciana.webp",
  "npc_arqueiro": "assets/world/npc_arqueiro.webp",
  "npc_batedor": "assets/world/npc_batedor.webp",
  "npc_camponesa": "assets/world/npc_camponesa.webp",
  "npc_capataz": "assets/world/npc_capataz.webp",
  "npc_cigana": "assets/world/npc_cigana.webp",
  "npc_clerigo": "assets/world/npc_clerigo.webp",
  "npc_encapuzado": "assets/world/npc_encapuzado.webp",
  "npc_eremita": "assets/world/npc_eremita.webp",
  "npc_escriba": "assets/world/npc_escriba.webp",
  "npc_ferreiro": "assets/world/npc_ferreiro.webp",
  "npc_menina": "assets/world/npc_menina.webp",
  "npc_nobre": "assets/world/npc_nobre.webp",
  "npc_professor": "assets/world/npc_professor.webp",
  "npc_rapaz": "assets/world/npc_rapaz.webp",
  "npc_ruivo": "assets/world/npc_ruivo.webp",
  "npc_serva": "assets/world/npc_serva.webp",
  "npc_viajante": "assets/world/npc_viajante.webp",
  "amanda_battle": "assets/misc/amanda_battle.webp",
  "amanda_portrait": "assets/characters/amanda_portrait.webp",
  "abel_battle": "assets/misc/abel_battle.webp",
  "abel_portrait": "assets/characters/abel_portrait.webp",
  "orfeu_battle": "assets/misc/orfeu_battle.webp",
  "orfeu_portrait": "assets/characters/orfeu_portrait.webp",
  "snoopy_battle": "assets/misc/snoopy_battle.webp",
  "snoopy_portrait": "assets/characters/snoopy_portrait.webp",
});
/* <<< FIM DO ELENCO NOVO */

/* VHAROK_BLOCO — Vharok, a Alcateia do Vazio (Tumba de Cristal Fosco).
   Cinco sprites de fase, cinco de habilidade (`arte` em cada skill
   b_watch/b_lonebite/b_circle/b_mark/b_finalcharge) e dois retratos
   (calmo, para as cenas; padrão, para o Bestiário/HUD). */
Object.assign(SPRITE_DATA, {
  "boss_vharok_f1": "assets/monsters/boss_vharok_f1.webp",
  "boss_vharok_f2": "assets/monsters/boss_vharok_f2.webp",
  "boss_vharok_f3": "assets/monsters/boss_vharok_f3.webp",
  "boss_vharok_f4": "assets/monsters/boss_vharok_f4.webp",
  "boss_vharok_f5": "assets/monsters/boss_vharok_f5.webp",
  "boss_vharok_olhos": "assets/monsters/boss_vharok_olhos.webp",
  "boss_vharok_bote": "assets/monsters/boss_vharok_bote.webp",
  "boss_vharok_rodeio": "assets/monsters/boss_vharok_rodeio.webp",
  "boss_vharok_marca": "assets/monsters/boss_vharok_marca.webp",
  "boss_vharok_investida": "assets/monsters/boss_vharok_investida.webp",
  "boss_vharok_retrato": "assets/monsters/boss_vharok_retrato.webp",
  "boss_vharok_retrato_calmo": "assets/monsters/boss_vharok_retrato_calmo.webp",
});
