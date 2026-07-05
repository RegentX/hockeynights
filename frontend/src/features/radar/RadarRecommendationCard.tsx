/**
 * SPEC-FR-15.1.2, SPEC-FR-15.1.3
 * SPEC-UI-6.5, SPEC-UI-6.6
 */

import {Text} from '@gravity-ui/uikit'

import type {RadarRecommendation} from '@/entities/radar/types'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

const TYPE_LABELS: Record<RadarRecommendation['type'], string> = {
  sos: 'SOS',
  event: 'Игра',
  ice_slot: 'Слот льда',
  league: 'Лига',
  training: 'Тренировка',
}

/** @spec SPEC-FR-15.1.2 - Props карточки рекомендации */
export interface RadarRecommendationCardProps {
  recommendation: RadarRecommendation
  onNavigate: (recommendation: RadarRecommendation) => void
  onDismiss: (recommendation: RadarRecommendation) => void
  isPending?: boolean
}

/**
 * @spec SPEC-FR-15.1.2 - Карточка рекомендации с причиной и приоритетом
 * @spec SPEC-UI-6.6 - Причина рядом с CTA
 */
export function RadarRecommendationCard({
  recommendation,
  onNavigate,
  onDismiss,
  isPending = false,
}: RadarRecommendationCardProps) {
  const timeLabel = recommendation.startsAt
    ? new Date(recommendation.startsAt).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div data-testid={testId('radar', 'recommendation-card', 'card', recommendation.id)}>
      <IceCard className={`radar-card radar-card--${recommendation.priority}`} padding="s">
        <div
          className="radar-card__head"
          data-testid={testId('radar', 'recommendation-card', 'panel', 'head', recommendation.id)}
        >
          <span
            className="radar-card__type"
            data-testid={testId('radar', 'recommendation-card', 'badge', 'type', recommendation.id)}
          >
            {TYPE_LABELS[recommendation.type]}
          </span>
          <span
            className={`radar-card__priority radar-card__priority--${recommendation.priority}`}
            data-testid={testId(
              'radar',
              'recommendation-card',
              'badge',
              'priority',
              recommendation.id,
            )}
          >
            {recommendation.priority === 'high'
              ? '🔴'
              : recommendation.priority === 'medium'
                ? '🟡'
                : '⚪'}
          </span>
        </div>

        <Text
          variant="subheader-2"
          data-testid={testId('radar', 'recommendation-card', 'text', 'title', recommendation.id)}
        >
          {recommendation.title}
        </Text>

        <div
          className="radar-card__meta"
          data-testid={testId('radar', 'recommendation-card', 'panel', 'meta', recommendation.id)}
        >
          {recommendation.district && (
            <Text
              color="secondary"
              data-testid={testId(
                'radar',
                'recommendation-card',
                'text',
                'district',
                recommendation.id,
              )}
            >
              {recommendation.district}
            </Text>
          )}
          {timeLabel && (
            <ScoreboardText
              data-testid={testId(
                'radar',
                'recommendation-card',
                'text',
                'time',
                recommendation.id,
              )}
            >
              {timeLabel}
            </ScoreboardText>
          )}
        </div>

        <div
          className="radar-card__cta-row"
          data-testid={testId('radar', 'recommendation-card', 'panel', 'cta', recommendation.id)}
        >
          <Text
            className="radar-card__reason"
            color="secondary"
            data-testid={testId(
              'radar',
              'recommendation-card',
              'text',
              'reason',
              recommendation.id,
            )}
          >
            {recommendation.reasonText}
          </Text>
          <div className="radar-card__actions">
            <HockeyButton
              size="s"
              view="outlined"
              onClick={() => onDismiss(recommendation)}
              disabled={isPending}
              data-testid={testId(
                'radar',
                'recommendation-card',
                'btn',
                'dismiss',
                recommendation.id,
              )}
            >
              Скрыть
            </HockeyButton>
            <HockeyButton
              size="m"
              onClick={() => onNavigate(recommendation)}
              disabled={isPending}
              data-testid={testId(
                'radar',
                'recommendation-card',
                'btn',
                'navigate',
                recommendation.id,
              )}
            >
              Выйти на лёд
            </HockeyButton>
          </div>
        </div>
      </IceCard>
    </div>
  )
}
