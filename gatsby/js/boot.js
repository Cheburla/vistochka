/* boot.js — Gatsby build bootstrap (subfolder-aware).
   Same flow as the root engine, plus WeddingDeco (GSAP) kicks in
   after every render. site.json is fetched relative so the build
   works from /gatsby/. */
(function () {
  "use strict";

  function initModules() {
    window.WeddingCountdown.init();
    window.WeddingReveal.init();
    window.WeddingGallery.init();
    window.WeddingMusic.init();
    window.WeddingRSVP.init();
    if (window.WeddingDeco) window.WeddingDeco.init();
  }

  function renderLanding(cfg) {
    if (window.WeddingLanding) window.WeddingLanding.render(cfg, document.getElementById("app"));
    if (window.WeddingDeco) window.WeddingDeco.init();
  }
  function landing() {
    var fallback = { brand: "Вісточка", eyebrow: "Онлайн-запрошення", tagline: "Персональні запрошення на ваші свята.", contacts: [] };
    fetch("site.json", { cache: "no-store" })
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
      var url = slug ? "/gatsby/" + slug + "/content.json" : "content.json";
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
