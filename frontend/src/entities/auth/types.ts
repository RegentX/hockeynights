/**
 * SPEC-FR-25.1.1, SPEC-FR-25.1.2
 * Контракты mock-авторизации (HOCFRONT-8).
 */

/** Карточка демо-роли после login */
export interface AvailablePersona {
  id: string
  title: string
  description: string
  destination: string
  icon: string
}

export interface AuthLoginPayload {
  email: string
  password: string
}

export interface AuthLoginResponse {
  userId: string
  availablePersonas: AvailablePersona[]
}

export interface SelectPersonaPayload {
  personaId: string
}
