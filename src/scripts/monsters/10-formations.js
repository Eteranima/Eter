const FORMATIONS = {
  patio:      [ [['wolf',1]], [['wolf',2]], [['shade',1]], [['spark',1],['wolf',1]],
  /* v5.26 — as criaturas com arte própria entram AQUI, misturadas com as
     antigas, e não numa lista à parte. Cada formação nova carrega junto
     a espécie que alguma missão pede: acrescentar encontro sem isso
     aumenta o denominador de todo mundo e faz caçada que fechava em
     dez virar caçada de vinte. Foi o erro da v5.25, e
     `assertQuestsCompletáveis` existe por causa dele. */
                [['familiar',1],['wolf',1]], [['familiar',2]],
                [['homunculo',1],['wolf',2]], [['livro',1],['shade',1]],
                [['vigia',1],['spark',1]], [['homunculo',1],['livro',1],['shade',1]] ],
  undercroft: [ [['shade',2]], [['golem',1]], [['wraith',1],['shade',1]],
                [['frost',1]], [['spark',2]], [['golem',1],['shade',1]],
                [['goblin',2]], [['goblin',1],['shade',1]],
  /* v5.26 — as criaturas com arte própria entram AQUI, misturadas com as
     antigas, e não numa lista à parte. Cada formação nova carrega junto
     a espécie que alguma missão pede: acrescentar encontro sem isso
     aumenta o denominador de todo mundo e faz caçada que fechava em
     dez virar caçada de vinte. Foi o erro da v5.25, e
     `assertQuestsCompletáveis` existe por causa dele. */
                [['troglodita',2]], [['troglodita',1],['shade',2]],
                [['minhoca',1],['golem',1]], [['minhoca',2]],
                [['fungo',2],['shade',1]], [['escavador',1],['troglodita',1]],
                [['escavador',2],['golem',1]] ],
  /* Faixa média: aparece nas duas pontas, suavizando o degrau que havia
     entre o Subterrâneo (nv 6) e a Galeria (nv 12). */
  deepway:    [ [['hollow',2]], [['revenant',1],['hollow',1]], [['sentinel',1]],
                [['revenant',2]], [['sentinel',1],['hollow',1]], [['frost',2],['revenant',1]],
                [['harpy',2]], [['weaver',1],['harpy',1]], [['weaver',2]],
                [['harpy',1],['revenant',1]],
                /* v5.25 — a Sentinela saía em duas de dez e `q_mercador`
                   pedia 20 encontros. */
                [['sentinel',2]], [['sentinel',1],['weaver',1]],
                [['sentinel',1],['revenant',1]] ],

  /* --- v4.8: as três regiões novas ---------------------------------
     Cada região abre com formações simples (uma espécie só) e fecha com
     as mistas, que são as que cobram combinação de elementos. É a mesma
     curva das regiões antigas, só que agora há Conjunta e Postura para
     responder — e é por isso que as misturas podem ser mais duras. */
  ashwood: [
    [['emberling',3]],
    [['emberling',5]],
    [['ashwolf',2]],
    [['ashwolf',1],['emberling',1]],
    [['thornling',2]],
    [['thornling',1],['ashwolf',1]],
    [['charwood',1]],
    [['charwood',1],['emberling',1]],
    [['cindermage',1],['emberling',3]],
    [['cindermage',1],['ashwolf',1]],
    [['ashknight',1]],
    [['ashknight',1],['thornling',1]],
    [['ashwolf',4]],
    [['cindermage',2]],
    [['charwood',1],['ashknight',1]],
    [['emberling',1],['thornling',1],['ashwolf',1]],
    /* v5.25 — o Tronco Queimado saía em três de dezesseis e `q_lenhador`
       pedia 27 encontros. */
    [['charwood',4]],
    [['charwood',1],['ashwolf',1]],
    [['charwood',1],['thornling',1],['emberling',1]],
    [['ashwolf',3],['cindermage',1]],
  /* v5.26 — as criaturas com arte própria entram AQUI, misturadas com as
     antigas, e não numa lista à parte. Cada formação nova carrega junto
     a espécie que alguma missão pede: acrescentar encontro sem isso
     aumenta o denominador de todo mundo e faz caçada que fechava em
     dez virar caçada de vinte. Foi o erro da v5.25, e
     `assertQuestsCompletáveis` existe por causa dele. */
    [['coruja',2],['emberling',2]],
    [['coruja',1],['ashwolf',2]],
    [['veado',2],['emberling',2]],
    [['veado',1],['ashwolf',1]],
    [['espectro',2],['charwood',1]],
    [['javali',1],['charwood',1]],
    [['javali',1],['veado',1],['emberling',2]],
  ],
  cistern: [
    [['drowned',2]],
    [['drowned',3]],
    [['paleleech',2]],
    [['paleleech',1],['drowned',1]],
    [['tidewisp',2]],
    [['tidewisp',1],['drowned',1]],
    [['gulper',1]],
    [['gulper',1],['paleleech',1]],
    [['sluicewarden',1]],
    [['sluicewarden',2],['tidewisp',1]],
    [['siren',2],['drowned',2]],
    [['siren',2],['tidewisp',1]],
    [['siren',4]],
    [['gulper',1],['sluicewarden',1]],
    [['drowned',1],['paleleech',1],['tidewisp',1]],
    [['sluicewarden',1],['siren',1]],
    [['gulper',2]],
    /* v5.25 — `q_comporta` pedia 22 encontros e `q_escamas` 26. */
    [['sluicewarden',4]],
    [['sluicewarden',1],['drowned',2]],
    [['siren',1],['paleleech',1]],
    [['drowned',4],['paleleech',1]],
    [['drowned',2],['tidewisp',1]],
  /* v5.26 — as criaturas com arte própria entram AQUI, misturadas com as
     antigas, e não numa lista à parte. Cada formação nova carrega junto
     a espécie que alguma missão pede: acrescentar encontro sem isso
     aumenta o denominador de todo mundo e faz caçada que fechava em
     dez virar caçada de vinte. Foi o erro da v5.25, e
     `assertQuestsCompletáveis` existe por causa dele. */
    [['geleia',3]],
    [['geleia',1],['drowned',3]],
    [['racano',2],['drowned',2]],
    [['racano',1],['sluicewarden',1]],
    [['espirito',2],['siren',1]],
    [['caranguejo',1],['sluicewarden',1]],
    [['caranguejo',1],['racano',1],['drowned',2]],
  ],
  /* v4.9 — Ninhal de Éter. Doze formações; a região é curta de
     propósito, porque o que segura o jogador aqui é o pet, não o grind. */
  nests: [
    [['ninho',2]],
    [['ninho',4]],
    [['cascudo',1]],
    [['cascudo',1],['ninho',1]],
    [['ladraninho',1],['ninho',1]],
    [['ladraninho',4]],
    [['matriz',1]],
    [['matriz',1],['ninho',2]],
    [['cornuda',1]],
    [['cornuda',1],['cascudo',1]],
    [['matriz',1],['ladraninho',1]],
    [['ninho',1],['cascudo',1],['cornuda',1]],
    /* v5.25 — as seis abaixo existem porque a conta não fechava.
       `q_casulos`, `q_ladroes` e `q_cornudas` pediam 27, 21 e 20
       encontros com a lista antiga: o bicho aparecia em duas formações
       de doze e o contador quase não andava. Medido em
       `assertQuestsCompletáveis`, que reprova acima de 14. */
    [['ladraninho',2],['ninho',1]],
    [['ladraninho',1],['cornuda',1]],
    [['cornuda',3]],
    [['matriz',3]],
    [['matriz',1],['ladraninho',1],['cascudo',1]],
    [['cornuda',1],['ladraninho',1],['ninho',1]],
  /* v5.26 — as criaturas com arte própria entram AQUI, misturadas com as
     antigas, e não numa lista à parte. Cada formação nova carrega junto
     a espécie que alguma missão pede: acrescentar encontro sem isso
     aumenta o denominador de todo mundo e faz caçada que fechava em
     dez virar caçada de vinte. Foi o erro da v5.25, e
     `assertQuestsCompletáveis` existe por causa dele. */
    [['vespao',3]],
    [['vespao',2],['ninho',2]],
    [['pilhador',2],['ladraninho',1]],
    [['pilhador',1],['cornuda',1]],
    [['larva',1],['vespao',2]],
    [['matriarca',1],['ladraninho',1]],
    [['matriarca',1],['cornuda',1]],
  ],
  spire: [
    [['glasswing',4]],
    [['glasswing',5]],
    [['crackmirror',3]],
    [['starmoth',2]],
    [['starmoth',1],['glasswing',2]],
    [['voidling',3]],
    [['voidling',1],['crackmirror',1]],
    [['glasscolossus',1]],
    [['glasscolossus',1],['starmoth',1]],
    [['nightblade',1],['voidling',1]],
    [['nightblade',2]],
    [['lesserherald',3]],
    [['lesserherald',2],['glasswing',1]],
    [['nightblade',1],['lesserherald',1]],
    [['crackmirror',2],['starmoth',1],['voidling',2]],
    /* v5.25 — mesma correção do Ninhal. `q_antescoroa`, `q_reflexo` e
       `q_vazio` pediam 25, 23 e 21 encontros: o Arauto Menor saía em
       três formações de quinze, uma delas com um só. */
    [['lesserherald',2]],
    [['lesserherald',1],['voidling',1]],
    [['crackmirror',3],['glasswing',2]],
    [['crackmirror',1],['nightblade',1]],
    [['voidling',3]],
    [['voidling',2],['starmoth',1]],
    [['lesserherald',1],['crackmirror',1]],
  /* v5.26 — as criaturas com arte própria entram AQUI, misturadas com as
     antigas, e não numa lista à parte. Cada formação nova carrega junto
     a espécie que alguma missão pede: acrescentar encontro sem isso
     aumenta o denominador de todo mundo e faz caçada que fechava em
     dez virar caçada de vinte. Foi o erro da v5.25, e
     `assertQuestsCompletáveis` existe por causa dele. */
    [['prismatico',3]],
    [['prismatico',1],['glasswing',3]],
    [['estilhacado',2],['crackmirror',1]],
    [['estilhacado',1],['voidling',2]],
    [['harpiavidro',2],['glasswing',1]],
    [['vitrea',1],['lesserherald',1]],
    [['vitrea',1],['estilhacado',1],['crackmirror',1]],
  ],
  /* Arquivo Esquecido (v5.24). Trios e quartetos: a área é pós-Coroa e
     o grupo chega com cinco em campo e a árvore cheia. */
  arquivo: [
    [['indice',2],['nota',1]],
    [['nota',2],['marginalia',1]],
    [['errata',1],['indice',1],['nota',1],['marginalia',1]],
    [['codice',1],['indice',1]],
    [['redator',1],['errata',1],['marginalia',1]],
    [['revisor',1],['indice',2]],
    [['revisor',1],['redator',1],['codice',1]],
    [['codice',2],['errata',1]],
  ],

  /* ============ v5.28: as quatro regiões novas ======================
     Mesma regra da v5.26: formação nova entra JÁ com a espécie que
     alguma missão pede, senão o denominador sobe para todo mundo. Aqui
     é mais fácil de acertar porque as missões nasceram junto — e ainda
     assim `assertQuestsCompletáveis` reprovou a primeira versão do
     Esgoto, que pedia 9 válvulas com o Coletor saindo em duas de oito. */
  esgoto: [
    [['mosca',3]],
    [['mosca',2],['ra_imunda',1]],
    [['ra_imunda',2]],
    [['ra_imunda',1],['limo',1]],
    [['limo',2]],
    [['limo',1],['mosca',2]],
    [['coletor',1]],
    [['coletor',1],['ra_imunda',1]],
    [['coletor',1],['mosca',2]],
    [['coletor',2]],
    [['mosca',2],['ra_imunda',1],['limo',1]],
    [['coletor',1],['limo',1]],
  ],
  lago: [
    [['garca',2]],
    [['garca',3]],
    [['garca',1],['naiade',1]],
    [['naiade',2]],
    [['naiade',1],['sapo_lotus',1]],
    [['sapo_lotus',1]],
    [['sapo_lotus',1],['garca',2]],
    [['serpente_lago',1]],
    [['serpente_lago',1],['naiade',1]],
    [['serpente_lago',1],['garca',1]],
    [['naiade',2],['garca',1]],
    [['sapo_lotus',2]],
    [['serpente_lago',1],['sapo_lotus',1]],
    [['garca',2],['naiade',1],['sapo_lotus',1]],
  ],
  podridao: [
    [['rato_peste',3]],
    [['rato_peste',4]],
    [['rato_peste',2],['lesma',1]],
    [['lesma',2]],
    [['lesma',1],['carnical',1]],
    [['carnical',2]],
    [['carnical',1],['rato_peste',2]],
    [['ent_podre',1]],
    [['ent_podre',1],['lesma',1]],
    [['ent_podre',1],['rato_peste',2]],
    [['lesma',3]],
    [['carnical',1],['ent_podre',1]],
    [['rato_peste',2],['lesma',1],['carnical',1]],
    [['ent_podre',2]],
  ],
  deserto: [
    [['chacal',3]],
    [['chacal',2],['mumia',1]],
    [['escaravelho',1]],
    [['escaravelho',1],['chacal',2]],
    [['mumia',2]],
    [['mumia',1],['escaravelho',1]],
    [['salamandra_areia',1]],
    [['salamandra_areia',1],['chacal',1]],
    [['salamandra_areia',1],['mumia',1]],
    [['escaravelho',2]],
    [['chacal',2],['salamandra_areia',1]],
    [['mumia',1],['chacal',1],['escaravelho',1]],
  ],

};

/* Quantas batalhas DISTINTAS o jogo oferece: cada formação de encontro
   mais cada chefe de mapa. Existe para o autoteste travar o tamanho do
   conteúdo — a v4.8 prometeu 51 batalhas novas sobre a v4.7, e promessa
   sem medição é chute. */
const BATALHAS_V47 = 24;      // 22 formações + 2 chefes, medido na v4.7
function contarBatalhas(){
  const formacoes = sum(Object.values(FORMATIONS).map(l => l.length));
  const chefes = Object.values(MAPS).filter(m => m.boss).length;
  return {formacoes, chefes, total:formacoes + chefes};
}

/* --- Missões -------------------------------------------------------
   Dadas por NPC. Dois tipos:
     hunt    abater N criaturas de uma chave do bestiário
     collect entregar N unidades de um item (consumido na entrega)
   O NPC só precisa de `quest:'<id>'`; toda a conversa sai daqui.
   Estado fica em G.quests[id] = {st:'ativa'|'feita', base:<abates ao aceitar>}. */
