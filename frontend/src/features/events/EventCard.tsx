/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-1.3
 */

import {useState} from 'react'
import {Link} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import type {GameEvent} from '@/entities/event/types'
import {AttendanceControl} from '@/features/events/AttendanceControl'
import {EventRsvpBoard} from '@/features/events/EventRsvpBoard'
import {RosterNeedsWidget} from '@/features/events/RosterNeedsWidget'
import {LEAGUE_SATURDAY_EVENT_ID} from '@/mocks/data/eventRsvp'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-4.1.1 - Props карточки события */
export interface EventCardProps {
  /** @spec SPEC-FR-4.1.1 */
  event: GameEvent
  /** @spec SPEC-FR-3.3.1 */
  currentUserId?: string
  /** @spec SPEC-UI-2.6 */
  compact?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  game: 'Игра',
  training: 'Тренировка',
  open_ice: 'Открытый лёд',
}

/**
 * @spec SPEC-FR-4.1.1 - Карточка игры/тренировки
 */
export function EventCard({event, currentUserId = 'user-001', compact = false}: EventCardProps) {
  const myAttendance = event.participation.find((p) => p.userId === currentUserId)
  const defaultStatus = event.type === 'game' ? 'not_going' as const : undefined
  const currentStatus = myAttendance?.status ?? defaultStatus
  const [nowMs] = useState(() => Date.now())
  const start = new Date(event.startsAt)
  const isPastEvent = new Date(event.endsAt).getTime() < nowMs
  const timeStr = start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})

  if (compact) {
    return (
      <div
        className={`scoreboard-calendar__event scoreboard-calendar__event--${event.type}`}
        data-testid={testId('events', 'card', 'card', event.id, 'compact')}
      >
        <div className="scoreboard-calendar__event-time" data-testid={testId('events', 'card', 'text', 'time', event.id)}>
          {timeStr}
        </div>
        <div>
          <Text variant="subheader-2" data-testid={testId('events', 'card', 'text', 'title', event.id)}>
            {event.title}
          </Text>
          <Text color="secondary" data-testid={testId('events', 'card', 'text', 'meta', event.id)}>
            {TYPE_LABELS[event.type] ?? event.type} · {event.arenaName ?? event.arenaId}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div data-testid={testId('events', 'card', 'card', event.id)}>
      <IceCard padding="m">
        <div className="hockey-stack hockey-stack--gap-12">
          <div className="match-center__row match-center__row--plain">
            <div>
              <div className="match-center__time" data-testid={testId('events', 'card', 'text', 'time', event.id)}>
                {timeStr}
              </div>
              <div
                className={`match-center__type match-center__type--${event.type}`}
                data-testid={testId('events', 'card', 'badge', 'type', event.id)}
              >
                {TYPE_LABELS[event.type] ?? event.type}
              </div>
            </div>
            <div>
              <Text variant="subheader-2" data-testid={testId('events', 'card', 'text', 'title', event.id)}>
                {event.title}
              </Text>
              <Text color="secondary" data-testid={testId('events', 'card', 'text', 'arena', event.id)}>
                {event.arenaName ?? event.arenaId}
              </Text>
              <Text color="secondary" data-testid={testId('events', 'card', 'text', 'datetime', event.id)}>
                {start.toLocaleDateString('ru-RU')} —{' '}
                {new Date(event.endsAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {event.pricePerPlayer && (
                <ScoreboardText tone="accent" data-testid={testId('events', 'card', 'text', 'price', event.id)}>
                  {event.pricePerPlayer} RUB / игрок
                </ScoreboardText>
              )}
            </div>
          </div>

          <AttendanceControl eventId={event.id} currentStatus={currentStatus} />
          {event.id === LEAGUE_SATURDAY_EVENT_ID && <EventRsvpBoard eventId={event.id} />}
          <RosterNeedsWidget eventId={event.id} />
          {currentStatus === 'going' && isPastEvent && (
            <Link to="/feedback" data-testid={testId('events', 'card', 'link', 'feedback', event.id)}>
              <Text color="link" data-testid={testId('events', 'card', 'text', 'feedback', event.id)}>
                Оставить отзыв после матча
              </Text>
            </Link>
          )}
        </div>
      </IceCard>
    </div>
  )
}
