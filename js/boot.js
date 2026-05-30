/* boot.js — shared page bootstrap for the multi-event engine.
   - In the editor preview iframe: waits, the editor injects content.
   - On an event page /<slug>/index.html: fetches its own ./content.json.
   - With ?e=<slug>: fetches /<slug>/content.json (used by previews/links).
   - At the bare root with no content.json: shows a small landing.
   Depends on render.js + the section modules being loaded first. */
(function () {
  "use strict";

  function initModules() {
    window.WeddingCountdown.init();
    window.WeddingReveal.init();
    window.WeddingGallery.init();
    window.WeddingMusic.init();
    window.WeddingRSVP.init();
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Cohesive line icons (Feather/Lucide style, stroke).
  var ICONS = {
    telegram: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    website: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'
  };
  function contactSvg(type) {
    var p = ICONS[type] || ICONS.website;
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
      'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + "</svg>";
  }
  function renderLanding(cfg) {
    var contacts = (cfg.contacts || []).filter(function (c) { return c && c.url; }).map(function (c) {
      return '<a class="contact" href="' + esc(c.url) + '" target="_blank" rel="noopener">' +
        '<span class="contact__icon">' + contactSvg(c.type) + "</span>" +
        '<span class="contact__label">' + esc(c.label || c.type) + "</span></a>";
    }).join("");
    document.getElementById("app").innerHTML =
      '<section class="landing"><div class="landing__inner">' +
        (cfg.eyebrow ? '<p class="landing__eyebrow">' + esc(cfg.eyebrow) + "</p>" : "") +
        '<h1 class="landing__brand">' + esc(cfg.brand || "Вісточка") + "</h1>" +
        '<div class="landing__rule"></div>' +
        (cfg.tagline ? '<p class="landing__tag">' + esc(cfg.tagline) + "</p>" : "") +
        (contacts ? '<div class="landing__contacts">' +
          (cfg.contactsHeading ? '<p class="landing__chead">' + esc(cfg.contactsHeading) + "</p>" : "") +
          '<div class="contacts">' + contacts + "</div></div>" : "") +
        (cfg.footer ? '<p class="landing__foot">' + esc(cfg.footer) + "</p>" : "") +
      "</div></section>";
  }
  function landing() {
    var fallback = { brand: "Вісточка", eyebrow: "Онлайн-запрошення", tagline: "Персональні запрошення на ваші свята.", contacts: [] };
    fetch("/site.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : fallback; })
      .then(function (cfg) { renderLanding(Object.assign({}, fallback, cfg)); })
      .catch(function () { renderLanding(fallback); });
  }

  window.WeddingApp = {
    renderContent: function (content) {
      window.WeddingRender.render(content, document.getElementById("app"));
      initModules();
    },
    boot: function () {
      // Embedded in the editor: the editor drives rendering.
      try { if (window.parent !== window && window.parent.__WEDDING_EDITOR__) return; } catch (e) {}

      var slug = new URLSearchParams(location.search).get("e");
      var url = slug ? "/" + slug + "/content.json" : "content.json";
      var self = this;
      fetch(url, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (c) { self.renderContent(c); })
        .catch(function (err) {
          console.warn("content.json not loaded:", err && err.message);
          landing();
        });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { window.WeddingApp.boot(); });
  } else {
    window.WeddingApp.boot();
  }
})();
