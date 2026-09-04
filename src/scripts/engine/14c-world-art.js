/* ===================================================================
   FAMÍLIAS VISUAIS COMPARTILHADAS

   Dados e resolução pura usados pelo campo e pelo Editor de Cenários.
   Não carrega imagens, não toca canvas e não lê estado global durante a
   resolução quando recebe contexto explícito. Assim a prévia de autoria
   não pode escolher uma variante diferente da que o runtime escolherá.
   =================================================================== */
const WORLD_ART_FAMILIES = {
  regioes: {
    patio: {
      tree: [
        {key:'prop_arvore', weight:2},
        {key:'prop_tree_stone_reach_01', weight:1},
        {key:'prop_tree_stone_reach_02', weight:1},
        {key:'prop_tree_stone_reach_03', weight:1},
      ],
    },
    hall: {
      shelf: [
        {key:'prop_estante_interior', weight:4},
        {key:'prop_shelf_stone_reach_01', weight:1},
        {key:'prop_shelf_stone_reach_02', weight:1},
        {key:'prop_shelf_stone_reach_03', weight:1},
      ],
      table: [
        {key:'prop_mesa_interior', weight:4},
        {key:'prop_table_stone_reach_01', weight:1},
        {key:'prop_table_stone_reach_02', weight:1},
        {key:'prop_table_stone_reach_03', weight:1},
      ],
    },
    undercroft: { pillar: [{key:'prop_pilar', weight:1}] },
  },
  mapas: {},
};

const TALL_ART = {
  tree:'prop_arvore', shelf:'prop_estante_interior', table:'prop_mesa_interior',
  pillar:'prop_pilar', rubble:'prop_entulho', save:'prop_save',
};

function hashDeterministico(texto){
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h * 33) ^ texto.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
function contextoDeFamilia(){ return {mapaId:G.mapId, regiaoId:G.map?.def?.region}; }
function familiaDe(idLogico, contexto = contextoDeFamilia()){
  const doMapa = contexto.mapaId && WORLD_ART_FAMILIES.mapas[contexto.mapaId]?.[idLogico];
  if (doMapa?.length) return doMapa;
  const daRegiao = contexto.regiaoId && WORLD_ART_FAMILIES.regioes[contexto.regiaoId]?.[idLogico];
  return daRegiao?.length ? daRegiao : null;
}
function varianteDeFamilia(familia, idLogico, x, y, contexto = contextoDeFamilia()){
  const total = familia.reduce((n, v) => n + (v.weight || 1), 0);
  const h = hashDeterministico(`${contexto.mapaId || ''}:${idLogico}:${x}:${y}`) % total;
  let acumulado = 0;
  for (const v of familia){ acumulado += v.weight || 1; if (h < acumulado) return v.key; }
  return familia[familia.length - 1].key;
}
function chaveDeFamilia(idLogico, x, y, contexto = contextoDeFamilia()){
  const familia = familiaDe(idLogico, contexto);
  return familia ? varianteDeFamilia(familia, idLogico, x, y, contexto) : null;
}
