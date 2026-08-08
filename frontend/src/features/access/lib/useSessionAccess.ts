import {useQuery} from '@tanstack/react-query'

import {fetchSession} from '@/entities/auth'
import {canOrganizeEvents, isPlayerOnlySession} from '@/features/access/lib/sessionAccess'
import {shouldUsePartnerWorkspace} from '@/features/access/lib/sessionPersona'
import {resolveTeamPermissions} from '@/features/access/lib/teamAccess'
import type {TeamRole} from '@/shared/types/team'

export function useSessionAccess() {
  const {data: session, isLoading} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })

  const roles = session?.user.roles ?? []
  /** Пустая строка до загрузки сессии — не подставляем demo userId. */
  const userId = session?.user.id ?? ''

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
