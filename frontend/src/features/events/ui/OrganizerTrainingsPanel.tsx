/**
 * HOCFRONT-28F / ORG-2-3 — список тренировок в кабинете организатора
 */

import {Text} from '@gravity-ui/uikit'
import {useMemo, useState} from 'react'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {countOpenSlots} from '@/features/events/lib/eventCardMeta'
import {eventDetailsPath, eventEditPath} from '@/features/events/lib/eventDetailsPath'
import {ACCESS_LABELS, EVENT_TYPE_LABELS} from '@/features/events/lib/eventLabels'
import {
  countOrganizerStatuses,
  eventDeficitSummary,
  eventFillPercent,
  filterOrganizerEvents,
  ORGANIZER_FILTER_LABELS,
  ORGANIZER_FILTERS,
  ORGANIZER_STATUS_LABELS,
  type OrganizerEventFilter,
  resolveOrganizerEventStatus,
} from '@/features/events/lib/organizerWorkspace'
import {routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface OrganizerTrainingsPanelProps {
  events: GameEvent[]
  organizerUserId: string
}

export function OrganizerTrainingsPanel({events, organizerUserId}: OrganizerTrainingsPanelProps) {
  const [filter, setFilter] = useState<OrganizerEventFilter>('all')

  const mine = useMemo(
    () =>
      events
        .filter((event) => event.organizerUserId === organizerUserId)
        .slice()
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt)),
    [events, organizerUserId],
  )

  const counts = useMemo(() => countOrganizerStatuses(mine), [mine])
  const filtered = useMemo(() => filterOrganizerEvents(mine, filter), [mine, filter])

  return (
    <IceCard padding="m" data-testid={testId('events', 'organizer', 'card')}>
      <div className="hockey-stack hockey-stack--gap-12">
        <div>
          <Text variant="subheader-2" data-testid={testId('events', 'organizer', 'text', 'title')}>
            Мои тренировки и игры
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer', 'text', 'hint')}>
            Статусы, заполненность состава и быстрые действия.
          </Text>
          <Text
            color="secondary"
            className="hockey-mt-4"
            data-testid={testId('events', 'organizer', 'text', 'stats')}
          >
            Набор {counts.open} · заполнены {counts.full} · черновики {counts.draft} · прошедшие{' '}
            {counts.past}
            {counts.cancelled > 0 ? ` · отменены ${counts.cancelled}` : ''}
          </Text>
        </div>

        <div
          className="hockey-row hockey-row--gap-8 hockey-row--wrap"
          data-testid={testId('events', 'organizer', 'panel', 'filters')}
        >
          {ORGANIZER_FILTERS.map((item) => (
            <HockeyButton
              key={item}
              view={filter === item ? 'action' : 'outlined'}
              size="s"
              onClick={() => setFilter(item)}
              data-testid={testId('events', 'organizer', 'btn', 'filter', item)}
            >
              {ORGANIZER_FILTER_LABELS[item]}
              {item !== 'all' ? ` (${counts[item]})` : ` (${mine.length})`}
            </HockeyButton>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyNetState
            title="Нет событий в этом фильтре"
            copy="Создайте тренировку или смените фильтр."
            testIdPrefix="events"
            data-testid={testId('events', 'organizer', 'empty')}
          />
        ) : (
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('events', 'organizer', 'list')}
          >
            {filtered.map((event) => {
              const status = resolveOrganizerEventStatus(event)
              const href = eventDetailsPath(event)
              const access = event.accessScope ? ACCESS_LABELS[event.accessScope] : undefined
              const start = new Date(event.startsAt)
              const fill = eventFillPercent(event)
              const slots = countOpenSlots(event)
              return (
                <div
                  key={event.id}
                  className="hockey-stack hockey-stack--gap-8"
                  data-testid={testId('events', 'organizer', 'row', event.id)}
                >
                  <div className="hockey-row hockey-row--between hockey-row--align-start hockey-row--wrap">
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
                        {' · '}
                        <span
                          data-testid={testId('events', 'organizer', 'text', 'status', event.id)}
                        >
                          {ORGANIZER_STATUS_LABELS[status]}
                        </span>
                      </Text>
                      <Text
                        color="secondary"
                        data-testid={testId('events', 'organizer', 'text', 'fill', event.id)}
                      >
                        Заполнено {fill}% ({slots.total - slots.open}/{slots.total}) ·{' '}
                        {eventDeficitSummary(event)}
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
                      {event.type === 'training' ? (
                        <Link
                          to={eventEditPath(event)}
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
                      ) : null}
                      <Link
                        to={routes.eventsCreate}
                        data-testid={testId('events', 'organizer', 'link', 'copy', event.id)}
                      >
                        <HockeyButton
                          view="flat"
                          size="s"
                          data-testid={testId('events', 'organizer', 'btn', 'copy', event.id)}
                        >
                          Создать похожую
                        </HockeyButton>
                      </Link>
                    </div>
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
