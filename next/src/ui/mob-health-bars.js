import * as THREE from 'three';

/* Barra de HP flutuante por mob — projeta a posição 3D de verdade
   (câmera real, mesma técnica de damage-numbers.js) e mantém um <div>
   por mob vivo, escondendo/removendo ao morrer. Sem isto o jogador
   ataca um alvo sem saber quanto falta — relatado direto no teste ao
   vivo ("falta barra de vida do mob"). */
export function criarBarrasDeVidaDeMob(camera) {
  const camada = document.getElementById('mob-bars');
  const vetorTemp = new THREE.Vector3();
  const elementosPorMob = new Map();

  function elementoDoMob(mob) {
    let el = elementosPorMob.get(mob);
    if (!el) {
      el = document.createElement('div');
      el.className = 'mob-bar';
      el.innerHTML = '<div class="mob-bar-fill"></div>';
      camada.append(el);
      elementosPorMob.set(mob, el);
    }
    return el;
  }

  function atualizar(mobs) {
    for (const mob of mobs) {
      const existente = elementosPorMob.get(mob);
      if (mob.morto) {
        if (existente) { existente.remove(); elementosPorMob.delete(mob); }
        continue;
      }
      const el = elementoDoMob(mob);
      vetorTemp.set(mob.posicao.x, mob.posicao.y + (mob.agressivo ? 2.3 : 1.8), mob.posicao.z);
      vetorTemp.project(camera);
      if (vetorTemp.z > 1) { el.style.display = 'none'; continue; }
      el.style.display = '';
      el.style.left = `${(vetorTemp.x * 0.5 + 0.5) * window.innerWidth}px`;
      el.style.top = `${(1 - (vetorTemp.y * 0.5 + 0.5)) * window.innerHeight}px`;
      el.querySelector('.mob-bar-fill').style.width = `${Math.max(0, mob.hp / mob.hpMax) * 100}%`;
    }
  }

  return { atualizar };
}
