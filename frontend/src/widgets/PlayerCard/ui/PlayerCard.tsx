/**
 * SPEC-FR-2.3.1, SPEC-FR-8.2.1, SPEC-FR-8.2.2
 * SPEC-UI-2.1, SPEC-UI-1.3, SPEC-UI-1.4
 * SPEC-FR-17.1.1, SPEC-FR-24.2.1, SPEC-FR-24.2.3
 * HOCFRONT-19 — FavoriteButton на карточке игрока
 */

import {MapPin, Shield} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import type {ReactNode} from 'react'
import {Link} from 'react-router'

import type {PlayerListItem} from '@/entities/profile'
import {FavoriteButton} from '@/features/favorites'
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

const VERIFIED_LABEL = 'Подтверждён'

/** @spec SPEC-FR-2.3.1 - Props карточки игрока */
export interface PlayerCardProps {
  /** @spec SPEC-FR-2.3.1 */
  player: PlayerListItem
  /** Отключить переход на публичный профиль (на странице профиля) */
  linkable?: boolean
}

function CardNav({
  linkable,
  to,
  userId,
  children,
}: {
  linkable: boolean
  to: string
  userId: string
  children: ReactNode
}) {
  if (!linkable) return <>{children}</>
  return (
    <Link
      to={to}
      className="hockey-player-card-link"
      data-testid={testId('players', 'player-card', 'link', userId)}
    >
      {children}
    </Link>
  )
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

  const isVerified = player.verificationStatus === 'verified'
  const profilePath = `/players/${player.userId}`

  const details = (
    <>
      <div
        className="hockey-player-card__meta"
        data-testid={testId('players', 'player-card', 'panel', 'meta', player.userId)}
      >
        <Text
          color="secondary"
          data-testid={testId('players', 'player-card', 'text', 'skill', player.userId)}
        >
          {SKILL_LABELS[player.skillLevel] ?? player.skillLevel}
        </Text>
        {isVerified && (
          <span
            className="hockey-player-card__verified"
            data-testid={testId('players', 'player-card', 'badge', 'verified', player.userId)}
            aria-label="Профиль подтверждён"
            title="Профиль подтверждён"
          >
            {VERIFIED_LABEL}
          </span>
        )}
      </div>

      {player.teamName && (
        <Text
          color="secondary"
          className="hockey-player-card__row"
          data-testid={testId('players', 'player-card', 'text', 'team', player.userId)}
        >
          <Icon data={Shield} size={14} aria-hidden />
          <span className="hockey-sr-only">Команда: </span>
          {player.teamName}
        </Text>
      )}

      <Text
        color="secondary"
        className="hockey-player-card__row"
        data-testid={testId('players', 'player-card', 'text', 'city', player.userId)}
      >
        <Icon data={MapPin} size={14} aria-hidden />
        <span className="hockey-sr-only">Город: </span>
        {player.city}
      </Text>

      <div>
        <Text
          color="secondary"
          className="hockey-text-caption"
          data-testid={testId('players', 'player-card', 'text', 'reliability-label', player.userId)}
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
    </>
  )

  return (
    <IceCard padding="m" data-testid={testId('players', 'player-card', 'card', player.userId)}>
      <div className="hockey-player-card">
        <div className="hockey-player-card__top">
          <CardNav linkable={linkable} to={profilePath} userId={player.userId}>
            <div className="hockey-player-card__top-left">
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
                variant="header-2"
                className="hockey-text-mt-6 hockey-entity-title--compact"
                data-testid={testId('players', 'player-card', 'text', 'name', player.userId)}
              >
                {player.displayName}
              </Text>
            </div>
          </CardNav>
          <div className="hockey-player-card__top-right">
            <FavoriteButton type="player" entityId={player.userId} title={player.displayName} />
            <ScoreboardText
              className="hockey-player-card__number"
              data-testid={testId('players', 'player-card', 'text', 'number', player.userId)}
            >
              {jerseyNumber}
            </ScoreboardText>
          </div>
        </div>

        {linkable ? (
          <Link to={profilePath} className="hockey-player-card-link hockey-player-card__body">
            {details}
          </Link>
        ) : (
          details
        )}
      </div>
    </IceCard>
  )
}
