/**
 * SPEC-FR-5.2.3
 */

import {Button, Card, Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {
  fetchRecruitmentResponses,
  reviewRecruitmentResponse,
} from '@/features/sos/api/recruitmentApi'
import {testId} from '@/shared/testing/testId'

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
  const {data: responses = [], isLoading} = useQuery({
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
      <Text color="secondary" data-testid={testId('sos', 'response-review', 'loader', requestId)}>
        Загрузка откликов...
      </Text>
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
        <Card
          key={response.id}
          view="outlined"
          className="hockey-panel hockey-panel--12"
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
              <Button
                view="action"
                size="s"
                loading={mutation.isPending}
                onClick={() => mutation.mutate({responseId: response.id, status: 'accepted'})}
                data-testid={testId('sos', 'response-review', 'btn', 'accept', response.id)}
              >
                Принять
              </Button>
              <Button
                view="outlined-danger"
                size="s"
                loading={mutation.isPending}
                onClick={() => mutation.mutate({responseId: response.id, status: 'declined'})}
                data-testid={testId('sos', 'response-review', 'btn', 'decline', response.id)}
              >
                Отклонить
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
