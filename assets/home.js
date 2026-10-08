// Home page: swipe demo, feature tour, privacy playground, screenshot row.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var data = JSON.parse($('home-data').textContent);

  /* ---------- swipe deck ---------- */
  var people = data.samples, deck = $('deck'), idx = 0, busy = false;
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
      el.style.transform = 'scale(' + (1 - o * 0.04) + ') translateY(' + (o * 10) + 'px)';
      el.style.zIndex = 10 - o; el.dataset.o = o; deck.appendChild(el);
      if (o === 0) attach(el);
    });
  }
  function fling(el, dir) {
    if (busy) return; busy = true;
    el.style.transition = 'transform .35s ease,opacity .35s';
    el.style.transform = dir === 0 ? 'translate(0,-560px) scale(.92)' : 'translate(' + (dir * 420) + 'px,-30px) rotate(' + (dir * 22) + 'deg)';
    el.style.opacity = '0';
    setTimeout(function () { idx = (idx + 1) % people.length; busy = false; render(); }, 330);
  }
  function attach(el) {
    var sx = 0, dx = 0, drag = false, like = el.querySelector('.stamp.like'), pass = el.querySelector('.stamp.pass');
    el.addEventListener('pointerdown', function (e) { drag = true; sx = e.clientX; el.classList.add('dragging'); el.style.transition = 'none'; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return; dx = e.clientX - sx;
      el.style.transform = 'translate(' + dx + 'px,0) rotate(' + (dx / 18) + 'deg)';
      like.style.opacity = Math.max(0, Math.min(1, dx / 90)); pass.style.opacity = Math.max(0, Math.min(1, -dx / 90));
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
      setTimeout(function () { fling(el, dir); }, 120);
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

  /* ---------- screenshot row ---------- */
  var track = $('shotsTrack');
  function by(dir) { track.scrollBy({ left: dir * (track.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' }); }
  $('shotPrev').addEventListener('click', function () { by(-1); });
  $('shotNext').addEventListener('click', function () { by(1); });
})();
