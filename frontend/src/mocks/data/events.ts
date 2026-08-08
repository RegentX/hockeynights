/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2, SPEC-FR-4.2.1, SPEC-FR-4.3.1
 */

import type {AttendanceStatus} from '@/entities/common'
import type {CreateEventPayload, GameEvent, RosterStatus} from '@/entities/event'
import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'

export {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'

/** @spec SPEC-FR-4.1.1 - Mock события */
export let mockEvents: GameEvent[] = [
  {
    id: LEAGUE_SATURDAY_EVENT_ID,
    type: 'game',
    title: 'Лига — Медведи САО vs Вымпел',
    startsAt: '2026-08-15T16:00:00+03:00',
    endsAt: '2026-08-15T17:30:00+03:00',
    arenaId: 'arena-001',
    arenaName: 'Ледовый дворец на Ходынке',
    organizerUserId: 'user-001',
    teamId: 'team-001',
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 1, filledCount: 1},
      {position: 'defense', count: 4, filledCount: 2},
      {position: 'forward', count: 6, filledCount: 3},
    ],
    pricePerPlayer: 1600,
    trainingFormat: 'two_way',
    district: 'САО',
    registrationStatus: 'open',
    accessScope: 'public',
    organizerDisplayName: 'Иван Петров',
    organizerPhone: '+7 (999) 100-11-22',
    hasTeamRsvp: true,
    participation: [
      {
        eventId: LEAGUE_SATURDAY_EVENT_ID,
        userId: 'user-001',
        displayName: 'Иван Петров',
        status: 'going',
        updatedAt: '2026-06-24T10:00:00Z',
      },
    ],
  },
  {
    id: 'event-001',
    type: 'game',
    title: 'Товарищеская игра — Медведи САО',
    startsAt: '2026-08-20T20:00:00+03:00',
    endsAt: '2026-08-20T21:30:00+03:00',
    arenaId: 'arena-001',
    arenaName: 'Ледовый дворец на Ходынке',
    organizerUserId: 'user-001',
    teamId: 'team-001',
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 2, filledCount: 0},
      {position: 'defense', count: 4, filledCount: 1},
      {position: 'forward', count: 6, filledCount: 2},
    ],
    pricePerPlayer: 1500,
    trainingFormat: 'two_way',
    district: 'САО',
    registrationStatus: 'open',
    accessScope: 'public',
    organizerDisplayName: 'Иван Петров',
    organizerPhone: '+7 (999) 100-11-22',
    participation: [
      {
        eventId: 'event-001',
        userId: 'user-001',
        displayName: 'Иван Петров',
        status: 'not_going',
        updatedAt: '2026-06-05T10:00:00Z',
      },
      {
        eventId: 'event-001',
        userId: 'user-003',
        displayName: 'Дмитрий Козлов',
        status: 'going',
        updatedAt: '2026-06-05T10:00:00Z',
      },
      {
        eventId: 'event-001',
        userId: 'user-004',
        displayName: 'Сергей Волков',
        status: 'maybe',
        updatedAt: '2026-06-05T10:00:00Z',
      },
    ],
  },
  {
    id: 'event-003',
    type: 'game',
    title: 'Прошедшая игра — Вымпел',
    startsAt: '2026-06-01T19:00:00+03:00',
    endsAt: '2026-06-01T20:30:00+03:00',
    arenaId: 'arena-001',
    arenaName: 'Ледовый дворец на Ходынке',
    organizerUserId: 'user-001',
    teamId: 'team-001',
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 2, filledCount: 2},
      {position: 'forward', count: 6, filledCount: 6},
    ],
    pricePerPlayer: 1400,
    trainingFormat: 'two_way',
    district: 'СЗАО',
    registrationStatus: 'full',
    accessScope: 'public',
    organizerDisplayName: 'Иван Петров',
    organizerPhone: '+7 (999) 100-11-22',
    participation: [
      {
        eventId: 'event-003',
        userId: 'user-001',
        displayName: 'Иван Петров',
        status: 'going',
        updatedAt: '2026-06-01T12:00:00Z',
      },
      {
        eventId: 'event-003',
        userId: 'user-002',
        displayName: 'Алексей Смирнов',
        status: 'going',
        updatedAt: '2026-06-01T12:00:00Z',
      },
      {
        eventId: 'event-003',
        userId: 'user-003',
        displayName: 'Дмитрий Козлов',
        status: 'going',
        updatedAt: '2026-06-01T12:00:00Z',
      },
    ],
  },
  {
    id: 'event-002',
    type: 'training',
    title: 'Клубная тренировка: катание и передачи',
    startsAt: '2026-08-12T08:00:00+03:00',
    endsAt: '2026-08-12T09:30:00+03:00',
    arenaId: 'arena-002',
    arenaName: 'Каток «Лужники»',
    organizerUserId: 'user-001',
    teamId: 'team-001',
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 1, filledCount: 0},
      {position: 'forward', count: 8, filledCount: 1},
    ],
    pricePerPlayer: 900,
    trainingFormat: 'training',
    district: 'ЦАО',
    registrationStatus: 'open',
    accessScope: 'private_club',
    clubId: 'club-001',
    organizerDisplayName: 'Тренер клуба Медведи',
    organizerPhone: '+7 (999) 500-12-34',
    participation: [],
  },
  {
    id: 'event-006',
    type: 'training',
    title: 'Закрытая клубная: вратарская техника',
    startsAt: '2026-08-18T19:00:00+03:00',
    endsAt: '2026-08-18T20:30:00+03:00',
    arenaId: 'arena-001',
    arenaName: 'Ледовый дворец на Ходынке',
    organizerUserId: 'user-005',
    teamId: 'team-001',
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 3, filledCount: 1},
      {position: 'defense', count: 2, filledCount: 0},
    ],
    pricePerPlayer: 0,
    trainingFormat: 'training',
    district: 'САО',
    registrationStatus: 'open',
    accessScope: 'private_club',
    clubId: 'club-001',
    organizerDisplayName: 'Михаил Орлов',
    organizerPhone: '+7 (999) 200-11-22',
    participation: [],
  },
  {
    id: 'event-004',
    type: 'training',
    title: 'Тренировка для ограниченной группы защитников',
    startsAt: '2026-08-14T20:30:00+03:00',
    endsAt: '2026-08-14T22:00:00+03:00',
    arenaId: 'arena-001',
    arenaName: 'Ледовый дворец на Ходынке',
    organizerUserId: 'user-003',
    teamId: 'team-001',
    requiredSkillLevel: 'advanced',
    requiredSlots: [
      {position: 'defense', count: 6, filledCount: 4},
      {position: 'goalie', count: 1, filledCount: 1},
    ],
    pricePerPlayer: 1800,
    trainingFormat: 'training_two_way',
    district: 'САО',
    registrationStatus: 'open',
    accessScope: 'limited',
    allowedUserIds: ['user-001', 'user-003', 'user-005'],
    organizerDisplayName: 'Дмитрий Козлов',
    organizerPhone: '+7 (999) 200-33-44',
    participation: [],
  },
  {
    id: 'event-005',
    type: 'training',
    title: 'Публичная тренировка 2-сторонка',
    startsAt: '2026-08-16T21:00:00+03:00',
    endsAt: '2026-08-16T22:30:00+03:00',
    arenaId: 'arena-003',
    arenaName: 'СК «Крылья Советов»',
    organizerUserId: 'user-009',
    requiredSkillLevel: 'beginner',
    requiredSlots: [
      {position: 'goalie', count: 2, filledCount: 2},
      {position: 'forward', count: 12, filledCount: 12},
    ],
    pricePerPlayer: 1300,
    trainingFormat: 'two_way',
    district: 'ЗАО',
    registrationStatus: 'full',
    accessScope: 'public_open',
    organizerDisplayName: 'Павел Новиков',
    organizerPhone: '+7 (999) 700-55-66',
    participation: [],
  },
]

/**
 * @spec SPEC-FR-4.1.1 - Создать событие
 */
export function createMockEvent(payload: CreateEventPayload): GameEvent {
  const event: GameEvent = {
    id: `event-${Date.now()}`,
    ...payload,
    arenaName: payload.arenaId === 'arena-001' ? 'Ледовый дворец на Ходынке' : 'Каток «Лужники»',
    organizerUserId: 'user-001',
    organizerDisplayName: 'Иван Петров',
    organizerPhone: '+7 (999) 100-11-22',
    accessScope: payload.accessScope ?? 'public',
    trainingFormat: payload.trainingFormat,
    registrationStatus: 'open',
    district: payload.district ?? 'САО',
    clubId: payload.clubId,
    participation: [],
  }
  mockEvents = [...mockEvents, event]
  return event
}

/**
 * @spec SPEC-FR-3.3.1 - Обновить посещаемость
 */
export function updateMockAttendance(
  eventId: string,
  userId: string,
  displayName: string,
  status: AttendanceStatus,
): GameEvent | undefined {
  const eventIndex = mockEvents.findIndex((e) => e.id === eventId)
  if (eventIndex === -1) return undefined

  const event = mockEvents[eventIndex]
  const existing = event.participation.find((p) => p.userId === userId)
  const updatedAt = new Date().toISOString()

  if (existing) {
    existing.status = status
    existing.updatedAt = updatedAt
  } else {
    event.participation.push({eventId, userId, displayName, status, updatedAt})
  }

  mockEvents[eventIndex] = {...event}
  return mockEvents[eventIndex]
}

/**
 * @spec SPEC-FR-4.3.1 - Рассчитать дефицит состава
 */
export function getMockRosterStatus(eventId: string): RosterStatus | undefined {
  const event = mockEvents.find((e) => e.id === eventId)
  if (!event) return undefined

  const deficits = event.requiredSlots
    .map((slot) => ({
      ...slot,
      count: Math.max(slot.count - slot.filledCount, 0),
      filledCount: 0,
    }))
    .filter((slot) => slot.count > 0)

  const summary = event.participation.reduce(
    (acc, p) => {
      if (p.status === 'going') acc.going += 1
      if (p.status === 'not_going') acc.notGoing += 1
      if (p.status === 'maybe') acc.maybe += 1
      return acc
    },
    {going: 0, notGoing: 0, maybe: 0},
  )

  return {eventId, deficits, summary}
}
