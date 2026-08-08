/**
 * HOCFRONT-28 / TASK-05-06 — кабинет организатора
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {countOpenSlots} from '@/features/events/lib/eventCardMeta'
import {eventDetailsPath} from '@/features/events/lib/eventDetailsPath'
import {ACCESS_LABELS, EVENT_TYPE_LABELS} from '@/features/events/lib/eventLabels'
import {isUpcomingEvent} from '@/features/events/lib/isUpcomingEvent'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface OrganizerTrainingsPanelProps {
  events: GameEvent[]
  organizerUserId: string
}

function organizerStatusLabel(event: GameEvent): string {
  const upcoming = isUpcomingEvent(event.startsAt)
  if (!upcoming) return 'Прошедшая'
  if (event.registrationStatus === 'full') return 'Набор закрыт'
  return 'Набор открыт'
}

export function OrganizerTrainingsPanel({events, organizerUserId}: OrganizerTrainingsPanelProps) {
  const mine = events
    .filter((event) => event.organizerUserId === organizerUserId)
    .slice()
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  return (
    <IceCard padding="m" data-testid={testId('events', 'organizer', 'card')}>
      <div className="hockey-stack hockey-stack--gap-12">
        <div>
          <Text variant="subheader-2" data-testid={testId('events', 'organizer', 'text', 'title')}>
            Кабинет организатора
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer', 'text', 'hint')}>
            Мои игры и тренировки: статусы и быстрые действия.
          </Text>
        </div>

        {mine.length === 0 ? (
          <EmptyNetState
            title="Пока нет созданных событий"
            copy="Создайте тренировку или игру на экране «Создать»."
            testIdPrefix="events"
            data-testid={testId('events', 'organizer', 'empty')}
          />
        ) : (
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('events', 'organizer', 'list')}
          >
            {mine.map((event) => {
              const start = new Date(event.startsAt)
              const href = eventDetailsPath(event)
              const access = event.accessScope ? ACCESS_LABELS[event.accessScope] : undefined
              const seats = countOpenSlots(event)
              const editHref =
                event.type === 'training'
                  ? `/events/trainings/${event.id}/edit`
                  : routes.eventsCreate
              return (
                <div
                  key={event.id}
                  className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap"
                  data-testid={testId('events', 'organizer', 'row', event.id)}
                >
                  <div className="hockey-stack hockey-stack--gap-4">
                    <Text data-testid={testId('events', 'organizer', 'text', 'name', event.id)}>
                      {EVENT_TYPE_LABELS[event.type]} · {event.title}
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId('events', 'organizer', 'text', 'meta', event.id)}
                    >
                      {start.toLocaleDateString('ru-RU')}{' '}
                      {start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
                      {access ? ` · ${access}` : ''}
                      {` · ${organizerStatusLabel(event)}`}
                      {` · свободно ${seats.open}/${seats.total}`}
                    </Text>
                  </div>
                  <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
                    <Link
                      to={href}
                      data-testid={testId('events', 'organizer', 'link', 'open', event.id)}
                    >
                      <HockeyButton
                        view="outlined"
                        size="s"
                        data-testid={testId('events', 'organizer', 'btn', 'open', event.id)}
                      >
                        Открыть
                      </HockeyButton>
                    </Link>
                    {event.type === 'training' && (
                      <Link
                        to={editHref}
                        data-testid={testId('events', 'organizer', 'link', 'edit', event.id)}
                      >
                        <HockeyButton
                          view="flat"
                          size="s"
                          data-testid={testId('events', 'organizer', 'btn', 'edit', event.id)}
                        >
                          Редактировать
                        </HockeyButton>
                      </Link>
                    )}
                    <Link
                      to={routes.eventsCreate}
                      data-testid={testId('events', 'organizer', 'link', 'copy', event.id)}
                    >
                      <HockeyButton
                        view="flat"
                        size="s"
                        data-testid={testId('events', 'organizer', 'btn', 'copy', event.id)}
                      >
                        Создать ещё
                      </HockeyButton>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </IceCard>
  )
}
