/* Конструктор праздника (№551, №562): он же хранит подборку из каталога. */
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
  var byCode = {}, byId = {}, catalog = {}, on = {}, extra = [], guests = 50, preset, fresh = '', kit = '', used = false, fromCatalog = false;

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
    img.src = '../assets/img/sc-' + p.scene + '.webp';
    img.alt = '';
    b.append(img, el('b', '', p.name));
    $('[data-kz-presets]').appendChild(b);
  });

  MODEL.groups.forEach(function (g) {
    var box = el('div', 'kz-group'), head = el('div', 'kz-group__head'), img = el('img'), more = button('kz-more', 'в каталог'), open = button('kz-open');
    img.src = '../assets/img/ikonki/ik-' + g.icon + '.webp';
    img.alt = '';
    more.dataset.group = g.slug; // каталог открывает shop.js
    open.dataset.kzOpen = g.slug;
    open.setAttribute('aria-expanded', 'false');
    open.append(img, el('b', '', g.name), el('em'));
    head.append(open, more);
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

    $$('.kz-group').forEach(function (box) {
      var picked = box.querySelectorAll('.kz-row.is-on').length;
      box.classList.toggle('is-empty', !picked);
      box.querySelector('em').textContent = picked ? picked + ' из ' + box.querySelectorAll('.kz-row').length : 'выбрать';
    });
    share();
    $('[data-kz-title]').textContent = preset.name.toUpperCase() + ' · ' + guests + ' ГОСТЕЙ';
    $('[data-kz-total]').textContent = 'от ' + money(total);
    $('[data-kz-total]').dataset.value = total;
    $('[data-kz-mini]').textContent = 'от ' + money(total);
    $('[data-kz-per]').textContent = '≈ ' + money(total / guests);
    $$('[data-kz-preset]').forEach(function (b) { b.classList.toggle('is-on', b.dataset.kzPreset === preset.code); });
    fresh = '';

    var names = [], ids = extra.slice();
    Object.keys(on).forEach(function (c) { if (on[c] && byCode[c].id) ids.push(byCode[c].id); });
    document.dispatchEvent(new CustomEvent('ng:picks', { detail: ids }));
    var count = rows.children.length;
    $('[data-cart-n]').textContent = count;
    $('[data-cart-sum]').textContent = 'от ' + money(total);
    $('[data-cart]').classList.toggle('is-shown', fromCatalog && count > 0);
    if (kit) names.push('Комплект «' + kit + '»');
    if (used) names.push(preset.name + ', ' + guests + ' гостей: ' + $$('[data-kz-rows] li>span').map(function (x) { return x.firstChild.textContent; }).join(', ') + ' — от ' + money(total));
    var ch = document.querySelector('[data-chosen]');
    ch.dataset.kz = names.join('. ');
    if (ch.dataset.src === 'kz') { ch.textContent = ch.dataset.kz; ch.hidden = !ch.dataset.kz; ch.closest('.form').querySelector('input[name="guests"]').value = guests; }
  }

  // ссылка: праздник-гости-позиции-добавки из каталога; позиции по номеру карточки, официанты — s
  function share() {
    var ids = Object.keys(on).filter(function (c) { return on[c]; }).map(function (c) { return byCode[c].id || 's'; });
    var hash = 'nabor=' + [preset.code, guests, ids.join('.'), extra.join('.')].join('-');
    if (window.NG_SHARE) window.NG_SHARE($('[data-kz-share]'), hash);
  }

  function restore() {
    var m = location.hash.match(/^#nabor=([a-z]+)-(\d+)-([\ds.]*)-([\d.]*)$/);
    var found = m && MODEL.presets.filter(function (p) { return p.code === m[1]; })[0];
    if (!found) return false;
    preset = found;
    on = {};
    m[3].split('.').forEach(function (id) {
      var it = id === 's' ? byCode.oficianty : byId[id];
      if (it) on[it.code] = true;
    });
    extra = [];
    m[4].split('.').forEach(function (id) {
      if (catalog[id] && extra.indexOf(+id) === -1) extra.push(+id);
    });
    used = true;
    setGuests(m[2]);
    setTimeout(function () { document.getElementById('konstruktor').scrollIntoView(); }, 300);
    return true;
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
    var t = e.target.closest('button,a');
    if (!t) return;
    if (t.matches('[data-kit]')) {
      kit = t.dataset.kit;
      return render();
    }
    if (t.matches('[data-kz-preset],[data-kz-switch],[data-kz-step],[data-pick],[data-qv-pick]')) used = true;
    if (t.matches('[data-kz-preset]')) {
      choose(t.dataset.kzPreset);
      var hdr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr26-hnow')) || 150;
      window.scrollTo({ top: $('.kz-main').getBoundingClientRect().top + window.scrollY - hdr - 16, behavior: 'smooth' });
    }
    else if (t.matches('[data-kz-open]')) {
      t.setAttribute('aria-expanded', t.closest('.kz-group').classList.toggle('is-open'));
    } else if (t.matches('[data-kz-full]')) {
      var full = !t.classList.contains('is-on');
      t.classList.toggle('is-on', full);
      t.textContent = full ? 'Только выбранное' : 'Полный вид';
      $$('.kz-group').forEach(function (g) {
        g.classList.toggle('is-open', full);
        g.querySelector('.kz-open').setAttribute('aria-expanded', full);
      });
    }
    else if (t.matches('[data-kz-switch]')) flip(t.dataset.kzSwitch);
    else if (t.matches('[data-kz-step]')) setGuests(guests + +t.dataset.kzStep);
    else if (t.matches('[data-pick],[data-qv-pick]')) {
      if (!t.closest('[data-kz-rows]')) fromCatalog = true;
      var id = +(t.dataset.pick || root.querySelector('[data-qv]').dataset.id);
      if (byId[id]) return flip(byId[id].code);
      var at = extra.indexOf(id);
      if (at === -1) { extra.push(id); fresh = 'id' + id; } else extra.splice(at, 1);
      render();
    } else if (t.matches('[data-kz-send]')) {
      used = true;
      document.querySelector('[data-chosen]').dataset.src = 'kz';
      document.dispatchEvent(new CustomEvent('ng:kz-send'));
      render();
    }
  }, true);
  $('[data-kz-guests]').addEventListener('change', function () { used = true; setGuests(this.value); });

  if (!restore()) choose(MODEL.presets[0].code);
  addEventListener('hashchange', restore);
})();
