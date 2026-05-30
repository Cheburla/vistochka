# Roadmap: деплой через апрув + перехід на Cloudflare Pages

Статус: заплановано (робимо іншим днем). Причина: Netlify рахує кредити за КОЖЕН білд,
а Студія комітить на кожну дію, тож 300 кредитів/міс вичерпуються швидко.

Дві незалежні задачі. Фаза A критичніша (різко зменшує кількість білдів і працює
на будь-якому хостингу). Фаза B прибирає систему кредитів узагалі.

---

## Фаза A. Деплой лише після апрува (decouple edit from deploy)

Мета: правки в адмінці НЕ запускають живий деплой. Деплоїть тільки кнопка
"Опублікувати". Багато правок -> один білд.

### Механіка (через гілки Git)
- Студія пише все (контент, фото, аудіо, дизайн, site.json, створення/видалення подій)
  у робочу гілку `draft`, а НЕ в `main`.
- Хостинг (Netlify або Cloudflare) збирає ТІЛЬКИ `main` (production). Гілку `draft` не будує.
- Кнопка "Опублікувати" в адмінці зливає `draft` -> `main` одним комітом -> один білд -> лайв.
- Адмінка читає/показує превʼю з `draft`, тож завжди бачиш робочу версію до публікації.

### Зміни в `vistochka-admin/server.mjs`
- Додати env: `WORK_BRANCH=draft`, лишити `GITHUB_BRANCH=main` як production.
- Усі `getFile/putFile/listEvents/createEvent/deleteEvent` -> працюють з `WORK_BRANCH`.
- На першому записі: якщо гілки `draft` нема, створити її з `main`
  (`POST /git/refs` з `ref=refs/heads/draft`, sha = head main).
- Новий роут `POST /api/publish`: merge draft -> main
  (`POST /repos/{owner}/{repo}/merges` body `{base:"main", head:"draft", commit_message:"Publish (Studio)"}`).
  Відповіді: 201 злито, 204 нема чого зливати, 409 конфлікт (не має статись, бо main
  міняється лише через цей merge).
- Новий роут `GET /api/status`: чи є неопубліковані зміни
  (`GET /repos/{owner}/{repo}/compare/main...draft` -> поле `ahead_by` > 0).

### Зміни в адмінці (клієнт `public/studio.js` + `index.html`)
- Кнопка "Опублікувати" у верхній панелі (поруч із "Зберегти подію").
- Індикатор "є неопубліковані зміни" (з `/api/status`), напр. крапка/лічильник.
- Підтвердження перед публікацією (як у видаленні).
- Локальна Студія (`wedding-invitation/js/studio.js`): вона пише файли напряму на диск
  і не деплоїть сама -> там апрув = ручний "Зібрати publish" + push. Можна лишити як є
  або додати окрему кнопку "Закомітити+опублікувати".

### Хостинг: вимкнути білд непродакшн-гілок
- Netlify: Site config -> Build & deploy -> Branches -> deploy only `main`.
- Cloudflare: Pages -> Settings -> Builds -> Branch control -> Production only.

---

## Фаза B. Перехід Netlify -> Cloudflare Pages

Мета: прибрати систему кредитів. Cloudflare Pages free: без кредитів,
необмежений трафік/запити, ~500 білдів/міс. Той самий репозиторій і домен.

### Кроки
1. Cloudflare акаунт -> Workers & Pages -> Create -> Pages -> Connect to Git ->
   обрати репозиторій `Cheburla/vistochka`.
2. Build settings:
   - Framework preset: None.
   - Build command: `node build.mjs`
   - Build output directory: `publish`
   - Production branch: `main`
   - Env vars: `SITE_URL=https://vistochka.pp.ua`, `NODE_VERSION=20`
3. Перший деплой пройде на `*.pages.dev`. Перевірити лендинг + подію + RSVP.
4. Custom domain: Pages -> Custom domains -> Add `vistochka.pp.ua`.
   Cloudflare дасть ціль (CNAME на `<project>.pages.dev` або A/AAAA).
5. DNS (NIC.UA / DRS, де зараз домен): замінити Netlify-запис (A 75.2.60.5)
   на ціль Cloudflare. Якщо домен перевести під Cloudflare DNS, прив'язка автоматична.
6. Дочекатись SSL (Cloudflare видає сам, кілька хвилин).
7. Коли Cloudflare працює на домені: вимкнути авто-деплой Netlify
   (або видалити Netlify-сайт), щоб не їло кредити.

### Сумісність (вже ОК)
- `_headers` (security headers) Cloudflare Pages підтримує так само, як Netlify.
- `_redirects` теж підтримується, якщо знадобиться.
- `netlify.toml` Cloudflare ігнорує -> налаштування білда вказуємо в дашборді (крок 2).
- `build.mjs` крос-платформний, читає `SITE_URL` з env -> працює.
- Адмінка не змінюється: комітить у той самий GitHub-репо. `SITE_URL` лишається
  `https://vistochka.pp.ua` (превʼю інлайнить JS/CSS з репо, фото беруться з домену).

### Без даунтайму
Тримати Netlify живим, поки Cloudflare не підтверджено на домені. Потім перемкнути DNS,
дочекатись, і лише тоді відключити Netlify.

---

## Поки не зробили (тимчасова економія кредитів Netlify)
- Редагувати пачкою, тиснути "Зберегти" один раз наприкінці.
- Не плодити тестові події (кожне створення/видалення = білд).
- Кредити Netlify обнуляються 29 червня.

## Порядок виконання
Спершу Фаза A (працює і на Netlify, одразу ріже білди), потім Фаза B (прибирає кредити).
Або одразу B, якщо хочемо просто позбутись Netlify, а A зробити вже на Cloudflare.
