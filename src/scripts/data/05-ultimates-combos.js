const ULTIMATES = {
  /* v5.30 — a geração anterior. Nenhuma delas cura: a Ressonância de
     suporte da Eden continua sendo a única, porque duas tirariam o peso
     da escolha de quem levar. */
  'Orfeu Bauss':  {name:'Nada a Dever',     power:104, elem:'none',  target:'one',
            desc:'Vinte anos de treino descontados de uma vez.'},
  'Abel Nomikos': {name:'Última Página',    power:76,  elem:'fire',  target:'all',
            status:{id:'burn',chance:0.6}, desc:'Ele fecha o livro. O resto pega fogo.'},
  Snoopy:  {name:'O Filhote Cresce',  power:92,  elem:'electricity', target:'one',
            status:{id:'stun',chance:0.5}, desc:'Por três segundos, o dragão é adulto.'},
  'Amanda Felt':  {name:'Herança de Lilith',power:88,  elem:'fire',  target:'all',
            status:{id:'burn',chance:0.6}, desc:'Ela para de esconder o que é.'},
  Seiji:   {name:'Códice Sem Fundo',  power:70, elem:'ink',         target:'all',
            desc:'A tinta reescreve o que toca.'},
  Ophelia: {name:'Inverno Absoluto',  power:78, elem:'ice',         target:'all',
            status:{id:'freeze',chance:0.6}, desc:'O ar inteiro vira cristal.'},
  Marin:   {name:'Hora Sem Estrelas', power:95, elem:'darkness',    target:'one',
            desc:'Um instante de nada absoluto.'},
  Gabriel: {name:'Coração da Forja',  power:88, elem:'fire',        target:'one',
            status:{id:'burn',chance:0.8}, desc:'Todo o éter vira combustível.'},
  Max:     {name:'Céu Descendente',   power:72, elem:'electricity', target:'all',
            status:{id:'shock',chance:0.55}, desc:'A tempestade obedece.'},
  /* Única Ressonância de SUPORTE. Numa party de 5 a cura em área vale
     mais que dano justamente porque atinge cinco barras de uma vez. */
  Eden:     {name:'Sopro do Mundo',    power:140, elem:'wind', type:'heal', target:'allies',
            desc:'O ar devolve o que foi tirado.'},
  /* A da Ava é a segunda de suporte, e não repete a da Eden: em vez de
     curar, ela BLINDA — o valor entra como DEF absurda por 3 turnos. */
  'Ava Rosa Groot': {name:'Coração do Bosque', power:0, elem:'earth', type:'buff',
            target:'allies', buff:{def:2.2, atk:1.2, turns:3},
            desc:'O bosque fecha em volta. DEF +120% e ATK +20% por 3 turnos.'},
  Madao:   {name:'Nada a Perder',     power:0, elem:'blood', type:'buff', target:'allies',
            buff:{def:1.9, atk:1.35, turns:3},
            desc:'Ele finalmente levanta. DEF +90% e ATK +35% por 3 turnos.'},
  Scythe:  {name:'Última Colheita',   power:104, elem:'poison', target:'one',
            status:{id:'terror', chance:1}, desc:'Ela termina o brinde.'},
};

/* --- HABILIDADE CONJUNTA -------------------------------------------
   Dois personagens gastam o MESMO turno para soltar um golpe que
   nenhum dos dois tem sozinho. A chave é o PAR DE ELEMENTOS, então a
   pergunta "quem eu ponho em campo" deixa de ser sobre atributos e
   passa a ser sobre combinação — que é a decisão que o jogo já pedia
   pelo anel elemental e nunca cobrava na formação.

   Regras (todas visíveis para o jogador na tela de escolha):
     · os DOIS pagam o custo de MP inteiro;
     · o parceiro PERDE a vez desta rodada (`skipTurn`);
     · cada um só participa de uma Conjunta por rodada (`comboSpent`);
     · o ataque usa a média dos dois ATK — vale a pena juntar quem bate.
   O `poise` alto é de propósito: a Conjunta é a ferramenta desenhada
   para quebrar a postura de chefe. Ver POISE, seção 10.

   A chave é o par ORDENADO alfabeticamente, para 'fire+ice' e
   'ice+fire' caírem na mesma entrada. */
const comboKey = (a, b) => [a, b].sort().join('+');

const COMBOS = {
  [comboKey('fire','ice')]: {name:'Choque Térmico', power:88, elem:'none', target:'all',
    cost:18, poise:1.8, desc:'Brasa e geada no mesmo ponto. A matéria não decide e racha.'},
  [comboKey('fire','darkness')]: {name:'Fogo Negro', power:78, elem:'fire', target:'one',
    cost:16, poise:1.9, status:{id:'burn',chance:0.7}, desc:'Uma chama que não ilumina nada.'},
  [comboKey('fire','ink')]: {name:'Escrita em Brasa', power:74, elem:'fire', target:'one',
    cost:15, poise:1.7, status:{id:'blind',chance:0.6}, desc:'O nome do alvo queima antes dele.'},
  [comboKey('fire','electricity')]: {name:'Forja Voltaica', power:92, elem:'fire', target:'one',
    cost:20, poise:2.1, status:{id:'burn',chance:0.55}, desc:'Metal branco. Bate como bigorna.'},
  [comboKey('fire','wind')]: {name:'Tempestade de Brasas', power:66, elem:'fire', target:'all',
    cost:19, poise:1.6, status:{id:'burn',chance:0.5}, desc:'O vento não apaga: espalha.'},
  [comboKey('darkness','ice')]: {name:'Inverno Cego', power:70, elem:'ice', target:'all',
    cost:20, poise:1.7, status:{id:'freeze',chance:0.45}, desc:'Frio sem estrela nenhuma em cima.'},
  [comboKey('ice','ink')]: {name:'Cristal de Nanquim', power:76, elem:'ice', target:'one',
    cost:16, poise:1.8, status:{id:'blind',chance:0.55}, desc:'A tinta congela no meio da frase.'},
  [comboKey('electricity','ice')]: {name:'Granizo Condutor', power:68, elem:'ice', target:'all',
    cost:19, poise:1.7, status:{id:'shock',chance:0.45}, desc:'Cada pedra de gelo puxa um raio.'},
  [comboKey('ice','wind')]: {name:'Ventania Polar', power:64, elem:'ice', target:'all',
    cost:18, poise:1.6, status:{id:'exposed',chance:0.5}, desc:'Corta a guarda e congela o que sobrou.'},
  [comboKey('darkness','ink')]: {name:'Nome Apagado', power:104, elem:'ink', target:'one',
    cost:22, poise:2.3, status:{id:'blind',chance:0.65}, desc:'Não fere o corpo. Fere o registro.'},
  [comboKey('darkness','electricity')]: {name:'Relâmpago Sem Luz', power:96, elem:'darkness', target:'one',
    cost:21, poise:2.0, status:{id:'dread',chance:0.6}, desc:'O trovão vem primeiro. Nada vem depois.'},
  [comboKey('darkness','wind')]: {name:'Sopro do Vazio', power:66, elem:'darkness', target:'all',
    cost:20, poise:1.7, status:{id:'dread',chance:0.5}, desc:'O ar sai da sala e leva a coragem junto.'},
  [comboKey('electricity','ink')]: {name:'Circuito de Tinta', power:70, elem:'electricity', target:'all',
    cost:19, poise:1.7, status:{id:'shock',chance:0.5}, desc:'A tinta vira trilha e a trilha conduz.'},
  [comboKey('ink','wind')]: {name:'Página ao Vento', power:62, elem:'ink', target:'all',
    cost:17, poise:1.5, status:{id:'exposed',chance:0.55}, desc:'Mil folhas afiadas passando de uma vez.'},
  [comboKey('electricity','wind')]: {name:'Ciclone Voltaico', power:72, elem:'electricity', target:'all',
    cost:21, poise:1.8, status:{id:'shock',chance:0.5}, desc:'O ciclone recolhe o raio e devolve inteiro.'},

  /* v5.1 — Terra e Veneno entram no elenco, e a tabela é por PAR de
     elementos: com 8 elementos jogáveis são 28 pares, então faltavam
     estes 13. Um par sem entrada não quebra nada — a Conjunta
     simplesmente não aparece para aquela dupla — e é exatamente por
     isso que precisa de teste: o buraco é silencioso. */
  [comboKey('earth','fire')]: {name:'Vidro de Fornalha', power:86, elem:'earth', target:'one',
    cost:19, poise:2.0, status:{id:'burn',chance:0.5}, desc:'Areia entra, lâmina sai.'},
  [comboKey('earth','ice')]: {name:'Permafrost', power:70, elem:'earth', target:'all',
    cost:20, poise:1.9, status:{id:'freeze',chance:0.45}, desc:'O chão fecha e não abre mais.'},
  [comboKey('darkness','earth')]: {name:'Cova Rasa', power:92, elem:'earth', target:'one',
    cost:21, poise:2.1, status:{id:'dread',chance:0.55}, desc:'Do tamanho exato, e já estava pronta.'},
  [comboKey('earth','ink')]: {name:'Lápide', power:88, elem:'ink', target:'one',
    cost:20, poise:2.2, status:{id:'blind',chance:0.5}, desc:'O nome entra na pedra e para de andar.'},
  [comboKey('earth','electricity')]: {name:'Para-Raios', power:78, elem:'electricity', target:'all',
    cost:20, poise:1.8, status:{id:'shock',chance:0.55}, desc:'A terra chama o raio e reparte.'},
  [comboKey('earth','wind')]: {name:'Tempestade de Areia', power:64, elem:'earth', target:'all',
    cost:18, poise:1.6, status:{id:'exposed',chance:0.55}, desc:'Ninguém enxerga e todo mundo sangra.'},
  [comboKey('earth','poison')]: {name:'Terra Morta', power:74, elem:'poison', target:'all',
    cost:22, poise:1.7, status:{id:'terror',chance:0.35}, desc:'Nada cresce aqui por três estações.'},

  [comboKey('fire','poison')]: {name:'Fogo-Fátuo', power:84, elem:'poison', target:'one',
    cost:19, poise:1.9, status:{id:'burn',chance:0.6}, desc:'O veneno pega fogo antes de fazer efeito.'},
  [comboKey('ice','poison')]: {name:'Geada Séptica', power:72, elem:'poison', target:'all',
    cost:20, poise:1.7, status:{id:'freeze',chance:0.4}, desc:'Congela devagar, e por dentro.'},
  [comboKey('darkness','poison')]: {name:'Taça Vazia', power:98, elem:'poison', target:'one',
    cost:23, poise:2.2, status:{id:'terror',chance:0.5}, desc:'Ela brinda, e a sombra bebe junto.'},
  [comboKey('ink','poison')]: {name:'Sentença', power:90, elem:'ink', target:'one',
    cost:21, poise:2.1, status:{id:'terror',chance:0.45}, desc:'Escrita, lida em voz alta e cumprida.'},
  [comboKey('electricity','poison')]: {name:'Peçonha Condutora', power:76, elem:'poison', target:'all',
    cost:20, poise:1.8, status:{id:'shock',chance:0.5}, desc:'O veneno corre mais rápido no nervo aceso.'},
  [comboKey('poison','wind')]: {name:'Miasma', power:66, elem:'poison', target:'all',
    cost:19, poise:1.6, status:{id:'terror',chance:0.35}, desc:'O vento leva, e o que ele leva não volta.'},
  /* ============ v5.30: os três elementos que entraram ===============
     `none`, `light` e `blood` chegaram com o Orfeu, o Snoopy e a Amanda,
     e cada elemento novo custa uma Conjunta com TODOS os outros — foi de
     28 para 55. O autoteste cobra o par completo de propósito: uma
     dupla sem Conjunta é uma dupla que o jogo silenciosamente pune.

     A gramática dos três:
       · `none` (Éter cru) — não soma efeito, MULTIPLICA. Quebra postura.
       · `light` — expõe e atordoa; é a que abre o inimigo para os outros.
       · `blood` — drena. Toda Conjunta de sangue devolve vida. ====== */

  // --- Éter cru: o golpe que não vira elemento nenhum ---
  [comboKey('none','ink')]: {name:'Palavra Sem Tinta', power:80, elem:'none', target:'one',
    cost:16, poise:2.2, desc:'Ele apaga o nome sem escrever nada por cima.'},
  [comboKey('none','ice')]: {name:'Frio Sem Gelo', power:82, elem:'none', target:'one',
    cost:17, poise:2.1, status:{id:'freeze',chance:0.45}, desc:'A temperatura cai e não há de quê.'},
  [comboKey('none','darkness')]: {name:'Sombra Oca', power:84, elem:'none', target:'one',
    cost:17, poise:2.0, status:{id:'dread',chance:0.5}, desc:'Uma sombra sem nada que a projete.'},
  [comboKey('none','fire')]: {name:'Combustão Seca', power:90, elem:'none', target:'one',
    cost:19, poise:2.3, status:{id:'burn',chance:0.5}, desc:'Queima sem chama. Só o resultado.'},
  [comboKey('none','electricity')]: {name:'Descarga Muda', power:88, elem:'none', target:'one',
    cost:18, poise:2.2, status:{id:'shock',chance:0.5}, desc:'O raio chega antes do barulho e sem ele.'},
  [comboKey('none','wind')]: {name:'Ar Parado', power:76, elem:'none', target:'all',
    cost:20, poise:1.8, status:{id:'exposed',chance:0.55}, desc:'O vento para, e o que estava nele continua.'},
  [comboKey('none','earth')]: {name:'Peso Puro', power:94, elem:'none', target:'one',
    cost:20, poise:2.6, status:{id:'rooted',chance:0.5}, desc:'Não é pedra. É só o que a pedra faz.'},
  [comboKey('none','poison')]: {name:'Veneno Sem Nome', power:78, elem:'none', target:'one',
    cost:17, poise:1.9, status:{id:'terror',chance:0.4}, desc:'Nenhum antídoto porque não é nada.'},

  // --- Luz: abre o inimigo para quem vier depois ---
  [comboKey('light','ink')]: {name:'Página Iluminada', power:76, elem:'light', target:'one',
    cost:16, poise:1.8, status:{id:'blind',chance:0.6}, desc:'Tanta luz na folha que ninguém lê.'},
  [comboKey('light','ice')]: {name:'Prisma de Geada', power:80, elem:'light', target:'all',
    cost:19, poise:1.7, status:{id:'freeze',chance:0.4}, desc:'A luz atravessa o gelo e sai multiplicada.'},
  [comboKey('light','darkness')]: {name:'Eclipse Partido', power:98, elem:'light', target:'one',
    cost:22, poise:2.4, status:{id:'stun',chance:0.45}, desc:'Os dois se anulam em cima do alvo, não antes.'},
  [comboKey('light','fire')]: {name:'Aurora de Brasa', power:86, elem:'light', target:'all',
    cost:20, poise:1.9, status:{id:'burn',chance:0.5}, desc:'O amanhecer que a Mata Cindária nunca teve.'},
  [comboKey('light','electricity')]: {name:'Relâmpago Branco', power:92, elem:'light', target:'one',
    cost:20, poise:2.2, status:{id:'stun',chance:0.4}, desc:'Clarão sem trovão. O trovão fica devendo.'},
  [comboKey('light','wind')]: {name:'Vento de Meio-Dia', power:74, elem:'light', target:'all',
    cost:19, poise:1.6, status:{id:'exposed',chance:0.6}, desc:'Sopra a sombra de cima de todo mundo.'},
  [comboKey('light','earth')]: {name:'Cristal Solar', power:88, elem:'light', target:'one',
    cost:21, poise:2.5, desc:'A pedra guarda o dia inteiro e devolve num segundo.'},
  [comboKey('light','poison')]: {name:'Assepsia', power:82, elem:'light', target:'all',
    cost:20, poise:1.8, status:{id:'terror',chance:0.35}, desc:'Limpa o que estava vivo junto com o que não estava.'},
  [comboKey('light','none')]: {name:'Clareza', power:96, elem:'light', target:'one',
    cost:22, poise:2.6, status:{id:'exposed',chance:0.7}, desc:'Ver a coisa como ela é já basta para quebrá-la.'},

  // --- Sangue: toda Conjunta daqui devolve vida ---
  [comboKey('blood','ink')]: {name:'Assinatura', power:78, elem:'blood', target:'one',
    cost:17, poise:1.9, drain:0.4, status:{id:'bleed',chance:0.55}, desc:'Assina com o que o alvo tinha dentro.'},
  [comboKey('blood','ice')]: {name:'Coágulo', power:80, elem:'blood', target:'one',
    cost:18, poise:2.0, drain:0.35, status:{id:'freeze',chance:0.4}, desc:'Congela na veia, não na pele.'},
  [comboKey('blood','darkness')]: {name:'Herança Negra', power:90, elem:'blood', target:'one',
    cost:20, poise:2.1, drain:0.45, status:{id:'dread',chance:0.5}, desc:'A linhagem dela não pede licença.'},
  [comboKey('blood','fire')]: {name:'Ferro em Brasa', power:88, elem:'blood', target:'one',
    cost:20, poise:2.2, drain:0.35, status:{id:'burn',chance:0.55}, desc:'Cauteriza e cobra pelo serviço.'},
  [comboKey('blood','electricity')]: {name:'Pulso Roubado', power:86, elem:'blood', target:'one',
    cost:19, poise:2.0, drain:0.4, status:{id:'shock',chance:0.45}, desc:'O coração do alvo bate para outra pessoa.'},
  [comboKey('blood','wind')]: {name:'Névoa Escarlate', power:72, elem:'blood', target:'all',
    cost:20, poise:1.7, drain:0.3, status:{id:'bleed',chance:0.45}, desc:'O ar fica com gosto de metal.'},
  [comboKey('blood','earth')]: {name:'Raiz Vermelha', power:84, elem:'blood', target:'one',
    cost:20, poise:2.4, drain:0.35, status:{id:'rooted',chance:0.5}, desc:'A terra bebe primeiro e devolve depois.'},
  [comboKey('blood','poison')]: {name:'Transfusão Errada', power:82, elem:'blood', target:'one',
    cost:19, poise:1.8, drain:0.5, status:{id:'terror',chance:0.4}, desc:'Troca o que corre dentro por outra coisa.'},
  [comboKey('blood','none')]: {name:'Direito de Sangue', power:100, elem:'blood', target:'one',
    cost:23, poise:2.7, drain:0.45, desc:'Sem elemento e sem cerimônia: ela cobra e leva.'},
  [comboKey('blood','light')]: {name:'Coroa Rubra', power:94, elem:'blood', target:'all',
    cost:24, poise:2.0, drain:0.35, status:{id:'dread',chance:0.5}, desc:'Dourado por fora. O que escorre não é.'},

};

/** A Conjunta possível entre dois combatentes (ou null). */
function comboOf(a, b){
  if (!a || !b || a === b) return null;
  return COMBOS[comboKey(a.element, b.element)] || null;
}
/** Custo de MP da Conjunta PARA ESTA PESSOA (o Sino de Sintonia desconta). */
function comboCost(u, C){
  if (!C) return 0;
  return Math.max(1, C.cost + (u?.gear ? gearBonus(u, 'combo') : 0));
}

/* --- PETS (v4.9) ----------------------------------------------------
   Um bicho acompanha o grupo, ganha EXP junto, EVOLUI em três formas e,
   de vez em quando, se mete na luta sozinho.

   Três decisões de projeto que valem estar escritas:

   1. SÓ UM ATIVO POR VEZ. Ter seis pets agindo todo turno viraria ruído
      e destruiria o balanceamento medido do combate. Um só transforma
      "qual pet levar" numa escolha de verdade, do mesmo naipe que
      "quem entra no grupo".

   2. ELE AGE SOZINHO, e não como um comando. O pet não é um sétimo
      personagem — é uma intervenção. Isso mantém a ordem de turno e a
      vazão de dano por rodada praticamente intactas, que é o que o
      bestiário inteiro foi calibrado em cima.

   3. O DONO IMPORTA, MAS NÃO TRANCA. Com o dono em campo o pet bate
      mais forte (`BONUS_DONO`); sem ele, ainda age. Recompensar é
      melhor que punir — bloquear faria o jogador só levar o pet do
      líder e o resto viraria decoração.

   Cada forma pode mudar de PAPEL (`tipo`), não só de número: é o que
   faz evoluir parecer diferente em vez de parecer um upgrade. */
