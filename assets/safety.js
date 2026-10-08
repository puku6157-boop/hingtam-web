// Safety Centre: tools, report walkthrough, scam quiz, checklist, help numbers. Data comes from content/safety.js.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var D = JSON.parse($('safety-data').textContent);
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function rows(list) {
    return list.map(function (r) {
      var cls = r[2] === 'sel' ? 'row sel' : 'row';
      var pill = r[1] ? '<span class="pill ' + (r[2] === 'g' || r[2] === 'b' ? r[2] : '') + '">' + esc(r[1]) + '</span>' : '';
      return '<div class="' + cls + '">' + esc(r[0]) + ' ' + pill + '</div>';
    }).join('');
  }

  /* tools */
  var tb = [].slice.call(document.querySelectorAll('.tbtn'));
  function tool(i) {
    tb.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); });
    var t = D.tools[i];
    $('tpanel').innerHTML = '<h3>' + esc(t.h) + '</h3><p>' + esc(t.p) + '</p><div class="mock"><h4>' + esc(t.title) + '</h4>' + rows(t.rows) + '</div>';
  }
  tb.forEach(function (b) { b.addEventListener('click', function () { tool(+b.dataset.t); }); });
  tool(0);

  /* report walkthrough */
  var ws = [].slice.call(document.querySelectorAll('.ws')), wc = 0, wt = null;
  function stage(i) {
    var s = D.walk[i];
    $('wstage').innerHTML = '<div class="bigt">' + (s.spin ? '<span class="spin"></span>' : '') + esc(s.big) + '</div>' +
      (s.rows ? '<div class="mock" style="max-width:none">' + rows(s.rows) + '</div>' : '') + (s.note ? '<p class="note">' + esc(s.note) + '</p>' : '');
  }
  function wshow(i) { wc = i; ws.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); b.classList.toggle('done', k < i); }); stage(i); }
  function wstop() { clearTimeout(wt); wt = null; $('wplay').textContent = 'Play'; }
  function wnext() { if (wc < D.walk.length - 1) { wshow(wc + 1); wt = setTimeout(wnext, 2800); } else { wstop(); $('wnote').textContent = 'That is the whole journey.'; } }
  $('wplay').addEventListener('click', function () { if (wt) { wstop(); return; } $('wnote').textContent = ''; if (wc >= D.walk.length - 1) wshow(0); $('wplay').textContent = 'Pause'; wt = setTimeout(wnext, 2800); });
  $('wreset').addEventListener('click', function () { wstop(); $('wnote').textContent = ''; wshow(0); });
  ws.forEach(function (b) { b.addEventListener('click', function () { wstop(); wshow(+b.dataset.s); }); });
  wshow(0);

  /* scam quiz */
  var qi = 0, score = 0, res = [], qz = $('qz');
  function qrender() {
    if (qi >= D.quiz.length) {
      qz.innerHTML = '<div class="qt">You got ' + score + ' of ' + D.quiz.length + '</div><p style="color:var(--muted)">' + (score === D.quiz.length ? 'Sharp eyes. You would spot these.' : 'Good practice. The pattern to remember: any money request, any rush, and any push to leave the app.') + '</p><div class="playrow"><button class="btn primary" id="qre">Try again</button></div>';
      $('qre').addEventListener('click', function () { qi = 0; score = 0; res = []; qrender(); });
      return;
    }
    var s = D.quiz[qi];
    qz.innerHTML = '<div class="qhead"><span>Chat ' + (qi + 1) + ' of ' + D.quiz.length + '</span><span class="dots">' + D.quiz.map(function (_, k) { return '<i class="' + (k < res.length ? (res[k] ? 'ok' : 'no') : (k === qi ? 'on' : '')) + '"></i>'; }).join('') + '</span></div>' +
      '<div class="qt">Is this a scam?</div><div class="chat">' + s.c.map(function (m) { return '<div class="b ' + m[0] + '">' + esc(m[1]) + '</div>'; }).join('') + '</div>' +
      '<div class="ans"><button class="btn primary" data-a="1">Scam</button><button class="btn ghost" data-a="0">Looks fine</button></div><div id="qfb" aria-live="polite"></div>';
    [].slice.call(qz.querySelectorAll('[data-a]')).forEach(function (b) {
      b.addEventListener('click', function () {
        var ok = (b.dataset.a === '1') === s.scam; if (ok) score++; res.push(ok);
        qz.querySelectorAll('[data-a]').forEach(function (x) { x.disabled = true; });
        $('qfb').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Correct. ' : 'Not quite. ') + '</b>' + esc(s.why) + '</div><div class="playrow"><button class="btn primary" id="qn">' + (qi === D.quiz.length - 1 ? 'See my score' : 'Next chat') + '</button></div>';
        $('qn').addEventListener('click', function () { qi++; qrender(); });
      });
    });
  }
  qrender();

  /* checklist */
  var cl = $('cl'), checked = {};
  D.checklist.forEach(function (t, i) {
    var b = document.createElement('button'); b.className = 'ck'; b.setAttribute('role', 'checkbox'); b.setAttribute('aria-checked', 'false');
    b.innerHTML = '<span class="box">&#10003;</span><span>' + esc(t) + '</span>';
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(on)); checked[i] = on;
      var n = Object.keys(checked).filter(function (k) { return checked[k]; }).length;
      $('prog').style.width = (n / D.checklist.length * 100) + '%'; $('progt').textContent = n + ' of ' + D.checklist.length + ' done';
    });
    cl.appendChild(b);
  });
  function copyText(text, msgId) {
    function done(ok) { var m = $(msgId); m.textContent = ok ? 'Copied.' : 'Select the text and copy it.'; setTimeout(function () { m.textContent = ''; }, 2500); }
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); } catch (e) { done(false); }
  }
  $('copyList').addEventListener('click', function () { copyText('Before I meet someone from Hingtam:\n' + D.checklist.map(function (t, i) { return (i + 1) + '. ' + t; }).join('\n'), 'copyMsg'); });
  $('copyMail').addEventListener('click', function () { copyText($('mailAddr').textContent, 'mailMsg'); });

  /* help numbers */
  var rg = $('regs');
  Object.keys(D.regions).forEach(function (k, i) {
    var b = document.createElement('button'); b.className = 'reg'; b.textContent = k; b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', function () { rshow(k); }); rg.appendChild(b);
  });
  function rshow(k) {
    [].slice.call(rg.children).forEach(function (b) { b.setAttribute('aria-pressed', String(b.textContent === k)); });
    $('res').innerHTML = D.regions[k].map(function (r) { return '<div><b>' + esc(r[0]) + '</b><span class="num">' + esc(r[1]) + '</span>' + (r[2] ? '<small>' + esc(r[2]) + '</small>' : '') + '</div>'; }).join('');
  }
  rshow(Object.keys(D.regions)[0]);
})();
