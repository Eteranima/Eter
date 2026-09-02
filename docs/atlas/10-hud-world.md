# Atlas — HUD de World (campo)

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: pasta `src/assets/ui/`.

## Medidas por peça

| Uso | Prefixo de referência | Tamanho (px, EXATO) |
|---|---|---|
| Legenda de mapa (loja/missão/save/teleporte/evento) | `ui_leg_*` | 20×20 |
| Marcador de missão no mapa | `ui_marcador_missao` | 24×24 |
| Emblema de local (topo do mapa) | `ui_embl_NN` (variações numeradas) | 22×22 |
| Emblema de local — versão grande | `ui_emblema_local` | 48×48 |
| Ícone de sol / lua (ciclo dia-noite) | `ui_icone_sol` / `ui_icone_lua` | 36×36 |
| Ícone de ouro | `ui_icone_ouro` | 32×32 |
| Seta de aliado fora de tela | `ui_seta_aliado` | 28×24 |
| Mira / alvo | `ui_mira` | 36×36 |
| Tecla de atalho (prompt de interação) | `ui_tecla` | 48×36 |
| Badge de elemento (pequeno) | `ui_elem_<elemento>` | 22×22 |

## Regra para peça NOVA

Sempre o mesmo tamanho exato da linha equivalente na tabela — um
emblema novo, por exemplo, tem que sair em 22×22 (ou 48×48 se for a
versão grande), nunca um valor "parecido".
