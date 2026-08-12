/**
 * HOCFRONT-9 — hero «Ближайшая игра» с RSVP игрока.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchEventRsvp} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {TeamRsvpResponseControl} from '@/features/radar/ui/TeamRsvpResponseControl'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

export interface LeagueGameRsvpProps {
  eventId: string
  currentUserId?: string
}

export function LeagueGameRsvp({eventId, currentUserId}: LeagueGameRsvpProps) {
  const {userId: sessionUserId} = useSessionAccess()
  const resolvedUserId = currentUserId || sessionUserId
  const {
    data: board,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['event-rsvp', eventId],
    queryFn: () => fetchEventRsvp(eventId),
  })

  if (isLoading) {
    return <ScoreboardLoader label="Загрузка RSVP" testIdPrefix="radar" />
  }

  if (isError || !board) {
    return (
      <EmptyNetState
        title="Не удалось загрузить RSVP"
        copy="Проверь соединение и попробуй ещё раз."
        testIdPrefix="radar"
        action={
          <HockeyButton view="outlined" size="s" onClick={() => void refetch()}>
            Повторить
          </HockeyButton>
        }
      />
    )
  }

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
          <TeamRsvpResponseControl eventId={eventId} currentUserId={resolvedUserId} />
        </div>
      </div>
    </IceCard>
  )
}
