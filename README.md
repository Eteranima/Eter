# Éter Anima — HML pública estática

Este repositório é a fonte direta da homologação pública do Éter em
[`eterhml.denverso.com`](https://eterhml.denverso.com). Um novo desenvolvedor
pode começar por aqui: [AGENTS.md](AGENTS.md) define as regras de trabalho e o
[guia de desenvolvimento](docs/GUIA-DE-DESENVOLVIMENTO.md) mostra, de forma
prática, onde ficam conteúdo, mecânicas, sprites, testes e publicação.

O jogo é uma aplicação estática, anônima e sem estado de servidor. Não há
backend, autenticação, banco de dados ou multiplayer; saves ficam somente no
navegador.

## Começo rápido

```bash
git clone https://github.com/Eteranima/Eter.git
cd Eter
git switch main
git pull --ff-only origin main

python3 -m unittest discover -s tests
python3 tools/construir_modular.py --source src --public public
python3 tests/validar_hml_estatica.py
python3 tests/validar_publicacao.py public
```

Para jogar localmente depois do build, sirva `public/` por HTTP (não abra o
arquivo diretamente):

```bash
python3 -m http.server 8080 --directory public
```

Abra `http://127.0.0.1:8080/` para jogar ou acrescente `?test` para executar o
autoteste embutido no navegador.

## Publicação para homologação

Todo push e pull request passam pelos testes, pela validação estática, pela
checagem de sintaxe JavaScript e pelo build. Quando o commit chega a `main`, a
automação cria uma release imutável `hml-<SHA completo>` com
`eter-hml-public.tar.gz` e `eter-hml-manifest.json`. O publicador da HML
consome somente esse par validado e atualiza `eterhml.denverso.com`
automaticamente.

Em outras palavras: uma branch/PR é segura para experimentar; o push para
`main` é a publicação contínua da HML. Não há credencial de hospedagem neste
repositório e releases existentes nunca são sobrescritas.

A promoção da release homologada para `eter.denverso.com` é intencional e
externa ao repositório. Ela não é disparada por commit, nem pode ser feita por
scripts ou segredos versionados aqui.

## Organização

- `src/` — jogo editável: HTML, CSS, scripts e assets.
- `src/asset-catalog.json` — integridade de todos os binários.
- `docs/` — design, mapa técnico e guias vigentes.
- `tests/` — testes Python e validadores de contrato/publicação.
- `tools/` — build, empacotamento e validações determinísticas.
- `.github/workflows/hml.yml` — validação e release imutável da HML.

`public/` e `dist/` são descartáveis e ignorados pelo Git. Para uma visão
completa — especialmente personagens, mapas, chefes, habilidades, saves e
sprites — use o [guia de desenvolvimento](docs/GUIA-DE-DESENVOLVIMENTO.md).

## Direitos

O código e a automação são source-available sob a PolyForm Noncommercial 1.0.0.
Esse aviso não amplia direitos sobre marcas, arte, narrativa ou outros conteúdos,
que permanecem reservados aos seus titulares. Consulte [LICENSE](LICENSE),
[NOTICE](NOTICE), [NONCOMMERCIAL.md](NONCOMMERCIAL.md) e
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
