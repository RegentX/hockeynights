/**
 * SPEC-FR-2.3.1
 */

import type {PatchPlayerFavoritesPayload, PlayerFavorites} from '@/entities/player-favorites/model'
import {apiRequest} from '@/shared/api/client'

export function fetchPlayerFavorites(): Promise<PlayerFavorites> {
  return apiRequest<PlayerFavorites>('/players/favorites')
}

export function patchPlayerFavorites(
  payload: PatchPlayerFavoritesPayload,
): Promise<PlayerFavorites> {
  return apiRequest<PlayerFavorites>('/players/favorites', {method: 'PATCH', body: payload})
}
