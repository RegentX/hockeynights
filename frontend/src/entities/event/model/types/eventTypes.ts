/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2, SPEC-FR-4.2.1, SPEC-FR-4.3.1, SPEC-FR-4.3.2
 */

import type {AttendanceStatus, EventType, PlayerPosition, SkillLevel} from '@/entities/common'

/** @spec SPEC-FR-4.3.1 - Требуемый слот по позиции */
export interface RequiredSlot {
  /** @spec SPEC-FR-4.3.1 */
  position: PlayerPosition
  /** @spec SPEC-FR-4.3.1 */
  count: number
  /** @spec SPEC-FR-4.3.2 */
  filledCount: number
}

/** @spec SPEC-FR-3.3.1 - Посещаемость */
export interface Attendance {
  /** @spec SPEC-FR-3.3.1 */
  eventId: string
  /** @spec SPEC-FR-3.3.1 */
  userId: string
  /** @spec SPEC-FR-3.3.1 */
  displayName?: string
  /** @spec SPEC-FR-3.3.1 */
  status: AttendanceStatus
  /** @spec SPEC-FR-3.3.2 */
  updatedAt: string
}

/** @spec SPEC-FR-4.1.1 - Игра или тренировка */
export interface GameEvent {
  /** @spec SPEC-FR-4.1.1 */
  id: string
  /** @spec SPEC-FR-4.1.2 */
  type: EventType
  /** @spec SPEC-FR-4.1.1 */
  title: string
  /** @spec SPEC-FR-4.1.1 */
  startsAt: string
  /** @spec SPEC-FR-4.1.1 */
  endsAt: string
  /** @spec SPEC-FR-4.1.1 */
  arenaId: string
  /** @spec SPEC-FR-4.1.1 */
  arenaName?: string
  /** @spec SPEC-FR-4.1.1 */
  organizerUserId: string
  /** @spec SPEC-FR-3.1.1 */
  teamId?: string
  /** @spec SPEC-FR-4.1.1 */
  requiredSkillLevel: SkillLevel
  /** @spec SPEC-FR-4.3.1 */
  requiredSlots: RequiredSlot[]
  /** @spec SPEC-FR-5.1.2 */
  pricePerPlayer?: number
  /** Формат тренировки (из классификатора продукта) */
  trainingFormat?: 'two_way' | 'training' | 'training_two_way'
  /** Округ проведения */
  district?: string
  /** Статус набора */
  registrationStatus?: 'open' | 'full'
  /** Модель доступа к тренировке */
  accessScope?: 'club_only' | 'limited' | 'public' | 'private_club' | 'public_open'
  /** Список пользователей, допущенных к limited-тренировке */
  allowedUserIds?: string[]
  /** Контакт организатора для карточки */
  organizerDisplayName?: string
  /** Доп. номер телефона организатора */
  organizerPhone?: string
  /** @spec SPEC-FR-3.3.2 */
  participation: Attendance[]
  /** @spec SPEC-FR-25.6.1 - Командный RSVP board доступен для события */
  hasTeamRsvp?: boolean
  /** HOCFRONT-25 — клуб-владелец private_club тренировки */
  clubId?: string
}

/** @spec SPEC-FR-4.1.1 - Payload создания события */
export interface CreateEventPayload {
  /** @spec SPEC-FR-4.1.2 */
  type: EventType
  /** @spec SPEC-FR-4.1.1 */
  title: string
  /** @spec SPEC-FR-4.1.1 */
  startsAt: string
  /** @spec SPEC-FR-4.1.1 */
  endsAt: string
  /** @spec SPEC-FR-4.1.1 */
  arenaId: string
  /** @spec SPEC-FR-3.1.1 */
  teamId?: string
  /** @spec SPEC-FR-4.1.1 */
  requiredSkillLevel: SkillLevel
  /** @spec SPEC-FR-4.3.1 */
  requiredSlots: RequiredSlot[]
  /** @spec SPEC-FR-5.1.2 */
  pricePerPlayer?: number
  /** HOCFRONT-25 / HOCFRONT-28 */
  accessScope?: GameEvent['accessScope']
  clubId?: string
  trainingFormat?: GameEvent['trainingFormat']
  district?: string
}

/** @spec SPEC-FR-4.3.1 - Статус дефицита состава */
export interface RosterStatus {
  /** @spec SPEC-FR-4.1.1 */
  eventId: string
  /** @spec SPEC-FR-4.3.1 */
  deficits: RequiredSlot[]
  /** @spec SPEC-FR-3.3.2 */
  summary: {
    going: number
    notGoing: number
    maybe: number
  }
}

/** @spec SPEC-FR-4.2.2 - Фильтры календаря */
export interface CalendarFilters {
  /** @spec SPEC-FR-4.2.2 */
  type?: EventType
  /** @spec SPEC-FR-4.2.2 */
  attendanceStatus?: AttendanceStatus
}
