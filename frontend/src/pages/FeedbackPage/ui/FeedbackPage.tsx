/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.2
 */

import {PostGameFeedbackForm} from '@/features/feedback'
import {KarmaHint} from '@/features/karma'
import {testId} from '@/shared/testing/testId'
import {PageHeader} from '@/shared/ui/PageHeader'

/**
 * @spec SPEC-FR-8.1.1 - Страница feedback
 */
export function FeedbackPage() {
  return (
    <div
      className="hockey-stack hockey-stack--gap-20"
      data-testid={testId('feedback', 'page', 'page')}
    >
      <PageHeader
        title="Feedback после игры"
        subtitle="Оцени явку, уровень и поведение участников — это влияет на karma."
        testIdPrefix="feedback"
      />
      <div data-testid={testId('feedback', 'page', 'panel', 'karma-hint')}>
        <KarmaHint />
      </div>
      <PostGameFeedbackForm />
    </div>
  )
}
