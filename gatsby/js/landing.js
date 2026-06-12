/* landing.js — renders the brand landing (root "/" page) from site.json.
   Shared by boot.js (live root) and the Studio preview so both match.
   Sections (hero / about / portfolio / contacts / footer) render only when
   their data is present. Exposes window.WeddingLanding.render(cfg, mountEl). */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

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

  function navBar(cfg) {
    return '<nav class="lnav"><div class="lnav__inner">' +
      '<span class="lnav__brand">' + esc(cfg.brand || "Вісточка") + "</span>" +
      '<a class="lnav__cta" href="#contacts">' + esc(cfg.contactsHeading || "Звʼязатися") + "</a>" +
      "</div></nav>";
  }

  function heroSection(cfg) {
    return '<header class="lhero">' +
      '<div class="lhero__inner">' +
        (cfg.eyebrow ? '<p class="lhero__eyebrow">' + esc(cfg.eyebrow) + "</p>" : "") +
        '<h1 class="landing__brand lhero__brand">' + esc(cfg.brand || "Вісточка") + "</h1>" +
        '<div class="lhero__rule"></div>' +
        (cfg.tagline ? '<p class="lhero__tag">' + esc(cfg.tagline) + "</p>" : "") +
      "</div>" +
      (cfg.heroImage ? '<div class="lhero__media"><img src="' + esc(cfg.heroImage) + '" alt="" loading="lazy"></div>' : "") +
      "</header>";
  }

  function aboutSection(a) {
    var features = (a.features || []).map(function (f) {
      return '<li class="feature"><span class="feature__mark" aria-hidden="true"></span>' +
        '<div class="feature__body"><span class="feature__title">' + esc(f.title) + "</span>" +
        (f.text ? '<span class="feature__text">' + esc(f.text) + "</span>" : "") + "</div></li>";
    }).join("");
    return '<section class="labout"><div class="labout__inner">' +
      '<div class="labout__text">' +
        (a.heading ? '<h2 class="section__heading labout__heading">' + esc(a.heading) + "</h2>" : "") +
        (a.text ? '<p class="labout__lead">' + esc(a.text) + "</p>" : "") +
        (features ? '<ul class="features">' + features + "</ul>" : "") +
      "</div>" +
      (a.image ? '<div class="labout__media"><img src="' + esc(a.image) + '" alt="" loading="lazy"></div>' : "") +
      "</div></section>";
  }

  function portfolioSection(p) {
    var items = (p.items || []).filter(function (it) { return it && it.image; }).map(function (it) {
      return '<figure class="lwork__item"><img src="' + esc(it.image) + '" alt="' + esc(it.label || "") + '" loading="lazy">' +
        (it.label ? '<figcaption>' + esc(it.label) + "</figcaption>" : "") + "</figure>";
    }).join("");
    return '<section class="section lwork section--surface"><div class="container container--wide">' +
      '<div class="section__head"><h2 class="section__heading">' + esc(p.heading || "Наші роботи") + "</h2></div>" +
      '<div class="lwork__grid">' + items + "</div>" +
      "</div></section>";
  }

  function contactsSection(cfg) {
    var contacts = (cfg.contacts || []).filter(function (c) { return c && c.url; }).map(function (c) {
      return '<a class="contact" href="' + esc(c.url) + '" target="_blank" rel="noopener">' +
        '<span class="contact__icon">' + contactSvg(c.type) + "</span>" +
        '<span class="contact__label">' + esc(c.label || c.type) + "</span></a>";
    }).join("");
    if (!contacts) return "";
    return '<section class="section lcontacts" id="contacts"><div class="container">' +
      (cfg.contactsHeading ? '<div class="section__head"><h2 class="section__heading">' + esc(cfg.contactsHeading) + "</h2></div>" : "") +
      '<div class="contacts">' + contacts + "</div>" +
      "</div></section>";
  }

  function footerSection(cfg) {
    return '<footer class="footer"><div class="container footer__inner">' +
      '<h2 class="footer__text">' + esc(cfg.brand || "Вісточка") + "</h2>" +
      '<div class="footer__divider"></div>' +
      (cfg.footer ? '<p class="footer__sign">' + esc(cfg.footer) + "</p>" : "") +
      "</div></footer>";
  }

  function render(cfg, mount) {
    if (!mount) return;
    cfg = cfg || {};
    var a = cfg.about || {};
    var p = cfg.portfolio || {};
    var html = navBar(cfg) + heroSection(cfg);
    if (a.heading || a.text || (a.features || []).length) html += aboutSection(a);
    if ((p.items || []).length) html += portfolioSection(p);
    html += contactsSection(cfg);
    html += footerSection(cfg);
    mount.innerHTML = html;
  }

  window.WeddingLanding = { render: render, ICONS: ICONS, contactSvg: contactSvg };
})();
