/* HUD (seção 21) — lê sempre o estado real do jogador, nunca dado
   fictício; cada campo é uma leitura direta de `player`/`inventario`. */
export function atualizarHud(player) {
  const hpPct = Math.max(0, player.hp / player.hpMax) * 100;
  const mpPct = Math.max(0, player.mp / player.mpMax) * 100;
  document.getElementById('hp-fill').style.width = `${hpPct}%`;
  document.getElementById('hp-text').textContent = `${Math.ceil(player.hp)}/${player.hpMax}`;
  document.getElementById('mp-fill').style.width = `${mpPct}%`;
  document.getElementById('mp-text').textContent = `${Math.ceil(player.mp)}/${player.mpMax}`;

  document.getElementById('level-text').textContent = `Nv. ${player.progresso.nivel}`;
  const xpPct = (player.progresso.xp / player.progresso.proximo) * 100;
  document.getElementById('xp-fill').style.width = `${xpPct}%`;

  document.getElementById('gold-text').textContent = player.ouro;
}
