/**
 * SPEC-FR-2.1.2, SPEC-FR-1.3.7
 * HOCFRONT-5 — маршрут после выбора персоны.
 */

import type {OnboardingPayload} from '@/entities/user/types'
import {partnerCabinetPath} from '@/features/partners/constants'

export function resolvePostLoginPath(payload: OnboardingPayload): string {
  const memberships = payload.partnerMemberships ?? []
  if (memberships.length === 1) {
    return partnerCabinetPath(memberships[0])
  }
  if (memberships.length > 0 && memberships.every((m) => m.kind === 'shop')) {
    return partnerCabinetPath(memberships[0])
  }
  if (memberships.length > 0 && memberships.every((m) => m.kind === 'league')) {
    return partnerCabinetPath(memberships[0])
  }
  if (memberships.length > 0) {
    return '/partner'
  }
  if (payload.roles.includes('admin')) {
    return '/admin'
  }
  if (payload.roles.includes('coach') && !payload.roles.includes('player')) {
    return '/profile'
  }
  return '/profile'
}
