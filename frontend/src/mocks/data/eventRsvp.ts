/**
 * SPEC-FR-25.6.1, SPEC-FR-25.6.2
 * RSVP состава на лиговую игру в субботу 16:00.
 */

import type {EventRsvpBoard, EventRsvpPlayer, EventRsvpStatus} from '@/entities/event/rsvpTypes'
import {LEAGUE_SATURDAY_EVENT_ID, updateMockAttendance} from '@/mocks/data/events'
import {mockUser} from '@/mocks/data/session'

export {LEAGUE_SATURDAY_EVENT_ID} from '@/mocks/data/events'

const RSVP_STORAGE_KEY = 'hockey-mock-event-rsvp'

function createLeagueSaturdayRoster(): EventRsvpPlayer[] {
  return [
    {userId: 'user-001', displayName: 'Иван Петров', position: 'forward', status: 'confirmed', updatedAt: '2026-06-24T10:00:00Z'},
    {userId: 'user-002', displayName: 'Алексей Смирнов', position: 'goalie', status: 'confirmed', updatedAt: '2026-06-24T11:00:00Z'},
    {userId: 'user-003', displayName: 'Дмитрий Козлов', position: 'defense', status: 'declined', declineReason: 'Командировка', updatedAt: '2026-06-24T09:30:00Z'},
    {userId: 'user-004', displayName: 'Сергей Волков', position: 'forward', status: 'pending'},
    {userId: 'user-005', displayName: 'Михаил Орлов', position: 'defense', status: 'confirmed', updatedAt: '2026-06-25T08:00:00Z'},
    {userId: 'user-006', displayName: 'Андрей Лебедев', position: 'forward', status: 'declined', declineReason: 'Травма', updatedAt: '2026-06-23T18:00:00Z'},
    {userId: 'user-007', displayName: 'Павел Новиков', position: 'goalie', status: 'pending'},
    {userId: 'user-008', displayName: 'Игорь Соколов', position: 'defense', status: 'confirmed', updatedAt: '2026-06-25T12:00:00Z'},
    {userId: 'user-009', displayName: 'Никита Морозов', position: 'forward', status: 'pending'},
    {userId: 'user-010', displayName: 'Владимир Кузнецов', position: 'forward', status: 'confirmed', updatedAt: '2026-06-24T20:00:00Z'},
  ]
}

function createLeagueSaturdayBoard(players: EventRsvpPlayer[]): EventRsvpBoard {
  return {
    eventId: LEAGUE_SATURDAY_EVENT_ID,
    teamId: 'team-001',
    teamName: 'Медведи САО',
    leagueName: 'Московская любительская лига',
    opponentName: 'Вымпел',
    startsAt: '2026-06-27T16:00:00+03:00',
    arenaName: 'Ледовый дворец на Ходынке',
    players,
  }
}

function loadPersistedRsvp(): EventRsvpBoard | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(RSVP_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as EventRsvpBoard
  } catch {
    return null
  }
}

function persistRsvp(board: EventRsvpBoard): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(board))
}

export let mockLeagueSaturdayRsvp: EventRsvpBoard =
  loadPersistedRsvp() ?? createLeagueSaturdayBoard(createLeagueSaturdayRoster())

function rsvpToAttendance(status: EventRsvpStatus): AttendanceStatus {
  if (status === 'confirmed') return 'going'
  if (status === 'declined') return 'not_going'
  return 'maybe'
}

export function getMockEventRsvp(eventId: string): EventRsvpBoard | undefined {
  if (eventId !== LEAGUE_SATURDAY_EVENT_ID) return undefined
  return mockLeagueSaturdayRsvp
}

export function updateMockEventRsvp(
  eventId: string,
  userId: string,
  status: EventRsvpStatus,
  declineReason?: string,
): EventRsvpBoard | undefined {
  if (eventId !== LEAGUE_SATURDAY_EVENT_ID) return undefined

  const players = mockLeagueSaturdayRsvp.players.map((player) => {
    if (player.userId !== userId) return player
    return {
      ...player,
      status,
      declineReason: status === 'declined' ? declineReason : undefined,
      updatedAt: new Date().toISOString(),
    }
  })

  mockLeagueSaturdayRsvp = {...mockLeagueSaturdayRsvp, players}
  persistRsvp(mockLeagueSaturdayRsvp)

  if (userId === mockUser.id) {
    updateMockAttendance(
      eventId,
      userId,
      mockUser.displayName,
      rsvpToAttendance(status),
    )
  }

  return mockLeagueSaturdayRsvp
}

export function resetMockEventRsvp(): EventRsvpBoard {
  mockLeagueSaturdayRsvp = createLeagueSaturdayBoard(createLeagueSaturdayRoster())
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(RSVP_STORAGE_KEY)
  }
  return mockLeagueSaturdayRsvp
}
