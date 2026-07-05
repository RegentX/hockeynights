/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import type {PlayerPosition, SkillLevel} from '@/entities/common/types'
import type {PlayerListItem, PublicPlayerView} from '@/entities/profile/types'
import {apiRequest} from '@/shared/api/client'

/** @spec SPEC-FR-2.3.2 - Параметры фильтра игроков */
export interface PlayersFilterParams {
  position?: PlayerPosition
  skillLevel?: SkillLevel
  district?: string
  goalieOnly?: boolean
}

/**
 * @spec SPEC-FR-2.3.1 - Список игроков
 * @spec SPEC-FR-2.3.2 - Фильтрация
 */
export function fetchPlayers(filters: PlayersFilterParams = {}): Promise<PlayerListItem[]> {
  const params = new URLSearchParams()
  if (filters.position) params.set('position', filters.position)
  if (filters.skillLevel) params.set('skillLevel', filters.skillLevel)
  if (filters.district) params.set('district', filters.district)
  if (filters.goalieOnly) params.set('goalieOnly', 'true')

  const query = params.toString()
  return apiRequest<PlayerListItem[]>(`/players${query ? `?${query}` : ''}`)
}

/** @spec SPEC-FR-24.1.3 - Публичный профиль игрока */
export function fetchPublicPlayer(userId: string): Promise<PublicPlayerView> {
  return apiRequest<PublicPlayerView>(`/players/${userId}`)
}
