/**
 * EPIC-08 / ICE — договорённость организатора с ареной (пул для создания тренировок)
 */

import type {IceBookingStatus} from '@/entities/external-flow'

/** Статус в кабинете организатора */
export type IceAgreementPoolStatus = 'negotiating' | 'ready' | 'used' | 'closed'

export interface IceAgreement {
  id: string
  bookingId: string
  arenaId: string
  arenaName: string
  startsAt: string
  endsAt: string
  slotLabel?: string
  priceRub?: number
  bookingStatus: IceBookingStatus
  poolStatus: IceAgreementPoolStatus
  purpose?: string
  /** Событие, созданное на этой договорённости */
  linkedEventId?: string
  /** Контакт арены для организатора */
  arenaPhone?: string
  /** Телефон организатора в заявке */
  requesterPhone?: string
  headcount?: string
  comment?: string
  confirmationCode?: string
  chatId?: string
  /** userId партнёра арены для direct-чата */
  arenaContactUserId?: string
}

export const ICE_AGREEMENT_POOL_LABELS: Record<IceAgreementPoolStatus, string> = {
  negotiating: 'В переговорах',
  ready: 'Доступна для тренировки',
  used: 'Уже использована',
  closed: 'Закрыта',
}
