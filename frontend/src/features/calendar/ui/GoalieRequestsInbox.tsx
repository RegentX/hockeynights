/**
 * HOCFRONT-28CAL-H — входящие запросы вратарю
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {fetchGoalieRequests, respondGoalieRequest} from '@/entities/calendar'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface GoalieRequestsInboxProps {
  userId: string
}

export function GoalieRequestsInbox({userId}: GoalieRequestsInboxProps) {
  const queryClient = useQueryClient()
  const {data: requests = []} = useQuery({
    queryKey: ['goalie-requests', userId],
    queryFn: () => fetchGoalieRequests(userId),
  })

  const pending = requests.filter(
    (request) => request.targetUserId === userId && request.status === 'pending',
  )

  const respondMutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: 'accepted' | 'declined'}) =>
      respondGoalieRequest(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['goalie-requests']})
      void queryClient.invalidateQueries({queryKey: ['calendar-shell']})
      void queryClient.invalidateQueries({queryKey: ['events']})
      void queryClient.invalidateQueries({queryKey: ['notifications']})
    },
  })

  if (pending.length === 0) return null

  return (
    <IceCard padding="m" data-testid={testId('calendar', 'goalie-inbox', 'panel')}>
      <div className="hockey-stack hockey-stack--gap-12">
        <Text
          variant="subheader-2"
          data-testid={testId('calendar', 'goalie-inbox', 'text', 'title')}
        >
          Запросы на выход
        </Text>
        {pending.map((request) => (
          <div
            key={request.id}
            className="hockey-stack hockey-stack--gap-8"
            data-testid={testId('calendar', 'goalie-inbox', 'card', request.id)}
          >
            <Text data-testid={testId('calendar', 'goalie-inbox', 'text', 'event', request.id)}>
              {request.eventTitle}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('calendar', 'goalie-inbox', 'text', 'meta', request.id)}
            >
              {new Date(request.startsAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {request.arenaName ? ` · ${request.arenaName}` : ''}
              {request.pricePerPlayer != null ? ` · ${request.pricePerPlayer} ₽` : ''}
            </Text>
            <div className="hockey-row hockey-row--gap-8">
              <HockeyButton
                view="action"
                size="s"
                loading={respondMutation.isPending}
                onClick={() => respondMutation.mutate({id: request.id, status: 'accepted'})}
                data-testid={testId('calendar', 'goalie-inbox', 'btn', 'accept', request.id)}
              >
                Принять
              </HockeyButton>
              <HockeyButton
                view="outlined"
                size="s"
                loading={respondMutation.isPending}
                onClick={() => respondMutation.mutate({id: request.id, status: 'declined'})}
                data-testid={testId('calendar', 'goalie-inbox', 'btn', 'decline', request.id)}
              >
                Отклонить
              </HockeyButton>
            </div>
          </div>
        ))}
      </div>
    </IceCard>
  )
}
