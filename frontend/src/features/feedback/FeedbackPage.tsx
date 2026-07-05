/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.2
 */

import {Text} from '@gravity-ui/uikit'

import {PostGameFeedbackForm} from '@/features/feedback/PostGameFeedbackForm'
import {KarmaHint} from '@/features/karma/KarmaHint'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-FR-8.1.1 - Страница feedback
 */
export function FeedbackPage() {
  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('feedback', 'page', 'page')}
    >
      <Text variant="header-1" data-testid={testId('feedback', 'page', 'text', 'title')}>
        Feedback после игры
      </Text>
      <div data-testid={testId('feedback', 'page', 'panel', 'karma-hint')}>
        <KarmaHint />
      </div>
      <PostGameFeedbackForm />
    </div>
  )
}
