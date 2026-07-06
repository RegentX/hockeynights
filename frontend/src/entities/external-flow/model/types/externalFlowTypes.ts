/**
 * SPEC-FR-6.4.1, SPEC-FR-6.4.2, SPEC-FR-7.1.3, SPEC-FR-9.1.3, SPEC-FR-9.2.3
 */

/** @spec SPEC-FR-6.4.2 - Запрос на бронирование льда */
export interface CreateIceBookingPayload {
  /** @spec SPEC-FR-6.4.2 */
  arenaId: string
  /** @spec SPEC-FR-6.4.2 */
  slotId?: string
  /** @spec SPEC-FR-6.4.2 */
  contactPhone?: string
  /** @spec SPEC-FR-6.4.2 */
  comment?: string
}

/** @spec SPEC-FR-6.4.2 - Результат mock-бронирования */
export interface IceBookingRequest {
  /** @spec SPEC-FR-6.4.2 */
  id: string
  /** @spec SPEC-FR-6.4.2 */
  arenaId: string
  /** @spec SPEC-FR-6.4.2 */
  arenaName: string
  /** @spec SPEC-FR-6.4.2 */
  slotId?: string
  /** @spec SPEC-FR-6.4.2 */
  slotLabel?: string
  /** @spec SPEC-FR-6.4.2 */
  status: 'mock_submitted' | 'redirect_pending'
  /** @spec SPEC-FR-6.4.1 */
  externalUrl: string
  /** @spec SPEC-FR-6.4.2 */
  confirmationCode: string
  /** @spec SPEC-FR-6.4.2 */
  createdAt: string
}

/** @spec SPEC-FR-9.2.3 - Intent перехода к покупке */
export interface CreateCheckoutIntentPayload {
  /** @spec SPEC-FR-9.2.3 */
  offerId: string
}

/** @spec SPEC-FR-9.2.3 - Результат mock-checkout */
export interface CheckoutIntent {
  /** @spec SPEC-FR-9.2.3 */
  id: string
  /** @spec SPEC-FR-9.2.3 */
  offerId: string
  /** @spec SPEC-FR-9.2.3 */
  offerTitle: string
  /** @spec SPEC-FR-9.2.3 */
  shopName: string
  /** @spec SPEC-FR-9.2.3 */
  price: number
  /** @spec SPEC-FR-9.2.3 */
  currency: 'RUB'
  /** @spec SPEC-FR-6.4.1 */
  externalUrl: string
  /** @spec SPEC-FR-9.2.3 */
  status: 'mock_redirect'
  /** @spec SPEC-FR-9.2.3 */
  createdAt: string
}

/** @spec SPEC-FR-6.4.1 - Тип mock внешнего сценария */
export type MockExternalFlowType = 'ice_booking' | 'shop_checkout' | 'shop_portal' | 'league_portal'
