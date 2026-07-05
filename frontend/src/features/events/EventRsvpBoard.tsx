/**
 * SPEC-FR-25.6.1
 * Состав команды с RSVP-статусами на лиговую игру.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import type {EventRsvpStatus} from '@/entities/event/rsvpTypes'
import {fetchEventRsvp} from '@/features/events/api/eventsApi'
import {testId} from '@/shared/testing/testId'

export interface EventRsvpBoardProps {
  eventId: string
}

const STATUS_LABELS: Record<EventRsvpStatus, string> = {
  confirmed: 'Подтвердил',
  declined: 'Отказался',
  pending: 'Не ответил',
}

const STATUS_COLORS: Record<EventRsvpStatus, 'positive' | 'danger' | 'secondary'> = {
  confirmed: 'positive',
  declined: 'danger',
  pending: 'secondary',
}

export function EventRsvpBoard({eventId}: EventRsvpBoardProps) {
  const {data: board} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  if (!board) return null

  return (
    <div
      className="hockey-stack hockey-stack--gap-8"
      data-testid={testId('events', 'rsvp', 'panel', eventId)}
    >
      <Text variant="subheader-2" data-testid={testId('events', 'rsvp', 'text', 'title', eventId)}>
        RSVP команды · {board.teamName} vs {board.opponentName}
      </Text>
      <div
        className="hockey-stack hockey-stack--gap-4"
        data-testid={testId('events', 'rsvp', 'list', eventId)}
      >
        {board.players.map((player) => (
          <div
            key={player.userId}
            className="hockey-row hockey-row--between hockey-row--gap-12"
            data-testid={testId('events', 'rsvp', 'item', player.userId, eventId)}
          >
            <Text data-testid={testId('events', 'rsvp', 'text', 'name', player.userId)}>
              {player.displayName}
            </Text>
            <Text
              color={STATUS_COLORS[player.status]}
              data-testid={testId('events', 'rsvp', 'text', 'status', player.userId)}
            >
              {STATUS_LABELS[player.status]}
              {player.declineReason ? ` · ${player.declineReason}` : ''}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}
