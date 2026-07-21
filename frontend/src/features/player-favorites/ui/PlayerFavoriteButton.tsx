/**
 * SPEC-FR-2.3.1
 */

import {Star, StarFill} from '@gravity-ui/icons'
import type {ButtonButtonProps} from '@gravity-ui/uikit'
import {Icon} from '@gravity-ui/uikit'
import type {MouseEvent} from 'react'

import {
  useIsPlayerFavorite,
  usePlayerFavoriteToggle,
} from '@/features/player-favorites/lib/usePlayerFavorite'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-2.3.1 - Props кнопки избранного игрока */
export interface PlayerFavoriteButtonProps extends Omit<ButtonButtonProps, 'onClick'> {
  /** @spec SPEC-FR-2.3.1 */
  playerId: string
  testIdPrefix?: string
}

/**
 * @spec SPEC-FR-2.3.1 - Кнопка-звезда добавления/снятия из избранного
 */
export function PlayerFavoriteButton({
  playerId,
  testIdPrefix = 'players',
  ...buttonProps
}: PlayerFavoriteButtonProps) {
  const isFavorite = useIsPlayerFavorite(playerId)
  const toggle = usePlayerFavoriteToggle(playerId)

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    event.preventDefault()
    toggle()
  }

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      title={isFavorite ? 'В избранном' : 'В избранное'}
      onClick={handleClick}
      className={`player-favorite-btn${isFavorite ? ' player-favorite-btn--on' : ''}`}
      data-testid={testId(testIdPrefix, 'player-card', 'btn', 'favorite', playerId)}
      {...buttonProps}
    >
      <Icon data={isFavorite ? StarFill : Star} size={18} />
    </button>
  )
}
