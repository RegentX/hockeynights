/**
 * SPEC-FR-25.4.2
 * Пресет избранных быстрых действий профиля.
 */

import type {FavoriteAction, ProfileFavorites} from '@/entities/favorites/types'
import {ARENAS_LABEL, EVENTS_LABEL} from '@/shared/config/navigationLabels'

const FAVORITES_STORAGE_KEY = 'hockey-mock-favorites'

const DEFAULT_FAVORITE_ACTIONS: FavoriteAction[] = [
  {id: 'events', label: EVENTS_LABEL, path: '/events', icon: '🏒'},
  {id: 'teams', label: 'Команды', path: '/teams', icon: '🛡'},
  {id: 'arenas', label: ARENAS_LABEL, path: '/arenas', icon: '🧊'},
]

function loadPersistedFavorites(): ProfileFavorites | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProfileFavorites
  } catch {
    return null
  }
}

function persistFavorites(favorites: ProfileFavorites): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
}

export let mockFavorites: ProfileFavorites = loadPersistedFavorites() ?? {
  actions: DEFAULT_FAVORITE_ACTIONS,
  updatedAt: '2026-06-01T12:00:00Z',
}

export function getMockFavorites(): ProfileFavorites {
  return mockFavorites
}

export function updateMockFavorites(actions: FavoriteAction[]): ProfileFavorites {
  mockFavorites = {
    actions,
    updatedAt: new Date().toISOString(),
  }
  persistFavorites(mockFavorites)
  return mockFavorites
}

export function resetMockFavorites(): ProfileFavorites {
  mockFavorites = {
    actions: DEFAULT_FAVORITE_ACTIONS,
    updatedAt: new Date().toISOString(),
  }
  persistFavorites(mockFavorites)
  return mockFavorites
}
