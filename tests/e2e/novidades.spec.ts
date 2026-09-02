import { test, expect, type Page } from '@playwright/test';
declare const G: any; declare const Title: any; declare const Escolha: any;
declare const PARTY_DEFS: any[]; declare const RECRUIT_QUESTS: string[];
declare const CURANDEIROS: string[];
declare const Tela: any; declare const UI: any; declare const LADO_CONFORTO: any;
declare const Menu: any; declare const TREES: any; declare const PONTOS_POR_NIVEL: number;
declare function recrutasDaQuest(v: any): any[];
declare function benchChars(): any[];
declare function montarRecrutas(inicial: string): any;
declare function montarRecrutasDoQueFalta(jaTem: string[], quests: any): any;
declare function arvoreDe(c: any): any;
declare function pontosLivres(c: any): number;

const URL = process.env.ETER_URL ?? 'https://eter.denverso.com/';

/* Cobre o que o autoteste do próprio jogo não alcança: as funções de
   recrutamento (montarRecrutas, montarRecrutasDoQueFalta, recrutasDaQuest,
   benchChars), os objetos de tela (Tela, UI, LADO_CONFORTO) e a árvore de
   habilidades vista pelo MENU — que é canvas, e por isso só um teclado de
   verdade prova que ela abre e responde.

   Nenhuma contagem aqui é escrita à mão. O elenco era de seis e as missões de
   recrutamento eram cinco; na 5.1.0 passaram a oito e sete, e cada `5` fixo
   deste arquivo virou falha de teste sem que houvesse defeito nenhum no jogo.
   Os números saem de PARTY_DEFS e de RECRUIT_QUESTS, então o próximo
   personagem entra sem mexer aqui de novo. */

async function ate(p: Page, tecla: string, alvo: string, n = 20) {
  for (let i = 0; i < n; i += 1) {
    if ((await p.evaluate(() => String(G?.scene ?? ''))) === alvo) return true;
    await p.keyboard.press(tecla); await p.waitForTimeout(220);
  }
  return false;
}

/* O jogo lê a tecla como "apertada neste quadro" e limpa no fim do quadro: um
   toque solto logo depois de uma troca de cena cai entre quadros e some.
   Insistir até o estado mudar é o que um jogador faz. */
async function insistir(p: Page, tecla: string, mudou: () => Promise<boolean>, tentativas = 12) {
  for (let i = 0; i < tentativas; i += 1) {
    if (await mudou()) return true;
    await p.keyboard.press(tecla); await p.waitForTimeout(200);
  }
  return mudou();
}

async function novoJogoCom(page: Page, indice: number) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof G !== 'undefined' && !!G.scene, undefined, { timeout: 20000 });
  // Cada chamada precisa de um slot vazio de verdade — zera o navegador
  // em vez de reaproveitar um save deixado por uma chamada anterior.
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof G !== 'undefined' && !!G.scene, undefined, { timeout: 20000 });
  await page.waitForFunction(() => G.scene === 'TITLE', undefined, { timeout: 15000 });
  const slots = await page.evaluate(() => Title.slots());
  const vazio = slots.findIndex((s: any) => s.vazio);
  expect(vazio, 'precisa existir um slot vazio para Novo Jogo').toBeGreaterThanOrEqual(0);
  await page.evaluate(i => { Title.cur.i = i; }, vazio);
  expect(await ate(page, 'z', 'CHOOSE'), 'chegar à escolha').toBeTruthy();
  await page.evaluate(k => { Escolha.cur.i = k; }, indice);
  const nome = await page.evaluate(() => PARTY_DEFS[Escolha.cur.i].name);
  expect(await ate(page, 'z', 'FIELD'), `entrar em campo como ${nome}`).toBeTruthy();
  let estavel = 0;
  await page.keyboard.down('Shift');
  try {
    for (let i = 0; i < 120; i += 1) {
      const cena = await page.evaluate(() => String(G.scene));
      if (cena === 'DIALOGUE') {
        estavel = 0;
        await page.keyboard.press('z');
      } else if (cena === 'FIELD') {
        estavel += 1;
        if (estavel >= 8) break;
      } else {
        estavel = 0;
      }
      await page.waitForTimeout(250);
    }
  } finally {
    await page.keyboard.up('Shift');
  }
  expect(await page.evaluate(() => String(G.scene)), `${nome}: prólogo encerra em campo`).toBe('FIELD');
  return nome;
}

/* O mapa vive em G.recruits e é sorteado por protagonista. A razão está no
   próprio código: sem isso "o escolhido apareceria de novo como recompensa de
   si mesmo". Vale para o elenco inteiro, seja ele de que tamanho for. */
test('o mapa de recrutas é válido para qualquer protagonista', async ({ page }) => {
  const relato: any[] = [];
  const primeiro = await novoJogoCom(page, 0);
  const elenco = await page.evaluate(() => PARTY_DEFS.length);
  expect(elenco, 'o elenco precisa ofertar mais de um protagonista').toBeGreaterThan(1);

  for (let i = 0; i < elenco; i += 1) {
    const nome = i === 0 ? primeiro : await novoJogoCom(page, i);
    const r = await page.evaluate(() => ({
      mapa: { ...(G.recruits ?? {}) },
      elenco: G.party.map((c: any) => c.name),
      quests: [...RECRUIT_QUESTS],
      curandeiros: [...CURANDEIROS],
      todos: PARTY_DEFS.map((d: any) => d.name),
    }));
    const recrutas = Object.values(r.mapa).flatMap((v: any) => Array.isArray(v) ? v : [v]);
    relato.push({ protagonista: nome, mapa: r.mapa });

    expect(r.elenco, `${nome}: começa sozinho`).toEqual([nome]);
    expect(recrutas, `${nome} não pode ser recompensa de si mesmo`).not.toContain(nome);
    expect(new Set(recrutas).size, `${nome}: nenhum recruta repetido`).toBe(recrutas.length);
    expect(new Set([nome, ...recrutas]).size, `${nome}: elenco inteiro alcançável`).toBe(r.todos.length);
    /* Uma missão de recrutamento por pessoa que não é o protagonista: se as
       duas listas saírem de sincronia, alguém do elenco fica inalcançável. */
    expect(r.quests.length, `${nome}: uma missão para cada recruta`).toBe(r.todos.length - 1);

    if (!r.curandeiros.includes(nome)) {
      expect(r.curandeiros, `${nome} começa sem cura: o primeiro recruta precisa curar`)
        .toContain(r.mapa[r.quests[0]]);
    }
  }
  console.log(JSON.stringify(relato, null, 1));
});

test('reserva, normalizador, remontagem e objetos de tela respondem', async ({ page }) => {
  await novoJogoCom(page, 0);
  const r = await page.evaluate(() => {
    const jaTem = G.party.map((c: any) => c.name);
    return {
      reservaComUm: benchChars().map((c: any) => c.name),
      // recrutasDaQuest normaliza valor único, lista e ausência.
      norm: { vazio: recrutasDaQuest(null), um: recrutasDaQuest('Eden'), lista: recrutasDaQuest(['A', 'B']) },
      // Remontagem para save antigo: nada entregue ainda, então todas as missões estão livres.
      remontado: montarRecrutasDoQueFalta(jaTem, {}),
      // Mesmo mapa que o início produz, para o protagonista atual.
      direto: montarRecrutas(jaTem[0]),
      missoes: RECRUIT_QUESTS.length,
      tela: { tipo: typeof Tela, chaves: Object.keys(Tela ?? {}).length },
      ui: { tipo: typeof UI, chaves: Object.keys(UI ?? {}).length },
      ladoConforto: LADO_CONFORTO,
    };
  });
  console.log(JSON.stringify(r, null, 1));

  expect(r.reservaComUm, 'com elenco de um a reserva é vazia').toHaveLength(0);
  expect(r.norm.vazio, 'ausência vira lista vazia').toEqual([]);
  expect(r.norm.um, 'valor único vira lista de um').toEqual(['Eden']);
  expect(r.norm.lista, 'lista é preservada').toEqual(['A', 'B']);
  expect(Object.keys(r.remontado), 'remontagem cobre todas as missões').toHaveLength(r.missoes);
  expect(Object.keys(r.direto), 'montagem direta cobre todas as missões').toHaveLength(r.missoes);
  expect(r.tela.tipo, 'Tela precisa existir').toBe('object');
  expect(r.ui.tipo, 'UI precisa existir').toBe('object');
  expect(typeof r.ladoConforto, 'LADO_CONFORTO precisa ser número').toBe('number');
});

/* A árvore da 5.0 trocou a habilidade que caía por nível por gasto de ponto de
   alma. O autoteste do jogo cobre a GERAÇÃO da árvore — nada órfão, nada
   inalcançável, save antigo que migra. O que ele não alcança é o caminho do
   jogador: abrir o menu, entrar na página, mover o cursor pelo grafo, comprar e
   redefinir com o teclado. É canvas, não existe seletor para nó de árvore, então
   aqui se comanda por tecla e se observa por estado do jogo. */
test('a árvore de habilidades abre pelo menu e responde ao teclado', async ({ page }) => {
  await novoJogoCom(page, 0);

  await insistir(page, 'c', async () => (await page.evaluate(() => String(G.scene))) === 'MENU');
  expect(await page.evaluate(() => String(G.scene)), 'o menu abre por tecla').toBe('MENU');

  await page.evaluate(() => {
    Menu.page = 'root';
    Menu.cur.root.i = Menu.ROOT.findIndex((i: any) => i.id === 'skills');
  });
  await insistir(page, 'z', async () => (await page.evaluate(() => String(Menu.page))) === 'skills');
  expect(await page.evaluate(() => String(Menu.page)), 'a página da árvore abre').toBe('skills');

  const inicio = await page.evaluate(() => {
    const c = G.party[Menu.cur.treeWho.i % G.party.length];
    return {
      nome: c.name,
      nos: Object.keys(arvoreDe(c)).length,
      skills: c.skills.length,
      pontosPorNivel: PONTOS_POR_NIVEL,
      comArvore: PARTY_DEFS.filter((d: any) => Object.keys(TREES[d.name] ?? {}).length > 0).length,
      elenco: PARTY_DEFS.length,
    };
  });
  console.log(JSON.stringify(inicio, null, 1));
  expect(inicio.comArvore, 'todo personagem do elenco tem árvore').toBe(inicio.elenco);
  expect(inicio.nos, 'a árvore do personagem não pode estar vazia').toBeGreaterThan(1);
  expect(inicio.skills, 'ninguém entra em combate sem o que apertar').toBeGreaterThanOrEqual(2);

  /* O cursor anda pela GEOMETRIA do grafo, não por índice de lista. O que
     precisa valer sempre é que ele pare num nó que existe. */
  const antes = await page.evaluate(() => Menu.cur.tree.i);
  const andou = await insistir(page, 'ArrowDown',
    async () => (await page.evaluate(() => Menu.cur.tree.i)) !== antes, 6);
  const emNoReal = await page.evaluate(() => {
    const c = G.party[Menu.cur.treeWho.i % G.party.length];
    const lista = Object.keys(arvoreDe(c)).sort();
    return !!arvoreDe(c)[lista[Menu.cur.tree.i % lista.length]];
  });
  expect(emNoReal, 'o cursor sempre para num nó que existe').toBeTruthy();
  console.log(`cursor_moveu=${andou}`);

  /* Compra. Os pontos entram por `bonusPontos`, o mesmo campo que o save usa,
     para o teste não precisar moer combate até subir de nível. */
  const alvo = await page.evaluate(() => {
    const c = G.party[Menu.cur.treeWho.i % G.party.length];
    c.bonusPontos = 99;
    const arv = arvoreDe(c);
    const n: any = Object.values(arv).find((no: any) =>
      no.tipo === 'skill' && !no.inicial && no.req.every((r: string) => c.tree.includes(r)));
    Menu.cur.tree.i = Object.keys(arv).sort().indexOf(n.id);
    return { id: n.id, nome: n.nome, skill: n.skill, custo: n.custo,
             livres: pontosLivres(c), skills: c.skills.length };
  });

  await insistir(page, 'z', async () => page.evaluate(
    id => G.party[Menu.cur.treeWho.i % G.party.length].tree.includes(id), alvo.id), 6);
  const comprado = await page.evaluate(id => {
    const c = G.party[Menu.cur.treeWho.i % G.party.length];
    return { tem: c.tree.includes(id), livres: pontosLivres(c), skills: c.skills.slice() };
  }, alvo.id);

  expect(comprado.tem, `comprar ${alvo.nome} com Z`).toBeTruthy();
  expect(comprado.livres, 'a compra debita exatamente o custo').toBe(alvo.livres - alvo.custo);
  expect(comprado.skills, 'a habilidade comprada entra no repertório').toContain(alvo.skill);

  /* Redefinir pede R duas vezes: o primeiro toque só arma a janela, e é isso
     que impede um toque errado de apagar um build de trinta níveis. */
  await page.keyboard.press('r'); await page.waitForTimeout(240);
  expect(await page.evaluate(() => Menu.resetArm > 0), 'o primeiro R apenas arma').toBeTruthy();
  expect(await page.evaluate(id => G.party[Menu.cur.treeWho.i % G.party.length].tree.includes(id), alvo.id),
    'o primeiro R não devolve nada').toBeTruthy();

  await page.keyboard.press('r'); await page.waitForTimeout(340);
  const depois = await page.evaluate(id => {
    const c = G.party[Menu.cur.treeWho.i % G.party.length];
    return { tem: c.tree.includes(id), skills: c.skills.length, livres: pontosLivres(c) };
  }, alvo.id);
  expect(depois.tem, 'o segundo R devolve os pontos').toBeFalsy();
  expect(depois.livres, 'redefinir devolve exatamente o que foi gasto').toBe(alvo.livres);
  expect(depois.skills, 'redefinir não deixa o personagem mudo em combate').toBeGreaterThanOrEqual(2);

  // X devolve ao menu principal, não para fora do jogo.
  await insistir(page, 'x', async () => (await page.evaluate(() => String(Menu.page))) === 'root', 6);
  expect(await page.evaluate(() => String(Menu.page)), 'X volta para o menu').toBe('root');
  expect(await page.evaluate(() => String(G.scene)), 'e continua no menu, não fora dele').toBe('MENU');
});
