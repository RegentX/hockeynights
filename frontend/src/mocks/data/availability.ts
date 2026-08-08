/**
 * HOCFRONT-28CAL-G/H — mock окна возможностей и запросы вратарям
 */

import type {AvailabilityWindow, GoalieRequest} from '@/entities/calendar'
import type {GameEvent} from '@/entities/event'
import {mockEvents, updateMockAttendance} from '@/mocks/data/events'
import {mockNotifications} from '@/mocks/data/notifications'

export let mockAvailabilityWindows: AvailabilityWindow[] = [
  {
    id: 'aw-001',
    userId: 'user-002',
    roleHint: 'goalie',
    startsAt: '2026-08-12T07:00:00+03:00',
    endsAt: '2026-08-12T12:00:00+03:00',
    districts: ['ЦАО', 'САО'],
    priceFrom: 0,
    priceTo: 1000,
    note: 'Готов выйти на утренние слоты',
    active: true,
  },
  {
    id: 'aw-002',
    userId: 'user-001',
    roleHint: 'player',
    startsAt: '2026-08-16T18:00:00+03:00',
    endsAt: '2026-08-16T23:00:00+03:00',
    districts: ['САО'],
    priceFrom: 1000,
    priceTo: 1600,
    active: true,
  },
]

export let mockGoalieRequests: GoalieRequest[] = []

let windowSeq = 3
let requestSeq = 1

export function listAvailabilityWindows(userId?: string): AvailabilityWindow[] {
  if (!userId) return mockAvailabilityWindows.filter((item) => item.active)
  return mockAvailabilityWindows.filter((item) => item.userId === userId)
}

export function createMockAvailabilityWindow(
  userId: string,
  payload: Omit<AvailabilityWindow, 'id' | 'userId' | 'active'> & {active?: boolean},
): AvailabilityWindow {
  const created: AvailabilityWindow = {
    id: `aw-${String(windowSeq).padStart(3, '0')}`,
    userId,
    active: payload.active ?? true,
    roleHint: payload.roleHint,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    districts: payload.districts,
    maxTravelKm: payload.maxTravelKm,
    priceFrom: payload.priceFrom,
    priceTo: payload.priceTo,
    note: payload.note,
  }
  windowSeq += 1
  mockAvailabilityWindows = [...mockAvailabilityWindows, created]
  return created
}

export function patchMockAvailabilityWindow(
  id: string,
  partial: Partial<AvailabilityWindow>,
): AvailabilityWindow | null {
  const index = mockAvailabilityWindows.findIndex((item) => item.id === id)
  if (index < 0) return null
  const updated = {...mockAvailabilityWindows[index], ...partial, id}
  mockAvailabilityWindows = mockAvailabilityWindows.map((item) => (item.id === id ? updated : item))
  return updated
}

function windowsOverlapEvent(window: AvailabilityWindow, event: GameEvent): boolean {
  const wStart = new Date(window.startsAt).getTime()
  const wEnd = new Date(window.endsAt).getTime()
  const eStart = new Date(event.startsAt).getTime()
  const eEnd = new Date(event.endsAt).getTime()
  if (eEnd < wStart || eStart > wEnd) return false
  if (!window.districts.length || !event.district) return true
  return window.districts.includes(event.district)
}

export function createGoalieRequestsForEvent(
  eventId: string,
  organizerUserId: string,
): GoalieRequest[] {
  const event = mockEvents.find((item) => item.id === eventId)
  if (!event) return []

  const goalieSlot = event.requiredSlots.find((slot) => slot.position === 'goalie')
  if (!goalieSlot || goalieSlot.filledCount >= goalieSlot.count) return []

  const matches = mockAvailabilityWindows.filter(
    (window) =>
      window.active &&
      window.roleHint === 'goalie' &&
      window.userId !== organizerUserId &&
      windowsOverlapEvent(window, event),
  )

  const created: GoalieRequest[] = []
  for (const window of matches) {
    const already = mockGoalieRequests.some(
      (request) =>
        request.eventId === eventId &&
        request.targetUserId === window.userId &&
        request.status === 'pending',
    )
    if (already) continue

    const request: GoalieRequest = {
      id: `gr-${String(requestSeq).padStart(3, '0')}`,
      eventId: event.id,
      eventTitle: event.title,
      organizerUserId,
      targetUserId: window.userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      startsAt: event.startsAt,
      arenaName: event.arenaName,
      pricePerPlayer: event.pricePerPlayer,
    }
    requestSeq += 1
    created.push(request)

    mockNotifications.unshift({
      id: `notif-goalie-${request.id}`,
      userId: window.userId,
      type: 'goalie_request',
      title: 'Запрос на тренировку',
      body: `Вас пригласили как вратаря: ${event.title}`,
      relatedEntityId: event.id,
      createdAt: new Date().toISOString(),
    })
  }

  mockGoalieRequests = [...created, ...mockGoalieRequests]
  return created
}

export function listGoalieRequests(userId?: string): GoalieRequest[] {
  if (!userId) return mockGoalieRequests
  return mockGoalieRequests.filter(
    (request) => request.targetUserId === userId || request.organizerUserId === userId,
  )
}

export function respondMockGoalieRequest(
  requestId: string,
  status: 'accepted' | 'declined',
  displayName?: string,
): GoalieRequest | null {
  const index = mockGoalieRequests.findIndex((item) => item.id === requestId)
  if (index < 0) return null
  const current = mockGoalieRequests[index]
  const updated = {...current, status}
  mockGoalieRequests = mockGoalieRequests.map((item) => (item.id === requestId ? updated : item))

  if (status === 'accepted') {
    updateMockAttendance(current.eventId, current.targetUserId, displayName ?? 'Вратарь', 'going')
  }

  return updated
}
