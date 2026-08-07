/**
 * HOCFRONT-25 — проверка доступа к кабинету / сущностям клуба.
 * Глобальной роли club_admin недостаточно: нужна membership на clubId (или site admin).
 */

import type {Session} from '@/shared/types/user'

export function canManageClubEntity(
  session: Session | null | undefined,
  clubId: string | null | undefined,
): boolean {
  if (!session || !clubId) return false
  if (session.user.roles.includes('admin')) return true
  return Boolean(
    session.user.partnerMemberships?.some(
      (membership) => membership.kind === 'club' && membership.entityId === clubId,
    ),
  )
}
