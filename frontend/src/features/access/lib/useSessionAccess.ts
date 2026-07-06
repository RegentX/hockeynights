import {useQuery} from '@tanstack/react-query'

import {fetchSession} from '@/entities/auth'
import type {TeamRole} from '@/entities/team'
import {canOrganizeEvents, isPlayerOnlySession} from '@/shared/lib/sessionAccess'
import {shouldUsePartnerWorkspace} from '@/shared/lib/sessionPersona'
import {resolveTeamPermissions} from '@/shared/lib/teamAccess'

export function useSessionAccess() {
  const {data: session, isLoading} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })

  const roles = session?.user.roles ?? []
  const userId = session?.user.id ?? 'user-001'

  return {
    session,
    isLoading,
    userId,
    roles,
    isPartnerWorkspace: shouldUsePartnerWorkspace(session),
    isPlayerOnly: isPlayerOnlySession(roles),
    canOrganizeEvents: canOrganizeEvents(roles),
    teamPermissions: (teamRole: TeamRole = 'player') => resolveTeamPermissions(roles, teamRole),
  }
}
