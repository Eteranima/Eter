/* Um Consumível (seção 25/26) — uso imediato, empilhável. */
export const POCAO_DE_ETER = {
  id: 'pocao_de_eter',
  tipo: 'consumivel',
  nome: 'Poção de Éter Vital',
  raridade: 'comum',
  cura: 35,
  descricao: 'Éter estabilizado em frasco — restaura vitalidade sem efeito colateral conhecido.',
  preco: 15,
};

export function usarConsumivel(player, item) {
  if (item.cura) player.curar(item.cura);
  if (item.mana) player.restaurarMana(item.mana);
}
