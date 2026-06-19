/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 */

import {apiRequest} from '@/shared/api/client'
import type {OnboardingPayload, Session} from '@/entities/user/types'

/**
 * @spec SPEC-FR-2.1.1 - Получить текущую mock-сессию
 */
export function fetchSession(): Promise<Session> {
  return apiRequest<Session>('/session')
}

/**
 * @spec SPEC-FR-2.1.2 - Сохранить onboarding
 * @spec SPEC-FR-2.1.3 - Вернуть обновлённую сессию
 */
export function submitOnboarding(payload: OnboardingPayload): Promise<Session> {
  return apiRequest<Session>('/onboarding', {method: 'POST', body: payload})
}

/** @spec SPEC-FR-2.1.1 - Выход из mock-сессии */
export function logoutSession(): Promise<Session> {
  return apiRequest<Session>('/logout', {method: 'POST'})
}
