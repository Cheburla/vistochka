/* music.js — floating background-music toggle with auto-start.
   Browsers block autoplay-with-sound, so we try to start on load and, if that
   is blocked, start on the visitor's very first interaction (click/scroll/tap/
   key). Volume comes from data-volume (0..1, default 0.35). The on/off choice
   is remembered in localStorage, so a guest who muted it stays muted.
   WeddingMusic.init(). */
(function () {
  "use strict";
  var KEY = "wedding:music";
  var audio = null;

  function init() {
    var btn = document.querySelector(".music-toggle");
    if (!btn) return;
    var src = btn.getAttribute("data-src");
    if (!src) { btn.remove(); return; }

    if (audio) { try { audio.pause(); } catch (e) {} }
    audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    var vol = parseFloat(btn.getAttribute("data-volume"));
    audio.volume = isNaN(vol) ? 0.35 : Math.max(0, Math.min(1, vol));

    function setPlaying(on) {
      btn.classList.toggle("is-playing", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }

    btn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () {
          setPlaying(true);
          try { localStorage.setItem(KEY, "on"); } catch (e) {}
        }).catch(function () { setPlaying(false); });
      } else {
        audio.pause();
        setPlaying(false);
        try { localStorage.setItem(KEY, "off"); } catch (e) {}
      }
    });

    // Auto-start unless the visitor explicitly muted it on a previous visit.
    var pref = null;
    try { pref = localStorage.getItem(KEY); } catch (e) {}
    if (pref === "off") return;

    audio.play().then(function () { setPlaying(true); }).catch(function () {
      // Autoplay-with-sound was blocked: begin at the first user interaction.
      var evts = ["pointerdown", "click", "keydown", "touchstart", "scroll"];
      function go() {
        evts.forEach(function (e) { document.removeEventListener(e, go); });
        audio.play().then(function () { setPlaying(true); }).catch(function () {});
      }
      evts.forEach(function (e) { document.addEventListener(e, go, { passive: true }); });
    });
  }

  window.WeddingMusic = { init: init };
})();
