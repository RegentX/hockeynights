/**
 * SPEC-FR-24.5.4
 */

import {Button, Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import type {LeagueApplicationStatus, LeagueTeamApplication} from '@/entities/league'
import {
  fetchLeagueApplications,
  fetchLeagueDivisions,
  fetchLeagueSeasons,
  reviewLeagueApplication,
} from '@/entities/league'
import {testId} from '@/shared/testing/testId'

const STATUS_OPTIONS = [
  {value: 'pending', content: 'На рассмотрении'},
  {value: 'approved', content: 'Одобрена'},
  {value: 'rejected', content: 'Отклонена'},
  {value: 'waitlist', content: 'Лист ожидания'},
]

export interface LeagueApplicationsPanelProps {
  leagueId: string
}

/** @spec SPEC-FR-24.5.4 - Заявки команд в лигу */
export function LeagueApplicationsPanel({leagueId}: LeagueApplicationsPanelProps) {
  const queryClient = useQueryClient()

  const {data: seasons = []} = useQuery({
    queryKey: ['league-seasons', leagueId],
    queryFn: () => fetchLeagueSeasons(leagueId),
  })

  const activeSeason = seasons.find((s) => s.status === 'active') ?? seasons[0]

  const {data: divisions = []} = useQuery({
    queryKey: ['league-divisions', leagueId, activeSeason?.id],
    queryFn: () => fetchLeagueDivisions(leagueId, activeSeason?.id),
    enabled: Boolean(activeSeason),
  })

  const {data: applications = []} = useQuery({
    queryKey: ['league-applications', leagueId],
    queryFn: () => fetchLeagueApplications(leagueId),
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      applicationId,
      patch,
    }: {
      applicationId: string
      patch: Pick<LeagueTeamApplication, 'status' | 'reviewComment'>
    }) => reviewLeagueApplication(leagueId, applicationId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['league-applications', leagueId]})
    },
  })

  function divisionName(divisionId?: string) {
    return divisions.find((d) => d.id === divisionId)?.name ?? '—'
  }

  return (
    <div
      className="partner-dashboard__section hockey-stack hockey-stack--gap-12"
      data-testid={testId('leagues', 'applications', 'panel', leagueId)}
    >
      <Text
        variant="subheader-2"
        data-testid={testId('leagues', 'applications', 'text', 'title', leagueId)}
      >
        Заявки команд
      </Text>
      {activeSeason && (
        <Text
          color="secondary"
          data-testid={testId('leagues', 'applications', 'text', 'season', leagueId)}
        >
          Сезон: {activeSeason.name} · дивизионы: {divisions.map((d) => d.name).join(', ') || '—'}
        </Text>
      )}

      <ul
        className="partner-dashboard__list"
        data-testid={testId('leagues', 'applications', 'list', leagueId)}
      >
        {applications.map((app) => (
          <li
            key={app.id}
            className="partner-dashboard__list-item partner-dashboard__list-item--stack"
            data-testid={testId('leagues', 'applications', 'item', app.id)}
          >
            <div>
              <Text data-testid={testId('leagues', 'applications', 'text', 'team-name', app.id)}>
                {app.teamName}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('leagues', 'applications', 'text', 'captain', app.id)}
              >
                Капитан: {app.captainName} · {app.contactEmail}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('leagues', 'applications', 'text', 'division', app.id)}
              >
                Дивизион: {divisionName(app.divisionId)} · статус: {app.status}
              </Text>
              {app.reviewComment && (
                <Text
                  color="secondary"
                  data-testid={testId('leagues', 'applications', 'text', 'review-comment', app.id)}
                >
                  Комментарий: {app.reviewComment}
                </Text>
              )}
            </div>
            {app.status === 'pending' && (
              <div
                className="partner-dashboard__form hockey-stack hockey-stack--gap-8"
                data-testid={testId('leagues', 'applications', 'panel', 'review', app.id)}
              >
                <Select
                  label="Решение"
                  value={['approved']}
                  options={STATUS_OPTIONS.filter((o) => o.value !== 'pending')}
                  onUpdate={(value) =>
                    reviewMutation.mutate({
                      applicationId: app.id,
                      patch: {status: value[0] as LeagueApplicationStatus},
                    })
                  }
                  data-testid={testId('leagues', 'applications', 'select', 'decision', app.id)}
                />
                <TextInput
                  label="Комментарий"
                  placeholder="Причина решения"
                  onUpdate={(value) =>
                    reviewMutation.mutate({
                      applicationId: app.id,
                      patch: {status: 'approved', reviewComment: value},
                    })
                  }
                  data-testid={testId('leagues', 'applications', 'field', 'comment', app.id)}
                />
                <div className="partner-dashboard__tabs">
                  <Button
                    size="s"
                    view="action"
                    loading={reviewMutation.isPending}
                    onClick={() =>
                      reviewMutation.mutate({applicationId: app.id, patch: {status: 'approved'}})
                    }
                    data-testid={testId('leagues', 'applications', 'btn', 'approve', app.id)}
                  >
                    Одобрить
                  </Button>
                  <Button
                    size="s"
                    view="outlined"
                    onClick={() =>
                      reviewMutation.mutate({applicationId: app.id, patch: {status: 'rejected'}})
                    }
                    data-testid={testId('leagues', 'applications', 'btn', 'reject', app.id)}
                  >
                    Отклонить
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
