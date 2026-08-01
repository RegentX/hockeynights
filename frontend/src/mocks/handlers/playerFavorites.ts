/**
 * SPEC-FR-2.3.1
 */

import {http, HttpResponse} from 'msw'

import type {PatchPlayerFavoritesPayload} from '@/entities/player-favorites'
import {getMockPlayerFavorites, updateMockPlayerFavorites} from '@/mocks/data/playerFavorites'

export const playerFavoritesHandlers = [
  http.get('/mock-api/v1/players/favorites', () => {
    return HttpResponse.json(getMockPlayerFavorites())
  }),

  http.patch('/mock-api/v1/players/favorites', async ({request}) => {
    const body = (await request.json()) as PatchPlayerFavoritesPayload
    if (!Array.isArray(body.playerIds)) {
      return HttpResponse.json({message: 'playerIds array is required'}, {status: 400})
    }
    const updated = updateMockPlayerFavorites(body.playerIds.filter((id) => typeof id === 'string'))
    return HttpResponse.json(updated)
  }),
]
