// Shared by every page: light/dark switch, Readable text switch, and the phone menu.
// The saved choices live only in this visitor's browser (nothing is sent anywhere).
(function () {
  var root = document.documentElement, body = document.body;
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  if (load('hg-read') === '1') {
    body.dataset.readable = '1';
    var rb = document.getElementById('readBtn');
    if (rb) rb.setAttribute('aria-pressed', 'true');
  }
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('hg-theme', next);
  });
  var readBtn = document.getElementById('readBtn');
  if (readBtn) readBtn.addEventListener('click', function () {
    var on = body.dataset.readable === '1';
    if (on) delete body.dataset.readable; else body.dataset.readable = '1';
    readBtn.setAttribute('aria-pressed', String(!on));
    store('hg-read', on ? '0' : '1');
  });
  var menuBtn = document.getElementById('menuBtn'), nav = document.getElementById('mainNav');
  if (menuBtn && nav) menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
})();
