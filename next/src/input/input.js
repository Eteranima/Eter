/* Teclado cru: mantém o estado "tecla pressionada agora" e uma fila de
   "acabou de apertar" (edge) pra ações de um disparo só (pular,
   interagir, skill) não repetirem a cada frame enquanto a tecla fica
   presa. */
const pressionadas = new Set();
const apertadasNesteFrame = new Set();

const MAPA_TECLAS = {
  ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita',
  KeyW: 'cima', KeyS: 'baixo', KeyA: 'esquerda', KeyD: 'direita',
  ShiftLeft: 'correr', ShiftRight: 'correr',
  Space: 'pular',
  KeyE: 'interagir',
  KeyZ: 'confirmar',
  KeyX: 'cancelar',
  Digit1: 'skill', Digit2: 'magia', Digit3: 'item',
  KeyK: 'salvar',
  KeyI: 'inventario',
};

window.addEventListener('keydown', (evento) => {
  const acao = MAPA_TECLAS[evento.code];
  if (!acao) return;
  if (!pressionadas.has(acao)) apertadasNesteFrame.add(acao);
  pressionadas.add(acao);
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(evento.code)) evento.preventDefault();
});
window.addEventListener('keyup', (evento) => {
  const acao = MAPA_TECLAS[evento.code];
  if (acao) pressionadas.delete(acao);
});
window.addEventListener('blur', () => { pressionadas.clear(); });

let cliqueEsquerdoNesteFrame = false;
window.addEventListener('mousedown', (evento) => {
  if (evento.button === 0 && evento.target.closest('#viewport')) cliqueEsquerdoNesteFrame = true;
});

export const Input = {
  pressionando(acao) { return pressionadas.has(acao); },
  apertou(acao) { return apertadasNesteFrame.has(acao); },
  cliqueEsquerdo() { return cliqueEsquerdoNesteFrame; },
  /** Chamado uma vez por frame, depois de todo mundo ler `apertou()`. */
  encerrarFrame() { apertadasNesteFrame.clear(); cliqueEsquerdoNesteFrame = false; },
};
