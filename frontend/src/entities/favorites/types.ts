/**
 * SPEC-FR-25.4.2
 * Избранные быстрые действия профиля.
 */

export interface FavoriteAction {
  id: string
  label: string
  path: string
  icon?: string
}

export interface ProfileFavorites {
  actions: FavoriteAction[]
  updatedAt: string
}

export interface PatchProfileFavoritesPayload {
  actions: FavoriteAction[]
}
