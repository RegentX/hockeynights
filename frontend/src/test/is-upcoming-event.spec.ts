/**
 * HOCFRONT-28 / TASK-05-02
 */

import {describe, expect, it} from 'vitest'

import {isUpcomingEvent} from '@/features/events'
import {matchesAccessScopeFilter} from '@/features/events/lib/eventLabels'

describe('isUpcomingEvent', () => {
  const now = new Date('2026-08-08T12:00:00+03:00')

  it('keeps future trainings', () => {
    expect(isUpcomingEvent('2026-08-12T08:00:00+03:00', now)).toBe(true)
  })

  it('drops past trainings', () => {
    expect(isUpcomingEvent('2026-07-07T08:00:00+03:00', now)).toBe(false)
  })
})

describe('matchesAccessScopeFilter', () => {
  it('maps public_open to legacy public', () => {
    expect(matchesAccessScopeFilter('public', 'public_open')).toBe(true)
    expect(matchesAccessScopeFilter('public_open', 'public_open')).toBe(true)
  })

  it('maps private_club to club_only', () => {
    expect(matchesAccessScopeFilter('club_only', 'private_club')).toBe(true)
    expect(matchesAccessScopeFilter('private_club', 'private_club')).toBe(true)
  })
})
