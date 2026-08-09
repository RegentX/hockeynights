/**
 * HOCFRONT-28A/F — кабинет организатора тренировок
 * ORG-2/3 — статусы, табы, регистрации, профиль
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import {fetchEvents} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {CalendarShell} from '@/features/calendar'
import {
  countOrganizerStatuses,
  OrganizerAgreementsPanel,
  OrganizerProfilePanel,
  OrganizerRegistrationsPanel,
  OrganizerTrainingsPanel,
  sortOrganizerEvents,
} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

type CabinetTab = 'trainings' | 'agreements' | 'calendar' | 'registrations' | 'profile'

export function OrganizerEventsPage() {
  const {userId, session, canOrganizeEvents, isLoading: sessionLoading} = useSessionAccess()
  const [tab, setTab] = useState<CabinetTab>('trainings')
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    enabled: Boolean(userId) && canOrganizeEvents,
  })

  const mine = useMemo(
    () =>
      sortOrganizerEvents(
        events.filter(
          (event) =>
            Boolean(userId) &&
            event.organizerUserId === userId &&
            (event.type === 'training' || event.type === 'game'),
        ),
      ),
    [events, userId],
  )

  const counts = useMemo(() => countOrganizerStatuses(mine), [mine])
  const isLoading = sessionLoading || eventsLoading

  if (sessionLoading) {
    return (
      <div data-testid={testId('events', 'organizer-page', 'loader', 'session')}>
        <ScoreboardLoader label="Проверка сессии…" />
      </div>
    )
  }

  if (!canOrganizeEvents) {
    return (
      <div
        className="hockey-stack hockey-stack--gap-16"
        data-testid={testId('events', 'organizer-page', 'page', 'denied')}
      >
        <IceCard padding="m">
          <Text data-testid={testId('events', 'organizer-page', 'text', 'denied')}>
            Кабинет организатора тренировок доступен организатору, админу клуба, капитану, тренеру
            или администратору.
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
            Кабинет организатора тренировок
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer-page', 'text', 'hint')}>
            Тренировки, договорённости по льду, календарь, участники и профиль организатора.
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer-page', 'text', 'stats')}>
            Всего {mine.length} · набор {counts.open} · заполнены {counts.full} · черновики{' '}
            {counts.draft}
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

      <div
        className="hockey-row hockey-row--gap-8 hockey-row--wrap"
        data-testid={testId('events', 'organizer-page', 'panel', 'tabs')}
      >
        <HockeyButton
          view={tab === 'trainings' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('trainings')}
          data-testid={testId('events', 'organizer-page', 'btn', 'tab-trainings')}
        >
          Тренировки
        </HockeyButton>
        <HockeyButton
          view={tab === 'agreements' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('agreements')}
          data-testid={testId('events', 'organizer-page', 'btn', 'tab-agreements')}
        >
          Договорённости
        </HockeyButton>
        <HockeyButton
          view={tab === 'calendar' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('calendar')}
          data-testid={testId('events', 'organizer-page', 'btn', 'tab-calendar')}
        >
          Календарь
        </HockeyButton>
        <HockeyButton
          view={tab === 'registrations' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('registrations')}
          data-testid={testId('events', 'organizer-page', 'btn', 'tab-registrations')}
        >
          Участники
        </HockeyButton>
        <HockeyButton
          view={tab === 'profile' ? 'action' : 'outlined'}
          size="s"
          onClick={() => setTab('profile')}
          data-testid={testId('events', 'organizer-page', 'btn', 'tab-profile')}
        >
          Профиль
        </HockeyButton>
      </div>

      {isLoading ? (
        <div data-testid={testId('events', 'organizer-page', 'loader')}>
          <ScoreboardLoader label="Загрузка…" />
        </div>
      ) : isError ? (
        <QueryErrorState
          title="Не удалось загрузить тренировки"
          onRetry={() => refetch()}
          testIdPrefix="events"
          data-testid={testId('events', 'organizer-page', 'error')}
        />
      ) : (
        <>
          {tab === 'trainings' ? <OrganizerTrainingsPanel events={mine} /> : null}

          {tab === 'agreements' ? <OrganizerAgreementsPanel /> : null}

          {tab === 'calendar' ? (
            <div data-testid={testId('events', 'organizer-page', 'panel', 'calendar')}>
              <CalendarShell title="Календарь организатора" />
            </div>
          ) : null}

          {tab === 'registrations' ? <OrganizerRegistrationsPanel events={mine} /> : null}

          {tab === 'profile' ? (
            <OrganizerProfilePanel
              events={mine}
              displayName={session?.user.displayName ?? 'Организатор'}
              userId={userId}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
