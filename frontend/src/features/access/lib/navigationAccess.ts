/**
 * SPEC-FR-1.2.1, SPEC-FR-1.3.7, SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {
  getPrimaryPartnerPath,
  shouldUsePartnerWorkspace,
} from '@/features/access/lib/sessionPersona'
import {ARENAS_LABEL, EVENTS_LABEL, EVENTS_MOBILE_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import type {Session} from '@/shared/types/user'

export type NavTier = 'active' | 'incubating'

export interface NavItem {
  to: string
  label: string
  tier: NavTier
}

export const PLAYER_NAV_ITEMS: NavItem[] = [
  {to: routes.profile, label: 'Профиль', tier: 'active'},
  {to: routes.players, label: 'Поиск тренировок', tier: 'incubating'},
  {to: routes.teams, label: 'Команды', tier: 'active'},
  {to: routes.events, label: EVENTS_LABEL, tier: 'active'},
  {to: routes.calendar, label: 'Календарь', tier: 'active'},
  {to: routes.sos, label: 'SOS', tier: 'active'},
  {to: routes.arenas, label: ARENAS_LABEL, tier: 'active'},
  {to: routes.leagues, label: 'Лиги', tier: 'active'},
  {to: routes.shops, label: 'Маркет', tier: 'active'},
  {to: routes.iq, label: 'IQ', tier: 'incubating'},
  {to: routes.highlights, label: 'Моменты', tier: 'incubating'},
  {to: routes.feedback, label: 'Feedback', tier: 'incubating'},
  {to: routes.notifications, label: 'Уведомления', tier: 'active'},
  {to: routes.messenger, label: 'Мессенджер', tier: 'active'},
  {to: routes.admin, label: 'Admin', tier: 'incubating'},
]

export const MOBILE_PLAYER_NAV: Array<NavItem & {icon: string}> = [
  {to: routes.events, label: EVENTS_MOBILE_LABEL, icon: '🏒', tier: 'active'},
  {to: routes.players, label: 'Поиск тренировок', icon: '👤', tier: 'incubating'},
  {to: routes.teams, label: 'Команды', icon: '🛡', tier: 'active'},
  {to: routes.messenger, label: 'Чат', icon: '💬', tier: 'active'},
  {to: routes.arenas, label: ARENAS_LABEL, icon: '🧊', tier: 'active'},
  {to: routes.shops, label: 'Маркет', icon: '🛍', tier: 'active'},
  {to: routes.profile, label: 'Профиль', icon: '⚙', tier: 'active'},
]

function partnerCatalogItems(session: Session): NavItem[] {
  const memberships = session.user.partnerMemberships ?? []
  const items: NavItem[] = []
  if (memberships.some((m) => m.kind === 'league')) {
    items.push({to: routes.leagues, label: 'Каталог лиг', tier: 'active'})
  }
  if (memberships.some((m) => m.kind === 'shop')) {
    items.push({to: routes.shops, label: 'Маркет', tier: 'active'})
  }
  return items
}

/** Навигация для представителя магазина/лиги */
export function resolvePartnerNavItems(session: Session): NavItem[] {
  return [
    {to: getPrimaryPartnerPath(session), label: 'Кабинет', tier: 'active'},
    {to: routes.partner, label: 'Все кабинеты', tier: 'active'},
    {to: routes.notifications, label: 'Уведомления', tier: 'active'},
    ...partnerCatalogItems(session),
  ]
}

export function resolvePlayerNavItems(session: Session): NavItem[] {
  const isAdmin = session.user.roles.includes('admin')
  return PLAYER_NAV_ITEMS.filter((item) => item.to !== routes.admin || isAdmin)
}

export function resolveNavItems(session: Session | undefined): NavItem[] {
  if (!session?.isOnboarded) return PLAYER_NAV_ITEMS
  if (shouldUsePartnerWorkspace(session)) return resolvePartnerNavItems(session)
  return resolvePlayerNavItems(session)
}

export function splitNavItemsByTier(
  items: NavItem[],
): {active: NavItem[]; incubating: NavItem[]} {
  return {
    active: items.filter((item) => item.tier === 'active'),
    incubating: items.filter((item) => item.tier === 'incubating'),
  }
}

export function resolveMobileNavItems(
  session: Session | undefined,
): Array<NavItem & {icon: string}> {
  if (!session?.isOnboarded) return MOBILE_PLAYER_NAV.filter((item) => item.tier === 'active')
  if (shouldUsePartnerWorkspace(session)) {
    return [
      {to: getPrimaryPartnerPath(session), label: 'Кабинет', icon: '🏪', tier: 'active' as NavTier},
      {to: routes.partner, label: 'Партнёр', icon: '📋', tier: 'active' as NavTier},
      {to: routes.notifications, label: 'Уведомления', icon: '🔔', tier: 'active' as NavTier},
      ...partnerCatalogItems(session).map((item) => ({
        ...item,
        icon: item.to === routes.leagues ? '🏆' : '🛍',
      })),
    ].filter((item) => item.tier === 'active')
  }
  const isAdmin = session.user.roles.includes('admin')
  return MOBILE_PLAYER_NAV.filter(
    (item) => item.tier === 'active' && (item.to !== routes.admin || isAdmin),
  )
}

export function getPersonaHomePath(session: Session): string {
  if (shouldUsePartnerWorkspace(session)) return getPrimaryPartnerPath(session)
  if (session.user.roles.includes('admin')) return routes.admin
  return routes.profile
}

const ADMIN_ALLOWED_PREFIXES = [
  routes.profile,
  routes.players,
  routes.teams,
  routes.events,
  routes.calendar,
  routes.sos,
  routes.arenas,
  routes.leagues,
  routes.shops,
  routes.iq,
  routes.highlights,
  routes.feedback,
  routes.notifications,
  routes.messenger,
  routes.admin,
  routes.partner,
] as const

const PLAYER_ALLOWED_PREFIXES = [
  routes.profile,
  routes.players,
  routes.teams,
  routes.events,
  routes.calendar,
  routes.sos,
  routes.arenas,
  routes.leagues,
  routes.shops,
  routes.iq,
  routes.highlights,
  routes.feedback,
  routes.notifications,
  routes.messenger,
  routes.partner,
] as const

/** Разрешённые префиксы маршрутов для текущей персоны */
export function getAllowedPathPrefixes(session: Session): string[] {
  if (shouldUsePartnerWorkspace(session)) {
    const prefixes: string[] = [routes.partner, routes.notifications]
    const memberships = session.user.partnerMemberships ?? []
    if (memberships.some((m) => m.kind === 'league')) prefixes.push(routes.leagues)
    if (memberships.some((m) => m.kind === 'shop')) prefixes.push(routes.shops)
    return prefixes
  }

  if (session.user.roles.includes('admin')) {
    return [...ADMIN_ALLOWED_PREFIXES]
  }

  return [...PLAYER_ALLOWED_PREFIXES]
}

export function isPathAllowed(session: Session | undefined, pathname: string): boolean {
  if (!session?.isOnboarded) return true
  if (pathname === routes.home) return true
  const prefixes = session.allowedPathPrefixes ?? getAllowedPathPrefixes(session)
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}
