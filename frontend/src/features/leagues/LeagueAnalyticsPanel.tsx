/**
 * SPEC-FR-24.5.7
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchLeagueAnalytics} from '@/features/leagues/api/leaguesApi'
import {testId} from '@/shared/testing/testId'

export interface LeagueAnalyticsPanelProps {
  leagueId: string
}

/** @spec SPEC-FR-24.5.7 - Аналитика лиги */
export function LeagueAnalyticsPanel({leagueId}: LeagueAnalyticsPanelProps) {
  const {data: analytics} = useQuery({
    queryKey: ['league-analytics', leagueId],
    queryFn: () => fetchLeagueAnalytics(leagueId),
  })

  if (!analytics) {
    return (
      <Text color="secondary" data-testid={testId('leagues', 'analytics', 'loader', leagueId)}>
        Загрузка аналитики…
      </Text>
    )
  }

  return (
    <div
      className="partner-dashboard__section hockey-stack hockey-stack--gap-12"
      data-testid={testId('leagues', 'analytics', 'panel', leagueId)}
    >
      <Text
        variant="subheader-2"
        data-testid={testId('leagues', 'analytics', 'text', 'title', leagueId)}
      >
        Аналитика лиги
      </Text>

      <div
        className="partner-dashboard__stats-grid"
        data-testid={testId('leagues', 'analytics', 'list', leagueId)}
      >
        <div
          className="partner-dashboard__stat"
          data-testid={testId('leagues', 'analytics', 'card', 'profile-views', leagueId)}
        >
          <Text
            variant="subheader-1"
            data-testid={testId('leagues', 'analytics', 'text', 'profile-views-value', leagueId)}
          >
            {analytics.profileViews}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('leagues', 'analytics', 'text', 'profile-views-label', leagueId)}
          >
            Просмотры профиля
          </Text>
        </div>
        <div
          className="partner-dashboard__stat"
          data-testid={testId('leagues', 'analytics', 'card', 'applications-total', leagueId)}
        >
          <Text
            variant="subheader-1"
            data-testid={testId(
              'leagues',
              'analytics',
              'text',
              'applications-total-value',
              leagueId,
            )}
          >
            {analytics.applicationsTotal}
          </Text>
          <Text
            color="secondary"
            data-testid={testId(
              'leagues',
              'analytics',
              'text',
              'applications-total-label',
              leagueId,
            )}
          >
            Всего заявок
          </Text>
        </div>
        <div
          className="partner-dashboard__stat"
          data-testid={testId('leagues', 'analytics', 'card', 'applications-pending', leagueId)}
        >
          <Text
            variant="subheader-1"
            data-testid={testId(
              'leagues',
              'analytics',
              'text',
              'applications-pending-value',
              leagueId,
            )}
          >
            {analytics.applicationsPending}
          </Text>
          <Text
            color="secondary"
            data-testid={testId(
              'leagues',
              'analytics',
              'text',
              'applications-pending-label',
              leagueId,
            )}
          >
            На рассмотрении
          </Text>
        </div>
        <div
          className="partner-dashboard__stat"
          data-testid={testId('leagues', 'analytics', 'card', 'conversion-rate', leagueId)}
        >
          <Text
            variant="subheader-1"
            data-testid={testId('leagues', 'analytics', 'text', 'conversion-rate-value', leagueId)}
          >
            {analytics.conversionRate}%
          </Text>
          <Text
            color="secondary"
            data-testid={testId('leagues', 'analytics', 'text', 'conversion-rate-label', leagueId)}
          >
            Конверсия в заявку
          </Text>
        </div>
      </div>

      <Text
        color="secondary"
        data-testid={testId('leagues', 'analytics', 'text', 'summary', leagueId)}
      >
        Одобрено команд: {analytics.applicationsApproved}
        {analytics.topDivisionName ? ` · популярный дивизион: ${analytics.topDivisionName}` : ''}
      </Text>
    </div>
  )
}
