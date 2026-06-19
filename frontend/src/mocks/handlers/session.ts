/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 */

import {http, HttpResponse} from 'msw'
import {completeOnboarding, mockSession, resetMockSession} from '@/mocks/data/session'
import type {OnboardingPayload} from '@/entities/user/types'

/** @spec SPEC-FR-2.1.1 - Handlers сессии и onboarding */
export const sessionHandlers = [
  http.get('/mock-api/v1/session', () => {
    return HttpResponse.json(mockSession)
  }),

  http.post('/mock-api/v1/onboarding', async ({request}) => {
    const body = (await request.json()) as OnboardingPayload
    const session = completeOnboarding(
      body.displayName,
      body.roles,
      body.partnerMemberships ?? [],
    )
    return HttpResponse.json(session)
  }),

  http.post('/mock-api/v1/logout', () => {
    const session = resetMockSession()
    return HttpResponse.json(session)
  }),
]
