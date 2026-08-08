/**
 * HOCFRONT-9 — hero «Ближайшая игра» с RSVP игрока.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchEventRsvp} from '@/entities/event'
import {TeamRsvpResponseControl} from '@/features/radar/ui/TeamRsvpResponseControl'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

export interface LeagueGameRsvpProps {
  eventId: string
  currentUserId?: string
}

export function LeagueGameRsvp({eventId, currentUserId = 'user-001'}: LeagueGameRsvpProps) {
  const {data: board, isLoading} = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  if (isLoading || !board) return null

  const start = new Date(board.startsAt)
  const dateTimeLabel = start.toLocaleString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <IceCard
      padding="m"
      className="league-game-rsvp"
      data-testid={testId('radar', 'league-rsvp', 'card', eventId)}
    >
      <div className="hockey-stack hockey-stack--gap-14">
        <div className="league-game-rsvp__hero hockey-stack hockey-stack--gap-8">
          <Text
            variant="subheader-1"
            data-testid={testId('radar', 'league-rsvp', 'text', 'title', eventId)}
          >
            Ближайшая игра
          </Text>
          <ScoreboardText
            tone="accent"
            data-testid={testId('radar', 'league-rsvp', 'text', 'league', eventId)}
          >
            {board.leagueName}
          </ScoreboardText>
          <Text
            variant="subheader-2"
            data-testid={testId('radar', 'league-rsvp', 'text', 'matchup', eventId)}
          >
            {board.teamName} vs {board.opponentName}
          </Text>
          <div className="league-game-rsvp__meta hockey-stack hockey-stack--gap-4">
            <Text data-testid={testId('radar', 'league-rsvp', 'text', 'datetime', eventId)}>
              {dateTimeLabel}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('radar', 'league-rsvp', 'text', 'arena', eventId)}
            >
              {board.arenaName}
            </Text>
          </div>
        </div>

        <div
          className="league-game-rsvp__actions"
          data-testid={testId('radar', 'league-rsvp', 'panel', 'cta', eventId)}
        >
          <TeamRsvpResponseControl eventId={eventId} currentUserId={currentUserId} />
        </div>
      </div>
    </IceCard>
  )
}
