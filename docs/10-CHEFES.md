# 10 — Chefes

Dois chefes. Ambos são lutas longas (12-15 rodadas), sem fuga possível, e
disparadas por **interação** — o jogador precisa falar com a criatura, não
esbarrar nela.

Regra comum de IA de chefe: **50% dos turnos prefere golpe em área**, e abaixo
de 32% de HP tem 50% de chance de se curar. Ver
[05](05-MECANICA-DE-COMBATE.md) para o porquê.

---

## O Selo Quebrado

> **Chefe do Capítulo 1.** Câmara do Selo, no fundo do Subterrâneo.

| | |
|---|---|
| **Nível** | 10 · Trevas · forma de chefe |
| **HP** | 4.200 |
| **ATK** | 80 · **DEF** 20 · **SPD** 14 |
| **Recompensa** | 1.400 EXP · 1.600 ₢ |
| **Drops garantidos** | Pena de Ressurgir, Poção Maior, Poção Suprema |
| **Resistências** | **Luz ×1,9** · Trevas ×0,35 |

### Repertório

| Habilidade | Poder | Alvo | Efeito |
|---|---|---|---|
| Selo Rompido | 34 | um | Pavor 60% |
| **Colapso do Véu** | 30 | **todos** | — |
| Devorar Éter | 26 | um | **dreno 100%** |
| Reintegrar | 120 | self | cura própria |

### Apresentação

> *Algo enorme se desdobra da parede. Não tem rosto — tem memória.*
>
> **O SELO QUEBRADO:** *"Vocês vieram lembrar. Que gentileza."*

Ao morrer:

> *O Selo Quebrado se desfaz em cinzas de éter.*
> *Atrás de onde ele estava, uma escada continua descendo — agora aberta.*

### Como a luta funciona

Nível de party esperado: **10**, com equipamento de primeira loja.

A pressão vem de três lados ao mesmo tempo:

1. **Colapso do Véu** em metade dos turnos mantém a party inteira sangrando
   vida — é o que torna Ophelia obrigatória e Muralha Viva (Gabriel, nv9)
   valiosíssima.
2. **Devorar Éter** com dreno 100% significa que dano mal distribuído é dano
   devolvido. O chefe se cura com o que tira.
3. **Reintegrar** abaixo de 32% impede finalizar com dano fraco — o jogador
   precisa de um burst, e é aí que as Ressonâncias entram.

**A resposta correta é Luz** (×1,9), que a party não tem naturalmente. Isso é
deliberado: no Capítulo 1 o jogador vence *sem* a vantagem elemental, na
raça. A Lâmina do Selo (ataque básico de Luz) só é vendida depois — é a
recompensa por ter vencido sem ela.

Trevas é resistido (×0,35), o que **anula Marin**, o maior dano da party. O
jogador precisa descobrir que seu melhor atacante é o pior contra este alvo.

**Medido**: 14,8 rodadas, 98% de vitória, vale de HP em 29%.

---

## O Eco do Primeiro

> **Chefe opcional de fim de arco.** Fundo da Galeria Profunda.

| | |
|---|---|
| **Nível** | 18 · Luz · forma de chefe |
| **HP** | 4.800 |
| **ATK** | 105 · **DEF** 24 · **SPD** 19 |
| **Recompensa** | 3.200 EXP · 4.000 ₢ |
| **Drops garantidos** | Poção Suprema, Pena de Ressurgir, Éter Destilado |
| **Resistências** | **Trevas ×1,7** · Luz ×0,3 |

### Repertório

| Habilidade | Poder | Alvo | Efeito |
|---|---|---|---|
| **Juízo Silencioso** | 32 | **todos** | Atordoado 25% |
| **Colapso do Véu** | 30 | **todos** | — |
| Selo Rompido | 34 | um | Pavor 60% |
| Devorar Éter | 26 | um | dreno 100% |
| Reintegrar | 120 | self | cura própria |

### Apresentação

> *A galeria termina num rosto que é só contorno — luz onde deveria haver
> alguém.*
>
> **O ECO DO PRIMEIRO:** *"Vocês lembraram de mim. Eu preferia o contrário."*

Ao morrer:

> *O Eco se apaga como quem finalmente é permitido esquecer.*
> *A Galeria fica em silêncio. Pela primeira vez, um silêncio comum.*

### Como a luta funciona

Nível de party esperado: **17-19**, com equipamento de Mercador Errante.

É o espelho do Selo Quebrado em todo sentido:

| | Selo Quebrado | Eco do Primeiro |
|---|---|---|
| Elemento | Trevas | Luz |
| Fraco a | Luz | Trevas |
| Quer | ser lembrado | ser esquecido |
| Ameaça | dano sustentado | **roubo de turno** |

**Duas habilidades de área** (contra uma do Selo) mais Atordoado significam que
a party pode simplesmente **perder rodadas inteiras**. É a luta mais longa e a
que mais exige gestão de recurso.

Agora **Marin é a resposta** (Trevas ×1,7) — exatamente o personagem que era
inútil contra o chefe anterior. É a recompensa temática por ter aprendido a
lição do primeiro chefe ao contrário.

**Medido**: 12,0 rodadas, 100% de vitória com IA ótima, vale de HP em 31%.

> **Nota.** A taxa de 100% é com uma IA de teste que usa itens perfeitamente e
> tem 3 Penas de Ressurgir. Para um jogador humano a luta é bem mais apertada
> — o vale de 31% é o número honesto.

---

## Design de chefe: o que aprendemos

Registrado para quando o Capítulo 2 tiver chefe novo:

1. **Chefe solo não ameaça party de 5 com força bruta.** Ele age uma vez por
   rodada contra cinco. Ameaça vem de **alcance** (golpe em área) e de
   **roubo de turno**, não de ATK alto. Tentar equilibrar por ATK exigiria
   valores que matam um personagem de um golpe.

2. **Resistência elemental é a ferramenta de personagem.** Anular o melhor
   atacante da party (Marin contra o Selo) força o jogador a usar quem ele
   ignorava. É mais interessante que aumentar HP.

3. **Cura própria abaixo de um limiar** cria um "segundo fôlego" sem precisar
   de fases scriptadas — e dá função às Ressonâncias, que o jogador vinha
   guardando.

4. **Dreno 100% pune dano mal alocado** sem precisar de mecânica nova.

## Ideias para chefes futuros ⬜

- Um chefe com **duas partes** (braço e corpo) para a party ter de escolher
  onde bater — o motor já suporta múltiplos inimigos.
- Um chefe que **muda de elemento** entre fases, invertendo quem é útil no
  meio da luta.
- Um chefe que **não pode ser morto** e a vitória é sobreviver N rodadas.
- A Diretora Felt como confronto não-combativo. Ver [02](02-MUNDO-E-LORE.md).
