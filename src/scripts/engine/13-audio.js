/* ===================================================================
   3. ÁUDIO — 100% sintetizado (nenhum arquivo externo)
   =================================================================== */
/* Trilha por ARQUIVO (v5.32) — opcional, por cima da trilha sintetizada.
   Preencha aqui pra tocar uma música de verdade em vez do sequenciador:
   {nomeDaTrack: 'assets/audio/arquivo.ogg'}. `nomeDaTrack` é o mesmo
   nome usado em `MAPS[id].bgm` / `Sound.bgm(nome)` — 'field', 'dungeon',
   'battle', 'boss', ou qualquer nome novo que um mapa passe. Track sem
   entrada aqui continua caindo no sequenciador sintetizado de sempre.
   Formato recomendado: OGG Vorbis ~128kbps, loop sem gap na ponta. */
const MUSIC_ASSETS = {
  // patio: 'assets/audio/bgm_patio.ogg',
};

const Sound = {
  ac:null, master:null, musicGain:null, sfxGain:null,
  muted:false, ready:false,
  _track:null, _step:0, _next:0, _timer:null,
  _fileEl:null, _fileSrc:null, _fileTrack:null,

  init(){
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { this.ac = new AC(); } catch(e){ return; }
    this.master = this.ac.createGain();   this.master.gain.value = 0.55;
    this.musicGain = this.ac.createGain(); this.musicGain.gain.value = 0.32;
    this.sfxGain = this.ac.createGain();   this.sfxGain.gain.value = 0.85;
    this.musicGain.connect(this.master); this.sfxGain.connect(this.master);
    this.master.connect(this.ac.destination);
    this.ready = true;
  },
  resume(){ if (this.ac && this.ac.state === 'suspended') this.ac.resume(); },
  toggleMute(){
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.55;
    return this.muted;
  },
  midi(n){ return 440 * Math.pow(2, (n - 69) / 12); },

  /** Voz básica: oscilador + envelope ADSR curto. */
  voice(freq, o = {}){
    if (!this.ready || this.muted) return;
    const t0 = o.at ?? this.ac.currentTime;
    const dur = o.dur ?? 0.16;
    const osc = this.ac.createOscillator();
    const g   = this.ac.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slideTo), t0 + dur);
    if (o.detune) osc.detune.setValueAtTime(o.detune, t0);
    const peak = (o.gain ?? 0.25);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (o.attack ?? 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (o.filter){
      const f = this.ac.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.setValueAtTime(o.filter, t0);
      node.connect(f); node = f;
    }
    node.connect(g); g.connect(o.bus === 'music' ? this.musicGain : this.sfxGain);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  },

  /** Ruído filtrado — impactos, passos, sopros. */
  noise(o = {}){
    if (!this.ready || this.muted) return;
    const t0 = o.at ?? this.ac.currentTime, dur = o.dur ?? 0.18;
    const n = Math.floor(this.ac.sampleRate * dur);
    const buf = this.ac.createBuffer(1, n, this.ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ac.createBufferSource(); src.buffer = buf;
    const f = this.ac.createBiquadFilter();
    f.type = o.hp ? 'highpass' : 'lowpass';
    f.frequency.setValueAtTime(o.freq ?? 1200, t0);
    if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(Math.max(60, o.sweepTo), t0 + dur);
    const g = this.ac.createGain();
    g.gain.setValueAtTime(o.gain ?? 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.sfxGain);
    src.start(t0); src.stop(t0 + dur);
  },

  sfx(name){
    if (!this.ready || this.muted) return;
    const t = this.ac.currentTime, M = n => this.midi(n);
    switch(name){
      case 'cursor':  this.voice(M(84), {type:'square', dur:0.05, gain:0.12}); break;
      case 'confirm': this.voice(M(79), {type:'square', dur:0.07, gain:0.16});
                      this.voice(M(86), {type:'square', dur:0.1, gain:0.14, at:t+0.05}); break;
      case 'cancel':  this.voice(M(67), {type:'square', dur:0.09, gain:0.14, slideTo:M(60)}); break;
      case 'deny':    this.voice(M(55), {type:'sawtooth', dur:0.14, gain:0.16, slideTo:M(48)}); break;
      case 'hit':     this.noise({freq:2400, sweepTo:220, dur:0.16, gain:0.34});
                      this.voice(M(45), {type:'triangle', dur:0.1, gain:0.2, slideTo:M(33)}); break;
      case 'crit':    this.noise({freq:5200, sweepTo:300, dur:0.26, gain:0.42});
                      this.voice(M(52), {type:'sawtooth', dur:0.2, gain:0.24, slideTo:M(36)}); break;
      case 'guard':   this.noise({freq:900, sweepTo:400, dur:0.14, gain:0.24, hp:true}); break;
      case 'miss':    this.noise({freq:3000, sweepTo:1400, dur:0.12, gain:0.16, hp:true}); break;
      case 'heal':    [72,76,79,84].forEach((n,i)=>this.voice(M(n),{type:'sine',dur:0.4,gain:0.13,at:t+i*0.06})); break;
      case 'buff':    [67,71,74].forEach((n,i)=>this.voice(M(n),{type:'triangle',dur:0.3,gain:0.12,at:t+i*0.05})); break;
      case 'magic':   this.voice(M(64), {type:'sawtooth', dur:0.3, gain:0.16, slideTo:M(88), filter:2600});
                      this.noise({freq:600, sweepTo:4000, dur:0.3, gain:0.14, hp:true}); break;
      case 'ult':     [48,55,60,64,67,72].forEach((n,i)=>this.voice(M(n),{type:'sawtooth',dur:0.9,gain:0.11,at:t+i*0.04,filter:3000}));
                      this.noise({freq:200, sweepTo:6000, dur:0.7, gain:0.24, hp:true}); break;
      case 'encounter':
                      [0,1,2].forEach(i=>this.voice(M(72-i*5),{type:'square',dur:0.12,gain:0.2,at:t+i*0.09}));
                      this.noise({freq:5000, sweepTo:120, dur:0.6, gain:0.3, at:t+0.28}); break;
      case 'victory': [72,76,79,84,79,84,88].forEach((n,i)=>
                        this.voice(M(n), {type:'square', dur:i===6?0.7:0.16, gain:0.18, at:t+i*0.12})); break;
      case 'levelup': [60,64,67,72,76].forEach((n,i)=>this.voice(M(n),{type:'triangle',dur:0.42,gain:0.15,at:t+i*0.07})); break;
      case 'defeat':  [60,57,53,48].forEach((n,i)=>this.voice(M(n),{type:'sawtooth',dur:0.6,gain:0.16,at:t+i*0.24,filter:900})); break;
      case 'chest':   [76,81,88].forEach((n,i)=>this.voice(M(n),{type:'square',dur:0.22,gain:0.16,at:t+i*0.08})); break;
      case 'save':    [67,74,79].forEach((n,i)=>this.voice(M(n),{type:'sine',dur:0.5,gain:0.16,at:t+i*0.1})); break;
      case 'step':    this.noise({freq:520, dur:0.05, gain:0.06}); break;
      case 'door':    this.noise({freq:400, sweepTo:180, dur:0.3, gain:0.2}); break;
      case 'boss':    this.voice(M(29), {type:'sawtooth', dur:1.6, gain:0.3, filter:400});
                      this.noise({freq:120, dur:1.4, gain:0.22}); break;
    }
  },

  /* --- Trilhas: sequenciador de 16 passos com lookahead --- */
  TRACKS: {
    field:   {bpm:82,  wave:'triangle',
              bass:[45,null,45,null,52,null,45,null, 43,null,43,null,50,null,43,null],
              lead:[76,79,83,79,76,72,76,null, 74,78,81,78,74,71,74,null],
              pad:[57,null,null,null,null,null,null,null, 55,null,null,null,null,null,null,null]},
    dungeon: {bpm:66,  wave:'sine',
              bass:[33,null,null,null,33,null,null,36, 31,null,null,null,31,null,null,34],
              lead:[null,null,60,null,null,63,null,null, null,null,58,null,null,61,null,null],
              pad:[45,null,null,null,null,null,null,null, 44,null,null,null,null,null,null,null]},
    battle:  {bpm:152, wave:'square',
              bass:[40,40,47,40, 40,40,45,40, 38,38,45,38, 38,38,43,38],
              lead:[64,67,71,74, 71,67,64,67, 62,65,69,72, 69,65,62,65],
              pad:[52,null,null,null, 52,null,null,null, 50,null,null,null, 50,null,null,null]},
    boss:    {bpm:164, wave:'sawtooth',
              bass:[36,36,36,43, 36,36,42,41, 34,34,34,41, 34,34,40,39],
              lead:[72,75,79,75, 77,75,72,70, 70,73,77,73, 75,73,70,68],
              pad:[48,null,55,null, 48,null,54,null, 46,null,53,null, 46,null,52,null]},
  },

  bgm(name){
    if (!this.ready) return;
    const arquivo = MUSIC_ASSETS[name];
    if (arquivo){
      if (this._fileTrack === name) return;
      this._track = null;                 // sequenciador sintetizado fica quieto
      this._playFile(name, arquivo);
      return;
    }
    this._stopFile();
    if (this._track === name) return;
    this._track = name; this._step = 0;
    this._next = this.ac.currentTime + 0.08;
    if (!this._timer) this._timer = setInterval(() => this._pump(), 26);
  },
  stopBgm(){ this._track = null; this._stopFile(); },

  /** Toca um arquivo real de música, roteado pelo mesmo bus/volume da
   *  trilha sintetizada (musicGain) — silenciar ou baixar volume no
   *  jogo continua valendo igual pros dois caminhos. Um <audio> só, com
   *  a fonte trocada por track: `createMediaElementSource` só pode ser
   *  chamado uma vez por elemento, então o elemento é criado uma única
   *  vez e reaproveitado. */
  _playFile(name, url){
    this.resume();
    if (!this._fileEl){
      this._fileEl = new Audio();
      this._fileEl.loop = true;
      /* Sem crossOrigin: pra arquivo servido do mesmo lugar que o jogo
         (o caso normal) não faz falta, e setar sem servidor CORS por
         trás pode travar o carregamento. Ligar ao grafo do Web Audio
         (volume/mute do jogo) é best-effort: rodando direto de
         file://, o navegador tainta a origem e createMediaElementSource
         pode falhar — nesse caso ainda tocamos o áudio puro (sem
         herdar mute/volume do jogo) em vez de ficar mudo. */
      try {
        const src = this.ac.createMediaElementSource(this._fileEl);
        src.connect(this.musicGain);
      } catch(e){
        console.warn('BGM: tocando fora do mixer do jogo (sem volume/mute) — ', e.message);
      }
    }
    this._fileTrack = name;
    if (this._fileSrc !== url){
      this._fileSrc = url;
      this._fileEl.src = url;
    }
    this._fileEl.currentTime = 0;
    this._fileEl.play().catch(() => {});      // autoplay bloqueado até 1º input; Input.js já chama Sound.resume()
  },
  _stopFile(){
    if (!this._fileEl || !this._fileTrack) return;
    this._fileEl.pause();
    this._fileTrack = null;
  },
  _pump(){
    if (!this.ready || !this._track || this.muted) return;
    const T = this.TRACKS[this._track]; if (!T) return;
    const spb = 60 / T.bpm / 2;                       // colcheia
    while (this._next < this.ac.currentTime + 0.2){
      const i = this._step % 16, at = this._next;
      if (T.bass[i] != null) this.voice(this.midi(T.bass[i]), {type:'triangle', dur:spb*1.6, gain:0.16, at, bus:'music', filter:900});
      if (T.lead[i] != null) this.voice(this.midi(T.lead[i]), {type:T.wave, dur:spb*0.85, gain:0.075, at, bus:'music', filter:2600});
      if (T.pad[i]  != null) this.voice(this.midi(T.pad[i]),  {type:'sine', dur:spb*7, gain:0.06, at, bus:'music'});
      this._next += spb; this._step++;
    }
  },
};
