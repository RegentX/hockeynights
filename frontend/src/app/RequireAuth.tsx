/**
 * SPEC-FR-2.1.3
 */

import {useQuery} from '@tanstack/react-query'
import {Navigate, Outlet} from 'react-router'

import {fetchSession} from '@/entities/auth'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/** @spec SPEC-FR-2.1.3 - Доступ только после mock-onboarding */
export function RequireAuth() {
  const {data: session, isLoading} = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
  })

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Проверка сессии"
        testIdPrefix="app"
        data-testid={testId('app', 'require-auth', 'loader')}
      />
    )
  }

  if (!session?.isOnboarded) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
