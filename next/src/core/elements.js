/* ===================================================================
   SISTEMA ELEMENTAL
   4 elementos primários (Fogo/Água/Terra/Vento) + 5 especiais nascidos
   da corrupção do Éter pelos Demônios (Gelo/Areia/Sangue/Luz/Trevas).
   Ver Eter_Anima_Novo_Projeto.md seções 4 e 5 — a combinação entre
   primários é o que gera os especiais, então o anel de vantagem
   também é montado a partir dessa origem, não arbitrário.

   MULT_STRONG/MULT_WEAK são os multiplicadores de dano; qualquer par
   fora do anel abaixo é neutro (1x). Isso é dado, não código — testar
   uma combinação nova ou trocar uma vantagem é editar ELEM_CHART, não
   mexer em calcularDano().
   =================================================================== */
export const MULT_STRONG = 1.5;
export const MULT_WEAK = 0.65;

export const ELEMENTOS_PRIMARIOS = ['fogo', 'agua', 'terra', 'vento'];
export const ELEMENTOS_ESPECIAIS = ['gelo', 'areia', 'sangue', 'luz', 'trevas'];
export const ELEMENTOS = [...ELEMENTOS_PRIMARIOS, ...ELEMENTOS_ESPECIAIS];

export const ELEM_INFO = {
  fogo: { nome: 'Fogo', cor: '#ff6a3a' },
  agua: { nome: 'Água', cor: '#4a9eff' },
  terra: { nome: 'Terra', cor: '#a97c4a' },
  vento: { nome: 'Vento', cor: '#7ee0cc' },
  gelo: { nome: 'Gelo', cor: '#bfe8ff' },
  areia: { nome: 'Areia', cor: '#d8c48a' },
  sangue: { nome: 'Sangue', cor: '#c93a4a' },
  luz: { nome: 'Luz', cor: '#fff2b0' },
  trevas: { nome: 'Trevas', cor: '#7a4aa0' },
};

/* Anel primário clássico (fogo>vento>terra>agua>fogo) mais os cinco
   especiais encaixados como a corrupção de um elemento primário
   específico — cada especial é forte contra a origem que o corrompeu
   (rompe o ciclo natural) e fraco contra o oposto dela. Combinação
   nova? Adicione uma linha aqui, não um `if` em outro lugar. */
const ELEM_CHART = {
  fogo: { vento: MULT_STRONG, agua: MULT_WEAK, gelo: MULT_STRONG },
  agua: { fogo: MULT_STRONG, terra: MULT_WEAK, areia: MULT_STRONG },
  terra: { agua: MULT_STRONG, vento: MULT_WEAK, sangue: MULT_STRONG },
  vento: { terra: MULT_STRONG, fogo: MULT_WEAK, luz: MULT_STRONG },
  gelo: { agua: MULT_STRONG, fogo: MULT_WEAK },
  areia: { terra: MULT_STRONG, agua: MULT_WEAK },
  sangue: { vento: MULT_STRONG, terra: MULT_WEAK },
  luz: { trevas: MULT_STRONG, vento: MULT_WEAK },
  trevas: { luz: MULT_STRONG },
};

export function multiplicadorElemental(atacante, defensor) {
  return ELEM_CHART[atacante]?.[defensor] ?? 1;
}
