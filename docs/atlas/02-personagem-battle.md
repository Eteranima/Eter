# Atlas — Personagem em Battle

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: `BATTLE_ART` em `src/scripts/characters/07-characters.js`.

## Especificação

- **Imagem única, SEM grade.** Não é uma folha de quadros — é um corpo
  inteiro parado. O motor não anima quadro a quadro aqui; ele
  reposiciona/inclina a imagem inteira durante o golpe.
- **Altura: `152px` EXATOS** — fixa pra todo personagem, sem exceção
  (única exceção conhecida: Gabriel Lycan, ver tabela).
- **Largura:** varia por personagem, valor exato na tabela abaixo.
- **Teto de largura:** não passe de **104px** de largura. Esse é o
  maior valor já usado no jogo (Gabriel Lycan, braços abertos) — a
  formação de batalha tem um limite real de espaço antes de invadir o
  painel de comandos.

## Medidas por personagem já cadastrado

| Personagem | Largura × Altura (px) |
|---|---|
| Amanda Felt | 106×152 |
| Orfeu Bauss | 99×152 |
| Seiji | 96×152 |
| Abel Nomikos | 97×152 |
| Max | 94×152 |
| Ophelia | 95×152 |
| Ava Rosa Groot | 97×152 |
| Marin | 101×152 |
| Gabriel | 93×152 |
| Snoopy | 92×152 |
| Madao | 77×152 |
| Madao Papelão | 78×152 |
| Madao Vitória | 83×152 |
| Eden | 63×152 |
| Gabriel Lycan | 104×134 (única exceção de altura no jogo — pose agachada) |

## Regra para personagem NOVO

Altura **sempre 152px exatos**, a menos que a pose exija agachar (aí
segue o mesmo caso do Gabriel Lycan, com altura menor e justificativa
de pose). Largura livre entre ~63px e o teto de 104px, pela proporção
real do corpo desenhado.
