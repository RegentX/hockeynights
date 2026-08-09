/**
 * EPIC-08 / ORG-1 — доступ к кабинету организатора тренировок
 *
 * Роль продукта: `training_organizer`.
 * `organizer` остаётся legacy-alias в session/persona/mocks.
 */

import type {UserRole} from '@/shared/types/common'
import type {Session} from '@/shared/types/user'

/** Самостоятельный организатор тренировок (CEO) + legacy `organizer`. */
export function hasTrainingOrganizerRole(roles: UserRole[]): boolean {
  return roles.includes('training_organizer') || roles.includes('organizer')
}

/**
 * Кто может создавать события и открывать кабинет:
 * training_organizer / organizer, club_admin, captain, coach, admin.
 */
export function canOrganizeEvents(roles: UserRole[]): boolean {
  return (
    hasTrainingOrganizerRole(roles) ||
    roles.includes('club_admin') ||
    roles.includes('captain') ||
    roles.includes('coach') ||
    roles.includes('admin')
  )
}

/** Доступ к `/events/organizer` и `/events/create`. */
export function canAccessOrganizerCabinet(session: Session | null | undefined): boolean {
  if (!session) return false
  return canOrganizeEvents(session.user.roles)
}
