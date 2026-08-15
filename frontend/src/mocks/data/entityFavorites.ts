/**
 * HOCFRONT-19 / TASK-02-04 — mock store entity favorites
 */

import type {AddFavoritePayload, Favorite} from '@/entities/favorites'
import {buildFavoriteHref, favoriteKey} from '@/entities/favorites/lib/favoriteLinks'
import {canUseLocalStorage} from '@/shared/lib/canUseLocalStorage'

const STORAGE_KEY = 'hockey-mock-entity-favorites'

const SEED: Favorite[] = [
  {
    id: favoriteKey('arena', 'arena-001'),
    type: 'arena',
    entityId: 'arena-001',
    title: 'Ледовый дворец на Ходынке',
    href: buildFavoriteHref('arena', 'arena-001'),
    createdAt: '2026-07-10T10:00:00Z',
  },
  {
    id: favoriteKey('player', 'user-002'),
    type: 'player',
    entityId: 'user-002',
    title: 'Смирнов Алексей Дмитриевич',
    href: buildFavoriteHref('player', 'user-002'),
    createdAt: '2026-07-12T14:00:00Z',
  },
]

function load(): Favorite[] {
  if (!canUseLocalStorage()) return [...SEED]
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...SEED]
    const parsed = JSON.parse(raw) as Favorite[]
    return Array.isArray(parsed) ? parsed : [...SEED]
  } catch {
    return [...SEED]
  }
}

function persist(items: Favorite[]): void {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export let mockEntityFavorites: Favorite[] = load()

export function listMockEntityFavorites(): Favorite[] {
  return [...mockEntityFavorites].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function addMockEntityFavorite(payload: AddFavoritePayload): Favorite {
  const id = favoriteKey(payload.type, payload.entityId)
  const existing = mockEntityFavorites.find((item) => item.id === id)
  if (existing) return existing

  const next: Favorite = {
    id,
    type: payload.type,
    entityId: payload.entityId,
    title: payload.title,
    href: payload.href ?? buildFavoriteHref(payload.type, payload.entityId),
    createdAt: new Date().toISOString(),
  }
  mockEntityFavorites = [next, ...mockEntityFavorites]
  persist(mockEntityFavorites)
  return next
}

export function removeMockEntityFavorite(favoriteId: string): boolean {
  const before = mockEntityFavorites.length
  mockEntityFavorites = mockEntityFavorites.filter((item) => item.id !== favoriteId)
  if (mockEntityFavorites.length === before) return false
  persist(mockEntityFavorites)
  return true
}

export function resetMockEntityFavorites(): Favorite[] {
  mockEntityFavorites = [...SEED]
  persist(mockEntityFavorites)
  return listMockEntityFavorites()
}
