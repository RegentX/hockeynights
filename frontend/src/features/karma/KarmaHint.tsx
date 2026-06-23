/**
 * SPEC-FR-8.2.2
 */

import {Text} from '@gravity-ui/uikit'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-8.2.2 - Props подсказки karma */
export interface KarmaHintProps {
  /** @spec SPEC-FR-8.2.2 */
  hint?: string
  testIdPrefix?: string
  'data-testid'?: string
}

/**
 * @spec SPEC-FR-8.2.2 - Пояснение, что karma — вспомогательный сигнал
 */
export function KarmaHint({
  hint,
  testIdPrefix = 'karma',
  'data-testid': dataTestId,
}: KarmaHintProps) {
  return (
    <Text
      color="secondary"
      variant="caption-2"
      data-testid={dataTestId ?? testId(testIdPrefix, 'karma-hint', 'text')}
    >
      {hint ?? 'Karma — вспомогательный сигнал надёжности, не абсолютная оценка уровня игрока'}
    </Text>
  )
}
