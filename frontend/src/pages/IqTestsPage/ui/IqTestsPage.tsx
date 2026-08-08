/**
 * SPEC-FR-13.1.1, SPEC-FR-13.1.2, SPEC-FR-13.1.3
 * SPEC-UI-6.1, SPEC-UI-6.2
 */

import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'

import type {IqAttemptResult, IqTest} from '@/entities/iq'
import {fetchIqLeaderboard, fetchIqQuestions, fetchIqTests, submitIqAttempt} from '@/entities/iq'
import {useSessionAccess} from '@/features/access'
import {IqAttemptFlow, IqLeaderboard, IqTestCard} from '@/features/iq'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {PageHeader} from '@/shared/ui/PageHeader'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/**
 * @spec SPEC-FR-13.1.1 - Страница Hockey IQ
 * @spec SPEC-UI-6.1 - Глобальный формат «тренерской доски»
 */
export function IqTestsPage() {
  const {userId, session} = useSessionAccess()
  const [activeTest, setActiveTest] = useState<IqTest | null>(null)
  const [attemptResult, setAttemptResult] = useState<IqAttemptResult | null>(null)

  const {
    data: tests = [],
    isLoading: testsLoading,
    isError: testsError,
    refetch: refetchTests,
  } = useQuery({
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
    if (!userId || leaderboard.some((row) => row.userId === userId)) {
      return leaderboard
    }
    return [
      ...leaderboard,
      {
        rank: leaderboard.length + 1,
        userId,
        displayName: session?.user.displayName ?? 'Ты',
        score: 0,
        streak: 0,
      },
    ]
  }, [leaderboard, session?.user.displayName, userId])

  return (
    <div className="iq-page" data-testid={testId('iq', 'page', 'page')}>
      <PageHeader
        title="Hockey IQ"
        subtitle="Тренерская доска: быстрые тесты по правилам и игровым решениям."
        testIdPrefix="iq"
      />

      <div className="iq-page__layout" data-testid={testId('iq', 'page', 'panel', 'layout')}>
        <section className="iq-page__main" data-testid={testId('iq', 'page', 'panel', 'main')}>
          {!activeTest && (
            <>
              {testsLoading && (
                <div data-testid={testId('iq', 'page', 'loader', 'tests')}>
                  <ScoreboardLoader label="Загрузка тестов Hockey IQ" />
                </div>
              )}
              {testsError && !testsLoading && (
                <div data-testid={testId('iq', 'page', 'error', 'tests')}>
                  <EmptyNetState
                    title="Не удалось загрузить тесты"
                    copy="Проверь соединение и попробуй ещё раз."
                    action={
                      <HockeyButton
                        view="outlined"
                        size="s"
                        onClick={() => void refetchTests()}
                        data-testid={testId('iq', 'page', 'btn', 'retry')}
                      >
                        Повторить
                      </HockeyButton>
                    }
                  />
                </div>
              )}
              {!testsLoading && !testsError && tests.length === 0 && (
                <div data-testid={testId('iq', 'page', 'empty', 'tests')}>
                  <EmptyNetState title="Тесты не найдены" copy="Каталог Hockey IQ пока пуст." />
                </div>
              )}
              {!testsLoading && !testsError && tests.length > 0 && (
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
                  onSubmit={(answers) => {
                    if (!userId) return
                    attemptMutation.mutate({
                      testId: activeTest.id,
                      userId,
                      answers,
                    })
                  }}
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
