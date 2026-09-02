# 15 — Mundo multijogador, Parties e encontros

> **Arquivado em 18/08/2026.** A camada multijogador saiu deste repositório
> quando homologação foi encerrada e o jogo voltou a ser publicado como
> experiência local, a partir do conteúdo 4.5.0. O código e o histórico estão
> em `necromod/eter-multijogador-arquivo`, com o caminho de reativação
> documentado. Os bancos foram preservados em
> `/srv/den/state/eter-arquivo-2026-08-18/`.
>
> Este documento descreve o modelo de dois grupos de três, do conteúdo 4.0.1.
> O 4.5.0 usa grupo único de cinco com reserva e elenco recrutável, então nada
> aqui vale como especificação do jogo atual — vale como registro do que existiu.

> Documento de design aprovado em 13/08/2026. Descreve como a versão
> autenticada deve funcionar. A implementação autoritativa e os formatos de
> rede pertencem ao repositório DeN.

## Estado de implementação em 14/08/2026, às 16:05 BRT

- **está no ar**: os dois ambientes oferecem visitante e autenticado na mesma
  porta, com conteúdo 4.0.1 e catálogo autoritativo na mesma versão;
- login, conta, save no servidor, importação do save local, projeção de
  jogadores remotos por mapa, nick sobre o representante e limite de quinze
  jogadores estão publicados e provados com quinze sessões simultâneas;
- Party, encontro, chefe, fuga, morte, ouro e PvP estão implementados no
  servidor e no cliente, e passaram por testes de unidade e de integração, mas
  **ainda não têm prova viva com múltiplos jogadores reais** — o ensaio atual
  cobre login, projeção, importação e responsividade;
- o visitante nunca depende da API: sem sessão o jogo roda inteiro no
  navegador, com as quatro dificuldades; a sessão fixa a dificuldade em
  `normal`;
- defeito conhecido e aberto: o replay do histórico pode ressuscitar presenças
  de jogadores já removidos, inflando a contagem de remotos. Detalhes e medição
  no DeN, em `docs/handoffs/ETER-ANIMA-PRODUCAO-2026-08-14.md`.

## Dois modos

- **Visitante:** solo local, sem presença de outros usuários, save no navegador.
- **Autenticado:** mundo único persistente, jogadores visíveis no mesmo mapa,
  Party social e encontros compartilhados.

Entrar não joga ninguém automaticamente numa Party ou combate.

## Mundo compartilhado

Há um único mundo para até quinze usuários. Cada navegador recebe apenas a
presença do mapa atual. Só o líder selecionado de cada jogador e seu nick são
desenhados. Jogadores não colidem.

Fora de Party, diálogo, NPC, item, missão, flag, loja, inventário e progresso
são individuais. Duas pessoas podem falar com o mesmo NPC ao mesmo tempo e
receber diálogos diferentes.

## Party social

Até cinco jogadores, sem líder. Qualquer membro convida; o convite não expira e
exige aceite. Qualquer membro sai; expulsão exige maioria dos demais. Membros de
Party não duelam.

Enquanto juntos:

- diálogo abre para todos e somente o iniciador escolhe;
- item de mapa e XP são recebidos integralmente por todos os elegíveis;
- missão avança para todos que já a possuem ativa;
- mudança de mapa leva todos;
- cada pessoa anda livremente no mapa;
- iniciar combate puxa todos para o mesmo lado;
- aderir a combate existente exige que o primeiro membro escolha o lado antes
  de puxar a Party;
- um item/equipamento transferível pode ser enviado a outro membro pelo menu.

### Âncora de progresso

O mundo projetado para a Party segue quem tem menor XP total acumulada. Empate
usa menos marcos narrativos e depois uma ordem estável. Essa pessoa é âncora,
não líder.

Boss ou item ainda pendente para a âncora reaparece para todos. Os mais fortes
podem repetir. Repetição concede XP e ouro, mas não duplica missão, item único
ou recompensa narrativa.

## Encontros

Ao começar uma luta, os combatentes e um símbolo `VS` ficam visíveis no mapa.
Outros jogadores podem aderir.

- alvo original: **Defensores**;
- quem puxou a luta: **Atacantes**;
- lado escolhido é permanente;
- cada usuário sempre vê seu próprio lado à direita; a tela é espelhada sem
  alterar a regra do servidor;
- novo participante vira alvo imediatamente, mas só age na próxima fase
  elegível de seu lado.

## Ordem e ação

Some a velocidade efetiva dos dois lados. O maior total começa; empate favorece
quem puxou a luta. Dentro do lado, a velocidade do representante que estava no
campo quando a fase foi congelada ordena os jogadores. A escolha do personagem
que agirá ocorre só no turno e não muda retroativamente essa fila. Na fase
seguinte, o representante então vigente pode produzir uma nova ordem. A fila não
muda no meio da fase.

Cada ação tem quinze segundos. O jogador pode **Passar**. Timeout apenas passa,
sem guardar ou fugir automaticamente.

Sozinho, o usuário controla todo o grupo pessoal como hoje. Com dois ou mais
usuários no encontro, cada turno pertence ao usuário: ele escolhe um personagem
próprio e uma ação.

## Fuga, conexão e morte

Guardar e Fugir atuais continuam existindo; fuga é impossível contra chefe.
No multiplayer, fuga bem-sucedida remove somente quem fugiu e também o retira
da Party. Se todos fugirem, a Party é desfeita.

Desconectado continua alvo. Cada timeout conta como turno perdido; três turnos
próprios perdidos desconectado causam morte. Morto:

- perde todo o ouro;
- sai da Party;
- volta ao último save/checkpoint;
- não recebe a vitória posterior.

O assassino recebe todo o ouro perdido, uma única vez.

## Chefes

Com `n` jogadores registrados no encontro:

```text
HP = base × [1 + 0,40 × (n − 1)]
ATK/Poder = base × [1 + 0,40 × (n − 1)]
DEF = base × [1 + 0,40 × (n − 1)]
SPD = base × [1 + 0,40 × (n − 1)]
```

O maior `n` alcançado nunca diminui.

| Jogadores | Visual |
|---:|---|
| 1 | normal |
| 2 | aura verde suave |
| 3 | aura azul |
| 4 | aura vermelha |
| 5+ | vermelho-sangue e fumaça preta |

Nome, sombra e barra acompanham o efeito, sem indicador adicional.

Um jogador pode ajudar o chefe. Se todos os adversários originais caírem, o
chefe se volta contra os traidores e diz:

> “Agora, traidor, você perecerá junto aos seus companheiros.”

Não há aviso anterior. A escala e o HP atual permanecem. Se os traidores depois
vencerem, recebem a recompensa integral do chefe e XP/ouro dos jogadores que
mataram.

## PvP

- duelo direto exige aceite;
- zona inicial proíbe PvP;
- futuras áreas hostis podem permitir ataque direto;
- membros da Party não duelam;
- após enfrentar alguém, é preciso entrar em dois outros encontros antes de
  enfrentar essa pessoa novamente;
- morte concede proteção por duas entradas em encontro;
- bloquear impede comunicação, convite e duelo, mas não cria invisibilidade ou
  imunidade numa área hostil;
- histórico, denúncia e auditoria são obrigatórios.

## Recompensas

- vencedor vivo recebe XP integral mesmo sem causar dano;
- loot comum é individual;
- XP, ouro e item de mapa da Party não são divididos;
- morto, fugitivo ou lado derrotado não recebe vitória;
- missão só avança se já estava ativa;
- repetir chefe dá XP e ouro novamente;
- drop único futuro de chefe terá apenas um vencedor, por regra ainda não
  definida;
- recompensa e morte nunca duplicam após reconexão.
