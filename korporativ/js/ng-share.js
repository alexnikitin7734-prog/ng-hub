/* QR и ссылка в чеке конструктора — функция share из ng-hub/js/ng.js без изменений. */
(function () {
  'use strict';
  /* ---------- QR в чеках (№556) ---------- */
  function share(box, hash) {
    var url = location.origin + location.pathname + '#' + hash;
    box.dataset.link = url;
    box.textContent = '';
    if (window.qrcode) {
      var qr = window.qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      var pic = document.createElement('div');
      pic.className = 'ng-share__qr';
      pic.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      box.appendChild(pic);
    }
    var side = document.createElement('div'), title = document.createElement('b'), copy = document.createElement('button');
    title.textContent = 'Обсудить с коллегами';
    copy.type = 'button';
    copy.textContent = 'Скопировать ссылку';
    copy.addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(box.dataset.link).then(function () { copy.textContent = 'Ссылка скопирована'; });
    });
    side.append(title, copy);
    box.appendChild(side);
  }
  window.NG_SHARE = share;
})();
