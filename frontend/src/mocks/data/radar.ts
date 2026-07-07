/**
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 */

import type {
  PatchRadarRecommendationPayload,
  RadarAction,
  RadarRecommendation,
} from '@/entities/radar'
import {mockArenas, mockIceSlots} from '@/mocks/data/arenas'
import {mockEvents} from '@/mocks/data/events'
import {mockLeagues} from '@/mocks/data/leagues'
import {mockRecruitmentRequests} from '@/mocks/data/recruitment'

const MOCK_USER_ID = 'user-001'

function arenaDistrict(arenaId: string): string | undefined {
  return mockArenas.find((a) => a.id === arenaId)?.district
}

/**
 * @spec SPEC-FR-15.1.1 - Агрегация рекомендаций из существующих fixtures
 */
function buildInitialRecommendations(): RadarRecommendation[] {
  const sos = mockRecruitmentRequests.find((r) => r.status === 'open')
  const game = mockEvents.find((e) => e.type === 'game')
  const training = mockEvents.find((e) => e.type === 'training')
  const freeSlot = mockIceSlots.find((s) => s.status === 'free' && s.arenaId === 'arena-001')
  const eveningSlot = mockIceSlots.find((s) => s.id === 'slot-004')
  const league = mockLeagues.find((l) => l.id === 'league-001')
  const league2 = mockLeagues.find((l) => l.id === 'league-002')

  const items: RadarRecommendation[] = [
    {
      id: 'radar-001',
      type: 'sos',
      title: sos?.eventTitle ?? 'Срочный добор вратаря',
      reasonCode: 'position_needed',
      reasonText: 'Нужен твой амплуа — вратарь',
      district: sos?.district ?? 'САО',
      startsAt: sos?.startsAt,
      priority: 'high',
      targetRoute: '/sos',
      relatedEntityId: sos?.id,
    },
    {
      id: 'radar-002',
      type: 'event',
      title: game?.title ?? 'Ближайшая игра',
      reasonCode: 'nearby',
      reasonText: 'Рядом с тобой — САО',
      district: game ? arenaDistrict(game.arenaId) : 'САО',
      startsAt: game?.startsAt,
      priority: 'high',
      targetRoute: '/events',
      relatedEntityId: game?.id,
    },
    {
      id: 'radar-003',
      type: 'ice_slot',
      title: 'Свободный слот на Ходынке',
      reasonCode: 'favorite_arena',
      reasonText: 'Твой любимый каток',
      district: 'САО',
      startsAt: freeSlot?.startsAt,
      priority: 'high',
      targetRoute: '/arenas',
      relatedEntityId: freeSlot?.id,
    },
    {
      id: 'radar-004',
      type: 'training',
      title: training?.title ?? 'Утренняя тренировка',
      reasonCode: 'after_work',
      reasonText: 'Успеваешь после работы',
      district: training ? arenaDistrict(training.arenaId) : 'ЦАО',
      startsAt: training?.startsAt,
      priority: 'medium',
      targetRoute: '/events',
      relatedEntityId: training?.id,
    },
    {
      id: 'radar-005',
      type: 'ice_slot',
      title: 'Вечерний слот в Лужниках',
      reasonCode: 'nearby',
      reasonText: 'Рядом с тобой — вечером',
      district: 'ЦАО',
      startsAt: eveningSlot?.startsAt,
      priority: 'medium',
      targetRoute: '/arenas',
      relatedEntityId: eveningSlot?.id ?? 'slot-004',
    },
    {
      id: 'radar-006',
      type: 'league',
      title: league?.name ?? 'Ночная лига',
      reasonCode: 'team_activity',
      reasonText: 'Твоя команда в таблице',
      district: 'Москва',
      priority: 'medium',
      targetRoute: '/leagues',
      relatedEntityId: league?.id,
    },
    {
      id: 'radar-007',
      type: 'event',
      title: 'Открытая игра — Ледовые Волки',
      reasonCode: 'nearby',
      reasonText: 'Рядом с тобой — Ходынка',
      district: 'САО',
      startsAt: '2026-06-09T19:30:00+03:00',
      priority: 'medium',
      targetRoute: '/events',
      relatedEntityId: 'event-001',
    },
    {
      id: 'radar-008',
      type: 'sos',
      title: 'Нужен нападающий на субботу',
      reasonCode: 'position_needed',
      reasonText: 'Нужен твой амплуа — нападающий',
      district: 'САО',
      startsAt: '2026-06-07T18:00:00+03:00',
      priority: 'low',
      targetRoute: '/sos',
      relatedEntityId: 'req-001',
    },
    {
      id: 'radar-009',
      type: 'league',
      title: league2?.name ?? 'ЛХЛ-77',
      reasonCode: 'team_activity',
      reasonText: 'Новый сезон — проверь расписание',
      district: 'Москва',
      priority: 'low',
      targetRoute: '/leagues',
      relatedEntityId: league2?.id,
    },
    {
      id: 'radar-010',
      type: 'ice_slot',
      title: 'Слот в Мытищах — дешевле',
      reasonCode: 'after_work',
      reasonText: 'Успеваешь после работы',
      district: 'Мытищи',
      startsAt: '2026-06-08T21:00:00+03:00',
      priority: 'low',
      targetRoute: '/arenas',
      relatedEntityId: 'arena-003',
    },
    {
      id: 'radar-011',
      type: 'training',
      title: 'Скилл-сессия для нападающих',
      reasonCode: 'position_needed',
      reasonText: 'Нужен твой амплуа',
      district: 'ЦАО',
      startsAt: '2026-06-10T07:00:00+03:00',
      priority: 'low',
      targetRoute: '/events',
      dismissedAt: '2026-06-04T12:00:00Z',
    },
    {
      id: 'radar-012',
      type: 'sos',
      title: 'Добор защитника — ЮАО',
      reasonCode: 'nearby',
      reasonText: 'Рядом с тобой',
      district: 'ЮАО',
      priority: 'low',
      targetRoute: '/sos',
      dismissedAt: '2026-06-04T14:00:00Z',
    },
    {
      id: 'radar-013',
      type: 'ice_slot',
      title: 'Утренний лёд — Лужники',
      reasonCode: 'favorite_arena',
      reasonText: 'Твой любимый каток',
      district: 'ЦАО',
      dismissedAt: '2026-06-03T09:00:00Z',
      priority: 'medium',
      targetRoute: '/arenas',
    },
    {
      id: 'radar-014',
      type: 'event',
      title: 'Турнир выходного дня',
      reasonCode: 'team_activity',
      reasonText: 'Активность команды',
      district: 'САО',
      dismissedAt: '2026-06-02T18:00:00Z',
      priority: 'medium',
      targetRoute: '/events',
    },
    {
      id: 'radar-015',
      type: 'league',
      title: 'СПбХЛ — выездной матч',
      reasonCode: 'after_work',
      reasonText: 'Успеваешь после работы',
      district: 'Санкт-Петербург',
      dismissedAt: '2026-06-01T10:00:00Z',
      priority: 'low',
      targetRoute: '/leagues',
    },
  ]

  return items
}

/** @spec SPEC-FR-15.1.1 - Mock рекомендации Ice Radar */
export let mockRadarRecommendations: RadarRecommendation[] = buildInitialRecommendations()

/** @spec SPEC-FR-15.1.3 - Mock события действий */
export let mockRadarActions: RadarAction[] = [
  {
    id: 'radar-act-001',
    recommendationId: 'radar-011',
    userId: MOCK_USER_ID,
    action: 'dismiss',
    createdAt: '2026-06-04T12:00:00Z',
  },
  {
    id: 'radar-act-002',
    recommendationId: 'radar-012',
    userId: MOCK_USER_ID,
    action: 'dismiss',
    createdAt: '2026-06-04T14:00:00Z',
  },
  {
    id: 'radar-act-003',
    recommendationId: 'radar-013',
    userId: MOCK_USER_ID,
    action: 'navigate',
    createdAt: '2026-06-03T09:00:00Z',
  },
  {
    id: 'radar-act-004',
    recommendationId: 'radar-014',
    userId: MOCK_USER_ID,
    action: 'dismiss',
    createdAt: '2026-06-02T18:00:00Z',
  },
  {
    id: 'radar-act-005',
    recommendationId: 'radar-015',
    userId: MOCK_USER_ID,
    action: 'navigate',
    createdAt: '2026-06-01T10:00:00Z',
  },
]

/**
 * @spec SPEC-FR-15.1.1 - Активные рекомендации без dismiss
 */
export function getActiveRadarRecommendations(): RadarRecommendation[] {
  return mockRadarRecommendations
    .filter((r) => !r.dismissedAt)
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority))
}

function priorityWeight(priority: RadarRecommendation['priority']): number {
  if (priority === 'high') return 3
  if (priority === 'medium') return 2
  return 1
}

/**
 * @spec SPEC-FR-15.1.3 - Скрыть или зафиксировать переход
 */
export function patchMockRadarRecommendation(
  recommendationId: string,
  payload: PatchRadarRecommendationPayload,
): RadarRecommendation | undefined {
  const index = mockRadarRecommendations.findIndex((r) => r.id === recommendationId)
  if (index === -1) return undefined

  const userId = payload.userId ?? MOCK_USER_ID
  const now = new Date().toISOString()
  const action: RadarAction = {
    id: `radar-act-${Date.now()}`,
    recommendationId,
    userId,
    action: payload.action,
    createdAt: now,
  }
  mockRadarActions = [...mockRadarActions, action]

  if (payload.action === 'dismiss') {
    mockRadarRecommendations = mockRadarRecommendations.map((r) =>
      r.id === recommendationId ? {...r, dismissedAt: now} : r,
    )
  }

  return mockRadarRecommendations.find((r) => r.id === recommendationId)
}

/** Сброс mock state для изолированных тестов */
export function resetMockRadarState(): void {
  mockRadarRecommendations = buildInitialRecommendations()
  mockRadarActions = [
    {
      id: 'radar-act-001',
      recommendationId: 'radar-011',
      userId: MOCK_USER_ID,
      action: 'dismiss',
      createdAt: '2026-06-04T12:00:00Z',
    },
    {
      id: 'radar-act-002',
      recommendationId: 'radar-012',
      userId: MOCK_USER_ID,
      action: 'dismiss',
      createdAt: '2026-06-04T14:00:00Z',
    },
    {
      id: 'radar-act-003',
      recommendationId: 'radar-013',
      userId: MOCK_USER_ID,
      action: 'navigate',
      createdAt: '2026-06-03T09:00:00Z',
    },
    {
      id: 'radar-act-004',
      recommendationId: 'radar-014',
      userId: MOCK_USER_ID,
      action: 'dismiss',
      createdAt: '2026-06-02T18:00:00Z',
    },
    {
      id: 'radar-act-005',
      recommendationId: 'radar-015',
      userId: MOCK_USER_ID,
      action: 'navigate',
      createdAt: '2026-06-01T10:00:00Z',
    },
  ]
}
