/**
 * SPEC-FR-1.3.1 - SPEC-FR-1.3.6
 */

import type {UserRole} from '@/shared/types/common'

const ORGANIZER_ROLES: UserRole[] = ['captain', 'coach', 'organizer', 'admin']

/** Капитан, тренер, организатор — могут создавать события */
export function canOrganizeEvents(roles: UserRole[]): boolean {
  return roles.some((role) => ORGANIZER_ROLES.includes(role))
}

/** Только игрок/вратарь без командных ролей в сессии */
export function isPlayerOnlySession(roles: UserRole[]): boolean {
  if (
    roles.includes('admin') ||
    roles.includes('club_admin') ||
    roles.includes('captain') ||
    roles.includes('coach') ||
    roles.includes('organizer')
  ) {
    return false
  }
  return roles.some((role) => role === 'player' || role === 'goalie')
}
