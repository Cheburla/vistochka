/* studio.js — local admin ("Студія") for the invitation engine.
   Uses the File System Access API (Chrome/Edge) to read and write the
   project folder directly: events, content, photos, design tokens, and an
   in-browser publish build. No backend, no secrets. */
(function () {
  "use strict";

  if (!window.showDirectoryPicker) {
    document.getElementById("panel").innerHTML =
      '<div class="empty"><p>Цей браузер не підтримує доступ до файлів.<br>' +
      'Відкрийте Студію в <b>Chrome</b> або <b>Edge</b>.</p></div>';
    return;
  }

  var SITE = "https://vistochka.pp.ua"; // base URL for OG tags on build
  var EXCLUDE_DIRS = ["css", "js", "assets", "design", "apps-script", "publish", ".git", ".claude", "node_modules"];
  // Wedding-appropriate fonts. w = safe weight set per font (css2 fails if you
  // request a weight a font lacks). k = serif/script -> serif fallback stack.
  var DISPLAY_FONTS = [
    { n: "EB Garamond", w: "400;500;600", k: "serif" },
    { n: "Cormorant Garamond", w: "400;500;600", k: "serif" },
    { n: "Cormorant", w: "400;500;600", k: "serif" },
    { n: "Playfair Display", w: "400;500;600", k: "serif" },
    { n: "Fraunces", w: "400;500;600", k: "serif" },
    { n: "Lora", w: "400;500;600", k: "serif" },
    { n: "Spectral", w: "400;500;600", k: "serif" },
    { n: "Bodoni Moda", w: "400;500;600", k: "serif" },
    { n: "Cardo", w: "400;700", k: "serif" },
    { n: "Prata", w: "400", k: "serif" },
    { n: "Marcellus", w: "400", k: "serif" },
    { n: "Tenor Sans", w: "400", k: "serif" },
    { n: "DM Serif Display", w: "400", k: "serif" },
    { n: "Italiana", w: "400", k: "serif" },
    { n: "Forum", w: "400", k: "serif" },
    { n: "Gilda Display", w: "400", k: "serif" },
    { n: "Great Vibes", w: "400", k: "script" },
    { n: "Dancing Script", w: "400;500;600;700", k: "script" },
    { n: "Sacramento", w: "400", k: "script" },
    { n: "Parisienne", w: "400", k: "script" }
  ];
  var BODY_FONTS = [
    { n: "Inter", w: "300;400;500;600", k: "sans" },
    { n: "Manrope", w: "300;400;500;600", k: "sans" },
    { n: "Mulish", w: "300;400;500;600", k: "sans" },
    { n: "Jost", w: "300;400;500;600", k: "sans" },
    { n: "Nunito Sans", w: "300;400;600", k: "sans" },
    { n: "Montserrat", w: "300;400;500;600", k: "sans" },
    { n: "Lato", w: "300;400;700", k: "sans" },
    { n: "Work Sans", w: "300;400;500;600", k: "sans" },
    { n: "Karla", w: "300;400;500;600", k: "sans" },
    { n: "Poppins", w: "300;400;500;600", k: "sans" },
    { n: "Source Sans 3", w: "300;400;600", k: "sans" },
    { n: "Spectral", w: "300;400;500;600", k: "serif" }
  ];
  var ALL_FONTS = DISPLAY_FONTS.concat(BODY_FONTS);
  function fontDef(name) { for (var i = 0; i < ALL_FONTS.length; i++) if (ALL_FONTS[i].n === name) return ALL_FONTS[i]; return null; }
  var COLOR_TOKENS = [
    ["bg", "Фон"], ["surface-low", "Секція світла"], ["surface", "Секція"],
    ["ink", "Текст"], ["ink-2", "Текст 2"], ["muted", "Підписи"],
    ["line", "Лінії"], ["accent", "Акцент"]
  ];

  var root = null, slug = null, draft = null, theme = null;
  var frame, frameReady = false, tab = "content", saveTimer = null;

  /* ---------------- tiny DOM ---------------- */
  function h(tag, props, kids) {
    var el = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === "class") el.className = props[k];
      else if (k === "text") el.textContent = props[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (props[k] != null) el.setAttribute(k, props[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }
  function toast(msg) {
    var n = h("div", { class: "toast", text: msg }); document.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 1800);
  }

  /* ---------------- IndexedDB: remember the folder handle ---------------- */
  function idb(op, val) {
    return new Promise(function (res, rej) {
      var r = indexedDB.open("vistochka-studio", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("kv"); };
      r.onerror = function () { rej(r.error); };
      r.onsuccess = function () {
        var db = r.result, tx = db.transaction("kv", "readwrite"), st = tx.objectStore("kv");
        var q = op === "get" ? st.get("root") : st.put(val, "root");
        q.onsuccess = function () { res(q.result); };
        q.onerror = function () { rej(q.error); };
      };
    });
  }

  /* ---------------- FS helpers ---------------- */
  async function getDir(handle, segs, create) {
    var d = handle;
    for (var i = 0; i < segs.length; i++) d = await d.getDirectoryHandle(segs[i], { create: !!create });
    return d;
  }
  async function readText(rel) {
    var segs = rel.split("/"), name = segs.pop();
    var dir = await getDir(root, segs, false);
    var fh = await dir.getFileHandle(name);
    return (await fh.getFile()).text();
  }
  async function writeText(rel, text) {
    var segs = rel.split("/"), name = segs.pop();
    var dir = await getDir(root, segs, true);
    var fh = await dir.getFileHandle(name, { create: true });
    var w = await fh.createWritable(); await w.write(text); await w.close();
  }
  async function writeBlob(rel, blob) {
    var segs = rel.split("/"), name = segs.pop();
    var dir = await getDir(root, segs, true);
    var fh = await dir.getFileHandle(name, { create: true });
    var w = await fh.createWritable(); await w.write(blob); await w.close();
  }
  async function exists(dir, name) {
    try { await dir.getFileHandle(name); return true; } catch (e) {
      try { await dir.getDirectoryHandle(name); return true; } catch (e2) { return false; }
    }
  }
  async function listEvents() {
    var out = [];
    for await (var entry of root.values()) {
      if (entry.kind === "directory" && EXCLUDE_DIRS.indexOf(entry.name) === -1) {
        if (await exists(entry, "content.json")) out.push(entry.name);
      }
    }
    return out.sort();
  }

  /* ---------------- open / restore project ---------------- */
  async function ensurePermission(handle) {
    var opt = { mode: "readwrite" };
    if ((await handle.queryPermission(opt)) === "granted") return true;
    return (await handle.requestPermission(opt)) === "granted";
  }
  async function openProject() {
    try {
      var handle = await window.showDirectoryPicker({ mode: "readwrite" });
      root = handle; await idb("set", handle); await afterOpen();
    } catch (e) { /* user cancelled */ }
  }
  async function tryRestore() {
    try {
      var handle = await idb("get");
      if (handle && (await ensurePermission(handle))) { root = handle; await afterOpen(); }
    } catch (e) {}
  }
  async function afterOpen() {
    document.getElementById("proj").textContent = root.name + "/";
    ["events", "newEvent", "save", "build"].forEach(function (id) { document.getElementById(id).disabled = false; });
    theme = await loadTheme();
    await refreshEvents();
  }

  async function refreshEvents(selectSlug) {
    var sel = document.getElementById("events");
    var events = await listEvents();
    sel.innerHTML = "";
    events.forEach(function (s) { sel.appendChild(h("option", { value: s, text: s })); });
    document.getElementById("delEvent").disabled = events.length === 0;
    if (events.length) {
      slug = selectSlug && events.indexOf(selectSlug) > -1 ? selectSlug : events[0];
      sel.value = slug;
      await loadEvent(slug);
    } else {
      slug = null; draft = null; renderTab();
    }
  }

  async function loadEvent(s) {
    slug = s;
    draft = JSON.parse(await readText(slug + "/content.json"));
    renderTab();
    // Point the preview iframe at the event folder so relative image paths
    // (assets/img/...) resolve to THIS event's photos, not the root.
    var want = "/" + slug + "/";
    var cur = ""; try { cur = new URL(frame.src).pathname; } catch (e) {}
    if (cur !== want) { frameReady = false; frame.src = want; } else { renderPreview(); }
  }

  /* ---------------- preview ---------------- */
  function renderPreview() {
    if (!frameReady || !draft) return;
    var w; try { w = frame.contentWindow; } catch (e) { return; }
    if (!w || !w.WeddingApp) return;
    try { w.WeddingApp.renderContent(draft); applyThemeToPreview(); } catch (e) { console.error(e); }
  }
  function scheduleSavePreview() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(renderPreview, 180);
  }

  /* ---------------- content form ---------------- */
  function textField(obj, key, label, opts) {
    opts = opts || {};
    var input = h(opts.textarea ? "textarea" : "input", {
      type: opts.textarea ? null : "text",
      oninput: function () { obj[key] = this.value; scheduleSavePreview(); }
    });
    input.value = obj[key] != null ? obj[key] : "";
    return h("label", { class: "f" }, [label, input]);
  }
  function toggle(obj, label) {
    var input = h("input", { type: "checkbox", onchange: function () { obj.enabled = this.checked; scheduleSavePreview(); } });
    input.checked = obj.enabled !== false;
    return h("span", { class: "tg" }, [input, label || "показувати"]);
  }
  function fieldset(title, toggleObj, body) {
    return h("fieldset", null, [h("legend", null, [title].concat(toggleObj ? [toggle(toggleObj)] : []))].concat(body));
  }
  function listEditor(arr, fields, blank, onChange) {
    var wrap = h("div", null, []);
    function rowEl(item) {
      var kids = fields.map(function (fd) {
        if (fd.color) {
          var color = h("input", { type: "color", value: /^#/.test(item[fd.key] || "") ? item[fd.key] : "#cccccc", oninput: function () { item[fd.key] = this.value; scheduleSavePreview(); } });
          var txt = h("input", { type: "text", oninput: function () { item[fd.key] = this.value; scheduleSavePreview(); } }); txt.value = item[fd.key] || "";
          return h("label", { class: "f" }, [fd.label, h("span", { class: "swrow" }, [color, txt])]);
        }
        return textField(item, fd.key, fd.label, fd.opts);
      });
      var rm = h("button", { class: "rm", type: "button", text: "×", title: "Видалити", onclick: function () {
        var i = arr.indexOf(item); if (i > -1) arr.splice(i, 1); row.remove(); scheduleSavePreview(); if (onChange) onChange();
      } });
      var row = h("div", { class: "row" }, [rm].concat(kids));
      return row;
    }
    arr.forEach(function (it) { wrap.appendChild(rowEl(it)); });
    var add = h("button", { class: "add", type: "button", text: "+ Додати", onclick: function () {
      var it = blank(); arr.push(it); wrap.insertBefore(rowEl(it), add); scheduleSavePreview(); if (onChange) onChange();
    } });
    wrap.appendChild(add);
    return wrap;
  }

  function buildContentForm(panel) {
    var d = draft;
    panel.appendChild(fieldset("Пара та дата", null, [
      textField(d.couple, "groom", "Наречений"), textField(d.couple, "bride", "Наречена"),
      textField(d.couple, "separator", "Розділювач"),
      textField(d.date, "weekday", "День тижня"), textField(d.date, "display", "Дата (показ)"),
      textField(d.date, "iso", "Дата+час ISO (для відліку)"),
      h("p", { class: "hint", text: "ISO напр. 2026-09-20T16:00:00+03:00" })
    ]));
    panel.appendChild(fieldset("Заголовок (SEO/OG)", null, [
      textField(d.meta, "title", "Title"), textField(d.meta, "description", "Опис", { textarea: true })
    ]));
    panel.appendChild(fieldset("Головний екран", d.hero, [
      textField(d.hero, "eyebrow", "Напис зверху"), textField(d.hero, "subtitle", "Підзаголовок", { textarea: true }),
      textField(d.hero, "scrollHint", "Підказка скролу")
    ]));
    panel.appendChild(fieldset("Зворотний відлік", d.countdown, [
      textField(d.countdown, "heading", "Заголовок"), textField(d.countdown, "finishedText", "Текст після події")
    ]));
    var storyP = h("div"); rebuildParas();
    function rebuildParas() {
      storyP.innerHTML = "";
      d.story.paragraphs.forEach(function (_, i) {
        var ta = h("textarea", { oninput: function () { d.story.paragraphs[i] = this.value; scheduleSavePreview(); } }); ta.value = d.story.paragraphs[i] || "";
        var rm = h("button", { class: "rm", type: "button", text: "×", onclick: function () { d.story.paragraphs.splice(i, 1); rebuildParas(); scheduleSavePreview(); } });
        storyP.appendChild(h("div", { class: "row" }, [rm, h("label", { class: "f" }, ["Абзац", ta])]));
      });
      storyP.appendChild(h("button", { class: "add", type: "button", text: "+ Абзац", onclick: function () { d.story.paragraphs.push(""); rebuildParas(); scheduleSavePreview(); } }));
    }
    panel.appendChild(fieldset("Історія", d.story, [textField(d.story, "heading", "Заголовок"), h("p", { class: "hint", text: "Текст:" }), storyP]));
    panel.appendChild(fieldset("Таймінг", d.timeline, [
      textField(d.timeline, "heading", "Заголовок"),
      listEditor(d.timeline.items, [{ key: "time", label: "Час" }, { key: "title", label: "Подія" }, { key: "note", label: "Підпис (EN)" }], function () { return { time: "", title: "", note: "" }; })
    ]));
    panel.appendChild(fieldset("Дрес-код", d.dressCode, [
      textField(d.dressCode, "heading", "Заголовок"), textField(d.dressCode, "text", "Текст", { textarea: true }),
      h("p", { class: "hint", text: "Палітра:" }),
      listEditor(d.dressCode.palette, [{ key: "name", label: "Назва" }, { key: "hex", label: "Колір", color: true }], function () { return { name: "", hex: "#cccccc" }; })
    ]));
    panel.appendChild(fieldset("Локації", d.venues, [
      textField(d.venues, "heading", "Заголовок"),
      listEditor(d.venues.items, [
        { key: "label", label: "Підпис" }, { key: "name", label: "Назва" }, { key: "address", label: "Адреса" },
        { key: "time", label: "Час" }, { key: "mapQuery", label: "Адреса для маршруту" }, { key: "routeLabel", label: "Кнопка" }
      ], function () { return { label: "", name: "", address: "", time: "", image: "", mapQuery: "", routeLabel: "Побудувати маршрут" }; })
    ]));
    panel.appendChild(fieldset("RSVP", d.rsvp, [
      textField(d.rsvp, "heading", "Заголовок"), textField(d.rsvp, "intro", "Вступ", { textarea: true }),
      textField(d.rsvp, "appsScriptUrl", "URL форми (SheetMonkey)"),
      textField(d.rsvp.fields, "name", "Поле: імʼя"), textField(d.rsvp.fields, "attendance", "Поле: присутність"),
      textField(d.rsvp.fields, "attendanceYes", "Так"), textField(d.rsvp.fields, "attendanceNo", "Ні"),
      textField(d.rsvp.fields, "guests", "Поле: гостей"), textField(d.rsvp.fields, "notes", "Поле: побажання"),
      textField(d.rsvp, "submitLabel", "Кнопка"), textField(d.rsvp, "successMessage", "Успіх"), textField(d.rsvp, "errorMessage", "Помилка")
    ]));
    panel.appendChild(fieldset("Telegram", d.telegram, [
      textField(d.telegram, "heading", "Заголовок"), textField(d.telegram, "text", "Текст", { textarea: true }),
      textField(d.telegram, "url", "Посилання"), textField(d.telegram, "buttonLabel", "Кнопка")
    ]));
    if (!d.music) d.music = { enabled: false, src: "", label: "Увімкнути музику" };
    panel.appendChild(fieldset("Музика / Підвал", d.music, [
      textField(d.music, "label", "Підпис кнопки музики"),
      musicUploader(d),
      textField(d.footer, "text", "Підвал: текст"), textField(d.footer, "signature", "Підвал: підпис")
    ]));
  }

  function musicUploader(d) {
    var wrap = h("div");
    var status = h("p", { class: "hint" });
    function refresh() { status.textContent = (d.music && d.music.src) ? ("Трек: " + d.music.src) : "Трек ще не завантажено."; }
    refresh();
    var input = h("input", { type: "file", accept: "audio/*", style: "display:none", onchange: function () {
      if (this.files && this.files[0]) uploadAudio(this.files[0]);
    } });
    var up = h("button", { class: "add", type: "button", text: "Завантажити пісню", onclick: function () { input.click(); } });
    var rm = h("button", { class: "add", type: "button", text: "Прибрати", onclick: async function () {
      d.music.src = ""; d.music.enabled = false; await saveEvent(true); if (tab === "content") renderTab(); renderPreview();
    } });
    wrap.appendChild(status);
    wrap.appendChild(h("div", { class: "swrow" }, [up, rm, input]));
    wrap.appendChild(h("p", { class: "hint", text: "MP3 до ~8 МБ. На сайті зʼявиться кругла кнопка: гість вмикає і вимикає музику одним кліком." }));
    return wrap;
  }
  async function uploadAudio(file) {
    try {
      var ext = ((/\.([a-z0-9]+)$/i.exec(file.name) || [])[1] || (file.type.split("/")[1] || "mp3")).toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
      var name = "background." + ext;
      await writeBlob(slug + "/assets/audio/" + name, file);
      draft.music.src = "assets/audio/" + name;
      draft.music.enabled = true;
      await saveEvent(true);
      if (tab === "content") renderTab();
      renderPreview();
      toast("Пісню завантажено");
    } catch (e) { console.error(e); toast("Не вдалося завантажити пісню"); }
  }

  /* ---------------- photos ---------------- */
  function photoSlots() {
    var s = [];
    if (draft.hero) s.push({ get: function () { return draft.hero.backgroundImage; }, set: function (v) { draft.hero.backgroundImage = v; }, name: "hero.jpg", label: "Головне фото", max: 1600 });
    (draft.story.images || []).forEach(function (im, i) { s.push({ get: function () { return im.src; }, set: function (v) { im.src = v; }, name: "story-" + (i + 1) + ".jpg", label: "Історія " + (i + 1), max: 1000 }); });
    (draft.gallery.images || []).forEach(function (im, i) { s.push({ get: function () { return im.src; }, set: function (v) { im.src = v; }, name: "gallery-" + (i + 1) + ".jpg", label: "Галерея " + (i + 1), max: 1200 }); });
    (draft.venues.items || []).forEach(function (v, i) { s.push({ get: function () { return v.image; }, set: function (val) { v.image = val; }, name: "venue-" + (i + 1) + ".jpg", label: "Локація " + (i + 1), max: 1280 }); });
    return s;
  }
  function resizeToBlob(file, maxW) {
    return new Promise(function (res) {
      if (!/^image\//.test(file.type) || file.type === "image/svg+xml") { res(file); return; }
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var scale = Math.min(1, maxW / img.width), w = Math.round(img.width * scale), hh = Math.round(img.height * scale);
        var c = document.createElement("canvas"); c.width = w; c.height = hh;
        c.getContext("2d").drawImage(img, 0, 0, w, hh);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { res(b || file); }, "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
  }
  function buildPhotos(panel) {
    panel.appendChild(h("p", { class: "hint", text: "Замініть фото, файл одразу збережеться в теку події (з авто-стисненням). Великі фото зменшуються для швидкого завантаження." }));
    photoSlots().forEach(function (slot) {
      var thumb = h("img", { src: "/" + slug + "/" + slot.get() + "?cb=" + Date.now(), alt: "" });
      var input = h("input", { type: "file", accept: "image/*", style: "display:none", onchange: function () {
        if (this.files && this.files[0]) replacePhoto(slot, this.files[0], thumb);
      } });
      var btn = h("button", { class: "add", type: "button", text: "Замінити", onclick: function () { input.click(); } });
      panel.appendChild(h("div", { class: "photo" }, [thumb,
        h("div", { class: "meta" }, [h("b", { text: slot.label }), h("div", { text: slot.name })]), btn, input]));
    });
  }
  async function replacePhoto(slot, file, thumb) {
    try {
      var blob = await resizeToBlob(file, slot.max);
      var path = "assets/img/" + slot.name;
      await writeBlob(slug + "/" + path, blob);
      slot.set(path);
      await saveEvent(true);
      var u = "/" + slug + "/" + path + "?cb=" + Date.now();
      thumb.src = u; renderPreview(); toast("Фото оновлено");
    } catch (e) { console.error(e); toast("Не вдалося зберегти фото"); }
  }

  /* ---------------- design ---------------- */
  function fontStack(name) { var f = fontDef(name); var serif = f && (f.k === "serif" || f.k === "script"); return '"' + name + '", ' + (serif ? "Georgia, serif" : "system-ui, sans-serif"); }
  function familyParam(name) { var f = fontDef(name), enc = name.replace(/ /g, "+"); return f && f.w ? enc + ":wght@" + f.w : enc; }
  function fontsUrl(disp, body) { return "https://fonts.googleapis.com/css2?family=" + familyParam(disp) + "&family=" + familyParam(body) + "&display=swap"; }
  async function loadTheme() {
    var css = await readText("css/tokens.css");
    var colors = {};
    COLOR_TOKENS.forEach(function (t) {
      var m = css.match(new RegExp("--" + t[0] + ":\\s*([^;]+);"));
      colors[t[0]] = m ? m[1].trim() : "#cccccc";
    });
    function famOf(varName, list) {
      var m = css.match(new RegExp("--" + varName + ":\\s*\"?([^\",;]+)"));
      var name = m ? m[1].trim() : list[0].n;
      return list.some(function (f) { return f.n === name; }) ? name : list[0].n;
    }
    return { colors: colors, fontDisplay: famOf("font-display", DISPLAY_FONTS), fontBody: famOf("font-body", BODY_FONTS) };
  }
  function applyThemeToPreview() {
    if (!theme) return;
    var doc; try { doc = frame.contentDocument; } catch (e) { return; } if (!doc) return;
    var s = doc.getElementById("__studio_theme");
    if (!s) { s = doc.createElement("style"); s.id = "__studio_theme"; doc.head.appendChild(s); }
    var vars = COLOR_TOKENS.map(function (t) { return "--" + t[0] + ":" + theme.colors[t[0]]; }).join(";");
    s.textContent = ":root{" + vars + ";--font-display:" + fontStack(theme.fontDisplay) + ";--font-body:" + fontStack(theme.fontBody) + "}";
    var l = doc.getElementById("__studio_fonts");
    if (!l) { l = doc.createElement("link"); l.id = "__studio_fonts"; l.rel = "stylesheet"; doc.head.appendChild(l); }
    l.href = fontsUrl(theme.fontDisplay, theme.fontBody);
  }
  function buildDesign(panel) {
    panel.appendChild(h("p", { class: "hint", text: "Дизайн глобальний: впливає на ВСІ події. Зміни видно одразу в превʼю, «Зберегти дизайн» пише в css/tokens.css." }));
    var fonts = h("fieldset", null, [h("legend", null, ["Шрифти"])]);
    function fontSelect(label, list, cur, onpick) {
      var sel = h("select", { onchange: function () { onpick(this.value); applyThemeToPreview(); } },
        list.map(function (f) { return h("option", { value: f.n, text: f.n + (f.k === "script" ? " (рукописний)" : "") }); }));
      sel.value = cur;
      return h("label", { class: "f" }, [label, sel]);
    }
    fonts.appendChild(fontSelect("Заголовки (display)", DISPLAY_FONTS, theme.fontDisplay, function (v) { theme.fontDisplay = v; }));
    fonts.appendChild(fontSelect("Текст (body)", BODY_FONTS, theme.fontBody, function (v) { theme.fontBody = v; }));
    fonts.appendChild(h("p", { class: "hint", text: "Рукописні гарні для імен; для довгих заголовків секцій краще класичні serif." }));
    panel.appendChild(fonts);

    var colors = h("fieldset", null, [h("legend", null, ["Кольори"])]);
    COLOR_TOKENS.forEach(function (t) {
      var picker = h("input", { type: "color", value: /^#/.test(theme.colors[t[0]]) ? theme.colors[t[0]] : "#cccccc", oninput: function () { theme.colors[t[0]] = this.value; applyThemeToPreview(); } });
      colors.appendChild(h("div", { class: "design-color" }, [picker, h("span", { text: t[1] + "  (" + t[0] + ")" })]));
    });
    panel.appendChild(colors);
    panel.appendChild(h("button", { class: "add", type: "button", text: "Зберегти дизайн у tokens.css", onclick: saveDesign }));
  }
  async function saveDesign() {
    try {
      var css = await readText("css/tokens.css");
      css = css.replace(/@import url\([^)]*\);/, "@import url('" + fontsUrl(theme.fontDisplay, theme.fontBody) + "');");
      COLOR_TOKENS.forEach(function (t) {
        css = css.replace(new RegExp("(--" + t[0] + ":\\s*)[^;]+;"), "$1" + theme.colors[t[0]] + ";");
      });
      css = css.replace(/(--font-display:\s*)[^;]+;/, "$1" + fontStack(theme.fontDisplay) + ";");
      css = css.replace(/(--font-body:\s*)[^;]+;/, "$1" + fontStack(theme.fontBody) + ";");
      await writeText("css/tokens.css", css);
      toast("Дизайн збережено в tokens.css");
    } catch (e) { console.error(e); toast("Помилка збереження дизайну"); }
  }

  /* ---------------- save event ---------------- */
  async function saveEvent(quiet) {
    if (!slug || !draft) return;
    try { await writeText(slug + "/content.json", JSON.stringify(draft, null, 2)); if (!quiet) toast("Подію збережено"); }
    catch (e) { console.error(e); toast("Помилка збереження"); }
  }

  /* ---------------- new / delete event ---------------- */
  async function newEvent() {
    var s = (prompt("Slug нової події (латиниця, дефіси), напр. ivan-maria:") || "").trim().toLowerCase();
    if (!s) return;
    if (!/^[a-z0-9-]+$/.test(s)) { toast("Лише латиниця, цифри, дефіси"); return; }
    if (await exists(root, s)) { toast("Така подія вже існує"); return; }
    try {
      await getDir(root, [s, "assets", "img"], true);
      await getDir(root, [s, "assets", "audio"], true);
      await writeText(s + "/index.html", await readText("index.html"));
      var tmpl;
      try { tmpl = await readText("content.template.json"); } catch (e) { tmpl = await readText("content.sample.json"); }
      await writeText(s + "/content.json", tmpl);
      // copy placeholder svgs
      var srcImg = await getDir(root, ["assets", "img"], false);
      for await (var e of srcImg.values()) {
        if (e.kind === "file" && /^placeholder-.*\.svg$/.test(e.name)) await writeBlob(s + "/assets/img/" + e.name, await e.getFile());
      }
      toast("Створено: " + s); await refreshEvents(s);
    } catch (err) { console.error(err); toast("Не вдалося створити подію"); }
  }
  async function delEvent() {
    if (!slug) return;
    if (!confirm("Видалити подію /" + slug + "/ разом з фото? Дію не скасувати.")) return;
    try { await root.removeEntry(slug, { recursive: true }); toast("Видалено: " + slug); await refreshEvents(); }
    catch (e) { console.error(e); toast("Помилка видалення"); }
  }

  /* ---------------- build publish ---------------- */
  function ogEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function excludeFromPublish(rel, kind) {
    var top = rel.split("/")[0];
    if (["publish", "design", "apps-script", ".git", ".claude", "node_modules"].indexOf(top) > -1) return true;
    if (["studio.html", "editor.html", "content.sample.json", "build-publish.ps1", "new-event.ps1", "README.md", "ROADMAP.md"].indexOf(rel) > -1) return true;
    if (rel === "js/editor.js" || rel === "js/studio.js") return true;
    return false;
  }
  async function copyInto(srcDir, destDir, base) {
    for await (var entry of srcDir.values()) {
      var rel = base ? base + "/" + entry.name : entry.name;
      if (excludeFromPublish(rel, entry.kind)) continue;
      if (entry.kind === "directory") {
        var sub = await destDir.getDirectoryHandle(entry.name, { create: true });
        await copyInto(entry, sub, rel);
      } else {
        var f = await entry.getFile();
        var w = await (await destDir.getFileHandle(entry.name, { create: true })).createWritable();
        await w.write(f); await w.close();
      }
    }
  }
  async function injectOG(pub) {
    for await (var entry of pub.values()) {
      if (entry.kind !== "directory" || EXCLUDE_DIRS.indexOf(entry.name) > -1) continue;
      if (!(await exists(entry, "content.json")) || !(await exists(entry, "index.html"))) continue;
      var s = entry.name;
      var c = JSON.parse(await (await (await entry.getFileHandle("content.json")).getFile()).text());
      var title = ogEsc(c.meta && c.meta.title), desc = ogEsc(c.meta && c.meta.description);
      var url = SITE + "/" + s + "/", img = SITE + "/" + s + "/" + ((c.hero && c.hero.backgroundImage) || "");
      var ih = await entry.getFileHandle("index.html");
      var html = await (await ih.getFile()).text();
      html = html.replace(/(<title>)[\s\S]*?(<\/title>)/, function (m, a, b) { return a + title + b; });
      html = html.replace(/(<meta name="description" content=")[^"]*(">)/, function (m, a, b) { return a + desc + b; });
      html = html.replace(/(<meta property="og:title" content=")[^"]*(">)/, function (m, a, b) { return a + title + b; });
      html = html.replace(/(<meta property="og:description" content=")[^"]*(">)/, function (m, a, b) { return a + desc + b; });
      html = html.replace(/(<meta property="og:url" content=")[^"]*(">)/, function (m, a, b) { return a + url + b; });
      html = html.replace(/<\/head>/, '  <meta property="og:image" content="' + img + '">\n  <meta name="twitter:image" content="' + img + '">\n</head>');
      var w = await ih.createWritable(); await w.write(html); await w.close();
    }
  }
  async function buildPublish() {
    var btn = document.getElementById("build"); btn.disabled = true; btn.textContent = "Збираю...";
    try {
      try { await root.removeEntry("publish", { recursive: true }); } catch (e) {}
      var pub = await root.getDirectoryHandle("publish", { create: true });
      await copyInto(root, pub, "");
      await injectOG(pub);
      toast("publish/ зібрано. Перетягніть теку publish у Netlify.");
    } catch (e) { console.error(e); toast("Помилка збірки publish"); }
    btn.disabled = false; btn.textContent = "Зібрати publish";
  }

  /* ---------------- tabs ---------------- */
  function renderTab() {
    var panel = document.getElementById("panel"); panel.innerHTML = "";
    if (!root) { panel.innerHTML = '<div class="empty"><p>Відкрийте проєкт.</p></div>'; return; }
    if (tab === "design") { if (theme) buildDesign(panel); return; }
    if (tab === "publish") { buildPublishPanel(panel); return; }
    if (!draft) { panel.innerHTML = '<div class="empty"><p>Немає події. Створіть нову кнопкою «+ Подія».</p></div>'; return; }
    if (tab === "content") buildContentForm(panel);
    else if (tab === "photos") buildPhotos(panel);
  }
  function buildPublishPanel(panel) {
    panel.appendChild(h("p", { class: "hint", text: "Збирає теку publish/ з усіх подій + спільних css/js (без дев-файлів) і вшиває OG-теги. Далі перетягніть publish у Netlify." }));
    var siteInput = h("input", { type: "text", value: SITE, oninput: function () { SITE = this.value.trim().replace(/\/$/, ""); } });
    panel.appendChild(h("label", { class: "f" }, ["Базовий URL сайту (для OG)", siteInput]));
    panel.appendChild(h("button", { class: "add", type: "button", text: "Зібрати publish", onclick: buildPublish }));
  }

  /* ---------------- wire up ---------------- */
  function init() {
    frame = document.getElementById("pv");
    frame.addEventListener("load", function () { frameReady = true; renderPreview(); });
    document.getElementById("open").addEventListener("click", openProject);
    document.getElementById("save").addEventListener("click", function () { saveEvent(false); });
    document.getElementById("build").addEventListener("click", buildPublish);
    document.getElementById("newEvent").addEventListener("click", newEvent);
    document.getElementById("delEvent").addEventListener("click", delEvent);
    document.getElementById("events").addEventListener("change", function () { loadEvent(this.value); });
    document.querySelector(".tabs").addEventListener("click", function (e) {
      var b = e.target.closest("[data-tab]"); if (!b) return;
      tab = b.getAttribute("data-tab");
      this.querySelectorAll("[data-tab]").forEach(function (x) { x.classList.toggle("on", x === b); });
      renderTab();
    });
    document.querySelector(".ptools").addEventListener("click", function (e) {
      var b = e.target.closest("[data-view]"); if (!b) return;
      document.getElementById("frameWrap").classList.toggle("mobile", b.getAttribute("data-view") === "mobile");
      this.querySelectorAll("[data-view]").forEach(function (x) { x.classList.toggle("on", x === b); });
    });
    tryRestore();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
