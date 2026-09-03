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
  prop de `decor` sai da ferramenta com `text` (reage ao interagir,
  mostrado via `G.map.decor[].text` em `interact()`) ou foi marcado
  deliberadamente mudo — nunca por esquecimento. `prop_placa` é a
  exceção: o texto dela vai em `signs`, **na mesma coordenada exata** do
  sprite — sprite e texto em coordenadas diferentes é o bug real que já
  aconteceu no Pátio (placa visível em `(1,6)`, texto funcional em
  `(10,6)`, um nunca encontrava o outro). A ferramenta valida os dois
  casos e avisa antes de copiar a definição.
