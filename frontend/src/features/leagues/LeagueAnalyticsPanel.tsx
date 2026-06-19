/**
 * SPEC-FR-24.5.7
 */

import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchLeagueAnalytics} from '@/features/leagues/api/leaguesApi'

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
    return <Text color="secondary">Загрузка аналитики…</Text>
  }

  return (
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12">
      <Text variant="subheader-2">Аналитика лиги</Text>

      <div className="partner-dashboard__stats-grid">
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.profileViews}</Text>
          <Text color="secondary">Просмотры профиля</Text>
        </div>
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.applicationsTotal}</Text>
          <Text color="secondary">Всего заявок</Text>
        </div>
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.applicationsPending}</Text>
          <Text color="secondary">На рассмотрении</Text>
        </div>
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.conversionRate}%</Text>
          <Text color="secondary">Конверсия в заявку</Text>
        </div>
      </div>

      <Text color="secondary">
        Одобрено команд: {analytics.applicationsApproved}
        {analytics.topDivisionName ? ` · популярный дивизион: ${analytics.topDivisionName}` : ''}
      </Text>
    </div>
  )
}
