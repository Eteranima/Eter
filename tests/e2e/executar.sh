#!/usr/bin/env bash
# Roda os testes do jogo contra uma URL, dirigindo por teclado real.
#
# O jogo é Canvas: o menu não é DOM e não há seletor para item de menu. Por
# isso o teste comanda por tecla e observa por estado do jogo e screenshot.
# Sem isso, ele exercitaria funções internas em vez do que o jogador toca.
#
#   ./executar.sh [URL] [arquivo.spec.ts ...]
#
# Sem arquivos, roda a suíte inteira. Levava só `jogo.spec.ts` para dentro do
# contêiner, o que deixava autoteste e novidades escritos e nunca executados —
# e foi assim que a contagem fixa de "cinco missões" sobreviveu até a 5.1.0.
set -Eeuo pipefail

URL="${1:-https://eter.denverso.com/}"
shift || true
SPECS=("$@")
if [ "${#SPECS[@]}" -eq 0 ]; then
  SPECS=(jogo.spec.ts autoteste.spec.ts novidades.spec.ts modificador-combate.spec.ts)
fi

IMAGEM="${ETER_E2E_IMAGE:-den/e2e-eter:wip}"
SAIDA="${ETER_E2E_OUT:-$PWD/.e2e-resultado}"
REDE="${ETER_E2E_NETWORK:-host}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
read -r -a DOCKER <<< "${DOCKER_CMD:-docker}"

mkdir -p "$SAIDA/shots"
echo "alvo=$URL saida=$SAIDA specs=${SPECS[*]}"

# Os arquivos vão para junto do node_modules da imagem: o Playwright resolve
# @playwright/test a partir do diretório do teste, não do diretório de trabalho.
"${DOCKER[@]}" run --rm --init --network "$REDE" --user root \
  -v "$RAIZ":/t:ro -v "$SAIDA/shots":/shots \
  -e SHOT_DIR=/shots -e ETER_URL="$URL" \
  --entrypoint sh "$IMAGEM" -c \
  'cp /t/*.spec.ts /t/playwright.config.ts /src/ && cd /src && npx playwright test --config=playwright.config.ts "$@"' \
  eter "${SPECS[@]}"
