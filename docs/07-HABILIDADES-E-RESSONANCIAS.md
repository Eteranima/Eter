# 07 — Habilidades e Ressonâncias

Lembrete: **poder** não é dano final — entra na fórmula de
[05](05-MECANICA-DE-COMBATE.md) junto com ATK, DEF e elemento.

## Habilidades da party

### Tinta — Seiji

| Habilidade | MP | Poder | Alvo | Extra |
|---|---|---|---|---|
| **Tinta Cortante** | 6 | 22 | um | — |
| **Mancha Viva** | 12 | 30 | um | Cegueira 55% |
| **Maré de Nanquim** | 22 | 26 | todos | — |

*Tinta Cortante*: "Lâmina de tinta negra."
*Mancha Viva*: "Tinta que devora a visão."
*Maré de Nanquim*: "Inunda o campo de tinta viva."

### Gelo — Ophelia

| Habilidade | MP | Poder | Alvo | Extra |
|---|---|---|---|---|
| **Estilhaço Glacial** | 7 | 24 | um | — |
| **Geada Profunda** | 14 | 35 | um | Congelado 45% |
| **Orvalho** | 9 | 95 | aliado | cura |
| **Névoa Serena** | 20 | 72 | party | cura |

*Estilhaço Glacial*: "Fragmentos de gelo afiado."
*Geada Profunda*: "Congela a alma exposta."
*Orvalho*: "Cura um aliado."
*Névoa Serena*: "Cura toda a party."

### Trevas — Marin

| Habilidade | MP | Poder | Alvo | Extra |
|---|---|---|---|---|
| **Véu Sombrio** | 6 | 20 | um | — |
| **Eclipse** | 14 | 32 | um | Pavor 50% |
| **Sanguessuga** | 16 | 26 | um | dreno 50% |

*Véu Sombrio*: "Sombra que corta."
*Eclipse*: "Escuridão total."
*Sanguessuga*: "Converte metade do dano em HP."

### Fogo — Gabriel

| Habilidade | MP | Poder | Alvo | Extra |
|---|---|---|---|---|
| **Punho Ígneo** | 5 | 20 | um | — |
| **Labareda** | 11 | 34 | um | Queimadura 50% |
| **Muralha Viva** | 12 | — | party | DEF ×1,5 por 3 turnos |

*Punho Ígneo*: "Soco em chamas."
*Labareda*: "Pilar de fogo."
*Muralha Viva*: "DEF da party +50% por 3 turnos."

### Eletricidade — Max

| Habilidade | MP | Poder | Alvo | Extra |
|---|---|---|---|---|
| **Descarga** | 5 | 21 | um | — |
| **Tempestade Viva** | 16 | 28 | todos | Choque 40% |
| **Pulso Acelerado** | 10 | — | aliado | SPD ×1,6 por 3 turnos |

*Descarga*: "Arco voltaico direto."
*Tempestade Viva*: "Raios caem do céu negro."
*Pulso Acelerado*: "SPD do alvo +60% por 3 turnos."

---

## Ressonâncias (ultimates)

Uma por personagem. Custa 0 MP, exige o medidor em 100 e o zera ao usar.
Sempre acerta (não passa pelo teste de precisão) e a condição, quando existe,
tem chance bem mais alta que a de uma habilidade comum.

| Personagem | Ressonância | Poder | Elemento | Alvo | Condição |
|---|---|---|---|---|---|
| Seiji | **Códice Sem Fundo** | 70 | Tinta | todos | — |
| Ophelia | **Inverno Absoluto** | 78 | Gelo | todos | Congelado 60% |
| Marin | **Hora Sem Estrelas** | 95 | Trevas | um | — |
| Gabriel | **Coração da Forja** | 88 | Fogo | um | Queimadura 80% |
| Max | **Céu Descendente** | 72 | Eletricidade | todos | Choque 55% |

**Falas**

- *Códice Sem Fundo*: "A tinta reescreve o que toca."
- *Inverno Absoluto*: "O ar inteiro vira cristal."
- *Hora Sem Estrelas*: "Um instante de nada absoluto."
- *Coração da Forja*: "Todo o éter vira combustível."
- *Céu Descendente*: "A tempestade obedece."

### Leitura de design

Divide-se em duas escolas:

- **Alvo único, poder alto** — Marin (95) e Gabriel (88). São as respostas a
  chefe. Gabriel ainda garante Queimadura em 80%, o que numa luta de 14
  rodadas soma muito dano por turno.
- **Área, poder menor** — Seiji (70), Ophelia (78), Max (72). São as respostas
  a grupo. Ophelia e Max carregam controle junto (Congelado 60%, Choque 55%),
  o que efetivamente rouba turnos do inimigo.

Ophelia tem a particularidade de ser **a curandeira com Ressonância ofensiva**
— quando a barra dela enche, o jogador precisa decidir entre curar e explodir.

---

## Habilidades de inimigo

Listadas para referência de balanceamento. Todas custam 0 MP.

| Habilidade | Poder | Elemento | Alvo | Extra | Usada por |
|---|---|---|---|---|---|
| Garra Sombria | 18 | Trevas | um | — | Sombra, Renascido |
| Véu Negro | 24 | Trevas | um | Pavor 35% | Sombra |
| Esmagar | 26 | Neutro | um | — | Golem, Sentinela |
| Defesa Pétrea | — | Neutro | self | DEF ×1,8 por 2 turnos | Golem, Sentinela |
| Drenar Vida | 20 | Sangue | um | dreno 60% | Espectro, Renascido, Oco |
| Fúria Vermelha | 30 | Sangue | um | Sangrando 50% | Espectro, Renascido |
| Mordida | 16 | Neutro | um | — | Lobo |
| Uivo Elemental | 14 | Neutro | todos | — | Lobo |
| Faísca Errante | 19 | Eletricidade | um | Choque 40% | Fátua |
| Sopro Gélido | 22 | Gelo | todos | Congelado 25% | Servo do Inverno |
| Lança de Aurora | 26 | Luz | um | Atordoado 30% | Sentinela |
| Roer o Nome | 23 | Tinta | um | Cegueira 45% | Oco Faminto |

## Habilidades de chefe

| Habilidade | Poder | Elemento | Alvo | Extra |
|---|---|---|---|---|
| **Selo Rompido** | 34 | Trevas | um | Pavor 60% |
| **Colapso do Véu** | 30 | Trevas | **todos** | — |
| **Devorar Éter** | 26 | Sangue | um | **dreno 100%** |
| **Juízo Silencioso** | 32 | Luz | **todos** | Atordoado 25% |
| **Reintegrar** | 120 | Neutro | self | cura própria |

*Devorar Éter* com dreno 100% é a habilidade que faz luta de chefe virar
corrida: cada golpe nele devolvido é vida que ele recupera inteira.

*Reintegrar* só é priorizada abaixo de 32% de HP — o chefe não fica curando a
luta toda, mas resiste a ser finalizado com dano fraco.

---

## Lacunas ⬜

- Nenhuma habilidade de **debuff puro** (reduzir ATK/DEF do inimigo). O tipo
  existe no motor (`debuff`) e não é usado por ninguém.
- Nenhuma habilidade da party aplica **Sangrando** ou **Atordoado**.
- Nenhuma habilidade custa HP em vez de MP, nem tem recarga.
- Não há habilidade de fuga garantida, nem de roubo de item.
