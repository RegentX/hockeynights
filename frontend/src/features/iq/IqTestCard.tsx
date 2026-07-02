/**
 * SPEC-FR-13.1.1
 * SPEC-UI-6.1
 */

import {Text} from '@gravity-ui/uikit'

import type {IqTest} from '@/entities/iq/types'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

/** @spec SPEC-FR-13.1.1 - Props карточки теста */
export interface IqTestCardProps {
  /** @spec SPEC-FR-13.1.1 */
  test: IqTest
  /** @spec SPEC-FR-13.1.1 */
  onStart: (test: IqTest) => void
}

/**
 * @spec SPEC-FR-13.1.1 - Карточка теста Hockey IQ
 * @spec SPEC-UI-6.1 - Стиль «тренерская доска»
 */
export function IqTestCard({test, onStart}: IqTestCardProps) {
  return (
    <div data-testid={testId('iq', 'test-card', 'card', test.id)}>
      <IceCard padding="m" className="iq-test-card">
        <div
          className="iq-test-card__meta"
          data-testid={testId('iq', 'test-card', 'panel', 'meta', test.id)}
        >
          <ScoreboardText data-testid={testId('iq', 'test-card', 'text', 'category', test.id)}>
            {test.category.toUpperCase()}
          </ScoreboardText>
          <Text
            color="secondary"
            data-testid={testId('iq', 'test-card', 'text', 'difficulty', test.id)}
          >
            {test.difficulty}
          </Text>
        </div>
        <Text
          variant="subheader-2"
          data-testid={testId('iq', 'test-card', 'text', 'title', test.id)}
        >
          {test.title}
        </Text>
        <Text color="secondary" data-testid={testId('iq', 'test-card', 'text', 'stats', test.id)}>
          Вопросов: <ScoreboardText>{test.questionCount}</ScoreboardText> · Время:{' '}
          <ScoreboardText>{test.estimatedMinutes}м</ScoreboardText>
        </Text>
        <HockeyButton
          onClick={() => onStart(test)}
          data-testid={testId('iq', 'test-card', 'btn', 'start', test.id)}
        >
          На доску
        </HockeyButton>
      </IceCard>
    </div>
  )
}
