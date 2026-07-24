/**
 * HOCFRONT-15 / TASK-01-05
 * SOS / IQ / Highlight скрыты из MVP-навигации; маршруты остаются.
 */

import {describe, expect, it} from 'vitest'

import {
  getPersonaHomePath,
  MVP_HIDDEN_NAV_PATHS,
  resolveMobileNavItems,
  resolveNavItems,
  resolvePlayerNavItems,
} from '@/features/access'
import {routes} from '@/shared/const/appRoutes'
import type {Session} from '@/shared/types/user'

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

  it('persona home path is never SOS / IQ / Highlights', () => {
    expect(getPersonaHomePath(makeSession())).toBe(routes.profile)
    expect(getPersonaHomePath(makeSession(['admin']))).toBe(routes.admin)
    expect(MVP_HIDDEN_NAV_PATHS).not.toContain(getPersonaHomePath(makeSession()))
  })
})
