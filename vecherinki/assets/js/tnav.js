window.tnav = function (o) {
  var I = [['Гэтсби', 'getsbi', 'getsbi'], ['Казино', 'kazino', 'kazino'], ['90-е', '90e', '90'], ['Карнавал', 'maskarad', 'karnaval'], ['СССР', 'sssr', 'sssr'], ['Киберпанк', 'kiberpank', 'kiber'], ['80-е', '80e', '80'], ['Black tie', 'blacktie', 'blacktie'], ['Русский стиль', 'russkiy-stil'], ['Гавайи', 'gavayi'], ['Белая вечеринка', 'belaya'], ['Рок', 'rok'], ['Хоррор', 'horror'], ['Оскар', 'oscar'], ['Пираты', 'piraty'], ['Стиляги', 'stilyagi'], ['Дикий Запад', 'dikiy-zapad'], ['Чикаго', 'chicago'], ['Игра в кальмара', 'igra-v-kalmara'], ['Джеймс Бонд', 'bond'], ['Космос', 'kosmos'], ['Форт Боярд', 'fort-boyard'], ['Барби', 'barbi'], ['Дача', 'dacha']];
  var ic = function (id) { return '<svg class="ic"><use href="#' + id + '"/></svg>'; };
  var hub = o.here === 'hub';
  var links = document.createElement('div');
  links.className = 'tnav';
  links.innerHTML = '<button type="button" class="tnav__burger" aria-label="Каталог" aria-expanded="false" aria-controls="tcat">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
    '<a class="tnav__hol" href="https://arenda-attrakcionov.ru/attrakciony-na-novyj-god/">' + ic('i-gift') + 'Новый год</a>' +
    '<a class="tnav__a tnav__hub' + (hub ? ' is-on" aria-current="page' : '') + '" href="' + o.root + 'korporativ/">Вечеринки</a>' +
    I.map(function (x) {
      if (hub && !x[1]) return '<button type="button" class="tnav__a" data-k="' + x[2] + '" data-slug="' + x[2] + '">' + x[0] + '</button>';
      var k = hub ? x[2] || x[1] : x[1] || x[2], on = k === o.here;
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
  var bg = links.querySelector('.tnav__burger');
  var cat = document.createElement('div');
  cat.className = 'hdr26-all tcat'; cat.id = 'tcat';
  var secs = hdr ? Array.prototype.slice.call(hdr.querySelectorAll('.hdr26-nv[data-dd]')) : [];
  cat.innerHTML = '<div class="hdr26-all__in"><div class="hdr26-all__side">' +
    secs.map(function (b) { return '<button type="button" data-all="' + b.dataset.dd + '">' + b.innerHTML + '</button>'; }).join('') +
    '<div class="hdr26-all__svc">' + (hdr && hdr.querySelector('.hdr26-svc') ? hdr.querySelector('.hdr26-svc').innerHTML : '') + '</div></div><div class="hdr26-all__pane"></div></div>';
  if (hdr) hdr.appendChild(cat);
  var pane = cat.querySelector('.hdr26-all__pane');
  function showSec(id) {
    if (cat.dataset.cur === id) return;
    cat.dataset.cur = id;
    Array.prototype.forEach.call(cat.querySelectorAll('[data-all]'), function (b) { b.classList.toggle('is-on', b.dataset.all === id); });
    var src = document.querySelector('.hdr26-dd[data-p="' + id + '"]');
    pane.innerHTML = src ? src.innerHTML : '';
  }
  function catOpen(op) {
    if (op && secs.length) showSec(cat.dataset.cur || secs[0].dataset.dd);
    cat.classList.toggle('is-open', op); bg.setAttribute('aria-expanded', op);
  }
  bg.addEventListener('click', function (e) { e.stopPropagation(); catOpen(!cat.classList.contains('is-open')); });
  cat.addEventListener('mouseover', function (e) { var b = e.target.closest('[data-all]'); if (b && desk.matches) showSec(b.dataset.all); });
  cat.addEventListener('click', function (e) {
    var b = e.target.closest('[data-all]'); if (b) showSec(b.dataset.all);
  });
  document.addEventListener('click', function (e) { if (cat.classList.contains('is-open') && e.target.isConnected && !cat.contains(e.target)) catOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cat.classList.contains('is-open')) { catOpen(false); bg.focus(); } });
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
