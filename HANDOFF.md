# Handoff — HML estática do Éter

Status: fonte pública para a HML estática e anônima. Branch canônica: `main`.

## Contrato vigente

- A fonte direta é `Eteranima/Eter:main`.
- O build materializa `public/` exclusivamente a partir de `src/`.
- O artefato contém somente o conteúdo de `public/`, sem links simbólicos.
- Todo push e pull request executa build, testes e a validação do contrato estático em runner hospedado pelo GitHub.
- Em `main`, o workflow cria uma release imutável `hml-<SHA completo>` com
  `eter-hml-public.tar.gz` e `eter-hml-manifest.json`. Uma tag ou release já
  existente é tratada como erro, nunca substituída.
- Não há backend, autenticação, banco, multiplayer, credenciais ou acesso ao
  runtime de produção neste repositório.

## Recuperação

Falhas de build ou de publicação não autorizam recriar serviços nem reutilizar
credenciais. Preserve a última release saudável, corrija a fonte e produza um
novo SHA. A promoção para produção segue o fluxo humano e auditável externo.
