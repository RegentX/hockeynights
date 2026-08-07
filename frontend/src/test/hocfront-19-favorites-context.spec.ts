/**
 * HOCFRONT-19 — page-scoped favorites context
 */

import {describe, expect, it} from 'vitest'

import {resolveFavoritesPageContext} from '@/features/favorites/lib/favoritesPageContext'

describe('resolveFavoritesPageContext', () => {
  it('scopes arenas / teams / trainings / shops', () => {
    expect(resolveFavoritesPageContext('/arenas').type).toBe('arena')
    expect(resolveFavoritesPageContext('/teams').type).toBe('team')
    expect(resolveFavoritesPageContext('/teams/team-001').type).toBe('team')
    expect(resolveFavoritesPageContext('/events').type).toBe('training')
    expect(resolveFavoritesPageContext('/events/trainings/event-1').type).toBe('training')
    expect(resolveFavoritesPageContext('/shops').type).toBe('product')
    expect(resolveFavoritesPageContext('/players/user-002').type).toBe('player')
    expect(resolveFavoritesPageContext('/leagues').type).toBe('league')
  })

  it('shows all types outside entity list pages', () => {
    expect(resolveFavoritesPageContext('/profile').type).toBeNull()
    expect(resolveFavoritesPageContext('/messenger').type).toBeNull()
  })
})
