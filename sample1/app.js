/* Vilaso sample1. Vanilla JS, no build step.
   1. Poster art (SVG) for every property
   2. Orbit hero: two rings of tiles that roll around the headline; drag to spin, tap to open
   3. Home sections: ranked list, area comparison, amenities, contact
   4. Property detail: highlights, why invest, price story (past + projection), area comparison, amenities
   ASCII only on purpose: non-ASCII characters are written as \u escapes. */
(function () {
  'use strict';
  var D = window.VILASO;
  var P = D.projects;
  var RS = '\u20b9', DOT = ' \u00b7 ', UP = '\u25b2 ', EN = '\u2013';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var FX = window.VFX || null; // sound + ribbon effects (fx.js); the site works without it
  var bySlug = {}; P.forEach(function (p) { bySlug[p.slug] = p; });

  // ---------- money ----------
  function num(n) { return Math.round(n).toLocaleString('en-IN'); }
  function inr(n) {
    if (n >= 1e7) return RS + (n / 1e7).toFixed(n >= 1e8 ? 1 : 2) + ' Cr';
    if (n >= 1e5) return RS + (n / 1e5).toFixed(n >= 1e6 ? 1 : 2).replace(/\.0+$/, '') + ' L';
    return RS + num(n);
  }
  function rate(n) { return RS + num(n); }
  function cagr(a, b, yrs) { return Math.pow(b / a, 1 / yrs) - 1; }
  function pct(x) { return (x * 100).toFixed(1) + '%'; }
  function ticket(p) { return p.minSize * p.price.now; }
  function areaMap(p) { return p.builtUp ? D.localitiesBuilt : D.localities; }
  function comparison(p) {
    var m = areaMap(p), rows = p.compare.filter(function (k) { return m[k]; }).map(function (k) { return { name: k, v: m[k] }; });
    var avg = rows.reduce(function (s, r) { return s + r.v; }, 0) / rows.length;
    return { rows: rows, avg: avg, save: avg - p.price.now, savePct: (avg - p.price.now) / avg };
  }
  function tagClass(p) { return p.sample ? 'sample' : /soon/i.test(p.tag) ? 'soon' : /best|high/i.test(p.tag) ? 'best' : 'go'; }

  // ---------- 1. poster art ----------
  var uid = 0;
  function titleLines(name) {
    if (name.length <= 12) return [name];
    var mid = name.length / 2, best = -1;
    for (var i = 0; i < name.length; i++) if (name[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    return best < 0 ? [name] : [name.slice(0, best), name.slice(best + 1)];
  }
  function motif(kind, c, id) {
    var a = c[2], s = '';
    if (kind === 'plots') {
      s += '<g transform="translate(100 168) scale(1 .56) rotate(45)">';
      for (var r = -3; r < 3; r++) for (var q = -3; q < 3; q++) {
        var x = q * 24 + 2, y = r * 24 + 2, k = (r * 7 + q * 3 + 21) % 5;
        s += '<rect x="' + x + '" y="' + y + '" width="20" height="20" rx="1.5" fill="' + (k === 0 ? a : k === 1 ? '#2f5a3e' : '#24432f') + '" opacity="' + (k === 0 ? '.85' : '.9') + '" stroke="rgba(255,255,255,.12)" stroke-width=".6"/>';
        if (k === 2) s += '<circle cx="' + (x + 10) + '" cy="' + (y + 10) + '" r="6" fill="#3f7a52"/>';
      }
      s += '<rect x="-74" y="-1.5" width="148" height="3" fill="rgba(236,235,231,.5)"/><rect x="-1.5" y="-74" width="3" height="148" fill="rgba(236,235,231,.5)"/></g>';
      s += '<path d="M100 120c-7 0-12 5-12 12 0 9 12 20 12 20s12-11 12-20c0-7-5-12-12-12z" fill="#d7262f"/><circle cx="100" cy="132" r="4.5" fill="#fff"/>';
    } else if (kind === 'villa') {
      s += '<path d="M0 205 Q60 180 120 196 T200 188 V300 H0z" fill="rgba(0,0,0,.35)"/>';
      s += '<rect x="52" y="150" width="96" height="58" fill="#efe4d0"/><path d="M44 152 L100 116 L156 152z" fill="#5a3a22"/>';
      s += '<rect x="64" y="166" width="18" height="16" fill="' + a + '"/><rect x="118" y="166" width="18" height="16" fill="' + a + '"/><rect x="91" y="176" width="18" height="32" fill="#5a3a22"/>';
      s += '<g stroke="#2a3a20" stroke-width="3" fill="none" stroke-linecap="round"><path d="M28 210 C30 180 26 160 32 140"/><path d="M172 210 C170 186 174 166 168 148"/></g>';
      s += '<g fill="#3c5a2a"><path d="M32 140 q-18 -4 -26 8 q14 -4 26 -8z"/><path d="M32 140 q18 -6 26 6 q-14 -4 -26 -6z"/><path d="M32 140 q-6 -16 6 -22 q-6 10 -6 22z"/><path d="M168 148 q-18 -4 -26 8 q14 -4 26 -8z"/><path d="M168 148 q18 -6 26 6 q-14 -4 -26 -6z"/></g>';
      s += '<path d="M60 300 L92 208 h16 L140 300z" fill="rgba(236,235,231,.12)"/>';
    } else if (kind === 'tower') {
      var b = [[34, 120, 40, 110], [80, 96, 46, 134], [132, 132, 36, 98]];
      b.forEach(function (t) {
        s += '<rect x="' + t[0] + '" y="' + t[1] + '" width="' + t[2] + '" height="' + t[3] + '" fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.1)"/>';
        for (var yy = t[1] + 8; yy < t[1] + t[3] - 8; yy += 12) for (var xx = t[0] + 6; xx < t[0] + t[2] - 6; xx += 10)
          s += '<rect x="' + xx + '" y="' + yy + '" width="5" height="6" fill="' + a + '" opacity="' + (((xx * 7 + yy * 3) % 11) > 4 ? '.85' : '.15') + '"/>';
      });
    } else if (kind === 'gate') {
      s += '<path d="M40 300 L94 200 h12 L160 300z" fill="rgba(236,235,231,.14)"/>';
      s += '<path d="M48 214 V150 a52 52 0 0 1 104 0 V214 h-16 V152 a36 36 0 0 0 -72 0 V214z" fill="#d9cdb5"/>';
      s += '<rect x="40" y="206" width="24" height="10" fill="#bfb194"/><rect x="136" y="206" width="24" height="10" fill="#bfb194"/>';
      s += '<g fill="#3a5a40"><circle cx="22" cy="196" r="16"/><circle cx="178" cy="196" r="16"/><circle cx="10" cy="210" r="12"/><circle cx="190" cy="212" r="12"/></g>';
    } else if (kind === 'hills') {
      s += '<path d="M0 180 L50 130 L90 160 L140 104 L200 160 V300 H0z" fill="rgba(127,201,143,.25)"/><path d="M0 210 L60 170 L110 196 L160 160 L200 190 V300 H0z" fill="rgba(20,40,26,.9)"/>';
      s += '<rect x="76" y="188" width="48" height="28" fill="#efe4d0"/><path d="M70 190 L100 170 L130 190z" fill="#4a3424"/><rect x="88" y="196" width="10" height="9" fill="' + a + '"/><rect x="104" y="196" width="10" height="9" fill="' + a + '"/>';
    } else {
      for (var i = 0; i < 6; i++) s += '<path d="M-10 ' + (150 + i * 18) + ' Q100 ' + (130 + i * 22) + ' 210 ' + (150 + i * 18) + ' V300 H-10z" fill="' + (i % 2 ? 'rgba(0,0,0,.25)' : 'rgba(224,100,90,.18)') + '"/>';
      s += '<rect x="86" y="152" width="28" height="18" fill="#efe4d0"/><path d="M82 154 L100 140 L118 154z" fill="#5a3a22"/>';
    }
    return s;
  }
  function poster(p) {
    var id = 'g' + (++uid), c = p.palette, lines = titleLines(p.name), fs = lines.length > 1 ? 27 : 31;
    var t = lines.map(function (l, i) { return '<tspan x="100" dy="' + (i ? fs * .95 : 0) + '">' + esc(l) + '</tspan>'; }).join('');
    var ty = lines.length > 1 ? 246 : 262;
    return '<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(p.name) + '">' +
      '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient>' +
      '<radialGradient id="' + id + 's" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + c[2] + '" stop-opacity=".9"/><stop offset=".35" stop-color="' + c[2] + '" stop-opacity=".35"/><stop offset="1" stop-color="' + c[2] + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + id + 'f" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient></defs>' +
      '<rect width="200" height="300" fill="url(#' + id + 'b)"/><circle cx="150" cy="78" r="70" fill="url(#' + id + 's)"/><circle cx="150" cy="78" r="13" fill="' + c[2] + '" opacity=".9"/>' +
      motif(p.motif, c, id) +
      '<rect width="200" height="300" fill="url(#' + id + 'f)"/>' +
      '<text x="16" y="28" fill="rgba(236,235,231,.85)" font-family="Instrument Serif, Georgia, serif" font-size="15" letter-spacing="2.4">VILASO</text><path d="M77 20 h7 l-3.5 5.5z" fill="#d7262f"/>' +
      (p.sample ? '<text x="184" y="27" text-anchor="end" fill="rgba(236,235,231,.6)" font-family="Geist, sans-serif" font-size="9" letter-spacing="1.5">SAMPLE</text>' : '<text x="184" y="27" text-anchor="end" fill="' + c[2] + '" font-family="Geist, sans-serif" font-size="9" font-weight="600" letter-spacing="1.2">' + esc(p.status.toUpperCase()) + '</text>') +
      '<text x="100" y="' + ty + '" text-anchor="middle" fill="#ecebe7" font-family="Instrument Serif, Georgia, serif" font-size="' + fs + '">' + t + '</text>' +
      '<text x="100" y="288" text-anchor="middle" fill="rgba(236,235,231,.7)" font-family="Geist, sans-serif" font-size="9.5" letter-spacing="1.3">' + esc((p.kind + DOT + p.area).toUpperCase()) + '</text></svg>';
  }

  // ---------- 2. orbit ----------
  var orbit = $('#orbit'), ring = $('#ring'), sky = $('#sky'), glow = $('#glow'), help = $('#help'), pauseBtn = $('#pause');
  var cards = [], st = { w: 0, h: 0, cx: 0, cy: 0, rx: 0, ry: 0, nMain: 0, nFar: 0 };
  var phase = 0, farPhase = .4, vel = 0, base = reduce ? 0 : .13, speed = base, paused = reduce, hot = null, visible = true, raf = 0, last = 0;
  var drag = { on: false, x: 0, t: 0, moved: 0, used: false, sign: 1 };
  var stars = [], frontIdx = null;
  function rescatter() { cards.forEach(function (c) { c.spawn = 0; }); frontIdx = null; kick(); }

  function buildRing() {
    var html = '', i;
    for (i = 0; i < 18; i++) html += cardHTML(P[i % P.length], 'main', i);
    for (i = 0; i < 12; i++) html += cardHTML(P[(i + 3) % P.length], 'far', i);
    ring.innerHTML = html;
    cards = $$('.o-card', ring).map(function (el) {
      return { el: el, ring: el.dataset.ring, i: +el.dataset.i, p: bySlug[el.dataset.slug], tilt: $('.o-tilt', el), lift: 0, spawn: reduce ? 1 : 0 };
    });
    cards.forEach(function (c) {
      if (c.ring !== 'main') { c.el.tabIndex = -1; c.el.setAttribute('aria-hidden', 'true'); return; }
      if (fine) {
        c.el.addEventListener('pointerenter', function () { if (!drag.on) setHot(c); });
        c.el.addEventListener('pointerleave', function () { if (hot === c) setHot(null); c.tilt.style.setProperty('--rx', '0deg'); c.tilt.style.setProperty('--ry', '0deg'); });
        c.el.addEventListener('pointermove', function (e) {
          var r = c.tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          c.tilt.style.setProperty('--ry', ((x - .5) * 26).toFixed(1) + 'deg'); c.tilt.style.setProperty('--rx', (-(y - .5) * 26).toFixed(1) + 'deg');
          c.tilt.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); c.tilt.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        });
      }
      c.el.addEventListener('focus', function () { setHot(c); });
      c.el.addEventListener('blur', function () { if (hot === c) setHot(null); });
      c.el.addEventListener('click', function (e) {
        e.preventDefault();
        if (drag.used) return;
        if (FX) FX.sound.click();
        openFrom(c.p, c.tilt);
      });
    });
  }
  function cardHTML(p, ringName, i) {
    return '<a class="o-card" href="#/p/' + p.slug + '" draggable="false" data-ring="' + ringName + '" data-i="' + i + '" data-slug="' + p.slug + '" aria-label="' + esc(p.name + ', ' + p.kind + ' in ' + p.area) + '">' +
      '<span class="o-tilt">' + poster(p) + '<span class="o-foil"></span><span class="o-glare"></span></span>' +
      (ringName === 'main' ? '<span class="o-label">' + esc(p.name) + DOT + rate(p.price.now) + '/sq ft</span>' : '') + '</a>';
  }
  function setHot(c) {
    if (hot === c) return;
    if (hot) hot.el.classList.remove('hot');
    hot = c;
    if (c) {
      c.el.classList.add('hot');
      glow.style.background = 'radial-gradient(circle at 50% 50%, ' + c.p.palette[2] + '33, transparent 60%)';
      glow.style.opacity = '1';
    } else glow.style.opacity = '0';
    kick();
  }
  function layout() {
    var r = orbit.getBoundingClientRect(), core = $('#core').getBoundingClientRect();
    st.w = r.width; st.h = r.height; st.cx = st.w / 2; st.cy = (core.top + core.bottom) / 2 - r.top;
    var cw = cards.length ? cards[0].el.offsetWidth : 120;
    st.rx = st.w < 640 ? st.w * .7 : st.w < 1024 ? st.w * .5 : Math.min(st.w * .44, 800);
    st.ry = Math.min(st.h * .5 - cw * .5, (core.height / 2) + cw * .95);
    if (st.w < 640) st.ry = Math.max(st.ry, st.h * .36);
    st.nMain = st.w < 640 ? 12 : st.w < 1024 ? 15 : 18;
    st.nFar = st.w < 640 ? 8 : 12;
    cards.forEach(function (c) { c.el.style.display = c.i < (c.ring === 'main' ? st.nMain : st.nFar) ? '' : 'none'; });
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    sky.width = Math.round(st.w * dpr); sky.height = Math.round(st.h * dpr); sky._dpr = dpr;
    var n = st.w < 640 ? 120 : 240;
    if (stars.length !== n) stars = Array.from({ length: n }, function (_, i) { return { x: Math.random(), y: Math.random(), r: i % 7 === 0 ? .8 + Math.random() * 1.6 : .3 + Math.random() * .9, a: Math.random() * 6.28, z: .2 + Math.random() * .8 }; });
    kick();
  }
  function drawSky(t) {
    var g = sky.getContext('2d'), d = sky._dpr || 1;
    g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, st.w, st.h);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], tw = .55 + .45 * Math.sin(t * .0012 * (1 + s.z) + s.a);
      var x = ((s.x * st.w + phase * 18 * s.z) % st.w + st.w) % st.w;
      g.globalAlpha = tw * (.25 + .6 * s.z);
      g.fillStyle = i % 9 === 0 ? '#ffcf7a' : '#ecebe7';
      g.beginPath(); g.arc(x, s.y * st.h, s.r, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
  }
  function ease(k, dt) { return 1 - Math.exp(-k * dt); }
  function frame(t) {
    raf = 0;
    var dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    var target = paused ? 0 : hot ? base * .06 : base;
    speed += (target - speed) * ease(3, dt);
    if (!drag.on) vel *= Math.exp(-dt * 1.5);
    phase -= (speed + (drag.on ? 0 : vel)) * dt;
    farPhase += (speed * .6 + (drag.on ? 0 : vel * .4)) * dt;

    var sc = Math.min(1, Math.max(0, scrollY / Math.max(1, st.h)));
    var grow = 1 + sc * .7, fade = 1 - sc * .9;
    ring.style.opacity = fade.toFixed(3);
    var moving = Math.abs(speed) > .0005 || Math.abs(vel) > .002 || drag.on;

    for (var j = 0; j < cards.length; j++) {
      var c = cards[j], main = c.ring === 'main', n = main ? st.nMain : st.nFar;
      if (c.i >= n) continue;
      if (c.spawn < 1) { c.spawn = Math.min(1, c.spawn + dt * .55); moving = true; }
      var sp = 1 - Math.pow(1 - c.spawn, 3);
      var a = (main ? phase : farPhase) + c.i / n * 6.2832 + (1 - sp) * 2.2 * (main ? 1 : -1);
      var tilt = main ? -.1 : .28, sn = Math.sin(a), cs = Math.cos(a);
      var rx = st.rx * (main ? 1 : .74) * grow * sp, ry = st.ry * (main ? 1 : 1.25) * (1 + sc * .25) * sp;
      var x0 = rx * cs, y0 = ry * sn;
      var X = st.cx + x0 * Math.cos(tilt) - y0 * Math.sin(tilt), Y = st.cy - sc * st.h * .15 + x0 * Math.sin(tilt) + y0 * Math.cos(tilt);
      var depth = (sn + 1) / 2;
      var isHot = main && hot === c;
      c.lift += ((isHot ? 1 : 0) - c.lift) * ease(9, dt);
      if (Math.abs((isHot ? 1 : 0) - c.lift) > .003) moving = true;
      var s = main ? .52 + .62 * depth : .3 + .2 * depth;
      s = (s + (Math.max(s, 1) * 1.22 - s) * c.lift) * (.35 + .65 * sp);
      var yaw = -cs * (main ? 22 : 0) * (1 - c.lift);
      var bright = main ? .32 + .68 * depth : .25 + .25 * depth;
      bright += (1 - bright) * c.lift;
      c.el.style.transform = 'translate3d(' + X.toFixed(1) + 'px,' + Y.toFixed(1) + 'px,0) scale(' + s.toFixed(3) + ') rotateY(' + yaw.toFixed(1) + 'deg)';
      c.el.style.zIndex = isHot ? 400 : Math.round(depth * 100) + (main ? 100 : 0);
      c.el.style.filter = 'brightness(' + bright.toFixed(2) + ')' + (main ? '' : ' blur(' + (1.6 - depth).toFixed(1) + 'px)');
      c.el.style.opacity = (main ? 1 : .7) * sp;
    }
    // a soft tick every time a tile passes the front of the ring (fast when dragged, like a wheel)
    if (FX && st.nMain && cards.length && cards[0].spawn >= 1) {
      var fi = Math.round((1.5708 - phase) / 6.2832 * st.nMain);
      if (frontIdx !== null && fi !== frontIdx) FX.sound.tick(Math.max(-1, Math.min(1, vel / 4)));
      frontIdx = fi;
    }
    drawSky(t);
    if ((moving || !reduce) && visible && !document.hidden) kick();
  }
  function kick() { if (!raf && visible && !document.hidden) { raf = requestAnimationFrame(frame); } }

  orbit.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.target.closest('.o-core input, .o-core button, .o-core .ask-res, .o-ui')) return;
    var r = orbit.getBoundingClientRect();
    drag.on = true; drag.x = e.clientX; drag.t = performance.now(); drag.moved = 0; drag.used = false;
    drag.sign = e.clientY - r.top > st.cy ? -1 : 1;
    vel *= .2; kick();
  });
  addEventListener('pointermove', function (e) {
    if (!drag.on) return;
    var t = performance.now(), dx = e.clientX - drag.x, dts = Math.max(1, t - drag.t) / 1000;
    drag.x = e.clientX; drag.t = t; drag.moved += Math.abs(dx);
    var d = drag.sign * dx / (st.rx * .85);
    phase += d; farPhase -= d * .4;
    vel = vel * .6 - d / dts * .4;
    if (drag.moved > 6 && !drag.used) { drag.used = true; orbit.classList.add('grabbing'); setHot(null); help.classList.add('gone'); }
    kick();
  }, { passive: true });
  function endDrag() {
    if (!drag.on) return;
    drag.on = false; orbit.classList.remove('grabbing');
    vel = Math.max(-7, Math.min(7, vel));
    setTimeout(function () { drag.used = false; }, 0);
    kick();
  }
  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
  pauseBtn.addEventListener('click', function () {
    paused = !paused; pauseBtn.setAttribute('aria-pressed', String(paused)); pauseBtn.textContent = paused ? 'Play motion' : 'Pause motion'; kick();
  });
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) { last = 0; kick(); } }).observe(orbit);
  document.addEventListener('visibilitychange', function () { last = 0; kick(); });
  addEventListener('resize', function () { clearTimeout(layout._t); layout._t = setTimeout(layout, 120); });
  addEventListener('scroll', function () { $('#hdr').classList.toggle('solid', scrollY > 40); kick(); }, { passive: true });

  // ---------- search ----------
  var q = $('#q'), res = $('#res'), hint = $('#hint');
  var HINTS = ['Plots near the new bus stand', 'Villas on Old Karur Road', 'Plots under ' + RS + '15 lakh', 'DTCP & RERA approved', 'Launching soon', 'Apartments on Trichy Road'];
  var CHIPS = [['Plots under ' + RS + '15 L', 'plots under 15'], ['Villas', 'villas'], ['Near the bus stand', 'bus stand'], ['Launching soon', 'launching'], ['Apartments', 'apartments']];
  $('#chips').innerHTML = CHIPS.map(function (c) { return '<button class="chip" type="button" data-q="' + esc(c[1]) + '">' + esc(c[0]) + '</button>'; }).join('');
  $('#chips').addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (!b) return; q.value = b.dataset.q; search(); q.focus(); });
  if (!reduce) {
    var hi = 0;
    setInterval(function () {
      if (document.hidden || q.value) return;
      hi = (hi + 1) % HINTS.length;
      hint.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 180, easing: 'ease-in' }).onfinish = function () {
        hint.textContent = HINTS[hi];
        hint.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' });
      };
    }, 2800);
  }
  function search() {
    var v = q.value.trim().toLowerCase();
    if (!v) { res.hidden = true; return; }
    var budget = (v.match(/(?:under|below|less than|<)\s*(?:rs\.?|\u20b9)?\s*(\d+(?:\.\d+)?)\s*(l|lakh|lakhs|cr|crore)?/) || []);
    var max = budget[1] ? +budget[1] * (/^c/.test(budget[2] || '') ? 1e7 : 1e5) : 0;
    var words = v.replace(/(?:under|below|less than|<)\s*(?:rs\.?|\u20b9)?\s*\d+(?:\.\d+)?\s*(l|lakh|lakhs|cr|crore)?/, '').replace(/\b(plot|villa|apartment|flat)s?\b/g, function (m, w) { return w; }).split(/\s+/).filter(function (w) { return w.length > 1 && !/^(in|near|the|on|at|a|and|for|with|me|show)$/.test(w); });
    var syn = { plot: 'plots township land', villa: 'villas house home', apartment: 'apartments flat', flat: 'apartments' };
    var hits = P.filter(function (p) {
      var hay = [p.name, p.kind, p.area, p.tag, p.status, p.line, p.address, p.approvals.join(' '), p.nearby.map(function (n) { return n[1]; }).join(' ')].join(' ').toLowerCase();
      if (max && ticket(p) > max) return false;
      return words.every(function (w) { return hay.indexOf(w) >= 0 || (syn[w] && syn[w].split(' ').some(function (s) { return hay.indexOf(s) >= 0; })); });
    });
    res.innerHTML = hits.length ? hits.map(function (p, i) {
      return '<a href="#/p/' + p.slug + '" role="option" class="' + (i ? '' : 'on') + '"><span class="th">' + poster(p) + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.kind + DOT + p.area + DOT + 'from ' + inr(ticket(p))) + '</small></span></a>';
    }).join('') : '<div class="none">Nothing matches yet. Try \u201cplots\u201d, \u201cvillas\u201d or call ' + esc(D.phones[0]) + '.</div>';
    res.hidden = false;
  }
  q.addEventListener('input', search);
  q.addEventListener('focus', search);
  q.addEventListener('keydown', function (e) {
    var items = $$('a', res), i = items.indexOf($('a.on', res));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!items.length) return; if (i >= 0) items[i].classList.remove('on'); i = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[i].classList.add('on'); }
    if (e.key === 'Enter' && i >= 0) { e.preventDefault(); items[i].click(); }
    if (e.key === 'Escape') { q.blur(); res.hidden = true; }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.ask')) res.hidden = true; });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName) && $('#det').hidden) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape' && !$('#det').hidden) closeDetail();
  });

  // ---------- 3. home sections ----------
  var ICON = {
    approved: '<path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    road: '<path d="M8 21 10 3M16 21 14 3M12 5v2M12 11v2M12 17v2"/>',
    light: '<path d="M7 21V5a2 2 0 0 1 2-2h6"/><path d="M15 3l3 4h-6z"/><path d="M15 10v2M18 9l1.5 1.5M12 9l-1.5 1.5"/>',
    water: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    gate: '<path d="M4 21V9a8 8 0 0 1 16 0v12"/><path d="M8 21V11M12 21V9M16 21V11M2 21h20"/>',
    park: '<circle cx="12" cy="8" r="5"/><path d="M12 13v8M8 21h8"/>',
    bank: '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18"/>',
    visit: '<path d="M3 17h2l2-5h10l2 5h2"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/>',
    reg: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    resale: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>'
  };
  function icon(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICON[k] || ICON.approved) + '</svg>'; }
  var PHONE = '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';
  var WA = '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z"/></svg>';
  function contactBtns(p) {
    var msg = encodeURIComponent('Hi Vilaso, I would like a site visit' + (p ? ' for ' + p.name : '') + '.');
    return '<a class="btn btn-amber" href="https://wa.me/' + D.whatsapp + '?text=' + msg + '" target="_blank" rel="noopener">' + WA + 'WhatsApp for a visit</a>' +
      D.phones.map(function (ph) { return '<a class="btn" href="tel:+91' + ph.replace(/\s/g, '') + '">' + PHONE + '+91 ' + esc(ph) + '</a>'; }).join('');
  }

  function renderHome() {
    var sorted = P.slice().sort(function (a, b) { return (!!a.sample - !!b.sample) || (comparison(b).savePct - comparison(a).savePct); });
    $('#rank').innerHTML = sorted.map(function (p, i) {
      var cm = comparison(p), g = cagr(p.price.y10, p.price.now, 10);
      return '<li class="reveal"><span class="n">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<a class="pst" href="#/p/' + p.slug + '" aria-hidden="true" tabindex="-1">' + poster(p) + '</a>' +
        '<div><h3><a href="#/p/' + p.slug + '">' + esc(p.name) + '</a></h3>' +
        '<div class="meta"><span>' + esc(p.kind + DOT + p.area) + '</span><span>' + rate(p.price.now) + '/sq ft</span><span class="up">' + UP + pct(g) + ' a year</span><span class="pill ' + tagClass(p) + '">' + esc(p.sample ? 'Sample listing' : p.tag) + '</span></div>' +
        '<p>' + esc(p.line) + (cm.save > 0 ? ' <b class="up">' + Math.round(cm.savePct * 100) + '% below the area.</b>' : '') + '</p></div>' +
        '<div class="acts"><a class="btn btn-amber" href="#/p/' + p.slug + '">See price story</a><a class="btn" href="https://wa.me/' + D.whatsapp + '?text=' + encodeURIComponent('Hi Vilaso, I would like a site visit for ' + p.name + '.') + '" target="_blank" rel="noopener">Book site visit</a></div></li>';
    }).join('');

    var rows = Object.keys(D.localities).map(function (k) { return { name: k, v: D.localities[k] }; });
    P.filter(function (p) { return !p.builtUp; }).forEach(function (p) { rows.push({ name: p.name + (p.sample ? ' (sample)' : ''), v: p.price.now, us: true }); });
    rows.sort(function (a, b) { return b.v - a.v; });
    $('#cmpAll').innerHTML = bars(rows);

    $('#am').innerHTML = D.amenities.map(function (a) { return '<div class="reveal">' + icon(a.k) + '<b>' + esc(a.t) + '</b><p>' + esc(a.d) + '</p></div>'; }).join('');
    $('#banks').textContent = D.banks.join(DOT);
    $('#cta').innerHTML = contactBtns();

    var tk = P.filter(function (p) { return !p.sample; }).map(function (p) { return '<span><b>' + esc(p.name) + '</b><i>' + UP + pct(cagr(p.price.y10, p.price.now, 10)) + '/yr</i></span>'; })
      .concat(Object.keys(D.localities).map(function (k) { return '<span><b>' + esc(k) + '</b>' + rate(D.localities[k]) + '/sq ft</span>'; })).join('');
    $('#tick').innerHTML = tk + tk;
  }
  function bars(rows) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.v; }));
    return rows.map(function (r) {
      return '<div class="bar' + (r.us ? ' us' : '') + (r.avg ? ' avg' : '') + '"><span class="l">' + esc(r.name) + '</span><span class="t"><span class="f" data-w="' + (r.v / max * 100).toFixed(1) + '"></span></span><span class="v">' + rate(r.v) + '</span></div>';
    }).join('');
  }

  // reveal + bar fill on scroll
  function watch(root) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        el.classList.add('in');
        $$('.f', el).forEach(function (f, i) { setTimeout(function () { f.style.width = f.dataset.w + '%'; }, i * 70); });
        if (el.classList.contains('chart')) drawChart(el);
      });
    }, { root: root || null, threshold: .15 });
    $$('.reveal, .cmp, .chart', root || document).forEach(function (el) { io.observe(el); });
  }

  // ---------- 4. property detail ----------
  var det = $('#det'), detIn = $('#detIn'), fromRect = null, openSlug = null;
  var PIN = '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  var STEPS = [['y10', '10 years ago'], ['y5', '5 years ago'], ['y2', '2 years ago'], ['now', 'Today'], ['p2', 'In 2 years'], ['p5', 'In 5 years'], ['p10', 'In 10 years']];

  function renderDetail(p) {
    var i = P.indexOf(p), prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
    var cm = comparison(p), g10 = cagr(p.price.y10, p.price.now, 10), gp = cagr(p.price.now, p.price.p10, 10);
    var cmpRows = cm.rows.slice(); cmpRows.push({ name: 'Area average', v: Math.round(cm.avg), avg: true }); cmpRows.push({ name: p.name, v: p.price.now, us: true });
    cmpRows.sort(function (a, b) { return b.v - a.v; });
    var unit = p.builtUp ? 'sq ft built-up' : 'sq ft';
    var lo = p.builtUp ? 900 : 600, hi = p.builtUp ? 2400 : 3000;

    return '<div class="d-bg" aria-hidden="true">' + poster(p) + '</div>' +
      '<div class="d-top"><a class="logo" href="#/" aria-label="Back to all properties"><span class="logo-w">VILASO</span><i class="logo-t"></i><span class="logo-s">Properties</span></a>' +
      '<button class="btn d-close" type="button" id="close"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>All properties</button></div>' +

      '<section class="d-hero"><div>' +
      '<div class="d-kick"><span class="pill ' + tagClass(p) + '">' + esc(p.sample ? 'Sample listing' : p.tag) + '</span>' + p.approvals.map(function (a) { return '<span class="pill go">' + esc(a) + '</span>'; }).join('') + '</div>' +
      '<h1 id="det-h">' + esc(p.name) + '</h1>' +
      '<p class="d-line">' + esc(p.line) + '</p>' +
      '<p class="d-addr">' + PIN + esc(p.address) + '</p>' +
      (p.sample ? '<p class="sample-note">This is a sample listing to show how more Vilaso projects will appear. Details and prices are made up.</p>' : '') +
      '<div class="stats"><div><small>Price today</small><b>' + rate(p.price.now) + '</b><small>per ' + unit + '</small></div>' +
      '<div><small>Starts at</small><b>' + inr(ticket(p)) + '</b><small>' + num(p.minSize) + ' sq ft</small></div>' +
      '<div><small>Grew</small><b class="up">' + pct(g10) + '</b><small>a year, 10 yrs</small></div>' +
      '<div><small>vs area</small><b class="' + (cm.save > 0 ? 'up' : '') + '">' + (cm.save > 0 ? EN + Math.round(cm.savePct * 100) + '%' : '+' + Math.round(-cm.savePct * 100) + '%') + '</b><small>' + (cm.save > 0 ? 'below average' : 'above average') + '</small></div></div>' +
      '<div class="d-acts">' + contactBtns(p) + '</div>' +
      '</div><div class="d-poster" id="dPoster">' + poster(p) + '</div></section>' +

      '<section class="d-sec reveal"><h2>Highlights</h2><p class="sub">' + esc(p.kind + DOT + p.sizes) + '</p><ul class="hl">' + p.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul></section>' +

      '<section class="d-sec reveal"><h2>Why invest here</h2><p class="sub">The case for ' + esc(p.name) + ', in plain words.</p><div class="why">' +
      p.why.map(function (w, k) { return '<div><span class="k">' + String(k + 1).padStart(2, '0') + '</span><b>' + esc(w[0]) + '</b><p>' + esc(w[1]) + '</p></div>'; }).join('') + '</div></section>' +

      '<section class="d-sec reveal"><h2>Price story</h2><p class="sub">Rate per ' + unit + ' over the last 10 years, and where it is headed. The dotted line is our projection at ' + pct(gp) + ' a year.</p>' +
      '<div class="ps"><div class="panel chart" data-slug="' + p.slug + '"></div>' +
      '<div class="panel"><table class="ptab"><thead><tr><th>When</th><th>Per sq ft</th><th>' + num(p.minSize) + ' sq ft</th></tr></thead><tbody>' +
      STEPS.map(function (s) { var v = p.price[s[0]]; return '<tr class="' + (s[0] === 'now' ? 'now' : s[0][0] === 'p' ? 'f' : '') + '"><td>' + s[1] + ' <small style="color:var(--mute-2)">' + D.years[s[0]] + '</small></td><td>' + rate(v) + '</td><td>' + inr(v * p.minSize) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '<div class="panel calc"><label for="sz">If you buy <b><span id="szv">' + num(p.minSize) + '</span> sq ft</b> today</label><input id="sz" type="range" min="' + lo + '" max="' + hi + '" step="50" value="' + p.minSize + '"><div class="row" id="calc"></div></div></section>' +

      '<section class="d-sec reveal"><h2>Compare with the area</h2>' +
      '<div class="save"><span class="big">' + (cm.save > 0 ? rate(cm.save) : rate(-cm.save)) + '</span><p>' + (cm.save > 0
        ? 'less per sq ft than the average of nearby areas. On ' + num(p.minSize) + ' sq ft that is <b class="up">' + inr(cm.save * p.minSize) + ' saved</b> on day one.'
        : 'more per sq ft than the nearby average, for a gated, approved layout with every amenity in place.') + '</p></div>' +
      '<div class="cmp">' + bars(cmpRows) + '</div><p class="fine">' + (p.builtUp ? 'Built-up rates for villas and apartments.' : 'Plot rates.') + ' Indicative 2026 averages.</p></section>' +

      '<section class="d-sec reveal"><h2>Nearby</h2><p class="sub">Distances from the site.</p><div class="near">' + p.nearby.map(function (n) { return '<span><b>' + esc(n[0]) + '</b>' + esc(n[1]) + '</span>'; }).join('') + '</div></section>' +

      '<section class="d-sec reveal"><h2>Included with Vilaso</h2><p class="sub">Everything you get when you buy with us.</p><div class="am">' +
      D.amenities.map(function (a) { return '<div>' + icon(a.k) + '<b>' + esc(a.t) + '</b><p>' + esc(a.d) + '</p></div>'; }).join('') + '</div>' +
      '<div class="banks"><span>Loans from</span><b>' + esc(D.banks.join(DOT)) + '</b></div></section>' +

      '<section class="d-sec reveal visit" style="padding-bottom:0"><h2>Walk the site with us.</h2><p>Free pick-up and drop for your family. Pick a time that suits you.</p><div class="cta">' + contactBtns(p) + '</div></section>' +

      '<p class="d-note">Prices, past rates and projections on this page are illustrative for this prototype. Projections are estimates, not a promise of returns.</p>' +
      '<nav class="d-next" aria-label="More properties"><a href="#/p/' + prev.slug + '"><span class="th">' + poster(prev) + '</span><span><small>Previous</small><b>' + esc(prev.name) + '</b></span></a>' +
      '<a href="#/p/' + next.slug + '"><span class="th">' + poster(next) + '</span><span><small>Next</small><b>' + esc(next.name) + '</b></span></a></nav>';
  }

  function drawChart(el) {
    var p = bySlug[el.dataset.slug]; if (!p || el._done) return; el._done = true;
    var W = 640, H = 300, L = 58, R = 24, T = 34, B = 40;
    var keys = STEPS.map(function (s) { return s[0]; }), yrs = keys.map(function (k) { return D.years[k]; }), vals = keys.map(function (k) { return p.price[k]; });
    var x0 = yrs[0], x1 = yrs[yrs.length - 1], vmax = Math.max.apply(null, vals) * 1.12;
    var step = Math.pow(10, Math.floor(Math.log10(vmax / 4))), tick = Math.ceil(vmax / 4 / step) * step; vmax = tick * 4;
    var X = function (y) { return L + (y - x0) / (x1 - x0) * (W - L - R); }, Y = function (v) { return T + (1 - v / vmax) * (H - T - B); };
    var pts = yrs.map(function (y, i) { return [X(y), Y(vals[i])]; });
    var path = function (a) { return a.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' '); };
    var past = pts.slice(0, 4), fut = pts.slice(3);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Price per square foot from ' + x0 + ' to ' + x1 + '"><defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f2a93b" stop-opacity=".35"/><stop offset="1" stop-color="#f2a93b" stop-opacity="0"/></linearGradient></defs>';
    for (var g = 0; g <= 4; g++) { var yv = tick * g; s += '<line class="ax" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(yv) + '" y2="' + Y(yv) + '"/><text class="yl" x="' + (L - 10) + '" y="' + (Y(yv) + 4) + '" text-anchor="end">' + RS + num(yv) + '</text>'; }
    yrs.forEach(function (y) { s += '<text class="xl" x="' + X(y) + '" y="' + (H - 12) + '" text-anchor="middle">' + y + '</text>'; });
    s += '<line class="nowline" x1="' + X(D.years.now) + '" x2="' + X(D.years.now) + '" y1="' + T + '" y2="' + (H - B) + '"/><text class="tag" x="' + X(D.years.now) + '" y="' + (T - 14) + '">Today</text>';
    s += '<path class="area" d="' + path(past) + ' L' + past[3][0] + ' ' + (H - B) + ' L' + past[0][0] + ' ' + (H - B) + 'z" opacity="0"/>';
    s += '<path class="past" d="' + path(past) + '"/><path class="fut" d="' + path(fut) + '"/>';
    pts.forEach(function (q, i) { s += '<circle class="pt' + (i > 3 ? ' f' : '') + (i === 3 ? ' now' : '') + '" cx="' + q[0] + '" cy="' + q[1] + '" r="5" opacity="0"/><text class="vl" x="' + q[0] + '" y="' + (q[1] - 13) + '" opacity="0">' + RS + num(vals[i]) + '</text>'; });
    s += '</svg><div class="legend"><span><i></i>Actual</span><span><i class="f"></i>Projected</span></div>';
    el.innerHTML = s;
    var svg = $('svg', el), pastEl = $('.past', svg), futEl = $('.fut', svg);
    var len = pastEl.getTotalLength();
    if (reduce) { $$('[opacity="0"]', svg).forEach(function (n) { n.setAttribute('opacity', 1); }); return; }
    pastEl.style.strokeDasharray = len; pastEl.style.strokeDashoffset = len;
    pastEl.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1400, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' });
    futEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 1300, fill: 'forwards' });
    $('.area', svg).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 700, fill: 'forwards' });
    $$('.pt, .vl', svg).forEach(function (n, k) {
      var idx = Math.floor(k / 2), d = idx <= 3 ? idx * 330 : 1300 + (idx - 3) * 220;
      n.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: d, fill: 'forwards' });
    });
  }

  function calc(p) {
    var sz = +$('#sz').value; $('#szv').textContent = num(sz);
    var now = sz * p.price.now;
    $('#calc').innerHTML = [['now', 'Pay today'], ['p2', 'Worth in 2 yrs'], ['p5', 'Worth in 5 yrs'], ['p10', 'Worth in 10 yrs']].map(function (s) {
      var v = sz * p.price[s[0]];
      return '<div><small>' + s[1] + '</small><b>' + inr(v) + '</b>' + (s[0] === 'now' ? '<small>' + rate(p.price.now) + '/sq ft</small>' : '<span class="up">+' + inr(v - now) + '</span>') + '</div>';
    }).join('');
  }

  function openFrom(p, el) {
    fromRect = el ? el.getBoundingClientRect() : null;
    if (location.hash === '#/p/' + p.slug) route(); else location.hash = '#/p/' + p.slug;
  }
  function showDetail(p) {
    var wasOpen = !det.hidden;
    openSlug = p.slug;
    detIn.innerHTML = renderDetail(p);
    det.hidden = false; det.scrollTop = 0; document.body.classList.add('lock');
    document.title = p.name + ' \u00b7 Vilaso Properties';
    $('#close').addEventListener('click', closeDetail);
    $('#sz').addEventListener('input', function () { calc(p); }); calc(p);
    watch(det);
    var target = $('#dPoster');
    if (fromRect && !reduce) {
      var tr = target.getBoundingClientRect(), fly = document.createElement('div');
      fly.className = 'fly'; fly.innerHTML = poster(p);
      Object.assign(fly.style, { left: tr.left + 'px', top: tr.top + 'px', width: tr.width + 'px', height: tr.height + 'px' });
      document.body.appendChild(fly);
      target.style.visibility = 'hidden';
      var sx = fromRect.width / tr.width, sy = fromRect.height / tr.height;
      fly.animate([{ transform: 'translate(' + (fromRect.left - tr.left) + 'px,' + (fromRect.top - tr.top) + 'px) scale(' + sx + ',' + sy + ')', transformOrigin: '0 0', borderRadius: '10px' },
        { transform: 'none', transformOrigin: '0 0', borderRadius: '16px' }], { duration: 720, easing: 'cubic-bezier(.65,0,.2,1)' }).onfinish = function () { target.style.visibility = ''; fly.remove(); };
      det.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease-out' });
      $$('.d-hero > div:first-child > *', det).forEach(function (n, k) { n.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 260 + k * 60, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }); });
    } else if (!reduce) {
      det.animate([{ opacity: 0, transform: wasOpen ? 'translateX(30px)' : 'scale(1.02)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
    var flew = !!fromRect && !reduce;
    fromRect = null;
    setTimeout(function () { $('#close').focus({ preventScroll: true }); }, 50);
    // red ribbon across the page: the visitor cuts it to reveal the property
    $$('.rb').forEach(function (n) { n.remove(); });
    if (FX) setTimeout(function () { if (openSlug === p.slug && !$('.rb')) FX.ribbon(document.body); }, flew ? 700 : 200);
  }
  function hideDetail() {
    if (det.hidden) return;
    var done = function () { det.hidden = true; detIn.innerHTML = ''; document.body.classList.remove('lock'); };
    $$('.rb').forEach(function (n) { n.remove(); });
    openSlug = null; document.title = 'Vilaso Properties \u00b7 Plots & villas in Dindigul';
    if (reduce) done(); else det.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in' }).onfinish = done;
    kick();
  }
  // how many detail pages were opened from the home page, so "All properties" can step back to where you were
  var depth = 0, isDet = function (u) { return /#\/p\//.test(u || ''); };
  function closeDetail() {
    if (depth > 0) { var d = depth; depth = 0; history.go(-d); } else location.hash = '#/';
  }
  function route() {
    var m = location.hash.match(/^#\/p\/([\w-]+)/), p = m && bySlug[m[1]];
    if (p) showDetail(p); else { depth = 0; hideDetail(); }
  }
  addEventListener('hashchange', function (e) {
    if (isDet(e.newURL)) depth = isDet(e.oldURL) ? (depth ? depth + 1 : 0) : 1;
    route();
  });
  // links to a property from the ranked list or search keep the "fly" animation from their poster
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#/p/"]'); if (!a || a.classList.contains('o-card')) return;
    var img = a.querySelector('.pst, .th') || (a.closest('li') && a.closest('li').querySelector('.pst'));
    if (img && det.hidden) fromRect = img.getBoundingClientRect();
    if (FX) FX.sound.click();
    res.hidden = true;
  });

  // ---------- sound ----------
  function setupSound() {
    var b = $('#snd');
    if (!FX) { b.hidden = true; return; }
    var ON = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
    var OFF = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 6M22 9l-5 6"/></svg>';
    var paint = function () { var on = FX.isOn(); b.setAttribute('aria-pressed', String(on)); b.innerHTML = (on ? ON : OFF) + (on ? 'Sound on' : 'Sound off'); };
    paint();
    b.addEventListener('click', function () { FX.toggle(); paint(); if (FX.isOn()) FX.sound.click(); });
    var hd = $('.o-help-d'), hm = $('.o-help-m'), oldD = hd.textContent, oldM = hm.textContent;
    if (FX.isOn()) { hd.textContent = 'Tap anywhere for sound \u00B7 drag to spin'; hm.textContent = 'Tap anywhere for sound \u00B7 swipe to spin'; }
    // sound can only start after the first tap or key press; then the tiles scatter again with their sound
    FX.whenUnlocked(function (e) {
      hd.textContent = oldD; hm.textContent = oldM;
      var t = e && e.target;
      if (FX.isOn() && !(t && t.closest && t.closest('a, button, input, .o-card, .det'))) { rescatter(); FX.sound.scatter(); }
    });
  }

  // ---------- boot ----------
  buildRing();
  setupSound();
  renderHome();
  watch();
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  route();
})();
