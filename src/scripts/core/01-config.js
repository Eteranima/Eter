/* ===================================================================
   1. CONFIG + UTIL
   =================================================================== */
const APP_VERSION = '5.31.0';
const SAVE_KEY    = 'eter-anima:jrpg:v3';

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');
const W = 800, H = 600, TILE = 32;

// Ritmo do jogo. Tudo em segundos — nada mais depende de framerate.
const MOVE_DUR   = 0.16;   // duração de um passo (tile → tile)
const RUN_MULT   = 0.62;   // multiplicador de duração ao correr (shift)
const ANIM_STEP  = 0.09;   // troca de quadro do ciclo de caminhada

const FONT_PX  = n => `${n}px "Press Start 2P", ui-monospace, monospace`;
const FONT_UI  = n => `${n}px Inter, system-ui, sans-serif`;

const clamp  = (v,a,b) => v < a ? a : v > b ? b : v;
const lerp   = (a,b,t) => a + (b - a) * t;
const rnd    = (a=1,b=0) => b + Math.random() * (a - b);
const rndInt = (a,b) => Math.floor(rnd(b + 1, a));
const chance = p => Math.random() < p;
const pick   = arr => arr[Math.floor(Math.random() * arr.length)];
const easeOut = t => 1 - (1 - t) * (1 - t);
const easeIn  = t => t * t;
const clone  = o => JSON.parse(JSON.stringify(o));
const sum    = arr => arr.reduce((a,b)=>a+b,0);
