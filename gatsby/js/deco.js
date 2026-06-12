/* deco.js — Art Deco entrance + scroll animations (Gatsby build).
   Uses GSAP + ScrollTrigger from CDN (loaded before this file).
   Re-runnable: boot calls WeddingDeco.init() after every render.
   Honors prefers-reduced-motion (skips everything; CSS keeps the
   page fully visible without JS/GSAP). */
(function () {
  "use strict";

  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Wrap every visible character in <span class="ch"> (keeps nested spans). */
  function splitChars(el) {
    if (!el || el.getAttribute("data-split")) return;
    el.setAttribute("data-split", "1");
    (function walk(node) {
      if (node.nodeType === 3) {
        var frag = document.createDocumentFragment();
        String(node.nodeValue).split("").forEach(function (chr) {
          if (chr.trim() === "") { frag.appendChild(document.createTextNode(chr)); return; }
          var s = document.createElement("span");
          s.className = "ch";
          s.textContent = chr;
          frag.appendChild(s);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.className !== "ch") {
        Array.prototype.slice.call(node.childNodes).forEach(walk);
      }
    })(el);
  }

  function heroIntro() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    splitChars(hero.querySelector(".hero__names"));
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".nav", { opacity: 0, y: -16, duration: 0.7 }, 0.1)
      .to(hero, { "--rays": 1, duration: 2.4, ease: "power2.out" }, 0.2)
      .from(".hero__eyebrow", { opacity: 0, y: 18, duration: 0.9 }, 0.25)
      .from(".hero__names .ch", { opacity: 0, y: "0.55em", duration: 0.85, stagger: 0.04 }, 0.45)
      .from(".hero__divider", { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.45")
      .from(".hero__date, .hero__subtitle", { opacity: 0, y: 16, duration: 0.8, stagger: 0.18 }, "-=0.4")
      .from(".hero__scroll", { opacity: 0, duration: 0.6 }, "-=0.2");
  }

  function parallax() {
    var bg = document.querySelector(".hero__bg");
    if (bg) {
      gsap.set(bg, { scale: 1.12, transformOrigin: "50% 0%" });
      gsap.to(bg, {
        yPercent: 14, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    gsap.utils.toArray(".story__images img, .venue__img").forEach(function (img) {
      gsap.set(img, { scale: 1.12 });
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  function batchReveals() {
    var els = gsap.utils.toArray(".reveal").filter(function (el) { return !el.closest(".hero"); });
    if (!els.length) return;
    gsap.set(els, { opacity: 0, y: 38 });
    ScrollTrigger.batch(els, {
      start: "top 86%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out", overwrite: true });
      }
    });
  }

  function timelineCascade() {
    var items = gsap.utils.toArray(".timeline__item");
    items.forEach(function (item) {
      gsap.from(item.querySelector(".timeline__time"), {
        opacity: 0, x: -22, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none" }
      });
    });
  }

  function galleryReveal() {
    var grid = document.querySelector(".gallery__grid");
    if (!grid) return;
    var items = grid.querySelectorAll(".gallery__item");
    if (!items.length) return;
    gsap.set(items, { clipPath: "inset(0 100% 0 0)" });
    ScrollTrigger.create({
      trigger: grid, start: "top 82%", once: true,
      onEnter: function () {
        gsap.to(items, { clipPath: "inset(0 0% 0 0)", duration: 1.15, stagger: 0.12, ease: "power3.inOut" });
      }
    });
  }

  function landingIntro() {
    var lhero = document.querySelector(".lhero");
    if (!lhero) return;
    splitChars(lhero.querySelector(".lhero__brand"));
    gsap.set(lhero, { "--rays": 0 });
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".lnav", { opacity: 0, y: -16, duration: 0.7 }, 0.1)
      .to(lhero, { "--rays": 1, duration: 2.4, ease: "power2.out" }, 0.2)
      .from(".lhero__eyebrow", { opacity: 0, y: 18, duration: 0.9 }, 0.25)
      .from(".lhero__brand .ch", { opacity: 0, y: "0.55em", duration: 0.85, stagger: 0.05 }, 0.45)
      .from(".lhero__rule", { scaleX: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.45")
      .from(".lhero__tag", { opacity: 0, y: 16, duration: 0.8 }, "-=0.4");
    var cards = gsap.utils.toArray(".lcontacts .contact, .lcontacts .section__head, .footer__inner");
    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: 30 });
      ScrollTrigger.batch(cards, {
        start: "top 90%", once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out", overwrite: true });
        }
      });
    }
  }

  function init() {
    if (!window.gsap || reduced()) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    else return; // both CDN files expected; without ScrollTrigger skip cleanly
    // re-render safety (Studio preview re-invokes init)
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });

    if (document.querySelector(".hero")) {
      heroIntro();
      parallax();
      batchReveals();
      timelineCascade();
      galleryReveal();
    } else if (document.querySelector(".lhero")) {
      landingIntro();
    }
    ScrollTrigger.refresh();
    // trigger positions move once webfonts arrive
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  window.WeddingDeco = { init: init };
})();
