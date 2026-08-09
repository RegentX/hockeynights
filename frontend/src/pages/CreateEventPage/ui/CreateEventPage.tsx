/**
 * HOCFRONT-28A — отдельный экран создания игры/тренировки
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import {useSessionAccess} from '@/features/access'
import {EventCreateForm} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function CreateEventPage() {
  const {canOrganizeEvents, isLoading} = useSessionAccess()

  if (isLoading) {
    return (
      <div data-testid={testId('events', 'create-page', 'loader', 'session')}>
        <ScoreboardLoader label="Проверка сессии…" />
      </div>
    )
  }

  if (!canOrganizeEvents) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-16"
        data-testid={testId('events', 'create-page', 'page', 'denied')}
      >
        <IceCard padding="m">
          <Text data-testid={testId('events', 'create-page', 'text', 'denied')}>
            Создавать игры и тренировки могут организатор тренировок, админ клуба, капитан, тренер
            или администратор.
          </Text>
          <Link
            to={routes.events}
            data-testid={testId('events', 'create-page', 'link', 'back-denied')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              className="hockey-mt-12"
              data-testid={testId('events', 'create-page', 'btn', 'back-denied')}
            >
              К разделу
            </HockeyButton>
          </Link>
        </IceCard>
      </div>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('events', 'create-page', 'page')}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <Text variant="header-1" data-testid={testId('events', 'create-page', 'text', 'title')}>
          Создать игру или тренировку
        </Text>
        <div className="hockey-row hockey-row--gap-8">
          <Link
            to={routes.eventsOrganizer}
            data-testid={testId('events', 'create-page', 'link', 'cabinet')}
          >
            <HockeyButton
              view="outlined"
              size="m"
              data-testid={testId('events', 'create-page', 'btn', 'cabinet')}
            >
              Кабинет
            </HockeyButton>
          </Link>
          <Link to={routes.events} data-testid={testId('events', 'create-page', 'link', 'back')}>
            <HockeyButton
              view="flat"
              size="m"
              data-testid={testId('events', 'create-page', 'btn', 'back')}
            >
              К каталогу
            </HockeyButton>
          </Link>
        </div>
      </div>
      <IceCard padding="m" data-testid={testId('events', 'create-page', 'card', 'form')}>
        <EventCreateForm />
      </IceCard>
    </div>
  )
}
