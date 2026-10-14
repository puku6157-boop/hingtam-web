// Home page: swipe demo, match scene, feature tour, privacy playground.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var data = JSON.parse($('home-data').textContent);

  /* ---------- swipe deck ---------- */
  var people = data.samples, deck = $('deck'), idx = 0, busy = false;
  // Load every sample photo up front, so the next card never appears half-loaded after a swipe.
  people.forEach(function (p) { new Image().src = p.image; });

  /* ---------- petal burst (the app's own): peach-blossom petals and gold sparks flung out from a point ----------
     layer: a zero-size, absolutely positioned element sitting on the spot the burst starts from.
     k: size scale (the app's numbers are for a 390px-wide phone). o: how many, how far, how high, how far they fall. */
  function petalBurst(layer, k, o) {
    var rnd = function (a, b) { return a + Math.random() * (b - a); }, list = [], i, total = o.petals + o.sparks;
    var PETAL = 'M12 12 C7.5 10.3 6.5 5.7 8.9 2.5 C9.9 1.3 11 1.1 12 2.3 C13 1.1 14.1 1.3 15.1 2.5 C17.5 5.7 16.5 10.3 12 12 Z';
    var SPARK = 'M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5Z';
    for (i = 0; i < total; i++) {
      var petal = i < o.petals, a = rnd(0, Math.PI * 2), d = (petal ? rnd(0.4, 1) : rnd(0.5, 1.15)) * o.spread * k;
      var size = (petal ? rnd(15, 27) : rnd(9, 17)) * k * 1.15;
      var el = document.createElement('div'); el.className = 'm-p';
      el.innerHTML = petal
        ? '<svg width="' + size + '" height="' + size * 1.08 + '" viewBox="6.4 1 11.2 11.2" aria-hidden="true"><path d="' + PETAL + '" fill="url(#mPetalGrad)"/></svg>'
        : '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + SPARK + '" fill="#F3E3BE"/></svg>';
      layer.appendChild(el);
      list.push({ el: el, petal: petal, size: size, h: petal ? size * 1.08 : size, dx: Math.cos(a) * d, dy: Math.sin(a) * d - o.lift * (petal ? 1 : 0.5) * k,
        fall: o.fall * (petal ? 1 : 0.3) * k, r0: petal ? rnd(0, 6.28) : 0, vr: petal ? rnd(-4, 4) : 0, phase: rnd(0, 6.28), freq: rnd(5, 9), life: petal ? rnd(1900, 3100) : rnd(650, 1050) });
    }
    var start = performance.now();
    (function step(now) {
      var t = now - start, alive = false;
      list.forEach(function (p) {
        if (!p.el.isConnected) return; // the layer was cleared (scene replayed): stop quietly
        var u = Math.min(1, t / p.life), e = 1 - (1 - u) * (1 - u);
        if (u >= 1) { p.el.remove(); return; }
        alive = true;
        var flutter = p.petal ? Math.abs(Math.cos(u * p.freq + p.phase)) * 0.75 + 0.25 : 1, shrink = p.petal ? 1 : 1 - u * 0.6;
        p.el.style.opacity = u < 0.7 ? 1 : Math.max(0, (1 - u) / 0.3);
        p.el.style.transform = 'translate(' + (p.dx * e - p.size / 2) + 'px,' + (p.dy * e + p.fall * u * u - p.h / 2) + 'px) rotate(' + (p.r0 + p.vr * u) + 'rad) scale(' + flutter * shrink + ',' + shrink + ')';
      });
      if (alive) requestAnimationFrame(step);
    })(start);
    return list;
  }
  // Super Like on the swipe demo: a puff of petals from the blossom button, as in the app.
  var deckLayer = null;
  function deckBurst() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var screen = deck.parentNode, sr = screen.getBoundingClientRect(), br = $('starBtn').getBoundingClientRect();
    if (!deckLayer) {
      deckLayer = document.createElement('div');
      deckLayer.setAttribute('aria-hidden', 'true');
      deckLayer.style.cssText = 'position:absolute;width:0;height:0;z-index:30;pointer-events:none';
      screen.appendChild(deckLayer);
    }
    deckLayer.style.left = (br.left + br.width / 2 - sr.left) + 'px';
    deckLayer.style.top = (br.top + br.height / 2 - sr.top) + 'px';
    petalBurst(deckLayer, sr.width / 390, { petals: 16, sparks: 10, spread: 150, lift: 110, fall: 90 });
  }
  function mk(p) {
    var el = document.createElement('div');
    el.className = 'card-p';
    el.style.backgroundImage = 'url(' + p.image + ')';
    el.innerHTML = '<div class="stamp like">LIKE</div><div class="stamp pass">PASS</div><div class="stamp super">SUPER LIKE</div><div class="info"><div class="nm">' + p.name + '<span>, ' + p.age + '</span></div><div class="meta">' + p.distance + '</div><div class="chips">' + p.chips.map(function (x) { return '<span class="chip">' + x + '</span>'; }).join('') + '</div></div>';
    return el;
  }
  function render() {
    deck.innerHTML = '';
    [2, 1, 0].forEach(function (o) {
      var el = mk(people[(idx + o) % people.length]);
      // Every card is full size and sits exactly under the top one (no scale or offset). A smaller card behind showed
      // white screen around it while the top card flew away, then jumped to full size when it became the top card.
      el.style.zIndex = 10 - o; el.dataset.o = o; deck.appendChild(el);
      if (o === 0) attach(el);
    });
  }
  var FLING_MS = 800; // how long a card takes to leave the screen (slow enough to watch)
  function fling(el, dir) {
    if (busy) return; busy = true;
    el.style.transition = 'transform ' + FLING_MS + 'ms cubic-bezier(.25,.6,.35,1),opacity ' + FLING_MS + 'ms ease-in';
    el.style.transform = dir === 0 ? 'translate(0,-560px) scale(.92)' : 'translate(' + (dir * 420) + 'px,-30px) rotate(' + (dir * 22) + 'deg)';
    el.style.opacity = '0';
    setTimeout(function () { idx = (idx + 1) % people.length; busy = false; render(); }, FLING_MS);
  }
  function attach(el) {
    // Left/right swipe only. Vertical touches are left to the browser (touch-action: pan-y on the card),
    // so a finger on the card can still scroll the page; the browser then cancels the drag and the card springs back.
    var sx = 0, dx = 0, drag = false, like = el.querySelector('.stamp.like'), pass = el.querySelector('.stamp.pass');
    function clamp(v) { return Math.max(0, Math.min(1, v)); }
    el.addEventListener('pointerdown', function (e) { drag = true; sx = e.clientX; dx = 0; el.classList.add('dragging'); el.style.transition = 'none'; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return; dx = e.clientX - sx;
      el.style.transform = 'translate(' + dx + 'px,0) rotate(' + (dx / 18) + 'deg)';
      like.style.opacity = clamp(dx / 90); pass.style.opacity = clamp(-dx / 90);
    });
    function end() {
      if (!drag) return; drag = false; el.classList.remove('dragging');
      if (Math.abs(dx) > 90) fling(el, dx > 0 ? 1 : -1);
      else { el.style.transition = 'transform .3s'; el.style.transform = ''; like.style.opacity = 0; pass.style.opacity = 0; }
      dx = 0;
    }
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  function top() { return deck.querySelector('.card-p[data-o="0"]'); }
  function btn(id, dir) {
    $(id).addEventListener('click', function () {
      var el = top(); if (!el) return;
      el.querySelector(dir === 0 ? '.stamp.super' : dir > 0 ? '.stamp.like' : '.stamp.pass').style.opacity = 1;
      if (dir === 0) deckBurst();
      setTimeout(function () { fling(el, dir); }, 250);
    });
  }
  btn('passBtn', -1); btn('likeBtn', 1); btn('starBtn', 0);
  render();

  /* ---------- feature tour: plays by itself, pauses when touched ---------- */
  var steps = [].slice.call(document.querySelectorAll('.step')), panels = steps.map(function (_, i) { return $('p' + i); });
  var cur = 0, timer = null, box = $('howBox'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i) {
    cur = i;
    steps.forEach(function (s, k) { s.setAttribute('aria-selected', String(k === i)); var bar = s.querySelector('.bar-p i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; });
    panels.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    schedule();
  }
  function schedule() { clearTimeout(timer); if (reduce || box.classList.contains('paused')) return; timer = setTimeout(function () { show((cur + 1) % steps.length); }, 6000); }
  steps.forEach(function (s) { s.addEventListener('click', function () { show(+s.dataset.i); }); });
  ['mouseenter', 'focusin'].forEach(function (ev) { box.addEventListener(ev, function () { box.classList.add('paused'); clearTimeout(timer); }); });
  ['mouseleave', 'focusout'].forEach(function (ev) { box.addEventListener(ev, function () { box.classList.remove('paused'); schedule(); }); });
  schedule();

  /* ---------- privacy playground ---------- */
  var pv = $('pv'), state = { age: true, active: true, hide: false };
  function paint() {
    $('pvAge').textContent = state.age ? ', 27' : '';
    pv.classList.toggle('active', state.active);
    pv.classList.toggle('hidden', state.hide);
  }
  [].slice.call(document.querySelectorAll('.sw')).forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-checked') !== 'true';
      b.setAttribute('aria-checked', String(on)); state[b.dataset.k] = on; paint();
    });
  });
  var km = $('km'); km.addEventListener('input', function () { $('kmv').textContent = km.value; });
  paint();

  /* ---------- match scene ----------
     The app's match moment, played in time order: two photos fly in and meet, a flash and a ring
     go off, a heart pops in and petals burst out, then the words and buttons rise into place.
     The numbers (timings, springs, how far things fly) are the app's own, scaled to this phone. */
  var scene = $('mscene');
  if (scene) {
    var at = function (sel) { return scene.querySelector(sel); };
    var cardL = at('.m-l'), cardR = at('.m-r'), heart = at('.m-heart'), flash = at('.m-flash'), ring = at('.m-ring'),
        petalsBox = at('.m-petals'), bg = at('.m-bg');
    var reveals = [at('.m-r1'), at('.m-r2'), at('.m-r3'), at('.m-r4'), at('.m-r5'), at('.m-r6')];
    var START = 120, APPROACH = 560, HIT = START + APPROACH + 10, TEXT = HIT + 260;
    var REVEAL_AT = [0, 170, 340, 430, 520, 680];
    var raf = 0, t0 = 0, burst = null;

    var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
    var lerp = function (a, b, p) { return a + (b - a) * p; };
    var easeOut = function (u) { return 1 - (1 - u) * (1 - u); };
    function bezier(x1, y1, x2, y2) { // CSS-style cubic-bezier easing
      function pt(t, a, b) { return 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t; }
      return function (x) {
        var lo = 0, hi = 1, t = x;
        for (var i = 0; i < 24; i++) { t = (lo + hi) / 2; if (pt(t, x1, x2) < x) lo = t; else hi = t; }
        return pt(t, y1, y2);
      };
    }
    var ACCEL = bezier(0.5, 0, 0.85, 0.5);
    function spring(sec, damping, stiffness, mass) { // 0 -> 1, starting from rest, overshoots then settles
      var w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
      if (sec <= 0) return 0;
      if (z < 1) { var wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * sec) * (Math.cos(wd * sec) + (z * w0 / wd) * Math.sin(wd * sec)); }
      return 1 - Math.exp(-w0 * sec) * (1 + w0 * sec);
    }

    function pose(el, from, impact, final, delay, t) {
      var u = t - delay, x, y, r, sc;
      if (u < 0) { el.style.opacity = 0; return; }
      if (u < APPROACH) {
        var p = ACCEL(u / APPROACH);
        x = lerp(from.x, impact.x, p); y = lerp(from.y, impact.y, p); r = lerp(from.r, impact.r, p); sc = lerp(0.92, 1.05, p);
      } else {
        var q = spring((u - APPROACH) / 1000, 9, 150, 0.9);
        x = lerp(impact.x, final.x, q); y = lerp(impact.y, final.y, q); r = lerp(impact.r, final.r, q); sc = lerp(1.05, 1, q);
      }
      el.style.opacity = clamp(u / 60);
      el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + r + 'deg) scale(' + sc + ')';
    }

    function frame(t) {
      var W = scene.clientWidth, cw = cardL.offsetWidth, off = W * 0.62;
      pose(cardL, { x: -off, y: 46, r: -26 }, { x: -cw * 0.2, y: 0, r: -3 }, { x: -cw * 0.4, y: 10, r: -9 }, START, t);
      pose(cardR, { x: off, y: -46, r: 26 }, { x: cw * 0.2, y: 0, r: 3 }, { x: cw * 0.4, y: -8, r: 8 }, START + 20, t);
      bg.style.opacity = clamp(t / 380);
      if (t >= HIT && !burst) burst = petalBurst(petalsBox, W / 390, { petals: 30, sparks: 18, spread: 210, lift: 50, fall: 120 });
      var f = easeOut(clamp((t - HIT) / 650)), g = easeOut(clamp((t - HIT) / 800));
      flash.style.opacity = t < HIT ? 0 : 0.95 * (1 - f);
      flash.style.transform = 'scale(' + (0.25 + 1.25 * f) + ')';
      ring.style.opacity = t < HIT ? 0 : 0.85 * (1 - g);
      ring.style.transform = 'scale(' + (0.3 + 1.9 * g) + ')';
      heart.style.opacity = t < HIT + 120 ? 0 : 1;
      heart.style.transform = 'scale(' + spring((t - (HIT + 120)) / 1000, 7, 160, 1) + ')';
      reveals.forEach(function (el, i) {
        var v = clamp((t - TEXT - REVEAL_AT[i]) / 500), e = 1 - Math.pow(1 - v, 3);
        el.style.opacity = e; el.style.transform = 'translateY(' + (1 - e) * 14 + 'px)';
      });
    }

    function finish() { // hand back to the stylesheet's resting layout, so a resized window stays correct
      [cardL, cardR, heart, flash, ring, bg].concat(reveals).forEach(function (el) { el.removeAttribute('style'); });
      petalsBox.innerHTML = ''; burst = null;
      scene.classList.remove('m-armed');
    }
    function loop(now) {
      var t = now - t0;
      frame(t);
      if (t < TEXT + 680 + 520 + 2200) raf = requestAnimationFrame(loop); else { raf = 0; finish(); }
    }
    function play() {
      cancelAnimationFrame(raf); petalsBox.innerHTML = ''; burst = null;
      if (reduce) { finish(); return; } // reduced motion: show the finished scene, no movement
      scene.classList.add('m-armed');
      frame(0);
      t0 = performance.now();
      raf = requestAnimationFrame(loop);
    }
    // Play the first time the phone is mostly on screen; "Watch it again" plays it any time.
    var seen = false;
    if (!reduce) {
      scene.classList.add('m-armed');
      if (!('IntersectionObserver' in window)) { seen = true; play(); }
      else {
        new IntersectionObserver(function (entries, obs) {
          if (entries[0].isIntersecting && !seen) { seen = true; obs.disconnect(); play(); }
        }, { threshold: 0.6 }).observe(scene);
      }
    }
    $('matchReplay').addEventListener('click', function () { seen = true; play(); });
  }
})();
