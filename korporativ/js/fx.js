(function () {
  var TH = {
    getsbi: { c: ['#ffe39a', '#e7c36a', '#fff6da', '#c9a227'], amb: [['glint', 22], ['bubble', 12]] },
    kazino: { c: ['#d6343c', '#1d1d1f', '#ebc86e', '#2b62c8', '#f3ead7'], amb: [['chip', 7], ['suit', 9]] },
    '90': { c: ['#c8ff3e', '#ff4fb8', '#29e0d0', '#ffe14d', '#8b5cff'], amb: [['star', 10], ['squig', 8], ['tri', 8]] },
    '80': { c: ['#ff5cc0', '#59e6ff', '#b78cff', '#fff1a8'], amb: [['spark', 22], ['flare', 6]] },
    karnaval: { c: ['#efbe62', '#d9467f', '#8e5be0', '#f2e6c9', '#3bb3a6'], amb: [['foil', 18], ['ribbon', 7]] },
    kiber: { c: ['#36e3ff', '#2f7bea', '#ff2fd0', '#b6f7ff'], amb: [['bit', 26], ['glitch', 5]] },
    blacktie: { c: ['#d9bd7a', '#f4ead2', '#bfc3c9'], amb: [['glint', 10]] },
    sssr: { c: ['#e5483d', '#e9b44c', '#fff1d6'], amb: [['star', 10], ['foil', 12]] }
  };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var cv, ctx, chek, th, amb = [], raf = 0, last = 0, t0 = 0, W = 0, H = 0, dpr = 1, glow = {};
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[Math.random() * a.length | 0]; };

  function sprite(col) {
    if (glow[col]) return glow[col];
    var c = document.createElement('canvas'); c.width = c.height = 48;
    var g = c.getContext('2d'), r = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    r.addColorStop(0, '#fff'); r.addColorStop(.18, col); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(0, 0, 48, 48);
    return (glow[col] = c);
  }

  function init(p, k, start) {
    p.k = k; p.col = pick(th.c); p.rot = rnd(0, 6.28); p.vr = rnd(-1.2, 1.2); p.ph = rnd(0, 6.28); p.x = rnd(0, W); p.y = start ? rnd(0, H) : -30; p.vx = 0;
    var m = W < 700 ? .8 : 1;
    if (k === 'glint') { p.s = rnd(3, 8) * m; p.vy = rnd(-6, 6); p.vx = rnd(-6, 6); p.sp = rnd(1.2, 2.6); }
    else if (k === 'bubble') { p.s = rnd(2, 5) * m; p.vy = -rnd(18, 40); if (!start) p.y = H + 20; p.col = pick(['#f3dc9a', '#fff6da']); }
    else if (k === 'chip') { p.s = rnd(9, 14) * m; p.vy = rnd(26, 46); p.vr = rnd(-1.5, 1.5); p.col = pick(['#d6343c', '#1d1d1f', '#2b62c8', '#ebc86e']); }
    else if (k === 'suit') { p.s = rnd(7, 12) * m; p.vy = rnd(20, 40); p.vr = rnd(-.8, .8); p.su = Math.random() * 4 | 0; p.col = p.su < 2 ? '#e5484d' : '#f3ead7'; }
    else if (k === 'star' || k === 'tri') { p.s = rnd(4, 9) * m; p.vy = rnd(-10, 14); p.vx = rnd(-12, 12); }
    else if (k === 'squig') { p.s = rnd(6, 10) * m; p.vy = rnd(-8, 14); p.vx = rnd(-12, 12); }
    else if (k === 'spark') { p.s = rnd(6, 16) * m; p.vy = -rnd(8, 26); p.vx = rnd(-8, 8); p.sp = rnd(1, 2.4); }
    else if (k === 'flare') { p.s = rnd(10, 22) * m; p.vy = 0; p.sp = rnd(.6, 1.2); }
    else if (k === 'foil') { p.s = rnd(4, 8) * m; p.vy = rnd(30, 60); p.vx = rnd(-10, 10); p.sp = rnd(3, 7); }
    else if (k === 'ribbon') { p.s = rnd(26, 44) * m; p.vy = rnd(24, 40); p.vr = rnd(-.5, .5); }
    else if (k === 'bit') { p.s = rnd(2, 4) * m; p.vy = rnd(60, 150); p.len = rnd(10, 34); p.vr = 0; }
    else if (k === 'glitch') { p.s = rnd(20, 90); p.vy = 0; p.tt = rnd(0, 1); }
    return p;
  }

  function star(n, r1, r2) {
    ctx.beginPath();
    for (var i = 0; i < n * 2; i++) { var r = i % 2 ? r2 : r1, a = i * Math.PI / n - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath();
  }
  function suit(t, s) {
    ctx.beginPath();
    if (t === 0) { ctx.moveTo(0, s * .9); ctx.bezierCurveTo(-s * 1.3, 0, -s * .7, -s * 1.1, 0, -s * .35); ctx.bezierCurveTo(s * .7, -s * 1.1, s * 1.3, 0, 0, s * .9); ctx.fill(); }
    else if (t === 1) { ctx.moveTo(0, -s); ctx.lineTo(s * .7, 0); ctx.lineTo(0, s); ctx.lineTo(-s * .7, 0); ctx.closePath(); ctx.fill(); }
    else if (t === 2) { ctx.moveTo(0, -s); ctx.bezierCurveTo(s * 1.3, -s * .1, s * .7, s, 0, s * .3); ctx.bezierCurveTo(-s * .7, s, -s * 1.3, -s * .1, 0, -s); ctx.fill(); ctx.fillRect(-s * .12, 0, s * .24, s); }
    else { [[0, -s * .45], [-s * .48, s * .12], [s * .48, s * .12]].forEach(function (o) { ctx.beginPath(); ctx.arc(o[0], o[1], s * .42, 0, 6.28); ctx.fill(); }); ctx.fillRect(-s * .12, 0, s * .24, s); }
  }

  function draw(p, a, t) {
    var s = p.s;
    if (p.k === 'spark' || p.k === 'flare') {
      var tw = .55 + .45 * Math.sin(t * p.sp * 3 + p.ph);
      ctx.globalAlpha = a * tw; ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sprite(p.col), p.x - s, p.y - s, s * 2, s * 2);
      if (p.k === 'flare') { ctx.fillStyle = p.col; ctx.fillRect(p.x - s * 2.2, p.y - .6, s * 4.4, 1.2); ctx.fillRect(p.x - .6, p.y - s * 2.2, 1.2, s * 4.4); }
      ctx.globalCompositeOperation = 'source-over';
      return;
    }
    if (p.k === 'bit') {
      ctx.globalAlpha = a * .25; ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y - p.len, s, p.len);
      ctx.globalAlpha = a; ctx.fillRect(p.x - .5, p.y - s, s + 1, s + 1);
      return;
    }
    if (p.k === 'glitch') {
      if (p.tt > .14) return;
      ctx.globalAlpha = a * .7; ctx.fillStyle = p.col; ctx.fillRect(p.x, p.y, p.s, 2);
      ctx.fillStyle = '#ff2fd0'; ctx.fillRect(p.x + 6, p.y + 4, p.s * .5, 1);
      return;
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = a; ctx.fillStyle = ctx.strokeStyle = p.col;
    if (p.k === 'glint') {
      var g = .35 + .65 * Math.abs(Math.sin(t * p.sp + p.ph)); ctx.scale(g, g);
      ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.quadraticCurveTo(0, 0, s * 1.6, 0); ctx.quadraticCurveTo(0, 0, 0, s * 1.6); ctx.quadraticCurveTo(0, 0, -s * 1.6, 0); ctx.quadraticCurveTo(0, 0, 0, -s * 1.6); ctx.fill();
    } else if (p.k === 'bubble') {
      ctx.globalAlpha = a * .55; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, s, 0, 6.28); ctx.stroke();
    } else if (p.k === 'chip') {
      ctx.scale(1, Math.max(.25, Math.abs(Math.cos(p.ph + t * .8))));
      ctx.beginPath(); ctx.arc(0, 0, s, 0, 6.28); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s * .22;
      for (var i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(0, 0, s * .86, i * 1.047, i * 1.047 + .42); ctx.stroke(); }
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(0, 0, s * .55, 0, 6.28); ctx.stroke();
    } else if (p.k === 'suit') {
      suit(p.su, s);
    } else if (p.k === 'star') {
      star(5, s, s * .45); ctx.fill();
    } else if (p.k === 'tri') {
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * .9, s * .6); ctx.lineTo(-s * .9, s * .6); ctx.closePath(); ctx.stroke();
    } else if (p.k === 'squig') {
      ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-s, 0);
      for (var j = 1; j <= 4; j++) ctx.lineTo(-s + j * s / 2, j % 2 ? -s * .4 : 0); ctx.stroke();
    } else if (p.k === 'foil') {
      ctx.scale(1, Math.cos(t * p.sp + p.ph)); ctx.fillRect(-s / 2, -s * .3, s, s * .6);
    } else if (p.k === 'ribbon') {
      ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath();
      for (var k = 0; k <= 16; k++) { var u = k / 16; ctx.lineTo(Math.sin(u * 9 + t * 3 + p.ph) * s * .16, (u - .5) * s); }
      ctx.stroke();
    }
    ctx.restore();
  }

  function step(p, dt) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.k === 'foil' || p.k === 'ribbon' || p.k === 'chip' || p.k === 'suit') p.x += Math.sin(p.y * .02 + p.ph) * 12 * dt;
    if (p.k === 'glitch') { p.tt += dt; if (p.tt > rnd(.8, 2.4)) { p.tt = 0; p.x = rnd(0, W); p.y = rnd(0, H); p.s = rnd(20, 90); } }
    if (p.y > H + 40) init(p, p.k, false);
    else if (p.y < -40) { init(p, p.k, false); p.y = H + 30; }
    if (p.x < -40) p.x = W + 30; else if (p.x > W + 40) p.x = -30;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(.05, (now - last) / 1000), t = (now - t0) / 1000; last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var hr = cv.getBoundingClientRect(), r = chek.getBoundingClientRect();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(r.left - hr.left, r.top - hr.top, r.width, r.height); ctx.clip('evenodd');
    var fa = Math.min(1, Math.max(0, (t - .5) / 1.2));
    for (var i = 0; i < amb.length; i++) { step(amb[i], dt); draw(amb[i], fa * (amb[i].k === 'glint' || amb[i].k === 'bubble' ? .8 : .55), t); }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }

  function start(modal, slug) {
    stop();
    if (RM.matches) return;
    cv = modal.querySelector('.modal__fx'); chek = modal.querySelector('.chek'); ctx = cv.getContext('2d');
    th = TH[slug]; if (!th) return;
    size();
    var mob = W < 700 ? .6 : 1;
    amb = [];
    th.amb.forEach(function (a) { for (var i = 0; i < Math.round(a[1] * mob); i++) amb.push(init({}, a[0], true)); });
    t0 = last = performance.now();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', size);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; amb = [];
    window.removeEventListener('resize', size);
    if (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); }
  }

  window.FX = { start: start, stop: stop };
})();
