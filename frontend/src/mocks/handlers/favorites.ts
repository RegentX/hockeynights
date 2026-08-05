/**
 * HOCFRONT-19 / TASK-02-04 — MSW handlers for entity favorites
 */

import {http, HttpResponse} from 'msw'

import type {AddFavoritePayload} from '@/entities/favorites'
import {
  addMockEntityFavorite,
  listMockEntityFavorites,
  removeMockEntityFavorite,
} from '@/mocks/data/entityFavorites'

export const favoriteHandlers = [
  http.get('/mock-api/v1/favorites', () => {
    return HttpResponse.json({items: listMockEntityFavorites()})
  }),

  http.post('/mock-api/v1/favorites', async ({request}) => {
    const body = (await request.json()) as AddFavoritePayload
    if (!body?.type || !body?.entityId || !body?.title) {
      return HttpResponse.json({message: 'type, entityId and title are required'}, {status: 400})
    }
    const favorite = addMockEntityFavorite(body)
    return HttpResponse.json(favorite, {status: 201})
  }),

  http.delete('/mock-api/v1/favorites/:favoriteId', ({params}) => {
    const favoriteId = decodeURIComponent(String(params.favoriteId ?? ''))
    const removed = removeMockEntityFavorite(favoriteId)
    if (!removed) {
      return HttpResponse.json({message: 'Favorite not found'}, {status: 404})
    }
    return new HttpResponse(null, {status: 204})
  }),
]
