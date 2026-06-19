/**
 * SPEC-FR-1.2.1, SPEC-FR-1.3.7, SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import type {Session} from '@/entities/user/types'
import {
  getPrimaryPartnerPath,
  shouldUsePartnerWorkspace,
} from '@/features/partners/sessionPersona'

export interface NavItem {
  to: string
  label: string
}

export const PLAYER_NAV_ITEMS: NavItem[] = [
  {to: '/profile', label: 'Профиль'},
  {to: '/players', label: 'Игроки'},
  {to: '/teams', label: 'Команды'},
  {to: '/events', label: 'События'},
  {to: '/calendar', label: 'Календарь'},
  {to: '/sos', label: 'SOS'},
  {to: '/arenas', label: 'Катки'},
  {to: '/leagues', label: 'Лиги'},
  {to: '/shops', label: 'Маркет'},
  {to: '/iq', label: 'IQ'},
  {to: '/radar', label: 'Радар'},
  {to: '/highlights', label: 'Моменты'},
  {to: '/feedback', label: 'Feedback'},
  {to: '/notifications', label: 'Уведомления'},
  {to: '/messenger', label: 'Мессенджер'},
  {to: '/admin', label: 'Admin'},
]

export const MOBILE_PLAYER_NAV: Array<NavItem & {icon: string}> = [
  {to: '/events', label: 'События', icon: '🏒'},
  {to: '/players', label: 'Игроки', icon: '👤'},
  {to: '/teams', label: 'Команды', icon: '🛡'},
  {to: '/messenger', label: 'Чат', icon: '💬'},
  {to: '/iq', label: 'IQ', icon: '🎯'},
  {to: '/arenas', label: 'Катки', icon: '🧊'},
  {to: '/shops', label: 'Маркет', icon: '🛍'},
  {to: '/profile', label: 'Профиль', icon: '⚙'},
]

function partnerCatalogItems(session: Session): NavItem[] {
  const memberships = session.user.partnerMemberships ?? []
  const items: NavItem[] = []
  if (memberships.some((m) => m.kind === 'league')) {
    items.push({to: '/leagues', label: 'Каталог лиг'})
  }
  if (memberships.some((m) => m.kind === 'shop')) {
    items.push({to: '/shops', label: 'Маркет'})
  }
  return items
}

/** Навигация для представителя магазина/лиги */
export function resolvePartnerNavItems(session: Session): NavItem[] {
  return [
    {to: getPrimaryPartnerPath(session), label: 'Кабинет'},
    {to: '/partner', label: 'Все кабинеты'},
    {to: '/notifications', label: 'Уведомления'},
    ...partnerCatalogItems(session),
  ]
}

export function resolvePlayerNavItems(session: Session): NavItem[] {
  const isAdmin = session.user.roles.includes('admin')
  return PLAYER_NAV_ITEMS.filter((item) => item.to !== '/admin' || isAdmin)
}

export function resolveNavItems(session: Session | undefined): NavItem[] {
  if (!session?.isOnboarded) return PLAYER_NAV_ITEMS
  if (shouldUsePartnerWorkspace(session)) return resolvePartnerNavItems(session)
  return resolvePlayerNavItems(session)
}

export function resolveMobileNavItems(
  session: Session | undefined,
): Array<NavItem & {icon: string}> {
  if (!session?.isOnboarded) return MOBILE_PLAYER_NAV
  if (shouldUsePartnerWorkspace(session)) {
    return [
      {to: getPrimaryPartnerPath(session), label: 'Кабинет', icon: '🏪'},
      {to: '/partner', label: 'Партнёр', icon: '📋'},
      {to: '/notifications', label: 'Уведомления', icon: '🔔'},
      ...partnerCatalogItems(session).map((item) => ({
        ...item,
        icon: item.to === '/leagues' ? '🏆' : '🛍',
      })),
    ]
  }
  const isAdmin = session.user.roles.includes('admin')
  return MOBILE_PLAYER_NAV.filter((item) => item.to !== '/admin' || isAdmin)
}

export function getPersonaHomePath(session: Session): string {
  if (shouldUsePartnerWorkspace(session)) return getPrimaryPartnerPath(session)
  if (session.user.roles.includes('admin')) return '/admin'
  return '/profile'
}

/** Разрешённые префиксы маршрутов для текущей персоны */
export function getAllowedPathPrefixes(session: Session): string[] {
  if (shouldUsePartnerWorkspace(session)) {
    const prefixes = ['/partner', '/notifications']
    const memberships = session.user.partnerMemberships ?? []
    if (memberships.some((m) => m.kind === 'league')) prefixes.push('/leagues')
    if (memberships.some((m) => m.kind === 'shop')) prefixes.push('/shops')
    return prefixes
  }

  if (session.user.roles.includes('admin')) {
    return [
      '/profile',
      '/players',
      '/teams',
      '/events',
      '/calendar',
      '/sos',
      '/arenas',
      '/leagues',
      '/shops',
      '/iq',
      '/radar',
      '/highlights',
      '/feedback',
      '/notifications',
      '/messenger',
      '/admin',
      '/partner',
    ]
  }

  return [
    '/profile',
    '/players',
    '/teams',
    '/events',
    '/calendar',
    '/sos',
    '/arenas',
    '/leagues',
    '/shops',
    '/iq',
    '/radar',
    '/highlights',
    '/feedback',
    '/notifications',
    '/messenger',
    '/partner',
  ]
}

export function isPathAllowed(session: Session | undefined, pathname: string): boolean {
  if (!session?.isOnboarded) return true
  if (pathname === '/') return true
  return getAllowedPathPrefixes(session).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
