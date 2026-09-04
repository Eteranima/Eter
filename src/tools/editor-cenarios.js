/* Editor estático para autoria de MAPS. Não é carregado pelo jogo, mas
   carrega TILEDEF/MAPS/normalizeRows (12-maps.js, 17-world.js) e
   Sound.TRACKS (13-audio.js) DO JOGO DE VERDADE — ver comentário no
   <head> de editor-cenarios.html. Isso é o que permite validar destino
   de warp, tile pisável no mapa de destino e nome de trilha real, sem
   reimplementar (e arriscar divergir) essas regras aqui. */
const CELL = 24;
/* TILEDEF só tem id/solid/etc — nome e cor de exibição não fazem parte
   do contrato do jogo, então ficam só aqui, keyed por `id` (não por
   caractere) pra continuar valendo se um mapa usar outro caractere pro
   mesmo id. Um id sem entrada cai no fallback (nome = id, cinza). */
const NOME_COR_POR_ID = {
  grass:['Grama','#315b36'], path:['Caminho','#665f4a'], dirt:['Terra','#624b35'], crack:['Rachado','#302c3d'],
  wall:['Parede','#4d4559'], tree:['Árvore','#285236'], water:['Água','#354f94'], floor:['Piso','#4a455a'],
  carpet:['Tapete','#8e4a3e'], shelf:['Estante','#74513c'], table:['Mesa','#8c6545'], pillar:['Pilar','#817895'],
  brazier:['Braseiro','#d66d39'], rubble:['Entulho','#6a6378'], save:['Save','#58c9d8'], chest:['Baú','#bd8b39'],
  door:['Porta','#a76b42'], stairs:['Escada','#a098a8'],
};
/* TILES[char] = [nome, cor, solido] — derivado de TILEDEF de verdade
   (mesma fonte do jogo), não uma cópia que pode ficar desatualizada.
   'o'/'p' (piso/caminho + encontro) reaproveitam o nome do id base com
   sufixo, já que TILEDEF não os distingue por nome, só por `enc`. */
const TILES = Object.fromEntries(Object.entries(TILEDEF).map(([ch, def]) => {
  const [nomeBase, cor] = NOME_COR_POR_ID[def.id] || [def.id, '#3a3648'];
  const nome = def.enc ? `${nomeBase} + encontro` : nomeBase;
  return [ch, [nome, cor, !!def.solid]];
}));
const INITIAL_PROPS = [
  ['prop_academia_stone_reach','Academia',true],['prop_portao_stone_reach','Portão',true],['prop_altar_selo','Altar do Selo',true],
  ['prop_casa_grande','Casa grande',true,4],['prop_estalagem','Estalagem',true,4],['prop_templo','Templo',true,4],['prop_torre','Torre',true,4],
  ['prop_ruinas','Ruínas',true],['prop_muro_pedra','Muro',true],['prop_poco','Poço',true],['prop_arvore','Árvore',true],
  ['prop_arbusto','Arbusto',true],['prop_flores','Flores',false],['prop_lampiao','Lampião',false],['prop_barril','Barril',true],
  ['prop_caixa','Caixa',true],['prop_forja','Forja',true],['prop_estante','Estante',true],['prop_tocha','Tocha',false],
  ['prop_placa','Placa',false,2],
  /* Porto Lúmina: cada prop usa altura de prévia aproximada à sua arte
     real e é ancorado pelo pé, igual ao runtime do campo. */
  ['prop_barco_lumina','Barco Vento de Coral',true,3.2],
  ['prop_barco_pesca_lumina','Barco de pesca Lúmina',true,2.4],
  ['prop_taverna_lumina','Taverna Mesa de Âmbar',true,4.25],
  ['prop_loja_lumina','Loja Mercado da Maré',true,4],
];
let PROPS = [...INITIAL_PROPS];
const $ = id => document.getElementById(id), canvas = $('map-canvas'), ctx = canvas.getContext('2d');
let state = {w:24,h:16,fill:'.',grid:[],decor:[],npcs:[],selectedTile:'.',selectedProp:PROPS[0][0],mode:'tile'};
const images = {};
let ASSET_PATHS = {};
/* Regiões reais, extraídas de MAPS de verdade (12-maps.js) — a mesma
   lista que WORLD_ART_FAMILIES/cenas/BGM já usam. 'nova_regiao' é o
   único valor que não existe em MAPS: sinaliza pro autor que ele está
   abrindo uma região nova de propósito, não digitando errado uma que
   já existe. */
const REGIOES_REAIS = [...new Set(Object.values(MAPS).map(def => def.region).filter(Boolean))].sort();
/* Sound.TRACKS tem battle/boss também — não são trilha de exploração,
   nunca aparecem em def.bgm de mapa nenhum (ver 13-audio.js: só
   entram via combate). Ficam fora da lista pro autor não escolher por
   engano uma trilha de luta pro mapa inteiro. */
const TRILHAS_MAPA = Object.keys(Sound.TRACKS).filter(nome => nome !== 'battle' && nome !== 'boss').sort();
let NPC_SHEETS = [];
function propPath(prop){ return prop?.[5] || `assets/world/${prop?.[0]}.webp`; }
function carregarImagemPorChave(key, path){
  if(!key || images[key])return images[key];
  const image=new Image(); image.src=`../${path||ASSET_PATHS[key]||`assets/world/${key}.webp`}`; image.onload=render; images[key]=image; return image;
}
function carregarImagem(prop){
  return prop && carregarImagemPorChave(prop[0],propPath(prop));
}
function grupoDoProp(key){
  if(key.includes('stone_reach')||key.includes('academia')||key.includes('altar_selo'))return 'Stone Reach';
  if(key.includes('lumina'))return 'Porto Lúmina';
  if(key.includes('undercroft'))return 'Undercroft';
  if(key.includes('hall'))return 'Hall';
  return 'Geral';
}
function nomeDoProp(key){ return key.replace(/^prop_/,'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()); }

function blank(w,h,fill){ return Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>x===0||y===0||x===w-1||y===h-1?'#':fill)); }
function status(message,kind=''){ const output=$('status'); output.textContent=message; output.className=`status ${kind}`; }
function marker(chars){ const out=[]; state.grid.forEach((row,y)=>row.forEach((cell,x)=>{if(chars.includes(cell))out.push({x,y,marker:cell});})); return out; }
function propData(){ return PROPS.find(([key])=>key===state.selectedProp); }
function render(){
  canvas.width=state.w*CELL; canvas.height=state.h*CELL; ctx.imageSmoothingEnabled=false;
  for(let y=0;y<state.h;y++)for(let x=0;x<state.w;x++){
    const [,,solid]=TILES[state.grid[y][x]]||TILES['#']; ctx.fillStyle=TILES[state.grid[y][x]]?.[1]||'#333';ctx.fillRect(x*CELL,y*CELL,CELL,CELL);
    ctx.strokeStyle=solid?'#0005':'#fff1';ctx.strokeRect(x*CELL+.5,y*CELL+.5,CELL-1,CELL-1);
    const id=TILEDEF[state.grid[y][x]]?.id;
    if(state.grid[y][x]!=='.'&&!TALL_ART[id]){ctx.fillStyle='#fffb';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(state.grid[y][x],x*CELL+CELL/2,y*CELL+16);}
  }
  /* A seleção de família recebe o mapa/região que o autor está editando.
     É a mesma chave determinística do campo; só o fator 24/32 adapta o
     preview, nunca a âncora ou a variante escolhida. */
  const contextoArte={mapaId:$('map-id').value.trim(),regiaoId:regiaoEfetiva()};
  for(let y=0;y<state.h;y++)for(let x=0;x<state.w;x++){
    const id=TILEDEF[state.grid[y][x]]?.id, chave=chaveDeFamilia(id,x,y,contextoArte)||TALL_ART[id];
    const image=carregarImagemPorChave(chave);
    if(!chave||!image?.complete||!image.naturalWidth)continue;
    const fator=CELL/32,layout=calcularLayoutProp(image.naturalWidth,image.naturalHeight,x*CELL,y*CELL,{escala:fator,recuo:2*fator},CELL);
    if(layout.sombra){ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(layout.peX,layout.peY-2*fator,layout.sombraRaioX,5*fator,0,0,Math.PI*2);ctx.fill();}
    ctx.drawImage(image,layout.x,layout.y,layout.largura,layout.altura);
  }
  state.decor.forEach(d=>{
    const prop=PROPS.find(([key])=>key===d.s), image=carregarImagem(prop), x=d.x*CELL,y=d.y*CELL;
    if(image?.complete && image.naturalWidth){
      /* A arte é 32px/tile no jogo; o canvas do editor é 24px/tile.
         A função e a âncora são literalmente as mesmas do runtime. */
      const fator=CELL/32, layout=calcularLayoutProp(image.naturalWidth,image.naturalHeight,x,y,{escala:(d.escala??1)*fator,recuo:(d.recuo??2)*fator,sombra:d.sombra},CELL);
      if(layout.sombra){ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(layout.peX,layout.peY-2*fator,layout.sombraRaioX,5*fator,0,0,Math.PI*2);ctx.fill();}
      ctx.drawImage(image,layout.x,layout.y,layout.largura,layout.altura);
    }else{ctx.fillStyle='#00a8a8';ctx.fillRect(x+7,y+7,10,10);}
  });
  /* NPC não tem a folha (spritesheet de 3x4 quadros) carregada aqui —
     mostrar a arte real pediria fatiar frame igual ao runtime, fora do
     escopo deste lote. Um marcador com a inicial já mostra colisão
     (NPC ocupa 1 casa) e posição de verdade, que é o que a validação
     de warp/sign/decor também precisa. */
  state.npcs.forEach(n=>{
    const cx2=n.x*CELL+CELL/2, cy2=n.y*CELL+CELL/2;
    ctx.fillStyle='#e0a83a';ctx.beginPath();ctx.arc(cx2,cy2,CELL*0.32,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#3a2a10';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#2a1c08';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText((n.name||'?').charAt(0).toUpperCase(),cx2,cy2+1);
    ctx.textBaseline='alphabetic';
  });
  const x=Number($('spawn-x').value),y=Number($('spawn-y').value);if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<state.w&&y<state.h){ctx.fillStyle='#ffcf4f';ctx.beginPath();ctx.moveTo((x+.5)*CELL,(y+.14)*CELL);ctx.lineTo((x+.82)*CELL,(y+.82)*CELL);ctx.lineTo((x+.18)*CELL,(y+.82)*CELL);ctx.closePath();ctx.fill();}
}
function choose(){
  document.querySelectorAll('[data-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.mode===state.mode));
  document.querySelectorAll('[data-tile]').forEach(button=>button.classList.toggle('selected',button.dataset.tile===state.selectedTile&&state.mode==='tile'));
  document.querySelectorAll('[data-prop]').forEach(button=>button.classList.toggle('selected',button.dataset.prop===state.selectedProp&&state.mode==='prop'));
  $('selection').textContent=state.mode==='tile'?`Tile selecionado: ${TILES[state.selectedTile][0]} (${state.selectedTile})`:`Prop selecionado: ${propData()?.[1]||'—'}`;
}
function palettes(){
  $('tile-palette').innerHTML='';$('prop-palette').innerHTML='';
  Object.entries(TILES).forEach(([key,[name]])=>{const button=document.createElement('button');button.className='tile';button.innerHTML=`<span>${key}</span>${name}`;button.dataset.tile=key;button.onclick=()=>{state.selectedTile=key;state.mode='tile';choose();};$('tile-palette').append(button);});
  const busca=($('atlas-search')?.value||'').trim().toLocaleLowerCase(),grupo=$('atlas-filter')?.value||'all';
  const filtrados=PROPS.filter(([key,name,,,propGrupo])=>(grupo==='all'||propGrupo===grupo)&&`${key} ${name}`.toLocaleLowerCase().includes(busca));
  filtrados.forEach(([key,name,solid,,,path])=>{const button=document.createElement('button');button.className='prop';button.innerHTML=`<img src="../${path||`assets/world/${key}.webp`}" alt=""><span>${name}</span>`;button.dataset.prop=key;button.onclick=()=>{state.selectedProp=key;state.mode='prop';$('prop-solid').checked=solid;$('prop-shadow').checked=!key.includes('lake_edge');choose();};$('prop-palette').append(button);});
  if($('atlas-summary'))$('atlas-summary').textContent=`${filtrados.length} de ${PROPS.length} props do catálogo`;
}
function atualizarFiltros(){
  const filtro=$('atlas-filter');if(!filtro)return;
  const anterior=filtro.value;filtro.innerHTML='<option value="all">Todo o atlas</option>';
  [...new Set(PROPS.map(prop=>prop[4]||'Geral'))].sort().forEach(grupo=>{const option=document.createElement('option');option.value=grupo;option.textContent=grupo;filtro.append(option);});
  filtro.value=[...filtro.options].some(option=>option.value===anterior)?anterior:'all';
}
/* Região e BGM populados de MAPS/Sound.TRACKS DE VERDADE (carregados
   no <head>) — nunca uma lista digitada à mão que pode ficar velha. */
function popularRegiaoEBgm(){
  const selRegiao=$('map-region');
  selRegiao.innerHTML=REGIOES_REAIS.map(r=>`<option value="${r}">${r}</option>`).join('')
    +'<option value="__nova__">+ Nova região…</option>';
  selRegiao.value=REGIOES_REAIS[0];
  selRegiao.onchange=()=>{
    const nova=selRegiao.value==='__nova__';
    $('map-region-nova-wrap').hidden=!nova;
    $('region-hint').textContent=nova
      ? 'Precisa entrar em WORLD_ART_FAMILIES e Sound.TRACKS pra ter família visual e trilha próprias; até lá o mapa usa a trilha "field"/"dungeon" genérica escolhida ao lado.'
      : `${Object.values(MAPS).filter(d=>d.region===selRegiao.value).length} mapa(s) já usam essa região.`;
    sugerirBgmPelaRegiao();
  };
  selRegiao.onchange();

  const selBgm=$('map-bgm');
  selBgm.innerHTML=TRILHAS_MAPA.map(t=>`<option value="${t}">${t}</option>`).join('');
  sugerirBgmPelaRegiao();
}
function sugerirBgmPelaRegiao(){
  const regiao=regiaoEfetiva(), selBgm=$('map-bgm');
  if(TRILHAS_MAPA.includes(regiao))selBgm.value=regiao;
}
/* Nome de região de verdade a usar na exportação: da lista real quando
   escolhida, ou o texto digitado quando o autor está abrindo uma
   região nova de propósito. */
function regiaoEfetiva(){
  const sel=$('map-region').value;
  return sel==='__nova__'?($('map-region-nova').value.trim()||'nova_regiao'):sel;
}
function nomeDoNpc(key){ return key.replace(/^npc_/,'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()); }
function popularSheetsDeNpc(){
  const sel=$('npc-sheet');if(!sel)return;
  sel.innerHTML=NPC_SHEETS.map(key=>`<option value="${key}">${nomeDoNpc(key)} (${key})</option>`).join('')
    ||'<option value="">catálogo indisponível — digite a chave manualmente depois</option>';
}
async function carregarAtlas(){
  try{
    const resposta=await fetch('../asset-catalog.json',{cache:'no-store'});if(!resposta.ok)throw new Error(`HTTP ${resposta.status}`);
    const catalogo=await resposta.json(),base=new Map(INITIAL_PROPS.map(prop=>[prop[0],prop]));
    ASSET_PATHS=Object.fromEntries((catalogo.assets||[]).map(asset=>[asset.key,asset.path]));
    const assets=(catalogo.assets||[]).filter(asset=>asset.key?.startsWith('prop_')&&asset.path?.startsWith('assets/world/'));
    if(!assets.length)throw new Error('nenhum prop world encontrado');
    PROPS=assets.sort((a,b)=>a.key.localeCompare(b.key)).map(asset=>{const anterior=base.get(asset.key)||[];return [asset.key,anterior[1]||nomeDoProp(asset.key),anterior[2]??true,anterior[3]??1,grupoDoProp(asset.key),asset.path];});
    NPC_SHEETS=(catalogo.assets||[]).filter(asset=>asset.key?.startsWith('npc_')).map(asset=>asset.key).sort();
    state.selectedProp=PROPS[0][0];PROPS.forEach(carregarImagem);atualizarFiltros();palettes();choose();popularSheetsDeNpc();
  }catch(error){
    PROPS=INITIAL_PROPS.map(prop=>[...prop,grupoDoProp(prop[0]),`assets/world/${prop[0]}.webp`]);PROPS.forEach(carregarImagem);atualizarFiltros();palettes();
    NPC_SHEETS=[];popularSheetsDeNpc();
    if($('atlas-summary'))$('atlas-summary').textContent=`Catálogo indisponível; usando ${PROPS.length} props-base (${error.message}).`;
  }
}
function resize(){
  const w=Math.max(8,Math.min(48,Number($('map-width').value)||24)),h=Math.max(8,Math.min(32,Number($('map-height').value)||16)),fill=$('map-fill').value,next=blank(w,h,fill);
  for(let y=0;y<Math.min(h,state.h);y++)for(let x=0;x<Math.min(w,state.w);x++)next[y][x]=state.grid[y][x];
  state={...state,w,h,fill,grid:next,decor:state.decor.filter(d=>d.x<w&&d.y<h)};$('spawn-x').max=w-2;$('spawn-y').max=h-2;render();status(`Grade ajustada para ${w}×${h}.`,'ok');
}
function list(id,label){try{const value=JSON.parse($(id).value);if(!Array.isArray(value))throw new Error('não é uma lista');return value;}catch(error){throw new Error(`${label}: JSON inválido (${error.message}).`);}}
function validate(){
  const errors=[],warnings=[],id=$('map-id').value.trim(),sx=Number($('spawn-x').value),sy=Number($('spawn-y').value);let warps,chests,signs;
  if(!/^[a-z][a-z0-9_]*$/.test(id))errors.push('ID: use minúsculas, números e _.');
  else if(MAPS[id])errors.push(`ID "${id}" já existe em MAPS — colar esta definição SOBRESCREVERIA o mapa "${MAPS[id].name}". Escolha outro id, ou é isso mesmo que você quer (edição, não mapa novo)?`);
  if(!regiaoEfetiva())errors.push('Região: escolha uma da lista ou digite o nome da região nova.');
  if(state.grid.some((row,y)=>row.some((tile,x)=>(x===0||y===0||x===state.w-1||y===state.h-1)&&tile!=='#')))warnings.push('Borda não selada: normalizeRows a corrigirá, mas mantenha # para prévia fiel.');
  if(!Number.isInteger(sx)||!Number.isInteger(sy)||sx<0||sy<0||sx>=state.w||sy>=state.h||TILES[state.grid[sy]?.[sx]]?.[2])errors.push('Spawn precisa estar numa célula passável.');
  const used=new Set();state.decor.forEach(d=>{const key=`${d.x},${d.y}`;if(used.has(key))errors.push(`Dois props em ${key}.`);used.add(key);if(d.solido&&sx===d.x&&sy===d.y)errors.push('Spawn coincide com prop sólido.');});
  try{
    warps=list('warps','Warps');chests=list('chests','Baús');signs=list('signs','Placas');
    if(warps.length!==marker('+S').length)errors.push(`Warps: ${warps.length}, marcadores +/S: ${marker('+S').length}.`);
    if(chests.length!==marker('$').length)errors.push(`Baús: ${chests.length}, marcadores $: ${marker('$').length}.`);
    /* Destino de warp validado contra MAPS DE VERDADE (carregado no
       <head>) — pega mapa inexistente/digitado errado e célula de
       chegada sólida ANTES de exportar, os dois jeitos reais de travar
       o jogador que só apareceriam depois, jogando de verdade. Mapa
       ainda inexistente (você está criando os dois juntos) é aviso, não
       erro — não dá pra saber se vai existir. */
    warps.forEach((wp,i)=>{
      if(!wp.to || typeof wp.to!=='string'){errors.push(`warp #${i+1}: falta "to" (id do mapa de destino).`);return;}
      const destino=MAPS[wp.to];
      if(!destino){warnings.push(`warp #${i+1}: mapa de destino "${wp.to}" não existe em MAPS ainda — confirme se ele será criado junto.`);return;}
      if(!Number.isInteger(wp.tx)||!Number.isInteger(wp.ty)){errors.push(`warp #${i+1}: "tx"/"ty" (posição de chegada em ${wp.to}) faltando ou inválidos.`);return;}
      const gradeDestino=normalizeRows(destino.rows,destino.fill);
      const chDestino=gradeDestino[wp.ty]?.[wp.tx];
      if(!chDestino)errors.push(`warp #${i+1}: chegada (${wp.tx},${wp.ty}) fora da grade de "${wp.to}".`);
      else if(TILEDEF[chDestino]?.solid)errors.push(`warp #${i+1}: chegada (${wp.tx},${wp.ty}) em "${wp.to}" cai num tile sólido — o jogador nunca conseguiria chegar lá.`);
    });
    /* Requisito 100% interativo: todo prop de decor (prop_placa incluído)
       reage ao examinar (`text`) ou foi marcado mudo de propósito — nunca
       por esquecimento. `signs` é um mecanismo SEPARADO (placa muda,
       embutida na parede) e nunca compartilha coordenada com decor: o
       motor só aceita `signs` num tile de base SÓLIDO (parede/água/
       árvore/estante/mesa/pilar/braseiro/entulho/baú), e só aceita
       `decor` num tile de base NÃO sólido — as duas regras juntas fazem
       de "decor em (x,y) == sign em (x,y)" uma contradição, nunca um
       requisito. (Histórico: essa mistura já foi tentada e quebrou o
       autoteste de verdade — decor sólido "dentro de parede" e sign fora
       de tile sólido são os dois erros que a validação abaixo evita.) */
    state.decor.forEach(d=>{
      const ch=state.grid[d.y]?.[d.x], solidoDaBase=!!TILES[ch]?.[2];
      if(solidoDaBase)errors.push(`decor ${d.s} em (${d.x},${d.y}) está em cima de um tile de base sólido — decor só vale em tile aberto.`);
      if(d.solido && '+S*$'.includes(ch))errors.push(`decor sólido ${d.s} em (${d.x},${d.y}) bloqueia o marcador ${ch} — mova o prop ou use uma peça não sólida.`);
      if(d.s?.includes('lake_edge') && d.sombra!==false)errors.push(`Borda de lago ${d.s} em (${d.x},${d.y}) precisa usar sombra:false — overlays transparentes não podem projetar sombra.`);
      if(!d.text && !d.mudo)warnings.push(`Prop ${d.s} em (${d.x},${d.y}) sem texto e sem marcação de mudo deliberado.`);
    });
    signs.forEach(s=>{
      const ch=state.grid[s.y]?.[s.x], solidoDaBase=!!TILES[ch]?.[2];
      if(!solidoDaBase)errors.push(`sign em (${s.x},${s.y}) não está sobre tile de base sólido — o autoteste exige placa "embutida" na parede/água/objeto.`);
      if(state.decor.some(d=>d.x===s.x&&d.y===s.y))errors.push(`sign em (${s.x},${s.y}) compartilha coordenada com um decor — mova um dos dois.`);
    });
    const posicoesNpc=new Set();
    state.npcs.forEach(n=>{
      const key=`${n.x},${n.y}`, ch=state.grid[n.y]?.[n.x];
      if(posicoesNpc.has(key))errors.push(`Dois NPCs em (${n.x},${n.y}).`);
      posicoesNpc.add(key);
      if(TILES[ch]?.[2])errors.push(`NPC "${n.name}" em (${n.x},${n.y}) está sobre tile de base sólido — nasceria preso.`);
      if(state.decor.some(d=>d.solido&&d.x===n.x&&d.y===n.y))errors.push(`NPC "${n.name}" em (${n.x},${n.y}) coincide com decor sólido.`);
      if(sx===n.x&&sy===n.y)errors.push(`NPC "${n.name}" coincide com o spawn (${n.x},${n.y}).`);
    });
  }catch(error){errors.push(error.message);}
  return {errors,warnings,warps,chests,signs};
}
function definition(){
  const result=validate();if(result.errors.length){status(result.errors.join(' '),'error');return null;}
  const rows=state.grid.map(row=>`      '${row.join('')}',`).join('\n');
  const decor=state.decor.map(d=>{
    const bits=[`x:${d.x}`,`y:${d.y}`,`s:'${d.s}'`];
    if(d.solido)bits.push('solido:true');
    if(d.sombra===false)bits.push('sombra:false');
    if(d.mudo)bits.push('mudo:true');
    if(d.text)bits.push(`text:'${d.text.replace(/'/g,"\\'")}'`);
    return `      {${bits.join(', ')}},`;
  }).join('\n');
  const regiao=regiaoEfetiva();
  const npcs=state.npcs.map(n=>{
    const bits=[`x:${n.x}`,`y:${n.y}`,`name:'${n.name.replace(/'/g,"\\'")}'`,`sheet:'${n.sheet}'`];
    if(n.wander)bits.push('wander:true');
    const linhas=(n.lines||[]).map(l=>`'${l.replace(/'/g,"\\'")}'`);
    bits.push(`lines:[${linhas.join(', ')}]`);
    const linha=`      {${bits.join(', ')}},`;
    return n.notas?`      /* completar manualmente: ${n.notas.replace(/\*\//g,'*\\/')} */\n${linha}`:linha;
  }).join('\n');
  return `${$('map-id').value.trim()}: {\n  name:'${$('map-name').value.replace(/'/g,"\\'")}', region:'${regiao}',\n  fill:'${$('map-fill').value}', outdoor:${$('map-outdoor').checked}, encounter:null, bgm:'${$('map-bgm').value}',\n  rows:[\n${rows}\n  ],\n  spawn:{x:${$('spawn-x').value}, y:${$('spawn-y').value}, dir:'${$('spawn-dir').value}'},\n  warps:${JSON.stringify(result.warps)},\n  chests:${JSON.stringify(result.chests)},\n  decor:[\n${decor}\n  ],\n  signs:${JSON.stringify(result.signs)},\n  npcs:[\n${npcs}\n  ],\n},`;
}
canvas.addEventListener('click',event=>{
  const rect=canvas.getBoundingClientRect(),x=Math.floor((event.clientX-rect.left)*canvas.width/rect.width/CELL),y=Math.floor((event.clientY-rect.top)*canvas.height/rect.height/CELL);
  if(x<0||y<0||x>=state.w||y>=state.h)return;
  if(state.mode==='tile'){state.grid[y][x]=state.selectedTile;render();return;}
  const at=state.decor.findIndex(d=>d.x===x&&d.y===y);
  if(at>=0){state.decor.splice(at,1);render();return;}
  const text=$('prop-text').value.trim(),mudo=$('prop-mute').checked;
  /* Requisito 100% interativo: recusa colocar um prop sem texto E sem a
     marcação explícita de "mudo de propósito" — placa é exceção porque
     a interação dela vem do campo Placas/signs, não deste texto. */
  if(state.selectedProp!=='prop_placa' && !text && !mudo){
    status('Preencha "Texto ao examinar" ou marque "Decoração muda" antes de colocar este prop.','error');
    return;
  }
  state.decor.push({x,y,s:state.selectedProp,solido:$('prop-solid').checked,sombra:$('prop-shadow').checked,...(text?{text}:{}),...(mudo?{mudo:true}:{})});
  status(state.selectedProp==='prop_placa'
    ? `Placa colocada em (${x},${y}). Adicione a entrada correspondente em "Placas / signs" na mesma coordenada.`
    : `${propData()?.[1]||state.selectedProp} colocado em (${x},${y})${text?' com texto.':' — decoração muda.'}`, 'ok');
  render();
});
function renderizarListaNpc(){
  const lista=$('npc-list');if(!lista)return;
  lista.innerHTML='';
  state.npcs.forEach((n,i)=>{
    const item=document.createElement('li');
    item.innerHTML=`<span><strong>${n.name}</strong> (${n.x},${n.y}) — ${n.sheet}${n.wander?' · anda':''}${n.notas?' · <em>precisa de acabamento</em>':''}</span>`;
    const remover=document.createElement('button');remover.textContent='Remover';remover.className='secondary';
    remover.onclick=()=>{state.npcs.splice(i,1);renderizarListaNpc();render();};
    item.append(remover);lista.append(item);
  });
}
$('npc-add').onclick=()=>{
  const x=Number($('npc-x').value),y=Number($('npc-y').value),name=$('npc-name').value.trim(),sheet=$('npc-sheet').value;
  if(!name){status('Preencha o nome do NPC antes de adicionar.','error');return;}
  if(!sheet){status('Escolha uma folha (sheet) — o catálogo precisa carregar, ou digite a chave depois no snippet.','error');return;}
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=state.w||y>=state.h){status('Posição do NPC fora da grade.','error');return;}
  const linhas=$('npc-lines').value.split('\n').map(l=>l.trim()).filter(Boolean);
  const notas=$('npc-notas').value.trim();
  if(!linhas.length && !notas){status('Preencha ao menos uma fala, ou explique em "precisa de acabamento manual" por que não tem.','error');return;}
  state.npcs.push({x,y,name,sheet,wander:$('npc-wander').checked,lines:linhas,...(notas?{notas}:{})});
  $('npc-name').value='';$('npc-lines').value='';$('npc-notas').value='';$('npc-wander').checked=false;
  renderizarListaNpc();render();
  status(`NPC "${name}" adicionado em (${x},${y}).`,'ok');
};
$('resize').onclick=resize;$('validate').onclick=()=>{const r=validate();status(r.errors.length?r.errors.join(' '):r.warnings.length?r.warnings.join(' '):'Validação concluída: contrato de MAPS consistente.',r.errors.length?'error':'ok');};$('copy').onclick=async()=>{const value=definition();if(!value)return;try{await navigator.clipboard.writeText(value);status('Definição MAPS copiada. Cole em src/scripts/world/12-maps.js.','ok');}catch{status('Área de transferência indisponível.','error');}};
['spawn-x','spawn-y'].forEach(id=>$(id).addEventListener('input',render));document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{state.mode=button.dataset.mode;choose();});
['atlas-search','atlas-filter'].forEach(id=>$(id)?.addEventListener(id==='atlas-search'?'input':'change',palettes));
state.grid=blank(state.w,state.h,state.fill);atualizarFiltros();palettes();render();choose();popularRegiaoEBgm();popularSheetsDeNpc();carregarAtlas();
