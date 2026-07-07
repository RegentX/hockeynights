/**
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 */

import {http, HttpResponse} from 'msw'

import type {PatchRadarRecommendationPayload} from '@/entities/radar'
import {getActiveRadarRecommendations, patchMockRadarRecommendation} from '@/mocks/data/radar'

/** @spec SPEC-FR-15.1.1 - Handlers Ice Radar */
export const radarHandlers = [
  http.get('/mock-api/v1/radar/recommendations', () => {
    return HttpResponse.json(getActiveRadarRecommendations())
  }),

  http.patch('/mock-api/v1/radar/recommendations/:recommendationId', async ({params, request}) => {
    const payload = (await request.json()) as PatchRadarRecommendationPayload
    const updated = patchMockRadarRecommendation(params.recommendationId as string, payload)
    if (!updated) {
      return HttpResponse.json({message: 'Recommendation not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),
]
