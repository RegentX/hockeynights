/**
 * SPEC-FR-2.1.3
 */

import {useQuery} from '@tanstack/react-query'
import {Navigate, Outlet} from 'react-router'

import {fetchSession} from '@/entities/auth'
import {testId} from '@/shared/testing/testId'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/** @spec SPEC-FR-2.1.3 - Доступ только после mock-onboarding */
export function RequireAuth() {
  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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

  // Сорванный запрос сессии — это не «пользователь не залогинен».
  // Раньше такой случай молча редиректил на вход, и вернуться было нельзя:
  // каждый переход снова упирался в ошибку и снова выбрасывал на «/».
  if (isError) {
    return (
      <QueryErrorState
        title="Не удалось загрузить сессию"
        copy="Проверьте соединение и попробуйте ещё раз — выходить из аккаунта не нужно."
        onRetry={() => refetch()}
        testIdPrefix="app"
        data-testid={testId('app', 'require-auth', 'error')}
      />
    )
  }

  if (!session?.isOnboarded) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
