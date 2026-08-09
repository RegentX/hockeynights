/**
 * HOCFRONT-28F / ORG-3 — список регистраций (mock) в кабинете организатора
 */

import {Text} from '@gravity-ui/uikit'
import {useMemo} from 'react'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {eventDetailsPath} from '@/features/events/lib/eventDetailsPath'
import {collectOrganizerRegistrations} from '@/features/events/lib/organizerWorkspace'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

const STATUS_LABELS = {
  going: 'Записан',
  maybe: 'Лист ожидания',
  not_going: 'Отказался',
} as const

export interface OrganizerRegistrationsPanelProps {
  events: GameEvent[]
}

export function OrganizerRegistrationsPanel({events}: OrganizerRegistrationsPanelProps) {
  const rows = useMemo(() => collectOrganizerRegistrations(events), [events])
  const eventById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])

  return (
    <IceCard padding="m" data-testid={testId('events', 'organizer-regs', 'panel')}>
      <div className="hockey-stack hockey-stack--gap-12">
        <div>
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'organizer-regs', 'text', 'title')}
          >
            Участники и заявки
          </Text>
          <Text color="secondary" data-testid={testId('events', 'organizer-regs', 'text', 'hint')}>
            Записи на ваши тренировки и игры (mock).
          </Text>
        </div>

        {rows.length === 0 ? (
          <EmptyNetState
            title="Пока нет записей"
            copy="Когда игроки запишутся, они появятся здесь."
            testIdPrefix="events"
            data-testid={testId('events', 'organizer-regs', 'empty')}
          />
        ) : (
          <div
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('events', 'organizer-regs', 'list')}
          >
            {rows.map((row) => {
              const event = eventById.get(row.eventId)
              return (
                <div
                  key={row.id}
                  className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap"
                  data-testid={testId('events', 'organizer-regs', 'row', row.id)}
                >
                  <div className="hockey-stack hockey-stack--gap-4">
                    <Text data-testid={testId('events', 'organizer-regs', 'text', 'name', row.id)}>
                      {row.displayName}
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId('events', 'organizer-regs', 'text', 'meta', row.id)}
                    >
                      {row.eventTitle} · {STATUS_LABELS[row.status]}
                    </Text>
                  </div>
                  {event ? (
                    <Link
                      to={eventDetailsPath(event)}
                      data-testid={testId('events', 'organizer-regs', 'link', 'event', row.id)}
                    >
                      <HockeyButton
                        view="outlined"
                        size="s"
                        data-testid={testId('events', 'organizer-regs', 'btn', 'event', row.id)}
                      >
                        К событию
                      </HockeyButton>
                    </Link>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </IceCard>
  )
}
