/* rsvp.js — client-side validation + submit to Google Apps Script.
   Apps Script web apps do not return CORS headers for cross-origin
   reads, so we POST with mode:"no-cors" (fire-and-forget) and show
   success optimistically. The row is still written to the Sheet.
   WeddingRSVP.init(). */
(function () {
  "use strict";

  function init() {
    var root = document.getElementById("rsvp");
    if (!root) return;
    var form = root.querySelector(".rsvp__form");
    if (!form) return;

    var endpoint = root.getAttribute("data-endpoint");
    var eventName = root.getAttribute("data-event") || "";
    var msgOk = root.getAttribute("data-success") || "Дякуємо!";
    var msgErr = root.getAttribute("data-error") || "Помилка. Спробуйте ще раз.";
    var sendingLabel = root.getAttribute("data-sending") || "...";
    var submitLabel = root.getAttribute("data-submit") || "Відправити";
    var status = form.querySelector(".rsvp__status");
    var submitBtn = form.querySelector(".rsvp__submit");

    function setError(name, text) {
      var el = form.querySelector('[data-error-for="' + name + '"]');
      if (el) el.textContent = text || "";
    }
    function clearErrors() { setError("name", ""); setError("attending", ""); }

    function validate() {
      clearErrors();
      var ok = true;
      var name = form.elements["name"].value.trim();
      if (!name) { setError("name", "Будь ласка, вкажіть імʼя."); ok = false; }
      var attending = form.querySelector('input[name="attending"]:checked');
      if (!attending) { setError("attending", "Оберіть варіант."); ok = false; }
      return ok;
    }

    function showStatus(text, isError) {
      status.textContent = text;
      status.classList.remove("is-hidden");
      status.classList.toggle("rsvp__status--error", !!isError);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      var attendingVal = (form.querySelector('input[name="attending"]:checked') || {}).value || "";
      var data = {
        event: eventName,
        name: form.elements["name"].value.trim(),
        attending: attendingVal === "yes" ? "Так" : (attendingVal === "no" ? "Ні" : attendingVal),
        guests: form.elements["guests"].value,
        notes: form.elements["notes"].value.trim(),
        page: location.href,
        submittedAt: new Date().toISOString()
      };

      if (!endpoint) {
        // No backend configured yet: confirm to the guest, log payload for setup.
        console.warn("[RSVP] appsScriptUrl is empty. Payload:", data);
        finish(false);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = sendingLabel;

      fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams(data).toString()
      })
        .then(function () { finish(false); })
        .catch(function () { finish(true); });
    });

    function finish(isError) {
      if (isError) {
        showStatus(msgErr, true);
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      } else {
        form.querySelectorAll(".field, .rsvp__submit").forEach(function (n) { n.classList.add("is-hidden"); });
        showStatus(msgOk, false);
      }
    }
  }

  window.WeddingRSVP = { init: init };
})();
