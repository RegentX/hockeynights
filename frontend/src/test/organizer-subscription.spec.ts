import {describe, expect, it} from 'vitest'

import {
  hasOrganizerPublishAccess,
  isMockPaidPeriod,
} from '@/features/events/lib/organizerSubscription'

describe('organizerSubscription', () => {
  it('treats period until 15 Aug 2026 as mock paid', () => {
    expect(isMockPaidPeriod(new Date('2026-08-09T12:00:00+03:00'))).toBe(true)
    expect(hasOrganizerPublishAccess('free', new Date('2026-08-09T12:00:00+03:00'))).toBe(true)
  })

  it('requires paid plan after mock period', () => {
    const after = new Date('2026-08-16T00:00:00+03:00')
    expect(isMockPaidPeriod(after)).toBe(false)
    expect(hasOrganizerPublishAccess('free', after)).toBe(false)
    expect(hasOrganizerPublishAccess('player_plus', after)).toBe(true)
    expect(hasOrganizerPublishAccess('team_pro', after)).toBe(true)
  })
})
