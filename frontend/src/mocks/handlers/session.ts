/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 * HOCFRONT-5 — handlers сессии, демо-логина и onboarding.
 */

import {http, HttpResponse} from 'msw'

import {completeOnboarding, mockSession, resetMockSession} from '@/mocks/data/session'
import type {OnboardingPayload} from '@/entities/user/types'
import {isDemoCredentials, DEMO_EMAIL} from '@/features/auth/demoCredentials'
import {
  authenticateLocalUser,
  findLocalUserByEmail,
  registerLocalUser,
  setPendingLocalUser,
} from '@/features/auth/localAuthMemory'
import {validateRegisterPayload} from '@/features/auth/registrationValidation'

/** @spec SPEC-FR-2.1.1 - Handlers сессии и onboarding */
export const sessionHandlers = [
  http.get('/mock-api/v1/session', () => {
    return HttpResponse.json(mockSession)
  }),

  http.post('/mock-api/v1/login', async ({request}) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email ?? ''
    const password = body.password ?? ''

    if (isDemoCredentials(email, password)) {
      setPendingLocalUser(null)
      return HttpResponse.json({ok: true})
    }

    const localUser = authenticateLocalUser(email, password)
    if (localUser) {
      setPendingLocalUser(localUser.id)
      return HttpResponse.json({ok: true})
    }

    if (findLocalUserByEmail(email)) {
      return HttpResponse.json({message: 'Неверный пароль'}, {status: 401})
    }

    return HttpResponse.json(
      {
        message: `Аккаунт не найден. Зарегистрируйтесь или используйте демо: ${DEMO_EMAIL}`,
      },
      {status: 401},
    )
  }),

  http.post('/mock-api/v1/register', async ({request}) => {
    const body = (await request.json()) as {
      displayName?: string
      email?: string
      password?: string
    }
    const validationError = validateRegisterPayload({
      displayName: body.displayName,
      email: body.email,
      password: body.password,
    })
    if (validationError) {
      return HttpResponse.json({message: validationError}, {status: 400})
    }
    if (body.email?.trim().toLowerCase() === DEMO_EMAIL) {
      return HttpResponse.json(
        {message: 'Этот email уже зарегистрирован. Войдите в аккаунт.'},
        {status: 409},
      )
    }
    if (findLocalUserByEmail(body.email ?? '')) {
      return HttpResponse.json(
        {message: 'Пользователь с таким email уже есть. Войдите в аккаунт.'},
        {status: 409},
      )
    }

    registerLocalUser({
      displayName: body.displayName!.trim(),
      email: body.email!.trim(),
      password: body.password!,
    })
    return HttpResponse.json({ok: true})
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
