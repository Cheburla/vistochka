/* gallery.js — lightweight lightbox for the gallery grid.
   No dependencies. WeddingGallery.init(). */
(function () {
  "use strict";
  var box = null, imgEl = null, sources = [], current = 0, lastFocus = null, touchX = null;

  function ensureBox() {
    if (box) return;
    box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.innerHTML =
      '<button class="lightbox__btn lightbox__close" type="button" aria-label="Закрити">&times;</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button" aria-label="Назад">&#8249;</button>' +
      '<img class="lightbox__img" alt="">' +
      '<button class="lightbox__btn lightbox__next" type="button" aria-label="Далі">&#8250;</button>';
    document.body.appendChild(box);
    imgEl = box.querySelector(".lightbox__img");

    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
    box.querySelector(".lightbox__next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
    box.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (touchX == null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      touchX = null;
    });
  }

  function show() { imgEl.src = sources[current]; }
  function step(d) { current = (current + d + sources.length) % sources.length; show(); }
  function open(i) {
    ensureBox();
    current = i; show();
    lastFocus = document.activeElement;
    box.classList.add("is-open");
    box.querySelector(".lightbox__close").focus();
  }
  function close() {
    if (!box) return;
    box.classList.remove("is-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    var grid = document.querySelector(".gallery__grid");
    if (!grid) return;
    var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery__item img"));
    sources = items.map(function (im) { return im.getAttribute("src"); });
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".gallery__item");
      if (!btn) return;
      open(parseInt(btn.getAttribute("data-index"), 10) || 0);
    });
  }

  window.WeddingGallery = { init: init };
})();
