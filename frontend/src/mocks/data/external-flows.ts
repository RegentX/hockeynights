/**
 * SPEC-FR-6.4.2, SPEC-FR-9.2.3
 * HOCFRONT-32 — inbox заявок арены
 */

import type {
  CheckoutIntent,
  CreateCheckoutIntentPayload,
  CreateIceBookingPayload,
  IceBookingRequest,
  IceBookingRequester,
  IceBookingStatus,
  UpdateIceBookingPayload,
} from '@/entities/external-flow'
import {mockArenas, mockIceSlots} from '@/mocks/data/arenas'
import {mockPlayers} from '@/mocks/data/players'
import {mockUser} from '@/mocks/data/session'
import {mockProductOffers, mockShops} from '@/mocks/data/shops'
import {mockTeams} from '@/mocks/data/teams'

const POSITION_LABELS: Record<string, string> = {
  forward: 'Нападающий',
  defense: 'Защитник',
  goalie: 'Вратарь',
  center: 'Центр',
}

function buildPersonRequester(
  userId: string,
  overrides?: Partial<IceBookingRequester>,
): IceBookingRequester {
  const player = mockPlayers.find((p) => p.userId === userId)
  const displayName = overrides?.displayName ?? player?.displayName ?? mockUser.displayName
  return {
    kind: 'person',
    userId,
    displayName,
    phone: overrides?.phone,
    city: overrides?.city ?? player?.city ?? 'Москва',
    roleLabel: overrides?.roleLabel ?? 'Организатор тренировки',
    positions:
      overrides?.positions ??
      (player?.position ? (POSITION_LABELS[player.position] ?? player.position) : undefined),
    gamesPlayed:
      overrides?.gamesPlayed ??
      (player?.karmaScore ? Math.round(player.karmaScore / 3) : undefined),
    reliability: overrides?.reliability ?? 'В HN без no-show',
    profilePath: overrides?.profilePath ?? `/players/${userId}`,
    chatType: 'direct',
  }
}

function buildTeamRequester(
  teamId: string,
  organizerUserId: string,
  overrides?: Partial<IceBookingRequester>,
): IceBookingRequester {
  const team = mockTeams.find((t) => t.id === teamId)
  const captainId = team?.captainUserId ?? organizerUserId
  const person = buildPersonRequester(captainId)
  const teamChatId = teamId === 'team-001' ? 'chat-1' : teamId === 'team-002' ? 'chat-4' : undefined
  return {
    kind: 'team',
    userId: captainId,
    displayName: overrides?.displayName ?? team?.name ?? 'Команда',
    phone: overrides?.phone ?? person.phone,
    city: overrides?.city ?? person.city ?? 'Москва',
    roleLabel: overrides?.roleLabel ?? 'Команда · от лица капитана/тренера',
    teamId,
    teamName: overrides?.teamName ?? team?.name,
    clubName: overrides?.clubName ?? team?.name,
    rosterSize: overrides?.rosterSize ?? 16,
    level: overrides?.level ?? 'Любители',
    captainName: overrides?.captainName ?? person.displayName,
    recentIce: overrides?.recentIce ?? 'Есть история аренд в HN',
    profilePath: overrides?.profilePath ?? `/teams/${teamId}`,
    chatType: 'team',
    teamChatId: overrides?.teamChatId ?? teamChatId,
  }
}

function createSeedBookings(): IceBookingRequest[] {
  const now = Date.now()
  return [
    {
      id: 'booking-seed-001',
      arenaId: 'arena-001',
      arenaName: 'Ледовый дворец на Ходынке',
      slotId: 'slot-001',
      slotLabel: 'Пт 20:00–21:30 · 16000 RUB',
      status: 'pending_review',
      externalUrl: 'https://example-arena.ru',
      confirmationCode: 'ICE-SEED01',
      createdAt: new Date(now - 3600000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
      requester: buildPersonRequester('user-002', {
        phone: '+7 (999) 111-22-33',
        roleLabel: 'Капитан / организатор',
        reliability: '5 броней · 0 no-show',
      }),
      headcount: '12–14 человек',
      purpose: 'Товарищеская тренировка',
      comment: 'Нужны шайбы, желательно раздевалка на 20',
      priceRub: 16000,
    },
    {
      id: 'booking-seed-002',
      arenaId: 'arena-001',
      arenaName: 'Ледовый дворец на Ходынке',
      status: 'pending_review',
      externalUrl: 'https://example-arena.ru',
      confirmationCode: 'ICE-SEED02',
      createdAt: new Date(now - 7200000).toISOString(),
      updatedAt: new Date(now - 7200000).toISOString(),
      requester: buildTeamRequester('team-002', 'user-002', {
        phone: '+7 (916) 555-01-02',
      }),
      headcount: '16–18 + тренер',
      purpose: 'Игра 5×5',
      comment: 'Гибкие по времени ±1ч, желательно суббота вечер',
    },
    {
      id: 'booking-seed-003',
      arenaId: 'arena-001',
      arenaName: 'Ледовый дворец на Ходынке',
      slotId: 'slot-002',
      slotLabel: 'Сб 10:00–11:30 · 12000 RUB',
      status: 'awaiting_payment',
      externalUrl: 'https://example-arena.ru',
      confirmationCode: 'ICE-SEED03',
      createdAt: new Date(now - 86400000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
      requester: buildPersonRequester('user-004', {
        phone: '+7 (926) 100-20-30',
        reliability: '8 броней · 1 отмена вовремя',
      }),
      headcount: '10 человек',
      purpose: 'Разовая тренировка',
      comment: 'Переведу на карту',
      priceRub: 12000,
      paymentDueAt: new Date(now + 7200000).toISOString(),
    },
    {
      id: 'booking-seed-004',
      arenaId: 'arena-001',
      arenaName: 'Ледовый дворец на Ходынке',
      status: 'booked',
      externalUrl: 'https://example-arena.ru',
      confirmationCode: 'ICE-BOOKED',
      createdAt: new Date(now - 172800000).toISOString(),
      updatedAt: new Date(now - 86400000).toISOString(),
      requester: buildTeamRequester('team-003', 'user-004', {
        phone: '+7 (495) 000-00-77',
      }),
      headcount: '16 человек',
      purpose: 'Тренировка',
      comment: 'Оплата на месте',
      priceRub: 15000,
    },
  ]
}

/** @spec SPEC-FR-6.4.2 - Mock заявки на лёд */
export let mockIceBookings: IceBookingRequest[] = createSeedBookings()

/** @spec SPEC-FR-9.2.3 - Mock checkout intents */
export let mockCheckoutIntents: CheckoutIntent[] = []

export function resetMockIceBookings(): void {
  mockIceBookings = createSeedBookings()
}

export function getMockIceBookings(arenaId?: string): IceBookingRequest[] {
  const list = arenaId
    ? mockIceBookings.filter((item) => item.arenaId === arenaId)
    : [...mockIceBookings]
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function normalizeStatus(status: IceBookingStatus): IceBookingStatus {
  if (status === 'mock_submitted' || status === 'redirect_pending') return 'pending_review'
  return status
}

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

  const organizerUserId = payload.organizerUserId ?? mockUser.id
  const requester = payload.teamId
    ? buildTeamRequester(payload.teamId, organizerUserId, {
        phone: payload.contactPhone,
      })
    : buildPersonRequester(organizerUserId, {
        phone: payload.contactPhone,
      })

  const now = new Date().toISOString()
  const booking: IceBookingRequest = {
    id: `booking-${Date.now()}`,
    arenaId: arena.id,
    arenaName: arena.name,
    slotId: slot?.id,
    slotLabel: slot
      ? `${new Date(slot.startsAt).toLocaleString('ru-RU')} — ${slot.price ?? '?'} RUB`
      : undefined,
    status: 'pending_review',
    externalUrl:
      slot?.bookingUrl ?? arena.bookingUrl ?? arena.websiteUrl ?? 'https://example-arena.ru',
    confirmationCode: `ICE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    createdAt: now,
    updatedAt: now,
    requester,
    headcount: payload.headcount,
    purpose: payload.purpose,
    comment: payload.comment,
    priceRub: slot?.price,
  }

  mockIceBookings = [...mockIceBookings, booking]
  return booking
}

export function updateMockIceBooking(
  bookingId: string,
  patch: UpdateIceBookingPayload,
): IceBookingRequest | undefined {
  const index = mockIceBookings.findIndex((item) => item.id === bookingId)
  if (index === -1) return undefined
  const current = mockIceBookings[index]
  const nextStatus = patch.status ? normalizeStatus(patch.status) : current.status
  const next: IceBookingRequest = {
    ...current,
    ...patch,
    status: nextStatus,
    comment: patch.comment ?? current.comment,
    declineReason: patch.declineReason ?? current.declineReason,
    chatId: patch.chatId ?? current.chatId,
    updatedAt: new Date().toISOString(),
    paymentDueAt:
      nextStatus === 'awaiting_payment'
        ? (current.paymentDueAt ?? new Date(Date.now() + 2 * 3600000).toISOString())
        : current.paymentDueAt,
  }
  mockIceBookings = mockIceBookings.map((item, i) => (i === index ? next : item))
  return next
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
