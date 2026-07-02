/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 * HOCFRONT-5, HOCFRONT-8 — handlers сессии, демо-логина и onboarding.
 */

import {http, HttpResponse} from 'msw'
import {completeOnboarding, mockSession, resetMockSession, selectMockPersona} from '@/mocks/data/session'
import type {OnboardingPayload} from '@/entities/user/types'
import type {AuthLoginPayload, SelectPersonaPayload} from '@/entities/auth/types'
import {isDemoCredentials, DEMO_EMAIL} from '@/features/auth/demoCredentials'
import {DEMO_USER_ID, getAvailablePersonas} from '@/mocks/data/personas'
import {
  authenticateLocalUser,
  findLocalUserByEmail,
  registerLocalUser,
  setPendingLocalUser,
} from '@/features/auth/localAuthMemory'
import {validateRegisterForm} from '@/features/auth/registrationValidation'

export const sessionHandlers = [
  http.get('/mock-api/v1/session', () => {
    return HttpResponse.json(mockSession)
  }),

  http.post('/mock-api/v1/auth/login', async ({request}) => {
    const body = (await request.json()) as AuthLoginPayload
    const email = body.email ?? ''
    const password = body.password ?? ''

    if (!isDemoCredentials(email, password)) {
      return HttpResponse.json({message: 'Неверный email или пароль'}, {status: 401})
    }

    setPendingLocalUser(null)
    return HttpResponse.json({
      userId: DEMO_USER_ID,
      availablePersonas: getAvailablePersonas(),
    })
  }),

  http.post('/mock-api/v1/session/persona', async ({request}) => {
    const body = (await request.json()) as SelectPersonaPayload
    if (!body.personaId?.trim()) {
      return HttpResponse.json({message: 'personaId is required'}, {status: 400})
    }

    try {
      const session = selectMockPersona(body.personaId)
      return HttpResponse.json(session)
    } catch {
      return HttpResponse.json({message: 'Unknown persona'}, {status: 404})
    }
  }),

  http.post('/mock-api/v1/login', async ({request}) => {
    const body = (await request.json()) as {email?: string; password?: string}
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
    const validationError = validateRegisterForm({
      displayName: body.displayName ?? '',
      email: body.email ?? '',
      password: body.password ?? '',
      passwordConfirm: body.password ?? '',
      acceptTerms: true,
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

  /** @deprecated Legacy onboarding — prefer POST /session/persona (selectMockPersona). */
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
