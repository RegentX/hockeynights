/**
 * HOCFRONT-28CAL-A — calendar URL state
 */

import {describe, expect, it} from 'vitest'

import {
  countActiveCalendarFilters,
  DEFAULT_CALENDAR_STATE,
  parseCalendarState,
  serializeCalendarState,
  startOfWeekMonday,
} from '@/features/calendar'

describe('calendarState', () => {
  it('parses and serializes round-trip', () => {
    const params = new URLSearchParams(
      'view=agenda&date=2026-08-15&scope=team&scopeId=team-001&type=training&mine=1&needsGoalie=1&range=week&lens=goalie',
    )
    const state = parseCalendarState(params)
    expect(state.view).toBe('agenda')
    expect(state.date).toBe('2026-08-15')
    expect(state.scope).toBe('team')
    expect(state.scopeId).toBe('team-001')
    expect(state.mineOnly).toBe(true)
    expect(state.needsGoalie).toBe(true)
    expect(state.range).toBe('week')
    expect(state.lens).toBe('goalie')

    const again = parseCalendarState(serializeCalendarState(state))
    expect(again).toEqual(state)
  })

  it('counts active filters and starts week on Monday', () => {
    expect(
      countActiveCalendarFilters({
        ...DEFAULT_CALENDAR_STATE,
        type: 'game',
        mineOnly: true,
        range: 'today',
      }),
    ).toBe(3)

    const monday = startOfWeekMonday(new Date(2026, 7, 8)) // Sat Aug 8
    expect(monday.getDay()).toBe(1)
    expect(monday.getDate()).toBe(3)
  })
})
