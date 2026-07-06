/**
 * SPEC-FR-13.1.1, SPEC-FR-13.1.2, SPEC-FR-13.1.3
 */

import {apiRequest} from '@/shared/api/client'

import type {
  IqAttemptPayload,
  IqAttemptResult,
  IqLeaderboardRow,
  IqQuestion,
  IqTest,
} from '../model'

/**
 * @spec SPEC-FR-13.1.1 - Каталог тестов Hockey IQ
 */
export function fetchIqTests(): Promise<IqTest[]> {
  return apiRequest<IqTest[]>('/iq-tests')
}

/**
 * @spec SPEC-FR-13.1.1 - Вопросы выбранного теста
 */
export function fetchIqQuestions(testId: string): Promise<IqQuestion[]> {
  return apiRequest<IqQuestion[]>(`/iq-tests/${testId}/questions`)
}

/**
 * @spec SPEC-FR-13.1.2 - Отправка попытки теста
 */
export function submitIqAttempt(payload: IqAttemptPayload): Promise<IqAttemptResult> {
  return apiRequest<IqAttemptResult>('/iq-attempts', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-13.1.3 - Лидерборд Hockey IQ
 */
export function fetchIqLeaderboard(): Promise<IqLeaderboardRow[]> {
  return apiRequest<IqLeaderboardRow[]>('/iq-leaderboard')
}
