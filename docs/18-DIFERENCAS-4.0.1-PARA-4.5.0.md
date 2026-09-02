# O que mudou de 4.0.1 para 4.5.0

Levantado em 18/08/2026 comparando os dois HTML linha a linha. Existe porque o
commit veio como "versão 4.5" sem descrição, e sem inventário não há como
afirmar que a versão publicada está correta.

**1685 linhas alteradas.**

## Onde a mudança caiu

Atribuindo cada linha às seções do próprio código:

| Seção | + | − |
|---|---:|---:|
| 15. AUTOTESTE | **545** | 0 |
| 13. TELA DE TÍTULO | 153 | 3 |
| 9. MENSAGENS | 122 | 63 |
| 7. ESTADO DE JOGO | 122 | 21 |
| 5. RENDER HELPERS | 112 | 16 |
| 8. MAPA / CAMPO | 76 | 43 |
| 10. COMBATE | 68 | 18 |
| 14. LOOP PRINCIPAL | 62 | 10 |
| 4. INPUT | 55 | 0 |
| 2. DADOS DO JOGO | 47 | 23 |
| 11. COMBATE | 26 | 14 |
| 16. BALANCEAMENTO | 22 | 5 |
| 6. SAVE / LOAD | 3 | 1 |

O maior bloco é **autoteste**: 545 linhas acrescentadas e nenhuma removida. As
asserções do autor saltaram de **122 para 213**.

## Inventário nomeado

**Funções novas (11):** `benchChars`, `defaultSquad`, `entrarNoGrupo`,
`escalaGrupo`, `gema`, `gridWindow`, `montarRecrutas`,
`montarRecrutasDoQueFalta`, `recrutar`, `sairDoGrupo`, `sanitizeSquad`

**Funções removidas (3):** `defaultSquads`, `sanitizeSquads`, `switchSquad`

**Constantes e objetos novos (14):** `CURANDEIROS`, `Escolha`,
`ESCOLHA_PAINEL`, `ESCOLHA_TEXTO_W`, `ESCOLHA_TEXTO_X`, `LADO_CONFORTO`,
`LADO_MIN`, `PARTY_SIZE`, `PX_SEM_GLIFO`, `RECRUIT_QUESTS`, `RESERVA_BAIXO`,
`Tela`, `UI`, `recrutasDaQuest` *(este é função, não mapa — normaliza valor
único, lista ou ausência em lista)*

**Removida (1):** `SQUAD_SIZE`

O par `SQUAD_SIZE`→`PARTY_SIZE` e `defaultSquads`/`switchSquad`→`defaultSquad`/
`entrarNoGrupo`/`sairDoGrupo`/`benchChars` é a troca de **dois grupos de três**
por **grupo único de cinco com reserva**.

## Cobertura: 15 das 22 novidades já eram testadas pelo autor

Cruzando o inventário com a seção de autoteste:

| Já cobertas pelo autor | Ocorrências |
|---|---|
| `escalaGrupo` | 17 |
| `PARTY_SIZE` | 15 |
| `RECRUIT_QUESTS` | 10 |
| `gridWindow` | 8 |
| `sanitizeSquad` | 6 |
| `Escolha`, `gema`, `sairDoGrupo` | 4 |
| `LADO_MIN`, `recrutar` | 3 |
| `PX_SEM_GLIFO`, `RESERVA_BAIXO`, `entrarNoGrupo` | 2 |
| `CURANDEIROS`, `defaultSquad` | 1 |

**Sem cobertura do autoteste (7):** `montarRecrutas`,
`montarRecrutasDoQueFalta`, `recrutasDaQuest`, `benchChars`, `Tela`, `UI`,
`LADO_CONFORTO`

Essas sete estão cobertas agora por `tests/e2e/novidades.spec.ts`, que roda
contra o site publicado.

## O que esse teste prova

Para **cada um dos seis** protagonistas possíveis:

- o elenco começa com ele sozinho
- ele **nunca** aparece como recompensa de si mesmo
- nenhum recruta se repete e o elenco inteiro é alcançável
- quem começa sem cura recebe um curandeiro na **primeira** missão

E ainda: a reserva é vazia com elenco de um; `recrutasDaQuest` normaliza
ausência, valor único e lista; `montarRecrutasDoQueFalta` remonta as cinco
missões para save antigo; `Tela`, `UI` e `LADO_CONFORTO` existem e respondem.

Uma correção de leitura que vale registrar: o mapa vivo é **`G.recruits`**.
`recrutasDaQuest` é o normalizador que o lê, não o mapa.

## O que continua sem verificação

O autoteste do autor declara o próprio limite: cobre *"lógica pura e integridade
de dados — nada de desenho"*. Fora dele e fora do que testamos, seguem sem
prova: entrega de missão de ponta a ponta, grupo com mais de um e reserva em
uso, loja, diálogo de NPC, transição de mapa, combate além do primeiro comando,
salvar e carregar, controles de toque e áudio.
