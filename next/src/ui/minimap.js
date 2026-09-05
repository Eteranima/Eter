/* Minimapa (seção 22) — projeção ortogonal simples de X/Z centrada no
   jogador. NPCs e mobs entram como pontos coloridos; suficiente pra
   provar o contrato (jogador, pontos de interesse, estruturas) sem
   reimplementar um sistema de fog-of-war nesta fatia. */
const ESCALA = 4; // pixels por unidade de mundo

export function criarMinimapa() {
  const canvas = document.getElementById('minimap');
  const ctx = canvas.getContext('2d');

  function redimensionar() {
    const tamanho = Math.round(canvas.clientWidth * devicePixelRatio);
    canvas.width = tamanho; canvas.height = tamanho;
  }
  redimensionar();
  window.addEventListener('resize', redimensionar);

  function desenhar(player, npcs, mobs) {
    const meio = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(20,36,30,.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const projetar = (posicao) => ({
      x: meio + (posicao.x - player.posicao.x) * ESCALA,
      y: meio + (posicao.z - player.posicao.z) * ESCALA,
    });

    for (const npc of npcs) {
      const p = projetar(npc.posicao);
      ctx.fillStyle = '#f2c879';
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    }
    for (const mob of mobs) {
      if (mob.morto) continue;
      const p = projetar(mob.posicao);
      ctx.fillStyle = mob.agressivo ? '#ff6a6a' : '#9fd6c9';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath(); ctx.arc(meio, meio, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  return { desenhar };
}
