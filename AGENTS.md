# Regras da HML pública do Éter

- Este repositório publica exclusivamente a HML pública, estática e anônima do Éter.
- `main` é a fonte canônica da HML. Cada push aprovado produz um artefato imutável.
- Não adicionar backend, API, autenticação, OIDC, login, banco de dados, cookies de sessão, multiplayer, WebSocket ou credenciais.
- O jogo usa somente arquivos estáticos; o progresso, quando existir, permanece no navegador da pessoa jogadora.
- Não versionar segredos, tokens, chaves, dumps, dados pessoais ou dados de jogadores.
- `public/` é derivado de `src/` durante o build e não é versionado.
- A promoção para produção é deliberada e externa a este repositório.
- Preserve conteúdo, histórico e direitos dos titulares. O projeto é source-available sob PolyForm Noncommercial 1.0.0; não o descreva como open source.
- Commits são pequenos, temáticos e em português; force-push é proibido.
