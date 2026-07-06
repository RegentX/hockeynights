/**
 * SPEC-FR-8.2.1, SPEC-FR-8.2.2
 * SPEC-UI-1.5
 */

import {testId} from '@/shared/testing/testId'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

/** @spec SPEC-FR-8.2.1 - Props karma score */
export interface KarmaScoreProps {
  /** @spec SPEC-FR-8.2.1 */
  score: number
  /** @spec SPEC-FR-8.2.1 */
  size?: 's' | 'm'
  testIdPrefix?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-UI-1.5 - Karma в LED-стиле
 * @spec SPEC-FR-8.2.1 - Отображение karma score
 */
export function KarmaScore({
  score,
  testIdPrefix = 'karma',
  'data-testid': dataTestId,
}: KarmaScoreProps) {
  const tone = score >= 80 ? 'gold' : score >= 60 ? 'accent' : 'default'

  return (
    <span
      aria-label={`Karma: ${score}`}
      data-testid={dataTestId ?? testId(testIdPrefix, 'karma-score', 'badge')}
    >
      Karma{' '}
      <ScoreboardText
        tone={tone}
        data-testid={testId(testIdPrefix, 'karma-score', 'text', 'value')}
      >
        {score}
      </ScoreboardText>
    </span>
  )
}
