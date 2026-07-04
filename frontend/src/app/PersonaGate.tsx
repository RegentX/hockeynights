/**
 * SPEC-FR-1.2.1, SPEC-FR-1.3.7
 */

import {Navigate, Outlet, useLocation} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {getPersonaHomePath, isPathAllowed} from '@/features/access/navigationAccess'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-1.2.1 - Ограничение маршрутов по роли/персоне */
export function PersonaGate() {
  const location = useLocation()
  const {data: session, isLoading} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка"
        testIdPrefix="app"
        data-testid={testId('app', 'persona-gate', 'loader')}
      />
    )
  }

  if (session?.isOnboarded && !isPathAllowed(session, location.pathname)) {
    const homePath = session.homePath ?? getPersonaHomePath(session)
    return <Navigate to={homePath} replace />
  }

  return <Outlet />
}
