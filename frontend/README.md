# Hockey Social — Frontend MVP (Phase 1 Mock UI)

## Стек

- React + TypeScript + Vite
- Gravity UI
- React Router
- TanStack Query
- Mock Service Worker (MSW)

## Запуск

```bash
npm install
npm run dev
npm test
```

Откройте `http://localhost:5173/login` для mock-onboarding.

## Реализованные SPEC

### Этап 1

- `SPEC-FR-1.2.1` — layout и навигация
- `SPEC-FR-1.2.2` — React + Gravity UI
- `SPEC-FR-1.2.3`, `SPEC-FR-12.1.1` — единый API client
- `SPEC-FR-2.1.1` - `SPEC-FR-2.1.3` — mock auth/onboarding
- `SPEC-FR-2.2.1` - `SPEC-FR-2.2.4` — Hockey ID
- `SPEC-FR-2.3.1`, `SPEC-FR-2.3.2` — игроки и фильтры
- `SPEC-FR-6.1.1` - `SPEC-FR-6.3.2` — катки, RinkCard, слоты

### Этап 2

- `SPEC-FR-3.1.1` - `SPEC-FR-3.2.2` — команды и roster
- `SPEC-FR-3.3.1`, `SPEC-FR-3.3.2` — посещаемость
- `SPEC-FR-4.1.1` - `SPEC-FR-4.3.2` — события, календарь, дефицит состава
- `SPEC-FR-5.1.1` - `SPEC-FR-5.2.3` — Goalkeeper SOS и отклики

### Этап 3

- `SPEC-FR-7.1.1` - `SPEC-FR-7.2.2` — лиги, таблицы, расписание
- `SPEC-FR-8.1.1` - `SPEC-FR-8.2.2` — post-game feedback и karma
- `SPEC-FR-9.1.1` - `SPEC-FR-9.2.2` — магазины и товарные предложения
- `SPEC-FR-10.1.1`, `SPEC-FR-10.1.2` — in-app уведомления
- `SPEC-FR-11.1.1` - `SPEC-FR-11.2.2` — admin prototype и статусы источников

### Mock external flows (исправление мёртвых CTA)

- `SPEC-FR-6.4.1`, `SPEC-FR-6.4.2` — запись на лёд через mock-мастер
- `SPEC-FR-7.1.3` — mock-портал лиги
- `SPEC-FR-9.1.3`, `SPEC-FR-9.2.3` — mock-сайт магазина и checkout

### QA (этап 1.9)

- `TASK-QA-01` — smoke-тесты mock API и UI (auth, profile, players, teams, events, SOS, arenas)
- `TASK-QA-02` — smoke-тесты лиг, feedback, notifications, shops, admin
- `spec-traceability.spec.ts` — проверка SPEC-FR ссылок в ключевых файлах

## Маршруты

- `/login` — onboarding
- `/profile` — Hockey ID
- `/players` — игроки
- `/teams` — команды и состав
- `/events` — игры и тренировки
- `/calendar` — календарь
- `/sos` — Goalkeeper SOS
- `/arenas` — катки
- `/leagues` — любительские лиги
- `/feedback` — post-game feedback
- `/notifications` — уведомления
- `/shops` — магазины экипировки
- `/admin` — админка справочников

## Переключение на backend (Phase 2)

```env
VITE_API_MODE=backend
VITE_BACKEND_URL=/api/v1
```
