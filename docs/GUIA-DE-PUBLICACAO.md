# Guia de publicação — HML estática

1. Siga o [guia de desenvolvimento](GUIA-DE-DESENVOLVIMENTO.md), escolhendo
   uma branch temática a partir de `main`.
2. Altere somente `src/`, documentação ou ferramentas da HML e mantenha o
   contrato em [AGENTS.md](../AGENTS.md).
3. Execute `python3 -m unittest discover -s tests`.
4. Execute `python3 tools/construir_modular.py --source src --public public`.
5. Execute `python3 tests/validar_hml_estatica.py` e
   `python3 tests/validar_publicacao.py public`.
6. Envie a mudança por pull request; somente envie diretamente para `main`
   quando já houver autorização para publicar a HML.

Todo push e pull request constrói e armazena o pacote como artifact. Em um
push para `main`, somente uma execução verde cria a release
`hml-<SHA completo>`, com `eter-hml-public.tar.gz` e
`eter-hml-manifest.json`. O publicador do NecroServer valida o manifesto e o
arquivo antes de atualizar `eterhml.denverso.com`. A execução falha em vez de
sobrescrever uma tag ou release existente.

Não publique conteúdo por credenciais externas, não recrie serviços e não
introduza backend, login, banco de dados ou multiplayer. A promoção para
produção é uma operação humana, auditável e fora deste repositório.
