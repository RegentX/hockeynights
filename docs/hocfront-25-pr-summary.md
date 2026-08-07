# HOCFRONT-25 — страница команды и кабинет клуба

**Тикет:** HOCFRONT-25  
**Ветка:** `feature/HOCFRONT-25`

---

## Summary

- Публичный каталог `/teams`: поиск/фильтры + кнопка «Создать команду» (не главный блок)
- Отдельная FSD-страница `/teams/create` с мастером: основы → образ/фото → игроки/тренеры → площадка → мессенджер
- Авто-чат команды (опционально, публичный по умолчанию)
- Исправлен 404 `club-profile` для команд без клуба (теперь `null`)
- Публичный профиль `/teams/:id` + кабинет клуба `club_admin`
- «Связаться со штабом» → `ContactStaffModal` + `POST /teams/:id/staff-contact` (без мессенджера)

## Scope note (review PR-44)

`origin/develop..HEAD` включает транзитивно HOCFRONT-17 / HOCFRONT-19 / npm audit / eslint restore — ветка выросла поверх уже смерженных/параллельных фич. **Scope ревью HOCFRONT-25:** `pages/Team*`, `pages/Club*`, `features/teams`, `features/clubs`, training access, related mocks/tests. Nav/favorites/audit — transitively, не часть TASK-04.

## Access

- `canManageClubEntity(session, clubId)`: **admin** или **partnerMembership** `kind=club` + `entityId === clubId`. Роль `club_admin` alone — недостаточно.

## Test plan

- [ ] Открыть `/teams/team-002` — без 404 club-profile в Network
- [ ] «Связаться со штабом» → модалка, submit → success (не `/messenger`)
- [ ] Каталог: outlined «Создать команду» → `/teams/create`
- [ ] Кабинет клуба: заголовки «Расстановка · {team.name}»; профиль клуба не stale при смене `:clubId`
- [ ] club_admin без membership чужого клуба — нет «Кабинет клуба» / denied
- [ ] `npm test -- --run src/test/hocfront-25-teams-club.spec.ts src/test/training-access.spec.ts`
