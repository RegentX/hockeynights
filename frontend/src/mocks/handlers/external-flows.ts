/**
 * SPEC-FR-6.4.2, SPEC-FR-9.2.3
 * HOCFRONT-32 — GET/PATCH ice-booking-requests
 */

import {http, HttpResponse} from 'msw'

import type {
  CreateCheckoutIntentPayload,
  CreateIceBookingPayload,
  UpdateIceBookingPayload,
} from '@/entities/external-flow'
import {
  createMockCheckoutIntent,
  createMockIceBooking,
  getMockIceBookings,
  updateMockIceBooking,
} from '@/mocks/data/external-flows'
import {getMockIceAgreementsForUser} from '@/mocks/data/iceAgreements'
import {mockUser} from '@/mocks/data/session'

/** @spec SPEC-FR-6.4.2 - Handlers mock внешних сценариев */
export const externalFlowHandlers = [
  http.get('/mock-api/v1/arenas/:arenaId/ice-booking-requests', ({params}) => {
    const bookings = getMockIceBookings(params.arenaId as string)
    return HttpResponse.json(bookings)
  }),

  http.get('/mock-api/v1/me/ice-agreements', () => {
    return HttpResponse.json(getMockIceAgreementsForUser(mockUser.id))
  }),

  http.post('/mock-api/v1/ice-booking-requests', async ({request}) => {
    const body = (await request.json()) as CreateIceBookingPayload
    try {
      const booking = createMockIceBooking(body)
      return HttpResponse.json(booking, {status: 201})
    } catch (error) {
      return HttpResponse.json(
        {message: error instanceof Error ? error.message : 'Booking failed'},
        {status: 400},
      )
    }
  }),

  http.patch('/mock-api/v1/ice-booking-requests/:bookingId', async ({params, request}) => {
    const body = (await request.json()) as UpdateIceBookingPayload
    const updated = updateMockIceBooking(params.bookingId as string, body)
    if (!updated) {
      return HttpResponse.json({message: 'Booking not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.post('/mock-api/v1/checkout-intents', async ({request}) => {
    const body = (await request.json()) as CreateCheckoutIntentPayload
    try {
      const intent = createMockCheckoutIntent(body)
      return HttpResponse.json(intent)
    } catch (error) {
      return HttpResponse.json(
        {message: error instanceof Error ? error.message : 'Checkout failed'},
        {status: 404},
      )
    }
  }),
]
