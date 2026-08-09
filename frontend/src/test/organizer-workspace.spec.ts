import {describe, expect, it} from 'vitest'

import type {GameEvent} from '@/entities/event'
import {
  countOrganizerStatuses,
  eventDeficitSummary,
  eventFillPercent,
  filterOrganizerEvents,
  resolveOrganizerEventStatus,
} from '@/features/events/lib/organizerWorkspace'

function makeEvent(overrides: Partial<GameEvent> = {}): GameEvent {
  return {
    id: 'e1',
    type: 'training',
    title: 'Test',
    startsAt: '2026-08-20T20:00:00+03:00',
    endsAt: '2026-08-20T21:30:00+03:00',
    arenaId: 'arena-001',
    organizerUserId: 'user-001',
    requiredSkillLevel: 'amateur',
    requiredSlots: [
      {position: 'goalie', count: 2, filledCount: 1},
      {position: 'forward', count: 8, filledCount: 4},
    ],
    registrationStatus: 'open',
    lifecycleStatus: 'published',
    participation: [],
    ...overrides,
  }
}

describe('organizerWorkspace', () => {
  const now = new Date('2026-08-09T12:00:00+03:00')

  it('resolves draft / open / full / past / cancelled', () => {
    expect(resolveOrganizerEventStatus(makeEvent({lifecycleStatus: 'draft'}), now)).toBe('draft')
    expect(resolveOrganizerEventStatus(makeEvent({registrationStatus: 'open'}), now)).toBe('open')
    expect(resolveOrganizerEventStatus(makeEvent({registrationStatus: 'full'}), now)).toBe('full')
    expect(
      resolveOrganizerEventStatus(
        makeEvent({startsAt: '2026-07-01T10:00:00+03:00', endsAt: '2026-07-01T11:00:00+03:00'}),
        now,
      ),
    ).toBe('past')
    expect(resolveOrganizerEventStatus(makeEvent({lifecycleStatus: 'cancelled'}), now)).toBe(
      'cancelled',
    )
  })

  it('computes fill percent and deficit summary', () => {
    const event = makeEvent()
    expect(eventFillPercent(event)).toBe(50)
    expect(eventDeficitSummary(event)).toContain('Вратарь')
    expect(eventDeficitSummary(event)).toContain('Нападение')
  })

  it('filters and counts by status', () => {
    const events = [
      makeEvent({id: 'd', lifecycleStatus: 'draft'}),
      makeEvent({id: 'o', registrationStatus: 'open'}),
      makeEvent({id: 'f', registrationStatus: 'full'}),
      makeEvent({
        id: 'p',
        startsAt: '2026-07-01T10:00:00+03:00',
        endsAt: '2026-07-01T11:00:00+03:00',
      }),
    ]
    expect(filterOrganizerEvents(events, 'draft', now)).toHaveLength(1)
    expect(filterOrganizerEvents(events, 'open', now).map((e) => e.id)).toEqual(['o'])
    expect(countOrganizerStatuses(events, now)).toEqual({
      draft: 1,
      open: 1,
      full: 1,
      past: 1,
      cancelled: 0,
    })
  })
})
