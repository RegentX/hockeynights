# HOCFRONT-19 — PR summary

**Тикет:** HOCFRONT-19 / TASK-02-04 + TASK-02-05 + TASK-02-06  
**Ветка:** `feature/HOCFRONT-19`

---

## Summary

Базовая модель entity-избранного (`player | team | training | arena | product | league`), `FavoriteButton` на карточках, быстрый доступ в SideBoard и полный список в профиле.

## Что сделано

### Модель + API (TASK-02-04)
- `Favorite` / `FavoriteType`, ключ `${type}:${entityId}`
- API: `GET/POST /favorites`, `DELETE /favorites/:id`
- MSW handlers + mock store (localStorage)

### FavoriteButton (TASK-02-05)
- Состояния: не добавлено / добавлено / loading / error
- На карточках: игроки, команды, тренировки, арены, товары (+ лиги)

### SideBoard + профиль (TASK-02-06)
- SideBoard: блок «Избранное» со ссылками; legacy shortcuts → «Быстрые действия»
- Контекст маршрута: на `/arenas` только арены, на `/teams` только команды и т.д.; чип типа + stacked layout (без наложений)
- Профиль: вкладка «Избранное», группировка по типу, ссылки на сущности (`?section=favorites`)

## Test plan
- [ ] ♥ на карточке арены/игрока/тренировки → появляется в SideBoard
- [ ] Повторный клик снимает; loading/error не ломают UI
- [ ] Профиль → Избранное: группы и переходы по ссылкам
- [ ] `npm test -- --run src/test/hocfront-19-favorites.spec.ts`
