# HOCFRONT-18 — PR summary

**Тикет:** HOCFRONT-18 / TASK-02-03 — обновить визуальные подписи  
**Ветка:** `feature/HOCFRONT-18`  
**База:** поверх `feature/HOCFRONT-17` (навигация)

> **Состав PR vs `develop`:** в одном PR уходят три слоя. Ниже они разведены явно, чтобы приёмка TASK-02-03 не смешивалась с регрессиями навигации и CI.

---

## Слои в PR (vs develop)

| Слой | Коммиты / область | Зачем в ветке |
| :--- | :--- | :--- |
| **HOCFRONT-17** | mobile nav / Lottie bell / access / SideBoard | stacked base; отдельно проверять nav |
| **HOCFRONT-18** | typography entity titles + focus gutters | TASK-02-03 |
| **CI / deps** | npm audit overrides, `.nvmrc` 22.22, deploy `--omit=dev` | разблокировка quality gate |

Идеальный merge path: `17 → develop`, затем `18`. Если мержим одним PR — гонять **оба** test plan ниже.

---

## HOCFRONT-18 — Summary (TASK-02-03)

Единый display-тон для названий сущностей (Bebas / `header-2`, эталон — «Ледовый дворец на Ходынке») и фикс layout в focus-режиме без боковых панелей.

### Типографика

- Названия сущностей: `subheader-2` (scoreboard mono) → `header-2` (Bebas Neue):
  - арены (`RinkCard`), события (`EventCard` full + **compact**), лиги, магазины, игроки, моменты
  - дотянуты residual: `RadarRecommendationCard`, `MatchCenterFeed`, `TeamCrest`, `MarketplaceProductCard` (title)
- Compact vs full для одного `event.title`: оба на `header-2` + класс `hockey-entity-title--compact` в списках/карточках (тот же font-family / weight / tracking / uppercase, меньший `clamp`)
- Detail/hero entity — plain `header-2` (`clamp(1.25rem … 1.75rem)`)
- List/cards — `header-2.hockey-entity-title--compact` (`clamp(1.05rem … 1.35rem)`)

### Layout (focus / свёрнутые панели)

- При скрытых left + right панелях у `.app-shell__main-col` больше не `padding: 0`
- Gutters `clamp(20px, 4vw, 48px)`, `max-width: 1400px`, центрирование
- Header padding-inline согласован; «Требует доработки» в side nav — по центру

### Out of scope (явно)

- **Градиенты поверхностей** (IceCard, marketplace, teams cards) — не трогались
- **Правило градиентов текста:** clip-gradient только у page `header-1`; entity `header-2` — solid color
- Агрессивный type-ramp / Inter на card titles / глобальные `!important` — откат, не вошёл

---

## HOCFRONT-17 — кратко (для отдельной приёмки)

- Синхронизация desktop / mobile nav, Lottie bell, access gates, SideBoard
- Test plan: пункты меню совпадают на desktop/mobile; bell; свёртка панелей не ломает nav

---

## CI / deps — кратко

- `postcss` + `react-router` overrides; audit в CI: `--omit=dev`
- Node `.nvmrc` → `22.22` (peer react-router 8.3)

---

## Test plan (HOCFRONT-18)

- [ ] Карточки арен / событий / лиг / магазинов / игроков / radar / match-center / team crest / marketplace title — Bebas, uppercase
- [ ] Compact event в календаре и full EventCard — один шрифт (Bebas), compact чуть меньше size
- [ ] Деталь арены «Ледовый дворец…» — тот же face, крупнее list cards
- [ ] Длинные RU-названия на мобиле не раздувают сетку list cards
- [ ] Desktop: свернуть обе панели → gutters, не full-bleed в ноль
- [ ] Side nav: «Требует доработки» по центру
- [ ] Темы Лёд / Раздевалка — без регрессий

## Test plan (HOCFRONT-17, если PR stacked)

- [ ] Desktop top + mobile bottom: одинаковый набор пунктов MVP
- [ ] Уведомления / bell доступны
- [ ] Access / SideBoard без поломки focus-layout из 18
