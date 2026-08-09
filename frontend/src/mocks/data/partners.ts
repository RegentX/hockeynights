/**
 * SPEC-FR-1.3.7, SPEC-FR-1.3.9
 */

import {mockSession} from '@/mocks/data/session'

/** @spec SPEC-FR-24.7.9 - Проверка прав партнёра на сущность */
export function canManagePartnerEntity(
  kind: 'league' | 'shop' | 'arena' | 'club',
  entityId: string,
): boolean {
  const memberships = mockSession.user.partnerMemberships ?? []
  if (mockSession.user.roles.includes('admin')) return true
  return memberships.some((m) => m.kind === kind && m.entityId === entityId)
}
