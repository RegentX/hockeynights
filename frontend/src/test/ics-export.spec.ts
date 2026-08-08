/**
 * HOCFRONT-28CAL-I — ICS export
 */

import {describe, expect, it} from 'vitest'

import {buildEventIcs} from '@/features/calendar'
import {mockEvents} from '@/mocks/data/events'

describe('buildEventIcs', () => {
  it('builds a valid VEVENT for a mock event', () => {
    const event = mockEvents[0]
    const ics = buildEventIcs(event)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain(`SUMMARY:${event.title}`)
    expect(ics).toContain('END:VCALENDAR')
  })
})
