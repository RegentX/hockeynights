/**
 * SPEC-FR-6.4.2, SPEC-FR-9.2.3
 */

import {http, HttpResponse} from 'msw'

import type {CreateCheckoutIntentPayload, CreateIceBookingPayload} from '@/entities/external-flow'
import {createMockCheckoutIntent, createMockIceBooking} from '@/mocks/data/external-flows'

/** @spec SPEC-FR-6.4.2 - Handlers mock внешних сценариев */
export const externalFlowHandlers = [
  http.post('/mock-api/v1/ice-booking-requests', async ({request}) => {
    const body = (await request.json()) as CreateIceBookingPayload
    try {
      const booking = createMockIceBooking(body)
      return HttpResponse.json(booking)
    } catch (error) {
      return HttpResponse.json(
        {message: error instanceof Error ? error.message : 'Booking failed'},
        {status: 400},
      )
    }
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
