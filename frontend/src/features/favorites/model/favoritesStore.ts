import {canUseLocalStorage} from '@/shared/lib/canUseLocalStorage'

import {DEFAULT_FAVORITE_IDS} from './defaultPreset'

const FAVORITES_STORE_KEY = 'hockey-favorites-ids'

function load(): string[] {
  if (!canUseLocalStorage()) return [...DEFAULT_FAVORITE_IDS]
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORE_KEY)
    if (!raw) return [...DEFAULT_FAVORITE_IDS]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...DEFAULT_FAVORITE_IDS]
    return parsed as string[]
  } catch {
    return [...DEFAULT_FAVORITE_IDS]
  }
}

function save(ids: string[]): void {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(FAVORITES_STORE_KEY, JSON.stringify(ids))
}

export function getFavoriteIds(): string[] {
  return load()
}

export function setFavoriteIds(ids: string[]): void {
  save(ids)
}

export function toggleFavoriteId(id: string): string[] {
  const current = load()
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
  save(next)
  return next
}
