/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.1, SPEC-FR-8.2.2
 */

import type {CreateFeedbackPayload, Feedback, KarmaInfo} from '@/entities/feedback/types'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-8.1.1 - Отправить feedback
 */
export function submitFeedback(payload: CreateFeedbackPayload): Promise<Feedback> {
  return apiRequest<Feedback>('/feedback', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-8.2.1 - Получить karma игрока
 */
export function fetchPlayerKarma(userId: string): Promise<KarmaInfo> {
  return apiRequest<KarmaInfo>(`/players/${userId}/karma`)
}
