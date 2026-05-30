/* editor.js — visual field editor for content.json with live preview.
   Builds a form from the content object, writes changes back into an
   in-memory draft, mirrors it into the preview iframe (which renders
   via the same render.js), and exports/imports content.json. */
(function () {
  "use strict";

  // Tell the iframe (index.html) that the editor drives rendering.
  window.__WEDDING_EDITOR__ = true;

  var DRAFT_KEY = "wedding:draft";
  var draft = null;
  var frame, frameReady = false, saveTimer = null;

  /* ---------- tiny DOM helper ---------- */
  function h(tag, props, children) {
    var el = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === "class") el.className = props[k];
      else if (k === "text") el.textContent = props[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else el.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }

  /* ---------- persistence + preview ---------- */
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {}
      renderPreview();
    }, 200);
  }
  function renderPreview() {
    if (!frameReady || !draft) return;
    var w;
    try { w = frame.contentWindow; } catch (e) { return; }
    if (!w || !w.WeddingApp || typeof w.WeddingApp.renderContent !== "function") return;
    try { w.WeddingApp.renderContent(draft); } catch (e) { console.error(e); }
  }

  /* ---------- field builders ---------- */
  function textField(obj, key, label, opts) {
    opts = opts || {};
    var input = h(opts.textarea ? "textarea" : "input", {
      type: opts.type || "text",
      value: obj[key] != null ? obj[key] : "",
      oninput: function () { obj[key] = this.value; scheduleSave(); }
    });
    if (opts.textarea) input.value = obj[key] != null ? obj[key] : "";
    return h("label", { class: "f" }, [label, input]);
  }

  function toggle(obj, label) {
    var input = h("input", {
      type: "checkbox",
      onchange: function () { obj.enabled = this.checked; scheduleSave(); }
    });
    input.checked = obj.enabled !== false;
    return h("span", { class: "toggle" }, [input, label || "показувати"]);
  }

  function fieldset(legendText, toggleObj, body) {
    var legendKids = [legendText];
    if (toggleObj) legendKids.push(toggle(toggleObj));
    return h("fieldset", null, [h("legend", null, legendKids)].concat(body));
  }

  // Repeatable list of objects. fields = [{key,label,opts}]; supports color via opts.color
  function listEditor(arr, fields, blankFactory) {
    var wrap = h("div", null, []);
    function rowEl(item) {
      var kids = fields.map(function (fd) {
        if (fd.color) {
          var color = h("input", { type: "color", value: item[fd.key] || "#cccccc",
            oninput: function () { item[fd.key] = this.value; scheduleSave(); } });
          var txt = h("input", { type: "text", value: item[fd.key] || "",
            oninput: function () { item[fd.key] = this.value; color.value = /^#/.test(this.value) ? this.value : color.value; scheduleSave(); } });
          return h("label", { class: "f" }, [fd.label, h("span", { class: "swrow" }, [color, txt])]);
        }
        return textField(item, fd.key, fd.label, fd.opts);
      });
      var rm = h("button", { class: "rm", type: "button", title: "Видалити", text: "×",
        onclick: function () {
          var i = arr.indexOf(item);
          if (i > -1) arr.splice(i, 1);
          row.remove(); scheduleSave();
        } });
      var row = h("div", { class: "row" }, [rm].concat(kids));
      return row;
    }
    arr.forEach(function (item) { wrap.appendChild(rowEl(item)); });
    var add = h("button", { class: "add", type: "button", text: "+ Додати",
      onclick: function () {
        var item = blankFactory();
        arr.push(item);
        wrap.insertBefore(rowEl(item), add);
        scheduleSave();
      } });
    wrap.appendChild(add);
    return wrap;
  }

  /* ---------- build the whole form ---------- */
  function buildForm() {
    var form = document.getElementById("ed-form");
    form.innerHTML = "";
    var d = draft;

    // Couple + date
    form.appendChild(fieldset("Пара та дата", null, [
      textField(d.couple, "groom", "Наречений"),
      textField(d.couple, "bride", "Наречена"),
      textField(d.couple, "separator", "Розділювач (& / і / +)"),
      textField(d.date, "weekday", "День тижня"),
      textField(d.date, "display", "Дата (як показувати)"),
      textField(d.date, "iso", "Дата і час (ISO, для відліку)", { type: "datetime-local" }),
      h("p", { class: "hint", text: "ISO напр. 2025-09-21T16:00:00+03:00. Поле datetime-local можна редагувати як текст у JSON." })
    ]));

    // Meta
    form.appendChild(fieldset("Заголовок сторінки (SEO)", null, [
      textField(d.meta, "title", "Title (вкладка браузера)"),
      textField(d.meta, "description", "Опис", { textarea: true })
    ]));

    // Hero
    form.appendChild(fieldset("Головний екран", d.hero, [
      textField(d.hero, "eyebrow", "Напис зверху"),
      textField(d.hero, "subtitle", "Підзаголовок", { textarea: true }),
      textField(d.hero, "backgroundImage", "Фонове фото (шлях або URL)"),
      textField(d.hero, "scrollHint", "Підказка скролу")
    ]));

    // Countdown
    form.appendChild(fieldset("Зворотний відлік", d.countdown, [
      textField(d.countdown, "heading", "Заголовок"),
      textField(d.countdown, "finishedText", "Текст після події")
    ]));

    // Story
    var storyImgs = listEditor(d.story.images, [
      { key: "src", label: "Фото (шлях/URL)" }, { key: "alt", label: "Опис (alt)" }
    ], function () { return { src: "", alt: "" }; });
    var storyParas = h("div", null, []);
    function paraRow(arr, idx) {
      var ta = h("textarea", { oninput: function () { arr[idx] = this.value; scheduleSave(); } });
      ta.value = arr[idx] || "";
      var rm = h("button", { class: "rm", type: "button", text: "×", onclick: function () {
        arr.splice(idx, 1); buildStoryParas(); scheduleSave(); } });
      return h("div", { class: "row" }, [rm, h("label", { class: "f" }, ["Абзац", ta])]);
    }
    function buildStoryParas() {
      storyParas.innerHTML = "";
      d.story.paragraphs.forEach(function (_, i) { storyParas.appendChild(paraRow(d.story.paragraphs, i)); });
      storyParas.appendChild(h("button", { class: "add", type: "button", text: "+ Додати абзац",
        onclick: function () { d.story.paragraphs.push(""); buildStoryParas(); scheduleSave(); } }));
    }
    buildStoryParas();
    form.appendChild(fieldset("Історія", d.story, [
      textField(d.story, "heading", "Заголовок"),
      h("p", { class: "hint", text: "Текст історії:" }), storyParas,
      h("p", { class: "hint", text: "Фото історії:" }), storyImgs
    ]));

    // Gallery
    form.appendChild(fieldset("Галерея", d.gallery, [
      textField(d.gallery, "heading", "Заголовок"),
      listEditor(d.gallery.images, [
        { key: "src", label: "Фото (шлях/URL)" }, { key: "alt", label: "Опис (alt)" }
      ], function () { return { src: "", alt: "" }; })
    ]));

    // Timeline
    form.appendChild(fieldset("Таймінг дня", d.timeline, [
      textField(d.timeline, "heading", "Заголовок"),
      listEditor(d.timeline.items, [
        { key: "time", label: "Час" }, { key: "title", label: "Подія" }, { key: "note", label: "Примітка" }
      ], function () { return { time: "", title: "", note: "" }; })
    ]));

    // Dress code
    form.appendChild(fieldset("Дрес-код", d.dressCode, [
      textField(d.dressCode, "heading", "Заголовок"),
      textField(d.dressCode, "text", "Текст", { textarea: true }),
      h("p", { class: "hint", text: "Палітра кольорів:" }),
      listEditor(d.dressCode.palette, [
        { key: "name", label: "Назва" }, { key: "hex", label: "Колір", color: true }
      ], function () { return { name: "", hex: "#cccccc" }; })
    ]));

    // Venues
    form.appendChild(fieldset("Локації", d.venues, [
      textField(d.venues, "heading", "Заголовок"),
      listEditor(d.venues.items, [
        { key: "label", label: "Підпис (Церемонія/Банкет)" },
        { key: "name", label: "Назва місця" },
        { key: "address", label: "Адреса" },
        { key: "time", label: "Час (напр. Початок о 16:00)" },
        { key: "image", label: "Фото локації (шлях/URL)" },
        { key: "mapQuery", label: "Адреса/назва для маршруту" },
        { key: "routeLabel", label: "Текст кнопки маршруту" }
      ], function () { return { label: "", name: "", address: "", time: "", image: "", mapQuery: "", routeLabel: "Побудувати маршрут" }; })
    ]));

    // RSVP
    form.appendChild(fieldset("RSVP", d.rsvp, [
      textField(d.rsvp, "heading", "Заголовок"),
      textField(d.rsvp, "intro", "Вступний текст", { textarea: true }),
      textField(d.rsvp, "appsScriptUrl", "URL прийому форми (Apps Script або SheetMonkey)", { type: "url" }),
      h("p", { class: "hint", text: "Підписи полів форми:" }),
      textField(d.rsvp.fields, "name", "Поле: імʼя"),
      textField(d.rsvp.fields, "attendance", "Поле: присутність"),
      textField(d.rsvp.fields, "attendanceYes", "Варіант: так"),
      textField(d.rsvp.fields, "attendanceNo", "Варіант: ні"),
      textField(d.rsvp.fields, "guests", "Поле: кількість гостей"),
      textField(d.rsvp.fields, "notes", "Поле: побажання"),
      textField(d.rsvp, "submitLabel", "Кнопка відправки"),
      textField(d.rsvp, "successMessage", "Повідомлення про успіх"),
      textField(d.rsvp, "errorMessage", "Повідомлення про помилку")
    ]));

    // Telegram
    form.appendChild(fieldset("Telegram", d.telegram, [
      textField(d.telegram, "heading", "Заголовок"),
      textField(d.telegram, "text", "Текст", { textarea: true }),
      textField(d.telegram, "url", "Посилання на групу", { type: "url" }),
      textField(d.telegram, "buttonLabel", "Текст кнопки")
    ]));

    // Music
    form.appendChild(fieldset("Музика", d.music, [
      textField(d.music, "src", "Аудіофайл (шлях/URL)"),
      textField(d.music, "label", "Підпис кнопки")
    ]));

    // Footer
    form.appendChild(fieldset("Підвал", null, [
      textField(d.footer, "text", "Текст"),
      textField(d.footer, "signature", "Підпис")
    ]));
  }

  /* ---------- toolbar actions ---------- */
  function download() {
    var blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = h("a", { href: url, download: "content.json" });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function copy() {
    var text = JSON.stringify(draft, null, 2);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { flash("Скопійовано"); });
    else flash("Скопіюйте вручну з консолі"), console.log(text);
  }
  function flash(msg) {
    var n = h("div", { text: msg, style: "position:fixed;left:50%;bottom:1.5rem;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:.6rem 1rem;border-radius:6px;z-index:99;font-size:.85rem" });
    document.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 1500);
  }
  function importFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        draft = JSON.parse(reader.result);
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {}
        buildForm(); renderPreview(); flash("Завантажено");
      } catch (e) { flash("Помилка читання JSON"); }
    };
    reader.readAsText(file);
  }
  function reset() {
    fetch("/content.sample.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (c) {
        draft = c;
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        buildForm(); renderPreview(); flash("Скинуто до шаблону (нова подія)");
      });
  }

  function loadEvent() {
    var slug = (document.getElementById("slug").value || "").trim().replace(/^\/+|\/+$/g, "");
    if (!slug) { flash("Вкажіть slug події"); return; }
    fetch("/" + slug + "/content.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (c) {
        draft = c;
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (e) {}
        buildForm(); renderPreview(); flash("Завантажено подію: " + slug);
      })
      .catch(function () { flash("Не знайдено /" + slug + "/content.json"); });
  }

  function wireToolbar() {
    document.querySelector(".ed-bar").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "download") download();
      else if (act === "copy") copy();
      else if (act === "reset") reset();
      else if (act === "load") loadEvent();
      else if (act === "reload") { frameReady = false; frame.src = "/"; }
      else if (act === "import") document.getElementById("import").click();
    });
    document.getElementById("import").addEventListener("change", function () {
      if (this.files && this.files[0]) importFile(this.files[0]);
      this.value = "";
    });
    document.querySelector(".ed-ptools").addEventListener("click", function (e) {
      var view = e.target.closest("[data-view]");
      if (view) {
        document.getElementById("frameWrap").classList.toggle("mobile", view.getAttribute("data-view") === "mobile");
        this.querySelectorAll("[data-view]").forEach(function (x) { x.classList.remove("on"); });
        view.classList.add("on");
        return;
      }
      if (e.target.closest('[data-act="reload"]')) { frameReady = false; frame.src = "/"; }
    });
  }

  /* ---------- init ---------- */
  function start(content) {
    draft = content;
    buildForm();
    if (frameReady) renderPreview();
  }
  function onFrameLoad() { frameReady = true; renderPreview(); }

  function init() {
    frame = document.getElementById("preview");
    frame.addEventListener("load", onFrameLoad);
    // Guard against the race where the iframe finished loading before this
    // listener was attached. A fresh iframe exposes an about:blank document
    // that is already "complete", so key off WeddingApp being defined (which
    // only happens once index.html itself has loaded), not readyState.
    try {
      if (frame.contentWindow && frame.contentWindow.WeddingApp) onFrameLoad();
    } catch (e) { /* not ready yet, the load event will fire */ }
    wireToolbar();

    // Editor opened as /editor.html?e=<slug> auto-loads that event.
    var qslug = new URLSearchParams(location.search).get("e");
    if (qslug) { document.getElementById("slug").value = qslug; loadEvent(); return; }

    var saved = null;
    try { saved = localStorage.getItem(DRAFT_KEY); } catch (e) {}
    if (saved) {
      try { start(JSON.parse(saved)); return; } catch (e) {}
    }
    fetch("/content.sample.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(start)
      .catch(function () { flash("Не вдалося завантажити шаблон content.sample.json"); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
