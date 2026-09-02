# AGENTS.md — Éter Anima / HML pública

Leia este arquivo antes de alterar o repositório. O guia de entrada e a
referência operacional completa estão em
[docs/GUIA-DE-DESENVOLVIMENTO.md](docs/GUIA-DE-DESENVOLVIMENTO.md).

## Missão e fronteiras invioláveis

- Este é **diretamente** o repositório da HML pública em
  `eterhml.denverso.com`. A fonte canônica é `main` de `Eteranima/Eter`.
- O produto é um jogo estático, anônimo e sem estado de servidor. Ele pode
  usar `localStorage` no navegador para saves, mas não contém backend, API,
  autenticação, OIDC, login, banco de dados, cookies de sessão, multiplayer,
  WebSocket, serviços externos ou credenciais.
- Não versionar segredos, tokens, chaves, dumps, dados pessoais nem dados de
  pessoas jogadoras. Não introduzir telemetria externa sem uma decisão de
  arquitetura explícita.
- `src/` é editável; `public/` e `dist/` são produtos descartáveis do build e
  nunca entram no Git.
- A promoção para `eter.denverso.com` é deliberada, auditável e externa a
  este repositório. O código aqui não recebe credenciais nem executa produção.
- Preserve conteúdo, histórico e direitos dos titulares. O projeto é
  source-available sob PolyForm Noncommercial 1.0.0; nunca o descreva como
  open source.

## Fluxo obrigatório

1. Atualize sua cópia com `git pull --ff-only origin main` e crie uma branch
   temática a partir de `main`.
2. Leia os documentos de conteúdo pertinentes em `docs/` antes de mudar
   mecânicas, personagens, mapa, boss, item ou diálogo.
3. Faça uma mudança coesa; mantenha a ordem dos scripts clássicos de
   `src/index.html` e a compatibilidade de save quando houver conteúdo já
   publicado.
4. Rode os gates locais descritos no guia de desenvolvimento. Corrija a fonte
   e o catálogo; nunca edite o diretório gerado `public/`.
5. Envie uma pull request para revisão. Um push que chega a `main` dispara a
   publicação automática da HML; push em branch ou PR apenas valida a mudança.
6. Faça commits pequenos e temáticos, em português. Não use force-push nem
   reescreva tags/releases imutáveis.

## Regras do runtime JavaScript

- Os arquivos em `src/scripts/` são scripts clássicos no mesmo escopo global;
  eles não são módulos ES. A ordem em `src/index.html` é um contrato de
  carregamento. Não a reorganize sem entender todas as dependências.
- Dados, regras, renderização e input têm diretórios próprios. Altere primeiro
  o domínio correto, depois conecte as referências necessárias e acrescente
  teste/checklist dirigido para a mecânica.
- IDs de personagens, habilidades, itens, mapas, flags e nós de progressão
  fazem parte de saves existentes. Não os renomeie/remova sem uma migração
  compatível, documentada e testada.
- `SAVE_KEY` e o formato persistido também são contrato. Uma alteração de save
  exige cenário de carregar save anterior, além de jogo novo.

## Regras para assets e sprites

- Guarde binários em `src/assets/<categoria>/`, com nome estável e descritivo;
  use as categorias existentes (`characters`, `monsters`, `world`, `ui`,
  `pets`, `misc` ou `fontes`). Nunca reintroduza base64/Data URI em HTML ou JS.
- Para cada arquivo novo ou alterado, atualize `src/asset-catalog.json` com
  `key`, `path`, `mime`, `bytes` e SHA-256 exatos. O build falha fechado se o
  catálogo divergir.
- Registre a chave em `src/scripts/00-assets.js` e conecte-a ao consumidor
  correto (personagem, bestiário, mapa, HUD, diálogo ou combate). Verifique o
  resultado no navegador; um arquivo presente no catálogo não aparece sozinho.
- Preserve dimensões, alinhamento pelos pés, transparência e ordem de frames
  esperados pelo desenho. Documente no comentário próximo ao registro qualquer
  recorte, reordenação de frames ou fallback deliberado.

## Como trabalhar com agentes

Um agente recebe somente o contexto necessário à sua tarefa e nunca credenciais
ou detalhes de operação da produção. A pessoa responsável integra as mudanças.

| Papel | Escopo que recebe | Modelo e esforço sugeridos | Entrega esperada |
| --- | --- | --- | --- |
| Conteúdo/design | documentos de lore e os arquivos de dados do tema | modelo Codex principal, médio | proposta coerente e alterações de dados/documentação |
| Implementação | módulo JavaScript e testes diretamente afetados | modelo Codex principal, alto | diff pequeno, testes locais e riscos de save |
| Arte/sprites | arquivo fonte, destino e o consumidor visual | modelo Codex com visão, alto | asset, catálogo, registro e verificação visual |
| Revisão/QA | diff final, contrato e testes | agente independente com modelo Codex principal, alto | regressões, fronteiras e evidência reproduzível |

Use o modelo de programação mais capaz disponível no Codex. Reserve raciocínio
alto para mudanças transversais (save, combate, mapa, pipeline ou assets em
massa); esforço médio basta para documentação e correções isoladas. Nenhum
agente deve publicar produção, alterar o runtime do NecroServer ou ampliar o
contrato estático por conta própria.

## Referências obrigatórias

- [Guia de desenvolvimento](docs/GUIA-DE-DESENVOLVIMENTO.md) — ponto de
  partida, mapa do código, sprites, testes e fluxo de publicação.
- [Estado atual](docs/ESTADO-ATUAL.md) e
  [arquitetura/operacão](docs/ARQUITETURA-E-OPERACAO.md) — contrato vigente.
- [Guia de publicação](docs/GUIA-DE-PUBLICACAO.md) — artefatos e releases.
- [Como resolver problemas](HOW-TO-SOLVE.md) e [handoff](HANDOFF.md) —
  recuperação segura.
