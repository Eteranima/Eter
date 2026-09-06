import * as THREE from 'three';

/* Número de dano flutuante — projeta a posição 3D do alvo pra tela
   (câmera de verdade, não uma conta aproximada) e solta um <div> que
   se anima e remove sozinho via CSS (.dmg-pop, ver styles.css). */
export function criarMostradorDeDano(camera) {
  const camada = document.getElementById('damage-layer');
  const vetorTemp = new THREE.Vector3();

  return function mostrarDano(posicaoMundo, valor, critico) {
    vetorTemp.set(posicaoMundo.x, posicaoMundo.y + 1.6, posicaoMundo.z);
    vetorTemp.project(camera);
    if (vetorTemp.z > 1) return; // atrás da câmera
    const x = (vetorTemp.x * 0.5 + 0.5) * window.innerWidth;
    const y = (1 - (vetorTemp.y * 0.5 + 0.5)) * window.innerHeight;

    const div = document.createElement('div');
    div.className = critico ? 'dmg-pop crit' : 'dmg-pop';
    div.textContent = critico ? `${valor}!` : String(valor);
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    camada.append(div);
    setTimeout(() => div.remove(), 850);
  };
}
