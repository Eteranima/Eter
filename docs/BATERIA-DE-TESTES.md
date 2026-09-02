# Bateria de testes — a rodar a cada modificação

Este documento define o que validar sempre que `src/` mudar, antes de abrir
revisão e antes de qualquer promoção para produção. Ele complementa, e não
substitui, `scripts/desenvolvimento/validar-v531.sh` e o gate de promoção
descrito em `How_To_Publish.md`.

Três camadas, nesta ordem. Não pule uma camada porque a anterior passou —
elas verificam coisas diferentes.

## 1. Gate automático (obrigatório em toda mudança)

Rodar, nesta ordem, a partir da raiz do repositório:

```bash
git status -sb
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/construir_modular.py --source src --public Temp/v531-public
find src/scripts -name '*.js' -print0 | xargs -0 -n1 node --check
git diff --check
```

Com Docker disponível (obrigatório antes de qualquer promoção — sem Docker
isto não pode ser considerado validado):

```bash
scripts/desenvolvimento/validar-v531.sh
```

Esse script cobre tudo acima e, adicionalmente, sobe um servidor local e roda
a suíte Playwright completa dentro da imagem `den/e2e-eter:wip`:
`autoteste.spec.ts`, `modificador-combate.spec.ts`, `v531-jornada.spec.ts`.

Critérios de aprovação:

- 0 falhas nos testes Python;
- build modular sem rejeição de asset/hash/módulo ausente;
- 0 erro de sintaxe em qualquer script;
- autoteste interno do jogo em **1.351/1.351** (ou a nova contagem
  documentada, nunca uma redução silenciosa);
- as três specs E2E acima sem falha;
- `git diff --check` limpo.

Sem Docker, a única validação possível é a suíte Python + build + sintaxe —
isso NÃO substitui a suíte E2E e não deve ser reportado como "gate completo".

## 2. Bateria dirigida por mecânica (a cada mudança que toque a área)

Rodar manualmente (navegador real, servido por HTTP, nunca `file://`) ou via
spec E2E dedicada. Marcar cada item como visto, não como presumido.

### Personagens e Grimório (`src/scripts/characters/`)
- [ ] Os 13 personagens aparecem na tela de escolha, sem duplicata e sem
      slot vazio.
- [ ] Cada personagem abre o Grimório com núcleo, contas de progressão,
      passiva única, mecânica própria, convergências e Apocalipse.
- [ ] Madao: elemento de combate é Fogo; identidade da árvore é Cinzas
      (núcleo "Corvo das Cinzas", paleta e caminhos próprios) — não deve
      regredir para a árvore de Fogo genérica.
- [ ] Aprender e remover um nó (`removerNo`) devolve o custo correto e
      recusa remoção se um nó aprendido depende dele.
- [ ] `redefinirArvore` devolve todos os pontos investidos de uma vez.
- [ ] Pontos de Alma não têm teto (sem `x/50` fixo).
- [ ] Personagem novo: seleção, recrutamento, progressão de nível e save
      funcionam ponta a ponta (checklist mínimo do `How_To_Publish.md`).

### Habilidades, ultimates e conjuntas (`src/scripts/data/`)
- [ ] Habilidade nova: custo, alvo (único/área/self), dano ou cura, status
      aplicado, chance de crítico e uso pela IA inimiga, todos conferidos.
- [ ] As 55 conjuntas continuam associadas ao par de elementos correto.
- [ ] Nenhuma string desenhada em `pxText` usa glifos que a Press Start 2P
      não tem (`◄ ►`) — usar `<` `>` (ver `src/scripts/engine/15-render.js`).

### Combate (`src/scripts/combat/`)
- [ ] Iniciativa por velocidade, crítico, acerto e variação de dano batem
      com a fórmula documentada em `docs/05-MECANICA-DE-COMBATE.md`.
- [ ] Postura de elites/chefes quebra e abre janela multiplicativa de dano.
- [ ] Condições (queimadura, congelamento, choque, sangramento, cegueira,
      atordoamento, Exposto, Pavor, Enraizado) aplicam e expiram certo.
- [ ] Chefes com fases (Dono do Pântano: 4; Arquivista: 3) mudam
      comportamento na transição, não só HP/arte.
- [ ] Revanche/Eco: chefe derrotado pode ser reenfrentado, escala até 5
      degraus, drop garantido e recompensa compensada.
- [ ] Vitória e derrota em cada chefe novo, incluindo repetição.

### Monstros e bestiário (`src/scripts/monsters/`)
- [ ] Criatura nova: spawn, drop, resistência elemental e arte própria
      (nenhum sprite reaproveitado sem ser deliberado).
- [ ] Contador de abates isolado por espécie; fórmula
      `ChanceFinal = MIN(100%, ChanceBase × Contador)` correta; reset ocorre
      só quando o item de raridade máxima cai.
- [ ] Revelação progressiva do bestiário nos degraus de 3, 10 e 25 abates.
- [ ] Mudar frequência de encontro em `10-formations.js` não alterou a
      espécie em `09-bestiary.js` (e vice-versa).

### Missões e mundo (`src/scripts/world/`)
- [ ] Missão nova: início, progresso, flag, conclusão, recompensa e
      restauração correta após carregar um save.
- [ ] Mapa novo: spawn do jogador, colisão, todas as transições, retorno ao
      mapa anterior e persistência em save.
- [ ] Ciclo de 900 passos/dia e encontros noturnos em céu aberto continuam
      ativos; minimapa e cristais de viagem rápida funcionam.
- [ ] Recrutamento: `montarRecrutas`/`montarRecrutasDoQueFalta` não usam
      contagem fixa — sempre derivam de `PARTY_DEFS`/`RECRUIT_QUESTS`.

### Pets (`src/scripts/data/`)
- [ ] Cada pet tem as 3 formas por nível corretas.
- [ ] Bônus ativo quando o dono está no grupo.
- [ ] Exceções declaradas (hoje: Orfeu, Abel e Snoopy sem pet; Amanda como
      exceção coberta por teste) continuam intencionais, não esquecidas.

### Save e migração (`src/scripts/engine/`)
- [ ] Identificador de save (`eter-anima:jrpg:v3`) inalterado, ou migração
      explícita documentada se precisar mudar.
- [ ] Os 3 slots leem e escrevem de forma independente.
- [ ] IDs de nó do Grimório e de habilidade não foram renomeados sem
      migração.
- [ ] Save antigo (versão anterior) carrega sem perda de progresso após
      qualquer mudança de versão.

### UI, menus e telas (`src/scripts/ui/`, `src/scripts/scenes/`)
- [ ] Loja, equipamento, missões, bestiário, formação, pets, opções e save
      abrem e fecham sem travar o teclado/gamepad/mouse/toque.
- [ ] Autoequipar e cura fora de combate continuam acessíveis fora do
      Grimório e da loja.
- [ ] Nenhum resquício de painel de conta ou `EterMultiplayer` no DOM/window
      (o jogo é anônimo e sem multiplayer).

### Assets (`src/assets/`, `src/asset-catalog.json`)
- [ ] Todo asset novo/alterado tem entrada correspondente no catálogo com
      caminho, tamanho e SHA-256 corretos, gerados por ferramenta.
- [ ] Nenhum asset é obrigatório para o jogo rodar — remover um sprite não
      pode quebrar a tela, só o fallback procedural aparece.
- [ ] Nenhuma imagem em base64/Data URI foi adicionada a script ou HTML.

## 3. O que esta sessão mediu de fato (2026-08-24) — achados, não suposições

Ambiente sem Docker disponível; a suíte E2E foi rodada fora do `den/e2e-eter:wip`
oficial, com Playwright + Chromium locais apontando para
`http://127.0.0.1:.../src/`. Resultado, para registro e investigação — **não
tratar como substituto do gate oficial com Docker**:

- Testes Python: **11/11 OK**.
- Build modular: OK — `versao=5.31.0 assets=514 scripts=38`.
- Sintaxe JS: **38/38 scripts OK**.
- Autoteste interno embutido: **1.350/1.351** — a única falha é
  `"a fonte de pixel realmente não tem ◄ ► (justifica a regra)"`. A própria
  asserção (`src/scripts/tests/36-self-test.js:1172`) mede um comportamento
  de fallback de fonte do navegador/SO, que variou neste ambiente (Chromium
  + fontes do sistema aqui aparentemente desenham `◄ ►` na largura do "M",
  diferente do esperado). **Precisa ser confirmado no `den/e2e-eter:wip`
  oficial** antes de decidir se é diferença de ambiente ou regressão real.
- `modificador-combate.spec.ts`: **passou**.
- `v531-jornada.spec.ts`: falhou só por um `console: Failed to load resource
  404` de `/favicon.ico` — artefato de servir com `python3 -m http.server`
  sem favicon, não é bug do jogo.
- `jogo.spec.ts` e `novidades.spec.ts`: **corrigido em 2026-08-24.**
  Ambos chamavam `Title.opts.findIndex(...)`/`.map(...)`, uma API que não
  existe mais desde a reescrita da tela de título para seleção por slots
  (v5.26 — ver `src/scripts/ui/30-title.js`, que só expõe `Title.slots()` e
  `Title.cur`). Estavam quebrados há pelo menos desde a v5.26, sem pegar
  regressão nenhuma — o mesmo padrão que o comentário do próprio
  `tests/e2e/executar.sh` descreve ter acontecido antes com a contagem fixa
  de "cinco missões". Atualizados para `localStorage.clear()` +
  `Title.slots()`/`Title.cur`, escolhendo sempre um slot vazio real antes de
  iniciar jogo novo (`novoJogoCom()` em `novidades.spec.ts`, chamada uma vez
  por protagonista, também zera o navegador a cada chamada). Confirmado
  localmente: `novidades.spec.ts` passa 3/3; `jogo.spec.ts` só falha pelo
  404 de `/favicon.ico` do servidor local, o mesmo artefato de
  `v531-jornada.spec.ts` — **ainda precisa de confirmação no
  `den/e2e-eter:wip` oficial**, que provavelmente não gera esse 404.

## 4. Antes de qualquer promoção pública

Repetir a camada 1 inteira com Docker disponível, contra um commit
identificado, e seguir as 13 etapas do gate de promoção em
`How_To_Publish.md` (candidato paralelo, health, probe público, cutover,
monitor, rollback comprovado). Nenhuma promoção deve se apoiar só nesta
bateria local.
