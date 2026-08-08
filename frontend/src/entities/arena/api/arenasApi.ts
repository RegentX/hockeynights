/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 * HOCFRONT-32 — listings + cabinet
 */

import type {
  Arena,
  ArenaFilters,
  CreateIceListingPayload,
  IceListing,
  IceSlot,
  UpdateArenaPayload,
  UpdateIceListingPayload,
} from '@/entities/arena/model'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-6.1.1 - Список арен
 * @spec SPEC-FR-6.1.2 - Фильтрация
 */
export function fetchArenas(filters: ArenaFilters = {}): Promise<Arena[]> {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
  if (filters.cityRegion) params.set('cityRegion', filters.cityRegion)
  if (filters.district) params.set('district', filters.district)
  if (filters.metro) params.set('metro', filters.metro)
  if (filters.amenity) params.set('amenity', filters.amenity)
  if (filters.hasFreeSlots) params.set('hasFreeSlots', 'true')
  if (filters.bookingMode) params.set('bookingMode', filters.bookingMode)

  const query = params.toString()
  return apiRequest<Arena[]>(`/arenas${query ? `?${query}` : ''}`)
}

/**
 * @spec SPEC-FR-6.2.1 - Карточка арены
 */
export function fetchArena(arenaId: string): Promise<Arena> {
  return apiRequest<Arena>(`/arenas/${arenaId}`)
}

/**
 * @spec SPEC-FR-6.3.1 - Слоты льда арены
 */
export function fetchArenaSlots(arenaId: string): Promise<IceSlot[]> {
  return apiRequest<IceSlot[]>(`/arenas/${arenaId}/slots`)
}

/** HOCFRONT-32B — публичные объявления арены */
export function fetchArenaListings(
  arenaId: string,
  options?: {publicOnly?: boolean},
): Promise<IceListing[]> {
  const params = new URLSearchParams()
  if (options?.publicOnly) params.set('publicOnly', 'true')
  const query = params.toString()
  return apiRequest<IceListing[]>(`/arenas/${arenaId}/listings${query ? `?${query}` : ''}`)
}

/** HOCFRONT-32D — правка профиля арены из кабинета */
export function updateArena(arenaId: string, payload: UpdateArenaPayload): Promise<Arena> {
  return apiRequest<Arena>(`/arenas/${arenaId}`, {method: 'PATCH', body: payload})
}

/** HOCFRONT-32E — опубликованные объявления (каталог) */
export function fetchPublishedIceListings(): Promise<IceListing[]> {
  return apiRequest<IceListing[]>('/ice-listings?status=published')
}

/** HOCFRONT-32E — создать объявление */
export function createIceListing(payload: CreateIceListingPayload): Promise<IceListing> {
  return apiRequest<IceListing>('/ice-listings', {method: 'POST', body: payload})
}

/** HOCFRONT-32E — обновить / опубликовать объявление */
export function updateIceListing(
  listingId: string,
  payload: UpdateIceListingPayload,
): Promise<IceListing> {
  return apiRequest<IceListing>(`/ice-listings/${listingId}`, {method: 'PATCH', body: payload})
}
