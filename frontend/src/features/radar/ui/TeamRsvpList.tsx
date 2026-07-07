/**
 * HOCFRONT-9 — состав команды с RSVP по амплуа.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import type {PlayerPosition} from '@/entities/common'
import type {EventRsvpPlayer, EventRsvpStatus} from '@/entities/event'
import {fetchEventRsvp} from '@/entities/event'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PositionLabel} from '@/shared/ui/PositionLabel'

export interface TeamRsvpListProps {
  eventId: string
  /** Капитан/тренер видит причину отказа; игрок — только «не сможет» */
  canSeeDeclineDetails?: boolean
}

const POSITION_ORDER: PlayerPosition[] = ['goalie', 'defense', 'forward']

const POSITION_GROUP_LABELS: Record<PlayerPosition, string> = {
  goalie: 'Вратари',
  defense: 'Защитники',
  forward: 'Нападающие',
  any: 'Универсалы',
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

function formatPlayerStatus(player: EventRsvpPlayer, canSeeDeclineDetails: boolean): string {
  if (player.status === 'declined') {
    if (canSeeDeclineDetails && player.declineReason) {
      return `${STATUS_LABELS.declined} · ${player.declineReason}`
    }
    return 'Не сможет'
  }
  return STATUS_LABELS[player.status]
}

export function TeamRsvpList({eventId, canSeeDeclineDetails = false}: TeamRsvpListProps) {
  const {data: board} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  const grouped = useMemo(() => {
    if (!board) return []
    return POSITION_ORDER.map((position) => ({
      position,
      label: POSITION_GROUP_LABELS[position],
      players: board.players.filter((player) => player.position === position),
    })).filter((group) => group.players.length > 0)
  }, [board])

  if (!board) return null

  return (
    <IceCard padding="m" data-testid={testId('radar', 'team-rsvp', 'card', eventId)}>
      <div className="hockey-stack hockey-stack--gap-12">
        <Text
          variant="subheader-2"
          data-testid={testId('radar', 'team-rsvp', 'text', 'title', eventId)}
        >
          Кто идёт из команды
        </Text>

        {grouped.map((group) => (
          <section
            key={group.position}
            className="team-rsvp-list__group hockey-stack hockey-stack--gap-8"
            data-testid={testId('radar', 'team-rsvp', 'panel', group.position, eventId)}
          >
            <Text
              variant="body-2"
              color="secondary"
              data-testid={testId('radar', 'team-rsvp', 'text', 'group-title', group.position)}
            >
              {group.label}
            </Text>
            <div
              className="hockey-stack hockey-stack--gap-6"
              data-testid={testId('radar', 'team-rsvp', 'list', group.position, eventId)}
            >
              {group.players.map((player) => (
                <div
                  key={player.userId}
                  className="team-rsvp-list__row hockey-row hockey-row--between hockey-row--gap-12"
                  data-testid={testId('radar', 'team-rsvp', 'item', player.userId, eventId)}
                >
                  <div className="hockey-row hockey-row--gap-8">
                    <PositionLabel position={player.position} testIdPrefix="radar" />
                    <Text data-testid={testId('radar', 'team-rsvp', 'text', 'name', player.userId)}>
                      {player.displayName}
                    </Text>
                  </div>
                  <Text
                    color={STATUS_COLORS[player.status]}
                    data-testid={testId('radar', 'team-rsvp', 'text', 'status', player.userId)}
                  >
                    {formatPlayerStatus(player, canSeeDeclineDetails)}
                  </Text>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </IceCard>
  )
}
