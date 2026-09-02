/* ===================================================================
   12. FX — shake, flash, hitstop, partículas, números, transições
   =================================================================== */
const FX = {
  shakeMag:0, shakeT:0, flashC:null, flashT:0, flashDur:0, hitstopT:0,
  popups:[], parts:[], trans:null,

  shake(mag, dur){ this.shakeMag = Math.max(this.shakeMag, mag); this.shakeT = Math.max(this.shakeT, dur); },
  flash(color, dur){ this.flashC = color; this.flashT = dur; this.flashDur = dur; },
  hitstop(sec){ this.hitstopT = Math.max(this.hitstopT, sec); },
  popup(x, y, text, color, big){ this.popups.push({x:x + rnd(14, -14), y, text, color, life:1.1, big:!!big}); },
  burst(x, y, elem, n){
    const E = ELEM[elem] || ELEM.none;
    for (let i = 0; i < n; i++) this.parts.push({
      x:x + rnd(26, -26), y:y + rnd(22, -22),
      vx:rnd(46, -46), vy:rnd(-14, -74),
      life:rnd(1.1, .5), max:1.1, size:rnd(4.2, 1.4),
      color:chance(.5) ? E.main : E.glow, elem,
    });
  },

  /** Fade preto: chama `cb` no meio da transição. */
  fade(cb){ this.trans = {kind:'fade', t:0, dur:.75, cb, fired:false}; },
  /** Entrada de batalha estilo JRPG (lâminas + flash). */
  battleWipe(cb){ this.trans = {kind:'wipe', t:0, dur:1.15, cb, fired:false}; },
  get blocking(){ return !!this.trans; },

  update(dt){
    if (this.shakeT > 0){ this.shakeT -= dt; if (this.shakeT <= 0) this.shakeMag = 0; }
    if (this.flashT > 0) this.flashT -= dt;
    for (let i = this.popups.length - 1; i >= 0; i--){
      const p = this.popups[i]; p.life -= dt; p.y -= 34 * dt;
      if (p.life <= 0) this.popups.splice(i, 1);
    }
    for (let i = this.parts.length - 1; i >= 0; i--){
      const p = this.parts[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += (p.elem === 'fire' ? -34 : p.elem === 'ink' ? 90 : 42) * dt;
      if (p.elem === 'electricity'){ p.x += rnd(60, -60) * dt; p.y += rnd(60, -60) * dt; }
      if (p.elem === 'darkness') p.vx += rnd(50, -50) * dt;
      if (p.life <= 0) this.parts.splice(i, 1);
    }
    if (this.trans){
      const T = this.trans;
      T.t += dt;
      if (!T.fired && T.t >= T.dur * 0.5){ T.fired = true; T.cb?.(); }
      if (T.t >= T.dur) this.trans = null;
    }
  },

  pushCamera(){
    if (this.shakeMag <= 0) return;
    ctx.save();
    ctx.translate(rnd(this.shakeMag, -this.shakeMag), rnd(this.shakeMag, -this.shakeMag));
  },
  popCamera(){ if (this.shakeMag > 0) ctx.restore(); },

  drawParticles(){
    ctx.save();
    for (const p of this.parts){
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1) * .9;
      ctx.fillStyle = p.color;
      if (p.elem === 'ink') ctx.fillRect(p.x, p.y, p.size + 1, p.size * 2);
      else if (p.elem === 'ice'){
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * 5);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
      } else if (p.elem === 'electricity'){
        ctx.strokeStyle = p.color; ctx.lineWidth = 1.6; ctx.beginPath();
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + rnd(9, -9), p.y + rnd(9, -9));
        ctx.lineTo(p.x + rnd(12, -12), p.y + rnd(12, -12)); ctx.stroke();
      } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  },

  drawPopups(){
    for (const p of this.popups){
      const a = clamp(p.life / .5, 0, 1);
      const s = p.big ? 15 : 11;
      const pop = p.life > .95 ? 1 + (p.life - .95) * 6 : 1;
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(p.x, p.y); ctx.scale(pop, pop);
      pxText(p.text, 0, 0, {size:s, color:p.color, align:'center', glow:p.big ? p.color : null, blur:12});
      ctx.restore();
    }
  },

  drawOverlay(){
    if (this.flashT > 0){
      ctx.save(); ctx.globalAlpha = clamp(this.flashT / this.flashDur, 0, 1) * .6;
      ctx.fillStyle = this.flashC; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    const T = this.trans; if (!T) return;
    const k = T.t / T.dur;
    if (T.kind === 'fade'){
      const a = k < .5 ? k * 2 : (1 - k) * 2;
      ctx.fillStyle = `rgba(0,0,0,${clamp(a, 0, 1)})`; ctx.fillRect(0, 0, W, H);
    } else {
      // lâminas diagonais fechando e abrindo + clarão
      const a = k < .5 ? easeIn(k * 2) : easeOut((1 - k) * 2);
      const bands = 14, bh = H / bands;
      ctx.save();
      ctx.fillStyle = '#05040a';
      for (let i = 0; i < bands; i++){
        const w = W * clamp(a * 1.35 - (i % 2 ? .12 : 0), 0, 1);
        if (i % 2) ctx.fillRect(W - w, i * bh, w, bh + 1);
        else ctx.fillRect(0, i * bh, w, bh + 1);
      }
      if (k > .38 && k < .62){
        ctx.globalAlpha = 1 - Math.abs(k - .5) / .12;
        ctx.fillStyle = '#c8b0ff'; ctx.fillRect(0, 0, W, H);
      }
      ctx.restore();
    }
  },
};
