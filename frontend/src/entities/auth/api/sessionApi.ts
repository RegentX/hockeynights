/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 */

import type {AuthLoginResponse, SelectPersonaPayload} from '@/entities/auth/model'
import type {OnboardingPayload, Session} from '@/entities/user'
import {apiRequest} from '@/shared/api/client'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  displayName: string
  email: string
  password: string
}

function parseApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback
  const jsonMatch = error.message.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return fallback
  try {
    const body = JSON.parse(jsonMatch[0]) as {message?: string}
    return body.message?.trim() || fallback
  } catch {
    return fallback
  }
}

/**
 * @spec SPEC-FR-25.1.1 - Демо-вход: POST /auth/login → карточки ролей (demo@hockey.local).
 * Используется при isDemoCredentials() в LoginForm.
 */
export async function authLogin(payload: LoginPayload): Promise<AuthLoginResponse> {
  try {
    return await apiRequest<AuthLoginResponse>('/auth/login', {method: 'POST', body: payload})
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Не удалось войти'), {cause: error})
  }
}

/**
 * @spec SPEC-FR-2.1.1 - Локальный вход: POST /login → PersonaSelection без auth-login cache.
 * Используется для аккаунтов из localAuthMemory (не demo@hockey.local).
 */
export async function loginWithCredentials(payload: LoginPayload): Promise<{ok: true}> {
  try {
    return await apiRequest<{ok: true}>('/login', {method: 'POST', body: payload})
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Не удалось войти'), {cause: error})
  }
}

/**
 * @spec SPEC-FR-2.1.1 - Mock-регистрация (Phase 1)
 */
export async function registerAccount(payload: RegisterPayload): Promise<{ok: true}> {
  try {
    return await apiRequest<{ok: true}>('/register', {method: 'POST', body: payload})
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, 'Не удалось зарегистрироваться'), {cause: error})
  }
}

/**
 * @spec SPEC-FR-2.1.1 - Получить текущую mock-сессию
 */
export function fetchSession(): Promise<Session> {
  return apiRequest<Session>('/session')
}

/**
 * @spec SPEC-FR-25.1.2 - Выбор демо-роли
 */
export function selectPersona(payload: SelectPersonaPayload): Promise<Session> {
  return apiRequest<Session>('/session/persona', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-2.1.2 - Сохранить onboarding (legacy)
 * @spec SPEC-FR-2.1.3 - Вернуть обновлённую сессию
 * @deprecated Используйте selectPersona (POST /session/persona). Не выставляет personaId / homePath.
 */
export function submitOnboarding(payload: OnboardingPayload): Promise<Session> {
  return apiRequest<Session>('/onboarding', {method: 'POST', body: payload})
}

/** @spec SPEC-FR-2.1.1 - Выход из mock-сессии */
export function logoutSession(): Promise<Session> {
  return apiRequest<Session>('/logout', {method: 'POST'})
}
