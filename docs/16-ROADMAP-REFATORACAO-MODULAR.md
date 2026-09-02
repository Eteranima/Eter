# 16 — Roadmap de Refatoração Modular

**Status:** planejamento  
**Objetivo:** transformar `scripts/game.js` (4.100 linhas) em módulos reutilizáveis  
**Benefício:** adicionar personagens, inimigos, chefes, dificuldades sem tocar no motor

---

## Sprint 1 — Extração de dados estáticos

**Tempo:** 8-12h  
**Risco:** baixo (sem mudança de lógica)  
**Prova:** testes unitários de data loading

### Tarefas

1. **`scripts/data/elements.js`**
   - Extrair: anel elemental, multiplicadores, condições
   - Escrever: função `getElementEffectiveness(attacker, defender)`
   - Teste: 8 × 8 matriz de multiplicadores, todas as condições

2. **`scripts/data/characters.js`**
   - Extrair: 5 personagens, base, crescimento, habilidades, Ressonância
   - Teste: `getCharacterStats(charId, level)` para nível 1, 5, 14
   - Validação:HP nível 14 = base + growth × 13

3. **`scripts/data/creatures.js`**
   - Extrair: 9 inimigos + formações por área
   - Teste: cada inimigo em ao menos uma formação
   - Validação: recompensas (EXP, ouro) dentro da faixa por região

4. **`scripts/data/bosses.js`**
   - Extrair: 2 chefes, resistências, IA
   - Teste: habilidades do chefe existem em `abilities.js`

5. **`scripts/data/items.js`**
   - Extrair: consumíveis, armas, armaduras, talismãs
   - Teste: cada item tem preço > 0, equipamento tem bônus válido

6. **`scripts/data/abilities.js`**
   - Extrair: **todas** as habilidades (personagem, inimigo, chefe, Ressonância)
   - Teste: `learnLevel <= 18`, `mp <= 30`, `power > 0`
   - Validação: cada `abilityId` referenciado em personagem/inimigo existe

7. **`scripts/data/shops.js`**
   - Extrair: 2 lojas, estoque inicial, unlock flags, estoque desbloqueado
   - Teste: item existe em `items.js`, todos os flags referenciados existem

8. **`scripts/data/maps.js`**
   - Extrair: 7 áreas, conectividade, spawn rules, NPCs
   - Teste: todas as portas conectam bidirecionar... espera, não — algumas são só ida

---

## Sprint 2 — Extração de sistemas isolados

**Tempo:** 12-16h  
**Risco:** médio (refatoração de lógica núcleo)  
**Prova:** testes de integração de combate

### Tarefas

1. **`scripts/systems/combat.js`**
   - Extrair: classe `BattleState`, cálculo de dano, ordem de turno
   - Implementar: `constructor(party, enemies)`, `getCurrentActor()`, `executeAction()`
   - Teste: 50+ casos de dano (vantagem, desvantagem, crítico, dreno, condição)
   - Integração: `game.js` chama `BattleState` em vez de lógica inline

2. **`scripts/systems/progression.js`**
   - Extrair: função `calculateStats(base, growth, level, equipment)`
   - Teste: stats em nível 1, 10, 18 batem com tabela no doc
   - Teste: EXP para próximo nível segue a curva

3. **`scripts/systems/conditions.js`**
   - Extrair: aplicação de condição (chance, duração), tick por turno
   - Teste: Congelado reduz SPD 50%, Pavor reduz DEF 25%, etc.
   - Teste: Sangrando corta cura pela metade

4. **`scripts/systems/economy.js`**
   - Extrair: recompensa de criatura/chefe, venda de item, destravamento de loja
   - Teste: 1 Lobo = 88 EXP · 46 ₢, Selo Quebrado = 1.600 ₢

5. **`scripts/systems/save.js`**
   - Extrair: serialização, deserialização, versionamento
   - Teste: save atual, save de versão anterior (compatibilidade)
   - Teste: validação (party existe, níveis válidos, ouro > 0)

---

## Sprint 3 — Refatoração de UI

**Tempo:** 10-14h  
**Risco:** baixo (UI muda, logic separado)  
**Prova:** testes visuais, sem regressão de gameplay

### Tarefas

1. **`scripts/ui/battle.js`**
   - Extrair: renderização de combate, log, menu de ação
   - Integração: recebe `BattleState`, renderiza conforme state.getCurrentActor()

2. **`scripts/ui/menu.js`**
   - Extrair: status de personagem, equipamento, consumíveis
   - Integração: chama `items.js` para preços, `characters.js` para stats

3. **`scripts/ui/dialogue.js`**
   - Extrair: caixa de diálogo, árvore de escolhas, aplicação de flags
   - Integração: carrega de `data/dialogue.js`

4. **`scripts/ui/hud.js`**
   - Extrair: barra de HP/MP, ordem de turno, indicador de condição
   - Mantém sempre visível sem overhead

---

## Sprint 4 — Verificação e otimização

**Tempo:** 4-8h  
**Risco:** muito baixo (sem mudança de comportamento)

### Tarefas

1. Executar todos os testes unitários + integração
2. Comparar checksum de save antigo vs. novo (compatibilidade)
3. Validar HTML final (JS syntax, no console errors)
4. Documentar exports públicos de cada módulo

---

## Fase pós-refatoração (roadmap longo)

Com a modularização em lugar, esses tasks ficam triviais:

### Adicionar novo personagem (1h)
```javascript
// data/characters.js
kira: {
  name: 'Kira', role: 'Esgrimista', element: 'Luz',
  base: { hp: 80, mp: 38, atk: 21, def: 13, spd: 16 },
  growth: { hp: 9, mp: 5, atk: 2.4, def: 1.7, spd: 1.6 },
  abilityIds: ['lanca-aurora', 'estocada-precisa', 'nova-deslumbrante'],
  resonanceId: 'juizo-divino'
}

// data/abilities.js
'lanca-aurora': { name: 'Lança de Aurora', learnLevel: 1, mp: 7, element: 'Luz', targeting: 'single', power: 19, condition: { type: 'atordoado', chance: 0.3 } }

// Pronto! Renderização e combate funcionam automaticamente
```

### Adicionar novo inimigo (30min)
```javascript
// data/creatures.js
'guardiao-tribunal': {
  name: 'Guardião do Tribunal', level: 11, element: 'Luz', form: 'humanoid',
  hp: 750, atk: 140, def: 22, spd: 12,
  abilityIds: ['golpe-definitivo', 'lanca-aurora'],
  reward: { exp: 280, gold: 190 }, drops: [{ id: 'pocao-maior', chance: 0.4 }]
}

// data/creatures.js → FORMATIONS.galeria_profunda
// ✅ Respawn, combate, recompensa — automático
```

### Adicionar dificuldade (Nightmare) (2h)
```javascript
// systems/combat.js
DIFFICULTY_MODIFIERS = {
  normal: { atkMul: 1.0, defMul: 1.0, hpMul: 1.0, expMul: 1.0 },
  hard: { atkMul: 1.2, defMul: 1.1, hpMul: 1.0, expMul: 1.2 },
  nightmare: { atkMul: 1.5, defMul: 1.2, hpMul: 1.3, expMul: 1.8 }
};

// Aplicar ao calcular stats:
export function calculateDamage(attacker, ability, defender, difficulty) {
  const baseDamage = /* ... */;
  return Math.floor(baseDamage * DIFFICULTY_MODIFIERS[difficulty].atkMul);
}

// UI recebe dificuldade no novo jogo
// ✅ Todos os combates escalados automaticamente
```

### Adicionar novo chefe (3h)
```javascript
// data/bosses.js
'guardiao-ancestral': {
  name: 'Guardião Ancestral', level: 25, element: 'Luz',
  hp: 5.500, atk: 120, def: 28, spd: 16,
  resistances: { 'Trevas': 1.9, 'Luz': 0.35 },
  abilityIds: ['juizo-definitivo', 'colapso-temporal', 'cura-divina', 'reintegrar'],
  ai: { prefersArea: 0.6, healThreshold: 0.3, pattern: 'defensive' }
}

// systems/combat.js → BossAI
// ✅ Luta de 14-15 turnos, balanceada automaticamente
```

### Expandir Capítulo 2 (1-2 dias)
```javascript
// data/maps.js
'templo-ancestral': { /* nova área */ }

// data/dialogue.js + data/missions.js
'encontro-ancestral': { /* nova missão */ }

// data/creatures.js + data/bosses.js
// 3-4 novos inimigos, 1 novo chefe

// ✅ Novo arco narrativo, novo conteúdo, sem tocar na engine
```

---

## Checklist antes de começar Sprint 1

- [ ] Backup de `scripts/game.js` (git já cobre, mas cuidado)
- [ ] Rodar jogo v3.4.0 até o fim (baseline)
- [ ] Verificar que todos os dados estão em `game.js` (linhas 1-500 aproximadamente)
- [ ] Decidir estrutura de pasta: `scripts/data/`, `scripts/systems/`, `scripts/ui/` vs. tudo em `scripts/`?
- [ ] Definir nome do branch git: `refactor/modularize` ou `feature/modular-js`

---

## Notas de implementação

### Module bundling
Se o jogo usar `import`/`export`, precisará de build step (Webpack, Rollup) ou ES modules nativos no navegador. Hoje é um único `<script src="game.js">`. Opções:

1. **Manter monolítico** — `scripts/` é **não rastreado**, buildado em `game.js` antes de publicar
2. **ES modules no HTML** — `<script type="module" src="scripts/game.js">`, outros módulos carregam com `import`
3. **Inline em `fonte-atual/eter-anima.html`** — já contém `<script inline>`, adicionar módulos antes do `</script>` final

Recomendação: **opção 2** (ES modules nativos) — suporta todos os navegadores modernos, sem build complexo.

### Teste unitário
Criar `scripts/tests/` com Node.js:
```javascript
// test/damage.test.js
import { calculateDamage } from '../systems/combat.js';
import { CHARACTERS } from '../data/characters.js';
import { CREATURES } from '../data/creatures.js';

describe('Damage Calculation', () => {
  test('Vantagem elemental = ×1.6', () => {
    const dmg = calculateDamage(
      { element: 'Fogo' }, // atacante
      { element: 'Sangue' }, // alvo
      { power: 20 } // habilidade
    );
    expect(dmg).toBeCloseTo(20 * 1.6, 0);
  });
});
```

Rodar com `npm test` antes de publicar.

