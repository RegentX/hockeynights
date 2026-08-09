/**
 * EPIC-08 / ICE — mock пул договорённостей организатора
 */

import type {IceAgreement} from '@/entities/event'
import {bookingToIceAgreement} from '@/features/events/lib/iceAgreements'
import {mockArenas} from '@/mocks/data/arenas'
import {mockEvents} from '@/mocks/data/events'
import {getMockIceBookings} from '@/mocks/data/external-flows'
import {mockIceListings} from '@/mocks/data/iceListings'
import {mockUser} from '@/mocks/data/session'

function arenaContactUserId(arenaId: string): string | undefined {
  return mockIceListings.find((item) => item.arenaId === arenaId)?.ownerUserId ?? 'user-arena-001'
}

export function getMockIceAgreementsForUser(userId: string = mockUser.id): IceAgreement[] {
  const linkedByBooking = new Map<string, string>()
  for (const event of mockEvents) {
    if (event.iceBookingId) linkedByBooking.set(event.iceBookingId, event.id)
  }

  return getMockIceBookings()
    .filter((booking) => booking.requester.userId === userId)
    .map((booking) => {
      const arena = mockArenas.find((item) => item.id === booking.arenaId)
      return bookingToIceAgreement(booking, linkedByBooking.get(booking.id), {
        arenaPhone: arena?.phone,
        arenaContactUserId: arenaContactUserId(booking.arenaId),
      })
    })
    .sort((a, b) => (b.startsAt || b.bookingId).localeCompare(a.startsAt || a.bookingId))
}
