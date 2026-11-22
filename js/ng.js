/* НГ-лендинг: ёлка от колеса над рамкой. */
(function () {
  'use strict';
  var root = document.getElementById('ktg');
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  var clamp = function (x, a, b) { return Math.min(1, Math.max(0, (x - a) / (b - a))); };
  var smooth = function (t) { return t * t * (3 - 2 * t); };
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none)').matches;

  /* ---------- ёлка ---------- */
  var hero = $('[data-hero]'), tree = $('[data-tree]'), frame = $('[data-frame]');
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

  // Курсор на ёлке — колесо наряжает, страница стоит. Нарядилась — колесо снова у страницы, насовсем.
  // На тач-экранах колеса нет: ёлка наряжается сама, когда показалась.
  var WHEEL = 1100, PAUSE = 600, target = 0, shownP = 0, freeAt = 0, playing = false;

  function progress() {
    if (still) return 1;
    if (playing) target = Math.min(1, target + 1 / 240);
    shownP += (target - shownP) * .16;
    if (Math.abs(target - shownP) < .001) shownP = target;
    return shownP;
  }

  tree.addEventListener('wheel', function (e) {
    if (still || !e.cancelable || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (target >= 1) {
      // короткая пауза, чтобы инерция не унесла мимо звезды
      if (e.deltaY > 0 && Date.now() < freeAt) e.preventDefault();
      return;
    }
    var box = tree.getBoundingClientRect();
    var whole = box.top >= top - 4 && box.bottom <= innerHeight + 4;
    if (!whole || (e.deltaY < 0 && target <= 0)) return;
    e.preventDefault();
    var px = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? innerHeight : 1);
    target = Math.min(1, Math.max(0, target + Math.max(-240, Math.min(240, px)) / WHEEL));
    if (target >= 1) freeAt = Date.now() + PAUSE;
  }, { passive: false });

  if (touch) new IntersectionObserver(function (e) { if (e[0].isIntersecting) playing = true; }, { threshold: .6 }).observe(tree);

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
})();
