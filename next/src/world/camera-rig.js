import * as THREE from 'three';

/* ===================================================================
   CÂMERA (seção 17) — segue o personagem, mostra profundidade,
   trabalha com diferentes alturas. Terceira pessoa fixa atrás do
   jogador (sem órbita do mouse nesta slice — órbita/colisão contra
   parede fica pra depois, ver limitações no relatório final), com
   suavização (lerp) pra não "grudar" na posição e ficar nervosa
   quando o personagem sobe/desce escada.
   =================================================================== */
const OFFSET = new THREE.Vector3(0, 5.5, 8.5);
const SUAVIZACAO = 4.5; // maior = câmera alcança mais rápido

export function criarCameraRig() {
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  const alvoAtual = new THREE.Vector3();
  let iniciado = false;

  function atualizar(deltaSeg, posicaoAlvo) {
    const destino = posicaoAlvo.clone().add(OFFSET);
    if (!iniciado) {
      camera.position.copy(destino);
      iniciado = true;
    } else {
      const t = 1 - Math.exp(-SUAVIZACAO * deltaSeg);
      camera.position.lerp(destino, t);
    }
    alvoAtual.lerp(posicaoAlvo.clone().add(new THREE.Vector3(0, 1.2, 0)), iniciado ? 1 - Math.exp(-SUAVIZACAO * deltaSeg) : 1);
    camera.lookAt(alvoAtual);
  }

  function redimensionar(largura, altura) {
    camera.aspect = largura / altura;
    camera.updateProjectionMatrix();
  }

  return { camera, atualizar, redimensionar };
}
