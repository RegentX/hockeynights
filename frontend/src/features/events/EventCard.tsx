/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.3.2
 * SPEC-UI-2.5, SPEC-UI-1.3
 */

import {useState} from 'react'
import {Link} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import type {GameEvent} from '@/entities/event/types'
import {AttendanceControl} from '@/features/events/AttendanceControl'
import {RosterNeedsWidget} from '@/features/events/RosterNeedsWidget'
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
      <div className={`scoreboard-calendar__event scoreboard-calendar__event--${event.type}`}>
        <div className="scoreboard-calendar__event-time">{timeStr}</div>
        <div>
          <Text variant="subheader-2">{event.title}</Text>
          <Text color="secondary">
            {TYPE_LABELS[event.type] ?? event.type} · {event.arenaName ?? event.arenaId}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <IceCard padding="m">
      <div className="hockey-stack hockey-stack--gap-12">
        <div className="match-center__row match-center__row--plain">
          <div>
            <div className="match-center__time">{timeStr}</div>
            <div className={`match-center__type match-center__type--${event.type}`}>
              {TYPE_LABELS[event.type] ?? event.type}
            </div>
          </div>
          <div>
            <Text variant="subheader-2">{event.title}</Text>
            <Text color="secondary">{event.arenaName ?? event.arenaId}</Text>
            <Text color="secondary">
              {start.toLocaleDateString('ru-RU')} —{' '}
              {new Date(event.endsAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {event.pricePerPlayer && (
              <ScoreboardText tone="accent">{event.pricePerPlayer} RUB / игрок</ScoreboardText>
            )}
          </div>
        </div>

        <AttendanceControl eventId={event.id} currentStatus={currentStatus} />
        <RosterNeedsWidget eventId={event.id} />
        {currentStatus === 'going' && isPastEvent && (
          <Link to="/feedback">
            <Text color="link">Оставить отзыв после матча</Text>
          </Link>
        )}
      </div>
    </IceCard>
  )
}
