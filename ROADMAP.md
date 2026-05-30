# Весільне запрошення, дорожня карта і to-do

Останнє оновлення: 2026-05-29. Стек: статичний сайт (HTML/CSS/JS), контент у `content.json`,
редактор `editor.html`. Дизайн: «Modern Minimalist Wedding» (з Claude Design handoff).
Локація проєкту: `D:\Claude\personal\wedding-invitation\`.

---

## Зроблено (готове)

- [x] Каркас шаблону: `content.json` як єдине джерело контенту + візуальний редактор `editor.html`.
- [x] Дизайн з handoff застосовано: токени (`css/tokens.css`), секції (`css/sections.css`),
      рендер (`js/render.js`). EB Garamond + Inter, золото `#C2A878`, гострі кути.
- [x] Секції: топ-нав, hero, відлік, історія, галерея, таймінг, дрес-код, локації (фото + маршрут),
      RSVP, Telegram, футер, кнопка музики.
- [x] Реальні фото з дизайну завантажено локально в `assets/img/` (hero, story-1/2, gallery-1..5,
      venue-ceremony, venue-banquet).
- [x] RSVP шле читабельне «Так/Ні» на налаштовуваний endpoint (поле в редакторі).
- [x] Анти-кеш версії підключень; жива перевірка в браузері пройдена.
- [x] Чиста папка `publish/` для Netlify (без дев-файлів) + `build-publish.ps1` для перезбірки.
- [x] RSVP підключено до SheetMonkey, тестова відправка пройшла.
- [x] Сайт задеплоєно на Netlify.
- [x] **Багатоподійний движок:** один деплой, кожна подія в теці `/<slug>/` (свій `index.html`
      + `content.json` + `assets/`), спільні `css/` і `js/`. Корінь `/` = лендинг. Демо-подія
      перенесена в `/mykhailo-olena/`. RSVP усіх подій в одну таблицю, розрізнення по колонках
      `event` (імена пари) і `page` (URL).

## Як додати нову подію

1. `./new-event.ps1 <slug>` (напр. `./new-event.ps1 ivan-maria`) створює теку `/<slug>/`
   з шаблоном і плейсхолдерами.
2. `/editor.html` -> впишіть `<slug>` -> «Завантажити подію» -> відредагуйте -> «Завантажити
   content.json» -> покладіть у теку `<slug>\` (замінивши).
3. Фото -> `<slug>\assets\img\`. Музику -> `<slug>\assets\audio\background.mp3`.
4. RSVP: вставте той самий (або новий) SheetMonkey endpoint у поле редактора.
5. `./build-publish.ps1` -> залийте `publish/` на Netlify.
6. URL події: `https://<домен>/<slug>/`.

---

## TODO на завтра (по порядку)

### 1. Контент (наповнення)
- [ ] Імена, дата і час: `editor.html` -> блок «Пара та дата». Дата для відліку в полі ISO
      (напр. `2026-09-20T16:00:00+03:00`).
- [ ] Текст історії (2 абзаци), таймінг дня, дрес-код, назви/адреси локацій, лінк Telegram.
- [ ] Title і опис сторінки (SEO) у блоці «Заголовок сторінки».
- [ ] Замінити демо-фото своїми: покласти файли в `assets/img/` під тими ж іменами
      (`hero.jpg`, `story-1.jpg`, `story-2.jpg`, `gallery-1..5.jpg`, `venue-ceremony.jpg`,
      `venue-banquet.jpg`), або змінити шляхи в редакторі.
- [ ] Фонова музика: покласти трек у `assets/audio/background.mp3` (зараз файлу немає, кнопка
      працюватиме після додавання).
- [ ] Після правок: у редакторі натиснути «Завантажити content.json» і покласти його в корінь проєкту.

### 2. RSVP backend (SheetMonkey) — ЗРОБЛЕНО
- [x] SheetMonkey форма створена, endpoint `https://api.sheetmonkey.io/form/7rZdQTZaKGV2mDRu7CEJ6Y`.
- [x] Endpoint вписано в `content.json` (`rsvp.appsScriptUrl`) і в `publish/`.
- [x] Тестова відправка пройшла (HTTP 200, рядок ліг у таблицю).
- [ ] Видалити тестові рядки з таблиці перед розсилкою.
- Колонки: `name | attending (Так/Ні) | guests | notes | page | submittedAt`.
  Лічильники: прийдуть `=COUNTIF(B:B;"Так")`, гостей `=SUMIF(B:B;"Так";C:C)`.

### 3. Деплой (Netlify) — ЗРОБЛЕНО
- [x] Сайт задеплоєно, перейменовано на `vistochka.netlify.app`.
- [x] Оновлення сайту: `build-publish.ps1` -> Deploys -> перетягнути `publish/`.

### 4. Домен + бренд — ЗРОБЛЕНО
- [x] Бренд «Вісточка»; кореневий лендинг + `<title>`.
- [x] Зареєстровано і активовано безкоштовний `vistochka.pp.ua` (nic.ua, NS NIC.UA).
- [x] DNS: `A @ -> 75.2.60.5`, `A www -> 75.2.60.5`. Домен доданий у Netlify.
- [x] SSL (Let's Encrypt) видано. Живі адреси:
      `https://vistochka.pp.ua/` (бренд), `https://vistochka.pp.ua/mykhailo-olena/` (запрошення).
- [ ] Скасувати 2 дублі-замовлення на «Парковий NS» у nic.ua.
- [ ] (Опц.) знизити TTL до 3600.

### 5. Фінальна перевірка перед розсилкою
- [ ] Відкрити на телефоні і десктопі.
- [ ] Відлік цокає, дата правильна.
- [ ] RSVP: тестова відповідь доходить у таблицю.
- [ ] Галерея (клік -> lightbox), музика, кнопки «Побудувати маршрут».
- [ ] Усі тексти і фото фінальні, без плейсхолдерів.
- [ ] Поділитися лінком з гостями.

---

## Робочий цикл оновлення (коли треба щось змінити)

1. Відкрити `editor.html` через локальний сервер, змінити поля.
2. «Завантажити content.json», покласти в корінь (і нові фото в `assets/img/`).
3. Запустити `build-publish.ps1`.
4. Перетягнути оновлену папку `publish/` у Netlify (Deploys -> drag-and-drop).

Локальний сервер для редактора: `python -m http.server 5599` у папці проєкту,
далі `http://localhost:5599/editor.html`.

---

## Полірування — ЗРОБЛЕНО

- [x] OG/Twitter прев'ю при шері: `build-publish.ps1` вшиває per-event теги (title, опис,
      URL, фото=hero) у кожну подію. Дефолти бренду на корені.
- [x] Favicon `/favicon.svg` (монограма-конверт), статичний для всіх сторінок.
- [x] Асиметрична галерея: друге фото висока «вертикаль» по центру (desktop).

## Студія (локальна адмінка) — ЗРОБЛЕНО

- [x] `studio.html` + `js/studio.js`: один інтерфейс на все (File System Access API, Chrome/Edge).
- [x] Події: список, створити/вибрати/видалити, збереження `content.json` прямо в теку.
- [x] Фото через UI з авто-стисненням → пишуться в `/<slug>/assets/img/`.
- [x] Дизайн: шрифти (Google Fonts) + кольори → пишуться в `css/tokens.css`; шрифти
      централізовано через `@import` у tokens.css.
- [x] Збірка `publish/` у браузері (копія + OG-інжект), без PowerShell.
- [x] Студія і редактор виключені з `publish/` (на живий сайт не йдуть).
- [ ] Протестувати FS-операції у Chrome (вибір папки, збереження, фото, дизайн, build).

## GitHub + авто-деплой — ЗРОБЛЕНО

- [x] Окремий приватний репозиторій `Cheburla/vistochka` (особистий акаунт, не робочий).
- [x] `.gitignore` (ігнор `publish/`), перший коміт, push через GitHub Desktop.
- [x] Кросплатформний білд `build.mjs` + `netlify.toml` (Node 20).
- [x] Netlify continuous deployment з репо: push -> `node build.mjs` -> deploy.
- [x] Перевірено на проді: OG, favicon, _headers, шрифти; дев-файли 404.
- Новий цикл: Студія (зберегти) -> GitHub Desktop (commit + push) -> Netlify сам деплоїть.

## Беклог / опційне (необов'язкове, на потім)

- [ ] Вбудована Google-мапа під фото локації (зараз тільки кнопка маршруту, за дизайном).
- [ ] Перемикач мов UA/EN.
- [ ] Блок «Список бажань» / подарунки.
- [ ] «2nd try» у Claude Design, якщо захочеться інший візуал (re-skin дешевий: тільки
      `tokens.css` + `sections.css`).

---

## Карта файлів (швидка довідка)

- `index.html` універсальний рендерер-шаблон (копіюється в кожну теку події); `/` = лендинг.
- `/<slug>/` тека події: свій `index.html` + `content.json` + `assets/`. URL = `/<slug>/`.
- `content.sample.json` шаблон-seed для нової події (плейсхолдери, порожній endpoint).
- `editor.html` + `js/editor.js` редактор контенту (поле slug -> «Завантажити подію»).
- `css/tokens.css` кольори/шрифти; `css/sections.css` вигляд секцій.
- `js/render.js` збірка DOM; `js/boot.js` вибір контенту за URL/slug; `countdown/reveal/gallery/music/rsvp.js` механіка.
- `apps-script/Code.gs` запасний варіант RSVP через Google Apps Script (якщо не SheetMonkey).
- `design/1st try/` handoff із Claude Design (DESIGN.md, code.html, screen.png).
- `new-event.ps1` створює нову подію; `build-publish.ps1` збирає `publish/` (усі події + спільне).
- `publish/` готова до заливки на Netlify папка.
