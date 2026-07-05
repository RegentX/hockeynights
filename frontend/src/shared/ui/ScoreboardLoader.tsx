/**
 * SPEC-UI-3.1, SPEC-NFR-10
 */

import {testId} from '@/shared/testing/testId'

const TICKER_LINES = [
  'МЕДВЕДИ 3:2 · слот 20:00 свободен',
  'ДИНАМО 1:1 · ищем вратаря SOS',
  'ТРЕНИРОВКА 19:30 · Ходынка · 4/6 идут',
  'ЛЕД СВОБОДЕН 21:00 · ЦСКА арена',
]

/** @spec SPEC-UI-3.1 - Props loader табло */
export interface ScoreboardLoaderProps {
  /** @spec SPEC-UI-3.1 */
  label?: string
  testIdPrefix?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-UI-3.1 - Бегущая строка табло при загрузке
 */
export function ScoreboardLoader({
  label = 'Загрузка данных',
  testIdPrefix = 'shared',
  'data-testid': dataTestId,
}: ScoreboardLoaderProps) {
  const line = TICKER_LINES.join('   ◆   ')
  const duplicated = `${line}   ◆   ${line}`

  return (
    <div
      className="scoreboard-loader"
      role="status"
      aria-live="polite"
      aria-label={label}
      data-testid={dataTestId ?? testId(testIdPrefix, 'scoreboard-loader', 'loader')}
    >
      <div
        className="scoreboard-loader__track hockey-scoreboard-ticker"
        data-testid={testId(testIdPrefix, 'scoreboard-loader', 'text', 'ticker')}
      >
        <span>{duplicated}</span>
      </div>
    </div>
  )
}
