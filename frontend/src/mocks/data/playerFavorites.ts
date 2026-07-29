/**
 * SPEC-FR-2.3.1
 * Mock-хранилище избранных игроков каталога.
 */

import type {PlayerFavorites} from '@/entities/player-favorites'
import {canUseLocalStorage} from '@/shared/lib/canUseLocalStorage'

const PLAYER_FAVORITES_STORAGE_KEY = 'hockey-mock-player-favorites'

function loadPersistedPlayerFavorites(): PlayerFavorites | null {
  if (!canUseLocalStorage()) return null
  try {
    const raw = window.localStorage.getItem(PLAYER_FAVORITES_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PlayerFavorites
    if (!Array.isArray(parsed.playerIds)) return null
    return parsed
  } catch {
    return null
  }
}

function persistPlayerFavorites(favorites: PlayerFavorites): void {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(PLAYER_FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
}

export let mockPlayerFavorites: PlayerFavorites = loadPersistedPlayerFavorites() ?? {
  playerIds: ['user-002'],
  updatedAt: '2026-06-15T12:00:00Z',
}

export function getMockPlayerFavorites(): PlayerFavorites {
  return mockPlayerFavorites
}

export function updateMockPlayerFavorites(playerIds: string[]): PlayerFavorites {
  mockPlayerFavorites = {
    playerIds: [...new Set(playerIds)],
    updatedAt: new Date().toISOString(),
  }
  persistPlayerFavorites(mockPlayerFavorites)
  return mockPlayerFavorites
}

export function resetMockPlayerFavorites(): PlayerFavorites {
  mockPlayerFavorites = {
    playerIds: ['user-002'],
    updatedAt: '2026-06-15T12:00:00Z',
  }
  persistPlayerFavorites(mockPlayerFavorites)
  return mockPlayerFavorites
}
