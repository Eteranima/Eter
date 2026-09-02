# Atlas — HUD de Combate

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: pasta `src/assets/ui/`.

## Medidas por peça

| Uso | Prefixo de referência | Tamanho (px, EXATO) |
|---|---|---|
| Ícone de comando (Atacar/Guardar/Habilidade/Item) | `ui_cmd_*` | 28×28 |
| Ícone de condição/status (queimadura, congelado, choque, etc.) | `ail_*` | 16×16 |
| Cursor de seleção (mesmo do menu) | `ui_cursor` | 28×32 |
| Ícone de habilidade na lista de comandos | `hab_*` (mesmo arquivo de `09-skill-tree.md`) | 64×64 |

## Regra para peça NOVA

Ícone de comando: sempre 28×28 exatos. Ícone de condição/status:
sempre 16×16 exatos — é pequeno de propósito, fica lado a lado com
vários outros na barra de status, então precisa ser legível mesmo
minúsculo.
