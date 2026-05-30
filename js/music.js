/* music.js — floating background-music toggle.
   Browsers block autoplay, so playback starts on first user gesture.
   Remembers state in localStorage. WeddingMusic.init(). */
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
    audio.preload = "none";

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

    // If the guest previously enabled music, resume on their first interaction.
    var wanted = false;
    try { wanted = localStorage.getItem(KEY) === "on"; } catch (e) {}
    if (wanted) {
      var resume = function () {
        audio.play().then(function () { setPlaying(true); }).catch(function () {});
        document.removeEventListener("click", resume);
        document.removeEventListener("touchstart", resume);
      };
      document.addEventListener("click", resume, { once: true });
      document.addEventListener("touchstart", resume, { once: true });
    }
  }

  window.WeddingMusic = { init: init };
})();
