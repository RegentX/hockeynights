import {canUseLocalStorage} from '@/shared/lib/canUseLocalStorage'

import {DEFAULT_FAVORITE_IDS, sanitizeFavoriteIds} from './defaultPreset'

const FAVORITES_STORE_KEY = 'hockey-favorites-ids'

function load(): string[] {
  if (!canUseLocalStorage()) return [...DEFAULT_FAVORITE_IDS]
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORE_KEY)
    if (!raw) return [...DEFAULT_FAVORITE_IDS]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...DEFAULT_FAVORITE_IDS]
    const sanitized = sanitizeFavoriteIds(parsed as string[])
    if (sanitized.length !== (parsed as string[]).length) {
      save(sanitized.length > 0 ? sanitized : [...DEFAULT_FAVORITE_IDS])
    }
    return sanitized.length > 0 ? sanitized : [...DEFAULT_FAVORITE_IDS]
  } catch {
    return [...DEFAULT_FAVORITE_IDS]
  }
}

function save(ids: string[]): void {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(FAVORITES_STORE_KEY, JSON.stringify(sanitizeFavoriteIds(ids)))
}

export function getFavoriteIds(): string[] {
  return load()
}

export function setFavoriteIds(ids: string[]): string[] {
  const next = sanitizeFavoriteIds(ids)
  const persisted = next.length > 0 ? next : [...DEFAULT_FAVORITE_IDS]
  save(persisted)
  return persisted
}

export function toggleFavoriteId(id: string): string[] {
  if (sanitizeFavoriteIds([id]).length === 0) {
    return load()
  }
  const current = load()
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  return setFavoriteIds(next)
}
