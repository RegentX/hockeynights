/**
 * SPEC-FR-5.2.1, SPEC-FR-5.2.2
 * SPEC-UI-2.5, SPEC-UI-1.2, SPEC-UI-4.4
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Checkbox, Text, TextArea} from '@gravity-ui/uikit'
import {
  fetchRecruitmentRequests,
  respondToRecruitment,
} from '@/features/sos/api/recruitmentApi'
import {SosResponseReview} from '@/features/sos/SosResponseReview'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {MatchCenterFeed, type MatchCenterRowData} from '@/shared/ui/MatchCenterFeed'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {Link} from 'react-router-dom'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-UI-2.5 - SOS в формате матч-центра
 * @spec SPEC-FR-5.2.1 - Лента SOS-запросов
 */
export function SosFeed() {
  const queryClient = useQueryClient()
  const [goalieOnly, setGoalieOnly] = useState(true)
  const [message, setMessage] = useState('Готов выйти на игру')
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)

  const {data: requests = [], isLoading} = useQuery({
    queryKey: ['recruitment-requests', goalieOnly],
    queryFn: () => fetchRecruitmentRequests({goalieOnly}),
  })

  const respondMutation = useMutation({
    mutationFn: ({requestId, msg}: {requestId: string; msg?: string}) =>
      respondToRecruitment(requestId, msg, 'Алексей Смирнов'),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['recruitment-requests']})
    },
  })

  const rows: MatchCenterRowData[] = requests.map((request) => ({
    id: request.id,
    time: request.startsAt
      ? new Date(request.startsAt).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—',
    title: request.eventTitle ?? request.eventId,
    subtitle: `${request.requestedPosition} · ${request.skillLevel}${request.district ? ` · ${request.district}` : ''}`,
    type: 'sos',
    isSos: request.isGoalkeeperSos,
    actions: (
      <div
        className="hockey-min-w-200 hockey-stack hockey-stack--gap-8"
        data-testid={testId('sos', 'feed', 'panel', 'actions', request.id)}
      >
        {request.comment && (
          <Text data-testid={testId('sos', 'feed', 'text', 'comment', request.id)}>
            {request.comment}
          </Text>
        )}
        <Text color="secondary" data-testid={testId('sos', 'feed', 'text', 'response-label', request.id)}>
          Сообщение отклика
        </Text>
        <TextArea
          value={message}
          onUpdate={setMessage}
          minRows={2}
          data-testid={testId('sos', 'feed', 'field', 'response-message', request.id)}
        />
        <div className="hockey-row hockey-row--gap-8">
          <HockeyButton
            variant="sos"
            loading={respondMutation.isPending}
            onClick={() => respondMutation.mutate({requestId: request.id, msg: message})}
            data-testid={testId('sos', 'feed', 'btn', 'respond', request.id)}
          >
            Откликнуться
          </HockeyButton>
          <HockeyButton
            view="outlined"
            onClick={() =>
              setExpandedRequestId(expandedRequestId === request.id ? null : request.id)
            }
            data-testid={testId('sos', 'feed', 'btn', 'responses', request.id)}
          >
            Отклики
          </HockeyButton>
        </div>
        {expandedRequestId === request.id && <SosResponseReview requestId={request.id} />}
      </div>
    ),
  }))

  return (
    <div className="hockey-stack hockey-stack--gap-16" data-testid={testId('sos', 'feed', 'feed')}>
      <Checkbox
        checked={goalieOnly}
        onUpdate={setGoalieOnly}
        content="Только Goalkeeper SOS"
        data-testid={testId('sos', 'feed', 'checkbox', 'goalie-only')}
      />

      {isLoading && (
        <div data-testid={testId('sos', 'feed', 'loader')}>
          <ScoreboardLoader label="Загрузка SOS" />
        </div>
      )}

      {!isLoading && (
        <div data-testid={testId('sos', 'feed', 'table')}>
          <MatchCenterFeed
            title="SOS · Матч-центр"
            rows={rows}
            empty={
              <div data-testid={testId('sos', 'feed', 'empty')}>
                <EmptyNetState
                  title="Пустая сетка"
                  copy="Открытых запросов нет — капитану пора запустить SOS."
                  action={
                    <Link to="/sos" data-testid={testId('sos', 'feed', 'link', 'create-sos')}>
                      <HockeyButton variant="sos" data-testid={testId('sos', 'feed', 'btn', 'create-sos')}>
                        Запусти SOS
                      </HockeyButton>
                    </Link>
                  }
                />
              </div>
            }
          />
        </div>
      )}
    </div>
  )
}
