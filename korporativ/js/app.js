(function () {
  var T = window.THEMES;
  var V = '?v=3';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
  var money = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };
  var ic = function (id) { return '<svg class="ic"><use href="#' + id + '"/></svg>'; };
  var bySlug = {};
  T.forEach(function (t) { bySlug[t.slug] = t; });

  var hv = $('.hero__media video');
  var mode = 'atrium';
  function setMode(m) {
    mode = m;
    $$('.seg__b').forEach(function (b) { var on = b.dataset.mode === m; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    $$('[data-for]').forEach(function (el) { el.hidden = el.dataset.for !== m; });
    heroPlay();
  }
  function heroPlay() {
    if (mode === 'atrium' && !modal.open && heroSeen) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); } else hv.pause();
  }
  $$('.seg__b').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  var heroSeen = true;
  new IntersectionObserver(function (es) { heroSeen = es[0].isIntersecting; heroPlay(); }).observe($('.hero__card'));

  var grid = $('#grid');
  grid.innerHTML = T.map(function (t) {
    return '<article class="card" data-slug="' + t.slug + '" tabindex="0" aria-label="' + esc(t.name) + '">' +
      '<img class="card__img" src="img/temy/' + t.slug + '.webp' + V + '" alt="" width="640" height="480" loading="lazy">' +
      '<h3 class="card__name">' + esc(t.name) + '</h3>' +
      '<p class="card__mood">' + esc(t.mood) + '</p>' +
      '<dl class="card__price"><div><dt>30 гостей</dt><dd>от ' + money(t.total[0]) + '</dd></div><div><dt>50 гостей</dt><dd>от ' + money(t.total[1]) + '</dd></div></dl>' +
      '<div class="card__row"><button class="btn btn--primary btn--sm card__open" type="button">' + ic('i-play') + 'Программа и видео</button></div></article>';
  }).join('') +
    '<article class="card card--own"><img class="card__img" src="img/temy/svoya.webp' + V + '" alt="" width="640" height="480" loading="lazy"><h3 class="card__name">Своя тема</h3>' +
    '<p class="card__mood">Не нашли свою — соберём программу под ваш повод и&nbsp;бюджет из того же каталога.</p>' +
    '<div class="card__row"><a class="btn btn--light btn--sm" href="#zayavka">Обсудить</a></div></article>';
  var cards = $$('.card[data-slug]', grid);

  var hdr = document.getElementById('hdr26');
  var row = hdr && hdr.querySelector('.hdr26__n .hdr26__c');
  var links = document.createElement('div');
  links.className = 'tnav';
  links.innerHTML = '<a class="tnav__hol" href="https://arenda-attrakcionov.ru/attrakciony-na-novyj-god/">' + ic('i-gift') + 'Новый год</a>' +
    T.map(function (t) { return '<button type="button" data-slug="' + t.slug + '">' + esc(t.name) + '</button>'; }).join('');
  if (row) { row.classList.add('tnav-row'); row.insertBefore(links, row.firstChild); }

  var active = null;
  function setActive(slug) {
    if (active === slug) return;
    active = slug;
    $$('button', links).forEach(function (b) { b.classList.toggle('is-on', b.dataset.slug === slug); });
    if (!slug) return;
    var b = $('button[data-slug="' + slug + '"]', links);
    if (links.scrollWidth > links.clientWidth) links.scrollTo({ left: Math.max(0, b.offsetLeft - (links.clientWidth - b.offsetWidth) / 2), behavior: 'smooth' });
  }
  var ticking = false;
  function track() {
    ticking = false;
    if (modal.open) return;
    var g = grid.getBoundingClientRect(), vh = window.innerHeight, vw = window.innerWidth;
    if (g.bottom < vh * 0.3 || g.top > vh * 0.7) { setActive(null); return; }
    var cy = vh * 0.55, cx = vw / 2, best = null, bd = 1e9;
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - cy) * 3 + Math.abs(r.left + r.width / 2 - cx);
      if (d < bd) { bd = d; best = c.dataset.slug; }
    });
    setActive(best);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(track); } }, { passive: true });

  var modal = $('#modal'), mv = $('video', modal), cur = null, gi = 0;
  function paintSum() {
    var t = bySlug[cur];
    $$('.seg__g', modal).forEach(function (b) { var on = +b.dataset.g === gi; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    $('.modal__sum', modal).innerHTML = '<small>итого</small> от ' + money(t.total[gi]);
    $('.inc', modal).innerHTML = t.groups.map(function (g) {
      return '<div class="inc__g"><p class="inc__t">' + esc(g.title) + '</p>' + g.items.map(function (i) {
        return '<a class="inc__i" href="' + esc(i.u) + '" target="_blank" rel="noopener">' +
          (i.img ? '<img src="' + esc(i.img) + '" alt="" loading="lazy" width="44" height="44">' : '<span class="inc__ph"></span>') +
          '<span class="inc__n">' + esc(i.n) + '<small>' + esc(i.q[gi]) + '</small></span>' +
          '<b class="inc__p">' + money(i.s[gi]) + '</b></a>';
      }).join('') + '</div>';
    }).join('');
  }
  $$('.seg__g', modal).forEach(function (b) { b.addEventListener('click', function () { gi = +b.dataset.g; paintSum(); }); });
  function openTheme(slug) {
    var t = bySlug[slug];
    cur = slug;
    $('.modal__title', modal).textContent = t.name;
    $('.modal__mood', modal).textContent = t.mood;
    $('.modal__img', modal).src = 'img/temy/' + slug + '.webp' + V;
    mv.poster = 'video/' + slug + '-big.jpg' + V;
    mv.src = 'video/' + slug + '-big.mp4' + V;
    paintSum();
    $('.modal__go', modal).dataset.slug = slug;
    setActive(slug);
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
    $('.modal__box', modal).scrollTop = 0;
    heroPlay();
    var p = mv.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeModal() { modal.close(); }
  modal.addEventListener('close', function () { mv.pause(); mv.removeAttribute('src'); mv.load(); heroPlay(); });
  $('.modal__x', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  function want(slug) {
    pick(slug);
    if (modal.open) closeModal();
    $('#zayavka').scrollIntoView({ behavior: 'smooth' });
  }
  $('.modal__go', modal).addEventListener('click', function (e) { e.preventDefault(); want(this.dataset.slug); });

  grid.addEventListener('click', function (e) {
    var c = e.target.closest('.card[data-slug]'); if (!c) return;
    openTheme(c.dataset.slug);
  });
  grid.addEventListener('keydown', function (e) {
    var c = e.target.closest('.card[data-slug]'); if (c && e.target === c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openTheme(c.dataset.slug); }
  });
  links.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-slug]'); if (!b) return;
    var c = $('.card[data-slug="' + b.dataset.slug + '"]', grid);
    var top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr26-hnow')) || 150;
    window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - top - 24, behavior: 'instant' });
    openTheme(b.dataset.slug);
  });

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

  setMode('atrium');
  track();
})();
