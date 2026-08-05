/**
 * HOCFRONT-17 — простые монохромные иконки bottom nav / sheet «Ещё»
 * (currentColor → --hockey-nav-icon по теме).
 */

import {
  Calendar,
  Comment,
  Cup,
  Ellipsis,
  MapPin,
  Person,
  Persons,
  ShoppingBag,
  Timeline,
} from '@gravity-ui/icons'
import type {IconData} from '@gravity-ui/uikit'

import {routes} from '@/shared/const/appRoutes'

export const MOBILE_NAV_ICON_BY_PATH: Record<string, IconData> = {
  [routes.events]: Calendar,
  [routes.teams]: Persons,
  [routes.players]: Person,
  [routes.messenger]: Comment,
  [routes.profile]: Person,
  [routes.arenas]: MapPin,
  [routes.calendar]: Timeline,
  [routes.leagues]: Cup,
  [routes.shops]: ShoppingBag,
}

export const MOBILE_NAV_MORE_ICON: IconData = Ellipsis
