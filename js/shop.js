/* НГ-лендинг: карточки окном, каталог, даты «Атриума». Логика — как у кейтеринга. */
(function () {
  'use strict';
  var root = document.getElementById('ktg');
  var $ = function (s, box) { return (box || root).querySelector(s); };
  var $$ = function (s, box) { return [].slice.call((box || root).querySelectorAll(s)); };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function plural(n, a, b, c) {
    var m = n % 10, h = n % 100;
    return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c;
  }

  var DATA = window.KTG_DATA, KIT = window.NG_KIT_ITEMS, byId = {};
  DATA.forEach(function (group) { group.items.forEach(function (it) { if (!byId[it.id]) byId[it.id] = { it: it, group: group.name }; }); });
  KIT.forEach(function (it) { if (!byId[it.id]) byId[it.id] = { it: it, group: 'Готовый комплект' }; });

  var picked = [];
  var cur = DATA[0], shown = 12, list = [], at = -1, found = [], query = '', sort = 'pop', typing;
  var grid = $('[data-grid]'), tabs = $('[data-tabs]'), modal = $('[data-qv]'), overlay = $('[data-overlay]');

  /* ---------- комплекты с карточек сайта (№553) ---------- */
  var SITE = 'https://arenda-attrakcionov.ru';
  function setsOf(it) { return (window.NG_SETS || {})[it.u.replace(/\/$/, '').split('/').pop()] || []; }

  function setsList(it) {
    var all = setsOf(it);
    if (all.length < 2) return null;
    var ul = el('ul', 'ng-sets');
    all.slice(0, 3).forEach(function (s) {
      var li = el('li');
      li.append(el('span', '', s.n), el('b', '', s.p.replace(/\s*\/\s*\d+\s*(час[а-я]*|ч)\.?$/, '')));
      ul.appendChild(li);
    });
    if (all.length > 3) ul.appendChild(el('li', 'ng-sets__more', 'ещё ' + (all.length - 3)));
    return ul;
  }

  function showSets(it) {
    var box = $('[data-qv-opts]');
    box.textContent = '';
    setsOf(it).forEach(function (s) {
      var row = el(s.i ? 'button' : 'div', 'ng-opt'), name = el('span', '', s.n);
      if (s.i) {
        var img = el('img');
        row.type = 'button';
        row.dataset.photo = SITE + s.i;
        img.src = SITE + s.i;
        img.alt = '';
        img.loading = 'lazy';
        row.appendChild(img);
      }
      if (s.s) name.appendChild(el('small', '', s.s));
      row.append(name, el('b', '', s.p));
      box.appendChild(row);
    });
  }

  /* ---------- карточки ---------- */
  DATA.forEach(function (group) {
    var b = el('button', 'ktg-group'), img = el('img'), n = group.items.length;
    b.type = 'button';
    b.dataset.group = group.slug;
    img.src = 'img/ikonki/ik-' + group.icon + '.webp';
    img.alt = '';
    img.loading = 'lazy';
    b.append(img, el('b', '', group.name), el('small', '', n + ' ' + plural(n, 'позиция', 'позиции', 'позиций')));
    tabs.appendChild(b);
  });

  function pickList() {
    var out = cur.items.slice(), seenIds = {};
    if (query) {
      out = [];
      DATA.forEach(function (group) {
        group.items.forEach(function (it) {
          if (seenIds[it.id] || it.n.toLowerCase().replace(/ё/g, 'е').indexOf(query) === -1) return;
          seenIds[it.id] = 1;
          out.push(it);
        });
      });
    }
    if (sort !== 'pop') out.sort(function (a, b) { return sort === 'asc' ? a.v - b.v : b.v - a.v; });
    return out;
  }

  // Обложки квизов и тимбилдингов — на тёмном размытом фоне из самой картинки (Маша, т.21 №587)
  var COVER = {};
  window.KTG_DATA.forEach(function (g) {
    if (g.slug === 'kviz' || g.slug === 'timbilding') g.items.forEach(function (it) { if (it.i.indexOf('img/ava/')) COVER[it.id] = 1; });
  });

  function renderGrid() {
    grid.textContent = '';
    found = pickList();
    $('[data-count]').textContent = query ? 'Найдено: ' + found.length : cur.name;
    found.slice(0, shown).forEach(function (it) {
      var card = el('article', 'ng-card'), view = el('button', 'ng-card__view'), img = el('img'), foot = el('div', 'ng-card__foot');
      view.type = 'button';
      view.dataset.view = it.id;
      img.src = it.i;
      img.alt = '';
      img.loading = 'lazy';
      if (COVER[it.id]) {
        var cover = el('span', 'ng-cover');
        cover.style.setProperty('--cover', 'url(' + it.i + ')');
        cover.appendChild(img);
        view.append(cover, el('span', 'ng-card__name', it.n));
      } else view.append(img, el('span', 'ng-card__name', it.n));
      var sets = setsList(it);
      var add = el('button');
      add.type = 'button';
      add.dataset.pick = it.id;
      foot.append(el('b', '', it.p + (it.pp ? ' / гость' : '')), add);
      card.appendChild(view);
      if (sets) card.appendChild(sets);
      card.appendChild(foot);
      grid.appendChild(card);
    });
    $('[data-more]').hidden = shown >= found.length;
    $('[data-catlink]').href = cur.url;
    $$('[data-group]', tabs).forEach(function (b) { b.classList.toggle('is-on', !query && b.dataset.group === cur.slug); });
    document.dispatchEvent(new CustomEvent('ktg:group', { detail: cur.slug }));
    syncPicks();
  }

  function syncPicks() {
    $$('[data-pick]', grid).forEach(function (b) {
      var on = picked.indexOf(+b.dataset.pick) !== -1;
      b.classList.toggle('is-on', on);
      b.textContent = on ? 'В подборке' : 'В подборку';
    });
    if (modal.dataset.id) $('[data-qv-pick]').textContent = picked.indexOf(+modal.dataset.id) !== -1 ? 'Убрать из подборки' : 'Добавить в подборку';
  }

  function go(slug, scroll) {
    var next = DATA.filter(function (group) { return group.slug === slug; })[0];
    if (!next) return;
    cur = next;
    shown = 12;
    query = '';
    $('[data-search]').value = '';
    renderGrid();
    if (scroll) document.getElementById('menu').scrollIntoView();
  }

  /* ---------- окно карточки ---------- */
  function photo(url) {
    var main = $('[data-qv-img]');
    main.onerror = function () { main.onerror = null; main.src = url; };
    main.src = url.replace('/images/generate/294_294_', '/images/upload/');
  }

  function view(id) {
    var rec = byId[id];
    if (!rec) return;
    var it = rec.it, photos = (it.g && it.g.length ? it.g : [it.i]).filter(function (u, n, a) { return a.indexOf(u) === n; }).slice(0, 5);
    modal.dataset.id = id;
    at = list.indexOf(id);
    photo(photos[0]);
    $('[data-qv-group]').textContent = rec.group;
    $('[data-qv-name]').textContent = it.n;
    $('[data-qv-price]').textContent = it.p + (it.pp ? ' на гостя' : '');
    $('[data-qv-link]').href = it.u;
    showSets(it);
    var sim = $('[data-qv-sim]');
    sim.textContent = '';
    photos.forEach(function (url, n) {
      var im = el('img', n ? '' : 'is-on');
      im.src = url;
      im.alt = '';
      im.dataset.photo = url;
      sim.appendChild(im);
    });
    $('.ktg-qv__sim').hidden = photos.length < 2;
    $$('[data-qv-prev]').forEach(function (b) { b.disabled = at <= 0; });
    $$('[data-qv-next]').forEach(function (b) { b.disabled = at === -1 || at >= list.length - 1; });
    syncPicks();
    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
  }

  function close() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
  }

  function step(n) {
    if (at !== -1 && list[at + n] !== undefined) view(list[at + n]);
  }

  /* ---------- события ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('button,a,[data-view],[data-photo]');
    if (!t) return;
    if (t.matches('[data-view]')) {
      e.preventDefault();
      var scope = t.closest('.ng-kit');
      list = scope
        ? $$('.ng-check [data-view]', scope).map(function (x) { return +x.dataset.view; })
        : found.map(function (x) { return x.id; });
      view(+t.dataset.view);
    } else if (t.matches('[data-photo]')) {
      photo(t.dataset.photo);
      $$('[data-photo]', modal).forEach(function (x) { x.classList.toggle('is-on', x === t); });
    } else if (t.matches('[data-qv-prev]')) step(-1);
    else if (t.matches('[data-qv-next]')) step(1);
    else if (t.matches('[data-close]')) close();
    else if (t.matches('[data-group]')) go(t.dataset.group, !tabs.contains(t));
    else if (t.matches('[data-more]')) { shown += 12; renderGrid(); }
    else if (t.matches('[data-dd-btn]')) $('[data-dd]').classList.toggle('is-open');
    else if (t.matches('[data-sort]')) {
      sort = t.dataset.sort;
      shown = 12;
      $$('[data-sort]').forEach(function (b) { b.classList.toggle('is-on', b === t); });
      $('[data-dd-label]').textContent = t.textContent;
      $('[data-dd]').classList.remove('is-open');
      renderGrid();
    }
    else if (t.matches('[data-cart]')) document.getElementById('konstruktor').scrollIntoView();
    else if (t.matches('[data-sl-go]')) {
      var track = $('[data-sl]', t.parentNode);
      track.scrollBy({ left: +t.dataset.slGo * track.clientWidth, behavior: 'smooth' });
    }
  });
  overlay.addEventListener('click', close);
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-dd]')) $('[data-dd]').classList.remove('is-open');
  });
  $('[data-search]').addEventListener('input', function () {
    var v = this.value.trim().toLowerCase().replace(/ё/g, 'е');
    clearTimeout(typing);
    typing = setTimeout(function () { query = v; shown = 12; renderGrid(); }, 150);
  });
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  document.addEventListener('ktg:go', function (e) { close(); go(e.detail, true); });
  document.addEventListener('ng:picks', function (e) { picked = e.detail; syncPicks(); });
  $$('[data-sl]').forEach(function (track) {
    track.addEventListener('scroll', function () {
      var k = Math.round(track.scrollLeft / track.clientWidth);
      $$('.ktg-sl__dots i', track.parentNode).forEach(function (d, n) { d.classList.toggle('is-on', n === k); });
    }, { passive: true });
  });

  /* ---------- даты «Атриума»: та же открытая ручка, что на /keytering/ ---------- */
  var atr = $('[data-atr]'), ym = atr.dataset.month.split('-'), year = +ym[0], month = +ym[1] - 1;
  var busy = atr.dataset.busy.split(',').map(Number), reserve = [], drawn = false;
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  function drawDates() {
    if (drawn) return;
    drawn = true;
    var days = $('[data-atr-days]', atr), total = new Date(year, month + 1, 0).getDate(), free = 0;
    days.textContent = '';
    for (var blank = (new Date(year, month, 1).getDay() + 6) % 7; blank > 0; blank--) days.appendChild(el('span'));
    for (var d = 1; d <= total; d++) {
      var date = new Date(year, month, d), taken = busy.indexOf(d) !== -1, past = date < today, held = reserve.indexOf(d) !== -1, wd = date.getDay();
      var b = el('button', 'ktg-atr__d' + (wd === 0 || wd === 6 ? ' is-wk' : '') + (taken ? ' is-busy' : past ? ' is-past' : held ? ' is-res' : ''), String(d));
      b.type = 'button';
      b.dataset.d = d;
      b.disabled = taken || past;
      if (!taken && !past && !held) free++;
      days.appendChild(b);
    }
    $('[data-atr-free]', atr).textContent = 'свободно ' + free + ' из ' + total;
  }

  setTimeout(drawDates, 4000);
  fetch('https://vyzovchat.ru/api/public/atrium?month=' + atr.dataset.month)
    .then(function (r) { if (!r.ok) throw r; return r.json(); })
    .then(function (j) { if (!drawn) { busy = j.busy; reserve = j.reserve; atr.dataset.live = '1'; } })
    .catch(function () {})
    .then(drawDates);
  var name = new Date(year, month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
  $('[data-atr-month]', atr).textContent = name.charAt(0).toUpperCase() + name.slice(1);
  $('[data-atr-days]', atr).addEventListener('click', function (e) {
    var b = e.target.closest('[data-d]');
    if (!b || b.disabled) return;
    $$('.ktg-atr__d.is-on', atr).forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    var label = new Date(year, month, +b.dataset.d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' });
    var pick = $('[data-atr-pick]', atr);
    pick.textContent = '';
    pick.append(el('b', '', label), b.classList.contains('is-res') ? ' — предварительно занято, менеджер уточнит' : ' — свободно');
  });

  /* ---------- формы: превью заявки не отправляет ---------- */
  $$('[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      $('[data-preview]', f).hidden = false;
    });
  });

  renderGrid();
})();
