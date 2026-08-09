/**
 * HOCFRONT-28G / ORG-4 — stub редактирования тренировки
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link, useParams} from 'react-router'

import {fetchEventById} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {eventDetailsPath} from '@/features/events'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export function EditTrainingPage() {
  const {eventId = ''} = useParams()
  const {userId, canOrganizeEvents} = useSessionAccess()
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
        <EmptyNetState
          title="Нет доступа"
          copy="Редактирование доступно организатору тренировок."
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div data-testid={testId('events', 'edit-page', 'loader')}>
        <ScoreboardLoader label="Загрузка…" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div data-testid={testId('events', 'edit-page', 'empty')}>
        <EmptyNetState title="Событие не найдено" copy="Вернитесь в кабинет организатора." />
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

  const canEdit = event.organizerUserId === userId || canOrganizeEvents

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('events', 'edit-page', 'page', eventId)}
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
            data-testid={testId('events', 'edit-page', 'link', 'cabinet')}
          >
            <HockeyButton
              view="flat"
              size="m"
              data-testid={testId('events', 'edit-page', 'btn', 'cabinet')}
            >
              В кабинет
            </HockeyButton>
          </Link>
        </div>
      </div>

      <IceCard padding="m" data-testid={testId('events', 'edit-page', 'panel', 'stub')}>
        <div className="hockey-stack hockey-stack--gap-8">
          <Text data-testid={testId('events', 'edit-page', 'text', 'event-title')}>
            {event.title}
          </Text>
          <Text color="secondary" data-testid={testId('events', 'edit-page', 'text', 'stub')}>
            {canEdit
              ? 'Полное редактирование полей — следующий шаг. Сейчас можно открыть карточку или создать похожую тренировку заново.'
              : 'Редактировать может только организатор этого события.'}
          </Text>
          <Link
            to={routes.eventsCreate}
            data-testid={testId('events', 'edit-page', 'link', 'create')}
          >
            <HockeyButton
              view="action"
              size="s"
              data-testid={testId('events', 'edit-page', 'btn', 'create')}
            >
              Создать похожую
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    </div>
  )
}
