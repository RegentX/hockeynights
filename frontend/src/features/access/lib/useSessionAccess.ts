import {useQuery} from '@tanstack/react-query'

import {fetchSession} from '@/entities/auth'
import {
  canAccessOrganizerCabinet,
  canOrganizeEvents,
  hasTrainingOrganizerRole,
} from '@/features/access/lib/organizerAccess'
import {isPlayerOnlySession} from '@/features/access/lib/sessionAccess'
import {shouldUsePartnerWorkspace} from '@/features/access/lib/sessionPersona'
import {resolveTeamPermissions} from '@/features/access/lib/teamAccess'
import type {TeamRole} from '@/shared/types/team'

export function useSessionAccess() {
  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })

  const roles = session?.user.roles ?? []
  /** Пустая строка до загрузки сессии — не подставляем demo userId. */
  const userId = session?.user.id ?? ''

  return {
    session,
    isLoading,
    isError,
    refetch,
    userId,
    roles,
    isPartnerWorkspace: shouldUsePartnerWorkspace(session),
    isPlayerOnly: isPlayerOnlySession(roles),
    isTrainingOrganizer: hasTrainingOrganizerRole(roles),
    canOrganizeEvents: canOrganizeEvents(roles),
    canAccessOrganizerCabinet: canAccessOrganizerCabinet(session),
    teamPermissions: (teamRole: TeamRole = 'player') => resolveTeamPermissions(roles, teamRole),
  }
}
