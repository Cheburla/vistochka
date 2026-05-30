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

  function landing() {
    document.getElementById("app").innerHTML =
      '<section class="landing"><div>' +
        '<p class="landing__eyebrow">Онлайн-запрошення</p>' +
        '<h1 class="landing__brand">Вісточка</h1>' +
        '<div class="landing__rule"></div>' +
        '<p class="landing__tag">Персональні запрошення на ваші свята. ' +
        'Відкрийте своє за посиланням, яке надіслали організатори.</p>' +
      '</div></section>';
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
