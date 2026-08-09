# Договорённости с аренами (ICE)

## Модель

Заявка на лёд (`IceBookingRequest`) → **договорённость** (`IceAgreement`) в кабинете организатора.

| Пул | Когда |
|-----|--------|
| В переговорах | pending / confirmed / awaiting_payment… |
| **Доступна для тренировки** | `booked` / `payment_received` + интервал `startsAt`–`endsAt` |
| Использована | создано событие с `iceBookingId` |
| Закрыта | declined / cancelled / expired |

## UI

- Кабинет `/events/organizer` → таб **Договорённости** (дефолт)
- Создание `/events/create` шаг **Место**: пул договорённостей **или** вручную (арена + интервал)
- Deep-link: `?agreementId=&bookingId=&arenaId=&startsAt=&endsAt=`
- Календарь, lens **Организатор**: панель договорённостей (как inbox вратаря)

## API (mock)

`GET /me/ice-agreements`

## Tests

`src/test/ice-agreements*.spec.*` + обновлённые organizer suites
