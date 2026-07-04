/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2, SPEC-FR-4.2.1, SPEC-FR-4.3.1
 */

import type {AttendanceStatus} from '@/entities/common/types'
import type {CreateEventPayload, GameEvent, RosterStatus} from '@/entities/event/types'
import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event/constants'

export {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event/constants'

/** @spec SPEC-FR-4.1.1 - Mock события */
export let mockEvents: GameEvent[] = [
  {
    id: LEAGUE_SATURDAY_EVENT_ID,
    type: 'game',
    title: 'Лига — Медведи САО vs Вымпел',
    startsAt: '2026-06-27T16:00:00+03:00',
    endsAt: '2026-06-27T17:30:00+03:00',
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
    hasTeamRsvp: true,
    participation: [
      {eventId: LEAGUE_SATURDAY_EVENT_ID, userId: 'user-001', displayName: 'Иван Петров', status: 'going', updatedAt: '2026-06-24T10:00:00Z'},
    ],
  },
  {
    id: 'event-001',
    type: 'game',
    title: 'Товарищеская игра — Медведи САО',
    startsAt: '2026-06-07T20:00:00+03:00',
    endsAt: '2026-06-07T21:30:00+03:00',
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
    participation: [
      {eventId: 'event-001', userId: 'user-001', displayName: 'Иван Петров', status: 'not_going', updatedAt: '2026-06-05T10:00:00Z'},
      {eventId: 'event-001', userId: 'user-003', displayName: 'Дмитрий Козлов', status: 'going', updatedAt: '2026-06-05T10:00:00Z'},
      {eventId: 'event-001', userId: 'user-004', displayName: 'Сергей Волков', status: 'maybe', updatedAt: '2026-06-05T10:00:00Z'},
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
    participation: [
      {eventId: 'event-003', userId: 'user-001', displayName: 'Иван Петров', status: 'going', updatedAt: '2026-06-01T12:00:00Z'},
      {eventId: 'event-003', userId: 'user-002', displayName: 'Алексей Смирнов', status: 'going', updatedAt: '2026-06-01T12:00:00Z'},
      {eventId: 'event-003', userId: 'user-003', displayName: 'Дмитрий Козлов', status: 'going', updatedAt: '2026-06-01T12:00:00Z'},
    ],
  },
  {
    id: 'event-002',
    type: 'training',
    title: 'Утренняя тренировка',
    startsAt: '2026-06-17T08:00:00+03:00',
    endsAt: '2026-06-08T09:30:00+03:00',
    arenaId: 'arena-002',
    arenaName: 'Каток «Лужники»',
    organizerUserId: 'user-001',
    teamId: 'team-001',
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 1, filledCount: 0},
      {position: 'forward', count: 8, filledCount: 1},
    ],
    pricePerPlayer: 1200,
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
