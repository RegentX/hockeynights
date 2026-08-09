/**
 * EPIC-08 / ICE — маппинг заявок на лёд → пул договорённостей организатора
 */

import type {GameEvent, IceAgreement, IceAgreementPoolStatus} from '@/entities/event'
import type {IceBookingRequest, IceBookingStatus} from '@/entities/external-flow'
import {routes} from '@/shared/const/appRoutes'

const READY_STATUSES: IceBookingStatus[] = ['booked', 'payment_received']
const NEGOTIATING_STATUSES: IceBookingStatus[] = [
  'draft',
  'pending_review',
  'needs_info',
  'confirmed',
  'awaiting_payment',
  'mock_submitted',
  'redirect_pending',
]
const CLOSED_STATUSES: IceBookingStatus[] = ['declined', 'cancelled', 'expired']

export interface IceAgreementEnrichment {
  arenaPhone?: string
  arenaContactUserId?: string
}

export function resolveIceAgreementPoolStatus(
  booking: IceBookingRequest,
  linkedEventId?: string,
): IceAgreementPoolStatus {
  if (linkedEventId) return 'used'
  if (CLOSED_STATUSES.includes(booking.status)) return 'closed'
  if (READY_STATUSES.includes(booking.status) && booking.startsAt && booking.endsAt) {
    return 'ready'
  }
  if (NEGOTIATING_STATUSES.includes(booking.status) || READY_STATUSES.includes(booking.status)) {
    return 'negotiating'
  }
  return 'closed'
}

export function bookingToIceAgreement(
  booking: IceBookingRequest,
  linkedEventId?: string,
  enrichment: IceAgreementEnrichment = {},
): IceAgreement {
  const hasInterval = Boolean(booking.startsAt && booking.endsAt)
  const poolStatus = resolveIceAgreementPoolStatus(booking, linkedEventId)

  return {
    id: `agreement-${booking.id}`,
    bookingId: booking.id,
    arenaId: booking.arenaId,
    arenaName: booking.arenaName,
    startsAt: booking.startsAt ?? '',
    endsAt: booking.endsAt ?? '',
    slotLabel: booking.slotLabel,
    priceRub: booking.priceRub,
    bookingStatus: booking.status,
    poolStatus:
      hasInterval || poolStatus === 'closed' || poolStatus === 'negotiating'
        ? poolStatus
        : 'negotiating',
    purpose: booking.purpose,
    linkedEventId,
    arenaPhone: enrichment.arenaPhone,
    requesterPhone: booking.requester.phone,
    headcount: booking.headcount,
    comment: booking.comment,
    confirmationCode: booking.confirmationCode,
    chatId: booking.chatId,
    arenaContactUserId: enrichment.arenaContactUserId,
  }
}

export function isAgreementReadyForTraining(agreement: IceAgreement): boolean {
  return agreement.poolStatus === 'ready' && Boolean(agreement.startsAt && agreement.endsAt)
}

export function formatAgreementInterval(startsAt: string, endsAt: string): string {
  if (!startsAt || !endsAt) return 'Интервал ещё не согласован'
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Интервал не задан'
  return `${start.toLocaleString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })} – ${end.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}`
}

export function agreementCreatePath(agreement: IceAgreement): string {
  const params = new URLSearchParams({
    agreementId: agreement.id,
    bookingId: agreement.bookingId,
    arenaId: agreement.arenaId,
    startsAt: agreement.startsAt,
    endsAt: agreement.endsAt,
  })
  return `${routes.eventsCreate}?${params.toString()}`
}

/** Маркер договорённости в календаре организатора */
export function agreementToCalendarEvent(
  agreement: IceAgreement,
  organizerUserId: string,
): GameEvent | null {
  if (!agreement.startsAt || !agreement.endsAt) return null
  const statusHint =
    agreement.poolStatus === 'ready'
      ? 'Лёд подтверждён'
      : agreement.poolStatus === 'negotiating'
        ? 'Заявка в работе'
        : agreement.poolStatus === 'used'
          ? 'Уже в тренировке'
          : 'Закрыта'
  return {
    id: `ice-agreement-${agreement.bookingId}`,
    type: 'open_ice',
    title: `${statusHint} · ${agreement.arenaName}`,
    startsAt: agreement.startsAt,
    endsAt: agreement.endsAt,
    arenaId: agreement.arenaId,
    arenaName: agreement.arenaName,
    organizerUserId,
    requiredSkillLevel: 'amateur',
    requiredSlots: [],
    pricePerPlayer: agreement.priceRub,
    registrationStatus: 'open',
    lifecycleStatus: 'published',
    participation: [],
    iceBookingId: agreement.bookingId,
    iceAgreementId: agreement.id,
    organizerPhone: agreement.arenaPhone,
  }
}
