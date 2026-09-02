# Guia de desenvolvimento — Éter Anima HML

Este é o ponto de partida de quem vai continuar o Éter, seja uma pessoa
desenvolvedora, seja um agente de programação. Ele descreve o repositório que
publica a HML pública em `eterhml.denverso.com`; não descreve nem autoriza
acesso ao ambiente de produção.

Leia [AGENTS.md](../AGENTS.md) primeiro. Em caso de contradição, ele e os
documentos de contrato (`ESTADO-ATUAL`, `ARQUITETURA-E-OPERACAO` e
`GUIA-DE-PUBLICACAO`) prevalecem sobre documentos históricos e handoffs
datados.

## 1. Começar uma melhoria

Pré-requisitos locais: Git, Python 3 e Node.js. Não há dependência de
`npm install`, servidor de aplicação ou banco de dados.

```bash
git clone https://github.com/Eteranima/Eter.git
cd Eter
git switch main
git pull --ff-only origin main
git switch -c feature/<tema-curto>

python3 -m unittest discover -s tests
python3 tools/construir_modular.py --source src --public public
python3 tests/validar_hml_estatica.py
python3 tests/validar_publicacao.py public
find src/scripts -type f -name '*.js' -print0 | xargs -0 -r -n1 node --check
```

Para jogar e testar visualmente, sirva a árvore gerada por HTTP:

```bash
python3 -m http.server 8080 --directory public
```

Abra `http://127.0.0.1:8080/` para uma sessão normal e
`http://127.0.0.1:8080/?test` para o autoteste que o jogo expõe. Não use
`file://`: carregamento de assets e comportamento do navegador não são iguais.

`public/`, `dist/` e diretórios de cache são gerados e ignorados. Apague-os ou
reconstrua-os quando quiser; nunca os edite nem os inclua em um commit.

## 2. Como a publicação contínua funciona

```text
branch/PR ──> validações do GitHub ──> revisão/merge em main
                                            │
                                            ▼
                           release imutável hml-<SHA completo>
                           ├─ eter-hml-public.tar.gz
                           └─ eter-hml-manifest.json
                                            │
                                            ▼
                       publicador valida origem + hashes + arquivo
                                            │
                                            ▼
                              eterhml.denverso.com
```

O workflow `.github/workflows/hml.yml` roda em todo push e pull request. A
release só nasce em um push verde para `main`. Portanto:

- push em branch ou PR valida e produz artifact de inspeção, mas **não** muda o
  site público;
- merge/push em `main` é a ação que publica continuamente a nova HML;
- cada release usa a tag `hml-<SHA completo>` e nunca é sobrescrita;
- a HML consome somente o pacote e manifesto daquele SHA; não há login de
  servidor, token ou segredo neste repositório;
- voltar atrás significa reverter/corrigir a fonte em um novo commit para
  `main`, jamais editar release, tag ou conteúdo no host.

A promoção da versão homologada para `eter.denverso.com` é um fluxo separado,
manual e auditável fora deste repositório. Uma melhoria no Éter não deve criar
scripts de deploy, runtime, credenciais ou automação de produção aqui.

## 3. Mapa do repositório

| Caminho | Papel | Ao mudar, observe |
| --- | --- | --- |
| `src/index.html` | tela, HUD móvel e ordem de carregamento | cada `<script>` é clássico e compartilha escopo global; preservar ordem |
| `src/styles/game.css` | aparência, responsividade e foco acessível | não usar fonte/recurso de terceiro; testar mouse, teclado e toque |
| `src/scripts/00-assets.js` | chaves de imagem e carregador | registro deve apontar a asset catalogada; comentários explicam transformações |
| `src/scripts/core/` | constantes, versão e utilitários | `SAVE_KEY` e contratos globais exigem cautela |
| `src/scripts/data/` | elementos, itens, habilidades, pets e dados de progressão | IDs e referências são usados por save, UI e combate |
| `src/scripts/characters/` | personagens, atributos, grimório e progressão | personagem novo precisa dados, arte, seleção, save e testes dirigidos |
| `src/scripts/monsters/` | bestiário e formações | espécie, arte, drop, IA e ocorrência devem permanecer coerentes |
| `src/scripts/world/` | missões, flags, mapas, transições e NPCs | mapa/quest novo precisa ida, volta, colisão e restauração após carregar |
| `src/scripts/combat/` | modelo, controle e desenho de combate | validar dano, alvo, status, iniciativa, vitória e derrota |
| `src/scripts/engine/` | áudio, input, save, mundo, render, loop e efeitos | mudanças são transversais; testar o jogo todo |
| `src/scripts/ui/` e `scenes/` | menus, diálogos, título e roteiro | manter teclado, mouse e toque sem travamento |
| `src/assets/` | imagens, fontes e sprites binários | seguir o procedimento de assets abaixo |
| `src/asset-catalog.json` | tamanho e SHA-256 de cada asset | obrigatório a cada alteração de binário |
| `tests/` | testes unitários e validadores do contrato | criar/ajustar testes quando a regra muda |
| `tools/` | build, pacote, classificação de diff e verificações | manter determinísticos, sem dependência de servidor |
| `docs/` | design, mecânicas e decisões de conteúdo | atualizar a seção relevante junto com a feature |

Os documentos de conteúdo são o mapa funcional do jogo: `01` visão e tom,
`02` lore, `03` progressão, `04` elementos/condições, `05` combate, `06`
personagens, `07` habilidades, `08` itens/economia, `09` bestiário, `10`
chefes, `11` mapas, `12` NPCs/diálogos, `13` missões e `14` capítulo. Consulte
o documento correspondente antes de inventar ou alterar regras.

## 4. Scripts: ordem, responsabilidades e extensões

O jogo usa scripts JavaScript clássicos, não módulos ES. Tudo vive no mesmo
escopo global e `src/index.html` define a ordem real de execução. Essa ordem é
parte da arquitetura:

1. `00-assets.js` e `core/01-config.js` carregam recursos e utilitários.
2. `data/`, `characters/`, `monsters/` e `world/` definem conteúdo e regras.
3. `engine/` prepara áudio, input, desenho, save e mundo.
4. `ui/`, `combat/` e `scenes/` consomem os dados para exibir e conduzir a
   experiência.
5. `engine/35-loop.js` faz o boot; `tests/36-self-test.js` e
   `tools/37-balance.js` entram por último.

Para uma mecânica nova, primeiro localize o domínio de dados, depois todos os
consumidores. Exemplos:

- **habilidade**: definição em `data/04-skills.js`, associação a personagem ou
  inimigo, resolução no combate, texto/ícone e teste de alvo/custo/efeito;
- **personagem**: dados de personagem, progressão, seleção, arte de campo e
  retrato/combate, recrutamento ou party, save e documentação de personagem;
- **monstro/boss**: bestiário, formação/entrada, skills e IA/fases, arte,
  recompensa, batalha real e documento `09` ou `10`;
- **mapa/missão/NPC**: mapa e transições, colisão, gatilhos, flags, diálogo,
  retorno e teste de carregar um save no ponto relevante;
- **interface**: controle por teclado, mouse e toque, foco visível e texto
  legível em canvas.

Não mova arquivos ou altere a ordem de `<script>` como uma limpeza estética.
Antes, faça uma mudança mecânica pequena e verifique sintaxe, build, autoteste
e a jornada que usa aquela dependência.

## 5. Sprites, arte e outros assets

Assets não são anexos soltos: cada um tem integridade e uma chave de uso.

1. Escolha a categoria existente abaixo de `src/assets/` e um nome estável,
   em minúsculas: `characters`, `monsters`, `world`, `ui`, `pets`, `misc` ou
   `fontes`.
2. Coloque o binário no caminho definitivo. Não cole base64/Data URI em JS ou
   HTML e não hospede a arte em domínio externo.
3. Calcule e registre em `src/asset-catalog.json` a `key`, `path`, MIME,
   tamanho em bytes e SHA-256 reais. O build faz essa conferência.
4. Registre ou atualize a mesma chave em `src/scripts/00-assets.js`. A chave
   é a ponte entre arquivo e runtime; prefira acrescentar um `Object.assign`
   comentado a renomear uma chave já existente.
5. Faça a ligação no consumidor (por exemplo, definição de personagem,
   bestiário, mapa, HUD ou `DIALOGUE_SPRITES`) e teste em jogo.
6. Rode o build e os validadores. Só então abra a PR.

Cuidados visuais importantes:

- sprite de campo normalmente depende de grade e de ordem de direções/frames;
  alinhe pela base dos pés e documente qualquer recorte ou reordenação;
- ícone e HUD dependem de transparência e escala; teste sobre os fundos claros
  e escuros usados pelo jogo;
- fundos e sprites de batalha têm consumidor próprio; registrar o binário não
  substitui o mapeamento semântico;
- preserve fallbacks procedurais quando existirem. Não torne um asset opcional
  uma causa de tela quebrada;
- trocar chave/ID já publicado pode quebrar saves. Acrescente chave nova e
  migre referências de maneira explícita.

## 6. Save, compatibilidade e versões

Saves pertencem ao navegador e são compatibilidade de produto. Antes de mexer
em personagem, inventário, flag, mapa, árvore, habilidade ou estado de combate:

- trate IDs persistidos como estáveis;
- prefira adicionar campos com valores padrão a apagar/renomear campos;
- confirme jogo novo e carregamento de um save anterior;
- só altere `SAVE_KEY` quando houver migração planejada, documentada e testada;
- atualize `APP_VERSION`, a versão em `asset-catalog.json` e testes que
  conferem versão somente como uma decisão consciente de release, não para
  mascarar divergência.

## 7. Testes e definição de pronto

Os gates mínimos para qualquer alteração são:

```bash
python3 -m unittest discover -s tests
python3 tools/construir_modular.py --source src --public public
python3 tests/validar_hml_estatica.py
python3 tests/validar_publicacao.py public
find src/scripts -type f -name '*.js' -print0 | xargs -0 -r -n1 node --check
git diff --check
```

Depois faça a validação dirigida ao domínio alterado. A lista histórica de
cenários úteis está em [BATERIA-DE-TESTES.md](BATERIA-DE-TESTES.md), mas seus
comandos antigos não substituem os gates acima. A feature está pronta somente
quando:

- a regra é coerente com a documentação de design;
- alterações de asset têm catálogo e ligação de runtime corretos;
- não há erro de sintaxe, build nem validador;
- a jornada visual/mecânica afetada foi jogada no navegador;
- impacto em save foi testado ou declarado inexistente;
- o diff é pequeno, legível e não inclui arquivos gerados.

## 8. Trabalho assistido por agentes

Quebre trabalho grande por domínio, não por número arbitrário de arquivos. Um
arranjo eficaz é:

| Subtarefa | Contexto mínimo a entregar ao agente | Saída que deve voltar |
| --- | --- | --- |
| Design de conteúdo | documentos do tema e arquivos de dados relacionados | proposta, IDs, impacto em lore/economia/balanceamento |
| Implementação de mecânica | módulo alvo, consumidores diretos, testes atuais e contrato de save | patch, testes, riscos e pendências visuais |
| Preparação de arte | arquivo de origem, tamanho/grade desejados, chave/consumidor | asset catalogado, registro e passos de verificação |
| QA independente | diff consolidado, comandos de teste e jornadas afetadas | falhas reproduzíveis, regressões e evidência |

Use o modelo Codex de programação mais capaz disponível. Para implementação
transversal, assets com análise visual, saves, combate e mapa, configure
raciocínio alto; para documentação ou mudança local, médio. O revisor não deve
assumir que a implementação está correta e não deve receber credenciais ou
acesso operacional ao NecroServer.

Integre uma subtarefa por vez, rode os gates após a integração e mantenha uma
fonte de verdade para IDs. Se dois agentes alterarem a mesma área, pare e
reconcilie semanticamente — não escolha pelo último diff.

## 9. Falhas e recuperação

- **Teste/build falhou:** corrija `src/`, o catálogo ou a ferramenta;
  reconstrua `public/`. Não corrija o produto gerado.
- **PR ficou vermelha:** leia o job e reproduza o comando local. Uma mudança
  grande já executa todos os gates; divida o commit se a causa não for clara.
- **Release não apareceu:** confirme o workflow de um push em `main` e o SHA
  da tag. Não sobrescreva tag/release nem use credenciais externas.
- **HML mostrou regressão:** reverta ou corrija por novo commit em `main`; a
  release anterior continua como evidência imutável.
- **Pedido de servidor, login, banco, multiplayer ou segredo:** pare. Isso
  está fora do contrato e exige uma decisão de arquitetura antes de qualquer
  código.

Veja também [HOW-TO-SOLVE.md](../HOW-TO-SOLVE.md) e [HANDOFF.md](../HANDOFF.md).
