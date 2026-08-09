/**
 * HOCFRONT-28G / ORG-4 — редактирование тренировки
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link, useParams} from 'react-router'

import {fetchEventById} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {EventCreateForm, eventDetailsPath} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function EditTrainingPage() {
  const {eventId = ''} = useParams()
  const {userId, canOrganizeEvents, roles} = useSessionAccess()
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventById(eventId),
    enabled: Boolean(eventId),
  })

  if (!canOrganizeEvents) {
    return (
      <div data-testid={testId('events', 'edit-page', 'page', 'denied')}>
        <IceCard padding="m">
          <Text data-testid={testId('events', 'edit-page', 'text', 'denied')}>
            Редактирование доступно организатору тренировок, админам клуба и администратору.
          </Text>
        </IceCard>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div data-testid={testId('events', 'edit-page', 'loader')}>
        <ScoreboardLoader label="Загрузка тренировки..." />
      </div>
    )
  }

  if (isError || !event || event.type !== 'training') {
    return (
      <div data-testid={testId('events', 'edit-page', 'empty')}>
        <EmptyNetState title="Тренировка не найдена" copy="Вернитесь к списку «Мои тренировки»." />
        <Link
          to={routes.eventsOrganizer}
          data-testid={testId('events', 'edit-page', 'link', 'cabinet-empty')}
        >
          <HockeyButton view="flat" size="m">
            В кабинет
          </HockeyButton>
        </Link>
      </div>
    )
  }

  const canEdit =
    event.organizerUserId === userId || roles.includes('admin') || roles.includes('club_admin')

  if (!canEdit) {
    return (
      <div data-testid={testId('events', 'edit-page', 'error', 'access-denied')}>
        <EmptyNetState
          title="Нет прав на редактирование"
          copy="Редактировать может только организатор этой тренировки."
        />
      </div>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('events', 'edit-page', 'page', event.id)}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <Text variant="header-1" data-testid={testId('events', 'edit-page', 'text', 'title')}>
          Редактирование
        </Text>
        <div className="hockey-row hockey-row--gap-8">
          <Link
            to={eventDetailsPath(event)}
            data-testid={testId('events', 'edit-page', 'link', 'details')}
          >
            <HockeyButton
              view="outlined"
              size="m"
              data-testid={testId('events', 'edit-page', 'btn', 'details')}
            >
              К карточке
            </HockeyButton>
          </Link>
          <Link
            to={routes.eventsOrganizer}
            data-testid={testId('events', 'edit-page', 'link', 'back')}
          >
            <HockeyButton
              view="flat"
              size="m"
              data-testid={testId('events', 'edit-page', 'btn', 'back')}
            >
              К моим тренировкам
            </HockeyButton>
          </Link>
        </div>
      </div>
      <IceCard padding="m" data-testid={testId('events', 'edit-page', 'card', 'form')}>
        <EventCreateForm mode="edit" initialEvent={event} />
      </IceCard>
    </div>
  )
}
