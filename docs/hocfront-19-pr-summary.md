# HOCFRONT-19 — PR summary

**Тикет:** HOCFRONT-19 / TASK-02-04 + TASK-02-05 + TASK-02-06  
**Ветка:** `feature/HOCFRONT-19`

---

## Summary

Базовая модель entity-избранного (`player | team | training | arena | product | league`), `FavoriteButton` на карточках, быстрый доступ в SideBoard и полный список в профиле.

## Scope note (review PR-43)

В ветке также есть изменения навигации / notifications / layout, пересекающиеся с HOCFRONT-17. Это **осознанный bundle** на момент выноса избранного (общий AppShell / SideBoard / MobileNav), а не расширение TASK-02-04…06. Rollback избранного: файлы `entities/favorites`, `features/favorites`, правки карточек и `ProfileFavoritesSection` / SideBoard favorites block. Nav/notifications при необходимости выносятся отдельным PR.

## Что сделано

### Модель + API (TASK-02-04)
- `Favorite` / `FavoriteType`, ключ `${type}:${entityId}`
- API: `GET/POST /favorites`, `DELETE /favorites/:id`
- MSW handlers + mock store (localStorage)
- **Игры (game) не в модели** — ♥ только на `training` (см. `EventCard`)

### FavoriteButton (TASK-02-05)
- Состояния: не добавлено / добавлено / loading / error (`aria-live` + видимый текст ошибки)
- На карточках: игроки, команды, тренировки, арены, товары (+ лиги)

### SideBoard + профиль (TASK-02-06)
- SideBoard: блок «Избранное» со ссылками; legacy shortcuts → «Быстрые действия»
- Контекст маршрута: на `/arenas` только арены, на `/teams` только команды и т.д.; чип типа + stacked layout (без наложений)
- Профиль: вкладка «Избранное», группировка по типу, ссылки на сущности (`?section=favorites`)
- Deep-links: `?teamId=` / `?leagueId=` / `?productId=` / `?arenaId=` читаются страницами (как ArenasPage)
- ArenasPage: sync `detailClosed` при смене `arenaId` остаётся через adjust-state-during-render (eslint `react-hooks/set-state-in-effect` запрещает setState в effect)

## Test plan
- [ ] ♥ на карточке арены/игрока/тренировки → появляется в SideBoard
- [ ] Повторный клик снимает; loading/error не ломают UI (error читается без hover)
- [ ] Профиль → Избранное: группы и переходы по ссылкам на конкретную сущность
- [ ] `/teams?teamId=…`, `/leagues?leagueId=…`, `/shops?productId=…` открывают нужную карточку
- [ ] `npm test -- --run src/test/hocfront-19-favorites.spec.tsx`
