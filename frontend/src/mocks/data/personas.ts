/**
 * SPEC-FR-25.1.1, SPEC-FR-25.1.2
 * Демо-пользователь и карточки ролей для mock-авторизации.
 */

import type {AvailablePersona} from '@/entities/auth/types'
import type {OnboardingPayload} from '@/entities/user/types'
import {PERSONA_PRESETS} from '@/features/auth/personaPresets'

export const DEMO_USER_ID = 'user-001'

export function getAvailablePersonas(): AvailablePersona[] {
  return PERSONA_PRESETS.map(({id, title, description, destination, icon}) => ({
    id,
    title,
    description,
    destination,
    icon,
  }))
}

export function getPersonaOnboardingPayload(personaId: string): OnboardingPayload | undefined {
  return PERSONA_PRESETS.find((preset) => preset.id === personaId)?.payload
}
