/**
 * HOCFRONT-25 / TASK-04-10 — календарь команды / клуба
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router-dom'

import type {GameEvent} from '@/entities/event'
import {EVENT_TYPE_LABELS} from '@/features/events'
import {testId} from '@/shared/testing/testId'

export interface TeamCalendarSectionProps {
  events: GameEvent[]
  emptyText?: string
  testIdPrefix?: string
}

/** HOCFRONT-25 — список событий календаря */
export function TeamCalendarSection({
  events,
  emptyText = 'Событий пока нет',
  testIdPrefix = 'teams',
}: TeamCalendarSectionProps) {
  if (events.length === 0) {
    return (
      <Text color="secondary" data-testid={testId(testIdPrefix, 'calendar', 'empty')}>
        {emptyText}
      </Text>
    )
  }

  return (
    <ul
      className="hockey-stack hockey-stack--gap-8 team-calendar-section"
      data-testid={testId(testIdPrefix, 'calendar', 'list')}
    >
      {events.map((event) => {
        const dateLabel = new Date(event.startsAt).toLocaleString('ru-RU', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
        const typeLabel = EVENT_TYPE_LABELS[event.type] ?? event.type
        const isTraining = event.type === 'training'

        return (
          <li
            key={event.id}
            className="team-calendar-section__row"
            data-testid={testId(testIdPrefix, 'calendar', 'row', event.id)}
          >
            <div className="hockey-stack hockey-stack--gap-4">
              {isTraining ? (
                <Link
                  to={`/events/trainings/${event.id}`}
                  data-testid={testId(testIdPrefix, 'calendar', 'link', event.id)}
                >
                  <Text
                    variant="subheader-2"
                    data-testid={testId(testIdPrefix, 'calendar', 'text', 'title', event.id)}
                  >
                    {event.title}
                  </Text>
                </Link>
              ) : (
                <Text
                  variant="subheader-2"
                  data-testid={testId(testIdPrefix, 'calendar', 'text', 'title', event.id)}
                >
                  {event.title}
                </Text>
              )}
              <Text
                color="secondary"
                data-testid={testId(testIdPrefix, 'calendar', 'text', 'meta', event.id)}
              >
                {dateLabel} · {typeLabel}
              </Text>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
