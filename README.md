# Éter Anima — HML pública estática

Este repositório é a fonte da homologação pública do Éter em `eterhml.denverso.com`.
Ela é uma aplicação estática, anônima e sem estado de servidor: não há backend,
autenticação, banco de dados ou multiplayer. O progresso do jogo permanece no
navegador.

## Desenvolvimento

`src/` contém a fonte do jogo. O build valida o catálogo de assets e materializa
`public/`, que é a única árvore empacotada:

```bash
python3 -m unittest discover -s tests
python3 tools/construir_modular.py --source src --public public
python3 tests/validar_publicacao.py public
```

Para reproduzir um pacote de release localmente, informe o SHA completo da
fonte e gere os dois arquivos de saída:

```bash
python3 tools/empacotar_hml.py \
  --public public \
  --source-commit <sha-completo> \
  --output-dir dist
```

O arquivo `eter-hml-public.tar.gz` contém apenas o conteúdo de `public/` na
raiz e sem links simbólicos. `eter-hml-manifest.json` registra a origem, SHA,
checksum do arquivo e horário UTC.

Todo push e pull request é validado em runner hospedado pelo GitHub. Um push
em `main` publica uma release imutável `hml-<SHA completo>`; releases existentes
nunca são sobrescritas. A promoção para produção continua sendo uma operação
humana, deliberada e externa a este repositório.

## Direitos

O código e a automação são source-available sob a PolyForm Noncommercial 1.0.0.
Esse aviso não amplia direitos sobre marcas, arte, narrativa ou outros conteúdos,
que permanecem reservados aos seus titulares. Consulte [LICENSE](LICENSE),
[NOTICE](NOTICE), [NONCOMMERCIAL.md](NONCOMMERCIAL.md) e
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
