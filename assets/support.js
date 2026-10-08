// Support page: filter the questions as you type.
(function () {
  var input = document.getElementById('faqSearch'), list = document.getElementById('faqList'), found = document.getElementById('faqFound');
  if (!input || !list) return;
  var items = [].slice.call(list.querySelectorAll('details'));
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase(), shown = 0;
    items.forEach(function (d) {
      var hit = !q || d.textContent.toLowerCase().indexOf(q) > -1;
      d.classList.toggle('hidden', !hit);
      if (hit) shown++;
      if (q && hit) d.open = true;
    });
    found.textContent = q ? (shown ? shown + ' of ' + items.length + ' questions match' : 'No questions match. Please email us.') : '';
  });
})();
