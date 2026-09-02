# 01 — Visão Geral

## Pitch

*Éter Anima* é um JRPG de turnos sobre cinco estudantes de uma academia de
magia que descobrem que a instituição está escondendo algo debaixo do próprio
salão principal. O jogo troca "salvar o mundo" por **algo bem mais local e
mais sujo**: descobrir o que os adultos preferiram esquecer.

Referência de sensação: JRPG de 16/32 bits — mapa em tiles com exploração
livre, combate por turnos com ordem por velocidade, e apresentação que
separa o mundo (chibi) da batalha (arte grande), no modelo dos jogos de
Pokémon da era GBA.

## Premissa

A Academia Stone Reach ensina alunos a conter o éter — a força elemental que
todo mago carrega. Perder o controle emocional causa **corrupção elemental**.

Debaixo do Salão Principal existe um subterrâneo que oficialmente não existe.
A diretora Felt mandou trancar as entradas. A Profa. Lina discorda em
silêncio e pede a um grupo de alunos que desça e confirme o que há lá.

O que há lá é **O Selo Quebrado**: algo enorme, sem rosto, feito de memória.
Ele não foi trancado para não escapar. Foi trancado para não ser *lembrado*.

## Pilares de design

1. **O elemento é a decisão principal.** Todo combate se resolve por quem
   você manda atacar o quê. O anel elemental é a única "build" que importa,
   e ele é legível: cada elemento supera dois e apanha de dois.

2. **Party grande, turno rápido.** São 5 personagens agindo por rodada. Isso
   torna cada turno individual barato e a rodada inteira densa — o jogador
   pensa em conjunto, não em unidade.

3. **Recurso é tensão, HP não é.** Uma luta normal raramente mata; ela
   **custa**. MP, itens e turnos de cura são o que o jogador perde. A morte
   vem de encarar o próximo encontro sem ter parado para se recuperar.

4. **O mundo explica as regras.** NPCs ensinam o anel elemental, a guarda e a
   Ressonância em fala comum, sem tutorial em caixa de texto separada.

5. **Nada de grind obrigatório.** O ritmo alvo é 10-14 batalhas por nível, e
   o chefe é vencível no nível que a área entrega.

## Estado atual — v4.0.1

> A tabela abaixo descreve os sistemas da 3.6.0 e continua exata para eles. A
> 4.0.1 acrescentou a sexta personagem, os dois grupos de três, o elemento
> Vento, a condição Exposto, cinco missões e o modo autenticado com mundo
> compartilhado. Estado técnico completo em [Estado atual](ESTADO-ATUAL.md).

| Sistema | Estado |
|---|---|
| Exploração em mapa, 7 áreas conectadas | ✅ |
| Combate por turnos, ordem por SPD, até 3 inimigos | ✅ |
| 8 elementos com anel de vantagem | ✅ |
| 7 condições de combate com efeito real | ✅ |
| 5 personagens com progressão e habilidades por nível | ✅ |
| Ressonância (ultimate por acúmulo) | ✅ |
| Equipamento em 3 slots | ✅ |
| Lojas com estoque destravado por progresso | ✅ |
| Missão com escolha de diálogo e flags | ✅ |
| Save/load | ✅ |
| 9 criaturas + 2 chefes | ✅ |
| Arte 2D de combate para os 5 | ✅ |
| Sprite de mapa próprio | 🟡 só Marin; os outros usam arte herdada |
| Arte de criatura | 🟡 desenho procedural por forma, sem arte dedicada |
| Abertura / apresentação do elenco | ⬜ o jogo começa direto no pátio |
| Capítulo 2 | ⬜ gancho existe, conteúdo não |

## O que falta para "ser um jogo completo"

Em ordem de impacto, na avaliação de quem escreveu isto:

1. **Abertura.** Hoje o jogador aparece no pátio sem saber quem são os cinco,
   por que estão juntos, nem o que se espera dele. É o buraco mais visível.
2. **Identidade dos personagens.** Eles têm papel mecânico (curandeira,
   guardião) mas quase nenhuma voz. Nenhum deles fala durante o jogo.
3. **Arte de criatura.** Com a party em arte 2D detalhada, as criaturas
   procedurais destoam muito.
4. **Capítulo 2.** O Eco do Primeiro fecha o arco atual e abre o próximo,
   mas não há para onde ir depois dele.

## Público e tom

Tom **seco e adulto**, sem deboche. Os NPCs falam pouco e mal. Ninguém
explica sentimento — as pessoas dizem o mínimo e o resto fica implícito.
Não há alívio cômico deliberado.

Violência é presente mas não gráfica; o horror do jogo é de *ausência*
(coisas esquecidas, seladas, sem rosto), não de sangue.
