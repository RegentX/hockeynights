/**
 * HOCFRONT-28B — unit tests for event card meta helpers
 */

import {describe, expect, it} from 'vitest'

import type {GameEvent} from '@/entities/event'

import {
  countOpenSlots,
  countOpenSlotsForPosition,
  formatEventDurationMinutes,
  formatEventPriceRub,
  formatEventWeekdayDate,
  registrationStatusLabel,
} from './eventCardMeta'

const sampleEvent = {
  requiredSlots: [
    {position: 'goalie', count: 2, filledCount: 1},
    {position: 'forward', count: 6, filledCount: 4},
  ],
} as GameEvent

describe('eventCardMeta', () => {
  it('formats weekday, duration and rub price', () => {
    expect(formatEventWeekdayDate('2026-08-15T16:00:00+03:00')).toMatch(/сб/)
    expect(
      formatEventDurationMinutes('2026-08-15T16:00:00+03:00', '2026-08-15T17:30:00+03:00'),
    ).toBe(90)
    expect(formatEventPriceRub(1500)).toContain('₽')
    expect(formatEventPriceRub(1500)).not.toContain('RUB')
    expect(formatEventPriceRub(0)).toBe('Бесплатно')
  })

  it('counts open seats and position-specific seats', () => {
    expect(countOpenSlots(sampleEvent)).toEqual({open: 3, total: 8})
    expect(countOpenSlotsForPosition(sampleEvent, 'forward')).toBe(2)
    expect(countOpenSlotsForPosition(sampleEvent, 'defense')).toBeNull()
  })

  it('maps registration status labels', () => {
    expect(registrationStatusLabel('going', 'open')).toBe('Вы записаны')
    expect(registrationStatusLabel('maybe', 'full')).toBe('В листе ожидания')
    expect(registrationStatusLabel(undefined, 'full')).toBe('Мест нет')
    expect(registrationStatusLabel(undefined, 'open')).toBe('Можно записаться')
  })
})
