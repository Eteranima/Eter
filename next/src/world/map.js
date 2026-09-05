import * as THREE from 'three';

/* ===================================================================
   MAPA DA VERTICAL SLICE — prova de profundidade real (seção 16).
   Camada de RUAS (chão, y=0) → escada leste sobe pra PLATAFORMAS +
   PONTE (y=3) → escada sul desce pro SUBSOLO (y=-2). Nada disso é
   ilusão de perspectiva: é geometria 3D de verdade, com colisão de
   verdade — o mesmo motivo de termos escolhido Three.js em vez de
   continuar em canvas 2D.

   Colisão de chão é "heightmap por sobreposição de retângulo": cada
   `plataforma` cobre uma área (minX/maxX/minZ/maxZ) e uma altura
   (topY). A cada frame, `alturaDoChao(x,z,yAtual)` pega a maior
   plataforma cuja altura ainda é alcançável a partir de onde o
   personagem está (yAtual + tolerância de degrau) — é o que deixa
   subir uma escada andando normalmente, mas ainda cair de verdade ao
   sair da borda de uma plataforma sem escada nenhuma por perto (ver o
   buraco do subsolo: o chão simplesmente não existe lá, viver com
   isso é a queda). */
const TOLERANCIA_DEGRAU = 0.42;

function retangulo(minX, maxX, minZ, maxZ, topY) {
  return { minX, maxX, minZ, maxZ, topY };
}

export function construirMapa(scene) {
  const plataformas = [];
  const grupoVisual = new THREE.Group();
  scene.add(grupoVisual);

  function adicionarBloco(minX, maxX, minZ, maxZ, topY, altura, cor) {
    plataformas.push(retangulo(minX, maxX, minZ, maxZ, topY));
    const largura = maxX - minX, profundidade = maxZ - minZ;
    const geometria = new THREE.BoxGeometry(largura, altura, profundidade);
    const material = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.9 });
    const malha = new THREE.Mesh(geometria, material);
    malha.position.set((minX + maxX) / 2, topY - altura / 2, (minZ + maxZ) / 2);
    grupoVisual.add(malha);
    return malha;
  }

  // Chão principal ("ruas") — para antes do buraco do subsolo (z>2).
  adicionarBloco(-12, 12, -12, 2, 0, 1, 0x3a5a3a);

  // Escada leste sobe do chão (y=0) até a plataforma alta (y=3).
  const DEGRAUS_SOBEM = 6, ALTURA_DEGRAU = 0.5;
  for (let i = 0; i < DEGRAUS_SOBEM; i++) {
    const z0 = -9 + i * 1.2, z1 = z0 + 1.2;
    adicionarBloco(9, 12, z0, z1, ALTURA_DEGRAU * (i + 1), 0.5, 0x6a5a4a);
  }
  // Plataforma alta + ponte + segunda plataforma alta.
  adicionarBloco(6, 12, -16, -9, 3, 1, 0x4a5a6a);
  adicionarBloco(9, 11, -20, -16, 3, 0.4, 0x8a7a5a); // ponte, mais fina
  adicionarBloco(6, 12, -24, -20, 3, 1, 0x4a5a6a);

  // Escada sul desce do chão (y=0) até o subsolo (y=-2).
  const DEGRAUS_DESCEM = 4;
  for (let i = 0; i < DEGRAUS_DESCEM; i++) {
    const z0 = 2 + i * 1.2, z1 = z0 + 1.2;
    adicionarBloco(-2, 2, z0, z1, -0.5 * (i + 1), 0.5, 0x3a3040);
  }
  adicionarBloco(-10, 10, 6.8, 16, -2, 1, 0x2a2434); // piso do subsolo
  // "Parede" do subsolo só pra dar leitura visual de caverna — não é
  // sólida pro jogador (o teto ficaria alto demais pra colidir).
  const paredeSubsolo = new THREE.Mesh(
    new THREE.BoxGeometry(20, 3, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x1c1826, roughness: 1 }),
  );
  paredeSubsolo.position.set(0, -2 + 1.5, 16);
  grupoVisual.add(paredeSubsolo);

  function alturaDoChao(x, z, yAtual) {
    let melhor = -Infinity;
    for (const p of plataformas) {
      if (x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ) {
        if (p.topY <= yAtual + TOLERANCIA_DEGRAU && p.topY > melhor) melhor = p.topY;
      }
    }
    return melhor;
  }

  /* Retângulo que envolve TODA a pegada real das plataformas (não é
     exato nos cantos — a pegada de verdade é irregular — mas reduz
     bastante quanto o jogador consegue chegar perto de uma coluna sem
     chão nenhum; a rede de segurança em Player.atualizar() cobre o
     resto). */
  const LIMITE_X = [-11.6, 11.6], LIMITE_Z = [-23.6, 15.6];
  function limitarNaArena(x, z) {
    return [
      Math.max(LIMITE_X[0], Math.min(LIMITE_X[1], x)),
      Math.max(LIMITE_Z[0], Math.min(LIMITE_Z[1], z)),
    ];
  }

  return { alturaDoChao, limitarNaArena, plataformas };
}
