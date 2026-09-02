# 15 — Arquitetura Modular JavaScript

**Propósito:** refatorar o `game.js` monolítico (4.100+ linhas) em módulos independentes, especializados por domínio, permitindo:
- Reutilização de dados entre cenas de desenvolvimento
- Teste isolado de mecânicas (combate, progressão, economia)
- Evolução independente (novos personagens, inimigos, chefes, dificuldades)
- Separação clara entre dados, lógica e apresentação

---

## Visão geral da modularização

```
┌─ data/
│  ├─ characters.js        # 5 personagens, base + crescimento, habilidades
│  ├─ creatures.js         # 9 criaturas comuns, formações
│  ├─ bosses.js            # 2 chefes, IA especial
│  ├─ items.js             # consumíveis, armas, armaduras, talismãs
│  ├─ elements.js          # anel elemental, condições, multiplicadores
│  ├─ shops.js             # catálogos, destravamento por flag
│  ├─ maps.js              # 7 áreas, conectividade, spawn rules
│  └─ abilities.js         # todas as habilidades (personagem, inimigo, chefe, Ressonância)
│
├─ systems/
│  ├─ combat.js            # turno, ordem SPD, cálculo de dano, Ressonância
│  ├─ progression.js       # níveis, EXP, curva, crescimento de atributo
│  ├─ conditions.js        # aplicação/remoção de condições, duração, efeito por turno
│  ├─ economy.js           # ouro, venda de itens, recompensas
│  └─ save.js              # serialização, versionamento de save, validação
│
├─ ui/
│  ├─ battle.js            # renderização de combate, log, seleção de ação
│  ├─ menu.js              # equipamento, status, opções
│  ├─ dialogue.js          # caixas de texto, NPCs, escolhas
│  ├─ hud.js               # barra de HP/MP, ordem de turno, condições
│  └─ screen.js            # trocas de cena, fade, transição
│
└─ game.js                 # orquestrador: loop de jogo, estado global, I/O
```

---

## Detalhamento por módulo

### `data/characters.js` — Personagens

**Responsabilidade:** definição estática de todos os 5 personagens.

**Exports:**
```javascript
export const CHARACTERS = {
  seiji: { name: 'Seiji', role: 'Escriba', element: 'Tinta', 
           base: { hp: 85, mp: 40, atk: 18, def: 12, spd: 15 },
           growth: { hp: 9, mp: 5, atk: 2.2, def: 1.6, spd: 1.5 },
           abilityIds: ['tinta-cortante', 'mancha-viva', 'maré-nanquim'],
           resonanceId: 'codice-fundo' },
  ophelia: { /* ... */ },
  marin: { /* ... */ },
  gabriel: { /* ... */ },
  max: { /* ... */ }
};

export function getCharacterStats(charId, level) => { hp, mp, atk, def, spd }
export function getCharacterAbilities(charId, upToLevel) => [{ id, name, cost, ... }]
```

**Usos:**
- Inicializar party no novo jogo
- Recuperar stats ao subir de nível
- Listar habilidades disponíveis no menu

---

### `data/creatures.js` — Bestiário

**Responsabilidade:** 9 criaturas comuns + formações por área.

**Exports:**
```javascript
export const CREATURES = {
  'lobo-eter': { name: 'Lobo de Éter', level: 3, element: 'Neutro', form: 'beast',
                 hp: 360, atk: 28, def: 8, spd: 18,
                 abilityIds: ['mordida', 'uivo-elemental'],
                 reward: { exp: 88, gold: 46 }, drops: [{ id: 'pocao', chance: 0.3 }] },
  // ...
};

export const FORMATIONS = {
  patio: [
    ['lobo-eter'],
    ['lobo-eter', 'lobo-eter'],
    ['sombra-corrompida'],
    ['fatua-voltaica', 'lobo-eter']
  ],
  // ...
};

export function getRandomFormation(area) => creatureIds[]
```

**Usos:**
- Gerar encontros aleatórios ao andar
- Recuperar stats do inimigo em combate
- Atribuir recompensa ao vencer

---

### `data/bosses.js` — Chefes

**Responsabilidade:** 2 chefes com lógica de IA especial.

**Exports:**
```javascript
export const BOSSES = {
  'o-selo-quebrado': {
    name: 'O Selo Quebrado', level: 10, element: 'Trevas',
    hp: 4200, atk: 80, def: 20, spd: 14,
    resistances: { 'Luz': 1.9, 'Trevas': 0.35 },
    abilityIds: ['selo-rompido', 'colapso-veu', 'devorar-eter', 'reintegrar'],
    ai: { prefersArea: 0.5, healThreshold: 0.32 }
  },
  // ...
};

export function runBossAI(bossId, gameState) => { targetId, abilityId }
```

**Usos:**
- Disparo de combate de chefe
- Decisão de ação do chefe por turno

---

### `data/items.js` — Inventário

**Responsabilidade:** todos os consumíveis e equipamentos com preços.

**Exports:**
```javascript
export const ITEMS = {
  consumables: {
    'pocao': { name: 'Poção', effect: 'heal', power: 60, price: 60 },
    'sal-purificador': { name: 'Sal Purificador', effect: 'cure-conditions', price: 80 },
    // ...
  },
  equipment: {
    weapons: {
      'lamina-treino': { name: 'Lâmina de Treino', slot: 'weapon', bonus: { atk: 5 },
                         element: null, price: 120 },
      'lamina-selo': { /* Luz, high ATK */ },
      // ...
    },
    armor: { /* ... */ },
    talismans: { /* ... */ }
  }
};

export function getItemValue(itemId) => number (preço)
export function getItemEffect(itemId) => { type, power?, condition?, ... }
```

**Usos:**
- Renderizar lojas
- Aplicar consumível em combate
- Calcular stats equipados

---

### `data/elements.js` — Anel Elemental

**Responsabilidade:** relações entre elementos, condições, multiplicadores.

**Exports:**
```javascript
export const ELEMENTS = ['fogo', 'sangue', 'trevas', 'luz', 'tinta', 'eletricidade', 'gelo', 'neutro'];

export const RING = [
  'fogo', 'sangue', 'trevas', 'luz', 'tinta', 'eletricidade', 'gelo' // neutro não entra
];

export const CONDITIONS = {
  queimadura: { element: 'fogo', duration: 3, effect: (charStats) => ({ dmgPerTurn: charStats.hp * 0.06, atkPenalty: 0.15 }) },
  congelado: { element: 'gelo', duration: 2, effect: (charStats) => ({ spdPenalty: 0.5, skipTurnChance: 0.35 }) },
  // ...
};

export function getElementEffectiveness(attacker, defender) => 1.6 | 1.0 | 0.65
export function getConditionForElement(element) => conditionId
export function applyConditionEffect(condition, target) => void
```

**Usos:**
- Cálculo de dano em combate
- Aplicação de condição após habilidade
- Verificação de imunidade

---

### `data/abilities.js` — Habilidades

**Responsabilidade:** todas as habilidades (personagem, inimigo, chefe, Ressonância).

**Exports:**
```javascript
export const ABILITIES = {
  'tinta-cortante': { name: 'Tinta Cortante', learnLevel: 1, mp: 6, element: 'Tinta',
                      targeting: 'single', power: 18, effect: null },
  'mancha-viva': { name: 'Mancha Viva', learnLevel: 1, mp: 12, element: 'Tinta',
                   targeting: 'single', power: 18, condition: { type: 'cegueira', chance: 0.55 } },
  'maré-nanquim': { name: 'Maré de Nanquim', learnLevel: 8, mp: 22, element: 'Tinta',
                    targeting: 'all-enemies', power: 20, effect: null },
  // Ressonâncias
  'codice-fundo': { name: 'Códice Sem Fundo', type: 'resonance', charId: 'seiji',
                    mp: 0, resonance: 100, targeting: 'all-enemies', power: 45, effect: null },
  // Inimigos
  'mordida': { name: 'Mordida', power: 20, targeting: 'single' },
  'uivo-elemental': { name: 'Uivo Elemental', power: 14, targeting: 'all', element: 'Neutro' },
  // ...
};

export function getAbility(abilityId) => { name, mp, power, targeting, element, condition, ... }
export function calculateDamage(attacker, defender, ability, multipler) => number
export function isAOE(abilityId) => boolean
```

**Usos:**
- Renderizar menu de combate
- Calcular dano ao atacar
- Aplicar efeito de habilidade

---

### `systems/combat.js` — Mecânica de Combate

**Responsabilidade:** turno, ordem SPD, cálculo de dano, Ressonância, cálculo de crítico.

**Exports:**
```javascript
export class BattleState {
  constructor(party, enemies) { /* inicializa */ }
  
  getCurrentActor() => characterId | creatureId
  getActionOptions(actorId) => [{ action, target, isValid }]
  executeAction(actorId, action, targetId) => { damage, condition, heal, ... }
  applyDamage(targetId, damage) => void
  applyHealing(targetId, healing) => void
  resolveRound() => void
  getResonanceGain(character, event) => number
  isCharacterDefeated(charId) => boolean
  isBattleOver() => { won: boolean, lost: boolean }
}

export function calculateDamage(attacker, ability, defender) => number
export function calculateCriticalChance(attacker, defender) => number
export function getDEFReduction(def, dmg) => number
```

**Usos:**
- Loop principal de combate
- Determinação de ordem de turno
- Cálculo de dano e Ressonância

---

### `systems/progression.js` — Progressão

**Responsabilidade:** níveis, EXP, crescimento de atributo.

**Exports:**
```javascript
export function getEXPForLevel(level) => number
export function addEXP(character, amount) => { leveledUp: boolean, newLevel?: number }
export function recalculateStats(character, newLevel) => { hp, mp, atk, def, spd, newSkills }
export function getCharacterLevel(exp) => number
export function getExpToNextLevel(currentExp) => number
```

**Usos:**
- Cálculo de recompensa após combate
- Subida de nível
- Recálculo de stats ao subir

---

### `systems/save.js` — Persistência

**Responsabilidade:** serialização, validação, versionamento de save.

**Exports:**
```javascript
export function serializeGame(gameState) => JSON string
export function deserializeGame(jsonString) => gameState | null
export function validateSave(save) => { valid: boolean, errors: string[] }
export function getMigration(fromVersion, toVersion) => function
export const SAVE_VERSION = 3
```

**Usos:**
- Salvar ao cristal de ressonância
- Carregar save ao abrir jogo
- Validar integridade

---

### `ui/battle.js` — Renderização de Combate

**Responsabilidade:** desenho de combate, log, seleção de ação.

**Exports:**
```javascript
export class BattleUI {
  constructor(ctx, canvas) { /* */ }
  
  drawBattle(state) => void
  drawLog(messages) => void
  drawActionMenu(options) => void
  renderDamageNumber(x, y, damage) => void
  highlightTarget(targetId) => void
}
```

**Usos:**
- Frame-by-frame de combate
- Animação de dano
- Menu de seleção de ação/alvo

---

### `ui/menu.js` — Menu e Status

**Responsabilidade:** telas de equipamento, status, opções.

**Exports:**
```javascript
export class MenuUI {
  constructor(ctx, canvas) { /* */ }
  
  drawStatus(character) => void
  drawEquipment(character, items) => void
  drawInventory(items) => void
  handleEquip(character, itemId) => { success: boolean }
}
```

**Usos:**
- Visualizar stats
- Equip/unequip items
- Consumir itens fora de combate

---

### `data/shops.js` — Economia

**Responsabilidade:** catálogos de loja, preços, destravamento por flag.

**Exports:**
```javascript
export const SHOPS = {
  'emporio-academia': {
    name: 'Empório da Academia',
    location: 'patio',
    initialStock: ['pocao', 'elixir-eter', 'sal-purificador', 'lamina-treino', 'tunica-aluno'],
    unlockFlag: null, // sempre aberto
    unlockedAfterFlag: 'sealed-selo-quebrado', // abre após chefe 1
    unlockedStock: ['estilete-nanquim', 'foice-geada', 'manto-refor', 'amuleto-vital']
  },
  'mercador-errante': {
    name: 'Mercador Errante',
    location: 'galeria-profunda',
    initialStock: ['pocao-suprema', 'eter-destilado', 'punho-brasa', 'coura-selada'],
    unlockedAfterFlag: 'defeated-eco-primeiro',
    unlockedStock: ['lamina-selo', 'veste-abismo']
  }
};

export function getShopStock(shopId, flags) => itemIds[]
```

**Usos:**
- Renderizar loja
- Habilitar compra conforme progresso
- Calcular preço de compra/venda

---

### `data/maps.js` — Mundo

**Responsabilidade:** 7 áreas, conectividade, spawn rules, NPCs.

**Exports:**
```javascript
export const MAPS = {
  'patio-central': {
    name: 'Pátio Central',
    tileSize: 16,
    width: 40, height: 30,
    tileData: [...], // compactado
    spawns: { creaturePool: ['lobo-eter', 'fatua-voltaica', 'sombra-corrompida'],
              interval: 14-26, density: 1 },
    doors: [
      { x: 20, y: 5, to: 'salao-principal', toX: 20, toY: 25 },
      // ...
    ],
    npcs: [
      { x: 10, y: 10, id: 'vendedor', dialogueKey: 'vendedor-inicial' }
    ],
    flags: { 'sealed-subterraneo': false }
  },
  // ... 6 outras áreas
};

export function getTilesAroundPlayer(mapId, px, py, range) => { solid: boolean, creature: id | null }[]
export function getRandomSpawnInArea(mapId) => { x, y }
```

**Usos:**
- Renderizar mapa
- Detecção de colisão
- Spawn de inimigos
- Interação com NPCs e objetos

---

### `data/dialogue.js` — Narrativa

**Responsabilidade:** árvores de diálogo, NPCs, missões, flags.

**Exports:**
```javascript
export const DIALOGUE = {
  'vendedor-inicial': {
    lines: ["Bem-vindo ao Empório.", "..."],
    branches: []
  },
  'prof-lina-missao': {
    lines: ["Preciso que desçam ao Subterrâneo."],
    branches: [
      { choice: "Descemos.", setFlag: 'missao-subteraneo-aceita', next: 'prof-lina-aceito' },
      { choice: "Recuso.", next: 'prof-lina-recusa' }
    ]
  }
};

export const MISSIONS = {
  'investigar-subteraneo': {
    npc: 'prof-lina',
    reward: { gold: 600, item: 'selo-ressonante' },
    setFlag: 'missao-subteraneo-completa'
  }
};
```

**Usos:**
- Renderizar diálogos
- Avaliar escolhas
- Atualizar flags de progresso
- Aplicar recompensas

---

## Fluxo de dados

```
game.js
  ├─ load save.js → gameState
  ├─ loop:
  │  ├─ if combate: combat.js + ui/battle.js
  │  ├─ if menu: ui/menu.js + items.js + equipment
  │  ├─ if mapa: maps.js + ui/exploration
  │  ├─ save periodicamente: save.js → localStorage
  └─ unload save.js → localStorage
```

---

## Migração do monólito

**Fase 1 (esta sprint):**
- Extrair `data/*` (estático, baixa complexidade)
- Manter lógica em `game.js` mas chamar dados via imports

**Fase 2:**
- Extrair `systems/` (combat, progression, conditions)
- Reescrever loop de combate usando `BattleState`

**Fase 3:**
- Extrair `ui/*` (renderização)
- Desacoplar drawing de game logic

**Fase 4 (futuro):**
- Adicionar dificuldades: modificadores em `systems/` (0.8× ATK para Hard, 1.3× para Nightmare)
- Novos personagens: adicionar em `data/characters.js`
- Novos inimigos: adicionar em `data/creatures.js`
- Novo capítulo: estender `maps.js`, `dialogue.js`

---

## Benefícios esperados

| Aspecto | Antes | Depois |
|---|---|---|
| Linhas por arquivo | 4.100 | 300–800 |
| Tempo para adicionar inimigo | 1–2h (encontrar linhas) | 5min (JSON em `creatures.js`) |
| Testabilidade de dano | Manual, no jogo | Importar `combat.js`, testar |
| Risco de regressão | Alto | Baixo (módulos isolados) |
| Documentação de mecânica | Comentários espalhados | Cada módulo autodocumentado |

