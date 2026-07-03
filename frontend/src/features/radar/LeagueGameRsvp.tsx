/**
 * HOCFRONT-9 — hero «Ближайшая игра» с RSVP игрока.
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import type {EventRsvpStatus} from '@/entities/event/rsvpTypes'
import {fetchEventRsvp, updateEventRsvp} from '@/features/events/api/eventsApi'
import {DeclineReasonField} from '@/features/radar/DeclineReasonField'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {testId} from '@/shared/testing/testId'

export interface LeagueGameRsvpProps {
  eventId: string
  currentUserId?: string
}

const PLAYER_STATUS_LABELS: Record<EventRsvpStatus, string> = {
  confirmed: 'Вы идёте',
  declined: 'Вы не сможете',
  pending: 'Ответ не отправлен',
}

const PLAYER_STATUS_COLORS: Record<EventRsvpStatus, 'positive' | 'danger' | 'warning'> = {
  confirmed: 'positive',
  declined: 'danger',
  pending: 'warning',
}

export function LeagueGameRsvp({eventId, currentUserId = 'user-001'}: LeagueGameRsvpProps) {
  const queryClient = useQueryClient()
  const [showDeclineReason, setShowDeclineReason] = useState(false)

  const {data: board, isLoading} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  const mutation = useMutation({
    mutationFn: (payload: {status: EventRsvpStatus; declineReason?: string}) =>
      updateEventRsvp(eventId, payload),
    onSuccess: () => {
      setShowDeclineReason(false)
      void queryClient.invalidateQueries({queryKey: ['event-rsvp', eventId]})
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['calendar']})
    },
  })

  if (isLoading || !board) return null

  const myStatus = board.players.find((player) => player.userId === currentUserId)?.status ?? 'pending'
  const start = new Date(board.startsAt)
  const dateTimeLabel = start.toLocaleString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  function confirmAttendance() {
    mutation.mutate({status: 'confirmed'})
  }

  function submitDecline(reason: string) {
    mutation.mutate({status: 'declined', declineReason: reason})
  }

  return (
    <IceCard padding="m" className="league-game-rsvp" data-testid={testId('radar', 'league-rsvp', 'card', eventId)}>
      <div className="hockey-stack hockey-stack--gap-14">
        <div className="league-game-rsvp__hero hockey-stack hockey-stack--gap-8">
          <Text
            variant="subheader-1"
            data-testid={testId('radar', 'league-rsvp', 'text', 'title', eventId)}
          >
            Ближайшая игра
          </Text>
          <ScoreboardText tone="accent" data-testid={testId('radar', 'league-rsvp', 'text', 'league', eventId)}>
            {board.leagueName}
          </ScoreboardText>
          <Text variant="subheader-2" data-testid={testId('radar', 'league-rsvp', 'text', 'matchup', eventId)}>
            {board.teamName} vs {board.opponentName}
          </Text>
          <div className="league-game-rsvp__meta hockey-stack hockey-stack--gap-4">
            <Text data-testid={testId('radar', 'league-rsvp', 'text', 'datetime', eventId)}>
              {dateTimeLabel}
            </Text>
            <Text color="secondary" data-testid={testId('radar', 'league-rsvp', 'text', 'arena', eventId)}>
              {board.arenaName}
            </Text>
          </div>
          <div className="hockey-row hockey-row--gap-6">
            <Text data-testid={testId('radar', 'league-rsvp', 'text', 'player-status', eventId)}>
              Ваш статус:
            </Text>
            <Text color={PLAYER_STATUS_COLORS[myStatus]} data-testid={testId('radar', 'league-rsvp', 'text', 'player-status-value', eventId)}>
              {PLAYER_STATUS_LABELS[myStatus]}
            </Text>
          </div>
        </div>

        {!showDeclineReason ? (
          <div className="league-game-rsvp__actions hockey-row hockey-row--gap-10 hockey-row--wrap" data-testid={testId('radar', 'league-rsvp', 'panel', 'cta', eventId)}>
            <HockeyButton
              view="action"
              size="l"
              loading={mutation.isPending}
              onClick={confirmAttendance}
              data-testid={testId('radar', 'league-rsvp', 'btn', 'confirm', eventId)}
            >
              Буду
            </HockeyButton>
            <HockeyButton
              view="outlined"
              size="l"
              loading={mutation.isPending}
              onClick={() => setShowDeclineReason(true)}
              data-testid={testId('radar', 'league-rsvp', 'btn', 'decline', eventId)}
            >
              Не смогу
            </HockeyButton>
          </div>
        ) : (
          <div className="league-game-rsvp__actions">
            <DeclineReasonField
              onConfirm={submitDecline}
              onCancel={() => setShowDeclineReason(false)}
              isPending={mutation.isPending}
            />
          </div>
        )}
      </div>
    </IceCard>
  )
}
