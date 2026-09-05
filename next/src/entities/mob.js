import * as THREE from 'three';
import { criarBillboardEstatico } from './sprite-billboard.js';

const ALCANCE_MELEE = 1.4;
const COOLDOWN_ATAQUE_SEG = 1.2;

/* Mob de campo VISÍVEL, nunca batalha aleatória por passo — o jogador
   vê a ameaça antes de decidir se enfrenta (mesma filosofia do motor
   antigo, engine/{17,18,19,20}). O Lobo patrulha e não persegue (mob
   comum, "fauna" — seção 30); o Bound persegue ao ver o jogador perto
   (é uma categoria própria de ameaça, seção 7, não "monstro comum"). */
export function criarMob({
  scene, spriteUrl, posicao, nome, hp, dano, elemento, xp,
  agressivo = false, raioPatrulha = 2.5, velocidade = 1.6,
}) {
  const billboard = criarBillboardEstatico(spriteUrl, { alturaMundo: agressivo ? 2 : 1.5 });
  billboard.sprite.position.set(posicao.x, posicao.y, posicao.z);
  scene.add(billboard.sprite);

  const origem = new THREE.Vector3(posicao.x, posicao.y, posicao.z);
  const mob = {
    nome, elemento, xp, agressivo,
    hp, hpMax: hp, dano,
    posicao: new THREE.Vector3(posicao.x, posicao.y, posicao.z),
    sprite: billboard.sprite,
    morto: false,
    _t: Math.random() * 10,
    _cooldownAtaque: 0,

    receberDano(quantidade) {
      this.hp = Math.max(0, this.hp - quantidade);
      if (this.hp <= 0) this.morto = true;
      return this.hp;
    },

    /** Ataque melee do mob no jogador — cooldown próprio, nunca dispara
     *  duas vezes no mesmo alcance sem esperar o intervalo. Quem aplica
     *  o dano de verdade é combat.js (mesmo cálculo elemental usado
     *  quando é o jogador que ataca, só invertendo quem é atacante). */
    podeAtacar(distanciaJogador) {
      return this.agressivo && !this.morto && this._cooldownAtaque <= 0 && distanciaJogador <= ALCANCE_MELEE;
    },
    confirmarAtaque() { this._cooldownAtaque = COOLDOWN_ATAQUE_SEG; },

    atualizar(deltaSeg, posicaoJogador) {
      if (this.morto) return;
      this._t += deltaSeg;
      this._cooldownAtaque = Math.max(0, this._cooldownAtaque - deltaSeg);
      const distanciaJogador = this.posicao.distanceTo(posicaoJogador);

      let alvoX, alvoZ;
      if (this.agressivo && distanciaJogador < 6) {
        alvoX = posicaoJogador.x; alvoZ = posicaoJogador.z;
      } else {
        alvoX = origem.x + Math.sin(this._t * 0.5) * raioPatrulha;
        alvoZ = origem.z + Math.cos(this._t * 0.5) * raioPatrulha;
      }
      const dx = alvoX - this.posicao.x, dz = alvoZ - this.posicao.z;
      const comprimento = Math.hypot(dx, dz);
      if (comprimento > 0.05) {
        this.posicao.x += (dx / comprimento) * velocidade * deltaSeg;
        this.posicao.z += (dz / comprimento) * velocidade * deltaSeg;
        billboard.virarPara(dx < 0);
      }
      this.sprite.position.copy(this.posicao);
    },
  };
  return mob;
}
