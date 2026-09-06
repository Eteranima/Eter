/* Tela de inventário (seção 25) — usar consumível e equipar/desequipar
   direto da lista. Sem isto o inventário existia só como dado
   (items/inventory.js), sem jeito nenhum de o jogador mexer nele
   depois da compra/coleta inicial. */
const SECOES = [
  ['Consumíveis', 'consumiveis', 'consumivel'],
  ['Equipamentos', 'equipamentos', 'equipamento'],
  ['Materiais', 'materiais', 'material'],
  ['Itens de missão', 'questItems', 'questItem'],
  ['Magias', 'magias', 'magia'],
  ['Pets', 'pets', 'pet'],
];

export function criarPainelInventario() {
  const el = document.getElementById('inventory');
  const lista = document.getElementById('inventory-list');
  let callbacksAtuais = null;
  let jogadorAtual = null;
  let inventarioAtual = null;

  function renderizar() {
    lista.innerHTML = '';
    let algumaSecao = false;
    for (const [titulo, chave, tipo] of SECOES) {
      const pilha = inventarioAtual[chave];
      if (!pilha.length) continue;
      algumaSecao = true;
      const cabecalho = document.createElement('h3');
      cabecalho.textContent = titulo;
      lista.append(cabecalho);
      for (const entrada of pilha) {
        const linha = document.createElement('div');
        linha.className = 'inventory-item';
        const equipado = tipo === 'equipamento' && jogadorAtual.equipamento?.id === entrada.item.id;
        const rotulo = document.createElement('span');
        rotulo.textContent = `${entrada.item.nome}${entrada.quantidade > 1 ? ` ×${entrada.quantidade}` : ''}${equipado ? ' (equipado)' : ''}`;
        linha.append(rotulo);
        if (tipo === 'consumivel') {
          const botao = document.createElement('button');
          botao.textContent = 'Usar';
          botao.onclick = () => { callbacksAtuais.onUsarConsumivel(entrada.item); renderizar(); };
          linha.append(botao);
        } else if (tipo === 'equipamento') {
          const botao = document.createElement('button');
          botao.textContent = equipado ? 'Desequipar' : 'Equipar';
          botao.onclick = () => {
            if (equipado) callbacksAtuais.onDesequipar(); else callbacksAtuais.onEquipar(entrada.item);
            renderizar();
          };
          linha.append(botao);
        }
        lista.append(linha);
      }
    }
    if (!algumaSecao) lista.innerHTML = '<p class="small">Inventário vazio.</p>';
  }

  function abrir(player, inventario, callbacks) {
    jogadorAtual = player; inventarioAtual = inventario; callbacksAtuais = callbacks;
    renderizar();
    el.hidden = false;
  }
  function fechar() { el.hidden = true; }

  return { abrir, fechar, get ativo() { return !el.hidden; } };
}
