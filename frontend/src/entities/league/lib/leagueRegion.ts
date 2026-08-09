/**
 * HOCFRONT-34A — Москва / Россия
 */

import type {LeagueRegionFilter} from '@/entities/league/model'

const MOSCOW_REGIONS = new Set(['москва', 'moscow'])

export function resolveLeagueRegion(region: string): LeagueRegionFilter {
  return MOSCOW_REGIONS.has(region.trim().toLowerCase()) ? 'moscow' : 'russia'
}

export const LEAGUE_REGION_LABELS: Record<LeagueRegionFilter, string> = {
  moscow: 'Москва',
  russia: 'Россия',
}
