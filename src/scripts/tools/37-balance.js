/* ===================================================================
   16. FERRAMENTA DE BALANCEAMENTO
   Abra o console e rode `medirBalanco()`. Ele joga N batalhas por
   região com uma IA razoável (cura quem está abaixo de 35%, usa
   Ressonância quando enche) e relata duração, vitória e desgaste.
   Alvos de projeto: ~3,5 rodadas, ~50-70% de HP restante, 0 caídos.
   =================================================================== */
function medirBalanco(n = 60, cenarios){
  const salvo = {items:G.items, gold:G.gold, flags:G.flags, party:G.party,
                 squad:G.squad, leader:G.leader, cena:G.scene, mapa:G.mapId};
  cenarios = cenarios || [
    {regiao:'patio',      lvl:5,  gear:[]},
    {regiao:'patio',      lvl:7,  gear:['w_treino','a_tunica']},
    {regiao:'undercroft', lvl:8,  gear:['w_treino','a_tunica','t_vital']},
    {regiao:'undercroft', lvl:11, gear:['w_brasa','a_manto','t_vital']},
    {regiao:'deepway',    lvl:14, gear:['w_brasa','a_coura','t_vital']},
    {regiao:'deepway',    lvl:17, gear:['w_umbra','a_veste','t_resson']},
  ];
  const med = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const linhas = [];
  for (const cen of cenarios){
    /* `vale` é o piso de HP do grupo DURANTE a luta. É a métrica honesta
       de tensão: "HP restante" no fim mente quando a IA cura, porque ela
       recompõe a barra antes do último golpe cair. */
    const R = {rodadas:[], vit:0, der:0, hp:[], vale:[], caidos:[], itens:[]};
    for (let b = 0; b < n; b++){
      G.items = {potion:5, hipot:3, phoenix:2}; G.gold = 0; G.flags = {};
      G.party = PARTY_DEFS.map(d => makeChar(d, cen.lvl));
      for (const c of G.party){ for (const id of cen.gear){ Bag.add(id); equipItem(c, id); }
                                c.hp = c.maxHp; c.mp = c.maxMp; }
      /* o grupo tem que ser remontado junto: sem isso a party entra vazia
         e toda luta termina em derrota na primeira rodada.
         `cen.tam` mede grupos menores — é como se afere se `escalaGrupo()`
         mantém a luta parecida com 1, 2 ou 5 em campo. Recortar o grupo
         pelo começo pega Seiji/Ophelia/Marin, que é o elenco típico de
         quem está começando. `cen.quem` permite fixar outro. */
      G.squad = (cen.quem || defaultSquad()).slice(0, cen.tam || PARTY_SIZE);
      G.leader = 0;
      const itens0 = sum(Object.values(G.items));
      Battle.begin(buildFormation(pick(FORMATIONS[cen.regiao])));
      let f = 0, vale = 1;
      while (Battle.active && f < 40000){
        f++;
        const vivo = sum(Battle.allies.map(x => x.maxHp));
        if (vivo > 0) vale = Math.min(vale, sum(Battle.allies.map(x => x.hp)) / vivo);
        const ph = Battle.phase, a = Battle.actor;
        if (ph === 'INPUT'){
          const feridos = Battle.allies.filter(x => x.hp > 0 && x.hp < x.maxHp * 0.35);
          if (a.reso >= 100 && a.ult) Battle.chooseCommand('ult');
          else if (feridos.length && a.skills.some(s => SKILLS[s].type === 'heal' && a.mp >= SKILLS[s].cost))
            Battle.chooseCommand('skill');
          else if (a.skills.some(s => SKILLS[s].type === 'atk' && a.mp >= SKILLS[s].cost) && chance(0.65))
            Battle.chooseCommand('skill');
          else Battle.chooseCommand('attack');
        } else if (ph === 'SKILL'){
          const feridos = Battle.allies.filter(x => x.hp > 0 && x.hp < x.maxHp * 0.35);
          const cura = a.skills.filter(s => SKILLS[s].type === 'heal' && a.mp >= SKILLS[s].cost);
          const atq  = a.skills.filter(s => SKILLS[s].type === 'atk'  && a.mp >= SKILLS[s].cost);
          const esc = (feridos.length && cura.length) ? cura[0] : atq[0];
          if (!esc) Battle.phase = 'INPUT'; else Battle.chooseSkill(esc);
        } else if (ph === 'TARGET'){
          const p = Battle.targetPool;
          const alvo = Battle.targetSide === 'ally'
            ? p.slice().sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0]
            : p.slice().sort((x, y) => x.hp - y.hp)[0];
          Battle.execute([alvo || p[0]]);
        } else if (ph === 'VICTORY'){
          R.vit++; R.rodadas.push(Battle.round);
          R.hp.push(sum(Battle.allies.map(x => x.hp)) / sum(Battle.allies.map(x => x.maxHp)));
          R.vale.push(vale);
          R.caidos.push(Battle.allies.filter(x => x.hp <= 0).length);
          R.itens.push(itens0 - sum(Object.values(G.items)));
          Battle.finish('victory');
        } else if (ph === 'DEFEAT'){
          R.der++; R.rodadas.push(Battle.round); Battle.active = false; G.scene = 'FIELD';
        } else Battle.update(0.05);
      }
      if (f >= 40000){ Battle.active = false; R.der++; }
    }
    linhas.push(`${cen.regiao} Nv${cen.lvl}: ${med(R.rodadas).toFixed(1)} rodadas | ` +
      `vitória ${(R.vit / n * 100).toFixed(0)}% | vale ${(med(R.vale) * 100).toFixed(0)}% | ` +
      `fim ${(med(R.hp) * 100).toFixed(0)}% | ` +
      `caídos/luta ${med(R.caidos).toFixed(2)} | itens/luta ${med(R.itens).toFixed(1)}`);
  }
  Object.assign(G, {items:salvo.items, gold:salvo.gold, flags:salvo.flags,
                    party:salvo.party, squad:salvo.squad, leader:salvo.leader,
                    scene:salvo.cena});
  sanitizeSquad();
  if (salvo.mapa) loadMap(salvo.mapa);
  const txt = linhas.join('\n');
  console.log('[Éter Anima] balanceamento\n' + txt);
  return txt;
}

boot();
