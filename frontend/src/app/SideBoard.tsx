/**
 * SPEC-UI-5.1, SPEC-FR-5.2.1, SPEC-FR-6.1.1, SPEC-FR-7.2.1
 * SPEC-FR-15.1.1, SPEC-UI-2.7
 */

import {Link} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchEvents} from '@/features/events/api/eventsApi'
import {fetchRecruitmentRequests} from '@/features/sos/api/recruitmentApi'
import {fetchLeagues, fetchLeagueStandings} from '@/features/leagues/api/leaguesApi'
import {fetchRadarRecommendations} from '@/features/radar/api/radarApi'
import {LeagueStandings} from '@/features/leagues/LeagueStandings'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {testId} from '@/shared/testing/testId'
import {ARENAS_LABEL, RADAR_LABEL} from '@/shared/config/navigationLabels'

/**
 * @spec SPEC-UI-5.1 - Борт с SOS, слотами и топом таблицы
 */
export function SideBoard() {
  const {data: events = []} = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {data: sosRequests = []} = useQuery({
    queryKey: ['recruitment-requests', true],
    queryFn: () => fetchRecruitmentRequests({goalieOnly: true}),
  })
  const {data: leagues = []} = useQuery({queryKey: ['leagues'], queryFn: fetchLeagues})
  const featuredLeague = leagues[0]
  const {data: standings = []} = useQuery({
    queryKey: ['league-standings', featuredLeague?.id],
    queryFn: () => fetchLeagueStandings(featuredLeague!.id),
    enabled: Boolean(featuredLeague?.id),
  })

  const {data: radarItems = []} = useQuery({
    queryKey: ['radar-recommendations'],
    queryFn: fetchRadarRecommendations,
  })

  const upcoming = events.slice(0, 3)
  const openSos = sosRequests.filter((r) => r.isGoalkeeperSos).length
  const topRadar = radarItems.slice(0, 2)

  return (
    <aside className="side-board" aria-label="Борт арены" data-testid={testId('app', 'side-board', 'panel')}>
      <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'hero')}>
        <div className="side-board__hero">
          <ScoreboardText tone="accent" data-testid={testId('app', 'side-board', 'text', 'hero-title')}>HOCKEY SOCIAL</ScoreboardText>
          <Text color="secondary" data-testid={testId('app', 'side-board', 'text', 'hero-subtitle')}>Панель событий и подсказок</Text>
        </div>
      </IceCard>

      <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'radar')}>
        <div className="side-board__title" data-testid={testId('app', 'side-board', 'text', 'radar-title')}>{RADAR_LABEL}</div>
        {topRadar.length === 0 ? (
          <Text color="secondary" data-testid={testId('app', 'side-board', 'empty', 'radar')}>Нет активных подсказок</Text>
        ) : (
          topRadar.map((item) => (
            <div key={item.id} className="side-board__item" data-testid={testId('app', 'side-board', 'item', 'radar', item.id)}>
              <ScoreboardText tone="accent" data-testid={testId('app', 'side-board', 'text', 'radar-reason', item.id)}>{item.reasonText}</ScoreboardText>
              <Text data-testid={testId('app', 'side-board', 'text', 'radar-title-item', item.id)}>{item.title}</Text>
            </div>
          ))
        )}
        <div className="side-board__cta">
          <Link to="/radar" data-testid={testId('app', 'side-board', 'link', 'radar')}>
            <HockeyButton view="outlined" size="s" data-testid={testId('app', 'side-board', 'btn', 'open-radar')}>
                {RADAR_LABEL}
            </HockeyButton>
          </Link>
        </div>
      </IceCard>

      <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'sos')}>
        <div className="side-board__title" data-testid={testId('app', 'side-board', 'text', 'sos-title')}>Goalkeeper SOS</div>
        <Text data-testid={testId('app', 'side-board', 'text', 'sos-count')}>
          Открытых запросов:{' '}
          <ScoreboardText tone="accent" data-testid={testId('app', 'side-board', 'text', 'sos-count-value')}>{openSos}</ScoreboardText>
        </Text>
        <div className="side-board__cta">
          <Link to="/sos" data-testid={testId('app', 'side-board', 'link', 'sos')}>
            <HockeyButton variant="sos" size="m" data-testid={testId('app', 'side-board', 'btn', 'sos')}>
              SOS
            </HockeyButton>
          </Link>
        </div>
      </IceCard>

      {featuredLeague && standings.length > 0 && (
        <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'standings')}>
          <div className="side-board__title" data-testid={testId('app', 'side-board', 'text', 'standings-title')}>Топ таблицы</div>
          <LeagueStandings
            standings={standings}
            leagueName={featuredLeague.name}
            compact
          />
          <div className="side-board__cta side-board__cta--sm">
            <Link to="/leagues" data-testid={testId('app', 'side-board', 'link', 'leagues')}>
              <HockeyButton view="outlined" size="s" data-testid={testId('app', 'side-board', 'btn', 'all-leagues')}>
                Все лиги
              </HockeyButton>
            </Link>
          </div>
        </IceCard>
      )}

      <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'events')}>
        <div className="side-board__title" data-testid={testId('app', 'side-board', 'text', 'events-title')}>Ближайшие события</div>
        {upcoming.length === 0 ? (
          <Text color="secondary" data-testid={testId('app', 'side-board', 'empty', 'events')}>Событий нет</Text>
        ) : (
          upcoming.map((event) => (
            <div key={event.id} className="side-board__item" data-testid={testId('app', 'side-board', 'item', 'event', event.id)}>
              <ScoreboardText data-testid={testId('app', 'side-board', 'text', 'event-time', event.id)}>
                {new Date(event.startsAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ScoreboardText>
              <Text data-testid={testId('app', 'side-board', 'text', 'event-title', event.id)}>{event.title}</Text>
              <Text color="secondary" data-testid={testId('app', 'side-board', 'text', 'event-arena', event.id)}>{event.arenaName ?? event.arenaId}</Text>
            </div>
          ))
        )}
        <div className="side-board__cta side-board__cta--sm">
          <Link to="/arenas" data-testid={testId('app', 'side-board', 'link', 'arenas')}>
            <HockeyButton view="outlined" size="s" data-testid={testId('app', 'side-board', 'btn', 'arenas')}>
                {ARENAS_LABEL}
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    </aside>
  )
}
