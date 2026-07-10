/**
 * HOCFRONT-13 — детальная страница ближайших игр (Magic UI).
 * @spec SPEC-FR-4.1.1 - Прототип матч-центра на Magic UI.
 */

import '@/shared/magic-ui/magic-ui.css'

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {CalendarDays, MapPin, Trophy} from 'lucide-react'
import {useMemo} from 'react'
import {Link} from 'react-router-dom'

import {LEAGUE_SATURDAY_EVENT_ID, fetchEvents, type GameEvent} from '@/entities/event'
import {useSessionAccess} from '@/features/access'
import {LeagueGameRsvp, TeamRsvpList} from '@/features/radar'
import {MagicCard} from '@/shared/magic-ui/magic-card'
import {testId} from '@/shared/testing/testId'

function formatGameDateTime(startsAt: string): string {
  return new Date(startsAt).toLocaleString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatGameDateShort(startsAt: string): string {
  return new Date(startsAt).toLocaleString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function UpcomingGameRow({game}: {game: GameEvent}) {
  const isFeatured = game.id === LEAGUE_SATURDAY_EVENT_ID

  return (
    <MagicCard
      className={isFeatured ? 'magic-upcoming-game magic-upcoming-game--featured' : 'magic-upcoming-game'}
      data-testid={testId('events', 'magic-games', 'row', game.id)}
    >
      <div className="magic-upcoming-game__inner">
        <div className="magic-upcoming-game__time">
          <CalendarDays size={16} color="#38bdf8" aria-hidden />
          <span data-testid={testId('events', 'magic-games', 'text', 'datetime', game.id)}>
            {formatGameDateShort(game.startsAt)}
          </span>
        </div>
        <p
          className="magic-upcoming-game__title"
          data-testid={testId('events', 'magic-games', 'text', 'title', game.id)}
        >
          {game.title}
        </p>
        <p className="magic-upcoming-game__arena">
          <MapPin size={14} aria-hidden />
          {game.arenaName ?? game.arenaId}
          {game.district ? ` · ${game.district}` : ''}
        </p>
        {game.pricePerPlayer != null && (
          <p
            className="magic-upcoming-game__price"
            data-testid={testId('events', 'magic-games', 'text', 'price', game.id)}
          >
            {game.pricePerPlayer.toLocaleString('ru-RU')} ₽
          </p>
        )}
      </div>
    </MagicCard>
  )
}

export function NearestGamesPageMagic() {
  const {data: events = [], isLoading} = useQuery({queryKey: ['events'], queryFn: fetchEvents})
  const {userId, roles} = useSessionAccess()
  const canSeeDeclineDetails =
    roles.includes('captain') || roles.includes('coach') || roles.includes('admin')

  const upcomingGames = useMemo(() => {
    return events
      .filter((event) => event.type === 'game')
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
  }, [events])

  const featuredGame = upcomingGames.find((game) => game.id === LEAGUE_SATURDAY_EVENT_ID)
  const otherGames = upcomingGames.filter((game) => game.id !== LEAGUE_SATURDAY_EVENT_ID)

  return (
    <div className="magic-page" data-testid={testId('events', 'magic-games', 'page')}>
      <div className="magic-page__bg1" />
      <div className="magic-page__bg2" />

      <div className="magic-layout">
        <header className="magic-games-header">
          <Link
            to="/events/magic"
            className="magic-classic-link"
            data-testid={testId('events', 'magic-games', 'link', 'back')}
          >
            ← К событиям
          </Link>
          <Text
            variant="header-1"
            className="variable-font-header magic-games-header__title"
            data-testid={testId('events', 'magic-games', 'text', 'title')}
          >
            Ближайшие игры
          </Text>
          <p
            className="magic-games-header__subtitle"
            data-testid={testId('events', 'magic-games', 'text', 'subtitle')}
          >
            RSVP на лиговую игру, состав команды и полное расписание матчей.
          </p>
        </header>

        <section
          className="magic-games-featured"
          data-testid={testId('events', 'magic-games', 'panel', 'featured')}
        >
          <div className="magic-games-section-title">
            <Trophy size={20} color="#fbbf24" aria-hidden />
            <h2 data-testid={testId('events', 'magic-games', 'text', 'featured-title')}>
              Ближайшая игра
            </h2>
          </div>

          <div className="magic-nearest-game__body">
            <LeagueGameRsvp
              eventId={LEAGUE_SATURDAY_EVENT_ID}
              currentUserId={userId}
              variant="magic"
            />
            <div className="magic-nearest-game__list">
              <TeamRsvpList
                eventId={LEAGUE_SATURDAY_EVENT_ID}
                canSeeDeclineDetails={canSeeDeclineDetails}
              />
            </div>
          </div>
        </section>

        <section data-testid={testId('events', 'magic-games', 'panel', 'schedule')}>
          <div className="magic-games-section-title">
            <CalendarDays size={20} color="#38bdf8" aria-hidden />
            <h2 data-testid={testId('events', 'magic-games', 'text', 'schedule-title')}>
              Расписание игр
            </h2>
          </div>

          {isLoading && (
            <div className="magic-loader" data-testid={testId('events', 'magic-games', 'loader')}>
              <span>Загрузка расписания...</span>
            </div>
          )}

          {!isLoading && upcomingGames.length === 0 && (
            <MagicCard data-testid={testId('events', 'magic-games', 'empty')}>
              <div className="magic-games-empty">Игры пока не запланированы.</div>
            </MagicCard>
          )}

          {!isLoading && upcomingGames.length > 0 && (
            <div
              className="magic-upcoming-games-list"
              data-testid={testId('events', 'magic-games', 'list', 'games')}
            >
              {featuredGame && <UpcomingGameRow game={featuredGame} />}
              {otherGames.map((game) => (
                <UpcomingGameRow key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>

        {featuredGame && (
          <p
            className="magic-games-footnote"
            data-testid={testId('events', 'magic-games', 'text', 'featured-footnote')}
          >
            Главная игра: {formatGameDateTime(featuredGame.startsAt)} · {featuredGame.arenaName}
          </p>
        )}
      </div>
    </div>
  )
}
