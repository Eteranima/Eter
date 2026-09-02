# 04 — Elementos e Condições

## As nove afinidades

| Elemento | Cor | Condição que aplica |
|---|---|---|
| **Fogo** | laranja | Queimadura |
| **Gelo** | azul claro | Congelado |
| **Trevas** | roxo | Pavor |
| **Tinta** | azul escuro | Cegueira |
| **Luz** | amarelo | Atordoado |
| **Cinzas** | cinza-marrom | Sangrando |
| **Eletricidade** | dourado | Choque |
| **Vento** | verde | Exposto |
| **Neutro** | cinza | nenhuma |

**Neutro** não participa do anel: não tem vantagem contra nada e nada tem
vantagem contra ele. É o elemento do ataque básico sem arma e de criaturas
sem afinidade (Golem, Lobo).

## O anel elemental

Oito elementos num círculo. **Cada um supera os dois seguintes e apanha dos
dois anteriores.**

```
Fogo → Vento → Cinzas → Trevas → Luz → Tinta → Eletricidade → Gelo → (volta a Fogo)
```

| Elemento | Supera | Apanha de |
|---|---|---|
| Fogo | Vento, Cinzas | Eletricidade, Gelo |
| Vento | Cinzas, Trevas | Fogo, Gelo |
| Cinzas | Trevas, Luz | Fogo, Gelo |
| Trevas | Luz, Tinta | Fogo, Cinzas |
| Luz | Tinta, Eletricidade | Cinzas, Trevas |
| Tinta | Eletricidade, Gelo | Trevas, Luz |
| Eletricidade | Gelo, Fogo | Luz, Tinta |
| Gelo | Fogo, Vento | Tinta, Eletricidade |

## Duplas rivais

Duas exceções ao anel, onde **os dois lados batem forte um no outro**:

- **Fogo ⇄ Gelo**
- **Luz ⇄ Trevas**

São os pares "clássicos" e existem para dar ao jogador duas relações que ele
já intui antes de decorar o anel. Um NPC no Salão ensina exatamente isso.

## Multiplicadores

| Situação | Multiplicador |
|---|---|
| Vantagem | **×1,6** ("Super eficaz!") |
| Neutro | ×1,0 |
| Desvantagem | **×0,65** ("Pouco eficaz...") |

Criaturas podem ter **resistências próprias** que sobrescrevem o anel — ver
[09](09-BESTIARIO.md) e [10](10-CHEFES.md). Um valor 0 significaria imunidade
(e bloqueia também a condição do elemento); nenhuma criatura usa isso hoje.

## Como o jogador percebe

- Na seleção de alvo, o jogo mostra **"Vantagem elemental ▲"**,
  **"Resistência elemental ▼"** ou **"Dano neutro"** antes de confirmar.
- No log de combate aparece "Super eficaz!" / "Pouco eficaz...".
- Números de dano mudam de cor: laranja (vantagem), azul (resistido),
  branco (neutro), amarelo (crítico).

Ou seja: o jogador **não precisa decorar o anel** para jogar bem, mas decorar
acelera muito.

---

# Condições de combate

Oito condições. Todas duram um número fixo de turnos, decrementado no início
do turno do afetado.

| Condição | Elemento | Duração | Efeito |
|---|---|---|---|
| **Queimadura** | Fogo | 3 | Dano de 6% do HP máx por turno · ATK −15% |
| **Congelado** | Gelo | 2 | SPD −50% · 35% de perder o turno |
| **Choque** | Eletricidade | 3 | 30% de perder o turno |
| **Sangrando** | Cinzas | 3 | Dano de 8% do HP máx por turno · cura recebida pela metade |
| **Cegueira** | Tinta | 3 | Precisão −40% |
| **Pavor** | Trevas | 3 | DEF −25% |
| **Atordoado** | Luz | 1 | **Perde o turno** (100%) |
| **Exposto** | Vento | 3 | Dano recebido +25% |

### Notas de balanceamento

- **Atordoado** é a mais forte por turno, e por isso dura só 1.
- **Sangrando** é a mais perigosa em luta longa: o dano por turno é o maior
  *e* atrapalha a resposta (cura pela metade). É a assinatura do Renascido e
  do Espectro de Sangue — o elemento dessa condição chama-se Cinzas desde
  2026-08-25 (reaproveita a posição de Sangue no anel; é o elemento de
  combate do Madao), mas o nome das criaturas do bestiário não mudou.
- **Congelado** é a única que mexe na ordem de turno — combina mal com um time
  que depende de agir antes.
- O dano por turno é **percentual do HP máximo**, então escala sozinho com o
  nível e nunca fica irrelevante.

### Regras gerais

- A mesma condição não empilha: reaplicar apenas renova a duração.
- Condições são limpas ao cair em combate, ao vencer, ao descansar, com
  **Sal Purificador** ou ao subir de nível.
- Uma condição não pode ser aplicada se o alvo for imune ao elemento dela.
- Dano por turno pode derrubar o personagem — e derrubar concede o EXP da
  criatura normalmente.

## Quem aplica o quê

| Condição | Fontes principais |
|---|---|
| Queimadura | Labareda (Gabriel), Coração da Forja (ult.), Frasco Ígneo |
| Congelado | Geada Profunda (Ophelia), Inverno Absoluto (ult.), Sopro Gélido |
| Choque | Tempestade Viva (Max), Céu Descendente (ult.), Faísca Errante |
| Sangrando | Fúria Vermelha (Espectro, Renascido) |
| Cegueira | Mancha Viva (Seiji), Roer o Nome (Oco Faminto) |
| Pavor | Eclipse (Marin), Véu Negro, Selo Rompido (chefe) |
| Atordoado | Lança de Aurora (Sentinela), Juízo Silencioso (chefe) |
| Exposto | Corte de Vendaval e Olho da Tempestade (Eden) |

> **Observação de design.** A party tem acesso a 6 das 8 condições —
> Sangrando e Atordoado são exclusivas dos inimigos. É intencional: as duas
> condições mais desagradáveis de sofrer são coisas que o jogo faz *com* o
> jogador, não *para* ele. ⬜ Se um dia a party ganhar acesso a elas, revisar.
