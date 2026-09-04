# Atlas de Cenários — Éter Anima

> Documento operacional para Codex + Claude. O usuário será autor visual dos
> mapas no editor; agentes implementam e validam somente o contrato exportado.
> Atualizado a partir de `src/asset-catalog.json` e `src/scripts/world/12-maps.js`.

## 1. Objetivo

Substituir a autoria de mapa por edição manual de strings por um fluxo visual:

```text
Atlas de assets → composição no editor → validação visual/estrutural
→ exportação de handoff → integração em MAPS → QA no navegador
```

O editor é ferramenta interna estática (`src/tools/editor-cenarios.*`), não
entra no runtime, não publica conteúdo e não modifica saves. A exportação é
uma proposta explícita: a integração no jogo continua revisada.

## 2. Fonte de verdade e restrições

- Fonte: `src/`; nunca editar `public/` ou `dist/`.
- Catálogo, `SPRITE_DATA` e consumidor continuam obrigatórios para arte nova.
- O editor só pode oferecer letras presentes em `TILEDEF`; prop não cria letra.
- Prop alto ancora pelo pé da célula. Fachada sobre porta/parede não recebe
  `solido:true`: a grade base já define a colisão.
- Overlay de água/chão/parede usa `sombra:false` quando a sombra elíptica do
  renderizador não fizer sentido.
- Todo `decor` tem `text` ou `mudo:true` deliberado.
- `decor` fica em base passável; `signs` em base sólida. Nunca compartilham
  coordenada.

## 3. Inventário confirmado

O catálogo vigente contém **639 entradas**, das quais **155** apontam para
`assets/world/`. Entre elas há **88 props**, **27 tiles/animações de tile**,
**28 sprites de NPC** e **12 fundos de batalha**. Há aliases históricos
`*-2.webp`; a ferramenta deve exibir a chave efetivamente resolvida por
`SPRITE_DATA`, sem duplicar uma peça visual para o autor.

### 3.1 Tiles e materiais disponíveis

| Classe | Disponível | Observação |
|---|---|---|
| Exterior | grama, caminho, terra, rachado, água animada, cais | há só um conjunto base por material; bordas/transições ainda são escassas |
| Interior | piso, tapete, porta, escada, baú aberto/fechado | sem variantes regionais de piso/parede |
| Estrutural | parede, árvore, estante, mesa, pilar, braseiro, entulho | a maior parte vem da gramática de tile alto |
| Efeito | água (3 frames), brasa (3 frames), save | não substituir por prop estático |

### 3.2 Props de uso geral disponíveis

| Grupo | Peças existentes |
|---|---|
| Vegetação | árvore, árvore escura, arbusto, capim, capim seco, sebe, flores, flores rosa/campo, junco, tronco |
| Assentamento | casas pequena/média/grande, estalagem, taverna, loja, igreja, templo, torre, moinho, biblioteca, forja |
| Estrutura | muro de pedra/ruína, paliçada, cerca, portão, ruínas, gruta, cachoeira, obelisco, pilar |
| Utilitário | placa, poço, lampião, tocha, tocha azul, fogueira, braseiro, barril, caixa, baús, estandarte, save |
| Masmorra | altar do selo, comporta de éter, cristal de vidro, estante de arquivo, entulho, túmulo |
| Stone Reach | Academia, portão, árvores/estantes/mesas/bancos/plantas regionais, margem de lago |
| Porto Lúmina | barco, barco de pesca, taverna, loja, mesa de mercado, cais |

## 4. Atlas de lacunas — prioridade de produção

As lacunas abaixo são deliberadas: significam que a região tem mapa/jogabilidade,
mas não biblioteca modular suficiente para o autor compor um cenário convincente.
Não gerar tudo de uma vez; cada família entra em lotes de 3–5 peças e passa por
revisão visual no navegador.

| Região | Estado atual | Famílias que faltam no atlas | Prioridade |
|---|---|---|---|
| `patio` | academia, árvores e lago já possuem arte regional | bordas de canteiro, postes acadêmicos, placas de campus, variação de grama/caminho aprovada em 32px | P1 |
| `porto_lumina` | barcos, fachadas e cais existem | redes, cordas, bóias, cestos, âncora, guincho, mesa de limpeza, velas, pilhas de caixas/barris, postes de píer | P0 |
| `hall` | estantes e mesas regionais | tapetes, retratos, quadros, cortinas, globos, bancos, vasos, luminárias acadêmicas | P1 |
| `undercroft` | altar e pilar base | runas de parede, correntes, pedestal, rachaduras de éter, grades, escombros de pedra | P0 |
| `deepway` | sem prop regional explícito | pontes, trilhos/escoras, cristais baixos, placas de escavação, entulho em camadas | P0 |
| `ashwood` | acampamento único | árvores queimadas, cinzas, troncos carbonizados, braseiros, rochas vulcânicas, cercas quebradas | P0 |
| `nests` | sem prop regional explícito | ovos, casulos, resina, raízes, ninhos, cristais orgânicos, ossadas | P0 |
| `cistern` | comporta única | canos, válvulas, correntes, musgo úmido, barris, passarelas, quedas d’água, grades | P0 |
| `spire` | cristal de vidro único | pilares de vidro, pontes suspensas, bandeiras rasgadas, plataformas, pedestais, vento/névoa visual | P1 |
| `arquivo` | estantes e entulho | mesas de leitura, pilhas de livro, pergaminhos, escadas móveis, candelabros, vitrines | P1 |
| `esgoto` | sem prop regional explícito | tubulações, grelhas, lodo, válvulas, passarelas, lanternas úmidas, lixo flutuante | P0 |
| `lago` | sem prop regional explícito | margem orgânica, juncos, pedras, píer pequeno, barco abandonado, névoa, vegetação aquática | P0 |
| `podridao` | sem prop regional explícito | árvores doentes, fungos, poças, raízes, ossos, cercas apodrecidas, névoa tóxica | P0 |
| `deserto` | sem prop regional explícito | dunas/rochas, cristais quebrados, colunas soterradas, tendas, ossadas, marcos de rota | P0 |

### Ordem recomendada

1. Porto Lúmina — maior retorno para um mapa funcional já existente.
2. Subterrâneo, Galeria, Cisterna e Esgoto — resolver leitura espacial e
   transições de material.
3. Mata Cindária, Ninhal, Lago, Podridão e Deserto — bibliotecas de bioma.
4. Hall, Arquivo, Spire e refinamento do Pátio — decoração e landmarks.

## 5. Requisitos da ferramenta de cenários

### Fase 1 — Atlas e composição

- Carregar todo `assets/world/` efetivamente catalogado.
- Exibir miniatura, chave, caminho, dimensão real, alpha, categoria e região.
- Busca por chave/nome; filtros por tile, prop, NPC, landmark, interior,
  exterior, água e região.
- Mostrar footprint visual e linha de pé/âncora no preview antes da colocação.
- Camadas independentes: terreno, tile alto, decor, marcadores e metadados.
- Mostrar colisão da grade, colisão de decor e aviso de prop sobre tile inválido.
- Exibir sombra prevista; oferecer `sombra:false` para overlays.
- Canvas com zoom, grade opcional, pan, desfazer/refazer e borracha.

### Fase 2 — Autoridade e exportação

- Presets por região, usando somente paleta e BGM já válidos.
- Importar uma definição `MAPS` existente para edição não destrutiva.
- Validar spawn, warps, baús, signs, decor, colisão e ordem de leitura.
- Exportar dois artefatos:
  1. JSON de handoff (`mapa`, `rows`, `decor`, `signs`, `warps`, `chests`,
     `npcs` a declarar).
  2. snippet JS no formato de `MAPS` para revisão/inserção.
- Exportar uma imagem de preview com grade/colisão opcional para QA do Claude.
- Gerar relatório de dependências: chaves usadas, assets ausentes, itens novos
  necessários e decisões de interação pendentes.

### Fase 3 — Revisão conjunta

- Claude abre a ferramenta e testa a exportação em navegador.
- Claude confere: âncora, footprint, sombra, colisão, legibilidade, HUD e
  sobreposição com landmark/NPC.
- Codex corrige o editor ou integra o handoff somente após a revisão.
- Toda lacuna encontrada entra nesta lista, com região, família e evidência.

## 6. Contrato de handoff para integração

```json
{
  "version": 1,
  "map": {
    "id": "novo_cenario",
    "name": "Nome do cenário",
    "region": "porto_lumina",
    "fill": ".",
    "outdoor": true,
    "bgm": "porto_lumina",
    "rows": ["################", "#..............#", "################"],
    "spawn": {"x": 2, "y": 1, "dir": "down"},
    "decor": [
      {"x": 4, "y": 1, "s": "prop_lampiao", "solido": false,
       "sombra": true, "text": "Um lampião do cais."}
    ],
    "signs": [],
    "warps": [],
    "chests": []
  },
  "dependencies": {
    "existing": ["prop_lampiao"],
    "missing": ["prop_rede_porto_lumina_01"],
    "decisions": ["texto do letreiro da taverna"]
  }
}
```

`missing` nunca vira placeholder no jogo. É uma solicitação de arte para lote
posterior; o autor pode continuar a composição usando marcador de intenção no
editor, mas a integração bloqueia até existir asset catalogado.

## 7. Critérios de aceite

- Asset exibido no atlas corresponde ao arquivo/catalogo/`SPRITE_DATA` reais.
- A prévia usa o mesmo pé/escala/sombra do runtime, sem “parecer certo” apenas
  no editor.
- Exportação inválida é bloqueada antes de ser copiada.
- Handoff traz todas as chaves existentes e faltantes, sem ID inventado.
- Claude valida uma jornada real no navegador e registra o resultado.
- O editor não altera `MAPS`, assets ou saves automaticamente.

## 8. Próximo lote de implementação

1. Claude revisa este atlas e ajusta prioridades/lacunas com evidência do
   navegador e do projeto completo.
2. Codex torna o catálogo de assets disponível no editor e troca a paleta fixa
   por atlas filtrável.
3. Claude valida o preview de âncora/footprint contra `desenharProp`.
4. Codex adiciona o formato JSON de handoff e o relatório de dependências.
