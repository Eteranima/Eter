import { ESPADA_DE_TREINO } from '../items/equipment.js';
import { POCAO_DE_ETER } from '../items/consumables.js';

/* Save (seção 38) — versão básica da vertical slice: posição,
   progressão, HP/mana atuais, ouro, equipamento e inventário. World
   state (baú aberto, caixa quebrada) fica fora desta fatia de
   propósito — não é o que a seção 41 pede como mínimo. */
const CHAVE_SAVE = 'eter_anima_vslice_save_v1';
const CATALOGO_ITENS = { [ESPADA_DE_TREINO.id]: ESPADA_DE_TREINO, [POCAO_DE_ETER.id]: POCAO_DE_ETER };

export function salvar(player, inventario) {
  const dados = {
    posicao: { x: player.posicao.x, y: player.posicao.y, z: player.posicao.z },
    racaId: player.racaId,
    elemento: player.elemento,
    progresso: player.progresso,
    hp: player.hp,
    mp: player.mp,
    ouro: player.ouro,
    equipamentoId: player.equipamento?.id ?? null,
    inventario: Object.fromEntries(
      Object.entries(inventario).map(([categoria, pilha]) => [
        categoria, pilha.map((entrada) => ({ id: entrada.item.id, quantidade: entrada.quantidade })),
      ]),
    ),
  };
  localStorage.setItem(CHAVE_SAVE, JSON.stringify(dados));
  return dados;
}

export function carregar() {
  const bruto = localStorage.getItem(CHAVE_SAVE);
  if (!bruto) return null;
  try {
    const dados = JSON.parse(bruto);
    for (const categoria of Object.keys(dados.inventario || {})) {
      dados.inventario[categoria] = dados.inventario[categoria]
        .map((entrada) => ({ item: CATALOGO_ITENS[entrada.id], quantidade: entrada.quantidade }))
        .filter((entrada) => !!entrada.item);
    }
    return dados;
  } catch {
    return null;
  }
}

export function existeSave() {
  return !!localStorage.getItem(CHAVE_SAVE);
}
