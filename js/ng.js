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
  var TOP = .155, BOT = .8, CX = .499, top = 0, W = 0, H = 0, prevD = 0, bulbs = [], parts = [], seen = true;

  // огни и блёстки — как на ng-vip (№543)
  function sprite(core, halo) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, '#fffcee');
    r.addColorStop(.09, core);
    r.addColorStop(.28, halo);
    r.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    return c;
  }
  var GLOW = [sprite('rgba(255,214,140,1)', 'rgba(255,170,70,.28)'), sprite('rgba(255,190,100,1)', 'rgba(255,140,40,.3)'), sprite('rgba(255,236,190,1)', 'rgba(255,200,120,.24)')];
  var FOIL = ['#f6e2a8', '#e9c97a', '#d6b46a', '#fff1c8', '#b8913f'];

  function halfWidth(s) { return .02 + .118 * Math.pow(s, .95); }
  var seed = 7, rnd = function () { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
  for (var strand = 0; strand < 2; strand++) {
    for (var i = 0; i < 120; i++) {
      var s = i / 119, a = s * 14 * Math.PI + strand * Math.PI, depth = Math.cos(a);
      if (depth < -.3) continue;
      bulbs.push({
        s: s, depth: depth, chase: (i + strand) % 4, phase: rnd() * 6.28, speed: 5 + rnd() * 6, pop: 0,
        tint: rnd() < .18 ? 1 : rnd() < .3 ? 2 : 0,
        x: CX + halfWidth(s) * .93 * Math.sin(a) + (rnd() - .5) * .006,
        y: TOP + s * (BOT - TOP) + (rnd() - .5) * .008
      });
    }
  }

  function spark(x, y, k) {
    var o = {
      x: x, y: y, vx: (Math.random() - .5) * .0006 * k, vy: (.0004 + Math.random() * .0012) * k,
      turn: Math.random() * 6.28, spin: .05 + Math.random() * .15, size: .002 + Math.random() * .003,
      shine: Math.random() < .3, color: FOIL[Math.random() * 5 | 0], life: 1, floor: BOT + .02 + Math.random() * .12
    };
    parts.push(o);
    tree.dataset.sparks = parts.length;
    return o;
  }

  function rain(n, d) {
    for (var i = 0; i < n; i++) {
      var edge = Math.min(BOT, d * 1.5 - .17), y = TOP - .04 + Math.random() * Math.max(.05, edge - TOP);
      spark(CX + (Math.random() * 2 - 1) * (halfWidth(clamp(y, TOP, BOT)) + .02), y, 1);
    }
  }

  if (!still) tree.addEventListener('pointermove', function (e) {
    var b = frame.getBoundingClientRect();
    for (var i = 0; i < 2; i++) {
      var o = spark((e.clientX - b.left) / b.width + (Math.random() - .5) * .01, (e.clientY - b.top) / b.height, .6);
      o.vy *= .4;
      o.floor = o.y + .08 + Math.random() * .1;
    }
  });

  function measure() {
    top = header ? Math.max(0, Math.round(header.getBoundingClientRect().height)) : 0;
    root.style.setProperty('--ng-top', top + 'px');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.width = Math.round(frame.offsetWidth * dpr);
    H = cv.height = Math.round(frame.offsetHeight * dpr);
  }

  // Курсор на ёлке — колесо наряжает, страница стоит. Нарядилась — вниз едет страница,
  // вверх ёлка откручивается назад (№524). Голая — вверх тоже едет страница.
  // На тач-экранах колеса нет: ёлка наряжается сама, когда показалась.
  var WHEEL = 1100, PAUSE = 600, SETTLE = 300, target = 0, shownP = 0, freeAt = 0, settledAt = 0, playing = false;

  function progress() {
    if (still) return 1;
    if (playing) target = Math.min(1, target + 1 / 240);
    shownP += (target - shownP) * .16;
    if (Math.abs(target - shownP) < .001) shownP = target;
    return shownP;
  }

  tree.addEventListener('wheel', function (e) {
    if (still || !e.cancelable || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    var now = Date.now();
    if (target >= 1 && e.deltaY > 0) {
      // короткая пауза, чтобы инерция не унесла мимо звезды
      if (now < freeAt) e.preventDefault();
      return;
    }
    // приехали снизу: остаток той же прокрутки ёлку не раздевает
    if (e.deltaY < 0 && now < settledAt) {
      settledAt = now + SETTLE;
      return;
    }
    var box = tree.getBoundingClientRect();
    var whole = box.top >= top - 4 && box.bottom <= innerHeight + 4;
    if (!whole || (e.deltaY < 0 && target <= 0)) return;
    e.preventDefault();
    var px = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? innerHeight : 1);
    target = Math.min(1, Math.max(0, target + Math.max(-240, Math.min(240, px)) / WHEEL));
    if (target >= 1) freeAt = now + PAUSE;
  }, { passive: false });
  addEventListener('scroll', function () { settledAt = Date.now() + SETTLE; }, { passive: true });

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
    // три рисунка гирлянды сменяют друг друга
    var mode = t / 9 % 3, m = Math.floor(mode), blend = clamp(mode - m, .85, 1), w = [0, 0, 0];
    w[m] = 1 - blend;
    w[(m + 1) % 3] = blend;
    bulbs.forEach(function (b) {
      var on = clamp(lit * 1.3 - (1 - b.s), 0, .3);
      if (!on) return;
      var steady = .82 + .18 * Math.sin(t * b.speed + b.phase) * Math.sin(t * b.speed * .63 + b.phase * 2);
      var chase = .25 + .75 * Math.pow(.5 + .5 * Math.sin(t * 2.4 + b.chase * Math.PI / 2), 2);
      var wave = .3 + .7 * Math.pow(.5 + .5 * Math.sin(t * 1.6 - b.s * 14), 1.6);
      if (!still && b.pop <= 0 && Math.random() < .0015) b.pop = 1;
      b.pop = Math.max(0, b.pop - .03);
      var k = w[0] * steady + w[1] * chase + w[2] * wave + b.pop * .5, vis = .35 + .65 * (b.depth + .3) / 1.3;
      var size = W * .017 * (.7 + .3 * vis) * (.75 + .45 * k);
      ctx.globalAlpha = Math.min(1, on * vis * k);
      ctx.drawImage(GLOW[b.tint], b.x * W - size, b.y * H - size, size * 2, size * 2);
    });
    ctx.globalCompositeOperation = 'source-over';

    var step = d - prevD;
    prevD = d;
    if (!still) {
      if (step > 0) rain(Math.min(22, Math.ceil(step * 800)), d);
      if (step < 0) parts.forEach(function (o) { o.life = Math.min(o.life, .4); });
      if (d > .98 && Math.random() < .3) rain(1, d);
    }
    parts = parts.filter(function (o) { return o.life > 0; });
    parts.forEach(function (o) {
      o.x += o.vx;
      o.y += o.vy;
      o.vx += (Math.random() - .5) * .00004;
      o.turn += o.spin;
      if (o.y > o.floor) {
        o.y = o.floor;
        o.vx = o.vy = 0;
        o.life -= .012;
      }
      var size = o.size * W, face = Math.abs(Math.cos(o.turn));
      ctx.globalAlpha = Math.min(1, o.life) * (.45 + .55 * face);
      ctx.fillStyle = o.color;
      ctx.save();
      ctx.translate(o.x * W, o.y * H);
      ctx.rotate(o.turn * .3);
      ctx.fillRect(-size / 2, -size * face / 2, size, size * face + .6);
      ctx.restore();
      if (o.shine && face > .7) {
        var z = size * 5 * face;
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.min(1, o.life) * (face - .7) * 2.5;
        ctx.drawImage(GLOW[2], o.x * W - z, o.y * H - z, z * 2, z * 2);
        ctx.globalCompositeOperation = 'source-over';
      }
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

  /* ---------- «Вживую» ---------- */
  var inView = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { var p = e.target.play(); if (p) p.catch(function () {}); } else e.target.pause();
    });
  }, { threshold: .2 });
  $$('.ng-gal video').forEach(function (v) { if (!still) inView.observe(v); });

  $$('.ng-sl').forEach(function (box, k) {
    var im = [].slice.call(box.querySelectorAll('img')), row = box.querySelector('.ng-sl__dots'), at = 0, timer, x0 = null;
    var dots = im.map(function () { return row.appendChild(document.createElement('i')); });
    dots[0].classList.add('is-on');
    function go(n) {
      im[at].classList.remove('is-on'); dots[at].classList.remove('is-on');
      at = (n + im.length) % im.length;
      im[at].classList.add('is-on'); dots[at].classList.add('is-on');
      im[(at + 1) % im.length].loading = 'eager';
    }
    function run() {
      clearInterval(timer);
      if (!still) timer = setInterval(function () { go(at + 1); }, 4200 + k * 700);
    }
    box.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    box.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      go(Math.abs(dx) > 30 && dx > 0 ? at - 1 : at + 1);
      run();
    });
    run();
  });

  gifts.forEach(function (el) {
    el.addEventListener('click', function () {
      $$('.ng-kit').forEach(function (k) { k.classList.toggle('is-on', '#' + k.id === el.getAttribute('href')); });
    });
  });
})();
