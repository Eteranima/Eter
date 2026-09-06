import * as THREE from 'three';

/* ===================================================================
   PLACEHOLDER visual de skill/magia (sem arte de efeito dedicada ainda
   — ver next/ESPECIFICACAO-DE-ARTE.md) — pedido explícito do usuário:
   tornar skill/magia visíveis AGORA com placeholder de código, arte de
   verdade vem depois. Geometria simples, sem textura nenhuma:
   - Skill (Golpe Giratório, física): anel horizontal que expande dos
     pés do jogador — lê como "impacto em área".
   - Magia (Lança de Éter em Chamas): esfera que viaja do jogador até
     cada alvo atingido — lê como "projétil".
   Cada efeito se remove sozinho ao terminar (geometria/material
   descartados de verdade, não só escondidos, pra não vazar memória
   numa sessão longa).
   =================================================================== */
export function criarSistemaDeVfx(scene) {
  const ativos = [];

  function limpar(efeito) {
    scene.remove(efeito.obj);
    efeito.obj.geometry.dispose();
    efeito.obj.material.dispose();
  }

  function criarOndaDeSkill(posicao, corHex = 0xdfe8ff) {
    const geometria = new THREE.RingGeometry(0.75, 1, 28);
    const material = new THREE.MeshBasicMaterial({
      color: corHex, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false,
    });
    const anel = new THREE.Mesh(geometria, material);
    anel.rotation.x = -Math.PI / 2;
    anel.position.set(posicao.x, posicao.y + 0.06, posicao.z);
    scene.add(anel);
    ativos.push({ tipo: 'anel', obj: anel, t: 0, duracao: 0.35, raioFinal: 2.4 });
  }

  function criarProjetilDeMagia(origem, destino, corHex = 0xff8a2a) {
    const geometria = new THREE.SphereGeometry(0.18, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: corHex });
    const esfera = new THREE.Mesh(geometria, material);
    const p0 = new THREE.Vector3(origem.x, origem.y + 1.1, origem.z);
    const p1 = new THREE.Vector3(destino.x, destino.y + 1.1, destino.z);
    esfera.position.copy(p0);
    scene.add(esfera);
    ativos.push({ tipo: 'projetil', obj: esfera, t: 0, duracao: 0.22, origem: p0, destino: p1 });
  }

  function atualizar(deltaSeg) {
    for (let i = ativos.length - 1; i >= 0; i--) {
      const efeito = ativos[i];
      efeito.t += deltaSeg;
      const progresso = Math.min(1, efeito.t / efeito.duracao);
      if (efeito.tipo === 'anel') {
        const raio = 0.3 + progresso * efeito.raioFinal;
        efeito.obj.scale.set(raio, raio, raio);
        efeito.obj.material.opacity = 0.85 * (1 - progresso);
      } else if (efeito.tipo === 'projetil') {
        efeito.obj.position.lerpVectors(efeito.origem, efeito.destino, progresso);
      }
      if (progresso >= 1) { limpar(efeito); ativos.splice(i, 1); }
    }
  }

  return { criarOndaDeSkill, criarProjetilDeMagia, atualizar };
}
