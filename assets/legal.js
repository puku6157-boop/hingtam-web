// Legal pages (Privacy, Terms, Guidelines, Safety Tips): Short version / Full text, search, contents list.
// Without JavaScript the page simply shows the full text, so nothing is hidden from anyone.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var page = $('legal'); if (!page) return;
  var secs = [].slice.call(page.querySelectorAll('.sec'));
  var tocLinks = [].slice.call(document.querySelectorAll('#toc a'));
  var q = $('q'), found = $('found');
  var mode = 'short';
  try { if (localStorage.getItem('hg-mode') === 'full') mode = 'full'; } catch (e) {}

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function setClasses(searching) {
    page.classList.toggle('mode-short', mode === 'short' && !searching);
    page.classList.toggle('mode-full', mode === 'full' && !searching);
    page.classList.toggle('mode-search', searching);
    $('mShort').setAttribute('aria-pressed', String(mode === 'short'));
    $('mFull').setAttribute('aria-pressed', String(mode === 'full'));
  }
  function clearMarks() {
    [].slice.call(page.querySelectorAll('mark')).forEach(function (m) { m.replaceWith(document.createTextNode(m.textContent)); });
    page.normalize();
  }
  function apply() {
    var term = q.value.trim(), lower = term.toLowerCase(), shown = 0;
    setClasses(!!term);
    clearMarks();
    secs.forEach(function (el, i) {
      var hit = !term || el.textContent.toLowerCase().indexOf(lower) > -1;
      el.classList.toggle('hidden', !hit);
      tocLinks[i].classList.toggle('dim', !hit);
      if (hit) shown++;
    });
    if (term) {
      found.textContent = shown + ' of ' + secs.length + ' sections match "' + term + '"';
      var re = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      secs.forEach(function (el) {
        if (el.classList.contains('hidden')) return;
        var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, list = [];
        while ((n = w.nextNode())) { if (n.parentNode.closest('button,mark')) continue; re.lastIndex = 0; if (re.test(n.nodeValue)) list.push(n); }
        list.forEach(function (node) { var s = document.createElement('span'); s.innerHTML = esc(node.nodeValue).replace(re, '<mark>$1</mark>'); node.replaceWith(s); });
      });
    } else found.textContent = '';
  }
  function setMode(m) {
    mode = m; try { localStorage.setItem('hg-mode', m); } catch (e) {}
    secs.forEach(function (el) { el.classList.remove('open'); });
    apply();
  }
  function open(el) { el.classList.add('open'); apply(); el.scrollIntoView({ behavior: 'smooth' }); }

  $('mShort').addEventListener('click', function () { setMode('short'); });
  $('mFull').addEventListener('click', function () { setMode('full'); });
  q.addEventListener('input', apply);
  page.addEventListener('click', function (e) {
    var b = e.target.closest('[data-more]'); if (!b) return;
    b.closest('.sec').classList.add('open'); apply();
  });
  var toc = $('toc');
  toc.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return; e.preventDefault();
    open(document.getElementById(a.getAttribute('href').slice(1)));
  });
  var jump = $('jump');
  if (jump) jump.addEventListener('change', function () { if (this.value) open(document.getElementById(this.value)); });

  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) tocLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + x.target.id); }); });
  }, { rootMargin: '-20% 0px -70% 0px' });
  secs.forEach(function (s) { io.observe(s); });

  // A link straight to one section (for example #privacy-3) opens that section.
  var h = location.hash.slice(1), target = h && document.getElementById(h);
  setMode(mode);
  if (target && target.classList.contains('sec')) { target.classList.add('open'); apply(); setTimeout(function () { target.scrollIntoView(); }, 50); }
})();
