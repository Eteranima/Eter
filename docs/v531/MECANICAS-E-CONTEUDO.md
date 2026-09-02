# Mecânicas e conteúdo — Éter 5.31

## Escopo medido

A fonte declara 13 personagens, 91 espécies no bestiário, 176 habilidades,
13 ultimates, 55 conjuntas, 10 pets, 88 itens, 35 missões, 25 mapas e 12
conjuntos regionais de formações. O autoteste embutido executa 1.351 asserções.

## Elenco

| Personagem | Elemento | Papel | Identidade principal |
|---|---|---|---|
| Seiji | Tinta | Escriba | equilíbrio, Caligrama e redução progressiva de custo |
| Ophelia | Gelo | Curandeira | cura forte, limpeza, congelamento e reanimação |
| Marin | Trevas | Assassina | primeiro crítico, pico de dano, dreno e ação dupla |
| Gabriel | Fogo | Guardião | provocação, guarda, Forja, postura e forma Lycan |
| Max | Eletricidade | Vanguarda | velocidade, Choque, Carga e múltiplas ações |
| Eden | Vento | Oráculo | cura coletiva, Exposto e manipulação da ordem |
| Ava Rosa Groot | Terra | Druida | maior defesa, raízes, prevenção e regeneração |
| Scythe | Veneno | Ceifadora | Pavor, condições acumuladas e execução por HP faltante |
| Madao | Cinzas | Vagabundo | Papelão, regeneração por passos e arte própria de vitória |
| Orfeu Bauss | Neutro | Lutador | ausência de fraqueza elemental, absorção e contra-ataque |
| Abel Nomikos | Fogo | Mago | leitura/desmonte do alvo e dano mágico |
| Snoopy | Eletricidade | Assassino | marca, aceleração e escolha do alvo prioritário |
| Amanda Felt | Fogo | Cavaleira | maior base do elenco, dano físico e crescimento lento |

Cada árvore do Grimório possui núcleo, contas de progressão, habilidades,
passiva única, mecânica principal, especiais, convergências e Apocalipse. Os
professores começam com base alta e crescimento menor; alunos crescem mais ao
longo da curva. Madao já teve o combate em Fogo e a árvore em Cinzas como
exceção declarada; o elemento de combate também passou a ser Cinzas
(atualização de 2026-08-25, reaproveitando a posição de Sangue no anel —
ver `docs/04-ELEMENTOS-E-CONDICOES.md`).

## Sistemas transversais

- **Elementos:** anel de dez elementos; cada elemento supera os dois seguintes.
  Fogo/Gelo e Luz/Trevas também são rivais bidirecionais.
- **Condições:** queimadura, congelamento, choque, sangramento, cegueira,
  assombro, atordoamento, Exposto, Pavor e Enraizado.
- **Combate:** iniciativa por velocidade, crítico, acerto, variação, guarda,
  resistência elemental, buffs, condições, Ressonância e habilidades conjuntas.
- **Postura:** elites e chefes possuem barra separada. Quebrá-la interrompe o
  eixo do alvo e abre uma janela multiplicativa de dano.
- **Chefes em fases:** Dono do Pântano possui quatro fases e Arquivista três;
  transições mudam comportamento, não apenas HP/arte.
- **Revanche/Eco:** chefes derrotados podem ser enfrentados novamente e escalam
  até cinco degraus, com compensação de recompensa e drop garantido.
- **Pets:** chance de agir cresce por nível, cada pet possui três formas e recebe
  bônus quando seu dono está no grupo.
- **Bestiário/caça:** aparições e abates são contados separadamente; informações
  e melhoria de drop são reveladas em degraus de 3, 10 e 25 abates.
- **Mundo:** ciclo de 900 passos por dia, mais encontros à noite em céu aberto,
  minimapa, nevoeiro de visitação, cristais e viagem rápida.
- **Grupo:** até cinco ativos, banco com 50% da EXP, recrutamento dependente do
  protagonista e formação editável.
- **Qualidade de vida:** três slots, autoequipar, cura fora de combate, mapa do
  mundo, tela cheia, teclado, mouse, toque e gamepad.
- **Áudio:** sintetizado por Web Audio, sem arquivos externos.

## Chefes

| ID | Nome | Nível | Elemento | Fases |
|---|---|---:|---|---:|
| `warden` | O Selo Quebrado | 10 | Trevas | 1 |
| `echo` | O Eco do Primeiro | 18 | Luz | 1 |
| `cinder` | A Chama Que Lembra | 26 | Fogo | 1 |
| `ninhomae` | A Que Choca | 29 | Vento | 1 |
| `swampking` | O Dono do Pântano | 32 | Veneno | 4 |
| `deluge` | O Que Ficou na Água | 32 | Gelo | 1 |
| `crown` | A Coroa Sem Cabeça | 40 | Luz | 1 |
| `arquivista` | O Arquivista | 45 | Tinta | 3 |

## Bestiário completo

- **Trevas (13):** Sombra Corrompida, O Selo Quebrado, Cria do Vazio, Lâmina Sem Nome, Ladrão de Ovos, Marginália, Fungo Errante, Escavador Ossudo, Espectro Fumegante, Corvo Pilhador, Espírito da Água Estagnada, Garça Sombria e Múmia Errante.
- **Neutro (13):** Golem de Pedra, Lobo de Éter, Tronco Queimado, Bocarra da Cisterna, Colosso de Vidro, Cascudo de Éter, Códice Lacrado, Homúnculo de Giz, Troglodita Cego, Minhoca de Pedra, Larva Real, Rã de Cano e Caranguejo de Ferro.
- **Cinzas (9)** — nome do elemento desde 2026-08-25, mesmas 9 criaturas: Espectro de Sangue, Renascido, Afogado, Sanguessuga Pálida, Matriz do Ninhal, O Redator, Aranha Matriarca, Coletor Mutante e Carniçal Putrefacto.
- **Eletricidade (3):** Fátua Voltaica, Cantora Submersa e Vigia Arcano.
- **Gelo (9):** Servo do Inverno, Fátua da Maré, Guarda da Comporta, O Que Ficou na Água, Servo Estilhaçado, Harpia de Cristal, Geleia Pluvial, Náiade Afogada e Serpente Lacustre.
- **Luz (10):** Sentinela de Luz, O Eco do Primeiro, Asa de Vidro, Reflexo Rachado, Arauto Menor, A Coroa Sem Cabeça, Errata, Besouro Prismático, Sentinela Vítrea e Escaravelho Solar.
- **Tinta (9):** Oco Faminto, Tecelã de Nanquim, Traça Astral, Índice Vivo, Nota de Rodapé, O Revisor Sem Olhos, O Arquivista, Familiar de Tinta e Livro Vivente.
- **Fogo (10):** Aprendiz Deformado, Brasa Errante, Lobo de Cinzas, Bruxo de Cinzas, Cavaleiro Calcinado, A Chama Que Lembra, Cornuda Cindária, Veado de Brasa, Javali Chamuscado e Salamandra Arenosa.
- **Vento (7):** Arauto de Penas, Espinho Vivo, Cria de Ninho, A Que Choca, Coruja de Fuligem, Vespão de Ovos e Chacal das Dunas.
- **Veneno (6):** O Dono do Pântano, Mosca de Dreno, Rã Imunda, Limo Tóxico, Rato Pestilento e Lesma de Mofo.
- **Terra (2):** Sapo de Lótus e Ent Podre.

Os IDs, níveis, fórmulas, skills, resistências, drops e artes permanecem na
fonte legível em `src/scripts/monsters/09-bestiary.js`; encontros regionais
ficam em `10-formations.js`. Essa separação evita alterar uma espécie quando a
intenção era somente mudar sua frequência de encontro.
