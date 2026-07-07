/**
 * SPEC-UI-5.1, SPEC-FR-5.2.1, SPEC-FR-6.1.1, SPEC-FR-7.2.1
 * SPEC-FR-15.1.1, SPEC-UI-2.7
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router-dom'

import {fetchEvents} from '@/entities/event'
import {fetchProfileFavorites} from '@/entities/favorites'
import {fetchLeagues, fetchLeagueStandings} from '@/entities/league'
import {fetchRecruitmentRequests} from '@/entities/recruitment'
import {LeagueStandings} from '@/features/leagues'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

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

  const {data: favorites} = useQuery({
    queryKey: ['profile-favorites'],
    queryFn: fetchProfileFavorites,
  })

  const upcoming = events.slice(0, 3)
  const openSos = sosRequests.filter((r) => r.isGoalkeeperSos).length

  return (
    <aside
      className="side-board"
      aria-label="Борт арены"
      data-testid={testId('app', 'side-board', 'panel')}
    >
      <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'hero')}>
        <div className="side-board__hero">
          <ScoreboardText
            tone="accent"
            data-testid={testId('app', 'side-board', 'text', 'hero-title')}
          >
            HOCKEY SOCIAL
          </ScoreboardText>
          <Text
            color="secondary"
            data-testid={testId('app', 'side-board', 'text', 'hero-subtitle')}
          >
            Панель событий и подсказок
          </Text>
        </div>
      </IceCard>

      {favorites && favorites.actions.length > 0 && (
        <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'favorites')}>
          <div
            className="side-board__title"
            data-testid={testId('app', 'side-board', 'text', 'favorites-title')}
          >
            Избранное
          </div>
          <div className="side-board__cta side-board__cta--sm">
            {favorites.actions.map((action) => (
              <Link
                key={action.id}
                to={action.path}
                data-testid={testId('app', 'side-board', 'link', 'favorite', action.id)}
              >
                <HockeyButton
                  view="outlined"
                  size="s"
                  data-testid={testId('app', 'side-board', 'btn', 'favorite', action.id)}
                >
                  {action.icon ? `${action.icon} ` : ''}
                  {action.label}
                </HockeyButton>
              </Link>
            ))}
          </div>
        </IceCard>
      )}

      <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'sos')}>
        <div
          className="side-board__title"
          data-testid={testId('app', 'side-board', 'text', 'sos-title')}
        >
          Goalkeeper SOS
        </div>
        <Text data-testid={testId('app', 'side-board', 'text', 'sos-count')}>
          Открытых запросов:{' '}
          <ScoreboardText
            tone="accent"
            data-testid={testId('app', 'side-board', 'text', 'sos-count-value')}
          >
            {openSos}
          </ScoreboardText>
        </Text>
        <div className="side-board__cta">
          <Link to="/sos" data-testid={testId('app', 'side-board', 'link', 'sos')}>
            <HockeyButton
              variant="sos"
              size="m"
              data-testid={testId('app', 'side-board', 'btn', 'sos')}
            >
              SOS
            </HockeyButton>
          </Link>
        </div>
      </IceCard>

      {featuredLeague && standings.length > 0 && (
        <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'standings')}>
          <div
            className="side-board__title"
            data-testid={testId('app', 'side-board', 'text', 'standings-title')}
          >
            Топ таблицы
          </div>
          <LeagueStandings standings={standings} leagueName={featuredLeague.name} compact />
          <div className="side-board__cta side-board__cta--sm">
            <Link to="/leagues" data-testid={testId('app', 'side-board', 'link', 'leagues')}>
              <HockeyButton
                view="outlined"
                size="s"
                data-testid={testId('app', 'side-board', 'btn', 'all-leagues')}
              >
                Все лиги
              </HockeyButton>
            </Link>
          </div>
        </IceCard>
      )}

      <IceCard padding="s" data-testid={testId('app', 'side-board', 'card', 'events')}>
        <div
          className="side-board__title"
          data-testid={testId('app', 'side-board', 'text', 'events-title')}
        >
          Ближайшие события
        </div>
        {upcoming.length === 0 ? (
          <Text color="secondary" data-testid={testId('app', 'side-board', 'empty', 'events')}>
            Событий нет
          </Text>
        ) : (
          upcoming.map((event) => (
            <div
              key={event.id}
              className="side-board__item"
              data-testid={testId('app', 'side-board', 'item', 'event', event.id)}
            >
              <ScoreboardText
                data-testid={testId('app', 'side-board', 'text', 'event-time', event.id)}
              >
                {new Date(event.startsAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ScoreboardText>
              <Text data-testid={testId('app', 'side-board', 'text', 'event-title', event.id)}>
                {event.title}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('app', 'side-board', 'text', 'event-arena', event.id)}
              >
                {event.arenaName ?? event.arenaId}
              </Text>
            </div>
          ))
        )}
        <div className="side-board__cta side-board__cta--sm">
          <Link to="/events" data-testid={testId('app', 'side-board', 'link', 'events')}>
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('app', 'side-board', 'btn', 'events')}
            >
              {EVENTS_LABEL}
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    </aside>
  )
}
