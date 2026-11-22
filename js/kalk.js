/* Черновик конструктора праздника (№551). */
(function () {
  'use strict';
  var root = document.getElementById('ktg');
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  var money = function (n) { return Math.round(n).toLocaleString('ru-RU') + ' ₽'; };
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };
  var button = function (cls, text) {
    var b = el('button', cls, text);
    b.type = 'button';
    return b;
  };

  var MODEL = window.NG_KZ, HOURS = 4, MIN_PORTIONS = 30;
  var byCode = {}, byId = {}, catalog = {}, on = {}, extra = [], guests = 50, preset, fresh = '';

  window.KTG_DATA.forEach(function (g) { g.items.forEach(function (it) { catalog[it.id] = it; }); });

  function calc(it) {
    if (it.unit === 'guest') return { sum: it.v * guests, how: money(it.v) + ' × ' + guests };
    if (it.unit === 'hour') return { sum: it.v * HOURS, how: money(it.v) + ' × ' + HOURS + ' ч' };
    if (it.unit === 'portion') {
      var n = Math.max(guests, MIN_PORTIONS);
      return { sum: it.fee + it.v * n, how: money(it.v) + ' × ' + n + ' + работа ' + money(it.fee) };
    }
    if (it.unit === 'staff') {
      var people = on.banket ? Math.ceil(guests / 10) + Math.ceil(guests / 50) : Math.ceil(guests / 20);
      return { sum: it.v * people, how: people + ' × смена ' + money(it.v) };
    }
    return { sum: it.v, how: '' };
  }

  MODEL.presets.forEach(function (p) {
    var b = button('kz-preset'), img = el('img');
    b.dataset.kzPreset = p.code;
    img.src = 'img/sc-' + p.scene + '.webp';
    img.alt = '';
    b.append(img, el('b', '', p.name));
    $('[data-kz-presets]').appendChild(b);
  });

  MODEL.groups.forEach(function (g) {
    var box = el('div', 'kz-group'), head = el('div', 'kz-group__head'), img = el('img'), more = button('kz-more', 'ещё');
    img.src = 'img/ikonki/ik-' + g.icon + '.webp';
    img.alt = '';
    more.dataset.group = g.slug; // каталог открывает shop.js
    head.append(img, el('b', '', g.name), more);
    box.appendChild(head);
    g.items.forEach(function (it) {
      var row = el('div', 'kz-row'), sw = button('kz-switch'), name = el('div', 'kz-row__name');
      byCode[it.code] = it;
      if (it.id) byId[it.id] = it;
      row.dataset.code = it.code;
      sw.dataset.kzSwitch = it.code;
      sw.setAttribute('role', 'switch');
      sw.setAttribute('aria-label', it.n);
      var title = it.id ? button('', it.n) : el('span', '', it.n);
      if (it.id) title.dataset.view = it.id; // окно карточки открывает shop.js
      name.append(title, el('small'));
      row.append(sw, name, el('b', 'kz-row__price'));
      box.appendChild(row);
    });
    $('[data-kz-groups]').appendChild(box);
  });

  function render() {
    var total = 0, rows = $('[data-kz-rows]');
    rows.textContent = '';

    function line(key, name, sum, how, off) {
      var li = el('li', key === fresh ? 'is-new' : ''), left = el('span', '', name), right = el('b', '', money(sum));
      left.appendChild(off);
      if (how) left.appendChild(el('small', '', how));
      li.append(left, right);
      rows.appendChild(li);
      total += sum;
    }

    $$('.kz-row').forEach(function (row) {
      var code = row.dataset.code, it = byCode[code], c = calc(it), active = !!on[code];
      row.classList.toggle('is-on', active);
      row.querySelector('.kz-switch').setAttribute('aria-checked', active);
      row.querySelector('small').textContent = c.how;
      row.querySelector('.kz-row__price').textContent = 'от ' + money(c.sum);
      if (!active) return;
      var off = button('kz-off', '×');
      off.dataset.kzSwitch = code;
      off.setAttribute('aria-label', 'Убрать');
      line(code, it.n, c.sum, c.how, off);
    });
    extra.forEach(function (id) {
      var it = catalog[id], off = button('kz-off', '×');
      off.dataset.pick = id; // снимает и отметку в каталоге
      off.setAttribute('aria-label', 'Убрать');
      line('id' + id, it.n, it.pp ? it.v * guests : it.v, it.pp ? money(it.v) + ' × ' + guests : '', off);
    });

    $('[data-kz-title]').textContent = preset.name.toUpperCase() + ' · ' + guests + ' ГОСТЕЙ';
    $('[data-kz-total]').textContent = 'от ' + money(total);
    $('[data-kz-total]').dataset.value = total;
    $('[data-kz-mini]').textContent = 'от ' + money(total);
    $('[data-kz-per]').textContent = '≈ ' + money(total / guests);
    $$('[data-kz-preset]').forEach(function (b) { b.classList.toggle('is-on', b.dataset.kzPreset === preset.code); });
    fresh = '';
  }

  function choose(code) {
    preset = MODEL.presets.filter(function (p) { return p.code === code; })[0];
    on = {};
    preset.on.forEach(function (c) { on[c] = true; });
    render();
  }

  function flip(code) {
    on[code] = !on[code];
    if (on[code]) {
      fresh = code;
      // фуршет и банкет — одно из двух
      if (code === 'banket') on['gotovyj-furshet'] = false;
      if (code === 'gotovyj-furshet') on.banket = false;
    }
    render();
  }

  function setGuests(value) {
    guests = Math.min(1000, Math.max(30, parseInt(String(value).replace(/\D/g, ''), 10) || 30));
    $('[data-kz-guests]').value = guests;
    render();
  }

  // на захвате: shop.js успевает пересобрать строку до всплытия
  root.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.matches('[data-kz-preset]')) choose(t.dataset.kzPreset);
    else if (t.matches('[data-kz-switch]')) flip(t.dataset.kzSwitch);
    else if (t.matches('[data-kz-step]')) setGuests(guests + +t.dataset.kzStep);
    else if (t.matches('[data-pick],[data-qv-pick]')) {
      var id = +(t.dataset.pick || root.querySelector('[data-qv]').dataset.id);
      if (byId[id]) return flip(byId[id].code);
      var at = extra.indexOf(id);
      if (at === -1) { extra.push(id); fresh = 'id' + id; } else extra.splice(at, 1);
      render();
    } else if (t.matches('[data-kz-send]')) {
      var names = $$('[data-kz-rows] li>span').map(function (s) { return s.firstChild.textContent; });
      var chosen = $('[data-chosen]');
      chosen.textContent = preset.name + ', ' + guests + ' гостей: ' + names.join(', ') + ' — ' + $('[data-kz-total]').textContent;
      chosen.hidden = false;
      document.getElementById('zayavka').scrollIntoView();
    }
  }, true);
  $('[data-kz-guests]').addEventListener('change', function () { setGuests(this.value); });

  choose(MODEL.presets[0].code);
})();
