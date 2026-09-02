/* ===================================================================
   14. LOOP PRINCIPAL
   =================================================================== */
function update(dt){
  G.playtime += dt;
  FX.update(dt);
  if (FX.blocking){ Input.endFrame(); return; }

  if (Input.pressed('mute')){ Sound.init(); const m = Sound.toggleMute(); Menu.toast?.(m ? 'Som desligado' : 'Som ligado'); }

  if (G.scene === 'TITLE'){ Title.update(dt); return; }
  if (G.scene === 'CHOOSE'){ Escolha.update(dt); return; }
  if (G.scene === 'DIALOGUE'){ Msg.update(dt); if (G.map) updateNPCs(dt); return; }
  if (G.scene === 'MENU'){ Menu.update(dt); return; }
  if (G.scene === 'SHOP'){ Shop.update(dt); return; }
  if (G.scene === 'BATTLE'){ Battle.update(dt); return; }
  if (G.scene === 'CUTSCENE'){ Cut.update(dt); return; }
  if (G.scene === 'MAPA'){ Mapa.update(dt); return; }

  // FIELD
  /* Cena enfileirada por loadMap: só dispara aqui, com o campo já de pé.
     Disparar dentro do loadMap pegaria o jogo ainda em TITLE/CHOOSE. */
  if (Cut.pending){ const id = Cut.pending; Cut.pending = null; if (Cut.play(id)) return; }
  if (Input.pressed('menu')){ Menu.open(); return; }
  if (Input.pressed('mapa')){ Mapa.open(); return; }
  if (Input.pressed('swap')) swapLeader();   // TAB / TROCA = alterna quem anda na frente
  if (Input.pressed('confirm') && !G.player.moving) interact();
  updateField(dt);
}

function draw(){
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  FX.pushCamera();
  switch(G.scene){
    case 'TITLE':    Title.draw(); break;
    case 'CHOOSE':   Escolha.draw(); break;
    case 'BATTLE':   drawBattle(); break;
    case 'MENU':     Menu.draw(); break;
    case 'MAPA':     Mapa.draw(); break;
    case 'SHOP':     Shop.draw(); break;
    default:
      if (G.map){ drawField(); FX.drawParticles(); FX.drawPopups(); }
      break;
  }
  FX.popCamera();
  Cut.draw();
  if (G.scene === 'DIALOGUE') Msg.draw();
  FX.drawOverlay();
}

let _last = performance.now();
/* Durante o autoteste o loop PARA. Os testes colocam o jogo em estados
   intermediários impossíveis de propósito (party trocada no meio, luta
   montada e desmontada, mapa carregado e devolvido) e o desenho não tem
   por que ser cobrado de sobreviver a eles — só produzia exceções
   assíncronas no console que não correspondiam a nenhum defeito real.
   Os testes que precisam do desenho chamam draw/Menu.draw/Shop.draw
   explicitamente, com estado montado por eles. */
let _testando = false;

function frame(now){
  let dt = (now - _last) / 1000; _last = now;
  dt = Math.min(dt, 0.05);
  if (_testando){ requestAnimationFrame(frame); return; }
  /* A ORDEM aqui não é livre.
     1. O controle é lido antes do update, senão o botão desta volta só
        seria visto na próxima e o jogo pareceria lerdo.
     2. O clique é resolvido contra as áreas do quadro ANTERIOR — as que
        o jogador estava vendo quando clicou. Por isso resolve primeiro e
        só depois o desenho limpa e registra de novo. */
  Controle.ler();
  Clique.resolver();
  if (FX.hitstopT > 0){ FX.hitstopT -= dt; FX.update(0); }
  else update(dt);
  Clique.novoQuadro();
  draw();
  Input.endFrame();
  requestAnimationFrame(frame);
}

/* --- Ajuste de tela ---------------------------------------------
   Duas geometrias de celular, não uma:

   EM PÉ    a tela é alta e estreita. Os controles ficam numa faixa
            embaixo (RESERVA_BAIXO de altura) e o canvas encosta no topo.
   DEITADO  a tela é baixa e larga. Faixa embaixo aqui é ruinosa: sobraria
            quase nada de altura para um canvas 4:3. Em compensação, um
            canvas 4:3 ocupando toda a altura deixa margens laterais
            vazias — é lá que os controles vão morar. Reservamos
            RESERVA_LADO de largura para que o canvas nunca cresça por
            baixo dos botões, e o jogo fica centralizado entre eles.

   Sem isto o modo deitado usava a conta do modo em pé e o jogo virava um
   selo no meio da tela, com os controles atravessados por cima. */
const RESERVA_BAIXO = 150;   // faixa dos controles, em pé

/* Reserva lateral do modo deitado, em dois tamanhos de botão.
   LADO_MIN      D-pad compacto (células de 34) — é o que sempre se
                 reserva, para o canvas crescer o máximo possível.
   LADO_CONFORTO D-pad cheio (células de 40) — só é usado quando a
                 margem que sobrou dá conta dele sem apertar o canvas.

   O tamanho do botão é decidido AQUI e publicado como classe no body,
   em vez de sair de um `@media (max-height)`. A versão anterior fazia o
   contrário e produziu um defeito de gente grande: num aparelho de 375px
   de altura, ENTRAR EM TELA CHEIA deixava o canvas MENOR (427×320 →
   391×293), porque passar de 320 para 375 cruzava o limiar de altura,
   inchava os botões e a reserva comia mais do que a tela nova dava.
   Botão tem de responder ao espaço que sobra, não à altura do aparelho. */
const LADO_MIN      = 116;
const LADO_CONFORTO = 138;

function fitScreen(){
  const isTouch = document.body.classList.contains('touch');
  const deitado = innerWidth > innerHeight;
  const padY = isTouch && !deitado ? RESERVA_BAIXO : 0;
  const padX = isTouch && deitado ? LADO_MIN * 2 : 0;
  const availW = innerWidth - padX, availH = innerHeight - padY;
  const scale = Math.max(.35, Math.min(availW / W, availH / H));
  const larg = Math.floor(W * scale), alt = Math.floor(H * scale);

  const stage = document.getElementById('stage');
  stage.style.width = larg + 'px';  stage.style.height = alt + 'px';
  canvas.style.width = larg + 'px'; canvas.style.height = alt + 'px';

  /* Com a sobra medida é que se escolhe o tamanho do botão: cabe o
     D-pad cheio? usa. Não cabe? compacta, mas nunca às custas do jogo. */
  const folga = (innerWidth - larg) / 2;
  document.body.classList.toggle('pad-compacto', isTouch && deitado && folga < LADO_CONFORTO);

  // em pé o canvas sobe para o topo e a faixa de baixo fica livre;
  // deitado ele fica centralizado, com os botões nas margens laterais.
  const grudaNoTopo = isTouch && !deitado;
  document.body.style.justifyContent = grudaNoTopo ? 'flex-start' : 'center';
  document.body.style.paddingTop = grudaNoTopo ? '4px' : '0';
}
addEventListener('resize', fitScreen);
/* Entrar/sair de tela cheia muda innerHeight sem passar por `resize` em
   parte dos navegadores — daí o listener próprio. */
addEventListener('fullscreenchange', fitScreen);
addEventListener('webkitfullscreenchange', fitScreen);
/* `orientationchange` dispara ANTES de innerWidth/innerHeight mudarem em
   parte dos navegadores móveis — daí o atraso. O listener de resize que
   vem logo depois é o que costuma acertar; este é a rede de segurança. */
addEventListener('orientationchange', () => setTimeout(fitScreen, 120));
matchMedia('(orientation:landscape)').addEventListener?.('change', fitScreen);

/* --- Boot -------------------------------------------------------- */
function boot(){
  Input.install();
  fitScreen();
  Title.refresh();
  // pré-carrega a fonte de pixel para não piscar serifado no primeiro frame
  if (document.fonts?.load) document.fonts.load('10px "Press Start 2P"').catch(() => {});
  canvas.addEventListener('pointerdown', () => { Sound.init(); Sound.resume(); });
  Clique.instalar(canvas);
  requestAnimationFrame(frame);
  if (location.search.includes('test')) aguardarRecursosDoAutoteste().then(runSelfTests);
}


/* O relatório mede dimensões e diferenças entre artes. Em acesso remoto,
   aguarde imagens e fontes terminarem antes de executar as asserções. */
async function aguardarRecursosDoAutoteste(){
  const imagens = [
    ...Object.values(spriteImages),
    ...Object.values(battleArt).map(a => a.img),
  ].filter(img => img?.decode);
  await Promise.all([
    document.fonts?.ready || Promise.resolve(),
    ...imagens.map(img => img.decode().catch(() => {})),
  ]);
}
