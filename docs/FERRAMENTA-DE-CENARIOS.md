# Ferramenta de cenários

Abra `tools/editor-cenarios.html` na árvore gerada por HTTP. A ferramenta
produz a declaração de um mapa no formato de `MAPS`, incluindo `rows`, spawn,
decoração e metadados de baús/passagens. Cole a saída em
`src/scripts/world/12-maps.js` e complete a jornada de ida, volta, colisão e
save antes de publicar.

## Prioridade de assets

1. Fachada da Academia Stone Reach — estabelece o marco visual do pátio.
2. Portão Stone Reach — comunica a transição entre Academia e exterior.
3. Altar do Selo — peça reutilizável nas câmaras de masmorra e chefe.

Os três props vivem em `src/assets/world/`, têm alfa e a base ancorada à
célula de chão. O violeta é reservado ao éter e selos; novos cenários devem
priorizar pedra quente, verde, teal, azul, âmbar e acentos regionais.

## Contrato

- Use as letras já declaradas em `TILEDEF`; não crie uma letra para props.
- Props entram em `decor` como `{x, y, s, solido}` e são ordenados pelo pé.
- WebP novo requer chave em `00-assets.js` e tamanho/hash no catálogo.
- A ordem de `warps` e `chests` acompanha a leitura dos marcadores da grade.
- **100% interativo (requisito do jogo, não só desta ferramenta):** todo
  prop de `decor` — `prop_placa` incluído — sai da ferramenta com `text`
  (reage ao interagir, mostrado via `G.map.decor[].text` em `interact()`)
  ou foi marcado deliberadamente mudo — nunca por esquecimento.
- **`decor` só entra em tile de base NÃO sólido; `signs` só entra em tile
  de base SÓLIDO** (parede, água, árvore, estante, mesa, pilar, braseiro,
  entulho, baú) — são regras opostas, então as duas nunca compartilham
  coordenada. O autoteste (`36-self-test.js`) trava as duas: decor sobre
  tile sólido vira "dentro de parede"; sign fora de tile sólido some sem
  ninguém notar (o motor lê `signs` pela coordenada exata, sem checar
  solidez em runtime). Uma placa MUDA embutida na parede é só `signs`,
  sem `decor` nenhum; um letreiro visível e examinável em chão aberto é
  só `decor.text`, sem `signs`. A ferramenta valida as duas regras e
  bloqueia a definição se alguma quebrar.
