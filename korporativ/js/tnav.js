window.tnav = function (o) {
  var I = [['Гэтсби', 'getsbi', 'getsbi'], ['Казино', 'kazino', 'kazino'], ['СССР', 'sssr', 'sssr'], ['90-е', '90e', '90'], ['80-е', '80e', '80'],
    ['Карнавал', 'maskarad', 'karnaval'], ['Кибер', 'kiberpank', 'kiber'], ['Black tie', '', 'blacktie'], ['Хэллоуин', 'hellouin'], ['Белая вечеринка', 'belaya'],
    ['Игра в кальмара', 'igra-v-kalmara'], ['Гавайи', 'gavayi'], ['Оскар', 'oscar'], ['Чикаго', 'chicago'], ['Дикий Запад', 'dikiy-zapad'], ['Пираты', 'piraty'],
    ['Дача', 'dacha'], ['Стиляги', 'stilyagi'], ['Рок', 'rok'], ['Космос', 'kosmos'], ['Барби', 'barbi'], ['Джеймс Бонд', 'bond'], ['Форт Боярд', 'fort-boyard'], ['Русский стиль', 'russkiy-stil']];
  var ic = function (id) { return '<svg class="ic"><use href="#' + id + '"/></svg>'; };
  var hub = o.here === 'hub';
  var links = document.createElement('div');
  links.className = 'tnav';
  links.innerHTML = '<a class="tnav__hol" href="https://arenda-attrakcionov.ru/attrakciony-na-novyj-god/">' + ic('i-gift') + 'Новый год</a>' +
    '<a class="tnav__a tnav__hub' + (hub ? ' is-on" aria-current="page' : '') + '" href="' + o.root + 'korporativ/">Вечеринки</a>' +
    I.map(function (x) {
      if (hub && x[2]) return '<button type="button" class="tnav__a" data-k="' + x[2] + '" data-slug="' + x[2] + '">' + x[0] + '</button>';
      var k = x[1] || x[2], on = k === o.here;
      var href = x[1] ? o.root + 'vecherinki/' + x[1] + '/' : o.root + 'korporativ/#tema=' + x[2];
      return '<a class="tnav__a' + (on ? ' is-on" aria-current="page' : '') + '" data-k="' + k + '" href="' + href + '">' + x[0] + '</a>';
    }).join('');
  var hdr = document.getElementById('hdr26');
  var row = hdr && hdr.querySelector('.hdr26__n .hdr26__c');
  if (row) { row.classList.add('tnav-row'); row.insertBefore(links, row.firstChild); }
  var vb = document.createElement('button');
  vb.type = 'button'; vb.className = 'tnav__vp'; vb.setAttribute('aria-expanded', 'false'); vb.setAttribute('aria-controls', 'tmore');
  vb.innerHTML = 'Ещё' + ic('i-down');
  links.appendChild(vb);
  var vp = document.createElement('div');
  vp.className = 'tmore'; vp.id = 'tmore'; vp.hidden = true;
  document.body.appendChild(vp);
  var tl = Array.prototype.slice.call(links.querySelectorAll('[data-k]'));
  var desk = window.matchMedia('(min-width: 769px)');
  function center(a) {
    if (a && !a.hidden && links.scrollWidth > links.clientWidth) links.scrollTo({ left: Math.max(0, a.offsetLeft - (links.clientWidth - a.offsetWidth) / 2), behavior: 'smooth' });
  }
  function fit() {
    tl.forEach(function (a) { a.hidden = false; });
    vb.hidden = true;
    var over = [];
    if (desk.matches && links.scrollWidth > links.clientWidth + 1) {
      vb.hidden = false;
      for (var k = tl.length - 1; k >= 0 && links.scrollWidth > links.clientWidth + 1; k--) { tl[k].hidden = true; over.unshift(tl[k]); }
    }
    vp.innerHTML = '';
    over.forEach(function (a) { var c = a.cloneNode(true); c.hidden = false; c.className = 'tmore__a' + (a.classList.contains('is-on') ? ' is-on' : ''); vp.appendChild(c); });
    vb.classList.toggle('is-on', over.some(function (a) { return a.classList.contains('is-on'); }));
    var cur = links.querySelector('.tnav__a.is-on');
    if (cur && cur.offsetLeft + cur.offsetWidth > links.clientWidth) center(cur);
  }
  fit();
  if (document.fonts) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fit, 120); });
  var vTimer = 0, vAt = 0;
  function vpOpen(op) {
    clearTimeout(vTimer);
    if (op) { var r = vb.getBoundingClientRect(); vp.style.setProperty('--vp-top', Math.round(r.bottom + 8) + 'px'); vp.style.setProperty('--vp-right', Math.round(window.innerWidth - r.right) + 'px'); }
    if (op && vp.hidden) vAt = Date.now();
    vp.hidden = !op; vb.setAttribute('aria-expanded', op); vb.classList.toggle('is-open', op);
  }
  vb.addEventListener('click', function () { if (!vp.hidden && Date.now() - vAt < 500) return; vpOpen(vp.hidden); });
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    [vb, vp].forEach(function (el) {
      el.addEventListener('mouseenter', function () { vpOpen(true); });
      el.addEventListener('mouseleave', function () { vTimer = setTimeout(function () { vpOpen(false); }, 250); });
    });
  }
  document.addEventListener('click', function (e) { if (!vp.hidden && !vp.contains(e.target) && !vb.contains(e.target)) vpOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !vp.hidden) { vpOpen(false); vb.focus(); } });
  window.addEventListener('scroll', function () { if (!vp.hidden) vp.style.setProperty('--vp-top', Math.round(vb.getBoundingClientRect().bottom + 8) + 'px'); }, { passive: true });
  [links, vp].forEach(function (el) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-slug]'); if (!b || !o.onTheme) return;
      vpOpen(false); o.onTheme(b.dataset.slug);
    });
  });
  return {
    mark: function (k) {
      tl.forEach(function (a) { a.classList.toggle('is-on', !!k && a.dataset.k === k); });
      Array.prototype.forEach.call(vp.children, function (a) { a.classList.toggle('is-on', !!k && a.dataset.k === k); });
      var a = k && links.querySelector('[data-k="' + k + '"]');
      vb.classList.toggle('is-on', !!a && a.hidden);
      center(a);
    }
  };
};
