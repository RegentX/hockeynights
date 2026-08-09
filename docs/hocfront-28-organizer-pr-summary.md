# Кабинет организатора тренировок (EPIC-08 / ORG-1…6)

**Ветка:** `feature/HOCFRONT-32` (поверх arenas) / дальше можно вынести в HOCFRONT-28F/G  
**Роль:** `training_organizer` (legacy alias: `organizer`)

---

## Summary

- Отдельная роль + persona «Организатор тренировок» → home `/events/organizer`
- Доступ к кабинету: `training_organizer` / `organizer` / `club_admin` / captain / coach / admin
- Workspace-табы: **Тренировки** | **Участники** | **Профиль**
- Статусы: черновик / набор / заполнена / прошедшая / отменена; fill % и дефицит
- Wizard `/events/create`: 5 шагов, draft, paywall без жаргона, бейдж «Только для клуба», goalie step
- Edit stub: `/events/trainings/:id/edit`
- Из кабинета клуба: CTA в organizer + create `?access=private_club`
- Черновики/отменённые скрыты из каталога игрока

## Demo

1. Persona **Организатор тренировок** → кабинет → фильтр «Черновики» / вкладка «Участники»
2. **Создать** → `?access=private_club` или шаг «Доступ» → Опубликовать
3. Persona **Админ клуба** → «Кабинет организатора»
4. Persona **Игрок** → в `/events` нет «Черновик: утренняя раскатка»

## Tests

```bash
npm run test -- --run \
  src/test/organizer-access.spec.ts \
  src/test/organizer-workspace.spec.ts \
  src/test/organizer-demo.spec.ts \
  src/test/hocfront-28f-organizer-workspace.spec.tsx \
  src/test/hocfront-28g-create-wizard.spec.tsx \
  src/test/hocfront-28-events-page.spec.tsx
```

## Docs

- CEO EPIC-08 / TASK-05-06…10
- HOCFRONT-28F / 28G
- BE2-016 (API «мои тренировки»)
