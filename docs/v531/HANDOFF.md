# Handoff de desenvolvimento — Éter 5.31

## Estado entregue

O HTML recebido no GEP-32 foi preservado sem alteração no dirty state original.
A cópia analisada tem SHA-256
`522e6772ca9ba07d0259ba6a210962887b0263113573c3803035da25949bb39f`.
A fonte modular está em `src/` e executa o mesmo jogo 5.31.0 com 514 assets e
38 scripts. O autoteste passa em 1.351/1.351 e a jornada de slots, escolha,
campo, menus e combate passa no navegador.

## Preparar outra máquina

1. Clonar o repositório e atualizar `main`, que contém esta estrutura.
2. Ter Python 3, Docker e a imagem E2E `den/e2e-eter:wip` disponíveis.
3. Executar o gate completo com `scripts/desenvolvimento/validar-v531.sh`.
4. Para desenvolvimento interativo, servir a raiz com
   `python3 -m http.server 8000`.
5. Abrir `http://127.0.0.1:8000/src/`.
6. Para repetir somente a jornada no servidor já aberto, rodar:

   ```bash
   tests/e2e/executar.sh http://127.0.0.1:8000/src/ \
     autoteste.spec.ts v531-jornada.spec.ts
   ```

## Onde alterar

- personagem ou Grimório: `src/scripts/characters/`;
- habilidade, ultimate ou conjunta: `src/scripts/data/`;
- criatura/drop: `src/scripts/monsters/09-bestiary.js`;
- frequência de encontros: `src/scripts/monsters/10-formations.js`;
- missão ou diálogo de missão: `src/scripts/world/11-quests.js`;
- geometria, NPC ou transição de mapa: `src/scripts/world/12-maps.js`;
- fórmula/IA: `src/scripts/combat/`;
- telas e menus: `src/scripts/ui/`;
- roteiro: `src/scripts/scenes/`;
- imagem: substituir o arquivo e atualizar seu tamanho/SHA-256 no catálogo por
  meio de uma ferramenta, nunca editando o hash manualmente.

## Regras de mudança

- Não editar o HTML monolítico e depois tentar mesclar manualmente.
- Não renomear IDs gravados em save sem migração explícita.
- Não misturar balanceamento, asset e refatoração no mesmo commit.
- Manter scripts na ordem de `asset-catalog.json` até que o domínio migrado
  possua imports/exports reais.
- Toda mudança passa por build, sintaxe JavaScript, 1.351 asserções e jornada.
- Toda versão posterior exige candidato, comparação de saves, monitor e
  rollback para a versão pública anterior.

## Pendências deliberadas

- migrar gradualmente scripts clássicos para ES modules;
- criar testes E2E específicos para fases de chefes, Grimório e migração dos
  três slots, além do autoteste interno que já cobre as fórmulas;
- reconciliar contratos persistentes existentes na linha pública antes da
  promoção;
- ampliar a matriz E2E para a campanha completa, chefes e migrações futuras.
