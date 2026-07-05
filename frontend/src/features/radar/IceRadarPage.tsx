/**
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 * SPEC-UI-6.5, SPEC-UI-6.6
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo} from 'react'
import {useNavigate} from 'react-router-dom'

import type {RadarRecommendation} from '@/entities/radar/types'
import {fetchRadarRecommendations, patchRadarRecommendation} from '@/features/radar/api/radarApi'
import {RadarRecommendationCard} from '@/features/radar/RadarRecommendationCard'
import {RADAR_LABEL} from '@/shared/config/navigationLabels'
import {useDocumentTitle} from '@/shared/hooks/useDocumentTitle'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const MOCK_CURRENT_USER_ID = 'user-001'

const PRIORITY_ZONES: Array<{key: RadarRecommendation['priority']; label: string}> = [
  {key: 'high', label: 'Ближняя зона'},
  {key: 'medium', label: 'Средняя зона'},
  {key: 'low', label: 'Дальняя зона'},
]

/**
 * @spec SPEC-FR-15.1.1 - Страница Ice Radar
 * @spec SPEC-UI-6.5 - Радар смены с концентрическими зонами
 */
export function IceRadarPage() {
  useDocumentTitle(RADAR_LABEL)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
        userId: MOCK_CURRENT_USER_ID,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['radar-recommendations']})
    },
  })

  const grouped = useMemo(() => {
    return PRIORITY_ZONES.map((zone) => ({
      ...zone,
      items: recommendations.filter((r) => r.priority === zone.key),
    }))
  }, [recommendations])

  /** @spec SPEC-FR-15.1.3 - Скрыть рекомендацию */
  function dismissRecommendation(recommendation: RadarRecommendation) {
    actionMutation.mutate({recommendation, action: 'dismiss'})
  }

  /** @spec SPEC-FR-15.1.3 - Переход в целевой сценарий */
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
        <ScoreboardLoader label="Загрузка подсказок…" />
      </div>
    )
  }

  return (
    <div className="radar-page" data-testid={testId('radar', 'page', 'page')}>
      <Text variant="header-1" data-testid={testId('radar', 'page', 'text', 'title')}>
        {RADAR_LABEL}
      </Text>
      <Text color="secondary" data-testid={testId('radar', 'page', 'text', 'subtitle')}>
        Персональные подсказки на сегодня — SOS, игры, слоты и лиги рядом с тобой.
      </Text>

      {recommendations.length === 0 ? (
        <div data-testid={testId('radar', 'page', 'empty')}>
          <EmptyNetState
            title="Подсказок пока нет"
            copy="Все рекомендации скрыты. Загляните позже - список обновляется."
          />
        </div>
      ) : (
        <div
          className="radar-page__layout"
          data-testid={testId('radar', 'page', 'panel', 'layout')}
        >
          <div
            className="radar-page__zones"
            aria-hidden
            data-testid={testId('radar', 'page', 'panel', 'zones-visual')}
          >
            <span
              className="radar-page__ring radar-page__ring--outer"
              data-testid={testId('radar', 'page', 'badge', 'ring-outer')}
            />
            <span
              className="radar-page__ring radar-page__ring--mid"
              data-testid={testId('radar', 'page', 'badge', 'ring-mid')}
            />
            <span
              className="radar-page__ring radar-page__ring--inner"
              data-testid={testId('radar', 'page', 'badge', 'ring-inner')}
            />
            <span
              className="radar-page__blip"
              data-testid={testId('radar', 'page', 'badge', 'blip')}
            />
          </div>

          <div
            className="radar-page__zones-list"
            data-testid={testId('radar', 'page', 'list', 'zones')}
          >
            {grouped.map((zone) => (
              <section
                key={zone.key}
                className={`radar-zone radar-zone--${zone.key}`}
                data-testid={testId('radar', 'page', 'panel', 'zone', zone.key)}
              >
                <div
                  className="radar-zone__label"
                  data-testid={testId('radar', 'page', 'text', 'zone-label', zone.key)}
                >
                  {zone.label}
                </div>
                {zone.items.length === 0 ? (
                  <Text
                    color="secondary"
                    className="radar-zone__empty"
                    data-testid={testId('radar', 'page', 'empty', 'zone', zone.key)}
                  >
                    Нет сигналов
                  </Text>
                ) : (
                  <div
                    className="radar-zone__cards"
                    data-testid={testId('radar', 'page', 'list', 'cards', zone.key)}
                  >
                    {zone.items.map((item) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
