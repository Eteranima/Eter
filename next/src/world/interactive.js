import * as THREE from 'three';

/* Interação ambiental (seção 34) — objetos que reagem, nunca cenário
   puramente decorativo (mesmo requisito "100% interativo" que já valia
   na arquitetura antiga, e continua fazendo sentido aqui). */
export function criarCaixaQuebravel({ scene, posicao, drop }) {
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.8 }),
  );
  malha.position.set(posicao.x, posicao.y + 0.4, posicao.z);
  scene.add(malha);

  return {
    tipo: 'caixa', posicao: new THREE.Vector3(posicao.x, posicao.y, posicao.z),
    quebrada: false, drop,
    interagir() {
      if (this.quebrada) return null;
      this.quebrada = true;
      scene.remove(malha);
      return this.drop;
    },
  };
}

export function criarBau({ scene, posicao, itens }) {
  const malha = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.7, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xbd8b39, roughness: 0.6, metalness: 0.15 }),
  );
  malha.position.set(posicao.x, posicao.y + 0.35, posicao.z);
  scene.add(malha);

  return {
    tipo: 'bau', posicao: new THREE.Vector3(posicao.x, posicao.y, posicao.z),
    aberto: false, itens,
    interagir() {
      if (this.aberto) return null;
      this.aberto = true;
      malha.material.color.set(0x6a4a1a);
      malha.scale.y = 0.6;
      return this.itens;
    },
  };
}
