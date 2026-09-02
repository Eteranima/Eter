# Estado atual — HML estática do Éter

Atualizado em 2026-09-01.

- fonte canônica: `Eteranima/Eter:main`;
- experiência: estática, anônima e sem estado de servidor;
- persistência do jogo: armazenamento local do navegador;
- fonte editável: `src/`;
- conteúdo gerado: `public/`, criado durante build e não versionado;
- artefato: `eter-hml-public.tar.gz`, sem links simbólicos e com o conteúdo de
  `public/` na raiz;
- recibo: `eter-hml-manifest.json`, com origem, SHA completo, hashes e horário
  UTC;
- release: tag imutável `hml-<SHA completo>` criada apenas após push em `main`.

Esta fonte não contém nem opera backend, autenticação, banco de dados,
multiplayer, credenciais ou runtime de produção. O domínio, hospedagem e a
promoção para produção pertencem a fluxos externos auditáveis.

Os documentos datados e diretórios históricos abaixo de `docs/` são contexto
preservado; não descrevem a operação vigente desta HML.
