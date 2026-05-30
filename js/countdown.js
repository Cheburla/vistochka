/* countdown.js — live countdown with Ukrainian pluralization.
   Reads #countdown[data-target] (ISO date). Exposes WeddingCountdown.init(). */
(function () {
  "use strict";
  var timer = null;

  var FORMS = {
    days: ["день", "дні", "днів"],
    hours: ["година", "години", "годин"],
    minutes: ["хвилина", "хвилини", "хвилин"],
    seconds: ["секунда", "секунди", "секунд"]
  };

  function plural(n, forms) {
    var a = Math.abs(n) % 100;
    var b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function init() {
    if (timer) { clearInterval(timer); timer = null; }
    var root = document.getElementById("countdown");
    if (!root) return;
    var targetStr = root.getAttribute("data-target");
    var target = targetStr ? new Date(targetStr).getTime() : NaN;
    var grid = root.querySelector(".countdown__grid");
    if (!grid || isNaN(target)) return;

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        clearInterval(timer); timer = null;
        var finished = root.getAttribute("data-finished");
        grid.outerHTML = '<p class="countdown__done reveal in-view">' +
          (finished || "Сьогодні наш день.") + "</p>";
        return;
      }
      var s = Math.floor(diff / 1000);
      var v = {
        days: Math.floor(s / 86400),
        hours: Math.floor((s % 86400) / 3600),
        minutes: Math.floor((s % 3600) / 60),
        seconds: s % 60
      };
      Object.keys(v).forEach(function (u) {
        var num = grid.querySelector('[data-unit="' + u + '"]');
        var lab = grid.querySelector('[data-label="' + u + '"]');
        if (num) num.textContent = u === "days" ? v[u] : pad(v[u]);
        if (lab) lab.textContent = plural(v[u], FORMS[u]);
      });
    }

    tick();
    timer = setInterval(tick, 1000);
  }

  window.WeddingCountdown = { init: init };
})();
