/**
 * SPEC-FR-6.4.2, SPEC-FR-9.2.3
 */

import type {
  CheckoutIntent,
  CreateCheckoutIntentPayload,
  CreateIceBookingPayload,
  IceBookingRequest,
} from '@/entities/external-flow/types'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-6.4.2 - Отправить mock-заявку на лёд
 */
export function submitIceBooking(payload: CreateIceBookingPayload): Promise<IceBookingRequest> {
  return apiRequest<IceBookingRequest>('/ice-booking-requests', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-9.2.3 - Создать mock checkout intent
 */
export function createCheckoutIntent(
  payload: CreateCheckoutIntentPayload,
): Promise<CheckoutIntent> {
  return apiRequest<CheckoutIntent>('/checkout-intents', {method: 'POST', body: payload})
}
