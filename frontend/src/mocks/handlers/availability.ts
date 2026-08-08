/**
 * HOCFRONT-28CAL-G/H — MSW availability windows + goalie requests
 */

import {http, HttpResponse} from 'msw'

import type {CreateAvailabilityWindowPayload} from '@/entities/calendar'
import {
  createGoalieRequestsForEvent,
  createMockAvailabilityWindow,
  listAvailabilityWindows,
  listGoalieRequests,
  patchMockAvailabilityWindow,
  respondMockGoalieRequest,
} from '@/mocks/data/availability'
import {mockUser} from '@/mocks/data/session'

export const availabilityHandlers = [
  http.get('/mock-api/v1/availability-windows', ({request}) => {
    const userId = new URL(request.url).searchParams.get('userId') ?? undefined
    return HttpResponse.json(listAvailabilityWindows(userId ?? mockUser.id))
  }),

  http.post('/mock-api/v1/availability-windows', async ({request}) => {
    const body = (await request.json()) as CreateAvailabilityWindowPayload
    const created = createMockAvailabilityWindow(mockUser.id, {
      ...body,
      active: true,
    })
    return HttpResponse.json(created, {status: 201})
  }),

  http.patch('/mock-api/v1/availability-windows/:id', async ({params, request}) => {
    const body = (await request.json()) as Partial<{
      active: boolean
      note: string
      priceFrom: number
      priceTo: number
      districts: string[]
    }>
    const updated = patchMockAvailabilityWindow(params.id as string, body)
    if (!updated) {
      return HttpResponse.json({message: 'Window not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/goalie-requests', ({request}) => {
    const userId = new URL(request.url).searchParams.get('userId') ?? mockUser.id
    return HttpResponse.json(listGoalieRequests(userId))
  }),

  http.post('/mock-api/v1/goalie-requests', async ({request}) => {
    const body = (await request.json()) as {eventId: string}
    const created = createGoalieRequestsForEvent(body.eventId, mockUser.id)
    return HttpResponse.json({created: created.length}, {status: 201})
  }),

  http.patch('/mock-api/v1/goalie-requests/:id', async ({params, request}) => {
    const body = (await request.json()) as {status: 'accepted' | 'declined'}
    const updated = respondMockGoalieRequest(params.id as string, body.status, mockUser.displayName)
    if (!updated) {
      return HttpResponse.json({message: 'Request not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),
]
