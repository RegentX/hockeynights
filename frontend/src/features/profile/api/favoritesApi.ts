/**
 * SPEC-FR-25.4.2
 */

import type {PatchProfileFavoritesPayload, ProfileFavorites} from '@/entities/favorites/types'
import {apiRequest} from '@/shared/api/client'

export function fetchProfileFavorites(): Promise<ProfileFavorites> {
  return apiRequest<ProfileFavorites>('/profile/favorites')
}

export function patchProfileFavorites(
  payload: PatchProfileFavoritesPayload,
): Promise<ProfileFavorites> {
  return apiRequest<ProfileFavorites>('/profile/favorites', {method: 'PATCH', body: payload})
}
