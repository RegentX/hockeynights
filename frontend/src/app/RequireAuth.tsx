/**
 * SPEC-FR-2.1.3
 */

import {Navigate, Outlet} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/** @spec SPEC-FR-2.1.3 - Доступ только после mock-onboarding */
export function RequireAuth() {
  const {data: session, isLoading} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })

  if (isLoading) {
    return <ScoreboardLoader label="Проверка сессии" />
  }

  if (!session?.isOnboarded) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
