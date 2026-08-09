/**
 * SPEC-FR-6.4.1, SPEC-FR-6.4.2, SPEC-FR-7.1.3, SPEC-FR-9.1.3, SPEC-FR-9.2.3
 * HOCFRONT-32 — inbox заявок арены + чат
 */

/** Статусы заявки на лёд (кабинет арены / организатора) */
export type IceBookingStatus =
  | 'draft'
  | 'pending_review'
  | 'needs_info'
  | 'confirmed'
  | 'awaiting_payment'
  | 'payment_received'
  | 'booked'
  | 'declined'
  | 'cancelled'
  | 'expired'
  /** @deprecated legacy mock — нормализуется в pending_review */
  | 'mock_submitted'
  | 'redirect_pending'

export type IceBookingRequesterKind = 'person' | 'team'

/** Кто снимает лёд — человек-организатор или команда */
export interface IceBookingRequester {
  kind: IceBookingRequesterKind
  userId: string
  displayName: string
  phone?: string
  city?: string
  roleLabel?: string
  positions?: string
  gamesPlayed?: number
  reliability?: string
  teamId?: string
  teamName?: string
  clubName?: string
  rosterSize?: number
  level?: string
  captainName?: string
  recentIce?: string
  profilePath?: string
  chatType: 'direct' | 'team'
  /** Известный team-chat id для deep-link */
  teamChatId?: string
}

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
  /** Организатор (если не передан — из сессии в mock) */
  organizerUserId?: string
  teamId?: string
  headcount?: string
  purpose?: string
}

export interface UpdateIceBookingPayload {
  status?: IceBookingStatus
  chatId?: string
  comment?: string
  declineReason?: string
}

/** @spec SPEC-FR-6.4.2 - Результат / заявка на бронирование */
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
  status: IceBookingStatus
  /** @spec SPEC-FR-6.4.1 */
  externalUrl: string
  /** @spec SPEC-FR-6.4.2 */
  confirmationCode: string
  /** @spec SPEC-FR-6.4.2 */
  createdAt: string
  updatedAt: string
  requester: IceBookingRequester
  headcount?: string
  purpose?: string
  comment?: string
  priceRub?: number
  paymentDueAt?: string
  chatId?: string
  declineReason?: string
  /** Интервал льда (для пула договорённостей организатора) */
  startsAt?: string
  endsAt?: string
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

export type {MockExternalFlowType} from '@/shared/types/externalFlow'
