/**
 * SPEC-FR-5.2.3
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {fetchRecruitmentResponses, reviewRecruitmentResponse} from '@/entities/recruitment'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

/** @spec SPEC-FR-5.2.3 - Props просмотра откликов */
export interface SosResponseReviewProps {
  /** @spec SPEC-FR-5.1.1 */
  requestId: string
}

/**
 * @spec SPEC-FR-5.2.3 - Подтверждение или отклонение отклика капитаном
 */
export function SosResponseReview({requestId}: SosResponseReviewProps) {
  const queryClient = useQueryClient()
  const {
    data: responses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['recruitment-responses', requestId],
    queryFn: () => fetchRecruitmentResponses(requestId),
  })

  const mutation = useMutation({
    mutationFn: ({responseId, status}: {responseId: string; status: 'accepted' | 'declined'}) =>
      reviewRecruitmentResponse(responseId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['recruitment-responses', requestId]})
      void queryClient.invalidateQueries({queryKey: ['recruitment-requests']})
    },
  })

  if (isLoading) {
    return (
      <div data-testid={testId('sos', 'response-review', 'loader', requestId)}>
        <ScoreboardLoader label="Загрузка откликов" testIdPrefix="sos" />
      </div>
    )
  }
  if (isError) {
    return (
      <div data-testid={testId('sos', 'response-review', 'error', requestId)}>
        <EmptyNetState
          title="Не удалось загрузить отклики"
          copy="Проверь соединение и попробуй ещё раз."
          testIdPrefix="sos"
          action={
            <HockeyButton
              view="outlined"
              size="s"
              onClick={() => void refetch()}
              data-testid={testId('sos', 'response-review', 'btn', 'retry', requestId)}
            >
              Повторить
            </HockeyButton>
          }
        />
      </div>
    )
  }
  if (responses.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('sos', 'response-review', 'empty', requestId)}>
        Откликов пока нет.
      </Text>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-8"
      data-testid={testId('sos', 'response-review', 'list', requestId)}
    >
      {responses.map((response) => (
        <IceCard
          key={response.id}
          padding="s"
          data-testid={testId('sos', 'response-review', 'card', response.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('sos', 'response-review', 'text', 'name', response.id)}
          >
            {response.displayName ?? response.userId}
          </Text>
          {response.message && (
            <Text
              color="secondary"
              data-testid={testId('sos', 'response-review', 'text', 'message', response.id)}
            >
              {response.message}
            </Text>
          )}
          <Text
            color="secondary"
            data-testid={testId('sos', 'response-review', 'text', 'status', response.id)}
          >
            Статус: {response.status}
          </Text>
          {response.status === 'pending' && (
            <div
              className="hockey-row hockey-row--gap-8 hockey-mt-8"
              data-testid={testId('sos', 'response-review', 'panel', 'actions', response.id)}
            >
              <HockeyButton
                size="s"
                loading={mutation.isPending}
                onClick={() => mutation.mutate({responseId: response.id, status: 'accepted'})}
                data-testid={testId('sos', 'response-review', 'btn', 'accept', response.id)}
              >
                Принять
              </HockeyButton>
              <HockeyButton
                view="outlined-danger"
                size="s"
                loading={mutation.isPending}
                onClick={() => mutation.mutate({responseId: response.id, status: 'declined'})}
                data-testid={testId('sos', 'response-review', 'btn', 'decline', response.id)}
              >
                Отклонить
              </HockeyButton>
            </div>
          )}
        </IceCard>
      ))}
    </div>
  )
}
