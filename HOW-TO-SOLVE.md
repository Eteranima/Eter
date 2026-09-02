# Como resolver problemas — HML estática do Éter

Antes de investigar, leia o [guia de desenvolvimento](docs/GUIA-DE-DESENVOLVIMENTO.md).
Ele é a referência atual para estrutura de código, assets, testes e publicação.

## Build ou teste falha

Execute `python3 -m unittest discover -s tests` e depois:

```bash
python3 tools/construir_modular.py --source src --public public
python3 tests/validar_publicacao.py public
```

Inclua também `python3 tests/validar_hml_estatica.py`. Não edite `public/`:
corrija `src/` ou o catálogo de assets e gere novamente.

## Release não foi criada

Confirme que o workflow rodou em um push para `main`. A tag deve ser
`hml-<SHA completo>` e uma tag ou release existente impede a sobrescrita. Não
publique manualmente usando credenciais externas, não altere a release e não
crie uma tag substituta: corrija a fonte em um novo commit.

## Pedido de componente servidor

Não implemente. Backend, autenticação, banco, multiplayer e segredos estão
fora do contrato desta HML; uma mudança desse tipo exige nova decisão de
arquitetura e autorização explícita.
