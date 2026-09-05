/* Caixa de diálogo — falas lineares com Z pra avançar; a última fala
   pode terminar em escolhas (ex.: "Ver loja" / "Só isso"). */
export function criarDialogo() {
  const el = document.getElementById('dialogue');
  const nomeEl = document.getElementById('dialogue-name');
  const textoEl = document.getElementById('dialogue-text');
  const escolhasEl = document.getElementById('dialogue-choices');

  let falas = [];
  let indice = 0;
  let escolhas = null;
  let ativo = false;

  function renderizarLinhaAtual() {
    textoEl.textContent = falas[indice];
    escolhasEl.innerHTML = '';
    const naUltimaLinha = indice === falas.length - 1;
    if (naUltimaLinha && escolhas) {
      for (const escolha of escolhas) {
        const botao = document.createElement('button');
        botao.textContent = escolha.texto;
        botao.onclick = () => { fechar(); escolha.aoEscolher(); };
        escolhasEl.append(botao);
      }
    }
  }

  function mostrar(nome, listaFalas, opcoesEscolha = null) {
    falas = listaFalas.length ? listaFalas : ['...'];
    indice = 0;
    escolhas = opcoesEscolha;
    nomeEl.textContent = nome;
    ativo = true;
    el.hidden = false;
    renderizarLinhaAtual();
  }

  function avancar() {
    if (!ativo) return false;
    const naUltimaLinha = indice === falas.length - 1;
    if (!naUltimaLinha) { indice += 1; renderizarLinhaAtual(); return true; }
    if (escolhas) return true; // espera clique numa escolha, Z não fecha sozinho
    fechar();
    return true;
  }

  function fechar() {
    ativo = false;
    el.hidden = true;
  }

  return { mostrar, avancar, fechar, get ativo() { return ativo; } };
}
