import * as THREE from 'three';
import { criarBillboardDirecional } from './sprite-billboard.js';

/* Um NPC de verdade tem função no mundo (seção 29) — este tanto fala
   quanto abre uma loja (ver shop/shop.js), nunca decoração de fundo. */
export function criarNpc({ scene, spriteUrl, posicao, nome, falas, lojaId = null }) {
  const billboard = criarBillboardDirecional(spriteUrl, { alturaMundo: 1.8 });
  billboard.sprite.position.set(posicao.x, posicao.y, posicao.z);
  billboard.tick(0, false, 'down');
  scene.add(billboard.sprite);

  return {
    nome, falas, lojaId,
    posicao: new THREE.Vector3(posicao.x, posicao.y, posicao.z),
    sprite: billboard.sprite,
    distanciaAte(pontoXZ) { return this.posicao.distanceTo(pontoXZ); },
  };
}
