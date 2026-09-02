# Como resolver problemas — HML estática do Éter

## Build ou teste falha

Execute `python3 -m unittest discover -s tests` e depois:

```bash
python3 tools/construir_modular.py --source src --public public
python3 tests/validar_publicacao.py public
```

Não edite `public/`: corrija `src/` ou o catálogo de assets e gere novamente.

## Release não foi criada

Confirme que o workflow rodou em um push para `main`. A tag deve ser
`hml-<SHA completo>` e uma tag ou release existente impede a sobrescrita. Não
publique manualmente usando credenciais externas.

## Pedido de componente servidor

Não implemente. Backend, autenticação, banco, multiplayer e segredos estão
fora do contrato desta HML; uma mudança desse tipo exige nova decisão de
arquitetura e autorização explícita.
