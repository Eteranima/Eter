# Atlas — Retratos e Bustos (diálogo/cutscene) — complementar

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Não estava na lista original, mas é a peça que fecha "personagem" de
ponta a ponta — sem ela, diálogo e cutscene ficam sem rosto. Fonte:
`Msg.draw()` em `src/scripts/ui/22-dialogue.js` e pasta
`src/assets/characters/` / `src/assets/misc/`.

## Medidas por peça

| Uso | Tamanho (px, EXATO) | Observação |
|---|---|---|
| Retrato de diálogo (caixa de texto) | 132×132 | Exibido nesse tamanho na tela; a arte fonte pode ser maior, desde que quadrada |
| Retrato pequeno de personagem (menu/HUD) | 43–44 × 64 | Varia ±1px entre personagens já cadastrados |
| Retrato grande de personagem (cutscene) | 83×64 | Versão "-2" do retrato pequeno |
| Busto de convidado | 104×112 | Usado em telas de recrutamento/apresentação |

## Regra para retrato NOVO

Retrato de diálogo: gere quadrado, resolução alta (o motor exibe em
132×132 mas aceita fonte maior, desde que proporção 1:1). Retrato de
menu: sempre 64px de altura, largura entre 43 e 44px. Busto: sempre
104×112 exatos.
