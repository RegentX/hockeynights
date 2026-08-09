/**
 * SPEC-UI-3.2, SPEC-NFR-10 — единое состояние ошибки загрузки данных.
 *
 * Раньше каждый экран собирал этот блок заново (или не собирал вовсе —
 * и тогда сбой запроса выглядел как пустой список или вечный лоадер).
 */

import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface QueryErrorStateProps {
  /** Что именно не загрузилось: «Не удалось загрузить лиги» */
  title?: string
  copy?: string
  /** Обычно `() => refetch()` из useQuery */
  onRetry?: () => void
  /** Префикс для data-testid: `leagues` → `leagues-query-error-panel` */
  testIdPrefix?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-NFR-10 - Сбой загрузки объясним и восстановим без перезагрузки
 */
export function QueryErrorState({
  title = 'Не удалось загрузить данные',
  copy = 'Проверьте соединение и попробуйте ещё раз.',
  onRetry,
  testIdPrefix = 'shared',
  'data-testid': dataTestId,
}: QueryErrorStateProps) {
  return (
    <div data-testid={dataTestId ?? testId(testIdPrefix, 'query-error', 'error')}>
      <EmptyNetState
        title={title}
        copy={copy}
        action={
          onRetry ? (
            <HockeyButton
              view="outlined"
              size="s"
              onClick={onRetry}
              data-testid={testId(testIdPrefix, 'query-error', 'btn', 'retry')}
            >
              Повторить
            </HockeyButton>
          ) : undefined
        }
      />
    </div>
  )
}
