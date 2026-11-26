(function () {
  var T = window.T, TEMY = window.TEMY || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
  var money = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };
  var ic = function (id) { return '<svg class="ic"><use href="#' + id + '"/></svg>'; };

  function setMode(m) {
    $$('.seg__b').forEach(function (b) { var on = b.dataset.mode === m; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    $$('[data-for]').forEach(function (el) { el.hidden = el.dataset.for !== m; });
  }
  $$('.seg__b').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });

  var gi = 0, ck = $('#sostav');
  function paint() {
    $$('.seg__g', ck).forEach(function (b) { var on = +b.dataset.g === gi; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    $('.ck__sum', ck).textContent = 'от ' + money(T.total[gi]);
    $('.ck__per', ck).textContent = '≈ ' + money(Math.round(T.total[gi] / [30, 50][gi] / 100) * 100);
    $('.inc', ck).innerHTML = T.groups.map(function (g) {
      return '<div class="inc__g"><p class="inc__t">' + esc(g.title) + '</p>' + g.items.map(function (i) {
        var q = /×|мин|до \d/.test(i.q[gi]) ? '<small>' + esc(i.q[gi]) + '</small>' : '';
        return '<a class="inc__i" href="' + esc(i.u) + '" target="_blank" rel="noopener">' +
          '<span class="inc__n">' + esc(i.n) + q + '</span><i class="inc__d"></i>' +
          '<b class="inc__p">' + money(i.s[gi]) + '</b></a>';
      }).join('') + '</div>';
    }).join('');
  }
  $$('.seg__g', ck).forEach(function (b) { b.addEventListener('click', function () { gi = +b.dataset.g; paint(); }); });
  paint();

  var dd = $('#dd'), ddBtn = $('.dd__btn', dd), ddList = $('.dd__list', dd), hl = -1;
  ddList.innerHTML = TEMY.map(function (t) { return '<li role="option" data-v="' + esc(t.name) + '" aria-selected="' + (t.slug === T.slug) + '">' + ic('i-spark') + esc(t.name) + '</li>'; }).join('') +
    '<li role="option" data-v="" aria-selected="false">' + ic('i-spark') + 'Пока не знаем — посоветуйте</li>';
  var opts = $$('li', ddList);
  function pick(v) {
    opts.forEach(function (l) { l.setAttribute('aria-selected', l.dataset.v === v); });
    var l = opts.filter(function (l) { return l.dataset.v === v; })[0];
    $('.dd__val', dd).textContent = l ? l.textContent : 'Ещё не выбрали';
  }
  function ddOpen(o) { ddList.hidden = !o; ddBtn.setAttribute('aria-expanded', o); if (o) { hl = Math.max(0, opts.findIndex(function (l) { return l.getAttribute('aria-selected') === 'true'; })); hlPaint(); } }
  function hlPaint() { opts.forEach(function (l, i) { l.classList.toggle('is-hl', i === hl); }); if (opts[hl]) opts[hl].scrollIntoView({ block: 'nearest' }); }
  ddBtn.addEventListener('click', function () { ddOpen(ddList.hidden); });
  ddList.addEventListener('click', function (e) { var l = e.target.closest('li'); if (!l) return; pick(l.dataset.v); ddOpen(false); ddBtn.focus(); });
  ddBtn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (ddList.hidden) { ddOpen(true); return; }
      hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; hlPaint();
    } else if (e.key === 'Enter' && !ddList.hidden) { e.preventDefault(); pick(opts[hl].dataset.v); ddOpen(false); }
    else if (e.key === 'Escape') ddOpen(false);
  });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) ddOpen(false); });

  $$('[data-want]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      pick(T.name);
      if (a.classList.contains('modal__go')) $('#zayavka input[name="guests"]').value = gi ? 50 : 30;
      $('#zayavka').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { $('#zayavka input[name="name"]').focus({ preventScroll: true }); }, 600);
    });
  });
  $('.form__send').addEventListener('click', function () {
    var f = $('#zayavka .form'), bad = $$('input[name="name"], input[name="phone"]', f).filter(function (i) { i.classList.toggle('is-bad', !i.value.trim()); return !i.value.trim(); });
    if (bad.length) { bad[0].focus(); return; }
    $('.form__grid', f).style.display = 'none'; $('.form__cta', f).style.display = 'none'; $('.form__ok', f).hidden = false;
  });

  var lb = $('#lb'), lbImg = $('.lb__img', lb), lbCap = $('.lb__cap', lb), li = 0;
  function show(n) {
    li = (n + T.gal.length) % T.gal.length;
    lbImg.src = T.gal[li].f; lbImg.alt = T.gal[li].alt;
    lbCap.textContent = (li + 1) + ' / ' + T.gal.length + (T.gal[li].alt ? ' · ' + T.gal[li].alt : '');
  }
  $('.gal').addEventListener('click', function (e) { var b = e.target.closest('.gal__i'); if (!b) return; show(+b.dataset.n); lb.showModal(); });
  $('.lb__nav--prev', lb).addEventListener('click', function () { show(li - 1); });
  $('.lb__nav--next', lb).addEventListener('click', function () { show(li + 1); });
  $('.lb__x', lb).addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(li - 1); if (e.key === 'ArrowRight') show(li + 1); });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) show(li + (dx < 0 ? 1 : -1)); }, { passive: true });

  window.tnav({ root: '../../', here: T.slug });

  $$('.sl').forEach(function (sl) {
    var tr = $('.sl__track', sl), dots = $$('.sl__dots i', sl);
    $$('[data-go]', sl).forEach(function (b) { b.addEventListener('click', function () { tr.scrollBy({ left: +b.dataset.go * tr.clientWidth, behavior: 'smooth' }); }); });
    tr.addEventListener('scroll', function () {
      var k = Math.round(tr.scrollLeft / tr.clientWidth);
      dots.forEach(function (d, n) { d.classList.toggle('is-on', n === k); });
    }, { passive: true });
  });

  var atr = $('#gde'), ym = atr.dataset.month.split('-'), year = +ym[0], month = +ym[1] - 1;
  var busy = atr.dataset.busy.split(',').map(Number), reserve = [], drawn = false, today = new Date();
  today.setHours(0, 0, 0, 0);
  function drawDates() {
    if (drawn) return;
    drawn = true;
    var days = $('.atr__days', atr), total = new Date(year, month + 1, 0).getDate(), free = 0, h = '';
    for (var blank = (new Date(year, month, 1).getDay() + 6) % 7; blank > 0; blank--) h += '<span></span>';
    for (var d = 1; d <= total; d++) {
      var date = new Date(year, month, d), taken = busy.indexOf(d) !== -1, past = date < today, held = reserve.indexOf(d) !== -1, wd = date.getDay();
      if (!taken && !past && !held) free++;
      h += '<button type="button" class="atr__d' + (wd === 0 || wd === 6 ? ' is-wk' : '') + (taken ? ' is-busy' : past ? ' is-past' : held ? ' is-res' : '') + '" data-d="' + d + '"' + (taken || past ? ' disabled' : '') + '>' + d + '</button>';
    }
    days.innerHTML = h;
    $('.atr__cnt', atr).textContent = 'свободно ' + free + ' из ' + total;
  }
  setTimeout(drawDates, 4000);
  fetch('https://vyzovchat.ru/api/public/atrium?month=' + atr.dataset.month)
    .then(function (r) { if (!r.ok) throw r; return r.json(); })
    .then(function (j) { if (!drawn) { busy = j.busy; reserve = j.reserve; atr.dataset.live = '1'; } })
    .catch(function () {})
    .then(drawDates);
  var mname = new Date(year, month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
  $('.atr__month', atr).textContent = mname.charAt(0).toUpperCase() + mname.slice(1);
  $('.atr__days', atr).addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]');
    if (!b || b.disabled) return;
    $$('.atr__d.is-on', atr).forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    $('.atr__pick', atr).innerHTML = '<b>' + new Date(year, month, +b.dataset.d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' }) + '</b>' + (b.classList.contains('is-res') ? ' — предварительно занято, менеджер уточнит' : ' — свободно');
  });
  $('.atr__send', atr).addEventListener('click', function () {
    var bad = $$('.atr__form input', atr).filter(function (i) { i.classList.toggle('is-bad', !i.value.trim()); return !i.value.trim(); });
    if (bad.length) { bad[0].focus(); return; }
    $('.atr__form', atr).hidden = true; $('.form__ok', atr).hidden = false;
  });

  setMode('atrium');
})();
