# Atlas — Edifícios (casas, castelo, lojas, etc.)

> **Fundo: VERDE puro (`#00FF00`), sem exceção.**
> **Medidas exatas abaixo — não arredonde, não aproxime.**

Fonte: pasta `src/assets/world/prop_*.webp` (família de "props" de
cenário — objetos ancorados por cima da grade de tile, não tiles em si).

## Especificação

- **Sem grade fixa** — cada prédio é uma imagem única, tamanho pela
  proporção real do objeto (não é múltiplo obrigatório de 32px, mas
  fique perto de um múltiplo pra encaixar bem visualmente na grade).
- **Ancoragem: pela base/pé do prédio** — o motor posiciona a imagem
  usando a base como referência de "onde ela pisa no chão", então não
  deixe margem vazia embaixo do prédio na arte.
- Toda medida abaixo é EXATA para o prédio específico — se for redesenhar
  um já existente, mantenha a mesma medida final (largura×altura) pra
  não precisar realinhar posição no mapa.

## Medidas de edifícios habitáveis já cadastrados

| Prédio | Largura × Altura (px) |
|---|---|
| Casa pequena | 82×118 |
| Casa média | 101×132 |
| Casa grande | 164×148 |
| Estalagem | 108×136 |
| Taverna | 117×136 |
| Loja | 101×130 |
| Igreja | 105×156 |
| Templo | 134×152 |
| Torre | 80×168 |
| Moinho | 127×164 |
| Forja | 124×128 |
| Biblioteca | 136×140 |
| Portão | 164×150 |

## Regra para prédio NOVO

Desenhe na proporção real que ele deve ocupar no mapa, em múltiplos
aproximados de 32px (ex.: uma casa de 3×4 tiles fica perto de 96×128).
O valor final é livre, mas **precisa ser combinado e travado antes de
gerar** — depois de definido, esse número vira fixo pro prédio, do
mesmo jeito que os da tabela acima.
