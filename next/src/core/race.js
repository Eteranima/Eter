/* ===================================================================
   RAÇAS — a Aliança (ver documento seções 8-13, 36)
   Cada raça dá bônus/afinidades de atributo, nunca uma classe: dois
   Humanos podem construir builds totalmente diferentes. Isso é dado
   puro (multiplicadores em cima do stat base), consumido igual pelo
   combate em tempo real e — mais adiante — pelo combate por turnos,
   como a arquitetura (seção 19/39) exige.
   =================================================================== */
export const RACAS = {
  humano: {
    nome: 'Humano',
    descricao: 'Adaptável — sem fraquezas, sem picos extremos.',
    bonus: { forca: 1, destreza: 1, constituicao: 1, inteligencia: 1, sabedoria: 1, sorte: 1 },
    afinidade: null,
  },
  elfo: {
    nome: 'Elfo',
    descricao: 'Conexão forte com o Éter natural — afinidade com Vento.',
    bonus: { forca: -1, destreza: 1, constituicao: -1, inteligencia: 2, sabedoria: 2, sorte: 1 },
    afinidade: 'vento',
  },
  lycan: {
    nome: 'Lycan',
    descricao: 'Natureza bestial — força e instinto acima da média.',
    bonus: { forca: 3, destreza: 2, constituicao: 1, inteligencia: -2, sabedoria: -1, sorte: 0 },
    afinidade: 'terra',
  },
  vampiro: {
    nome: 'Vampiro',
    descricao: 'Ligação com Sangue e Éter vital — regenera lutando.',
    bonus: { forca: 1, destreza: 2, constituicao: 0, inteligencia: 1, sabedoria: 0, sorte: 1 },
    afinidade: 'sangue',
    vidaAoAcertar: 0.08,
  },
  mortoVivo: {
    nome: 'Morto-Vivo',
    descricao: 'Já atravessou a morte — imune a venenos, frio para o resto.',
    bonus: { forca: 1, destreza: 0, constituicao: 3, inteligencia: 0, sabedoria: 1, sorte: -1 },
    afinidade: 'trevas',
  },
};

export function aplicarBonusRaca(statsBase, racaId) {
  const raca = RACAS[racaId];
  if (!raca) return { ...statsBase };
  const resultado = { ...statsBase };
  for (const [attr, valor] of Object.entries(raca.bonus)) {
    resultado[attr] = (resultado[attr] ?? 0) + valor;
  }
  return resultado;
}
