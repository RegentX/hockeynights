/**
 * HOCFRONT-19 / TASK-02-05 — FavoriteButton
 */

import {Heart, HeartFill} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'
import {type MouseEvent, useId, useState} from 'react'

import type {FavoriteType} from '@/entities/favorites'
import {buildFavoriteHref} from '@/entities/favorites'
import {useIsFavorite, useToggleFavorite} from '@/features/favorites/model/useFavorites'
import {testId} from '@/shared/testing/testId'

export interface FavoriteButtonProps {
  type: FavoriteType
  entityId: string
  title: string
  href?: string
  size?: 's' | 'm'
  className?: string
  /** Останавливает всплытие (карточки-кнопки / picker) */
  stopPropagation?: boolean
}

export function FavoriteButton({
  type,
  entityId,
  title,
  href,
  size = 's',
  className,
  stopPropagation = true,
}: FavoriteButtonProps) {
  const favorited = useIsFavorite(type, entityId)
  const toggle = useToggleFavorite()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const iconSize = size === 'm' ? 20 : 16
  const slug = `${type}-${entityId}`
  const errorId = useId()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.preventDefault()
      event.stopPropagation()
    }
    setErrorMessage(null)
    toggle.mutate(
      {
        type,
        entityId,
        title,
        favorited,
        href: href ?? buildFavoriteHref(type, entityId),
      },
      {
        onError: (error) => {
          setErrorMessage(error instanceof Error ? error.message : 'Не удалось обновить избранное')
        },
      },
    )
  }

  const label = favorited ? `Убрать «${title}» из избранного` : `Добавить «${title}» в избранное`
  const stateClass = favorited ? ' favorite-btn--active' : ''
  const loadingClass = toggle.isPending ? ' favorite-btn--loading' : ''
  const errorClass = errorMessage ? ' favorite-btn--error' : ''

  return (
    <span className={`favorite-btn-wrap${errorClass ? ' favorite-btn-wrap--error' : ''}`}>
      <button
        type="button"
        className={`favorite-btn${stateClass}${loadingClass}${errorClass}${className ? ` ${className}` : ''}`}
        aria-pressed={favorited}
        aria-busy={toggle.isPending}
        aria-label={label}
        aria-describedby={errorMessage ? errorId : undefined}
        title={errorMessage ?? label}
        disabled={toggle.isPending}
        onClick={handleClick}
        data-testid={testId('favorites', 'btn', 'toggle', slug)}
      >
        <Icon data={favorited ? HeartFill : Heart} size={iconSize} />
        {errorMessage && (
          <span
            className="favorite-btn__error"
            aria-hidden
            data-testid={testId('favorites', 'error', slug)}
          >
            !
          </span>
        )}
      </button>
      <span
        id={errorId}
        className="favorite-btn__status"
        role="status"
        aria-live="polite"
        data-testid={testId('favorites', 'error-status', slug)}
      >
        {errorMessage ?? ''}
      </span>
    </span>
  )
}
