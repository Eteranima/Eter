# Guia de publicação — HML estática

1. Altere somente `src/`, documentação ou ferramentas da HML.
2. Execute `python3 -m unittest discover -s tests`.
3. Execute `python3 tools/construir_modular.py --source src --public public`.
4. Execute `python3 tests/validar_hml_estatica.py` e
   `python3 tests/validar_publicacao.py public`.
5. Envie a mudança por pull request ou diretamente para `main` quando houver
   autorização explícita.

Todo push e pull request constrói e armazena o pacote como artifact. Em um
push para `main`, somente uma execução verde cria a release
`hml-<SHA completo>`, com `eter-hml-public.tar.gz` e
`eter-hml-manifest.json`. A execução falha em vez de sobrescrever uma tag ou
release existente.

Não publique conteúdo por credenciais externas, não recrie serviços e não
introduza backend, login, banco de dados ou multiplayer. A promoção para
produção é uma operação humana, auditável e fora deste repositório.
