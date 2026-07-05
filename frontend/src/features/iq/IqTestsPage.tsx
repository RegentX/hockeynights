/**
 * SPEC-FR-13.1.1, SPEC-FR-13.1.2, SPEC-FR-13.1.3
 * SPEC-UI-6.1, SPEC-UI-6.2
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import type {IqAttemptResult, IqTest} from '@/entities/iq/types'
import {
  fetchIqLeaderboard,
  fetchIqQuestions,
  fetchIqTests,
  submitIqAttempt,
} from '@/features/iq/api/iqApi'
import {IqAttemptFlow} from '@/features/iq/IqAttemptFlow'
import {IqLeaderboard} from '@/features/iq/IqLeaderboard'
import {IqTestCard} from '@/features/iq/IqTestCard'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const MOCK_CURRENT_USER_ID = 'user-001'

/**
 * @spec SPEC-FR-13.1.1 - Страница Hockey IQ
 * @spec SPEC-UI-6.1 - Глобальный формат «тренерской доски»
 */
export function IqTestsPage() {
  const [activeTest, setActiveTest] = useState<IqTest | null>(null)
  const [attemptResult, setAttemptResult] = useState<IqAttemptResult | null>(null)

  const {data: tests = [], isLoading: testsLoading} = useQuery({
    queryKey: ['iq-tests'],
    queryFn: fetchIqTests,
  })

  const {data: questions = [], isLoading: questionsLoading} = useQuery({
    queryKey: ['iq-questions', activeTest?.id],
    queryFn: () => fetchIqQuestions(activeTest!.id),
    enabled: Boolean(activeTest?.id),
  })

  const {data: leaderboard = [], isLoading: leaderboardLoading} = useQuery({
    queryKey: ['iq-leaderboard'],
    queryFn: fetchIqLeaderboard,
  })

  const attemptMutation = useMutation({
    mutationFn: submitIqAttempt,
    onSuccess: (result) => {
      setAttemptResult(result)
    },
  })

  /** @spec SPEC-FR-13.1.1 - Запуск теста */
  function startTest(test: IqTest) {
    setActiveTest(test)
    setAttemptResult(null)
  }

  /** @spec SPEC-FR-13.1.2 - Сброс и возврат в каталог */
  function exitAttempt() {
    setActiveTest(null)
    setAttemptResult(null)
  }

  const leaderboardWithCurrentUser = useMemo(() => {
    if (leaderboard.some((row) => row.userId === MOCK_CURRENT_USER_ID)) {
      return leaderboard
    }
    return [
      ...leaderboard,
      {
        rank: leaderboard.length + 1,
        userId: MOCK_CURRENT_USER_ID,
        displayName: 'Ты',
        score: 0,
        streak: 0,
      },
    ]
  }, [leaderboard])

  return (
    <div className="iq-page" data-testid={testId('iq', 'page', 'page')}>
      <Text variant="header-1" data-testid={testId('iq', 'page', 'text', 'title')}>
        Hockey IQ
      </Text>
      <Text color="secondary" data-testid={testId('iq', 'page', 'text', 'subtitle')}>
        Тренерская доска: быстрые тесты по правилам и игровым решениям.
      </Text>

      <div className="iq-page__layout" data-testid={testId('iq', 'page', 'panel', 'layout')}>
        <section className="iq-page__main" data-testid={testId('iq', 'page', 'panel', 'main')}>
          {!activeTest && (
            <>
              {testsLoading && (
                <div data-testid={testId('iq', 'page', 'loader', 'tests')}>
                  <ScoreboardLoader label="Загрузка тестов Hockey IQ" />
                </div>
              )}
              {!testsLoading && tests.length === 0 && (
                <div data-testid={testId('iq', 'page', 'empty', 'tests')}>
                  <EmptyNetState title="Тесты не найдены" copy="Каталог Hockey IQ пока пуст." />
                </div>
              )}
              {!testsLoading && tests.length > 0 && (
                <div className="iq-page__cards" data-testid={testId('iq', 'page', 'list', 'tests')}>
                  {tests.map((test) => (
                    <IqTestCard key={test.id} test={test} onStart={startTest} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTest && (
            <>
              {questionsLoading ? (
                <div data-testid={testId('iq', 'page', 'loader', 'questions')}>
                  <ScoreboardLoader label="Подготовка вопросов" />
                </div>
              ) : (
                <IqAttemptFlow
                  test={activeTest}
                  questions={questions}
                  isSubmitting={attemptMutation.isPending}
                  result={attemptResult}
                  onSubmit={(answers) =>
                    attemptMutation.mutate({
                      testId: activeTest.id,
                      userId: MOCK_CURRENT_USER_ID,
                      answers,
                    })
                  }
                  onExit={exitAttempt}
                />
              )}
            </>
          )}
        </section>

        <aside className="iq-page__side" data-testid={testId('iq', 'page', 'panel', 'sidebar')}>
          {leaderboardLoading ? (
            <div data-testid={testId('iq', 'page', 'loader', 'leaderboard')}>
              <ScoreboardLoader label="Загрузка рейтинга" />
            </div>
          ) : (
            <IqLeaderboard rows={leaderboardWithCurrentUser} />
          )}
        </aside>
      </div>
    </div>
  )
}
