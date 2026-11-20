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
  var BOW = '<svg viewBox="0 0 200 150" aria-hidden="true"><defs>' +
    '<linearGradient id="rbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a61"/><stop offset=".45" stop-color="#d81f28"/><stop offset="1" stop-color="#7d0a12"/></linearGradient>' +
    '<linearGradient id="rbk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6d73"/><stop offset="1" stop-color="#9c0e16"/></linearGradient></defs>' +
    '<path d="M92 80 L66 146 L80 138 L88 150 L100 84z" fill="#a30f18"/><path d="M108 80 L134 146 L120 138 L112 150 L100 84z" fill="#8f0c14"/>' +
    '<path d="M100 72 C74 18 14 18 20 60 C26 100 78 92 100 72z" fill="url(#rbg)"/><path d="M100 72 C126 18 186 18 180 60 C174 100 122 92 100 72z" fill="url(#rbg)"/>' +
    '<path d="M100 72 C80 36 42 34 40 58" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/><path d="M100 72 C120 36 158 34 160 58" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="84" y="56" width="32" height="32" rx="9" fill="url(#rbk)" stroke="#e9b949" stroke-width="1.5"/></svg>';
  var SCISSORS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/></svg>';
  var WORDS = new Array(14).join('VILASO PROPERTIES \u2726 GRAND REVEAL \u2726 ');

  function ribbon(host, done) {
    done = done || function () {};
    if (reduce) { done(); return; }
    var w = document.createElement('div');
    w.className = 'rb'; w.tabIndex = 0;
    w.setAttribute('role', 'button'); w.setAttribute('aria-label', 'Cut the ribbon to open this property');
    w.innerHTML = '<div class="rb-veil"></div>' +
      '<div class="rb-band"><div class="rb-half rb-l"><span>' + WORDS + '</span></div><div class="rb-half rb-r"><span>' + WORDS + '</span></div></div>' +
      '<div class="rb-bow">' + BOW + '</div>' +
      '<p class="rb-hint">' + SCISSORS + '<span>Tap the ribbon to cut it open</span></p>';
    host.appendChild(w);
    var band = w.querySelector('.rb-band'), L = w.querySelector('.rb-l'), R = w.querySelector('.rb-r'), bow = w.querySelector('.rb-bow'), veil = w.querySelector('.rb-veil'), hint = w.querySelector('.rb-hint');
    var cut = false, timer = 0;
    var stop = function (e) { e.preventDefault(); };
    w.addEventListener('wheel', stop, { passive: false });
    w.addEventListener('touchmove', stop, { passive: false });

    // entrance: the two halves stretch in from the sides and meet, then the bow pops
    S.swish();
    veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'both' });
    L.animate([{ transform: 'translateX(-105%)' }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    R.animate([{ transform: 'translateX(105%)' }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    bow.animate([{ transform: 'translate(-50%,-50%) scale(0) rotate(-30deg)' }, { transform: 'translate(-50%,-50%) scale(1.15) rotate(6deg)', offset: .7 }, { transform: 'translate(-50%,-50%) scale(1) rotate(0)' }], { duration: 600, delay: 450, easing: 'ease-out', fill: 'both' });
    hint.animate([{ opacity: 0, transform: 'translate(-50%, 10px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 500, delay: 900, fill: 'both' });
    setTimeout(function () { if (!cut) w.focus({ preventScroll: true }); }, 700);
    timer = setTimeout(function () { doCut(innerWidth * .5, innerHeight * .5); }, 9000);

    function doCut(x, y) {
      if (cut) return; cut = true; clearTimeout(timer);
      var br = band.getBoundingClientRect();
      var pct = Math.max(.12, Math.min(.88, (x - br.left) / br.width));
      var midY = br.top + br.height / 2;
      w.style.setProperty('--cut', (pct * 100).toFixed(2) + '%');
      w.classList.add('cut');
      S.snip();
      setTimeout(S.shimmer, 160);

      // scissors snapping shut at the cut point + a bright slash
      var sc = document.createElement('div'); sc.className = 'rb-sc'; sc.innerHTML = SCISSORS;
      sc.style.left = x + 'px'; sc.style.top = midY + 'px'; w.appendChild(sc);
      sc.animate([{ transform: 'translate(-50%,-50%) rotate(-90deg) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-50%) rotate(-90deg) scale(1.25)', opacity: 1, offset: .35 }, { transform: 'translate(-50%,-50%) rotate(-90deg) scale(1)', opacity: 0 }], { duration: 600, easing: 'ease-out', fill: 'forwards' });
      var sl = document.createElement('div'); sl.className = 'rb-slash'; sl.style.left = x + 'px'; sl.style.top = midY + 'px'; w.appendChild(sl);
      sl.animate([{ transform: 'translate(-50%,-50%) rotate(14deg) scaleY(0)', opacity: 1 }, { transform: 'translate(-50%,-50%) rotate(14deg) scaleY(1)', opacity: 1, offset: .4 }, { transform: 'translate(-50%,-50%) rotate(14deg) scaleY(1.1)', opacity: 0 }], { duration: 450, easing: 'ease-out', fill: 'forwards' });

      // each half recoils, droops from its outer end, then drops away
      L.style.transformOrigin = '0% 50%'; R.style.transformOrigin = '100% 50%';
      L.animate([{ transform: 'none' }, { transform: 'translateX(-2%) rotate(9deg)', offset: .3 }, { transform: 'translate(-8%, 120vh) rotate(38deg)' }], { duration: 1300, easing: 'cubic-bezier(.45,0,.7,.4)', fill: 'forwards' });
      R.animate([{ transform: 'none' }, { transform: 'translateX(2%) rotate(-9deg)', offset: .3 }, { transform: 'translate(8%, 120vh) rotate(-38deg)' }], { duration: 1300, easing: 'cubic-bezier(.45,0,.7,.4)', fill: 'forwards' });
      var side = pct < .5 ? 1 : -1;
      bow.animate([{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(calc(-50% + ' + (side * 30) + 'px), -70%) rotate(' + (side * 20) + 'deg)', offset: .25 }, { transform: 'translate(calc(-50% + ' + (side * 90) + 'px), 110vh) rotate(' + (side * 220) + 'deg)' }], { duration: 1400, easing: 'cubic-bezier(.4,0,.8,.5)', fill: 'forwards' });
      hint.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
      veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 250, fill: 'forwards' });
      confetti(w, x, midY);
      setTimeout(function () { w.remove(); done(); }, 1500);
    }
    w.addEventListener('pointerdown', function (e) { if (e.button === 0) doCut(e.clientX, e.clientY); });
    w.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCut(innerWidth / 2, innerHeight / 2); }
      if (e.key === 'Escape') { e.stopPropagation(); doCut(innerWidth / 2, innerHeight / 2); }
    });
  }

  function confetti(host, x, y) {
    var colors = ['#f2a93b', '#ffcf7a', '#e9b949', '#d81f28', '#ff5a61', '#ecebe7'];
    for (var i = 0; i < 46; i++) {
      var p = document.createElement('i'); p.className = 'rb-bit';
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.background = colors[i % colors.length];
      if (i % 3 === 0) { p.style.width = '6px'; p.style.height = '6px'; p.style.borderRadius = '50%'; }
      host.appendChild(p);
      var a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 320;
      var dx = Math.cos(a) * v, dy = Math.sin(a) * v - 180, r = (Math.random() * 2 - 1) * 720;
      p.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + (dx * .6).toFixed(0) + 'px), calc(-50% + ' + (dy * .6).toFixed(0) + 'px)) rotate(' + (r * .5).toFixed(0) + 'deg)', opacity: 1, offset: .35 },
        { transform: 'translate(calc(-50% + ' + dx.toFixed(0) + 'px), calc(-50% + ' + (dy + 520).toFixed(0) + 'px)) rotate(' + r.toFixed(0) + 'deg)', opacity: 0 }
      ], { duration: 1200 + Math.random() * 500, easing: 'cubic-bezier(.2,.6,.5,1)', fill: 'forwards' });
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
