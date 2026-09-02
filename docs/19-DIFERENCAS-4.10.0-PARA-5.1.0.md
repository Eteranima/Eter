# O que mudou de 4.10.0 para 5.1.0

Levantado em 20/08/2026 comparando `historico/v4.10.0/eter-anima-3f2dd6ce73db.html`
com `fonte-atual/eter-anima.html`, linha a linha. Existe pelo mesmo motivo do
[inventário da 4.5.0](18-DIFERENCAS-4.0.1-PARA-4.5.0.md): a versão chegou como
upload sem descrição, e sem inventário não há como afirmar o que o artefato
publicado passou a conter.

**1448 linhas alteradas — 1377 acrescentadas, 71 removidas.**

O `<style>` e o corpo do HTML ficaram idênticos (`game.css` continua com os
mesmos 6.483 bytes). Toda a mudança caiu dentro do `<script>`, que é o que faz
esta versão atravessar o publicador sem exigir nada novo dele.

## São duas entregas numa versão só

A 5.0.0 foi enviada e nunca publicada — subiu na raiz do repositório em vez de
`fonte-atual/`, que é o único caminho que a automação enxerga. A 5.1.0 veio por
cima dela. O inventário abaixo é a soma das duas, e a fotografia da 5.0.0 está
preservada em `historico/v5.0.0/`.

| Versão | Entrega |
|---|---|
| 5.0.0 | árvore de habilidades por ponto de alma; o pet passa a aparecer no campo de batalha |
| 5.1.0 | Ava Rosa Groot e Scythe entram no elenco, com os elementos Terra e Veneno |

## Onde a mudança caiu

Atribuindo cada linha às seções do próprio código:

| Seção | + | − |
|---|---:|---:|
| 15. AUTOTESTE | **436** | 16 |
| 4b. ÁRVORE DE HABILIDADES *(seção nova)* | **272** | 0 |
| 2. DADOS DO JOGO | 194 | 11 |
| 9c. MENU DE CAMPO | 183 | 10 |
| 11. COMBATE — VIEW | 76 | 3 |
| 7. ESTADO DE JOGO | 60 | 14 |
| 10. COMBATE — MODELO | 59 | 7 |
| 9b. LISTA COM CURSOR | 28 | 0 |
| 13b. ESCOLHA DO PROTAGONISTA | 24 | 8 |
| 5. RENDER HELPERS | 21 | 0 |
| (cabeçalho: `SPRITE_DATA`) | 16 | 0 |
| 6. SAVE / LOAD | 6 | 1 |
| 1. CONFIG + UTIL | 1 | 1 |
| 4. INPUT | 1 | 0 |

Como na 4.5.0, o maior bloco isolado é **autoteste**.

## O que as tabelas de dados ganharam

Contado no jogo carregado, não no diff:

| Tabela | 4.10.0 | 5.1.0 |
|---|---:|---:|
| `PARTY_DEFS` (elenco jogável) | 6 | **8** |
| `ELEM_RING` (elementos no anel) | 8 | **10** |
| `AILMENTS` (condições) | 8 | **10** |
| `SKILLS` | 101 | **118** |
| `COMBOS` (Conjuntas) | 15 | **28** |
| `ULTIMATES` | 6 | **8** |
| `PETS` | 7 | **9** |
| `BATTLE_ART` | 6 | **8** |
| `SPRITE_DATA` | 36 | **41** |
| `RECRUIT_QUESTS` | 5 | **7** |
| Imagens extraídas para `public/assets/` | 42 | **49** |

`QUESTS` continua com 24: `q_lenhador` e `q_alquimista` já existiam e passaram a
carregar recruta e pet como prêmio, em vez de item repetido.

## Inventário nomeado

**Identificadores de topo novos (32):**

- árvore de habilidades (22): `TREES`, `RAMOS`, `RAMO_FOLHA`, `RAIO_RAMO`,
  `PONTOS_POR_NIVEL`, `PASSIVA_NOME`, `PASSIVA_ROTULO`, `construirArvore`,
  `ramoDaSkill`, `valorPassiva`, `posicaoNo`, `arvoreDe`, `nosGratis`,
  `pontosTotais`, `pontosGastos`, `pontosLivres`, `podeAprender`, `aprenderNo`,
  `redefinirArvore`, `treeBonus`, `syncArvore`, `migrarSkillsParaArvore`;
- cursor da árvore (2): `treeOrdem`, `noVizinho`;
- pet em combate (8): `PET_SPOT`, `PET_SPOT_LARGE`, `PET_ALT_BATALHA`,
  `PET_AVANCO`, `petArte`, `petSpotBatalha`, `petCaixaBatalha`, `drawPetBatalha`.

**Removido (1):** `syncLearned` — a função que entregava habilidade por nível.
Quem ocupa o lugar dela é `syncArvore`, que deriva `c.skills` dos nós comprados.

## Regras que mudaram de valor

- **Anel elemental.** Veneno entrou entre Vento e Sangue; Terra, entre Tinta e
  Eletricidade. Cada inserção custa duas relações antigas: o Fogo deixou de
  superar Sangue e o Vento deixou de superar Trevas; a Tinta deixou de superar
  Gelo e a Luz deixou de superar Eletricidade.
- **`dread` mudou de nome, não de mecânica.** Era "Pavor" e continua sendo
  −25% de DEF por 3 turnos, agora sob o nome **Assombro**. "Pavor" passou a ser
  a condição nova da Scythe (`terror`), que é outra coisa.
- **`eACC` ganhou exceção ao piso de 15%.** `terror` tem `accMod:0`, o único
  zero da tabela; sem o desvio, o alvo apavorado ainda acertaria 15%.
- **`calcDamage` reconhece `execute`.** O golpe cresce conforme o alvo cai, com
  teto em `1 + execute`; não é morte instantânea.
- **Subir de nível não destrava mais habilidade.** Dá `PONTOS_POR_NIVEL` (2)
  pontos de alma, e a tela de vitória passou a anunciar pontos em vez de nomes.
- **`recalcStats` soma três fontes:** nível, equipamento e passivas da árvore.

## Save

O save passou a gravar `tree` e `bonusPontos` por personagem, e continua
gravando `skills` — que agora é derivado — para que um save desta versão não
deixe o elenco mudo numa build antiga. Save sem `tree` é migrado por
`migrarSkillsParaArvore`, que puxa a corrente inteira até a raiz e nunca deixa
saldo negativo. Id de nó que não existe mais é descartado sem estourar.

## Cobertura

| | 4.10.0 | 5.1.0 |
|---|---:|---:|
| Chamadas `ok(...)` no autoteste | 432 | **495** |
| Asserções executadas (`?test`) | 640 | **699** |

Os dois artefatos foram materializados e abertos com `?test`: **640/640** e
**699/699**, sem erro de página nem requisição externa.

## O que o repositório precisou acompanhar

O publicador, o validador e o runtime aceitaram a versão sem alteração. O que
não sobreviveu foram contagens fixas fora do jogo:

- `tests/e2e/novidades.spec.ts` afirmava "cinco missões" e percorria seis
  protagonistas. As duas contagens passaram a sair de `RECRUIT_QUESTS` e de
  `PARTY_DEFS`, e o arquivo ganhou a jornada da árvore pelo menu — que é canvas
  e o autoteste do jogo não alcança;
- `tests/e2e/executar.sh` levava só `jogo.spec.ts` para dentro do contêiner, o
  que deixava autoteste e novidades sem execução. Passou a levar a suíte
  inteira, ainda dando para escolher um arquivo por argumento;
- a 5.0.0 solta na raiz foi arquivada em `historico/v5.0.0/`, porque a fonte
  canônica é `fonte-atual/eter-anima.html` e mais nenhuma.
