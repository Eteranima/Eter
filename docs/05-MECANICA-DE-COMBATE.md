# 05 — Mecânica de Combate

## Formato

**M aliados × N inimigos**, turnos alternados por ordem de velocidade.
Party de até 5 (todos participam, não há reserva). Inimigos de 1 a 3 em
encontros comuns, 1 em luta de chefe.

## Ordem de turno

No início de cada rodada, **todos os combatentes vivos** são ordenados por:

```
prioridade = SPD efetivo × aleatório entre 0,88 e 1,12
```

A ordem é recalculada a cada rodada (então buffs de SPD e Congelado mudam a
fila) e é **mostrada na tela**, listando os próximos 7.

> Consequência: aliados e inimigos se intercalam. Não existe "fase da party" e
> "fase do inimigo" — um inimigo rápido age antes de metade do seu time.

## Início do turno de um combatente

Nesta ordem:

1. Condições com dano por turno aplicam o dano.
2. Duração das condições decrementa; as que zeram são removidas.
3. Se alguma condição rouba o turno (Congelado/Choque/Atordoado), o turno é
   perdido — mensagem "não consegue agir!".
4. A guarda do turno anterior é desfeita.
5. Se for aliado, o menu abre. Se for inimigo, a IA escolhe.

## Comandos do jogador

| Comando | Efeito |
|---|---|
| **Atacar** | Golpe físico. Elemento vem da **arma equipada** (neutro sem arma) |
| **Habilidade** | Lista as magias do personagem, com custo de MP |
| **★ Ressonância** | Só aparece com o medidor em 100. Ver [07](07-HABILIDADES-E-RESSONANCIAS.md) |
| **Item** | Consumíveis da bolsa (equipamento não aparece) |
| **Guardar** | Dano recebido cai bastante e a Ressonância sobe +14 |
| **Fugir** | Tenta escapar. Bloqueado em luta de chefe |

## Fórmula de dano

```
bruto      = ataque físico ? ATK × 2,2
                           : poder da habilidade + ATK × 0,9

mitigação  = 1 − DEF / (DEF + 70)

dano = bruto × mitigação × elemento × crítico × variação × guarda
```

Com:

| Fator | Valor |
|---|---|
| Elemento | 1,6 / 1,0 / 0,65 (ver [04](04-ELEMENTOS-E-CONDICOES.md)) |
| Crítico | ×1,7 |
| Variação | aleatório 0,93 – 1,07 |
| Guarda | ×0,45 se o alvo estiver guardando |
| Piso | **o dano nunca é menor que 1** |

### Por que essa mitigação

`1 − DEF/(DEF+70)` tem **retorno decrescente**: DEF nunca zera o dano, mas
sempre ajuda. Um personagem com DEF 12 sofre ~85% do bruto; com DEF 35, ~67%;
com DEF 60, ~54%. Isso permite dar equipamento de defesa forte sem tornar o
jogo trivial.

### Cura

```
cura = poder da habilidade + ATK × 0,5
```
Modificada por **Sangrando** (metade). Cura nunca ultrapassa o HP máximo.

## Acerto e crítico

| | Fórmula |
|---|---|
| **Precisão** | 95%, modificada por Cegueira (−40%) — piso de 15% |
| **Crítico** | 6% + SPD/400, limitado entre 3% e 40% |

Erro mostra "errou" e não aplica condição. Crítico multiplica por 1,7 **antes**
do multiplicador elemental, e dispara efeito visual e sonoro próprios.

## Guarda

Reduz o dano recebido para **45%** e enche a Ressonância em +14. Dura até o
próximo turno do personagem. Também multiplica a DEF efetiva por 2,2 nos
cálculos — ou seja, guardar contra um golpe forte é bem mais eficiente do que
parece.

É a resposta correta quando um chefe está prestes a usar golpe em área, e um
livro na biblioteca ensina exatamente isso:

> *"Guarde-se quando o inimigo respirar fundo. Metade do dano é metade do luto."*

## Fuga

```
chance = 0,35 + (SPD médio da party − SPD médio dos inimigos) × 0,04
                + 0,12 × tentativas anteriores
```
Limitada entre 15% e 95%. **Impossível contra chefe** — a mensagem é
"Não há para onde correr."

Cada tentativa falha aumenta a chance da próxima, então fugir nunca vira um
poço sem fundo.

## Alvos

| Tipo | Comportamento |
|---|---|
| `one` | Escolha manual, com prévia de vantagem elemental |
| `all` | Todos os inimigos vivos, sem escolha |
| `ally` | Escolha entre aliados vivos |
| `allies` | Toda a party viva |
| `self` | O próprio conjurador |

Itens de reviver miram **apenas aliados caídos**.

## Efeitos especiais de habilidade

- **Dreno** (`drain`): converte uma fração do dano em HP para quem usou.
  Sanguessuga dreno 50%, Drenar Vida 60%, Devorar Éter 100%.
- **Buff**: multiplica um atributo por N turnos (ex.: DEF ×1,5 por 3 turnos).
  Buffs expiram no início da rodada e são limpos ao cair.
- **Condição**: chance de aplicar, checada por alvo, só se o alvo sobreviver
  ao golpe.

## IA inimiga

Regra geral:
- Escolhe uma habilidade aleatória do próprio repertório.
- 40% das vezes mira **o aliado com menor fração de HP**; senão, aleatório.
- Habilidades de cura ou `self` sempre miram o próprio inimigo.

Regra específica de **chefe**:
- **50% dos turnos prefere um golpe em área**, se tiver um.
- Abaixo de 32% de HP, 50% de chance de usar cura própria.

> **Por que a regra de área existe.** Um chefe sozinho age **uma vez por
> rodada contra cinco heróis**. Sem preferência por área, a matemática pedia
> ATK 317-564 para ele ameaçar a party — o que mataria um personagem de um
> golpe só. A solução correta foi dar-lhe alcance, não força bruta.

## Vitória e derrota

**Vitória** quando todos os inimigos caem. Recompensa:
- EXP total do encontro para **cada** sobrevivente
- Ouro total do encontro
- Drops sorteados individualmente por criatura
- Níveis subidos na hora, com painel mostrando os ganhos

**Derrota** quando toda a party cai: acorda no último cristal com 35% de HP/MP.

## Alvos de balanceamento

Os números do bestiário foram derivados destes alvos, **medidos**, não
estimados:

| Métrica | Alvo | Medido (v3.3.0) |
|---|---|---|
| Duração de luta comum | ~3,5 rodadas | 2,7 – 4,1 |
| Vale de HP da party em luta comum | 65 – 80% | 66 – 91% |
| Caídos por luta comum | < 0,5 | 0,00 – 0,32 |
| Duração de luta de chefe | 12 – 15 rodadas | 14,8 (Selo) · 12,0 (Eco) |
| Vale de HP em luta de chefe | ~30% | 29% (Selo) · 31% (Eco) |
| Taxa de vitória em chefe | 80 – 100% | 98% (Selo) · 100% (Eco) |

### A moeda certa para dimensionar inimigo

Com **5 personagens agindo por rodada**, a party despeja **240 a 450 de dano
por rodada**. Vida de inimigo precisa ser contada nessa moeda:

```
HP do grupo inimigo ≈ 3,5 × (dano da party por rodada)
```

E o ATK do inimigo sai da mitigação invertida, para o grupo tirar ~12-15% da
vida total da party por rodada:

```
ATK necessário ≈ [ (alvo de dano ÷ mitigação) − poder da habilidade ] ÷ 0,9
```

> **Armadilha registrada.** Multiplicar vida "no olho" não funciona. Numa
> versão anterior a vida foi multiplicada por 2,6 e as lutas continuaram
> durando 1,2 rodadas, porque o cálculo ignorava que são 5 ações por rodada.

### Ferramenta

O jogo tem `medirBalanco()` no console: joga N batalhas por região com uma IA
razoável e relata rodadas, vitória, HP restante e caídos.

> **Cuidado ao ler.** "HP restante" **engana** quando a IA cura — ela recompõe
> a vida antes do fim da luta. A métrica honesta de tensão é o **vale mínimo**
> de HP durante o combate.
