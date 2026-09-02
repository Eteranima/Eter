# 03 — Atributos e Progressão

## Os cinco atributos

| Atributo | O que faz |
|---|---|
| **HP** | Vida. A 0 o personagem cai (não morre permanentemente) |
| **MP** | Éter. Custo das habilidades. Não regenera em combate |
| **ATK** | Entra no dano de ataque básico **e** de habilidade, e na cura |
| **DEF** | Reduz dano recebido, com retorno decrescente |
| **SPD** | Define a ordem de turno e influencia a chance de crítico |

Não há atributo de "sorte", "magia" separada de "força", nem resistência a
status. Foi decisão consciente: menos eixos, decisões mais legíveis.

> **Nota de design.** ATK serve tanto para golpe físico quanto mágico. Isso
> significa que não existe personagem "só mágico" ou "só físico" — todos
> escalam no mesmo eixo, e a diferenciação vem do **elemento** e do
> **repertório de habilidades**, não de um segundo atributo.

## Ressonância (medidor de ultimate)

Barra de 0 a 100 por personagem, separada de HP/MP.

| Evento | Ganho |
|---|---|
| Agir (qualquer ação ofensiva/mágica) | +10 |
| Sofrer dano | +14 |
| Usar **Guardar** | +14 |
| Descansar no cristal | sobe para no mínimo 30 |

Ao chegar em 100, o comando **★ Ressonância** aparece no menu daquele
personagem. Usar consome a barra inteira (volta a 0).

Consequência de ritmo: numa luta comum de 3-4 rodadas, um personagem que
apanhou costuma fechar a barra perto do fim. Em luta de chefe (12-15 rodadas)
todo mundo usa a Ressonância pelo menos uma vez, às vezes duas.

## Níveis e crescimento

Cada personagem tem **base** (nível 1) e **crescimento por nível**. A fórmula é
linear:

```
atributo = base + crescimento × (nível − 1) + bônus de equipamento
```

Os personagens **começam o jogo no nível 5**.

### Tabela de base e crescimento

| Personagem | HP | MP | ATK | DEF | SPD |
|---|---|---|---|---|---|
| **Seiji** | 85 (+9) | 40 (+5) | 18 (+2,2) | 12 (+1,6) | 15 (+1,5) |
| **Ophelia** | 70 (+7) | 55 (+8) | 14 (+1,6) | 10 (+1,4) | 13 (+1,4) |
| **Marin** | 75 (+8) | 50 (+6) | 20 (+2,6) | 9 (+1,2) | 16 (+1,9) |
| **Gabriel** | 90 (+11) | 35 (+4) | 22 (+2,4) | 14 (+2,1) | 11 (+1,1) |
| **Max** | 78 (+8) | 42 (+6) | 19 (+2,3) | 11 (+1,5) | 17 (+2,1) |

Leitura rápida: Gabriel é o muro (mais HP e DEF, menos SPD), Marin é o
vidro-canhão (maior ATK e crescimento de ATK, menor DEF), Max é o mais rápido,
Ophelia é a única com MP alto o bastante para curar a luta inteira, Seiji é o
equilibrado.

### Valores no nível inicial (5) e num nível de referência (14)

| Personagem | HP nv5 → nv14 | MP nv5 → nv14 | ATK nv5 → nv14 |
|---|---|---|---|
| Seiji | 121 → 202 | 60 → 105 | 27 → 47 |
| Ophelia | 98 → 161 | 87 → 159 | 20 → 35 |
| Marin | 107 → 179 | 74 → 128 | 30 → 54 |
| Gabriel | 134 → 233 | 51 → 87 | 32 → 53 |
| Max | 110 → 182 | 66 → 120 | 28 → 49 |

## Curva de EXP

```
EXP para o próximo nível = ⌊28 × nível^1,5⌋ + 30 × nível
```

| Nível | EXP necessário |
|---|---|
| 5 | 463 |
| 6 | 591 |
| 7 | 728 |
| 8 | 873 |
| 10 | 1.185 |
| 14 | 1.886 |
| 18 | 2.678 |

### Regra importante: EXP não é dividido

Cada sobrevivente recebe o **total** do encontro, não uma fração.

Isso não é generosidade — é necessidade. Com 5 membros, dividir o EXP faria
cada luta valer 1/5, e o tempo por nível ficaria absurdo (chegou a medir ~90
batalhas por nível numa versão anterior). Quem cai em combate **não** recebe
EXP daquela luta.

### Ritmo medido

| Região | Nível | Batalhas por nível |
|---|---|---|
| Pátio | 5 → 6 | ~18 |
| Pátio | 6 → 7 | ~18 |
| Subterrâneo | 8+ | ~12 |
| Galeria | 14+ | ~10 |

O pátio é o trecho mais lento de propósito: é onde o jogador aprende. A partir
do subterrâneo o EXP por criatura sobe mais rápido que a curva.

## Subir de nível

Ao subir:

- Todos os atributos são recalculados pela fórmula.
- **HP e MP são restaurados ao máximo.**
- Habilidades cujo nível de aprendizado foi atingido são adicionadas.
- Múltiplos níveis podem ser ganhos numa única vitória.

Ver [06](06-PERSONAGENS.md) para quem aprende o quê e quando.

## Morte e derrota

- **Personagem a 0 HP**: cai. Não age, não recebe EXP, perde condições e buffs.
  Revive com **Pena de Ressurgir** (50% do HP) ou ao subir de nível/descansar.
- **Party inteira caída**: derrota. A party acorda no último cristal de éter
  com **35% de HP e MP**, mantendo itens, ouro e progresso. Não há penalidade
  além do tempo perdido — decisão consciente para não punir experimentação.

## Recuperação

| Fonte | Efeito |
|---|---|
| Cristal de ressonância (ponto de save) | HP e MP cheios, condições limpas, Ressonância ≥30 |
| Enfermeira (Anexo Oeste) | HP e MP cheios, condições limpas |
| Tenda de Campo (item) | HP e MP cheios da party — só fora de combate |
| Subir de nível | HP e MP cheios |

Não existe regeneração passiva ao andar. Recuperar é sempre uma decisão de ir
a algum lugar ou gastar item.
