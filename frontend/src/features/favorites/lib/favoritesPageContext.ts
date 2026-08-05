/**
 * HOCFRONT-19 — контекст избранного по текущему маршруту.
 */

import type {FavoriteType} from '@/entities/favorites'
import {FAVORITE_TYPE_LABELS} from '@/entities/favorites'
import {routes} from '@/shared/const/appRoutes'

export interface FavoritesPageContext {
  /** null = показать всё (профиль / прочие экраны) */
  type: FavoriteType | null
  label: string
}

export function resolveFavoritesPageContext(pathname: string): FavoritesPageContext {
  if (pathname.startsWith(routes.events) || pathname.startsWith('/events/')) {
    return {type: 'training', label: FAVORITE_TYPE_LABELS.training}
  }
  if (pathname.startsWith(routes.teams)) {
    return {type: 'team', label: FAVORITE_TYPE_LABELS.team}
  }
  if (pathname.startsWith(routes.players)) {
    return {type: 'player', label: FAVORITE_TYPE_LABELS.player}
  }
  if (pathname.startsWith(routes.arenas)) {
    return {type: 'arena', label: FAVORITE_TYPE_LABELS.arena}
  }
  if (pathname.startsWith(routes.leagues)) {
    return {type: 'league', label: FAVORITE_TYPE_LABELS.league}
  }
  if (pathname.startsWith(routes.shops)) {
    return {type: 'product', label: FAVORITE_TYPE_LABELS.product}
  }
  return {type: null, label: 'Все типы'}
}
