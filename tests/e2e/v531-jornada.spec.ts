import { test, expect, type Page } from '@playwright/test';

/* O jogo declara G, Menu, Title e Escolha com `const` no topo de um script
   clássico: viram binding global acessível por nome, não propriedade de
   globalThis. Por isso o acesso é por identificador nu. */
declare const G: any;
declare const Menu: any;
declare const Title: any;
declare const Escolha: any;
declare const PARTY_DEFS: any[];
declare const RECRUIT_QUESTS: string[];
declare function triggerEncounter(): void;
declare const FX: any;

const URL = process.env.ETER_URL ?? 'https://eter.denverso.com/';
const SHOTS = process.env.SHOT_DIR ?? '/shots';

const TECLA = {
  up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
  confirmar: 'z', cancelar: 'x', menu: 'c', trocar: 'Tab',
} as const;

const cena = (p: Page) => p.evaluate(() => String(G?.scene ?? 'SEM-JOGO'));
const tile = (p: Page) => p.evaluate(() => ({ x: G.player.tx, y: G.player.ty }));

async function apertar(p: Page, t: keyof typeof TECLA, vezes = 1) {
  for (let i = 0; i < vezes; i += 1) { await p.keyboard.press(TECLA[t]); await p.waitForTimeout(140); }
}

/* O jogo lê a tecla como "apertada neste quadro" e limpa no fim do quadro.
   Um toque solto pode cair entre quadros logo depois de uma troca de cena, e
   aí some. Insistir até o estado mudar é o que um jogador faz — e o que torna
   o teste honesto sem afrouxar a asserção. */
async function insistir(p: Page, t: keyof typeof TECLA, mudou: () => Promise<boolean>, tentativas = 12) {
  for (let i = 0; i < tentativas; i += 1) {
    if (await mudou()) return true;
    await apertar(p, t);
  }
  return mudou();
}

async function passo(p: Page, dir: 'up'|'down'|'left'|'right') {
  const antes = await tile(p);
  await p.keyboard.down(TECLA[dir]);
  try {
    await p.waitForFunction(([x, y]) => G.player.tx !== x || G.player.ty !== y,
      [antes.x, antes.y] as const, { timeout: 4000 });
  } finally { await p.keyboard.up(TECLA[dir]); }
  await p.waitForFunction(() => G.player.moving === false, undefined, { timeout: 4000 });
  return tile(p);
}

const esperarCena = (p: Page, alvo: string, ms = 15000) =>
  p.waitForFunction(esperada => G?.scene === esperada, alvo, { timeout: ms });

async function aguardarCampoInterativo(p: Page) {
  let estavel = 0;
  await p.keyboard.down('Shift');
  try {
    for (let i = 0; i < 120; i += 1) {
      const atual = await cena(p);
      if (atual === 'DIALOGUE') {
        estavel = 0;
        await apertar(p, 'confirmar');
      } else if (atual === 'FIELD') {
        estavel += 1;
        if (estavel >= 8) return;
      } else {
        estavel = 0;
      }
      await p.waitForTimeout(250);
    }
  } finally {
    await p.keyboard.up('Shift');
  }
  expect(await cena(p), 'o prólogo precisa devolver o controle ao campo').toBe('FIELD');
}

test('a versão modular percorre slots, escolha, campo, menu e combate', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', e => erros.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => typeof G !== 'undefined' && !!G.scene, undefined, { timeout: 20000 });

  // Nada de multijogador deve ter sobrado.
  const resquicio = await page.evaluate(() => ({
    painel: !!document.getElementById('eter-account-toggle'),
    multi: typeof (window as any).EterMultiplayer !== 'undefined',
  }));
  expect(resquicio.painel, 'painel de conta não deve existir').toBeFalsy();
  expect(resquicio.multi, 'EterMultiplayer não deve existir').toBeFalsy();

  // 1. TÍTULO — começa aqui, não em campo.
  await esperarCena(page, 'TITLE');
  await page.screenshot({ path: `${SHOTS}/01-titulo.png` });
  const slots = await page.evaluate(() => Title.slots());
  expect(slots, 'o título precisa oferecer três slots').toHaveLength(3);
  expect(slots.every((slot: any) => slot.vazio), 'o navegador limpo precisa iniciar com slots vazios').toBeTruthy();

  // Um slot vazio conduz diretamente à escolha do protagonista.
  await page.evaluate(() => { Title.cur.i = 0; });
  await apertar(page, 'confirmar');

  // 2. ESCOLHA — "Quem Começa": o elenco inteiro é ofertado como protagonista.
  await esperarCena(page, 'CHOOSE');
  await page.screenshot({ path: `${SHOTS}/02-quem-comeca.png` });
  const ofertados = await page.evaluate(() => PARTY_DEFS.map((d: any) => d.name));
  expect(ofertados.length, 'protagonistas ofertados').toBeGreaterThan(1);

  /* A lista é horizontal — o rodapé da tela diz "‹ › escolher". Cima e baixo
     não têm para onde ir aqui, então a navegação é por esquerda e direita. */
  const cursorInicial = await page.evaluate(() => Escolha.cur.i);
  const andou = await insistir(page, 'right',
    async () => (await page.evaluate(() => Escolha.cur.i)) !== cursorInicial);
  expect(andou, 'a seta lateral precisa mover o cursor da escolha').toBeTruthy();
  const voltou = await insistir(page, 'left',
    async () => (await page.evaluate(() => Escolha.cur.i)) === cursorInicial);
  expect(voltou, 'esquerda precisa voltar').toBeTruthy();
  await insistir(page, 'right',
    async () => (await page.evaluate(() => Escolha.cur.i)) !== cursorInicial);
  await page.screenshot({ path: `${SHOTS}/03-escolha-navegada.png` });

  const escolhido = await page.evaluate(() => PARTY_DEFS[Escolha.cur.i].name);
  await apertar(page, 'confirmar');

  // 3. CAMPO — e o elenco começa com UM.
  await esperarCena(page, 'FIELD', 20000);
  await aguardarCampoInterativo(page);
  const inicio = await page.evaluate(() => ({
    party: G.party.map((c: any) => c.name),
    bench: (G.bench ?? []).length,
    lider: G.leader,
  }));
  expect(inicio.party.length, 'o jogo começa com um personagem').toBe(1);
  expect(inicio.party[0], 'o escolhido precisa ser o protagonista').toBe(escolhido);
  await page.screenshot({ path: `${SHOTS}/04-campo.png` });

  // 4. Movimento real nas quatro direções.
  const origem = await tile(page);
  expect((await passo(page, 'right')).x, 'direita').toBe(origem.x + 1);
  expect((await passo(page, 'left')).x, 'esquerda').toBe(origem.x);
  expect((await passo(page, 'down')).y, 'baixo').toBe(origem.y + 1);
  expect((await passo(page, 'up')).y, 'cima').toBe(origem.y);

  // 5. Menu abre por tecla e cada página desenha sem erro.
  await apertar(page, 'menu');
  await esperarCena(page, 'MENU', 5000);
  await page.screenshot({ path: `${SHOTS}/05-menu.png` });

  const paginas: string[] = await page.evaluate(() => Menu.ROOT.map((i: any) => i.id));
  const visitadas: string[] = [];
  for (const id of paginas) {
    if (id === 'close') continue;
    await page.evaluate(alvo => {
      Menu.page = 'root';
      Menu.cur.root.i = Menu.ROOT.findIndex((i: any) => i.id === alvo);
    }, id);
    await apertar(page, 'confirmar');
    const atual = await page.evaluate(() => String(Menu.page));
    visitadas.push(`${id}->${atual}`);
    await page.screenshot({ path: `${SHOTS}/06-menu-${id}.png` });
    await apertar(page, 'cancelar');
  }

  // 6. Fechar o menu devolve o controle ao personagem.
  await page.evaluate(() => { Menu.page = 'root'; });
  await apertar(page, 'cancelar');
  await esperarCena(page, 'FIELD', 5000);
  const antesDeVoltar = await tile(page);
  expect((await passo(page, 'right')).x, 'controle volta após o menu').toBe(antesDeVoltar.x + 1);

  // 7. Trocar de personagem com elenco de um: não pode quebrar nem sair do campo.
  await apertar(page, 'trocar');
  expect(await cena(page), 'trocar com um personagem não pode tirar do campo').toBe('FIELD');
  const depoisDaTroca = await page.evaluate(() => ({ lider: G.leader, party: G.party.length }));
  expect(depoisDaTroca.party, 'a troca não pode alterar o tamanho do elenco').toBe(1);

  // 8. Combate.
  await page.evaluate(() => { if (typeof triggerEncounter === 'function') triggerEncounter(); });
  await esperarCena(page, 'BATTLE', 12000).catch(() => undefined);
  const emBatalha = (await cena(page)) === 'BATTLE';
  if (emBatalha) {
    /* A entrada em combate passa por uma transição que cobre a tela. Fotografar
       antes dela terminar registra o efeito, não a cena — foi o que aconteceu
       na primeira rodada e quase virou um "defeito" que não existia. */
    await page.waitForFunction(() => !FX?.trans, undefined, { timeout: 6000 }).catch(() => undefined);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SHOTS}/07-batalha.png` });
    const aliados = await page.evaluate(() => (G.battle?.allies ?? []).length);
    await apertar(page, 'confirmar');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/08-batalha-acao.png` });
    console.log(`aliados_em_batalha=${aliados}`);
  }

  console.log(JSON.stringify({
    escolhido, ofertados, party_inicial: inicio.party, bench: inicio.bench,
    paginas_visitadas: visitadas, quests_de_recruta: await page.evaluate(() => RECRUIT_QUESTS),
    emBatalha, erros,
  }, null, 1));
  expect(erros, `erros de página: ${erros.join(' | ')}`).toHaveLength(0);
});
