/* reveal.js — scroll-reveal via IntersectionObserver.
   Adds .in-view to .reveal elements as they enter. WeddingReveal.init(). */
(function () {
  "use strict";
  var io = null;

  function init() {
    var nodes = document.querySelectorAll(".reveal:not(.in-view)");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in-view"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    }
    nodes.forEach(function (n) { io.observe(n); });
  }

  window.WeddingReveal = { init: init };
})();
