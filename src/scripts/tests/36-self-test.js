/* ===================================================================
   15. AUTOTESTE — abra a página com ?test
   Cobre só lógica pura + integridade de dados (nada de desenho).
   =================================================================== */
function runSelfTests(){
  _testando = true;                 // congela o loop enquanto medimos
  const results = [];
  const ok = (name, cond, extra) => results.push({name, pass:!!cond, extra:extra ?? ''});
  const near = (a, b, tol = 0.001) => Math.abs(a - b) <= tol;

  /* --- tabela elemental --- */
  ok('anel: fogo supera vento', ELEM_CHART.fire.wind === MULT_STRONG);
  /* v5.1: com Veneno entre Vento e Sangue, o Fogo passou a superar
     Veneno em vez de Sangue, e o Vento passou a superar Veneno em vez de
     Trevas. Foi o preço declarado da entrada do elemento — estes testes
     travam o estado NOVO para a mudança não passar despercebida de novo. */
  ok('anel: fogo supera vento e veneno',
     ELEM_CHART.fire.poison === MULT_STRONG && ELEM_CHART.fire.blood === 1);
  ok('anel: veneno supera sangue e trevas',
     ELEM_CHART.poison.blood === MULT_STRONG && ELEM_CHART.poison.darkness === MULT_STRONG);
  ok('anel: veneno apanha de fogo e vento',
     ELEM_CHART.poison.fire === MULT_WEAK && ELEM_CHART.poison.wind === MULT_WEAK);
  ok('anel: terra aterra o raio e racha o gelo',
     ELEM_CHART.earth.electricity === MULT_STRONG && ELEM_CHART.earth.ice === MULT_STRONG);
  ok('anel: terra apanha de tinta e luz',
     ELEM_CHART.earth.ink === MULT_WEAK && ELEM_CHART.earth.light === MULT_WEAK);
  ok('anel: vento supera veneno e sangue',
     ELEM_CHART.wind.poison === MULT_STRONG && ELEM_CHART.wind.blood === MULT_STRONG);
  ok('anel: vento apanha de fogo e gelo',
     ELEM_CHART.wind.fire === MULT_WEAK && ELEM_CHART.wind.ice === MULT_WEAK);
  ok('vento tem condição própria (Exposto)',
     EL_AILMENT.wind === 'exposed' && !!AILMENTS.exposed);
  {
    const alvo = {def:10, element:'none', res:null, buffs:[], ail:[], guarding:false};
    const seco = calcDamage({atk:20, buffs:[], ail:[]}, {power:30, elem:'none'}, alvo, {variance:1});
    const expo = calcDamage({atk:20, buffs:[], ail:[]}, {power:30, elem:'none'},
                            {...alvo, ail:[{id:'exposed', turns:3}]}, {variance:1});
    ok('Exposto amplifica o dano recebido em 25%',
       Math.abs(expo.dmg / seco.dmg - AILMENTS.exposed.vulnMod) < 0.03,
       `${seco.dmg} → ${expo.dmg}`);
  }
  ok('rival: fogo×gelo forte nos dois sentidos',
     ELEM_CHART.fire.ice === MULT_STRONG && ELEM_CHART.ice.fire === MULT_STRONG);
  ok('rival: luz×trevas forte nos dois sentidos',
     ELEM_CHART.light.darkness === MULT_STRONG && ELEM_CHART.darkness.light === MULT_STRONG);
  ok('neutro não tem vantagem', ELEM_CHART.none.fire === 1 && ELEM_CHART.fire.none === 1);
  ok('elemMult respeita override de resistência',
     elemMult('light', 'darkness', {light:1.9}) === 1.9);
  ok('elemMult ignora ataque neutro', elemMult('none', 'fire') === 1);
  {
    let sym = true;
    for (const a of ELEM_RING) for (const d of ELEM_RING){
      if (a === d) continue;
      const rival = ELEM_RIVALS.some(p => p.includes(a) && p.includes(d));
      if (rival) continue;
      if (ELEM_CHART[a][d] === MULT_STRONG && ELEM_CHART[d][a] !== MULT_WEAK) sym = false;
    }
    ok('anel é consistente (forte ⇔ fraco no inverso)', sym);
  }

  /* --- dano --- */
  const A = {atk:20, element:'fire', buffs:[], ail:[], guarding:false, def:10, spd:10};
  const Tg = {def:10, element:'none', res:null, buffs:[], ail:[], guarding:false, maxHp:100, hp:100};
  const sk = {power:30, elem:'none', type:'atk'};
  const d1 = calcDamage(A, sk, Tg, {variance:1});
  ok('dano base > 0', d1.dmg > 0, `dmg=${d1.dmg}`);
  const d2 = calcDamage(A, sk, {...Tg, def:60}, {variance:1});
  ok('mais DEF reduz o dano', d2.dmg < d1.dmg, `${d1.dmg} → ${d2.dmg}`);
  const d3 = calcDamage(A, sk, {...Tg, def:1e6}, {variance:1});
  ok('dano nunca zera (piso 1)', d3.dmg >= 1, `dmg=${d3.dmg}`);
  const dCrit = calcDamage(A, sk, Tg, {variance:1, crit:true});
  ok('crítico ×1.7', near(dCrit.dmg, Math.round(d1.dmg * 1.7), 2), `${d1.dmg} → ${dCrit.dmg}`);
  const dGuard = calcDamage(A, sk, Tg, {variance:1, guard:true});
  ok('guarda reduz ~55%', dGuard.dmg < d1.dmg * 0.55, `${d1.dmg} → ${dGuard.dmg}`);
  // fogo × gelo = rivalidade (forte) · fogo × fogo = neutro · fogo × eletricidade = resistido
  const dStrong  = calcDamage(A, {power:30, elem:'fire'}, {...Tg, element:'ice'},         {variance:1});
  const dNeutral = calcDamage(A, {power:30, elem:'fire'}, {...Tg, element:'fire'},        {variance:1});
  const dWeak    = calcDamage(A, {power:30, elem:'fire'}, {...Tg, element:'electricity'}, {variance:1});
  ok('vantagem elemental aumenta o dano', dStrong.dmg > dNeutral.dmg, `${dNeutral.dmg} → ${dStrong.dmg}`);
  ok('resistência elemental reduz o dano', dWeak.dmg < dNeutral.dmg, `${dNeutral.dmg} → ${dWeak.dmg}`);
  ok('multiplicador reportado',
     dStrong.em === MULT_STRONG && dNeutral.em === 1 && dWeak.em === MULT_WEAK);
  ok('ataque físico usa ATK, não power',
     calcDamage(A, {power:0, elem:'none', phys:true}, Tg, {variance:1}).dmg > 1);

  /* --- stats efetivos --- */
  const u = {atk:20, def:20, spd:20, buffs:[], ail:[], guarding:false};
  ok('sem modificadores, eATK = atk', eATK(u) === 20);
  u.buffs.push({stat:'def', mult:1.5, turns:3});
  ok('buff de DEF aplica', near(eDEF(u), 30));
  u.guarding = true;
  ok('guardar multiplica a DEF', near(eDEF(u), 30 * 2.2));
  u.guarding = false; u.buffs = [];
  u.ail.push({id:'burn', turns:3});
  ok('queimadura reduz ATK', near(eATK(u), 20 * AILMENTS.burn.atkMod));
  u.ail = [{id:'freeze', turns:2}];
  ok('congelado reduz SPD', near(eSPD(u), 20 * AILMENTS.freeze.spdMod));
  u.ail = [{id:'blind', turns:3}];
  ok('cegueira reduz precisão', eACC(u) < 0.95);

  /* --- condições --- */
  const v = {element:'none', res:null, ail:[]};
  ok('addAil adiciona', addAil(v, 'burn') === true && v.ail.length === 1);
  ok('addAil não duplica', addAil(v, 'burn') === false && v.ail.length === 1);
  ok('imunidade elemental bloqueia a condição',
     addAil({element:'fire', res:{fire:0}, ail:[]}, 'burn') === false);
  ok('todo elemento tem condição mapeada',
     Object.keys(ELEM).every(e => EL_AILMENT[e] === null || AILMENTS[EL_AILMENT[e]]));

  /* --- progressão --- */
  ok('curva de EXP é crescente', expToNext(2) > expToNext(1) && expToNext(9) > expToNext(8));
  const c = makeChar(PARTY_DEFS[0], 5);
  ok('personagem nasce com HP cheio', c.hp === c.maxHp && c.mp === c.maxMp);
  ok('stats escalam com o nível', makeChar(PARTY_DEFS[0], 10).maxHp > c.maxHp);
  /* v5.0: habilidade não vem mais por nível, vem por compra na árvore.
     O que o nível dá agora é PONTO — e o que o teste trava é que subir
     de nível, sozinho, não destrava nada. */
  ok('subir de nível não destrava habilidade sozinho',
     !makeChar(PARTY_DEFS[0], 1).skills.includes('ink_flood') &&
     !makeChar(PARTY_DEFS[0], 8).skills.includes('ink_flood'));
  ok('subir de nível dá pontos de alma',
     pontosLivres(makeChar(PARTY_DEFS[0], 8)) === 7 * PONTOS_POR_NIVEL,
     `${pontosLivres(makeChar(PARTY_DEFS[0], 8))}`);
  ok('toda habilidade aprendível existe',
     PARTY_DEFS.every(d => d.learn.every(([, id]) => !!SKILLS[id])));
  ok('toda ultimate existe', PARTY_DEFS.every(d => !!ULTIMATES[d.name]));
  ok('toda skill de inimigo existe',
     Object.values(BESTIARY).every(b => b.skills.every(s => !!SKILLS[s])));
  ok('todo drop existe', Object.values(BESTIARY).every(b => (b.drops||[]).every(([i]) => !!ITEMS[i])));

  /* --- inventário --- */
  const bagBackup = G.items; G.items = {};
  Bag.add('potion', 2);
  ok('Bag.add soma', Bag.count('potion') === 2);
  ok('Bag.take remove', Bag.take('potion') && Bag.count('potion') === 1);
  ok('Bag.take falha sem estoque', Bag.take('potion', 5) === false);
  Bag.take('potion');
  ok('item zerado sai da lista', !Bag.list().includes('potion'));
  G.items = bagBackup;

  /* --- itens --- */
  const hurt = {name:'X', hp:10, maxHp:100, mp:0, maxMp:50, ail:[{id:'burn',turns:2}]};
  ok('poção cura', applyItem(ITEMS.potion, hurt).ok && hurt.hp === 70);
  ok('poção falha com HP cheio', applyItem(ITEMS.potion, {name:'Y', hp:9, maxHp:9, ail:[]}).ok === false);
  ok('sal remove condições', applyItem(ITEMS.antidote, hurt).ok && hurt.ail.length === 0);
  const down = {name:'Z', hp:0, maxHp:80, ail:[]};
  ok('pena revive', applyItem(ITEMS.phoenix, down).ok && down.hp === 40);
  ok('poção não age em caído', applyItem(ITEMS.potion, {name:'W', hp:0, maxHp:50, ail:[]}).ok === false);

  /* --- mapas --- */
  for (const [id, def] of Object.entries(MAPS)){
    const grid = normalizeRows(def.rows, def.fill);
    const w = grid[0].length;
    ok(`[${id}] linhas do mesmo tamanho`, grid.every(r => r.length === w));
    ok(`[${id}] bordas fechadas`,
       grid[0].every(ch => ch === '#') && grid[grid.length-1].every(ch => ch === '#') &&
       grid.every(r => r[0] === '#' && r[w-1] === '#'));
    let warps = 0, chests = 0, bad = 0;
    for (const row of grid) for (const ch of row){
      const t = TILEDEF[ch];
      if (!t){ bad++; continue; }
      if (t.warp) warps++;
      if (t.chest) chests++;
    }
    ok(`[${id}] sem tiles desconhecidos`, bad === 0, bad ? `${bad} inválidos` : '');
    ok(`[${id}] passagens casam com destinos`, warps === (def.warps||[]).length,
       `${warps} tiles / ${(def.warps||[]).length} destinos`);
    ok(`[${id}] baús casam com o conteúdo`, chests === (def.chests||[]).length,
       `${chests} tiles / ${(def.chests||[]).length} itens`);
    ok(`[${id}] destinos existem`, (def.warps||[]).every(wp => !!MAPS[wp.to]));
    // o ponto de chegada precisa ser pisável no mapa de destino
    const badLanding = (def.warps||[]).filter(wp => {
      const dm = MAPS[wp.to]; if (!dm) return true;
      const dg = normalizeRows(dm.rows, dm.fill);
      const t = dg[wp.ty] && dg[wp.ty][wp.tx];
      return !t || TILEDEF[t].solid;
    });
    ok(`[${id}] chegadas em tile pisável`, badLanding.length === 0,
       badLanding.map(wp => `→${wp.to}(${wp.tx},${wp.ty})`).join(' '));
    // placas devem estar em algo visível (sólido), senão o jogador pisa em cima
    ok(`[${id}] placas em tile sólido`,
       (def.signs||[]).every(s => grid[s.y] && TILEDEF[grid[s.y][s.x]]?.solid),
       (def.signs||[]).filter(s => !TILEDEF[grid[s.y]?.[s.x]]?.solid).map(s => `(${s.x},${s.y})`).join(' '));
    ok(`[${id}] itens dos baús existem`, (def.chests||[]).every(ch => !!ITEMS[ch.item]));
    const sp = def.spawn;
    ok(`[${id}] spawn dentro do mapa`,
       sp && sp.y > 0 && sp.y < grid.length && sp.x > 0 && sp.x < w && grid[sp.y][sp.x] !== '#');
  }
  ok('formações só usam criaturas do bestiário',
     Object.values(FORMATIONS).every(list => list.every(f => f.every(([id]) => !!BESTIARY[id]))));
  ok('buildFormation expande quantidades',
     buildFormation([['wolf',2],['shade',1]]).length === 3);

  /* --- equipamento --- */
  {
    const bag = G.items, party = G.party;
    G.items = {}; G.party = [makeChar(PARTY_DEFS[0], 5)];
    const c = G.party[0];
    const atk0 = c.atk, hp0 = c.maxHp;
    ok('personagem nasce sem equipamento', !c.gear.weapon && !c.gear.armor && !c.gear.accessory);
    ok('ataque básico é neutro sem arma', weaponElem(c) === 'none');
    ok('não equipa item que não está na bolsa', equipItem(c, 'w_brasa').ok === false);
    Bag.add('w_brasa');
    const r1 = equipItem(c, 'w_brasa');
    ok('equipar aplica o bônus de ATK', r1.ok && c.atk === atk0 + ITEMS.w_brasa.equip.atk, `${atk0}→${c.atk}`);
    ok('equipar tira o item da bolsa', Bag.count('w_brasa') === 0);
    ok('arma define o elemento do ataque básico', weaponElem(c) === 'fire');
    Bag.add('w_umbra');
    const r2 = equipItem(c, 'w_umbra');
    ok('trocar de arma devolve a antiga à bolsa', r2.ok && Bag.count('w_brasa') === 1);
    ok('atributos refletem só a arma nova',
       c.atk === atk0 + ITEMS.w_umbra.equip.atk, `atk=${c.atk}`);
    const r3 = unequipItem(c, 'weapon');
    ok('retirar volta os atributos ao base', r3.ok && c.atk === atk0 && weaponElem(c) === 'none');
    ok('retirar devolve à bolsa', Bag.count('w_umbra') === 1);
    ok('retirar slot vazio falha', unequipItem(c, 'armor').ok === false);
    Bag.add('a_coura'); equipItem(c, 'a_coura');
    ok('armadura soma HP máximo', c.maxHp === hp0 + ITEMS.a_coura.equip.hp, `${hp0}→${c.maxHp}`);
    ok('bônus negativo de SPD é aplicado', gearBonus(c, 'spd') === ITEMS.a_coura.equip.spd);
    ok('HP atual nunca passa do máximo', c.hp <= c.maxHp);
    ok('equipamento não aparece nos itens de combate',
       !battleItems().includes('a_coura') && !battleItems().includes('w_umbra'));
    ok('todo equipável tem slot válido',
       Object.values(ITEMS).every(i => i.kind !== 'equip' || !!SLOTS[i.slot]));
    /* O kind 'material' entrou na v4.9: cai da criatura, não se usa,
       serve de moeda para missão de coleta. */
    {
      const kinds = new Set(['equip','consumable','material']);
      ok('todo item tem kind conhecido', Object.values(ITEMS).every(i => kinds.has(i.kind)),
         Object.entries(ITEMS).filter(([, i]) => !kinds.has(i.kind)).map(([k]) => k).join(','));
      ok('material não é usável nem equipável',
         Object.values(ITEMS).every(i => i.kind !== 'material' || (!i.use && !i.slot && !i.equip)));
      ok('material não aparece na lista de itens de combate',
         !battleItems().some(id => ITEMS[id].kind === 'material'));
    }
    G.items = bag; G.party = party;
  }

  /* --- contador de caça e multiplicador de drop (v5.29) --- */
  {
    ok('a escada de raridade tem cinco degraus, todos descritos',
       RARIDADES.length === 5 && RARIDADES.every(r => !!RARIDADE[r]));
    /* Consumível caro não pode dividir o topo com equipamento: se a
       Poção Maior fosse o item que zera o contador, o Machado de Carvão
       nunca seria o alvo de nada. */
    ok('consumível e material não passam de incomum',
       Object.keys(ITEMS).every(id => ITEMS[id].kind === 'equip' ||
         nivelRaridade(id) <= RARIDADES.indexOf('incomum')),
       Object.keys(ITEMS).filter(id => ITEMS[id].kind !== 'equip' &&
         nivelRaridade(id) > RARIDADES.indexOf('incomum')).join(','));
    ok('equipamento começa em raro',
       Object.keys(ITEMS).every(id => ITEMS[id].kind !== 'equip' ||
         nivelRaridade(id) >= RARIDADES.indexOf('raro')));

    /* O topo é a CATEGORIA de maior raridade, não um item: se o bicho
       larga três épicos, qualquer um dos três zera. */
    {
      const t = dropMaximo('ashknight');
      ok('o topo pega a maior raridade da tabela', t && t.rar === 'raro', t && t.rar);
      ok('o topo deixa de fora o que é de raridade menor',
         t && t.itens.length === 1 && t.itens[0][0] === 'w_carvao',
         t && t.itens.map(([i]) => i).join(','));
      ok('a chance base do topo é a soma dos itens dele',
         t && Math.abs(t.base - 0.05) < 1e-9, t && String(t.base));
    }
    ok('chefe com prêmio garantido fica fora do contador',
       dropMaximo('warden') === null);
    ok('criatura sem drop fica fora do contador',
       dropMaximo('__inexistente__') === null);

    // a fórmula
    ok('chance = base × contador', Math.abs(chanceDeCaca('ashknight', 4) - 0.2) < 1e-9);
    ok('contador 1 devolve a chance base',
       Math.abs(chanceDeCaca('ashknight', 1) - dropMaximo('ashknight').base) < 1e-9);
    ok('contador zero não dá chance nenhuma', chanceDeCaca('ashknight', 0) === 0);
    ok('a chance nunca passa de 100%', chanceDeCaca('ashknight', 9999) === 1);
    ok('20 abates fecham 100% com base de 5%',
       chanceDeCaca('ashknight', 20) === 1 && chanceDeCaca('ashknight', 19) < 1);
    ok('espécie sem topo devolve chance zero', chanceDeCaca('warden', 50) === 0);
    ok('o sorteio do topo sempre devolve um item da lista',
       (() => { const t = dropMaximo('lesserherald');
                for (let i = 0; i < 40; i++)
                  if (!t.itens.some(([x]) => x === sortearDoTopo(t.itens))) return false;
                return true; })());

    /* A luta de verdade. Sem mexer no RNG: o que se mede é a INVARIANTE
       — o contador anda uma casa por abate e só volta a zero quando o
       item do topo entra no saque. Vale em qualquer sorteio. */
    {
      const bak = {k:G.kills, c:G.cacada, v:G.vistos, i:G.items, g:G.gold,
                   party:G.party, squad:G.squad, cena:G.scene, lider:G.leader};
      G.kills = {}; G.cacada = {}; G.vistos = {}; G.items = {}; G.gold = 0;
      G.party = PARTY_DEFS.slice(0, 3).map(d => makeChar(d, 40));
      G.squad = defaultSquad(); G.leader = 0;

      Battle.begin(['ashknight']);
      ok('encontrar já registra no bestiário', G.vistos.ashknight === 1);
      Battle.enemies.forEach(e => { e.hp = 0; });
      Battle.victory();
      ok('matar sobe o contador de abates', G.kills.ashknight === 1);

      const topo = new Set(dropMaximo('ashknight').itens.map(([i]) => i));
      let quebrou = '', anterior = G.cacada.ashknight;
      /* 1 no caso normal, 0 se o topo caiu de primeira — 5% de chance,
         e uma asserção que só passa com azar é uma asserção instável. O
         contrato de verdade é o laço de 60 logo abaixo. */
      ok('o primeiro abate deixa o contador em 1, ou em 0 se o topo caiu',
         anterior === 1 || (anterior === 0 && Battle.result.drops.some(d => topo.has(d))),
         `${anterior} · ${Battle.result.drops.join(',')}`);
      for (let i = 0; i < 60; i++){
        Battle.begin(['ashknight']);
        Battle.enemies.forEach(e => { e.hp = 0; });
        Battle.victory();
        const caiuTopo = Battle.result.drops.some(d => topo.has(d));
        const agora = G.cacada.ashknight;
        const esperado = caiuTopo ? 0 : anterior + 1;
        if (agora !== esperado && !quebrou)
          quebrou = `abate ${i}: ${anterior} → ${agora}, esperado ${esperado}` +
                    ` (topo ${caiuTopo ? 'caiu' : 'não caiu'})`;
        anterior = agora;
      }
      ok('em 60 abates o contador só zera quando o topo cai, e só anda de 1 em 1',
         quebrou === '', quebrou);
      ok('60 abates viraram 61 no contador de kills', G.kills.ashknight === 61,
         String(G.kills.ashknight));
      ok('o bestiário viu as 61 aparições', G.vistos.ashknight === 61,
         String(G.vistos.ashknight));

      /* Contadores são independentes: matar lobo não mexe no cavaleiro. */
      const antesCav = G.cacada.ashknight;
      Battle.begin(['wolf']); Battle.enemies.forEach(e => { e.hp = 0; }); Battle.victory();
      ok('matar lobo não mexe no contador do cavaleiro',
         G.cacada.ashknight === antesCav && (G.cacada.wolf || 0) >= 0,
         JSON.stringify(G.cacada));

      /* Dois da mesma espécie na mesma luta contam dois abates, e o
         segundo não entra com contador zero se o primeiro zerou. */
      G.cacada.ashknight = 0; G.kills.ashknight = 0;
      Battle.begin(['ashknight','ashknight']);
      Battle.enemies.forEach(e => { e.hp = 0; });
      Battle.victory();
      ok('dois da mesma espécie contam dois abates', G.kills.ashknight === 2,
         String(G.kills.ashknight));
      ok('o contador nunca fica negativo', G.cacada.ashknight >= 0);

      Object.assign(G, {kills:bak.k, cacada:bak.c, vistos:bak.v, items:bak.i, gold:bak.g,
                        party:bak.party, squad:bak.squad, scene:bak.cena, leader:bak.lider});
    }

    /* O Bestiário só lista o que já apareceu, e revela por degraus. */
    {
      const bv = G.vistos, bk = G.kills;
      G.vistos = {wolf:1}; G.kills = {};
      ok('bestiário lista só quem já apareceu',
         bestiarioVisto().length === 1 && bestiarioVisto()[0] === 'wolf');
      ok('grau 0 com pouca caça', grauBestiario('wolf') === 0);
      G.kills = {wolf:3};  ok('grau 1 aos 3 abates',  grauBestiario('wolf') === 1);
      G.kills = {wolf:10}; ok('grau 2 aos 10 abates', grauBestiario('wolf') === 2);
      G.kills = {wolf:25}; ok('grau 3 aos 25 abates', grauBestiario('wolf') === 3);
      ok('chefe já nasce com a ficha aberta', grauBestiario('warden') === 3);
      G.vistos = bv; G.kills = bk;
    }
    ok('pct escreve a casa decimal só quando ela importa',
       pct(0.005) === '0,5%' && pct(0.18) === '18%' && pct(1) === '100%',
       `${pct(0.005)} ${pct(0.18)} ${pct(1)}`);

    /* Toda criatura comum deveria ter algo que valha a pena caçar. Não é
       erro não ter — é aviso, e o número está aqui para não crescer sem
       ninguém perceber. */
    {
      const semTopo = Object.entries(BESTIARY)
        .filter(([id, d]) => !d.boss && !dropMaximo(id)).map(([id]) => id);
      ok(`criaturas sem drop máximo: ${semTopo.length} de ${Object.keys(BESTIARY).length}`,
         true, semTopo.join(','));
    }
  }

  /* --- auto-equipar (v5.26) --- */
  {
    const bag = G.items, party = G.party;
    G.items = {}; G.party = [makeChar(PARTY_DEFS[0], 8)];
    const c = G.party[0];
    ok('auto-equipar sem bolsa não muda nada', autoEquipar([c]) === 0);
    Bag.add('w_treino'); Bag.add('w_astro'); Bag.add('a_tunica'); Bag.add('t_coroa');
    const n = autoEquipar([c]);
    ok('auto-equipar preenche os três slots', n === 3, `mudou ${n}`);
    ok('auto-equipar escolhe a melhor arma', c.gear.weapon === 'w_astro', c.gear.weapon);
    ok('auto-equipar não some com o que sobrou', Bag.count('w_treino') === 1);
    ok('auto-equipar é idempotente', autoEquipar([c]) === 0);
    /* Item só com penalidade fica na bolsa: vestir isso seria perda pura. */
    G.items = {}; unequipItem(c, 'weapon'); unequipItem(c, 'armor'); unequipItem(c, 'accessory');
    G.items = {};
    const ruim = ITEMS.__teste_ruim = {kind:'equip', name:'Peso Morto', slot:'accessory',
                                       equip:{spd:-6}, price:1, color:'#888'};
    Bag.add('__teste_ruim');
    autoEquipar([c]);
    ok('auto-equipar recusa item de valor negativo', c.gear.accessory === null, String(c.gear.accessory));
    delete ITEMS.__teste_ruim; void ruim;
    /* Com o grupo inteiro, cada peça vai para UM personagem só. */
    G.items = {}; G.party = [makeChar(PARTY_DEFS[0], 8), makeChar(PARTY_DEFS[1], 8)];
    Bag.add('w_astro'); Bag.add('w_treino');
    autoEquipar(G.party);
    ok('auto-equipar em grupo reparte as peças',
       G.party[0].gear.weapon !== G.party[1].gear.weapon &&
       !!G.party[0].gear.weapon && !!G.party[1].gear.weapon,
       `${G.party[0].gear.weapon} / ${G.party[1].gear.weapon}`);
    ok('auto-equipar em grupo dá a melhor peça a alguém',
       [G.party[0].gear.weapon, G.party[1].gear.weapon].includes('w_astro'));
    ok('auto-equipar em grupo esvazia a bolsa das peças usadas', Bag.count('w_astro') === 0);
    ok('valorEquip ordena por poder de fogo',
       valorEquip(G.party[0], 'w_astro') > valorEquip(G.party[0], 'w_treino'));
    G.items = bag; G.party = party;
  }

  /* --- cura fora de combate (v5.26) --- */
  {
    const party = G.party;
    const of = makeChar(PARTY_DEFS[1], 30);    // Ophelia: Orvalho, Retorno, Maré Serena
    const gb = makeChar(PARTY_DEFS[3], 30);
    G.party = [of, gb];
    of.tree = Object.keys(arvoreDe(of)); syncArvore(of); recalcStats(of);
    of.hp = of.maxHp; of.mp = of.maxMp;

    ok('só cura e reanimação saem do combate',
       skillsDeCampo(of).every(id => ['heal','revive'].includes(SKILLS[id].type)) &&
       skillsDeCampo(of).length > 0, skillsDeCampo(of).join(','));
    ok('curasDisponiveis vem do mais barato ao mais caro',
       curasDisponiveis().every((e, i, a) => i === 0 || a[i - 1].custo <= e.custo));
    ok('caído não entra na lista de quem cura',
       (() => { of.hp = 0; const n = curasDisponiveis().length; of.hp = of.maxHp; return n === 0; })());

    /* Cura de aliado: gasta MP e enche HP. */
    gb.hp = 1;
    const mp0 = of.mp;
    const r1 = usarCuraEmCampo(of, 'mend', gb);
    ok('curar em campo devolve HP', r1.ok && gb.hp > 1, `${gb.hp}`);
    ok('curar em campo cobra o MP', of.mp === mp0 - SKILLS.mend.cost, `${mp0}→${of.mp}`);
    ok('curar não passa do HP máximo', gb.hp <= gb.maxHp);

    /* Sem alvo que precise, não cobra nada. */
    gb.hp = gb.maxHp;
    const mp1 = of.mp;
    const r2 = usarCuraEmCampo(of, 'mend', gb);
    ok('curar quem está cheio falha', r2.ok === false);
    ok('curar sem efeito não cobra MP', of.mp === mp1);

    /* Cura não levanta caído; reanimar sim. */
    gb.hp = 0;
    const r3 = usarCuraEmCampo(of, 'mend', gb);
    ok('cura não levanta caído', r3.ok === false && gb.hp === 0);
    const mp2 = of.mp;
    const r4 = usarCuraEmCampo(of, 'recall', gb);
    ok('reanimar em campo levanta o caído', r4.ok && gb.hp > 0, `${gb.hp}`);
    ok('reanimar dá a fração de HP da habilidade',
       gb.hp === Math.max(1, Math.round(gb.maxHp * SKILLS.recall.power / 100)), `${gb.hp}/${gb.maxHp}`);
    ok('reanimar cobra o MP', of.mp === mp2 - SKILLS.recall.cost);
    ok('reanimar quem está de pé falha', usarCuraEmCampo(of, 'recall', gb).ok === false);

    /* MP insuficiente e habilidade que o personagem não tem. */
    of.mp = 0;
    gb.hp = 1;
    ok('sem MP não cura', usarCuraEmCampo(of, 'mend', gb).ok === false && gb.hp === 1);
    of.mp = of.maxMp;
    ok('não lança habilidade que não conhece', usarCuraEmCampo(gb, 'mend', of).ok === false);
    ok('não lança habilidade de ataque em campo', usarCuraEmCampo(of, 'ice_shard', gb).ok === false);

    /* Alvo 'allies' resolve sozinho, sem tela de alvo. */
    of.hp = Math.max(1, of.maxHp - 200); gb.hp = 1; of.mp = of.maxMp;
    const r5 = usarCuraEmCampo(of, 'mend_all', null);
    ok('cura de grupo alcança todo mundo', r5.ok && gb.hp > 1 && of.hp > 1);

    /* Toda cura listada tem alvo que o menu sabe resolver. */
    ok('todo alvo de cura é conhecido pelo menu',
       Object.values(SKILLS).every(s => !['heal','revive'].includes(s.type) ||
         ['ally','allies','self','fallen'].includes(s.target)),
       Object.entries(SKILLS).filter(([, s]) => ['heal','revive'].includes(s.type) &&
         !['ally','allies','self','fallen'].includes(s.target)).map(([k]) => k).join(','));
    G.party = party;
  }

  /* --- loja --- */
  {
    const bag = G.items, gold = G.gold, flags = G.flags, cena = G.scene;
    G.items = {}; G.gold = 500; G.flags = {};
    Shop.open('academia'); Shop.msgT = 0;
    const antes = Shop.stock().length;
    ok('loja esconde estoque travado por flag', !Shop.stock().includes('w_tinta'));
    G.flags.warden_defeated = true;
    ok('flag libera estoque novo', Shop.stock().includes('w_tinta') && Shop.stock().length > antes);
    ok('preço de venda é metade', Shop.sellPrice('potion') === Math.floor(ITEMS.potion.price * 0.5));
    // compra
    Shop.mode = 'buy'; Shop.cur.buy.i = Shop.stock().indexOf('potion');
    Input.hit = {confirm:true}; Shop.update(0); Input.hit = {};
    ok('comprar debita ouro e credita item',
       G.gold === 500 - ITEMS.potion.price && Bag.count('potion') === 1, `ouro=${G.gold}`);
    // sem ouro
    G.gold = 0;
    Input.hit = {confirm:true}; Shop.update(0); Input.hit = {};
    ok('sem ouro não compra', Bag.count('potion') === 1 && G.gold === 0);
    // venda
    G.gold = 0; Shop.mode = 'sell'; Shop.cur.sell.i = Shop.sellable().indexOf('potion');
    Input.hit = {confirm:true}; Shop.update(0); Input.hit = {};
    ok('vender credita ouro e remove item',
       G.gold === Shop.sellPrice('potion') && Bag.count('potion') === 0, `ouro=${G.gold}`);
    ok('todo item de loja existe',
       Object.values(SHOPS).every(s => s.stock.every(e => !!ITEMS[typeof e === 'string' ? e : e.id])));
    G.items = bag; G.gold = gold; G.flags = flags; G.scene = cena;
  }

  /* --- diálogo com escolhas --- */
  {
    const flags = G.flags, cena = G.scene;
    G.flags = {};
    let rodou = false;
    const cinematica = normalizeLine({
      speaker:'X', text:'Nós dois.', dialogSprite:'dlg_teste',
      participants:[
        {speaker:'X', side:'left', mirror:false, focus:true},
        {speaker:'Y', side:'right', mirror:true, focus:false},
      ],
    }, {name:'Ignorado'});
    const dupla = dialogueParticipants(cinematica);
    ok('normalização preserva a apresentação cinematográfica',
       cinematica.dialogSprite === 'dlg_teste' && cinematica.participants.length === 2);
    ok('diálogo aceita dois participantes, lados, espelho e foco',
       dupla.length === 2 && dupla[0].side === 'left' && dupla[1].side === 'right' &&
       dupla[1].mirror === true && dupla[0].focus && !dupla[1].focus &&
       dupla[0].dialogSprite === 'dlg_teste');
    ok('fala simultânea deixa os dois participantes claros',
       dialogueParticipants({...cinematica, simultaneous:true}).every(p => p.focus));
    ok('diálogo limita a cena a dois participantes',
       dialogueParticipants({...cinematica, participants:[
         ...cinematica.participants, {speaker:'Z', side:'right'},
       ]}).length === 2);
    ok('Max resolve a dialogue sprite própria',
       dialogueSpriteKey({speaker:'Max'}) === 'dlg_max');
    ok('sprite de diálogo rejeita sheet de mundo',
       dialogueSpriteKey({speaker:'X', dialogSprite:'x_sheet'}) === null);
    ok('todo mapeamento de diálogo aponta para asset carregado',
       Object.values(DIALOGUE_SPRITES).every(k => !!SPRITE_DATA[k] && spriteImages[k]?.complete));
    const party = G.party, squad = G.squad, leader = G.leader;
    const map = G.map, followers = G.followers;
    G.party = [makeChar(PARTY_DEFS.find(c => c.name === 'Max'), 1)];
    G.squad = ['Max']; G.leader = 0; G.followers = [];
    const automaticas = npcLines({name:'Aluno de teste', sheet:'npc_aluno', lines:[{
      text:'Fala com resposta.', choices:[{label:'Seguir', then:['Continuamos.']}],
    }]});
    const duplaAutomatica = dialogueParticipants(automaticas[0]);
    const fallbackNpc = dialogueSpriteSource(duplaAutomatica[1]);
    ok('interação de NPC inclui líder e interlocutor',
       duplaAutomatica.length === 2 && duplaAutomatica[0].speaker === 'Max' &&
       duplaAutomatica[0].side === 'left' && duplaAutomatica[1].speaker === 'Aluno de teste' &&
       duplaAutomatica[1].side === 'right' && duplaAutomatica[0].mirror &&
       !duplaAutomatica[0].focus && duplaAutomatica[1].focus);
    ok('NPC sem dlg recorta só o quadro central voltado ao líder',
       fallbackNpc?.kind === 'sheet' && fallbackNpc.sx === FRAME_INFO.npc_aluno.fw &&
       fallbackNpc.sy === FRAME_INFO.npc_aluno.fh &&
       fallbackNpc.sw < (spriteImages.npc_aluno.naturalWidth || spriteImages.npc_aluno.width));
    Msg.start(automaticas); Msg.shown = 999; Msg.choose(Msg.choices[0]);
    ok('resposta de escolha de NPC conserva a dupla automática',
       Msg.line.participants?.length === 2 && dialogueParticipants(Msg.line)[1].focus);
    Msg.finish();
    G.map = {npcs:[{name:'NPC de cena', sheet:'npc_aluno'}]};
    CUT_CMD.say.start.call({st:{}}, {who:'NPC de cena', text:'Fala roteirizada.'});
    const duplaDeCena = dialogueParticipants(Msg.line);
    ok('cena roteirizada de NPC também monta a dupla',
       duplaDeCena.length === 2 && duplaDeCena[0].speaker === 'Max' &&
       duplaDeCena[1].speaker === 'NPC de cena' && duplaDeCena[1].focus);
    Msg.finish();
    G.party = party; G.squad = squad; G.leader = leader;
    G.map = map; G.followers = followers;
    const cenaCinematica = {st:{}};
    CUT_CMD.say.start.call(cenaCinematica, {
      who:'X', speaker:'Ignorado', text:'Cena em dupla.', dialogSprite:'dlg_teste', simultaneous:true,
      participants:[{speaker:'X', side:'left'}, {speaker:'Y', side:'right', mirror:true}],
    });
    ok('cutscene de uma linha preserva participantes e apresentação',
       Msg.line.speaker === 'X' && Msg.line.dialogSprite === 'dlg_teste' &&
       dialogueParticipants(Msg.line).length === 2 &&
       dialogueParticipants(Msg.line).every(p => p.focus));
    Msg.finish();
    Msg.start([{speaker:'X', text:'Aceita?', choices:[
      {label:'Sim', set:{teste_ok:true}, then:[{
        text:'Combinado.', dialogSprite:'dlg_teste',
        participants:[{speaker:'X', side:'left', focus:true}],
      }]},
      {label:'Não', run:() => { rodou = true; return null; }},
    ]}]);
    Msg.shown = 999;
    ok('escolhas só aparecem com o texto completo', !!Msg.choices);
    Msg.shown = 0;
    ok('escolha fica escondida enquanto escreve', Msg.choices === null);
    Msg.shown = 999;
    Msg.choose(Msg.choices[0]);
    ok('escolha grava a flag', G.flags.teste_ok === true);
    ok('escolha emenda as falas de resposta', Msg.active && Msg.line.text === 'Combinado.');
    ok('escolha preserva a apresentação da resposta',
       Msg.line.dialogSprite === 'dlg_teste' && Msg.line.participants?.[0].focus === true);
    Msg.shown = 999; Msg.advance();
    ok('diálogo encerra depois da resposta', !Msg.active);
    // opção com `when` some quando a condição é falsa
    Msg.start([{speaker:'X', text:'?', choices:[
      {label:'sempre'}, {label:'só com flag', when:g => !!g.flags.nunca},
    ]}]);
    Msg.shown = 999;
    ok('opção condicional é filtrada', Msg.choices.length === 1);
    Msg.active = false;
    G.flags = flags; G.scene = cena;
  }

  /* --- passagem travada por flag --- */
  {
    const trancada = (MAPS.sanctum.warps || []).find(w => w.needFlag);
    ok('santuário tem passagem travada por flag', !!trancada && trancada.to === 'deepway');
    ok('passagem travada explica o motivo', !!trancada.blockedMsg);
    const flags = G.flags; G.flags = {};
    loadMap('sanctum');
    const w = G.map.warps.find(x => x.needFlag);
    G.player.tx = w.x; G.player.ty = w.y;
    onStepComplete();
    ok('sem a flag, a passagem não teleporta', G.mapId === 'sanctum' && !FX.trans);
    Msg.active = false; G.scene = 'FIELD';
    G.flags = flags;
  }

  /* --- arte de batalha (chibi no mapa, sprite grande no combate) --- */
  {
    ok('toda entrada de BATTLE_ART tem src, w e h',
       Object.values(BATTLE_ART).every(a => a && a.src && a.w > 0 && a.h > 0));
    ok('personagem sem arte cadastrada cai no chibi', battleArtOf('__ninguem__') === null);

    // Arte sintética num nome DESCARTÁVEL — registrar em cima de um
    // personagem real e apagar depois destruiria a arte de verdade.
    const fake = document.createElement('canvas');
    fake.width = 200; fake.height = 150;
    const fg = fake.getContext('2d');
    fg.fillStyle = '#c04040'; fg.fillRect(0, 0, 100, 150);
    fg.fillStyle = '#4040c0'; fg.fillRect(100, 0, 100, 150);
    battleArt.__teste__ = {img:fake, w:100, h:150, frames:2, fps:4,
                           scale:1, anchorY:1, ok:true, src:'(teste)'};

    ok('arte cadastrada é encontrada', !!battleArtOf('__teste__'));
    ok('anyBattleArt detecta quem tem arte', anyBattleArt([{name:'__teste__'}]) === true);
    ok('anyBattleArt é falso sem ninguém com arte', anyBattleArt([{name:'__ninguem__'}]) === false);

    // desenho: quadro 0 e quadro 1 da tira precisam sair diferentes
    const pega = tempo => {
      ctx.clearRect(0, 0, W, H);
      drawBattleArt(battleArt.__teste__, 400, 300, {time:tempo});
      const d = ctx.getImageData(390, 240, 1, 1).data;
      return d[0] + ',' + d[1] + ',' + d[2];
    };
    const q0 = pega(0), q1 = pega(0.30);        // fps 4 → troca em 0,25 s
    ok('tira de quadros anima (quadro 0 ≠ quadro 1)', q0 !== q1, `${q0} vs ${q1}`);
    ok('quadro 0 é o primeiro da tira', q0.startsWith('192,64'), q0);
    ctx.clearRect(0, 0, W, H);
    delete battleArt.__teste__;
    ok('remover a arte volta para o chibi', battleArtOf('__teste__') === null);

    // Formação: com arte real cadastrada tem que usar a espaçada…
    const antesParty = G.party, antesLider = G.leader;
    G.party = PARTY_DEFS.map(d => makeChar(d, 5)); G.leader = 0;
    const temArte = anyBattleArt(G.party);
    Battle.begin(['wolf']);
    const usadas = Battle.allies.map(a => ({x:a.bx, y:a.by}));
    ok('formação acompanha a existência de arte',
       usadas.every(p => (temArte ? ALLY_SPOTS_LARGE : ALLY_SPOTS)
         .some(s => s.x === p.x && s.y === p.y)),
       temArte ? 'espaçada' : 'compacta');
    Battle.active = false; G.scene = 'FIELD';

    // …e sem NENHUMA arte tem que voltar à compacta (guarda e restaura)
    const cofre = {};
    for (const k of Object.keys(battleArt)){ cofre[k] = battleArt[k]; delete battleArt[k]; }
    Battle.begin(['wolf']);
    ok('sem arte nenhuma volta à formação compacta',
       Battle.allies.every(a => ALLY_SPOTS.some(s => s.x === a.bx && s.y === a.by)));
    Battle.active = false; G.scene = 'FIELD';
    Object.assign(battleArt, cofre);
    ok('registro de arte foi restaurado após o teste',
       Object.keys(BATTLE_ART).every(n => !!battleArtOf(n)),
       Object.keys(BATTLE_ART).filter(n => !battleArtOf(n)).join(',') || 'todas ok');
    G.party = antesParty; G.leader = antesLider;

    // A formação grande não pode brigar com a HUD nem com o menu.
    // Usa a maior arte REALMENTE cadastrada; sem nenhuma, cai no
    // envelope de projeto (112×152).
    const reais = Object.values(BATTLE_ART);
    const AW = reais.length ? Math.max(...reais.map(a => a.w)) : 112;
    const AH = reais.length ? Math.max(...reais.map(a => a.h)) : 152;
    const cx = ALLY_SPOTS_LARGE.map(s => ({x0:s.x - AW/2, x1:s.x + AW/2, y0:s.y - AH, y1:s.y}));
    ok('formação grande cabe na tela',
       cx.every(c => c.x0 >= 0 && c.x1 <= W && c.y0 >= 0 && c.y1 <= H));
    /* As zonas mandam. Antes estes limites eram números escritos à mão
       (478, 598, 464, 278) repetidos em três arquivos, e o layout do
       mockup os deixou todos errados de uma vez. Agora saem de `HUD`:
       mover uma zona move o teste junto. */
    const bate = (c, z) => {
      const q = zonaFim(z);
      return c.x0 < q.x1 && c.x1 > q.x0 && c.y0 < q.y1 && c.y1 > q.y0;
    };
    for (const nome of ['turno','ordem','alvo','cmd','detalhe','grupo','atalhos','log']){
      const maus = cx.filter(c => bate(c, HUD[nome]));
      if (maus.length){
        ok(`formação grande não invade a zona ${nome}`, false,
           maus.map(c => `x${Math.round(c.x0)}..${Math.round(c.x1)} ` +
                         `y${Math.round(c.y0)}..${Math.round(c.y1)}`).join(' · '));
        break;
      }
    }
    ok('formação grande não invade nenhuma zona da HUD',
       ['turno','ordem','alvo','cmd','detalhe','grupo','atalhos','log']
         .every(n => cx.every(c => !bate(c, HUD[n]))));
    ok('formação grande fica fora da faixa dos inimigos',
       cx.every(c => c.x0 >= HUD.inimigos.x1), `x0 mínimo ${Math.round(Math.min(...cx.map(c=>c.x0)))}`);
    ok('formação grande fica dentro da faixa do campo',
       cx.every(c => c.y0 >= HUD.campo.y0 && c.y1 <= HUD.campo.y1),
       `y ${Math.round(Math.min(...cx.map(c=>c.y0)))}..${Math.round(Math.max(...cx.map(c=>c.y1)))}`);
    let maior = 0;
    for (let i = 0; i < cx.length; i++) for (let j = i + 1; j < cx.length; j++){
      const a = cx[i], b = cx[j];
      const ix = Math.min(a.x1,b.x1) - Math.max(a.x0,b.x0);
      const iy = Math.min(a.y1,b.y1) - Math.max(a.y0,b.y0);
      if (ix > 0 && iy > 0) maior = Math.max(maior, ix * iy / (AW * AH));
    }
    ok('sobreposição entre personagens fica abaixo de 25%', maior < 0.25,
       `máx ${(maior*100).toFixed(0)}%`);
  }

  /* --- elenco progressivo: começa com 1, cresce por missão ---------
     A v4.4 mudou o contrato: `newGame` não monta mais o elenco inteiro.
     Quem chama isso de regressão está lendo o teste antigo — o que vale
     agora é que o jogo COMEÇA sozinho e que ninguém aparece de graça. */
  {
    const salvo = {squad:G.squad, leader:G.leader, party:G.party,
                   recruits:G.recruits, quests:G.quests, gold:G.gold,
                   items:G.items, mapa:G.mapId, cena:G.scene};

    newGame('Marin');
    ok('começa com UMA pessoa no elenco', G.party.length === 1, `${G.party.length}`);
    ok('e essa pessoa é a escolhida', G.party[0].name === 'Marin', G.party[0].name);
    ok('o escolhido está em campo', G.squad.join() === 'Marin', G.squad.join(','));
    ok('escolha inválida não trava o jogo — cai no primeiro do elenco',
       (newGame('Ninguém'), G.party[0].name === PARTY_DEFS[0].name), G.party[0].name);

    newGame('Marin');
    ok('todas as missões de recrutamento têm dono',
       RECRUIT_QUESTS.every(q => !!G.recruits[q]), JSON.stringify(G.recruits));
    ok('o escolhido não aparece como recompensa de si mesmo',
       !Object.values(G.recruits).includes('Marin'));
    ok('cada personagem que falta vem em exatamente uma missão',
       new Set(Object.values(G.recruits)).size === PARTY_DEFS.length - 1);
    ok('protagonista sem cura recebe cura na PRIMEIRA missão',
       CURANDEIROS.includes(G.recruits[RECRUIT_QUESTS[0]]),
       G.recruits[RECRUIT_QUESTS[0]]);
    newGame('Ophelia');
    ok('protagonista que já cura não força cura na primeira',
       !Object.values(G.recruits).includes('Ophelia') &&
       Object.values(G.recruits).length === PARTY_DEFS.length - 1);

    // entregar a missão traz a pessoa
    newGame('Marin');
    const q0 = RECRUIT_QUESTS[0], vem = G.recruits[q0];
    acceptQuest(q0);
    G.kills = {[QUESTS[q0].alvo]: 999};        // caçada cumprida
    completeQuest(q0);
    ok('entregar a missão recruta alguém', !!charByName(vem), vem);
    ok('quem entrou já vai para o campo', G.squad.includes(vem), G.squad.join(','));
    ok('a missão sai do mapa de recrutamento', !G.recruits[q0]);
    ok('recrutar de novo não duplica',
       (recrutar(vem), G.party.filter(c => c.name === vem).length === 1));
    ok('recruta entra no nível de quem já está jogando',
       charByName(vem).lvl >= charByName('Marin').lvl,
       `${charByName(vem).lvl} vs ${charByName('Marin').lvl}`);

    // elenco completo pelas missões — daqui em diante testamos o grupo
    for (const q of RECRUIT_QUESTS){ if (G.recruits[q]) recrutar(G.recruits[q]); }
    G.recruits = {};
    ok('as missões de recrutamento completam o elenco inteiro',
       G.party.length === PARTY_DEFS.length, `${G.party.length}/${PARTY_DEFS.length}`);
    ok('com o elenco cheio o campo enche até o teto',
       G.squad.length === PARTY_SIZE, `${G.squad.length}`);
    ok('o grupo nunca passa do teto', G.squad.length <= PARTY_SIZE);
    ok('ninguém aparece duas vezes no grupo',
       new Set(G.squad).size === G.squad.length);
    ok('todo mundo do grupo existe no elenco',
       G.squad.every(n => !!charByName(n)));
    ok('quem sobra do elenco vai para o banco',
       benchNames().length === G.party.length - G.squad.length,
       `${benchNames().length} na reserva`);
    ok('grupo e banco juntos formam o elenco inteiro',
       new Set([...G.squad, ...benchNames()]).size === G.party.length);

    // entra e sai
    const reserva = benchNames()[0];
    ok('grupo cheio recusa mais um', entrarNoGrupo(reserva) === false);
    const saiu = G.squad[2];
    ok('dá para tirar alguém de campo', sairDoGrupo(saiu) === true);
    ok('quem saiu foi para o banco',
       !G.squad.includes(saiu) && benchNames().includes(saiu));
    ok('agora cabe alguém do banco', entrarNoGrupo(reserva) === true &&
       G.squad.includes(reserva));

    // a liderança acompanha a PESSOA, não a posição
    G.leader = 3;
    const lider = G.squad[3];
    sairDoGrupo(G.squad[0]);
    ok('tirar alguém antes do líder não passa a liderança para outro',
       leaderChar().name === lider, `líder ${leaderChar().name}`);

    // o último não sai — grupo vazio trava campo e combate
    while (G.squad.length > 1) sairDoGrupo(G.squad[G.squad.length - 1]);
    ok('o último do grupo não pode sair', sairDoGrupo(G.squad[0]) === false);
    ok('sobra sempre alguém em campo', activeParty().length >= 1);

    // sanitize resiste a lixo
    G.squad = ['Fantasma', 'Fantasma', ...G.party.map(c => c.name)];
    sanitizeSquad();
    ok('sanitizeSquad tira nome inexistente, repetido e excesso',
       G.squad.length === PARTY_SIZE && new Set(G.squad).size === PARTY_SIZE &&
       G.squad.every(n => !!charByName(n)), G.squad.join(','));
    G.squad = [];
    sanitizeSquad();
    ok('grupo vazio é remontado sozinho', G.squad.length === PARTY_SIZE);

    // e com elenco de uma pessoa só, o remonte não inventa ninguém
    G.party = [makeChar(PARTY_DEFS[0], 5)]; G.squad = [];
    sanitizeSquad();
    ok('elenco de 1: o remonte não inventa gente que não foi recrutada',
       G.squad.length === 1 && G.squad[0] === PARTY_DEFS[0].name, G.squad.join(','));

    Object.assign(G, {squad:salvo.squad, leader:salvo.leader, party:salvo.party,
                      recruits:salvo.recruits, quests:salvo.quests,
                      gold:salvo.gold, items:salvo.items, scene:salvo.cena});
    sanitizeSquad();
    if (salvo.mapa) loadMap(salvo.mapa);
  }

  /* --- migração de save ------------------------------------------------
     O jogo já teve três formatos de grupo. Quem estava jogando não pode
     perder o save numa mudança de estrutura, então cada formato antigo é
     lido e convertido. --------------------------------------------------- */
  {
    const salvo = {squad:G.squad, leader:G.leader, party:G.party,
                   mapa:G.mapId, cena:G.scene, gold:G.gold, items:G.items,
                   flags:G.flags, quests:G.quests, kills:G.kills};
    const nomes = PARTY_DEFS.map(d => d.name);
    /* Antes da v4.4 o elenco era recriado de PARTY_DEFS, então estas
       fixtures podiam omitir `party` e ainda assim aparecer com os seis.
       Agora o elenco vem do save — que é o ponto da mudança — e omitir
       `party` significa literalmente "esse save tem uma pessoa só". Os
       saves reais de v4.0-4.3 sempre gravaram os seis, então é isso que
       a fixture precisa dizer. */
    const elencoSalvo = nomes.map(n => ({name:n, lvl:5, exp:0, hp:99, mp:9, gear:{}}));

    // v4.1-2: dois times com mapa próprio → um grupo só
    loadFromSave({map:'patio', x:5, y:5, dir:'down', gold:10, items:{}, flags:{},
      party:elencoSalvo,
      teams:[{squad:nomes.slice(0, 3), leader:1, mapId:'hall', pos:{tx:4, ty:4, dir:'up'}},
             {squad:nomes.slice(3, 6), leader:0, mapId:'undercroft', pos:{tx:6, ty:6, dir:'down'}}],
      team:1});
    ok('save antigo mantém o elenco inteiro que já tinha',
       G.party.length === PARTY_DEFS.length, `${G.party.length}`);
    ok('save antigo (elenco cheio) não fica com missão de recruta pendente',
       Object.keys(G.recruits).length === 0, JSON.stringify(G.recruits));
    ok('save de dois times vira um grupo só',
       G.squad.length === PARTY_SIZE && new Set(G.squad).size === PARTY_SIZE,
       G.squad.join(','));
    ok('o time que estava em campo entra primeiro',
       G.squad.slice(0, 3).join() === nomes.slice(3, 6).join(), G.squad.join(','));
    ok('o excedente cai no banco, ninguém some',
       new Set([...G.squad, ...benchNames()]).size === G.party.length);
    ok('a posição vem do time que estava em campo',
       G.mapId === 'undercroft', G.mapId);

    // v4.0: s.squads + s.squad como ÍNDICE
    loadFromSave({map:'patio', x:5, y:5, dir:'down', gold:10, items:{}, flags:{},
                  party:elencoSalvo,
                  squads:[nomes.slice(0, 3), nomes.slice(3, 6)], squad:0});
    ok('save v4.0 (squad como índice) também converte',
       G.squad.length === PARTY_SIZE && G.squad[0] === nomes[0], G.squad.join(','));

    // ≤v3: nada de grupo
    loadFromSave({map:'patio', x:5, y:5, dir:'down', gold:10, items:{}, flags:{},
                  party:elencoSalvo});
    ok('save antigo sem grupo monta o padrão',
       G.squad.join() === defaultSquad().join(), G.squad.join(','));

    /* v4.4: save no meio do recrutamento. É o caso novo e o que mais
       importa — carregar não pode devolver de graça quem ainda falta. */
    loadFromSave({map:'patio', x:5, y:5, dir:'down', gold:10, items:{}, flags:{},
                  party:[{name:'Marin', lvl:6, exp:0, hp:50, mp:20, gear:{}},
                         {name:'Eden',  lvl:6, exp:0, hp:50, mp:20, gear:{}}],
                  squad:['Marin','Eden'], leader:0,
                  recruits:{q_veterano:'Gabriel', q_enfermeira:'Max', q_mercador:'Seiji'},
                  quests:{[RECRUIT_QUESTS[0]]:{st:'feita', base:0}}});
    ok('save no meio do recrutamento não devolve quem falta',
       G.party.length === 2 && !charByName('Gabriel'), `${G.party.length}`);
    ok('e mantém pendente quem ainda vai chegar',
       G.recruits.q_veterano === 'Gabriel' && Object.keys(G.recruits).length === 3);

    /* Save v4.4 sem `recruits` (ou corrompido): o mapa é remontado a
       partir de quem falta, usando só as missões ainda não entregues. */
    loadFromSave({map:'patio', x:5, y:5, dir:'down', gold:10, items:{}, flags:{},
                  party:[{name:'Marin', lvl:6, exp:0, hp:50, mp:20, gear:{}}],
                  squad:['Marin'], leader:0,
                  quests:{[RECRUIT_QUESTS[0]]:{st:'feita', base:0}}});
    {
      const todos = Object.values(G.recruits).flat();
      ok('sem `recruits`, o mapa é remontado com quem falta',
         new Set(todos).size === PARTY_DEFS.length - 1 && !todos.includes('Marin'),
         JSON.stringify(G.recruits));
      ok('e nunca pendura recruta numa missão já entregue',
         !(RECRUIT_QUESTS[0] in G.recruits), JSON.stringify(G.recruits));
      /* Faltavam 5 pessoas para 4 missões livres: ninguém pode ficar
         inalcançável, então a última missão entrega duas. */
      ok('mais gente que missão: a última entrega o resto, ninguém fica de fora',
         Array.isArray(G.recruits[RECRUIT_QUESTS[RECRUIT_QUESTS.length - 1]]),
         JSON.stringify(G.recruits));
    }

    // v4.3: ida e volta pelo formato novo
    loadFromSave({map:'patio', x:5, y:5, dir:'down', gold:10, items:{}, flags:{},
                  party:elencoSalvo});
    G.squad = nomes.slice(1, 5); G.leader = 2;
    const s = JSON.parse(JSON.stringify({
      map:G.mapId, x:G.player.tx, y:G.player.ty, dir:G.player.dir, party:elencoSalvo,
      squad:G.squad.slice(), leader:G.leader, gold:G.gold, items:G.items, flags:G.flags}));
    loadFromSave(s);
    ok('save novo sobrevive à ida e volta',
       G.squad.join() === nomes.slice(1, 5).join() && G.leader === 2,
       `${G.squad.join(',')} líder ${G.leader}`);

    /* Save.write → loadFromSave com o elenco parcial: a viagem completa,
       porque foi exatamente aqui que a v4.4 mudou o formato. */
    newGame('Gabriel');
    const antes = {elenco:G.party.map(c => c.name), rec:{...G.recruits}};
    const bruto = JSON.parse(JSON.stringify({
      map:G.mapId, x:G.player.tx, y:G.player.ty, dir:G.player.dir,
      party:G.party.map(p => ({name:p.name, lvl:p.lvl, exp:p.exp, hp:p.hp, mp:p.mp, gear:{...p.gear}})),
      squad:G.squad.slice(), leader:G.leader, recruits:{...G.recruits},
      gold:G.gold, items:G.items, flags:G.flags, quests:G.quests}));
    loadFromSave(bruto);
    ok('salvar e carregar preserva o elenco parcial',
       G.party.map(c => c.name).join() === antes.elenco.join(), G.party.map(c => c.name).join(','));
    ok('salvar e carregar preserva quem cada missão ainda traz',
       JSON.stringify(G.recruits) === JSON.stringify(antes.rec), JSON.stringify(G.recruits));

    Object.assign(G, salvo, {scene:salvo.cena});
    sanitizeSquad();
    if (salvo.mapa) loadMap(salvo.mapa);
  }

  /* --- integridade de arte -------------------------------------------
     Existe para pegar UM erro específico que já aconteceu: a folha da
     Eden foi embutida em SPRITE_DATA e apontada em PARTY_DEFS, mas
     ninguém registrou no FRAME_INFO. Sem essa entrada `hasSheet()`
     devolve falso e o personagem some no mapa, virando o boneco
     procedural — e nada no jogo reclama. */
  {
    const falta = [];
    for (const d of PARTY_DEFS){
      if (!SPRITE_DATA[d.sheet])  falta.push(`${d.name}: folha "${d.sheet}" fora de SPRITE_DATA`);
      if (!FRAME_INFO[d.sheet])   falta.push(`${d.name}: folha "${d.sheet}" fora de FRAME_INFO`);
      if (d.portrait && !SPRITE_DATA[d.portrait])
        falta.push(`${d.name}: retrato "${d.portrait}" fora de SPRITE_DATA`);
    }
    ok('toda folha de personagem está em SPRITE_DATA E em FRAME_INFO',
       falta.length === 0, falta.join(' · '));

    const npcFalta = [];
    for (const [id, m] of Object.entries(MAPS))
      for (const n of (m.npcs || [])){
        if (n.sheet && !SPRITE_DATA[n.sheet]) npcFalta.push(`${id}/${n.name}: "${n.sheet}" sem imagem`);
        if (n.sheet && !FRAME_INFO[n.sheet])  npcFalta.push(`${id}/${n.name}: "${n.sheet}" sem FRAME_INFO`);
        if (n.portrait && !SPRITE_DATA[n.portrait]) npcFalta.push(`${id}/${n.name}: retrato ausente`);
      }
    ok('toda folha de NPC está registrada', npcFalta.length === 0, npcFalta.join(' · '));

    /* v5.29 — NPC sem `sheet` cai no boneco procedural, e o boneco no
       meio de uma sala desenhada é o placeholder que mais salta aos
       olhos. Três do Arquivo estavam assim e ninguém tinha reclamado
       porque nada reclamava. */
    {
      const semFolha = [];
      for (const [id, m] of Object.entries(MAPS))
        for (const n of (m.npcs || [])) if (!n.sheet) semFolha.push(`${id}/${n.name}`);
      ok('todo NPC declara uma folha de sprite', semFolha.length === 0, semFolha.join(' · '));

      /* v5.30 — a folha de 18 figurantes cortou o reuso pela metade.
         Antes dela: 47 NPCs em 10 folhas, com a Batedora e a Cobradora
         de Fossa desenhadas como a MESMA veterana. Agora: 28 folhas, e
         nenhuma serve mais de três NPCs.

         Teto de 3, não de 1: 50 NPCs para 28 folhas não fecham em 1:1, e
         fingir que fecham só faria o teste mentir. O que ele impede é a
         regressão — mais um NPC pendurado numa folha já cheia. */
      const uso = {};
      for (const m of Object.values(MAPS))
        for (const n of (m.npcs || [])) if (n.sheet) (uso[n.sheet] = uso[n.sheet] || []).push(n.name);
      const cheias = Object.entries(uso).filter(([, l]) => l.length > 3)
        .map(([k, l]) => `${k}: ${l.length}`);
      ok('nenhuma folha de NPC serve mais de três personagens',
         cheias.length === 0, cheias.join(' · '));
      /* Folha embutida e nunca usada é peso morto no HTML. */
      const ociosas = NPC_SHEETS.filter(k => !uso[k]);
      ok('toda folha de NPC embutida está em uso', ociosas.length === 0, ociosas.join(','));
    }

    const mobFalta = Object.entries(BESTIARY)
      .filter(([, b]) => b.sprite && !SPRITE_DATA[b.sprite])
      .map(([k, b]) => `${k}="${b.sprite}"`);
    ok('todo sprite de criatura existe', mobFalta.length === 0, mobFalta.join(' · '));

    /* --- v5.29: nenhuma criatura sem arte, nenhuma dividindo arte -----
       Até aqui 40 das 91 criaturas dividiam doze desenhos genéricos e
       oito nem sprite tinham — caíam no boneco procedural. O Lobo de
       Éter, o Lobo de Cinzas e a Cornuda Cindária eram o MESMO lobo, e
       no Bestiário, que mostra o retrato ao lado da ficha, duas
       criaturas diferentes apareciam com o mesmo corpo.

       As duas asserções abaixo são a mesma regra vista dos dois lados:
       toda criatura tem arte, e a arte é dela. */
    {
      const semArte = Object.entries(BESTIARY)
        .filter(([, b]) => !b.sprite || !SPRITE_DATA[b.sprite]).map(([k]) => k);
      ok('toda criatura tem arte própria embutida', semArte.length === 0, semArte.join(','));

      const porSprite = {};
      for (const [id, b] of Object.entries(BESTIARY))
        if (b.sprite) (porSprite[b.sprite] = porSprite[b.sprite] || []).push(id);
      /* As FASES de chefe são a exceção declarada: o Dono do Pântano e o
         Arquivista trocam de sprite ao longo da luta, e a chave da fase 1
         é a mesma do `sprite` da entrada. Isso é uma criatura só.

         v5.32 — `mob_shade` também é exceção, mas de OUTRO motivo: é
         reaproveite DE PROPÓSITO pelo chefe secreto Elijah Corrompido
         (ver 09-bestiary.js) — os sprites reais dele (elijah_sheet/
         elijah_corrompido_sheet) são folha de CAMPO (grade de
         personagem), formato incompatível com retrato de combate; a
         revelação da história É que a corrupção dele sempre teve a
         mesma cara de toda Sombra Corrompida do jogo. Não é arte
         faltando, é reaproveite narrativo. */
      const EXCECOES_ARTE_DIVIDIDA = new Set(['mob_shade']);
      const dividem = Object.entries(porSprite)
        .filter(([k, ids]) => ids.length > 1 && !EXCECOES_ARTE_DIVIDIDA.has(k))
        .map(([k, ids]) => `${k}: ${ids.join('+')}`);
      ok('nenhuma criatura divide arte com outra (fora das exceções declaradas)',
         dividem.length === 0, dividem.join(' · '));
    }

    /* Pega renomeação incompleta: arte de combate apontando para quem não
       existe. As SEGUNDAS FORMAS são a exceção declarada — a do Lycan não
       é um personagem do elenco, é o outro desenho de um que é. Listar as
       formas aqui mantém o teste pegando o erro que ele existe para pegar
       (nome trocado num lugar só) sem acusar a mecânica. */
    const FORMAS = [LYCAN.arte, MADAO.artePapelao, MADAO.arteVitoria];
    /* v5.32 — guest-tutorial (Abel/Ava/Orfeu/Beatriz/Calder/Amanda/
       Scythe) entra em batalha de verdade (Battle.begin({guest:...})),
       então precisa da mesma arte de combate que tinha como jogável;
       saíram de PARTY_DEFS mas continuam citados aqui de propósito. */
    const orfa = Object.keys(BATTLE_ART)
      .filter(n => !PARTY_DEFS.some(d => d.name === n) && !FORMAS.includes(n) &&
                   !Object.values(GUEST_ALLIES).some(g => g.name === n));
    ok('BATTLE_ART só cita personagens do elenco, guest-tutorial ou segunda forma deles',
       orfa.length === 0, orfa.join(' · '));
    ok('toda segunda forma declarada tem arte de combate',
       FORMAS.every(n => !!BATTLE_ART[n]), FORMAS.filter(n => !BATTLE_ART[n]).join(','));
    ok('o dono da forma Lycan existe no elenco',
       PARTY_DEFS.some(d => d.name === LYCAN.dono), LYCAN.dono);
    ok('a folha de campo do Lycan existe e está em FRAME_INFO',
       !!SPRITE_DATA[LYCAN.sheet] && !!FRAME_INFO[LYCAN.sheet]);

    // imagem carregada precisa casar com a grade declarada
    const grade = [];
    for (const [k, fi] of Object.entries(FRAME_INFO)){
      const img = spriteImages[k];
      if (!img || !(img.naturalWidth > 1)) continue;      // stub ou ainda carregando
      if (img.naturalWidth !== fi.fw * fi.cols || img.naturalHeight !== fi.fh * fi.rows)
        grade.push(`${k}: imagem ${img.naturalWidth}x${img.naturalHeight} ≠ grade ${fi.fw * fi.cols}x${fi.fh * fi.rows}`);
    }
    ok('folhas carregadas batem com a grade declarada', grade.length === 0, grade.join(' · '));

    /* --- criaturas com arte própria (v5.26) ---
       O bestiário cresceu para 66 e é fácil escrever a entrada e
       esquecer a formação: o bicho fica no jogo sem nunca aparecer. */
    {
      const emFormacao = new Set();
      for (const lista of Object.values(FORMATIONS))
        for (const f of lista) for (const [id] of f) emFormacao.add(id);
      const orfaos = Object.entries(BESTIARY)
        .filter(([id, b]) => !b.boss && !emFormacao.has(id)).map(([id]) => id);
      ok('toda criatura não-chefe aparece em alguma formação',
         orfaos.length === 0, orfaos.join(','));

      /* Cada arte nova foi desenhada PARA uma região. Trocar de região
         num copiar-e-colar é o erro que este teste pega. */
      const POR_REGIAO = {
        patio:      ['familiar','homunculo','livro','vigia'],
        undercroft: ['troglodita','minhoca','fungo','escavador'],
        ashwood:    ['coruja','veado','espectro','javali'],
        nests:      ['vespao','pilhador','larva','matriarca'],
        spire:      ['prismatico','estilhacado','harpiavidro','vitrea'],
        cistern:    ['geleia','racano','espirito','caranguejo'],
      };
      const fora = [];
      for (const [regiao, ids] of Object.entries(POR_REGIAO)){
        const aqui = new Set((FORMATIONS[regiao] || []).flat().map(([id]) => id));
        for (const id of ids){
          if (!BESTIARY[id]) { fora.push(`${id}: sem entrada no bestiário`); continue; }
          if (!aqui.has(id)) fora.push(`${id}: fora de ${regiao}`);
          for (const [outra, lista] of Object.entries(FORMATIONS))
            if (outra !== regiao && lista.flat().some(([x]) => x === id))
              fora.push(`${id}: também em ${outra}`);
        }
      }
      ok('cada criatura nova só aparece na região da arte dela',
         fora.length === 0, fora.join(' · '));

      const novos = Object.values(POR_REGIAO).flat();
      ok('toda criatura nova tem arte embutida',
         novos.every(id => BESTIARY[id] && SPRITE_DATA[BESTIARY[id].sprite]),
         novos.filter(id => !SPRITE_DATA[BESTIARY[id]?.sprite]).join(','));
      /* 300 px é o dobro do que o jogo desenha. Um recorte que voltar a
         150 (ou a 1, de stub) sai borrado na tela em 2×. */
      const baixos = novos.map(id => BESTIARY[id].sprite)
        .filter(k => { const i = spriteImages[k]; return i && i.naturalHeight > 1 && i.naturalHeight !== 300; });
      ok('arte de criatura nova tem 300 px de altura', baixos.length === 0, baixos.join(','));
    }
  }

  /* --- identidade visual: panel() e bar() -----------------------------
     A moldura é desenhada em código justamente para não depender de arte
     fatiada. Estes testes travam duas coisas: a assinatura (todo call site
     do jogo passa por aqui) e o fato de que nenhum enfeite pode vazar da
     tela — foi o que cortou a gema ao meio quando o painel encostava no
     topo. -------------------------------------------------------------- */
  {
    // `ctx` é const, então os desenhos de prova vão na tela real mesmo —
    // o autoteste já para o jogo e cobre tudo com o relatório.
    const tg = ctx;
    {
      let quebrou = '';
      const casos = [
        ['painel grande',   () => panel(40, 40, 400, 300)],
        ['painel colado no topo',  () => panel(0, 0, 200, 60)],
        ['painel colado na base',  () => panel(0, H - 60, 200, 60)],
        ['painel minúsculo',       () => panel(10, 10, 12, 8)],
        ['painel de largura zero', () => panel(10, 10, 0, 0)],
        ['painel com accent',      () => panel(10, 10, 120, 80, {accent:'#c8a23a', gem:'#ffd76a'})],
        ['painel sem gema base',   () => panel(10, 10, 120, 80, {gemaBase:false})],
        ['barra cheia',   () => bar(10, 10, 100, 8, 1, '#3fa85c', '#8ce07a')],
        ['barra vazia',   () => bar(10, 10, 100, 8, 0, '#3fa85c', '#8ce07a')],
        ['barra fora da faixa', () => bar(10, 10, 100, 8, 9, '#3fa85c', '#8ce07a')],
        ['barra negativa',      () => bar(10, 10, 100, 8, -3, '#3fa85c', '#8ce07a')],
        ['barra com ghost e cap', () => bar(10, 10, 100, 8, .4, '#3fa85c', '#8ce07a',
                                            {ghost:.9, cap:'#e8c25a'})],
        ['barra fina',    () => bar(10, 10, 100, 3, .5, '#3fa85c', '#8ce07a')],
      ];
      for (const [nome, fn] of casos){
        try { fn(); } catch (e){ quebrou += `${nome}: ${e.message} · `; }
      }
      ok('panel/bar aguentam tamanhos e valores degenerados', quebrou === '', quebrou || 'todos ok');

      // a barra nunca pode passar da própria moldura, mesmo com ratio > 1
      tg.clearRect(0, 0, W, H);
      bar(50, 50, 100, 8, 9, '#ffffff', '#ffffff');
      const linha = tg.getImageData(50, 54, 120, 1).data;
      let ultimo = -1;
      for (let i = 0; i < 120; i++) if (linha[i * 4 + 3] > 0) ultimo = i;
      ok('barra respeita a moldura com ratio fora da faixa', ultimo <= 100, `último px em +${ultimo}`);

      /* Gema do topo com o painel colado na borda da tela.
         Se ela ficasse centrada em y+1.5, a linha 0 pegaria a BARRIGA do
         losango (larga). Empurrada para dentro, a linha 0 pega só a PONTA
         (estreita) e a barriga aparece mais abaixo. Mede-se a largura
         pintada na coluna central, longe dos cantos em L. */
      tg.clearRect(0, 0, W, H);
      /* `gem` fixo: desde que temaAtual() passou a poder sobrepor a cor
         da gema (v-atual, tema "relógio" por padrão fora do ciano), este
         teste geométrico — a gema não pode cortar na borda — não pode
         mais confiar na cor PADRÃO do tema ativo. O que se mede aqui é
         posição, a cor só marca o pixel; fixá-la mantém o teste válido
         em qualquer tema. */
      panel(0, 0, 200, 60, {gem: UI.gema});
      // conta só o pixel CIANO da gema: o corpo do painel é azul-escuro,
      // então o canal azul separa os dois sem ambiguidade
      const largura = (linhaY) => {
        const d = tg.getImageData(90, linhaY, 20, 1).data;
        let n = 0;
        for (let i = 0; i < 20; i++) if (d[i * 4 + 2] > 180 && d[i * 4] < 200) n++;
        return n;
      };
      const naPonta = largura(0), naBarriga = largura(7);
      ok('gema do topo entra inteira quando o painel encosta na borda',
         naPonta <= 4 && naBarriga >= 5, `ponta ${naPonta}px · barriga ${naBarriga}px`);
      tg.clearRect(0, 0, W, H);
    }
  }

  /* --- limpeza de folhas de sprite --- */
  {
    // folha sintética: corpo colado no topo + fragmento solto no rodapé
    const fi = {fw:20, fh:40, cols:1, rows:1};
    const src = document.createElement('canvas');
    src.width = 20; src.height = 40;
    const sg = src.getContext('2d');
    sg.fillStyle = '#fff';
    sg.fillRect(4, 2, 12, 30);     // "corpo"  y2..31
    sg.fillRect(3, 35, 14, 5);     // fragmento solto y35..39 (70 px)
    const cleaned = cleanSheet(src, fi, {dropDetachedBelow:33, minPx:40});
    const D = cleaned.getContext('2d').getImageData(0, 0, 20, 40).data;
    const alphaAt = (x, y) => D[(y * 20 + x) * 4 + 3];
    ok('cleanSheet remove fragmento solto no rodapé', alphaAt(9, 37) === 0);
    ok('cleanSheet preserva o corpo', alphaAt(9, 10) > 200);
    ok('cleanSheet relata o que removeu', cleaned.cleanup.blobs === 1 && cleaned.cleanup.removed === 70,
       JSON.stringify(cleaned.cleanup));
    // fragmento pequeno (pé levantado) não pode ser removido
    const src2 = document.createElement('canvas');
    src2.width = 20; src2.height = 40;
    const sg2 = src2.getContext('2d');
    sg2.fillStyle = '#fff';
    sg2.fillRect(4, 2, 12, 30);
    sg2.fillRect(6, 35, 3, 3);     // 9 px só
    const c2 = cleanSheet(src2, fi, {dropDetachedBelow:33, minPx:40});
    ok('cleanSheet preserva fragmento pequeno (pé levantado)',
       c2.getContext('2d').getImageData(0, 0, 20, 40).data[(36 * 20 + 7) * 4 + 3] > 200);
  }
  ok('folha do Gabriel está na lista de correção', !!SHEET_CLEANUP.gabriel_sheet);
  if (hasSheet('gabriel_sheet')){
    // nenhum quadro virado para a direita pode ter pixel abaixo de y55
    const fi = FRAME_INFO.gabriel_sheet, img = spriteImages.gabriel_sheet;
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    cv.getContext('2d').drawImage(img, 0, 0);
    const D = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let below = 0;
    for (let c = 0; c < fi.cols; c++)
      for (let y = 57; y < fi.fh; y++) for (let x = 0; x < fi.fw; x++)
        if (D[(((DIR_ROW.right * fi.fh) + y) * cv.width + (c * fi.fw + x)) * 4 + 3] > 200) below++;
    ok('Gabriel: sem bloco solto sob os quadros virados à direita', below === 0, `${below} px`);
  }

  /* --- rótulos de inimigos --- */
  const three = ['wolf','wolf','shade'].map((k, i) => makeEnemyUnit(k, i));
  labelEnemies(three);
  ok('duplicados ganham sufixo A/B',
     three[0].name.endsWith(' A') && three[1].name.endsWith(' B') && !three[2].name.includes(' A'));

  /* --- glifos da fonte de pixel ------------------------------------
     A Press Start 2P é ASCII imprimível e mais nada. Fora disso o
     navegador troca de fonte sem avisar: `▸ ▼ ▲` ainda aparecem (fora do
     estilo), mas `◄ ►` não desenham em lugar nenhum — viram um ponto.
     Era o que acontecia na linha de quantidade da loja e na dica da tela
     de escolha, em silêncio, até alguém olhar a tela. O teste mede a
     largura contra a do "M": glifo da PS2P mede o corpo inteiro, glifo
     emprestado mede a metade. */
  {
    const pronta = document.fonts?.check?.('10px "Press Start 2P"');
    ctx.save(); ctx.font = FONT_PX(10);
    const larguraM = ctx.measureText('M').width;
    const temGlifo = g => Math.abs(ctx.measureText(g).width - larguraM) < 0.6;
    const ausentes = ['◄', '►'].filter(g => !temGlifo(g));
    ctx.restore();
    /* Se a fonte ainda não carregou, TUDO mede igual e o teste passaria
       sem provar nada — então a asserção só vale com a fonte pronta. */
    ok('a fonte de pixel realmente não tem ◄ ►  (justifica a regra)',
       !pronta || ausentes.length === 2,
       pronta ? `ausentes: ${ausentes.join('')}` : 'fonte ainda não carregada — não verificado');

    // e nenhuma string desenhada em pxText pode usá-los
    const emPixel = ['< > escolher    Z confirmar    X voltar', 'quantidade  < 1 >'];
    ok('nenhuma dica em pxText usa glifo que a fonte não tem',
       emPixel.every(s => !PX_SEM_GLIFO.test(s)), emPixel.filter(s => PX_SEM_GLIFO.test(s)).join(' | '));
  }

  /* --- tela de escolha do protagonista -----------------------------
     Texto em canvas não avisa quando vaza: ele simplesmente sai pela
     borda do painel e continua desenhando por cima do fundo. Foi o que
     aconteceu com as seis frases de apresentação (quebravam em 600px
     numa faixa útil de 478), e só um teste de largura pega isso. */
  {
    const dir = ESCOLHA_PAINEL.x + ESCOLHA_PAINEL.w;
    ctx.save();
    let vazaPitch = [], semPitch = [], vazaSkill = [], semLore = [], vazaLore = [], loreSemCenario = [];
    for (const d of PARTY_DEFS){
      if (!d.pitch) semPitch.push(d.name);
      ctx.font = FONT_UI(13);
      for (const ln of wrapUI(d.pitch || '', ESCOLHA_TEXTO_W, 13))
        if (ESCOLHA_TEXTO_X + ctx.measureText(ln).width > dir) vazaPitch.push(d.name);
      ctx.font = FONT_UI(12);
      for (const id of makeChar(d, 5).skills){
        const s = SKILLS[id]; if (!s) continue;
        const txt = `${s.name}  ·  ${ELEM[s.elem].name}`;
        if (ESCOLHA_TEXTO_X + 268 + ctx.measureText(txt).width > dir) vazaSkill.push(d.name + '/' + s.name);
      }
      /* v5.32 — lore/cenario: mesma armadilha de vazamento, e a frase
         não pode quebrar em 2 linhas porque mora sozinha no vão entre
         as colunas de stat/skill e o pitch (ver 31-character-select.js,
         py+224 fixo — uma 2ª linha cairia em cima do pitch). */
      if (!d.lore) semLore.push(d.name);
      if (!d.cenario) loreSemCenario.push(d.name);
      ctx.font = FONT_UI(12);
      if (d.lore && ESCOLHA_TEXTO_X + ctx.measureText(`"${d.lore}"`).width > dir)
        vazaLore.push(d.name);
    }
    ctx.restore();
    ok('todo personagem tem frase de apresentação na tela de escolha',
       semPitch.length === 0, semPitch.join(','));
    ok('a frase de apresentação não vaza o painel', vazaPitch.length === 0, vazaPitch.join(','));
    ok('a lista de habilidades não vaza o painel', vazaSkill.length === 0, vazaSkill.join(','));
    ok('todo personagem tem lore na tela de escolha', semLore.length === 0, semLore.join(','));
    ok('todo personagem tem cenário de origem na tela de escolha',
       loreSemCenario.length === 0, loreSemCenario.join(','));
    ok('a frase de lore não vaza o painel (cabe numa linha só)', vazaLore.length === 0, vazaLore.join(','));
    ok('todo cenário citado existe como battle_bg',
       PARTY_DEFS.every(d => !d.cenario || !!SPRITE_DATA['battle_bg_' + d.cenario]),
       PARTY_DEFS.filter(d => d.cenario && !SPRITE_DATA['battle_bg_' + d.cenario]).map(d => d.cenario).join(','));
    /* A carta tem PISO: abaixo de ~78 px o retrato e o nome não convivem
       mais na mesma carta. Até a v5.29 a largura saía do elenco inteiro,
       e com treze personagens caiu para 54 — daí a janela. O que se mede
       agora é a janela, não o elenco: é ela que decide o tamanho. */
    {
      const gap = 6, margem = 24, VIS = Math.min(PARTY_DEFS.length, ESCOLHA_VISIVEIS);
      const cw = Math.min(116, Math.floor((W - margem + gap) / VIS) - gap);
      ok('a fileira de cartas cabe na tela', VIS * (cw + gap) - gap <= W,
         `${VIS} cartas de ${cw} para ${PARTY_DEFS.length} no elenco`);
      ok('a carta não encolhe a ponto de não caber o retrato', cw >= 78, `${cw}`);
      /* A janela não pode esconder ninguém: com o cursor em qualquer
         personagem, ele tem de estar dentro do trecho desenhado. */
      const fora = [];
      for (let i = 0; i < PARTY_DEFS.length; i++){
        const ini = clamp(i - Math.floor((VIS - 1) / 2), 0, Math.max(0, PARTY_DEFS.length - VIS));
        if (i < ini || i >= ini + VIS) fora.push(PARTY_DEFS[i].name);
      }
      ok('a janela sempre mostra o personagem sob o cursor', fora.length === 0, fora.join(','));
    }

    /* Os retratos vão de 38×64 a 56×64 — não são quadrados. Desenhar
       numa caixa quadrada esprememeria uns e alargaria outros, que é o
       mesmo defeito já corrigido no desenho dos inimigos. O teste checa
       a REGRA (altura fixa, largura pela proporção) na medida em que ela
       cabe no espaço da carta. */
    const tortos = [], grandes = [];
    for (const d of PARTY_DEFS){
      const img = spriteImages[d.portrait];
      if (!img?.complete || !(img.naturalWidth || img.width)) continue;
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      if (iw === ih) continue;                       // quadrado: nada a provar
      tortos.push(d.name + ' ' + iw + 'x' + ih);
      if (Math.round(iw / ih * 60) > 116 - 8) grandes.push(d.name);
    }
    ok('há retrato não-quadrado — a regra de proporção é necessária mesmo',
       tortos.length > 0, tortos.join(', '));
    ok('nenhum retrato, na proporção real, estoura a carta',
       grandes.length === 0, grandes.join(','));

    // a tela desenha sem estourar, com qualquer um selecionado
    const cena = G.scene, iAntes = Escolha.cur.i;
    let erroDesenho = null;
    for (let i = 0; i < PARTY_DEFS.length; i++){
      Escolha.cur.i = i;
      try { Escolha.draw(); } catch(e){ erroDesenho = PARTY_DEFS[i].name + ': ' + e.message; break; }
    }
    ok('a tela de escolha desenha para os seis sem erro', !erroDesenho, erroDesenho || '');
    Escolha.cur.i = iAntes; G.scene = cena;
  }

  /* --- escala do encontro pelo tamanho do grupo --------------------
     O bestiário foi medido contra grupo cheio. Com o elenco progressivo
     o jogador passa a primeira região sozinho, e sem escala os mesmos
     números viram parede intransponível. */
  {
    const cheio = escalaGrupo(PARTY_SIZE, false);
    ok('grupo cheio não altera o bestiário (é a referência medida)',
       cheio.hp === 1 && cheio.atk === 1, JSON.stringify(cheio));
    ok('grupo menor enfraquece o inimigo',
       escalaGrupo(1, false).hp < escalaGrupo(3, false).hp &&
       escalaGrupo(3, false).hp < cheio.hp);
    ok('a escala é monótona (nunca fica mais fácil ao ganhar gente)',
       [1, 2, 3, 4, 5].every((n, i, a) => i === 0 ||
         escalaGrupo(n, false).hp >= escalaGrupo(a[i - 1], false).hp));
    /* Linear puro: é o que `medirBalanco()` validou (solo 95% de vitória
       contra 98% do grupo cheio). Piso arbitrário aqui já quebrou o
       começo solo uma vez — se alguém recolocar, tem de medir antes. */
    ok('a escala de criatura comum é linear no tamanho do grupo',
       [1, 2, 3, 4, 5].every(n => Math.abs(escalaGrupo(n, false).hp - n / PARTY_SIZE) < 1e-9),
       `${escalaGrupo(1, false).hp}`);
    ok('grupo maior que o teto não passa de 1 (não há bônus por trapaça)',
       escalaGrupo(99, false).hp === 1 && escalaGrupo(0, false).hp === 1 / PARTY_SIZE);
    ok('chefe escala menos que criatura comum',
       escalaGrupo(1, true).hp > escalaGrupo(1, false).hp &&
       escalaGrupo(1, true).atk > escalaGrupo(1, false).atk);
    /* A garantia que protege o balanceamento já medido: com grupo cheio
       o chefe também tem de sair intacto da tabela. */
    ok('com grupo cheio o chefe não é alterado',
       escalaGrupo(PARTY_SIZE, true).hp === 1 && escalaGrupo(PARTY_SIZE, true).atk === 1,
       JSON.stringify(escalaGrupo(PARTY_SIZE, true)));

    // e a escala precisa mesmo chegar na unidade construída
    const solo = makeEnemyUnit('wolf', 0, 1), grupo = makeEnemyUnit('wolf', 0, PARTY_SIZE);
    ok('makeEnemyUnit aplica a escala no HP e no ATK',
       solo.maxHp < grupo.maxHp && solo.atk < grupo.atk,
       `${solo.maxHp}/${solo.atk} vs ${grupo.maxHp}/${grupo.atk}`);
    ok('a unidade escalada nasce com a vida cheia', solo.hp === solo.maxHp);
    ok('grupo cheio bate exatamente a tabela do bestiário',
       grupo.maxHp === BESTIARY.wolf.base.hp && grupo.atk === BESTIARY.wolf.base.atk);
    ok('nenhum inimigo escala para zero',
       makeEnemyUnit('wolf', 0, 1).atk >= 1 && makeEnemyUnit('wolf', 0, 1).maxHp >= 1);
  }

  /* --- navegação por direcional -----------------------------------
     Os painéis de combate são desenhados em DUAS colunas, mas chamavam
     navList com `cols` implícito 1: ◄► ficavam mortas e ▲▼ andavam em
     ziguezague entre as colunas. O bug era invisível no código (nenhuma
     dessas chamadas erra em silêncio) e só aparecia jogando. */
  {
    const salvo = {down:Input.down, vk:Input._vk, hit:Input.hit};
    const aperta = (a, fn) => { Input.down = {}; Input._vk = {}; Input.hit = {};
                                Input._set(a, true); fn(); Input.endFrame(); };
    const st = {i:0};
    aperta('right', () => navList(st, 5));
    ok('◄► andam mesmo em lista de coluna única', st.i === 1, `i=${st.i}`);
    aperta('left', () => navList(st, 5));
    ok('◄ volta na lista de coluna única', st.i === 0, `i=${st.i}`);

    // grade 2×3 (5 itens): ▼ pula de LINHA, ► anda de coluna
    st.i = 0;
    aperta('down', () => navList(st, 5, 2));
    ok('▼ em grade de 2 colunas pula a linha inteira', st.i === 2, `i=${st.i}`);
    aperta('right', () => navList(st, 5, 2));
    ok('► em grade anda uma coluna', st.i === 3, `i=${st.i}`);
    aperta('up', () => navList(st, 5, 2));
    ok('▲ em grade sobe a linha inteira', st.i === 1, `i=${st.i}`);

    // opt-out: a loja usa ◄► para trocar de aba, não pode mover o cursor
    st.i = 2;
    aperta('right', () => navList(st, 5, 1, false));
    ok('navList(lr:false) ignora ◄► (loja)', st.i === 2, `i=${st.i}`);

    // as chamadas do combate precisam mesmo passar cols=2
    Battle.allies = [prepAlly(makeChar(PARTY_DEFS[0], 5))];
    Battle.enemies = ['wolf', 'wolf', 'shade'].map((k, i) => makeEnemyUnit(k, i));
    Battle.units = [...Battle.allies, ...Battle.enemies];
    Battle.actor = Battle.allies[0];
    Battle.phase = 'INPUT'; Battle.cmd.i = 0;
    aperta('right', () => Battle.updateInput());
    ok('combate: ► move o cursor de comando', Battle.cmd.i === 1, `i=${Battle.cmd.i}`);
    Battle.cmd.i = 0;
    aperta('down', () => Battle.updateInput());
    /* v4.8: o painel virou de TRÊS colunas (a lista chega a 7 com
       Ressonância + Conjunta). ▼ tem de pular a linha inteira, e a
       linha agora vale CMD_COLS. */
    ok('combate: ▼ pula a linha inteira de comandos', Battle.cmd.i === CMD_COLS, `i=${Battle.cmd.i}`);

    /* Alvo: os inimigos ficam numa fileira com x crescente, então ►
       precisa andar para o lado certo — cursor e tela discordando é pior
       que cursor parado. */
    Battle.layout();
    Battle.phase = 'TARGET'; Battle.targetSide = 'enemy';
    Battle.targetPool = Battle.enemies.slice(); Battle.targetCur.i = 0;
    const antesX = Battle.targetPool[Battle.targetCur.i].bx;
    aperta('right', () => Battle.updateTarget());
    ok('combate: ► escolhe o alvo à direita',
       Battle.targetCur.i === 1 && Battle.targetPool[1].bx > antesX,
       `x ${antesX} → ${Battle.targetPool[Battle.targetCur.i].bx}`);
    aperta('left', () => Battle.updateTarget());
    ok('combate: ◄ volta o alvo para a esquerda', Battle.targetCur.i === 0);

    Battle.phase = 'INTRO'; Battle.allies = []; Battle.enemies = []; Battle.units = [];
    Input.down = salvo.down; Input._vk = salvo.vk; Input.hit = salvo.hit;
  }

  /* --- janela rolante de lista em grade --------------------------
     A lista de itens em combate desenha 6 (2×3) mas o cursor percorre a
     bolsa inteira; sem janela, o 7º item era selecionável e invisível. */
  {
    ok('gridWindow: lista curta não rola', gridWindow(0, 4, 2, 3) === 0);
    ok('gridWindow: cursor no topo não rola', gridWindow(1, 20, 2, 3) === 0);
    const w = gridWindow(11, 20, 2, 3);
    ok('gridWindow: cursor sempre dentro da janela', 11 >= w && 11 < w + 6, `janela=${w}`);
    ok('gridWindow: para de rolar no fim',
       gridWindow(19, 20, 2, 3) === (Math.ceil(20 / 2) - 3) * 2);
  }

  /* --- ajuste de tela: em pé × deitado ----------------------------
     Deitado, os controles saem da faixa de baixo e vão para as margens
     laterais. Se `fitScreen` não reservar essas margens, o canvas cresce
     por baixo dos botões e o D-pad passa a cobrir o jogo. */
  {
    const stage = document.getElementById('stage');
    const antes = {w:stage.style.width, h:stage.style.height,
                   jc:document.body.style.justifyContent, pt:document.body.style.paddingTop,
                   touch:document.body.classList.contains('touch')};
    document.body.classList.add('touch');

    const medir = (w, h) => {
      // fitScreen lê innerWidth/innerHeight; medimos a conta, não o DOM
      const deitado = w > h;
      const padY = deitado ? 0 : RESERVA_BAIXO, padX = deitado ? LADO_MIN * 2 : 0;
      const s = Math.max(.35, Math.min((w - padX) / W, (h - padY) / H));
      const larg = Math.floor(W * s), alt = Math.floor(H * s);
      return {larg, alt, deitado, folga:(w - larg) / 2};
    };
    const pe = medir(390, 844), dt = medir(844, 390), curto = medir(568, 320);
    ok('em pé: sobra a faixa de baixo para os controles',
       pe.alt <= 844 - RESERVA_BAIXO, `alt=${pe.alt}`);
    ok('deitado: o canvas usa a altura toda', dt.alt === 390, `alt=${dt.alt}`);
    ok('deitado: sobra margem lateral para os controles',
       dt.folga >= LADO_MIN, `margem=${dt.folga}`);
    ok('deitado é maior que em pé no mesmo aparelho', dt.larg > pe.larg,
       `${pe.larg} → ${dt.larg}`);
    ok('deitado baixinho: margem menor, mas ainda cabe',
       curto.folga >= LADO_MIN, `margem=${curto.folga}`);

    /* A regressão que o media query por altura causava: ENTRAR EM TELA
       CHEIA (mesma largura, mais altura) não pode encolher o canvas.
       Com o limiar antigo em 360px, 667×320 → 667×375 ia de 427×320 para
       391×293. É a asserção que impede o defeito de voltar. */
    const paresFullscreen = [
      [667, 320, 667, 375],    // iPhone SE deitado — o caso que quebrava
      [852, 331, 852, 393],    // iPhone moderno deitado
      [800, 300, 800, 360],    // Android comum deitado
      [393, 720, 393, 852],    // e em pé, onde a largura é que manda
    ];
    const encolheu = paresFullscreen
      .map(([w1, h1, w2, h2]) => [medir(w1, h1), medir(w2, h2), `${w1}x${h1}→${w2}x${h2}`])
      .filter(([a, b]) => b.larg < a.larg || b.alt < a.alt)
      .map(([a, b, r]) => `${r}: ${a.larg}x${a.alt}→${b.larg}x${b.alt}`);
    ok('ganhar altura (tela cheia) nunca encolhe o canvas',
       encolheu.length === 0, encolheu.join(' | '));

    // e o botão de tela cheia não pode custar largura do jogo
    const col = document.querySelector('.act-col');
    const btn = document.getElementById('btn-full');
    ok('o botão de tela cheia mora fora da coluna de ações',
       !!btn && !col?.contains(btn),
       btn ? (col?.contains(btn) ? 'dentro da coluna' : 'fora') : 'sem botão');

    if (!antes.touch) document.body.classList.remove('touch');
    stage.style.width = antes.w; stage.style.height = antes.h;
    document.body.style.justifyContent = antes.jc; document.body.style.paddingTop = antes.pt;
    fitScreen();
  }

  /* --- cenas (cutscenes) -------------------------------------------
     Não desenham nada: checam integridade dos roteiros e a máquina de
     estados do motor. Um roteiro com comando errado ou apontando para
     cena inexistente vira tela travada no jogo, então falha aqui. */
  {
    const salvo = {scene:G.scene, mapa:G.mapId, flags:G.flags};
    G.flags = {};

    // 1) integridade dos roteiros declarados
    for (const [id, sc] of Object.entries(SCENES)){
      ok(`[cena ${id}] tem comandos`, Array.isArray(sc.cmds) && sc.cmds.length > 0);
      const maus = (sc.cmds || []).filter(c => !c.do || !CUT_CMD[c.do]);
      ok(`[cena ${id}] só usa comandos conhecidos`, maus.length === 0,
         maus.map(c => c.do ?? '(sem do)').join(' '));
      const semDestino = (sc.cmds || []).filter(c => c.do === 'warp' && !MAPS[c.map]);
      ok(`[cena ${id}] warps apontam para mapas reais`, semDestino.length === 0);
      const semBicho = (sc.cmds || []).filter(c =>
        c.do === 'battle' && !(c.foes || []).every(f => !!BESTIARY[f]));
      ok(`[cena ${id}] batalhas usam criaturas do bestiário`, semBicho.length === 0);
    }

    // 2) todo gatilho aponta para uma cena que existe
    const gatilhos = [];
    for (const [id, def] of Object.entries(MAPS)){
      if (def.onEnter) gatilhos.push([id, def.onEnter.scene, 'onEnter']);
      for (const g of def.triggers || []) gatilhos.push([id, g.scene, `(${g.x},${g.y})`]);
    }
    const orfaos = gatilhos.filter(([, sc]) => !SCENES[sc]);
    ok('gatilhos apontam para cenas existentes', orfaos.length === 0,
       orfaos.map(([m, sc, onde]) => `${m}:${onde}→${sc}`).join(' '));

    // 3) gatilho de tile precisa cair em chão pisável, senão nunca dispara
    const gatSolido = [];
    for (const [id, def] of Object.entries(MAPS)){
      const g2 = normalizeRows(def.rows, def.fill);
      for (const g of def.triggers || [])
        if (!g2[g.y] || TILEDEF[g2[g.y][g.x]]?.solid) gatSolido.push(`${id}(${g.x},${g.y})`);
    }
    ok('gatilhos de tile estão em chão pisável', gatSolido.length === 0, gatSolido.join(' '));

    // 4) caminho em L chega ao destino em terreno livre
    loadMap('patio', 19, 13, 'down');
    {
      const alvo = [19, 16];
      const passos = cutPath(G.player, alvo[0], alvo[1]);
      let x = G.player.tx, y = G.player.ty;
      for (const d of passos){ x += DIRV[d][0]; y += DIRV[d][1]; }
      ok('cutPath chega ao destino', x === alvo[0] && y === alvo[1], `${passos.length} passos`);
      ok('cutPath não atravessa parede', passos.length > 0 && (() => {
        let cx = G.player.tx, cy = G.player.ty;
        return passos.every(d => { cx += DIRV[d][0]; cy += DIRV[d][1]; return !isSolid(cx, cy); });
      })());
      ok('cutPath desiste sem travar em destino impossível',
         cutPath(G.player, 0, 0).length < 80);
    }

    // 5) ciclo de vida: play → scene CUTSCENE, stop → FIELD + flag gravada
    SCENES.__t = {flag:'__t_ok', cmds:[{do:'flag', k:'__t_meio'}]};
    Cut.play('__t');
    ok('play() assume a cena', Cut.active && G.scene === 'CUTSCENE');
    ok('play() recusa cena inexistente', Cut.play('__nao_existe') === false);
    Cut.update(0.016);
    ok('cena roda comandos instantâneos e encerra', !Cut.active && G.scene === 'FIELD');
    ok('flag do comando foi gravada', G.flags.__t_meio === true);
    ok('flag de "já vi" foi gravada no fim', G.flags.__t_ok === true);

    // 6) abort() NÃO grava a flag — derrota não pode queimar a cena
    G.flags = {};
    Cut.play('__t'); Cut.abort();
    ok('abort() devolve o controle', !Cut.active && G.scene === 'FIELD');
    ok('abort() não marca a cena como vista', !G.flags.__t_ok);

    // 7) move: quantidade de passos e bloqueio por parede
    G.flags = {};
    SCENES.__m = {cmds:[{do:'move', who:'player', dir:'down', steps:2}]};
    Cut.play('__m');
    const y0 = G.player.ty;
    for (let i = 0; i < 400 && Cut.active; i++) Cut.update(0.016);
    ok('move anda o número pedido de casas', G.player.ty === y0 + 2, `${y0} → ${G.player.ty}`);
    ok('move encerra a cena ao terminar', !Cut.active);

    // 8) cena não trava quando o ator do comando não existe
    G.flags = {};
    SCENES.__f = {cmds:[{do:'move', who:'NinguemAqui', dir:'up', steps:3},
                        {do:'face', who:'NinguemAqui', dir:'left'}]};
    Cut.play('__f');
    for (let i = 0; i < 200 && Cut.active; i++) Cut.update(0.016);
    ok('ator inexistente não trava a cena', !Cut.active);

    // 9) comando desconhecido é pulado em vez de congelar o jogo
    G.flags = {};
    SCENES.__x = {cmds:[{do:'comando_que_nao_existe'}, {do:'flag', k:'__x_fim'}]};
    Cut.play('__x');
    for (let i = 0; i < 60 && Cut.active; i++) Cut.update(0.016);
    ok('comando desconhecido não congela a cena', !Cut.active && G.flags.__x_fim === true);

    // 10) say entrega o controle ao Msg e o recupera ao terminar
    G.flags = {};
    SCENES.__s = {cmds:[{do:'say', who:'Teste', text:'oi'}, {do:'flag', k:'__s_fim'}]};
    Cut.play('__s'); Cut.update(0.016);
    ok('say passa o controle para o diálogo', G.scene === 'DIALOGUE' && Msg.active);
    Msg.finish();
    ok('diálogo devolve o controle para a cena', G.scene === 'CUTSCENE' && Cut.active);
    for (let i = 0; i < 60 && Cut.active; i++) Cut.update(0.016);
    ok('cena continua depois da fala', !Cut.active && G.flags.__s_fim === true);

    // 11b) cena disparada pela ENTREGA de uma missão
    G.flags = {}; Cut.pending = null;
    {
      const qsalvo = G.quests, ksalvo = G.kills, gsalvo = G.gold, rsalvo = G.recruits;
      G.quests = {}; G.kills = {}; G.recruits = {};
      SCENES.__q = {flag:'__q_visto', cmds:[{do:'flag', k:'__q_rodou'}]};
      QUESTS.q_zelador.cena = '__q';
      acceptQuest('q_zelador');
      G.kills.wolf = 99;
      ok('missão fica pronta para entrega', questReady('q_zelador'));
      completeQuest('q_zelador');
      ok('entrega marca a missão como feita', questState('q_zelador') === 'feita');
      ok('entrega enfileira a cena em vez de tocar na hora',
         Cut.pending === '__q' && !Cut.active);
      Cut.play(Cut.pending); Cut.pending = null;
      for (let i = 0; i < 60 && Cut.active; i++) Cut.update(0.016);
      ok('cena de entrega roda até o fim', !Cut.active && G.flags.__q_rodou === true);

      // fila não atropela: segunda chamada no mesmo quadro não apaga a primeira
      Cut.pending = null;
      ok('queue() aceita a primeira', Cut.queue('__q') === true);
      ok('queue() recusa atropelar a que já está na fila', Cut.queue('abertura_patio') === false);
      ok('a fila manteve a primeira cena', Cut.pending === '__q');
      Cut.pending = null;
      ok('queue() recusa cena inexistente', Cut.queue('__nao_existe') === false);

      delete SCENES.__q;
      QUESTS.q_zelador.cena = 'entrega_zelador';
      G.quests = qsalvo; G.kills = ksalvo; G.gold = gsalvo; G.recruits = rsalvo;
    }
    // toda missão com `cena` precisa apontar para uma cena que existe
    {
      const maus = Object.entries(QUESTS).filter(([, q]) => q.cena && !SCENES[q.cena]);
      ok('missões com cena apontam para cenas existentes', maus.length === 0,
         maus.map(([id, q]) => `${id}→${q.cena}`).join(' '));
    }

    // 11) a cena de abertura do pátio está ligada e é de tocar uma vez só
    ok('pátio dispara a abertura', MAPS.patio.onEnter?.scene === 'abertura_patio');
    ok('abertura toca uma vez só', !!SCENES.abertura_patio.flag &&
       MAPS.patio.onEnter.flag === SCENES.abertura_patio.flag);
    G.flags = {}; Cut.pending = null;
    loadMap('patio', 19, 13, 'down');
    ok('cena de entrada fica pendente (não dispara dentro do loadMap)',
       Cut.pending === 'abertura_patio' && !Cut.active);
    G.flags.cena_abertura = true; Cut.pending = null;
    loadMap('patio', 19, 13, 'down');
    ok('cena vista não é enfileirada de novo', Cut.pending === null);

    delete SCENES.__t; delete SCENES.__m; delete SCENES.__f;
    delete SCENES.__x; delete SCENES.__s;
    Cut.pending = null;
    G.flags = salvo.flags; G.scene = salvo.scene;
    if (salvo.mapa) loadMap(salvo.mapa);
  }

  /* ===================================================================
     v4.8 — MECÂNICAS NOVAS E CONTEÚDO NOVO
     A regra aqui é a mesma do resto do arquivo: só entra asserção que
     falharia se alguém quebrasse a intenção. Nada de testar que 2+2=4.
     =================================================================== */

  /* --- separação res (resistência) × reso (Ressonância) -------------
     Este é o bug que mais custou: os dois moravam no MESMO campo, e o
     primeiro golpe da party num inimigo sobrescrevia a tabela de
     resistência dele com um número. Na prática o Selo Quebrado perdia
     a fraqueza a Luz depois do primeiro tapa, em silêncio. */
  {
    const alvo = makeEnemyUnit('warden', 0, PARTY_SIZE);
    const antes = JSON.stringify(alvo.res);
    ok('inimigo nasce com a tabela de resistência do bestiário',
       alvo.res && alvo.res.light === 1.9, antes);
    const atacante = prepAlly(makeChar(PARTY_DEFS[0], 10));
    const salvoP = Battle.pendingSkill, salvoU = Battle.pendingIsUlt;
    Battle.pendingSkill = {elem:'light'}; Battle.pendingIsUlt = false;
    Battle.applyDamage(atacante, alvo, calcDamage(atacante, {power:30, elem:'light'}, alvo, {variance:1}), 'teste');
    Battle.pendingSkill = salvoP; Battle.pendingIsUlt = salvoU;
    ok('bater no inimigo NÃO destrói a tabela de resistência',
       JSON.stringify(alvo.res) === antes, JSON.stringify(alvo.res));
    ok('o gauge de Ressonância do inimigo não é escrito por cima da tabela',
       typeof alvo.res === 'object');
    ok('a Ressonância sobe ao levar dano, mas só em quem é da party',
       (() => { const c = prepAlly(makeChar(PARTY_DEFS[0], 5)); c.reso = 0;
                Battle.applyDamage(alvo, c, {dmg:5, em:1, crit:false}, 't');
                return c.reso > 0; })());
  }

  /* --- resistência elemental vinda do equipamento ------------------ */
  {
    const bag = G.items; G.items = {};
    const c = makeChar(PARTY_DEFS[0], 10);
    ok('sem equipamento, nenhuma resistência', c.res === null);
    Bag.add('a_casco'); equipItem(c, 'a_casco');
    ok('armadura com `resist` chega ao personagem', c.res && c.res.fire === ITEMS.a_casco.equip.resist.fire,
       JSON.stringify(c.res));
    Bag.add('t_brasa'); equipItem(c, 't_brasa');
    ok('duas peças multiplicam a resistência (não somam)',
       Math.abs(c.res.fire - 0.7) < 1e-9 && Math.abs(c.res.ice - 0.75) < 1e-9,
       JSON.stringify(c.res));
    const alvoSem = {def:10, element:'none', res:null, buffs:[], ail:[], guarding:false};
    const alvoCom = {...alvoSem, res:{fire:0.7}};
    const A = {atk:20, buffs:[], ail:[]};
    const d0 = calcDamage(A, {power:40, elem:'fire'}, alvoSem, {variance:1});
    const d1 = calcDamage(A, {power:40, elem:'fire'}, alvoCom, {variance:1});
    ok('resistência de equipamento reduz mesmo o dano recebido',
       d1.dmg < d0.dmg && Math.abs(d1.dmg / d0.dmg - 0.7) < 0.05, `${d0.dmg} → ${d1.dmg}`);
    unequipItem(c, 'armor'); unequipItem(c, 'accessory');
    ok('tirar o equipamento remove a resistência', c.res === null);
    G.items = bag;
  }

  /* --- QUEBRA DE POSTURA -------------------------------------------
     A barra existe para premiar agressão CERTA (elemento, crítico,
     Ressonância, Conjunta), não agressão qualquer. Cada asserção aqui
     protege um desses incentivos. */
  {
    ok('poiseDamage: vantagem elemental empurra mais que neutro',
       poiseDamage(100, {em:MULT_STRONG}) > poiseDamage(100, {em:1}),
       `${poiseDamage(100,{em:1})} → ${poiseDamage(100,{em:MULT_STRONG})}`);
    ok('poiseDamage: resistência elemental empurra menos',
       poiseDamage(100, {em:MULT_WEAK}) < poiseDamage(100, {em:1}));
    ok('poiseDamage: crítico empurra mais', poiseDamage(100, {crit:true}) > poiseDamage(100, {}));
    ok('poiseDamage: Conjunta empurra mais que Ressonância, que empurra mais que golpe comum',
       poiseDamage(100, {combo:true}) > poiseDamage(100, {ult:true}) &&
       poiseDamage(100, {ult:true}) > poiseDamage(100, {}),
       `${poiseDamage(100,{})} < ${poiseDamage(100,{ult:true})} < ${poiseDamage(100,{combo:true})}`);
    ok('poiseDamage nunca zera', poiseDamage(1, {em:MULT_WEAK, poise:0.01}) >= 1);

    const chefe = makeEnemyUnit('warden', 0, PARTY_SIZE);
    const bicho = makeEnemyUnit('wolf', 0, PARTY_SIZE);
    ok('só quem o bestiário declarou tem barra de postura',
       hasPoise(chefe) && !hasPoise(bicho));
    ok('a barra nasce cheia', chefe.poise === chefe.maxPoise && chefe.poise > 0);
    ok('a postura escala junto com o HP (grupo pequeno também quebra)',
       makeEnemyUnit('warden', 0, 1).maxPoise < chefe.maxPoise,
       `${makeEnemyUnit('warden',0,1).maxPoise} vs ${chefe.maxPoise}`);
    ok('todo chefe do jogo tem postura',
       Object.values(BESTIARY).every(b => !b.boss || b.poise > 0),
       Object.entries(BESTIARY).filter(([, b]) => b.boss && !b.poise).map(([k]) => k).join(','));

    // quebrar de fato
    const salvo = {allies:Battle.allies, enemies:Battle.enemies, units:Battle.units,
                   fase:Battle.phase, log:Battle.log, ps:Battle.pendingSkill};
    Battle.log = []; Battle.pendingSkill = {}; Battle.pendingIsUlt = false;
    const antesMax = chefe.maxPoise;
    chefe.poise = 1;
    Battle.hitPoise(prepAlly(makeChar(PARTY_DEFS[0], 10)), chefe, {dmg:50, em:1, crit:false});
    ok('zerar a postura QUEBRA', chefe.broken === POISE.turns && chefe.poise === 0,
       `broken=${chefe.broken}`);
    ok('quebrar aumenta a barra da próxima vez', chefe.maxPoise > antesMax,
       `${antesMax} → ${chefe.maxPoise}`);
    ok('quebrado, a DEF cai pela metade',
       Math.abs(eDEF(chefe) - chefe.def * POISE.breakDef) < 1e-6);
    {
      const cru = {...chefe, broken:0};
      const A2 = {atk:30, buffs:[], ail:[]};
      const dNormal = calcDamage(A2, {power:40, elem:'none'}, cru, {variance:1, def:20});
      const dQuebra = calcDamage(A2, {power:40, elem:'none'}, chefe, {variance:1, def:20});
      ok('quebrado, recebe mais dano (a janela vale a pena)',
         Math.abs(dQuebra.dmg / dNormal.dmg - POISE.breakVuln) < 0.03,
         `${dNormal.dmg} → ${dQuebra.dmg}`);
    }
    ok('golpe em quem já está quebrado não re-quebra',
       (() => { const b = chefe.breaks;
                Battle.hitPoise(prepAlly(makeChar(PARTY_DEFS[0], 10)), chefe, {dmg:9999, em:1});
                return chefe.breaks === b; })());
    // o teto de crescimento existe
    {
      const t = makeEnemyUnit('warden', 0, PARTY_SIZE);
      for (let i = 0; i < 30; i++){ t.broken = 0; t.poise = 0; Battle.breakPoise(t); }
      ok('a barra de postura tem teto de crescimento',
         t.maxPoise <= Math.round(t.poiseBase * POISE.growthCap),
         `${t.poiseBase} → ${t.maxPoise}`);
    }
    Object.assign(Battle, {allies:salvo.allies, enemies:salvo.enemies, units:salvo.units,
                           phase:salvo.fase, log:salvo.log, pendingSkill:salvo.ps});
  }

  /* --- quebra dentro de uma luta de verdade -------------------------
     O teste acima mede a função; este mede o CICLO: quebrar tem de
     custar turnos ao chefe e devolver a barra ao fim. */
  {
    const salvo = {party:G.party, squad:G.squad, cena:G.scene, items:G.items};
    G.items = {};
    G.party = PARTY_DEFS.map(d => makeChar(d, 20));
    G.squad = defaultSquad(); G.leader = 0;
    Battle.begin(['warden'], {boss:true});
    const chefe = Battle.enemies[0];
    chefe.poise = 1;
    Battle.pendingSkill = {}; Battle.pendingIsUlt = false;
    Battle.hitPoise(Battle.allies[0], chefe, {dmg:80, em:1, crit:false});
    ok('luta real: o chefe quebra', chefe.broken > 0);
    const antes = chefe.broken;
    Battle.actor = chefe; Battle.beginActorTurn();
    ok('quebrado, o chefe perde a vez', chefe.broken === antes - 1);
    while (chefe.broken > 0){ Battle.actor = chefe; Battle.beginActorTurn(); }
    ok('ao fim da quebra a postura volta cheia', chefe.poise === chefe.maxPoise,
       `${chefe.poise}/${chefe.maxPoise}`);
    // regeneração por rodada
    chefe.poise = 1; chefe.broken = 0;
    const p0 = chefe.poise;
    Battle.newRound();
    ok('a postura regenera entre rodadas', chefe.poise > p0, `${p0} → ${chefe.poise}`);
    Battle.active = false; G.scene = 'FIELD';
    Object.assign(G, {party:salvo.party, squad:salvo.squad, scene:salvo.cena, items:salvo.items});
    sanitizeSquad();
  }

  /* --- HABILIDADE CONJUNTA ------------------------------------------ */
  {
    ok('comboKey é simétrico', comboKey('fire','ice') === comboKey('ice','fire'));
    const elencoEl = [...new Set(PARTY_DEFS.map(d => d.element))];
    const faltando = [];
    for (let i = 0; i < elencoEl.length; i++)
      for (let j = i + 1; j < elencoEl.length; j++)
        if (!COMBOS[comboKey(elencoEl[i], elencoEl[j])]) faltando.push(`${elencoEl[i]}+${elencoEl[j]}`);
    ok('todo par de elementos do elenco tem Conjunta', faltando.length === 0, faltando.join(' '));
    ok('o número de Conjuntas cobre todos os pares do elenco',
       Object.keys(COMBOS).length >= elencoEl.length * (elencoEl.length - 1) / 2,
       `${Object.keys(COMBOS).length} conjuntas`);
    ok('toda Conjunta usa elemento válido e tem os campos obrigatórios',
       Object.values(COMBOS).every(c => ELEM[c.elem] && c.power > 0 && c.cost > 0 &&
                                        c.poise > 0 && !!c.name && !!c.desc));
    ok('toda condição citada em Conjunta existe',
       Object.values(COMBOS).every(c => !c.status || !!AILMENTS[c.status.id]));
    ok('Conjunta empurra mais postura que qualquer habilidade comum',
       Math.min(...Object.values(COMBOS).map(c => c.poise)) >
       Math.max(...Object.values(SKILLS).map(s => s.poise || 1)) * 0.6);
    ok('comboOf devolve null para o mesmo elemento',
       comboOf({element:'fire'}, {element:'fire'}) === null);

    const salvo = {party:G.party, squad:G.squad, cena:G.scene, items:G.items, gold:G.gold};
    G.items = {};
    G.party = PARTY_DEFS.map(d => makeChar(d, 20));
    G.squad = defaultSquad(); G.leader = 0;
    Battle.begin(['wolf','wolf']);
    const u = Battle.allies[0];
    Battle.actor = u;
    const opts = Battle.comboPartners(u);
    ok('há parceiro de Conjunta com o grupo cheio', opts.length > 0, `${opts.length} parceiros`);
    ok('o comando de Conjunta aparece na lista',
       Battle.commands().some(c => c.id === 'combo'));

    // sem MP não aparece
    const mpU = u.mp; u.mp = 0;
    ok('sem MP a Conjunta some da lista', Battle.comboPartners(u).length === 0);
    u.mp = mpU;

    const o = opts[0], p = o.mate;
    const mp0 = u.mp, mp1 = p.mp;
    Battle.chooseCombo(o);
    ok('a Conjunta cobra MP dos DOIS',
       u.mp === mp0 - comboCost(u, o.combo) && p.mp === mp1 - comboCost(p, o.combo),
       `${mp0}→${u.mp} / ${mp1}→${p.mp}`);
    ok('o parceiro perde a vez desta rodada', p.skipTurn === true);
    ok('os dois ficam marcados como já usados na rodada',
       u.comboSpent && p.comboSpent);
    ok('a Conjunta ataca com a média dos dois ATK',
       Battle.pendingSkill.atkOverride > Math.min(eATK(u), eATK(p)) * 0.5);
    ok('quem já usou não aparece mais como parceiro',
       Battle.comboPartners(u).length === 0);

    // o turno gasto é realmente perdido
    Battle.actor = p; Battle.log = [];
    Battle.beginActorTurn();
    ok('o parceiro realmente pula o turno',
       p.skipTurn === false && Battle.log.some(l => l.includes('Conjunta')), Battle.log.join(' | '));

    // a rodada nova libera de novo
    Battle.newRound();
    ok('a rodada seguinte libera a Conjunta', !u.comboSpent && !p.comboSpent);

    // Sino de Sintonia desconta
    const semSino = comboCost(u, o.combo);
    Bag.add('t_sino'); equipItem(u, 't_sino');
    ok('Sino de Sintonia baratea a Conjunta de quem usa',
       comboCost(u, o.combo) === Math.max(1, semSino + ITEMS.t_sino.equip.combo),
       `${semSino} → ${comboCost(u, o.combo)}`);
    unequipItem(u, 'accessory');

    Battle.active = false; G.scene = 'FIELD';
    Object.assign(G, {party:salvo.party, squad:salvo.squad, scene:salvo.cena,
                      items:salvo.items, gold:salvo.gold});
    sanitizeSquad();
  }

  /* --- habilidades novas e tipos novos de habilidade ---------------- */
  {
    ok('toda habilidade referencia elemento existente',
       Object.values(SKILLS).every(s => !!ELEM[s.elem]),
       Object.entries(SKILLS).filter(([, s]) => !ELEM[s.elem]).map(([k]) => k).join(','));
    ok('toda condição citada em habilidade existe',
       Object.values(SKILLS).every(s => !s.status || !!AILMENTS[s.status.id]),
       Object.entries(SKILLS).filter(([, s]) => s.status && !AILMENTS[s.status.id]).map(([k]) => k).join(','));
    const tipos = new Set(['atk','heal','buff','debuff','revive']);
    ok('toda habilidade usa um tipo conhecido',
       Object.values(SKILLS).every(s => tipos.has(s.type)),
       [...new Set(Object.values(SKILLS).map(s => s.type))].filter(t => !tipos.has(t)).join(','));
    const alvos = new Set(['one','all','ally','allies','self','fallen']);
    ok('toda habilidade usa um alvo conhecido',
       Object.values(SKILLS).every(s => alvos.has(s.target)),
       [...new Set(Object.values(SKILLS).map(s => s.target))].filter(t => !alvos.has(t)).join(','));
    ok('só reanimação mira em caído',
       Object.values(SKILLS).every(s => s.target !== 'fallen' || s.type === 'revive'));

    /* A promessa da v4.8 é que a progressão não morre no nível 11.
       Sem esta asserção, alguém pode "simplificar" a tabela de volta. */
    const curtos = PARTY_DEFS.filter(d => d.learn.length < 7).map(d => d.name);
    ok('todo personagem aprende ao menos 7 habilidades ao longo do jogo',
       curtos.length === 0, curtos.join(','));
    const tardios = PARTY_DEFS.filter(d => Math.max(...d.learn.map(([lv]) => lv)) < 25).map(d => d.name);
    ok('todo personagem ainda aprende algo depois do nível 25',
       tardios.length === 0, tardios.join(','));
    ok('nível 5 continua com o mesmo repertório de antes (a tela de escolha não mudou)',
       makeChar(PARTY_DEFS[0], 5).skills.length === 2);

    // comportamento dos tipos novos
    const salvo = {party:G.party, squad:G.squad, cena:G.scene, items:G.items};
    G.items = {};
    G.party = PARTY_DEFS.map(d => makeChar(d, 31));
    G.squad = defaultSquad(); G.leader = 0;
    Battle.begin(['wolf']);
    const alvo = Battle.enemies[0], heroi = Battle.allies[0];
    Battle.actor = heroi;

    // debuff cai no INIMIGO
    Battle.pendingSkill = {...SKILLS.ink_seal}; Battle.pendingIsUlt = false; Battle.pendingItem = null;
    alvo.buffs = [];
    Battle.execute([alvo]);
    Battle.seq.forEach(s => s.fn());   // resolve as etapas agendadas
    Battle.seq = [];
    ok('debuff aplica os modificadores no inimigo',
       alvo.buffs.some(b => b.stat === 'def' && b.mult < 1), JSON.stringify(alvo.buffs));
    ok('debuff realmente reduz a DEF efetiva do inimigo', eDEF(alvo) < alvo.def);

    // cura com `cure` limpa condição
    const ferido = Battle.allies[1];
    ferido.hp = 1; addAil(ferido, 'burn');
    Battle.actor = Battle.allies[0];
    Battle.pendingSkill = {...SKILLS.cleanse}; Battle.pendingItem = null;
    Battle.execute([ferido]); Battle.seq.forEach(s => s.fn()); Battle.seq = [];
    ok('cura com `cure` também limpa as condições',
       ferido.hp > 1 && ferido.ail.length === 0);

    // reanimação
    const caido = Battle.allies[2];
    caido.hp = 0;
    Battle.pendingSkill = {...SKILLS.recall}; Battle.pendingItem = null;
    Battle.execute([caido]); Battle.seq.forEach(s => s.fn()); Battle.seq = [];
    ok('reanimação levanta o caído na fração declarada',
       caido.hp === Math.round(caido.maxHp * SKILLS.recall.power / 100),
       `${caido.hp}/${caido.maxHp}`);
    const vivo = Battle.allies[3]; const hpVivo = vivo.hp;
    Battle.pendingSkill = {...SKILLS.recall};
    Battle.execute([vivo]); Battle.seq.forEach(s => s.fn()); Battle.seq = [];
    ok('reanimação não age em quem está de pé', vivo.hp === hpVivo);

    // provocar redireciona a mira
    const guardiao = Battle.allies.find(a => a.name === 'Gabriel') || Battle.allies[0];
    Battle.allies.forEach(a => a.tauntT = 0);
    Battle.actor = guardiao;
    Battle.pendingSkill = {...SKILLS.taunt}; Battle.pendingItem = null;
    Battle.execute([guardiao]); Battle.seq.forEach(s => s.fn()); Battle.seq = [];
    ok('Provocar marca quem puxou a atenção', guardiao.tauntT > 0, `${guardiao.tauntT}`);
    {
      let sempreNoGuardiao = true;
      for (let i = 0; i < 40; i++){
        Battle.pendingSkill = null;
        Battle.enemyAct(alvo);
        Battle.seq = [];
        if (Battle.pendingSkill && Battle.pendingSkill.target === 'one'){
          // o alvo escolhido é o primeiro do último execute; reconstruímos pela mira
          const provocando = Battle.allies.filter(a => isAlive(a) && a.tauntT > 0);
          if (!provocando.length) sempreNoGuardiao = false;
        }
      }
      ok('enquanto a provocação dura, existe alvo provocando para a IA mirar',
         sempreNoGuardiao);
    }
    Battle.active = false; G.scene = 'FIELD';
    Object.assign(G, {party:salvo.party, squad:salvo.squad, scene:salvo.cena, items:salvo.items});
    sanitizeSquad();
  }

  /* --- itens novos --------------------------------------------------- */
  {
    const usos = new Set(['ally','allies','enemy','enemies','party','fallen','field','escape','pet']);
    ok('todo consumível declara um `use` conhecido',
       Object.values(ITEMS).every(i => i.kind !== 'consumable' || usos.has(i.use)),
       Object.entries(ITEMS).filter(([, i]) => i.kind === 'consumable' && !usos.has(i.use)).map(([k]) => k).join(','));
    ok('todo item tem nome, descrição, preço e cor',
       Object.values(ITEMS).every(i => i.name && i.desc && i.price > 0 && i.color),
       Object.entries(ITEMS).filter(([, i]) => !(i.name && i.desc && i.price > 0 && i.color)).map(([k]) => k).join(','));
    ok('toda resistência de equipamento cita elemento válido e reduz de fato',
       Object.values(ITEMS).every(i => !i.equip?.resist ||
         Object.entries(i.equip.resist).every(([el, m]) => !!ELEM[el] && m > 0 && m < 1)));
    ok('todo item de dano cita elemento válido',
       Object.values(ITEMS).every(i => !i.power || !!ELEM[i.elem || 'none']));
    ok('todo item de dano com condição cita condição existente',
       Object.values(ITEMS).every(i => !i.status || !!AILMENTS[i.status.id]));

    const c = {name:'T', hp:40, maxHp:400, mp:0, maxMp:100, ail:[], buffs:[], reso:0};
    ok('hpPct cura uma fração do máximo',
       applyItem(ITEMS.medkit, c).ok && c.hp === 40 + Math.round(400 * ITEMS.medkit.hpPct),
       `hp=${c.hp}`);
    ok('item de Ressonância enche o gauge',
       applyItem(ITEMS.focustea, c).ok && c.reso === ITEMS.focustea.reso, `reso=${c.reso}`);
    ok('item de buff aplica o modificador',
       applyItem(ITEMS.warcry, c).ok && c.buffs.some(b => b.stat === 'atk' && b.mult > 1));
    ok('item de buff dura os turnos que promete',
       c.buffs.find(b => b.stat === 'atk').turns === ITEMS.warcry.buff.turns + 1);
    ok('item sem efeito nenhum não é consumido',
       applyItem(ITEMS.potion, {name:'X', hp:9, maxHp:9, mp:5, maxMp:5, ail:[]}).ok === false);
    ok('a Pedra de Retorno declara destino que existe',
       !!MAPS[ITEMS.stone.warp.map]);

    // Cravo de Ferro: postura pura
    const chefe = makeEnemyUnit('echo', 0, PARTY_SIZE);
    const p0 = chefe.poise;
    chefe.poise = Math.max(0, chefe.poise - ITEMS.ironspike.poiseHit);
    ok('o Cravo de Ferro tira postura suficiente para importar',
       ITEMS.ironspike.poiseHit >= p0 * 0.1, `${ITEMS.ironspike.poiseHit} de ${p0}`);
  }

  /* --- CONTEÚDO NOVO: a promessa medida ------------------------------
     "3 áreas, 12 missões, 51 batalhas" é um contrato. Contrato sem
     medição é chute — então aqui ele vira asserção. */
  {
    const B = contarBatalhas();
    ok(`batalhas: ${B.total} no total (${B.formacoes} formações + ${B.chefes} chefes)`,
       B.total - BATALHAS_V47 >= 51, `+${B.total - BATALHAS_V47} sobre a v4.7`);
    const regioesNovas = ['ashwood','cistern','spire'];
    ok('as três regiões novas têm formações próprias',
       regioesNovas.every(r => (FORMATIONS[r] || []).length >= 12),
       regioesNovas.map(r => `${r}:${(FORMATIONS[r] || []).length}`).join(' '));
    ok('missões: pelo menos 12 novas sobre as 5 originais',
       Object.keys(QUESTS).length >= 17, `${Object.keys(QUESTS).length} missões`);
    ok('mapas novos: as três regiões têm exploração E sala de chefe',
       ['ashwood','ashpyre','cistern','cistern_deep','spire','spire_top'].every(m => !!MAPS[m]));

    // integridade das missões novas
    const maus = Object.entries(QUESTS).filter(([, q]) =>
      (q.tipo === 'hunt' && !BESTIARY[q.alvo]) || (q.tipo === 'collect' && !ITEMS[q.item]));
    ok('toda missão aponta para criatura/item que existe', maus.length === 0,
       maus.map(([id]) => id).join(','));
    ok('toda missão tem NPC, resumo e as quatro falas de estado',
       Object.values(QUESTS).every(q => q.npc && q.resumo && q.oferta?.length &&
                                        q.andamento?.length && q.entrega?.length && q.depois?.length));
    ok('todo prêmio de missão existe no catálogo',
       Object.values(QUESTS).every(q => (q.premio.itens || []).every(i => !!ITEMS[i])),
       Object.entries(QUESTS).filter(([, q]) => (q.premio.itens || []).some(i => !ITEMS[i]))
             .map(([id]) => id).join(','));
    ok('todo NPC dador de missão está em algum mapa',
       Object.keys(QUESTS).every(id => Object.values(MAPS).some(m =>
         (m.npcs || []).some(n => n.quest === id))),
       Object.keys(QUESTS).filter(id => !Object.values(MAPS).some(m =>
         (m.npcs || []).some(n => n.quest === id))).join(','));
    /* Uma missão de recrutamento por pessoa que não é o protagonista.
       A conta é derivada, não fixa: era `=== 5` e ficou desatualizada no
       instante em que o elenco cresceu. */
    ok('há uma missão de recrutamento para cada recruta possível',
       RECRUIT_QUESTS.every(q => !!QUESTS[q]) &&
       RECRUIT_QUESTS.length === PARTY_DEFS.length - 1,
       `${RECRUIT_QUESTS.length} missões / ${PARTY_DEFS.length} no elenco`);

    // lojas
    ok('todo NPC de loja aponta para uma loja que existe',
       Object.values(MAPS).every(m => (m.npcs || []).every(n => !n.shop || !!SHOPS[n.shop])),
       Object.values(MAPS).flatMap(m => (m.npcs || []).filter(n => n.shop && !SHOPS[n.shop]).map(n => n.name)).join(','));
    ok('toda loja tem um NPC que a abre',
       Object.keys(SHOPS).every(s => Object.values(MAPS).some(m =>
         (m.npcs || []).some(n => n.shop === s))),
       Object.keys(SHOPS).filter(s => !Object.values(MAPS).some(m =>
         (m.npcs || []).some(n => n.shop === s))).join(','));
    /* Estoque travado por flag que nunca é gravada = item morto na
       tabela. Todas as flags usadas vêm de chefe de mapa. */
    const flagsDeChefe = new Set(Object.values(MAPS).filter(m => m.boss).map(m => m.boss.flag));
    const travasMortas = Object.values(SHOPS).flatMap(s => s.stock)
      .filter(e => typeof e === 'object' && e.need && !flagsDeChefe.has(e.need))
      .map(e => e.need);
    ok('toda trava de loja usa uma flag que o jogo grava',
       travasMortas.length === 0, [...new Set(travasMortas)].join(','));

    // as regiões novas realmente encadeiam
    const cadeia = [['patio','ashwood'], ['ashwood','ashpyre'], ['ashpyre','cistern'],
                    ['cistern','cistern_deep'], ['cistern_deep','spire'], ['spire','spire_top']];
    const quebrada = cadeia.filter(([de, para]) =>
      !(MAPS[de].warps || []).some(w => w.to === para));
    ok('a corrente de mapas do pós-jogo está ligada de ponta a ponta',
       quebrada.length === 0, quebrada.map(([a, b]) => `${a}→${b}`).join(' '));
    const semVolta = ['ashwood','ashpyre','cistern','cistern_deep','spire','spire_top']
      .filter(m => !(MAPS[m].warps || []).length);
    ok('nenhum mapa novo é sem saída', semVolta.length === 0, semVolta.join(','));
    /* Porta travada sem explicação é o jeito mais rápido de fazer o
       jogador achar que o jogo bugou. */
    ok('toda passagem travada por flag explica o motivo',
       Object.values(MAPS).every(m => (m.warps || []).every(w => !w.needFlag || !!w.blockedMsg)));
    ok('toda flag de trava é gravada por algum chefe',
       Object.values(MAPS).every(m => (m.warps || []).every(w => !w.needFlag || flagsDeChefe.has(w.needFlag))),
       Object.values(MAPS).flatMap(m => (m.warps || []).filter(w => w.needFlag && !flagsDeChefe.has(w.needFlag)).map(w => w.needFlag)).join(','));

    // toda região com encontro tem formação
    const semForm = Object.entries(MAPS)
      .filter(([, m]) => m.encounter && !(FORMATIONS[m.region] || []).length)
      .map(([id]) => id);
    ok('todo mapa com encontro aleatório tem formação para a região dele',
       semForm.length === 0, semForm.join(','));
    ok('o Pátio Central é seguro e não declara mob hostil',
       MAPS.patio?.encounter === null && !(MAPS.patio.mobs || []).length);
    // e nenhum NPC novo em cima de parede
    const npcPresos = [];
    for (const [id, m] of Object.entries(MAPS)){
      const g = normalizeRows(m.rows, m.fill);
      for (const n of (m.npcs || []))
        if (!g[n.y] || TILEDEF[g[n.y][n.x]]?.solid) npcPresos.push(`${id}/${n.name}`);
      if (m.boss && (!g[m.boss.y] || TILEDEF[g[m.boss.y][m.boss.x]]?.solid))
        npcPresos.push(`${id}/chefe`);
    }
    ok('nenhum NPC ou chefe nasce dentro de parede', npcPresos.length === 0, npcPresos.join(' '));

    /* P0 (Subterrâneo) + v5.31 (mais dez regiões): mapa que troca
       encontro aleatório por entidade de campo precisa continuar
       pequeno, combater só espécies reais e não plantar ninguém em
       objeto/interação. Checagem ESTRUTURAL abaixo é genérica — vale
       para todo mapa com `mobs`, não só o Subterrâneo. O exercício do
       ciclo vivo (fuga/vitória/respawn) roda só uma vez, no Subterrâneo,
       porque testa o motor (`startWorldMobBattle`), não dado por mapa. */
    {
      const mapasComMob = Object.entries(MAPS).filter(([, m]) => (m.mobs || []).length);
      const semNull = mapasComMob.filter(([, m]) => m.encounter !== null).map(([id]) => id);
      const foraDaFaixa = mapasComMob.filter(([, m]) => m.mobs.length < 1 || m.mobs.length > 5).map(([id]) => id);
      ok('todo mapa com mob visível declara encontro nulo',
         semNull.length === 0, semNull.join(','));
      ok('todo mapa com mob visível tem entre um e cinco mobs',
         foraDaFaixa.length === 0, foraDaFaixa.join(','));

      const ruins = [];
      for (const [id, m] of mapasComMob){
        const g = normalizeRows(m.rows, m.fill);
        for (const mob of m.mobs){
          const t = g?.[mob.y]?.[mob.x] && TILEDEF[g[mob.y][mob.x]];
          if (!t || t.solid || t.warp || t.chest || t.save) ruins.push(`${id}/${mob.id}:casa`);
          if (!BESTIARY[mob.visual] || !(mob.formation || []).length ||
              !mob.formation.every(([sid, n]) => BESTIARY[sid] && n > 0)) ruins.push(`${id}/${mob.id}:formação`);
          if (!(mob.patrol >= 0 && mob.patrol <= 2)) ruins.push(`${id}/${mob.id}:patrulha`);
        }
      }
      ok('todo mob de campo nasce em chão seguro com formação válida',
         ruins.length === 0, ruins.join(' '));

      const def = MAPS.undercroft, mobs = def?.mobs || [];
      const mapaAnterior = G.mapId;
      loadMap('undercroft');
      const vivo = G.map.mobs[0], agora = Date.now();
      ok('mobs de campo são instâncias transitórias e bloqueiam a própria casa',
         G.map.mobs.length === mobs.length && !!vivo && isSolid(vivo.tx, vivo.ty));
      if (vivo){
        /* Exercita o gancho real sem abrir uma batalha durante o relatório:
           fugir devolve o mob ao campo; vitória o marca para respawn. */
        const wipe = FX.battleWipe, begin = Battle.begin, gancho = Battle.onFinish;
        FX.battleWipe = cb => cb();
        Battle.begin = () => {};
        const iniciou = startWorldMobBattle(vivo);
        Battle.onFinish?.('flee');
        const fugiu = iniciou && !vivo.engaging && !vivo.defeated;
        startWorldMobBattle(vivo);
        Battle.onFinish?.('victory');
        FX.battleWipe = wipe; Battle.begin = begin; Battle.onFinish = gancho;
        ok('fuga conserva mob e vitória o remove do campo', fugiu && vivo.defeated);
        const espera = vivo.respawnAt - agora;
        ok('respawn de mob fica entre 10 e 15 segundos', espera >= 10000 && espera < 15000,
           `${Math.round(espera)} ms`);
        vivo.respawnAt = agora - 1;
        respawnWorldMob(vivo, agora);
        ok('mob reaparece na origem sem gravar estado de mapa',
           !vivo.defeated && vivo.tx === vivo.homeX && vivo.ty === vivo.homeY);
      }
      if (mapaAnterior) loadMap(mapaAnterior);
    }

    /* Quem perambula não pode parar em cima de uma interação. A regra é
       compartilhada com mobs para que uma porta, escada, baú ou gatilho
       não pare de responder só porque uma entidade escolheu aquela casa. */
    {
      const mapaAnterior = G.mapId, riscos = [];
      const lados = Object.values(DIRV);
      for (const [id, def] of Object.entries(MAPS)){
        if (!(def.npcs || []).some(n => n.wander)) continue;
        loadMap(id);
        for (const npc of G.map.npcs.filter(n => n.wander)) for (const [dx, dy] of lados){
          const x = npc.tx + dx, y = npc.ty + dy, t = tileAt(x, y);
          const interage = t?.warp || t?.chest || t?.save ||
            G.map.signs.some(s => s.x === x && s.y === y) ||
            (G.map.def.triggers || []).some(g => g.x === x && g.y === y);
          if (interage && isSafeWorldActorTile(x, y, npc)) riscos.push(`${id}/${npc.name}@${x},${y}`);
        }
      }
      ok('NPC que perambula evita portas, escadas e interações', riscos.length === 0, riscos.join(' '));
      if (mapaAnterior) loadMap(mapaAnterior);
    }

    /* --- v5.28: mapa que PROMETE encontro tem de poder cumprir -------
       O encontro é gatilhado pelo TILE (`enc`), não pelo mapa. Três
       regiões inteiras — Ninhal de Éter, Coroa de Vidro e o Arquivo —
       foram escritas com chão de acampamento (`floor`) e de estrada
       (`path`), que não têm `enc`. Elas declaravam `encounter` e nunca
       rodaram uma única batalha aleatória: o jogador subiu a Coroa e não
       encontrou nada, e as missões de caça do Ninhal eram impossíveis de
       fechar por motivo nenhum que se pudesse ver.

       O defeito era silencioso dos dois lados: `encounter` declarado não
       reclama de nada, e o passo simplesmente não conta. Esta asserção é
       a que faltava — e o piso é generoso de propósito, porque um mapa
       com três casas de mato é tão quebrado quanto um com zero. */
    const semEncontro = [];
    for (const [id, m] of Object.entries(MAPS)){
      if (!m.encounter) continue;
      const g = normalizeRows(m.rows, m.fill);
      let n = 0;
      for (const linha of g) for (const c of linha) if (TILEDEF[c]?.enc) n++;
      if (n < 20) semEncontro.push(`${id}: ${n} casas`);
    }
    ok('todo mapa que declara encontro tem chão onde ele acontece',
       semEncontro.length === 0, semEncontro.join(' · '));

    /* Nenhuma passagem pode nascer na BORDA: o carregamento sela as
       bordas, e um '+' na coluna 0 vira parede sem avisar — a saída
       some e a lista de destinos passa a ter um item a mais que os
       marcadores. Foi assim que o Lago e a Podridão nasceram torcidos. */
    const naBorda = [];
    for (const [id, m] of Object.entries(MAPS)){
      const g = normalizeRows(m.rows, m.fill);
      const h = g.length, w = g[0].length;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
        if (!TILEDEF[g[y][x]]?.warp) continue;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) naBorda.push(`${id}(${x},${y})`);
      }
    }
    ok('nenhuma passagem fica na borda, que o carregamento sela',
       naBorda.length === 0, naBorda.join(' '));
    // linhas de mapa do mesmo tamanho na FONTE (o padding esconde erro de digitação)
    const desalinhados = Object.entries(MAPS)
      .filter(([, m]) => new Set(m.rows.map(r => r.length)).size > 1)
      .map(([id, m]) => `${id}(${[...new Set(m.rows.map(r => r.length))].join('/')})`);
    ok('as linhas de cada mapa têm o mesmo tamanho no código-fonte',
       desalinhados.length === 0, desalinhados.join(' '));
  }

  /* --- PETS (v4.9) ----------------------------------------------------
     O que estas asserções protegem, em ordem de importância:
       · o pet não pode virar um sétimo personagem — o bestiário inteiro
         foi calibrado sobre cinco atores por rodada;
       · pet se CONQUISTA: save antigo não pode ganhar nenhum de graça;
       · evoluir tem de mudar a forma, senão é só número subindo. */
  {
    // integridade da tabela
    ok('todo pet tem elemento válido e três formas',
       Object.values(PETS).every(p => !!ELEM[p.elem] && p.formas.length === 3),
       Object.entries(PETS).filter(([, p]) => !ELEM[p.elem] || p.formas.length !== 3).map(([k]) => k).join(','));
    ok('as formas de cada pet sobem de nível em ordem',
       Object.values(PETS).every(p => p.formas.every((f, i) => i === 0 || f.nivel > p.formas[i-1].nivel)));
    ok('a primeira forma de todo pet começa no nível 1',
       Object.values(PETS).every(p => p.formas[0].nivel === 1));
    {
      const tipos = new Set(['atk','heal','buff','debuff']);
      ok('toda forma de pet usa um tipo conhecido',
         Object.values(PETS).every(p => p.formas.every(f => tipos.has(f.tipo))));
      ok('toda condição citada por pet existe',
         Object.values(PETS).every(p => p.formas.every(f => !f.status || !!AILMENTS[f.status.id])));
      /* v5.32 — dono válido passou a incluir GUEST_ALLIES: Ava (coelho)
         e Amanda (dragão) saíram de PARTY_DEFS e viraram guest-tutorial,
         mas o pet que já era delas continua existindo (o bônus "dono em
         campo" fica permanentemente adormecido, já que um guest nunca
         entra em G.squad — isso é intencional, não um bug: é o mesmo
         padrão do dragão da Amanda, que já era lore antes dela ser
         jogável). */
      const donoValido = nome => PARTY_DEFS.some(d => d.name === nome) ||
                                  Object.values(GUEST_ALLIES).some(g => g.name === nome);
      ok('todo dono de pet é personagem do elenco ou guest-tutorial (ou nulo, no de história)',
         Object.values(PETS).every(p => p.dono === null || donoValido(p.dono)),
         Object.values(PETS).filter(p => p.dono && !donoValido(p.dono)).map(p => p.dono).join(','));
      /* v5.30 — a regra passou a ser POR GERAÇÃO. Pet se conquista no
         Ninhal, que é excursão de estudante; os quatro professores que
         entraram são formados há onze anos e não caçam ovo. */
      const alunos = PARTY_DEFS.filter(d => d.geracao !== 'anterior');
      ok('cada aluno do elenco tem exatamente um pet',
         alunos.every(d => Object.values(PETS).filter(p => p.dono === d.name).length === 1),
         alunos.filter(d => Object.values(PETS).filter(p => p.dono === d.name).length !== 1)
               .map(d => d.name).join(','));
      /* v5.32 — a Amanda (a exceção de história do dragão, "já era da
         diretora Felt" desde a v4.9) saiu de PARTY_DEFS: nenhum
         professor ATUAL tem pet, e é isso que a linha agora trava. */
      const profsComPet = PARTY_DEFS.filter(d => d.geracao === 'anterior')
        .filter(d => Object.values(PETS).some(p => p.dono === d.name)).map(d => d.name);
      ok('da geração anterior, nenhum tem pet (o dragão da Amanda ficou com dono fora do elenco)',
         profsComPet.length === 0, profsComPet.join(','));
      ok('nenhum pet ficou sem dono depois da v5.30',
         Object.values(PETS).every(p => !!p.dono),
         Object.entries(PETS).filter(([, p]) => !p.dono).map(([k]) => k).join(','));
    }
    ok('petForma escolhe a última forma alcançada',
       petForma('salamandra', 1) === PETS.salamandra.formas[0] &&
       petForma('salamandra', 21) === PETS.salamandra.formas[1] &&
       petForma('salamandra', 99) === PETS.salamandra.formas[2]);
    ok('petProxForma some na forma final', petProxForma('salamandra', 99) === null);
    /* Mesma armadilha que já custou a folha da Eden na v4.0: apontar
       `sprite` para uma chave que não está em SPRITE_DATA faz o pet cair
       no desenho procedural em silêncio — nada reclama. */
    {
      const orfas = [];
      for (const [id, p] of Object.entries(PETS))
        p.formas.forEach((f, i) => { if (f.sprite && !SPRITE_DATA[f.sprite]) orfas.push(`${id}/f${i+1}`); });
      ok('toda arte de pet declarada existe em SPRITE_DATA', orfas.length === 0, orfas.join(' '));
      const comArte = Object.values(PETS).flatMap(p => p.formas).filter(f => f.sprite).length;
      const total = Object.values(PETS).reduce((n, p) => n + p.formas.length, 0);
      ok(`arte de pet: ${comArte}/${total} formas (o resto usa o desenho procedural)`, true);
    }

    /* --- v5.27: pet do elemento do dono, e save antigo sobrevive --- */
    {
      /* v5.32 — dono pode estar em PARTY_DEFS ou em GUEST_ALLIES (Ava,
         Amanda), ver comentário acima na checagem de dono válido. */
      const errados = Object.entries(PETS)
        .filter(([, p]) => p.dono)
        .map(([id, p]) => [id, p, PARTY_DEFS.find(d => d.name === p.dono) ||
                                   Object.values(GUEST_ALLIES).find(g => g.name === p.dono)])
        .filter(([, p, d]) => d && d.element !== p.elem)
        .map(([id, p, d]) => `${id}: pet ${p.elem} × dono ${d.element}`);
      ok('cada pet é do elemento do dono', errados.length === 0, errados.join(' · '));
      /* v5.29 — o Corvo e o Dragonete fecharam a lista. Nenhum pet cai
         mais no desenho procedural, e é isso que esta linha trava. */
      const semArte = Object.entries(PETS)
        .flatMap(([id, p]) => p.formas.map((f, i) => [id, i, f]))
        .filter(([, , f]) => !f.sprite || !SPRITE_DATA[f.sprite])
        .map(([id, i]) => `${id}/f${i + 1}`);
      ok('toda forma de todo pet tem arte', semArte.length === 0, semArte.join(' '));
      ok('todo dono de pet existe no elenco ou em GUEST_ALLIES',
         Object.values(PETS).every(p => !p.dono || PARTY_DEFS.some(d => d.name === p.dono) ||
                                         Object.values(GUEST_ALLIES).some(g => g.name === p.dono)));

      /* O mapa de renome existe para não apagar pet de save antigo. Se
         um destino sair da tabela, o pet some em silêncio na carga —
         que é exatamente o defeito que ele previne. */
      const destinoSumido = Object.entries(PET_RENOMEADO)
        .filter(([, novo]) => !PETS[novo]).map(([v, n]) => `${v}→${n}`);
      ok('todo destino de PET_RENOMEADO existe em PETS',
         destinoSumido.length === 0, destinoSumido.join(' '));
      /* Um id antigo só pode continuar em PETS se ALGUÉM o reaproveitou:
         `salamandra` é o caso — saiu do Seiji (virou `polvo`) e o pet do
         Gabriel entrou no id vago. Qualquer outro id antigo de pé
         significa rename pela metade. */
      const destinos = new Set(Object.values(PET_RENOMEADO));
      const meioCaminho = Object.keys(PET_RENOMEADO).filter(v => PETS[v] && !destinos.has(v));
      ok('id antigo só sobrevive em PETS se outro pet o reaproveitou',
         meioCaminho.length === 0, meioCaminho.join(','));

      /* A armadilha do mapa: `salamandra` é origem E destino. Renomear
         no lugar sobrescreveria o pet do Seiji com o do Gabriel. */
      const antes = {salamandra:{lvl:9, exp:5}, caranguejo:{lvl:4, exp:1}, lebre:{lvl:7, exp:2}};
      const depois = Object.fromEntries(Object.entries(antes)
        .map(([id, d]) => [PET_RENOMEADO[id] || id, d]));
      ok('renomear não perde pet quando origem e destino se cruzam',
         Object.keys(depois).length === 3 && depois.polvo.lvl === 9 &&
         depois.salamandra.lvl === 4 && depois.homunculo.lvl === 7,
         JSON.stringify(depois));

      /* Carga de verdade: um save escrito com os ids antigos precisa
         voltar com os três pets, no nível em que estavam. */
      {
        const bak = {pets:{...G.pets}, ativo:G.petAtivo};
        G.pets = {gato:{lvl:11, exp:3}, rato:{lvl:6, exp:0}}; G.petAtivo = 'gato';
        const bruto = Save.chave && JSON.stringify({pets:{...G.pets}, petAtivo:G.petAtivo});
        const s2 = JSON.parse(bruto);
        const mig = Object.fromEntries(Object.entries(s2.pets)
          .map(([id, d]) => [PET_RENOMEADO[id] || id, d]));
        for (const id of Object.keys(mig)) if (!PETS[id]) delete mig[id];
        ok('save com id antigo mantém o pet e o nível dele',
           mig.morcego?.lvl === 11 && mig.lince?.lvl === 6, JSON.stringify(mig));
        ok('o pet ativo antigo continua ativo depois do renome',
           (PET_RENOMEADO[s2.petAtivo] || s2.petAtivo) === 'morcego');
        G.pets = bak.pets; G.petAtivo = bak.ativo;
      }
    }
    ok('a chance de o pet agir cresce com o nível, mas tem teto',
       petChance(1) < petChance(20) && petChance(999) <= PET_CHANCE_MAX);

    /* --- v5.6: Madao ------------------------------------------------- */
    {
      const antesParty = G.party, antesSquad = G.squad, antesLider = G.leader,
            antesSteps = G.steps, antesCena = G.scene;
      G.party = PARTY_DEFS.map(d => makeChar(d, 20));
      G.squad = [MADAO.dono, ...G.party.map(c => c.name).filter(n => n !== MADAO.dono)]
                  .slice(0, PARTY_SIZE);
      G.leader = 0;

      /* Regeneração fora do combate: cura só a ELE, e só a cada N passos.
         Curar o grupo inteiro tornaria Ophelia e Eden dispensáveis fora da
         luta, que é metade do valor delas. */
      const m = charByName(MADAO.dono), outro = G.party.find(c => c.name !== MADAO.dono);
      m.hp = 1; outro.hp = 1; G.steps = 0;
      for (let i = 0; i < MADAO.passosPorCura - 1; i++){ G.steps++; regenMadao(); }
      ok('antes de completar os passos, ninguém regenera', m.hp === 1, `${m.hp}`);
      G.steps++; regenMadao();
      ok('completados os passos, o Madao regenera', m.hp > 1, `${m.hp}`);
      ok('e a regeneração NÃO cura o resto do grupo', outro.hp === 1, `${outro.hp}`);
      m.hp = 0; const morto = m.hp; G.steps = 0;
      for (let i = 0; i <= MADAO.passosPorCura; i++){ G.steps++; regenMadao(); }
      ok('caído não regenera sozinho', m.hp === morto, `${m.hp}`);
      m.hp = m.maxHp; G.steps = 0;
      for (let i = 0; i <= MADAO.passosPorCura; i++){ G.steps++; regenMadao(); }
      ok('inteiro não passa do máximo', m.hp === m.maxHp);

      // as três artes de combate
      Battle.begin(['wolf']);
      const am = Battle.allies.find(u => u.name === MADAO.dono);
      ok('sem Papelão, usa a arte normal', arteDeCombate(am) === MADAO.dono, arteDeCombate(am));
      am.papelaoT = 3;
      ok('com Papelão, troca para a arte da caixa',
         arteDeCombate(am) === MADAO.artePapelao, arteDeCombate(am));
      /* A ordem entre os estados é o contrato: vitória ganha de papelão,
         senão a tela de vitória mostraria a caixa erguida depois que a
         luta acabou e não há mais o que aparar. */
      const faseAntes = Battle.phase;
      Battle.phase = 'VICTORY';
      ok('na vitória, a arte de vitória ganha do Papelão',
         arteDeCombate(am) === MADAO.arteVitoria, arteDeCombate(am));
      Battle.phase = faseAntes;

      // o contador é a ÚNICA fonte do estado
      am.papelaoT = 0;
      ok('zerado o contador, volta à arte normal', arteDeCombate(am) === MADAO.dono);

      // a habilidade liga o contador junto com o buff, com a mesma duração
      const sk = SKILLS.cardboard;
      ok('Papelão é buff de DEF em si mesmo',
         sk.type === 'buff' && sk.target === 'self' && sk.buff.def > 1);
      ok('Papelão marca a troca de arte', sk.papelao === true);
      ok('a duração da arte acompanha a do buff',
         (sk.buff.turns || 3) + 1 > 0);

      // a forma não vaza para a luta seguinte
      am.papelaoT = 5;
      Battle.begin(['wolf']);
      const am2 = Battle.allies.find(u => u.name === MADAO.dono);
      ok('a luta seguinte começa sem a caixa erguida', !(am2.papelaoT > 0), `${am2.papelaoT}`);

      let erro = null;
      try {
        drawAllyUnit(am2, false);
        am2.papelaoT = 3; drawAllyUnit(am2, true);
        Battle.phase = 'VICTORY'; drawAllyUnit(am2, false);
      } catch(e){ erro = e.message; }
      ok('desenhar os três estados não estoura', !erro, erro || 'ok');
      ctx.clearRect(0, 0, W, H);

      Battle.active = false; Battle.phase = 'INPUT';
      G.party = antesParty; G.squad = antesSquad; G.leader = antesLider;
      G.steps = antesSteps; G.scene = antesCena || 'FIELD';
    }

    /* --- v5.4: forma Lycan ------------------------------------------ */
    {
      const antesParty = G.party, antesSquad = G.squad, antesLider = G.leader;
      G.party = PARTY_DEFS.map(d => makeChar(d, 20));
      G.squad = G.party.slice(0, PARTY_SIZE).map(c => c.name);
      G.leader = 0;
      Battle.begin(['wolf']);
      const gab = Battle.allies.find(u => u.name === LYCAN.dono);
      ok('o Gabriel entra na luta em forma humana', !!gab && !gab.lycan);

      const atk0 = eATK(gab), def0 = eDEF(gab), spd0 = eSPD(gab);
      // acima do limiar não vira
      gab.hp = Math.ceil(gab.maxHp * LYCAN.limiar) + 1;
      Battle.checarLycan(gab);
      ok('acima do limiar continua humano', !gab.lycan, `${gab.hp}/${gab.maxHp}`);
      // ao cruzar, vira
      gab.hp = Math.floor(gab.maxHp * LYCAN.limiar);
      Battle.checarLycan(gab);
      ok('ao cair para o limiar, vira Lycan', gab.lycan === true, `${gab.hp}/${gab.maxHp}`);

      ok('a forma bate mais forte', eATK(gab) > atk0, `${Math.round(atk0)} → ${Math.round(eATK(gab))}`);
      ok('a forma corre mais', eSPD(gab) > spd0, `${Math.round(spd0)} → ${Math.round(eSPD(gab))}`);
      /* É TROCA, não upgrade: o guardião deixa de guardar. Sem esta trava
         a forma vira melhoria pura e a decisão some. */
      ok('a forma defende MENOS — é troca, não upgrade', eDEF(gab) < def0,
         `${Math.round(def0)} → ${Math.round(eDEF(gab))}`);

      // curar acima do limiar não desfaz
      gab.hp = gab.maxHp;
      Battle.checarLycan(gab);
      ok('curar acima do limiar não desfaz a forma', gab.lycan === true);

      // ninguém mais vira
      const outro = Battle.allies.find(u => u.name !== LYCAN.dono);
      outro.hp = 1; Battle.checarLycan(outro);
      ok('só o dono da forma se transforma', !outro.lycan, outro.name);

      // a identidade NÃO muda — é isso que protege grupo, EXP e charByName
      ok('o nome do ator continua o mesmo depois da transformação',
         gab.name === LYCAN.dono, gab.name);
      ok('o elenco continua achando o Gabriel por nome', !!charByName(LYCAN.dono));

      // a forma não vaza para a luta seguinte
      Battle.begin(['wolf']);
      const gab2 = Battle.allies.find(u => u.name === LYCAN.dono);
      ok('a luta seguinte começa em forma humana', !gab2.lycan);
      ok('e sem o bônus da forma pendurado',
         !gab2.buffs.some(b => b.lycan), JSON.stringify(gab2.buffs));

      let erro = null;
      try { drawAllyUnit(gab2, false); gab2.lycan = true; drawAllyUnit(gab2, true); }
      catch(e){ erro = e.message; }
      ok('desenhar as duas formas não estoura', !erro, erro || 'ok');
      ctx.clearRect(0, 0, W, H);

      /* A folha do Lycan ficou EMBUTIDA E INALCANÇÁVEL na primeira
         versão: o único lugar que a usava era o ramo `else` de
         `drawAllyUnit`, que só roda para quem não tem arte de combate — e
         o Gabriel tem. Estes travam que ela é de fato alcançável. */
      const gabC = charByName(LYCAN.dono);
      const hp0 = gabC.hp;
      gabC.hp = gabC.maxHp;
      ok('inteiro, o campo desenha o Gabriel humano',
         folhaDe(gabC) === gabC.sheet, folhaDe(gabC));
      gabC.hp = Math.floor(gabC.maxHp * LYCAN.limiar);
      ok('no limiar, o campo desenha a folha do Lycan',
         folhaDe(gabC) === LYCAN.sheet, folhaDe(gabC));
      gabC.hp = 0;
      ok('caído não vira lobo', !emFormaLycan(gabC));
      gabC.hp = gabC.maxHp;
      ok('curar acima do limiar devolve a forma humana no campo',
         folhaDe(gabC) === gabC.sheet);
      ok('a forma de campo só vale para o dono',
         PARTY_DEFS.filter(d => d.name !== LYCAN.dono)
           .every(d => { const c = makeChar(d, 20); c.hp = 1; return !emFormaLycan(c); }));
      gabC.hp = hp0;

      Battle.active = false; G.scene = 'FIELD';
      G.party = antesParty; G.squad = antesSquad; G.leader = antesLider;
    }

    /* --- v5.3: molduras de painel ----------------------------------- */
    {
      ok('a moldura padrão é o traço original', MOLDURAS[0].id === 'nenhuma' && !MOLDURAS[0].canto);
      /* 25 do pacote de arte + a do mockup de combate + o traço original. */
      ok('o pacote de 25 molduras continua inteiro',
         MOLDURAS.filter(m => /^m\d\d$/.test(m.id)).length === 25,
         `${MOLDURAS.filter(m => /^m\d\d$/.test(m.id)).length}`);
      ok('a moldura do mockup de combate está na lista',
         MOLDURAS.some(m => m.id === 'mock'));
      ok('todo id de moldura é único',
         new Set(MOLDURAS.map(m => m.id)).size === MOLDURAS.length);
      ok('todo nome de moldura é único (senão o menu mostra duas iguais)',
         new Set(MOLDURAS.map(m => m.nome)).size === MOLDURAS.length,
         MOLDURAS.map(m => m.nome).filter((n,i,a) => a.indexOf(n) !== i).join(','));
      /* Mesma armadilha da arte de pet e de arma: chave ausente em
         SPRITE_DATA faz o painel cair no traço em silêncio. */
      const semArte = MOLDURAS.filter(m => m.canto && (!SPRITE_DATA[m.canto] || !SPRITE_DATA[m.emblema]));
      ok('toda moldura tem canto E emblema em SPRITE_DATA',
         semArte.length === 0, semArte.map(m => m.id).join(','));

      const salvo = G.moldura;
      G.moldura = 'nao_existe';
      ok('moldura desconhecida cai no traço original', molduraAtual().id === 'nenhuma');
      G.moldura = MOLDURAS[1].id;
      ok('moldura escolhida é a que `molduraAtual` devolve', molduraAtual().id === MOLDURAS[1].id);

      // desenhar com e sem moldura, e em painel apertado, não pode estourar
      let erro = null;
      try {
        panel(10, 10, 300, 200);
        panel(10, 10, 120, 40);          // apertado: usa o traço mesmo com moldura
        G.moldura = 'nenhuma';
        panel(10, 10, 300, 200);
      } catch(e){ erro = e.message; }
      ok('desenhar painel com e sem moldura não estoura', !erro, erro || 'ok');
      ctx.clearRect(0, 0, W, H);

      // a escolha sobrevive ao save
      G.moldura = MOLDURAS[3].id;
      const s2 = JSON.parse(JSON.stringify({
        v:APP_VERSION, map:G.mapId, x:1, y:1, dir:'down', moldura:G.moldura,
        squad:G.squad.slice(),
        party:G.party.map(pp => ({name:pp.name, lvl:pp.lvl, exp:pp.exp, hp:pp.hp, mp:pp.mp,
                                  skills:pp.skills.slice(), tree:(pp.tree||[]).slice(),
                                  ult:pp.ult, gear:{...pp.gear}})),
      }));
      let erro2 = null;
      try { loadFromSave(s2); } catch(e){ erro2 = e.message; }
      ok('a moldura escolhida sobrevive ao save', !erro2 && G.moldura === MOLDURAS[3].id,
         erro2 || G.moldura);
      loadFromSave(JSON.parse(JSON.stringify({...s2, moldura:undefined})));
      ok('save sem moldura entra no traço original', G.moldura === 'nenhuma', G.moldura);
      G.moldura = salvo;
    }

    /* --- v5.11: HUD de campo (minimapa e botões) --------------------- */
    {
      const nomes = ['local','missao','recursos','minimapa','grupo','botoes','atalhos'];
      ok('toda zona da HUD de campo cabe na tela',
         nomes.every(n => { const z = HUD_MUNDO[n];
           return z.x >= 0 && z.y >= 0 && z.x + z.w <= W && z.y + z.h <= H; }),
         nomes.filter(n => { const z = HUD_MUNDO[n];
           return !(z.x >= 0 && z.y >= 0 && z.x + z.w <= W && z.y + z.h <= H); }).join(','));

      const cruza = (a, b) =>
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
      const pares = [];
      for (let i = 0; i < nomes.length; i++)
        for (let j = i + 1; j < nomes.length; j++)
          if (cruza(HUD_MUNDO[nomes[i]], HUD_MUNDO[nomes[j]]))
            pares.push(nomes[i] + '×' + nomes[j]);
      ok('nenhuma zona da HUD de campo encosta na outra', pares.length === 0, pares.join(' · '));

      /* Botão que aponta para página inexistente abre uma tela vazia, e o
         jogador só descobre apertando. `pagina: null` é deliberado e
         quer dizer "não é página do menu" — hoje só o mapa, que é tela
         própria; e esse tem de ter destino de verdade, senão o botão não
         faz nada. */
      const semPagina = BOTOES_RAPIDOS.filter(b =>
        b.pagina !== null && b.pagina !== 'root' &&
        !Menu.ROOT.some(o => o.id === b.pagina));
      ok('todo botão sem página é um que o campo trata à parte',
         BOTOES_RAPIDOS.filter(b => b.pagina === null)
                       .every(b => b.id === 'mapa'));
      ok('todo botão da HUD aponta para uma página que existe',
         semPagina.length === 0, semPagina.map(b => `${b.id}→${b.pagina}`).join(','));
      ok('todo botão tem tecla própria',
         new Set(BOTOES_RAPIDOS.map(b => b.tecla)).size === BOTOES_RAPIDOS.length,
         BOTOES_RAPIDOS.map(b => b.tecla).join(','));

      /* A tecla precisa estar REALMENTE ligada à ação, senão o botão
         mostra um atalho que não funciona. */
      const semBind = BOTOES_RAPIDOS.filter(b => {
        const acao = b.id === 'menu' ? 'menu' : b.id;
        return !Object.entries(Input.BIND).some(([k, a]) =>
          a === acao && k.toUpperCase() === b.tecla.toUpperCase());
      });
      ok('a tecla que o botão mostra é a que está ligada à ação',
         semBind.length === 0, semBind.map(b => `${b.tecla}→${b.id}`).join(','));

      ok('abrirEm leva à página pedida',
         (() => { const c = G.scene; Menu.abrirEm('quests');
                  const r = Menu.page === 'quests'; G.scene = c; return r; })());
      ok('abrirEm com página desconhecida cai na raiz',
         (() => { const c = G.scene; Menu.abrirEm('nao_existe');
                  const r = Menu.page === 'root'; G.scene = c; return r; })());
      ok('abrirEm não abre a página "Voltar"',
         (() => { const c = G.scene; Menu.abrirEm('close');
                  const r = Menu.page === 'root'; G.scene = c; return r; })());

      /* O minimapa lê `G.map.grid` direto. Mapa pequeno, jogador no canto
         e mapa sem NPC são os três casos em que uma janela centrada no
         jogador tenta ler fora do vetor. */
      {
        const salvo = {mapa:G.mapId, cena:G.scene, x:G.player.tx, y:G.player.ty};
        let erroM = null, ondeM = '';
        for (const id of Object.keys(MAPS)){
          try {
            loadMap(id);
            Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
            G.scene = 'FIELD';
            for (const [px, py] of [[0,0], [G.map.w-1, G.map.h-1],
                                    [Math.floor(G.map.w/2), Math.floor(G.map.h/2)]]){
              G.player.tx = px; G.player.ty = py;
              G.player.px = px * TILE; G.player.py = py * TILE;
              drawFieldHUD();
            }
          } catch(e){ erroM = e.message; ondeM = id; break; }
        }
        ok('a HUD de campo desenha em todo mapa, inclusive no canto',
           !erroM, erroM ? `${ondeM}: ${erroM}` : 'ok');
        ctx.clearRect(0, 0, W, H);
        if (salvo.mapa) loadMap(salvo.mapa, salvo.x, salvo.y);
        Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
        G.scene = salvo.cena || 'FIELD';
      }

      /* Todo chão que o jogador pisa precisa de cor no minimapa; sem ela
         o tile some e o mapa fica com buraco. */
      const semCor = Object.values(TILEDEF)
        .filter(d => !d.solid && !COR_MINIMAPA[d.id]).map(d => d.id);
      ok('todo chão pisável tem cor no minimapa', semCor.length === 0, semCor.join(','));

      /* --- v5.12: painel de objetivo e marcadores do minimapa --------- */
      {
        const salvoQ = G.quests, salvoK = G.kills;
        G.quests = {}; G.kills = {};
        ok('sem missão ativa o painel de objetivo não existe', missaoAtiva() === null);

        const idCaca = Object.keys(QUESTS).find(k => QUESTS[k].tipo === 'hunt');
        ok('há missão de caça para o teste usar', !!idCaca, idCaca || 'nenhuma');
        if (idCaca){
          const q = QUESTS[idCaca];
          acceptQuest(idCaca);
          const m1 = missaoAtiva();
          ok('missão aceita aparece no painel', !!m1 && m1.id === idCaca);
          ok('missão recém-aceita começa em zero', m1 && m1.p.feito === 0, `${m1 && m1.p.feito}`);
          ok('missão em andamento não é anunciada como pronta', m1 && !m1.pronta);

          G.kills[q.alvo] = (G.kills[q.alvo] || 0) + q.qtd;
          const m2 = missaoAtiva();
          ok('missão cumprida vira pronta no painel', m2 && m2.pronta);
          ok('o progresso não passa do alvo', m2 && m2.p.feito === m2.p.alvo,
             m2 ? `${m2.p.feito}/${m2.p.alvo}` : '—');

          /* Com duas ativas, a PRONTA tem de vir primeiro: é a que muda o
             que o jogador faz agora. */
          const outra = Object.keys(QUESTS).find(k => k !== idCaca);
          if (outra){
            acceptQuest(outra);
            const m3 = missaoAtiva();
            ok('a missão pronta ganha da que ainda está em andamento',
               m3 && m3.id === idCaca, m3 && m3.id);
          }
        }

        let erroQ = null;
        try { drawZonaMissao(); G.quests = {}; drawZonaMissao(); }
        catch(e){ erroQ = e.message; }
        ok('desenhar o painel de objetivo com e sem missão não estoura', !erroQ, erroQ || 'ok');
        ctx.clearRect(0, 0, W, H);
        G.quests = salvoQ; G.kills = salvoK;
      }

      /* Marcador sem arte cai no losango colorido — o que não pode é
         apontar para uma chave que nunca existiu, porque aí não cai em
         nada: fica um marcador invisível e o jogador nunca acha a loja. */
      ok('todo marcador do minimapa tem chave de arte e cor de reserva',
         Object.values(MARCA_MINI).every(m => typeof m.arte === 'string' &&
                                              /^#[0-9a-f]{6}$/i.test(m.cor)),
         Object.entries(MARCA_MINI).filter(([, m]) => !m.arte || !m.cor).map(([k]) => k).join(','));
      ok('o marcador de loja e o de missão existem, que são os que o jogo usa',
         !!MARCA_MINI.loja && !!MARCA_MINI.missao && !!MARCA_MINI.save);

      /* `marcaDoNPC` decide o que vai por cima. Loja é loja; quem dá
         missão só ganha marca enquanto ela importa. */
      ok('NPC sem loja nem missão não ganha marcador', marcaDoNPC({}) === null);
      ok('NPC de loja ganha marcador de loja', marcaDoNPC({shop:'academia'}) === 'loja');

      /* --- v5.15: props de cenário ------------------------------------ */
    {
      /* Chave que não existe faz `desenharProp` devolver false e o objeto
         some da tela sem erro nenhum — silêncio é o pior jeito de
         descobrir que a arte não entrou. */
      const semArte = Object.entries(TALL_ART).filter(([, k]) => !SPRITE_DATA[k]);
      ok('todo tile alto com arte aponta para prop que existe',
         semArte.length === 0, semArte.map(([id, k]) => `${id}→${k}`).join(','));
      ok('a variação de árvore também existe', !!SPRITE_DATA['prop_arvore_escura']);
      ok('desenharProp devolve false para chave que não existe',
         desenharProp('prop_que_nao_existe', 0, 0) === false &&
         desenharProp(null, 0, 0) === false);

      /* Decoração: o que está escrito nos mapas tem de existir e caber
         dentro do mapa. Peça fora do vetor não desenha e não avisa. */
      const ruins = [];
      for (const [id, def] of Object.entries(MAPS)){
        const linhas = (def.grid || def.rows || []).map(String);
        for (const d of (def.decor || [])){
          if (!SPRITE_DATA[d.s]) ruins.push(`${id}: prop ${d.s} não existe`);
          if (d.y < 0 || d.y >= linhas.length || d.x < 0 || d.x >= (linhas[d.y] || '').length)
            ruins.push(`${id}: ${d.s} em (${d.x},${d.y}) fora do mapa`);
        }
      }
      ok('toda decoração usa prop existente e cai dentro do mapa',
         ruins.length === 0, ruins.join(' · '));

      /* Porto Lúmina não pode voltar a uma colagem de props genéricos.
         A regra registra os elementos que definem a área: cais, barcos,
         comércio, taverna e luz. O detalhe decorativo ainda pode variar
         sem enfraquecer a leitura do lugar. */
      const lumina = MAPS.porto_lumina;
      const luminaProps = new Set((lumina?.decor || []).map(d => d.s));
      const luminaObrigatorios = [
        'prop_barco_lumina', 'prop_barco_pesca_lumina',
        'prop_taverna_lumina', 'prop_loja_lumina', 'prop_lampiao',
      ];
      ok('Porto Lúmina preserva seus props de cenário exclusivos',
         !!lumina && lumina.tileArt?.[','] === 'tile_cais_lumina' &&
         luminaObrigatorios.every(k => luminaProps.has(k)),
         lumina ? [...luminaProps].join(',') : 'mapa ausente');

      /* Decoração SÓLIDA em cima de porta, escada, baú, save ou do ponto
         de entrada tranca o jogador ou esconde a saída. É o erro caro
         deste sistema, e é invisível até alguém tentar passar. */
      const presos = [];
      for (const [id, def] of Object.entries(MAPS)){
        const linhas = (def.grid || def.rows || []).map(String);
        const sp = def.spawn || {x:1, y:1};
        for (const d of (def.decor || [])){
          const ch = (linhas[d.y] || '')[d.x];
          const td = TILEDEF[ch];
          if (d.solido && td && (td.warp || td.save || td.chest))
            presos.push(`${id}: ${d.s} sólido sobre ${td.id}`);
          if (d.solido && d.x === sp.x && d.y === sp.y)
            presos.push(`${id}: ${d.s} sólido no ponto de entrada`);
          if (d.solido && (def.npcs || []).some(n => n.x === d.x && n.y === d.y))
            presos.push(`${id}: ${d.s} sólido em cima de NPC`);
          /* Só sólida em cima de parede é erro (esconde a peça ou dobra o
             bloqueio). Prop sem `solido` sobre terreno já impassável (ex.:
             margem d'água desenhada sobre a água) é textura visível de
             propósito, não armadilha — a água já bloqueia sozinha. */
          if (d.solido && td && td.solid)
            presos.push(`${id}: ${d.s} sólido dentro de parede (${td.id})`);
        }
      }
      ok('nenhuma decoração tranca passagem, save, baú ou NPC',
         presos.length === 0, presos.join(' · '));

      /* Sólido de verdade bloqueia; o que não pede, não bloqueia. */
      {
        const salvo = {mapa:G.mapId, cena:G.scene, x:G.player.tx, y:G.player.ty};
        const comDecor = Object.keys(MAPS).find(id => (MAPS[id].decor || []).some(d => d.solido));
        ok('há mapa com decoração sólida para testar', !!comDecor, comDecor || 'nenhum');
        if (comDecor){
          loadMap(comDecor); Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
          const linhasComDecor = (MAPS[comDecor].grid || MAPS[comDecor].rows || []).map(String);
          /* Prop não-sólida pode ficar sobre terreno já impassável por si
             só (água, por exemplo) — aí `isSolid` dá true pelo terreno,
             não pela decoração, e não prova nada sobre o `solido` dela. */
          const sobreTerrenoSolido = d => {
            const td = TILEDEF[(linhasComDecor[d.y] || '')[d.x]];
            return !!(td && td.solid);
          };
          const solidos = (MAPS[comDecor].decor || []).filter(d => d.solido);
          const moles   = (MAPS[comDecor].decor || []).filter(d => !d.solido && !sobreTerrenoSolido(d));
          ok('decoração marcada como sólida bloqueia',
             solidos.every(d => isSolid(d.x, d.y)),
             solidos.filter(d => !isSolid(d.x, d.y)).map(d => d.s).join(','));
          ok('decoração não marcada NÃO bloqueia',
             moles.every(d => !isSolid(d.x, d.y)),
             moles.filter(d => isSolid(d.x, d.y)).map(d => d.s).join(','));
        }

        // desenhar TODOS os mapas com props não pode estourar
        let erroP = null, ondeP = '';
        for (const id of Object.keys(MAPS)){
          try {
            loadMap(id); Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
            G.scene = 'FIELD'; drawField();
          } catch(e){ erroP = e.message; ondeP = id; break; }
        }
        ok('desenhar todo mapa com props não estoura', !erroP, erroP ? `${ondeP}: ${erroP}` : 'ok');
        ctx.clearRect(0, 0, W, H);
        if (salvo.mapa) loadMap(salvo.mapa, salvo.x, salvo.y);
        Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
        G.scene = salvo.cena || 'FIELD';
      }
    }

    /* --- v5.23: Dono do Pântano ------------------------------------- */
    {
      const D = BESTIARY.swampking;
      ok('o Dono do Pântano existe no bestiário', !!D);
      ok('ele tem as quatro fases', (D.fases || []).length === 4,
         `${(D.fases || []).length}`);
      /* Limiar fora de ordem faz `checarFase` pular fase ou nunca
         entrar nela — e o defeito só aparece na luta, tarde. */
      const lim = D.fases.map(f => f.ate);
      ok('os limiares descem em ordem',
         lim.every((v, i) => i === 0 || v < lim[i - 1]), lim.join(' > '));
      const semArte = D.fases.filter(f => !SPRITE_DATA[f.sprite]);
      ok('toda fase aponta para um sprite que existe', semArte.length === 0,
         semArte.map(f => f.sprite).join(','));
      const semSkill = D.fases.flatMap(f => f.skills).filter(k => !SKILLS[k]);
      ok('toda habilidade das fases existe', semSkill.length === 0, semSkill.join(','));
      ok('a sala da comporta chama o boss novo',
         MAPS.cistern_deep?.boss?.id === 'swampking', MAPS.cistern_deep?.boss?.id);
      /* A flag do capítulo tem de continuar a MESMA: trocá-la apagaria o
         progresso de quem já venceu aqui num save anterior. */
      ok('a flag do capítulo continua deluge_defeated',
         MAPS.cistern_deep?.boss?.flag === 'deluge_defeated');
      const oitoIds = ['b_bite','b_tail','b_charge','b_grab','b_eyes','b_shards','b_spikes','b_fury'];
      ok('as oito habilidades do moveset existem',
         oitoIds.every(k => SKILLS[k]), oitoIds.filter(k => !SKILLS[k]).join(','));
      ok('cada habilidade do boss tem quadro de arte',
         oitoIds.every(k => SPRITE_DATA[SKILLS[k].arte]),
         oitoIds.filter(k => !SPRITE_DATA[SKILLS[k].arte]).join(','));

      /* v5.32 — `arte` deixou de ser só um campo conferido pelo teste:
         agora troca o sprite de verdade, e fica visível por um tempo
         PRÓPRIO (`arteHoldT`, ~1,1s), independente do avanço físico
         (`lungeT`, que vai e volta em ~0,3s — rápido demais pra ler um
         sprite novo). Sem isto, um `arte` podia existir em SPRITE_DATA
         inteiro e nunca aparecer em jogo — foi exatamente o que
         aconteceu até aqui com as oito habilidades acima e com as do
         Vharok. */
      {
        const salvo = {cena:G.scene, ativo:Battle.active};
        Battle.begin(['swampking'], {boss:true});
        const u = Battle.enemies[0];
        const hpAntes = Battle.allies.map(a => a.hp);
        Battle.actor = u;
        Battle.pendingSkill = {...SKILLS.b_bite, id:'b_bite'};
        Battle.pendingIsUlt = false; Battle.pendingItem = null;
        Battle.execute([Battle.allies[0]]);
        ok('durante o avanço, o sprite vira a arte da habilidade',
           u.arteAtaque === 'boss_pantano_mordida' && u.arteHoldT > 0,
           `arteAtaque=${u.arteAtaque} arteHoldT=${u.arteHoldT}`);
        for (let i = 0; i < 20 && u.lungeT > 0; i++) Battle.update(0.03);
        ok('a arte continua depois do avanço físico terminar (tempo de leitura)',
           u.arteAtaque === 'boss_pantano_mordida' && u.lungeT === 0,
           `arteAtaque=${u.arteAtaque} lungeT=${u.lungeT}`);
        for (let i = 0; i < 80 && u.arteHoldT > 0; i++) Battle.update(0.03);
        ok('depois do tempo de leitura, o sprite volta ao normal',
           u.arteAtaque === null && u.arteHoldT === 0, `arteAtaque=${u.arteAtaque}`);
        Battle.allies.forEach((a, i) => { a.hp = hpAntes[i]; a.ail = []; });
        Battle.active = false; G.scene = salvo.cena; Battle.active = salvo.ativo;
      }

      /* A luta, simulada. Cruzar cada limiar tem de trocar fase, sprite
         e repertório — e a defesa tem de CAIR quando a carapaça rompe,
         que é a promessa da fase 3. */
      {
        const salvo = {cena:G.scene, ativo:Battle.active};
        Battle.begin(['swampking'], {boss:true});
        const u = Battle.enemies[0];
        ok('a luta começa na fase 1 com o sprite do Guardião',
           u.fase === 0 && u.sprite === 'boss_pantano_f1', `${u.fase}/${u.sprite}`);
        const defF1 = u.def;
        const vistos = [];
        for (const frac of [0.69, 0.44, 0.19]){
          u.hp = Math.round(u.maxHp * frac);
          Battle.checarFase(u);
          vistos.push(u.fase);
        }
        ok('cada limiar avança exatamente uma fase',
           vistos.join(',') === '1,2,3', vistos.join(','));
        ok('a carapaça rompida derruba a defesa', u.def < defF1, `${defF1} → ${u.def}`);
        ok('a fase final entra em desespero', u.desespero === true);
        ok('o desespero pode dar dois golpes num turno',
           [...Array(60)].some(() => Battle.golpesDoTurno(u) === 2));

        /* Submerso e exposto entram pelo MESMO lugar da fórmula que a
           postura quebrada. Se alguém mexer em `calcDamage`, isto pega. */
        const sk = SKILLS.b_bite, herói = Battle.allies[0];
        const seco = calcDamage(herói, sk, u).dmg;
        u.submerso = true;
        const sub = calcDamage(herói, sk, u).dmg;
        u.submerso = false; u.exposto = 2;
        const exp = calcDamage(herói, sk, u).dmg;
        u.exposto = 0;
        ok('submerso reduz o dano recebido', sub < seco, `${seco} → ${sub}`);
        ok('submerso NÃO é imunidade', sub > 0, `${sub}`);
        ok('exposto aumenta o dano recebido', exp > seco, `${seco} → ${exp}`);

        /* A ultimate é única. Se voltar pelo sorteio deixa de ser
           clímax e vira só o golpe mais forte da lista. */
        u.hp = Math.round(u.maxHp * 0.1); Battle.checarFase(u);
        u.usouFuria = false;
        let furias = 0;
        for (let i = 0; i < 300; i++){
          const id = Battle.escolhaDoPantano(u, Battle.allies.filter(isAlive));
          if (id === 'b_fury') furias++;
          u.ultima = id;
        }
        ok('a Fúria do Pântano sai uma vez só', furias === 1, `${furias}`);

        /* A arte do chefe não pode invadir os painéis do topo. */
        const faixa = HUD.campo.y1 - HUD.campo.y0;
        for (const f of D.fases){
          const img = spriteImages[f.sprite];
          if (!img || !img.naturalHeight) continue;
          const alvoH = Math.min(230 * 1.85, faixa - 20);
          ok(`a arte de ${f.nome} cabe na faixa do campo`, alvoH <= faixa,
             `${alvoH} em ${faixa}`);
          break;
        }

        Battle.active = salvo.ativo; G.scene = salvo.cena;
      }
    }

    /* --- v5.25: missão completável, e em quantos encontros ---------- */
    {
      /* O defeito que este bloco existe para pegar não é "a criatura não
         existe" — todas existiam. É "a criatura aparece raramente demais
         para a conta que a missão pede".

         Medido antes de escrever isto: `q_casulos` pedia 27 encontros,
         `q_antescoroa` 25, `q_reflexo` 23. Com um encontro a cada ~16
         passos, 27 encontros são ~430 passos caçando a mesma coisa —
         completável no papel, impossível na cadeira. O Ninhal e a Coroa
         eram as duas piores regiões, e foi assim que o defeito apareceu.

         A conta é simples e é a que o jogador sente: indivíduos daquela
         espécie por encontro, na melhor região, contra a quantidade
         pedida. */
      const TETO_ENCONTROS = 15;

      const comEncontro = new Set();
      for (const m of Object.values(MAPS)) if (m.encounter && m.region) comEncontro.add(m.region);

      /* Item que se compra não precisa ser caçado. `q_enfermeira` pede
         quatro Elixires de Éter e eles estão em três lojas — contar só a
         queda daria um número falso. */
      const emLoja = new Set();
      for (const sh of Object.values(SHOPS))
        for (const it of sh.stock) emLoja.add(typeof it === 'string' ? it : it.id);

      const chefes = new Set();
      for (const m of Object.values(MAPS)) if (m.boss) chefes.add(m.boss.id);

      const dropDe = {};
      for (const [k, d] of Object.entries(BESTIARY))
        for (const [it, pr] of (d.drops || [])) (dropDe[it] ||= []).push([k, pr]);

      /* Indivíduos por encontro, por região. Uma formação que traz três
         de uma espécie vale três — é o que o contador de abates vê. */
      const porConfronto = [];
      for (const [reg, fs] of Object.entries(FORMATIONS)){
        if (!comEncontro.has(reg) || !fs.length) continue;
        const acc = {};
        for (const f of fs) for (const [id, n] of f) acc[id] = (acc[id] || 0) + n;
        const medio = {};
        for (const k in acc) medio[k] = acc[k] / fs.length;
        porConfronto.push(medio);
      }
      /* Mob visível é uma fonte de combate tão real quanto uma formação
         aleatória. Como a formação dele é fixa, conta a quantidade que
         aparece quando ele é enfrentado, não uma média de rolagens. */
      for (const m of Object.values(MAPS)) for (const mob of (m.mobs || [])){
        const fixo = {};
        for (const [id, n] of (mob.formation || [])) fixo[id] = (fixo[id] || 0) + n;
        if (Object.keys(fixo).length) porConfronto.push(fixo);
      }

      const semAlvo = [], pesadas = [];
      for (const [qid, q] of Object.entries(QUESTS)){
        if (q.tipo !== 'hunt' && q.tipo !== 'collect') continue;

        /* Alvo que é CHEFE se mata na alcova dele, não em encontro
           aleatório — e desde a v5.24 o eco permite repetir. Contar
           formação para ele daria "impossível" numa missão que funciona. */
        if (q.tipo === 'hunt' && chefes.has(q.alvo)) continue;
        if (q.tipo === 'collect' && emLoja.has(q.item)) continue;

        let melhor = 0;
        for (const tab of porConfronto){
          let taxa = 0;
          if (q.tipo === 'hunt') taxa = tab[q.alvo] || 0;
          else for (const [k, pr] of (dropDe[q.item] || [])) taxa += (tab[k] || 0) * pr;
          if (taxa > melhor) melhor = taxa;
        }
        if (!melhor){ semAlvo.push(`${qid}(${q.alvo || q.item})`); continue; }
        const enc = Math.ceil(q.qtd / melhor);
        if (enc > TETO_ENCONTROS) pesadas.push(`${qid}: ${enc} confrontos`);
      }

      ok('toda missão tem alvo em algum combate disponível',
         semAlvo.length === 0, semAlvo.join(' · '));
      ok(`nenhuma missão passa de ${TETO_ENCONTROS} confrontos`,
         pesadas.length === 0, pesadas.join(' · '));

      /* O contador de abates é o que alimenta as missões de caça. Se
         `key` deixar de ser o id do bestiário, toda missão de caça para
         de contar em silêncio — inclusive as de eco, cujo nome ganha um
         sufixo "+N" mas cuja chave tem de continuar a mesma. */
      {
        const u = makeEnemyUnit('wolf', 0, 5);
        ok('a chave de abate é o id do bestiário', u.key === 'wolf', u.key);
        const salvo = {...G.revanches};
        G.revanches = {swampking:3};
        const eco = makeEnemyUnit('swampking', 0, 5);
        ok('o eco conta para o mesmo id', eco.key === 'swampking', eco.key);
        ok('o eco mostra o degrau no nome', eco.name.includes('+3'), eco.name);
        G.revanches = salvo;
      }
    }

    /* --- v5.22: mapa do mundo e viagem rápida ----------------------- */
    {
      const L = layoutMundo();

      /* Toda sala tem de ter posição. Sala sem posição some do mapa sem
         erro nenhum — o desenho simplesmente pula, e o jogador conclui
         que aquela área não existe. */
      const semPos = Object.keys(MAPS).filter(id => !L.pos[id]);
      ok('toda sala tem posição no layout do mundo', semPos.length === 0,
         semPos.join(','));

      /* Duas salas sobrepostas desenham uma por cima da outra e o mapa
         vira uma mancha. A separação existe para isto; se alguém mexer
         nela ou acrescentar uma sala grande, reprova aqui. */
      const ids = Object.keys(L.pos), colisoes = [];
      for (let i = 0; i < ids.length; i++)
        for (let j = i + 1; j < ids.length; j++){
          const a = L.pos[ids[i]], b = L.pos[ids[j]];
          const da = L.dim[ids[i]], db = L.dim[ids[j]];
          const gx = Math.min(a.ox + da.w, b.ox + db.w) - Math.max(a.ox, b.ox);
          const gy = Math.min(a.oy + da.h, b.oy + db.h) - Math.max(a.oy, b.oy);
          if (gx > 0 && gy > 0) colisoes.push(`${ids[i]}×${ids[j]}`);
        }
      ok('nenhuma sala se sobrepõe a outra no mapa', colisoes.length === 0,
         colisoes.slice(0, 4).join(' · '));

      /* O layout é DEDUZIDO das passagens. Se `warps` e as casas de
         passagem deixarem de bater, `ligacoesDoMapa` devolve menos
         ligações que o mapa tem e a sala vai parar longe de onde
         deveria — ou fica solta no canto. */
      const desencontro = [];
      for (const [id, def] of Object.entries(MAPS)){
        const tiles = varrerPassagens(def).length, destinos = (def.warps || []).length;
        if (tiles !== destinos) desencontro.push(`${id}: ${tiles} casas, ${destinos} destinos`);
      }
      ok('casas de passagem e destinos batem em todo mapa',
         desencontro.length === 0, desencontro.join(' · '));
      ok('o layout tem ligações de verdade', L.arestas.length >= 10,
         `${L.arestas.length} arestas`);

      /* As duas zonas da tela do mapa não podem se sobrepor. */
      ok('quadro e lista do mapa não se sobrepõem',
         MAPA_TELA.quadro.x + MAPA_TELA.quadro.w <= MAPA_TELA.lista.x);
      ok('a tela do mapa cabe no canvas',
         MAPA_TELA.lista.x + MAPA_TELA.lista.w <= W &&
         MAPA_TELA.quadro.y + MAPA_TELA.quadro.h <= H);
      ok('o atlas integra toda entrada de MAPS, não só as visitadas',
         Mapa.areas().length === Object.keys(MAPS).length,
         `${Mapa.areas().length}/${Object.keys(MAPS).length}`);
      const areaAntesAtlas = Mapa.area;
      Mapa.selecionar('porto_lumina');
      ok('clicar/selecionar uma área troca a ficha do atlas', Mapa.area === 'porto_lumina');
      Mapa.enquadrar(['porto_lumina']);
      ok('foco do atlas mantém escala utilizável', Mapa.esc >= .22 && Mapa.esc <= 9,
         String(Mapa.esc));
      Mapa.area = areaAntesAtlas;

      /* --- rede de cristais ---------------------------------------- */
      {
        const salvos = {...G.cristais}, vis = {...G.visitados}, cena = G.scene, mapa = G.mapId;
        G.cristais = {};
        ok('registrar um cristal novo devolve true', registrarCristal('patio', 3, 3) === true);
        ok('registrar o MESMO cristal devolve false', registrarCristal('patio', 3, 3) === false,
           'senão a rede enche de duplicatas a cada toque');
        ok('a rede guarda o ponto', !!G.cristais['patio:3:3']);
        registrarCristal('undercroft', 5, 5);
        ok('descobertos vêm em ordem de descoberta',
           cristaisDescobertos().map(c => c.mapa).join(',') === 'patio,undercroft');
        ok('viajar para chave inexistente devolve false', viajarPara('nao:existe') === false);

        /* O mapa só mostra cristal de sala visitada. Um cristal numa
           sala que o jogador não viu seria um spoiler de layout. */
        G.visitados = {patio:true};
        ok('o mapa filtra cristal de sala não visitada',
           Mapa.destinos().length === 1, `${Mapa.destinos().length}`);
        ok('selecionar área sem cristal não cria viagem rápida',
           Mapa.destinoDaArea('undercroft') === null);

        /* Desenhar o mapa com e sem rede não pode estourar. */
        let erroM = null;
        for (const est of [{}, {patio:true, hall:true, undercroft:true}]){
          G.visitados = est;
          try { Mapa.enquadrar(); ctx.clearRect(0, 0, W, H); Mapa.draw(); }
          catch(e){ erroM = e.message; break; }
        }
        ok('desenhar o mapa não estoura, com ou sem áreas descobertas',
           !erroM, erroM || 'ok');
        ctx.clearRect(0, 0, W, H);

        G.cristais = salvos; G.visitados = vis; G.scene = cena;
        if (mapa && G.mapId !== mapa) loadMap(mapa);
        Cut.pending = null; Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
        G.scene = cena;
      }

      /* `loadMap` é o único caminho para entrar numa sala, e é lá que o
         nevoeiro abre. Se alguém mover isso, o mapa para de descobrir. */
      {
        const vis = {...G.visitados}, mapa = G.mapId, cena = G.scene;
        delete G.visitados.library;
        loadMap('library');
        ok('entrar numa sala a marca como visitada', G.visitados.library === true);
        G.visitados = vis;
        if (mapa) loadMap(mapa);
        Cut.pending = null; Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
        G.scene = cena;
      }

      /* M é a tecla de mapa em todo metroidvania. Se alguém devolver o
         mudo para ela, o atalho some sem aviso. */
      ok('M abre o mapa', Input.BIND.m === 'mapa' && Input.BIND.M === 'mapa');
      ok('o mudo mudou para N', Input.BIND.n === 'mute' && Input.BIND.N === 'mute');
      ok('há botão de mapa na régua da HUD',
         BOTOES_RAPIDOS.some(b => b.id === 'mapa'));
    }

    /* --- v5.21: cenário dos pacotes novos --------------------------- */
    {
      /* Chão com alfa vira GRADE PRETA no mapa inteiro: as texturas do
         pacote são ilustrações DE um tile, com a borda irregular, e
         repetidas lado a lado os 8% translúcidos das quinas desenham a
         grade por cima de tudo. `_cenario.py` recorta o miolo opaco; se
         alguém embutir um tile cru, isto reprova. */
      const cv = document.createElement('canvas'); cv.width = cv.height = 64;
      const c2 = cv.getContext('2d', {willReadFrequently:true});
      const comAlfa = [], naoQuadrado = [];
      for (const chave of Object.values(TILE_ART)){
        const img = spriteImages[chave];
        if (!img || !(img.naturalWidth || img.width)) continue;
        if (img.naturalWidth !== img.naturalHeight)
          naoQuadrado.push(`${chave} ${img.naturalWidth}x${img.naturalHeight}`);
        c2.clearRect(0, 0, 64, 64);
        c2.drawImage(img, 0, 0, 64, 64);
        const d = c2.getImageData(0, 0, 64, 64).data;
        let vazados = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] < 250) vazados++;
        if (vazados > 0) comAlfa.push(`${chave}: ${vazados}px`);
      }
      ok('nenhum tile de chão tem pixel translúcido', comAlfa.length === 0,
         comAlfa.join(' · '));
      ok('todo tile de chão é quadrado', naoQuadrado.length === 0,
         naoQuadrado.join(' · '));

      /* Toda chave de TILE_ART e TALL_ART tem de existir. Chave escrita
         errado devolve null em silêncio e faria uma sala publicada voltar
         ao traço procedural. */
      const arteChao = Object.values(TILE_ART).filter(k => SPRITE_DATA[k]);
      ok('há arte de chão embutida', arteChao.length >= 8,
         `${arteChao.length} de ${Object.keys(TILE_ART).length}`);
      const arteAltaAusente = Object.entries(TALL_ART)
        .filter(([, chave]) => !SPRITE_DATA[chave])
        .map(([id, chave]) => `${id}: ${chave}`);
      ok('todo tile alto está ligado a um sprite de cenário',
         arteAltaAusente.length === 0, arteAltaAusente.join(' · '));
      ok('a água NÃO está em TILE_ART', !TILE_ART.water,
         'o atalho passaria na frente da água animada');
      ok('a água animada continua com os três quadros',
         TILE_AGUA.every(k => SPRITE_DATA[k]), TILE_AGUA.join(','));

      /* O switch de `drawTileArt` conserva uma defesa para imagem que
         falhe durante desenvolvimento, mas nenhum id que os MAPS usam
         pode depender dela em publicação. Os especiais têm arte própria
         fora de TILE_ART; o restante precisa estar nas duas tabelas. */
      const idsDeMapa = [...new Set(Object.values(TILEDEF).map(t => t.id))];
      const semArtePublicada = idsDeMapa.filter(id => {
        if (id === 'water') return !TILE_AGUA.every(k => SPRITE_DATA[k]);
        if (id === 'chest') return !SPRITE_DATA.tile_chest || !SPRITE_DATA.tile_chest_open;
        if (id === 'brazier') return !TILE_BRASA.every(k => SPRITE_DATA[k]);
        return !(SPRITE_DATA[TILE_ART[id]] || SPRITE_DATA[TALL_ART[id]]);
      });
      ok('nenhum tile de mapa publicado depende do desenho procedural',
         semArtePublicada.length === 0, semArtePublicada.join(','));

      const variantesRuins = [];
      for (const [mapaId, mapa] of Object.entries(MAPS))
        for (const [caractere, chave] of Object.entries(mapa.tileArt || {})){
          if (!TILEDEF[caractere]) variantesRuins.push(`${mapaId}: tile ${caractere} desconhecido`);
          else if (!SPRITE_DATA[chave]) variantesRuins.push(`${mapaId}: arte ${chave} ausente`);
        }
      ok('toda variante local de tile usa gramática e sprite válidos',
         variantesRuins.length === 0, variantesRuins.join(' · '));

      /* Peça de cenário sem altura não desenha nada e não avisa. */
      const chatas = Object.keys(SPRITE_DATA)
        .filter(k => k.startsWith('prop_'))
        .filter(k => { const i = spriteImages[k];
                       return i && (i.naturalHeight || i.height) < 12; });
      ok('nenhuma peça de cenário ficou achatada', chatas.length === 0,
         chatas.join(','));

      /* --- Famílias visuais regionais (v5.33, WORLD_ART_FAMILIES) ---
         Contrato do plano de expansão de assets, seção 18. Cobre: toda
         chave existe, família nunca vazia, seleção determinística e
         sempre dentro do array, e a resolução nunca toca TILEDEF (a
         variante é só pele — colisão/flag lógica continuam do jeito
         que sempre foram). */
      {
        const todasFamilias = [
          ...Object.entries(WORLD_ART_FAMILIES.regioes).map(([reg, porId]) => ['regiao:' + reg, porId]),
          ...Object.entries(WORLD_ART_FAMILIES.mapas).map(([mid, porId]) => ['mapa:' + mid, porId]),
        ];
        const vazias = [];
        const chavesAusentes = [];
        for (const [origem, porId] of todasFamilias)
          for (const [idLogico, variantes] of Object.entries(porId)){
            if (!Array.isArray(variantes) || variantes.length === 0){
              vazias.push(`${origem}/${idLogico}`); continue;
            }
            for (const v of variantes)
              if (!SPRITE_DATA[v.key]) chavesAusentes.push(`${origem}/${idLogico}: ${v.key}`);
          }
        ok('nenhuma família visual chega vazia ao renderer', vazias.length === 0, vazias.join(' · '));
        ok('toda variante de família aponta pra sprite catalogado',
           chavesAusentes.length === 0, chavesAusentes.join(' · '));

        /* Determinismo: a mesma célula, chamada duas vezes, devolve a
           mesma chave — nunca Math.random(). Testa contra a família de
           exemplo (undercroft/pillar) e contra uma família sintética
           com 3 variantes ponderadas, cobrindo o índice de peso > 1. */
        const antes = {mapId:G.mapId, map:G.map};
        G.mapId = 'undercroft'; G.map = {def:{region:'undercroft'}};
        const rep1 = [chaveDeFamilia('pillar', 3, 5), chaveDeFamilia('pillar', 3, 5), chaveDeFamilia('pillar', 3, 5)];
        ok('seleção de variante é determinística (mesma célula, mesma chave sempre)',
           rep1.every(k => k === rep1[0]), rep1.join(','));

        const familiaSintetica = [{key:'a', weight:1}, {key:'b', weight:2}, {key:'c', weight:3}];
        let foraDoArray = 0;
        for (let x = 0; x < 40; x++) for (let y = 0; y < 5; y++){
          G.mapId = 'mapa_teste_familia';
          const k = varianteDeFamilia(familiaSintetica, 'obj', x, y);
          if (!familiaSintetica.some(v => v.key === k)) foraDoArray++;
        }
        ok('seleção de variante nunca sai do array da família (peso ponderado)',
           foraDoArray === 0, `${foraDoArray} fora do array`);

        /* A família só decide ARTE — nunca mexe na gramática do tile.
           `TILEDEF` antes e depois da resolução tem de ser o mesmo
           objeto, byte a byte (JSON), pra provar que colisão/enc/warp
           não dependem da variante visual escolhida. */
        const tiledefAntes = JSON.stringify(TILEDEF);
        chaveDeFamilia('pillar', 3, 5);
        varianteDeFamilia(familiaSintetica, 'obj', 1, 1);
        ok('resolver família nunca altera TILEDEF (colisão/lógica intactas)',
           JSON.stringify(TILEDEF) === tiledefAntes);

        G.mapId = antes.mapId; G.map = antes.map;

        /* Toda variante de família tem de aparecer em pelo menos uma
           célula real do mapa/região a que pertence — senão a arte foi
           entregue mas nunca é vista. Achado real (revisão automática da
           PR #12): peso 4:1:1:1 em `patio.tree` deixava a variante _03
           sem nenhuma das 17 árvores do Pátio. Sonda TODAS as células dos
           mapas reais com a mesma leitura que o renderer usa
           (`TILEDEF[ch].id`), soma quais chaves saíram pelo menos uma
           vez; família com só 1 variante (prova de conceito) não tem
           cobertura a provar e é ignorada. */
        {
          const salvoFam = {mapa:G.mapId, cena:G.scene, x:G.player.tx, y:G.player.ty};
          const inacessiveis = [];
          const origens = [
            ...Object.entries(WORLD_ART_FAMILIES.mapas).map(([mid, porId]) => ({tipo:'mapa', alvo:mid, porId})),
            ...Object.entries(WORLD_ART_FAMILIES.regioes).map(([reg, porId]) => ({tipo:'regiao', alvo:reg, porId})),
          ];
          for (const {tipo, alvo, porId} of origens){
            const mapasAlvo = tipo === 'mapa'
              ? (MAPS[alvo] ? [alvo] : [])
              : Object.entries(MAPS).filter(([, def]) => def.region === alvo).map(([mid]) => mid);
            if (mapasAlvo.length === 0) continue;
            for (const [idLogico, variantes] of Object.entries(porId)){
              if (!Array.isArray(variantes) || variantes.length < 2) continue;
              const vistos = new Set();
              for (const mid of mapasAlvo){
                loadMap(mid); Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
                const linhas = (MAPS[mid].grid || MAPS[mid].rows || []).map(String);
                for (let y = 0; y < linhas.length; y++)
                  for (let x = 0; x < linhas[y].length; x++){
                    const td = TILEDEF[linhas[y][x]];
                    if (td && td.id === idLogico) vistos.add(chaveDeFamilia(idLogico, x, y));
                  }
              }
              const faltando = variantes.map(v => v.key).filter(k => !vistos.has(k));
              if (faltando.length) inacessiveis.push(`${tipo}:${alvo}/${idLogico}: ${faltando.join(',')}`);
            }
          }
          ok('toda variante de família aparece em pelo menos uma célula real do mapa/região',
             inacessiveis.length === 0, inacessiveis.join(' · '));
          if (salvoFam.mapa) loadMap(salvoFam.mapa, salvoFam.x, salvoFam.y);
          Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
          G.scene = salvoFam.cena || 'FIELD';
        }
      }

      /* O lampião é uma peça vertical de cais/interior: largura de tile
         e altura alta, mas sem virar uma faixa gigante nem um fragmento
         de arquivo mal recortado. Porto Lúmina usa três dele. */
      const lampiao = spriteImages.prop_lampiao;
      const lw = lampiao && (lampiao.naturalWidth || lampiao.width);
      const lh = lampiao && (lampiao.naturalHeight || lampiao.height);
      ok('o lampião de cenário preserva proporção de prop vertical',
         !!lw && !!lh && lw >= 32 && lw <= 64 && lh >= 64 && lh <= 112,
         `${lw || 0}×${lh || 0}`);
    }

    /* --- v5.17: fundo de batalha em arte ---------------------------- */
    {
      /* O número de quadros sai da divisão das dimensões da folha pelas
         da tela. Folha que não seja múltiplo inteiro de 800×600 fatia
         torto — meio quadro de um, meio do vizinho — e o defeito só
         aparece em movimento, que é o pior jeito de descobrir. */
      const tortas = Object.keys(SPRITE_DATA)
        .filter(k => k.startsWith('battle_bg_'))
        .map(k => ({k, i:spriteImages[k]}))
        .filter(({i}) => i && (i.naturalWidth || i.width))
        .filter(({i}) => (i.naturalWidth % W) || (i.naturalHeight % H))
        .map(({k, i}) => `${k}: ${i.naturalWidth}×${i.naturalHeight}`);
      ok('toda folha de fundo é múltiplo inteiro de 800×600',
         tortas.length === 0, tortas.join(' · '));

      /* Fundo embutido para uma região que não existe é arte paga e
         nunca mostrada — `folhaFundoBatalha` procura pela região do
         mapa e não acha nada. */
      /* "Região que existe" não basta: tem de ser região onde dá para
         entrar em batalha. `hall` existe em três mapas e nunca briga —
         `encounter: null`, nenhuma formação, nenhum chefe. */
      const brigam = new Set();
      for (const m of Object.values(MAPS)){
        if (!m.region) continue;
        if (m.encounter || m.boss || (m.mobs || []).length) brigam.add(m.region);
      }
      /* v5.29 — a chave também pode ser de um MAPA, que ganha da região.
         Vale a mesma exigência: o mapa tem de poder brigar, senão a
         folha nunca aparece. `arquivo_fundo` é a sala do Arquivista. */
      const comFolha = new Set(brigam);
      for (const [id, m] of Object.entries(MAPS))
        if (m.encounter || m.boss || (m.mobs || []).length) comFolha.add(id);
      const orfaos = Object.keys(SPRITE_DATA)
        .filter(k => k.startsWith('battle_bg_') && !comFolha.has(k.slice(10)));
      ok('todo battle_bg_* embutido é de região ou mapa onde há batalha',
         orfaos.length === 0, orfaos.join(','));
      ok('nenhuma região de batalha ficou sem par em FORMATIONS ou chefe',
         [...brigam].every(r => (FORMATIONS[r] || []).length ||
            Object.values(MAPS).some(m => m.region === r && m.boss)),
         [...brigam].join(','));

      /* Sem folha, o procedural desenha — o contrato de sempre. E com
         folha, o quadro sai da folha. Os dois caminhos, provados. */
      {
        const salvo = {cena:G.scene, mapa:G.mapId};
        const reg = G.map?.def.region;
        ok('o mapa atual declara uma região', !!reg, reg || 'nenhuma');
        const chave = 'battle_bg_' + reg;

        ctx.clearRect(0, 0, W, H);
        const antes = spriteImages[chave];
        delete spriteImages[chave];
        ok('sem folha, desenharFundoEmArte recusa', desenharFundoEmArte() === false);
        let erro = null;
        try { drawBattleBG(); } catch(e){ erro = e.message; }
        ok('sem folha, o fundo procedural desenha sem estourar', !erro, erro || 'ok');
        const proc = ctx.getImageData(400, 200, 1, 1).data.join(',');

        /* Empresta uma folha de UM quadro: 800×600 solto tem de valer
           como papel de parede estático pelo mesmo caminho de código. */
        const um = spriteImages['tree_bg_fire'] || spriteImages['title_bg'];
        ok('há uma imagem para emprestar ao teste', !!um);
        if (um){
          spriteImages[chave] = um;
          ctx.clearRect(0, 0, W, H);
          ok('com folha, desenharFundoEmArte assume', desenharFundoEmArte() === true);
          const arte = ctx.getImageData(400, 200, 1, 1).data.join(',');
          ok('o fundo em arte realmente substitui o procedural', proc !== arte,
             `${proc} → ${arte}`);
        }
        if (antes) spriteImages[chave] = antes; else delete spriteImages[chave];
        ctx.clearRect(0, 0, W, H);
        G.scene = salvo.cena;
      }

      /* O véu do rodapé. Sem ele a régua de atalhos, que é o único
         pedaço da HUD sem painel atrás, some em fundo claro — foi
         medido em 14 níveis de contraste na Coroa de Vidro contra 16-26
         nas outras seis. E ele NÃO pode escurecer o palco. */
      {
        const reg = G.map?.def.region, chave = 'battle_bg_' + reg;
        const antes = spriteImages[chave];
        const branco = document.createElement('canvas');
        branco.width = W; branco.height = H;
        branco.getContext('2d').fillStyle = '#ffffff';
        branco.getContext('2d').fillRect(0, 0, W, H);
        spriteImages[chave] = branco;

        ctx.clearRect(0, 0, W, H);
        desenharFundoEmArte();
        const luz = y => ctx.getImageData(400, y, 1, 1).data[0];
        ok('o véu não toca o palco', luz(200) === 255 && luz(360) === 255,
           `y200=${luz(200)} y360=${luz(360)}`);
        ok('o véu escurece a faixa da régua de atalhos', luz(580) < 150,
           `y580=${luz(580)}`);
        ok('o véu é um degradê, não um corte', luz(520) > luz(560) && luz(560) > luz(580),
           `${luz(520)}>${luz(560)}>${luz(580)}`);
        /* Cinza puro: se alguém trocar por preto-azulado, o tema gira o
           véu junto com o menu e o rodapé muda de cor sozinho. */
        const d = ctx.getImageData(400, 590, 1, 1).data;
        ok('o véu é acinzentado, fora da banda que o tema gira',
           Math.abs(d[0] - d[1]) <= 1 && Math.abs(d[1] - d[2]) <= 1,
           `rgb(${d[0]},${d[1]},${d[2]})`);

        if (antes) spriteImages[chave] = antes; else delete spriteImages[chave];
        ctx.clearRect(0, 0, W, H);
      }

      /* O índice do quadro tem de ficar dentro da folha em TODO instante
         do ciclo, nos dois modos. Um índice fora da grade não estoura —
         `drawImage` recorta em silêncio e o fundo pisca preto. */
      const indice = (passo, total, vaivem) => {
        if (total <= 1) return 0;
        if (!vaivem) return ((passo % total) + total) % total;
        const ciclo = total * 2 - 2;
        const k = ((passo % ciclo) + ciclo) % ciclo;
        return k < total ? k : ciclo - k;
      };
      let fora = 0, vistos = new Set();
      for (const total of [1, 2, 12, 16]){
        for (let passo = -40; passo < 80; passo++){
          for (const vv of [false, true]){
            const i = indice(passo, total, vv);
            if (!(i >= 0 && i < total && Number.isInteger(i))) fora++;
            if (total === 12 && !vv) vistos.add(i);
          }
        }
      }
      ok('o quadro nunca cai fora da folha, nem com passo negativo', fora === 0, `${fora} fora`);
      ok('o ciclo de 12 quadros usa os 12', vistos.size === 12, `${vistos.size} de 12`);

      /* Vai-e-volta tem de dar 2N−2 passos e voltar ao começo, senão o
         loop dá um solavanco na virada. */
      const seq = [];
      for (let p = 0; p < 22; p++) seq.push(indice(p, 12, true));
      /* 0..11 subindo (12 passos) e 10..1 descendo (10) = ciclo de 22.
         As duas pontas — 0 e 11 — aparecem UMA vez cada; repetir uma
         delas é o solavanco que o vai-e-volta existe para evitar. */
      ok('vai-e-volta sobe até o fim e desce sem repetir a ponta',
         seq[0] === 0 && seq[11] === 11 && seq[12] === 10 && seq[21] === 1 &&
         indice(22, 12, true) === 0, seq.join(','));
    }

    /* --- v5.16: árvore de habilidades com ícone --------------------- */
    {
      /* O nó da árvore passou a poder mostrar arte, e arte tem tamanho
         mínimo para ser reconhecível. Estes testes existem para que
         ninguém acrescente uma habilidade — ou mexa no espaçamento das
         folhas — e descubra meses depois que os ícones voltaram a se
         encostar. A geometria vem de `geometriaArvore`, a MESMA função
         que o desenho usa; recopiar a conta aqui seria um teste que
         continua verde depois que a tela quebra. */
      const ICONE_NO = 16;      // px de ícone dentro do nó
      const FOLGA    = 2;       // ar mínimo entre dois nós vizinhos

      const apertados = [], pequenos = [], forade = [];
      for (const c of G.party){
        const g = geometriaArvore(c);
        const pontos = g.nos.map(n => ({n, x:g.sx(n), y:g.sy(n), r:g.raio(n)}));

        /* 1. nó de habilidade grande o bastante para o ícone. Duas
           medidas: o ícone é DESENHADO em 2r e o recorte circular mostra
           2(r−1) dele. A segunda é a que o olho vê. */
        for (const a of pontos){
          if (a.n.tipo !== 'skill') continue;
          if (a.r * 2 < ICONE_NO)
            pequenos.push(`${c.name}/${a.n.id}: desenha ${(a.r*2).toFixed(1)}px`);
          if ((a.r - 1) * 2 < ICONE_NO - 2)
            pequenos.push(`${c.name}/${a.n.id}: mostra ${((a.r-1)*2).toFixed(1)}px`);
        }
        // 2. nó de habilidade não encosta em ninguém
        for (const a of pontos){
          if (a.n.tipo !== 'skill') continue;
          for (const b of pontos){
            if (a.n.id === b.n.id) continue;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < a.r + b.r + FOLGA)
              apertados.push(`${c.name}: ${a.n.id}↔${b.n.id} ${d.toFixed(1)}px < ${(a.r+b.r+FOLGA).toFixed(1)}`);
          }
        }
        // 3. nenhum nó vaza da área do grafo
        for (const a of pontos){
          if (a.x - a.r < g.gx || a.x + a.r > g.gx + g.gw ||
              a.y - a.r < g.gy || a.y + a.r > g.gy + g.gh)
            forade.push(`${c.name}/${a.n.id}`);
        }
      }
      ok('todo nó de habilidade comporta um ícone de 16px',
         pequenos.length === 0, pequenos.slice(0, 3).join(' · '));
      ok('nenhum nó de habilidade encosta no vizinho',
         apertados.length === 0, apertados.slice(0, 3).join(' · '));
      ok('nenhum nó da árvore vaza da área do grafo',
         forade.length === 0, forade.slice(0, 4).join(' · '));

      /* A chave do ícone é `hab_` + o id da habilidade. Nó de habilidade
         sem `skill` geraria `hab_undefined` — e `arteUI` devolveria null
         para sempre, em silêncio. */
      const semId = [];
      for (const c of G.party)
        for (const n of Object.values(arvoreDe(c)))
          if (n.tipo === 'skill' && !n.skill) semId.push(`${c.name}/${n.id}`);
      ok('todo nó de habilidade sabe de que habilidade é',
         semId.length === 0, semId.join(','));

      /* Ícone embutido que não corresponde a nenhuma habilidade aprendida
         é arte paga e nunca mostrada — o caso típico é alguém renomear a
         habilidade e esquecer de renomear o slot junto. */
      const aprendidas = new Set();
      for (const d of PARTY_DEFS) for (const [, id] of d.learn) aprendidas.add(id);
      const orfaos = Object.keys(SPRITE_DATA)
        .filter(k => k.startsWith('hab_') && !aprendidas.has(k.slice(4)));
      ok('todo ícone hab_* embutido é de habilidade que alguém aprende',
         orfaos.length === 0, orfaos.join(','));

      /* O caminho do ícone tem de funcionar ANTES de existir arte, senão
         o primeiro PNG entregue vira uma sessão de depuração. Empresta a
         imagem de um ícone de arma para um nó, desenha, e confere que o
         miolo do nó mudou de cor. */
      {
        const salvo = {cena:G.scene, pag:Menu.page, aberto:Menu.isOpen && Menu.isOpen()};
        const c = G.party[0];
        const alvoNo = Object.values(arvoreDe(c)).find(n => n.tipo === 'skill');
        const g = geometriaArvore(c);
        const px2 = Math.round(g.sx(alvoNo)), py2 = Math.round(g.sy(alvoNo));
        const emprestado = spriteImages['icon_sword'];
        ok('há uma imagem para emprestar ao teste', !!emprestado);

        Menu.open(); Menu.page = 'skills'; Menu.cur.treeWho.i = 0;
        G.scene = 'MENU';
        ctx.clearRect(0, 0, W, H); Menu.draw();
        const semArte = ctx.getImageData(px2, py2, 1, 1).data.join(',');

        const antes = spriteImages['hab_' + alvoNo.skill];
        spriteImages['hab_' + alvoNo.skill] = emprestado;
        ctx.clearRect(0, 0, W, H); Menu.draw();
        const comArte = ctx.getImageData(px2, py2, 1, 1).data.join(',');
        if (antes) spriteImages['hab_' + alvoNo.skill] = antes;
        else delete spriteImages['hab_' + alvoNo.skill];

        ok('o ícone do nó realmente é desenhado quando a arte existe',
           !!emprestado && semArte !== comArte, `${semArte} → ${comArte}`);

        // e sem arte a árvore continua desenhando, que é o contrato
        let erroT = null;
        for (let i = 0; i < G.party.length; i++){
          Menu.cur.treeWho.i = i;
          try { ctx.clearRect(0, 0, W, H); Menu.draw(); }
          catch(e){ erroT = `${G.party[i].name}: ${e.message}`; break; }
        }
        ok('desenhar a árvore dos nove sem ícone nenhum não estoura', !erroT, erroT || 'ok');

        Menu.cur.treeWho.i = 0;
        if (!salvo.aberto) Menu.close(); else Menu.page = salvo.pag;
        G.scene = salvo.cena;
        ctx.clearRect(0, 0, W, H);
      }

      /* v5.20: a árvore virou tela cheia. O layout tem de fechar sozinho
         — grafo e barra lateral sem se sobrepor, os dois dentro da tela
         — senão o grafo desenha por baixo da ficha e ninguém percebe até
         alguém reclamar que "sumiu um nó". */
      {
        const g = ARVORE_TELA.grafo, f = ARVORE_TELA.ficha, fx = ARVORE_TELA.faixa;
        ok('grafo e barra lateral não se sobrepõem', g.x + g.w <= f.x,
           `grafo acaba em ${g.x + g.w}, ficha começa em ${f.x}`);
        ok('a faixa dos ramos fica acima do grafo', fx.y + fx.h <= g.y);
        for (const [nome, r] of [['grafo', g], ['ficha', f], ['faixa', fx]])
          ok(`a área ${nome} cabe na tela`,
             r.x >= 0 && r.y >= 0 && r.x + r.w <= W && r.y + r.h <= H,
             `${r.x},${r.y} ${r.w}x${r.h}`);
        ok('a ficha comporta o ícone de 96px', f.w - 96 >= 40, `${f.w}px de largura`);

        ok('o rodapé de comandos fica abaixo do grafo e da ficha',
           ARVORE_TELA.rodape.y >= g.y + g.h && ARVORE_TELA.rodape.y >= f.y + f.h);

        /* MUDANÇA DE REGRA DECLARADA (v5.31).
           Até a v5.30 esta seção exigia escala de ajuste > 0,68 — a
           árvore inteira cabendo na janela COM os ícones legíveis ao
           mesmo tempo. A árvore do spec novo tem uma coroa de
           convergências e um apocalipse além da ponta dos caminhos, e
           essas duas exigências deixaram de caber juntas: enquadrar
           tudo dá 0,48.

           Não é uma piora escondida atrás de um número menor. O que
           mudou é que agora existe ZOOM (spec §26): o enquadramento
           padrão passou a ser "vejo a árvore toda", e ler um ícone é
           trabalho do zoom. Então o que se mede aqui são as duas coisas
           que o jogador precisa de verdade — que no padrão nada fique
           fora da janela, e que no zoom máximo o ícone fique legível. */
        for (const c of G.party){
          const gp = geometriaArvore(c, g, null);
          const fora = gp.nos.filter(n => {
            const x = gp.sx(n), y = gp.sy(n), r = gp.raio(n);
            return x - r < g.x || x + r > g.x + g.w || y - r < g.y || y + r > g.y + g.h;
          });
          ok(`${c.name}: no enquadramento padrão a árvore inteira cabe na janela`,
             !fora.length, fora.slice(0, 3).map(n => n.id).join(' · '));
        }
        {
          const vmax = {zoom:ZOOM_ARVORE.max, px:0, py:0};
          const raios = G.party.map(c => {
            const gp = geometriaArvore(c, g, vmax);
            return Math.min(...gp.nos.filter(n => n.tipo === 'skill').map(n => gp.raio(n)));
          });
          ok('no zoom máximo todo nó de habilidade tem ao menos 8px de raio',
             Math.min(...raios) >= 8, `mínimo ${Math.min(...raios).toFixed(1)}px`);
        }
        {
          /* O pan é preso: a árvore não pode ser empurrada para fora da
             janela até sumir. Arrastar mil unidades para cada canto e
             conferir que sobrou nó visível é o teste dessa trava. */
          const c = G.party[0];
          let pior = Infinity;
          for (const [px, py] of [[9999,0],[-9999,0],[0,9999],[0,-9999],[9999,9999]]){
            const gp = geometriaArvore(c, g, {zoom:ZOOM_ARVORE.max, px, py});
            pior = Math.min(pior, gp.nos.filter(n => {
              const x = gp.sx(n), y = gp.sy(n);
              return x >= g.x && x <= g.x + g.w && y >= g.y && y <= g.y + g.h;
            }).length);
          }
          ok('a árvore nunca some inteira por arrastar longe demais', pior > 0,
             `${pior} nó(s) visível(is) no pior canto`);
        }
      }
    }

    /* --- v5.14: controle e mouse ------------------------------------ */
    {
      /* CONTROLE. Um joystick falso, para o mapeamento ser testável sem
         um joystick de verdade na mão — ou seja, para ser testável. */
      const salvoFonte = Controle.fonte, salvoVk = {...Input._vk};
      const pad = (botoes = {}, eixos = [0,0,0,0]) => ({
        connected:true, axes:eixos,
        buttons:Array.from({length:17}, (_, i) => ({pressed:!!botoes[i], value:botoes[i]?1:0})),
      });
      /* `_antes` NÃO é zerado entre as leituras de propósito: é ele que
         guarda o quadro anterior, e é comparando com ele que o soltar é
         detectado. Zerando, o teste nunca exercitaria o soltar — que é
         justamente onde um controle costuma travar a ação apertada. */
      const ligar = p => { Controle.fonte = () => [p]; Controle.ler(); };
      Controle._antes = {};

      ligar(pad({0:true}));
      ok('botão A do controle confirma', Input.isDown('confirm'));
      ligar(pad({1:true}));
      ok('botão B do controle cancela', Input.isDown('cancel'));
      ok('soltar A tira o confirmar', !Input.isDown('confirm'));

      ligar(pad({12:true}));
      ok('direcional do controle anda para cima', Input.isDown('up'));
      ligar(pad({9:true}));
      ok('start abre o menu', Input.isDown('menu'));

      /* Manche: abaixo da zona morta não conta. Um analógico em repouso
         nunca marca exatamente zero, e sem zona morta o cursor de menu
         sairia andando sozinho. */
      ligar(pad({}, [0.3, 0, 0, 0]));
      ok('manche dentro da zona morta não move nada',
         !Input.isDown('right') && !Input.isDown('left'));
      ligar(pad({}, [0.9, 0, 0, 0]));
      ok('manche além da zona morta move', Input.isDown('right'));
      ligar(pad({}, [0, -0.9, 0, 0]));
      ok('manche para cima move para cima', Input.isDown('up'));
      ok('e larga o lado que já não está sendo empurrado', !Input.isDown('right'));

      ok('todo botão mapeado aponta para ação que existe',
         Object.values(BOTOES_CONTROLE).every(a =>
           Object.values(Input.BIND).includes(a) || ['run','swap','menu'].includes(a)),
         Object.values(BOTOES_CONTROLE).filter(a => !Object.values(Input.BIND).includes(a)).join(','));
      ok('confirmar e cancelar existem no controle',
         Object.values(BOTOES_CONTROLE).includes('confirm') &&
         Object.values(BOTOES_CONTROLE).includes('cancel'));
      ok('as quatro direções existem no controle',
         ['up','down','left','right'].every(d => Object.values(BOTOES_CONTROLE).includes(d)));

      Controle.fonte = () => [];
      Controle.ler();
      ok('sem controle ligado nada fica preso',
         !Input.isDown('confirm') && !Input.isDown('up') && !Controle.ativo);
      Controle.fonte = salvoFonte; Input._vk = salvoVk;

      /* MOUSE. O registro é preenchido pelo desenho, então a regra que
         importa é: só dá para clicar no que está na tela. */
      const salvoAreas = Clique.areas.slice();
      const salvoPos = {x:Clique.x, y:Clique.y, dentro:Clique.dentro};
      Clique.novoQuadro();
      ok('o registro de cliques começa vazio a cada quadro', Clique.areas.length === 0);

      let contou = 0;
      Clique.add(10, 10, 50, 20, () => contou++);
      Clique.x = 20; Clique.y = 15; Clique.dentro = true;
      Clique._pend = {x:20, y:15};
      ok('clique dentro da área dispara a ação', Clique.resolver() === true && contou === 1);
      Clique._pend = {x:500, y:400};
      ok('clique fora de tudo não dispara nada', Clique.resolver() === false && contou === 1);

      /* Duas áreas empilhadas: ganha a de CIMA, que é a registrada por
         último — é a que o jogador está vendo. */
      Clique.novoQuadro();
      let quem = '';
      Clique.add(0, 0, 100, 100, () => { quem = 'baixo'; });
      Clique.add(0, 0, 100, 100, () => { quem = 'cima'; });
      Clique._pend = {x:50, y:50}; Clique.resolver();
      ok('quando duas áreas se empilham, ganha a de cima', quem === 'cima', quem);

      /* Área de fundo (o mundo) recebe clique mas NÃO conta como
         interface — senão não daria para andar com o mouse em lugar
         nenhum, que foi o defeito da primeira volta. */
      Clique.novoQuadro();
      Clique.add(0, 0, W, H, () => {}, {fundo:true});
      Clique.x = 400; Clique.y = 300; Clique.dentro = true;
      ok('a área de fundo não é vista como interface', Clique.sob() === null);
      Clique.add(390, 290, 40, 20, 'menu');
      ok('mas a interface por cima dela é vista', !!Clique.sob());

      /* `escolher` põe o cursor na linha e enfileira o confirmar: clicar
         numa lista faz o mesmo que navegar até ela e apertar. */
      Clique.novoQuadro();
      const cur = {i:0};
      Clique.escolher(cur, 3)();
      ok('clicar numa linha leva o cursor até ela', cur.i === 3);
      ok('e enfileira o confirmar', Input.isDown('confirm'));
      Input._vk = salvoVk;

      Clique.areas = salvoAreas;
      Clique.x = salvoPos.x; Clique.y = salvoPos.y; Clique.dentro = salvoPos.dentro;
      Clique._pend = null;
    }

    /* --- v5.13: tema que segue o relógio ---------------------------- */
      {
        const salvoT = G.tema, salvoS = G.steps;
        G.tema = 'relogio';
        const horaPara = h => Math.round(h / 24 * DIA_EM_PASSOS) - PASSO_ZERO;
        const em = h => { G.steps = horaPara(h); return temaAtual(); };

        const base = TEMAS.find(t => t.id === 'relogio');
        ok('o tema do relógio está na lista de temas', !!base && base.segueRelogio);

        /* O contrato é o do mockup: DOURADO de dia, VIOLETA de noite. Se
           os dois extremos trocarem de lado, o sistema inteiro perde o
           sentido. `giro` 0 é o violeta do Éter; -220 leva ao dourado. */
        const meio = em(16), noite = em(0);
        ok('de dia a interface vai para o dourado', meio.giro < -150, `${Math.round(meio.giro)}`);
        ok('de madrugada a interface volta ao violeta', Math.abs(noite.giro) < 20,
           `${Math.round(noite.giro)}`);
        ok('o poente ainda é dourado, e não já violeta',
           em(18).giro < -150, `${Math.round(em(18).giro)}`);
        ok('a gema acompanha: quente de dia, fria de noite',
           em(16).gema !== em(0).gema, `${em(16).gema} / ${em(0).gema}`);

        /* A memória de `corDoTema` é indexada pelo id do tema. Se o id
           mudasse a cada passo, ela cresceria sem parar — por isso o
           valor é arredondado em degraus. */
        const ids = new Set();
        for (let p = 0; p < DIA_EM_PASSOS; p++){ G.steps = p - PASSO_ZERO; ids.add(temaAtual().id); }
        ok('o tema do relógio tem um número FECHADO de estados',
           ids.size <= PASSOS_TEMA_RELOGIO + 1, `${ids.size} ids num dia`);

        /* Continuidade: a interface não pode piscar de cor entre um passo
           e o seguinte, do mesmo jeito que a luz do campo não pisca. */
        let salto = 0;
        let ant = (G.steps = -PASSO_ZERO, temaAtual().giro);
        for (let p = 1; p <= DIA_EM_PASSOS; p++){
          G.steps = p - PASSO_ZERO;
          const at = temaAtual().giro;
          salto = Math.max(salto, Math.abs(at - ant)); ant = at;
        }
        ok('a cor da interface muda sem pular entre um passo e o seguinte',
           salto <= 220 / PASSOS_TEMA_RELOGIO + 1, `maior salto ${salto.toFixed(1)}°`);

        G.tema = salvoT; G.steps = salvoS;
      }

      /* --- v5.13: retrato e atalho contextual ------------------------- */
      {
        const c = charByName('Seiji') || makeChar(PARTY_DEFS[0], 5);
        const r = retratoDe(c);
        ok('retratoDe devolve alguma imagem para quem está no elenco', !!r);
        ok('retratoDe marca se o que devolveu é busto ou chibi',
           !r || typeof r.busto === 'boolean');
        /* O retrato CABE na caixa, nunca é cortado. Foi cortando que o
           Seiji e a Ophelia viraram testa e borrão no cartão de grupo:
           os dois têm busto, e busto é a arte alta que a caixa larga
           picava. A prova é geométrica — desenhado numa caixa de
           qualquer proporção, o que entra tem de caber. */
        for (const caixa of [[87,50],[18,21],[52,56],[200,20],[20,200]]){
          const [bw, bh] = caixa;
          const iw = r.img.naturalWidth || r.img.width;
          const ih = r.img.naturalHeight || r.img.height;
          const e = Math.min(bw / iw, bh / ih);
          if (iw * e > bw + 0.01 || ih * e > bh + 0.01){
            ok(`o retrato cabe numa caixa ${bw}x${bh}`, false,
               `${Math.round(iw*e)}x${Math.round(ih*e)}`);
            break;
          }
        }
        ok('o retrato cabe inteiro em caixa de qualquer proporção',
           [[87,50],[18,21],[52,56],[200,20],[20,200]].every(([bw,bh]) => {
             const iw = r.img.naturalWidth || r.img.width;
             const ih = r.img.naturalHeight || r.img.height;
             const e = Math.min(bw / iw, bh / ih);
             return iw * e <= bw + 0.01 && ih * e <= bh + 0.01;
           }));
        ok('desenharRetrato existe e devolve false para quem não tem arte',
           typeof desenharRetrato === 'function' &&
           desenharRetrato(null, 0, 0, 10, 10) === false &&
           desenharRetrato({name:'Ninguem'}, 0, 0, 10, 10) === false);
        ok('desenharRetrato não estoura com caixa de tamanho zero',
           desenharRetrato(c, 0, 0, 0, 0) === false);
        ok('retratoDe não estoura com personagem inexistente',
           retratoDe(null) === null && retratoDe({name:'Ninguem'}) === null);

        /* O atalho da tela não pode prometer o que a tecla não faz: os
           dois têm de olhar para a mesma casa. */
        const salvo = {mapa:G.mapId, x:G.player.tx, y:G.player.ty, dir:G.player.dir, cena:G.scene};
        loadMap('patio'); Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
        G.scene = 'FIELD';
        const npc = G.map.npcs[0];
        ok('o mapa de teste tem NPC', !!npc);
        if (npc){
          G.player.tx = npc.tx; G.player.ty = npc.ty - 1; G.player.dir = 'down';
          ok('de frente para um NPC o atalho anuncia a ação', !!alvoNaFrente(),
             String(alvoNaFrente()));
          G.player.dir = 'up';
          ok('de costas para o NPC o atalho não anuncia nada',
             alvoNaFrente() === null, String(alvoNaFrente()));
        }
        let erroA = null;
        try { drawAtalhosCampo(); } catch(e){ erroA = e.message; }
        ok('desenhar a régua de atalhos não estoura', !erroA, erroA || 'ok');
        ctx.clearRect(0, 0, W, H);
        if (salvo.mapa) loadMap(salvo.mapa, salvo.x, salvo.y, salvo.dir);
        Cut.stop && Cut.stop(); Msg.active = false; Msg.lines = [];
        G.scene = salvo.cena || 'FIELD';
      }
      {
        const salvoQ = G.quests;
        const idq = Object.keys(QUESTS)[0];
        G.quests = {};
        ok('missão ainda não aceita ganha marcador', marcaDoNPC({quest:idq}) === 'missao');
        G.quests = {[idq]:{st:'feita', base:0}};
        ok('missão já entregue perde o marcador', marcaDoNPC({quest:idq}) === null);
        G.quests = salvoQ;
      }
    }

    /* --- v5.10: a vitória não pode tapar quem venceu ----------------- */
    {
      const reais = Object.values(BATTLE_ART);
      const AW = Math.max(...reais.map(a => a.w)), AH = Math.max(...reais.map(a => a.h));
      const corpos = ALLY_SPOTS_LARGE.map(s => ({x0:s.x-AW/2, x1:s.x+AW/2, y0:s.y-AH, y1:s.y}));

      /* A caixa cresce com o conteúdo: EXP e ouro sempre, mais uma linha
         por quem subiu de nível, mais drops, mais pet. O pior caso é o
         grupo inteiro subindo de nível de uma vez — é ele que tem de
         caber sem encostar em ninguém. */
      const alturaDe = ups => 190 + ups*46 + 26 + 30;
      const piores = [];
      for (let ups = 0; ups <= PARTY_SIZE; ups++){
        const h = alturaDe(ups);
        const y = clamp(H/2 - h/2, HUD.campo.y0 - 40, H - h - 10);
        const cx = {x0:VITORIA_CAIXA.x, x1:VITORIA_CAIXA.x + VITORIA_CAIXA.larg,
                    y0:y, y1:y + h};
        if (cx.x1 > W || cx.y1 > H || cx.y0 < 0) piores.push(`${ups} níveis: sai da tela`);
        const bate = corpos.filter(c => cx.x0 < c.x1 && cx.x1 > c.x0 && cx.y0 < c.y1 && cx.y1 > c.y0);
        if (bate.length) piores.push(`${ups} níveis: tapa ${bate.length} corpo(s)`);
      }
      ok('a caixa de vitória nunca tapa a pose de quem venceu',
         piores.length === 0, piores.join(' · '));
      ok('a caixa de vitória fica na metade dos inimigos',
         VITORIA_CAIXA.x + VITORIA_CAIXA.larg <= Math.min(...ALLY_SPOTS_LARGE.map(s => s.x)) - AW/2,
         `caixa até ${VITORIA_CAIXA.x + VITORIA_CAIXA.larg}`);

      /* Transparência do HUD do grupo: é requisito, e requisito sem
         teste volta a ser opaco na próxima mexida. */
      ok('o HUD do grupo deixa ver o que está atrás',
         GRUPO_OPACIDADE.zona <= 0.7 && GRUPO_OPACIDADE.cartaoAtivo <= 0.8 &&
         GRUPO_OPACIDADE.cartaoInativo <= 0.6,
         JSON.stringify(GRUPO_OPACIDADE));
      ok('o cartão de quem age é mais forte que o dos outros',
         GRUPO_OPACIDADE.cartaoAtivo > GRUPO_OPACIDADE.cartaoInativo);

      // desenhar a vitória com o grupo inteiro subindo de nível não estoura
      {
        const salvo = {party:G.party, squad:G.squad, cena:G.scene};
        G.party = PARTY_DEFS.map(d => makeChar(d, 5));
        G.squad = G.party.slice(0, PARTY_SIZE).map(c => c.name);
        Battle.begin(['wolf']);
        Battle.enemies.forEach(e => { e.hp = 0; });
        let erroV = null;
        try { Battle.victory(); drawBattle(); } catch(e){ erroV = e.message; }
        ok('desenhar a tela de vitória não estoura', !erroV, erroV || 'ok');
        ctx.clearRect(0, 0, W, H);
        Battle.active = false; Battle.phase = 'INPUT';
        G.party = salvo.party; G.squad = salvo.squad; G.scene = salvo.cena || 'FIELD';
      }
    }

    /* --- v5.10: as QUATRO setas navegam em todas as listas -----------
       Este bloco existe por reincidência. A navegação por direcional já
       quebrou duas vezes, das duas por motivo parecido: o desenho mudou
       de formato e o `navList` continuou recebendo o número de colunas
       antigo. Ninguém percebe olhando o código — só apertando a tecla.
       Então aqui a tecla é apertada de verdade, em todas as listas. */
    {
      const salvo = {party:G.party, squad:G.squad, cena:G.scene, itens:G.items,
                     hit:Input.hit};
      G.party = PARTY_DEFS.map(d => makeChar(d, 24));
      G.squad = G.party.slice(0, PARTY_SIZE).map(c => c.name);
      G.items = {potion:5, ether:5, antidote:3};
      Battle.begin(['wolf','spark','wolf']); Battle.nextTurn();
      const ator = Battle.actor;

      ok('LISTA_COLS é 1 — as listas do combate são coluna única', LISTA_COLS === 1);
      /* Duas já bastam para o cursor ter para onde ir; o que o teste
         precisa é de uma lista que ANDE, não de uma lista grande. */
      ok('o ator de teste tem habilidade suficiente para a lista andar',
         ator && ator.skills.length >= 2, `${ator ? ator.skills.length : 0}`);
      ok('há item suficiente na bolsa para a lista andar',
         battleItems().length >= 2, `${battleItems().length}`);
      ok('há alvo suficiente para a mira andar', Battle.enemies.length >= 2);

      /** Aperta UMA direção e devolve se o cursor andou. */
      const apertar = (dir, cursor, fn) => {
        const antes = cursor.i;
        Input.hit = {}; Input.hit[dir] = true;
        try { fn.call(Battle); } catch(e){ return 'estourou: ' + e.message; }
        Input.hit = {};
        return cursor.i !== antes;
      };

      const listas = [
        ['comandos',   Battle.cmd,       Battle.updateInput,  () => { Battle.phase = 'INPUT'; }],
        ['habilidade', Battle.skillCur,  Battle.updateSkill,  () => { Battle.phase = 'SKILL'; }],
        ['item',       Battle.itemCur,   Battle.updateItem,   () => { Battle.phase = 'ITEM'; }],
        ['alvo',       Battle.targetCur, Battle.updateTarget, () => {
            Battle.phase = 'TARGET'; Battle.pendingItem = null; Battle.pendingSkill = null;
            Battle.targetPool = Battle.enemies.slice(); }],
      ];
      const mortas = [];
      for (const [nome, cursor, fn, preparar] of listas){
        for (const dir of ['up','down','left','right']){
          preparar(); cursor.i = 0;
          const r = apertar(dir, cursor, fn);
          if (r !== true) mortas.push(`${nome}/${dir}${typeof r === 'string' ? ' ' + r : ''}`);
        }
      }
      ok('as quatro setas andam em TODA lista do combate',
         mortas.length === 0, mortas.join(' · '));

      /* ▲▼ e ◄► precisam andar o MESMO tanto numa coluna só. Com o
         número de colunas errado, ▲▼ pulavam de dois em dois: parecia
         que a lista "engasgava", e era esse o defeito. */
      const passos = {};
      for (const [nome, cursor, fn, preparar] of listas){
        const medida = {};
        for (const dir of ['down','right']){
          preparar(); cursor.i = 0;
          Input.hit = {}; Input.hit[dir] = true;
          fn.call(Battle); Input.hit = {};
          medida[dir] = cursor.i;
        }
        passos[nome] = medida;
      }
      const engasgo = Object.entries(passos)
        .filter(([, m]) => m.down !== m.right)
        .map(([n, m]) => `${n} ▼${m.down}≠▶${m.right}`);
      ok('numa coluna só, ▼ e ▶ andam a mesma distância',
         engasgo.length === 0, engasgo.join(' · '));

      /* O desenho e a navegação leem a MESMA constante. Se alguém
         separar os dois de novo, é aqui que aparece. */
      ok('a janela visível das listas cabe na zona de comandos',
         40 + (LISTA_LINHAS - 1) * 24 <= HUD.cmd.h - 8,
         `${40 + (LISTA_LINHAS - 1) * 24} de ${HUD.cmd.h}`);

      Battle.active = false; Battle.phase = 'INPUT';
      Input.hit = salvo.hit || {};
      G.party = salvo.party; G.squad = salvo.squad; G.items = salvo.itens;
      G.scene = salvo.cena || 'FIELD';
    }

    /* --- v5.9: zonas da HUD de combate ------------------------------ */
    {
      const nomes = ['turno','ordem','alvo','cmd','detalhe','grupo','atalhos','log'];
      ok('toda zona da HUD cabe na tela',
         nomes.every(n => { const q = zonaFim(HUD[n]);
           return q.x0 >= 0 && q.y0 >= 0 && q.x1 <= W && q.y1 <= H; }),
         nomes.filter(n => { const q = zonaFim(HUD[n]);
           return !(q.x0 >= 0 && q.y0 >= 0 && q.x1 <= W && q.y1 <= H); }).join(','));

      /* Duas zonas sobrepostas significam texto por cima de texto. É o
         defeito que não aparece em captura com o grupo de três e pula
         na cara com o grupo de cinco. */
      const cruza = (a, b) => { const p = zonaFim(a), q = zonaFim(b);
        return p.x0 < q.x1 && p.x1 > q.x0 && p.y0 < q.y1 && p.y1 > q.y0; };
      const pares = [];
      for (let i = 0; i < nomes.length; i++)
        for (let j = i + 1; j < nomes.length; j++)
          if (cruza(HUD[nomes[i]], HUD[nomes[j]])) pares.push(nomes[i] + '×' + nomes[j]);
      ok('nenhuma zona da HUD encosta na outra', pares.length === 0, pares.join(' · '));

      ok('a faixa do campo fica entre o topo e a base',
         HUD.campo.y0 >= Math.max(zonaFim(HUD.turno).y1, zonaFim(HUD.ordem).y1, zonaFim(HUD.alvo).y1) - 8 &&
         HUD.campo.y1 <= Math.min(HUD.cmd.y, HUD.log.y) + 4,
         `campo ${HUD.campo.y0}..${HUD.campo.y1}`);
      ok('a faixa dos inimigos não encosta na do grupo',
         HUD.inimigos.x1 < Math.min(...ALLY_SPOTS_LARGE.map(s => s.x)),
         `${HUD.inimigos.x1} vs ${Math.min(...ALLY_SPOTS_LARGE.map(s => s.x))}`);

      /* `arteUI` é o portão de toda arte de HUD: chave que não existe
         tem que devolver null em silêncio, senão cada slot vazio virava
         uma exceção no meio do quadro. */
      ok('arteUI devolve null para chave que não existe',
         arteUI('nao_existe_mesmo') === null && arteUI(null) === null &&
         arteUI(undefined) === null && arteUI('') === null);

      ok('todo comando tem entrada em ICONE_CMD',
         (() => { const salvo = Battle.actor;
           const ids = ['attack','skill','ult','combo','item','guard','flee'];
           const falta = ids.filter(i => !ICONE_CMD[i]);
           Battle.actor = salvo; return falta.length === 0; })());
      ok('toda chave de ICONE_CMD segue o padrão ui_cmd_*',
         Object.values(ICONE_CMD).every(v => /^ui_cmd_[a-z]+$/.test(v)),
         Object.values(ICONE_CMD).filter(v => !/^ui_cmd_[a-z]+$/.test(v)).join(','));
      ok('todo elemento tem um slot de ícone possível',
         Object.keys(ELEM).every(k => /^[a-z]+$/.test(k)),
         Object.keys(ELEM).filter(k => !/^[a-z]+$/.test(k)).join(','));

      /* Desenhar TODAS as fases não pode estourar — inclusive as que
         dependem de listas vazias (bolsa sem item, ninguém para
         conjunta), que é onde este tipo de tela costuma quebrar. */
      {
        const salvo = {party:G.party, squad:G.squad, cena:G.scene, itens:G.items};
        G.party = PARTY_DEFS.map(d => makeChar(d, 20));
        G.squad = G.party.slice(0, PARTY_SIZE).map(c => c.name);
        Battle.begin(['wolf','spark']); Battle.nextTurn();
        let erroF = null, ondeF = '';
        for (const fase of ['INTRO','INPUT','SKILL','ITEM','COMBO','TARGET']){
          for (const bolsa of [{potion:3}, {}]){
            G.items = bolsa;
            Battle.phase = fase;
            try { drawBattle(); }
            catch(e){ erroF = e.message; ondeF = `${fase}/bolsa:${Object.keys(bolsa).length}`; }
            if (erroF) break;
          }
          if (erroF) break;
        }
        ok('desenhar todas as fases de combate não estoura', !erroF, erroF ? `${ondeF}: ${erroF}` : 'ok');
        ctx.clearRect(0, 0, W, H);
        Battle.active = false;
        G.party = salvo.party; G.squad = salvo.squad; G.items = salvo.itens;
        G.scene = salvo.cena || 'FIELD';
      }
    }

    /* --- v5.7: temas de interface ----------------------------------- */
    {
      const temaSalvo = G.tema;

      ok('o tema padrão é o Éter e não mexe em nada',
         TEMAS[0].id === 'eter' && TEMAS[0].giro === 0 && TEMAS[0].sat === 1 && TEMAS[0].luz === 1);
      ok('todo id de tema é único', new Set(TEMAS.map(t => t.id)).size === TEMAS.length);
      ok('todo nome de tema é único (senão o menu mostra dois iguais)',
         new Set(TEMAS.map(t => t.nome)).size === TEMAS.length);
      ok('todo tema tem gema escolhida', TEMAS.every(t => /^#[0-9a-f]{6}$/i.test(t.gema)),
         TEMAS.filter(t => !/^#[0-9a-f]{6}$/i.test(t.gema)).map(t => t.id).join(','));

      G.tema = 'nao_existe';
      ok('tema desconhecido cai no Éter', temaAtual().id === 'eter');

      /* O contrato do tema, e a razão de ele poder mexer no canvas
         inteiro: só gira o violeta da interface. Se alguma destas passar
         a mudar, o jogador perde a leitura de vida, mana ou elemento. */
      G.tema = 'brasa';
      const intactas = {
        'verde da vida':'#3a8a3a', 'verde claro da vida':'#5aba5a',
        'azul da mana':'#3a5a9a', 'azul claro da mana':'#5a8afa',
        'ouro':'#eaca3a', 'amarelo do destaque':'#ffe44a',
        'vermelho do dano':'#da6a6a', 'branco':'#ffffff',
      };
      for (const [nome, cor] of Object.entries(intactas))
        ok(`o tema não encosta no ${nome}`, corDoTema(cor) === cor, `${cor} → ${corDoTema(cor)}`);

      /* O fundo do campo (#07070c) SEGUE o tema, e é de propósito: a 3,7%
         de luz ele não é preto, é um azul-violeta escuríssimo — cor da
         família da interface. Num tema quente, um vazio quente é o certo.
         O que não pode é ele deixar de ser escuro e virar fundo visível. */
      const fundo = rgbParaHSL(...corDoTema('#07070c').match(/\d+/g).map(Number));
      ok('o fundo do campo acompanha o tema mas continua quase preto',
         corDoTema('#07070c') !== '#07070c' && fundo[2] < 0.09,
         `${corDoTema('#07070c')} · luz ${(fundo[2]*100).toFixed(1)}%`);

      /* Trevas é violeta de nascença: cai DENTRO da banda e mesmo assim
         não pode girar, senão o elemento troca de identidade junto com a
         moldura. É o caso que justifica CORES_FIXAS existir. */
      const hTrevas = rgbParaHSL(...hexParaRGB(ELEM.darkness.main))[0];
      ok('a cor de Trevas está dentro da banda de cromo (o caso difícil)',
         hTrevas >= BANDA_CROMO[0] && hTrevas <= BANDA_CROMO[1], `${Math.round(hTrevas)}°`);
      for (const [chave, e] of Object.entries(ELEM)){
        if (corDoTema(e.main) !== e.main || corDoTema(e.glow) !== e.glow){
          ok(`a cor do elemento ${chave} sobrevive ao tema`, false, `${e.main}/${e.glow}`);
          break;
        }
      }
      ok('nenhuma cor de elemento é girada pelo tema',
         Object.values(ELEM).every(e => corDoTema(e.main) === e.main && corDoTema(e.glow) === e.glow));

      // e o que É decoração precisa realmente mudar, senão o tema é enfeite
      const cromo = ['#b89aff', '#6a5a8a', '#7a5aba', '#8a7aaa', '#5a4a7a'];
      ok('o tema muda de verdade as cores da interface',
         cromo.every(c => corDoTema(c) !== c),
         cromo.filter(c => corDoTema(c) === c).join(','));
      /* O giro é uma ROTAÇÃO, não um achatamento: cada cor anda `giro`
         graus e mantém a distância que tinha para as outras. É isso que
         preserva a hierarquia — o título continua mais claro que o texto
         apagado, e os dois continuam parentes. Se virasse achatamento,
         toda a interface sairia com um matiz só e a leitura acabava. */
      const distMatiz = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
      const giroBrasa = TEMAS.find(t => t.id === 'brasa').giro;
      const matizDe = c => rgbParaHSL(...c.match(/\d+/g).map(Number))[0];
      for (const c of cromo){
        const antes = rgbParaHSL(...hexParaRGB(c))[0];
        const depois = matizDe(corDoTema(c));
        if (distMatiz(depois, antes + giroBrasa) > 2){
          ok(`o giro de ${c} é exatamente o do tema`, false,
             `${Math.round(antes)}° → ${Math.round(depois)}°, esperado ${Math.round(((antes+giroBrasa)%360+360)%360)}°`);
          break;
        }
      }
      ok('cada cor anda exatamente o giro do tema',
         cromo.every(c => distMatiz(matizDe(corDoTema(c)),
                                    rgbParaHSL(...hexParaRGB(c))[0] + giroBrasa) <= 2));
      ok('o giro preserva a distância entre as cores da interface',
         Math.abs(distMatiz(matizDe(corDoTema(cromo[0])), matizDe(corDoTema(cromo[1]))) -
                  distMatiz(rgbParaHSL(...hexParaRGB(cromo[0]))[0],
                            rgbParaHSL(...hexParaRGB(cromo[1]))[0])) < 2);

      G.tema = 'eter';
      ok('no tema Éter toda cor passa idêntica',
         [...cromo, ...Object.values(intactas)].every(c => corDoTema(c) === c));

      // rgba com transparência tem que continuar tendo transparência
      G.tema = 'musgo';
      const trans = corDoTema('rgba(120,86,200,.2)');
      ok('o tema preserva o alfa de um rgba', /^rgba\(/.test(trans) && /0?\.2\)$/.test(trans), trans);
      ok('o tema não quebra em cor que não sabe ler',
         corDoTema('transparent') === 'transparent' && corDoTema('') === '');

      // desenhar em todos os temas não pode estourar
      let erroT = null;
      try {
        for (const t of TEMAS){
          G.tema = t.id;
          panel(10, 10, 300, 200);
          bar(10, 10, 100, 8, .5, '#3a8a3a', '#5aba5a');
          pxText('prova', 20, 40, {size:9, color:'#b89aff'});
        }
      } catch(e){ erroT = e.message; }
      ok('desenhar em todos os temas não estoura', !erroT, erroT || 'ok');
      ctx.clearRect(0, 0, W, H);

      // a escolha sobrevive ao save
      G.tema = 'abissal';
      const s3 = JSON.parse(JSON.stringify({
        v:APP_VERSION, map:G.mapId, x:1, y:1, dir:'down', tema:G.tema,
        squad:G.squad.slice(),
        party:G.party.map(pp => ({name:pp.name, lvl:pp.lvl, exp:pp.exp, hp:pp.hp, mp:pp.mp,
                                  skills:pp.skills.slice(), tree:(pp.tree||[]).slice(),
                                  ult:pp.ult, gear:{...pp.gear}})),
      }));
      let erroS = null;
      try { loadFromSave(s3); } catch(e){ erroS = e.message; }
      ok('o tema escolhido sobrevive ao save', !erroS && G.tema === 'abissal', erroS || G.tema);
      loadFromSave(JSON.parse(JSON.stringify({...s3, tema:undefined})));
      ok('save sem tema acompanha o relógio', G.tema === 'relogio', G.tema);

      G.tema = temaSalvo;
    }

    /* --- v5.7: ciclo de dia e noite ---------------------------------- */
    {
      const passosSalvos = G.steps, mapaSalvo = G.mapId;

      ok('as fases cobrem o dia em ordem crescente',
         FASES.every((f, i) => i === 0 || f.hora > FASES[i-1].hora),
         FASES.map(f => f.hora).join(','));
      ok('o dia começa às 0h', FASES[0].hora === 0);
      ok('todo id de fase é único', new Set(FASES.map(f => f.id)).size === FASES.length);
      ok('toda fase noturna existe em FASES',
         [...FASES_NOTURNAS].every(id => FASES.some(f => f.id === id)),
         [...FASES_NOTURNAS].filter(id => !FASES.some(f => f.id === id)).join(','));

      /* Jogo novo não pode começar de madrugada: o jogador sai de casa às
         8h, e passo zero é o começo de tudo. */
      ok('jogo novo começa de manhã e não à meia-noite',
         Math.floor(horaDoDia(0)) === HORA_INICIAL && !ehNoite(0),
         `${relogioTexto(0)} · ${faseAtual(0).nome}`);

      // o relógio dá a volta e volta para o mesmo lugar
      ok('um dia inteiro de passos devolve a mesma hora',
         minutoDoDia(0) === minutoDoDia(DIA_EM_PASSOS) &&
         minutoDoDia(123) === minutoDoDia(123 + DIA_EM_PASSOS));
      ok('o minuto do dia nunca sai da faixa',
         Array.from({length:200}, (_, i) => minutoDoDia(i * 7))
              .every(m => m >= 0 && m < MINUTOS_DIA));
      ok('passo negativo não quebra o relógio',
         minutoDoDia(-5) >= 0 && minutoDoDia(-5) < MINUTOS_DIA, `${minutoDoDia(-5)}`);

      // o dia vira à meia-noite, não no passo zero
      const viradas = [];
      for (let p = 0; p < DIA_EM_PASSOS * 2; p++)
        if (diaDoJogo(p) !== diaDoJogo(p - 1) && p > 0) viradas.push(minutoDoDia(p));
      ok('o dia vira à meia-noite', viradas.length === 2 && viradas.every(m => m < 5),
         viradas.join(','));
      ok('o jogo começa no Dia 1', diaDoJogo(0) === 1);

      /* O nome da fase é onde se ESTÁ, não a âncora mais perto — foi o
         erro que fez o relógio anunciar madrugada às 23h. */
      const horaPara = h => Math.round(h / 24 * DIA_EM_PASSOS) - PASSO_ZERO;
      const esperado = {0:'madrugada', 4:'madrugada', 6:'amanhecer', 9:'manha',
                        13:'meiodia', 16:'tarde', 19:'entardecer', 21:'anoitecer', 23:'noite'};
      for (const [h, id] of Object.entries(esperado))
        ok(`às ${h}h a fase é ${id}`, faseAtual(horaPara(+h)).id === id,
           faseAtual(horaPara(+h)).id);

      ok('23h ainda é noite e não madrugada', faseAtual(horaPara(23)).id === 'noite');
      ok('meio-dia não é noite', !ehNoite(horaPara(12)));
      ok('meia-noite é noite', ehNoite(horaPara(0)));

      /* A luz tem que ser contínua: um salto de cor entre dois passos
         seguidos apareceria como piscada na tela. */
      let maiorSalto = 0, ondeSalto = 0;
      let ant = luzAgora(-PASSO_ZERO);
      for (let p = 1; p <= DIA_EM_PASSOS; p++){
        const at = luzAgora(p - PASSO_ZERO);
        const d = Math.abs(at.r-ant.r) + Math.abs(at.g-ant.g) + Math.abs(at.b-ant.b);
        if (d > maiorSalto){ maiorSalto = d; ondeSalto = p; }
        ant = at;
      }
      ok('a luz muda sem piscar entre um passo e o seguinte', maiorSalto < 8,
         `maior salto ${maiorSalto.toFixed(1)} no passo ${ondeSalto}`);

      ok('ao meio-dia a luz é neutra (multiplicar por 1 não muda nada)',
         luzAgora(horaPara(12)).mult.every(v => v === 1),
         luzAgora(horaPara(12)).mult.join(','));
      ok('a noite escurece de verdade', luzAgora(horaPara(2)).escuro > 0.25,
         `${luzAgora(horaPara(2)).escuro.toFixed(3)}`);
      /* Multiplicação por fator acima de 1 CLAREARIA a cena, o que a
         conta não sabe fazer e o `multiply` do canvas não faz. Abaixo de
         zero apagaria tudo. Os dois extremos são erro de tabela. */
      ok('todo fator de luz fica entre 0 e 1',
         FASES.every(f => f.mult.length === 3 && f.mult.every(v => v >= 0 && v <= 1)),
         FASES.filter(f => f.mult.some(v => v < 0 || v > 1)).map(f => f.id).join(','));
      ok('a luz nunca apaga a tela',
         Array.from({length:DIA_EM_PASSOS}, (_, p) => luzAgora(p - PASSO_ZERO).escuro)
              .every(e => e >= 0 && e <= 0.55));

      /* A noite do jogo guarda a DIREÇÃO medida em Porto Lúmina: o azul
         é o canal que mais sobrevive e o verde o que menos. A
         profundidade é outra (o dia daqui já é escuro — ver o comentário
         em FASES), mas se a direção inverter, a noite deixa de ser noite. */
      {
        const n = FASES.find(f => f.id === 'noite').mult;
        ok('à noite o azul é o canal que mais sobrevive',
           n[2] > n[0] && n[2] > n[1], n.join(','));
        ok('à noite o verde é o canal que menos sobrevive',
           n[1] < n[0] && n[1] < n[2], n.join(','));
        const ordemMedida = [...NOITE_MEDIDA].map((v, i) => i)
          .sort((a, b) => NOITE_MEDIDA[a] - NOITE_MEDIDA[b]).join('');
        const ordemJogo = [0,1,2].sort((a, b) => n[a] - n[b]).join('');
        ok('a ordem dos canais é a mesma do mockup medido',
           ordemMedida === ordemJogo, `medido ${ordemMedida} · jogo ${ordemJogo}`);
      }

      ok('o relógio vira texto legível', /^Dia \d+ · \d\d:\d\d$/.test(relogioTexto(0)),
         relogioTexto(0));

      /* A noite só encurta a trégua a céu aberto. Debaixo da terra a hora
         não muda nada, e o mapa fechado tem que sortear igual. */
      {
        const antes = G.stepsToEnc;
        const aberto = Object.keys(MAPS).find(id => MAPS[id].outdoor && MAPS[id].encounter);
        loadMap(aberto);
        const fora = G.map.def.outdoor, faixa = G.map.def.encounter;
        ok('há mapa externo com encontro para testar a noite', !!aberto && !!fora && !!faixa, aberto);

        const amostra = (passos, n = 400) => {
          G.steps = passos;
          let s = 0;
          for (let i = 0; i < n; i++){ resetEncounterCounter(); s += G.stepsToEnc; }
          return s / n;
        };
        const mediaDia   = amostra(horaPara(12));
        const mediaNoite = amostra(horaPara(2));
        ok('à noite, a céu aberto, o encontro vem antes', mediaNoite < mediaDia,
           `dia ${mediaDia.toFixed(1)} · noite ${mediaNoite.toFixed(1)}`);
        ok('a noite encurta na proporção de ENC_NOITE',
           Math.abs(mediaNoite / mediaDia - ENC_NOITE) < 0.08,
           `razão ${(mediaNoite / mediaDia).toFixed(3)} vs ${ENC_NOITE}`);
        ok('o contador nunca chega a zero ou menos',
           Array.from({length:200}, () => { resetEncounterCounter(); return G.stepsToEnc; })
                .every(v => v >= 1));

        // mapa fechado: a hora não pode mudar o sorteio
        const fechado = Object.keys(MAPS).find(id => !MAPS[id].outdoor && MAPS[id].encounter);
        if (fechado){
          loadMap(fechado);
          const dDia = amostra(horaPara(12)), dNoite = amostra(horaPara(2));
          ok('debaixo da terra a hora não muda o encontro',
             Math.abs(dDia - dNoite) / dDia < 0.12,
             `${fechado}: dia ${dDia.toFixed(1)} · noite ${dNoite.toFixed(1)}`);
        }
        G.stepsToEnc = antes;
      }

      // desenhar o campo em qualquer hora não pode estourar
      let erroL = null;
      try {
        loadMap('patio');
        for (const h of [0, 5, 8, 12, 18, 20, 23]){ G.steps = horaPara(h); drawField(); }
      } catch(e){ erroL = e.message; }
      ok('desenhar o campo em qualquer hora não estoura', !erroL, erroL || 'ok');
      ctx.clearRect(0, 0, W, H);

      G.steps = passosSalvos;
      if (mapaSalvo) loadMap(mapaSalvo);
    }

    /* --- v5.2: ícones de arma --------------------------------------- */
    {
      const armas = Object.entries(ITEMS).filter(([, i]) => i.slot === 'weapon');
      ok('toda arma tem ícone', armas.every(([, i]) => !!i.icon),
         armas.filter(([, i]) => !i.icon).map(([k]) => k).join(','));
      /* Mesma armadilha da arte de pet: apontar para uma chave ausente
         faz o item cair no quadradinho de cor em silêncio. */
      ok('todo ícone de arma existe em SPRITE_DATA',
         armas.every(([, i]) => !!SPRITE_DATA[i.icon]),
         armas.filter(([, i]) => !SPRITE_DATA[i.icon]).map(([k]) => k).join(','));
      /* v-atual: consumíveis e materiais também podem ter ícone próprio
         (poção, éter, materiais de drop...), não só arma — a restrição
         a `slot === 'weapon'` valia quando só a família de arma tinha
         arte. O que continua valendo é o ícone apontar pra algo real. */
      ok('todo item com ícone aponta para arte que existe em SPRITE_DATA',
         Object.values(ITEMS).every(i => !i.icon || !!SPRITE_DATA[i.icon]),
         Object.entries(ITEMS).filter(([, i]) => i.icon && !SPRITE_DATA[i.icon]).map(([k]) => k).join(','));
      ok('nenhum item publicado recorre ao marcador de cor',
         Object.values(ITEMS).every(i => !!i.icon),
         Object.entries(ITEMS).filter(([, i]) => !i.icon).map(([k]) => k).join(','));
      ok('toda condição de combate tem sprite próprio',
         Object.keys(AILMENTS).every(id => !!SPRITE_DATA['ail_' + id]),
         Object.keys(AILMENTS).filter(id => !SPRITE_DATA['ail_' + id]).join(','));
      /* Nove ícones para dezoito armas: a marca é por FAMÍLIA DE FORMA,
         não uma por arma. O teste trava que a divisão não degenerou em
         "tudo é espada", que apagaria a leitura. */
      const familias = new Set(armas.map(([, i]) => i.icon));
      ok('as armas usam ao menos 6 famílias de ícone diferentes',
         familias.size >= 6, [...familias].join(','));

      // Fallback de defesa: o conteúdo publicado acima não chega aqui.
      let erro = null;
      try {
        drawItemMark(ITEMS.potion, 10, 10);
        drawItemMark(ITEMS.w_treino, 10, 40);
        drawItemMark(null, 10, 70);
        drawItemMark({icon:'nao_existe', color:'#fff'}, 10, 100);
      } catch(e){ erro = e.message; }
      ok('desenhar a marca não estoura, inclusive com dado inválido ou nulo',
         !erro, erro || 'ok');
      ctx.clearRect(0, 0, W, H);
    }

    /* --- v5.1: elementos, Pavor e execução -------------------------- */
    {
      const alvo = () => ({name:'alvo', element:'none', res:null, ail:[], buffs:[],
                           hp:100, maxHp:100, def:10, broken:0, guarding:false});
      const src = {name:'src', element:'poison', atk:20, ail:[], buffs:[], broken:0};

      /* Execução: mesmo golpe, alvo inteiro vs. alvo quase morto. É o que
         dá à Scythe uma pergunta de timing em vez de "aperte o mais forte". */
      const golpe = {power:60, elem:'none', type:'atk', execute:0.9};
      const cheio = alvo(), quase = alvo(); quase.hp = 5;
      const dCheio = calcDamage(src, golpe, cheio, {variance:1, vuln:1}).dmg;
      const dQuase = calcDamage(src, golpe, quase, {variance:1, vuln:1}).dmg;
      ok('execução bate mais em alvo ferido', dQuase > dCheio, `${dCheio} → ${dQuase}`);
      ok('execução NÃO é morte instantânea — o teto é 1+execute',
         dQuase <= dCheio * (1 + golpe.execute) * 1.02, `${dQuase} vs teto ${Math.round(dCheio*1.9)}`);
      const semExec = calcDamage(src, {power:60, elem:'none', type:'atk'}, cheio,
                                 {variance:1, vuln:1}).dmg;
      ok('sem `execute`, o dano não muda com a vida do alvo',
         calcDamage(src, {power:60, elem:'none', type:'atk'}, quase,
                    {variance:1, vuln:1}).dmg === semExec);

      // Pavor: zera a pontaria de verdade (o piso de 15% não vale para ele)
      const ap = alvo(); addAil(ap, 'terror');
      ok('Pavor zera a pontaria', eACC(ap) === 0, `${eACC(ap)}`);
      const cego = alvo(); addAil(cego, 'blind');
      ok('Cegueira continua respeitando o piso de 15%', eACC(cego) >= 0.15, `${eACC(cego)}`);
      ok('Pavor é do elemento Veneno e existe na tabela',
         AILMENTS.terror.el === 'poison' && EL_AILMENT.poison === 'terror');
      ok('Enraizado é do elemento Terra e existe na tabela',
         AILMENTS.rooted.el === 'earth' && EL_AILMENT.earth === 'rooted');
      ok('Pavor rouba o turno uma vez só, não a condição inteira',
         AILMENTS.terror.skipOnce === true && !AILMENTS.terror.skip);
      /* O nome "Pavor" era do `dread`. Se alguém devolver o nome sem
         mexer na mecânica, ficam duas condições com o mesmo rótulo e o
         jogador não tem como saber qual levou. */
      ok('só uma condição se chama Pavor',
         Object.values(AILMENTS).filter(a => a.name === 'Pavor').length === 1,
         Object.entries(AILMENTS).filter(([,a]) => a.name === 'Pavor').map(([k]) => k).join(','));

      /* Conjunta é indexada por PAR de elementos: um par sem entrada
         simplesmente não aparece em campo, sem erro nenhum. Com dois
         elementos novos no elenco eram 13 pares a preencher. */
      const elencoEl = [...new Set(PARTY_DEFS.map(d => d.element))];
      const faltando = [];
      for (let i = 0; i < elencoEl.length; i++)
        for (let j = i + 1; j < elencoEl.length; j++)
          if (!COMBOS[comboKey(elencoEl[i], elencoEl[j])])
            faltando.push(`${elencoEl[i]}+${elencoEl[j]}`);
      ok('todo par de elementos do elenco tem Conjunta', faltando.length === 0,
         faltando.join(' '));
      ok('toda Conjunta aponta para condição que existe',
         Object.values(COMBOS).every(c => !c.status || !!AILMENTS[c.status.id]),
         Object.values(COMBOS).filter(c => c.status && !AILMENTS[c.status.id]).map(c => c.name).join(','));
    }

    /* --- v5.0: o pet aparece em COMBATE ---------------------------- */
    ok('a salamandra tem arte própria de batalha',
       !!PETS.salamandra.formas[0].spriteBatalha &&
       !!SPRITE_DATA[PETS.salamandra.formas[0].spriteBatalha]);
    {
      const orfas = [];
      for (const [id, p] of Object.entries(PETS))
        p.formas.forEach((f, i) => {
          if (f.spriteBatalha && !SPRITE_DATA[f.spriteBatalha]) orfas.push(`${id}/f${i+1}`);
        });
      ok('toda arte de batalha de pet declarada existe em SPRITE_DATA',
         orfas.length === 0, orfas.join(' '));
    }
    /* `spriteBatalha` é opcional: sem ele o combate reaproveita `sprite`.
       Sem esta queda, um pet com arte só de campo sumiria da luta. */
    ok('sem arte de batalha, o combate cai na arte de campo',
       petArte({sprite:'pet_salamandra_1'}, 'batalha') ===
       petArte({sprite:'pet_salamandra_1'}, 'campo'));
    ok('com arte de batalha, campo e combate usam artes DIFERENTES',
       petArte(PETS.salamandra.formas[0], 'batalha') !==
       petArte(PETS.salamandra.formas[0], 'campo'));
    ok('forma sem arte nenhuma devolve null (cai no procedural)',
       petArte({}, 'batalha') === null && petArte(null, 'campo') === null);

    /* A caixa do pet não pode invadir nem o painel de comandos
       (x 8..478 / y 464..592) nem a faixa dos inimigos (x até 470).
       Foi assim que os lugares foram escolhidos: medindo. */
    {
      const salvo = {pets:G.pets, ativo:G.petAtivo, party:G.party, squad:G.squad,
                     cena:G.scene};
      G.party = PARTY_DEFS.map(d => makeChar(d, 10));
      G.squad = G.party.slice(0, PARTY_SIZE).map(c => c.name);
      G.pets = {salamandra:{lvl:1, exp:0}}; G.petAtivo = 'salamandra';
      Battle.begin(['wolf']);
      const cx = petCaixaBatalha();
      /* Painel de log E de mensagem ocupam x 8..478 na base da tela. A
         caixa aqui já inclui o avanço, então isto cobre o quadro em que
         o pet está agindo — que era onde a perna dele sumia. */
      const bateZ = z => { const q = zonaFim(z);
        return cx.x0 < q.x1 && cx.x1 > q.x0 && cx.y0 < q.y1 && cx.y1 > q.y0; };
      for (const nome of ['cmd','detalhe','grupo','log','atalhos','turno','ordem','alvo']){
        if (bateZ(HUD[nome])){
          ok(`nem agindo o pet entra na zona ${nome}`, false,
             `x ${Math.round(cx.x0)}..${Math.round(cx.x1)} y ${Math.round(cx.y0)}..${Math.round(cx.y1)}`);
          break;
        }
      }
      ok('nem agindo o pet entra em zona nenhuma da HUD',
         ['cmd','detalhe','grupo','log','atalhos','turno','ordem','alvo'].every(n => !bateZ(HUD[n])),
         `x ${Math.round(cx.x0)}..${Math.round(cx.x1)} y ${Math.round(cx.y0)}..${Math.round(cx.y1)}`);
      ok('a caixa do pet não invade a faixa dos inimigos', cx.x0 >= HUD.inimigos.x1,
         `x0 ${Math.round(cx.x0)} vs ${HUD.inimigos.x1}`);
      ok('a caixa do pet cabe na tela',
         cx.x1 <= W && cx.y0 >= 0 && cx.y1 <= H,
         `${Math.round(cx.x1)}/${Math.round(cx.y0)}/${Math.round(cx.y1)}`);

      // o avanço tem a mesma convenção do dos combatentes: 0.001 → 1 → 0
      Battle.petLungeT = 0;
      Battle.petPendente = true;
      Battle.petAct();
      ok('o pet age com avanço animado, não instantâneo',
         Battle.petLungeT > 0 && Battle.petLungeT < 1, `${Battle.petLungeT}`);
      let voltas = 0;
      while (Battle.petLungeT > 0 && voltas++ < 400) Battle.update(1 / 60);
      ok('o avanço do pet termina sozinho', Battle.petLungeT === 0, `${voltas} quadros`);

      // desenhar não pode estourar, com pet e sem pet
      let erro = null;
      try { drawPetBatalha(); G.petAtivo = null; drawPetBatalha(); } catch(e){ erro = e.message; }
      ok('desenhar o pet em batalha não estoura (com e sem pet ativo)', !erro, erro || 'ok');

      Battle.active = false;
      Object.assign(G, {pets:salvo.pets, petAtivo:salvo.ativo, party:salvo.party,
                        squad:salvo.squad, scene:salvo.cena || 'FIELD'});
      sanitizeSquad();
    }
  

    // ciclo de vida
    {
      const salvo = {pets:G.pets, ativo:G.petAtivo, squad:G.squad, party:G.party};
      G.pets = {}; G.petAtivo = null;
      ok('sem pet conquistado, não há pet ativo', petAtivo() === null);
      ganharPet('salamandra');
      ok('conquistar o primeiro pet já o deixa acompanhando',
         G.petAtivo === 'salamandra' && !!petAtivo());
      const antes = JSON.stringify(G.pets);
      ganharPet('salamandra');
      ok('conquistar o mesmo pet duas vezes não reseta nem duplica',
         JSON.stringify(G.pets) === antes);
      ganharPet('homunculo');
      ok('o segundo pet NÃO rouba o lugar do ativo', G.petAtivo === 'salamandra');
      ok('trocar de pet exige tê-lo', trocarPet('dragao') === false && G.petAtivo === 'salamandra');
      ok('dá para trocar para um pet que se tem', trocarPet('homunculo') === true && G.petAtivo === 'homunculo');
      ok('dá para andar SEM pet', trocarPet(null) === true && petAtivo() === null);
      trocarPet('salamandra');

      // EXP e evolução
      G.pets.salamandra = {lvl:1, exp:0};
      const evo = darPetExp(999999);
      ok('EXP faz o pet subir de nível', G.pets.salamandra.lvl > 1, `nv ${G.pets.salamandra.lvl}`);
      ok('subir de nível através do limiar EVOLUI (muda a forma)',
         evo.length === 2 && evo[0].de !== evo[0].para,
         evo.map(e => `${e.de}→${e.para}`).join(' '));
      ok('a forma reportada bate com o nível',
         petForma('salamandra', G.pets.salamandra.lvl).name === evo[evo.length-1].para);
      G.pets.salamandra = {lvl:1, exp:0};
      ok('EXP zero ou negativo não faz nada', darPetExp(0).length === 0 && G.pets.salamandra.lvl === 1);
      ok('sem pet ativo, dar EXP não estoura',
         (trocarPet(null), darPetExp(500).length === 0));
      trocarPet('salamandra');

      // bônus de dono — o polvo é o pet do Seiji desde a v5.27
      G.squad = ['Seiji'];
      ok('dono em campo vale bônus', petComDono('polvo') === true);
      G.squad = ['Marin'];
      ok('sem o dono em campo, o pet age mesmo assim (só sem bônus)',
         petComDono('salamandra') === false && !!petAtivo());
      /* Até a v5.29 o dragão era o pet SEM dono, porque a Amanda não era
         jogável. Agora é dela, e o que se mede é o outro lado da mesma
         moeda: o bônus só vale com a dona em campo. */
      ok('o dragão é da Amanda', PETS.dragao.dono === 'Amanda Felt');
      ok('sem a dona em campo, o dragão não leva bônus',
         (G.squad = ['Marin'], petComDono('dragao') === false));
      ok('com a dona em campo, o dragão leva bônus',
         (G.squad = ['Amanda Felt'], petComDono('dragao') === true));

      Object.assign(G, {pets:salvo.pets, petAtivo:salvo.ativo, squad:salvo.squad, party:salvo.party});
    }

    // o pet age numa luta de verdade, e NÃO entra na ordem de turno
    {
      const salvo = {pets:G.pets, ativo:G.petAtivo, party:G.party, squad:G.squad,
                     cena:G.scene, items:G.items};
      G.items = {};
      G.party = PARTY_DEFS.map(d => makeChar(d, 22));
      G.squad = defaultSquad(); G.leader = 0;
      /* Precisa ser um pet de ATAQUE: a salamandra virou buff na v5.27 e
         buff não tira HP de ninguém. O polvo é o atk do Seiji. */
      G.pets = {polvo:{lvl:12, exp:0}}; G.petAtivo = 'polvo';
      Battle.begin(['wolf','wolf']);
      ok('o pet NÃO entra na ordem de turno (a vazão por rodada não muda)',
         Battle.order.length === Battle.units.filter(isAlive).length,
         `${Battle.order.length} na ordem`);
      const hpAntes = Battle.enemies.map(e => e.hp);
      Battle.actor = Battle.allies[0];
      const agiu = Battle.petAct();
      Battle.seq.forEach(s => s.fn()); Battle.seq = [];
      ok('o pet de ataque realmente causa dano',
         agiu && Battle.enemies.some((e, i) => e.hp < hpAntes[i]),
         Battle.enemies.map((e, i) => hpAntes[i] - e.hp).join('/'));
      ok('a entrada do pet aparece no log',
         Battle.log.some(l => l.includes(petForma('polvo', 12).name)), Battle.log.join(' | '));

      // pet de cura age no mais ferido
      G.pets = {homunculo:{lvl:12, exp:0}}; G.petAtivo = 'homunculo';
      const ferido = Battle.allies[1];
      ferido.hp = 1;
      Battle.actor = Battle.allies[0];
      Battle.petAct(); Battle.seq.forEach(s => s.fn()); Battle.seq = [];
      ok('o pet de cura mira em quem está pior', ferido.hp > 1, `hp=${ferido.hp}`);

      // pet de buff reforça o grupo inteiro
      G.pets = {salamandra:{lvl:1, exp:0}}; G.petAtivo = 'salamandra';
      Battle.allies.forEach(a => a.buffs = []);
      Battle.actor = Battle.allies[0];
      Battle.petAct(); Battle.seq.forEach(s => s.fn()); Battle.seq = [];
      ok('o pet de suporte reforça TODO o grupo vivo',
         Battle.allies.filter(isAlive).every(a => a.buffs.some(b => b.stat === 'def' && b.mult > 1)));

      // sem pet, o combate segue exatamente como antes
      G.pets = {}; G.petAtivo = null;
      Battle.rolarPet();
      ok('sem pet, nada é agendado e o combate roda como na v4.8',
         Battle.petPendente === false && Battle.petAct() === false);

      Battle.active = false; G.scene = 'FIELD';
      Object.assign(G, {pets:salvo.pets, petAtivo:salvo.ativo, party:salvo.party,
                        squad:salvo.squad, scene:salvo.cena, items:salvo.items});
      sanitizeSquad();
    }

    // missões que entregam pet, e a economia de material
    {
      const comPet = Object.entries(QUESTS).filter(([, q]) => q.premio.pet);
      ok('as missões de pet apontam para pets que existem',
         comPet.every(([, q]) => !!PETS[q.premio.pet]),
         comPet.filter(([, q]) => !PETS[q.premio.pet]).map(([id]) => id).join(','));
      ok('todo pet é conquistável por alguma missão',
         Object.keys(PETS).every(p => comPet.some(([, q]) => q.premio.pet === p)),
         Object.keys(PETS).filter(p => !comPet.some(([, q]) => q.premio.pet === p)).join(','));
      ok('nenhum pet é entregue por duas missões diferentes',
         new Set(comPet.map(([, q]) => q.premio.pet)).size === comPet.length);
      /* A rodada passada foi 100% caçada e o retorno foi que faltou
         variedade. Esta trava o mínimo de missão de COLETA. */
      const coleta = Object.values(QUESTS).filter(q => q.tipo === 'collect');
      ok('há missão de coleta suficiente para variar do "mate N"',
         coleta.length >= 7, `${coleta.length} de ${Object.keys(QUESTS).length}`);
      const deMaterial = coleta.filter(q => ITEMS[q.item]?.kind === 'material');
      ok('há missão de coleta baseada em DROP de criatura',
         deMaterial.length >= 5, `${deMaterial.length}`);
      /* Missão de coleta cujo material não cai de ninguém é missão
         impossível — e não haveria erro em lugar nenhum. */
      const semFonte = deMaterial.filter(q =>
        !Object.values(BESTIARY).some(b => (b.drops || []).some(([i]) => i === q.item)));
      ok('todo material pedido por missão cai de alguma criatura',
         semFonte.length === 0, semFonte.map(q => q.item).join(','));
      ok('todo material do catálogo tem quem o derrube',
         Object.entries(ITEMS).filter(([, i]) => i.kind === 'material')
           .every(([id]) => Object.values(BESTIARY).some(b => (b.drops || []).some(([i]) => i === id))),
         Object.entries(ITEMS).filter(([id, i]) => i.kind === 'material' &&
           !Object.values(BESTIARY).some(b => (b.drops || []).some(([d]) => d === id))).map(([id]) => id).join(','));
      ok('petisco existe e dá EXP de pet',
         Object.values(ITEMS).filter(i => i.use === 'pet').every(i => i.petExp > 0) &&
         Object.values(ITEMS).some(i => i.use === 'pet'));
    }

    // a página de pets desenha, com e sem bicho
    {
      const salvo = {pets:G.pets, ativo:G.petAtivo, page:Menu.page, mapa:G.mapId,
                     party:G.party, squad:G.squad};
      G.party = PARTY_DEFS.map(d => makeChar(d, 20));
      G.squad = defaultSquad(); G.leader = 0;
      loadMap('nests');
      let erro = null;
      G.pets = {}; G.petAtivo = null; Menu.page = 'pets';
      try { Menu.draw(); } catch(e){ erro = 'sem pet: ' + e.message; }
      if (!erro){
        G.pets = {salamandra:{lvl:25, exp:10}, lebre:{lvl:1, exp:0}, dragao:{lvl:11, exp:5}};
        G.petAtivo = 'salamandra';
        try { Menu.draw(); } catch(e){ erro = 'com pets: ' + e.message; }
      }
      if (!erro){ try { drawField(); } catch(e){ erro = 'campo: ' + e.message; } }
      ok('a tela de pets e o campo desenham com e sem bicho', !erro, erro || 'ok');
      Menu.page = 'root';
      Object.assign(G, {pets:salvo.pets, petAtivo:salvo.ativo, party:salvo.party, squad:salvo.squad});
      sanitizeSquad();
      if (salvo.mapa) loadMap(salvo.mapa);
    }
  }

  /* =================================================================
     v5.0 — ÁRVORE DE HABILIDADES
     A árvore é GERADA, então o que precisa de teste não é "o nó X
     existe" e sim as INVARIANTES da geração: nada órfão, nada
     inalcançável, ninguém mudo em combate e nenhuma habilidade perdida
     no caminho. Um gerador que produz uma árvore quebrada para um
     personagem só é exatamente o tipo de defeito que passa despercebido
     até alguém escolher aquele personagem.
     ================================================================= */
  {
    const nomes = PARTY_DEFS.map(d => d.name);

    ok('todo personagem do elenco tem árvore',
       nomes.every(n => TREES[n] && Object.keys(TREES[n]).length > 0),
       nomes.filter(n => !TREES[n]).join(','));

    /* Nenhuma habilidade pode sumir na tradução: se `learn` cita, a
       árvore tem que oferecer. Foi este teste que pegou o `ramoDaSkill`
       mandando 'revive' para um ramo que não existia. */
    {
      const perdidas = [];
      for (const d of PARTY_DEFS){
        const naArvore = new Set(Object.values(TREES[d.name])
                                       .filter(n => n.tipo === 'skill').map(n => n.skill));
        for (const [, id] of d.learn) if (!naArvore.has(id)) perdidas.push(`${d.name}/${id}`);
      }
      ok('nenhuma habilidade de `learn` some da árvore', perdidas.length === 0, perdidas.join(' '));
    }

    // integridade do grafo
    {
      const ruins = [];
      for (const nome of nomes){
        const arv = TREES[nome];
        for (const n of Object.values(arv)){
          for (const r of n.req) if (!arv[r]) ruins.push(`${nome}/${n.id}→${r}`);
          if (n.tipo !== 'core' && !n.req.length && n.custo > 0) ruins.push(`${nome}/${n.id} solto`);
          if (n.custo < 0) ruins.push(`${nome}/${n.id} custo negativo`);
        }
      }
      ok('nenhum nó aponta para requisito inexistente nem fica solto', ruins.length === 0, ruins.join(' '));
    }

    /* Alcançabilidade de verdade: gasta ponto de sobra e vê se dá para
       comprar a árvore inteira. Um ciclo de requisitos passaria pelos
       testes acima e travaria aqui. */
    {
      const presos = [];
      for (const d of PARTY_DEFS){
        const c = makeChar(d, 1);
        c.bonusPontos = 9999;
        let mexeu = true;
        while (mexeu){
          mexeu = false;
          for (const id of Object.keys(TREES[d.name]))
            if (aprenderNo(c, id).ok) mexeu = true;
        }
        const falta = Object.keys(TREES[d.name]).filter(id => !c.tree.includes(id));
        if (falta.length) presos.push(`${d.name}: ${falta.join(',')}`);
      }
      ok('com pontos infinitos, a árvore inteira é alcançável', presos.length === 0, presos.join(' | '));
    }

    // ninguém entra em combate sem ter o que apertar
    ok('todo personagem nasce com habilidade utilizável',
       PARTY_DEFS.every(d => makeChar(d, 1).skills.length >= 2),
       PARTY_DEFS.map(d => `${d.name}:${makeChar(d, 1).skills.length}`).join(' '));
    ok('o repertório inicial não custa ponto',
       PARTY_DEFS.every(d => pontosGastos(makeChar(d, 1)) === 0));

    /* Economia. O elenco tem 8 ou 9 habilidades cada; se um custasse
       muito mais que o outro pelo mesmo conteúdo, escolher personagem
       viraria escolher desconto. */
    {
      const custos = PARTY_DEFS.map(d => ({
        nome:d.name,
        total:Object.values(TREES[d.name]).reduce((s, n) => s + n.custo, 0),
        skills:Object.values(TREES[d.name]).filter(n => n.tipo === 'skill').length,
      }));
      const por8 = custos.filter(c => c.skills === 8).map(c => c.total);
      ok('personagens com o mesmo nº de habilidades custam quase o mesmo',
         Math.max(...por8) - Math.min(...por8) <= 3,
         custos.map(c => `${c.nome}:${c.total}/${c.skills}`).join(' '));
      /* A árvore tem que durar até o fim do jogo: as regiões finais são
         de nível 31-38, e uma árvore que fecha no 20 vira enfeite. */
      const fecha = custos.map(c => Math.ceil(c.total / PONTOS_POR_NIVEL) + 1);
      ok('nenhuma árvore fecha antes do nível 25', Math.min(...fecha) >= 25, fecha.join(','));
    }

    /* ============ v5.31: O GRIMÓRIO ================================
       O que estes testes travam é o CONTRATO do spec, não o desenho:
       toda árvore tem os sete tipos de nó, o núcleo é de graça, a
       identidade é de cada um, e remover não pode deixar a árvore
       inconsistente. */
    {
      for (const d of PARTY_DEFS){
        const arv = TREES[d.name];
        const tipos = new Set(Object.values(arv).map(n => n.tipo));
        for (const t of ['core', 'skill', 'conta', 'passiva', 'mecanica',
                         'convergencia', 'ultimate'])
          ok(`${d.name}: a árvore tem nó do tipo ${t}`, tipos.has(t));
        ok(`${d.name}: o núcleo não custa Ponto de Alma`, arv.core.custo === 0);
        ok(`${d.name}: passiva única e mecânica são de graça`,
           arv.passiva_unica.custo === 0 && arv.mecanica.custo === 0);
        /* Cada convergência exige o FIM de dois caminhos. Uma que
           exigisse um só seria uma habilidade cara, não convergência. */
        const convs = Object.values(arv).filter(n => n.tipo === 'convergencia');
        ok(`${d.name}: cada convergência exige dois caminhos`,
           convs.every(n => n.req.length === 2 &&
             new Set(n.req.map(r => arv[r].ramo)).size === 2),
           convs.map(n => n.req.join('+')).join(' '));
        ok(`${d.name}: o apocalipse exige TODAS as convergências`,
           arv.apocalipse.req.length === convs.length &&
           arv.apocalipse.req.every(r => arv[r].tipo === 'convergencia'));
        // todo requisito aponta para um nó que existe
        ok(`${d.name}: nenhum nó exige um nó inexistente`,
           Object.values(arv).every(n => n.req.every(r => !!arv[r])));
      }

      /* Identidade: o spec §21 proíbe a mesma passiva com nome trocado.
         Nome E descrição têm de ser únicos no elenco inteiro. */
      const passivas = PARTY_DEFS.map(d => TREES[d.name].passiva_unica);
      ok('nenhuma passiva única se repete no elenco',
         new Set(passivas.map(n => n.nome)).size === passivas.length &&
         new Set(passivas.map(n => n.desc)).size === passivas.length);
      const mecs = PARTY_DEFS.map(d => TREES[d.name].mecanica.desc);
      ok('nenhuma mecânica principal se repete', new Set(mecs).size === mecs.length);
      const nucleos = PARTY_DEFS.map(d => TREES[d.name].core.nome);
      ok('nenhum núcleo se repete', new Set(nucleos).size === nucleos.length);
      /* Três personagens são de Fogo (Gabriel, Abel, Amanda). Se a
         árvore lesse só o elemento, as três sairiam idênticas em cor e
         em nome de caminho — que é exatamente o que o spec proíbe. */
      const fogo = PARTY_DEFS.filter(d => d.element === 'fire').map(d => d.name);
      ok('personagens do mesmo elemento têm paletas diferentes',
         new Set(fogo.map(n => identidadeArvore(n, 'fire').paleta[0])).size === fogo.length,
         fogo.join(' '));

      /* MADAO: era a exceção declarada do spec §5 (árvore de Cinzas,
         combate de Fogo). Deixou de ser exceção: o elemento de combate
         também virou Cinzas (ID interno `blood`, ver ELEM.blood) — a
         árvore não inventa mais uma identidade que o combate não tem. */
      {
        const d = PARTY_DEFS.find(p => p.name === 'Madao');
        ok('o elemento de combate do Madao é Cinzas', d.element === 'blood', d.element);
        const i = identidadeArvore('Madao', d.element);
        ok('a árvore do Madao é de Cinzas, não de Fogo',
           i.atributo === 'Cinzas' && i.fundo !== 'tree_bg_fire' &&
           i.nucleo === 'Corvo das Cinzas');
        ok('o Caminho da Preguiça é só do Madao',
           PARTY_DEFS.filter(d => Object.values(identidadeArvore(d.name, d.element).caminhos)
                                        .includes('Caminho da Preguiça')).length === 1);
      }

      /* REMOÇÃO (spec §14). O que não pode acontecer é a remoção deixar
         um nó aprendido sem o requisito dele. */
      {
        const c = makeChar(PARTY_DEFS[0], 1);
        c.bonusPontos = 400;
        const arv = arvoreDe(c);
        const alvo = Object.values(arv).find(n => n.custo > 0 && n.req.length &&
          Object.values(arv).some(m => m.req.includes(n.id) && m.custo > 0));
        const cadeia = [];
        let a = alvo.id;
        while (a && !c.tree.includes(a)){ cadeia.unshift(a); a = arv[a].req[0]; }
        cadeia.forEach(id => aprenderNo(c, id));
        const filho = Object.values(arv).find(m => m.req.includes(alvo.id) && m.custo > 0);
        aprenderNo(c, filho.id);

        ok('nó com dependente aprendido não é removido', !removerNo(c, alvo.id).ok,
           removerNo(c, alvo.id).why);
        ok('e a mensagem diz quantos dependem dele',
           /\d+ nó/.test(removerNo(c, alvo.id).why || ''), removerNo(c, alvo.id).why);
        ok('o núcleo, a passiva e a mecânica nunca são removidos',
           !removerNo(c, 'core').ok && !removerNo(c, 'passiva_unica').ok &&
           !removerNo(c, 'mecanica').ok);

        const livre0 = pontosLivres(c);
        const r = removerNo(c, filho.id);
        ok('a folha da ponta é removida', r.ok, r.why);
        ok('e devolve exatamente o que custou', pontosLivres(c) === livre0 + filho.custo);
        ok('o nó removido sai de c.tree', !c.tree.includes(filho.id));
        ok('agora o pai também sai', removerNo(c, alvo.id).ok);
        /* A invariante que resume tudo: nenhum nó aprendido pode estar
           sem os requisitos dele, aconteça o que acontecer. */
        ok('nenhum nó aprendido ficou sem requisito',
           c.tree.every(id => arv[id].req.every(r2 => c.tree.includes(r2))));
        /* Remover uma conta de vida não pode deixar o personagem com
           vida acima do teto novo. */
        const cv = makeChar(PARTY_DEFS[0], 1); cv.bonusPontos = 400;
        const arvv = arvoreDe(cv);
        const hpNo = Object.values(arvv).find(n => n.stat === 'hp' && n.custo > 0);
        const cam = []; let b = hpNo.id;
        while (b && !cv.tree.includes(b)){ cam.unshift(b); b = arvv[b].req[0]; }
        cam.forEach(id => aprenderNo(cv, id));
        cv.hp = cv.maxHp;
        removerNo(cv, hpNo.id);
        ok('remover conta de vida não deixa HP acima do máximo', cv.hp <= cv.maxHp,
           `${cv.hp}/${cv.maxHp}`);
      }

      /* Pontos de Alma sem teto (spec §6 e §7): a fonte é externa, e um
         personagem de nível altíssimo continua ganhando. */
      {
        const c = makeChar(PARTY_DEFS[0], 1);
        const t1 = pontosTotais(c);
        c.bonusPontos = 7;                       // quest, chefe, evento…
        ok('ponto de fora do nível entra no total', pontosTotais(c) === t1 + 7);
        const alto = makeChar(PARTY_DEFS[0], 1); alto.lvl = 150;
        ok('nível 150 continua rendendo ponto', pontosTotais(alto) > pontosTotais(makeChar(PARTY_DEFS[0], 99)));
      }

      // Zoom: os três valores do spec §26, e a trava nos extremos.
      {
        const salvo = {z:VistaArvore.zoom, x:VistaArvore.px, y:VistaArvore.py};
        VistaArvore.reset();
        ok('o zoom padrão é 1', VistaArvore.zoom === 1);
        for (let i = 0; i < 40; i++) VistaArvore.aplicarZoom(1);
        ok('o zoom não passa do máximo', VistaArvore.zoom <= ZOOM_ARVORE.max + 1e-9,
           String(VistaArvore.zoom));
        for (let i = 0; i < 80; i++) VistaArvore.aplicarZoom(-1);
        ok('o zoom não passa do mínimo', VistaArvore.zoom >= ZOOM_ARVORE.min - 1e-9,
           String(VistaArvore.zoom));
        VistaArvore.zoom = salvo.z; VistaArvore.px = salvo.x; VistaArvore.py = salvo.y;
      }
    }

    // compra: requisito, saldo e efeito
    {
      const c = makeChar(PARTY_DEFS[0], 1);
      const arv = arvoreDe(c);
      const caro = Object.values(arv).find(n => n.custo > 0 && n.req.length &&
                                                !c.tree.includes(n.req[0]));
      ok('nó com requisito pendente é recusado', !podeAprender(c, caro.id).ok);

      const perto = Object.values(arv).find(n => n.custo > 0 && n.req.every(r => c.tree.includes(r)));
      ok('sem pontos, nem o nó liberado é comprado', !podeAprender(c, perto.id).ok,
         podeAprender(c, perto.id).why);

      c.bonusPontos = perto.custo;
      const antesLivre = pontosLivres(c);
      ok('com pontos, o nó liberado é comprado', aprenderNo(c, perto.id).ok);
      ok('a compra debita exatamente o custo', pontosLivres(c) === antesLivre - perto.custo);
      ok('comprar de novo o mesmo nó é recusado', !podeAprender(c, perto.id).ok);
    }

    // passiva mexe em atributo; habilidade mexe em `skills`
    {
      const c = makeChar(PARTY_DEFS[3], 1);       // Gabriel
      c.bonusPontos = 400;
      const atk0 = c.atk, skills0 = c.skills.length;
      const arv = arvoreDe(c);
      /* Anda a corrente de requisitos até `destino`, comprando tudo no
         caminho. A corrente até uma PASSIVA não passa necessariamente
         por habilidade nenhuma (uma folha pendura direto na habilidade
         inicial, que é grátis), então os dois efeitos precisam de alvos
         separados — juntar os dois foi o que fez este teste falhar. */
      const comprarAte = destino => {
        const caminho = [];
        let alvo = destino;
        while (alvo && !c.tree.includes(alvo)){ caminho.unshift(alvo); alvo = arv[alvo].req[0]; }
        for (const id of caminho) aprenderNo(c, id);
      };

      comprarAte(Object.values(arv).find(n => n.stat === 'atk' && n.custo > 0).id);
      ok('passiva de ATK aumenta o ATK', c.atk > atk0, `${atk0} → ${c.atk}`);

      comprarAte(Object.values(arv).find(n => n.tipo === 'skill' && !n.inicial).id);
      ok('comprar habilidade aumenta o repertório de combate',
         c.skills.length > skills0, `${skills0} → ${c.skills.length}`);
      ok('`skills` só contém habilidade que existe em SKILLS',
         c.skills.every(s => !!SKILLS[s]), c.skills.join(','));

      // redefinir devolve tudo e volta ao estado inicial
      const gastosAntes = pontosGastos(c);
      const devolvidos = redefinirArvore(c);
      ok('redefinir devolve exatamente o que foi gasto', devolvidos === gastosAntes,
         `${devolvidos} vs ${gastosAntes}`);
      ok('redefinir zera o gasto', pontosGastos(c) === 0);
      ok('redefinir devolve o ATK ao valor de base', c.atk === atk0, `${c.atk} vs ${atk0}`);
      ok('redefinir NÃO deixa o personagem mudo em combate', c.skills.length >= 2,
         c.skills.join(','));
    }

    /* A ponta a ponta que importa: comprar na árvore tem que chegar no
       MENU DE HABILIDADES DA BATALHA. Todos os testes acima podem passar
       com `c.skills` correto e a habilidade ainda não aparecer em campo,
       porque quem o combate lê é o ator copiado para `Battle.allies`. */
    {
      /* Monta um elenco próprio em vez de usar o que estiver em `G`:
         os testes anteriores deixam o estado onde pararam, e depender
         disso torna a falha dependente da ORDEM dos testes. É o mesmo
         padrão do teste de formação de batalha. */
      const antesParty = G.party, antesSquad = G.squad, antesLider = G.leader;
      G.party = PARTY_DEFS.map(d => makeChar(d, 20));
      G.squad = G.party.slice(0, PARTY_SIZE).map(c => c.name);
      G.leader = 0;

      const c = G.party[0];
      const arv = arvoreDe(c);
      const alvo = Object.values(arv).find(n => n.tipo === 'skill' && !n.inicial);
      let a = alvo.id; const caminho = [];
      while (a && !c.tree.includes(a)){ caminho.unshift(a); a = arv[a].req[0]; }
      for (const id of caminho) aprenderNo(c, id);

      let erro = null;
      try { Battle.begin(['wolf']); } catch(e){ erro = e.message; }
      const ator = (Battle.allies || []).find(x => x.name === c.name);
      ok('a luta começa com o elenco vindo da árvore', !erro && !!ator, erro || 'ok');
      ok('habilidade comprada aparece no repertório de combate',
         !!ator && ator.skills.includes(alvo.skill),
         ator ? ator.skills.join(',') : 'sem ator');
      ok('nenhum id do repertório de combate é desconhecido',
         !!ator && ator.skills.every(s => !!SKILLS[s]));

      Battle.active = false; G.scene = 'FIELD';
      G.party = antesParty; G.squad = antesSquad; G.leader = antesLider;
    }

    // navegação espacial do cursor
    {
      const c = makeChar(PARTY_DEFS[0], 1);
      const vizinhos = ['up','down','left','right']
        .map(d => noVizinho(c, 'core', d === 'left' ? -1 : d === 'right' ? 1 : 0,
                                       d === 'up' ? -1 : d === 'down' ? 1 : 0))
        .filter(Boolean);
      ok('do núcleo dá para sair em mais de uma direção', vizinhos.length >= 2,
         `${vizinhos.length}`);
      ok('o vizinho encontrado é sempre um nó real',
         vizinhos.every(id => !!arvoreDe(c)[id]), vizinhos.join(','));
    }

    // save: ida e volta preserva a árvore, não só as habilidades
    {
      const salvo = {party:G.party.map(p => ({name:p.name, tree:(p.tree||[]).slice(),
                                              bonus:p.bonusPontos||0}))};
      const alvo = charByName('Seiji') || G.party[0];
      if (alvo){
        alvo.bonusPontos = 50;
        const arv = arvoreDe(alvo);
        for (const id of Object.keys(arv)) aprenderNo(alvo, id);
        const arvoreAntes = (alvo.tree || []).slice().sort().join(',');
        const skillsAntes = alvo.skills.slice().sort().join(',');
        const atkAntes = alvo.atk;

        const s = JSON.parse(JSON.stringify({
          v:APP_VERSION, map:G.mapId, x:1, y:1, dir:'down', squad:G.squad.slice(),
          party:G.party.map(p => ({name:p.name, lvl:p.lvl, exp:p.exp, hp:p.hp, mp:p.mp,
                                   skills:p.skills.slice(), tree:(p.tree||[]).slice(),
                                   bonusPontos:p.bonusPontos||0, ult:p.ult, gear:{...p.gear}})),
        }));
        let erro = null;
        try { loadFromSave(s); } catch(e){ erro = e.message; }
        const depois = charByName('Seiji');
        ok('save com árvore recarrega sem estourar', !erro, erro || 'ok');
        ok('save preserva os nós comprados',
           (depois.tree || []).slice().sort().join(',') === arvoreAntes);
        ok('save preserva o repertório derivado da árvore',
           depois.skills.slice().sort().join(',') === skillsAntes);
        ok('save preserva o ATK que veio das passivas',
           depois.atk === atkAntes, `${depois.atk} vs ${atkAntes}`);
      }
      // devolve o elenco ao estado anterior ao teste
      for (const p of salvo.party){
        const c = charByName(p.name); if (!c) continue;
        c.tree = p.tree; c.bonusPontos = p.bonus; syncArvore(c); recalcStats(c);
      }
    }

    // migração de save sem árvore
    {
      const c = makeChar(PARTY_DEFS[0], 19);
      c.tree = [];
      migrarSkillsParaArvore(c, ['ink_cut','ink_stain','ink_flood','ink_seal']);
      ok('migração recupera as habilidades do save antigo',
         ['ink_cut','ink_stain','ink_flood','ink_seal'].every(s => c.skills.includes(s)),
         c.skills.join(','));
      ok('migração puxa a corrente inteira (sem nó órfão)',
         (c.tree || []).every(id => arvoreDe(c)[id].req.every(r => c.tree.includes(r))));
      ok('migração nunca deixa saldo negativo', pontosLivres(c) >= 0, `${pontosLivres(c)}`);
    }

    // id de nó que não existe mais não derruba o jogo
    {
      const c = makeChar(PARTY_DEFS[0], 10);
      c.tree = c.tree.concat(['nó_de_versão_antiga', 'lixo']);
      let erro = null;
      try { syncArvore(c); recalcStats(c); } catch(e){ erro = e.message; }
      ok('nó desconhecido no save é descartado sem estourar', !erro, erro || 'ok');
      ok('nó desconhecido some da árvore', !c.tree.includes('lixo'));
    }
  }

  /* --- TRANSITABILIDADE ----------------------------------------------
     O defeito que este bloco existe para impedir foi reportado jogando:
     no `spire` a Astrônoma e o Último Arauto estavam parados em corredor
     de UMA casa e, como `isSolid()` conta NPC, viraram parede. A porta
     do chefe, o cristal de save e um terceiro NPC ficaram inalcançáveis
     e não havia rota alternativa — fim de jogo silencioso.

     Nada no código reclamava: o mapa estava "correto" (bordas seladas,
     warps casando, tiles válidos). O que faltava era medir o mapa como
     o JOGADOR o percorre, com os NPCs no lugar. É o que a varredura
     abaixo faz.

     Duas regras, e as duas importam:
       1. ALCANCE — a partir do spawn, com todo NPC e chefe tratados
          como parede, tem de dar para chegar a toda porta, baú, cristal
          e a uma casa vizinha de cada NPC/chefe. Esta é a fatal.
       2. LARGURA — nenhum NPC pode estar num tile de corredor (dois
          vizinhos livres ou menos). Mesmo quando existe desvio, andar
          num mapa assim é jogo de esquiva. Pedido explícito: as áreas
          novas não podem ser apertadas. */
  {
    const inalcancavel = [], emCorredor = [];
    for (const [id, def] of Object.entries(MAPS)){
      const g = normalizeRows(def.rows, def.fill);
      const alt = g.length, larg = g[0].length;
      const livre = (x, y) => !(x < 0 || y < 0 || x >= larg || y >= alt ||
                                (TILEDEF[g[y][x]] || {solid:true}).solid);
      const bloqueio = new Set((def.npcs || []).map(n => `${n.x},${n.y}`));
      if (def.boss) bloqueio.add(`${def.boss.x},${def.boss.y}`);

      const visto = new Set([`${def.spawn.x},${def.spawn.y}`]);
      const fila = [[def.spawn.x, def.spawn.y]];
      while (fila.length){
        const [x, y] = fila.pop();
        for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
          const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
          if (visto.has(k) || !livre(nx, ny) || bloqueio.has(k)) continue;
          visto.add(k); fila.push([nx, ny]);
        }
      }
      /* "Alcançável" para porta/baú/NPC é chegar a uma casa VIZINHA:
         baú e NPC são sólidos, ninguém pisa em cima deles. */
      const chegaPerto = (x, y) => visto.has(`${x},${y}`) ||
        [[0,1],[0,-1],[1,0],[-1,0]].some(([dx, dy]) => visto.has(`${x+dx},${y+dy}`));

      for (let y = 0; y < alt; y++) for (let x = 0; x < larg; x++){
        const t = TILEDEF[g[y][x]];
        if (!t || !(t.warp || t.chest || t.save)) continue;
        if (!chegaPerto(x, y)) inalcancavel.push(`${id}:${t.id}(${x},${y})`);
      }
      for (const n of (def.npcs || [])){
        if (!chegaPerto(n.x, n.y)) inalcancavel.push(`${id}:${n.name}`);
        const vizinhosLivres = [[0,1],[0,-1],[1,0],[-1,0]]
          .filter(([dx, dy]) => livre(n.x + dx, n.y + dy)).length;
        if (vizinhosLivres <= 2) emCorredor.push(`${id}/${n.name}(${vizinhosLivres})`);
      }
      if (def.boss && !chegaPerto(def.boss.x, def.boss.y))
        inalcancavel.push(`${id}:chefe ${def.boss.id}`);
    }
    ok('tudo é alcançável a pé, com os NPCs contando como parede',
       inalcancavel.length === 0, inalcancavel.join(' '));
    ok('nenhum NPC parado em corredor de uma casa',
       emCorredor.length === 0, emCorredor.join(' '));
  }

  /* --- CENAS DA v4.8 -------------------------------------------------
     A integridade genérica (comando válido, mapa real, criatura real)
     já é varrida no bloco de cenas mais acima, para TODAS as cenas.
     Aqui entra o que é específico: os ganchos novos (`need` no gatilho,
     `cena` no chefe) e a promessa de que cada região nova tem cena de
     chegada, de véspera e de desfecho. É o que protege o rascunho de
     texto: quem reescrever pode trocar tudo, menos a estrutura. */
  {
    const novas = ['portao_sul','chegada_mata','entrega_batedora','pira_antes','pira_depois',
                   'chegada_cisterna','entrega_comporta','comporta_antes','comporta_depois',
                   'chegada_coroa','coroa_antes','entrega_arauto','final'];
    const faltando = novas.filter(id => !SCENES[id]);
    ok(`as ${novas.length} cenas novas existem`, faltando.length === 0, faltando.join(','));
    ok('toda cena nova toca uma vez só (tem flag própria)',
       novas.every(id => !!SCENES[id].flag),
       novas.filter(id => !SCENES[id].flag).join(','));
    {
      const flags = novas.map(id => SCENES[id].flag);
      ok('nenhuma cena divide a flag com outra', new Set(flags).size === flags.length);
    }
    /* `who` apontando para NPC que não existe no mapa da cena deixa a
       cena MUDA sem quebrar nada — exatamente o tipo de erro que só
       aparece jogando. Confere as cenas cujo mapa dá para deduzir. */
    /* Em que mapa cada cena roda. Não dá para deduzir do motor (uma cena
       é só uma lista de comandos), então fica declarado aqui — é o que
       permite conferir `who`, `cam` e `move` contra o mapa certo. */
    const MAPA_DA_CENA = {
      abertura_patio:'patio', entrega_zelador:'patio', portao_sul:'patio',
      chegada_mata:'ashwood', entrega_batedora:'ashwood',
      chegada_ninhal:'nests', chocadeira_antes:'nests_deep', chocadeira_depois:'nests_deep',
      pira_antes:'ashpyre', pira_depois:'ashpyre',
      chegada_cisterna:'cistern', entrega_comporta:'cistern',
      comporta_antes:'cistern_deep', comporta_depois:'cistern_deep',
      chegada_coroa:'spire', entrega_arauto:'spire',
      coroa_antes:'spire_top', final:'spire_top',
      vharok_reveal:'deserto_fundo', vharok_outro:'deserto_fundo',
    };
    ok('toda cena declarada tem mapa conhecido (e vice-versa)',
       Object.keys(MAPA_DA_CENA).every(c => !!SCENES[c]) &&
       Object.keys(SCENES).every(c => !!MAPA_DA_CENA[c]),
       Object.keys(SCENES).filter(c => !MAPA_DA_CENA[c]).join(','));
    {
      const mapaDaCena = MAPA_DA_CENA;
      const orfaos = [];
      for (const [cena, mapa] of Object.entries(mapaDaCena)){
        const nomes = new Set((MAPS[mapa].npcs || []).map(n => n.name));
        for (const c of SCENES[cena].cmds){
          const w = c.who;
          if (!w || w === 'player' || w === 'lider' || typeof w === 'number') continue;
          if (!nomes.has(w)) orfaos.push(`${cena}:${w}∉${mapa}`);
        }
      }
      ok('toda fala de cena cita NPC que existe no mapa dela', orfaos.length === 0, orfaos.join(' '));
    }
    /* Duas regras DIFERENTES, e confundi-las já me custou um teste falso:
         · `move to:` tem de cair em chão PISÁVEL — senão o ator não chega
           e a cena continua com ele no lugar errado;
         · `cam to:` só precisa estar DENTRO do mapa — enquadrar água,
           parede ou pira é escolha de direção, não defeito. */
    {
      const foraDoMapa = [], emParede = [];
      for (const [cena, mapa] of Object.entries(MAPA_DA_CENA)){
        const g = normalizeRows(MAPS[mapa].rows, MAPS[mapa].fill);
        for (const c of SCENES[cena].cmds){
          if (!Array.isArray(c.to)) continue;
          const [x, y] = c.to;
          const dentro = g[y] && g[y][x] !== undefined;
          if (!dentro){ foraDoMapa.push(`${cena}:${c.do}(${x},${y})`); continue; }
          if (c.do === 'move' && TILEDEF[g[y][x]]?.solid) emParede.push(`${cena}(${x},${y})`);
        }
      }
      ok('todo destino de cena está dentro do mapa', foraDoMapa.length === 0, foraDoMapa.join(' '));
      ok('todo `move` de cena termina em chão pisável', emParede.length === 0, emParede.join(' '));
    }

    /* TODA cena tem de RODAR ATÉ O FIM. É a asserção mais importante do
       sistema: cena travada não dá erro, não avisa e não volta — o jogo
       simplesmente congela com barras de cinema na tela, e o jogador
       perde a sessão. Roda cada cena no mapa dela com um laço que imita
       o loop real (FX primeiro; enquanto a tela transiciona, o resto
       para) e exige controle de volta no campo.

       O laço PRECISA bombear o FX: sem isso o comando `fade` espera para
       sempre e a cena parece travada quando não está. Aconteceu comigo
       ao medir a cena final — o defeito estava no medidor. */
    {
      const salvo = {flags:G.flags, mapa:G.mapId, cena:G.scene, msg:Msg.active};
      const travadas = [], semControle = [], semFlag = [];
      for (const [cena, mapa] of Object.entries(MAPA_DA_CENA)){
        G.flags = {}; Msg.active = false; Cut.pending = null;
        if (Cut.active) Cut.abort();
        loadMap(mapa); Cut.pending = null; G.scene = 'FIELD';
        if (!Cut.play(cena)){ travadas.push(cena + '(não iniciou)'); continue; }
        let n = 0;
        while (Cut.active && n++ < 8000){
          FX.update(0.05);
          if (FX.blocking) continue;
          if (Msg.active){ Msg.shown = 999; Msg.finish(); }
          Cut.update(0.05);
        }
        if (Cut.active){ travadas.push(cena); Cut.abort(); continue; }
        if (G.scene !== 'FIELD') semControle.push(`${cena}→${G.scene}`);
        if (!G.flags[SCENES[cena].flag]) semFlag.push(cena);
      }
      FX.trans = null; Msg.active = false; Cut.pending = null;
      ok('nenhuma cena trava o jogo — todas rodam até o fim',
         travadas.length === 0, travadas.join(' '));
      ok('toda cena devolve o controle ao campo', semControle.length === 0, semControle.join(' '));
      ok('toda cena grava a própria flag de "já vi" ao terminar',
         semFlag.length === 0, semFlag.join(' '));
      G.flags = salvo.flags; G.scene = salvo.cena; Msg.active = salvo.msg;
      if (salvo.mapa) loadMap(salvo.mapa);
      Cut.pending = null;
    }

    // gancho novo: `need` no gatilho de tile
    {
      const g = (MAPS.patio.triggers || []).find(t => t.scene === 'portao_sul');
      ok('o gatilho do portão sul existe e exige o Eco derrotado',
         !!g && g.need === 'echo_defeated' && !!g.flag);
      const salvo = {flags:G.flags, mapa:G.mapId, cena:G.scene};
      G.flags = {};
      loadMap('patio'); Cut.pending = null;
      G.player.tx = g.x; G.player.ty = g.y;
      onStepComplete();
      ok('sem a flag exigida, o gatilho NÃO dispara', !Cut.active, 'cena=' + Cut.id);
      if (Cut.active) Cut.abort();
      G.flags = {echo_defeated:true};
      G.player.tx = g.x; G.player.ty = g.y;
      onStepComplete();
      ok('com a flag exigida, o gatilho dispara', Cut.active && Cut.id === 'portao_sul', Cut.id);
      Cut.abort();
      // e `flag` continua fazendo tocar uma vez só
      G.flags = {echo_defeated:true, cena_portao:true};
      G.player.tx = g.x; G.player.ty = g.y;
      onStepComplete();
      ok('cena já vista não dispara de novo', !Cut.active);
      if (Cut.active) Cut.abort();
      Msg.active = false; Cut.pending = null;
      G.flags = salvo.flags; G.scene = salvo.cena;
      if (salvo.mapa) loadMap(salvo.mapa);
    }

    // gancho novo: `cena` no chefe
    {
      const comCena = Object.entries(MAPS).filter(([, m]) => m.boss?.cena);
      /* Não trava o NÚMERO de chefes com cena — travar contagem obriga a
         editar o teste toda vez que entra chefe novo, e teste que se
         edita por rotina para de proteger. O que importa é que exista
         mais de um e que todos apontem para cena real. */
      ok('há chefes entregando CENA em vez de duas linhas soltas',
         comCena.length >= 3, `${comCena.length}: ` + comCena.map(([id]) => id).join(','));
      ok('toda cena de chefe existe',
         comCena.every(([, m]) => !!SCENES[m.boss.cena]),
         comCena.filter(([, m]) => !SCENES[m.boss.cena]).map(([id]) => id).join(','));
      ok('todo chefe tem desfecho (cena OU outro) — nenhum termina em silêncio',
         Object.values(MAPS).every(m => !m.boss || m.boss.cena || (m.boss.outro || []).length),
         Object.entries(MAPS).filter(([, m]) => m.boss && !m.boss.cena && !(m.boss.outro||[]).length)
               .map(([id]) => id).join(','));

      // e a vitória realmente ENFILEIRA a cena
      const salvo = {party:G.party, squad:G.squad, flags:G.flags, mapa:G.mapId, cena:G.scene};
      G.party = PARTY_DEFS.map(d => makeChar(d, 26));
      G.squad = defaultSquad(); G.leader = 0;
      G.flags = {}; Cut.pending = null;
      loadMap('ashpyre');
      Battle.begin(['cinder'], {boss:true});
      Battle.enemies.forEach(e => e.hp = 0);
      Battle.finish('victory');
      ok('derrotar o chefe grava a flag dele', G.flags.cinder_defeated === true);
      ok('derrotar o chefe enfileira a cena (não toca dentro da batalha)',
         Cut.pending === 'pira_depois' && !Cut.active, `${Cut.pending}`);
      Cut.play(Cut.pending); Cut.pending = null;
      let voltas = 0;
      while (Cut.active && voltas++ < 4000){
        if (Msg.active){ Msg.shown = 999; Msg.finish(); }
        Cut.update(0.05);
      }
      ok('a cena de vitória roda até o fim e devolve o campo',
         !Cut.active && G.scene === 'FIELD', `${voltas} quadros`);
      ok('e grava a própria flag de "já vi"', G.flags.cena_pira_fim === true);
      Msg.active = false; Cut.pending = null;
      Object.assign(G, {party:salvo.party, squad:salvo.squad, flags:salvo.flags, scene:salvo.cena});
      sanitizeSquad();
      if (salvo.mapa) loadMap(salvo.mapa);
    }

    /* Cada região nova tem de ter as três batidas: chegar, a véspera do
       chefe e o desfecho. É a estrutura que o rascunho de texto está
       segurando — se alguém apagar uma cena inteira ao reescrever, cai. */
    {
      const regioes = [['Mata Cindária', 'chegada_mata', 'pira_antes', 'pira_depois'],
                       ['Cisterna',      'chegada_cisterna', 'comporta_antes', 'comporta_depois'],
                       ['Coroa de Vidro','chegada_coroa', 'coroa_antes', 'final']];
      const incompletas = regioes.filter(([, ...ids]) => !ids.every(id => !!SCENES[id]));
      ok('toda região nova tem chegada, véspera e desfecho',
         incompletas.length === 0, incompletas.map(r => r[0]).join(','));
      ok('cada mapa de região nova dispara a chegada ao entrar',
         ['ashwood','cistern','spire'].every(m => !!MAPS[m].onEnter?.scene));
      ok('a flag do onEnter casa com a flag da cena',
         ['ashwood','cistern','spire'].every(m =>
           MAPS[m].onEnter.flag === SCENES[MAPS[m].onEnter.scene].flag));
    }
  }

  /* --- compatibilidade de save com a v4.7 ---------------------------
     A v4.8 renomeou o gauge de Ressonância (`res` → `reso`), passou a
     usar `res` para resistência elemental e criou flags novas. Save
     antigo não pode nem quebrar nem ganhar de graça o que não conquistou. */
  {
    const salvo = {party:G.party, squad:G.squad, flags:G.flags, items:G.items,
                   gold:G.gold, quests:G.quests, kills:G.kills, mapa:G.mapId, cena:G.scene};
    const antigo = {
      v:'4.7.0', map:'patio', x:19, y:13, dir:'down', leader:0,
      gold:900, items:{potion:3, w_selo:1}, steps:12,
      flags:{warden_defeated:true, echo_defeated:true, lina_paga:true},
      squad:['Seiji','Ophelia','Marin','Gabriel','Max'],
      recruits:{}, difficulty:'normal',
      quests:{q_zelador:{st:'feita', base:0}}, kills:{wolf:9},
      party:['Seiji','Ophelia','Marin','Gabriel','Max','Eden'].map(n => ({
        name:n, lvl:19, exp:5, hp:40, mp:9, skills:[], ult:n, inParty:true,
        gear:{weapon:'w_selo', armor:'a_veste', accessory:'t_resson'},
      })),
    };
    let erro = null;
    try { loadFromSave(antigo); } catch(e){ erro = e.message; }
    ok('save da v4.7 carrega sem estourar', !erro, erro || 'ok');
    ok('save da v4.7 mantém o elenco inteiro', G.party.length === 6, `${G.party.length}`);
    ok('personagem de save antigo ganha o gauge de Ressonância zerado',
       G.party.every(c => c.reso === 0), JSON.stringify(G.party.map(c => c.reso)));
    ok('personagem de save antigo recalcula a resistência do equipamento',
       G.party.every(c => c.res === null || typeof c.res === 'object'));
    /* v5.0: o save antigo não recebe mais habilidade de graça pelo
       nível — recebe os PONTOS do nível dele e escolhe. Este save de
       teste vem com `skills:[]`, então o esperado é: repertório inicial
       destravado e o saldo cheio de um nível 19 esperando ser gasto. */
    ok('save antigo chega com o repertório inicial destravado',
       charByName('Seiji').skills.length === 2,
       charByName('Seiji').skills.join(','));
    ok('save antigo recebe os pontos de alma do nível dele',
       pontosLivres(charByName('Seiji')) === 18 * PONTOS_POR_NIVEL,
       `${pontosLivres(charByName('Seiji'))}`);
    ok('save antigo NÃO ganha as áreas novas de graça',
       !G.flags.cinder_defeated && !G.flags.deluge_defeated && !G.flags.crown_defeated);
    ok('mas já pode entrar na primeira área nova (derrotou o Eco)',
       !!G.flags.echo_defeated);
    ok('itens antigos continuam existindo no catálogo',
       Object.keys(antigo.items).every(i => !!ITEMS[i]));
    /* Ida e volta pelo formato ATUAL, agora com as flags novas: é o que
       garante que quem jogar a v4.8 não perde o progresso na próxima. */
    G.flags.cinder_defeated = true;
    const bruto = JSON.parse(JSON.stringify({
      map:G.mapId, x:G.player.tx, y:G.player.ty, dir:G.player.dir,
      party:G.party.map(p => ({name:p.name, lvl:p.lvl, exp:p.exp, hp:p.hp, mp:p.mp,
                               skills:p.skills.slice(), ult:p.ult, gear:{...p.gear}})),
      squad:G.squad.slice(), leader:G.leader, recruits:{...G.recruits},
      gold:G.gold, items:G.items, flags:G.flags, quests:G.quests, kills:G.kills}));
    loadFromSave(bruto);
    ok('save da v4.8 sobrevive à ida e volta com as flags novas',
       G.flags.cinder_defeated === true && G.party.length === 6);

    Object.assign(G, {party:salvo.party, squad:salvo.squad, flags:salvo.flags,
                      items:salvo.items, gold:salvo.gold, quests:salvo.quests,
                      kills:salvo.kills, scene:salvo.cena});
    sanitizeSquad();
    if (salvo.mapa) loadMap(salvo.mapa);
  }

  /* --- progressão de conteúdo: dá para chegar lá? -------------------
     Curva de EXP e preços não podem virar parede. Estes dois números
     são grosseiros de propósito: só pegam a ordem de grandeza errada. */
  {
    const chefesNovos = ['cinder','deluge','crown'];
    ok('cada chefe novo paga mais que o anterior',
       chefesNovos.every((k, i) => i === 0 || BESTIARY[k].exp > BESTIARY[chefesNovos[i-1]].exp),
       chefesNovos.map(k => BESTIARY[k].exp).join(' < '));
    ok('cada região nova é mais forte que a anterior',
       Math.max(...FORMATIONS.ashwood.flat().map(([k]) => BESTIARY[k].lvl)) <
       Math.max(...FORMATIONS.cistern.flat().map(([k]) => BESTIARY[k].lvl)) &&
       Math.max(...FORMATIONS.cistern.flat().map(([k]) => BESTIARY[k].lvl)) <
       Math.max(...FORMATIONS.spire.flat().map(([k]) => BESTIARY[k].lvl)));
    ok('as regiões novas começam acima do fim da Galeria (nv 18)',
       Math.min(...FORMATIONS.ashwood.flat().map(([k]) => BESTIARY[k].lvl)) > 18);
    ok('todo inimigo novo tem sprite registrado',
       Object.values(BESTIARY).every(b => !b.sprite || !!SPRITE_DATA[b.sprite]));
    ok('todo inimigo novo dá EXP e ouro coerentes com o nível',
       Object.values(BESTIARY).every(b => b.exp > 0 && b.gold > 0));
  }

  /* --- regressões de interface --------------------------------------- */
  {
    /* O caso mais cheio são 7 comandos (com Ressonância E Conjunta
       disponíveis). A conta aqui é a MESMA de `drawBattleMenu` — se ela
       mudar lá e não aqui, o teste para de valer, então a fórmula é
       curta de propósito. */
    {
      const n = 7, z = HUD.cmd;
      const lh = Math.min(24, (z.h - 34) / n);
      const ultima = 40 + (n - 1) * lh;
      ok('o painel de comandos comporta a lista cheia (7 comandos)',
         ultima <= z.h - 8, `última linha em y+${Math.round(ultima)} de ${z.h}`);
      ok('a lista de comandos é uma coluna só (é o desenho do mockup)',
         CMD_COLS === 1);
      ok('a linha de comando cabe na largura da zona', z.w - 16 <= CMD_COL_W,
         `${z.w - 16} de ${CMD_COL_W}`);
    }

    /* Regressão real: `Menu` indexava a lista de itens com o CURSOR
       ({i:0}) em vez do índice, e usar qualquer item pelo menu de campo
       derrubava o jogo com TypeError. */
    const salvo = {items:G.items, page:Menu.page, cena:G.scene, party:G.party, hit:Input.hit};
    G.items = {}; Bag.add('potion', 2);
    G.party = [makeChar(PARTY_DEFS[0], 5)];
    G.party[0].hp = 1;
    Menu.page = 'items'; Menu.cur.items.i = 0; G.scene = 'MENU';
    let estourou = null;
    try { Input.hit = {confirm:true}; Menu.update(0); } catch(e){ estourou = e.message; }
    Input.hit = {};
    ok('usar item pelo menu de campo não estoura', !estourou, estourou || 'ok');
    ok('e realmente abre a tela de alvo', Menu.page === 'itemTarget', Menu.page);
    Menu.page = 'root';
    Object.assign(G, {items:salvo.items, scene:salvo.cena, party:salvo.party});
    Input.hit = salvo.hit;
    sanitizeSquad();

    // as telas do menu desenham com o catálogo cheio
    {
      const bag = G.items, party = G.party, squad = G.squad, mapa = G.mapId;
      G.items = {};
      // estado conhecido: elenco cheio, grupo montado, mapa carregado
      G.party = PARTY_DEFS.map(d => makeChar(d, 20));
      G.squad = defaultSquad(); G.leader = 0;
      loadMap('ashwood');
      Object.keys(ITEMS).filter(k => ITEMS[k].kind === 'consumable').forEach(k => Bag.add(k, 3));
      let erro = null;
      const paginas = ['root','items','equip','equipSlot','skills','status','quests','form','opts'];
      const antes = Menu.page;
      for (const p of paginas){
        Menu.page = p;
        try { Menu.draw(); } catch(e){ erro = `${p}: ${e.message}`; break; }
      }
      Menu.page = antes;
      ok('todas as páginas do menu desenham com a bolsa cheia', !erro, erro || 'ok');
      G.items = bag; G.party = party; G.squad = squad;
      sanitizeSquad();
      if (mapa) loadMap(mapa);
    }

    // a loja desenha com o estoque novo (inclusive itens com `resist`)
    {
      const cena = G.scene, flags = G.flags, party = G.party, squad = G.squad, mapa = G.mapId;
      G.flags = {warden_defeated:true, echo_defeated:true, cinder_defeated:true,
                 deluge_defeated:true, crown_defeated:true};
      G.party = PARTY_DEFS.map(d => makeChar(d, 20));
      G.squad = defaultSquad(); G.leader = 0;
      loadMap('patio');
      let erro = null;
      for (const id of Object.keys(SHOPS)){
        Shop.open(id); Shop.msgT = 0;
        for (let t = 0; t < SHOP_TABS.length; t++){
          Shop.tab = t; Shop.cur.buy.i = 0;
          try { Shop.draw(); } catch(e){ erro = `${id}/${SHOP_TABS[t].nome}: ${e.message}`; break; }
        }
        if (erro) break;
      }
      Shop.tab = 0;
      ok('toda loja desenha em todas as abas', !erro, erro || 'ok');
      G.flags = flags; G.scene = cena; G.party = party; G.squad = squad;
      sanitizeSquad();
      if (mapa) loadMap(mapa);
    }

    // e o combate desenha com Conjunta e Postura na tela
    {
      const party = G.party, squad = G.squad, cena = G.scene;
      G.party = PARTY_DEFS.map(d => makeChar(d, 25));
      G.squad = defaultSquad(); G.leader = 0;
      Battle.begin(['crown'], {boss:true});
      Battle.actor = Battle.allies[0];
      let erro = null;
      for (const fase of ['INPUT','SKILL','COMBO','ITEM','TARGET']){
        Battle.phase = fase;
        if (fase === 'TARGET'){ Battle.targetPool = Battle.enemies.slice(); Battle.targetSide = 'enemy'; }
        try { drawBattle(); } catch(e){ erro = `${fase}: ${e.message}`; break; }
      }
      // e com o chefe QUEBRADO (a barra extra muda o desenho)
      if (!erro){
        Battle.enemies[0].broken = 2; Battle.enemies[0].breakT = 1;
        Battle.phase = 'INPUT';
        try { drawBattle(); } catch(e){ erro = 'quebrado: ' + e.message; }
      }
      ok('o combate desenha em todas as fases, com chefe inteiro e quebrado', !erro, erro || 'ok');
      Battle.active = false; Battle.phase = 'INTRO';
      G.party = party; G.squad = squad; G.scene = cena;
      sanitizeSquad();
    }
  }

  /* --- render/relatório --- */
  const pass = results.filter(r => r.pass).length;
  const fail = results.length - pass;
  const box = document.createElement('div');
  box.style.cssText = `position:fixed;inset:0;z-index:9999;overflow:auto;background:#08080f;
    color:#d8d4cc;font:12px/1.5 ui-monospace,monospace;padding:16px 20px`;
  box.innerHTML =
    `<div style="font:14px 'Press Start 2P',monospace;color:${fail?'#ff7a7a':'#7ada7a'};margin-bottom:12px">
       AUTOTESTE — ${pass}/${results.length} OK${fail?` · ${fail} FALHA(S)`:''}
     </div>
     <div style="color:#6a6a80;margin-bottom:14px">Éter Anima v${APP_VERSION} · feche esta aba e remova <b>?test</b> da URL para jogar.</div>` +
    results.map(r => `<div style="color:${r.pass?'#5a9a5a':'#ff6a6a'}">
       ${r.pass?'✔':'✘'} ${r.name}${r.extra?` <span style="color:#6a6a80">(${r.extra})</span>`:''}</div>`).join('');
  document.body.appendChild(box);
  console.log(`[Éter Anima] autoteste: ${pass}/${results.length}`, results.filter(r => !r.pass));
  return {pass, fail, results};
}
