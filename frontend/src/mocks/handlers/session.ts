/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 * HOCFRONT-5 — handlers сессии, демо-логина и onboarding.
 */

import {http, HttpResponse} from 'msw'
import {completeOnboarding, mockSession, resetMockSession} from '@/mocks/data/session'
import type {OnboardingPayload} from '@/entities/user/types'
import {isDemoCredentials, DEMO_CREDENTIALS_HINT} from '@/features/auth/demoCredentials'

export const sessionHandlers = [
  http.get('/mock-api/v1/session', () => {
    return HttpResponse.json(mockSession)
  }),

  http.post('/mock-api/v1/login', async ({request}) => {
    const body = (await request.json()) as {email?: string; password?: string}
    if (isDemoCredentials(body.email ?? '', body.password ?? '')) {
      return HttpResponse.json({ok: true})
    }
    return HttpResponse.json({message: DEMO_CREDENTIALS_HINT}, {status: 401})
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
