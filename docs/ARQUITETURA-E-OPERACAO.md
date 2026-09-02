# Arquitetura e operação — HML estática

`src/` é a fonte editável do jogo. `tools/construir_modular.py` valida o
catálogo de assets e materializa `public/`; nenhuma etapa aceita componentes de
servidor ou links simbólicos.

`tools/empacotar_hml.py` gera um arquivo gzip/tar determinístico, com tempos,
identidade de proprietário e permissões normalizados. O arquivo inclui somente
os arquivos de `public/` na raiz. O manifesto adjacente contém:

- `source_repository`: `Eteranima/Eter`;
- `source_commit`: SHA completo do commit construído;
- `archive_name`: `eter-hml-public.tar.gz`;
- `archive_sha256`: checksum SHA-256 do arquivo;
- `generated_at`: instante UTC;
- `public_tree_sha256`: digest da árvore publicada.

O workflow roda em runner hospedado pelo GitHub em todos os pushes e pull
requests. Ele executa testes, build e validadores de conteúdo estático; em
`main`, baixa o mesmo artefato e cria a release `hml-<SHA completo>`. Antes de
criar, a automação verifica que nem a tag nem a release já existem.

A hospedagem e a promoção para produção não são implementadas nem recebem
credenciais neste repositório.
