/**
 * SPEC-FR-6.4.2, SPEC-FR-9.2.3
 * HOCFRONT-32 — inbox заявок арены
 */

import type {
  CheckoutIntent,
  CreateCheckoutIntentPayload,
  CreateIceBookingPayload,
  IceBookingRequest,
  UpdateIceBookingPayload,
} from '@/entities/external-flow/model'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-6.4.2 - Отправить mock-заявку на лёд
 */
export function submitIceBooking(payload: CreateIceBookingPayload): Promise<IceBookingRequest> {
  return apiRequest<IceBookingRequest>('/ice-booking-requests', {method: 'POST', body: payload})
}

/** Список заявок арены для кабинета партнёра */
export function fetchArenaIceBookings(arenaId: string): Promise<IceBookingRequest[]> {
  return apiRequest<IceBookingRequest[]>(`/arenas/${arenaId}/ice-booking-requests`)
}

/** Смена статуса / привязка чата */
export function updateIceBooking(
  bookingId: string,
  payload: UpdateIceBookingPayload,
): Promise<IceBookingRequest> {
  return apiRequest<IceBookingRequest>(`/ice-booking-requests/${bookingId}`, {
    method: 'PATCH',
    body: payload,
  })
}

/**
 * @spec SPEC-FR-9.2.3 - Создать mock checkout intent
 */
export function createCheckoutIntent(
  payload: CreateCheckoutIntentPayload,
): Promise<CheckoutIntent> {
  return apiRequest<CheckoutIntent>('/checkout-intents', {method: 'POST', body: payload})
}
