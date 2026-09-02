const PET_EXP_SHARE = 0.35;     // fração do EXP da luta que vai para o pet
const PET_BONUS_DONO = 1.3;     // ×dano/cura quando o dono está em campo
/* Frequência, e não força, é a manivela de balanceamento do pet — foi
   medido. Em 0,22 + 0,012/nível o bicho agia em ~39% das rodadas e a
   luta encurtava de 4,7 para 4,0 rodadas (e de 4,0 para 3,0 no fim da
   região), com o vale de HP subindo de 69% para 81%. Isso não é "às
   vezes", é um sexto personagem em tempo parcial. Baixando a chance a
   intervenção volta a ser evento, e o pico de dano de cada aparição
   continua valendo a pena. */
const PET_CHANCE_BASE = 0.16;   // chance de agir por rodada, no nível 1
const PET_CHANCE_PASSO = 0.008; // quanto sobe por nível
const PET_CHANCE_MAX  = 0.40;   // teto da chance

/** EXP para o pet subir de `lvl` para `lvl+1`. Mais rasa que a do
 *  elenco de propósito: o pet acompanha, não corre atrás. */
const petExpToNext = lvl => Math.floor(40 * Math.pow(lvl, 1.35)) + 60;

const PETS = {
  /* v5.27 — CADA PET PASSOU A SER DO ELEMENTO DO DONO.
     Antes a lista era um zoológico sem regra: o Escriba de Tinta andava
     com uma salamandra de fogo, a Vanguarda elétrica com um rato de
     sangue. A arte nova chegou organizada por elemento e batia certo com
     o elenco inteiro, então a tabela é que se ajustou — bicho, nome,
     cor e descrição. O PAPEL de combate de cada dono foi preservado
     linha por linha (quem tinha pet de cura continua com cura, quem
     tinha buff continua com buff): trocar o desenho não pode
     rebalancear o grupo de ninguém.

     `cor`/`acento` acompanham a ARTE, não o contrário: o marcador do pet
     no menu é desenhado com eles, e se divergirem da imagem a tela fica
     mentindo.
     `sprite` é opcional: sem ele, cai no desenho procedural.
     `spriteBatalha` também: sem ele, o combate reaproveita `sprite`, que
     é o certo para pet cuja arte serve nos dois contextos. */
  polvo: {
    dono:'Seiji', elem:'ink', cor:'#1a2a5a', acento:'#5a8afa',
    desc:'Escreve com oito mãos e nenhuma delas concorda com a outra.',
    formas:[
      {name:'Polvo de Tinteiro', nivel:1,  tipo:'atk', power:30, sprite:'pet_polvo_1'},
      {name:'Polvo de Nanquim',  nivel:10, tipo:'atk', power:52, status:{id:'blind', chance:0.35},
       sprite:'pet_polvo_2'},
      {name:'Kraken de Página',  nivel:22, tipo:'atk', power:84, status:{id:'blind', chance:0.5},
       alvo:'all', sprite:'pet_polvo_3'},
    ],
  },
  homunculo: {
    dono:'Ophelia', elem:'ice', cor:'#c8c4b8', acento:'#7ae0d0',
    desc:'Desenhado a giz numa lousa da Academia. Ninguém confessou ter apagado o resto.',
    formas:[
      {name:'Homúnculo de Giz',  nivel:1,  tipo:'heal', power:60,  sprite:'pet_homunculo_1'},
      {name:'Homúnculo Selado',  nivel:10, tipo:'heal', power:110, sprite:'pet_homunculo_2'},
      {name:'Homúnculo Maior',   nivel:22, tipo:'heal', power:170, alvo:'all',
       sprite:'pet_homunculo_3'},
    ],
  },
  morcego: {
    dono:'Marin', elem:'darkness', cor:'#241830', acento:'#a05ac0',
    desc:'Ouve o que você vai fazer antes de você decidir.',
    formas:[
      {name:'Morcego de Breu',   nivel:1,  tipo:'atk', power:34, sprite:'pet_morcego_1'},
      {name:'Morcego Sem Eco',   nivel:10, tipo:'atk', power:58, status:{id:'dread', chance:0.4},
       sprite:'pet_morcego_2'},
      {name:'Umbral de Asa Longa',nivel:22,tipo:'debuff', power:0, buff:{def:0.7, atk:0.8, turns:3},
       sprite:'pet_morcego_3'},
    ],
  },
  /* A salamandra era do Seiji e virou do Gabriel: o bicho é de FOGO e o
     Guardião também. O papel dela mudou junto — era ataque, agora é o
     buff de defesa que o caranguejo fazia, porque é o Guardião que
     depende dele. A arte é de samurai de guarda, e casa. */
  salamandra: {
    dono:'Gabriel', elem:'fire', cor:'#d02828', acento:'#f0e0d0',
    desc:'Ficou de sentinela numa porta que já não existe. Não saiu.',
    formas:[
      {name:'Salamandra de Guarda', nivel:1,  tipo:'buff', power:0, buff:{def:1.35, turns:3},
       sprite:'pet_salamandra_1', spriteBatalha:'pet_salamandra_1_batalha'},
      {name:'Salamandra Ronin',     nivel:10, tipo:'buff', power:0, buff:{def:1.5, atk:1.15, turns:3},
       sprite:'pet_salamandra_2'},
      {name:'Guardiã de Brasa',     nivel:22, tipo:'buff', power:0, buff:{def:1.7, atk:1.25, turns:4},
       sprite:'pet_salamandra_3'},
    ],
  },
  /* O rato drenava vida; o lince não drena — não é o que um lince faz.
     A perda foi paga em potência (32/56/62 → 34/58/66) e em `shock`,
     que é a moeda elétrica do jogo. Troca lateral, não corte. */
  lince: {
    dono:'Max', elem:'electricity', cor:'#7a6a10', acento:'#ffe44a',
    desc:'Chega antes do trovão. O trovão é o barulho de ele já ter passado.',
    formas:[
      {name:'Lince Faísca',     nivel:1,  tipo:'atk', power:34, sprite:'pet_lince_1'},
      {name:'Lince de Arco',    nivel:10, tipo:'atk', power:58, status:{id:'shock', chance:0.4},
       sprite:'pet_lince_2'},
      {name:'Lince Tempestade', nivel:22, tipo:'atk', power:66, status:{id:'shock', chance:0.35},
       alvo:'all', sprite:'pet_lince_3'},
    ],
  },
  falcao: {
    dono:'Eden', elem:'wind', cor:'#3a6a5a', acento:'#a8ffd0',
    desc:'Some no vento e volta com a direção certa no bico.',
    formas:[
      {name:'Falcão Errante', nivel:1,  tipo:'atk', power:28, status:{id:'exposed', chance:0.4},
       sprite:'pet_falcao_1'},
      {name:'Falcão do Sul',  nivel:10, tipo:'buff', power:0, buff:{spd:1.35, atk:1.15, turns:3},
       sprite:'pet_falcao_2'},
      {name:'Falcão de Éter', nivel:22, tipo:'atk', power:74, status:{id:'exposed', chance:0.6},
       alvo:'all', sprite:'pet_falcao_3'},
    ],
  },
  coelho: {
    dono:'Ava Rosa Groot', elem:'earth', cor:'#8a6a3a', acento:'#c8e07a',
    desc:'Cava um buraco e o buraco vira trincheira.',
    formas:[
      {name:'Broto de Pelo',     nivel:1,  tipo:'buff', power:0, buff:{def:1.3, turns:3},
       sprite:'pet_coelho_1'},
      {name:'Coelho de Pedra',   nivel:10, tipo:'buff', power:0, buff:{def:1.45, hp:1, turns:3},
       sprite:'pet_coelho_2'},
      {name:'Guardião de Musgo', nivel:22, tipo:'buff', power:0, buff:{def:1.65, atk:1.2, turns:4},
       sprite:'pet_coelho_3'},
    ],
  },
  sapo: {
    dono:'Scythe', elem:'poison', cor:'#7a2a6a', acento:'#9ae44a',
    desc:'Só aparece quando alguém já decidiu que não vai voltar.',
    formas:[
      {name:'Sapo Pálido',  nivel:1,  tipo:'atk', power:30, status:{id:'rooted', chance:0.3},
       sprite:'pet_sapo_1'},
      {name:'Sapo da Cova', nivel:10, tipo:'atk', power:54, status:{id:'bleed', chance:0.4},
       sprite:'pet_sapo_2'},
      {name:'Coral Vivo',   nivel:22, tipo:'atk', power:76, status:{id:'terror', chance:0.3},
       alvo:'all', sprite:'pet_sapo_3'},
    ],
  },
  /* v5.29 — o Madao trocou o pombo pelo corvo, e é a mesma piada contada
     melhor: o bicho continua sendo o que ninguém escolheria, mas agora
     a terceira forma mostra POR QUE ele fica. */
  corvo: {
    dono:'Madao', elem:'blood', cor:'#2a2622', acento:'#c8a878',
    desc:'Não voa direito, não vai embora e come qualquer coisa.',
    formas:[
      {name:'Corvo de Beco',    nivel:1,  tipo:'atk',  power:26, sprite:'pet_corvo_1'},
      {name:'Corvo Chamuscado', nivel:10, tipo:'atk',  power:50, status:{id:'burn', chance:0.35},
       sprite:'pet_corvo_2'},
      {name:'Fênix de Fuligem', nivel:22, tipo:'heal', power:120, alvo:'all',
       sprite:'pet_corvo_3'},
    ],
  },
  /* v5.30 — o dragão ganhou dona. Ele sempre foi da Amanda no texto
     ("Era da diretora Felt"), e com ela jogável não há mais motivo para
     `dono:null`. O bônus de dono passa a valer quando ela está em campo,
     e é caro de propósito: ele já era o pet mais forte da lista, então
     levar os dois juntos custa uma vaga do grupo. */
  dragao: {
    dono:'Amanda Felt', elem:'fire', cor:'#2a1030', acento:'#ff6a9a',
    desc:'Era da diretora Felt. Ela não explicou por que deixou de ser.',
    formas:[
      {name:'Filhote de Lilith', nivel:1,  tipo:'atk', power:46, sprite:'pet_dragonete_1'},
      {name:'Dragonete de Lilith',nivel:10,tipo:'atk', power:80, status:{id:'dread', chance:0.45},
       sprite:'pet_dragonete_2'},
      {name:'Dragão de Lilith',  nivel:22, tipo:'atk', power:118, alvo:'all',
       status:{id:'dread', chance:0.5}, sprite:'pet_dragonete_3'},
    ],
  },
};

/* Id antigo → id novo (v5.27). Os ids são internos, mas deixar `gato`
   guardando um morcego envelhece pior que renomear. Renomear sozinho
   apagaria o pet de quem já jogava: `loadGame` remove de `G.pets` toda
   chave que não está em PETS. Por isso o mapa, aplicado na carga.

   Cuidado que já mordeu uma vez: `salamandra` aparece dos DOIS lados —
   o pet antigo do Seiji virou `polvo`, e o do Gabriel herdou o id
   `salamandra`. Só funciona construindo um objeto NOVO; renomear no
   lugar sobrescreveria um com o outro. */
const PET_RENOMEADO = {
  salamandra:'polvo', lebre:'homunculo', gato:'morcego',
  caranguejo:'salamandra', rato:'lince', bicho_pau:'coelho',
  mariposa:'sapo', andorinha:'falcao', pombo:'corvo',
};


/** A forma atual de um pet, dado o nível. Sempre a última alcançada. */
function petForma(id, lvl){
  const p = PETS[id]; if (!p) return null;
  let f = p.formas[0];
  for (const cand of p.formas) if (lvl >= cand.nivel) f = cand;
  return f;
}
/** Próxima evolução, ou null se já está na forma final. */
function petProxForma(id, lvl){
  const p = PETS[id]; if (!p) return null;
  return p.formas.find(f => lvl < f.nivel) || null;
}
/** Chance de o pet agir numa rodada. Cresce com o nível, com teto. */
const petChance = lvl => clamp(PET_CHANCE_BASE + (lvl - 1) * PET_CHANCE_PASSO,
                               PET_CHANCE_BASE, PET_CHANCE_MAX);

/* --- Arte de batalha (opcional) -----------------------------------
   Estilo "treinador de Pokémon": no mapa o personagem é o chibi da
   folha de 42-68 px; no combate ele pode usar uma arte MAIOR, 2D/anime.
   Os dois sistemas são independentes: sem entrada aqui o combate cai
   automaticamente no chibi em 2× (comportamento atual, nada quebra).

   Como cadastrar — uma linha por personagem, a chave é o `name`:

       Gabriel: {src:'gabriel_batalha.png', w:112, h:152},

   `src` aceita as duas formas:
     • 'data:image/png;base64,...' → embutido, mantém o arquivo único
     • 'arte/gabriel.png'          → caminho relativo ao HTML; funciona
        em file://, é só deixar o PNG junto do jogo

   Campos:
     w, h     tamanho de UM quadro, em pixels da arte  (obrigatórios)
     frames   tira horizontal com N quadros de respiração (padrão 1)
     fps      velocidade da tira (padrão 4)
     scale    multiplicador de desenho (padrão 1)
     flip     true se a arte olha para a DIREITA (o inimigo fica à esquerda)
     anchorY  fração da altura que encosta no chão (padrão 1 = pelos pés)

   Tamanho de referência: treinador de GBA é 64×64; aqui, com 5 no time,
   algo entre 96×128 e 112×160 preenche bem sem empilhar os personagens.
   Ao cadastrar QUALQUER personagem, o combate passa a usar a formação
   espaçada (ALLY_SPOTS_LARGE) para caber a arte maior.

   ESTADO ATUAL: os cinco já têm arte 2D embutida (WebP com alpha,
   ~10 KB cada), normalizada em 152 px de ALTURA para todo mundo — é o
   que mantém a escala coerente entre eles e ainda deixa a fileira de
   trás livre da HUD. As larguras (93-96) saem do recorte de cada um.
   Gerada dos originais 1024×1536 por chroma key + recorte + redução.
   Todos olham para a ESQUERDA, que é o lado dos inimigos: ninguém
   precisa de `flip`. Para trocar, basta substituir src/w/h da linha. */
