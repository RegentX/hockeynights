/**
 * HOCFRONT-32A — Москва / Подмосковье
 */

import type {ArenaCityRegion} from '@/entities/arena/model'

const MOSCOW_CITIES = new Set(['москва', 'moscow'])

export function resolveArenaCityRegion(city: string): ArenaCityRegion {
  return MOSCOW_CITIES.has(city.trim().toLowerCase()) ? 'moscow' : 'moscow_oblast'
}

export const ARENA_CITY_REGION_LABELS: Record<ArenaCityRegion, string> = {
  moscow: 'Москва',
  moscow_oblast: 'Подмосковье',
}
