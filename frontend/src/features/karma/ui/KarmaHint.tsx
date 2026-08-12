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
 * @spec SPEC-FR-8.2.2 - Пояснение, от чего зависит karma
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
      {hint ??
        'Карма растёт за участие в жизни сообщества: явка на тренировки и игры повышает её, неявка — снижает. Это сигнал надёжности, а не оценка уровня игры.'}
    </Text>
  )
}
