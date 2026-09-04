const PONTOS_POR_NIVEL = 2;   // pontos de alma ganhos a cada nível
/* Ângulo do meio entre cada par de ramos — onde mora a convergência
   daquele par. Fica ao lado de RAMOS de propósito: mudar o ângulo de um
   ramo sem mexer aqui torceria o desenho sem ninguém perceber. */
const ANG_CONV = [-30, 90, 210];

const RAIO_RAMO = 250;        // raio em que TODO ramo termina, qualquer que seja seu tamanho

/* Ângulo de cada ramo, em graus, medido do centro. Três ramos a 120°
   entre si — a referência usa seis porque tem seis elementos. */
const RAMOS = {
  lamina:  {nome:'Lâmina', ang:-90, stat:'atk', desc:'Golpe direto, alvo único.'},
  mare:    {nome:'Maré',   ang: 30, stat:'mp',  desc:'Alcance: acertar o grupo inteiro.'},
  voz:     {nome:'Voz',    ang:150, stat:'def', desc:'Curar, proteger e desmontar o inimigo.'},
};

/* ================= v5.31: A ÁRVORE VIRA GRIMÓRIO ====================
   O sistema passou a ser orientado a dados de verdade: uma definição
   por personagem, um motor só, e sete TIPOS de nó em vez de três.

   O que NÃO mudou, de propósito: os ids. `s_<skill>` e `<ramo>_p<i>`
   continuam iguais, porque o save guarda id de nó — mudar o esquema
   apagaria a árvore de quem já jogava, e a árvore é trinta níveis de
   escolha. Tudo que é novo entra com id novo ao lado.

   TIPOS (o vocabulário do spec, no idioma do código):

     core         núcleo elemental, grátis, origem de tudo
     conta        conta de progressão: pequena, 1 ponto, microbônus.
                  NÃO é habilidade — não entra na barra de combate.
     skill        habilidade de verdade, com entrada em SKILLS
     passiva      a passiva ÚNICA do personagem, uma por árvore
     mecanica     a mecânica principal, uma por árvore
     especial     nó opcional forte, fora da corrente principal
     convergencia junta dois caminhos; exige nós de ambos
     ultimate     o Apocalipse, no fim de tudo

   As `conta` são os antigos nós de atributo — mesma função (custo de
   oportunidade entre habilidades), nome novo e microbônus explícito.
   ================================================================== */
const TIPOS_NO = {
  core:         {raio:26, ordem:0, rotulo:'Núcleo'},
  ultimate:     {raio:20, ordem:1, rotulo:'Apocalipse'},
  convergencia: {raio:17, ordem:2, rotulo:'Convergência'},
  especial:     {raio:16, ordem:3, rotulo:'Especial'},
  skill:        {raio:15, ordem:4, rotulo:'Habilidade'},
  mecanica:     {raio:15, ordem:5, rotulo:'Mecânica'},
  passiva:      {raio:15, ordem:6, rotulo:'Passiva única'},
  conta:        {raio:5,  ordem:7, rotulo:'Conta de progressão'},
};

/* Microbônus de uma conta de progressão. Percentuais pequenos e
   cumulativos, como o spec pede — o que a conta compra é PASSAGEM, e o
   bônus é o troco. */
const CONTA_BONUS = {
  atk:{rotulo:'Fio',     desc:'+%d de Ataque'},
  def:{rotulo:'Casco',   desc:'+%d de Defesa'},
  spd:{rotulo:'Passo',   desc:'+%d de Rapidez'},
  hp: {rotulo:'Fôlego',  desc:'+%d de Vida máxima'},
  mp: {rotulo:'Reserva', desc:'+%d de Éter máximo'},
};

/* Identidade de cada árvore: atributo, variação, núcleo, mecânica,
   passiva única e o nome dos três caminhos. É a tabela que o spec
   descreve — uma linha por personagem, e o motor é o mesmo para todos.

   `caminhos` renomeia os três ramos por personagem. O terceiro é sempre
   o de FUSÃO no spec; aqui ele é o ramo `voz`, que é onde caem cura,
   proteção e desmonte — o que de fato mistura. */
const IDENTIDADE_ARVORE = {
  Gabriel:  {atributo:'Fogo', variacao:'Chamas', nucleo:'Grande Chama',
             paleta:['#ff8844','#e85a30','#4a2418'],
             passiva:{nome:'Brasa Teimosa', desc:'Ao cair abaixo de 30% de vida, ATK +25% até o fim da luta.'},
             mecanica:{nome:'Forja', desc:'Cada golpe recebido esquenta a forja; a Ressonância enche mais rápido.'},
             ultimate:{nome:'Apocalipse da Forja', desc:'Solta de uma vez todo o calor guardado.'},
             caminhos:{lamina:'Caminho do Aço Quente', mare:'Caminho do Incêndio', voz:'Fusão: Fogo & Guarda'}},
  Ophelia:  {atributo:'Gelo', variacao:'Inverno', nucleo:'Cristal de Gelo',
             paleta:['#88ccff','#5aaaea','#1a3a5a'],
             passiva:{nome:'Sangue Frio', desc:'Curas que ela lança rendem +15% quando o alvo está abaixo da metade.'},
             mecanica:{nome:'Geada Acumulada', desc:'Cada gelo aplicado deixa marca; a terceira congela sozinha.'},
             ultimate:{nome:'Apocalipse do Inverno', desc:'O ar inteiro para de se mover.'},
             caminhos:{lamina:'Caminho da Estaca', mare:'Caminho da Nevasca', voz:'Fusão: Gelo & Orvalho'}},
  Marin:    {atributo:'Trevas', variacao:'Oculto', nucleo:'Lua Negra',
             paleta:['#b06aea','#9a6aba','#1a1024'],
             passiva:{nome:'Passo Sem Som', desc:'Primeiro golpe de cada luta é crítico garantido.'},
             mecanica:{nome:'Sombra Dobrada', desc:'Agir duas vezes num turno consome a sombra acumulada.'},
             ultimate:{nome:'Apocalipse Sem Estrelas', desc:'Um instante de nada absoluto.'},
             caminhos:{lamina:'Caminho da Lâmina Curta', mare:'Caminho do Eclipse', voz:'Fusão: Oculto & Sombras'}},
  Seiji:    {atributo:'Tinta', variacao:'Escrita', nucleo:'Gota de Tinta',
             paleta:['#5a8afa','#2a4a8a','#141c3a'],
             passiva:{nome:'Margem Escrita', desc:'Cada habilidade de Tinta usada baixa em 1 o custo da próxima.'},
             mecanica:{nome:'Caligrama', desc:'Três habilidades diferentes na mesma luta liberam a assinatura.'},
             ultimate:{nome:'Apocalipse da Página', desc:'A tinta reescreve o que toca.'},
             caminhos:{lamina:'Caminho do Traço', mare:'Caminho da Maré Negra', voz:'Fusão: Tinta & Caligrafia'}},
  Max:      {atributo:'Eletricidade', variacao:'Raio', nucleo:'Grande Relâmpago',
             paleta:['#ffe44a','#e8c860','#3a3010'],
             passiva:{nome:'Condutor', desc:'Inimigos com Choque sofrem +20% dos ataques dele.'},
             mecanica:{nome:'Carga', desc:'Guardar acumula carga; gastar tudo de uma vez multiplica o golpe.'},
             ultimate:{nome:'Apocalipse do Céu', desc:'A tempestade obedece.'},
             caminhos:{lamina:'Caminho da Descarga', mare:'Caminho da Tempestade', voz:'Fusão: Raio & Corrente'}},
  Eden:     {atributo:'Vento', variacao:'Oráculo', nucleo:'Espiral de Vento',
             paleta:['#a8ffd0','#5aba9a','#1a3a34'],
             passiva:{nome:'Ouvido no Ar', desc:'Vê a ordem de turno dos inimigos antes de agir.'},
             mecanica:{nome:'Corrente Ascendente', desc:'Alvos Expostos devolvem éter a quem os expôs.'},
             ultimate:{nome:'Apocalipse do Sopro', desc:'O vento leva o que não estava preso.'},
             caminhos:{lamina:'Caminho da Lâmina de Ar', mare:'Caminho da Ventania', voz:'Fusão: Vento & Tempestade'}},
  'Ava Rosa Groot': {atributo:'Terra', variacao:'Raiz', nucleo:'Raiz Vital',
             paleta:['#8aba4a','#5a8a3a','#2a3a1a'],
             passiva:{nome:'Ciclo', desc:'No fim de cada turno recupera 3% da vida máxima.'},
             mecanica:{nome:'Enraizar', desc:'Ficar parada um turno dobra a defesa no turno seguinte.'},
             ultimate:{nome:'Apocalipse da Raiz', desc:'O chão decide de quem é o campo.'},
             caminhos:{lamina:'Caminho do Espinho', mare:'Caminho da Floresta', voz:'Fusão: Terra & Seiva'}},
  Scythe:   {atributo:'Veneno', variacao:'Ceifador', nucleo:'Caveira Envenenada',
             paleta:['#9ae44a','#5a8a2a','#2a3a10'],
             passiva:{nome:'Herança Amarga', desc:'Veneno aplicado por ela dura um turno a mais.'},
             mecanica:{nome:'Contagem', desc:'Cada condição no alvo soma dano à próxima habilidade dela.'},
             ultimate:{nome:'Apocalipse do Ceifador', desc:'Cobra tudo o que estava pendurado.'},
             caminhos:{lamina:'Caminho da Foice', mare:'Caminho do Miasma', voz:'Fusão: Veneno & Toxina'}},
  /* MADAO — era a exceção declarada do spec (árvore de Cinzas, combate
     de Fogo). Deixou de ser exceção: o elemento de combate também virou
     Cinzas (ID interno `blood`, ver ELEM.blood em data/02-elements-
     status.js) — atributo, paleta, caminhos, núcleo e fundo da árvore
     já eram de Cinzas desde o spec original, agora o combate bate com
     eles. O Caminho da Preguiça continua sendo dele e de mais ninguém —
     há teste travando isso. */
  Madao:    {atributo:'Cinzas', variacao:'Decadência', nucleo:'Corvo das Cinzas',
             paleta:['#c8a878','#7a6a5a','#2a2622'],
             fundo:'tree_bg_darkness', icone:'✹',
             passiva:{nome:'Piada Ruim', desc:'Inimigos envergonhados sofrem mais dano e têm chance de falhar a ação.'},
             mecanica:{nome:'Curse — Maldição das Cinzas',
                       desc:'Acumula Curse nos inimigos com ataques, piadas e humilhações. Curse alto vira DECADÊNCIA.'},
             ultimate:{nome:'Corvo da Tropa Torta', desc:'Tudo o que ele queimou volta de uma vez, e volta cinza.'},
             caminhos:{lamina:'Caminho da Fuligem', mare:'Caminho da Ruína', voz:'Caminho da Preguiça'}},
  'Amanda Felt': {atributo:'Fogo', variacao:'Herança', nucleo:'Selo da Herdeira',
             paleta:['#ff7a3a','#e8c860','#3a1c12'],
             passiva:{nome:'Direito de Comando', desc:'Aliados em campo com ela ganham +10% de ATK.'},
             mecanica:{nome:'Chamado', desc:'Cada aliado caído aumenta o dano dela até o fim da luta.'},
             ultimate:{nome:'Apocalipse da Herança', desc:'Ela para de esconder o que é.'},
             caminhos:{lamina:'Caminho da Lâmina', mare:'Caminho da Asa', voz:'Fusão: Coroa & Ordem'}},
  /* A paleta do Abel é dourada, não laranja: três personagens do
     elenco são de Fogo (Gabriel, Abel e Amanda — o Madao virou Cinzas)
     e um teste reprova quando dois deles pintam a árvore da mesma cor.
     O fogo dele é o de uma runa acesa, não o de uma forja. */
  'Abel Nomikos': {atributo:'Fogo', variacao:'Runas', nucleo:'Runa Aberta',
             paleta:['#e8b04a','#c07a2a','#2a1c10'],
             passiva:{nome:'O Observador', desc:'A primeira habilidade que ele usa contra um inimigo custa metade.'},
             mecanica:{nome:'Anotação', desc:'Inimigo já enfrentado antes sofre +15% das habilidades dele.'},
             ultimate:{nome:'Apocalipse da Última Página', desc:'Ele fecha o livro. O resto pega fogo.'},
             caminhos:{lamina:'Caminho da Leitura', mare:'Caminho do Incêndio', voz:'Fusão: Runa & Cálculo'}},
  'Orfeu Bauss': {atributo:'Éter', variacao:'Absorção', nucleo:'Punho Vazio',
             paleta:['#a8c8ff','#5a6aba','#1a2038'],
             passiva:{nome:'Sem Elemento', desc:'Não tem fraqueza elemental: nenhum ataque o acerta com bônus.'},
             mecanica:{nome:'Absorver', desc:'Dano recebido devolve éter em vez de só doer.'},
             ultimate:{nome:'Apocalipse do Nada a Dever', desc:'Vinte anos de treino descontados de uma vez.'},
             caminhos:{lamina:'Caminho do Golpe Seco', mare:'Caminho da Rodada', voz:'Fusão: Guarda & Disciplina'}},
  Snoopy:   {atributo:'Eletricidade', variacao:'Filhote', nucleo:'Filhote Dourado',
             paleta:['#ffe44a','#c8a030','#2a2210'],
             passiva:{nome:'O Filhote Escolhe', desc:'O alvo marcado por ele sofre +20% de todo o grupo.'},
             mecanica:{nome:'Crescer', desc:'Cada abate dele faz o filhote crescer um pouco, até o fim da luta.'},
             ultimate:{nome:'Apocalipse do Despertar', desc:'Por três segundos, o dragão é adulto.'},
             caminhos:{lamina:'Caminho da Garra', mare:'Caminho do Voo', voz:'Fusão: Marca & Passo'}},
};

/** A identidade da árvore de alguém. Nunca devolve nulo: personagem sem
 *  linha na tabela cai num genérico montado do elemento dele, para que
 *  acrescentar gente ao elenco não quebre a tela. */
function identidadeArvore(nome, elemento){
  const E = ELEM[elemento] || ELEM.none;
  return IDENTIDADE_ARVORE[nome] || {
    atributo:E.name, variacao:'—', nucleo:'Núcleo de ' + E.name,
    paleta:[E.glow, E.main || E.glow, '#2a2438'],
    passiva:{nome:'Instinto', desc:'Sem passiva própria ainda.'},
    mecanica:{nome:'—', desc:'Sem mecânica própria ainda.'},
    ultimate:{nome:'Apocalipse', desc:'O fim do caminho.'},
    caminhos:{lamina:'Lâmina', mare:'Maré', voz:'Voz'},
    fundo:null, icone:E.icon,
  };
}

/** Em que ramo uma habilidade cai. Lê `SKILLS`, não uma lista paralela. */
function ramoDaSkill(id){
  const s = SKILLS[id];
  if (!s) return 'voz';
  if (s.type !== 'atk') return 'voz';
  return s.target === 'all' ? 'mare' : 'lamina';
}

/* As folhas alternam entre dois atributos para o ramo não virar um
   monobloco: quem sobe Lâmina inteira leva ATK e um pouco de SPD. */
const RAMO_FOLHA = {lamina:['atk','spd'], mare:['mp','hp'], voz:['def','hp']};

const PASSIVA_ROTULO = {atk:'Fio', def:'Casco', spd:'Passo', hp:'Fôlego', mp:'Reserva'};
const PASSIVA_NOME = {
  atk:'+%d de Ataque', def:'+%d de Defesa', spd:'+%d de Rapidez',
  hp:'+%d de Vida máxima', mp:'+%d de Éter máximo',
};

/** Quanto uma passiva do anel `anel` vale, por atributo. */
function valorPassiva(stat, anel){
  if (stat === 'hp') return 5 + anel * 3;
  if (stat === 'mp') return 3 + anel * 2;
  return 1 + Math.floor(anel / 2);
}

/** Monta a árvore de um personagem. Determinística: mesma entrada,
 *  mesma árvore, sempre — os testes dependem disso e o save também,
 *  porque o save guarda IDS DE NÓ e não posições. */
function construirArvore(def){
  const nos = {};
  const idt = identidadeArvore(def.name, def.element);
  const raiz = {
    id:'core', tipo:'core', ramo:null, anel:0, custo:0, req:[],
    nome:idt.nucleo, desc:'O ponto de onde tudo sai. Não custa nada.',
    x:0, y:0,
  };
  nos.core = raiz;

  /* `learn` já vem em ordem de progressão; separar por ramo preserva
     essa ordem dentro de cada galho. O nível de origem vira só um dado
     informativo (`nivelAntigo`) — não trava mais nada. */
  const porRamo = {lamina:[], mare:[], voz:[]};
  for (const [nivel, id] of def.learn){
    if (!SKILLS[id]) continue;
    porRamo[ramoDaSkill(id)].push({id, nivel});
  }

  const pontas = {};      // último nó de cada ramo — de onde sai a convergência

  for (const [ramo, cfg] of Object.entries(RAMOS)){
    const lista = porRamo[ramo];
    let anterior = 'core';
    let anel = 0;
    /* Todos os ramos terminam no MESMO raio, como os seis braços da
       referência terminam na borda do hexágono: o passo entre anéis é
       que se ajusta ao comprimento do galho. Com passo fixo, um elenco
       tão desigual quanto o nosso — a Ophelia tem 5 habilidades de Voz
       e 1 de Maré — gerava uma árvore torta, em que os limites eram
       ditados pelo galho comprido e o painel ficava com metade vazia. */
    const anelMax = Math.max(1, lista.length * 2 - 1);
    /* Piso no passo: normalizar sozinho comprimia demais o galho longo
       (a Voz da Ophelia tem 9 anéis) e os nós se encostavam. Com piso, o
       ramo comprido estoura um pouco o raio comum — e é o ajuste de
       escala do desenho que absorve isso. */
    const passo = Math.max(RAIO_RAMO / anelMax, 30);

    lista.forEach((item, i) => {
      /* A primeira habilidade de cada ramo entra SEM conta na frente:
         é o que garante que um personagem nível 1 tenha o que apertar
         em combate mesmo sem ter gasto ponto nenhum. */
      if (i > 0){
        anel++;
        const stat = cfg.stat;
        const val = valorPassiva(stat, anel);
        const pid = `${ramo}_p${i}`;
        const B = CONTA_BONUS[stat];
        nos[pid] = {
          /* Id antigo de propósito: o save guarda id de nó, e renomear
             `<ramo>_p<i>` apagaria a árvore de quem já jogava. O tipo é
             que mudou — de "passiva" para "conta de progressão". */
          id:pid, tipo:'conta', ramo, anel, custo:1 + Math.floor(item.nivel / 16), req:[anterior],
          stat, valor:val,
          nome:`${B.rotulo} ${'I'.repeat(Math.min(3, i))}`,
          desc:B.desc.replace('%d', val),
          ...posicaoNo(cfg.ang, anel, passo, 0),
        };
        anterior = pid;
      }
      anel++;
      const sk = SKILLS[item.id];
      const nid = `s_${item.id}`;
      /* Habilidade de nível 1 é de graça e já vem destravada: tirar o
         repertório inicial de alguém transformaria a árvore numa punição
         para quem acabou de começar. */
      const inicial = item.nivel <= 1;
      /* O preço sai do NÍVEL EM QUE A HABILIDADE ERA APRENDIDA, não do
         anel: é o que mantém a curva de custo que o jogo já tinha. */
      nos[nid] = {
        id:nid, tipo:'skill', ramo, anel, skill:item.id, nivelAntigo:item.nivel,
        inicial,
        custo:inicial ? 0 : 1 + Math.ceil(item.nivel / 8),
        req:inicial ? [] : [anterior],
        nome:sk.name, desc:sk.desc || '',
        ...posicaoNo(cfg.ang, anel, passo, 0),
      };
      anterior = nid;
      pontas[ramo] = nid;

      /* FOLHA opcional: pende do lado da corrente, dá atributo e não
         trava nada. É o que o jogador sacrifica para correr até o fim. */
      const stats = RAMO_FOLHA[ramo];
      const stat = stats[i % stats.length];
      const val = valorPassiva(stat, anel);
      const fid = `${ramo}_f${i}`;
      const B = CONTA_BONUS[stat];
      /* 40 px de afastamento perpendicular e 10 para fora, alternando de
         lado. A distância é medida, não escolhida: a folha é a vizinha
         mais próxima do nó de habilidade, e é ela que dita o tamanho
         máximo que um nó de habilidade pode ter sem encostar. Com 40 a
         menor distância entre dois nós na tela fica em ~16 px — o que
         faz caber o ícone. Uma versão intermediária desta reescrita usou
         1 px e as folhas ficaram literalmente em cima das habilidades. */
      nos[fid] = {
        id:fid, tipo:'conta', ramo, anel, custo:1, req:[nid], folha:true,
        stat, valor:val,
        nome:`${B.rotulo} de ${RAMOS[ramo].nome}`,
        desc:B.desc.replace('%d', val),
        ...posicaoNo(cfg.ang, anel, passo, i % 2 ? 40 : -40, 10),
      };
    });
  }

  /* ---- os nós que a v5.31 acrescentou ----
     Todos com id novo, todos pendurados no que já existia. Nenhum deles
     mexe em `s_*` nem em `<ramo>_p<i>`, que é o que o save conhece.

     A posição sai do RAIO JÁ OCUPADO pelos ramos, não de um número
     fixo. Com anel e passo constantes um personagem de galho curto
     ganhava convergências a 300 px de distância de qualquer coisa, e o
     ajuste de escala da tela — que enquadra o retângulo inteiro —
     encolhia a árvore toda para caber esse vazio. Medindo, a coroa de
     nós novos acompanha o tamanho de cada árvore. */
  const raioRamos = Math.max(120, ...Object.values(nos)
    .filter(n => n.ramo).map(n => Math.hypot(n.x, n.y)));

  // PASSIVA ÚNICA — grátis, colada no núcleo. É identidade, não escolha.
  nos.passiva_unica = {
    id:'passiva_unica', tipo:'passiva', ramo:null, anel:0, custo:0, req:[],
    nome:idt.passiva.nome, desc:idt.passiva.desc,
    ...posicaoNo(210, 0, 0, 0, 74),
  };
  // MECÂNICA PRINCIPAL — também grátis: é como o personagem funciona.
  nos.mecanica = {
    id:'mecanica', tipo:'mecanica', ramo:null, anel:0, custo:0, req:[],
    nome:idt.mecanica.nome, desc:idt.mecanica.desc,
    ...posicaoNo(-30, 0, 0, 0, 74),
  };

  /* CONVERGÊNCIAS — juntam DOIS caminhos. O requisito é a ponta dos
     dois, e é isso que as torna caras de verdade: não dá para chegar
     numa convergência subindo um ramo só. Ficam no ângulo do meio entre
     os dois ramos que unem, que é onde o desenho conta a mesma coisa que
     a regra: o galho da esquerda e o da direita chegam ali juntos. */
  const paresConv = [['lamina','mare'], ['mare','voz'], ['voz','lamina']];
  const STAT_CONV = ['atk', 'mp', 'def'];
  const NOME_STAT = {atk:'Ataque', mp:'Éter máximo', def:'Defesa'};
  paresConv.forEach(([a, b], k) => {
    if (!pontas[a] || !pontas[b]) return;
    const id = `conv_${a}_${b}`;
    const stat = STAT_CONV[k], val = 6 + k * 2;
    /* O nome sai dos CAMINHOS do personagem, não dos ramos genéricos: a
       convergência do Gabriel se chama "Aço Quente & Incêndio", não
       "Lâmina & Maré". É a mesma tabela que renomeia os galhos. */
    const cam = (r) => (idt.caminhos && idt.caminhos[r]) || RAMOS[r].nome;
    nos[id] = {
      id, tipo:'convergencia', ramo:null, anel:99, custo:4 + k, req:[pontas[a], pontas[b]],
      stat, valor:val,
      nome:`Convergência: ${RAMOS[a].nome} & ${RAMOS[b].nome}`,
      desc:`Onde ${cam(a)} encontra ${cam(b)}. Exige o fim dos dois. `
         + `+${val} de ${NOME_STAT[stat]}.`,
      ...posicaoNo(ANG_CONV[k], 0, 0, 0, raioRamos * 1.06),
    };
  });

  /* ULTIMATE / APOCALIPSE — exige as três convergências. É o fim do
     caminho ATUAL, não o fim da progressão: o spec é explícito em que a
     árvore possa crescer, e outro tier entra aqui sem reescrever nada. */
  const convs = Object.keys(nos).filter(k => nos[k].tipo === 'convergencia');
  if (convs.length){
    nos.apocalipse = {
      id:'apocalipse', tipo:'ultimate', ramo:null, anel:99, custo:8, req:convs,
      stat:'hp', valor:60,
      nome:idt.ultimate.nome, desc:idt.ultimate.desc + ' +60 de Vida máxima.',
      ...posicaoNo(90, 0, 0, 0, raioRamos * 1.34),
    };
  }
  return nos;
}

/** Converte (ângulo do ramo, anel) em coordenada relativa ao centro.
 *  `perp` desloca PERPENDICULARMENTE ao eixo do ramo, em pixels, e
 *  `extra` empurra para fora ao longo dele.
 *
 *  O deslocamento é em pixels de propósito. A primeira versão inclinava
 *  em GRAUS, e aí a largura do ramo crescia junto com o raio: no anel 8
 *  da Ophelia — que tem 19 nós no ramo Voz — as folhas abriam tanto que
 *  invadiam o ramo vizinho e a árvore virava um emaranhado. Em pixels o
 *  ramo ocupa um corredor de largura constante, não importa o tamanho. */
function posicaoNo(angBase, anel, passo, perp = 0, extra = 0){
  const a = angBase * Math.PI / 180;
  const r = 46 + anel * passo + extra;
  const ex = Math.cos(a), ey = Math.sin(a);        // eixo do ramo
  return {
    x:Math.round(ex * r - ey * perp),
    y:Math.round(ey * r + ex * perp),
  };
}

const TREES = Object.fromEntries(PARTY_DEFS.map(d => [d.name, construirArvore(d)]));

/* --- Consulta e gasto ---------------------------------------------- */

/** Nós que o personagem recebe de graça (custo 0 e sem requisito). */
const nosGratis = arv => Object.values(arv).filter(n => n.custo === 0 && !n.req.length).map(n => n.id);

const arvoreDe = c => TREES[c.name] || {};
const pontosTotais = c => (c.lvl - 1) * PONTOS_POR_NIVEL + (c.bonusPontos || 0);
function pontosGastos(c){
  const arv = arvoreDe(c);
  return (c.tree || []).reduce((s, id) => s + (arv[id]?.custo || 0), 0);
}
const pontosLivres = c => pontosTotais(c) - pontosGastos(c);

/** O nó pode ser comprado agora? Devolve o motivo quando não. */
function podeAprender(c, id){
  const arv = arvoreDe(c), n = arv[id];
  if (!n) return {ok:false, why:'Nó inexistente.'};
  if ((c.tree || []).includes(id)) return {ok:false, why:'Já aprendido.'};
  const falta = n.req.filter(r => !(c.tree || []).includes(r));
  if (falta.length) return {ok:false, why:`Precisa antes de ${arv[falta[0]].nome}.`};
  if (pontosLivres(c) < n.custo) return {ok:false, why:'Pontos de alma insuficientes.'};
  return {ok:true};
}

/** Compra o nó. Só mexe em `c.tree`; quem traduz isso em habilidade e
 *  atributo é `syncArvore`. */
function aprenderNo(c, id){
  const r = podeAprender(c, id);
  if (!r.ok) return r;
  c.tree = (c.tree || []).concat(id);
  syncArvore(c); recalcStats(c);
  return {ok:true, no:arvoreDe(c)[id]};
}

/** Quem, entre os nós JÁ APRENDIDOS, depende de `id` para existir.
 *  Só olha um nível de dependência de propósito: se A sustenta B e B
 *  sustenta C, remover A é barrado por B, e é B que o jogador tem de
 *  tirar primeiro. Barrar por C daria uma mensagem que não ajuda. */
function dependentesDe(c, id){
  const arv = arvoreDe(c);
  return (c.tree || []).filter(k => k !== id && arv[k] && arv[k].req.includes(id));
}

/** Devolve UM nó e o ponto que ele custou.
 *
 *  A regra do spec §14: um nó não sai enquanto existir outro aprendido
 *  que dependa dele. A alternativa — remover em cascata — devolveria
 *  pontos que o jogador não pediu para devolver, e um toque errado
 *  apagaria meio galho. Quem quer apagar tudo tem o R. */
function removerNo(c, id){
  const arv = arvoreDe(c), n = arv[id];
  if (!n) return {ok:false, why:'Nó inexistente.'};
  if (!(c.tree || []).includes(id)) return {ok:false, why:'Este nó não está aprendido.'};
  if (n.custo === 0 && !n.req.length)
    return {ok:false, why:'Este nó é parte do personagem: não se devolve.'};
  const dep = dependentesDe(c, id);
  if (dep.length)
    return {ok:false, dependentes:dep,
            why:`NÃO É POSSÍVEL REMOVER — ${dep.length} ${
              dep.length === 1 ? 'nó ainda depende' : 'nós ainda dependem'} deste.`};
  c.tree = c.tree.filter(k => k !== id);
  syncArvore(c); recalcStats(c);
  /* Tirar uma passiva de vida pode deixar a vida atual acima do novo
     teto. Sem este corte o personagem andaria com 120/100. */
  c.hp = Math.min(c.hp, c.maxHp); c.mp = Math.min(c.mp, c.maxMp);
  return {ok:true, devolvido:n.custo, no:n};
}

/** Devolve TODOS os pontos gastos. Os nós grátis continuam — devolvê-los
 *  deixaria o personagem sem nenhuma habilidade em combate. */
function redefinirArvore(c){
  const arv = arvoreDe(c);
  const devolvidos = pontosGastos(c);
  c.tree = nosGratis(arv);
  syncArvore(c); recalcStats(c);
  return devolvidos;
}

/** Bônus de atributo somado das passivas e folhas já compradas. */
function treeBonus(c, stat){
  const arv = arvoreDe(c);
  let t = 0;
  for (const id of (c.tree || [])){
    const n = arv[id];
    if (n && n.stat === stat) t += n.valor;
  }
  return t;
}

/** Reconstrói `c.skills` a partir da árvore. É o contrato com o resto do
 *  jogo: combate, IA e menu continuam lendo `c.skills` e não sabem que
 *  uma árvore existe. */
function syncArvore(c){
  const arv = arvoreDe(c);
  if (!Array.isArray(c.tree)) c.tree = [];
  // os grátis entram sempre, inclusive em save antigo e em personagem novo
  for (const id of nosGratis(arv)) if (!c.tree.includes(id)) c.tree.push(id);
  // descarta id que não existe mais (árvore rebalanceada entre versões)
  c.tree = c.tree.filter(id => !!arv[id]);
  c.skills = c.tree.map(id => arv[id]).filter(n => n.tipo === 'skill')
                   .sort((a, b) => a.anel - b.anel)
                   .map(n => n.skill);
}

/* --- Recrutamento --------------------------------------------------
   O jogo começa com UM personagem, escolhido pelo jogador, e o elenco
   se completa entregando missões — cada uma destas traz alguém novo.
   A ordem é de progressão: pátio → salão → subterrâneo → enfermaria →
   Galeria (pós-chefe). Quem vem em cada uma NÃO é fixo na tabela: como
   o protagonista é escolhido, o mapa quest→personagem é montado no
   início do jogo (`montarRecrutas`) e guardado no save, senão o
   escolhido apareceria de novo como recompensa de si mesmo. */
/* A ordem é a de recrutamento: `montarRecrutas` casa o k-ésimo que falta
   com a k-ésima missão daqui. As cinco primeiras são as da academia.

   v5.32 — a lista ENCOLHEU de volta para 7. Ava, Scythe, Orfeu, Abel,
   Amanda, Beatriz, Calder e Carmila saíram de PARTY_DEFS (viraram
   guests-tutoriais ou, no caso da Carmila, saíram do elenco jogável
   sem virar nada) — pedido explícito do usuário. As oito missões que
   os traziam (q_lenhador, q_alquimista, q_coletores, q_serpente,
   q_mumias, q_curador, q_penumbra, q_sanguessuga) continuam no mundo,
   com o mesmo NPC e o mesmo diálogo, mas não recrutam mais ninguém —
   `ver 11-quests.js`: cada uma ganhou um set de equipamento completo
   no lugar do companheiro. Só q_batedora (Madao) e q_carnicais
   (Snoopy) sobreviveram do bloco v5.30/v5.31, porque os dois
   continuam jogáveis. */
const RECRUIT_QUESTS = ['q_zelador', 'q_bibliotecaria', 'q_veterano', 'q_enfermeira', 'q_mercador',
                        'q_batedora', 'q_carnicais'];
/* Quem cura. Se o protagonista não estiver aqui, o primeiro recruta é —
   um começo sem cura nenhuma trava o jogador na primeira região, e a
   primeira missão é justamente a mais fácil de alcançar. */
const CURANDEIROS = ['Ophelia', 'Eden'];

/* --- Raridade e contador de caça (v5.29) ---------------------------
   O contador de caça precisa saber qual é o MELHOR item que uma criatura
   larga, e para isso o jogo precisa saber ordenar raridade. Em vez de
   escrever a raridade item por item em 150 entradas — que envelhece mal,
   porque muda de lugar toda vez que um preço muda — ela é DERIVADA de
   duas coisas que já existem: o preço e o `kind`.

   Consumível e material não passam de `raro` por mais caro que sejam: o
   prêmio no topo de uma tabela de loot tem de ser EQUIPAMENTO, senão a
   Poção Maior vira o item que zera o contador e o Machado de Carvão
   nunca é o alvo de nada. Equipamento, pelo mesmo motivo, começa em
   `raro`.

   Qualquer item pode escrever `rar:` e mandar na regra. */
