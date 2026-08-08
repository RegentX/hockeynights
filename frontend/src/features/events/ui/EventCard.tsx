/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-1.3
 * HOCFRONT-28B — карточка выбора: дата, ₽, места, один CTA
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Link} from 'react-router'

import type {GameEvent} from '@/entities/event'
import {fetchEventRsvp} from '@/entities/event'
import {fetchMyProfile} from '@/entities/profile'
import {
  countOpenSlots,
  countOpenSlotsForPosition,
  formatEventDurationMinutes,
  formatEventPriceRub,
  formatEventWeekdayDate,
  registrationStatusLabel,
} from '@/features/events/lib/eventCardMeta'
import {eventDetailsPath} from '@/features/events/lib/eventDetailsPath'
import {
  ACCESS_LABELS,
  EVENT_TYPE_LABELS,
  POSITION_LABELS,
  SKILL_LEVEL_LABELS,
} from '@/features/events/lib/eventLabels'
import {isTeamRsvpConfirmed, teamRsvpStatusLabel} from '@/features/events/lib/teamRsvpStatus'
import {EventRsvpBoard} from '@/features/events/ui/EventRsvpBoard'
import {TrainingRegistrationControl} from '@/features/events/ui/TrainingRegistrationControl'
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

/**
 * @spec SPEC-FR-4.1.1 - Карточка игры/тренировки
 * @spec HOCFRONT-28B - v2: подходит ли мне без открытия деталки
 */
export function EventCard({event, currentUserId = 'user-001', compact = false}: EventCardProps) {
  const myAttendance = event.participation.find((p) => p.userId === currentUserId)
  const currentStatus = myAttendance?.status
  const [nowMs] = useState(() => Date.now())
  const start = new Date(event.startsAt)
  const isPastEvent = new Date(event.endsAt).getTime() < nowMs
  const timeStr = start.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  const weekdayDate = formatEventWeekdayDate(event.startsAt)
  const durationMinutes = formatEventDurationMinutes(event.startsAt, event.endsAt)
  const priceLabel = formatEventPriceRub(event.pricePerPlayer)
  const seats = countOpenSlots(event)
  const accessLabel = event.accessScope ? ACCESS_LABELS[event.accessScope] : undefined

  const {data: profile} = useQuery({
    queryKey: ['profile'],
    queryFn: fetchMyProfile,
  })
  const {data: rsvpBoard} = useQuery({
    queryKey: ['event-rsvp', event.id],
    queryFn: () => fetchEventRsvp(event.id),
    enabled: Boolean(event.hasTeamRsvp),
  })
  const myRsvp = rsvpBoard?.players.find((player) => player.userId === currentUserId)
  const statusLabel = event.hasTeamRsvp
    ? rsvpBoard
      ? teamRsvpStatusLabel(myRsvp?.status, myRsvp?.declineReason)
      : 'Загрузка статуса…'
    : registrationStatusLabel(currentStatus, event.registrationStatus)
  const isGoingForFeedback = event.hasTeamRsvp
    ? isTeamRsvpConfirmed(myRsvp?.status)
    : currentStatus === 'going'
  const positionOpen = countOpenSlotsForPosition(event, profile?.position)
  const positionLabel =
    profile?.position && profile.position !== 'any' ? POSITION_LABELS[profile.position] : undefined

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
            variant="header-2"
            className="hockey-entity-title--compact"
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

  const body = (
    <div className="match-center__row match-center__row--plain event-card__header">
      <div className="event-card__left">
        <div
          className="match-center__time event-card__time"
          data-testid={testId('events', 'card', 'text', 'time', event.id)}
        >
          {timeStr}
        </div>
        <Text variant="body-2" data-testid={testId('events', 'card', 'text', 'weekday', event.id)}>
          {weekdayDate}
        </Text>
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
            className="event-card__title hockey-entity-title--compact"
            data-testid={testId('events', 'card', 'text', 'title', event.id)}
          >
            {event.title}
          </Text>
          {event.type === 'training' && (
            <FavoriteButton type="training" entityId={event.id} title={event.title} />
          )}
        </div>
        <Text
          color="secondary"
          className="event-card__arena"
          data-testid={testId('events', 'card', 'text', 'arena', event.id)}
        >
          {event.arenaName ?? event.arenaId}
          {event.district ? ` · ${event.district}` : ''}
        </Text>
        <Text
          color="secondary"
          className="event-card__datetime"
          data-testid={testId('events', 'card', 'text', 'datetime', event.id)}
        >
          {durationMinutes} мин · {SKILL_LEVEL_LABELS[event.requiredSkillLevel]}
        </Text>
        <ScoreboardText
          tone="accent"
          className="event-card__price"
          data-testid={testId('events', 'card', 'text', 'price', event.id)}
        >
          {priceLabel}
        </ScoreboardText>
        <Text color="secondary" data-testid={testId('events', 'card', 'text', 'seats', event.id)}>
          Мест: {seats.open} из {seats.total}
          {positionLabel != null && positionOpen != null
            ? ` · ${positionLabel}: ${positionOpen}`
            : ''}
        </Text>
        <Text color="secondary" data-testid={testId('events', 'card', 'text', 'status', event.id)}>
          {statusLabel}
        </Text>
      </div>
    </div>
  )

  const footer = (
    <>
      <div className="event-card__attendance">
        {event.hasTeamRsvp ? (
          <Text
            color="secondary"
            data-testid={testId('events', 'card', 'text', 'team-rsvp-hint', event.id)}
          >
            {rsvpBoard
              ? `${teamRsvpStatusLabel(myRsvp?.status, myRsvp?.declineReason)} · изменить на странице игры`
              : 'Загрузка статуса…'}
          </Text>
        ) : (
          <TrainingRegistrationControl
            eventId={event.id}
            eventType={event.type}
            currentStatus={currentStatus}
            registrationStatus={event.registrationStatus}
            currentUserId={currentUserId}
          />
        )}
      </div>
      {event.hasTeamRsvp && <EventRsvpBoard eventId={event.id} />}
      {isGoingForFeedback && isPastEvent && (
        <Link to="/feedback" data-testid={testId('events', 'card', 'link', 'feedback', event.id)}>
          <Text color="link" data-testid={testId('events', 'card', 'text', 'feedback', event.id)}>
            Оставить отзыв после матча
          </Text>
        </Link>
      )}
    </>
  )

  return (
    <div className={`event-card event-card--${event.type}`}>
      <IceCard padding="m" className="event-card__surface">
        <Link
          to={eventDetailsPath(event)}
          className="event-card__surface-link"
          data-testid={testId('events', 'card', 'card', event.id)}
        >
          {body}
        </Link>
        {footer}
      </IceCard>
    </div>
  )
}
