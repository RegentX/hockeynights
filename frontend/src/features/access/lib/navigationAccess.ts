/**
 * SPEC-FR-1.2.1, SPEC-FR-1.3.7, SPEC-FR-24.5.3, SPEC-FR-24.7.3
 * HOCFRONT-17 / TASK-02-02 — rename, sync desktop↔mobile, notifications in top bar
 */

import {hasTrainingOrganizerRole} from '@/features/access/lib/organizerAccess'
import {
  getPrimaryPartnerPath,
  shouldUsePartnerWorkspace,
} from '@/features/access/lib/sessionPersona'
import {
  ARENAS_LABEL,
  EVENTS_LABEL,
  EVENTS_MOBILE_LABEL,
  LEAGUES_LABEL,
} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import type {Session} from '@/shared/types/user'

export type NavTier = 'active' | 'incubating'

export interface NavItem {
  to: string
  label: string
  tier: NavTier
}

/**
 * HOCFRONT-15 / TASK-01-05 / TASK-02-02 — скрыты из MVP-меню.
 * Маршруты и код страниц остаются; прямые URL работают через allowed prefixes.
 */
export const MVP_HIDDEN_NAV_PATHS = [routes.sos, routes.iq, routes.highlights] as const

const isMvpHiddenNavPath = (path: string) =>
  (MVP_HIDDEN_NAV_PATHS as readonly string[]).includes(path)

/** Уведомления живут в header top bar, не в side/bottom nav. */
export const HEADER_ONLY_NAV_PATHS = [routes.notifications] as const

const isHeaderOnlyNavPath = (path: string) =>
  (HEADER_ONLY_NAV_PATHS as readonly string[]).includes(path)

/**
 * Единый источник пунктов для desktop left nav и mobile bottom nav.
 * Порядок совпадает; mobile берёт subset + короткие labels где заданы.
 * Сейчас все пункты в incubating («Требует доработки»); профиль — только через header.
 */
export const PLAYER_NAV_ITEMS: NavItem[] = [
  {to: routes.events, label: EVENTS_LABEL, tier: 'incubating'},
  {to: routes.teams, label: 'Команды', tier: 'incubating'},
  {to: routes.messenger, label: 'Мессенджер', tier: 'incubating'},
  {to: routes.arenas, label: ARENAS_LABEL, tier: 'incubating'},
  {to: routes.leagues, label: LEAGUES_LABEL, tier: 'incubating'},
  {to: routes.shops, label: 'Маркет', tier: 'incubating'},
  {to: routes.calendar, label: 'Календарь', tier: 'incubating'},
  {to: routes.players, label: 'Игроки', tier: 'incubating'},
  // SOS / IQ / Highlight — стратегический код, скрыты из MVP-навигации
  {to: routes.sos, label: 'SOS', tier: 'incubating'},
  {to: routes.iq, label: 'IQ', tier: 'incubating'},
  {to: routes.highlights, label: 'Моменты', tier: 'incubating'},
  {to: routes.feedback, label: 'Feedback', tier: 'incubating'},
  {to: routes.admin, label: 'Admin', tier: 'incubating'},
]

const NAV_ICONS: Record<string, string> = {
  [routes.events]: '🏒',
  [routes.teams]: '🛡',
  [routes.messenger]: '💬',
  [routes.arenas]: '🧊',
  [routes.leagues]: '🏆',
  [routes.shops]: '🛍',
  [routes.calendar]: '📅',
  [routes.players]: '👤',
  [routes.partner]: '📋',
}

/** Короткие mobile labels (остальное = desktop label). */
const MOBILE_SHORT_LABELS: Partial<Record<string, string>> = {
  [routes.events]: EVENTS_MOBILE_LABEL,
}

/**
 * Mobile bottom nav — максимум 5 слотов: core + «Ещё».
 * Каталоги (арены / лиги / маркет) живут в sheet.
 * Профиль открывается из header, не из bottom nav.
 */
const MOBILE_PRIMARY_PATHS = [
  routes.events,
  routes.teams,
  routes.messenger,
  routes.calendar,
] as const

const MOBILE_MORE_PATHS = [routes.arenas, routes.leagues, routes.shops, routes.players] as const

/** @deprecated legacy flat list — для совместимости; bottom = primary + more */
const MOBILE_PLAYER_PATHS = [...MOBILE_PRIMARY_PATHS, ...MOBILE_MORE_PATHS] as const

/** @deprecated используйте resolveMobileNavItems — оставлено для тестов/импортов */
export const MOBILE_PLAYER_NAV: Array<NavItem & {icon: string}> = MOBILE_PLAYER_PATHS.map((to) => {
  const base = PLAYER_NAV_ITEMS.find((item) => item.to === to)!
  return {
    ...base,
    label: MOBILE_SHORT_LABELS[to] ?? base.label,
    icon: NAV_ICONS[to] ?? '•',
  }
})

function partnerCatalogItems(session: Session): NavItem[] {
  const memberships = session.user.partnerMemberships ?? []
  const items: NavItem[] = []
  if (memberships.some((m) => m.kind === 'league')) {
    items.push({to: routes.leagues, label: LEAGUES_LABEL, tier: 'active'})
  }
  if (memberships.some((m) => m.kind === 'shop')) {
    items.push({to: routes.shops, label: 'Маркет', tier: 'active'})
  }
  if (memberships.some((m) => m.kind === 'club')) {
    items.push({to: routes.teams, label: 'Команды', tier: 'active'})
    items.push({to: routes.players, label: 'Игроки', tier: 'active'})
    items.push({to: routes.shops, label: 'Маркет', tier: 'active'})
    items.push({to: routes.messenger, label: 'Мессенджер', tier: 'active'})
    items.push({to: routes.events, label: EVENTS_LABEL, tier: 'active'})
  }
  if (memberships.some((m) => m.kind === 'arena')) {
    items.push({to: routes.arenas, label: 'Ледовые арены', tier: 'active'})
  }
  return items
}

function filterSideNavItems(items: NavItem[]): NavItem[] {
  return items.filter((item) => !isMvpHiddenNavPath(item.to) && !isHeaderOnlyNavPath(item.to))
}

/** Навигация для представителя магазина/лиги (без уведомлений — они в top bar). */
export function resolvePartnerNavItems(session: Session): NavItem[] {
  return [
    {to: getPrimaryPartnerPath(session), label: 'Кабинет', tier: 'active'},
    {to: routes.partner, label: 'Все кабинеты', tier: 'active'},
    ...partnerCatalogItems(session),
  ]
}

export function resolvePlayerNavItems(session: Session): NavItem[] {
  const isAdmin = session.user.roles.includes('admin')
  return filterSideNavItems(PLAYER_NAV_ITEMS.filter((item) => item.to !== routes.admin || isAdmin))
}

export function resolveNavItems(session: Session | undefined): NavItem[] {
  if (!session?.isOnboarded) return filterSideNavItems(PLAYER_NAV_ITEMS)
  if (shouldUsePartnerWorkspace(session)) return resolvePartnerNavItems(session)
  return resolvePlayerNavItems(session)
}

export function splitNavItemsByTier(items: NavItem[]): {active: NavItem[]; incubating: NavItem[]} {
  return {
    active: items.filter((item) => item.tier === 'active'),
    incubating: items.filter((item) => item.tier === 'incubating'),
  }
}

function toMobileItem(item: NavItem): NavItem & {icon: string} {
  return {
    ...item,
    label: MOBILE_SHORT_LABELS[item.to] ?? item.label,
    icon: NAV_ICONS[item.to] ?? '•',
  }
}

export function resolveMobileNavItems(
  session: Session | undefined,
): Array<NavItem & {icon: string}> {
  if (session?.isOnboarded && shouldUsePartnerWorkspace(session)) {
    return [
      {to: getPrimaryPartnerPath(session), label: 'Кабинет', icon: '🏪', tier: 'active' as NavTier},
      {to: routes.partner, label: 'Партнёр', icon: '📋', tier: 'active' as NavTier},
      ...partnerCatalogItems(session).map(toMobileItem),
    ].filter((item) => item.tier === 'active')
  }

  const desktopItems = resolveNavItems(session)
  const byPath = new Map(desktopItems.map((item) => [item.to, item]))

  return MOBILE_PRIMARY_PATHS.map((path) => byPath.get(path))
    .filter((item): item is NavItem => item != null)
    .map(toMobileItem)
}

/** Пункты mobile sheet «Ещё»: арены, лиги, маркет (и др. каталоги). */
export function resolveMobileMoreNavItems(
  session: Session | undefined,
): Array<NavItem & {icon: string}> {
  if (session?.isOnboarded && shouldUsePartnerWorkspace(session)) {
    return []
  }

  const desktopItems = resolveNavItems(session)
  const byPath = new Map(desktopItems.map((item) => [item.to, item]))

  return MOBILE_MORE_PATHS.map((path) => byPath.get(path))
    .filter((item): item is NavItem => item != null)
    .map(toMobileItem)
}

export function isMobileMorePathActive(pathname: string): boolean {
  return MOBILE_MORE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * Active-state для bottom nav.
 * `/partner` — только exact match, иначе кабинет `/partner/arenas/:id`
 * подсвечивает и «Кабинет», и «Партнёр».
 */
export function isMobileNavItemActive(pathname: string, itemTo: string): boolean {
  if (itemTo === routes.partner) {
    return pathname === routes.partner
  }
  return pathname === itemTo || pathname.startsWith(`${itemTo}/`)
}

export function getPersonaHomePath(session: Session): string {
  if (shouldUsePartnerWorkspace(session)) return getPrimaryPartnerPath(session)
  if (session.user.roles.includes('admin')) return routes.admin
  // EPIC-08: самостоятельный организатор — сразу в кабинет тренировок
  if (hasTrainingOrganizerRole(session.user.roles) && !session.user.roles.includes('club_admin')) {
    return routes.eventsOrganizer
  }
  // HOCFRONT-15/17: SOS / IQ / Highlight не являются home path в MVP
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
    if (memberships.some((m) => m.kind === 'club')) {
      prefixes.push(
        routes.teams,
        routes.events,
        routes.players,
        routes.shops,
        routes.messenger,
        routes.calendar,
      )
    }
    if (memberships.some((m) => m.kind === 'arena')) {
      prefixes.push(routes.arenas, routes.calendar, routes.messenger, routes.players, routes.teams)
    }
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
