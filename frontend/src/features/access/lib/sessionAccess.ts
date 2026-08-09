/**
 * SPEC-FR-1.3.1 - SPEC-FR-1.3.6
 */

import {hasTrainingOrganizerRole} from '@/features/access/lib/organizerAccess'
import type {UserRole} from '@/shared/types/common'

export {canOrganizeEvents} from '@/features/access/lib/organizerAccess'

/** Только игрок/вратарь без командных/организаторских ролей в сессии */
export function isPlayerOnlySession(roles: UserRole[]): boolean {
  if (
    roles.includes('admin') ||
    roles.includes('club_admin') ||
    roles.includes('captain') ||
    roles.includes('coach') ||
    hasTrainingOrganizerRole(roles)
  ) {
    return false
  }
  return roles.some((role) => role === 'player' || role === 'goalie')
}
