# HOCFRONT-28 — Календарь (часть эпика «Игры и тренировки»)

Продуктовое решение: `/calendar` — first-class поверхность (не прячем в профиль).  
Профиль / команда / клуб — scoped входы в тот же engine.

Порядок: **CAL-A → CAL-I**.  
Сделано: **28CAL-A … 28CAL-I**.

---

## HOCFRONT-28CAL-A — Calendar shell и единый engine

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] Один engine на 4 scope
- [x] URL восстанавливает состояние
- [x] `/calendar` остаётся в nav
- [x] typecheck + smoke green

---

## HOCFRONT-28CAL-B — Month + Agenda

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] Переключение Month / Agenda
- [x] Клик по дню фильтрует agenda
- [x] Empty states: нет событий / день пуст

---

## HOCFRONT-28CAL-C — Действия из календаря

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] Записаться / лист ожидания / отменить с календаря
- [x] Chips: Сегодня, Эта неделя, Мои записи, Ищут вратаря
- [x] Reset фильтров

---

## HOCFRONT-28CAL-D — Календарь в профиле игрока

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] «Мой график» на `/profile` (preview + открыть календарь)
- [x] Публичный `/players/:id` — going + privacy gate
- [x] Privacy toggle `calendarVisibility`

---

## HOCFRONT-28CAL-E — Team / Club на том же engine

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] Preview + deep-link в `/calendar?scope=team|club`
- [x] Badge «нужен вратарь» в списке команды/клуба

---

## HOCFRONT-28CAL-F — Ролевые линзы

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] Линзы Игрок / Вратарь / Организатор в URL `lens`
- [x] Default из persona/roles
- [x] Empty-copy зависит от lens

---

## HOCFRONT-28CAL-G — Окна возможностей MVP

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] Модель `AvailabilityWindow` + MSW CRUD
- [x] Панель «Моя доступность» на lens=goalie
- [x] Не смешивается с записью на событие

---

## HOCFRONT-28CAL-H — Запрос вратарям ↔ календарь

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] Create form → `POST /goalie-requests` matching по окнам
- [x] Inbox Принять/Отклонить на lens=goalie
- [x] Accept → participation `going` + notification `goalie_request`

---

## HOCFRONT-28CAL-I — Polish / export / QA

| | |
|---|---|
| **Статус** | done |

### Acceptance

- [x] ICS download на agenda-карточке
- [x] a11y: aria-current / keyboard на днях месяца
- [x] Тесты shell / lenses / ics

---

## Вне scope

- Production matching / push / эквайринг
- Возврат SOS как отдельного раздела
- Полноценная страница игры
