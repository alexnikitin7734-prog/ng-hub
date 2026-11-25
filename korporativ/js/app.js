(function () {
  var T = window.THEMES;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var dot = function (c) { return '<svg class="tm__dot" viewBox="0 0 10 10" style="--c:' + c + '"><circle cx="5" cy="5" r="5" fill="' + c + '"/></svg>'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); };
  var bySlug = {};
  T.forEach(function (t) { bySlug[t.slug] = t; });

  var mode = 'atrium';
  function setMode(m) {
    mode = m;
    $$('.seg__b').forEach(function (b) { var on = b.dataset.mode === m; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    $$('[data-for]').forEach(function (el) { el.hidden = el.dataset.for !== m; });
  }
  $$('.seg__b').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });

  var menu = $('#tmenu'), grid = $('#grid');
  menu.innerHTML = T.map(function (t) {
    return '<button class="tm" type="button" data-slug="' + t.slug + '" style="--c:' + t.color + '">' + dot(t.color) + esc(t.name) + '</button>';
  }).join('');
  grid.innerHTML = T.map(function (t) {
    return '<article class="card" data-slug="' + t.slug + '" style="--c:' + t.color + '" tabindex="0" aria-label="' + esc(t.name) + '">' +
      '<video muted loop playsinline preload="none" poster="video/' + t.slug + '-poster.jpg?v=2" src="video/' + t.slug + '-card.mp4?v=2"></video>' +
      '<div class="card__body"><h3 class="card__name">' + dot(t.color) + esc(t.name) + '</h3>' +
      '<p class="card__mood">' + esc(t.mood) + '</p>' +
      '<div class="card__row"><span class="price"><span class="price__from">от</span> <span class="stub stub--in">[цена]</span> ₽</span>' +
      '<button class="card__btn" type="button">Хочу такой</button></div></div></article>';
  }).join('');

  var cards = $$('.card', grid);
  var vis = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = $('video', e.target);
      if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
    });
  }, { rootMargin: '100px 0px' });
  cards.forEach(function (c) { vis.observe(c); });

  var active = null;
  function setActive(slug, scrollMenu) {
    if (active === slug) return;
    active = slug;
    $$('.tm', menu).forEach(function (b) { b.classList.toggle('is-on', b.dataset.slug === slug); });
    cards.forEach(function (c) { c.classList.toggle('is-on', c.dataset.slug === slug); });
    if (!slug || scrollMenu === false) return;
    var b = $('.tm[data-slug="' + slug + '"]', menu);
    if (menu.scrollWidth > menu.clientWidth) {
      var x = b.offsetLeft - (menu.clientWidth - b.offsetWidth) / 2;
      menu.scrollTo({ left: Math.max(0, x), behavior: 'smooth' });
    }
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

  var modal = $('#modal'), mv = $('video', modal);
  function openTheme(slug) {
    var t = bySlug[slug];
    $('.modal__title', modal).innerHTML = esc(t.name);
    $('.modal__mood', modal).textContent = t.mood;
    $('.modal__box', modal).style.setProperty('--c', t.color);
    mv.poster = 'video/' + slug + '-big.jpg?v=2';
    mv.src = 'video/' + slug + '-big.mp4?v=2';
    $('.inc', modal).innerHTML = t.groups.map(function (g) {
      return '<div class="inc__g"><p class="inc__t">' + esc(g.title) + '</p>' + g.items.map(function (i) {
        return '<a class="inc__i" href="' + esc(i.u) + '" target="_blank" rel="noopener">' +
          (i.img ? '<img src="' + esc(i.img) + '" alt="" loading="lazy" width="36" height="36">' : '') +
          '<span>' + esc(i.n) + '</span><svg class="ic"><use href="#i-out"/></svg></a>';
      }).join('') + '</div>';
    }).join('');
    $('.modal__go', modal).dataset.slug = slug;
    setActive(slug);
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
    var p = mv.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeModal() { modal.close(); }
  modal.addEventListener('close', function () { mv.pause(); mv.removeAttribute('src'); mv.load(); });
  $('.modal__x', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  function want(slug) {
    pick(slug);
    if (modal.open) closeModal();
    $('#zayavka').scrollIntoView({ behavior: 'smooth' });
  }
  $('.modal__go', modal).addEventListener('click', function (e) { e.preventDefault(); want(this.dataset.slug); });

  grid.addEventListener('click', function (e) {
    var c = e.target.closest('.card'); if (!c) return;
    if (e.target.closest('.card__btn')) { want(c.dataset.slug); return; }
    openTheme(c.dataset.slug);
  });
  grid.addEventListener('keydown', function (e) {
    var c = e.target.closest('.card'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openTheme(c.dataset.slug); }
  });
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('.tm'); if (!b) return;
    var c = $('.card[data-slug="' + b.dataset.slug + '"]', grid);
    var y = c.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--top')) || 64) - 72;
    window.scrollTo({ top: y, behavior: 'instant' });
    openTheme(b.dataset.slug);
  });

  var dd = $('#dd'), ddBtn = $('.dd__btn', dd), ddList = $('.dd__list', dd), hl = -1;
  ddList.innerHTML = T.map(function (t) { return '<li role="option" data-slug="' + t.slug + '" aria-selected="false">' + dot(t.color) + esc(t.name) + '</li>'; }).join('') +
    '<li role="option" data-slug="" aria-selected="false">Пока не знаем — посоветуйте</li>';
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

  var cv = $('.hero__spark'), ctx = cv.getContext('2d'), dots = [], still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() {
    var r = cv.getBoundingClientRect(), k = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = r.width * k; cv.height = r.height * k; ctx.setTransform(k, 0, 0, k, 0, 0);
    var n = Math.round(r.width * r.height / 9000);
    dots = [];
    for (var i = 0; i < n; i++) dots.push({ x: Math.random() * r.width, y: Math.random() * r.height, r: Math.random() * 1.6 + .4, p: Math.random() * 6.28, s: Math.random() * .02 + .006, g: Math.random() < .7 });
  }
  function draw() {
    var w = cv.width, h = cv.height; ctx.clearRect(0, 0, w, h);
    dots.forEach(function (d) {
      d.p += d.s; var a = (Math.sin(d.p) + 1) / 2;
      ctx.globalAlpha = a * .9;
      ctx.fillStyle = d.g ? '#f0d99a' : '#ffffff';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (0.6 + a * .6), 0, 6.28); ctx.fill();
      if (d.r > 1.6 && a > .8) { ctx.globalAlpha = (a - .8) * 3; ctx.fillRect(d.x - d.r * 4, d.y - .4, d.r * 8, .8); ctx.fillRect(d.x - .4, d.y - d.r * 4, .8, d.r * 8); }
    });
    ctx.globalAlpha = 1;
    if (!still) requestAnimationFrame(draw);
  }
  size(); draw();
  window.addEventListener('resize', size);

  setMode('atrium');
  track();
})();
