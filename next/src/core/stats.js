/* ===================================================================
   ATRIBUTOS (seção 20) e fórmulas derivadas.
   HP/Mana nascem de Constituição/Inteligência — não são digitados à
   mão por personagem, então balancear um atributo já refletiliza tudo
   que depende dele (o mesmo princípio "orientado a dados" da seção 40).
   =================================================================== */
export function statsBase() {
  return {
    forca: 5, destreza: 5, constituicao: 5,
    inteligencia: 5, sabedoria: 5, sorte: 5,
  };
}

export function hpMaximo(stats, nivel) {
  return Math.round(30 + stats.constituicao * 6 + nivel * 8);
}
export function manaMaxima(stats, nivel) {
  return Math.round(15 + stats.inteligencia * 4 + stats.sabedoria * 2 + nivel * 4);
}
export function danoFisicoBase(stats) {
  return 3 + stats.forca * 1.2;
}
export function danoMagicoBase(stats) {
  return 3 + stats.inteligencia * 1.3;
}
export function velocidadeMovimento(stats) {
  /* Destreza afeta pouco de propósito — corrida (shift) é o que muda o
     ritmo de exploração de verdade; destreza deveria decidir combate
     (chance de crítico/esquiva), não virar corrida de atributo. */
  return 3.2 + stats.destreza * 0.02;
}
export function chanceCritico(stats) {
  return Math.min(0.35, 0.03 + stats.sorte * 0.01 + stats.destreza * 0.005);
}

export function experienciaParaProximoNivel(nivel) {
  return Math.round(40 * Math.pow(nivel, 1.35));
}

export function criarProgresso() {
  return { nivel: 1, xp: 0, proximo: experienciaParaProximoNivel(1) };
}

/** Aplica XP e retorna quantos níveis subiram (0 se nenhum). */
export function ganharXp(progresso, quantidade) {
  progresso.xp += quantidade;
  let subiu = 0;
  while (progresso.xp >= progresso.proximo) {
    progresso.xp -= progresso.proximo;
    progresso.nivel += 1;
    progresso.proximo = experienciaParaProximoNivel(progresso.nivel);
    subiu += 1;
  }
  return subiu;
}
