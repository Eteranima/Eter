# Atlas — Dialogue Sprite (corpo inteiro na caixa de diálogo)

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas: sem grade, mas siga a proporção real do corpo — o motor
> escala pela ALTURA, então a largura sai proporcional sozinha.**

Fonte: `DIALOGUE_SPRITES` + `Msg.draw()` em `src/scripts/ui/22-dialogue.js`.

## Referência e participantes

Layout inspirado na tela de diálogo do jogo Hades: o personagem
aparece em corpo inteiro, ancorado no chão da tela, atrás da caixa de
texto — só a metade de cima (rosto, tronco) aparece por cima do balão,
a caixa cobre a metade de baixo.

Uma linha de diálogo pode declarar até dois `participants`, cada qual
com `speaker`, `side` (`left` ou `right`), `mirror`, `focus`, `sheet` e,
opcionalmente, `dialogSprite`. Conversas iniciadas ao falar com um NPC
montam essa dupla automaticamente: integrante controlado à esquerda e
interlocutor à direita. As artes `dlg_*` conhecidas são espelhadas pelo
motor apenas quando necessário para encarar o centro; `mirror` explícito
continua sendo a exceção manual. O falante recebe halo e o ouvinte fica
escuro/dessaturado. `simultaneous:true` deixa os dois claros.

O mesmo vale para `say` de uma cena roteirizada quando `who` resolve para um
NPC com sheet. Narrações, falas do jogador e cenas que declaram
`participants` (inclusive uma lista vazia deliberada) mantêm a composição que
o roteiro especificar.

Linhas avulsas sem `participants` continuam compatíveis: mostram apenas o
falante à esquerda. Se um participante automático não tiver `dlg_*`, o motor
recorta o quadro parado central da sheet de campo, na direção voltada ao
centro, e o exibe a `64%` da altura da tela. Nunca use uma sheet world inteira
como `dialogSprite`: somente chaves `dlg_*` são aceitas nessa propriedade.

## Especificação

- **Imagem única**, sem grade — uma pose só, de corpo inteiro,
  olhando de frente ou em leve perfil (3/4), expressiva o suficiente
  pra carregar uma cena de diálogo sozinha.
- **Altura de EXIBIÇÃO no jogo:** `92% da altura da tela` (H=600px do
  canvas do jogo, então ~552px) — calculado automaticamente a partir
  da altura do arquivo, mantendo a proporção real (`largura/altura`
  do arquivo original). O fallback de sheet usa `64%` para permanecer
  legível sem fingir ser arte de corpo inteiro.
- **Posição:** ancorado no canto inferior ESQUERDO da tela.
- **Resolução do arquivo fonte:** livre — recortado pelo bounding box
  real do personagem (sem sobra de fundo transparente ao redor).
  Faixa usada nas entregas atuais: entre ~500px e ~1000px de largura,
  ~1400–1530px de altura.
- **Um personagem pode ter mais de um Dialogue Sprite** (ex.: traje
  alternativo) — nesse caso registre cada um com uma chave própria em
  `SPRITE_DATA` (`dlg_<personagem>_<variante>`) e force o uso daquele
  específico numa fala com o campo `dialogSprite` na linha, em vez de
  depender só do nome do falante.

## Personagens já cadastrados

| Falante | Chave (`SPRITE_DATA`) |
|---|---|
| Gabriel | `dlg_gabriel` |
| Ava Rosa Groot | `dlg_ava` (traje alternativo: `dlg_ava_outfit2`, via `dialogSprite`) |
| Ophelia | `dlg_ophelia` |
| Orfeu Bauss | `dlg_orfeu` |
| Scythe | `dlg_scythe` |
| Abel Nomikos | `dlg_abel` |
| Kael Archimedes | `dlg_kael` |
| Seiji | `dlg_seiji` |
| Max | `dlg_max` — inclui o ratinho zumbi no ombro |
| Beatriz Demeter *(NPC novo, sem entrada de personagem ainda)* | `dlg_beatriz` |
| Calder Pell *(NPC novo)* | `dlg_calderpell` |
| Carmila Reachforth *(NPC novo)* | `dlg_carmila` |
| Farnese *(NPC novo)* | `dlg_farnese` |
| Malquior Morningstar *(NPC novo)* | `dlg_malquior` |
| Sebastian Crowley *(NPC novo)* | `dlg_sebastian` |

## Regra para personagem NOVO

1. Gere a arte com fundo verde puro, corpo inteiro, proporção livre.
2. Registre o arquivo em `SPRITE_DATA` (`00-assets.js`) com a chave
   `dlg_<nome_em_minusculas>`.
3. Adicione a entrada `'Nome do Falante': 'dlg_chave'` em
   `DIALOGUE_SPRITES` (`22-dialogue.js`) — a partir daí, toda fala
   desse personagem já mostra o sprite grande automaticamente, sem
   precisar mexer em nenhuma cena/diálogo existente.
