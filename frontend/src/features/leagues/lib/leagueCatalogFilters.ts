/**
 * HOCFRONT-34A — chips / счётчик фильтров каталога лиг (как arenas catalog)
 */

import type {LeagueFilters} from '@/entities/league'

export type LeagueCatalogChipId =
  'moscow' | 'russia' | 'recruiting_open' | 'beginner' | 'amateur' | 'advanced'

export const LEAGUE_CATALOG_CHIPS: Array<{id: LeagueCatalogChipId; label: string}> = [
  {id: 'moscow', label: 'Москва'},
  {id: 'russia', label: 'Россия'},
  {id: 'recruiting_open', label: 'Набор открыт'},
  {id: 'beginner', label: 'Дебютант'},
  {id: 'amateur', label: 'Любитель'},
  {id: 'advanced', label: 'Продвинутый'},
]

export function countActiveLeagueFilters(filters: LeagueFilters): number {
  let count = 0
  if (filters.query?.trim()) count += 1
  if (filters.region) count += 1
  if (filters.level) count += 1
  if (filters.recruitingStatus) count += 1
  return count
}

export function isLeagueCatalogChipActive(
  chipId: LeagueCatalogChipId,
  filters: LeagueFilters,
): boolean {
  switch (chipId) {
    case 'moscow':
      return filters.region === 'moscow'
    case 'russia':
      return filters.region === 'russia'
    case 'recruiting_open':
      return filters.recruitingStatus === 'open'
    case 'beginner':
      return filters.level === 'beginner'
    case 'amateur':
      return filters.level === 'amateur'
    case 'advanced':
      return filters.level === 'advanced'
    default:
      return false
  }
}

export function toggleLeagueCatalogChip(
  chipId: LeagueCatalogChipId,
  filters: LeagueFilters,
): LeagueFilters {
  const next = {...filters}
  switch (chipId) {
    case 'moscow':
      next.region = filters.region === 'moscow' ? undefined : 'moscow'
      break
    case 'russia':
      next.region = filters.region === 'russia' ? undefined : 'russia'
      break
    case 'recruiting_open':
      next.recruitingStatus = filters.recruitingStatus === 'open' ? undefined : 'open'
      break
    case 'beginner':
      next.level = filters.level === 'beginner' ? undefined : 'beginner'
      break
    case 'amateur':
      next.level = filters.level === 'amateur' ? undefined : 'amateur'
      break
    case 'advanced':
      next.level = filters.level === 'advanced' ? undefined : 'advanced'
      break
  }
  return next
}
