import * as THREE from 'three';
import { criarBillboardDirecional } from './sprite-billboard.js';
import { aplicarBonusRaca } from '../core/race.js';
import {
  statsBase, hpMaximo, manaMaxima, danoFisicoBase, danoMagicoBase,
  velocidadeMovimento, chanceCritico, criarProgresso, ganharXp,
} from '../core/stats.js';

const GRAVIDADE = -18;
const VELOCIDADE_PULO = 7;

export class Player {
  constructor({ scene, racaId, elemento, spriteUrl }) {
    this.racaId = racaId;
    this.elemento = elemento;
    this.stats = aplicarBonusRaca(statsBase(), racaId);
    this.progresso = criarProgresso();
    this.hp = hpMaximo(this.stats, this.progresso.nivel);
    this.mp = manaMaxima(this.stats, this.progresso.nivel);
    this.equipamento = null; // ver items/equipment.js — bônus somado sob demanda
    this.ouro = 60; // economia (seção 32) — moeda simples pra vertical slice

    this.posicao = new THREE.Vector3(0, 0, 0);
    this.velocidadeY = 0;
    this.noChao = true;
    this.direcao = 'down';
    this.movendo = false;
    this.correndo = false;
    this.morto = false;
    /* Rede de segurança contra buraco de colisão: o "chão" é um
       heightmap por sobreposição de retângulos (world/map.js) — uma
       borda mal medida entre duas peças deixa uma coluna sem NENHUMA
       plataforma embaixo, e sem isso o personagem cairia pra sempre
       (achado testando o próprio limitarNaArena contra a pegada real
       das plataformas: o raio da arena é mais largo que o chão em
       alguns cantos). Guarda a última posição em pé de verdade e volta
       pra ela se a queda passar de um fundo que nenhuma plataforma
       real ocupa. */
    this.ultimaPosicaoSegura = this.posicao.clone();

    const billboard = criarBillboardDirecional(spriteUrl, { alturaMundo: 1.9 });
    this.sprite = billboard.sprite;
    this._tickSprite = billboard.tick;
    scene.add(this.sprite);
  }

  get hpMax() { return hpMaximo(this.statsEfetivos(), this.progresso.nivel); }
  get mpMax() { return manaMaxima(this.statsEfetivos(), this.progresso.nivel); }

  /** Stats base + bônus de equipamento (ver items/equipment.js). */
  statsEfetivos() {
    if (!this.equipamento) return this.stats;
    const resultado = { ...this.stats };
    for (const [attr, valor] of Object.entries(this.equipamento.bonusAtributo || {})) {
      resultado[attr] = (resultado[attr] ?? 0) + valor;
    }
    return resultado;
  }
  danoFisico() { return danoFisicoBase(this.statsEfetivos()) + (this.equipamento?.dano ?? 0); }
  danoMagico() { return danoMagicoBase(this.statsEfetivos()); }
  chanceCritico() { return chanceCritico(this.statsEfetivos()); }

  receberDano(quantidade) {
    this.hp = Math.max(0, this.hp - quantidade);
    if (this.hp <= 0) this.morto = true;
    return this.hp;
  }
  curar(quantidade) { this.hp = Math.min(this.hpMax, this.hp + quantidade); }
  restaurarMana(quantidade) { this.mp = Math.min(this.mpMax, this.mp + quantidade); }

  ganharXp(quantidade) {
    const niveisSubiram = ganharXp(this.progresso, quantidade);
    if (niveisSubiram > 0) {
      this.hp = this.hpMax;
      this.mp = this.mpMax;
    }
    return niveisSubiram;
  }

  /** Move e resolve altura do chão/gravidade/pulo. Chamado todo frame. */
  atualizar(deltaSeg, intencao, mapa) {
    const velocidadeBase = velocidadeMovimento(this.statsEfetivos()) * (this.correndo ? 1.7 : 1);
    let dx = 0, dz = 0;
    if (intencao.cima) dz -= 1;
    if (intencao.baixo) dz += 1;
    if (intencao.esquerda) dx -= 1;
    if (intencao.direita) dx += 1;
    this.movendo = dx !== 0 || dz !== 0;
    this.correndo = !!intencao.correr && this.movendo;

    if (this.movendo) {
      const comprimento = Math.hypot(dx, dz);
      dx /= comprimento; dz /= comprimento;
      this.posicao.x += dx * velocidadeBase * deltaSeg;
      this.posicao.z += dz * velocidadeBase * deltaSeg;
      if (Math.abs(dx) > Math.abs(dz)) this.direcao = dx > 0 ? 'right' : 'left';
      else this.direcao = dz > 0 ? 'down' : 'up';
    }

    const [xLimitado, zLimitado] = mapa.limitarNaArena(this.posicao.x, this.posicao.z);
    this.posicao.x = xLimitado; this.posicao.z = zLimitado;

    // Pulo — só sai do chão se já estava apoiado.
    if (intencao.pular && this.noChao) {
      this.velocidadeY = VELOCIDADE_PULO;
      this.noChao = false;
    }

    this.velocidadeY += GRAVIDADE * deltaSeg;
    this.posicao.y += this.velocidadeY * deltaSeg;

    const chao = mapa.alturaDoChao(this.posicao.x, this.posicao.z, this.posicao.y);
    if (chao === -Infinity) {
      // Nenhuma plataforma existe nesta coluna — buraco de colisão, não
      // queda de gameplay. Volta pro último chão real em vez de cair
      // pra sempre (ver comentário no construtor).
      this.posicao.copy(this.ultimaPosicaoSegura);
      this.velocidadeY = 0;
      this.noChao = true;
    } else if (this.posicao.y <= chao) {
      this.posicao.y = chao;
      this.velocidadeY = 0;
      this.noChao = true;
    } else {
      this.noChao = false;
    }
    if (this.noChao) this.ultimaPosicaoSegura.copy(this.posicao);

    this.sprite.position.copy(this.posicao);
    this._tickSprite(deltaSeg * 1000, this.movendo, this.direcao);
  }
}
