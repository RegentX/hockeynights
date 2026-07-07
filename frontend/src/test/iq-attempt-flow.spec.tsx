/**
 * SPEC-FR-13.1.2
 * SPEC-UI-6.1
 */

import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'

import type {IqQuestion, IqTest} from '@/entities/iq'
import {IqAttemptFlow} from '@/features/iq/ui/IqAttemptFlow'

const TEST: IqTest = {
  id: 'iq-test-001',
  title: 'Тест офсайда',
  category: 'rules',
  difficulty: 'amateur',
  questionCount: 1,
  estimatedMinutes: 1,
}

const QUESTIONS: IqQuestion[] = [
  {
    id: 'q-1',
    testId: 'iq-test-001',
    prompt: 'Что фиксируется при входе в зону раньше шайбы?',
    options: [
      {id: 'a', text: 'Проброс'},
      {id: 'b', text: 'Офсайд'},
    ],
    correctOptionId: 'b',
    explanation: 'Это офсайд.',
  },
]

describe('Hockey IQ attempt flow', () => {
  /** @spec SPEC-FR-13.1.2 - Отправка выбранного ответа */
  it('submits selected answer after click', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <IqAttemptFlow test={TEST} questions={QUESTIONS} onSubmit={onSubmit} onExit={() => {}} />,
    )

    expect(screen.getByText('Тест офсайда')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Офсайд'}))
    await user.click(screen.getByRole('button', {name: 'Завершить тест'}))

    expect(onSubmit).toHaveBeenCalledWith([{questionId: 'q-1', optionId: 'b'}])
  })
})
