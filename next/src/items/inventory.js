/* ===================================================================
   INVENTÁRIO (seção 25) — categorizado, orientado a dados: adicionar
   um item novo nunca deve exigir mexer nesta função, só registrar o
   item no catálogo de origem (equipment.js/consumables.js/...).
   =================================================================== */
export function criarInventario() {
  return {
    consumiveis: [],
    materiais: [],
    questItems: [],
    equipamentos: [],
    magias: [],
    pets: [],
  };
}

const CATEGORIA_POR_TIPO = {
  consumivel: 'consumiveis', material: 'materiais', questItem: 'questItems',
  equipamento: 'equipamentos', magia: 'magias', pet: 'pets',
};

export function adicionarItem(inventario, item, quantidade = 1) {
  const categoria = CATEGORIA_POR_TIPO[item.tipo];
  if (!categoria) throw new Error(`Tipo de item desconhecido: ${item.tipo}`);
  const pilha = inventario[categoria];
  const existente = pilha.find((entrada) => entrada.item.id === item.id);
  if (existente && item.empilhavel !== false) existente.quantidade += quantidade;
  else pilha.push({ item, quantidade });
}

export function removerItem(inventario, itemId, quantidade = 1) {
  for (const categoria of Object.values(CATEGORIA_POR_TIPO)) {
    const pilha = inventario[categoria];
    const indice = pilha.findIndex((entrada) => entrada.item.id === itemId);
    if (indice === -1) continue;
    pilha[indice].quantidade -= quantidade;
    if (pilha[indice].quantidade <= 0) pilha.splice(indice, 1);
    return true;
  }
  return false;
}

export function contarItem(inventario, itemId) {
  for (const categoria of Object.values(CATEGORIA_POR_TIPO)) {
    const entrada = inventario[categoria].find((e) => e.item.id === itemId);
    if (entrada) return entrada.quantidade;
  }
  return 0;
}
