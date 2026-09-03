/* Editor estático para autoria de MAPS. Não é carregado pelo jogo. */
const CELL = 24;
const TILES = {
  '.': ['Grama','#315b36',false], ',': ['Caminho','#665f4a',false], 'd':['Terra','#624b35',false], 'x':['Rachado','#302c3d',false],
  '#':['Parede','#4d4559',true], 'T':['Árvore','#285236',true], '~':['Água','#354f94',true], 'f':['Piso','#4a455a',false],
  'c':['Tapete','#8e4a3e',false], 'o':['Piso + encontro','#584d60',false], 'p':['Caminho + encontro','#82744f',false],
  'b':['Estante','#74513c',true], '=':['Mesa','#8c6545',true], '^':['Pilar','#817895',true], 'B':['Braseiro','#d66d39',true],
  'r':['Entulho','#6a6378',true], '*':['Save','#58c9d8',false], '$':['Baú','#bd8b39',true], '+':['Porta','#a76b42',false], 'S':['Escada','#a098a8',false],
};
const PROPS = [
  ['prop_academia_stone_reach','Academia',true],['prop_portao_stone_reach','Portão',true],['prop_altar_selo','Altar do Selo',true],
  ['prop_casa_grande','Casa grande',true],['prop_estalagem','Estalagem',true],['prop_templo','Templo',true],['prop_torre','Torre',true],
  ['prop_ruinas','Ruínas',true],['prop_muro_pedra','Muro',true],['prop_poco','Poço',true],['prop_arvore','Árvore',true],
  ['prop_arbusto','Arbusto',true],['prop_flores','Flores',false],['prop_lampiao','Lampião',false],['prop_barril','Barril',true],
  ['prop_caixa','Caixa',true],['prop_forja','Forja',true],['prop_estante','Estante',true],['prop_tocha','Tocha',false],
  ['prop_placa','Placa',false],
];
const $ = id => document.getElementById(id), canvas = $('map-canvas'), ctx = canvas.getContext('2d');
let state = {w:24,h:16,fill:'.',grid:[],decor:[],selectedTile:'.',selectedProp:PROPS[0][0],mode:'tile'};
const images = Object.fromEntries(PROPS.map(([key]) => { const image = new Image(); image.src = `../assets/world/${key}.webp`; image.onload=render; return [key,image]; }));

function blank(w,h,fill){ return Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>x===0||y===0||x===w-1||y===h-1?'#':fill)); }
function status(message,kind=''){ const output=$('status'); output.textContent=message; output.className=`status ${kind}`; }
function marker(chars){ const out=[]; state.grid.forEach((row,y)=>row.forEach((cell,x)=>{if(chars.includes(cell))out.push({x,y,marker:cell});})); return out; }
function propData(){ return PROPS.find(([key])=>key===state.selectedProp); }
function render(){
  canvas.width=state.w*CELL; canvas.height=state.h*CELL; ctx.imageSmoothingEnabled=false;
  for(let y=0;y<state.h;y++)for(let x=0;x<state.w;x++){
    const [,,solid]=TILES[state.grid[y][x]]||TILES['#']; ctx.fillStyle=TILES[state.grid[y][x]]?.[1]||'#333';ctx.fillRect(x*CELL,y*CELL,CELL,CELL);
    ctx.strokeStyle=solid?'#0005':'#fff1';ctx.strokeRect(x*CELL+.5,y*CELL+.5,CELL-1,CELL-1);if(state.grid[y][x]!=='.'){ctx.fillStyle='#fffb';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(state.grid[y][x],x*CELL+CELL/2,y*CELL+16);}
  }
  state.decor.forEach(d=>{ const image=images[d.s], x=d.x*CELL,y=d.y*CELL;if(image?.complete)ctx.drawImage(image,x-CELL*.75,y-CELL*3.8,CELL*2.5,CELL*4);else{ctx.fillStyle='#00a8a8';ctx.fillRect(x+7,y+7,10,10);}});
  const x=Number($('spawn-x').value),y=Number($('spawn-y').value);if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<state.w&&y<state.h){ctx.fillStyle='#ffcf4f';ctx.beginPath();ctx.moveTo((x+.5)*CELL,(y+.14)*CELL);ctx.lineTo((x+.82)*CELL,(y+.82)*CELL);ctx.lineTo((x+.18)*CELL,(y+.82)*CELL);ctx.closePath();ctx.fill();}
}
function choose(){
  document.querySelectorAll('[data-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.mode===state.mode));
  document.querySelectorAll('[data-tile]').forEach(button=>button.classList.toggle('selected',button.dataset.tile===state.selectedTile&&state.mode==='tile'));
  document.querySelectorAll('[data-prop]').forEach(button=>button.classList.toggle('selected',button.dataset.prop===state.selectedProp&&state.mode==='prop'));
  $('selection').textContent=state.mode==='tile'?`Tile selecionado: ${TILES[state.selectedTile][0]} (${state.selectedTile})`:`Prop selecionado: ${propData()[1]}`;
}
function palettes(){
  Object.entries(TILES).forEach(([key,[name]])=>{const button=document.createElement('button');button.className='tile';button.innerHTML=`<span>${key}</span>${name}`;button.dataset.tile=key;button.onclick=()=>{state.selectedTile=key;state.mode='tile';choose();};$('tile-palette').append(button);});
  PROPS.forEach(([key,name,solid])=>{const button=document.createElement('button');button.className='prop';button.innerHTML=`<img src="../assets/world/${key}.webp" alt=""><span>${name}</span>`;button.dataset.prop=key;button.onclick=()=>{state.selectedProp=key;state.mode='prop';$('prop-solid').checked=solid;choose();};$('prop-palette').append(button);});
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
  if(state.grid.some((row,y)=>row.some((tile,x)=>(x===0||y===0||x===state.w-1||y===state.h-1)&&tile!=='#')))warnings.push('Borda não selada: normalizeRows a corrigirá, mas mantenha # para prévia fiel.');
  if(!Number.isInteger(sx)||!Number.isInteger(sy)||sx<0||sy<0||sx>=state.w||sy>=state.h||TILES[state.grid[sy]?.[sx]]?.[2])errors.push('Spawn precisa estar numa célula passável.');
  const used=new Set();state.decor.forEach(d=>{const key=`${d.x},${d.y}`;if(used.has(key))errors.push(`Dois props em ${key}.`);used.add(key);if(d.solido&&sx===d.x&&sy===d.y)errors.push('Spawn coincide com prop sólido.');});
  try{
    warps=list('warps','Warps');chests=list('chests','Baús');signs=list('signs','Placas');
    if(warps.length!==marker('+S').length)errors.push(`Warps: ${warps.length}, marcadores +/S: ${marker('+S').length}.`);
    if(chests.length!==marker('$').length)errors.push(`Baús: ${chests.length}, marcadores $: ${marker('$').length}.`);
    /* Requisito 100% interativo (2026-09-03): todo prop reage ao examinar
       (texto próprio ou, no caso de prop_placa, uma entrada em `signs` na
       MESMA coordenada) ou foi marcado mudo de propósito — nunca por
       esquecimento. O bug real que motivou isto: uma placa visível sem
       texto ligado, e um texto sem placa visível, em coordenadas
       diferentes do mesmo mapa. */
    state.decor.forEach(d=>{
      if(d.s==='prop_placa'){
        if(!signs.some(s=>s.x===d.x&&s.y===d.y))warnings.push(`prop_placa em (${d.x},${d.y}) sem entrada correspondente em signs — a placa não vai reagir.`);
      } else if(!d.text && !d.mudo){
        warnings.push(`Prop ${d.s} em (${d.x},${d.y}) sem texto e sem marcação de mudo deliberado.`);
      }
    });
    signs.forEach(s=>{ if(!state.decor.some(d=>d.s==='prop_placa'&&d.x===s.x&&d.y===s.y))warnings.push(`sign em (${s.x},${s.y}) sem prop_placa visível na mesma coordenada.`); });
  }catch(error){errors.push(error.message);}
  return {errors,warnings,warps,chests,signs};
}
function definition(){
  const result=validate();if(result.errors.length){status(result.errors.join(' '),'error');return null;}
  const rows=state.grid.map(row=>`      '${row.join('')}',`).join('\n');
  const decor=state.decor.map(d=>{
    const bits=[`x:${d.x}`,`y:${d.y}`,`s:'${d.s}'`];
    if(d.solido)bits.push('solido:true');
    if(d.text)bits.push(`text:'${d.text.replace(/'/g,"\\'")}'`);
    return `      {${bits.join(', ')}},`;
  }).join('\n');
  return `${$('map-id').value.trim()}: {\n  name:'${$('map-name').value.replace(/'/g,"\\'")}',\n  fill:'${$('map-fill').value}', outdoor:${$('map-outdoor').checked}, bgm:'${$('map-bgm').value}',\n  rows:[\n${rows}\n  ],\n  spawn:{x:${$('spawn-x').value}, y:${$('spawn-y').value}, dir:'${$('spawn-dir').value}'},\n  warps:${JSON.stringify(result.warps)},\n  chests:${JSON.stringify(result.chests)},\n  decor:[\n${decor}\n  ],\n  signs:${JSON.stringify(result.signs)},\n},`;
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
  state.decor.push({x,y,s:state.selectedProp,solido:$('prop-solid').checked,...(text?{text}:{}),...(mudo?{mudo:true}:{})});
  status(state.selectedProp==='prop_placa'
    ? `Placa colocada em (${x},${y}). Adicione a entrada correspondente em "Placas / signs" na mesma coordenada.`
    : `${propData()[1]} colocado em (${x},${y})${text?' com texto.':' — decoração muda.'}`, 'ok');
  render();
});
$('resize').onclick=resize;$('validate').onclick=()=>{const r=validate();status(r.errors.length?r.errors.join(' '):r.warnings.length?r.warnings.join(' '):'Validação concluída: contrato de MAPS consistente.',r.errors.length?'error':'ok');};$('copy').onclick=async()=>{const value=definition();if(!value)return;try{await navigator.clipboard.writeText(value);status('Definição MAPS copiada. Cole em src/scripts/world/12-maps.js.','ok');}catch{status('Área de transferência indisponível.','error');}};
['spawn-x','spawn-y'].forEach(id=>$(id).addEventListener('input',render));document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{state.mode=button.dataset.mode;choose();});
palettes();state.grid=blank(state.w,state.h,state.fill);render();choose();
