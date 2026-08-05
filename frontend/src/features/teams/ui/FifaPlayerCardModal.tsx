/**
 * HOCFRONT-25 — FIFA-style карточка игрока (фото, номер, возраст, показатели)
 */

import {Dialog, Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {Link} from 'react-router'

import {fetchPlayers, fetchPublicPlayer} from '@/entities/profile'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import {
  buildFallbackFifaCard,
  buildFifaPlayerCardView,
  type FifaPlayerCardView,
} from '../lib/fifaPlayerCard'

export interface FifaPlayerCardModalProps {
  userId: string | null
  displayNameFallback?: string
  positionFallback?: 'goalie' | 'defense' | 'forward' | 'any'
  open: boolean
  onClose: () => void
}

function StatCell({
  label,
  value,
  userId,
  id,
}: {
  label: string
  value: string | number
  userId: string
  id: string
}) {
  return (
    <div
      className="fifa-player-card__stat"
      data-testid={testId('teams', 'fifa-card', 'cell', id, userId)}
    >
      <span className="fifa-player-card__stat-value">{value}</span>
      <span className="fifa-player-card__stat-label">{label}</span>
    </div>
  )
}

function FifaCardBody({card}: {card: FifaPlayerCardView}) {
  return (
    <div
      className="fifa-player-card"
      data-testid={testId('teams', 'fifa-card', 'card', card.userId)}
    >
      <div className="fifa-player-card__glow" aria-hidden />
      <div className="fifa-player-card__inner">
        <div className="fifa-player-card__top">
          <div className="fifa-player-card__rating-block">
            <Text
              className="fifa-player-card__overall"
              data-testid={testId('teams', 'fifa-card', 'text', 'ovr', card.userId)}
            >
              {card.overall}
            </Text>
            <Text
              className="fifa-player-card__pos"
              data-testid={testId('teams', 'fifa-card', 'badge', 'position', card.userId)}
            >
              {card.positionLabel}
            </Text>
            <Text
              className="fifa-player-card__number"
              data-testid={testId('teams', 'fifa-card', 'text', 'number', card.userId)}
            >
              #{card.jerseyNumber}
            </Text>
          </div>
          <div className="fifa-player-card__photo-wrap">
            <img
              className="fifa-player-card__photo"
              src={card.avatarUrl}
              alt={card.fullName}
              data-testid={testId('teams', 'fifa-card', 'img', 'photo', card.userId)}
            />
          </div>
        </div>

        <div className="fifa-player-card__identity">
          <Text
            className="fifa-player-card__first-name"
            data-testid={testId('teams', 'fifa-card', 'text', 'first-name', card.userId)}
          >
            {card.firstName}
          </Text>
          <Text
            className="fifa-player-card__last-name"
            data-testid={testId('teams', 'fifa-card', 'text', 'last-name', card.userId)}
          >
            {card.lastName || '—'}
          </Text>
          <Text
            className="fifa-player-card__meta"
            data-testid={testId('teams', 'fifa-card', 'text', 'meta', card.userId)}
          >
            {card.age} лет · {card.skillLabel}
          </Text>
        </div>

        <div
          className="fifa-player-card__stats"
          data-testid={testId('teams', 'fifa-card', 'grid', 'stats', card.userId)}
        >
          <StatCell label="Игры" value={card.gamesPlayed} userId={card.userId} id="gp" />
          {card.position === 'goalie' ? (
            <>
              <StatCell
                label="% сейвов"
                value={card.savePct?.toFixed(3) ?? '—'}
                userId={card.userId}
                id="sv"
              />
              <StatCell
                label="GAA"
                value={card.goalsAgainstAvg ?? '—'}
                userId={card.userId}
                id="gaa"
              />
            </>
          ) : (
            <>
              <StatCell label="Голы" value={card.goals} userId={card.userId} id="g" />
              <StatCell label="Пасы" value={card.assists} userId={card.userId} id="a" />
              <StatCell
                label="+/-"
                value={card.plusMinus > 0 ? `+${card.plusMinus}` : card.plusMinus}
                userId={card.userId}
                id="pm"
              />
            </>
          )}
          <StatCell label="Карма" value={card.karmaScore} userId={card.userId} id="karma" />
        </div>

        <Link
          to={`/players/${card.userId}`}
          className="fifa-player-card__profile-link"
          data-testid={testId('teams', 'fifa-card', 'link', 'profile', card.userId)}
        >
          <HockeyButton
            size="s"
            view="outlined"
            data-testid={testId('teams', 'fifa-card', 'btn', 'profile', card.userId)}
          >
            Открыть профиль
          </HockeyButton>
        </Link>
      </div>
    </div>
  )
}

export function FifaPlayerCardModal({
  userId,
  displayNameFallback,
  positionFallback = 'forward',
  open,
  onClose,
}: FifaPlayerCardModalProps) {
  const {data: publicView, isLoading: publicLoading} = useQuery({
    queryKey: ['public-player', userId],
    queryFn: () => fetchPublicPlayer(userId!),
    enabled: open && Boolean(userId),
    retry: false,
  })

  const {data: players = []} = useQuery({
    queryKey: ['players'],
    queryFn: () => fetchPlayers(),
    enabled: open && Boolean(userId) && !publicView,
  })

  const card: FifaPlayerCardView | null = (() => {
    if (!userId) return null
    if (publicView?.player) {
      return buildFifaPlayerCardView({
        ...publicView.player,
        participationHistory: publicView.participationHistory,
      })
    }
    const fromList = players.find((player) => player.userId === userId)
    if (fromList) return buildFifaPlayerCardView(fromList)
    if (displayNameFallback) {
      return buildFallbackFifaCard(userId, displayNameFallback, positionFallback)
    }
    return null
  })()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="s"
      className="fifa-player-card-dialog"
      data-testid={testId('teams', 'fifa-card', 'modal', userId ?? 'none')}
    >
      <Dialog.Header
        caption="Карточка игрока"
        data-testid={testId('teams', 'fifa-card', 'text', 'dialog-title', userId ?? 'none')}
      />
      <Dialog.Body>
        {publicLoading && !card && (
          <ScoreboardLoader
            label="Загрузка карточки"
            data-testid={testId('teams', 'fifa-card', 'loader', userId ?? 'none')}
          />
        )}
        {card && <FifaCardBody card={card} />}
        {!publicLoading && !card && (
          <Text data-testid={testId('teams', 'fifa-card', 'empty', userId ?? 'none')}>
            Игрок не найден
          </Text>
        )}
      </Dialog.Body>
      <Dialog.Footer data-testid={testId('teams', 'fifa-card', 'footer', userId ?? 'none')}>
        <HockeyButton
          size="s"
          view="flat"
          onClick={onClose}
          data-testid={testId('teams', 'fifa-card', 'btn', 'close', userId ?? 'none')}
        >
          Закрыть
        </HockeyButton>
      </Dialog.Footer>
    </Dialog>
  )
}
