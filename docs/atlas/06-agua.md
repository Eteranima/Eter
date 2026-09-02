# Atlas — Água

> **Fundo: não se aplica — o tile de água já é opaco, preenche o
> quadrado inteiro (sem transparência).**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: pasta `src/assets/world/tile_agua_*.webp`.

## Especificação

- **Tamanho: `32×32px` EXATOS** por quadro — mesma unidade de tile do
  piso (ver `05-piso.md`).
- **Animação: 3 ARQUIVOS SEPARADOS**, não uma folha. O motor alterna
  entre os 3 arquivos ao longo do tempo, não recorta uma grade — então
  entregue `agua_0.png`, `agua_1.png`, `agua_2.png`, cada um `32×32px`
  EXATOS, representando 3 momentos da animação da onda.
- Os 3 quadros devem fazer um ciclo que se repete sem salto visível
  (o quadro 2 deve encaixar bem de volta no quadro 0 quando o loop
  reinicia).

## Regra para variante nova (ex.: água de pântano, água gelada)

Mesma estrutura: sempre 3 arquivos de 32×32px exatos, nunca uma folha
única nem um número diferente de quadros sem combinar antes.
