/* ===================================================================
   RESERVADO — Skill Tree / Elementos / Raças (ATUALIZACAO_BASE_SKILL_TREE.md)
   ===================================================================
   Isto é armazenamento, não implementação: nada aqui é lido pelo motor
   de combate, pela criação de personagem ou por qualquer outro
   sistema ativo. É só o conteúdo do documento gravado em dados, pra
   quando for a hora de fatiar e ligar de verdade (roda elemental de
   19 elementos, 5 raças com regras próprias, Formas, Fusões, Códice).
   Hoje o jogo roda com ELEM (02-elements-status.js, 10 elementos) e
   sem sistema de raça — este arquivo não mexe em nenhum dos dois. */

const RESERVADO_ELEMENTOS = [
  {id:'water',        nome:'Água'},
  {id:'earth',         nome:'Terra'},
  {id:'wind',         nome:'Ar',           obs:'Vento/Correntes/Tempestade são manifestações, não elementos à parte.'},
  {id:'fire',         nome:'Fogo'},
  {id:'metal',        nome:'Metal'},
  {id:'wood',         nome:'Madeira',      obs:'Madeira = Planta. Não existe slot separado de Planta.'},
  {id:'physical',     nome:'Físico / Neutro', alias:'neutral', obs:'Ataques e armas sem elemento.'},
  {id:'blood',        nome:'Sangue',       obs:'Elemento racial dos Vampiros; também entra na roda de vantagens/desvantagens.'},
  {id:'bone',         nome:'Osso'},
  {id:'poison',       nome:'Veneno'},
  {id:'acid',         nome:'Ácido'},
  {id:'crystal',      nome:'Cristal',      alias:['Vidro','Espelho'], mecanicaPrincipal:'Refração',
                       obs:'Cristal = Vidro = Espelho: um único elemento com três manifestações.'},
  {id:'sand',         nome:'Areia'},
  {id:'ice',          nome:'Gelo'},
  {id:'light',        nome:'Luz'},
  {id:'darkness',     nome:'Trevas'},
  {id:'electricity',  nome:'Eletricidade'},
  {id:'sound',        nome:'Som'},
  {id:'ashes',        nome:'Cinzas',       mecanicaPrincipal:'Maldição', origem:['fire','earth','darkness'],
                       progressao:['Maldição','Decadência','Ruína'], personagemAssociado:'Madao'},
];

const RESERVADO_FUSOES = [
  {id:'ink',   nome:'Tinta',  formula:['water','darkness'], obs:'Marca/escreve/sela/cria/copia — registros e selos arcanos.'},
  {id:'ashes', nome:'Cinzas', formula:['fire','earth','darkness'], obs:'Ver RESERVADO_ELEMENTOS.ashes — mecânica é Maldição, não Fogo residual.'},
];

const RESERVADO_RACAS = [
  {id:'human',   nome:'Humano',    maxElementSlots:3, canCastMagic:true,  canUseElementalWeapons:false,
    formaRacial:'Forma Demoníaca', obs:'Maior versatilidade elemental do jogo.'},
  {id:'elf',     nome:'Elfo',      maxElementSlots:2, canCastMagic:true,  canUseElementalWeapons:false,
    formaRacial:'Forma Demoníaca',
    passivas:['Reserva Arcana (mais Mana)', 'Sobrecarga Arcana (gastar Mana extra = 2x dano)'],
    obs:'NÃO possui bônus geral de atributos — essa regra foi removida.'},
  {id:'lycan',   nome:'Lycan',     maxElementSlots:2, canCastMagic:true,  canUseElementalWeapons:false,
    formaRacial:'Forma Lobisomem', obs:'Instintos físicos, sentidos aprimorados. Sem Forma Demoníaca.'},
  {id:'undead',  nome:'Morto-Vivo',maxElementSlots:2, canCastMagic:false, canUseElementalWeapons:true,
    formaRacial:null,
    obs:'Não conjura elemento — "enterra" ele numa arma (ARMA + ELEMENTO = ARMA ELEMENTAL). Sem tag MAGIC nessas técnicas.'},
  {id:'vampire', nome:'Vampiro',   maxElementSlots:2, canCastMagic:true,  canUseElementalWeapons:false,
    formaRacial:'Forma Vampírica', elementoRacial:'blood',
    obs:'Possui roda elemental racial própria de Sangue, além dos elementos comuns.'},
];
const RESERVADO_RACA_NAO_JOGAVEL = {id:'demon', nome:'Demônio', playable:false, npcOnly:true};

const RESERVADO_CLASSES = [
  'Guerreiro','Guardião','Mago','Feiticeiro','Ladino','Caçador',
  'Monge','Clérigo','Druida','Invocador','Duelista','Berserker',
];

const RESERVADO_PERSONAGENS_ELEMENTO_PRINCIPAL = {
  Gabriel:'fire', Maxx:'electricity', Eden:'wind', Marin:'darkness', Seiji:'ink',
  Scythe:'poison', 'Ava Rosa Groot':'earth', Ophelia:'ice', Madao:'ashes',
};

/* Tipos/estados de nó da Skill Tree de duas rodas (ver ferramentas/
   criador_de_skill_tree.html, que já usa esses mesmos tipos). */
const RESERVADO_SKILLTREE_NODE_TIPOS = [
  'CORE','PROGRESSION','SKILL','PASSIVE','SPECIAL','CONVERGENCE',
  'ULTIMATE','BRIDGE','TRANSFORMATION','CONDITIONAL',
];
const RESERVADO_SKILLTREE_NODE_ESTADOS = [
  'BLOCKED','AVAILABLE','LEARNED','SELECTED','CONDITIONALLY_INACTIVE',
];

/* Estrutura-alvo do Códice/Compêndio (menu novo, ainda não existe). */
const RESERVADO_CODICE_ESTRUTURA = {
  categorias: ['ELEMENTOS','RAÇAS','CLASSES','MULTICLASSES','TRANSFORMAÇÕES','MECÂNICAS','DESCOBERTAS'],
  estadosDescoberta: ['DESCONHECIDO','DESCOBERTO','ANALISADO','DOMINADO'],
  entradaGenerica: ['id','category','title','subtitle','icon','image','description','sections','relatedEntries','discoveryState','sortOrder','hidden'],
};

/* Fonte: ATUALIZACAO_BASE_SKILL_TREE.md, anexado pelo usuário em
   2026-08-26. Mantido junto do documento original em docs/ pra não
   perder o texto completo (justificativas, exemplos, ASCII arts). */
