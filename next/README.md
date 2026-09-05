# Éter Anima — Vertical Slice (nova arquitetura)

Fundação técnica nova de Éter Anima, construída do zero conforme
`Eter_Anima_Novo_Projeto.md`. Substitui a arquitetura antiga (`src/`
nesta mesma raiz de repositório) — este diretório é auto-contido e não
depende de nada em `src/`, `tools/` ou `tests/` da árvore antiga.

## Decisão técnica

Mundo, câmera, altura e física de pulo são **3D de verdade** via
[Three.js](https://threejs.org) (WebGL) — a única forma real de dar
profundidade/plataformas/câmera dinâmica (seções 16-17 do documento de
projeto). Personagens continuam **sprites 2D pixelados** (technique
tipo HD-2D/Octopath Traveler) desenhados como billboards que sempre
encaram a câmera — reaproveita 100% da arte de personagem já existente
em `src/assets/`, sem precisar modelar nada em 3D.

Zero build step: Three.js está vendorizado em `vendor/three.module.js`
(build ESM oficial, r160, MIT — ver `THIRD_PARTY_NOTICES.md` na raiz) e
carregado via `<script type="importmap">` em `index.html`. Todo o
código é ES modules puro.

## Como rodar

```bash
cd next
python3 -m http.server 8000
# abrir http://localhost:8000/index.html num navegador com WebGL
```

Precisa de um navegador de verdade com WebGL habilitado — **não abra
via `file://`** (import maps e módulos ES exigem `http(s)://`).

## Controles

WASD/setas move · Shift corre · Espaço pula · E interage (NPC/caixa/
baú) · clique esquerdo ataque básico · 1 skill · 2 magia · 3 usa poção
· Z confirma diálogo · X cancela/fecha loja · K salva manualmente
(também salva sozinho ao fechar a aba).

## O que está implementado (seção 41 do documento — vertical slice)

| # | Item | Onde |
|---|---|---|
| 1-6 | Personagem jogável, raça, movimento, corrida, pulo, câmera seguindo | `entities/player.js`, `world/camera-rig.js` |
| 7-9 | Mapa pequeno, alturas reais, escadas | `world/map.js` |
| 10 | Objetos interativos (caixa quebrável, baú) | `world/interactive.js` |
| 11 | Um NPC (Zelador, com diálogo + abre loja) | `entities/npc.js` |
| 12-13 | Um mob comum (Lobo) e um Bound agressivo (Vinculado) | `entities/mob.js` |
| 14-16 | Combate Action RPG em tempo real, HP, Mana | `combat/combat.js`, `entities/player.js` |
| 17-18 | Uma Skill, uma Magia | `combat/skills.js`, `combat/magic.js` |
| 19 | Sistema elemental básico (4 primários + 5 especiais) | `core/elements.js` |
| 20-22 | Inventário, um equipamento, um consumível | `items/*.js` |
| 23 | Uma loja | `shop/shop.js` |
| 24 | Minimapa | `ui/minimap.js` |
| 25 | Interação ambiental | `world/interactive.js` |
| 26 | Save básico (localStorage) | `save/save.js` |
| 27 | Estrutura preparada pro combate por turnos | `combat/turn-based-stub.js` (interface só, não implementado — ver comentário no arquivo) |

## Limitações conhecidas e próximos passos

- **Sem criação de personagem**: raça/elemento vêm fixos no boot
  (`humano`/`fogo`, `src/main.js`). Fácil de expor como tela depois.
- **Câmera fixa atrás do jogador**, sem órbita nem colisão contra
  parede — se uma parede ficar entre câmera e personagem, a câmera
  atravessa (clipping). Correto pra provar altura/profundidade, não
  pra uma câmera de produção.
- **Mob não tem física própria** (não sobe/desce escada, não cai) —
  fica pinado na altura de onde nasceu. Funciona porque os dois mobs
  desta fatia nunca saem da própria plataforma.
- **HUD "subiu de nível" é só numérico** (a barra de XP/nível já
  reflete em tempo real) — sem popup/celebração visual ainda.
- **Loja com estoque fixo**, sem restock nem preço dinâmico.
- **Um equip automático** ao comprar/pegar arma (sem tela de gerenciar
  equipamento) — proposital pra esta fatia, ver comentário em
  `main.js`.
- **World map / fast travel** (seções 23-24) não entraram nesta
  fatia — o documento já separa isso como sistema à parte do mapa
  local, não item mínimo da vertical slice (seção 41 não pede).

## Como isto foi verificado

- Toda a camada de dados/lógica pura (elemental, raças, atributos,
  progressão/XP, inventário) — testada diretamente em Node, sem
  navegador.
- Colisão de altura do mapa (`alturaDoChao`) e física do jogador
  (gravidade, pulo, escada, rede de segurança contra buraco de
  colisão) — simulada em Node com stubs mínimos de `Image`/`document`,
  centenas de frames, incluindo um bug real encontrado e corrigido
  (arena mais larga que o chão real deixava uma coluna sem piso nenhum
  — ver histórico do commit).
- Loop de combate completo (jogador ataca mob até morrer → XP/ouro
  concedidos; mob agressivo ataca o jogador de volta → HP cai; jogador
  mata o segundo mob) — simulado em Node ponta a ponta.
- **Renderização 3D em si (Three.js/WebGL) não foi verificada
  visualmente** — o ambiente usado nesta sessão não conseguiu criar um
  contexto WebGL (`getContext('webgl')` retornou `false` mesmo fora do
  Three.js, uma limitação do sandbox de teste, não do código). Preciso
  que você abra `next/index.html` num navegador de verdade (ou me deixe
  conectar ao Claude in Chrome) pra eu confirmar visualmente câmera,
  profundidade, sprites e HUD antes de considerar isto "pronto".
