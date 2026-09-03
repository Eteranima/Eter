# 11 — Mapas e Locais

As áreas do jogo são verificadas como **totalmente percorríveis a pé** — cada
baú, placa, NPC e passagem é alcançável.

## Atlas interativo

`M` abre o atlas do mundo. Ele é derivado de todas as entradas de `MAPS`,
portanto integra automaticamente áreas novas, interiores e masmorras sem uma
lista paralela para manter. Conexões ainda não percorridas aparecem discretas;
áreas visitadas mostram seu terreno. Clique numa área para inspecioná-la,
use a roda para aproximar, `TUDO` para ver o conjunto e `FOCO` para centralizar
a área selecionada.

A viagem rápida permanece deliberadamente limitada: só funciona para cristais
de éter já descobertos. Ver uma área no atlas nunca desbloqueia passagem,
quest, chefe ou atalho.

## Mapa de conexões

```
                        Ala de Estudos
                              ▲
                              │ (2 portas)
   Anexo Oeste ◄───► Pátio Central ◄───► Salão Principal
                                              │
                                              ▼ escada
                                      Subterrâneo Selado
                                              │
                                              ▼
                                        Câmara do Selo
                                              │
                                              ▼ (após vencer O Selo Quebrado)
                                       Galeria Profunda
```

---

## Pátio Central
**`Stone Reach — Pátio Central`** · 40×22 · exterior

Ponto de partida. Grama, calçamento, uma fonte de água e árvores.

| | |
|---|---|
| **Encontros** | Não — área segura |
| **Criaturas** | Nenhuma hostil |
| **Cristal de save** | Sim |
| **Baú** | Poção ×2 |
| **Saídas** | Salão Principal (porta grande) · Anexo Oeste |

**NPCs**: Aluno (perambula), Profa. Lina, Balconista (loja), Kael Archimedes,
Zelador (perambula).

**Placa**: *"Academia Stone Reach · Salão Principal. Mantenha o éter contido
nos corredores."*

> A Academia é área de convivência: nem a grama aciona combate. O Zelador
> aponta rastros que descem para o Subterrâneo, onde a ameaça começa.

## Porto Lúmina

**`Porto Lúmina`** · 38×22 · exterior seguro

Extensão oeste do Pátio Central, disponível desde o começo. Três píeres
separam a água do mercado; os barcos atracados são obstáculos e respondem ao
interagir, mas ainda não conduzem a viagens. A taverna Mesa de Âmbar tem
interior acessível, e o Mercado da Maré tem interior próprio para vender
suprimentos de exploração sem antecipar equipamento.

| | |
|---|---|
| **Encontros** | Não |
| **Saída** | Pátio Central, pelo lado leste |
| **Serviços** | Mercado da Maré · Mesa de Âmbar (taverna) |
| **Pontos de interesse** | Vento de Coral · dois barcos de pesca · placas do cais |

> Lúmina traz pedra, água, madeira, coral, teal e âmbar para fora da paleta
> monocromática da Academia. Violeta fica restrito aos sinais de éter.

## Mesa de Âmbar

**`Mesa de Âmbar`** · 17×11 · interior seguro

Taverna do porto. Mesas, balcão e luzes âmbar/azul-esverdeadas formam um
espaço de conversa, não um segundo posto de cura ou comércio. A porta retorna
ao cais e o Tavio funciona como referência social do lugar.

---

## Mercado da Maré

**`Mercado da Maré`** · 19×11 · interior seguro

Comércio do porto. Maira atende atrás do balcão; prateleiras, caixas e barris
organizam o estoque de viagem já existente. As luzes dourada e azul, etiquetas
coral e o estandarte açafrão quebram a monotonia sem alterar preços, itens ou
a curva de equipamento. A porta retorna ao cais.

---

## Salão Principal
**`Stone Reach — Salão Principal`** · 30×16 · interior

Coração da academia. Tapete cerimonial, dois braseiros de éter, estantes,
pilares.

| | |
|---|---|
| **Encontros** | Não |
| **Cristal de save** | Sim |
| **Baú** | Elixir de Éter ×2 |
| **Saídas** | Pátio (sul) · Ala de Estudos (2 portas) · **Subterrâneo (escada)** |

**NPCs**: Bibliotecária, Veterano.

> A escada para o subterrâneo fica no canto inferior esquerdo, atrás de
> entulho. Está fisicamente acessível desde o início — nada impede o jogador
> de descer antes de falar com a Lina. A missão dela é **opcional e
> paralela**, não um portão.

---

## Ala de Estudos
**`Stone Reach — Ala de Estudos`** · 23×11 · interior

Biblioteca. Estantes, mesas de leitura, pilares.

| | |
|---|---|
| **Encontros** | Não |
| **Baú** | Poção Maior ×1 |
| **Saídas** | Salão Principal |

**NPC**: Estudante — explica o que é Ressonância.

**Livro aberto**: *"Guarde-se quando o inimigo respirar fundo. Metade do dano
é metade do luto."* — ensina o comando Guardar.

---

## Anexo Oeste
**`Stone Reach — Anexo Oeste`** · 16×8 · interior

Enfermaria. O menor mapa do jogo.

| | |
|---|---|
| **Encontros** | Não |
| **Baú** | Pena de Ressurgir ×1 |
| **Saídas** | Pátio Central |

**NPC**: Enfermeira — **restaura HP/MP da party inteira** ao conversar,
gratuitamente e sem limite de uso.

> É o ponto de recuperação alternativo ao cristal. Estar num mapa separado
> torna a ida uma decisão de tempo.

---

## Subterrâneo Selado
**`Subterrâneo Selado`** · 34×22 · masmorra

Primeiro ambiente hostil. Corredores estreitos, entulho, braseiros isolados.

| | |
|---|---|
| **Encontros** | Mobs visíveis — sem rolagem por passos |
| **Criaturas** | Lobos de Éter, Sombra, Golem e Servo do Inverno |
| **Cristal de save** | Sim (canto sudoeste) |
| **Baús** | Elixir de Éter ×3 · Poção Maior ×2 |
| **Saídas** | Salão Principal (escada) · Câmara do Selo |

**Inscrição**: *"O que foi selado aqui não dorme. Apenas espera ser lembrado."*

---

## Câmara do Selo
**`Câmara do Selo`** · 21×12 · masmorra

Sala do primeiro chefe. Quatro pilares, um cristal de save antes da luta.

| | |
|---|---|
| **Encontros** | Não |
| **Cristal de save** | Sim — imediatamente antes do chefe |
| **Chefe** | **O Selo Quebrado**, no centro-norte |
| **Saídas** | Subterrâneo · **Galeria Profunda** (travada) |

A escada para a Galeria fica atrás do chefe. Antes de vencê-lo:

> *"A escada desce para um breu que engole a luz da tocha. Algo ainda a
> guarda."*

---

## Galeria Profunda
**`Galeria Profunda`** · 30×22 · masmorra

Conteúdo pós-chefe. Estrutura em anel com duas salas laterais.

| | |
|---|---|
| **Encontros** | Mobs visíveis — sem rolagem por passos (v5.31) |
| **Criaturas** | Oco Faminto, Renascido, Sentinela de Luz — três mobs de campo, mesmo padrão do Subterrâneo |
| **Cristal de save** | Sim (corredor central) |
| **Baús** | Éter Destilado ×2 · **Couraça Selada ×1** |
| **Chefe** | **O Eco do Primeiro**, na alcova sul |
| **Saídas** | Câmara do Selo |

**NPC**: Mercador Errante — segunda loja.

**Inscrição**: *"O Primeiro não foi selado. Foi esquecido. É pior."*

---

## Tipos de terreno

| Terreno | Passa? | Encontro? |
|---|---|---|
| Grama | sim | **sim** |
| Calçamento / piso / tapete | sim | não |
| Terra / pedra rachada | sim | **sim** |
| Parede, árvore, água, estante, mesa, pilar, entulho | não | — |
| Braseiro | não | — (dá fala ao interagir) |
| Baú | não | interagir pela frente |
| Cristal de éter | sim | salva e restaura |
| Porta / escada | sim | teleporta ao pisar |

## Regras de exploração

- Desde a v5.31, **nenhum mapa de exploração declara encontro por passo**:
  todo combate ambiente do jogo vem de mobs visíveis no campo (Subterrâneo
  Selado, Galeria Profunda e as sete regiões além da Academia — ver
  `docs/PENDENCIAS-DESIGN.md`, item 3, para a lista completa e o
  raciocínio de cada região). Mobs de campo bloqueiam a própria casa,
  patrulham pouco e retornam após a vitória sem entrar no save.
- Portas e escadas ativam **ao pisar**, com transição de fade.
- Baús e placas ativam **ao interagir de frente**.
- Cristais podem ser pisados e ativados de cima.
- NPCs **viram para o jogador** ao conversar; dois deles perambulam quando
  ociosos.

## Lacunas ⬜

- Este documento descreve só a Academia e o trio do Subterrâneo (conteúdo
  do Capítulo 1). As dez regiões além dele (Mata Cindária, Ninhal de Éter,
  Cisterna Afogada, Coroa de Vidro, Arquivo Esquecido, Esgoto, Lago
  Afogado, Baixios da Podridão e Deserto) já existem em código, com NPCs,
  missões e mobs de campo próprios, mas ainda não têm ficha aqui — mapear
  cada uma é trabalho futuro, não uma correção deste documento.
- Mapas menores que a tela (Anexo, Ala, Câmara) ficam centralizados com preto
  em volta. Lê como sala flutuando no escuro; aceitável, mas é escolha não
  deliberada.
- Não há atalho de volta: sair da Galeria exige refazer todo o caminho.
- Não há música distinta por área — só três trilhas (campo, masmorra, batalha)
  e uma de chefe.
