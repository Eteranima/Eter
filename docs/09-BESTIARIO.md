# 09 — Bestiário

Nove criaturas comuns, distribuídas nas três regiões do Capítulo 1
(Pátio Central, Subterrâneo Selado e Galeria Profunda) — as únicas
mapeadas neste documento. O jogo tem outras dez regiões além destas
(ver `docs/PENDENCIAS-DESIGN.md`, item 3), cada uma com seu próprio
elenco de criaturas já definido em `src/scripts/monsters/09-bestiary.js`
e `10-formations.js`, mas ainda sem ficha de design aqui. Chefes em
[10](10-CHEFES.md).

Todas são, no lore, éter transbordado que ganhou forma própria — não são
animais nem demônios. Ver [02](02-MUNDO-E-LORE.md).

> **Apresentação.** Nenhuma criatura tem arte dedicada. São desenhadas
> proceduralmente a partir de uma **forma** (humanoide, golem, besta, fátua,
> chefe) mais a cor e o elemento. Com a party em arte 2D detalhada, este é o
> contraste visual mais evidente do jogo. 🟡

---

## Região: Pátio Central

O Pátio Central não declara encontro — é área segura (P0, 2026-09-02). As
três criaturas abaixo só aparecem hoje como a primeira patrulha visível do
Subterrâneo Selado, antes de chegarem à Academia.

### Lobo de Éter
| | |
|---|---|
| Nível | 3 · Neutro · besta |
| HP 360 · ATK 28 · DEF 8 · SPD 18 |
| Habilidades | Mordida, Uivo Elemental (área) |
| Recompensa | 88 EXP · 46 ₢ |
| Drops | Poção 30% |

O primeiro inimigo do jogo. Rápido e fraco. Uivo Elemental atinge todos, mas
com poder 14 é mais aviso do que ameaça — serve para ensinar que existe golpe
em área.

### Fátua Voltaica
| | |
|---|---|
| Nível | 4 · Eletricidade · fátua |
| HP 320 · ATK 40 · DEF 7 · SPD 22 |
| Habilidades | Faísca Errante (Choque 40%) |
| Recompensa | 110 EXP · 78 ₢ |
| Drops | Elixir de Éter 40% |

A criatura mais rápida do jogo inteiro (SPD 22). Age antes de quase todo mundo
e aplica Choque, que rouba turno. Frágil — a resposta correta é matá-la
primeiro. É a primeira lição de **priorização de alvo**.

### Sombra Corrompida
| | |
|---|---|
| Nível | 4 · Trevas · humanoide |
| HP 480 · ATK 34 · DEF 10 · SPD 12 |
| Habilidades | Garra Sombria, Véu Negro (Pavor 35%) |
| Recompensa | 120 EXP · 70 ₢ |
| Drops | Poção 40% |

Única criatura com **arte de sprite** em vez de desenho procedural. Aplica
Pavor (DEF −25%), que amplifica tudo que vier depois.

---

## Região: Subterrâneo Selado

Combates por mobs visíveis, não por passos. A primeira área hostil começa
abaixo da Academia, não no Pátio.

### Espectro de Sangue
| | |
|---|---|
| Nível | 5 · Sangue · fátua |
| HP 470 · ATK 72 · DEF 8 · SPD 19 |
| Habilidades | Drenar Vida (dreno 60%), Fúria Vermelha (Sangrando 50%) |
| Recompensa | 150 EXP · 95 ₢ |
| Drops | Sal Purificador 35% |

Primeira criatura que **se cura batendo**. Sangrando corta a cura da party
pela metade — a combinação é desagradável de propósito. Drop de Sal
Purificador é a dica de qual é a resposta.

### Golem de Pedra
| | |
|---|---|
| Nível | 5 · Neutro · golem |
| HP 850 · ATK 110 · DEF 20 · SPD 6 |
| Habilidades | Esmagar, Defesa Pétrea (DEF ×1,8 / 2 turnos) |
| Recompensa | 165 EXP · 105 ₢ |
| Drops | Poção 35% · Elixir de Éter 25% |
| **Resistências** | Eletricidade ×0,6 · **Tinta ×1,3** |

O muro. Maior HP e DEF da região, e o mais lento (SPD 6) — sempre age por
último. Golpe pesado (ATK 110). Defesa Pétrea faz ele desperdiçar turnos, o
que é bom para o jogador.

Tem resistência **própria** que ignora o anel: resiste a Eletricidade e sofre
mais de Tinta. É a criatura que ensina que resistência de criatura existe.

### Servo do Inverno
| | |
|---|---|
| Nível | 6 · Gelo · humanoide |
| HP 640 · ATK 95 · DEF 14 · SPD 11 |
| Habilidades | Sopro Gélido (área, Congelado 25%), Garra Sombria |
| Recompensa | 190 EXP · 120 ₢ |
| Drops | Poção Maior 25% · Elixir de Éter 35% |

Único inimigo comum com dano em área **relevante**. Congelado mexe na ordem de
turno da party inteira. É o pico de dificuldade do subterrâneo.

**Formações do subterrâneo**: 2 Sombras · 1 Golem · 1 Espectro + 1 Sombra ·
1 Servo do Inverno · 2 Fátuas · 1 Golem + 1 Sombra.

---

## Região: Galeria Profunda

Só acessível após derrotar O Selo Quebrado. Encontro a cada 10-20 passos.

Salto grande de poder: o ATK das criaturas daqui é 1,5 a 2× o do subterrâneo.

### Oco Faminto
| | |
|---|---|
| Nível | 12 · Tinta · fátua |
| HP 600 · ATK 150 · DEF 12 · SPD 20 |
| Habilidades | Roer o Nome (Cegueira 45%), Drenar Vida (dreno 60%) |
| Recompensa | 300 EXP · 210 ₢ |
| Drops | Elixir de Éter 45% |

Rápido, cega e se cura. Cegueira na party é especialmente cruel aqui porque as
lutas da Galeria são longas.

### Renascido
| | |
|---|---|
| Nível | 12 · Sangue · humanoide |
| HP 720 · ATK 160 · DEF 17 · SPD 14 |
| Habilidades | Fúria Vermelha (Sangrando 50%), Drenar Vida, Garra Sombria |
| Recompensa | 330 EXP · 230 ₢ |
| Drops | Poção Maior 40% · Sal Purificador 30% |

Versão adulta do Espectro. Mais HP, mais dano, mesmo truque: Sangrando +
dreno. Aparece em dupla, o que dobra o problema.

### Sentinela de Luz
| | |
|---|---|
| Nível | 13 · Luz · golem |
| HP 880 · ATK 165 · DEF 26 · SPD 11 |
| Habilidades | Esmagar, Defesa Pétrea, Lança de Aurora (Atordoado 30%) |
| Recompensa | 400 EXP · 290 ₢ |
| Drops | Éter Destilado 35% · Poção Suprema 20% |
| **Resistências** | **Trevas ×1,8** · Luz ×0,4 |

A criatura mais dura do jogo fora os chefes. Aplica Atordoado, a única
condição que rouba o turno inteiro com 100% de certeza.

Resistência invertida em relação ao anel: sofre **mais** de Trevas. Isso faz
de Marin a resposta direta — e é a única criatura desenhada em torno de um
personagem específico da party.

**Formações da galeria**: 2 Ocos · 1 Renascido + 1 Oco · 1 Sentinela ·
2 Renascidos · 1 Sentinela + 1 Oco · 2 Servos do Inverno + 1 Renascido.

---

## Tabela comparativa

| Criatura | Nv | Elem. | HP | ATK | DEF | SPD | EXP | ₢ |
|---|---|---|---|---|---|---|---|---|
| Lobo de Éter | 3 | Neutro | 360 | 28 | 8 | 18 | 88 | 46 |
| Fátua Voltaica | 4 | Elétr. | 320 | 40 | 7 | 22 | 110 | 78 |
| Sombra Corrompida | 4 | Trevas | 480 | 34 | 10 | 12 | 120 | 70 |
| Espectro de Sangue | 5 | Sangue | 470 | 72 | 8 | 19 | 150 | 95 |
| Golem de Pedra | 5 | Neutro | 850 | 110 | 20 | 6 | 165 | 105 |
| Servo do Inverno | 6 | Gelo | 640 | 95 | 14 | 11 | 190 | 120 |
| Oco Faminto | 12 | Tinta | 600 | 150 | 12 | 20 | 300 | 210 |
| Renascido | 12 | Sangue | 720 | 160 | 17 | 14 | 330 | 230 |
| Sentinela de Luz | 13 | Luz | 880 | 165 | 26 | 11 | 400 | 290 |

## Lacunas ⬜

- **Não há criatura de Fogo.** Os oito elementos existem, mas Fogo nunca é
  usado por um inimigo comum — a party nunca precisa se defender de Fogo.
- Não há criatura entre nível 6 e 12: o salto para a Galeria é abrupto.
- Nenhuma criatura foge, chama reforço, se divide ao morrer, ou muda de
  comportamento com pouca vida. Todas usam a mesma IA simples.
- As taxas de drop são generosas o bastante para a party acumular itens (ver
  [08](08-ITENS-EQUIPAMENTO-ECONOMIA.md)).
