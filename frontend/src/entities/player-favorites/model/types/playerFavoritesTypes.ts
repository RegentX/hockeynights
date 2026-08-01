/**
 * SPEC-FR-2.3.1
 * Избранные игроки каталога (playerId-список).
 */

export interface PlayerFavorites {
  playerIds: string[]
  updatedAt: string
}

export interface PatchPlayerFavoritesPayload {
  playerIds: string[]
}
