/**
 * SPEC-FR-2.3.1, SPEC-FR-8.2.1, SPEC-FR-8.2.2
 * SPEC-UI-2.1, SPEC-UI-1.3, SPEC-UI-1.4
 * SPEC-FR-24.2.1, SPEC-FR-24.2.3
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router-dom'

import type {PlayerListItem} from '@/entities/profile'
import {KarmaScore} from '@/features/karma'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {PositionLabel} from '@/shared/ui/PositionLabel'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

const SKILL_LABELS: Record<string, string> = {
  beginner: 'Дебютант',
  amateur: 'Любитель',
  advanced: 'Продвинутый',
  league: 'Лига',
  unknown: '—',
}

/** @spec SPEC-FR-2.3.1 - Props карточки игрока */
export interface PlayerCardProps {
  /** @spec SPEC-FR-2.3.1 */
  player: PlayerListItem
  /** Отключить переход на публичный профиль (на странице профиля) */
  linkable?: boolean
}

/**
 * @spec SPEC-UI-2.1 - Hockey card с номером, амплуа, karma, надёжностью
 * @spec SPEC-FR-2.3.1 - Карточка игрока
 */
export function PlayerCard({player, linkable = true}: PlayerCardProps) {
  const jerseyNumber = String(player.userId.replace(/\D/g, '').slice(-2) || '00').padStart(2, '0')
  const isGoalie = player.position === 'goalie'
  const reliability =
    isGoalie && player.goalieReliabilityScore != null
      ? player.goalieReliabilityScore
      : Math.min(100, player.karmaScore)
  const reliabilityLabel =
    isGoalie && player.goalieReliabilityScore != null ? 'Надёжность выходов' : 'Надёжность'

  const card = (
    <IceCard padding="m" data-testid={testId('players', 'player-card', 'card', player.userId)}>
      <div className="hockey-player-card">
        <div className="hockey-player-card__header">
          <div>
            <PositionLabel
              position={player.position}
              testIdPrefix="players"
              data-testid={testId('players', 'player-card', 'badge', 'position', player.userId)}
            />
            {isGoalie && (
              <span
                className="hockey-player-card__goalie-badge"
                data-testid={testId('players', 'player-card', 'badge', 'sos', player.userId)}
              >
                SOS
              </span>
            )}
            <Text
              variant="subheader-2"
              className="hockey-text-mt-6"
              data-testid={testId('players', 'player-card', 'text', 'name', player.userId)}
            >
              {player.displayName}
            </Text>
          </div>
          <ScoreboardText
            className="hockey-player-card__number"
            data-testid={testId('players', 'player-card', 'text', 'number', player.userId)}
          >
            {jerseyNumber}
          </ScoreboardText>
        </div>

        <Text
          color="secondary"
          data-testid={testId('players', 'player-card', 'text', 'skill-district', player.userId)}
        >
          {SKILL_LABELS[player.skillLevel] ?? player.skillLevel} ·{' '}
          {player.district ?? 'район не указан'}
        </Text>
        {player.metro && (
          <Text
            color="secondary"
            data-testid={testId('players', 'player-card', 'text', 'metro', player.userId)}
          >
            м. {player.metro}
          </Text>
        )}

        <div>
          <Text
            color="secondary"
            className="hockey-text-caption"
            data-testid={testId(
              'players',
              'player-card',
              'text',
              'reliability-label',
              player.userId,
            )}
          >
            {reliabilityLabel}
          </Text>
          <div
            className="hockey-player-card__reliability"
            aria-hidden
            data-testid={testId('players', 'player-card', 'cell', 'reliability', player.userId)}
          >
            <div
              className="hockey-player-card__reliability-fill hockey-fill"
              style={{['--hockey-fill-width' as string]: `${reliability}%`}}
            />
          </div>
        </div>

        <KarmaScore
          score={player.karmaScore}
          testIdPrefix="players"
          data-testid={testId('players', 'player-card', 'badge', 'karma', player.userId)}
        />
      </div>
    </IceCard>
  )

  if (!linkable) return card

  return (
    <Link
      to={`/players/${player.userId}`}
      className="hockey-player-card-link"
      data-testid={testId('players', 'player-card', 'link', player.userId)}
    >
      {card}
    </Link>
  )
}
