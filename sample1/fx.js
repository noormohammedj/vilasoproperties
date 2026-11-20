/* Vilaso sample1 effects: synthesized sound (Web Audio, no files) and the ribbon-cutting reveal.
   Browsers only allow sound after the visitor's first tap or key press, so sound "unlocks" on that gesture.
   ASCII only. */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = null, out = null, nbuf = null, on = true, unlocked = false, waiters = [], lastTick = 0;
  try { on = localStorage.getItem('vilaso-sound') !== 'off'; } catch (e) { /* storage blocked: keep default */ }

  function init() {
    if (ctx || !AC) return ctx;
    try { ctx = new AC(); } catch (e) { return null; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    out = ctx.createGain(); out.gain.value = .85;
    out.connect(comp); comp.connect(ctx.destination);
    nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = nbuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function live() { return on && ctx && ctx.state === 'running'; }
  function chain(node, pan) {
    if (pan && ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); node.connect(p); p.connect(out); }
    else node.connect(out);
  }
  function env(g, t, peak, attack, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, .0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  // filtered noise burst
  function noise(t, dur, o) {
    var s = ctx.createBufferSource(); s.buffer = nbuf;
    var f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.freq || 2000, t); f.Q.value = o.q || 1;
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    var g = ctx.createGain(); env(g, t, o.gain || .2, o.attack || .003, dur);
    s.connect(f); f.connect(g); chain(g, o.pan);
    s.start(t, Math.random() * .8, dur + .05);
  }
  // pitched blip
  function tone(t, freq, dur, o) {
    o = o || {};
    var s = ctx.createOscillator(); s.type = o.type || 'sine'; s.frequency.setValueAtTime(freq, t);
    if (o.to) s.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    var g = ctx.createGain(); env(g, t, o.gain || .1, o.attack || .002, dur);
    s.connect(g); chain(g, o.pan);
    s.start(t); s.stop(t + dur + .05);
  }

  var S = {
    // tiles scattering out across the screen: a swell, a low thud and dozens of little card flicks spread in time and space
    scatter: function () {
      if (!live()) return;
      var t0 = ctx.currentTime + .02;
      tone(t0, 110, .5, { to: 42, gain: .35 });
      noise(t0, 1.1, { type: 'bandpass', freq: 260, to: 3200, q: .7, gain: .16, attack: .3 });
      for (var i = 0; i < 30; i++) {
        var t = t0 + .06 + Math.pow(Math.random(), 1.5) * 1.15, pan = Math.random() * 2 - 1;
        noise(t, .03 + Math.random() * .04, { type: 'bandpass', freq: 1800 + Math.random() * 3800, q: 2.5, gain: .12 + Math.random() * .16, pan: pan });
        tone(t, 700 + Math.random() * 900, .05, { type: 'triangle', gain: .035, pan: pan });
      }
    },
    // soft ratchet tick each time a tile passes the front of the ring
    tick: function (pan) {
      if (!live()) return;
      var now = performance.now(); if (now - lastTick < 45) return; lastTick = now;
      var t = ctx.currentTime;
      noise(t, .022, { type: 'bandpass', freq: 3400, q: 5, gain: .09, pan: pan * .6 });
      tone(t, 1900, .018, { type: 'triangle', gain: .03, pan: pan * .6 });
    },
    // strong, solid click when a tile is chosen
    click: function () {
      if (!live()) return;
      var t = ctx.currentTime;
      tone(t, 170, .14, { to: 55, gain: .7 });
      noise(t, .05, { type: 'lowpass', freq: 2600, gain: .55 });
      noise(t, .018, { type: 'highpass', freq: 6000, gain: .35 });
      tone(t + .004, 1250, .06, { type: 'square', gain: .05 });
    },
    // satin ribbon pulled across the page
    swish: function () {
      if (!live()) return;
      var t = ctx.currentTime;
      noise(t, .5, { type: 'bandpass', freq: 500, to: 2800, q: 1.2, gain: .22, attack: .18, pan: -.5 });
      noise(t + .05, .5, { type: 'bandpass', freq: 520, to: 3000, q: 1.2, gain: .22, attack: .18, pan: .5 });
    },
    // two-blade scissor snip
    snip: function () {
      if (!live()) return;
      var t = ctx.currentTime;
      [0, .07].forEach(function (k, i) {
        noise(t + k, .035, { type: 'highpass', freq: 4500, gain: .5 });
        tone(t + k, i ? 2900 : 3500, .09, { gain: .12 });
      });
      noise(t + .1, .25, { type: 'bandpass', freq: 1200, to: 400, q: .8, gain: .12 });
    },
    // bright reveal chime
    shimmer: function () {
      if (!live()) return;
      var t = ctx.currentTime + .05;
      [1046.5, 1318.5, 1568, 2093, 2637].forEach(function (f, i) {
        tone(t + i * .065, f, 1.1, { gain: .1, attack: .005 });
        tone(t + i * .065, f * 2.01, .5, { gain: .025 });
      });
    }
  };

  function unlock(e) {
    init();
    if (!ctx) return;
    var go = function () {
      if (unlocked || ctx.state !== 'running') return;
      unlocked = true;
      ['pointerdown', 'keydown', 'touchend'].forEach(function (n) { removeEventListener(n, unlock, true); });
      var w = waiters; waiters = []; w.forEach(function (fn) { fn(e); });
    };
    if (ctx.state === 'suspended') ctx.resume().then(go, function () {}); else go();
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(function (n) { addEventListener(n, unlock, true); });

  // ---------- ribbon cutting ----------
  // Steel scissors drawn upright: handles on top, pivot at (30,58), blade tips at the bottom.
  var SHEARS = '<svg viewBox="0 0 60 140" aria-hidden="true"><defs>' +
    '<linearGradient id="rbst" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d9196"/><stop offset=".45" stop-color="#f4f5f6"/><stop offset=".6" stop-color="#c9ccd0"/><stop offset="1" stop-color="#7c8086"/></linearGradient></defs>' +
    '<g class="ba"><ellipse cx="16" cy="20" rx="9.5" ry="14" fill="none" stroke="#151311" stroke-width="4.5"/><path d="M21 32 L31 57" stroke="#151311" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M27 54 L35 57 L31 134 Q30 138 29.2 134 Z" fill="url(#rbst)" stroke="#6d7177" stroke-width=".5"/></g>' +
    '<g class="bb"><ellipse cx="44" cy="20" rx="9.5" ry="14" fill="none" stroke="#151311" stroke-width="4.5"/><path d="M39 32 L29 57" stroke="#151311" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M33 54 L25 57 L29 134 Q30 138 30.8 134 Z" fill="url(#rbst)" stroke="#6d7177" stroke-width=".5"/></g>' +
    '<circle cx="30" cy="58" r="2.6" fill="#d9dbde" stroke="#5d6166" stroke-width=".8"/></svg>';
  var SCISSORS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>';
  var SMOOTH = 'cubic-bezier(.22,1,.36,1)';

  function ribbon(host, done) {
    done = done || function () {};
    if (reduce) { done(); return; }
    var w = document.createElement('div');
    w.className = 'rb'; w.tabIndex = 0;
    w.setAttribute('role', 'button'); w.setAttribute('aria-label', 'Cut the ribbon to open this property');
    w.innerHTML = '<div class="rb-veil"></div>' +
      '<div class="rb-band"><div class="rb-half rb-l"></div><div class="rb-half rb-r"></div></div>' +
      '<div class="rb-seal"><span>V</span><i></i></div>' +
      '<p class="rb-hint">' + SCISSORS + '<span>Tap the ribbon to unveil</span></p>';
    host.appendChild(w);
    var band = w.querySelector('.rb-band'), L = w.querySelector('.rb-l'), R = w.querySelector('.rb-r'), seal = w.querySelector('.rb-seal'), veil = w.querySelector('.rb-veil'), hint = w.querySelector('.rb-hint');
    var cut = false, timer = 0;
    var stop = function (e) { e.preventDefault(); };
    w.addEventListener('wheel', stop, { passive: false });
    w.addEventListener('touchmove', stop, { passive: false });

    // entrance: the satin glides in from both sides and meets in the middle, then the seal settles on it
    S.swish();
    veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out', fill: 'both' });
    L.animate([{ transform: 'translateX(-100%)' }, { transform: 'none' }], { duration: 900, easing: SMOOTH, fill: 'both' });
    R.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], { duration: 900, easing: SMOOTH, fill: 'both' });
    seal.animate([{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 600, easing: SMOOTH, fill: 'both' });
    hint.animate([{ opacity: 0, transform: 'translate(-50%, 8px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 600, delay: 950, easing: SMOOTH, fill: 'both' });
    setTimeout(function () { if (!cut) w.focus({ preventScroll: true }); }, 700);
    timer = setTimeout(function () { doCut(innerWidth * .5 + 70, innerHeight * .5); }, 9000);

    function doCut(x, y) {
      if (cut) return; cut = true; clearTimeout(timer);
      var br = band.getBoundingClientRect();
      var pct = Math.max(.12, Math.min(.88, (x - br.left) / br.width));
      if (Math.abs(pct - .5) < .05) pct = .5 + (pct < .5 ? -.05 : .05); // never cut through the seal
      var cx = br.left + br.width * pct, midY = br.top + br.height / 2 + (cx - (br.left + br.width / 2)) * Math.tan(-3 * Math.PI / 180);
      hint.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' });

      // the shears come down open over the ribbon, then close
      var sc = document.createElement('div'); sc.className = 'rb-sc'; sc.innerHTML = SHEARS;
      w.appendChild(sc); sc.style.left = (cx - sc.offsetWidth / 2) + 'px'; sc.style.top = (midY - sc.offsetHeight * 108 / 140) + 'px';
      sc.animate([{ opacity: 0, transform: 'translateY(-26px) rotate(-3deg)' }, { opacity: 1, transform: 'rotate(-3deg)' }], { duration: 260, easing: SMOOTH, fill: 'forwards' });
      setTimeout(function () { sc.classList.add('shut'); S.snip(); }, 260);
      setTimeout(function () {
        w.style.setProperty('--cut', (pct * 100).toFixed(2) + '%');
        w.classList.add('cut');
        var gl = document.createElement('div'); gl.className = 'rb-glint'; gl.style.left = cx + 'px'; gl.style.top = midY + 'px'; w.appendChild(gl);
        gl.animate([{ opacity: 0, transform: 'rotate(-3deg) scaleY(.2)' }, { opacity: 1, transform: 'rotate(-3deg) scaleY(1)', offset: .3 }, { opacity: 0, transform: 'rotate(-3deg) scaleY(1.15)' }], { duration: 520, easing: 'ease-out', fill: 'forwards' });
        // each side glides away like satin being drawn back, with a soft curl
        L.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(-58%, 10px) rotate(-1.2deg)', opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
        R.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(58%, 10px) rotate(1.2deg)', opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
        seal.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(46px) scale(.9)', opacity: 0 }], { duration: 800, delay: 80, easing: 'cubic-bezier(.55,0,.75,.4)', fill: 'forwards' });
        sc.animate([{ opacity: 1, transform: 'rotate(-3deg)' }, { opacity: 0, transform: 'translateY(-34px) rotate(-3deg)' }], { duration: 420, delay: 120, easing: 'ease-in', fill: 'forwards' });
        veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, delay: 380, easing: 'ease-out', fill: 'forwards' });
        dust(w, cx, midY);
        setTimeout(S.shimmer, 120);
      }, 400);
      setTimeout(function () { w.remove(); done(); }, 1700);
    }
    w.addEventListener('pointerdown', function (e) { if (e.button === 0) doCut(e.clientX, e.clientY); });
    w.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCut(innerWidth / 2 + 70, innerHeight / 2); }
      if (e.key === 'Escape') { e.stopPropagation(); doCut(innerWidth / 2 + 70, innerHeight / 2); }
    });
  }

  // a few fine gold and red flecks drifting from the cut
  function dust(host, x, y) {
    var colors = ['#c9a45c', '#e3c98f', '#c8202a', '#b08a43'];
    for (var i = 0; i < 18; i++) {
      var p = document.createElement('i'); p.className = 'rb-dust';
      p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = colors[i % colors.length];
      host.appendChild(p);
      var a = Math.random() * Math.PI * 2, v = 26 + Math.random() * 70;
      var dx = Math.cos(a) * v, dy = Math.sin(a) * v * .6 + 30 + Math.random() * 40;
      p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: .95 }, { transform: 'translate(calc(-50% + ' + dx.toFixed(0) + 'px), calc(-50% + ' + dy.toFixed(0) + 'px)) scale(.4)', opacity: 0 }],
        { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
  }

  window.VFX = {
    sound: S,
    ribbon: ribbon,
    init: init,
    unlocked: function () { return unlocked; },
    // run fn once sound is allowed (immediately if it already is)
    whenUnlocked: function (fn) {
      init();
      if (ctx && ctx.state === 'running') { unlocked = true; fn(null); } else waiters.push(fn);
    },
    isOn: function () { return on; },
    toggle: function () {
      on = !on;
      try { localStorage.setItem('vilaso-sound', on ? 'on' : 'off'); } catch (e) { /* ignore */ }
      if (on) { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
      return on;
    }
  };
})();
