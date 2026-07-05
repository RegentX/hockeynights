/**
 * HOCFRONT-8 — MSW: login, favorites, RSVP.
 */

import {beforeEach, describe, expect, it} from 'vitest'

import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event/constants'
import {authLogin, selectPersona} from '@/features/auth/api/sessionApi'
import {DEMO_EMAIL, DEMO_PASSWORD} from '@/features/auth/demoCredentials'
import {fetchEventRsvp, updateEventRsvp} from '@/features/events/api/eventsApi'
import {fetchProfileFavorites, patchProfileFavorites} from '@/features/profile/api/favoritesApi'
import {resetMockEventRsvp} from '@/mocks/data/eventRsvp'
import {resetMockFavorites} from '@/mocks/data/favorites'
import {resetMockSession} from '@/mocks/data/session'
import {clearTestStorage} from '@/test/clearTestStorage'

describe('HOCFRONT-8 mock API', () => {
  beforeEach(() => {
    resetMockSession()
    resetMockFavorites()
    resetMockEventRsvp()
    clearTestStorage()
  })

  it('auth/login returns demo user and personas', async () => {
    const response = await authLogin({email: DEMO_EMAIL, password: DEMO_PASSWORD})
    expect(response.userId).toBe('user-001')
    expect(response.availablePersonas.length).toBeGreaterThanOrEqual(8)
    expect(response.availablePersonas.some((persona) => persona.id === 'player')).toBe(true)
  })

  it('rejects invalid demo login', async () => {
    await expect(authLogin({email: 'wrong@example.com', password: 'bad'})).rejects.toThrow()
  })

  it('session/persona updates session with home path and routes', async () => {
    const session = await selectPersona({personaId: 'player'})
    expect(session.isOnboarded).toBe(true)
    expect(session.personaId).toBe('player')
    expect(session.homePath).toBe('/profile')
    expect(session.allowedPathPrefixes).toContain('/events')
  })

  it('profile/favorites returns preset and accepts patch', async () => {
    const initial = await fetchProfileFavorites()
    expect(initial.actions).toHaveLength(4)
    expect(initial.actions[0]?.path).toBe('/events')

    const updated = await patchProfileFavorites({
      actions: [
        {id: 'calendar', label: 'Календарь', path: '/calendar', icon: '📅'},
        {id: 'teams', label: 'Команды', path: '/teams', icon: '🛡'},
      ],
    })
    expect(updated.actions).toHaveLength(2)
    expect(updated.updatedAt).toBeTruthy()

    const persisted = await fetchProfileFavorites()
    expect(persisted.actions).toHaveLength(2)
  })

  it('events/:id/rsvp returns team board and updates current player', async () => {
    const board = await fetchEventRsvp(LEAGUE_SATURDAY_EVENT_ID)
    expect(board.players.length).toBeGreaterThanOrEqual(8)
    expect(board.startsAt).toContain('16:00')
    expect(board.players.some((player) => player.status === 'confirmed')).toBe(true)
    expect(board.players.some((player) => player.status === 'declined')).toBe(true)
    expect(board.players.some((player) => player.status === 'pending')).toBe(true)

    const updated = await updateEventRsvp(LEAGUE_SATURDAY_EVENT_ID, {
      status: 'declined',
      declineReason: 'Тест',
    })
    expect(updated.status).toBe('declined')
    expect(updated.declineReason).toBe('Тест')

    const refreshed = await fetchEventRsvp(LEAGUE_SATURDAY_EVENT_ID)
    const me = refreshed.players.find((player) => player.userId === 'user-001')
    expect(me?.status).toBe('declined')
  })
})
