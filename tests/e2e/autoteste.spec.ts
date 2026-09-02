import { test, expect } from '@playwright/test';

const URL = process.env.ETER_URL ?? 'https://eter.denverso.com/';

/* O jogo traz autoteste próprio: `?test` o dispara após carregar recursos e
   desenha o relatório na página. Chamar runSelfTests() de novo o executaria
   duas vezes — e a segunda passada acusa falso na asserção que confere a
   restauração do registro de arte, porque a primeira já mexeu no estado.
   Então aqui a gente só lê o que a página produziu. */
test('o autoteste embutido do jogo passa inteiro', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', e => erros.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') erros.push(`console: ${m.text()}`); });

  await page.goto(`${URL}?test`, { waitUntil: 'domcontentloaded' });

  // O relatório é desenhado com quebras de linha, então ancorar no início do
  // texto não casa; procurar pelo trecho é o que funciona.
  await page.waitForFunction(
    () => /AUTOTESTE\s+—\s+\d+\/\d+/.test(document.body.innerText),
    undefined, { timeout: 30000 });

  const { titulo, falhas } = await page.evaluate(() => {
    const texto = document.body.innerText;
    const m = texto.match(/AUTOTESTE\s+—\s+[^\n]+/);
    return {
      titulo: (m ? m[0] : '').trim(),
      falhas: texto.split('\n').map(l => l.trim()).filter(l => l.startsWith('\u2718')),
    };
  });

  console.log(JSON.stringify({ titulo, falhas, erros }, null, 1));
  expect(titulo, 'o autoteste não pode acusar falha').not.toMatch(/FALHA/);
  expect(falhas, `asserções falhando: ${falhas.join(' | ')}`).toHaveLength(0);
  expect(erros, `erros de página: ${erros.join(' | ')}`).toHaveLength(0);
});
