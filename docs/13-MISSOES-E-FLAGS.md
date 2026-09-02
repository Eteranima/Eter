# 13 — Missões e Flags

## Como o estado do mundo funciona

O jogo guarda **flags** — marcadores de "isso aconteceu". Uma flag é ligada e
nunca desligada. Elas são salvas junto com o save e controlam:

- que fala um NPC dá,
- que item aparece numa loja,
- que passagem está aberta,
- que baú já foi aberto.

É um sistema simples e suficiente. Não há contadores, timers nem variáveis
numéricas de história.

---

## Flags existentes

| Flag | Ligada quando | Efeitos |
|---|---|---|
| `lina_aceita` | Jogador aceita a missão da Profa. Lina | Muda a fala dela |
| `warden_defeated` | **O Selo Quebrado** é derrotado | Abre a Galeria Profunda · destrava 4 itens no Empório · habilita a recompensa da Lina |
| `lina_paga` | Jogador aceita o Selo Ressonante | Muda a fala dela (estado final) |
| `echo_defeated` | **O Eco do Primeiro** é derrotado | Destrava 2 itens no Mercador Errante · muda a fala dele |
| `chest:<mapa>:<x>,<y>` | Baú aberto | Impede reabrir |

---

## Missão: "Confirme o que há lá embaixo"

**Dador**: Profa. Lina, Pátio Central
**Tipo**: opcional, paralela à trama principal
**Recompensa**: Selo Ressonante (MP +20, ATK +5) + 600 ₢

### Fluxo

```
   [nenhuma flag]
        │
        │  falar com Lina → escolha
        ├──── "Agora não."  ──────► volta ao início (oferta permanece)
        │
        └──── "Pode pedir." ──────► liga  lina_aceita
                                        │
                                        │  (desce, enfrenta o chefe)
                                        ▼
                                  warden_defeated
                                        │
                                        │  voltar e falar com Lina → escolha
                                        ├──── "Recusar (por enquanto)"
                                        │        └─► oferta permanece
                                        │
                                        └──── "Aceitar o Selo Ressonante"
                                                 ├─ liga  lina_paga
                                                 ├─ +Selo Ressonante
                                                 └─ +600 ₢
```

### Notas de design

- **A missão não é um portão.** A escada para o subterrâneo está aberta desde o
  início; o jogador pode vencer o chefe sem nunca falar com a Lina. Se fizer
  isso, ao conversar com ela depois ele pega a missão no estado 1 e precisa
  aceitá-la para então receber a recompensa — a fala de recompensa exige
  `lina_aceita` **e** `warden_defeated`.

  > ⚠️ **Consequência a revisar.** Quem vence o chefe antes de falar com a Lina
  > precisa aceitar a missão já cumprida e conversar de novo. Funciona, mas é
  > estranho. Uma opção seria a fala de recompensa exigir só `warden_defeated`.

- **Recusar não fecha nada.** As duas recusas mantêm a oferta de pé. Não existe
  conteúdo perdido permanentemente no jogo. Foi escolha consciente.

- A recompensa é **o melhor talismã do jogo** e não pode ser comprada.

---

## Progressão travada por flag

### Galeria Profunda
Exige `warden_defeated`. Antes disso:

> *"A escada desce para um breu que engole a luz da tocha. Algo ainda a
> guarda."*

Note que a escada é **visível e alcançável** — o jogador vê que existe algo
depois. A trava é narrativa, não física.

### Estoque das lojas

| Loja | Item | Exige |
|---|---|---|
| Empório | Estilete de Nanquim | `warden_defeated` |
| Empório | Foice de Geada | `warden_defeated` |
| Empório | Manto Reforçado | `warden_defeated` |
| Empório | Amuleto Vital | `warden_defeated` |
| Mercador | Lâmina do Selo | `echo_defeated` |
| Mercador | Veste do Abismo | `echo_defeated` |

**Regra de design**: cada chefe abre um degrau de equipamento. Poder segue
progresso narrativo, não acúmulo de ouro.

---

## Diálogo com escolha

O sistema suporta, por opção:

| Recurso | Uso |
|---|---|
| Ligar flags | `lina_aceita`, `lina_paga` |
| Executar efeito | dar item, dar ouro, tocar som |
| Emendar falas de resposta | todas as opções da Lina |
| Condicionar a opção a uma flag | disponível, **ainda não usado** ⬜ |

Só a Profa. Lina usa escolhas hoje. O sistema comporta muito mais.

---

## Missões implementadas ✅

A versão 4.0.1 implementa ofertas contextuais por NPC, acompanhamento no menu,
progresso, entrega e recompensas. O catálogo inicial contém:

- **Rastros sob a Pedra:** abater 6 Lobos de Éter no Subterrâneo para o Zelador;
- **Reserva da Enfermaria:** entregar 4 Elixires de Éter;
- **Prova de Pedra:** abater 3 Golems de Pedra para o Veterano;
- **O Que Não Se Anota:** abater 5 Sombras Corrompidas;
- **Estoque Difícil:** abater 4 Sentinelas de Luz para o Mercador Errante.

## Lacunas do sistema ⬜

- O diário atual cobre missões de caça e coleta; ainda não há cadeia longa ou
  escolha moral ramificada.
- Não há flags de "conversou com X" para reações sutis.
- Não há como uma flag ser desligada, então não cabem estados reversíveis.
