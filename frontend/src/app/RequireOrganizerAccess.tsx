/**
 * EPIC-08 — route guard для кабинета/создания/редактирования организатора
 */

import {Navigate, Outlet} from 'react-router'

import {useSessionAccess} from '@/features/access'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/** Доступ к `/events/organizer`, `/events/create`, edit — только canOrganizeEvents. */
export function RequireOrganizerAccess() {
  const {isLoading, canOrganizeEvents} = useSessionAccess()

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Проверка доступа"
        testIdPrefix="app"
        data-testid={testId('app', 'require-organizer', 'loader')}
      />
    )
  }

  if (!canOrganizeEvents) {
    return <Navigate to={routes.events} replace />
  }

  return <Outlet />
}
