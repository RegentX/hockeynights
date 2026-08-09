/**
 * HOCFRONT-32 — статусы заявок на лёд в кабинете арены
 */

import type {IceBookingStatus} from '@/entities/external-flow'

export const ICE_BOOKING_STATUS_LABELS: Record<IceBookingStatus, string> = {
  pending_review: 'На рассмотрении',
  needs_info: 'Нужны данные',
  confirmed: 'Подтверждено',
  awaiting_payment: 'Ждём оплату',
  payment_received: 'Оплата переведена',
  booked: 'Забронировано',
  declined: 'Отклонено',
  cancelled: 'Отменено',
  expired: 'Просрочено',
  mock_submitted: 'На рассмотрении',
  redirect_pending: 'На рассмотрении',
}

export type IceBookingInboxBucket = 'inbox' | 'work' | 'payment' | 'done' | 'archive'

export const ICE_BOOKING_BUCKET_LABELS: Record<IceBookingInboxBucket, string> = {
  inbox: 'Входящие',
  work: 'В работе',
  payment: 'Оплата',
  done: 'Завершённые',
  archive: 'Архив',
}

export function iceBookingBucket(status: IceBookingStatus): IceBookingInboxBucket {
  switch (status) {
    case 'pending_review':
    case 'mock_submitted':
    case 'redirect_pending':
      return 'inbox'
    case 'needs_info':
    case 'confirmed':
      return 'work'
    case 'awaiting_payment':
    case 'payment_received':
      return 'payment'
    case 'booked':
      return 'done'
    default:
      return 'archive'
  }
}

/** Доступные переходы статуса из текущего */
export function nextIceBookingActions(status: IceBookingStatus): IceBookingStatus[] {
  switch (status) {
    case 'pending_review':
    case 'mock_submitted':
    case 'redirect_pending':
      return ['confirmed', 'needs_info', 'declined']
    case 'needs_info':
      return ['confirmed', 'declined']
    case 'confirmed':
      return ['awaiting_payment', 'booked', 'cancelled']
    case 'awaiting_payment':
      return ['payment_received', 'expired', 'cancelled']
    case 'payment_received':
      return ['booked']
    case 'booked':
      return ['cancelled']
    default:
      return []
  }
}

export function iceBookingActionLabel(status: IceBookingStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Подтвердить'
    case 'needs_info':
      return 'Запросить данные'
    case 'awaiting_payment':
      return 'Ждём оплату'
    case 'payment_received':
      return 'Оплата получена'
    case 'booked':
      return 'Забронировать'
    case 'declined':
      return 'Отклонить'
    case 'cancelled':
      return 'Отменить'
    case 'expired':
      return 'Просрочить'
    default:
      return ICE_BOOKING_STATUS_LABELS[status]
  }
}
