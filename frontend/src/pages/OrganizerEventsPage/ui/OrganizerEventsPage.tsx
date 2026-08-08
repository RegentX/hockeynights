/**
 * HOCFRONT-28A — кабинет организатора (отдельный маршрут)
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {Link} from 'react-router'

import {fetchEvents} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {isUpcomingEvent, OrganizerTrainingsPanel} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function OrganizerEventsPage() {
  const {userId, canOrganizeEvents} = useSessionAccess()
  const {data: events = [], isLoading} = useQuery({queryKey: ['events'], queryFn: fetchEvents})

  const organizerCatalog = useMemo(
    () =>
      events
        .filter(
          (event) =>
            event.organizerUserId === userId &&
            (event.type === 'training' || event.type === 'game') &&
            isUpcomingEvent(event.startsAt),
        )
        .slice()
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [events, userId],
  )

  if (!canOrganizeEvents) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-16"
        data-testid={testId('events', 'organizer-page', 'page', 'denied')}
      >
        <IceCard padding="m">
          <Text data-testid={testId('events', 'organizer-page', 'text', 'denied')}>
            Кабинет организатора доступен капитану, тренеру, организатору или администратору.
          </Text>
          <Link
            to={routes.events}
            data-testid={testId('events', 'organizer-page', 'link', 'back-denied')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              className="hockey-mt-12"
              data-testid={testId('events', 'organizer-page', 'btn', 'back-denied')}
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
      data-testid={testId('events', 'organizer-page', 'page')}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <div className="hockey-stack hockey-stack--gap-4">
          <Text
            variant="header-1"
            data-testid={testId('events', 'organizer-page', 'text', 'title')}
          >
            Мои тренировки
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer-page', 'text', 'hint')}>
            Созданные вами будущие игры и тренировки.
          </Text>
        </div>
        <div className="hockey-row hockey-row--gap-8">
          <Link
            to={routes.eventsCreate}
            data-testid={testId('events', 'organizer-page', 'link', 'create')}
          >
            <HockeyButton
              view="action"
              size="m"
              data-testid={testId('events', 'organizer-page', 'btn', 'create')}
            >
              Создать
            </HockeyButton>
          </Link>
          <Link to={routes.events} data-testid={testId('events', 'organizer-page', 'link', 'back')}>
            <HockeyButton
              view="flat"
              size="m"
              data-testid={testId('events', 'organizer-page', 'btn', 'back')}
            >
              К каталогу
            </HockeyButton>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div data-testid={testId('events', 'organizer-page', 'loader')}>
          <ScoreboardLoader label="Загрузка…" />
        </div>
      ) : (
        <OrganizerTrainingsPanel events={organizerCatalog} organizerUserId={userId} />
      )}
    </div>
  )
}
