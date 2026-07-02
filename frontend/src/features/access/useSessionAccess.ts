/**
 * SPEC-FR-1.3.1, SPEC-FR-3.2.2
 */

import {useQuery} from '@tanstack/react-query'

import type {TeamRole} from '@/entities/team/types'
import {canOrganizeEvents, isPlayerOnlySession} from '@/features/access/sessionAccess'
import {resolveTeamPermissions} from '@/features/access/teamAccess'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {shouldUsePartnerWorkspace} from '@/features/partners/sessionPersona'

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
