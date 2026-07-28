/**
 * SPEC-FR-2.3.1
 */

import {Star, StarFill} from '@gravity-ui/icons'
import {Icon, Text} from '@gravity-ui/uikit'
import type {MouseEvent} from 'react'

import {usePlayerFavorite} from '@/features/player-favorites/lib/usePlayerFavorite'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-2.3.1 - Props кнопки избранного игрока */
export interface PlayerFavoriteButtonProps {
  /** @spec SPEC-FR-2.3.1 */
  playerId: string
  testIdPrefix?: string
  className?: string
  disabled?: boolean
}

/**
 * @spec SPEC-FR-2.3.1 - Кнопка-звезда добавления/снятия из избранного
 */
export function PlayerFavoriteButton({
  playerId,
  testIdPrefix = 'players',
  className,
  disabled,
}: PlayerFavoriteButtonProps) {
  const {isFavorite, isReady, isPending, isError, toggle} = usePlayerFavorite(playerId)
  const pressed = isFavorite === true
  const isDisabled = Boolean(disabled || !isReady || isPending)

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    event.preventDefault()
    if (isDisabled) return
    toggle()
  }

  return (
    <span className="player-favorite">
      <button
        type="button"
        aria-pressed={isReady ? pressed : undefined}
        aria-busy={isPending || undefined}
        aria-label={pressed ? 'Убрать из избранного' : 'Добавить в избранное'}
        title={
          !isReady
            ? 'Загрузка избранного…'
            : isError
              ? 'Не удалось обновить избранное'
              : pressed
                ? 'В избранном'
                : 'В избранное'
        }
        onClick={handleClick}
        disabled={isDisabled}
        className={['player-favorite-btn', pressed && 'player-favorite-btn--on', className]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId(testIdPrefix, 'player-card', 'btn', 'favorite', playerId)}
      >
        <Icon data={pressed ? StarFill : Star} size={18} />
      </button>
      {isError && (
        <Text
          color="danger"
          variant="caption-2"
          className="player-favorite__error"
          role="alert"
          data-testid={testId(testIdPrefix, 'player-card', 'text', 'favorite-error', playerId)}
        >
          Не удалось обновить избранное
        </Text>
      )}
    </span>
  )
}
