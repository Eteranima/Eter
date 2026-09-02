/* ===================================================================
   9c. MENU DE CAMPO
   =================================================================== */
const Menu = {
  page:'root',
  cur:{root:{i:0}, items:{i:0}, skills:{i:0}, status:{i:0}, form:{i:0}, opts:{i:0}, target:{i:0},
       equipWho:{i:0}, equipSlot:{i:0}, equipPick:{i:0}, quests:{i:0}, pets:{i:0},
       tree:{i:0}, treeWho:{i:0}, cura:{i:0}, curaAlvo:{i:0}, bestia:{i:0}},
  ctxItem:null, ctxSkill:null, msg:'', msgT:0,
  resetArm:0,                      // janela de confirmação do "redefinir árvore"
  tituloArm:0,                     // idem, para "voltar ao título" (v5.26)
  pick:null,                       // slot "na mão" no editor de times

  ROOT:[
    {id:'items',  label:'Itens'},
    {id:'equip',  label:'Equipar'},
    {id:'skills', label:'Habilidades'},
    {id:'cura',   label:'Curar'},
    {id:'status', label:'Status'},
    {id:'quests', label:'Missões'},
    {id:'bestia', label:'Bestiário'},
    {id:'form',   label:'Grupo'},
    {id:'pets',   label:'Pets'},
    {id:'save',   label:'Salvar'},
    {id:'opts',   label:'Opções'},
    {id:'close',  label:'Voltar'},
  ],

  open(){ this.page = 'root'; G.scene = 'MENU'; Sound.sfx('confirm'); },
  /** Abre o menu JÁ na página pedida — é o que os botões da HUD usam.
   *  Página desconhecida cai na raiz em vez de abrir uma tela vazia. */
  abrirEm(pagina){
    this.open();
    if (this.ROOT.some(o => o.id === pagina && o.id !== 'close')) this.page = pagina;
  },
  close(){ G.scene = 'FIELD'; Sound.sfx('cancel'); },
  toast(t){ this.msg = t; this.msgT = 2.2; },

  /** Auto-equipar (v5.26). Um alvo = só ele; o grupo inteiro = a bolsa
   *  é repartida entre todos. O aviso diz quantos slots mudaram para o
   *  jogador saber que a tecla fez algo mesmo quando nada muda. */
  autoEquip(alvos){
    const n = autoEquipar(alvos);
    Sound.sfx(n ? 'confirm' : 'deny');
    const um = alvos.length === 1;
    this.toast(n ? `Auto-equipar: ${n} ${n === 1 ? 'troca' : 'trocas'} ${um ? 'em ' + alvos[0].name : 'no grupo'}.`
                 : `Nada melhor na bolsa para ${um ? alvos[0].name : 'o grupo'}.`);
  },

  update(dt){
    if (this.msgT > 0) this.msgT -= dt;
    if (this.tituloArm > 0) this.tituloArm -= dt;
    const P = this.page;
    if (P === 'root'){
      navList(this.cur.root, this.ROOT.length);
      if (Input.pressed('cancel') || Input.pressed('menu')) return this.close();
      if (Input.pressed('confirm')){
        const id = this.ROOT[this.cur.root.i].id;
        Sound.sfx('confirm');
        if (id === 'close') return this.close();
        if (id === 'save'){
          const ok = Save.write();
          Sound.sfx(ok ? 'save' : 'deny');
          this.toast(ok ? 'Progresso salvo.' : 'Navegador bloqueou o save.');
          return;
        }
        this.page = id;
      }
      return;
    }
    if (P === 'equip'){
      navList(this.cur.equipWho, G.party.length);
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'root'; return; }
      if (Input.pressed('swap')) return this.autoEquip([G.party[this.cur.equipWho.i]]);
      if (Input.pressed('menu')) return this.autoEquip(G.party);
      if (Input.pressed('confirm')){ Sound.sfx('confirm'); this.cur.equipSlot.i = 0; this.page = 'equipSlot'; }
      return;
    }
    if (P === 'equipSlot'){
      const slots = Object.keys(SLOTS);
      navList(this.cur.equipSlot, slots.length);
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'equip'; return; }
      const c = G.party[this.cur.equipWho.i];
      const slot = slots[this.cur.equipSlot.i];
      if (Input.pressed('swap')) return this.autoEquip([c]);
      if (Input.pressed('menu')){                       // atalho: retirar
        const r = unequipItem(c, slot);
        Sound.sfx(r.ok ? 'cursor' : 'deny'); this.toast(r.ok ? r.text : r.why);
        return;
      }
      if (Input.pressed('confirm')){ Sound.sfx('confirm'); this.cur.equipPick.i = 0; this.page = 'equipPick'; }
      return;
    }
    if (P === 'equipPick'){
      const c = G.party[this.cur.equipWho.i];
      const slot = Object.keys(SLOTS)[this.cur.equipSlot.i];
      const opts = Bag.list().filter(id => ITEMS[id].kind === 'equip' && ITEMS[id].slot === slot);
      navList(this.cur.equipPick, opts.length + 1);     // +1 = "retirar"
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'equipSlot'; return; }
      if (Input.pressed('confirm')){
        const i = this.cur.equipPick.i;
        const r = (i === 0) ? unequipItem(c, slot) : equipItem(c, opts[i - 1]);
        Sound.sfx(r.ok ? 'confirm' : 'deny');
        this.toast(r.ok ? r.text : r.why);
        if (r.ok) this.page = 'equipSlot';
      }
      return;
    }
    if (P === 'items'){
      const list = Bag.list().filter(id => ITEMS[id].kind !== 'equip');
      navList(this.cur.items, list.length);
      if (Input.pressed('cancel')) { Sound.sfx('cancel'); this.page = 'root'; return; }
      if (Input.pressed('confirm') && list.length){
        /* `this.cur.items` é o CURSOR ({i}), não o índice. Indexar a
           lista com o objeto devolvia undefined e a linha seguinte
           estourava — usar um item pelo menu de campo derrubava o jogo. */
        const id = list[this.cur.items.i % list.length], it = ITEMS[id];
        if (it.kind === 'material'){
          Sound.sfx('deny'); this.toast('Material de missão. Não se usa.'); return;
        }
        if (it.use === 'enemy' || it.use === 'enemies' || it.use === 'escape' || it.buff){
          Sound.sfx('deny'); this.toast('Só em combate.'); return;
        }
        if (it.use === 'pet'){
          const p = petAtivo();
          if (!p){ Sound.sfx('deny'); this.toast('Nenhum pet acompanha o grupo.'); return; }
          Bag.take(id);
          const evo = darPetExp(it.petExp);
          Sound.sfx(evo.length ? 'levelup' : 'heal');
          this.toast(evo.length
            ? `${evo[evo.length - 1].de} evoluiu para ${evo[evo.length - 1].para}!`
            : `${p.forma.name} ganhou ${it.petExp} de EXP.`);
          return;
        }
        if (it.use === 'field'){
          if (it.warp){
            Bag.take(id);
            Sound.sfx('door'); this.close();
            FX.fade(() => loadMap(it.warp.map, it.warp.x, it.warp.y, it.warp.dir));
            return;
          }
          Bag.take(id); G.party.forEach(c => { c.hp = c.maxHp; c.mp = c.maxMp; c.ail = []; });
          Sound.sfx('heal'); this.toast('Party restaurada.'); return;
        }
        /* `party` age no grupo inteiro sem tela de alvo. Só consome se
           tiver efeito em ALGUÉM — senão o item sumia à toa quando todo
           mundo já estava cheio. */
        if (it.use === 'party'){
          const alvos = it.revive ? G.party.filter(c => c.hp <= 0) : G.party.filter(c => c.hp > 0);
          const feitos = alvos.map(c => applyItem(it, c)).filter(r => r.ok);
          if (!feitos.length){ Sound.sfx('deny'); this.toast('Ninguém precisa disso agora.'); return; }
          Bag.take(id);
          Sound.sfx(it.revive ? 'levelup' : 'heal');
          this.toast(`${it.name}: ${feitos.length} ${feitos.length > 1 ? 'aliados' : 'aliado'}.`);
          return;
        }
        this.ctxItem = id; this.cur.target.i = 0; this.page = 'itemTarget'; Sound.sfx('confirm');
      }
      return;
    }
    if (P === 'itemTarget'){
      navList(this.cur.target, G.party.length);
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'items'; return; }
      if (Input.pressed('confirm')){
        const c = G.party[this.cur.target.i], it = ITEMS[this.ctxItem];
        const r = applyItem(it, c);
        if (!r.ok){ Sound.sfx('deny'); this.toast(r.why); return; }
        Bag.take(this.ctxItem);
        Sound.sfx(it.revive ? 'levelup' : 'heal');
        this.toast(r.text);
        if (!Bag.count(this.ctxItem)) this.page = 'items';
      }
      return;
    }
    if (P === 'skills'){
      if (this.resetArm > 0) this.resetArm -= dt;
      const c = G.party[this.cur.treeWho.i % G.party.length];
      const lista = treeOrdem(c);
      const arv = arvoreDe(c);

      /* ESC sai; X remove. As duas eram `cancel` no jogo inteiro — o
         grimório é a única tela que precisa separá-las, e é por isso
         que `sair` existe só aqui. Quem joga no celular ou no controle
         continua com o botão de voltar funcionando, porque o botão
         virtual manda `cancel` e não `sair`... então `cancel` também
         sai quando não há o que remover. */
      if (Input.pressed('sair')){ Sound.sfx('cancel'); this.page = 'root'; return; }
      /* Tab troca de personagem sem sair da árvore. Cada um tem a sua, e
         obrigar a voltar ao menu entre um e outro tornaria comparar dois
         builds uma viagem de quatro telas. */
      if (Input.pressed('swap')){
        this.cur.treeWho.i = (this.cur.treeWho.i + 1) % G.party.length;
        this.cur.tree.i = 0; this.resetArm = 0;
        VistaArvore.reset();
        Sound.sfx('cursor'); return;
      }

      // --- câmera: zoom, centralizar, arrastar ---
      if (Input.pressed('zoomIn') && VistaArvore.aplicarZoom(ZOOM_ARVORE.passo)) Sound.sfx('cursor');
      if (Input.pressed('zoomOut') && VistaArvore.aplicarZoom(-ZOOM_ARVORE.passo)) Sound.sfx('cursor');
      if (Input.pressed('centrar')){
        /* F centraliza no nó do cursor; F de novo, com ele já no meio,
           volta ao enquadramento que mostra a árvore inteira. É um
           atalho só para as duas coisas que o spec §26 pede. */
        const alvo = arv[lista[this.cur.tree.i % lista.length]];
        const jaNoMeio = alvo && Math.abs(VistaArvore.px + alvo.x) < 2
                              && Math.abs(VistaArvore.py + alvo.y) < 2;
        jaNoMeio ? VistaArvore.reset() : VistaArvore.centrarEm(alvo);
        Sound.sfx('cursor');
      }
      this.arrastarArvore(c);

      const atual = lista[this.cur.tree.i % lista.length];
      for (const [acao, dx, dy] of [['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]]){
        if (!Input.pressed(acao)) continue;
        const alvo = noVizinho(c, atual, dx, dy);
        if (alvo){
          this.cur.tree.i = lista.indexOf(alvo);
          Sound.sfx('cursor');
          this.seguirCursor(c, arv[alvo]);
        }
      }

      /* Redefinir pede duas confirmações porque devolve TODOS os pontos:
         um toque errado apagaria um build de trinta níveis. A segunda
         tecla dentro da janela é o "tem certeza" — sem página nova. */
      if (Input.pressed('reset')){
        if (this.resetArm > 0){
          const n = redefinirArvore(c);
          this.resetArm = 0; Sound.sfx('levelup');
          this.toast(`Árvore de ${c.name} redefinida. ${n} pontos devolvidos.`);
        } else {
          this.resetArm = 2.5; Sound.sfx('deny');
          this.toast('Aperte R de novo para devolver todos os pontos.');
        }
        return;
      }

      if (Input.pressed('confirm')) return void this.comprarNo(c, atual);

      /* X: remove UM nó e devolve UM custo. Quando não há nada a
         remover no cursor, X faz o que sempre fez — volta. Sem essa
         saída, o jogador de controle ficaria preso na tela. */
      if (Input.pressed('cancel')){
        const no = arv[atual];
        if (!no || !(c.tree || []).includes(atual) || (no.custo === 0 && !no.req.length)){
          Sound.sfx('cancel'); this.page = 'root'; return;
        }
        const r = removerNo(c, atual);
        if (!r.ok){ Sound.sfx('deny'); this.toast(r.why); return; }
        Sound.sfx('cursor');
        this.toast(`${no.nome} removido. ${r.devolvido} ${r.devolvido === 1 ? 'ponto devolvido' : 'pontos devolvidos'}.`);
        return;
      }
      return;
    }
    if (P === 'bestia'){
      const lista = bestiarioVisto();
      navList(this.cur.bestia, Math.max(1, lista.length));
      if (Input.pressed('cancel') || Input.pressed('confirm')){ Sound.sfx('cancel'); this.page = 'root'; }
      return;
    }
    /* --- curar fora de combate (v5.26) --- */
    if (P === 'cura'){
      const lista = curasDisponiveis();
      navList(this.cur.cura, Math.max(1, lista.length));
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'root'; return; }
      if (Input.pressed('confirm')){
        if (!lista.length){ Sound.sfx('deny'); this.toast('Ninguém do grupo sabe curar ainda.'); return; }
        const e = lista[this.cur.cura.i % lista.length];
        /* Quem atinge o grupo ou o próprio lançador não tem o que
           escolher — pedir alvo aí seria uma tela a mais por nada. */
        if (e.s.target === 'allies' || e.s.target === 'self'){
          const r = usarCuraEmCampo(e.quem, e.id, null);
          Sound.sfx(r.ok ? 'heal' : 'deny'); this.toast(r.ok ? r.text : r.why);
          return;
        }
        Sound.sfx('confirm'); this.cur.curaAlvo.i = 0; this.page = 'curaAlvo';
      }
      return;
    }
    if (P === 'curaAlvo'){
      const lista = curasDisponiveis();
      if (!lista.length){ this.page = 'root'; return; }
      const e = lista[this.cur.cura.i % lista.length];
      navList(this.cur.curaAlvo, G.party.length);
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'cura'; return; }
      if (Input.pressed('confirm')){
        const r = usarCuraEmCampo(e.quem, e.id, G.party[this.cur.curaAlvo.i]);
        Sound.sfx(r.ok ? 'heal' : 'deny'); this.toast(r.ok ? r.text : r.why);
        if (r.ok) this.page = 'cura';
      }
      return;
    }
    if (P === 'status'){
      navList(this.cur.status, G.party.length);
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'root'; }
      return;
    }
    if (P === 'quests'){
      const lista = questJournal();
      navList(this.cur.quests, Math.max(1, lista.length));
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'root'; }
      return;
    }
    if (P === 'pets'){
      const lista = petsDono();
      navList(this.cur.pets, Math.max(1, lista.length));
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'root'; return; }
      if (!lista.length) return;
      const id = lista[this.cur.pets.i % lista.length];
      if (Input.pressed('confirm')){
        /* Confirmar no pet já ativo o DISPENSA. Sem isso não haveria
           como andar sem pet, e "nenhum" é uma escolha legítima — tem
           quem prefira o combate como era antes. */
        trocarPet(G.petAtivo === id ? null : id);
        Sound.sfx('confirm');
        this.toast(G.petAtivo ? `${petForma(id, G.pets[id].lvl).name} acompanha o grupo.`
                              : 'O grupo segue sem pet.');
      }
      return;
    }
    if (P === 'form'){
      /* Slots 0..PARTY_SIZE-1 são a formação; daí em diante, o banco.
         Um índice só percorre os dois, que é o que permite mover alguém
         de um lado para o outro com uma tecla só. */
      const banco = benchNames();
      const NSLOT = PARTY_SIZE + banco.length;
      navList(this.cur.form, Math.max(1, NSLOT));
      if (Input.pressed('cancel')){
        if (this.pick !== null){ this.pick = null; Sound.sfx('cancel'); return; }
        Sound.sfx('cancel'); this.page = 'root'; return;
      }
      const slot = this.cur.form.i;
      const noBanco = slot >= PARTY_SIZE;
      const nome = noBanco ? banco[slot - PARTY_SIZE] : G.squad[slot];

      if (Input.pressed('confirm')){
        if (this.pick === null){
          if (!nome){ Sound.sfx('deny'); return; }
          this.pick = slot; Sound.sfx('confirm');
          return;
        }
        const pSlot = this.pick, pBanco = pSlot >= PARTY_SIZE;
        const pNome = pBanco ? banco[pSlot - PARTY_SIZE] : G.squad[pSlot];
        this.pick = null;
        if (!pNome){ Sound.sfx('deny'); return; }

        if (!pBanco && !noBanco){                       // reordena dentro do grupo
          if (G.squad[slot]){                           // troca as duas posições
            G.squad[pSlot] = G.squad[slot]; G.squad[slot] = pNome;
          } else {                                      // destino vazio: só move
            G.squad.splice(pSlot, 1); G.squad.push(pNome);
          }
          sanitizeSquad(); rebuildFollowers();
          Sound.sfx('confirm'); this.toast('Formação atualizada.');
        } else if (pBanco && !noBanco){                 // banco → campo
          if (entrarNoGrupo(pNome, G.squad[slot] ? slot : -1)){
            Sound.sfx('confirm'); this.toast(`${pNome} entrou.`);
          } else { Sound.sfx('deny'); this.toast('O grupo está cheio.'); }
        } else if (!pBanco && noBanco){                 // campo → banco
          if (sairDoGrupo(pNome)){ Sound.sfx('confirm'); this.toast(`${pNome} saiu.`); }
          else { Sound.sfx('deny'); this.toast('Alguém precisa ficar.'); }
        } else { Sound.sfx('cancel'); }                 // banco → banco: nada a fazer
        return;
      }

      if (Input.pressed('menu')){                       // C = entra/sai direto
        if (!nome){ Sound.sfx('deny'); return; }
        if (noBanco){
          if (entrarNoGrupo(nome)){ Sound.sfx('confirm'); this.toast(`${nome} entrou.`); }
          else { Sound.sfx('deny'); this.toast('O grupo está cheio — troque por alguém.'); }
        } else {
          if (sairDoGrupo(nome)){ Sound.sfx('confirm'); this.toast(`${nome} saiu.`); }
          else { Sound.sfx('deny'); this.toast('Alguém precisa ficar em campo.'); }
        }
        return;
      }
      if (Input.pressed('swap')){                       // TAB = definir líder
        if (noBanco || !nome){ Sound.sfx('deny'); this.toast('O líder sai do grupo.'); return; }
        G.leader = slot; rebuildFollowers();
        Sound.sfx('cursor'); this.toast('Líder: ' + leaderChar().name);
      }
      return;
    }
    if (P === 'opts'){
      const opts = this.optionsList();
      navList(this.cur.opts, opts.length);
      if (Input.pressed('cancel')){ Sound.sfx('cancel'); this.page = 'root'; return; }
      if (Input.pressed('confirm')) opts[this.cur.opts.i].run(this);
      return;
    }
  },

  optionsList(){
    return [
      {label:() => `Dificuldade: ${diff().name}`, hint:() => diff().desc,
       run:m => {
         const i = DIFF_ORDER.indexOf(G.difficulty);
         G.difficulty = DIFF_ORDER[(i + 1) % DIFF_ORDER.length];
         Sound.sfx('confirm'); m.toast(`Dificuldade: ${diff().name}`);
       }},
      /* A moldura vale para o jogo inteiro, não por tela, por isso mora
         em Opções e não em cada painel. `icone` faz a lista desenhar o
         emblema ao lado — é ele o seletor visual da moldura. */
      {label:() => `Moldura: ${molduraAtual().nome}`,
       hint:() => 'Vale para a ordem de turno, o HUD do grupo, a caixa de texto e o menu.',
       icone:() => molduraAtual().emblema,
       run:m => {
         const i = MOLDURAS.findIndex(x => x.id === G.moldura);
         G.moldura = MOLDURAS[((i < 0 ? 0 : i) + 1) % MOLDURAS.length].id;
         Sound.sfx('confirm'); m.toast(`Moldura: ${molduraAtual().nome}`);
       }},
      /* O tema fica ao lado da moldura porque as duas respondem à mesma
         pergunta — "com que cara o jogo aparece" — e porque combiná-las é
         metade da graça: moldura dourada com tema Brasa é outra coisa. */
      {label:() => `Tema: ${temaAtual().nome}`,
       hint:() => 'Gira a cor da interface inteira. Vida, mana, ouro e as cores dos elementos não mudam.',
       run:m => {
         const i = TEMAS.findIndex(x => x.id === G.tema);
         G.tema = TEMAS[((i < 0 ? 0 : i) + 1) % TEMAS.length].id;
         Sound.sfx('confirm'); m.toast(`Tema: ${temaAtual().nome}`);
       }},
      {label:() => `Relógio: ${relogioTexto()}`,
       hint:() => `${faseAtual().nome}. O tempo anda com os seus passos — ` +
                  `um dia leva ${DIA_EM_PASSOS} deles. À noite, a céu aberto, as criaturas vêm mais.`,
       run:m => m.toast(`${faseAtual().nome} · ${relogioTexto()}`)},
      {label:() => `Som: ${Sound.muted ? 'DESLIGADO' : 'ligado'}`, run:() => ModificadorCombate.alternarSom()},
      ...(Tela.suportada() ? [{
        label:() => `Tela cheia: ${Tela.ativa() ? 'ligada' : 'desligada'}`,
        hint:() => 'Recupera a altura que a barra do navegador ocupa. No celular é o que faz o jogo caber inteiro.',
        run:m => { Tela.alternar(); Sound.sfx('confirm'); },
      }] : []),
      {label:() => `Armazenamento: ${Save.available() ? 'ok' : 'indisponível'}`, run:m => m.toast('Somente leitura.')},
      {label:() => `Slot de save: ${Save.slot + 1} de ${SAVE_SLOTS}`,
       hint:() => 'Salvar num cristal escreve neste slot. Para trocar, volte ao título.',
       run:m => m.toast(`Jogando no slot ${Save.slot + 1}.`)},
      /* Voltar ao título é o caminho para TROCAR DE SAVE sem recarregar
         a página. Pede duas confirmações porque o que não foi salvo se
         perde — e o jogo só salva em cristal. */
      {label:() => this.tituloArm > 0 ? 'Voltar ao título — tem certeza?' : 'Voltar ao título',
       hint:() => 'Troca de slot de save. O que não passou por um cristal se perde.',
       run:m => {
         if (m.tituloArm > 0){
           m.tituloArm = 0; m.close(); Sound.sfx('cancel');
           FX.fade(() => { G.scene = 'TITLE'; Title.refresh(); });
         } else {
           m.tituloArm = 3; Sound.sfx('deny');
           m.toast('Aperte de novo. O que não foi salvo se perde.');
         }
       }},
      {label:() => 'Apagar este slot', run:m => {
         Save.erase(); Sound.sfx('deny');
         m.toast(`Slot ${Save.slot + 1} apagado. Volte ao título para escolher outro.`);
       }},
      {label:() => `Versão ${APP_VERSION}`, run:m => m.toast('Éter Anima — Stone Reach Academy')},
    ];
  },

  draw(){
    drawField();
    ctx.fillStyle = 'rgba(4,4,10,.66)'; ctx.fillRect(0, 0, W, H);

    /* A árvore toma a tela inteira: sem coluna de menu, sem painel da
       direita. Era a única forma de dar altura ao grafo, que é o que
       limitava a escala em todas as nove árvores (ver ARVORE_TELA). */
    if (this.page === 'skills'){
      this.drawTree();
      if (this.msgT > 0) this.drawToast();
      return;
    }

    // coluna esquerda: comandos
    panel(24, 24, 190, H - 48);
    pxText('MENU', 44, 58, {size:11, color:'#b89aff'});
    this.ROOT.forEach((o, i) => {
      const y = 100 + i * 34, on = this.page === 'root' && this.cur.root.i === i;
      if (this.page === 'root') Clique.add(34, y - 16, 170, 26, Clique.escolher(this.cur.root, i));
      const sob = this.page === 'root' && Clique.emCima(34, y - 16, 170, 26);
      if (on || sob){
        ctx.fillStyle = on ? 'rgba(120,86,200,.24)' : 'rgba(120,86,200,.12)';
        ctx.fillRect(34, y - 16, 170, 26);
      }
      pxText((on ? '▸ ' : '  ') + o.label, 44, y, {size:9, color:on ? '#fff' : '#8a7aaa'});
    });
    pxText(`${G.gold}₢`, 44, H - 74, {size:9, color:'#eaca3a'});
    pxText(fmtTime(G.playtime), 44, H - 48, {size:8, color:'#6a5a8a'});

    // painel direito
    const {x:px, w:pw, h:ph} = MENU_PAINEL;
    panel(px, MENU_PAINEL.y, pw, ph);
    const P = this.page;
    if (P === 'root' || P === 'status') this.drawStatus(px, pw);
    else if (P === 'items' || P === 'itemTarget') this.drawItems(px, pw);
    else if (P === 'quests') this.drawQuests(px, pw);
    else if (P === 'pets') this.drawPets(px, pw);
    else if (P.startsWith('equip')) this.drawEquip(px, pw);
    else if (P === 'form') this.drawForm(px, pw);
    else if (P === 'opts') this.drawOpts(px, pw);
    else if (P === 'cura' || P === 'curaAlvo') this.drawCura(px, pw);
    else if (P === 'bestia') this.drawBestiario(px, pw);

    if (this.msgT > 0) this.drawToast();
  },

  drawToast(){
    const w = Math.max(240, this.msg.length * 8 + 40);
    panel(W / 2 - w / 2, H - 74, w, 44, {accent:'#7a5aba'});
    pxText(this.msg, W / 2, H - 46, {size:9, color:'#dcd0ff', align:'center'});
  },

  /* --- ÁRVORE DE HABILIDADES ---------------------------------------
     Tela cheia. Não é gosto: em todas as nove árvores a escala era
     limitada pela altura (ver ARVORE_TELA), e altura só se ganha saindo
     do painel. A ficha do nó virou barra lateral, e é lá que o ícone de
     64 px finalmente aparece grande. */
  /* ===================== O GRIMÓRIO (v5.31) ======================
     A árvore em camadas separadas, como o spec §27 pede: fundo,
     decoração, conexões, contas, habilidades, núcleo, seleção, e por
     cima a interface — que NÃO sofre zoom. O recorte da janela do grafo
     é o que garante isso: tudo o que é desenhado com a câmera vive
     dentro do `clip`, e cabeçalho, ficha e rodapé ficam fora dele. */
  drawTree(){
    const c = G.party[this.cur.treeWho.i % G.party.length];
    const arv = arvoreDe(c);
    const lista = treeOrdem(c);
    const nos = Object.values(arv);
    const atualId = lista[this.cur.tree.i % lista.length];
    const E = ELEM[c.element];
    const idt = identidadeArvore(c.name, c.element);
    const tem = id => (c.tree || []).includes(id);
    const livres = pontosLivres(c), gastos = pontosGastos(c);
    const F = ARVORE_TELA.ficha, GR = ARVORE_TELA.grafo;
    const PAL = idt.paleta || [E.glow, E.main, '#2a2438'];
    /* A cor da ÁRVORE vem da paleta do personagem, não do elemento de
       combate. É o que dá ao Madao um grimório de cinzas em vez de um
       de fogo sem precisar inventar um elemento novo em ELEM — e é o
       que faz duas árvores do mesmo elemento (Gabriel, Abel e Amanda
       são os três de Fogo) não saírem idênticas. */
    const COR = {main:PAL[1], glow:PAL[0], icon:idt.icone || E.icon};

    ctx.fillStyle = '#08070f'; ctx.fillRect(0, 0, W, H);

    /* ---------- camada 1: pergaminho e fundo elemental -------------
       O fundo é do ELEMENTO, mas a moldura de pergaminho é da PALETA do
       personagem — é o que faz a árvore do Madao parecer cinza-marrom e
       a da Ophelia azul-gelo mesmo compartilhando o fundo de outro. */
    {
      const fundo = spriteImages[idt.fundo || ('tree_bg_' + c.element)];
      if (fundo && (fundo.complete ?? true) && (fundo.naturalWidth || fundo.width)){
        ctx.save();
        ctx.globalAlpha = 0.52;
        const escala = Math.max(W / fundo.naturalWidth, H / fundo.naturalHeight);
        const fw = fundo.naturalWidth * escala, fh = fundo.naturalHeight * escala;
        ctx.drawImage(fundo, (W - fw) / 2, (H - fh) / 2, fw, fh);
        ctx.restore();
      } else {
        /* Sem arte de fundo, o pergaminho é procedural: um halo da cor
           do personagem no meio do grafo. Nunca fica só preto liso. */
        const g = ctx.createRadialGradient(GR.x + GR.w / 2, GR.y + GR.h / 2, 20,
                                           GR.x + GR.w / 2, GR.y + GR.h / 2, GR.w * 0.7);
        g.addColorStop(0, PAL[2]); g.addColorStop(1, '#08070f');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    }

    const geo = geometriaArvore(c, GR, VistaArvore);
    const {sx, sy} = geo;

    /* ---------- camada 2: a janela do grafo, recortada -------------
       Daqui até o `restore` tudo obedece à câmera. */
    ctx.save();
    ctx.beginPath(); ctx.rect(GR.x, GR.y, GR.w, GR.h); ctx.clip();

    /* Decoração: anéis concêntricos marcando os patamares da árvore.
       Não é enfeite — são eles que dizem, de relance, que a coroa de
       convergências está num nível acima das pontas dos caminhos. */
    {
      const cx0 = sx({x:0, y:0}), cy0 = sy({x:0, y:0});
      ctx.save();
      ctx.strokeStyle = 'rgba(150,135,200,.10)'; ctx.lineWidth = 1;
      for (const r of [0.34, 0.62, 0.9, 1.2]){
        ctx.beginPath();
        ctx.arc(cx0, cy0, r * 250 * geo.esc, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }

    /* Conexões. Três estados, como o spec §16 pede: ativa (os dois
       lados comprados), disponível (a origem comprada, o destino ao
       alcance) e bloqueada. Convergência tem DOIS requisitos, e é o
       traço duplo chegando nela que conta essa história sem texto. */
    ctx.save();
    for (const n of nos){
      for (const r of n.req){
        const p = arv[r]; if (!p) continue;
        const ativa = tem(n.id) && tem(r);
        const viva = !ativa && tem(r);
        ctx.strokeStyle = ativa ? COR.main : viva ? 'rgba(180,165,230,.55)' : 'rgba(130,120,165,.22)';
        ctx.lineWidth = ativa ? 2.6 : viva ? 2 : 1.4;
        if (ativa){ ctx.shadowColor = COR.glow; ctx.shadowBlur = 6; }
        ctx.beginPath(); ctx.moveTo(sx(p), sy(p)); ctx.lineTo(sx(n), sy(n)); ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();

    /* Área de clique de cada nó, registrada ANTES do desenho para o
       realce de passagem sair certo no mesmo quadro. Clicar num nó que
       não é o do cursor move o cursor; clicar no que já é o do cursor
       aprende. Dois toques para gastar ponto é de propósito — ponto de
       alma não se devolve um a um. */
    for (const n of nos){
      const r = Math.max(10, geo.raio(n) + 3);
      const x = sx(n), y = sy(n);
      if (x < GR.x - r || x > GR.x + GR.w + r || y < GR.y - r || y > GR.y + GR.h + r) continue;
      Clique.add(x - r, y - r, r * 2, r * 2, () => {
        const k = lista.indexOf(n.id);
        if (k !== this.cur.tree.i){ this.cur.tree.i = k; Sound.sfx('cursor'); return; }
        this.comprarNo(c, n.id);
      });
    }

    /* Nós, em ordem de importância crescente: a conta desenha primeiro e
       o núcleo por último, para que um nó grande nunca fique atrás de
       uma bolinha. É a ordem de TIPOS_NO, lida ao contrário. */
    const ordenados = nos.slice().sort((a, b) =>
      ((TIPOS_NO[b.tipo] || {ordem:9}).ordem) - ((TIPOS_NO[a.tipo] || {ordem:9}).ordem));

    for (const n of ordenados){
      const x = sx(n), y = sy(n);
      const r = geo.raio(n);
      if (x < GR.x - r * 3 || x > GR.x + GR.w + r * 3 ||
          y < GR.y - r * 3 || y > GR.y + GR.h + r * 3) continue;
      const meu = tem(n.id);
      const pode = !meu && podeAprender(c, n.id).ok;
      const alvo = n.id === atualId;
      const sob = Clique.emCima(x - r - 3, y - r - 3, (r + 3) * 2, (r + 3) * 2);
      const grande = n.tipo === 'core' || n.tipo === 'ultimate' || n.tipo === 'convergencia';

      /* Soquete: o buraco onde o ícone se encaixa. O de quem NÃO alcança
         é mais claro que o de quem já tem, ao contrário do que a
         intuição pede — é o que dá silhueta a um ícone escuro desenhado
         a 45% de opacidade. Com soquete preto, os ícones de Trevas
         sumiam por completo. */
      ctx.save();
      if (meu){ ctx.shadowColor = COR.glow; ctx.shadowBlur = grande ? 20 : 12; }
      ctx.fillStyle = meu ? '#0e0a18' : (pode ? '#221c3c' : '#1e1a30');
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      const ic = n.tipo === 'skill' ? arteUI('hab_' + n.skill) : null;
      if (ic){
        ctx.save();
        ctx.beginPath(); ctx.arc(x, y, r - 1, 0, Math.PI * 2); ctx.clip();
        ctx.globalAlpha = meu ? 1 : (pode ? 0.82 : 0.45);
        ctx.drawImage(ic, x - r, y - r, r * 2, r * 2);
        ctx.restore();
      } else if (n.tipo === 'conta'){
        /* Conta não tem ícone: é ponto de atributo. Ganha a cor do
           atributo, que é o que as diferencia entre si — sem isso são
           trinta bolinhas iguais em que ATK e HP se confundem. */
        ctx.fillStyle = meu ? (COR_STAT[n.stat] || COR.main)
                            : (pode ? '#4a4468' : '#241f36');
        ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, Math.PI * 2); ctx.fill();
      } else {
        /* Núcleo, apocalipse, convergência, passiva e mecânica: glifo
           desenhado, não círculo genérico. Cada tipo tem o seu, e é o
           desenho que diz o que aquilo é antes de o jogador ler nada. */
        desenharGlifoNo(n, x, y, r, meu ? PAL[0] : pode ? PAL[1] : '#4a4468', COR);
      }

      // anel de estado: é ele que diz tenho / posso / bloqueado
      ctx.strokeStyle = meu ? COR.glow : (pode ? '#9a8aca' : '#3a3450');
      ctx.lineWidth = meu ? (grande ? 3.2 : 2.5) : 2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      /* Segundo anel nos nós de peso, para a hierarquia do spec §23
         existir sem depender do raio: apocalipse e núcleo têm coroa. */
      if (grande){
        ctx.strokeStyle = meu ? PAL[0] : 'rgba(140,125,185,.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke();
      }

      if (sob && !alvo){
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2); ctx.stroke();
      }
      if (alvo){
        ctx.save();
        ctx.strokeStyle = '#ffe44a'; ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.lineDashOffset = -(Date.now() / 90) % 7;
        ctx.beginPath(); ctx.arc(x, y, r + 6, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      /* Bolinha de custo em quem dá para comprar AGORA. É a única marca
         que responde à pergunta que o jogador faz ao abrir a árvore:
         onde é que eu posso gastar? */
      if (pode && livres >= n.custo && n.custo > 0){
        ctx.fillStyle = '#ffe44a';
        ctx.beginPath(); ctx.arc(x + r - 1, y - r + 1, 3.4, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();          // fim do recorte: daqui para baixo, sem zoom

    /* ---------- camada 3: cabeçalho -------------------------------- */
    const rw = 42, rh = 46, rx = 24, ry = 22;
    const temRosto = desenharRetrato(c, rx, ry, rw, rh);
    if (temRosto){
      ctx.strokeStyle = COR.main; ctx.lineWidth = 1;
      ctx.strokeRect(rx + .5, ry + .5, rw - 1, rh - 1);
    }
    const tx = temRosto ? rx + rw + 12 : 24;
    pxText(c.name, tx, 40, {size:12, color:COR.glow});
    uiText(`${COR.icon} ${idt.atributo} · Nv${c.lvl} · ${c.role}`, tx, 58,
           {size:12, color:'#9a8ab0'});
    uiText(`Variação: ${idt.variacao}`, tx, 74, {size:11, color:'#6a5a8a'});

    /* Pontos de Alma: DISPONÍVEIS e INVESTIDOS, sem teto.
       O `x/50` que ficava aqui era mentira — não existe nível máximo
       (spec §7), então também não existe total final contra o qual medir
       o investido. O que o jogador precisa saber é quanto tem na mão. */
    {
      const bw = 214, bx0 = W - bw - 24;
      panel(bx0, 18, bw, 58, {accent:livres > 0 ? '#7a5aba' : '#3a3450'});
      uiText('PONTOS DE ALMA', bx0 + 14, 38, {size:11, color:'#7a6a9a'});
      pxText(String(livres), bx0 + bw - 16, 42,
             {size:14, color:livres > 0 ? '#ffe44a' : '#5a4a7a', align:'right'});
      uiText('INVESTIDOS', bx0 + 14, 62, {size:11, color:'#7a6a9a'});
      uiText(String(gastos), bx0 + bw - 16, 62, {size:11, color:'#b0a4c8', align:'right'});
    }

    /* Os três caminhos, com o nome QUE ESTE PERSONAGEM dá a eles. */
    {
      const FX = ARVORE_TELA.faixa, larg = Math.floor(FX.w / 3);
      Object.entries(RAMOS).forEach(([ramo, cfg], i) => {
        const doRamo = nos.filter(n => n.ramo === ramo);
        if (!doRamo.length) return;
        const compradas = doRamo.filter(n => tem(n.id)).length;
        const frac = compradas / doRamo.length;
        const x0 = FX.x + i * larg, bwid = larg - 22;
        const nome = (idt.caminhos && idt.caminhos[ramo]) || cfg.nome;
        uiText(nome.replace(/^Caminho d[eoa]s? /, '').replace(/^Fusão: /, ''),
               x0, FX.y + 9, {size:11, color:compradas > 0 ? COR.glow : '#6a5a8a'});
        uiText(`${compradas}/${doRamo.length}`, x0 + bwid, FX.y + 9,
               {size:11, color:'#8a7aa8', align:'right'});
        ctx.fillStyle = 'rgba(10,8,18,.8)';
        ctx.fillRect(x0, FX.y + 16, bwid, 6);
        ctx.fillStyle = frac > 0 ? COR.main : '#3a3450';
        ctx.fillRect(x0, FX.y + 16, Math.round(bwid * frac), 6);
        ctx.strokeStyle = 'rgba(150,140,190,.4)'; ctx.lineWidth = 1;
        ctx.strokeRect(x0 + .5, FX.y + 16.5, bwid - 1, 5);
      });
    }

    /* Moldura da janela do grafo e o indicador de zoom. Sem a moldura, o
       recorte era invisível e um nó cortado pela borda parecia um bug. */
    ctx.strokeStyle = 'rgba(150,135,200,.35)'; ctx.lineWidth = 1;
    ctx.strokeRect(GR.x + .5, GR.y + .5, GR.w - 1, GR.h - 1);
    if (Math.abs(VistaArvore.zoom - ZOOM_ARVORE.padrao) > 0.001 ||
        VistaArvore.px || VistaArvore.py){
      uiText(`${VistaArvore.zoom.toFixed(2)}x`, GR.x + GR.w - 8, GR.y + 16,
             {size:11, color:'#8a7aa8', align:'right'});
    }

    /* ---------- camada 4: a ficha do nó ---------------------------- */
    this.drawFichaNo(c, arv, atualId, F, COR, idt);

    /* ---------- camada 5: rodapé de comandos ----------------------- */
    {
      const R = ARVORE_TELA.rodape;
      panel(R.x, R.y, R.w, R.h, {accent:this.resetArm > 0 ? '#8a4a2a' : '#3a3450'});
      if (this.resetArm > 0){
        uiText('R DE NOVO DEVOLVE TODOS OS PONTOS DESTE PERSONAGEM',
               R.x + R.w / 2, R.y + 29, {size:12, color:'#ffa06a', align:'center'});
      } else {
        const cmds = [['Z', 'aprender'], ['X', 'remover'], ['TAB', 'trocar'],
                      ['+ -', 'zoom'], ['setas', 'mover'], ['F', 'centralizar'],
                      ['R', 'redefinir'], ['ESC', 'sair']];
        /* Espaçamento medido, não fixo: com oito comandos e larguras
           diferentes, uma coluna fixa deixava buracos de 40 px entre uns
           e encavalava outros. */
        const larguras = cmds.map(([k, d]) => 22 + k.length * 7 + d.length * 6);
        const total = larguras.reduce((a, b) => a + b, 0);
        let x = R.x + (R.w - total) / 2;
        cmds.forEach(([k, d], i) => {
          uiText(k, x, R.y + 29, {size:12, color:'#ffe44a'});
          uiText(d, x + 8 + k.length * 7, R.y + 29, {size:12, color:'#8a7aa8'});
          x += larguras[i];
        });
      }
    }
  },

  /** A ficha do nó selecionado — spec §20, todos os campos que ele pede.
   *  Separada de `drawTree` porque é a única parte da tela que muda a
   *  cada movimento do cursor, e porque ela é longa: com ícone, estado,
   *  tipo, custo, caminho, descrição, efeito, requisitos e o que vem
   *  depois, `drawTree` tinha virado uma função de 400 linhas. */
  drawFichaNo(c, arv, atualId, F, E, idt){
    panel(F.x, F.y, F.w, F.h, {accent:'#4a3a6a'});
    const no = arv[atualId];
    if (!no) return;
    const tem = id => (c.tree || []).includes(id);
    const meu = tem(no.id);
    const chk = podeAprender(c, no.id);
    const tipo = TIPOS_NO[no.tipo] || {rotulo:'Nó'};
    const ich = no.tipo === 'skill' ? arteUI('hab_' + no.skill) : null;
    const PAL = idt.paleta || [E.glow, E.main, '#2a2438'];
    let y = F.y + 16;

    if (ich){
      ctx.save();
      ctx.globalAlpha = meu ? 1 : (chk.ok ? 0.85 : 0.5);
      ctx.drawImage(ich, F.x + (F.w - 84) / 2, y, 84, 84);
      ctx.restore();
      y += 92;
    } else {
      /* Sem arte: o mesmo glifo que o nó desenha no grafo, ampliado. É o
         que impede a ficha de mostrar um círculo branco e mudo enquanto
         o grafo mostra um corvo. */
      const cx0 = F.x + F.w / 2, cy0 = y + 40;
      ctx.fillStyle = '#171328';
      ctx.beginPath(); ctx.arc(cx0, cy0, 36, 0, Math.PI * 2); ctx.fill();
      if (no.tipo === 'conta' && no.stat){
        ctx.strokeStyle = COR_STAT[no.stat] || E.main; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx0, cy0, 36, 0, Math.PI * 2); ctx.stroke();
        pxText(CONTA_BONUS[no.stat] ? CONTA_BONUS[no.stat].rotulo : '+', cx0, cy0 - 4,
               {size:8, color:COR_STAT[no.stat] || '#dcd0ff', align:'center'});
        pxText('+' + (no.valor || 0), cx0, cy0 + 16,
               {size:9, color:'#dcd0ff', align:'center'});
      } else {
        desenharGlifoNo(no, cx0, cy0, 30, meu ? PAL[0] : PAL[1], E);
        ctx.strokeStyle = meu ? E.glow : '#4a3a6a'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx0, cy0, 36, 0, Math.PI * 2); ctx.stroke();
      }
      y += 88;
    }

    wrapPx(no.nome, F.w - 24, 9).slice(0, 3).forEach(ln => {
      pxText(ln, F.x + F.w / 2, y, {size:9, color:'#dcd0ff', align:'center'});
      y += 16;
    });
    y += 4;

    // estado · tipo · custo, na mesma linha de cima para baixo
    const st = meu ? 'APRENDIDO' : chk.ok ? 'DISPONÍVEL' : 'BLOQUEADO';
    const stc = meu ? '#7ada7a' : chk.ok ? '#ffe44a' : '#8a6a6a';
    pxText(st, F.x + F.w / 2, y, {size:8, color:stc, align:'center'});
    y += 20;
    uiText(tipo.rotulo, F.x + F.w / 2, y, {size:11, color:'#6a5a8a', align:'center'});
    y += 16;
    uiText(no.custo > 0 ? `Custo: ${no.custo} ${no.custo === 1 ? 'ponto' : 'pontos'}`
                        : 'Não custa ponto',
           F.x + F.w / 2, y, {size:11, color:no.custo > 0 ? '#b0a4c8' : '#7ada7a', align:'center'});
    y += 18;

    // caminho a que pertence, com o nome do personagem
    if (no.ramo && idt.caminhos && idt.caminhos[no.ramo]){
      wrapUI(idt.caminhos[no.ramo], F.w - 28, 11).forEach(ln => {
        uiText(ln, F.x + F.w / 2, y, {size:11, color:PAL[0], align:'center'});
        y += 14;
      });
      y += 4;
    }

    ctx.strokeStyle = 'rgba(120,100,170,.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(F.x + 14, y); ctx.lineTo(F.x + F.w - 14, y); ctx.stroke();
    y += 16;

    const linha = (txt, cor, tam = 12) => {
      if (y > F.y + F.h - 16) return false;
      wrapUI(txt, F.w - 28, tam).forEach(ln => {
        if (y > F.y + F.h - 14) return;
        uiText(ln, F.x + 14, y, {size:tam, color:cor});
        y += tam + 3;
      });
      return true;
    };

    linha(no.desc || '', '#a898c0');

    /* Nível de origem: informativo, não requisito. A árvore não trava
       mais por nível (spec §7) — mas saber que a habilidade era de
       nível 25 diz ao jogador onde ela cai na curva do jogo. */
    if (no.nivelAntigo > 1){ y += 4; linha(`Aparece por volta do Nv ${no.nivelAntigo}.`, '#6a5a8a', 11); }

    // requisitos, um por linha, marcados com o que já se tem
    if (no.req.length){
      y += 6;
      linha('REQUISITOS', '#7a6a9a', 11);
      for (const r of no.req){
        const p = arv[r]; if (!p) continue;
        linha(`${tem(r) ? '●' : '○'} ${p.nome}`, tem(r) ? '#7ada7a' : '#8a7aa8', 11);
      }
    }

    // o que este nó destrava — o "próximos desbloqueios" do spec §20
    {
      const abre = Object.values(arv).filter(n => n.req.includes(no.id));
      if (abre.length){
        y += 6;
        linha('ABRE CAMINHO PARA', '#7a6a9a', 11);
        abre.slice(0, 3).forEach(n => linha('› ' + n.nome, '#8a7aa8', 11));
        if (abre.length > 3) linha(`› e mais ${abre.length - 3}`, '#6a5a8a', 11);
      }
    }

    /* O motivo de estar bloqueado, escrito. Antes o jogador via
       "BLOQUEADO" e tinha de adivinhar se faltava ponto ou faltava o
       nó anterior. */
    if (!meu && !chk.ok && chk.why){ y += 6; linha(chk.why, '#c08a6a', 11); }
    /* E, quando já é dele, o que acontece se tentar tirar. */
    if (meu){
      const dep = dependentesDe(c, no.id);
      if (dep.length){ y += 6; linha(`X não remove: ${dep.length} ${dep.length === 1 ? 'nó depende' : 'nós dependem'} deste.`, '#c08a6a', 11); }
      else if (no.custo > 0){ y += 6; linha(`X devolve ${no.custo}.`, '#7a9ada', 11); }
    }
  },

  /** Arrastar o grafo com o mouse e dar zoom com a roda.
   *
   *  Só dentro da janela do grafo, que é o que o spec §26 exige: passar
   *  o ponteiro sobre a ficha ou o rodapé não move a árvore. O arraste é
   *  medido em coordenada de ÁRVORE e não de tela, senão a mesma
   *  distância de mouse moveria mais ou menos conforme o zoom. */
  arrastarArvore(c){
    const GR = ARVORE_TELA.grafo;
    const dentro = Clique.emCima(GR.x, GR.y, GR.w, GR.h);
    if (dentro && Clique.roda)
      VistaArvore.aplicarZoom(Clique.roda < 0 ? ZOOM_ARVORE.passo : -ZOOM_ARVORE.passo);

    if (!dentro || !Clique.segurando){ this._arr = null; return; }
    const geo = geometriaArvore(c, GR, VistaArvore);
    const p = geo.inv(Clique.x, Clique.y);
    if (this._arr){
      VistaArvore.px += p.x - this._arr.x;
      VistaArvore.py += p.y - this._arr.y;
    } else {
      this._arr = p;
    }
  },

  /** Mantém o nó do cursor visível ao andar com as setas.
   *
   *  Sem isto, dar zoom e depois andar com o teclado levava o cursor
   *  para fora da janela e o jogador ficava movendo uma seleção que não
   *  via. Só empurra a câmera quando o nó SAIU — seguir sempre faria a
   *  árvore inteira deslizar a cada tecla, que enjoa. */
  seguirCursor(c, no){
    if (!no) return;
    const GR = ARVORE_TELA.grafo;
    const geo = geometriaArvore(c, GR, VistaArvore);
    const x = geo.sx(no), y = geo.sy(no), m = 40;
    if (x >= GR.x + m && x <= GR.x + GR.w - m &&
        y >= GR.y + m && y <= GR.y + GR.h - m) return;
    VistaArvore.centrarEm(no);
  },

  /** Comprar um nó, com o barulho e o aviso certos. Mora aqui porque o
   *  clique do mouse e a tecla Z faziam a mesma coisa em dois lugares —
   *  e um deles não tocava o som. */
  comprarNo(c, id){
    const no = arvoreDe(c)[id];
    const r = aprenderNo(c, id);
    if (!r.ok){ Sound.sfx('deny'); this.toast(r.why); return false; }
    Sound.sfx('levelup');
    this.toast(no.tipo === 'skill' ? `${c.name} aprendeu ${no.nome}!`
                                   : `${c.name}: ${no.nome}`);
    return true;
  },

  drawStatus(px, pw){
    const sel = this.cur.status.i;
    G.party.forEach((c, i) => {
      const y = 52 + i * 92, on = (this.page !== 'root') && sel === i;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.16)'; ctx.fillRect(px + 10, y - 22, pw - 20, 86); }
      const E = ELEM[c.element];
      drawActor({sheet:c.sheet, dir:'down', moving:false, animT:0, color:E.main},
                px + 44, y + 52, {scale:.78, alpha:c.hp > 0 ? 1 : .4});
      pxText(`${c.name}`, px + 84, y, {size:10, color:E.glow});
      pxText(`Nv${c.lvl} ${c.role}`, px + 84, y + 18, {size:7, color:'#7a6a9a'});
      pxText(`${E.icon} ${E.name}`, px + 250, y, {size:7, color:E.main});
      bar(px + 84, y + 26, 150, 8, c.hp / c.maxHp, '#3a8a3a', '#5aba5a');
      pxText(`${c.hp}/${c.maxHp}`, px + 242, y + 34, {size:7, color:'#9ada9a'});
      bar(px + 84, y + 38, 150, 6, c.mp / c.maxMp, '#3a5a9a', '#5a8afa');
      pxText(`${c.mp}/${c.maxMp}`, px + 242, y + 45, {size:7, color:'#8ab0fa'});
      const need = expToNext(c.lvl);
      bar(px + 84, y + 50, 150, 4, c.exp / need, '#7a6a2a', '#eaca3a');
      pxText(`EXP ${c.exp}/${need}`, px + 242, y + 55, {size:6, color:'#bba85a'});
      pxText(`ATK ${c.atk}  DEF ${c.def}  SPD ${c.spd}`, px + 320, y + 20, {size:7, color:'#8a8a9a'});
      // ressonância
      bar(px + 320, y + 30, 110, 6, (c.reso || 0) / 100, '#6a3a9a', c.reso >= 100 ? '#ffe44a' : '#b89aff');
      pxText(c.reso >= 100 ? 'RESSONÂNCIA PRONTA' : `Ressonância ${Math.floor(c.reso || 0)}%`,
             px + 320, y + 48, {size:6, color:c.reso >= 100 ? '#ffe44a' : '#7a6a9a'});
      if (c.ail.length)
        drawAilments(c.ail, px + 320, y + 58, {lado:14, color:'#da6a6a'});
    });
  },

  drawEquip(px, pw){
    const slots = Object.keys(SLOTS);
    const c = G.party[this.cur.equipWho.i];
    pxText('EQUIPAR', px + 20, 52, {size:10, color:'#b89aff'});
    // coluna de personagens
    G.party.forEach((p, i) => {
      const y = 88 + i * 30, on = this.page === 'equip' && this.cur.equipWho.i === i;
      const mine = p === c;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.22)'; ctx.fillRect(px + 12, y - 16, 150, 26); }
      pxText((mine ? '▸ ' : '  ') + p.name, px + 20, y,
             {size:8, color:mine ? ELEM[p.element].glow : '#8a7aaa'});
    });
    // slots do personagem escolhido
    const sx = px + 180;
    slots.forEach((slot, i) => {
      const y = 88 + i * 34, on = (this.page === 'equipSlot' || this.page === 'equipPick')
                                  && this.cur.equipSlot.i === i;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.22)'; ctx.fillRect(sx - 8, y - 18, pw - 200, 30); }
      pxText(SLOTS[slot], sx, y - 4, {size:7, color:'#6a5a8a'});
      const id = c.gear[slot];
      pxText(id ? ITEMS[id].name : '— vazio —', sx + 92, y - 4,
             {size:8, color:id ? '#d0c8e0' : '#5a4a6a'});
    });
    // atributos resultantes
    const by = 210;
    pxText(`ATK ${c.atk}   DEF ${c.def}   SPD ${c.spd}`, sx, by, {size:8, color:'#9a9aae'});
    pxText(`HP ${c.maxHp}   MP ${c.maxMp}`, sx, by + 20, {size:8, color:'#9a9aae'});
    const we = weaponElem(c);
    pxText(`Ataque básico: ${ELEM[we].name}`, sx, by + 40,
           {size:8, color:ELEM[we].glow});

    if (this.page === 'equipPick'){
      const slot = slots[this.cur.equipSlot.i];
      const opts = Bag.list().filter(id => ITEMS[id].kind === 'equip' && ITEMS[id].slot === slot);
      const bw = 400, bx = W / 2 - bw / 2, byy = 250, n = opts.length + 1;
      panel(bx, byy, bw, n * 30 + 54, {accent:'#7a5aba'});
      pxText(`${SLOTS[slot]} de ${c.name}`, bx + 20, byy + 30, {size:9, color:'#b89aff'});
      const linhas = ['— retirar —', ...opts.map(id => ITEMS[id].name)];
      linhas.forEach((txt, i) => {
        const y = byy + 62 + i * 30, on = this.cur.equipPick.i === i;
        if (on){ ctx.fillStyle = 'rgba(120,86,200,.24)'; ctx.fillRect(bx + 10, y - 18, bw - 20, 28); }
        /* Esta é A tela em que o ícone mais serve — é aqui que se escolhe
           a arma. A primeira linha é "— retirar —", que não é item e por
           isso não ganha marca; as demais recuam para abrir espaço. */
        const itLinha = i > 0 ? ITEMS[opts[i - 1]] : null;
        if (itLinha) drawItemMark(itLinha, bx + 20, y - 4);
        pxText((on ? '▸ ' : '  ') + txt, bx + (itLinha ? 46 : 24), y,
               {size:8, color:on ? '#fff' : '#a89ac0'});
        if (i > 0){
          const e = ITEMS[opts[i - 1]].equip;
          /* Só entra o que é NÚMERO: `elem` é string e `resist` é objeto,
             e os dois viravam "[object Object]" na linha de resumo. */
          const resumo = Object.entries(e).filter(([, v]) => typeof v === 'number')
            .map(([k, v]) => `${STAT_LABEL[k] || k.toUpperCase()}${v > 0 ? '+' : ''}${v}`).join(' ');
          pxText(resumo, bx + bw - 24, y, {size:7, color:'#7ada7a', align:'right'});
        }
      });
    } else {
      uiText(this.page === 'equip'
               ? 'Z abre · Tab auto-equipa · C auto-equipa o grupo · X volta'
               : 'Z escolhe · Tab auto-equipa · C retira direto · X volta',
             px + 20, H - 56, {size:12, color:'#5a4a7a'});
    }
  },

  drawItems(px, pw){
    const list = Bag.list().filter(id => ITEMS[id].kind !== 'equip');
    pxText('ITENS', px + 20, 52, {size:10, color:'#b89aff'});
    if (!list.length){ uiText('A bolsa está vazia.', px + 20, 90, {color:'#6a5a8a'}); return; }
    /* Janela rolante: com o catálogo da v4.8 a bolsa passa de 15 linhas
       com facilidade, e sem isso o excedente era desenhado fora da
       tela — selecionável e invisível. */
    const VIS = 15;
    const idx = clamp(this.cur.items.i, 0, list.length - 1);
    const ini = clamp(idx - Math.floor(VIS / 2), 0, Math.max(0, list.length - VIS));
    list.slice(ini, ini + VIS).forEach((id, k) => {
      const i = ini + k, it = ITEMS[id], y = 84 + k * 30, on = idx === i;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.2)'; ctx.fillRect(px + 12, y - 16, pw - 24, 26); }
      drawItemMark(it, px + 16, y - 4);
      pxText(it.name, px + 42, y, {size:8, color:on ? '#fff' : '#a89ac0'});
      pxText('×' + Bag.count(id), px + pw - 24, y, {size:8, color:'#8a7aaa', align:'right'});
    });
    if (list.length > VIS)
      pxText(`${idx + 1}/${list.length} ${ini > 0 ? '▲' : ' '}${ini + VIS < list.length ? '▼' : ' '}`,
             px + pw - 24, 62, {size:7, color:'#6a5a8a', align:'right'});
    const cur = ITEMS[list[clamp(this.cur.items.i, 0, list.length - 1)]];
    if (cur) uiText(cur.desc, px + 20, H - 60, {size:12, color:'#7a6a9a'});

    if (this.page === 'itemTarget'){
      const bw = 300, bx = W / 2 - bw / 2, by = 120;
      panel(bx, by, bw, G.party.length * 40 + 60, {accent:'#7a5aba'});
      pxText('Usar em quem?', bx + 20, by + 32, {size:9, color:'#b89aff'});
      G.party.forEach((c, i) => {
        const y = by + 64 + i * 40, on = this.cur.target.i === i;
        if (on){ ctx.fillStyle = 'rgba(120,86,200,.24)'; ctx.fillRect(bx + 10, y - 18, bw - 20, 32); }
        pxText(c.name, bx + 24, y, {size:8, color:c.hp > 0 ? ELEM[c.element].glow : '#8a5a5a'});
        pxText(`${c.hp}/${c.maxHp}`, bx + 170, y, {size:7, color:'#9ada9a'});
        pxText(`${c.mp}/${c.maxMp}`, bx + 240, y, {size:7, color:'#8ab0fa'});
      });
    }
  },

  /* CURAR (v5.26): uma lista só, do grupo inteiro, porque em campo a
     pergunta é "quem consegue me curar agora", não "o que a Ophelia
     sabe". Cada linha já mostra o preço em MP e se dá para pagar. */
  drawCura(px, pw){
    const lista = curasDisponiveis();
    pxText('CURAR', px + 20, 52, {size:10, color:'#b89aff'});
    // faixa com o estado do grupo — é o que decide o que usar
    G.party.forEach((c, i) => {
      const x = px + 20 + i * 132, vivo = c.hp > 0;
      pxText(c.name, x, 84, {size:7, color:vivo ? ELEM[c.element].glow : '#8a5a5a'});
      pxText(vivo ? `${c.hp}/${c.maxHp}` : 'CAÍDO', x, 100,
             {size:7, color:vivo ? (c.hp < c.maxHp / 3 ? '#da6a6a' : '#9ada9a') : '#da6a6a'});
      pxText(`MP ${c.mp}/${c.maxMp}`, x, 114, {size:7, color:'#8ab0fa'});
    });
    if (!lista.length){
      uiText('Ninguém do grupo aprendeu cura ou reanimação ainda.', px + 20, 156, {color:'#6a5a8a'});
      return;
    }
    const VIS = 11;
    const idx = clamp(this.cur.cura.i, 0, lista.length - 1);
    const ini = clamp(idx - Math.floor(VIS / 2), 0, Math.max(0, lista.length - VIS));
    lista.slice(ini, ini + VIS).forEach((e, k) => {
      const i = ini + k, y = 156 + k * 30, on = idx === i;
      const pode = e.quem.mp >= e.custo;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.2)'; ctx.fillRect(px + 12, y - 16, pw - 24, 26); }
      pxText(e.quem.name, px + 20, y, {size:7, color:'#7a6a9a'});
      pxText(e.s.name, px + 110, y, {size:8, color:!pode ? '#6a5a6a' : on ? '#fff' : '#a89ac0'});
      pxText(e.s.type === 'revive' ? 'reanima' : ALVO_CURA[e.s.target] || 'aliado',
             px + 300, y, {size:7, color:'#7a6a9a'});
      pxText(`${e.custo} MP`, px + pw - 24, y,
             {size:7, color:pode ? '#8ab0fa' : '#8a5a5a', align:'right'});
    });
    if (lista.length > VIS)
      pxText(`${idx + 1}/${lista.length} ${ini > 0 ? '▲' : ' '}${ini + VIS < lista.length ? '▼' : ' '}`,
             px + pw - 24, 132, {size:7, color:'#6a5a8a', align:'right'});
    uiText(lista[idx].s.desc || '', px + 20, H - 60, {size:12, color:'#7a6a9a'});

    if (this.page === 'curaAlvo'){
      const bw = 300, bx = W / 2 - bw / 2, by = 150;
      panel(bx, by, bw, G.party.length * 40 + 60, {accent:'#7a5aba'});
      pxText('Em quem?', bx + 20, by + 32, {size:9, color:'#b89aff'});
      G.party.forEach((c, i) => {
        const y = by + 64 + i * 40, on = this.cur.curaAlvo.i === i;
        if (on){ ctx.fillStyle = 'rgba(120,86,200,.24)'; ctx.fillRect(bx + 10, y - 18, bw - 20, 32); }
        pxText(c.name, bx + 24, y, {size:8, color:c.hp > 0 ? ELEM[c.element].glow : '#8a5a5a'});
        pxText(c.hp > 0 ? `${c.hp}/${c.maxHp}` : 'caído', bx + 170, y,
               {size:7, color:c.hp > 0 ? '#9ada9a' : '#da6a6a'});
      });
    }
  },

  /* BESTIÁRIO (v5.29).
   *
   * A ficha revela por etapas, e as etapas são o próprio ato de caçar:
   * quem viu uma vez lê um palpite, quem matou vinte lê o número exato.
   * Esconder no começo não é economia de tela — é o que faz o contador
   * PARECER descoberta em vez de planilha. */
  drawBestiario(px, pw){
    const lista = bestiarioVisto();
    pxText('BESTIÁRIO', px + 20, 52, {size:10, color:'#b89aff'});
    const totais = `${lista.length}/${Object.keys(BESTIARY).length} registrados`;
    pxText(totais, px + pw - 24, 52, {size:7, color:'#6a5a8a', align:'right'});
    if (!lista.length){
      uiText('Nenhuma criatura encontrada ainda.', px + 20, 96, {color:'#6a5a8a'});
      return;
    }
    const VIS = 14;
    const idx = clamp(this.cur.bestia.i, 0, lista.length - 1);
    const ini = clamp(idx - Math.floor(VIS / 2), 0, Math.max(0, lista.length - VIS));
    const colw = 230;
    lista.slice(ini, ini + VIS).forEach((id, k) => {
      const i = ini + k, d = BESTIARY[id], y = 86 + k * 26, on = idx === i;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.2)'; ctx.fillRect(px + 12, y - 15, colw, 24); }
      const t = dropMaximo(id);
      pxText(d.name, px + 18, y, {size:7, color:on ? '#fff' : '#a89ac0'});
      if (t) pxText('◆', px + colw - 6, y, {size:7, color:RARIDADE[t.rar].cor, align:'right'});
    });
    if (lista.length > VIS)
      pxText(`${idx + 1}/${lista.length}`, px + 18, H - 60, {size:7, color:'#6a5a8a'});

    // --- ficha da criatura escolhida ---
    const id = lista[idx], d = BESTIARY[id];
    const fx = px + colw + 28, fw = pw - colw - 52;
    const vistos = G.vistos?.[id] || 0, mortos = G.kills?.[id] || 0;
    const cont = G.cacada?.[id] || 0, t = dropMaximo(id);
    const grau = grauBestiario(id);

    pxText(d.name, fx, 92, {size:10, color:ELEM[d.element].glow});
    pxText(`nível ${d.lvl} · ${ELEM[d.element].name}${d.boss ? ' · CHEFE' : ''}`,
           fx, 112, {size:7, color:'#7a6a9a'});
    /* O retrato vai para o RODAPÉ da ficha, não para o canto de cima: a
       coluna direita tem 262 px e a de números já ocupa 190 deles, então
       um bicho de 130 px em cima escrevia por baixo do "Desde o último
       drop máximo". Embaixo sobra altura de sobra e nada disputa. */
    if (d.sprite && spriteImages[d.sprite]?.naturalWidth){
      const img = spriteImages[d.sprite];
      const alt = Math.min(148, H - 96 - 400);
      const larg = (img.naturalWidth / img.naturalHeight) * alt;
      ctx.save(); ctx.globalAlpha = 0.9;
      ctx.drawImage(img, fx + (fw - larg) / 2, H - 96 - alt, larg, alt);
      ctx.restore();
    }

    let y = 148;
    const linha = (r, v, cor = '#d0c8e0') => {
      pxText(r, fx, y, {size:7, color:'#6a5a8a'});
      pxText(v, fx + 190, y, {size:8, color:cor, align:'right'});
      y += 22;
    };
    pxText('HISTÓRICO DE CAÇA', fx, y, {size:7, color:'#b89aff'}); y += 22;
    linha('Encontrados', String(vistos));
    linha('Derrotados', String(mortos));

    if (!t){
      pxText(d.boss ? 'O prêmio deste chefe é garantido na primeira vitória.'
                    : 'Nada de raridade alta nesta tabela.',
             fx, y + 6, {size:7, color:'#6a5a8a'});
      return;
    }

    linha('Desde o último drop máximo', String(cont), cont > 0 ? '#ffd24a' : '#7ada7a');
    y += 8;
    const R = RARIDADE[t.rar];
    pxText('MELHOR DROP POSSÍVEL', fx, y, {size:7, color:'#b89aff'}); y += 22;

    if (grau < 1){
      uiText('Quanto mais dessas criaturas caírem, maior parece ficar a\nchance de algo especial aparecer.',
             fx, y + 4, {size:12, color:'#7a6a9a'});
      return;
    }
    for (const [item] of t.itens){
      pxText(ITEMS[item].name, fx + 12, y, {size:8, color:R.cor});
      y += 18;
    }
    pxText(`raridade ${R.nome.toLowerCase()}`, fx + 12, y, {size:7, color:R.cor}); y += 24;

    if (grau < 2){
      pxText('A conta exata ainda escapa. Continue caçando.', fx, y, {size:7, color:'#6a5a8a'});
      return;
    }
    linha('Chance base', pct(t.base));
    linha('Multiplicador atual', '×' + cont, cont > 1 ? '#ffd24a' : '#9a9aae');
    if (grau < 3){
      pxText('A chance final ainda é palpite. Falta caçar mais.', fx, y, {size:7, color:'#6a5a8a'});
      return;
    }
    const ch = chanceDeCaca(id, cont);
    linha('Chance atual', pct(ch), ch >= 1 ? '#7ada7a' : ch > 0.3 ? '#ffd24a' : '#d0c8e0');
    if (ch >= 1)
      pxText('GARANTIDO no próximo abate.', fx, y, {size:8, color:'#7ada7a', glow:'#3a8a3a'});
  },

  drawQuests(px, pw){
    pxText('MISSÕES', px + 20, 52, {size:10, color:'#b89aff'});
    const lista = questJournal();
    if (!lista.length){
      uiText('Nenhuma missão ainda. Converse com as pessoas —', px + 20, 92, {size:13, color:'#6a5a8a'});
      uiText('zelador, enfermeira, veterano, bibliotecária e mercador têm o que pedir.',
             px + 20, 114, {size:13, color:'#6a5a8a'});
      return;
    }
    /* A v4.8 leva o diário a 17 missões. Sem janela, tudo a partir da
       nona era desenhado abaixo da tela. */
    const VIS = 8;
    const sel = clamp(this.cur.quests.i, 0, lista.length - 1);
    const ini = clamp(sel - Math.floor(VIS / 2), 0, Math.max(0, lista.length - VIS));
    if (lista.length > VIS)
      pxText(`${sel + 1}/${lista.length} ${ini > 0 ? '▲' : ' '}${ini + VIS < lista.length ? '▼' : ' '}`,
             px + pw - 24, 52, {size:7, color:'#6a5a8a', align:'right'});
    lista.slice(ini, ini + VIS).forEach((e, k) => {
      const i = ini + k;
      const q = QUESTS[e.id], y = 88 + k * 62, on = sel === i;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.16)'; ctx.fillRect(px + 12, y - 20, pw - 24, 56); }
      const cor = e.st === 'feita' ? '#5a8a5a' : e.pronta ? '#ffe44a' : '#b89aff';
      const marca = e.st === 'feita' ? '✔' : e.pronta ? '★' : '▸';
      pxText(`${marca} ${q.titulo}`, px + 24, y, {size:9, color:cor});
      uiText(q.resumo, px + 24, y + 20, {size:12, color:'#7a6a9a'});
      if (e.st === 'ativa'){
        const p = questProgress(e.id);
        bar(px + pw - 190, y - 8, 130, 8, p.feito / p.alvo, '#6a3a9a', e.pronta ? '#ffe44a' : '#b89aff');
        pxText(`${p.feito}/${p.alvo}`, px + pw - 30, y, {size:8, color:cor, align:'right'});
        if (e.pronta) pxText(`falar com ${q.npc}`, px + pw - 30, y + 20, {size:7, color:'#ffe44a', align:'right'});
      } else {
        pxText('concluída', px + pw - 30, y, {size:7, color:'#5a8a5a', align:'right'});
      }
    });
  },

  /* Tela de pets. Mostra a forma ATUAL, o que falta para a próxima e
     quem é o dono — porque o bônus de dono é a única razão para o
     jogador pensar em quem está em campo ao escolher o bicho. */
  drawPets(px, pw){
    pxText('PETS', px + 20, 52, {size:10, color:'#b89aff'});
    const lista = petsDono();
    if (!lista.length){
      uiText('Nenhum pet ainda. Eles se conquistam —', px + 20, 92, {size:13, color:'#6a5a8a'});
      uiText('procure quem cuida de ninho no Ninhal de Éter.', px + 20, 114, {size:13, color:'#6a5a8a'});
      return;
    }
    uiText('Z escolhe quem acompanha · Z de novo dispensa · só um por vez',
           px + 20, 74, {size:12, color:'#6a5a8a'});
    const sel = clamp(this.cur.pets.i, 0, lista.length - 1);
    lista.forEach((id, i) => {
      const d = G.pets[id], P = PETS[id], F = petForma(id, d.lvl), prox = petProxForma(id, d.lvl);
      const y = 104 + i * 62, on = sel === i, ativo = G.petAtivo === id;
      if (on){ ctx.fillStyle = 'rgba(120,86,200,.16)'; ctx.fillRect(px + 12, y - 20, pw - 24, 56); }
      /* Com arte cadastrada, a arte; sem, a marca elemental. Mesmo par de
         caminhos do campo (`desenharPet`) e pela mesma razão: as formas
         não ganham sprite todas no mesmo dia, e a lista não pode ficar
         vazia por causa disso. */
      const E = ELEM[P.elem] || ELEM.none;
      const art = F.sprite && spriteImages[F.sprite];
      ctx.save(); ctx.shadowColor = E.glow; ctx.shadowBlur = ativo ? 10 : 0;
      if (art && (art.complete ?? true) && (art.naturalWidth || art.width)){
        const alt = 34, larg = (art.naturalWidth / art.naturalHeight) * alt;
        ctx.drawImage(art, Math.round(px + 34 - larg / 2), Math.round(y + 12 - alt), larg, alt);
      } else {
        ctx.fillStyle = P.cor; ctx.beginPath();
        ctx.ellipse(px + 34, y + 4, 13, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.acento; ctx.fillRect(px + 29, y - 1, 4, 4); ctx.fillRect(px + 37, y - 1, 4, 4);
      }
      ctx.restore();
      pxText((ativo ? '▸ ' : '  ') + F.name, px + 58, y,
             {size:9, color:ativo ? '#ffe44a' : on ? '#fff' : '#a89ac0'});
      pxText(`${E.icon} Nv${d.lvl}`, px + pw - 30, y, {size:8, color:E.glow, align:'right'});
      const dono = P.dono ? (G.squad.includes(P.dono) ? `${P.dono} em campo · +30%` : `dono: ${P.dono}`)
                          : 'sem dono';
      uiText(dono, px + 58, y + 18, {size:12, color:P.dono && G.squad.includes(P.dono) ? '#7ada7a' : '#7a6a9a'});
      const need = petExpToNext(d.lvl);
      bar(px + 58, y + 26, 200, 5, d.exp / need, '#7a6a2a', '#eaca3a');
      pxText(prox ? `evolui em Nv${prox.nivel}: ${prox.name}` : 'forma final',
             px + 268, y + 31, {size:6, color:prox ? '#bba85a' : '#7ada7a'});
    });
    const cur = lista[sel];
    if (cur) uiText(PETS[cur].desc, px + 20, H - 60, {size:12, color:'#7a6a9a'});
  },

  /** Uma ficha de personagem na tela de grupo. */
  drawFormSlot(c, sx, sy, sw, sh, o){
    if (o.on){ ctx.fillStyle = 'rgba(120,86,200,.26)'; ctx.fillRect(sx - 6, sy, sw + 6, sh); }
    if (o.pego){ ctx.strokeStyle = '#ffe44a'; ctx.lineWidth = 2; ctx.strokeRect(sx - 6, sy, sw + 6, sh); }
    if (!c){ pxText('— vazio —', sx + 8, sy + sh / 2, {size:7, color:'#4a4058'}); return; }
    const E = ELEM[c.element];
    drawActor({sheet:c.sheet, dir:'down', moving:false, animT:0},
              sx + sw / 2, sy + sh - 34, {scale:.9, alpha:o.reserva ? .7 : 1});
    pxText((o.lider ? '▸' : '') + c.name, sx + sw / 2, sy + sh - 16,
           {size:8, color:o.lider ? '#ffe44a' : (o.reserva ? '#8a80a8' : E.glow), align:'center'});
    pxText(`${E.icon} Nv${c.lvl}`, sx + sw / 2, sy + sh - 2, {size:7, color:'#7a6a9a', align:'center'});
    bar(sx + 4, sy + 8, sw - 8, 5, c.hp / c.maxHp, '#3a8a3a', '#5aba5a');
    bar(sx + 4, sy + 15, sw - 8, 4, c.mp / c.maxMp, '#3a5a9a', '#5a8afa');
    if (c.hp <= 0) pxText('caído', sx + sw / 2, sy + 46, {size:7, color:'#da6a6a', align:'center'});
  },

  drawForm(px, pw){
    const banco = benchNames();
    pxText('GRUPO', px + 20, 52, {size:10, color:'#b89aff'});
    uiText(`Até ${PARTY_SIZE} em campo. Quem fica de fora ganha ` +
           `${Math.round(RESERVE_EXP * 100)}% do EXP.`,
           px + 20, 74, {size:12, color:'#8a7aaa'});
    uiText('Z pega e troca · C entra/sai · TAB define o líder',
           px + 20, 92, {size:12, color:'#6a5a8a'});

    // --- em campo ---
    const gy = 132;   // abaixo das três linhas de ajuda, que vão até y=92
    panel(px + 14, gy - 22, pw - 28, 176, {alpha:.5, accent:'#7a5aba'});
    pxText('EM CAMPO', px + 30, gy, {size:8, color:'#ffe44a'});
    pxText(MAPS[G.mapId]?.name || '—', px + 150, gy, {size:7, color:'#a8ffd0'});
    const poder = squadChars().reduce((s, c) => s + c.atk + c.def, 0);
    pxText(`poder ${poder}`, px + pw - 32, gy, {size:7, color:'#6a5a8a', align:'right'});

    const cw = (pw - 70) / PARTY_SIZE;
    for (let p = 0; p < PARTY_SIZE; p++){
      this.drawFormSlot(charByName(G.squad[p]), px + 30 + p * cw, gy + 12, cw - 10, 128,
        {on:this.cur.form.i === p, pego:this.pick === p, lider:G.leader === p});
    }

    // --- banco ---
    const by = 348;
    panel(px + 14, by - 22, pw - 28, 176, {alpha:.5, accent:'#3a2a5a'});
    pxText('RESERVA', px + 30, by, {size:8, color:'#6a5a8a'});
    if (!banco.length)
      pxText('todo o elenco está em campo', px + 150, by, {size:7, color:'#4a4058'});
    banco.forEach((n, p) => {
      const slot = PARTY_SIZE + p;
      this.drawFormSlot(charByName(n), px + 30 + p * cw, by + 12, cw - 10, 128,
        {on:this.cur.form.i === slot, pego:this.pick === slot, lider:false, reserva:true});
    });

    if (this.pick !== null)
      uiText('Escolha o destino para trocar de lugar.', px + 20, H - 56, {size:12, color:'#ffe44a'});
  },

  drawOpts(px, pw){
    pxText('OPÇÕES', px + 20, 52, {size:10, color:'#b89aff'});
    const opts = this.optionsList();
    opts.forEach((o, i) => {
      const y = 100 + i * 40, on = this.cur.opts.i === i;
      Clique.add(px + 12, y - 18, pw - 24, 30, Clique.escolher(this.cur.opts, i));
      const sob = Clique.emCima(px + 12, y - 18, pw - 24, 30);
      if (on || sob){
        ctx.fillStyle = on ? 'rgba(120,86,200,.2)' : 'rgba(120,86,200,.1)';
        ctx.fillRect(px + 12, y - 18, pw - 24, 30);
      }
      pxText((on ? '▸ ' : '  ') + o.label(), px + 24, y, {size:9, color:on ? '#fff' : '#a89ac0'});
      /* Emblema da opção, à direita da linha. Só a moldura usa por ora, e
         `icone` devolvendo null é o caso normal de "sem emblema". */
      const chaveIc = o.icone && o.icone();
      const ic = chaveIc && spriteImages[chaveIc];
      if (ic && (ic.complete ?? true) && (ic.naturalWidth || ic.width))
        ctx.drawImage(ic, px + pw - 52, y - 15, 24, 24);
    });
    const sel = opts[this.cur.opts.i];
    if (sel?.hint) uiText(sel.hint(), px + 24, H - 80, {size:12, color:'#8a7aaa'});
    uiText('Z confirma · X volta · C fecha o menu', px + 20, H - 56, {size:12, color:'#5a4a7a'});
  },
};
