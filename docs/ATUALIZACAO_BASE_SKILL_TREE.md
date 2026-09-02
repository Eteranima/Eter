# ATUALIZACAO BASE SKILL TREE

## Documento canônico de atualização
Este documento consolida as regras atuais do sistema de **Elementos**, **Raças**, **Skill Tree**, **Rodas de Habilidades**, **Fusões**, **Transformações** e **Compêndio/Códice**.

> Sempre que houver conflito com versões anteriores, vale a regra mais recente registrada aqui.

---

# 1. PRINCÍPIOS GERAIS DA SKILL TREE

## 1.1 Estrutura
Cada personagem utiliza um sistema de progressão visual em formato de grimório/pergaminho, com nós, contas de progressão, conexões, requisitos, convergências e habilidades.

A Skill Tree deve ser:
- funcional;
- navegável;
- data-driven;
- expansível;
- integrada ao sistema elemental, racial, de classe e de transformação.

## 1.2 Estilo visual
A interface deve seguir:
- grimório antigo;
- pergaminho envelhecido;
- manchas;
- bordas queimadas;
- tinta desbotada;
- símbolos;
- runas;
- iluminação elemental discreta;
- visual orgânico e não moderno.

Evitar:
- HUD sci-fi;
- aparência de aplicativo moderno;
- árvores estáticas sem funcionalidade.

## 1.3 Nós
Tipos previstos:

```text
CORE
PROGRESSION
SKILL
PASSIVE
SPECIAL
CONVERGENCE
ULTIMATE
BRIDGE
TRANSFORMATION
CONDITIONAL
```

Estados:

```text
BLOCKED
AVAILABLE
LEARNED
SELECTED
CONDITIONALLY_INACTIVE
```

## 1.4 Contas de progressão
As pequenas contas pretas:
- são nós obrigatórios de progressão;
- não são habilidades;
- podem custar pontos;
- ligam caminhos;
- funcionam como pré-requisitos;
- podem conceder microbônus;
- não possuem cooldown.

## 1.5 Pontos
Não existe teto global fixo de pontos de alma.

```text
Pontos disponíveis = Pontos ganhos - Pontos gastos
```

O jogador pode, com progressão suficiente, aprender toda a árvore.

---

# 2. DUAS RODAS DE HABILIDADES

Cada personagem possui duas rodas interligadas:

```text
RODA CONVENCIONAL
+
RODA NÃO CONVENCIONAL
```

As duas pertencem ao mesmo sistema.

## 2.1 Roda Convencional
Representa:
- técnica;
- domínio;
- uso estável do elemento;
- classe;
- armas;
- combate normal;
- aplicações diretas;
- passivas tradicionais;
- domínio técnico.

Pergunta central:

> Como o personagem normalmente luta?

## 2.2 Roda Não Convencional
Representa:
- distorções;
- exceções;
- fusões;
- transformações;
- técnicas raras;
- riscos;
- corrupção;
- mutações;
- manipulações anormais;
- efeitos que alteram outras habilidades.

Pergunta central:

> Como o personagem quebra as regras do próprio estilo?

## 2.3 Interligação
As duas rodas devem possuir:
- nós de ponte;
- convergências;
- requisitos cruzados;
- mutadores;
- habilidades condicionais;
- ultimates híbridas.

```text
CONVENCIONAL
     │
   PONTE
     │
NÃO CONVENCIONAL
```

## 2.4 Nós de Ponte
Tipo:

```text
BRIDGE
```

Podem exigir:
- Skill específica;
- domínio elemental;
- classe;
- transformação;
- combinação de elementos;
- requisito racial.

## 2.5 Convergências
Uma habilidade pode exigir investimento nas duas rodas.

```text
Skill Convencional
+
Skill Não Convencional
=
Convergência
```

## 2.6 Mutadores
A Roda Não Convencional pode alterar Skills da Convencional.

```text
SkillMutator
{
    targetSkill
    sourceNode
    modifiers[]
}
```

---

# 3. PERSONAGENS PRINCIPAIS

Existem exatamente 9 personagens principais:

1. Gabriel
2. Maxx
3. Eden
4. Marin
5. Seiji
6. Scythe
7. Ava Rosa Groot
8. Ophelia
9. Madao

## 3.1 Elementos principais conhecidos

| Personagem | Elemento principal |
|---|---|
| Gabriel | Fogo |
| Maxx | Eletricidade |
| Eden | Ar |
| Marin | Trevas |
| Seiji | Tinta |
| Scythe | Veneno |
| Ava Rosa Groot | Terra / afinidade vegetal |
| Ophelia | Gelo |
| Madao | Cinzas |

> Madao é obrigatoriamente **Cinzas**, nunca Fogo.

---

# 4. ELEMENTOS — ESTRUTURA ATUAL

## 4.1 Elementos atualmente considerados na roda elemental

A roda elemental atual inclui:

1. Água
2. Terra
3. Ar
4. Fogo
5. Metal
6. Madeira
7. Físico / Neutro
8. Sangue
9. Osso
10. Veneno
11. Ácido
12. Cristal
13. Areia
14. Gelo
15. Luz
16. Trevas
17. Eletricidade
18. Som
19. Cinzas

## 4.2 Correções canônicas

### Madeira e Planta

```text
MADEIRA = PLANTA
```

Não são dois elementos diferentes.

Usar apenas:

```text
MADEIRA
```

Planta pode existir como manifestação, técnica, estética ou subtipo de Madeira, mas não como elemento separado na roda.

### Cristal, Vidro e Espelho

```text
CRISTAL = VIDRO = ESPELHO
```

Existe apenas um elemento:

```text
CRISTAL
```

com três manifestações:

```text
Cristal
Vidro
Espelho
```

### Ar e Vento

O elemento-base é:

```text
AR
```

Vento, Correntes e Tempestade podem ser especializações, manifestações ou técnicas de Ar.

---

# 5. ELEMENTOS DERIVADOS / NÃO CONVENCIONAIS

Mesmo que alguns elementos tenham origem derivada, quando definidos como participantes da roda elemental eles devem ser tratados mecanicamente como elementos completos.

## 5.1 Tinta

Origem canônica:

```text
ÁGUA + TREVAS = TINTA
```

Tinta representa:
- escrita;
- marcas;
- registros;
- selos;
- manifestação;
- criação por traços;
- absorção/manipulação arcana.

Mecânicas possíveis:

```text
MARK
WRITE
SEAL
CREATE
COPY
```

## 5.2 Cinzas

Origem canônica:

```text
FOGO + TERRA + TREVAS = CINZAS
```

Cinzas não são apenas Fogo residual.

Representam:
- desgaste;
- deterioração;
- maldição;
- perda;
- decadência;
- ruína;
- fuligem;
- restos do que foi destruído.

Madao utiliza Cinzas como elemento principal.

---

# 6. MECÂNICAS PRINCIPAIS DOS ELEMENTOS

## 6.1 Cristal

Mecânica principal:

# REFRAÇÃO

```text
CRISTAL
→ REFRAÇÃO
```

A Refração unifica Cristal, Vidro e Espelho.

Aplicações:
- refletir;
- desviar;
- dividir;
- redirecionar;
- amplificar;
- duplicar trajetórias;
- alterar direção de projéteis;
- devolver efeitos;
- usar superfícies espelhadas;
- criar múltiplas incidências;
- manipular luz e energia através de estruturas cristalinas.

## 6.2 Cinzas

Mecânica principal:

# MALDIÇÃO

```text
CINZAS
→ MALDIÇÃO
```

Progressão possível:

```text
MALDIÇÃO
↓
DECADÊNCIA
↓
RUÍNA
```

Interações:
- aplicar;
- acumular;
- espalhar;
- prolongar;
- corroer;
- enfraquecer;
- consumir;
- detonar;
- preservar stacks;
- transformar Maldição em efeitos avançados.

A identidade central de Cinzas é sempre **Maldição**.

---

# 7. MADAO — CINZAS

## 7.1 Regra principal
Madao:

```text
ELEMENTO PRINCIPAL = CINZAS
```

Nunca deve ser tratado como usuário de Fogo.

Fogo pode aparecer somente como resíduo:
- brasa quase apagada;
- carvão;
- fuligem;
- restos queimados.

Evitar:
- bolas de fogo;
- pilares de fogo;
- chamas dominantes;
- identidade visual típica de piromante.

## 7.2 Filosofia
> Fogo destrói. As cinzas permanecem.

## 7.3 Caminhos
Madao pode possuir:
- Caminho da Preguiça;
- Caminho das Cinzas;
- Caminho da Corrosão;
- Convergência: Ruína.

**Preguiça é exclusiva de Madao.**

Nenhum outro personagem recebe Caminho da Preguiça.

## 7.4 Mecânica
A mecânica central é:

```text
MALDIÇÃO
```

Possíveis estágios:

```text
I   Fuligem
II  Desgaste
III Corrosão
IV  Apatia
V   Decadência
```

No limite:
- ativa Decadência;
- enfraquece defesa;
- prejudica recuperação;
- reduz eficiência;
- permite consumo por Skills;
- habilita Ruína.

---

# 8. SANGUE

## 8.1 Regra racial
Sangue é o elemento racial dos Vampiros.

```text
VAMPIRO
→ SANGUE
```

## 8.2 Roda própria
Vampiros possuem uma:

# RODA ELEMENTAL RACIAL DE SANGUE

Essa roda é própria da raça Vampiro.

## 8.3 Participação elemental
Pela regra atual, Sangue também deve ser tratado como elemento completo dentro das relações de vantagens e desvantagens elementais.

Portanto:
- possui identidade racial;
- possui roda racial própria;
- pode interagir com os outros elementos;
- pode aparecer na roda de vantagens/desvantagens elementais.

## 8.4 Mecânicas
Sangue pode utilizar:

```text
DRAIN
BLEED
SACRIFICE
COAGULATE
BLOOD_MARK
```

Aplicações:
- drenagem;
- sangramento;
- sacrifício;
- coagulação;
- regeneração;
- custo de Vida;
- manipulação de HP;
- marcas sanguíneas.

---

# 9. RAÇAS JOGÁVEIS

Raças atualmente definidas:

1. Humano
2. Elfo
3. Lycan
4. Morto-Vivo
5. Vampiro

Demônio não é raça jogável.

```text
DEMON
playable = false
npcOnly = true
```

---

# 10. HUMANO

## Vantagens
- até 3 elementos;
- alta versatilidade elemental;
- adaptabilidade;
- acesso à Forma Demoníaca.

## Identidade
Humano é a raça de maior flexibilidade elemental.

```text
maxElementSlots = 3
```

---

# 11. ELFO

## Regras atuais
- até 2 elementos;
- mais Mana;
- não possui bônus racial geral de atributos;
- pode gastar Mana adicional para causar o dobro de dano;
- possui Forma Demoníaca.

## Passivas

### Reserva Arcana
Elfos possuem reserva de Mana superior.

### Sobrecarga Arcana

```text
Mana adicional
→ 2x dano
```

A habilidade deve ser compatível com Sobrecarga Arcana.

## Importante
Regra removida:

```text
Elfo possui bônus geral de atributos
```

Isso NÃO existe mais.

---

# 12. LYCAN

## Regras
- até 2 elementos;
- passivas lupinas;
- instintos físicos;
- sentidos aprimorados;
- Forma Lobisomem.

## Transformação

```text
LYCAN
→ FORMA LOBISOMEM
```

Lycan não possui Forma Demoníaca.

---

# 13. MORTO-VIVO

## Regras
- até 2 elementos;
- possui elementos;
- não conjura magia;
- utiliza Elementos por meio de Armas Elementais;
- não possui Forma Demoníaca.

```text
canUseElements = true
canCastMagic = false
canUseElementalWeapons = true
```

## 13.1 Armas Elementais

Princípio:

> Mortos-Vivos não conjuram o Elemento — eles o enterram dentro da arma.

```text
ARMA + ELEMENTO = ARMA ELEMENTAL
```

Exemplos:
- espada + Gelo;
- machado + Cinzas;
- lança + Eletricidade;
- adaga + Veneno.

Tags possíveis:

```text
ELEMENTAL
WEAPON
PHYSICAL
MELEE
RANGED
IMBUE
```

Não usar tag `MAGIC` em técnicas de arma elemental do Morto-Vivo.

## 13.2 Imbuição dupla
Pode existir em progressão avançada:

```text
ARMA + ELEMENTO A + ELEMENTO B
```

com fusões específicas.

---

# 14. VAMPIRO

## Regras
- até 2 elementos comuns;
- Sangue é elemento racial;
- possui Magia de Sangue;
- possui Forma Vampírica;
- não possui Forma Demoníaca.

## Estrutura

```text
VAMPIRO
├─ Elemento Racial: Sangue
├─ Até 2 Elementos Comuns
└─ Forma Vampírica
```

## Forma Vampírica
Pode modificar:
- presas;
- olhos;
- garras;
- aura;
- regeneração;
- drenagem;
- velocidade;
- agressividade;
- habilidades de Sangue.

---

# 15. FORMAS / TRANSFORMAÇÕES

## Humano

```text
FORMA DEMONÍACA
```

## Elfo

```text
FORMA DEMONÍACA
```

## Vampiro

```text
FORMA VAMPÍRICA
```

## Lycan

```text
FORMA LOBISOMEM
```

## Morto-Vivo

```text
Nenhuma forma racial definida atualmente
```

## Regra canônica
Somente:

```text
HUMANOS
ELFOS
```

possuem Forma Demoníaca.

---

# 16. CLASSES

Classes são independentes dos elementos.

Princípio:

> Elemento define O QUE o personagem controla. Classe define COMO utiliza.

Classes sugeridas:

1. Guerreiro
2. Guardião
3. Mago
4. Feiticeiro
5. Ladino
6. Caçador
7. Monge
8. Clérigo
9. Druida
10. Invocador
11. Duelista
12. Berserker

As classes modificam modelos elementais já existentes.

Arquitetura:

```text
BaseSkill
+ ClassModifier
+ MulticlassModifier
+ Element
+ RaceModifier
+ CharacterModifier
```

---

# 17. MULTICLASSE

Regras:
- classe primária é dominante;
- secundária/terciária adiciona modificadores parciais;
- ordem importa;
- multiclasses ganham versatilidade;
- classes puras continuam competitivas;
- não duplicar todas as Skills manualmente.

Exemplo:

```text
Guerreiro + Mago
≠
Mago + Guerreiro
```

---

# 18. ELEMENTOS MÚLTIPLOS

Arquitetura:

```text
primaryElement
secondaryElement
tertiaryElement
```

Humanos:
- até 3 elementos.

Demais raças jogáveis:
- até 2 elementos comuns, salvo regras raciais específicas.

Possuir vários elementos não significa usar todos em toda Skill.

Uma Skill pode usar:

```text
A
B
C
A+B
A+C
B+C
A+B+C
```

---

# 19. FUSÕES ELEMENTAIS CANÔNICAS

## Tinta

```text
ÁGUA + TREVAS = TINTA
```

## Cinzas

```text
FOGO + TERRA + TREVAS = CINZAS
```

Outras fusões podem ser definidas posteriormente.

Não gerar automaticamente toda combinação possível.

Usar definições explícitas:

```text
ElementFusionDefinition
{
    elementA
    elementB
    elementC?
    result
    requirements
    mechanics
}
```

---

# 20. RODA ELEMENTAL — VANTAGENS E DESVANTAGENS

## 20.1 Objetivo
A roda elemental serve como referência visual de:
- vantagens;
- desvantagens;
- afinidades;
- relações;
- interações;
- leitura rápida de matchup.

## 20.2 Elementos atuais
A roda deve considerar os elementos definidos no Capítulo 4.

## 20.3 Físico / Neutro
Físico / Neutro representa:
- ataques sem elemento;
- armas não imbuídas;
- técnicas físicas;
- dano não elemental.

```text
id = physical
alias = neutral
```

## 20.4 Madeira
Madeira inclui o conceito anteriormente tratado como Planta.

Não colocar Planta como slot separado.

## 20.5 Cristal
Cristal é um único slot.

Mostrar, se desejado:

```text
CRISTAL
(VIDRO / ESPELHO)
```

---

# 21. COMPÊNDIO / CÓDICE

O jogo deve possuir um:

# CÓDICE / COMPÊNDIO

acessível diretamente pelo menu.

## 21.1 Menu

```text
MENU
├─ Personagens
├─ Inventário
├─ Equipamentos
├─ Skill Tree
├─ Bestiário
├─ CÓDICE
├─ Mapa
└─ Configurações
```

## 21.2 Objetivo
O Códice deve ser a fonte oficial de informação do jogador dentro do jogo.

Deve centralizar:
- elementos;
- raças;
- classes;
- transformações;
- fusões;
- vantagens;
- desvantagens;
- mecânicas;
- descobertas;
- relações entre sistemas.

---

# 22. ESTRUTURA DO CÓDICE

```text
CÓDICE
│
├─ ELEMENTOS
│  ├─ Roda Elemental
│  ├─ Água
│  ├─ Terra
│  ├─ Ar
│  ├─ Fogo
│  ├─ Metal
│  ├─ Madeira
│  ├─ Físico / Neutro
│  ├─ Sangue
│  ├─ Osso
│  ├─ Veneno
│  ├─ Ácido
│  ├─ Cristal
│  │  ├─ Cristal
│  │  ├─ Vidro
│  │  └─ Espelho
│  ├─ Areia
│  ├─ Gelo
│  ├─ Luz
│  ├─ Trevas
│  ├─ Eletricidade
│  ├─ Som
│  └─ Cinzas
│
├─ DERIVAÇÕES / FUSÕES
│  ├─ Tinta
│  │  └─ Água + Trevas
│  └─ Cinzas
│     └─ Fogo + Terra + Trevas
│
├─ RAÇAS
│  ├─ Humano
│  ├─ Elfo
│  ├─ Lycan
│  ├─ Morto-Vivo
│  └─ Vampiro
│
├─ CLASSES
│
├─ MULTICLASSES
│
├─ TRANSFORMAÇÕES
│  ├─ Forma Demoníaca
│  ├─ Forma Vampírica
│  └─ Forma Lobisomem
│
├─ MECÂNICAS
│  ├─ Armas Elementais
│  ├─ Fusões
│  ├─ Vantagens Elementais
│  ├─ Desvantagens Elementais
│  ├─ Status
│  └─ Recursos
│
└─ DESCOBERTAS
```

---

# 23. TELA DO CÓDICE

Visual sugerido:
- livro/grimório aberto;
- categorias na página esquerda;
- conteúdo detalhado na página direita;
- diagramas;
- símbolos;
- ilustrações;
- anotações manuscritas;
- elementos desbloqueados conforme progresso.

Exemplo:

```text
┌─────────────────────────────────┐
│             CÓDICE              │
├────────────┬────────────────────┤
│ ELEMENTOS  │                    │
│ RAÇAS      │     CONTEÚDO       │
│ CLASSES    │                    │
│ FORMAS     │                    │
│ MECÂNICAS  │                    │
│ BESTIÁRIO  │                    │
│ FAVORITOS  │                    │
└────────────┴────────────────────┘
```

---

# 24. ENTRADA DE ELEMENTO NO CÓDICE

Cada elemento deve possuir:

```text
Nome
Ícone
Tipo
Descrição
Mecânica Principal
Vantagens
Desvantagens
Afinidades
Status
Manifestações
Fusões
Derivações
Raças associadas
Personagens associados
Entradas relacionadas
Estado de descoberta
```

Exemplo:

```json
{
  "id": "crystal",
  "name": "Cristal",
  "alias": ["Vidro", "Espelho"],
  "mainMechanic": "Refração",
  "category": "element",
  "advantages": [],
  "disadvantages": [],
  "affinities": [],
  "forms": [
    "Cristal",
    "Vidro",
    "Espelho"
  ]
}
```

---

# 25. ENTRADA DE CINZAS NO CÓDICE

```json
{
  "id": "ashes",
  "name": "Cinzas",
  "mainMechanic": "Maldição",
  "origin": [
    "Fogo",
    "Terra",
    "Trevas"
  ],
  "progression": [
    "Maldição",
    "Decadência",
    "Ruína"
  ],
  "associatedCharacter": "Madao"
}
```

---

# 26. ENTRADA DE SANGUE NO CÓDICE

```json
{
  "id": "blood",
  "name": "Sangue",
  "category": "racial_element",
  "race": "Vampiro",
  "racialWheel": true,
  "mechanics": [
    "Drain",
    "Bleed",
    "Sacrifice",
    "Coagulate",
    "Blood Mark"
  ]
}
```

---

# 27. SISTEMA DE DESCOBERTA

O Códice pode possuir progressão de descoberta.

Estados:

```text
DESCONHECIDO
DESCOBERTO
ANALISADO
DOMINADO
```

## Descoberto
Mostra:
- nome;
- ícone.

## Analisado
Mostra:
- vantagens;
- fraquezas;
- principais interações.

## Dominado
Mostra:
- fusões;
- mecânicas avançadas;
- status;
- técnicas;
- relações completas.

---

# 28. FAVORITOS E BUSCA

O jogador pode:
- favoritar páginas;
- pesquisar termos;
- abrir relações.

Exemplo:

```text
Buscar: Cinzas
```

Resultados:
- Elemento: Cinzas
- Mecânica: Maldição
- Estado: Decadência
- Estado: Ruína
- Personagem: Madao

---

# 29. INTEGRAÇÃO ENTRE SISTEMAS

O Códice deve ser acessível a partir de outras interfaces.

## Skill Tree

```text
Ver no Códice
```

## Bestiário

```text
Fraqueza: Gelo
[Ver Gelo no Códice]
```

## Status

```text
Elemento: Cinzas
[Ver no Códice]
```

## Raça

```text
Vampiro
[Ver Sangue]
[Ver Forma Vampírica]
```

---

# 30. ESTRUTURA TÉCNICA DO CÓDICE

```text
CodexSystem
│
├─ ElementCodex
├─ RaceCodex
├─ ClassCodex
├─ TransformationCodex
├─ MechanicsCodex
└─ DiscoveryCodex
```

Entrada genérica:

```text
CodexEntry
{
    id
    category

    title
    subtitle

    icon
    image

    description

    sections[]
    relatedEntries[]

    discoveryState
    sortOrder
    hidden
}
```

---

# 31. RELAÇÕES ENTRE PÁGINAS

Cada entrada pode ter:

```text
relatedEntries[]
```

Exemplo — Cinzas:

```text
Fogo
Terra
Trevas
Maldição
Decadência
Ruína
Madao
```

Exemplo — Vampiro:

```text
Sangue
Forma Vampírica
Magia de Sangue
```

---

# 32. DADOS ELEMENTAIS

Estrutura recomendada:

```text
ElementDefinition
{
    id
    name

    category

    identity
    philosophy

    mainMechanic
    statusEffects[]

    visualTheme
    iconTheme

    weaponImbue

    affinities[]
    advantages[]
    disadvantages[]

    reactions[]
    fusionCompatibility[]

    forms[]
}
```

---

# 33. DADOS RACIAIS

```text
RaceDefinition
{
    id
    name
    playable

    maxElementSlots

    canUseElements
    canCastMagic
    canUseElementalWeapons

    racialElement
    startingElements[]

    racialPassives[]
    racialTraits[]
    racialForms[]

    metadata
}
```

---

# 34. RESUMO RACIAL

| Raça | Elementos | Magia | Forma | Regra principal |
|---|---:|---|---|---|
| Humano | até 3 | Sim | Forma Demoníaca | Versatilidade elemental |
| Elfo | até 2 | Sim | Forma Demoníaca | Mais Mana + Sobrecarga Arcana |
| Lycan | até 2 | Sim | Forma Lobisomem | Instintos e transformação |
| Morto-Vivo | até 2 | Não | Nenhuma definida | Armas Elementais |
| Vampiro | até 2 comuns + Sangue racial | Sim | Forma Vampírica | Sangue racial |

---

# 35. RESUMO ELEMENTAL

| Elemento | Observação |
|---|---|
| Água | Elemento-base |
| Terra | Elemento-base |
| Ar | Elemento-base; Vento é manifestação |
| Fogo | Elemento-base |
| Metal | Elemento completo |
| Madeira | Inclui Planta |
| Físico / Neutro | Não elemental |
| Sangue | Elemento racial dos Vampiros |
| Osso | Elemento completo |
| Veneno | Elemento completo |
| Ácido | Elemento completo |
| Cristal | Cristal = Vidro = Espelho |
| Areia | Elemento completo |
| Gelo | Elemento completo |
| Luz | Elemento completo |
| Trevas | Elemento completo |
| Eletricidade | Elemento completo |
| Som | Elemento completo |
| Cinzas | Derivado de Fogo + Terra + Trevas; mecânica: Maldição |
| Tinta | Derivado de Água + Trevas |

---

# 36. REGRAS CANÔNICAS IMPORTANTES

## Madeira

```text
MADEIRA = PLANTA
```

## Cristal

```text
CRISTAL = VIDRO = ESPELHO
```

## Tinta

```text
ÁGUA + TREVAS = TINTA
```

## Cinzas

```text
FOGO + TERRA + TREVAS = CINZAS
```

## Cristal — Mecânica

```text
REFRAÇÃO
```

## Cinzas — Mecânica

```text
MALDIÇÃO
```

## Sangue

```text
ELEMENTO RACIAL DOS VAMPIROS
```

## Elfo

```text
Mais Mana
Sem bônus geral de atributos
Pode gastar Mana extra para causar 2x dano
```

## Formas

```text
Humano → Forma Demoníaca
Elfo → Forma Demoníaca
Lycan → Forma Lobisomem
Vampiro → Forma Vampírica
Morto-Vivo → Sem Forma Demoníaca
```

---

# 37. PRINCÍPIOS FINAIS

> Elementos definem **o que** o personagem controla.

> Classes definem **como** esse poder é utilizado.

> Raças adicionam regras estruturais, passivas, limitações e formas próprias.

> A Roda Convencional representa domínio e técnica.

> A Roda Não Convencional representa distorção, exceção, transformação e fusão.

> O Códice é a fonte oficial de informação do jogador dentro do jogo.

> Cristal é definido pela **Refração**.

> Cinzas são definidas pela **Maldição**.

> Sangue pertence racialmente aos Vampiros.

> Madao é usuário de Cinzas, e Cinzas nunca devem ser reduzidas a Fogo.

---

# 38. CRITÉRIOS DE ACEITAÇÃO

A atualização só deve ser considerada implementada corretamente quando:

- existirem duas rodas de Skill Tree interligadas;
- houver nós de ponte e convergência;
- a Skill Tree for funcional e data-driven;
- os elementos atuais estiverem cadastrados;
- Madeira e Planta forem tratados como um único elemento;
- Cristal, Vidro e Espelho forem tratados como um único elemento;
- Refração for a mecânica principal de Cristal;
- Maldição for a mecânica principal de Cinzas;
- Tinta for derivada de Água + Trevas;
- Cinzas forem derivadas de Fogo + Terra + Trevas;
- Sangue for elemento racial dos Vampiros;
- Vampiros possuírem roda racial de Sangue;
- somente Humanos e Elfos possuírem Forma Demoníaca;
- Vampiros possuírem Forma Vampírica;
- Lycans possuírem Forma Lobisomem;
- Mortos-Vivos utilizarem Armas Elementais e não conjurarem magia;
- Elfos não possuírem bônus racial geral de atributos;
- Elfos puderem gastar mais Mana para causar 2x dano;
- o Códice puder ser acessado pelo menu;
- o Códice possuir entradas de Elementos, Raças, Classes, Formas e Mecânicas;
- a Roda Elemental puder ser consultada dentro do Códice;
- o Códice possuir sistema de descoberta, relações e integração com outras telas.
