/**
 * HOCFRONT-17 / TASK-02-02
 * Rename sections, sync desktop↔mobile nav, notifications in header only.
 * Mobile bottom ≤5: core + sheet «Ещё».
 */

import {describe, expect, it} from 'vitest'

import {
  HEADER_ONLY_NAV_PATHS,
  isMobileNavItemActive,
  MVP_HIDDEN_NAV_PATHS,
  resolveMobileMoreNavItems,
  resolveMobileNavItems,
  resolveNavItems,
  resolvePartnerNavItems,
  resolvePlayerNavItems,
} from '@/features/access'
import {ARENAS_LABEL, EVENTS_LABEL, EVENTS_MOBILE_LABEL} from '@/shared/config/navigationLabels'
import {routes} from '@/shared/const/appRoutes'
import type {Session} from '@/shared/types/user'

function makeSession(
  roles: Session['user']['roles'] = ['player'],
  partnerMemberships?: Session['user']['partnerMemberships'],
): Session {
  return {
    isOnboarded: true,
    user: {
      id: 'user-001',
      displayName: 'Тест',
      roles,
      city: 'Москва',
      createdAt: '2026-01-01T00:00:00Z',
      partnerMemberships,
    },
  }
}

describe('HOCFRONT-17 nav rename and sync', () => {
  it('uses customer labels for events and arenas on desktop', () => {
    const items = resolvePlayerNavItems(makeSession())
    expect(items.find((item) => item.to === routes.events)?.label).toBe(EVENTS_LABEL)
    expect(items.find((item) => item.to === routes.arenas)?.label).toBe(ARENAS_LABEL)
  })

  it('uses short mobile label for events and same labels otherwise', () => {
    const desktop = resolvePlayerNavItems(makeSession())
    const mobile = resolveMobileNavItems(makeSession())

    expect(mobile.find((item) => item.to === routes.events)?.label).toBe(EVENTS_MOBILE_LABEL)
    expect(mobile.find((item) => item.to === routes.messenger)?.label).toBe(
      desktop.find((item) => item.to === routes.messenger)?.label,
    )
  })

  it('keeps mobile primary bar to at most 4 core routes (5th slot is Ещё UI)', () => {
    const mobilePaths = resolveMobileNavItems(makeSession()).map((item) => item.to)
    expect(mobilePaths).toEqual([routes.events, routes.teams, routes.messenger, routes.calendar])
    expect(mobilePaths).toHaveLength(4)
  })

  it('puts arenas, leagues, shops and players into mobile more sheet', () => {
    const more = resolveMobileMoreNavItems(makeSession())
    const morePaths = more.map((item) => item.to)

    expect(morePaths).toEqual([routes.arenas, routes.leagues, routes.shops, routes.players])
    expect(more.find((item) => item.to === routes.arenas)?.label).toBe(ARENAS_LABEL)
    expect(more.find((item) => item.to === routes.players)?.label).toBe('Игроки')
  })

  it('keeps calendar reachable from mobile primary (desktop↔mobile sync)', () => {
    const desktopPaths = resolvePlayerNavItems(makeSession()).map((item) => item.to)
    const mobilePaths = resolveMobileNavItems(makeSession()).map((item) => item.to)

    expect(desktopPaths).toContain(routes.calendar)
    expect(mobilePaths).toContain(routes.calendar)
  })

  it('keeps messenger in the released catalog and the rest under incubating', () => {
    const items = resolvePlayerNavItems(makeSession())
    const messenger = items.find((item) => item.to === routes.messenger)

    expect(messenger?.tier).toBe('active')
    expect(
      items.filter((item) => item.to !== routes.messenger).every((i) => i.tier === 'incubating'),
    ).toBe(true)
    expect(items.map((item) => item.to)).not.toContain(routes.profile)
  })

  it('keeps mobile primary paths as ordered subset of desktop paths', () => {
    const desktopPaths = resolvePlayerNavItems(makeSession()).map((item) => item.to)
    const mobilePaths = resolveMobileNavItems(makeSession()).map((item) => item.to)

    expect(mobilePaths.length).toBeGreaterThan(0)
    for (const path of mobilePaths) {
      expect(desktopPaths).toContain(path)
    }

    const desktopIndex = (path: string) => desktopPaths.indexOf(path)
    for (let i = 1; i < mobilePaths.length; i += 1) {
      expect(desktopIndex(mobilePaths[i]!)).toBeGreaterThan(desktopIndex(mobilePaths[i - 1]!))
    }
  })

  it('does not put notifications into side or bottom nav (header-only entry)', () => {
    expect(HEADER_ONLY_NAV_PATHS).toContain(routes.notifications)

    const desktop = resolveNavItems(makeSession()).map((item) => item.to)
    const mobile = resolveMobileNavItems(makeSession()).map((item) => item.to)
    const more = resolveMobileMoreNavItems(makeSession()).map((item) => item.to)
    const partner = resolvePartnerNavItems(
      makeSession([], [{kind: 'shop', entityId: 'shop-1', entityName: 'Shop'}]),
    ).map((item) => item.to)

    expect(desktop).not.toContain(routes.notifications)
    expect(mobile).not.toContain(routes.notifications)
    expect(more).not.toContain(routes.notifications)
    expect(partner).not.toContain(routes.notifications)
  })

  it('hides SOS / IQ / Highlight from desktop and mobile nav', () => {
    const desktop = resolvePlayerNavItems(makeSession()).map((item) => item.to)
    const mobile = resolveMobileNavItems(makeSession()).map((item) => item.to)
    const more = resolveMobileMoreNavItems(makeSession()).map((item) => item.to)

    for (const hidden of MVP_HIDDEN_NAV_PATHS) {
      expect(desktop).not.toContain(hidden)
      expect(mobile).not.toContain(hidden)
      expect(more).not.toContain(hidden)
    }
  })

  it('does not mark partner hub active on nested cabinet routes', () => {
    const cabinetPath = '/partner/arenas/arena-001'
    expect(isMobileNavItemActive(cabinetPath, cabinetPath)).toBe(true)
    expect(isMobileNavItemActive(cabinetPath, routes.partner)).toBe(false)
    expect(isMobileNavItemActive(routes.partner, routes.partner)).toBe(true)
    expect(isMobileNavItemActive('/arenas/arena-001', routes.arenas)).toBe(true)
  })
})
