import { test, expect } from '@playwright/test';

declare const G: any;
declare const Save: any;
declare const ModificadorCombate: any;
declare function newGame(nome: string): void;
declare function loadFromSave(save: any): void;
declare function chanceAcerto(unidade: any): number;
declare function chanceCritico(unidade: any): number;
declare function multiplicadorDanoCombate(origem: any, alvo: any): number;

const URL = process.env.ETER_URL ?? 'https://eter.denverso.com/';

test('o modificador secreto alterna, afeta combate e persiste no save', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof G !== 'undefined' && !!G.scene);

  const resultado = await page.evaluate(() => {
    newGame('Seiji');
    G.modificadorCombate = false;
    ModificadorCombate.reset();
    [100, 200, 300, 400, 500, 600].forEach((tempo, i) =>
      ModificadorCombate.registrarSom(i % 2 === 0, tempo));

    const combate = {
      ativo: G.modificadorCombate,
      acertoAliado: chanceAcerto({side:'ally'}),
      criticoAliado: chanceCritico({side:'ally'}),
      acertoInimigo: chanceAcerto({side:'enemy'}),
      danoCausado: multiplicadorDanoCombate({side:'ally'}, {side:'enemy'}),
      danoRecebido: multiplicadorDanoCombate({side:'enemy'}, {side:'ally'}),
    };

    Save.write();
    const salvo = Save.read();
    G.modificadorCombate = false;
    loadFromSave(salvo);
    const restaurado = G.modificadorCombate;
    Save.erase();
    return {combate, campoSalvo: salvo.modificadorCombate, restaurado};
  });

  expect(resultado).toEqual({
    combate: {
      ativo: true,
      acertoAliado: 1,
      criticoAliado: 0.7,
      acertoInimigo: 0.5,
      danoCausado: 1.2,
      danoRecebido: 0.7,
    },
    campoSalvo: true,
    restaurado: true,
  });
});
