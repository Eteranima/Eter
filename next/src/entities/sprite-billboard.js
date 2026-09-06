import * as THREE from 'three';

/* ===================================================================
   BILLBOARD DE SPRITE 2D DENTRO DO MUNDO 3D
   A decisão da vertical slice (aprovada pelo usuário): mundo/câmera/
   altura/pulo são 3D de verdade (Three.js), mas personagem continua
   arte 2D pixelada — technique tipo HD-2D/Octopath, reaproveitando
   100% da arte de personagem já existente em vez de modelar do zero.

   Mesma convenção de linha↔direção do motor antigo (15-render.js:
   DIR_ROW/WALK_CYCLE) — quem reabrir uma folha de personagem antiga
   não precisa reaprender nada: down=0, left=1, right=2, up=3; coluna
   do meio é a pose parada, e o ciclo de andar é 1→0→1→2.
   =================================================================== */
const DIR_ROW = { down: 0, left: 1, right: 2, up: 3 };
const WALK_CYCLE = [1, 0, 1, 2];
const MS_POR_QUADRO = 130;

/** Sprite direcional (personagem/NPC) fatiado de uma folha 3 colunas × 4 linhas. */
export function criarBillboardDirecional(url, { cols = 3, rows = 4, alturaMundo = 1.8 } = {}) {
  const textura = new THREE.Texture();
  const estado = { dir: 'down', animT: 0, pronto: false, escalaBaseX: alturaMundo, escalaBaseY: alturaMundo };
  const material = new THREE.SpriteMaterial({ map: textura, transparent: true, alphaTest: 0.4 });
  const sprite = new THREE.Sprite(material);
  sprite.center.set(0.5, 0); // ancora no PÉ, não no centro — mesma ideia de sempre no projeto

  const imagem = new Image();
  imagem.onload = () => {
    textura.image = imagem;
    textura.colorSpace = THREE.SRGBColorSpace;
    textura.magFilter = THREE.NearestFilter;
    textura.minFilter = THREE.NearestFilter;
    textura.generateMipmaps = false;
    textura.wrapS = THREE.ClampToEdgeWrapping;
    textura.wrapT = THREE.ClampToEdgeWrapping;
    textura.repeat.set(1 / cols, 1 / rows);
    textura.needsUpdate = true;
    const proporcao = (imagem.naturalWidth / cols) / (imagem.naturalHeight / rows);
    estado.escalaBaseX = alturaMundo * proporcao;
    estado.escalaBaseY = alturaMundo;
    sprite.scale.set(estado.escalaBaseX, estado.escalaBaseY, 1);
    aplicarFrame(1, DIR_ROW.down);
    estado.pronto = true;
  };
  imagem.src = url;

  function aplicarFrame(col, row) {
    textura.offset.set(col / cols, 1 - (row + 1) / rows);
  }

  /** Chamar todo frame com o delta em ms e se o personagem está andando. */
  function tick(deltaMs, movendo, direcao) {
    if (!estado.pronto) return;
    if (direcao) estado.dir = direcao;
    if (movendo) {
      estado.animT += deltaMs;
      const indice = Math.floor(estado.animT / MS_POR_QUADRO) % WALK_CYCLE.length;
      aplicarFrame(WALK_CYCLE[indice], DIR_ROW[estado.dir] ?? 0);
    } else {
      estado.animT = 0;
      aplicarFrame(1, DIR_ROW[estado.dir] ?? 0);
    }
  }

  /* PLACEHOLDER de animação de golpe (sem arte de ataque dedicada
     ainda — ver next/ESPECIFICACAO-DE-ARTE.md): "squash & stretch" no
     próprio sprite em cima da escala base, nunca substituindo ela. */
  function aplicarFatorEscala(fatorX, fatorY) {
    sprite.scale.set(estado.escalaBaseX * fatorX, estado.escalaBaseY * fatorY, 1);
  }

  return { sprite, tick, aplicarFatorEscala };
}

/** Sprite estático (mob/prop) — sem grade, a imagem inteira é o quadro. */
export function criarBillboardEstatico(url, { alturaMundo = 1.4 } = {}) {
  const material = new THREE.SpriteMaterial({ transparent: true, alphaTest: 0.3 });
  const sprite = new THREE.Sprite(material);
  sprite.center.set(0.5, 0);
  sprite.scale.set(alturaMundo, alturaMundo, 1);

  new THREE.TextureLoader().load(url, (textura) => {
    textura.magFilter = THREE.NearestFilter;
    textura.minFilter = THREE.NearestFilter;
    textura.generateMipmaps = false;
    textura.colorSpace = THREE.SRGBColorSpace;
    material.map = textura;
    material.needsUpdate = true;
    const proporcao = textura.image.width / textura.image.height;
    sprite.scale.set(alturaMundo * proporcao, alturaMundo, 1);
  });

  /** Espelha o desenho (mob virado pra esquerda/direita), sem mexer na âncora. */
  function virarPara(esquerda) {
    sprite.scale.x = Math.abs(sprite.scale.x) * (esquerda ? -1 : 1);
  }
  /* PLACEHOLDER de reação a dano (sem arte de "hit" dedicada ainda —
     ver next/ESPECIFICACAO-DE-ARTE.md): tinge o sprite de vermelho por
     um instante multiplicando a cor do material (não altera pixels da
     textura original). */
  function piscarImpacto() {
    material.color.setHex(0xff5a4a);
    setTimeout(() => material.color.setHex(0xffffff), 110);
  }
  return { sprite, virarPara, piscarImpacto };
}
