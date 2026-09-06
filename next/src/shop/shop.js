import { ESPADA_DE_TREINO } from '../items/equipment.js';
import { POCAO_DE_ETER } from '../items/consumables.js';
import { adicionarItem } from '../items/inventory.js';

/* Uma Loja (seção 31) — NPC comerciante com estoque fixo nesta slice
   (preço/estoque dinâmico é próxima fatia, não esta). */
export const LOJA_ACADEMIA = {
  id: 'loja_academia',
  nome: 'Empório da Academia',
  itens: [ESPADA_DE_TREINO, POCAO_DE_ETER],
};

export function comprar(player, inventario, item) {
  if (player.ouro < item.preco) return { ok: false, motivo: 'ouro insuficiente' };
  player.ouro -= item.preco;
  adicionarItem(inventario, item, 1);
  return { ok: true };
}
