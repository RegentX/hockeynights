/**
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import type {PlayerListItem, PublicPlayerView} from '@/entities/profile/model'
import {apiRequest} from '@/shared/api/client'

/** @spec SPEC-FR-2.3.2, HOCFRONT-20 - Параметры фильтра игроков */
export interface PlayersFilterParams {
  /** @spec HOCFRONT-20 - Поиск по имени / городу / району */
  q?: string
  /** @spec SPEC-FR-2.3.2 */
  position?: PlayerPosition
  /** @spec SPEC-FR-2.3.2 - Уровень мастерства */
  skillLevel?: SkillLevel
  /** @spec SPEC-FR-2.3.2 */
  district?: string
  /** @spec SPEC-FR-2.3.2 */
  goalieOnly?: boolean
  /** @spec HOCFRONT-20 - Галочка подтверждения профиля */
  verified?: boolean
  /** @spec HOCFRONT-20 - Команда, в которой играет */
  teamId?: string
  /** @spec HOCFRONT-20 - Город */
  city?: string
}

/**
 * @spec SPEC-FR-2.3.1 - Список игроков
 * @spec SPEC-FR-2.3.2, HOCFRONT-20 - Фильтрация по имени, верификации, команде, городу
 */
export function fetchPlayers(filters: PlayersFilterParams = {}): Promise<PlayerListItem[]> {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  if (filters.position) params.set('position', filters.position)
  if (filters.skillLevel) params.set('skillLevel', filters.skillLevel)
  if (filters.district) params.set('district', filters.district)
  if (filters.goalieOnly) params.set('goalieOnly', 'true')
  if (filters.verified) params.set('verified', 'true')
  if (filters.teamId) params.set('teamId', filters.teamId)
  if (filters.city) params.set('city', filters.city)

  const query = params.toString()
  return apiRequest<PlayerListItem[]>(`/players${query ? `?${query}` : ''}`)
}

/** @spec SPEC-FR-24.1.3 - Публичный профиль игрока */
export function fetchPublicPlayer(userId: string): Promise<PublicPlayerView> {
  return apiRequest<PublicPlayerView>(`/players/${userId}`)
}
