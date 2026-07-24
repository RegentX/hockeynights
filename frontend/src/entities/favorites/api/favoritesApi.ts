/**
 * SPEC-FR-25.4.2 — profile quick actions
 * HOCFRONT-19 / TASK-02-04 — entity favorites API
 */

import type {
  AddFavoritePayload,
  Favorite,
  FavoritesListResponse,
  PatchProfileFavoritesPayload,
  ProfileFavorites,
} from '@/entities/favorites/model'
import {apiRequest} from '@/shared/api/client'

export function fetchProfileFavorites(): Promise<ProfileFavorites> {
  return apiRequest<ProfileFavorites>('/profile/favorites')
}

export function patchProfileFavorites(
  payload: PatchProfileFavoritesPayload,
): Promise<ProfileFavorites> {
  return apiRequest<ProfileFavorites>('/profile/favorites', {method: 'PATCH', body: payload})
}

export function fetchFavorites(): Promise<FavoritesListResponse> {
  return apiRequest<FavoritesListResponse>('/favorites')
}

export function addFavorite(payload: AddFavoritePayload): Promise<Favorite> {
  return apiRequest<Favorite>('/favorites', {method: 'POST', body: payload})
}

export function removeFavorite(favoriteId: string): Promise<void> {
  return apiRequest<void>(`/favorites/${encodeURIComponent(favoriteId)}`, {method: 'DELETE'})
}
