/* ============================================================
   render.js — builds the invitation DOM from a content object.
   Pure: no fetch here. index.html bootstrap supplies content
   (from content.json or, in the editor, from an in-memory draft).
   Visual structure follows the Claude Design handoff
   "Modern Minimalist Wedding".
   Exposes: window.WeddingRender.render(content, mountEl)
   ============================================================ */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function attr(s) { return esc(s); }
  function on(o) { return o && o.enabled !== false; }
  function routeUrl(q) { return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q); }

  function headBig(heading) {
    return (
      '<div class="section__head reveal">' +
        '<h2 class="section__heading">' + esc(heading) + "</h2>" +
      "</div>"
    );
  }

  /* ---------- nav ---------- */
  function nav(c) {
    var links = [];
    if (on(c.timeline)) links.push('<a class="nav__link" href="#timeline">Програма</a>');
    if (on(c.venues)) links.push('<a class="nav__link" href="#venues">Локації</a>');
    if (on(c.rsvp)) links.push('<a class="nav__link nav__link--cta" href="#rsvp">RSVP</a>');
    var couple = c.couple || {};
    var brand = (c.hero && c.hero.eyebrow) ||
      (esc(couple.groom) + " " + esc(couple.separator || "&") + " " + esc(couple.bride));
    return (
      '<nav class="nav"><div class="nav__inner">' +
        '<span class="nav__brand">' + esc(brand) + "</span>" +
        (links.length ? '<div class="nav__links">' + links.join("") + "</div>" : "") +
      "</div></nav>"
    );
  }

  /* ---------- hero ---------- */
  function hero(c) {
    var couple = c.couple || {};
    var names =
      esc(couple.groom) +
      ' <span class="hero__sep">' + esc(couple.separator || "&") + "</span> " +
      esc(couple.bride);
    var bg = c.hero.backgroundImage
      ? '<div class="hero__bg" style="background-image:url(\'' + attr(c.hero.backgroundImage) + "')\"></div>"
      : '<div class="hero__bg"></div>';
    var dateLine = [c.date && c.date.weekday, c.date && c.date.display].filter(Boolean).join(", ");
    return (
      '<header class="hero' + (c.hero.backgroundImage ? "" : " hero--no-image") + '">' +
        bg +
        '<div class="hero__inner reveal">' +
          (c.hero.eyebrow ? '<p class="eyebrow hero__eyebrow">' + esc(c.hero.eyebrow) + "</p>" : "") +
          '<h1 class="hero__names">' + names + "</h1>" +
          '<div class="hero__divider"></div>' +
          (dateLine ? '<p class="hero__date">' + esc(dateLine) + "</p>" : "") +
          (c.hero.subtitle ? '<p class="hero__subtitle">' + esc(c.hero.subtitle) + "</p>" : "") +
        "</div>" +
        '<a class="hero__scroll" href="#after-hero" aria-label="' + attr(c.hero.scrollHint || "Гортайте вниз") + '">' +
          '<span class="hero__scroll-line"></span>' +
        "</a>" +
        '<span id="after-hero"></span>' +
      "</header>"
    );
  }

  /* ---------- countdown ---------- */
  function countdown(c) {
    var units = ["days", "hours", "minutes", "seconds"];
    var parts = [];
    units.forEach(function (u, i) {
      if (i > 0) parts.push('<span class="countdown__sep">:</span>');
      parts.push(
        '<div class="countdown__cell">' +
          '<span class="countdown__num" data-unit="' + u + '">--</span>' +
          '<span class="countdown__label" data-label="' + u + '"></span>' +
        "</div>"
      );
    });
    return (
      '<section class="section countdown section--surface-low" id="countdown" data-target="' + attr(c.date && c.date.iso) + '"' +
        ' data-finished="' + attr((c.countdown && c.countdown.finishedText) || "") + '">' +
        '<div class="container">' +
          '<div class="section__head reveal"><p class="eyebrow">' + esc(c.countdown.heading) + "</p></div>" +
          '<div class="countdown__grid reveal" role="timer" aria-live="off">' + parts.join("") + "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- story ---------- */
  function story(c) {
    var imgs = (c.story.images || [])
      .filter(function (i) { return i && i.src; })
      .map(function (i) { return '<img src="' + attr(i.src) + '" alt="' + attr(i.alt || "") + '" loading="lazy">'; })
      .join("");
    var paras = (c.story.paragraphs || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    return (
      '<section class="section story" id="story">' +
        '<div class="container">' +
          headBig(c.story.heading) +
          '<div class="story__text reveal">' + paras + "</div>" +
          (imgs ? '<div class="story__images reveal">' + imgs + "</div>" : "") +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- gallery ---------- */
  function gallery(c) {
    var items = (c.gallery.images || [])
      .filter(function (i) { return i && i.src; })
      .map(function (i, idx) {
        return (
          '<button class="gallery__item" type="button" data-index="' + idx + '">' +
            '<img src="' + attr(i.src) + '" alt="' + attr(i.alt || "Фото") + '" loading="lazy">' +
          "</button>"
        );
      })
      .join("");
    return (
      '<section class="section gallery section--surface-low" id="gallery">' +
        '<div class="container container--wide">' +
          headBig(c.gallery.heading) +
          '<div class="gallery__grid reveal">' + items + "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- timeline ---------- */
  function timeline(c) {
    var rows = (c.timeline.items || [])
      .map(function (it) {
        return (
          '<li class="timeline__item reveal">' +
            '<span class="timeline__time">' + esc(it.time) + "</span>" +
            '<span class="timeline__title">' + esc(it.title) + "</span>" +
            '<span class="timeline__note">' + esc(it.note || "") + "</span>" +
          "</li>"
        );
      })
      .join("");
    return (
      '<section class="section timeline" id="timeline">' +
        '<div class="container">' +
          headBig(c.timeline.heading) +
          '<ul class="timeline__list">' + rows + "</ul>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- dress code ---------- */
  function dresscode(c) {
    var sw = (c.dressCode.palette || [])
      .map(function (p) {
        return (
          '<div class="swatch">' +
            '<span class="swatch__chip" style="background:' + attr(p.hex) + '"></span>' +
            '<span class="swatch__name">' + esc(p.name) + "</span>" +
          "</div>"
        );
      })
      .join("");
    return (
      '<section class="section dresscode section--surface" id="dresscode">' +
        '<div class="container">' +
          headBig(c.dressCode.heading) +
          (c.dressCode.text ? '<p class="dresscode__text reveal">' + esc(c.dressCode.text) + "</p>" : "") +
          (sw ? '<div class="dresscode__palette reveal">' + sw + "</div>" : "") +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- venues (photo + route, no embedded map) ---------- */
  function venues(c) {
    var cards = (c.venues.items || [])
      .map(function (v) {
        var q = v.mapQuery || v.address || v.name;
        return (
          '<article class="venue reveal">' +
            (v.image ? '<div class="venue__img-wrap"><img class="venue__img" src="' + attr(v.image) + '" alt="' + attr(v.name) + '" loading="lazy"></div>' : "") +
            (v.label ? '<span class="venue__label">' + esc(v.label) + "</span>" : "") +
            '<h3 class="venue__name">' + esc(v.name) + "</h3>" +
            (v.address ? '<p class="venue__address">' + esc(v.address) + "</p>" : "") +
            (v.time ? '<p class="venue__time">' + esc(v.time) + "</p>" : "") +
            (q ? '<a class="btn btn--ghost venue__route" href="' + attr(routeUrl(q)) + '" target="_blank" rel="noopener">' + esc(v.routeLabel || "Маршрут") + "</a>" : "") +
          "</article>"
        );
      })
      .join("");
    return (
      '<section class="section venues" id="venues">' +
        '<div class="container container--wide">' +
          headBig(c.venues.heading) +
          '<div class="venues__grid">' + cards + "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- RSVP ---------- */
  function rsvp(c) {
    var f = c.rsvp.fields || {};
    var max = c.rsvp.guestsMax || 5;
    var opts = "";
    for (var i = 1; i <= max; i++) opts += "<option>" + i + "</option>";
    var couple = c.couple || {};
    var eventName = (couple.groom || "") + " & " + (couple.bride || "");
    return (
      '<section class="section rsvp" id="rsvp" data-event="' + attr(eventName) + '" data-endpoint="' + attr(c.rsvp.appsScriptUrl || "") + '"' +
        ' data-success="' + attr(c.rsvp.successMessage || "") + '" data-error="' + attr(c.rsvp.errorMessage || "") + '"' +
        ' data-sending="' + attr(c.rsvp.sendingLabel || "...") + '" data-submit="' + attr(c.rsvp.submitLabel || "OK") + '">' +
        '<div class="container">' +
          '<div class="rsvp__card reveal">' +
            '<h2 class="rsvp__heading">' + esc(c.rsvp.heading) + "</h2>" +
            (c.rsvp.intro ? '<p class="rsvp__intro">' + esc(c.rsvp.intro) + "</p>" : "") +
            '<form class="rsvp__form" novalidate>' +
              '<div class="field">' +
                '<label class="field__label" for="rsvp-name">' + esc(f.name || "Імʼя") + "</label>" +
                '<input type="text" id="rsvp-name" name="name" autocomplete="name" required>' +
                '<span class="field__error" data-error-for="name"></span>' +
              "</div>" +
              '<div class="field">' +
                '<span class="field__label">' + esc(f.attendance || "Чи будете?") + "</span>" +
                '<div class="choice">' +
                  '<label><input type="radio" name="attending" value="yes" required> ' + esc(f.attendanceYes || "Так") + "</label>" +
                  '<label><input type="radio" name="attending" value="no"> ' + esc(f.attendanceNo || "Ні") + "</label>" +
                "</div>" +
                '<span class="field__error" data-error-for="attending"></span>' +
              "</div>" +
              '<div class="field">' +
                '<label class="field__label" for="rsvp-guests">' + esc(f.guests || "Гостей") + "</label>" +
                '<select id="rsvp-guests" name="guests">' + opts + "</select>" +
              "</div>" +
              '<div class="field">' +
                '<label class="field__label" for="rsvp-notes">' + esc(f.notes || "Побажання") + "</label>" +
                '<textarea id="rsvp-notes" name="notes"></textarea>' +
              "</div>" +
              '<button class="btn rsvp__submit" type="submit">' + esc(c.rsvp.submitLabel || "Відправити") + "</button>" +
              '<p class="rsvp__status is-hidden" role="status" aria-live="polite"></p>' +
            "</form>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- telegram ---------- */
  function telegram(c) {
    var icon =
      '<svg class="telegram__icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    return (
      '<section class="section telegram" id="telegram">' +
        '<div class="container">' +
          '<div class="telegram__box reveal">' +
            icon +
            '<h2 class="telegram__title">' + esc(c.telegram.heading) + "</h2>" +
            (c.telegram.text ? '<p class="telegram__text">' + esc(c.telegram.text) + "</p>" : "") +
            '<a class="btn btn--ghost" href="' + attr(c.telegram.url || "#") + '" target="_blank" rel="noopener">' +
              esc(c.telegram.buttonLabel || "Приєднатися") + "</a>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- footer ---------- */
  function footer(c) {
    var f = c.footer || {};
    var links = [];
    if (on(c.venues)) links.push('<a href="#venues">Локації</a>');
    if (on(c.timeline)) links.push('<a href="#timeline">Таймінг</a>');
    return (
      '<footer class="footer">' +
        '<div class="container footer__inner reveal">' +
          '<h2 class="footer__text">' + esc(f.text || "Дякуємо!") + "</h2>" +
          '<div class="footer__divider"></div>' +
          (links.length ? '<div class="footer__links">' + links.join("") + "</div>" : "") +
          (f.signature ? '<p class="footer__sign">' + esc(f.signature) + "</p>" : "") +
        "</div>" +
      "</footer>"
    );
  }

  /* ---------- music ---------- */
  function musicToggle(c) {
    return (
      '<button class="music-toggle" type="button" aria-label="' + attr(c.music.label || "Музика") + '" data-src="' + attr(c.music.src || "") + '" data-volume="' + attr(c.music.volume != null ? c.music.volume : "") + '">' +
        '<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
        '<svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' +
      "</button>"
    );
  }

  function applyMeta(meta) {
    if (!meta) return;
    if (meta.title) document.title = meta.title;
    if (meta.lang) document.documentElement.lang = meta.lang;
    function setMeta(name, val) {
      if (!val) return;
      var m = document.querySelector('meta[name="' + name + '"]');
      if (!m) { m = document.createElement("meta"); m.setAttribute("name", name); document.head.appendChild(m); }
      m.setAttribute("content", val);
    }
    setMeta("description", meta.description);
    // Favicon is a brand asset set statically in the HTML head (/favicon.svg);
    // intentionally not overridden per-event here.
  }

  function render(content, mount) {
    applyMeta(content.meta);
    var parts = [];
    if (on(content.hero)) parts.push(nav(content));
    if (on(content.hero)) parts.push(hero(content));
    if (on(content.countdown)) parts.push(countdown(content));
    if (on(content.story)) parts.push(story(content));
    if (on(content.gallery)) parts.push(gallery(content));
    if (on(content.timeline)) parts.push(timeline(content));
    if (on(content.dressCode)) parts.push(dresscode(content));
    if (on(content.venues)) parts.push(venues(content));
    if (on(content.rsvp)) parts.push(rsvp(content));
    if (on(content.telegram)) parts.push(telegram(content));
    parts.push(footer(content));
    if (content.music && content.music.enabled && content.music.src) parts.push(musicToggle(content));
    mount.innerHTML = parts.join("");
  }

  window.WeddingRender = { render: render, esc: esc };
})();
