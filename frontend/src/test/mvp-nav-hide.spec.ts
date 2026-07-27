/**
 * HOCFRONT-15 / TASK-01-05
 * SOS / IQ / Highlight скрыты из MVP-навигации и из SideBoard «Избранное»;
 * маршруты остаются доступны по прямому URL.
 */

import {beforeEach, describe, expect, it} from 'vitest'

import {
  getPersonaHomePath,
  MVP_HIDDEN_NAV_PATHS,
  resolveMobileNavItems,
  resolveNavItems,
  resolvePlayerNavItems,
} from '@/features/access'
import {
  DEFAULT_FAVORITE_IDS,
  FAVORITE_ACTIONS_PRESET,
  getFavoriteIds,
  MVP_HIDDEN_FAVORITE_IDS,
  sanitizeFavoriteIds,
  setFavoriteIds,
} from '@/features/favorites/model'
import {routes} from '@/shared/const/appRoutes'
import type {Session} from '@/shared/types/user'

import {clearTestStorage} from './clearTestStorage'

function makeSession(roles: Session['user']['roles'] = ['player']): Session {
  return {
    isOnboarded: true,
    user: {
      id: 'user-001',
      displayName: 'Тест',
      roles,
      city: 'Москва',
      createdAt: '2026-01-01T00:00:00Z',
    },
  }
}

describe('HOCFRONT-15 MVP nav hide', () => {
  it('excludes SOS, IQ and Highlights from desktop player nav', () => {
    const items = resolvePlayerNavItems(makeSession())
    const paths = items.map((item) => item.to)

    for (const hidden of MVP_HIDDEN_NAV_PATHS) {
      expect(paths).not.toContain(hidden)
    }
  })

  it('excludes SOS, IQ and Highlights from pre-onboarding nav', () => {
    const items = resolveNavItems(undefined)
    const paths = items.map((item) => item.to)

    for (const hidden of MVP_HIDDEN_NAV_PATHS) {
      expect(paths).not.toContain(hidden)
    }
  })

  it('does not put SOS / IQ / Highlights into mobile nav', () => {
    const items = resolveMobileNavItems(makeSession())
    const paths = items.map((item) => item.to)

    for (const hidden of MVP_HIDDEN_NAV_PATHS) {
      expect(paths).not.toContain(hidden)
    }
  })

  it('persona home path stays profile/admin (unchanged player default)', () => {
    expect(getPersonaHomePath(makeSession())).toBe(routes.profile)
    expect(getPersonaHomePath(makeSession(['admin']))).toBe(routes.admin)
    expect(MVP_HIDDEN_NAV_PATHS).not.toContain(getPersonaHomePath(makeSession()))
  })
})

describe('HOCFRONT-15 favorites hide SOS / IQ / Highlights', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  it('default favorite ids do not include hidden sections', () => {
    for (const hidden of MVP_HIDDEN_FAVORITE_IDS) {
      expect(DEFAULT_FAVORITE_IDS).not.toContain(hidden)
    }
  })

  it('favorite actions preset has no sos / iq / highlights entries or routes', () => {
    const ids = FAVORITE_ACTIONS_PRESET.map((action) => action.id)
    const routesInPreset = FAVORITE_ACTIONS_PRESET.map((action) => action.route)

    for (const hidden of MVP_HIDDEN_FAVORITE_IDS) {
      expect(ids).not.toContain(hidden)
    }
    expect(routesInPreset).not.toContain(routes.sos)
    expect(routesInPreset).not.toContain(routes.iq)
    expect(routesInPreset).not.toContain(routes.highlights)
  })

  it('sanitizes persisted favorite ids that still contain hidden sections', () => {
    expect(sanitizeFavoriteIds(['events', 'sos', 'iq', 'highlights', 'teams'])).toEqual([
      'events',
      'teams',
    ])

    setFavoriteIds(['events', 'sos', 'iq', 'highlights', 'arenas'])
    expect(getFavoriteIds()).toEqual(['events', 'arenas'])
    expect(
      getFavoriteIds().some((id) => (MVP_HIDDEN_FAVORITE_IDS as readonly string[]).includes(id)),
    ).toBe(false)
  })
})
