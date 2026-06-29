/**
 * SPEC-FR-13.1.2
 * SPEC-UI-6.1
 */

import {useMemo, useState} from 'react'
import {Text} from '@gravity-ui/uikit'
import type {IqAttemptResult, IqQuestion, IqTest} from '@/entities/iq/types'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-13.1.2 - Props прохождения теста */
export interface IqAttemptFlowProps {
  /** @spec SPEC-FR-13.1.1 */
  test: IqTest
  /** @spec SPEC-FR-13.1.2 */
  questions: IqQuestion[]
  /** @spec SPEC-FR-13.1.2 */
  isSubmitting?: boolean
  /** @spec SPEC-FR-13.1.2 */
  result?: IqAttemptResult | null
  /** @spec SPEC-FR-13.1.2 */
  onSubmit: (answers: Array<{questionId: string; optionId: string}>) => void
  /** @spec SPEC-FR-13.1.1 */
  onExit: () => void
}

/**
 * @spec SPEC-FR-13.1.2 - Интерактивный проход теста
 * @spec SPEC-UI-6.1 - UI в формате «тренерская доска»
 */
export function IqAttemptFlow({
  test,
  questions,
  isSubmitting = false,
  result,
  onSubmit,
  onExit,
}: IqAttemptFlowProps) {
  const [cursor, setCursor] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentQuestion = questions[cursor]

  /** @spec SPEC-FR-13.1.2 - Текущее состояние прогресса попытки */
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  )

  /** @spec SPEC-FR-13.1.2 - Выбор ответа для вопроса */
  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({...prev, [questionId]: optionId}))
  }

  /** @spec SPEC-FR-13.1.2 - Отправка завершённой попытки */
  function finishAttempt() {
    const payload = questions.map((q) => ({
      questionId: q.id,
      optionId: answers[q.id] ?? '',
    }))
    onSubmit(payload)
  }

  if (!currentQuestion) {
    return (
      <div data-testid={testId('iq', 'attempt-flow', 'empty', test.id)}>
        <IceCard padding="m">
          <Text color="secondary" data-testid={testId('iq', 'attempt-flow', 'text', 'no-questions')}>
            Вопросы пока недоступны.
          </Text>
          <div className="hockey-mt-8">
            <HockeyButton
              view="outlined"
              onClick={onExit}
              data-testid={testId('iq', 'attempt-flow', 'btn', 'exit-empty')}
            >
              Назад к каталогу
            </HockeyButton>
          </div>
        </IceCard>
      </div>
    )
  }

  if (result) {
    return (
      <div data-testid={testId('iq', 'attempt-flow', 'panel', 'result', test.id)}>
        <IceCard padding="m" className="iq-board">
          <Text variant="header-1" data-testid={testId('iq', 'attempt-flow', 'text', 'result-title')}>
            Результат теста
          </Text>
          <Text data-testid={testId('iq', 'attempt-flow', 'text', 'result-score')}>
            <ScoreboardText tone="accent">{result.score}</ScoreboardText> /{' '}
            <ScoreboardText>{result.maxScore}</ScoreboardText>
          </Text>
          <Text color="secondary" data-testid={testId('iq', 'attempt-flow', 'text', 'result-streak')}>
            Серия: <ScoreboardText>{result.streak}</ScoreboardText>
          </Text>
          <div className="hockey-mt-8 hockey-stack hockey-stack--gap-8" data-testid={testId('iq', 'attempt-flow', 'list', 'result-details')}>
            {result.details.map((detail, index) => (
              <div
                key={detail.questionId}
                className="iq-result-row"
                data-testid={testId('iq', 'attempt-flow', 'row', 'result', detail.questionId)}
              >
                <Text data-testid={testId('iq', 'attempt-flow', 'text', 'result-verdict', detail.questionId)}>
                  {index + 1}. {detail.userOptionId === detail.correctOptionId ? 'Верно' : 'Ошибка'}
                </Text>
                <Text
                  color="secondary"
                  data-testid={testId('iq', 'attempt-flow', 'text', 'result-explanation', detail.questionId)}
                >
                  {detail.explanation}
                </Text>
              </div>
            ))}
          </div>
          <div className="hockey-row hockey-row--gap-8 hockey-mt-12">
            <HockeyButton
              onClick={onExit}
              data-testid={testId('iq', 'attempt-flow', 'btn', 'exit-result')}
            >
              К каталогу
            </HockeyButton>
          </div>
        </IceCard>
      </div>
    )
  }

  return (
    <div data-testid={testId('iq', 'attempt-flow', 'panel', 'board', test.id)}>
      <IceCard padding="m" className="iq-board">
        <div className="iq-board__head" data-testid={testId('iq', 'attempt-flow', 'panel', 'head')}>
          <Text variant="subheader-2" data-testid={testId('iq', 'attempt-flow', 'text', 'test-title')}>
            {test.title}
          </Text>
          <ScoreboardText data-testid={testId('iq', 'attempt-flow', 'text', 'progress')}>
            {cursor + 1}/{questions.length}
          </ScoreboardText>
        </div>

        <Text color="secondary" data-testid={testId('iq', 'attempt-flow', 'text', 'answered-count')}>
          Отвечено: <ScoreboardText>{answeredCount}</ScoreboardText>
        </Text>
        <Text
          className="hockey-text-mt-8"
          data-testid={testId('iq', 'attempt-flow', 'text', 'prompt', currentQuestion.id)}
        >
          {currentQuestion.prompt}
        </Text>

        <div className="iq-board__options" data-testid={testId('iq', 'attempt-flow', 'list', 'options', currentQuestion.id)}>
          {currentQuestion.options.map((option) => {
            const selected = answers[currentQuestion.id] === option.id
            return (
              <button
                key={option.id}
                type="button"
                className={`iq-option${selected ? ' iq-option--selected' : ''}`}
                onClick={() => selectAnswer(currentQuestion.id, option.id)}
                data-testid={testId('iq', 'attempt-flow', 'btn', 'option', currentQuestion.id, option.id)}
              >
                {option.text}
              </button>
            )
          })}
        </div>

        <div className="iq-board__actions" data-testid={testId('iq', 'attempt-flow', 'panel', 'actions')}>
          <HockeyButton
            view="outlined"
            disabled={cursor === 0}
            onClick={() => setCursor((prev) => Math.max(0, prev - 1))}
            data-testid={testId('iq', 'attempt-flow', 'btn', 'prev')}
          >
            Назад
          </HockeyButton>
          {cursor < questions.length - 1 ? (
            <HockeyButton
              onClick={() => setCursor((prev) => prev + 1)}
              data-testid={testId('iq', 'attempt-flow', 'btn', 'next')}
            >
              Дальше
            </HockeyButton>
          ) : (
            <HockeyButton
              variant="sos"
              loading={isSubmitting}
              disabled={answeredCount !== questions.length}
              onClick={finishAttempt}
              data-testid={testId('iq', 'attempt-flow', 'btn', 'finish')}
            >
              Завершить тест
            </HockeyButton>
          )}
        </div>
      </IceCard>
    </div>
  )
}
