/**
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 * SPEC-UI-6.5, SPEC-UI-6.6
 * HOCFRONT-9 — «Поиск тренировок» с RSVP на лиговую игру.
 */

import {useMemo} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import type {RadarRecommendation} from '@/entities/radar/types'
import {useSessionAccess} from '@/features/access/useSessionAccess'
import {
  fetchRadarRecommendations,
  patchRadarRecommendation,
} from '@/features/radar/api/radarApi'
import {LeagueGameRsvp} from '@/features/radar/LeagueGameRsvp'
import {RadarRecommendationCard} from '@/features/radar/RadarRecommendationCard'
import {TeamRsvpList} from '@/features/radar/TeamRsvpList'
import {LEAGUE_SATURDAY_EVENT_ID} from '@/mocks/data/eventRsvp'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {ScrollReveal} from '@/shared/ui/ScrollStory'
import {testId} from '@/shared/testing/testId'
import {RADAR_LABEL} from '@/shared/config/navigationLabels'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'

/**
 * @spec SPEC-FR-15.1.1 - Страница поиска тренировок и ближайших действий
 */
export function IceRadarPage() {
  useDocumentTitle(RADAR_LABEL)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {userId, roles} = useSessionAccess()

  const canSeeDeclineDetails =
    roles.includes('captain') || roles.includes('coach') || roles.includes('admin')

  const {data: recommendations = [], isLoading} = useQuery({
    queryKey: ['radar-recommendations'],
    queryFn: fetchRadarRecommendations,
  })

  const actionMutation = useMutation({
    mutationFn: ({
      recommendation,
      action,
    }: {
      recommendation: RadarRecommendation
      action: 'dismiss' | 'navigate'
    }) =>
      patchRadarRecommendation(recommendation.id, {
        action,
        userId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['radar-recommendations']})
    },
  })

  const otherActions = useMemo(
    () => recommendations.filter((item) => item.relatedEntityId !== LEAGUE_SATURDAY_EVENT_ID),
    [recommendations],
  )

  function dismissRecommendation(recommendation: RadarRecommendation) {
    actionMutation.mutate({recommendation, action: 'dismiss'})
  }

  function navigateRecommendation(recommendation: RadarRecommendation) {
    actionMutation.mutate(
      {recommendation, action: 'navigate'},
      {
        onSuccess: () => {
          navigate(recommendation.targetRoute)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div data-testid={testId('radar', 'page', 'loader')}>
        <ScoreboardLoader label="Загрузка действий…" />
      </div>
    )
  }

  return (
    <div className="radar-page" data-testid={testId('radar', 'page', 'page')}>
      <ScrollReveal direction="down">
        <Text variant="header-1" data-testid={testId('radar', 'page', 'text', 'title')}>
          {RADAR_LABEL}
        </Text>
        <Text color="secondary" data-testid={testId('radar', 'page', 'text', 'subtitle')}>
          Что делать в хоккее сейчас: подтвердите игру команды, найдите тренировку или подхватите SOS.
        </Text>
      </ScrollReveal>

      <div className="radar-page__training-layout hockey-stack hockey-stack--gap-16" data-testid={testId('radar', 'page', 'panel', 'training')}>
        <LeagueGameRsvp eventId={LEAGUE_SATURDAY_EVENT_ID} currentUserId={userId} />
        <TeamRsvpList
          eventId={LEAGUE_SATURDAY_EVENT_ID}
          canSeeDeclineDetails={canSeeDeclineDetails}
        />
      </div>

      <section className="radar-page__actions hockey-stack hockey-stack--gap-12" data-testid={testId('radar', 'page', 'panel', 'actions')}>
        <Text variant="subheader-2" data-testid={testId('radar', 'page', 'text', 'actions-title')}>
          Другие ближайшие действия
        </Text>

        {otherActions.length === 0 ? (
          <div data-testid={testId('radar', 'page', 'empty', 'actions')}>
            <EmptyNetState
              title="Пока тихо"
              copy="Скрыли все подсказки или новых действий нет — зайдите позже."
            />
          </div>
        ) : (
          <div className="radar-page__actions-grid" data-testid={testId('radar', 'page', 'list', 'actions')}>
            {otherActions.map((item) => (
              <RadarRecommendationCard
                key={item.id}
                recommendation={item}
                onDismiss={dismissRecommendation}
                onNavigate={navigateRecommendation}
                isPending={actionMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
