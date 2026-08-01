/**
 * SPEC-UI-5.1, SPEC-FR-5.2.1, SPEC-FR-6.1.1, SPEC-FR-7.2.1
 * SPEC-FR-15.1.1, SPEC-UI-2.7
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import {fetchEvents} from '@/entities/event'
import {fetchLeagues, fetchLeagueStandings} from '@/entities/league'
import {FavoritesPanel} from '@/features/favorites'
import {LeagueStandings} from '@/features/leagues'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

/**
 * @spec SPEC-UI-5.1 - Правый борт: избранное, таблица, ближайшие события
 * HOCFRONT-17: SOS-карточка скрыта из MVP-входов
 */
export function SideBoard() {
  const {data: events = []} = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {data: leagues = []} = useQuery({queryKey: ['leagues'], queryFn: fetchLeagues})
  const featuredLeague = leagues[0]
  const {data: standings = []} = useQuery({
    queryKey: ['league-standings', featuredLeague?.id],
    queryFn: () => fetchLeagueStandings(featuredLeague!.id),
    enabled: Boolean(featuredLeague?.id),
  })

  const upcoming = events.slice(0, 3)

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
            Панель подсказок и избранного
          </Text>
        </div>
      </IceCard>

      <FavoritesPanel />

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
          Ближайшие игры и тренировки
        </div>
        {upcoming.length === 0 ? (
          <Text color="secondary" data-testid={testId('app', 'side-board', 'empty', 'events')}>
            Пока пусто
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
