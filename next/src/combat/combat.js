import { multiplicadorElemental } from '../core/elements.js';
import { GOLPE_GIRATORIO } from './skills.js';
import { LANCA_DE_FOGO } from './magic.js';

/* ===================================================================
   COMBATE ACTION RPG EM TEMPO REAL (seção 18).
   Consome exatamente os mesmos dados (player.stats, mob.elemento,
   skills/magic) que uma futura tela por turnos vai consumir — ver
   turn-based-stub.js. Nada aqui é exclusivo do modo em tempo real além
   do próprio "quando" (cooldown de tempo real vs. fila de turno).
   =================================================================== */
export function criarCombate({ player, mobs, mostrarDano, onMobMorto, vfx }) {
  const cooldowns = { ataque: 0, skill: 0, magia: 0 };

  function tick(deltaSeg) {
    for (const chave of Object.keys(cooldowns)) cooldowns[chave] = Math.max(0, cooldowns[chave] - deltaSeg);
  }

  function alvosNoAlcance(alcance) {
    return mobs.filter((mob) => !mob.morto && mob.posicao.distanceTo(player.posicao) <= alcance);
  }

  function aplicarDano(mob, danoBase, elementoAtaque, critico) {
    const multiplicador = multiplicadorElemental(elementoAtaque, mob.elemento);
    const danoFinal = Math.max(1, Math.round(danoBase * multiplicador * (critico ? 1.8 : 1)));
    mob.receberDano(danoFinal);
    mostrarDano(mob.posicao, danoFinal, critico, multiplicador);
    if (mob.morto && onMobMorto) onMobMorto(mob);
    return danoFinal;
  }

  function ataqueBasico() {
    if (cooldowns.ataque > 0 || player.morto) return false;
    cooldowns.ataque = 0.5;
    player.tocarAnimacaoDeAtaque();
    const critico = Math.random() < player.chanceCritico();
    for (const mob of alvosNoAlcance(1.6)) aplicarDano(mob, player.danoFisico(), player.elemento, critico);
    return true;
  }

  function usarSkill() {
    if (cooldowns.skill > 0 || player.morto) return false;
    cooldowns.skill = GOLPE_GIRATORIO.cooldownSeg;
    player.tocarAnimacaoDeAtaque();
    vfx?.criarOndaDeSkill(player.posicao);
    const critico = Math.random() < player.chanceCritico();
    for (const mob of alvosNoAlcance(GOLPE_GIRATORIO.alcance)) {
      aplicarDano(mob, player.danoFisico() * GOLPE_GIRATORIO.multiplicadorDano, player.elemento, critico);
    }
    return true;
  }

  function usarMagia() {
    if (cooldowns.magia > 0 || player.morto || player.mp < LANCA_DE_FOGO.custoMana) return false;
    cooldowns.magia = LANCA_DE_FOGO.cooldownSeg;
    player.mp -= LANCA_DE_FOGO.custoMana;
    player.tocarAnimacaoDeAtaque();
    const critico = Math.random() < player.chanceCritico();
    for (const mob of alvosNoAlcance(LANCA_DE_FOGO.alcance)) {
      vfx?.criarProjetilDeMagia(player.posicao, mob.posicao);
      aplicarDano(mob, player.danoMagico() * LANCA_DE_FOGO.multiplicadorDano, LANCA_DE_FOGO.elemento, critico);
    }
    return true;
  }

  /** Mob ataca de volta — sem isto o combate seria só o jogador batendo
   *  em alvos que nunca revidam, o que não prova HP/morte/respawn de
   *  verdade (chamado todo frame, cada mob decide sozinho se pode
   *  atacar via seu próprio cooldown). */
  function mobsAtacamJogador() {
    if (player.morto) return;
    for (const mob of mobs) {
      if (mob.morto) continue;
      const distancia = mob.posicao.distanceTo(player.posicao);
      if (!mob.podeAtacar(distancia)) continue;
      mob.confirmarAtaque();
      const multiplicador = multiplicadorElemental(mob.elemento, player.elemento);
      const danoFinal = Math.max(1, Math.round(mob.dano * multiplicador));
      player.receberDano(danoFinal);
      mostrarDano(player.posicao, danoFinal, false);
    }
  }

  return { tick, ataqueBasico, usarSkill, usarMagia, mobsAtacamJogador, cooldowns };
}
