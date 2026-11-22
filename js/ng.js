/* НГ-лендинг: ёлка по прокрутке, вкладки с карточками, подборка. Скролл страницы не перехватываем. */
(function () {
  'use strict';
  var root = document.getElementById('ktg');
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  var money = function (n) { return n.toLocaleString('ru-RU') + ' ₽'; };
  var clamp = function (x, a, b) { return Math.min(1, Math.max(0, (x - a) / (b - a))); };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow = matchMedia('(max-width: 900px)');

  /* ---------- ёлка ---------- */
  var hero = $('[data-hero]'), track = $('[data-track]'), tree = $('[data-tree]'), frame = $('[data-frame]');
  var cv = $('[data-fx]'), ctx = cv.getContext('2d'), gifts = $$('.ng-gift');
  var header = document.getElementById('hdr26');
  var TOP = .155, BOT = .8, top = 0, W = 0, H = 0, prevD = 0, bulbs = [], gold = [], seen = true;

  var glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  var g = glow.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, '#fffbe8');
  grad.addColorStop(.12, 'rgba(255,214,140,1)');
  grad.addColorStop(.32, 'rgba(255,170,70,.28)');
  grad.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);

  function halfWidth(s) { return .02 + .118 * Math.pow(s, .95); }
  for (var strand = 0; strand < 2; strand++) {
    for (var i = 0; i < 120; i++) {
      var s = i / 119, a = s * 14 * Math.PI + strand * Math.PI, depth = Math.cos(a);
      if (depth > -.3) bulbs.push({ s: s, x: .499 + halfWidth(s) * .93 * Math.sin(a), y: TOP + s * (BOT - TOP), depth: depth, phase: i * 1.7 });
    }
  }

  function measure() {
    top = header ? Math.max(0, Math.round(header.getBoundingClientRect().height)) : 0;
    root.style.setProperty('--ng-top', top + 'px');
    W = cv.width = frame.offsetWidth;
    H = cv.height = frame.offsetHeight;
  }

  function progress() {
    if (still) return 1;
    var box = narrow.matches ? track : hero;
    var pinned = narrow.matches ? tree.offsetHeight + 8 : innerHeight - top;
    return clamp(top - box.getBoundingClientRect().top, 0, Math.max(1, box.offsetHeight - pinned));
  }

  function draw(now) {
    var t = now / 1000, p = progress();
    var d = smooth(clamp(p, .02, .4)), lit = clamp(p, .3, .56), star = smooth(clamp(p, .52, .64)), open = smooth(clamp(p, .8, .92));
    frame.style.setProperty('--d', d);
    frame.style.setProperty('--star', star * (.88 + .12 * Math.sin(t * 3)));
    frame.style.setProperty('--open', open);
    tree.style.setProperty('--p', p);
    tree.classList.toggle('is-open', p > .82);

    gifts.forEach(function (el, n) {
      var k = smooth(clamp(p, .62 + n * .04, .72 + n * .04));
      el.style.opacity = k;
      el.style.transform = 'translateY(' + (1 - k) * -40 + '%) scale(' + (.5 + k * .5) + ')';
      el.querySelector('.ng-gift__lid').style.transform = 'translateY(' + open * -9 + '%) rotate(' + open * (n === 0 ? -4 : 4) + 'deg)';
    });

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    bulbs.forEach(function (b) {
      var on = clamp(lit * 1.3 - (1 - b.s), 0, .3);
      if (!on) return;
      var size = W * .017 * (.8 + .2 * b.depth);
      ctx.globalAlpha = on * (.55 + .45 * Math.sin(t * 3 + b.phase) * Math.sin(t * 1.7 + b.phase)) * (.55 + .45 * (b.depth + .3) / 1.3);
      ctx.drawImage(glow, b.x * W - size, b.y * H - size, size * 2, size * 2);
    });

    var fall = d > prevD ? Math.min(16, Math.round((d - prevD) * 600)) : 0;
    prevD = d;
    if (!still) for (var n = 0; n < fall; n++) gold.push({ x: .499 + (Math.random() * 2 - 1) * .13, y: TOP + Math.random() * d * .4, v: .001 + Math.random() * .002, life: 1 });
    gold = gold.filter(function (o) { return o.life > 0; });
    gold.forEach(function (o) {
      o.y += o.v;
      o.life -= .008;
      ctx.globalAlpha = Math.max(0, o.life);
      var z = W * .004;
      ctx.drawImage(glow, o.x * W - z, o.y * H - z, z * 2, z * 2);
    });
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (seen) draw(now);
    requestAnimationFrame(loop);
  }

  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  new IntersectionObserver(function (e) { seen = e[0].isIntersecting; }).observe(hero);
  if (still) draw(0); else requestAnimationFrame(loop);

  gifts.forEach(function (el) {
    el.addEventListener('click', function () {
      $$('.ng-kit').forEach(function (k) { k.classList.toggle('is-on', '#' + k.id === el.getAttribute('href')); });
    });
  });

  /* ---------- вкладки ---------- */
  var DATA = window.KTG_DATA, byId = {}, cur = DATA[0], shown = 12, picks = [];
  DATA.forEach(function (group) { group.items.forEach(function (it) { byId[it.id] = it; }); });
  var tabs = $('[data-tabs]'), grid = $('[data-grid]'), more = $('[data-more]'), chosen = $('[data-chosen]'), kit = '';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  DATA.forEach(function (group) {
    var b = el('button', '', group.name);
    b.type = 'button';
    b.dataset.group = group.slug;
    tabs.appendChild(b);
  });

  function render() {
    grid.textContent = '';
    cur.items.slice(0, shown).forEach(function (it) {
      var card = el('article', 'ng-card'), link = el('a'), img = el('img'), foot = el('div', 'ng-card__foot');
      link.href = it.u;
      link.target = '_blank';
      link.rel = 'noopener';
      img.src = it.i;
      img.alt = '';
      img.loading = 'lazy';
      link.append(img, el('span', 'ng-card__name', it.n));
      var on = picks.indexOf(it.id) !== -1, add = el('button', on ? 'is-on' : '', on ? 'В подборке' : 'В подборку');
      add.type = 'button';
      add.dataset.id = it.id;
      foot.append(el('b', '', it.p), add);
      card.append(link, foot);
      grid.appendChild(card);
    });
    more.hidden = shown >= cur.items.length;
    $('[data-catlink]').href = cur.url;
    [].forEach.call(tabs.children, function (b) { b.classList.toggle('is-on', b.dataset.group === cur.slug); });
    document.dispatchEvent(new CustomEvent('ktg:group', { detail: cur.slug }));
  }

  function go(slug, scroll) {
    var next = DATA.filter(function (group) { return group.slug === slug; })[0];
    if (!next) return;
    cur = next;
    shown = 12;
    render();
    if (scroll) document.getElementById('menu').scrollIntoView();
  }

  function summary() {
    var sum = picks.reduce(function (total, id) { return total + byId[id].v; }, 0);
    $('[data-cart-n]').textContent = picks.length;
    $('[data-cart-sum]').textContent = sum ? 'от ' + money(sum) : '';
    $('[data-cart]').classList.toggle('is-shown', picks.length > 0);
    var parts = [];
    if (kit) parts.push('Комплект «' + kit + '»');
    if (picks.length) parts.push('Подборка: ' + picks.map(function (id) { return byId[id].n; }).join(', ') + ' — от ' + money(sum));
    chosen.textContent = parts.join('. ');
    chosen.hidden = !parts.length;
  }

  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-group]');
    if (b) go(b.dataset.group);
  });
  document.addEventListener('ktg:go', function (e) { go(e.detail, true); });
  more.addEventListener('click', function () { shown += 12; render(); });
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-id]');
    if (!b) return;
    var id = +b.dataset.id, at = picks.indexOf(id);
    if (at === -1) picks.push(id); else picks.splice(at, 1);
    b.classList.toggle('is-on', at === -1);
    b.textContent = at === -1 ? 'В подборке' : 'В подборку';
    summary();
  });
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { go(b.dataset.go, true); }); });
  $$('[data-kit]').forEach(function (b) { b.addEventListener('click', function () { kit = b.dataset.kit; summary(); }); });
  $('[data-cart]').addEventListener('click', function () { document.getElementById('zayavka').scrollIntoView(); });
  render();
  summary();

  /* ---------- форма: превью заявки не отправляет ---------- */
  $('[data-form]').addEventListener('submit', function (e) {
    e.preventDefault();
    $('[data-preview]').hidden = false;
  });
})();
