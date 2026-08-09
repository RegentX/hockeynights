/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2, SPEC-FR-4.2.1, SPEC-FR-4.3.1
 */

import type {AttendanceStatus} from '@/entities/common'
import type {
  CreateEventPayload,
  GameEvent,
  RosterStatus,
  UpdateEventPayload,
} from '@/entities/event'
import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'
import {canViewTraining, getUserClubIds, getUserTeamIds} from '@/features/events/lib/trainingAccess'
import {mockUser} from '@/mocks/data/session'
import {mockTeams} from '@/mocks/data/teams'

export {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'

/** @spec SPEC-FR-4.1.1 - Mock события */
function buildSeedEvents(): GameEvent[] {
  return [
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
      lifecycleStatus: 'published',
      accessScope: 'public',
      organizerDisplayName: 'Иван Петров',
      organizerPhone: '+7 (999) 100-11-22',
      hasTeamRsvp: true,
      participation: [
        {
          eventId: LEAGUE_SATURDAY_EVENT_ID,
          userId: 'user-001',
          displayName: 'Иван Петров',
          /** Согласовано с командным RSVP: pending → not_going */
          status: 'not_going',
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
      lifecycleStatus: 'published',
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
      lifecycleStatus: 'published',
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
      pricePerPlayer: 0,
      trainingFormat: 'training',
      district: 'ЦАО',
      registrationStatus: 'open',
      lifecycleStatus: 'published',
      accessScope: 'private_club',
      clubId: 'club-001',
      organizerDisplayName: 'Тренер клуба Медведи',
      organizerPhone: '+7 (999) 500-12-34',
      participation: [],
    },
    {
      id: 'event-007',
      type: 'training',
      title: 'Черновик: утренняя раскатка',
      startsAt: '2026-08-22T07:00:00+03:00',
      endsAt: '2026-08-22T08:00:00+03:00',
      arenaId: 'arena-002',
      arenaName: 'Каток «Лужники»',
      organizerUserId: 'user-001',
      requiredSkillLevel: 'beginner',
      requiredSlots: [
        {position: 'goalie', count: 1, filledCount: 0},
        {position: 'forward', count: 10, filledCount: 0},
      ],
      pricePerPlayer: 800,
      trainingFormat: 'training',
      district: 'ЦАО',
      registrationStatus: 'open',
      lifecycleStatus: 'draft',
      accessScope: 'public_open',
      organizerDisplayName: 'Иван Петров',
      organizerPhone: '+7 (999) 100-11-22',
      participation: [],
    },
    {
      id: 'event-008',
      type: 'training',
      title: 'Отменённая вечерняя тренировка',
      startsAt: '2026-08-13T21:00:00+03:00',
      endsAt: '2026-08-13T22:30:00+03:00',
      arenaId: 'arena-001',
      arenaName: 'Ледовый дворец на Ходынке',
      organizerUserId: 'user-001',
      requiredSkillLevel: 'amateur',
      requiredSlots: [
        {position: 'goalie', count: 2, filledCount: 0},
        {position: 'defense', count: 4, filledCount: 0},
        {position: 'forward', count: 6, filledCount: 0},
      ],
      pricePerPlayer: 1200,
      trainingFormat: 'two_way',
      district: 'САО',
      registrationStatus: 'open',
      lifecycleStatus: 'cancelled',
      accessScope: 'public_open',
      organizerDisplayName: 'Иван Петров',
      organizerPhone: '+7 (999) 100-11-22',
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
      lifecycleStatus: 'published',
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
      lifecycleStatus: 'published',
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
      lifecycleStatus: 'published',
      accessScope: 'public_open',
      organizerDisplayName: 'Павел Новиков',
      organizerPhone: '+7 (999) 700-55-66',
      participation: [],
    },
  ]
}

export let mockEvents: GameEvent[] = buildSeedEvents()

/** Сброс mock-событий между тестами (ORG-6). */
export function resetMockEvents(): void {
  mockEvents = buildSeedEvents()
}

function resolveArenaName(arenaId: string, fallback?: string): string {
  if (fallback) return fallback
  if (arenaId === 'arena-001') return 'Ледовый дворец на Ходынке'
  if (arenaId === 'arena-003') return 'СК «Крылья Советов»'
  return 'Каток «Лужники»'
}

function totalSlotCount(event: GameEvent): number {
  return event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
}

/** Синхронизирует filledCount / registrationStatus с confirmed (going). */
export function syncMockRegistrationCapacity(event: GameEvent): void {
  const goingCount = event.participation.filter((item) => item.status === 'going').length
  let remaining = goingCount
  event.requiredSlots = event.requiredSlots.map((slot) => {
    const filledCount = Math.min(slot.count, remaining)
    remaining -= filledCount
    return {...slot, filledCount}
  })
  const total = totalSlotCount(event)
  event.registrationStatus = total > 0 && goingCount >= total ? 'full' : 'open'
}

function promoteWaitlistIfPossible(event: GameEvent): void {
  const total = totalSlotCount(event)
  let goingCount = event.participation.filter((item) => item.status === 'going').length
  if (goingCount >= total) return

  const waitlisted = event.participation
    .filter((item) => item.status === 'maybe')
    .slice()
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))

  for (const candidate of waitlisted) {
    if (goingCount >= total) break
    candidate.status = 'going'
    candidate.updatedAt = new Date().toISOString()
    goingCount += 1
  }
}

/**
 * @spec SPEC-FR-4.1.1 - Создать событие
 */
export function createMockEvent(payload: CreateEventPayload): GameEvent {
  const isPrivateClub = payload.accessScope === 'private_club'
  const event: GameEvent = {
    id: `event-${Date.now()}`,
    ...payload,
    arenaName: resolveArenaName(payload.arenaId),
    organizerUserId: mockUser.id,
    organizerDisplayName: mockUser.displayName,
    organizerPhone: '+7 (999) 100-11-22',
    accessScope: payload.accessScope ?? 'public',
    trainingFormat: payload.trainingFormat,
    registrationStatus: 'open',
    lifecycleStatus: payload.lifecycleStatus ?? 'published',
    district: payload.district ?? 'САО',
    clubId: payload.clubId,
    iceBookingId: payload.iceBookingId,
    iceAgreementId: payload.iceAgreementId,
    pricePerPlayer: isPrivateClub ? 0 : payload.pricePerPlayer,
    participation: [],
  }
  mockEvents = [...mockEvents, event]
  return event
}

/** HOCFRONT-28G — обновить событие */
export function updateMockEvent(
  eventId: string,
  payload: UpdateEventPayload,
): GameEvent | undefined {
  const eventIndex = mockEvents.findIndex((item) => item.id === eventId)
  if (eventIndex === -1) return undefined

  const current = mockEvents[eventIndex]
  const nextAccess = payload.accessScope ?? current.accessScope
  const isPrivateClub = nextAccess === 'private_club'
  const next: GameEvent = {
    ...current,
    ...payload,
    arenaName: payload.arenaId
      ? resolveArenaName(payload.arenaId, current.arenaName)
      : current.arenaName,
    pricePerPlayer: isPrivateClub ? 0 : (payload.pricePerPlayer ?? current.pricePerPlayer),
    clubId: isPrivateClub ? (payload.clubId ?? current.clubId) : payload.clubId,
    participation: current.participation,
  }
  syncMockRegistrationCapacity(next)
  mockEvents[eventIndex] = next
  return next
}

/** Каталог с серверным фильтром private_club / limited. */
export function listVisibleMockEvents(): GameEvent[] {
  const userId = mockUser.id
  const userTeamIds = getUserTeamIds(mockTeams, userId)
  const userClubIds = getUserClubIds(mockTeams, userId)
  const partnerClubIds = (mockUser.partnerMemberships ?? [])
    .filter((membership) => membership.kind === 'club')
    .map((membership) => membership.entityId)
  const allClubIds = [...new Set([...userClubIds, ...partnerClubIds])]
  const isAdmin = mockUser.roles.includes('admin')

  return mockEvents.filter((event) =>
    canViewTraining(event, userId, userTeamIds, {
      isAdmin,
      canManageClub: Boolean(event.clubId && partnerClubIds.includes(event.clubId)),
      userClubIds: allClubIds,
    }),
  )
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

  const event = {
    ...mockEvents[eventIndex],
    participation: [...mockEvents[eventIndex].participation],
  }
  const existing = event.participation.find((p) => p.userId === userId)
  const previousStatus = existing?.status
  const updatedAt = new Date().toISOString()

  if (existing) {
    existing.status = status
    existing.updatedAt = updatedAt
    existing.displayName = displayName || existing.displayName
  } else {
    event.participation.push({eventId, userId, displayName, status, updatedAt})
  }

  if (previousStatus === 'going' && status !== 'going') {
    promoteWaitlistIfPossible(event)
  }

  syncMockRegistrationCapacity(event)
  mockEvents[eventIndex] = event
  return event
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
