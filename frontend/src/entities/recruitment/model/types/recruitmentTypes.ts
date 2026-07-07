/**
 * SPEC-FR-5.1.1, SPEC-FR-5.1.2, SPEC-FR-5.1.3, SPEC-FR-5.2.1, SPEC-FR-5.2.2, SPEC-FR-5.2.3
 */

import type {PlayerPosition, SkillLevel} from '@/entities/common'

/** @spec SPEC-FR-5.1.1 - Запрос добора */
export interface RecruitmentRequest {
  /** @spec SPEC-FR-5.1.1 */
  id: string
  /** @spec SPEC-FR-5.1.1 */
  eventId: string
  /** @spec SPEC-FR-5.1.1 */
  eventTitle?: string
  /** @spec SPEC-FR-5.1.2 */
  requestedPosition: PlayerPosition
  /** @spec SPEC-FR-5.1.2 */
  skillLevel: SkillLevel
  /** @spec SPEC-FR-5.1.3 */
  isGoalkeeperSos: boolean
  /** @spec SPEC-FR-5.1.2 */
  district?: string
  /** @spec SPEC-FR-5.1.2 */
  price?: number
  /** @spec SPEC-FR-5.1.2 */
  comment?: string
  /** @spec SPEC-FR-5.2.3 */
  status: 'open' | 'filled' | 'cancelled'
  /** @spec SPEC-FR-5.1.2 */
  startsAt?: string
}

/** @spec SPEC-FR-5.2.2 - Отклик на запрос */
export interface RecruitmentResponse {
  /** @spec SPEC-FR-5.2.2 */
  id: string
  /** @spec SPEC-FR-5.2.2 */
  requestId: string
  /** @spec SPEC-FR-5.2.2 */
  userId: string
  /** @spec SPEC-FR-5.2.2 */
  displayName?: string
  /** @spec SPEC-FR-5.2.2 */
  message?: string
  /** @spec SPEC-FR-5.2.3 */
  status: 'pending' | 'accepted' | 'declined'
  /** @spec SPEC-FR-5.2.2 */
  createdAt: string
}

/** @spec SPEC-FR-5.1.1 - Payload создания запроса */
export interface CreateRecruitmentPayload {
  /** @spec SPEC-FR-5.1.1 */
  eventId: string
  /** @spec SPEC-FR-5.1.2 */
  requestedPosition: PlayerPosition
  /** @spec SPEC-FR-5.1.2 */
  skillLevel: SkillLevel
  /** @spec SPEC-FR-5.1.3 */
  isGoalkeeperSos: boolean
  /** @spec SPEC-FR-5.1.2 */
  district?: string
  /** @spec SPEC-FR-5.1.2 */
  price?: number
  /** @spec SPEC-FR-5.1.2 */
  comment?: string
}
