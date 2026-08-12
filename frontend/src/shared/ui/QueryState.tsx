/**
 * SPEC-UI-3.1, SPEC-UI-3.2 — единые loading / error / empty состояния запросов
 */

import type {ReactNode} from 'react'

import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

export interface QueryStateProps {
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  loadingLabel?: string
  errorTitle?: string
  errorCopy?: string
  emptyTitle?: string
  emptyCopy?: string
  emptyAction?: ReactNode
  onRetry?: () => void
  testIdPrefix: string
  children?: ReactNode
}

/**
 * Рендерит ScoreboardLoader / EmptyNetState (error|empty) / children.
 * Не рендерит children при loading/error/empty.
 */
export function QueryState({
  isLoading = false,
  isError = false,
  isEmpty = false,
  loadingLabel = 'Загрузка данных',
  errorTitle = 'Не удалось загрузить данные',
  errorCopy = 'Проверь соединение и попробуй ещё раз.',
  emptyTitle = 'Пустая сетка',
  emptyCopy = 'Здесь пока ничего — время забросить первую шайбу.',
  emptyAction,
  onRetry,
  testIdPrefix,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div data-testid={testId(testIdPrefix, 'page', 'loader')}>
        <ScoreboardLoader label={loadingLabel} testIdPrefix={testIdPrefix} />
      </div>
    )
  }

  if (isError) {
    return (
      <div data-testid={testId(testIdPrefix, 'page', 'error')}>
        <EmptyNetState
          title={errorTitle}
          copy={errorCopy}
          testIdPrefix={testIdPrefix}
          action={
            onRetry ? (
              <HockeyButton
                view="outlined"
                size="s"
                onClick={onRetry}
                data-testid={testId(testIdPrefix, 'page', 'btn', 'retry')}
              >
                Повторить
              </HockeyButton>
            ) : undefined
          }
        />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div data-testid={testId(testIdPrefix, 'page', 'empty')}>
        <EmptyNetState
          title={emptyTitle}
          copy={emptyCopy}
          action={emptyAction}
          testIdPrefix={testIdPrefix}
        />
      </div>
    )
  }

  return <>{children}</>
}
