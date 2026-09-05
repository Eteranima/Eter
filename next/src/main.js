import * as THREE from 'three';
import { Input } from './input/input.js';
import { construirMapa } from './world/map.js';
import { criarCameraRig } from './world/camera-rig.js';
import { criarCaixaQuebravel, criarBau } from './world/interactive.js';
import { Player } from './entities/player.js';
import { criarNpc } from './entities/npc.js';
import { criarMob } from './entities/mob.js';
import { criarCombate } from './combat/combat.js';
import { criarInventario, adicionarItem, removerItem } from './items/inventory.js';
import { POCAO_DE_ETER, usarConsumivel } from './items/consumables.js';
import { ESPADA_DE_TREINO, equipar } from './items/equipment.js';
import { LOJA_ACADEMIA, comprar } from './shop/shop.js';
import { atualizarHud } from './ui/hud.js';
import { criarMinimapa } from './ui/minimap.js';
import { criarDialogo } from './ui/dialogue-box.js';
import { criarMostradorDeDano } from './ui/damage-numbers.js';
import { salvar, carregar, existeSave } from './save/save.js';

/* ===================================================================
   BOOTSTRAP DA VERTICAL SLICE (seção 41 do documento de projeto).
   Cada sistema listado ali vira uma chamada aqui — não porque tudo
   precisa estar NESTE arquivo pra sempre, mas porque um bootstrap é
   exatamente o lugar certo pra provar que os módulos independentes
   (core/world/entities/combat/items/shop/ui/save) conseguem compor um
   loop de jogo real sem se conhecerem por dentro.
   =================================================================== */

const cena = new THREE.Scene();
cena.background = new THREE.Color(0x0c1a14);
cena.fog = new THREE.Fog(0x0c1a14, 18, 42);

cena.add(new THREE.HemisphereLight(0xbfe8ff, 0x2a3020, 0.9));
const luzDirecional = new THREE.DirectionalLight(0xfff2d0, 1.1);
luzDirecional.position.set(8, 14, 6);
cena.add(luzDirecional);

const renderizador = new THREE.WebGLRenderer({ canvas: document.getElementById('viewport'), antialias: true });
renderizador.setPixelRatio(Math.min(devicePixelRatio, 2));

const cameraRig = criarCameraRig();
const mapa = construirMapa(cena);

function redimensionar() {
  renderizador.setSize(window.innerWidth, window.innerHeight);
  cameraRig.redimensionar(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', redimensionar);
redimensionar();

// --- Jogador -------------------------------------------------------
const saveExistente = existeSave() ? carregar() : null;
const player = new Player({
  scene: cena,
  racaId: saveExistente?.racaId ?? 'humano',
  elemento: saveExistente?.elemento ?? 'fogo',
  spriteUrl: 'assets/characters/kael_sheet.png',
});
const PONTO_DE_SPAWN = { x: 0, y: 0, z: -4 };
if (saveExistente) {
  player.posicao.set(saveExistente.posicao.x, saveExistente.posicao.y, saveExistente.posicao.z);
  player.progresso = saveExistente.progresso;
  player.hp = saveExistente.hp;
  player.mp = saveExistente.mp;
  player.ouro = saveExistente.ouro;
  if (saveExistente.equipamentoId === ESPADA_DE_TREINO.id) equipar(player, ESPADA_DE_TREINO);
} else {
  player.posicao.set(PONTO_DE_SPAWN.x, PONTO_DE_SPAWN.y, PONTO_DE_SPAWN.z);
}

const inventario = criarInventario();
if (saveExistente?.inventario) {
  for (const pilha of Object.values(saveExistente.inventario)) {
    for (const entrada of pilha) adicionarItem(inventario, entrada.item, entrada.quantidade);
  }
} else {
  adicionarItem(inventario, POCAO_DE_ETER, 2);
}

// --- NPC -------------------------------------------------------------
const zelador = criarNpc({
  scene: cena,
  spriteUrl: 'assets/npcs/npc_zelador.png',
  posicao: { x: 2, y: 0, z: -2 },
  nome: 'Zelador',
  falas: [
    'Você deve ser novo na Academia — cuidado com o Vinculado rondando a ponte alta.',
    'Se quiser algo pra treinar, o Empório da Academia sempre tem uma espada sobrando.',
  ],
  lojaId: LOJA_ACADEMIA.id,
});
const npcs = [zelador];

// --- Mobs --------------------------------------------------------------
const lobo = criarMob({
  scene: cena, spriteUrl: 'assets/monsters/mob_ashwolf.webp',
  posicao: { x: -4, y: 0, z: -6 }, nome: 'Lobo-de-Cinza',
  hp: 22, dano: 4, elemento: 'terra', xp: 18, agressivo: false, raioPatrulha: 2.2,
});
const vinculado = criarMob({
  scene: cena, spriteUrl: 'assets/monsters/mob_shade.webp',
  posicao: { x: 9, y: 3, z: -18 }, nome: 'Vinculado da Ponte', // "Bound" — ameaça própria, não fauna comum
  hp: 55, dano: 9, elemento: 'trevas', xp: 60, agressivo: true, raioPatrulha: 1.5, velocidade: 2.1,
});
const mobs = [lobo, vinculado];

// --- Interativos -------------------------------------------------------
const interativos = [
  criarCaixaQuebravel({ scene: cena, posicao: { x: 1, y: 0, z: -1 }, drop: { ouro: 10 } }),
  criarBau({ scene: cena, posicao: { x: 8, y: 3, z: -22 }, itens: [{ item: ESPADA_DE_TREINO, quantidade: 1 }] }),
];

// --- Combate / UI --------------------------------------------------------
const mostrarDano = criarMostradorDeDano(cameraRig.camera);
const combate = criarCombate({
  player, mobs, mostrarDano,
  onMobMorto(mob) {
    player.ganharXp(mob.xp);
    player.ouro += Math.round(mob.xp * 0.6);
    // Aviso visual de "subiu de nível" fica pra próxima fatia — o HUD já
    // reflete nível/XP/ouro atualizados a cada frame (ver ui/hud.js).
  },
});
const minimapa = criarMinimapa();
const dialogo = criarDialogo();

const shopEl = document.getElementById('shop');
function abrirLoja(loja) {
  const lista = document.getElementById('shop-list');
  lista.innerHTML = '';
  for (const item of loja.itens) {
    const linha = document.createElement('div');
    linha.className = 'shop-item';
    linha.innerHTML = `<span>${item.nome} — ${item.preco}💰</span>`;
    const botao = document.createElement('button');
    botao.textContent = 'Comprar';
    botao.onclick = () => {
      const resultado = comprar(player, inventario, item);
      document.getElementById('shop-gold').textContent = `Seu ouro: ${player.ouro}`;
      if (!resultado.ok) { botao.textContent = 'Sem ouro'; return; }
      /* Sem tela de equipamento nesta fatia (seção 26 é sobre o dado
         existir, não sobre a UI de trocar peça) — equipar automático é
         o jeito mais simples de provar que comprar uma arma muda o
         dano de verdade, sem inventar uma tela de gerenciamento só
         pra isso. */
      if (item.tipo === 'equipamento') equipar(player, item);
    };
    linha.append(botao);
    lista.append(linha);
  }
  document.getElementById('shop-title').textContent = loja.nome;
  document.getElementById('shop-gold').textContent = `Seu ouro: ${player.ouro}`;
  shopEl.hidden = false;
}
document.getElementById('shop-close').onclick = () => { shopEl.hidden = true; };

// --- Loop de jogo --------------------------------------------------------
const relogio = new THREE.Clock();
document.getElementById('boot-status').hidden = true;

function interagirComOMaisProximo() {
  const candidatos = [
    ...npcs.map((n) => ({ tipo: 'npc', ref: n, dist: n.distanciaAte(player.posicao) })),
    ...interativos.map((o) => ({ tipo: o.tipo, ref: o, dist: o.posicao.distanceTo(player.posicao) })),
  ].filter((c) => c.dist < 2.2).sort((a, b) => a.dist - b.dist);
  const alvo = candidatos[0];
  if (!alvo) return;

  if (alvo.tipo === 'npc') {
    const npc = alvo.ref;
    const escolhas = npc.lojaId ? [
      { texto: 'Ver a loja', aoEscolher: () => abrirLoja(LOJA_ACADEMIA) },
      { texto: 'Só isso, obrigado.', aoEscolher: () => {} },
    ] : null;
    dialogo.mostrar(npc.nome, npc.falas, escolhas);
  } else if (alvo.tipo === 'caixa') {
    const drop = alvo.ref.interagir();
    if (drop?.ouro) player.ouro += drop.ouro;
  } else if (alvo.tipo === 'bau') {
    const itens = alvo.ref.interagir();
    if (itens) for (const entrada of itens) {
      adicionarItem(inventario, entrada.item, entrada.quantidade);
      if (entrada.item.tipo === 'equipamento') equipar(player, entrada.item);
    }
  }
}

function usarItemDoHotbar() {
  const pilha = inventario.consumiveis[0];
  if (!pilha) return;
  usarConsumivel(player, pilha.item);
  removerItem(inventario, pilha.item.id, 1);
}

function respawnarSeMorreu() {
  if (!player.morto) return;
  player.posicao.set(PONTO_DE_SPAWN.x, PONTO_DE_SPAWN.y, PONTO_DE_SPAWN.z);
  player.hp = Math.round(player.hpMax * 0.5);
  player.morto = false;
  player.velocidadeY = 0;
}

function loop() {
  requestAnimationFrame(loop);
  const deltaSeg = Math.min(0.05, relogio.getDelta());

  if (dialogo.ativo) {
    if (Input.apertou('confirmar') || Input.cliqueEsquerdo()) dialogo.avancar();
    Input.encerrarFrame();
    renderizador.render(cena, cameraRig.camera);
    return;
  }
  if (!shopEl.hidden) {
    if (Input.apertou('cancelar')) shopEl.hidden = true;
    Input.encerrarFrame();
    renderizador.render(cena, cameraRig.camera);
    return;
  }

  const intencao = {
    cima: Input.pressionando('cima'), baixo: Input.pressionando('baixo'),
    esquerda: Input.pressionando('esquerda'), direita: Input.pressionando('direita'),
    correr: Input.pressionando('correr'), pular: Input.apertou('pular'),
  };
  player.atualizar(deltaSeg, intencao, mapa);
  respawnarSeMorreu();

  for (const mob of mobs) mob.atualizar(deltaSeg, player.posicao);
  combate.tick(deltaSeg);
  combate.mobsAtacamJogador();
  if (Input.cliqueEsquerdo()) combate.ataqueBasico();
  if (Input.apertou('skill')) combate.usarSkill();
  if (Input.apertou('magia')) combate.usarMagia();
  if (Input.apertou('item')) usarItemDoHotbar();
  if (Input.apertou('interagir')) interagirComOMaisProximo();
  if (Input.apertou('salvar')) salvar(player, inventario);

  cameraRig.atualizar(deltaSeg, player.posicao);
  atualizarHud(player);
  minimapa.desenhar(player, npcs, mobs);

  Input.encerrarFrame();
  renderizador.render(cena, cameraRig.camera);
}
loop();

window.addEventListener('beforeunload', () => salvar(player, inventario));
