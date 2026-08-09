/**
 * HOCFRONT-32C — доступ к кабинету ледовой арены
 */

import type {Session} from '@/shared/types/user'

export function canManageArena(
  session: Session | null | undefined,
  arenaId: string | null | undefined,
): boolean {
  if (!session || !arenaId) return false
  if (session.user.roles.includes('admin')) return true
  return Boolean(
    session.user.partnerMemberships?.some(
      (membership) => membership.kind === 'arena' && membership.entityId === arenaId,
    ),
  )
}
