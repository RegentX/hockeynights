# Этап 6. План разработки и Requirements Traceability Matrix

## Принципы оценки

- `[S]` - небольшая задача: 0.5-1 день.
- `[M]` - средняя задача: 1-3 дня.
- `[L]` - крупная задача: 3-5 дней.
- `[XL]` - эпик или интеграционный блок: требует декомпозиции перед разработкой.

Статусы в RTM:

- `Planned` - задача запланирована.
- `Blocked` - зависит от внешнего решения или контракта.
- `Post-MVP` - не входит в первую поставку.

## Phase 0. Подготовка проекта и контрактов

- [x] `[M]` Задача `TASK-00`: Инициализировать frontend-проект `React + TypeScript + Vite + Gravity UI` (`SPEC-FR-1.2.2`, `SPEC-FR-12.1.1`, `SPEC-FR-12.1.3`) - оценка M. Зависимости: нет.
- [x] `[S]` Задача `TASK-01`: Описать общие TypeScript-типы домена из SRS (`SPEC-FR-2.1.1`, `SPEC-FR-2.1.2`, `SPEC-FR-2.2.1`, `SPEC-FR-2.2.2`, `SPEC-FR-2.2.3`, `SPEC-FR-3.1.1`, `SPEC-FR-3.2.1`, `SPEC-FR-4.1.1`, `SPEC-FR-4.1.2`, `SPEC-FR-5.1.1`, `SPEC-FR-6.1.1`, `SPEC-FR-6.2.1`, `SPEC-FR-6.3.2`, `SPEC-FR-7.1.1`, `SPEC-FR-7.2.2`, `SPEC-FR-8.1.1`, `SPEC-FR-9.1.1`, `SPEC-FR-10.1.1`, `SPEC-FR-11.2.2`, `SPEC-FR-12.1.2`) - оценка S. Зависимости: `TASK-00`.
- [x] `[S]` Задача `TASK-02`: Создать единый `api client` и слой переключения mock/real API (`SPEC-FR-1.2.3`, `SPEC-FR-12.1.1`, `SPEC-FR-12.1.3`) - оценка S. Зависимости: `TASK-00`, `TASK-01`.
- [x] `[S]` Задача `TASK-03`: Настроить маршрутизацию и базовый layout приложения (`SPEC-FR-1.2.1`, `SPEC-FR-1.2.4`) - оценка S. Зависимости: `TASK-00`.

## Phase 1. Frontend + MSW моки

### 1.1 Auth & Onboarding

- [x] `[S]` Задача `TASK-FE-01`: Создать экран mock-входа и выбора ролей (`SPEC-FR-2.1.1`, `SPEC-FR-2.1.2`, `SPEC-FR-1.3.1`, `SPEC-FR-1.3.2`, `SPEC-FR-1.3.3`, `SPEC-FR-1.3.4`) - оценка S. Зависимости: `TASK-03`.
- [x] `[S]` Задача `TASK-MOCK-01`: Настроить MSW моки для `GET /mock-api/v1/session` и `POST /mock-api/v1/onboarding` (`SPEC-FR-2.1.1`, `SPEC-FR-2.1.2`, `SPEC-FR-2.1.3`) - оценка S. Зависимости: `TASK-02`.

### 1.2 Hockey ID и игроки

- [x] `[M]` Задача `TASK-FE-02`: Создать экран редактирования `Hockey ID` (`SPEC-FR-2.2.1`, `SPEC-FR-2.2.2`, `SPEC-FR-2.2.3`, `SPEC-FR-2.2.4`) - оценка M. Зависимости: `TASK-FE-01`, `TASK-MOCK-01`.
- [x] `[S]` Задача `TASK-FE-03`: Создать компонент `PlayerCard` и список игроков (`SPEC-FR-2.3.1`) - оценка S. Зависимости: `TASK-FE-02`.
- [x] `[S]` Задача `TASK-FE-04`: Создать фильтры игроков по амплуа, уровню, району и роли вратаря (`SPEC-FR-2.3.2`) - оценка S. Зависимости: `TASK-FE-03`.
- [x] `[M]` Задача `TASK-MOCK-02`: Настроить MSW моки для `GET /profile/me`, `PUT /profile/me`, `GET /players` (`SPEC-FR-2.2.1`, `SPEC-FR-2.2.2`, `SPEC-FR-2.2.3`, `SPEC-FR-2.2.4`, `SPEC-FR-2.3.1`, `SPEC-FR-2.3.2`) - оценка M. Зависимости: `TASK-01`, `TASK-02`.

### 1.3 Команды, roster и события

- [x] `[M]` Задача `TASK-FE-05`: Создать экран команды и форму создания команды (`SPEC-FR-3.1.1`, `SPEC-FR-3.1.2`) - оценка M. Зависимости: `TASK-FE-03`.
- [x] `[M]` Задача `TASK-FE-06`: Создать экран состава команды с изменением статусов участников (`SPEC-FR-3.2.1`, `SPEC-FR-3.2.2`) - оценка M. Зависимости: `TASK-FE-05`.
- [x] `[M]` Задача `TASK-FE-07`: Создать форму создания игры/тренировки (`SPEC-FR-4.1.1`, `SPEC-FR-4.1.2`) - оценка M. Зависимости: `TASK-FE-05`.
- [x] `[M]` Задача `TASK-FE-08`: Создать карточку события с отметкой посещаемости и агрегированным статусом (`SPEC-FR-3.3.1`, `SPEC-FR-3.3.2`) - оценка M. Зависимости: `TASK-FE-07`.
- [x] `[S]` Задача `TASK-FE-09`: Создать виджет дефицита состава по позициям (`SPEC-FR-4.3.1`, `SPEC-FR-4.3.2`) - оценка S. Зависимости: `TASK-FE-08`.
- [x] `[M]` Задача `TASK-FE-10`: Создать календарь пользователя с фильтрами (`SPEC-FR-4.2.1`, `SPEC-FR-4.2.2`) - оценка M. Зависимости: `TASK-FE-07`, `TASK-MOCK-03`.
- [x] `[M]` Задача `TASK-MOCK-03`: Настроить MSW моки для команд, roster, событий, посещаемости, календаря и дефицита состава (`SPEC-FR-3.1.1`, `SPEC-FR-3.1.2`, `SPEC-FR-3.2.1`, `SPEC-FR-3.2.2`, `SPEC-FR-3.3.1`, `SPEC-FR-3.3.2`, `SPEC-FR-4.1.1`, `SPEC-FR-4.1.2`, `SPEC-FR-4.2.1`, `SPEC-FR-4.2.2`, `SPEC-FR-4.3.1`, `SPEC-FR-4.3.2`) - оценка M. Зависимости: `TASK-MOCK-02`.

### 1.4 Goalkeeper SOS

- [x] `[M]` Задача `TASK-FE-11`: Создать форму запуска запроса добора и `Goalkeeper SOS` (`SPEC-FR-5.1.1`, `SPEC-FR-5.1.2`, `SPEC-FR-5.1.3`) - оценка M. Зависимости: `TASK-FE-09`.
- [x] `[M]` Задача `TASK-FE-12`: Создать список релевантных SOS-запросов и сценарий отклика (`SPEC-FR-5.2.1`, `SPEC-FR-5.2.2`) - оценка M. Зависимости: `TASK-FE-11`.
- [x] `[S]` Задача `TASK-FE-13`: Создать UI подтверждения или отклонения отклика капитаном (`SPEC-FR-5.2.3`) - оценка S. Зависимости: `TASK-FE-12`.
- [x] `[M]` Задача `TASK-MOCK-04`: Настроить MSW моки для recruitment requests и responses (`SPEC-FR-5.1.1`, `SPEC-FR-5.1.2`, `SPEC-FR-5.1.3`, `SPEC-FR-5.2.1`, `SPEC-FR-5.2.2`, `SPEC-FR-5.2.3`) - оценка M. Зависимости: `TASK-MOCK-03`.

### 1.5 Ice Finder

- [x] `[M]` Задача `TASK-FE-14`: Создать страницу списка и карты ледовых арен Москвы (`SPEC-FR-6.1.1`) - оценка M. Зависимости: `TASK-03`.
- [x] `[S]` Задача `TASK-FE-15`: Создать фильтры арен по району, метро, удобствам и mock-слотам (`SPEC-FR-6.1.2`) - оценка S. Зависимости: `TASK-FE-14`.
- [x] `[S]` Задача `TASK-FE-16`: Создать компонент `RinkCard` / `ArenaCard` с адресом, контактами, удобствами, ценой и внешней кнопкой записи (`SPEC-FR-6.2.1`, `SPEC-FR-6.2.2`) - оценка S. Зависимости: `TASK-FE-14`.
- [x] `[S]` Задача `TASK-FE-17`: Создать блок mock-слотов льда с source/freshness labels (`SPEC-FR-6.3.1`, `SPEC-FR-6.3.2`) - оценка S. Зависимости: `TASK-FE-16`.
- [x] `[M]` Задача `TASK-MOCK-05`: Настроить MSW моки для `GET /arenas`, `GET /arenas/{arenaId}`, `GET /arenas/{arenaId}/slots` (`SPEC-FR-6.1.1`, `SPEC-FR-6.1.2`, `SPEC-FR-6.2.1`, `SPEC-FR-6.2.2`, `SPEC-FR-6.3.1`, `SPEC-FR-6.3.2`) - оценка M. Зависимости: `TASK-01`, `TASK-02`.

### 1.6 Лиги

- [x] `[M]` Задача `TASK-FE-18`: Создать страницу списка лиг и карточку лиги (`SPEC-FR-7.1.1`, `SPEC-FR-7.1.2`) - оценка M. Зависимости: `TASK-03`.
- [x] `[M]` Задача `TASK-FE-19`: Создать отображение расписания, таблицы и статуса источника данных лиги (`SPEC-FR-7.2.1`, `SPEC-FR-7.2.2`) - оценка M. Зависимости: `TASK-FE-18`.
- [x] `[M]` Задача `TASK-MOCK-06`: Настроить MSW моки для `GET /leagues`, `/leagues/{id}`, `/standings`, `/schedule` (`SPEC-FR-7.1.1`, `SPEC-FR-7.1.2`, `SPEC-FR-7.2.1`, `SPEC-FR-7.2.2`) - оценка M. Зависимости: `TASK-01`, `TASK-02`.

### 1.7 Feedback, karma и уведомления

- [x] `[M]` Задача `TASK-FE-20`: Создать post-game feedback форму (`SPEC-FR-8.1.1`, `SPEC-FR-8.1.2`) - оценка M. Зависимости: `TASK-FE-08`.
- [x] `[S]` Задача `TASK-FE-21`: Создать отображение `karmaScore` на карточках игроков и профиле (`SPEC-FR-8.2.1`, `SPEC-FR-8.2.2`) - оценка S. Зависимости: `TASK-FE-03`, `TASK-FE-20`.
- [x] `[M]` Задача `TASK-FE-22`: Создать центр in-app уведомлений и действие `mark as read` (`SPEC-FR-10.1.1`, `SPEC-FR-10.1.2`) - оценка M. Зависимости: `TASK-MOCK-08`.
- [x] `[M]` Задача `TASK-MOCK-07`: Настроить MSW моки для feedback и karma (`SPEC-FR-8.1.1`, `SPEC-FR-8.1.2`, `SPEC-FR-8.2.1`, `SPEC-FR-8.2.2`) - оценка M. Зависимости: `TASK-MOCK-03`.
- [x] `[S]` Задача `TASK-MOCK-08`: Настроить MSW моки для notifications (`SPEC-FR-10.1.1`, `SPEC-FR-10.1.2`) - оценка S. Зависимости: `TASK-MOCK-04`.

### 1.8 Магазины и admin prototype

- [x] `[M]` Задача `TASK-FE-23`: Создать страницу магазинов и карточку магазина (`SPEC-FR-9.1.1`, `SPEC-FR-9.1.2`) - оценка M. Зависимости: `TASK-03`.
- [x] `[S]` Задача `TASK-FE-24`: Создать список товарных предложений с ценой, наличием и внешним переходом (`SPEC-FR-9.2.1`, `SPEC-FR-9.2.2`) - оценка S. Зависимости: `TASK-FE-23`.
- [x] `[M]` Задача `TASK-FE-25`: Создать admin prototype для ручного управления аренами, лигами, магазинами и видимостью (`SPEC-FR-11.1.1`, `SPEC-FR-11.1.2`) - оценка M. Зависимости: `TASK-FE-14`, `TASK-FE-18`, `TASK-FE-23`.
- [x] `[S]` Задача `TASK-FE-26`: Создать экран статусов источников данных (`SPEC-FR-11.2.1`, `SPEC-FR-11.2.2`) - оценка S. Зависимости: `TASK-FE-25`.
- [x] `[M]` Задача `TASK-MOCK-09`: Настроить MSW моки для shops, product offers, admin entities и sources (`SPEC-FR-9.1.1`, `SPEC-FR-9.1.2`, `SPEC-FR-9.2.1`, `SPEC-FR-9.2.2`, `SPEC-FR-11.1.1`, `SPEC-FR-11.1.2`, `SPEC-FR-11.2.1`, `SPEC-FR-11.2.2`) - оценка M. Зависимости: `TASK-01`, `TASK-02`.

### 1.11 Дизайн-система и хоккейный UX (SPEC-UI)

- [x] `[M]` Задача `TASK-UI-01`: Ввести design tokens и темы `Ice & Energy` / `Locker Room` поверх Gravity UI (`SPEC-UI-4.1`, `SPEC-UI-4.2`, `SPEC-FR-1.2.2`) - оценка M. Зависимости: `TASK-00`.
- [x] `[S]` Задача `TASK-UI-02`: Создать `HockeyButton` / шайба-CTA и SOS-кнопку «красная лампа» (`SPEC-UI-1.1`, `SPEC-UI-1.2`) - оценка S. Зависимости: `TASK-UI-01`.
- [x] `[S]` Задача `TASK-UI-03`: Создать `IceCard` — ледовая плитка для карточек (`SPEC-UI-1.3`) - оценка S. Зависимости: `TASK-UI-01`.
- [x] `[S]` Задача `TASK-UI-04`: Создать `PositionLabel` — нашивки амплуа (`SPEC-UI-1.4`) - оценка S. Зависимости: `TASK-UI-01`.
- [x] `[M]` Задача `TASK-UI-05`: Редизайн `PlayerCard` как hockey card (`SPEC-UI-2.1`, `SPEC-FR-2.3.1`, `SPEC-FR-8.2.1`) - оценка M. Зависимости: `TASK-FE-03`, `TASK-UI-03`, `TASK-UI-04`.
- [x] `[M]` Задача `TASK-UI-06`: Стилизовать `TeamsPage` / `TeamRoster` под раздевалку со шевроном (`SPEC-UI-2.3`, `SPEC-FR-3.2.1`) - оценка M. Зависимости: `TASK-FE-06`, `TASK-UI-03`.
- [x] `[M]` Задача `TASK-UI-07`: Перестроить `EventsPage` / `SosFeed` в формат матч-центра (`SPEC-UI-2.5`, `SPEC-FR-4.1.1`, `SPEC-FR-5.2.1`) - оценка M. Зависимости: `TASK-FE-08`, `TASK-FE-12`.
- [x] `[M]` Задача `TASK-UI-08`: Стилизовать `CalendarPage` как табло расписания (`SPEC-UI-2.6`, `SPEC-FR-4.2.1`) - оценка M. Зависимости: `TASK-FE-10`, `TASK-UI-05`.
- [x] `[S]` Задача `TASK-UI-09`: Создать `ScoreboardLoader` и empty states «пустая сетка» (`SPEC-UI-3.1`, `SPEC-UI-3.2`, `SPEC-UI-3.3`, `SPEC-NFR-10`) - оценка S. Зависимости: `TASK-UI-01`.
- [x] `[M]` Задача `TASK-UI-10`: Адаптивный layout desktop 3-col + mobile bottom nav / SOS FAB (`SPEC-UI-5.1`, `SPEC-UI-5.2`, `SPEC-FR-1.2.1`) - оценка M. Зависимости: `TASK-03`, `TASK-UI-02`.
- [x] `[S]` Задача `TASK-UI-11`: Motion: индикатор-шайба в навигации, `prefers-reduced-motion` (`SPEC-UI-4.3`, `SPEC-UI-5.3`) - оценка S. Зависимости: `TASK-UI-10`.
- [x] `[S]` Задача `TASK-QA-03`: Smoke/a11y-проверки тем и контраста для `SPEC-UI-5.4` - оценка S. Зависимости: `TASK-UI-01`–`TASK-UI-11`.
- [x] `[M]` Задача `TASK-UI-12`: Табло турнирной таблицы и матч-центр расписания лиг (`SPEC-UI-2.7`, `SPEC-UI-2.8`, `SPEC-FR-7.2.1`) - оценка M. Зависимости: `TASK-FE-19`, `TASK-UI-03`, `TASK-UI-05`.

### 1.13 Иммерсивный UI и визуальные эффекты (Post-MVP/Polishing)

- [ ] `[L]` Задача `TASK-UI-13`: Реализовать Scroll-Driven Storytelling с использованием `GSAP ScrollTrigger` (`SPEC-UI-7.1`) - оценка L. Зависимости: `TASK-UI-11`.
- [ ] `[L]` Задача `TASK-UI-14`: Интегрировать 3D-якоря (Spline/Three.js) в Hero-блок и карточки арен (`SPEC-UI-7.2`) - оценка L. Зависимости: `TASK-UI-03`.
- [ ] `[M]` Задача `TASK-UI-15`: Рефакторинг дашбордов под Bento Grid layout (`SPEC-UI-7.3`) - оценка M. Зависимости: `TASK-UI-10`.
- [ ] `[S]` Задача `TASK-UI-16`: Подключить `Lenis` для плавного скролла и настроить анимацию Variable Fonts (`SPEC-UI-7.4`, `SPEC-UI-7.5`) - оценка S. Зависимости: `TASK-UI-01`.

### 1.14 Интегрированный мессенджер (Post-MVP/Social)

- [x] `[M]` Задача `TASK-FE-40`: Создать интерфейс мессенджера (список чатов, Telegram-like бабблы, glassmorphism) (`SPEC-UI-8.1`, `SPEC-FR-16.1.1`, `SPEC-FR-16.1.5`, `SPEC-FR-16.1.6`) - оценка M. Зависимости: `TASK-UI-15`. **Реализовано:** `MessengerPage.tsx`, `ChatBubble.tsx`, `hockey-ui.css`.
- [x] `[M]` Задача `TASK-FE-41`: Реализовать Actionable Messages (интерактивные карточки действий) (`SPEC-UI-8.2`, `SPEC-FR-16.1.3`, `SPEC-FR-16.1.4`) - оценка M. Зависимости: `TASK-FE-40`. **Реализовано:** `ActionableMessage` в `ChatBubble.tsx`.
- [x] `[M]` Задача `TASK-MOCK-14`: Настроить MSW для чатов, сообщений и системных уведомлений об активности (`SPEC-FR-16.1.1`, `SPEC-FR-16.1.2`, `SPEC-FR-16.1.3`) - оценка M. Зависимости: `TASK-01`, `TASK-02`. **Реализовано:** `mocks/handlers/messenger.ts`, `mocks/data/messenger.ts`.
- [x] `[S]` Задача `TASK-FE-42`: Сворачиваемые боковые панели и фокус-режим мессенджера (`SPEC-UI-5.5`, `SPEC-UI-5.6`, `SPEC-UI-8.3`, `SPEC-UI-8.4`) - оценка S. Зависимости: `TASK-FE-40`. **Реализовано:** `AppShell.tsx` (toggle left/right/focus), `hockey-ui.css` (grid collapse, borderless focus layout, unified 56px headers).
- [ ] `[M]` Задача `TASK-FE-43`: Добавить темы внутри чатов и каналы команды как Telegram-like topics/channels (`SPEC-FR-22.1.1`, `SPEC-FR-22.1.2`, `SPEC-UI-8.5`) - оценка M. Зависимости: `TASK-FE-40`, `TASK-MOCK-14`, `TASK-FE-60`.
- [ ] `[M]` Задача `TASK-MOCK-15`: Настроить MSW DTO для chat topics, team channels и role/lock states (`SPEC-FR-22.1.1`–`SPEC-FR-22.1.5`) - оценка M. Зависимости: `TASK-MOCK-14`, `TASK-MOCK-17`.

### 1.15 Profile Hub, подтверждение человека и подписки (Next-release)

- [ ] `[M]` Задача `TASK-FE-50`: Перестроить профиль как личный кабинет с разделами «О человеке», «Настройки», «Приватность», «Подписка» (`SPEC-FR-18.1.1`, `SPEC-FR-18.1.2`) - оценка M. Зависимости: `TASK-FE-02`, `TASK-UI-15`.
- [ ] `[M]` Задача `TASK-FE-51`: Создать mock-поток подтверждения человека и галочку рядом с аватаркой (`SPEC-FR-17.1.1`, `SPEC-FR-17.1.2`, `SPEC-FR-17.1.3`, `SPEC-FR-17.1.4`) - оценка M. Зависимости: `TASK-FE-50`, `TASK-MOCK-16`.
- [ ] `[S]` Задача `TASK-FE-52`: Добавить switch-настройки in-app/email/push/MAX/SOS/event reminders (`SPEC-FR-18.1.3`) - оценка S. Зависимости: `TASK-FE-50`.
- [ ] `[S]` Задача `TASK-FE-53`: Добавить mock-настройки приватности профиля и контактов (`SPEC-FR-18.1.4`, `SPEC-FR-18.1.5`, `SPEC-NFR-9`) - оценка S. Зависимости: `TASK-FE-50`.
- [ ] `[M]` Задача `TASK-FE-54`: Реализовать mock-модель подписки Free / Player Plus / Team Pro и upgrade/downgrade intent (`SPEC-FR-19.1.1`–`SPEC-FR-19.1.4`) - оценка M. Зависимости: `TASK-FE-50`.
- [ ] `[M]` Задача `TASK-MOCK-16`: Настроить MSW для verification, profile settings, privacy, notification preferences и subscription state (`SPEC-FR-17.1.1`–`SPEC-FR-19.1.4`) - оценка M. Зависимости: `TASK-MOCK-02`.

### 1.16 Advanced Team Ops и события команды (Next-release)

- [ ] `[M]` Задача `TASK-FE-60`: Ограничить добавление в команду зарегистрированными пользователями и добавить email invite для незарегистрированных (`SPEC-FR-21.1.1`, `SPEC-FR-21.1.2`) - оценка M. Зависимости: `TASK-FE-05`, `TASK-MOCK-17`.
- [ ] `[M]` Задача `TASK-FE-61`: Добавить роли команды: владелец, капитан, тренер, админ команды, игрок (`SPEC-FR-21.1.5`, `SPEC-FR-22.1.4`) - оценка M. Зависимости: `TASK-FE-06`, `TASK-FE-60`.
- [ ] `[M]` Задача `TASK-FE-62`: Привязать командные события к `teamId` и добавить фильтры «моя команда» / «все события» (`SPEC-FR-21.1.3`, `SPEC-FR-21.1.4`) - оценка M. Зависимости: `TASK-FE-07`, `TASK-FE-10`.
- [ ] `[L]` Задача `TASK-FE-63`: Добавить тренерскую раскладку тренировки по позициям и красным/белым (`SPEC-FR-21.1.6`, `SPEC-FR-21.1.7`) - оценка L. Зависимости: `TASK-FE-61`, `TASK-FE-62`.
- [ ] `[M]` Задача `TASK-MOCK-17`: Настроить MSW для registered-only team add, email invites, team roles и training lineup assignments (`SPEC-FR-21.1.1`–`SPEC-FR-21.1.7`) - оценка M. Зависимости: `TASK-MOCK-03`.

### 1.17 Store Catalog API mocks и граница кабинетов арен (Discovery/Post-MVP)

- [ ] `[M]` Задача `TASK-MOCK-18`: Расширить магазинные моки до partner API каталога: цены, наличие, категории и состояния sync/stale/partial/failed (`SPEC-FR-20.1.1`, `SPEC-FR-20.1.2`) - оценка M. Зависимости: `TASK-MOCK-09`.
- [ ] `[S]` Задача `TASK-FE-70`: Отобразить source state каталога магазина и fallback для пустого/ошибочного feed (`SPEC-FR-20.1.1`, `SPEC-FR-20.1.2`, `SPEC-NFR-10`) - оценка S. Зависимости: `TASK-FE-23`, `TASK-MOCK-18`.
- [ ] `[XL]` Задача `TASK-DISC-01`: Описать отдельный проект цифровизации личных кабинетов ледовых площадок и adapter contract без реализации в текущем MVP (`SPEC-FR-20.1.3`, `SPEC-FR-20.1.4`) - оценка XL. Зависимости: партнерские переговоры с площадками.

### 1.12 Возвращающие сценарии next-release

- [x] `[M]` Задача `TASK-FE-30`: Создать экран `Hockey IQ` с каталогом тестов, прохождением попытки и результатом (`SPEC-FR-13.1.1`, `SPEC-FR-13.1.2`, `SPEC-UI-6.1`) - оценка M. Зависимости: `TASK-03`, `TASK-UI-03`.
- [x] `[S]` Задача `TASK-FE-31`: Создать leaderboard `Hockey IQ` (`SPEC-FR-13.1.3`, `SPEC-UI-6.2`) - оценка S. Зависимости: `TASK-FE-30`.
- [x] `[M]` Задача `TASK-MOCK-11`: Настроить MSW и DTO для `/iq-tests`, `/iq-attempts`, `/iq-leaderboard` (`SPEC-FR-13.1.1`, `SPEC-FR-13.1.2`, `SPEC-FR-13.1.3`) - оценка M. Зависимости: `TASK-01`, `TASK-02`.
- [x] `[L]` Задача `TASK-FE-32`: Создать `Highlight Analysis` page с mock upload, preview и annotation layer (`SPEC-FR-14.1.1`, `SPEC-FR-14.1.2`, `SPEC-FR-14.1.4`, `SPEC-UI-6.3`, `SPEC-UI-6.4`) - оценка L. Зависимости: `TASK-FE-07`, `TASK-UI-03`.
- [x] `[M]` Задача `TASK-FE-33`: Создать комментарии капитана/тренера к моментам (`SPEC-FR-14.1.3`) - оценка M. Зависимости: `TASK-FE-32`.
- [x] `[M]` Задача `TASK-MOCK-12`: Настроить MSW и DTO для `/highlights`, annotations и comments (`SPEC-FR-14.1.1`–`SPEC-FR-14.1.4`) - оценка M. Зависимости: `TASK-01`, `TASK-02`.
- [x] `[M]` Задача `TASK-FE-34`: Создать `Ice Radar` page/widget с рекомендациями и переходами (`SPEC-FR-15.1.1`, `SPEC-FR-15.1.2`, `SPEC-FR-15.1.3`, `SPEC-UI-6.5`, `SPEC-UI-6.6`) - оценка M. Зависимости: `TASK-FE-08`, `TASK-FE-12`, `TASK-FE-17`.
- [x] `[S]` Задача `TASK-MOCK-13`: Настроить MSW для `/radar/recommendations` и action state (`SPEC-FR-15.1.1`, `SPEC-FR-15.1.2`, `SPEC-FR-15.1.3`) - оценка S. Зависимости: `TASK-MOCK-03`, `TASK-MOCK-04`, `TASK-MOCK-05`.
- [x] `[M]` Задача `TASK-QA-04`: Smoke-тесты `Hockey IQ`, `Highlight Analysis`, `Ice Radar` и трассировка новых SPEC (`SPEC-FR-13.1.1`–`SPEC-FR-15.1.3`, `SPEC-UI-6.1`–`SPEC-UI-6.6`) - оценка M. Зависимости: `TASK-FE-30`–`TASK-FE-34`, `TASK-MOCK-11`–`TASK-MOCK-13`.

### 1.10 Mock external flows (исправление мёртвых CTA)

- [x] `[M]` Задача `TASK-FE-27`: Создать `MockExternalFlowDialog` и `ExternalBookingButton` для записи на лёд (`SPEC-FR-6.4.1`, `SPEC-FR-6.4.2`, `SPEC-FR-6.2.2`) - оценка M. Зависимости: `TASK-FE-16`, `TASK-FE-17`.
- [x] `[S]` Задача `TASK-FE-28`: Создать mock-checkout и mock-портал магазина (`SPEC-FR-9.1.3`, `SPEC-FR-9.2.3`) - оценка S. Зависимости: `TASK-FE-23`, `TASK-FE-24`.
- [x] `[S]` Задача `TASK-FE-29`: Создать mock-портал лиги (`SPEC-FR-7.1.3`) - оценка S. Зависимости: `TASK-FE-18`.
- [x] `[S]` Задача `TASK-MOCK-10`: Настроить MSW для `POST /ice-booking-requests` и `POST /checkout-intents` (`SPEC-FR-6.4.2`, `SPEC-FR-9.2.3`) - оценка S. Зависимости: `TASK-MOCK-05`, `TASK-MOCK-09`.

### 1.9 Frontend QA

- [x] `[M]` Задача `TASK-QA-01`: Написать smoke-тесты ключевых frontend-сценариев onboarding, profile, roster, SOS, arenas (`SPEC-FR-2.1.1`, `SPEC-FR-2.1.2`, `SPEC-FR-2.2.1`, `SPEC-FR-2.2.4`, `SPEC-FR-2.3.1`, `SPEC-FR-2.3.2`, `SPEC-FR-3.1.1`, `SPEC-FR-3.2.1`, `SPEC-FR-3.3.1`, `SPEC-FR-4.1.1`, `SPEC-FR-4.2.1`, `SPEC-FR-4.3.1`, `SPEC-FR-5.1.1`, `SPEC-FR-5.2.1`, `SPEC-FR-5.2.2`, `SPEC-FR-6.1.1`, `SPEC-FR-6.2.1`, `SPEC-FR-6.3.1`) - оценка M. Зависимости: `TASK-FE-01` - `TASK-FE-17`.
- [x] `[M]` Задача `TASK-QA-02`: Написать smoke-тесты лиг, магазинов, feedback, notifications и admin prototype (`SPEC-FR-7.1.1`, `SPEC-FR-7.1.2`, `SPEC-FR-7.2.1`, `SPEC-FR-7.2.2`, `SPEC-FR-8.1.1`, `SPEC-FR-8.2.1`, `SPEC-FR-9.1.1`, `SPEC-FR-9.2.1`, `SPEC-FR-10.1.1`, `SPEC-FR-10.1.2`, `SPEC-FR-11.1.1`, `SPEC-FR-11.1.2`, `SPEC-FR-11.2.1`, `SPEC-FR-11.2.2`) - оценка M. Зависимости: `TASK-FE-18` - `TASK-FE-26`.

## Phase 2. Backend и реальные API

- [ ] `[M]` Задача `TASK-BE-01`: Инициализировать backend-проект `Node.js + TypeScript` с versioned API `/api/v1` (`SPEC-FR-1.2.3`, `SPEC-FR-12.1.2`, `SPEC-FR-12.1.3`) - оценка M. Зависимости: завершение Phase 1 API contracts.
- [ ] `[L]` Задача `TASK-BE-02`: Реализовать модели данных и миграции для users, profiles, teams, events, arenas, leagues, shops, feedback, notifications (`SPEC-FR-2.1.1`, `SPEC-FR-2.1.2`, `SPEC-FR-2.2.1`, `SPEC-FR-2.2.2`, `SPEC-FR-2.2.3`, `SPEC-FR-2.3.1`, `SPEC-FR-3.1.1`, `SPEC-FR-3.1.2`, `SPEC-FR-3.2.1`, `SPEC-FR-3.2.2`, `SPEC-FR-3.3.1`, `SPEC-FR-4.1.1`, `SPEC-FR-4.1.2`, `SPEC-FR-4.2.1`, `SPEC-FR-4.3.1`, `SPEC-FR-5.1.1`, `SPEC-FR-5.2.2`, `SPEC-FR-6.1.1`, `SPEC-FR-6.2.1`, `SPEC-FR-6.3.1`, `SPEC-FR-7.1.1`, `SPEC-FR-7.2.1`, `SPEC-FR-8.1.1`, `SPEC-FR-8.2.1`, `SPEC-FR-9.1.1`, `SPEC-FR-9.2.1`, `SPEC-FR-10.1.1`, `SPEC-FR-11.1.1`, `SPEC-FR-11.2.2`) - оценка L. Зависимости: `TASK-BE-01`.
- [ ] `[M]` Задача `TASK-BE-03`: Реализовать auth/session API для Phase 2 (`SPEC-FR-2.1.1`, `SPEC-FR-2.1.2`, `SPEC-FR-2.1.3`) - оценка M. Зависимости: `TASK-BE-01`, `TASK-BE-02`.
- [ ] `[L]` Задача `TASK-BE-04`: Реализовать profile, players, teams, roster, events и calendar API (`SPEC-FR-2.2.1`, `SPEC-FR-2.2.2`, `SPEC-FR-2.2.3`, `SPEC-FR-2.2.4`, `SPEC-FR-2.3.1`, `SPEC-FR-2.3.2`, `SPEC-FR-3.1.1`, `SPEC-FR-3.1.2`, `SPEC-FR-3.2.1`, `SPEC-FR-3.2.2`, `SPEC-FR-3.3.1`, `SPEC-FR-3.3.2`, `SPEC-FR-4.1.1`, `SPEC-FR-4.1.2`, `SPEC-FR-4.2.1`, `SPEC-FR-4.2.2`, `SPEC-FR-4.3.1`, `SPEC-FR-4.3.2`) - оценка L. Зависимости: `TASK-BE-02`.
- [ ] `[M]` Задача `TASK-BE-05`: Реализовать recruitment/SOS API и нотификационные события (`SPEC-FR-5.1.1`, `SPEC-FR-5.1.2`, `SPEC-FR-5.1.3`, `SPEC-FR-5.2.1`, `SPEC-FR-5.2.2`, `SPEC-FR-5.2.3`, `SPEC-FR-10.1.1`) - оценка M. Зависимости: `TASK-BE-04`.
- [ ] `[L]` Задача `TASK-BE-06`: Реализовать arenas API и adapter layer для внешних источников льда (`SPEC-FR-6.1.1`, `SPEC-FR-6.1.2`, `SPEC-FR-6.2.1`, `SPEC-FR-6.2.2`, `SPEC-FR-6.3.1`, `SPEC-FR-6.3.2`, `SPEC-FR-11.2.1`, `SPEC-FR-11.2.2`) - оценка L. Зависимости: `TASK-BE-02`, партнерские решения по источникам.
- [ ] `[L]` Задача `TASK-BE-07`: Реализовать leagues API и import/manual pipeline для расписаний и таблиц (`SPEC-FR-7.1.1`, `SPEC-FR-7.1.2`, `SPEC-FR-7.2.1`, `SPEC-FR-7.2.2`, `SPEC-FR-11.2.1`, `SPEC-FR-11.2.2`) - оценка L. Зависимости: `TASK-BE-02`, юридическое решение по данным лиг.
- [ ] `[M]` Задача `TASK-BE-08`: Реализовать feedback и karma service (`SPEC-FR-8.1.1`, `SPEC-FR-8.1.2`, `SPEC-FR-8.2.1`, `SPEC-FR-8.2.2`) - оценка M. Зависимости: `TASK-BE-04`.
- [ ] `[M]` Задача `TASK-BE-09`: Реализовать shops/product offers API и partner feed/manual import (`SPEC-FR-9.1.1`, `SPEC-FR-9.1.2`, `SPEC-FR-9.2.1`, `SPEC-FR-9.2.2`) - оценка M. Зависимости: `TASK-BE-02`, партнерские решения по магазинам.
- [ ] `[M]` Задача `TASK-BE-10`: Реализовать notifications API и read-state (`SPEC-FR-10.1.1`, `SPEC-FR-10.1.2`) - оценка M. Зависимости: `TASK-BE-05`.
- [ ] `[M]` Задача `TASK-BE-11`: Реализовать admin API для справочников, visibility и source statuses (`SPEC-FR-11.1.1`, `SPEC-FR-11.1.2`, `SPEC-FR-11.2.1`, `SPEC-FR-11.2.2`) - оценка M. Зависимости: `TASK-BE-06`, `TASK-BE-07`, `TASK-BE-09`.
- [ ] `[M]` Задача `TASK-BE-12`: Переключить frontend с MSW на backend API через конфигурацию окружения (`SPEC-FR-1.2.3`, `SPEC-FR-12.1.1`, `SPEC-FR-12.1.2`, `SPEC-FR-12.1.3`) - оценка M. Зависимости: `TASK-BE-03` - `TASK-BE-11`.
- [ ] `[M]` Задача `TASK-BE-13`: Реализовать backend для `Hockey IQ` попыток, рейтинга и контентной модели вопросов (`SPEC-FR-13.1.1`, `SPEC-FR-13.1.2`, `SPEC-FR-13.1.3`) - оценка M. Зависимости: `TASK-BE-02`, `TASK-BE-03`.
- [ ] `[XL]` Задача `TASK-BE-14`: Спроектировать video storage/transcoding pipeline для `Highlight Analysis` (`SPEC-FR-14.1.1`–`SPEC-FR-14.1.4`) - оценка XL. Зависимости: юридическое решение по приватности видео, storage provider.
- [ ] `[L]` Задача `TASK-BE-15`: Реализовать ranking service для `Ice Radar` на основе событий, SOS, арен и профиля (`SPEC-FR-15.1.1`, `SPEC-FR-15.1.2`, `SPEC-FR-15.1.3`) - оценка L. Зависимости: `TASK-BE-04`, `TASK-BE-05`, `TASK-BE-06`.
- [ ] `[L]` Задача `TASK-BE-16`: Реализовать verification/profile settings/privacy backend без хранения чувствительных документов в публичном контуре (`SPEC-FR-17.1.1`–`SPEC-FR-18.1.5`, `SPEC-NFR-9`) - оценка L. Зависимости: `TASK-BE-03`, юридическая модель проверки.
- [ ] `[M]` Задача `TASK-BE-17`: Реализовать subscription entitlements API и подготовить billing integration boundary (`SPEC-FR-19.1.1`–`SPEC-FR-19.1.4`) - оценка M. Зависимости: `TASK-BE-03`, платежная модель.
- [ ] `[L]` Задача `TASK-BE-18`: Реализовать advanced team RBAC, email invites и training lineup API (`SPEC-FR-21.1.1`–`SPEC-FR-21.1.7`) - оценка L. Зависимости: `TASK-BE-04`, email provider.
- [ ] `[L]` Задача `TASK-BE-19`: Реализовать chat topics/channels, server-side ACL и notification routing (`SPEC-FR-22.1.1`–`SPEC-FR-22.1.5`, `SPEC-UI-8.5`) - оценка L. Зависимости: `TASK-BE-18`, chat service.

## Requirements Traceability Matrix

| SPEC-ID | Задача | Файл/компонент (предполагаемый) | Статус |
| :--- | :--- | :--- | :--- |
| `SPEC-FR-16.1.1` | `TASK-FE-40`, `TASK-MOCK-14` | `src/features/messenger/MessengerPage.tsx` | Done |
| `SPEC-FR-16.1.2` | `TASK-MOCK-14`, `TASK-FE-40` | `src/mocks/handlers/messenger.ts` | Done |
| `SPEC-FR-16.1.3` | `TASK-FE-41`, `TASK-MOCK-14` | `src/features/messenger/ChatBubble.tsx` | Done |
| `SPEC-FR-16.1.4` | `TASK-FE-41` | `src/features/messenger/ChatBubble.tsx` | Done |
| `SPEC-FR-16.1.5` | `TASK-FE-40` | `src/features/messenger/MessengerPage.tsx` | Done |
| `SPEC-FR-16.1.6` | `TASK-FE-40`, `TASK-FE-42` | `src/app/routes.tsx`, `src/app/MobileNav.tsx`, `src/app/AppShell.tsx` | Done |
| `SPEC-UI-8.1` | `TASK-FE-40` | `src/features/messenger/ChatBubble.tsx`, `src/shared/styles/hockey-ui.css` | Done |
| `SPEC-UI-8.2` | `TASK-FE-41` | `src/features/messenger/ChatBubble.tsx` | Done |
| `SPEC-UI-8.3` | `TASK-FE-42` | `src/shared/styles/hockey-ui.css` | Done |
| `SPEC-UI-8.4` | `TASK-FE-42` | `src/shared/styles/hockey-ui.css` | Done |
| `SPEC-UI-8.5` | `TASK-FE-43`, `TASK-MOCK-15`, `TASK-BE-19` | `src/features/messenger/ChatTopics.tsx` | Planned |
| `SPEC-UI-5.5` | `TASK-FE-42` | `src/app/AppShell.tsx`, `src/shared/styles/hockey-ui.css` | Done |
| `SPEC-UI-5.6` | `TASK-FE-42` | `src/app/AppShell.tsx` | Done |
| `SPEC-FR-1.1.1` | `TASK-QA-01`, `TASK-QA-02` | `docs/05-srs.md`, `tests/spec-traceability.spec.ts` | Planned |
| `SPEC-FR-1.2.1` | `TASK-03` | `src/app/AppShell.tsx`, `src/routes/index.tsx` | Planned |
| `SPEC-FR-1.2.2` | `TASK-00` | `package.json`, `src/main.tsx` | Planned |
| `SPEC-FR-1.2.3` | `TASK-02`, `TASK-BE-01`, `TASK-BE-12` | `src/shared/api/client.ts`, `backend/src/main.ts` | Planned |
| `SPEC-FR-1.2.4` | `TASK-03` | `src/app/navigation.ts`, `src/shared/config/geo.ts` | Planned |
| `SPEC-FR-1.3.1` | `TASK-FE-01` | `src/features/onboarding/RoleSelector.tsx` | Planned |
| `SPEC-FR-1.3.2` | `TASK-FE-01`, `TASK-FE-12` | `src/features/onboarding/RoleSelector.tsx`, `src/features/sos/SosFeed.tsx` | Planned |
| `SPEC-FR-1.3.3` | `TASK-FE-01`, `TASK-FE-05` | `src/features/onboarding/RoleSelector.tsx`, `src/features/teams/TeamCreateForm.tsx` | Planned |
| `SPEC-FR-1.3.4` | `TASK-FE-01`, `TASK-FE-07` | `src/features/onboarding/RoleSelector.tsx`, `src/features/events/EventCreateForm.tsx` | Planned |
| `SPEC-FR-1.3.5` | `TASK-FE-25`, `TASK-BE-11` | `src/features/admin/AdminDashboard.tsx`, `backend/src/admin/admin.controller.ts` | Planned |
| `SPEC-FR-2.1.1` | `TASK-FE-01`, `TASK-MOCK-01`, `TASK-BE-03` | `src/features/auth/MockLoginPage.tsx`, `src/mocks/handlers/session.ts`, `backend/src/auth/auth.controller.ts` | Planned |
| `SPEC-FR-2.1.2` | `TASK-FE-01`, `TASK-MOCK-01`, `TASK-BE-03` | `src/features/onboarding/RoleSelector.tsx`, `src/mocks/handlers/onboarding.ts` | Planned |
| `SPEC-FR-2.1.3` | `TASK-MOCK-01`, `TASK-BE-03` | `src/mocks/data/session.ts`, `backend/src/auth/session.service.ts` | Planned |
| `SPEC-FR-2.2.1` | `TASK-FE-02`, `TASK-MOCK-02`, `TASK-BE-04` | `src/features/profile/HockeyProfileForm.tsx`, `src/mocks/handlers/profile.ts`, `backend/src/profiles/profile.controller.ts` | Planned |
| `SPEC-FR-2.2.2` | `TASK-FE-02`, `TASK-MOCK-02`, `TASK-BE-04` | `src/entities/profile/types.ts`, `src/features/profile/HockeyProfileForm.tsx` | Planned |
| `SPEC-FR-2.2.3` | — | Снято: поля нет в UI и API-контракте | Cancelled |
| `SPEC-FR-2.2.4` | `TASK-FE-02`, `TASK-MOCK-02` | `src/features/profile/ProfileCompleteness.tsx` | Planned |
| `SPEC-FR-2.3.1` | `TASK-FE-03`, `TASK-MOCK-02`, `TASK-BE-04` | `src/features/players/PlayerCard.tsx`, `src/features/players/PlayersPage.tsx` | Planned |
| `SPEC-FR-2.3.2` | `TASK-FE-04`, `TASK-MOCK-02`, `TASK-BE-04` | `src/features/players/PlayerFilters.tsx` | Planned |
| `SPEC-FR-3.1.1` | `TASK-FE-05`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/teams/TeamCreateForm.tsx`, `backend/src/teams/teams.controller.ts` | Planned |
| `SPEC-FR-3.1.2` | `TASK-FE-05`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/teams/AddTeamMember.tsx` | Planned |
| `SPEC-FR-3.2.1` | `TASK-FE-06`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/teams/TeamRoster.tsx` | Planned |
| `SPEC-FR-3.2.2` | `TASK-FE-06`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/teams/RosterStatusSelect.tsx` | Planned |
| `SPEC-FR-3.3.1` | `TASK-FE-08`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/events/AttendanceControl.tsx` | Planned |
| `SPEC-FR-3.3.2` | `TASK-FE-08`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/events/AttendanceSummary.tsx` | Planned |
| `SPEC-FR-4.1.1` | `TASK-FE-07`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/events/EventCreateForm.tsx` | Planned |
| `SPEC-FR-4.1.2` | `TASK-FE-07`, `TASK-MOCK-03`, `TASK-BE-04` | `src/entities/event/types.ts` | Planned |
| `SPEC-FR-4.2.1` | `TASK-FE-10`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/calendar/CalendarPage.tsx` | Planned |
| `SPEC-FR-4.2.2` | `TASK-FE-10`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/calendar/CalendarFilters.tsx` | Planned |
| `SPEC-FR-4.3.1` | `TASK-FE-09`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/events/RosterNeedsWidget.tsx` | Planned |
| `SPEC-FR-4.3.2` | `TASK-FE-09`, `TASK-MOCK-03`, `TASK-BE-04` | `src/features/events/RosterNeedsWidget.tsx` | Planned |
| `SPEC-FR-5.1.1` | `TASK-FE-11`, `TASK-MOCK-04`, `TASK-BE-05` | `src/features/sos/SosRequestForm.tsx`, `backend/src/recruitment/recruitment.controller.ts` | Planned |
| `SPEC-FR-5.1.2` | `TASK-FE-11`, `TASK-MOCK-04`, `TASK-BE-05` | `src/features/sos/SosRequestForm.tsx` | Planned |
| `SPEC-FR-5.1.3` | `TASK-FE-11`, `TASK-MOCK-04`, `TASK-BE-05` | `src/features/sos/GoalkeeperSosBadge.tsx` | Planned |
| `SPEC-FR-5.2.1` | `TASK-FE-12`, `TASK-MOCK-04`, `TASK-BE-05` | `src/features/sos/SosFeed.tsx` | Planned |
| `SPEC-FR-5.2.2` | `TASK-FE-12`, `TASK-MOCK-04`, `TASK-BE-05` | `src/features/sos/SosResponseButton.tsx` | Planned |
| `SPEC-FR-5.2.3` | `TASK-FE-13`, `TASK-MOCK-04`, `TASK-BE-05` | `src/features/sos/SosResponseReview.tsx` | Planned |
| `SPEC-FR-6.1.1` | `TASK-FE-14`, `TASK-MOCK-05`, `TASK-BE-06` | `src/features/arenas/ArenasPage.tsx`, `src/features/arenas/ArenaMap.tsx` | Done |
| `SPEC-FR-6.1.2` | `TASK-FE-15`, `TASK-MOCK-05`, `TASK-BE-06` | `src/features/arenas/ArenaFilters.tsx` | Planned |
| `SPEC-FR-6.2.1` | `TASK-FE-16`, `TASK-MOCK-05`, `TASK-BE-06` | `src/features/arenas/ArenaCard.tsx` | Planned |
| `SPEC-FR-6.2.2` | `TASK-FE-16`, `TASK-MOCK-05`, `TASK-BE-06` | `src/features/arenas/ExternalBookingButton.tsx` | Planned |
| `SPEC-FR-6.3.1` | `TASK-FE-17`, `TASK-MOCK-05`, `TASK-BE-06` | `src/features/arenas/IceSlotsList.tsx` | Planned |
| `SPEC-FR-6.3.2` | `TASK-FE-17`, `TASK-MOCK-05`, `TASK-BE-06` | `src/shared/ui/SourceMetaBadge.tsx` | Planned |
| `SPEC-FR-7.1.1` | `TASK-FE-18`, `TASK-MOCK-06`, `TASK-BE-07` | `src/features/leagues/LeaguesPage.tsx` | Planned |
| `SPEC-FR-7.1.2` | `TASK-FE-18`, `TASK-MOCK-06`, `TASK-BE-07` | `src/features/leagues/LeagueCard.tsx` | Planned |
| `SPEC-FR-7.2.1` | `TASK-FE-19`, `TASK-MOCK-06`, `TASK-BE-07` | `src/features/leagues/LeagueStandings.tsx`, `src/features/leagues/LeagueSchedule.tsx` | Planned |
| `SPEC-FR-7.2.2` | `TASK-FE-19`, `TASK-MOCK-06`, `TASK-BE-07` | `src/shared/ui/SourceMetaBadge.tsx` | Planned |
| `SPEC-FR-8.1.1` | `TASK-FE-20`, `TASK-MOCK-07`, `TASK-BE-08` | `src/features/feedback/PostGameFeedbackForm.tsx` | Planned |
| `SPEC-FR-8.1.2` | `TASK-FE-20`, `TASK-MOCK-07`, `TASK-BE-08` | `src/features/feedback/useFeedbackEligibility.ts` | Planned |
| `SPEC-FR-8.2.1` | `TASK-FE-21`, `TASK-MOCK-07`, `TASK-BE-08` | `src/features/karma/KarmaScore.tsx` | Planned |
| `SPEC-FR-8.2.2` | `TASK-FE-21`, `TASK-MOCK-07`, `TASK-BE-08` | `src/features/karma/KarmaHint.tsx` | Planned |
| `SPEC-FR-9.1.1` | `TASK-FE-23`, `TASK-MOCK-09`, `TASK-BE-09` | `src/features/shops/ShopsPage.tsx` | Planned |
| `SPEC-FR-9.1.2` | `TASK-FE-23`, `TASK-MOCK-09`, `TASK-BE-09` | `src/features/shops/ShopCard.tsx` | Planned |
| `SPEC-FR-9.2.1` | `TASK-FE-24`, `TASK-MOCK-09`, `TASK-BE-09` | `src/features/shops/ProductOffersList.tsx` | Planned |
| `SPEC-FR-9.2.2` | `TASK-FE-24`, `TASK-MOCK-09`, `TASK-BE-09` | `src/features/shops/ExternalProductLink.tsx` | Planned |
| `SPEC-FR-10.1.1` | `TASK-FE-22`, `TASK-MOCK-08`, `TASK-BE-10` | `src/features/notifications/NotificationCenter.tsx` | Planned |
| `SPEC-FR-10.1.2` | `TASK-FE-22`, `TASK-MOCK-08`, `TASK-BE-10` | `src/features/notifications/MarkNotificationReadButton.tsx` | Planned |
| `SPEC-FR-11.1.1` | `TASK-FE-25`, `TASK-MOCK-09`, `TASK-BE-11` | `src/features/admin/AdminEntityForm.tsx` | Planned |
| `SPEC-FR-11.1.2` | `TASK-FE-25`, `TASK-MOCK-09`, `TASK-BE-11` | `src/features/admin/VisibilityToggle.tsx` | Planned |
| `SPEC-FR-11.2.1` | `TASK-FE-26`, `TASK-MOCK-09`, `TASK-BE-11` | `src/features/admin/SourceStatusTable.tsx` | Planned |
| `SPEC-FR-11.2.2` | `TASK-FE-26`, `TASK-MOCK-09`, `TASK-BE-11` | `src/entities/source/SourceMeta.ts`, `src/shared/ui/SourceMetaBadge.tsx` | Planned |
| `SPEC-FR-12.1.1` | `TASK-02`, `TASK-BE-12` | `src/shared/api/client.ts` | Planned |
| `SPEC-FR-12.1.2` | `TASK-01`, `TASK-MOCK-01` - `TASK-MOCK-09`, `TASK-BE-12` | `src/entities/**/*.ts`, `src/mocks/handlers/*.ts` | Planned |
| `SPEC-FR-12.1.3` | `TASK-02`, `TASK-BE-12` | `src/shared/config/apiMode.ts`, `src/shared/api/client.ts` | Planned |
| `SPEC-FR-13.1.1` | `TASK-FE-30`, `TASK-MOCK-11`, `TASK-BE-13` | `src/features/iq/IqTestsPage.tsx`, `src/entities/iq/types.ts` | Done |
| `SPEC-FR-13.1.2` | `TASK-FE-30`, `TASK-MOCK-11`, `TASK-BE-13` | `src/features/iq/IqAttemptFlow.tsx`, `src/features/iq/api/iqApi.ts` | Done |
| `SPEC-FR-13.1.3` | `TASK-FE-31`, `TASK-MOCK-11`, `TASK-BE-13` | `src/features/iq/IqLeaderboard.tsx` | Done |
| `SPEC-FR-14.1.1` | `TASK-FE-32`, `TASK-MOCK-12`, `TASK-BE-14` | `src/features/highlights/HighlightsPage.tsx`, `src/entities/highlight/types.ts` | Done |
| `SPEC-FR-14.1.2` | `TASK-FE-32`, `TASK-MOCK-12`, `TASK-BE-14` | `src/features/highlights/AnnotationLayer.tsx` | Done |
| `SPEC-FR-14.1.3` | `TASK-FE-33`, `TASK-MOCK-12`, `TASK-BE-14` | `src/features/highlights/HighlightComments.tsx` | Done |
| `SPEC-FR-14.1.4` | `TASK-FE-32`, `TASK-MOCK-12`, `TASK-BE-14` | `src/features/highlights/MockUploadNotice.tsx` | Done (mock) |
| `SPEC-FR-15.1.1` | `TASK-FE-34`, `TASK-MOCK-13`, `TASK-BE-15` | `src/features/radar/IceRadarPage.tsx` | Done |
| `SPEC-FR-15.1.2` | `TASK-FE-34`, `TASK-MOCK-13`, `TASK-BE-15` | `src/features/radar/RadarRecommendationCard.tsx` | Done |
| `SPEC-FR-15.1.3` | `TASK-FE-34`, `TASK-MOCK-13`, `TASK-BE-15` | `src/features/radar/api/radarApi.ts` | Done |
| `SPEC-FR-17.1.1` | `TASK-FE-51`, `TASK-MOCK-16`, `TASK-BE-16` | `src/features/profile/VerificationFlow.tsx` | Planned |
| `SPEC-FR-17.1.2` | `TASK-FE-51` | `src/features/profile/VerifiedBadge.tsx` | Planned |
| `SPEC-FR-17.1.3` | `TASK-FE-51`, `TASK-MOCK-16` | `src/mocks/handlers/verification.ts` | Planned |
| `SPEC-FR-17.1.4` | `TASK-FE-53`, `TASK-BE-16` | `src/entities/profile/types.ts` | Planned |
| `SPEC-FR-18.1.1` | `TASK-FE-50`, `TASK-MOCK-16` | `src/features/profile/ProfileHub.tsx` | Planned |
| `SPEC-FR-18.1.2` | `TASK-FE-50` | `src/features/profile/ProfileOverview.tsx` | Planned |
| `SPEC-FR-18.1.3` | `TASK-FE-52`, `TASK-MOCK-16`, `TASK-BE-16` | `src/features/profile/NotificationSettings.tsx` | Planned |
| `SPEC-FR-18.1.4` | `TASK-FE-53`, `TASK-MOCK-16`, `TASK-BE-16` | `src/features/profile/PrivacySettings.tsx` | Planned |
| `SPEC-FR-18.1.5` | `TASK-MOCK-16`, `TASK-BE-16` | `src/mocks/data/session.ts` | Planned |
| `SPEC-FR-19.1.1` | `TASK-FE-54`, `TASK-MOCK-16`, `TASK-BE-17` | `src/features/profile/SubscriptionPanel.tsx` | Planned |
| `SPEC-FR-19.1.2` | `TASK-FE-54` | `src/mocks/data/subscriptions.ts` | Planned |
| `SPEC-FR-19.1.3` | `TASK-FE-54`, `TASK-MOCK-16` | `src/features/profile/SubscriptionPanel.tsx` | Planned |
| `SPEC-FR-19.1.4` | `TASK-BE-17` | `src/entities/subscription/types.ts` | Planned |
| `SPEC-FR-20.1.1` | `TASK-MOCK-18`, `TASK-FE-70` | `src/features/shops/api/shopsApi.ts` | Planned |
| `SPEC-FR-20.1.2` | `TASK-MOCK-18`, `TASK-FE-70` | `src/mocks/data/shops.ts` | Planned |
| `SPEC-FR-20.1.3` | `TASK-DISC-01` | `docs/arena-partner-cabinets.md` | Post-MVP |
| `SPEC-FR-20.1.4` | `TASK-DISC-01` | `docs/arena-partner-cabinets.md` | Post-MVP |
| `SPEC-FR-21.1.1` | `TASK-FE-60`, `TASK-MOCK-17`, `TASK-BE-18` | `src/features/teams/AddTeamMember.tsx` | Planned |
| `SPEC-FR-21.1.2` | `TASK-FE-60`, `TASK-MOCK-17`, `TASK-BE-18` | `src/features/teams/EmailInviteForm.tsx` | Planned |
| `SPEC-FR-21.1.3` | `TASK-FE-62`, `TASK-MOCK-17`, `TASK-BE-18` | `src/features/events/EventCreateForm.tsx` | Planned |
| `SPEC-FR-21.1.4` | `TASK-FE-62` | `src/features/events/EventFilters.tsx` | Planned |
| `SPEC-FR-21.1.5` | `TASK-FE-61`, `TASK-MOCK-17`, `TASK-BE-18` | `src/features/teams/TeamRoles.tsx` | Planned |
| `SPEC-FR-21.1.6` | `TASK-FE-63`, `TASK-MOCK-17`, `TASK-BE-18` | `src/features/teams/TrainingLineupBoard.tsx` | Planned |
| `SPEC-FR-21.1.7` | `TASK-FE-63`, `TASK-MOCK-17`, `TASK-BE-18` | `src/features/teams/TrainingLineupBoard.tsx` | Planned |
| `SPEC-FR-22.1.1` | `TASK-FE-43`, `TASK-MOCK-15`, `TASK-BE-19` | `src/features/messenger/ChatTopics.tsx` | Planned |
| `SPEC-FR-22.1.2` | `TASK-FE-43`, `TASK-MOCK-15`, `TASK-BE-19` | `src/features/messenger/TeamChannels.tsx` | Planned |
| `SPEC-FR-22.1.3` | `TASK-MOCK-15`, `TASK-BE-19` | `src/entities/messenger/types.ts` | Planned |
| `SPEC-FR-22.1.4` | `TASK-FE-61`, `TASK-FE-43`, `TASK-BE-19` | `src/features/teams/TeamRoles.tsx` | Planned |
| `SPEC-FR-22.1.5` | `TASK-FE-43`, `TASK-MOCK-15`, `TASK-BE-19` | `src/features/messenger/MessengerPage.tsx` | Planned |
| `SPEC-UI-1.1` | `TASK-UI-02` | `src/shared/ui/HockeyButton.tsx` | Done |
| `SPEC-UI-1.2` | `TASK-UI-02` | `src/features/sos/SosRequestForm.tsx` | Done |
| `SPEC-UI-1.3` | `TASK-UI-03` | `src/shared/ui/IceCard.tsx` | Done |
| `SPEC-UI-1.4` | `TASK-UI-04` | `src/shared/ui/PositionLabel.tsx` | Done |
| `SPEC-UI-1.5` | `TASK-UI-05`, `TASK-UI-08` | `src/shared/ui/ScoreboardText.tsx` | Done |
| `SPEC-UI-2.1` | `TASK-UI-05` | `src/features/players/PlayerCard.tsx` | Done |
| `SPEC-UI-2.2` | `TASK-UI-03`, `TASK-FE-16` | `src/features/arenas/RinkCard.tsx` | Done |
| `SPEC-UI-2.3` | `TASK-UI-06` | `src/features/teams/TeamRoster.tsx`, `src/features/teams/TeamCrest.tsx` | Done |
| `SPEC-UI-2.4` | `TASK-UI-06` | `src/features/events/RosterNeedsWidget.tsx` | Done |
| `SPEC-UI-2.5` | `TASK-UI-07` | `src/features/events/EventsPage.tsx`, `src/features/sos/SosFeed.tsx` | Done |
| `SPEC-UI-2.6` | `TASK-UI-08` | `src/features/calendar/CalendarPage.tsx` | Done |
| `SPEC-UI-3.1` | `TASK-UI-09` | `src/shared/ui/ScoreboardLoader.tsx` | Done |
| `SPEC-UI-3.2` | `TASK-UI-09` | `src/shared/ui/EmptyNetState.tsx` | Done |
| `SPEC-UI-3.3` | `TASK-UI-09` | `src/shared/ui/IceSkeleton.tsx` | Done |
| `SPEC-UI-4.1` | `TASK-UI-01` | `src/shared/theme/HockeyThemeProvider.tsx` | Done |
| `SPEC-UI-4.2` | `TASK-UI-01` | `src/shared/theme/hockeyTokens.css` | Done |
| `SPEC-UI-4.3` | `TASK-UI-11` | `src/app/AppShell.tsx` | Done |
| `SPEC-UI-4.4` | `TASK-UI-02`, `TASK-UI-07` | `src/features/sos/SosFeed.tsx` | Done |
| `SPEC-UI-5.1` | `TASK-UI-10` | `src/app/AppShell.tsx`, `src/app/SideBoard.tsx` | Done |
| `SPEC-UI-5.2` | `TASK-UI-10` | `src/app/MobileNav.tsx`, `src/app/SosFab.tsx` | Done |
| `SPEC-UI-5.3` | `TASK-UI-11` | `src/shared/styles/motion.css` | Done |
| `SPEC-UI-5.4` | `TASK-QA-03` | `src/test/a11y-themes.spec.tsx` | Done |
| `SPEC-UI-2.7` | `TASK-UI-12` | `src/features/leagues/LeagueStandings.tsx`, `src/app/SideBoard.tsx` | Done |
| `SPEC-UI-2.8` | `TASK-UI-12` | `src/features/leagues/LeagueSchedule.tsx` | Done |
| `SPEC-UI-6.1` | `TASK-FE-30` | `src/features/iq/IqAttemptFlow.tsx` | Done |
| `SPEC-UI-6.2` | `TASK-FE-31` | `src/features/iq/IqLeaderboard.tsx` | Done |
| `SPEC-UI-6.3` | `TASK-FE-32` | `src/features/highlights/HighlightVideoBoard.tsx` | Done |
| `SPEC-UI-6.4` | `TASK-FE-32` | `src/features/highlights/MockUploadNotice.tsx` | Done |
| `SPEC-UI-6.5` | `TASK-FE-34` | `src/features/radar/IceRadarPage.tsx` | Done |
| `SPEC-UI-6.6` | `TASK-FE-34` | `src/features/radar/RadarRecommendationCard.tsx` | Done |

## Backend integration blockers

- `TASK-BE-06` может быть заблокирован отсутствием API у порталов аренды льда.
- `TASK-BE-07` может быть заблокирован юридическими ограничениями на использование данных лиг.
- `TASK-BE-09` может быть заблокирован отсутствием партнерских feed/API у магазинов.
- `TASK-BE-13` может быть заблокирован отсутствием утвержденной контентной модели и редактора вопросов `Hockey IQ`.
- `TASK-BE-14` заблокирован до выбора storage/CDN, правил приватности видео и модерации пользовательского контента.
- `TASK-BE-15` зависит от качества данных профиля, событий, арен и согласия пользователя на гео/персонализацию.
- Реальная авторизация и персональные данные требуют отдельного юридического решения до production-запуска.
