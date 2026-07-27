# HOCFRONT-17 — требования заказчика к навигации и названиям

**Тикет:** HOCFRONT-17  
**Источник:** продуктовая реформа CEO (`docs/ceo-reform-epics-tasks-to-mid-august.md`), задачи TASK-01-04, TASK-02-02, смежные EPIC-02 / EPIC-07 / EPIC-09  
**Дата фиксации:** 24 июля 2026

> Если появится отдельный бриф заказчика (чат / письмо / Figma) — дописать сюда как §0 «Первичный бриф» и не терять исходный текст.

---

## 0. Формулировка тикета HOCFRONT-17

Переименовать разделы по требованиям заказчика, добавить точку входа уведомлений (даже если логика уведомлений — mock). Синхронизировать desktop top bar и mobile bottom/side nav.

**Соответствие плану:** TASK-02-02 — «Обновить верхнюю навигацию».

---

## 1. Все требования заказчика (навигация / IA / названия)

Ниже — полный срез продуктовых решений, влияющих на меню, labels и точки входа. Нужен как справочник на будущие задачи (не только HOCFRONT-17).

### 1.1. Структура продукта (IA)

| Решение | Деталь |
|--------|--------|
| Главная | Первый экран после входа; профиль **не** стартовый |
| Профиль | Перерабатывается в страницу игрока; календарь игрока — **внутри** профиля, не top-level раздел |
| SOS / IQ / Highlight | Скрыть из MVP-навигации; код и маршруты **не удалять** |
| Календарь | Не отдельный главный раздел в целевой IA — внутри игрока / команды / клуба |
| Кабинет клуба | Точка входа для `club_admin` (профиль команды / меню) |
| Кабинет организатора | Внутри «Игры и тренировки»; для `club_admin` — также из кабинета клуба |
| Избранное | На карточках сущностей + общий список в профиле + быстрый доступ в правой панели |
| Уведомления | Точка входа в навигации обязательна; production-пуши / realtime — **вне** горизонта до 15 августа (mock ок) |

### 1.2. Утверждённые названия разделов (TASK-01-04)

| Было | Desktop / page title | Mobile label | Примечание |
|------|----------------------|--------------|------------|
| «События» | **Игры и тренировки** | **Тренировки** | Единые подписи: desktop nav, mobile nav, breadcrumbs, page titles |
| «Аренда льда» | **Ледовые арены** | **Ледовые арены** | Обновить nav, карточки, поиск |

Зафиксировать единые подписи для:

- desktop top bar;
- mobile bottom nav;
- mobile side nav (если есть);
- breadcrumbs;
- заголовки страниц.

### 1.3. Навигация MVP (TASK-02-02 + TASK-01-05)

1. Применить переименования из §1.2.
2. Убрать из меню пункты SOS / IQ / Highlight (уже отдельный тикет HOCFRONT-15).
3. Добавить / сохранить **видимую** точку входа в **Уведомления** (mock-логика допустима).
4. **Синхронизировать** desktop top bar и mobile bottom/side nav: одни и те же смысловые разделы, согласованные labels (mobile может быть короче — см. «Тренировки»).

### 1.4. Смежные требования (не scope HOCFRONT-17, но не ломать)

| Тема | Требование | Тикет / задача |
|------|------------|----------------|
| Стартовый экран | Root / post-login → Главная | TASK-02-01 |
| Визуал labels | Жирность / шрифты / градиенты на ключевых экранах | TASK-02-03 |
| Список событий | Убрать матч-центр и прошедшие из основного списка; фильтры; страница тренировки | EPIC-07 / TASK-05-* |
| Арены | Карточки, карта/геоблок (Москва и МО), кабинет льда позже | EPIC-09 / TASK-06-* |
| Мессенджер | Доступен из основной навигации и mobile bottom nav | SRS / существующий контур |

### 1.5. Явно не входит (после 15 августа)

- Production-уведомления (push, realtime, email/MAX delivery).
- Удаление кода SOS / IQ / Highlight.

---

## 2. Требования по переименованию для текущей задачи (HOCFRONT-17)

**Scope переименований в рамках HOCFRONT-17** — только UI-подписи навигации и согласованность каналов меню. Маршруты (`/events`, `/arenas`, …) менять не обязательно.

### 2.1. Матрица rename

| Раздел (route) | Старое имя | Desktop label | Mobile label | Где обновить |
|----------------|------------|---------------|--------------|--------------|
| `/events` | События | Игры и тренировки | Тренировки | top bar, bottom nav, side nav, breadcrumbs, page title |
| `/arenas` | Аренда льда | Ледовые арены | Ледовые арены | top bar, bottom nav, side nav, breadcrumbs, page title |

### 2.2. Дополнительно к rename в том же тикете (не rename, но обязательный scope)

| # | Требование | Критерий |
|---|------------|----------|
| 1 | Точка входа «Уведомления» | Общий header top bar (`NotificationsBellLink` / `app-shell-link-notifications`) на **desktop и mobile**. Не дублируется в side nav / bottom bar / sheet «Ещё» — осознанный UX (колокольчик всегда в шапке). |
| 2 | Mock notifications | Достаточно существующего `/notifications` + mock; не нужны реальные пуши |
| 3 | Sync desktop ↔ mobile | Нет расхождения: один раздел — разные или одинаковые labels только там, где явно задано (events: длинное / короткое) |
| 4 | SOS / IQ / Highlight | Не показывать в меню (если ещё не закрыто — не возвращать) |

### 2.3. Вне scope переименования в HOCFRONT-17

- Перенос календаря внутрь профиля / команды (IA).
- Переименование «Маркет» / «Чат» vs «Мессенджер» — в TASK-01-04 **не** утверждено; не менять без отдельного решения PM.
- Контент страниц «Игры и тренировки» / «Ледовые арены» (фильтры, карта) — следующие эпики.

### 2.4. Definition of Done (rename + sync)

- [ ] Desktop: «Игры и тренировки», «Ледовые арены»
- [ ] Mobile: «Тренировки» (events), «Ледовые арены» (arenas)
- [ ] Breadcrumbs / page titles согласованы с desktop labels (или с page-title константами)
- [ ] «Уведомления» доступны из desktop и mobile через общий header-колокольчик (не через bottom/side nav)
- [ ] Desktop top bar и mobile bottom/side nav синхронизированы по составу MVP-пунктов
- [ ] Нет регрессии: маршруты открываются по прежним URL

---

## 3. Заметки по текущему коду (после HOCFRONT-17)

Реализовано в `feature/HOCFRONT-17`:

- Lottie: `notification-bell.json` — [Notification Bell Animation](https://lottiefiles.com/animations/notification-bell-animation-FH1bsbRMdY) (Tim John, LottieFiles)
- Единый `PLAYER_NAV_ITEMS` → desktop left nav + mobile bottom (subset, тот же порядок)
- `Уведомления` только в shared header (`app-shell__notify` / `NotificationsBellLink`), не в side/bottom nav — DoD §2.2/§2.4 трактует header как точку входа на обеих платформах
- SOS / IQ / Highlight скрыты из меню и из default Favorites (`DEFAULT_FAVORITE_IDS` без `sos`; preset без sos/iq/highlights)
- Mobile «Ещё» включает календарь (`routes.calendar`) — sync с desktop MVP
- Избранное: «Аренда льда» / «Мои события» → `ARENAS_LABEL` / `EVENTS_LABEL`

### 3.1. Dependency notes (review PR-41)

- **react-router:** `react-router-dom@^7.18.1` + `overrides.react-router@8.3.0` — временный cross-major pin ради CVE high в runtime. Отдельного `react-router-dom@8` на npm нет (v8 = unified `react-router` с `./dom`). Follow-up: миграция импортов на `react-router@8` и снятие override.
- **npm audit CI:** hard-gate = `npm audit --audit-level=high --omit=dev` (runtime). Полный audit (включая eslint/minimatch toolchain) — warning / `continue-on-error`; global `minimatch@10` override ломает `eslint-plugin-jsx-a11y`.

Тесты: `frontend/src/test/hocfront-17-nav.spec.ts`, `hocfront-17-notifications-entry.spec.tsx`, `mvp-nav-hide.spec.ts`
