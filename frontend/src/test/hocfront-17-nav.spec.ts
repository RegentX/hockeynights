/**
 * HOCFRONT-17 / TASK-02-02
 * Rename sections, sync desktop↔mobile nav, notifications in header only.
 * Mobile bottom ≤5: core + sheet «Ещё».
 */

import {describe, expect, it} from 'vitest'

import {
  HEADER_ONLY_NAV_PATHS,
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
    expect(mobilePaths).toEqual([routes.events, routes.teams, routes.messenger, routes.profile])
    expect(mobilePaths).toHaveLength(4)
  })

  it('puts arenas, calendar, leagues and shops into mobile more sheet', () => {
    const more = resolveMobileMoreNavItems(makeSession())
    const morePaths = more.map((item) => item.to)

    expect(morePaths).toEqual([routes.arenas, routes.calendar, routes.leagues, routes.shops])
    expect(more.find((item) => item.to === routes.arenas)?.label).toBe(ARENAS_LABEL)
    expect(more.find((item) => item.to === routes.calendar)?.label).toBe('Календарь')
  })

  it('keeps calendar reachable from mobile more (desktop↔mobile sync)', () => {
    const desktopActive = resolvePlayerNavItems(makeSession())
      .filter((item) => item.tier === 'active')
      .map((item) => item.to)
    const morePaths = resolveMobileMoreNavItems(makeSession()).map((item) => item.to)

    expect(desktopActive).toContain(routes.calendar)
    expect(morePaths).toContain(routes.calendar)
  })

  it('keeps mobile primary paths as ordered subset of desktop active paths', () => {
    const desktopPaths = resolvePlayerNavItems(makeSession())
      .filter((item) => item.tier === 'active')
      .map((item) => item.to)
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
      makeSession(['organizer'], [{kind: 'shop', entityId: 'shop-1', entityName: 'Shop'}]),
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
})
