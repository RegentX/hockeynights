/**
 * HOCFRONT-19 — ссылки на сущности из избранного.
 */

import type {FavoriteType} from '@/entities/favorites/model'
import {arenaDetailsPath, routes} from '@/shared/const/appRoutes'

export function buildFavoriteHref(type: FavoriteType, entityId: string): string {
  switch (type) {
    case 'player':
      return `/players/${entityId}`
    case 'team':
      return `/teams/${entityId}`
    case 'training':
      return `/events/trainings/${entityId}`
    case 'arena':
      return arenaDetailsPath(entityId)
    case 'product':
      return `${routes.shops}?productId=${encodeURIComponent(entityId)}`
    case 'league':
      return `${routes.leagues}?leagueId=${encodeURIComponent(entityId)}`
    default: {
      const _exhaustive: never = type
      return _exhaustive
    }
  }
}

export function favoriteKey(type: FavoriteType, entityId: string): string {
  return `${type}:${entityId}`
}

export const FAVORITE_TYPE_LABELS: Record<FavoriteType, string> = {
  player: 'Игроки',
  team: 'Команды',
  training: 'Тренировки',
  arena: 'Ледовые арены',
  product: 'Товары',
  league: 'Лиги',
}

export const FAVORITE_TYPE_ORDER: FavoriteType[] = [
  'training',
  'player',
  'team',
  'arena',
  'league',
  'product',
]
