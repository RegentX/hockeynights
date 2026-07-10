import {ChevronRight, MapPin, Trophy} from 'lucide-react'
import {Link} from 'react-router-dom'

import type {EventRsvpBoard} from '@/entities/event'
import {MagicCard} from '@/shared/magic-ui/magic-card'
import {testId} from '@/shared/testing/testId'

interface NearestGameTeaserCardProps {
  board: EventRsvpBoard
  dateTimeLabel: string
}

export function NearestGameTeaserCard({board, dateTimeLabel}: NearestGameTeaserCardProps) {
  return (
    <Link
      to="/events/magic/games"
      className="magic-card-link magic-nearest-game-teaser-link"
      data-testid={testId('events', 'magic', 'link', 'nearest-game')}
    >
      <MagicCard
        className="magic-nearest-game-teaser"
        data-testid={testId('events', 'magic', 'card', 'nearest-game-teaser')}
      >
        <div className="magic-nearest-game-teaser__inner">
          <div className="magic-nearest-game-teaser__icon" aria-hidden>
            <Trophy size={22} color="#fbbf24" />
          </div>

          <div className="magic-nearest-game-teaser__content">
            <p
              className="magic-nearest-game-teaser__eyebrow"
              data-testid={testId('events', 'magic', 'text', 'nearest-game-label')}
            >
              Ближайшая игра
            </p>
            <p
              className="magic-nearest-game-teaser__league"
              data-testid={testId('events', 'magic', 'text', 'nearest-game-league')}
            >
              {board.leagueName}
            </p>
            <p
              className="magic-nearest-game-teaser__matchup"
              data-testid={testId('events', 'magic', 'text', 'nearest-game-matchup')}
            >
              {board.teamName} vs {board.opponentName}
            </p>
            <p
              className="magic-nearest-game-teaser__meta"
              data-testid={testId('events', 'magic', 'text', 'nearest-game-datetime')}
            >
              {dateTimeLabel}
            </p>
            <p className="magic-nearest-game-teaser__arena">
              <MapPin size={14} aria-hidden />
              {board.arenaName}
            </p>
          </div>

          <ChevronRight className="magic-nearest-game-teaser__chevron" size={20} aria-hidden />
        </div>
      </MagicCard>
    </Link>
  )
}
