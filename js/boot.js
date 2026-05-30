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

  function renderLanding(cfg) {
    if (window.WeddingLanding) window.WeddingLanding.render(cfg, document.getElementById("app"));
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
