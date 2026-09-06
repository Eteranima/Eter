/* Um Equipamento (seção 26) — estrutura completa mesmo com um item só,
   pra provar que a próxima arma/armadura é só uma entrada nova aqui. */
export const ESPADA_DE_TREINO = {
  id: 'espada_de_treino',
  tipo: 'equipamento',
  nome: 'Espada de Treino',
  raridade: 'comum',
  slot: 'arma',
  dano: 4,
  bonusAtributo: { forca: 2 },
  efeitoEspecial: null,
  requisitos: { nivel: 1 },
  descricao: 'Lâmina romba de treino da Academia. Não corta muito, mas ensina a postura certa.',
  preco: 40,
};

export function equipar(player, item) {
  player.equipamento = item;
}
export function desequipar(player) {
  player.equipamento = null;
}
