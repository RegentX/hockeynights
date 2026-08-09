/**
 * HOCFRONT-34A — краткий виджет «Моя лига»: место в таблице и ближайший матч своей команды.
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import {fetchSession} from '@/entities/auth'
import {fetchLeague, fetchLeagueSchedule, fetchLeagueStandings} from '@/entities/league'
import {fetchTeams} from '@/entities/team'
import {leagueDetailsPath} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

/**
 * Компактная карточка «Моя лига»: показывается, только если у игрока есть команда,
 * привязанная к лиге (`Team.leagueId`, @spec SPEC-FR-24.4.2).
 */
export function MyLeagueWidget() {
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const userId = session?.user.id

  const {data: teams = []} = useQuery({
    queryKey: ['teams', {playerId: userId}],
    queryFn: () => fetchTeams({playerId: userId}),
    enabled: Boolean(userId),
  })

  const myTeam = teams.find((team) => team.leagueId)

  const {data: league} = useQuery({
    queryKey: ['league', myTeam?.leagueId],
    queryFn: () => fetchLeague(myTeam!.leagueId!),
    enabled: Boolean(myTeam?.leagueId),
  })

  const {data: standings = []} = useQuery({
    queryKey: ['league-standings', myTeam?.leagueId],
    queryFn: () => fetchLeagueStandings(myTeam!.leagueId!),
    enabled: Boolean(myTeam?.leagueId),
  })

  const {data: schedule = []} = useQuery({
    queryKey: ['league-schedule', myTeam?.leagueId],
    queryFn: () => fetchLeagueSchedule(myTeam!.leagueId!),
    enabled: Boolean(myTeam?.leagueId),
  })

  if (!myTeam || !league) return null

  const ranked = [...standings].sort((a, b) => b.points - a.points)
  const rankIndex = ranked.findIndex((row) => row.teamName === myTeam.name)
  const myStanding = rankIndex >= 0 ? ranked[rankIndex] : undefined

  const nextMatch = schedule
    .filter(
      (item) =>
        item.status !== 'completed' &&
        item.status !== 'cancelled' &&
        (item.homeTeam === myTeam.name || item.awayTeam === myTeam.name),
    )
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0]

  return (
    <div data-testid={testId('leagues', 'my-league', 'card', league.id)}>
      <IceCard padding="m" className="my-league-widget">
        <div className="hockey-row hockey-row--between hockey-row--align-start hockey-row--wrap hockey-row--gap-12">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text
              color="secondary"
              variant="caption-1"
              data-testid={testId('leagues', 'my-league', 'text', 'eyebrow', league.id)}
            >
              Моя лига · {myTeam.name}
            </Text>
            <Text
              variant="subheader-2"
              data-testid={testId('leagues', 'my-league', 'text', 'name', league.id)}
            >
              {league.name}
            </Text>
            {myStanding ? (
              <ScoreboardText
                tone="accent"
                data-testid={testId('leagues', 'my-league', 'text', 'rank', league.id)}
              >
                {rankIndex + 1}-е место из {ranked.length} · {myStanding.points} очк.
              </ScoreboardText>
            ) : (
              <Text
                color="secondary"
                data-testid={testId('leagues', 'my-league', 'text', 'rank-empty', league.id)}
              >
                Таблица пока не сформирована
              </Text>
            )}
            {nextMatch ? (
              <Text
                color="secondary"
                data-testid={testId('leagues', 'my-league', 'text', 'next-match', league.id)}
              >
                Следующая игра: {nextMatch.homeTeam} — {nextMatch.awayTeam},{' '}
                {new Date(nextMatch.startsAt).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            ) : (
              <Text
                color="secondary"
                data-testid={testId('leagues', 'my-league', 'text', 'next-match-empty', league.id)}
              >
                Ближайшая игра пока не назначена
              </Text>
            )}
          </div>
          <Link
            to={leagueDetailsPath(league.id)}
            data-testid={testId('leagues', 'my-league', 'link', 'open', league.id)}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('leagues', 'my-league', 'btn', 'open', league.id)}
            >
              Открыть лигу
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    </div>
  )
}
