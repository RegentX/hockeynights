/**
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 */

import type {PatchRadarRecommendationPayload, RadarRecommendation} from '@/entities/radar/types'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-15.1.1 - Персональные рекомендации Ice Radar
 */
export function fetchRadarRecommendations(): Promise<RadarRecommendation[]> {
  return apiRequest<RadarRecommendation[]>('/radar/recommendations')
}

/**
 * @spec SPEC-FR-15.1.3 - Скрыть рекомендацию или зафиксировать переход
 */
export function patchRadarRecommendation(
  recommendationId: string,
  payload: PatchRadarRecommendationPayload,
): Promise<RadarRecommendation> {
  return apiRequest<RadarRecommendation>(`/radar/recommendations/${recommendationId}`, {
    method: 'PATCH',
    body: payload,
  })
}
