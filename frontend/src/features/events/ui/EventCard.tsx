/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-1.3
 */

import {Text} from '@gravity-ui/uikit'
import {useState} from 'react'
import {Link} from 'react-router-dom'

import type {GameEvent} from '@/entities/event'
import {ACCESS_LABELS, EVENT_TYPE_LABELS} from '@/features/events/lib/eventLabels'
import {AttendanceControl} from '@/features/events/ui/AttendanceControl'
import {EventRsvpBoard} from '@/features/events/ui/EventRsvpBoard'
import {RosterNeedsWidget} from '@/features/events/ui/RosterNeedsWidget'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

/** @spec SPEC-FR-4.1.1 - Props карточки события */
export interface EventCardProps {
  /** @spec SPEC-FR-4.1.1 */
  event: GameEvent
  /** @spec SPEC-FR-3.3.1 */
  currentUserId?: string
  /** @spec SPEC-UI-2.6 */
  compact?: boolean
}

function EventCardHeader({event, timeStr}: {event: GameEvent; timeStr: string}) {
  const accessLabel = event.accessScope ? ACCESS_LABELS[event.accessScope] : undefined
  const start = new Date(event.startsAt)

  return (
    <div className="match-center__row match-center__row--plain event-card__header">
      <div className="event-card__left">
        <div
          className="match-center__time event-card__time"
          data-testid={testId('events', 'card', 'text', 'time', event.id)}
        >
          {timeStr}
        </div>
        <div className="event-card__badges">
          <div
            className={`match-center__type match-center__type--${event.type} event-card__badge event-card__badge--type`}
            data-testid={testId('events', 'card', 'badge', 'type', event.id)}
          >
            {EVENT_TYPE_LABELS[event.type] ?? event.type}
          </div>
          {accessLabel && (
            <Text
              color="info"
              className="event-card__badge event-card__badge--access"
              data-testid={testId('events', 'card', 'badge', 'access', event.id)}
            >
              {accessLabel}
            </Text>
          )}
        </div>
      </div>
      <div className="event-card__main">
        <div className="hockey-row hockey-row--gap-8 hockey-row--between">
          <Text
            variant="header-2"
            className="event-card__title"
            data-testid={testId('events', 'card', 'text', 'title', event.id)}
          >
            {event.title}
          </Text>
          {event.type === 'training' && (
            // FavoriteType поддерживает training, не game — игры сознательно без ♥ (TASK-02-04).
            <FavoriteButton type="training" entityId={event.id} title={event.title} />
          )}
        </div>
        <Text
          color="secondary"
          className="event-card__arena"
          data-testid={testId('events', 'card', 'text', 'arena', event.id)}
        >
          {event.type === 'training' ? (
            (event.arenaName ?? event.arenaId)
          ) : (
            <Link
              to={`/arenas?arenaId=${event.arenaId}`}
              data-testid={testId('events', 'card', 'link', 'arena', event.id)}
            >
              {event.arenaName ?? event.arenaId}
            </Link>
          )}
        </Text>
        <Text
          color="secondary"
          className="event-card__datetime"
          data-testid={testId('events', 'card', 'text', 'datetime', event.id)}
        >
          {start.toLocaleDateString('ru-RU')} —{' '}
          {new Date(event.endsAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {event.pricePerPlayer && (
          <ScoreboardText
            tone="accent"
            className="event-card__price"
            data-testid={testId('events', 'card', 'text', 'price', event.id)}
          >
            {event.pricePerPlayer} RUB / игрок
          </ScoreboardText>
        )}
      </div>
    </div>
  )
}

/**
 * @spec SPEC-FR-4.1.1 - Карточка игры/тренировки
 */
export function EventCard({event, currentUserId = 'user-001', compact = false}: EventCardProps) {
  const myAttendance = event.participation.find((p) => p.userId === currentUserId)
  const defaultStatus = event.type === 'game' ? ('not_going' as const) : undefined
  const currentStatus = myAttendance?.status ?? defaultStatus
  const [nowMs] = useState(() => Date.now())
  const start = new Date(event.startsAt)
  const isPastEvent = new Date(event.endsAt).getTime() < nowMs
  const timeStr = start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  const eventKind = event.type === 'training' ? 'training' : 'game'

  if (compact) {
    return (
      <div
        className={`scoreboard-calendar__event scoreboard-calendar__event--${event.type}`}
        data-testid={testId('events', 'card', 'card', event.id, 'compact')}
      >
        <div
          className="scoreboard-calendar__event-time"
          data-testid={testId('events', 'card', 'text', 'time', event.id)}
        >
          {timeStr}
        </div>
        <div>
          <Text
            variant="subheader-2"
            data-testid={testId('events', 'card', 'text', 'title', event.id)}
          >
            {event.title}
          </Text>
          <Text color="secondary" data-testid={testId('events', 'card', 'text', 'meta', event.id)}>
            {EVENT_TYPE_LABELS[event.type] ?? event.type} · {event.arenaName ?? event.arenaId}
          </Text>
        </div>
      </div>
    )
  }

  const eventFooter = (
    <>
      <div className="event-card__attendance">
        <AttendanceControl
          eventId={event.id}
          currentStatus={currentStatus}
          currentUserId={currentUserId}
          eventTitle={event.title}
          eventKind={eventKind}
          useRsvpApi={event.hasTeamRsvp}
        />
      </div>
      {event.hasTeamRsvp && <EventRsvpBoard eventId={event.id} />}
      <RosterNeedsWidget eventId={event.id} />
      {currentStatus === 'going' && isPastEvent && (
        <Link to="/feedback" data-testid={testId('events', 'card', 'link', 'feedback', event.id)}>
          <Text color="link" data-testid={testId('events', 'card', 'text', 'feedback', event.id)}>
            Оставить отзыв после матча
          </Text>
        </Link>
      )}
    </>
  )

  if (event.type === 'training') {
    return (
      <div className="event-card event-card--training">
        <IceCard padding="m" className="event-card__surface">
          <Link
            to={`/events/trainings/${event.id}`}
            className="event-card__surface-link"
            data-testid={testId('events', 'card', 'card', event.id)}
          >
            <EventCardHeader event={event} timeStr={timeStr} />
          </Link>
          {eventFooter}
        </IceCard>
      </div>
    )
  }

  return (
    <div
      className={`event-card event-card--${event.type}`}
      data-testid={testId('events', 'card', 'card', event.id)}
    >
      <IceCard padding="m" className="event-card__surface">
        <div className="hockey-stack hockey-stack--gap-12">
          <EventCardHeader event={event} timeStr={timeStr} />
          {eventFooter}
        </div>
      </IceCard>
    </div>
  )
}
