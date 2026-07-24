/**
 * SPEC-FR-25.4.2 — быстрые действия профиля (legacy)
 * HOCFRONT-19 / TASK-02-04 — entity favorites
 */

/** Быстрые действия в SideBoard (nav shortcuts). */
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

/** Типы избранных сущностей (TASK-02-04). */
export type FavoriteType = 'player' | 'team' | 'training' | 'arena' | 'product' | 'league'

/**
 * Единый идентификатор: type + entityId.
 * `id` = `${type}:${entityId}` для стабильного ключа в mock/UI.
 */
export interface Favorite {
  id: string
  type: FavoriteType
  entityId: string
  title: string
  href: string
  createdAt: string
}

export interface AddFavoritePayload {
  type: FavoriteType
  entityId: string
  title: string
  href?: string
}

export interface FavoritesListResponse {
  items: Favorite[]
}
