import {describe, expect, it} from 'vitest'

import type {IceBookingRequest} from '@/entities/external-flow'
import {
  agreementToCalendarEvent,
  bookingToIceAgreement,
  isAgreementReadyForTraining,
  resolveIceAgreementPoolStatus,
} from '@/features/events/lib/iceAgreements'

function makeBooking(overrides: Partial<IceBookingRequest> = {}): IceBookingRequest {
  return {
    id: 'b1',
    arenaId: 'arena-001',
    arenaName: 'Ходынка',
    status: 'booked',
    externalUrl: 'https://example',
    confirmationCode: 'X',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    requester: {
      kind: 'person',
      userId: 'user-001',
      displayName: 'Org',
      phone: '+7 (999) 100-11-22',
      chatType: 'direct',
    },
    startsAt: '2026-08-22T10:00:00+03:00',
    endsAt: '2026-08-22T11:30:00+03:00',
    ...overrides,
  }
}

describe('iceAgreements', () => {
  it('marks booked interval as ready pool', () => {
    const booking = makeBooking()
    expect(resolveIceAgreementPoolStatus(booking)).toBe('ready')
    const agreement = bookingToIceAgreement(booking, undefined, {
      arenaPhone: '+7 (495) 000-00-01',
      arenaContactUserId: 'user-arena-001',
    })
    expect(isAgreementReadyForTraining(agreement)).toBe(true)
    expect(agreement.arenaPhone).toBe('+7 (495) 000-00-01')
    expect(agreement.requesterPhone).toBe('+7 (999) 100-11-22')
  })

  it('keeps draft and confirmed in negotiating until booked', () => {
    expect(resolveIceAgreementPoolStatus(makeBooking({status: 'draft'}))).toBe('negotiating')
    expect(resolveIceAgreementPoolStatus(makeBooking({status: 'confirmed'}))).toBe('negotiating')
  })

  it('includes declined as closed agreement for inbox', () => {
    const agreement = bookingToIceAgreement(makeBooking({status: 'declined'}))
    expect(agreement.poolStatus).toBe('closed')
  })

  it('marks linked event as used', () => {
    expect(resolveIceAgreementPoolStatus(makeBooking(), 'event-1')).toBe('used')
  })

  it('maps ready agreement to calendar marker', () => {
    const agreement = bookingToIceAgreement(makeBooking())
    const marker = agreementToCalendarEvent(agreement, 'user-001')
    expect(marker?.type).toBe('open_ice')
    expect(marker?.startsAt).toBe(agreement.startsAt)
  })
})
