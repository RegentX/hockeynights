/**
 * SPEC-FR-6.4.2, SPEC-FR-9.2.3
 */

import type {
  CheckoutIntent,
  CreateCheckoutIntentPayload,
  CreateIceBookingPayload,
  IceBookingRequest,
} from '@/entities/external-flow/types'
import {mockArenas, mockIceSlots} from '@/mocks/data/arenas'
import {mockProductOffers, mockShops} from '@/mocks/data/shops'

/** @spec SPEC-FR-6.4.2 - Mock заявки на лёд */
export let mockIceBookings: IceBookingRequest[] = []

/** @spec SPEC-FR-9.2.3 - Mock checkout intents */
export let mockCheckoutIntents: CheckoutIntent[] = []

/**
 * @spec SPEC-FR-6.4.2 - Создать mock-бронирование
 */
export function createMockIceBooking(payload: CreateIceBookingPayload): IceBookingRequest {
  const arena = mockArenas.find((a) => a.id === payload.arenaId)
  if (!arena) throw new Error('Arena not found')

  const slot = payload.slotId ? mockIceSlots.find((s) => s.id === payload.slotId) : undefined

  if (slot && slot.status !== 'free') {
    throw new Error('Слот недоступен для бронирования')
  }

  const booking: IceBookingRequest = {
    id: `booking-${Date.now()}`,
    arenaId: arena.id,
    arenaName: arena.name,
    slotId: slot?.id,
    slotLabel: slot
      ? `${new Date(slot.startsAt).toLocaleString('ru-RU')} — ${slot.price ?? '?'} RUB`
      : undefined,
    status: 'mock_submitted',
    externalUrl:
      slot?.bookingUrl ?? arena.bookingUrl ?? arena.websiteUrl ?? 'https://example-arena.ru',
    confirmationCode: `ICE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  }

  mockIceBookings = [...mockIceBookings, booking]
  return booking
}

/**
 * @spec SPEC-FR-9.2.3 - Создать mock checkout intent
 */
export function createMockCheckoutIntent(payload: CreateCheckoutIntentPayload): CheckoutIntent {
  const offer = mockProductOffers.find((o) => o.id === payload.offerId)
  if (!offer) throw new Error('Offer not found')

  const shop = mockShops.find((s) => s.id === offer.shopId)

  const intent: CheckoutIntent = {
    id: `checkout-${Date.now()}`,
    offerId: offer.id,
    offerTitle: offer.title,
    shopName: shop?.name ?? 'Магазин',
    price: offer.price,
    currency: offer.currency,
    externalUrl: offer.externalUrl,
    status: 'mock_redirect',
    createdAt: new Date().toISOString(),
  }

  mockCheckoutIntents = [...mockCheckoutIntents, intent]
  return intent
}
