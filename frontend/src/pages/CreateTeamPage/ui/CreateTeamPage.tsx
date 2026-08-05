/**
 * HOCFRONT-25 — FSD page: создание команды
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import {useSessionAccess} from '@/features/access'
import {TeamCreateWizard} from '@/features/teams'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

/**
 * Отдельный экран мастера создания команды (не блок каталога).
 */
export function CreateTeamPage() {
  const {teamPermissions} = useSessionAccess()
  const {canCreateTeam} = teamPermissions('player')

  if (!canCreateTeam) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-16"
        data-testid={testId('teams', 'create-page', 'page', 'denied')}
      >
        <IceCard padding="m">
          <Text data-testid={testId('teams', 'create-page', 'text', 'denied')}>
            Создавать команды могут капитан, организатор или администратор. Выберите подходящую роль
            при входе.
          </Text>
          <Link
            to={routes.teams}
            data-testid={testId('teams', 'create-page', 'link', 'back-denied')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              className="hockey-mt-12"
              data-testid={testId('teams', 'create-page', 'btn', 'back-denied')}
            >
              К каталогу команд
            </HockeyButton>
          </Link>
        </IceCard>
      </div>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('teams', 'create-page', 'page')}
    >
      <div className="hockey-row hockey-row--between">
        <div className="hockey-stack hockey-stack--gap-8">
          <Text variant="header-1" data-testid={testId('teams', 'create-page', 'text', 'title')}>
            Новая команда
          </Text>
          <Text color="secondary" data-testid={testId('teams', 'create-page', 'text', 'subtitle')}>
            Пошагово: основы, образ, состав, площадка и группа в мессенджере.
          </Text>
        </div>
        <Link to={routes.teams} data-testid={testId('teams', 'create-page', 'link', 'back')}>
          <HockeyButton
            view="flat"
            size="s"
            data-testid={testId('teams', 'create-page', 'btn', 'back')}
          >
            ← Каталог
          </HockeyButton>
        </Link>
      </div>

      <IceCard padding="m" data-testid={testId('teams', 'create-page', 'card', 'wizard')}>
        <TeamCreateWizard />
      </IceCard>
    </div>
  )
}
