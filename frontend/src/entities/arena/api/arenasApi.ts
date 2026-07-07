/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 */

import type {Arena, ArenaFilters, IceSlot} from '@/entities/arena/model'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-6.1.1 - Список арен
 * @spec SPEC-FR-6.1.2 - Фильтрация
 */
export function fetchArenas(filters: ArenaFilters = {}): Promise<Arena[]> {
  const params = new URLSearchParams()
  if (filters.query) params.set('q', filters.query)
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
