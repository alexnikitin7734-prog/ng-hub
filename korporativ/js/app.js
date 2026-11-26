(function () {
  var T = window.THEMES;
  var V = '?v=11';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
  var money = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };
  var ic = function (id) { return '<svg class="ic"><use href="#' + id + '"/></svg>'; };
  var bySlug = {};
  T.forEach(function (t) { bySlug[t.slug] = t; });

  var hv = $('.hero__media video');
  function setMode(m) {
    $$('.seg__b').forEach(function (b) { var on = b.dataset.mode === m; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    $$('[data-for]').forEach(function (el) { el.hidden = el.dataset.for !== m; });
    heroPlay();
  }
  function heroPlay() {
    if (!modal.open && heroSeen) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); } else hv.pause();
  }
  $$('.seg__b').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  var heroSeen = true;
  new IntersectionObserver(function (es) { heroSeen = es[0].isIntersecting; heroPlay(); }).observe($('.hero__card'));

  var grid = $('#grid');
  grid.innerHTML = T.map(function (t) {
    return '<article class="card" data-slug="' + t.slug + '" tabindex="0" aria-label="' + esc(t.name) + '">' +
      '<img class="card__img" src="img/temy/' + t.slug + '.webp' + V + '" alt="" width="640" height="480" loading="lazy">' +
      '<h3 class="card__name">' + esc(t.name) + '</h3>' +
      '<p class="card__mood">' + esc(t.mood) + '</p></article>';
  }).join('') +
    '<a class="card card--own" href="#zayavka"><img class="card__img" src="img/temy/svoya.webp' + V + '" alt="" width="640" height="480" loading="lazy"><h3 class="card__name">Своя тема</h3>' +
    '<p class="card__mood">Не нашли свою — соберём программу под ваш повод и&nbsp;бюджет из того же каталога.</p></a>';
  var X = [['halloween', 'horror', 'Хоррор', 'Маски, грим, туман и&nbsp;мурашки по&nbsp;коже'],
    ['white', 'belaya', 'Белая вечеринка', 'Всё в&nbsp;белом: цветы, свечи и&nbsp;лёгкий шик'], ['squid', 'igra-v-kalmara', 'Игра в&nbsp;кальмара', 'Розовые маски, испытания и&nbsp;азарт до&nbsp;финала'],
    ['gavaii', 'gavayi', 'Гавайи', 'Леи, укулеле и&nbsp;коктейли в&nbsp;кокосах'], ['oscar', 'oscar', 'Оскар', 'Красная дорожка, статуэтки и&nbsp;свои номинации'],
    ['chicago', 'chicago', 'Чикаго 30-х', 'Сухой закон, джаз и&nbsp;шляпы федора'], ['zapad', 'dikiy-zapad', 'Дикий Запад', 'Салун, ковбойские шляпы и&nbsp;звезда шерифа'],
    ['piraty', 'piraty', 'Пираты', 'Треуголки, карта и&nbsp;сундук с&nbsp;сокровищами'], ['dacha', 'dacha', 'Дача', 'Самовар, яблоки и&nbsp;гирлянды в&nbsp;саду'],
    ['stilyagi', 'stilyagi', 'Стиляги', 'Буги-вуги, коки и&nbsp;платья в&nbsp;горох'], ['rock', 'rok', 'Рок', 'Электрогитары, кожа и&nbsp;живой драйв'],
    ['cosmos', 'kosmos', 'Космос', 'Ракеты, звёзды и&nbsp;вечер на&nbsp;орбите'], ['barbie', 'barbi', 'Барби', 'Всё розовое, блёстки и&nbsp;каблуки'],
    ['bond', 'bond', 'Джеймс Бонд', 'Смокинги, мартини и&nbsp;шпионские игры'], ['fort', 'fort-boyard', 'Форт Боярд', 'Ключи, испытания и&nbsp;сундук с&nbsp;призом'],
    ['russian', 'russkiy-stil', 'Русский стиль', 'Самовар, хохлома и&nbsp;гармонь']];
  var XN = 5;
  var L = 'https://alexnikitin7734-prog.github.io/ng-hub/vecherinki/';
  var LT = { getsbi: 'getsbi', kazino: 'kazino', '80': '80e', '90': '90e', karnaval: 'maskarad', kiber: 'kiberpank', sssr: 'sssr', blacktie: 'blacktie' };
  $('.card--own', grid).insertAdjacentHTML('beforebegin', X.map(function (x) {
    return '<a class="card card--x" href="' + L + x[1] + '/" data-x="' + x[0] + '" hidden>' +
      '<img class="card__img" src="img/temy/' + x[0] + '.webp' + V + '" alt="" width="640" height="480" loading="lazy">' +
      '<h3 class="card__name">' + x[2] + '</h3><p class="card__mood">' + x[3] + '</p></a>';
  }).join(''));
  var xcards = $$('.card--x', grid), xmore = $('.temy__more');
  xmore.innerHTML = '<span>Ещё ' + X.length + ' тематических вечеринок</span>' + ic('i-down');
  function showAll(o) {
    xcards.forEach(function (c) { c.hidden = !o; });
    grid.classList.toggle('is-all', o);
    xmore.setAttribute('aria-expanded', o);
    xmore.firstChild.textContent = o ? 'Свернуть' : 'Ещё ' + X.length + ' тематических вечеринок';
    if (grid.scrollWidth > grid.clientWidth) grid.scrollTo({ left: o ? xcards[0].getBoundingClientRect().left - grid.getBoundingClientRect().left + grid.scrollLeft - parseFloat(getComputedStyle(grid).scrollPaddingLeft || 0) : 0 });
  }
  xmore.addEventListener('click', function () { showAll(xmore.getAttribute('aria-expanded') !== 'true'); });
  var cards = $$('.card[data-slug]', grid);

  var XL = {}, XB = {}, PT = window.PARTY || {};
  X.forEach(function (x) { XL[x[0]] = x[1]; XB[x[0]] = x; });
  var ALL = T.map(function (t) { return t.slug; }).concat(X.map(function (x) { return x[0]; }));
  var un = function (h) { return h.replace(/&nbsp;/g, ' '); };
  function theme(slug) {
    var x = XB[slug]; if (!x) return bySlug[slug];
    var p = PT[x[1]] || { total: [0, 0], groups: [], gal: [], c: [] };
    return { slug: slug, name: un(x[2]), mood: un(x[3]), total: p.total, groups: p.groups, c: p.c, gal: p.gal.map(function (g) { return '../vecherinki/' + x[1] + '/' + g; }), page: L + x[1] + '/' };
  }
  var nav = window.tnav({ root: '../', here: 'hub', onTheme: goTheme });
  function goTheme(slug) {
    var c = $('.card[data-slug="' + slug + '"]', grid);
    var top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr26-hnow')) || 150;
    window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - top - 24, behavior: 'instant' });
    if (grid.scrollWidth > grid.clientWidth) grid.scrollLeft += c.getBoundingClientRect().left - grid.getBoundingClientRect().left - parseFloat(getComputedStyle(grid).scrollPaddingLeft || 0);
    openTheme(slug);
  }

  var active = null;
  function setActive(slug) {
    if (active === slug) return;
    active = slug;
    nav.mark(slug && (XL[slug] || slug));
  }
  var ticking = false;
  function track() {
    ticking = false;
    if (modal.open) return;
    var g = grid.getBoundingClientRect(), vh = window.innerHeight, vw = window.innerWidth;
    if (g.bottom < vh * 0.3 || g.top > vh * 0.7) { setActive(null); return; }
    var cy = vh * 0.55, cx = vw / 2, best = null, bd = 1e9;
    cards.concat(xcards.filter(function (c) { return !c.hidden; })).forEach(function (c) {
      var r = c.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - cy) * 3 + Math.abs(r.left + r.width / 2 - cx);
      if (d < bd) { bd = d; best = c.dataset.slug || c.dataset.x; }
    });
    setActive(best);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(track); } }, { passive: true });
  grid.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(track); } }, { passive: true });

  var modal = $('#modal'), mv = $('video', modal), pics = $('.modal__pics', modal), cur = null, gi = 0, pt = 0;
  function paintSum() {
    var t = theme(cur);
    $$('.seg__g', modal).forEach(function (b) { var on = +b.dataset.g === gi; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    $('.modal__sum', modal).textContent = 'от ' + money(t.total[gi]);
    $('.modal__per', modal).textContent = '≈ ' + money(Math.round(t.total[gi] / [30, 50][gi] / 100) * 100);
    if (window.NG_SHARE) window.NG_SHARE($('.chek__share', modal), 'tema=' + cur + '&g=' + [30, 50][gi]);
    $('.inc', modal).innerHTML = t.groups.map(function (g) {
      return '<div class="inc__g"><p class="inc__t">' + esc(g.title) + '</p>' + g.items.map(function (i) {
        var q = /×|мин/.test(i.q[gi]) ? '<small>' + esc(i.q[gi]) + '</small>' : '';
        return '<a class="inc__i" href="' + esc(i.u) + '" target="_blank" rel="noopener">' +
          '<span class="inc__n">' + esc(i.n) + q + '</span><i class="inc__d"></i>' +
          '<b class="inc__p">' + money(i.s[gi]) + '</b></a>';
      }).join('') + '</div>';
    }).join('');
  }
  $$('.seg__g', modal).forEach(function (b) { b.addEventListener('click', function () { gi = +b.dataset.g; paintSum(); }); });
  function picsGo(n) {
    var im = $$('img', pics), d = $$('.modal__dot', pics);
    if (!im.length) return;
    n = (n + im.length) % im.length;
    im.forEach(function (e, k) { e.classList.toggle('is-on', k === n); });
    d.forEach(function (e, k) { e.classList.toggle('is-on', k === n); });
    clearTimeout(pt);
    if (im.length > 1) pt = setTimeout(function () { picsGo(n + 1); }, 3500);
  }
  pics.addEventListener('click', function (e) { var b = e.target.closest('.modal__dot'); if (b) picsGo(+b.dataset.n); });
  function openTheme(slug) {
    var t = theme(slug), x = XB[slug];
    cur = slug;
    $('.modal__title', modal).textContent = t.name;
    $('.modal__mood', modal).textContent = t.mood;
    $('.chek__name', modal).textContent = t.name;
    modal.dataset.t = x ? 'party' : slug;
    ['--bg1', '--bg2', '--acc'].forEach(function (v, k) { if (x && t.c[k]) modal.style.setProperty(v, t.c[k]); else modal.style.removeProperty(v); });
    $('.modal__img', modal).src = 'img/temy/' + slug + '.webp' + V;
    clearTimeout(pt);
    if (x) {
      mv.pause(); mv.removeAttribute('src'); mv.removeAttribute('poster'); mv.hidden = true;
      pics.innerHTML = t.gal.map(function (g, k) { return '<img src="' + g + '" alt="' + esc(t.name) + '"' + (k ? ' loading="lazy"' : '') + '>'; }).join('') +
        (t.gal.length > 1 ? '<div class="modal__dots">' + t.gal.map(function (g, k) { return '<button type="button" class="modal__dot" data-n="' + k + '" aria-label="Фото ' + (k + 1) + '"></button>'; }).join('') + '</div>' : '');
      pics.hidden = false;
      picsGo(0);
    } else {
      pics.hidden = true; pics.innerHTML = ''; mv.hidden = false;
      mv.poster = 'video/' + slug + '-big.jpg' + V;
      mv.src = 'video/' + slug + '-big.mp4' + V;
    }
    paintSum();
    $('.modal__go', modal).dataset.slug = slug;
    var page = x ? t.page : LT[slug] && L + LT[slug] + '/';
    $('.modal__more', modal).hidden = !page;
    if (page) $('.modal__more', modal).href = page;
    setActive(slug);
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
    $('.modal__box', modal).scrollTop = 0;
    $('.chek__scroll', modal).scrollTop = 0;
    heroPlay();
    if (!x) { var p = mv.play(); if (p && p.catch) p.catch(function () {}); }
    window.FX.start(modal, slug);
  }
  function step(d) { openTheme(ALL[(ALL.indexOf(cur) + d + ALL.length) % ALL.length]); }
  $('.modal__nav--prev', modal).addEventListener('click', function () { step(-1); });
  $('.modal__nav--next', modal).addEventListener('click', function () { step(1); });
  modal.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); }
  });
  var tx = null, ty = 0;
  modal.addEventListener('touchstart', function (e) { tx = e.touches.length === 1 ? e.touches[0].clientX : null; ty = tx === null ? 0 : e.touches[0].clientY; }, { passive: true });
  modal.addEventListener('touchmove', function (e) {
    if (tx !== null && Math.abs(e.touches[0].clientX - tx) > Math.abs(e.touches[0].clientY - ty)) e.preventDefault();
  }, { passive: false });
  modal.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    tx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, { passive: true });
  function closeModal() { modal.close(); }
  modal.addEventListener('close', function () { window.FX.stop(); clearTimeout(pt); mv.pause(); mv.removeAttribute('src'); mv.load(); heroPlay(); });
  $('.modal__x', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  function want(slug) {
    if (XB[slug] && !opts.some(function (l) { return l.dataset.slug === slug; })) {
      ddList.lastElementChild.insertAdjacentHTML('beforebegin', '<li role="option" data-slug="' + slug + '" aria-selected="false">' + ic('t-svoya') + esc(theme(slug).name) + '</li>');
      opts = $$('li', ddList);
    }
    pick(slug);
    $('#zayavka input[name="guests"]').value = gi ? 50 : 30;
    if (modal.open) closeModal();
    $('#zayavka').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { $('#zayavka input[name="name"]').focus({ preventScroll: true }); }, 600);
  }
  $('.form__send').addEventListener('click', function () {
    var f = $('#zayavka .form'), bad = $$('input[name="name"], input[name="phone"]', f).filter(function (i) { i.classList.toggle('is-bad', !i.value.trim()); return !i.value.trim(); });
    if (bad.length) { bad[0].focus(); return; }
    $('.form__grid', f).style.display = 'none'; $('.form__cta', f).style.display = 'none'; $('.form__ok', f).hidden = false;
  });
  $('.modal__go', modal).addEventListener('click', function (e) { e.preventDefault(); want(this.dataset.slug); });

  grid.addEventListener('click', function (e) {
    var c = e.target.closest('.card[data-slug], .card--x'); if (!c) return;
    if (c.dataset.x) { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return; e.preventDefault(); }
    openTheme(c.dataset.slug || c.dataset.x);
  });
  grid.addEventListener('keydown', function (e) {
    var c = e.target.closest('.card[data-slug]'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openTheme(c.dataset.slug); }
  });
  var A = 'https://arenda-attrakcionov.ru/';
  var KAT = {
    kuhnya: { t: 'Своя кухня', s: 'Меню, форматы подачи и выездные бары — готовим и обслуживаем сами.', l: [
      ['Кейтеринг', 'keytering/'], ['Кейтеринг на Новый Год', 'keytering-na-novyy-god/'], ['Фуршетное меню', 'dostavka-fursheta-v-ofis/'],
      ['Организация банкета', 'organizaciya-banketa/'], ['Организация кофе-брейка', 'organizaciya-kofe-breyka/'], ['Кулинарные станции', 'animacionnye-stancii/'],
      ['Выездной бар', 'vyezdnoy-bar/'], ['Новогодний бар', 'vyezdnoy-novogodniy-bar/'], ['Бар на корпоратив', 'bar-dlya-korporativa/'], ['Кэнди бар', 'kendi-bar/']] },
    dekor: { t: 'Декор и ёлки', s: 'Новогодний декор, ёлки и фотозоны со своего склада.', l: [
      ['Декор', 'arenda-dekora/'], ['Новогодний декор', 'novogodniy-dekor-v-arendu/'], ['Елки', 'elka-v-arendu/'],
      ['Новогодние фотозоны', 'novogodnyaya-fotozona-v-arendu/'], ['Фотозоны 2027', 'fotozona-2027-v-arendu/'], ['Фотозона казино', 'fotozona-kazino/'],
      ['Тематический декор', 'arenda-rekvizita/'], ['Лампы и светильники', 'arenda-svetilnikov/'], ['Подсвечники и канделябры', 'arenda-podsvechnikov-i-kandelyabrov/'],
      ['Декор офиса к празднику', 'dekor-ofisa/']] },
    personal: { t: 'Свой персонал', s: 'Люди на вечер — от официантов до Деда Мороза.', l: [
      ['Персонал', 'personal-na-meropriyatie/'], ['Официанты', 'ofitsianty/'], ['Бармен', 'barmen/'], ['Персонал казино', 'personal-kazino/'],
      ['Ведущий', 'vedushhij/'], ['Аниматор Дед Мороз', 'animator-ded-moroz/'], ['Аниматор Снегурочка', 'animator-snegurochka/'],
      ['Хостес', 'xostes/'], ['Фотограф', 'fotograf/'], ['Артисты и шоу', 'artisty-i-shou/']] },
    mebel: { t: 'Мебель', s: 'Столы, стулья и барные стойки со своего склада.', l: [
      ['Мебель', 'arenda-mebeli/'], ['Мебель для банкета', 'arenda-mebeli-dlya-banketa/'], ['Столы', 'arenda-stolov-na-meropriyatie/'],
      ['Фуршетные и банкетные столы', 'arenda-furshetnyh-stolov/'], ['Коктейльные столы', 'arenda-koktejlnyx-stolov/'], ['Стулья', 'arenda-stulev/'],
      ['Банкетные стулья', 'arenda-banketnyx-stulev/'], ['Барные стойки', 'barnye-stojki-v-arendu/'], ['Светящаяся мебель', 'cvetyashchayasya-mebel-v-arendu/'],
      ['Подборки мебели', 'podborki-mebeli-v-arendu/']] }
  };
  var kat = $('#kat'), scope = $('.scope');
  function openKat(id) {
    var k = KAT[id];
    $('.kat__title', kat).textContent = k.t;
    $('.kat__sub', kat).textContent = k.s;
    $('.kat__list', kat).innerHTML = k.l.map(function (x) { return '<li><a href="' + A + x[1] + '" target="_blank" rel="noopener">' + esc(x[0]) + ic('i-out') + '</a></li>'; }).join('');
    kat.showModal();
    $('.kat__box', kat).scrollTop = 0;
  }
  scope.addEventListener('click', function (e) { var c = e.target.closest('[data-kat]'); if (c) openKat(c.dataset.kat); });
  scope.addEventListener('keydown', function (e) {
    var c = e.target.closest('[data-kat]'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openKat(c.dataset.kat); }
  });
  $('.kat__x', kat).addEventListener('click', function () { kat.close(); });
  kat.addEventListener('click', function (e) { if (e.target === kat) kat.close(); });

  var dd = $('#dd'), ddBtn = $('.dd__btn', dd), ddList = $('.dd__list', dd), hl = -1;
  ddList.innerHTML = T.map(function (t) { return '<li role="option" data-slug="' + t.slug + '" aria-selected="false">' + ic('t-' + t.slug) + esc(t.name) + '</li>'; }).join('') +
    '<li role="option" data-slug="" aria-selected="false">' + ic('t-svoya') + 'Пока не знаем — посоветуйте</li>';
  var opts = $$('li', ddList);
  function ddOpen(o) { ddList.hidden = !o; ddBtn.setAttribute('aria-expanded', o); if (o) { hl = Math.max(0, opts.findIndex(function (l) { return l.getAttribute('aria-selected') === 'true'; })); paint(); } }
  function paint() { opts.forEach(function (l, i) { l.classList.toggle('is-hl', i === hl); }); }
  function pick(slug) {
    opts.forEach(function (l) { l.setAttribute('aria-selected', l.dataset.slug === slug); });
    var l = opts.filter(function (l) { return l.dataset.slug === slug; })[0];
    $('.dd__val', dd).textContent = l ? l.textContent : 'Ещё не выбрали';
  }
  ddBtn.addEventListener('click', function () { ddOpen(ddList.hidden); });
  ddList.addEventListener('click', function (e) { var l = e.target.closest('li'); if (!l) return; pick(l.dataset.slug); ddOpen(false); ddBtn.focus(); });
  ddBtn.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (ddList.hidden) { ddOpen(true); return; }
      hl = (hl + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; paint();
    } else if (e.key === 'Enter' && !ddList.hidden) { e.preventDefault(); pick(opts[hl].dataset.slug); ddOpen(false); }
    else if (e.key === 'Escape') ddOpen(false);
  });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) ddOpen(false); });

  $$('.sl').forEach(function (sl) {
    var tr = $('.sl__track', sl), dots = $$('.sl__dots i', sl);
    $$('[data-go]', sl).forEach(function (b) { b.addEventListener('click', function () { tr.scrollBy({ left: +b.dataset.go * tr.clientWidth, behavior: 'smooth' }); }); });
    tr.addEventListener('scroll', function () {
      var k = Math.round(tr.scrollLeft / tr.clientWidth);
      dots.forEach(function (d, n) { d.classList.toggle('is-on', n === k); });
    }, { passive: true });
  });

  var atr = $('#atrium'), ym = atr.dataset.month.split('-'), year = +ym[0], month = +ym[1] - 1;
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
    var p = $('.atr__pick', atr);
    p.innerHTML = '<b>' + new Date(year, month, +b.dataset.d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' }) + '</b>' + (b.classList.contains('is-res') ? ' — предварительно занято, менеджер уточнит' : ' — свободно');
  });
  $('.atr__send', atr).addEventListener('click', function () {
    var bad = $$('.atr__form input', atr).filter(function (i) { i.classList.toggle('is-bad', !i.value.trim()); return !i.value.trim(); });
    if (bad.length) { bad[0].focus(); return; }
    $('.atr__form', atr).hidden = true; $('.form__ok', atr).hidden = false;
  });

  setMode('atrium');
  track();
  var hm = /tema=([\w-]+)/.exec(location.hash);
  if (hm && /[&#]g=50/.test(location.hash)) gi = 1;
  if (hm && (bySlug[hm[1]] || XB[hm[1]])) document.addEventListener('DOMContentLoaded', function () { if (XB[hm[1]]) { showAll(true); openTheme(hm[1]); } else goTheme(hm[1]); });
})();
