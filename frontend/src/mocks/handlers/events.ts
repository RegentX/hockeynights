/**
 * SPEC-FR-25.6.1, SPEC-FR-25.6.2
 * MSW handlers RSVP на игру команды.
 */

import {http, HttpResponse} from 'msw'

import type {EventRsvpStatus, UpdateEventRsvpPayload} from '@/entities/event/rsvpTypes'
import {getMockEventRsvp, updateMockEventRsvp} from '@/mocks/data/eventRsvp'
import {mockUser} from '@/mocks/data/session'

export const eventHandlers = [
  http.get('/mock-api/v1/events/:eventId/rsvp', ({params}) => {
    const board = getMockEventRsvp(params.eventId as string)
    if (!board) {
      return HttpResponse.json({message: 'RSVP board not found'}, {status: 404})
    }
    return HttpResponse.json(board)
  }),

  http.post('/mock-api/v1/events/:eventId/rsvp', async ({params, request}) => {
    const body = (await request.json()) as UpdateEventRsvpPayload
    const status = body.status as EventRsvpStatus
    if (!['confirmed', 'declined', 'pending'].includes(status)) {
      return HttpResponse.json({message: 'Invalid RSVP status'}, {status: 400})
    }

    const updated = updateMockEventRsvp(
      params.eventId as string,
      mockUser.id,
      status,
      body.declineReason,
    )
    if (!updated) {
      return HttpResponse.json({message: 'RSVP board not found'}, {status: 404})
    }

    const currentPlayer = updated.players.find((player) => player.userId === mockUser.id)
    return HttpResponse.json({
      eventId: updated.eventId,
      userId: mockUser.id,
      status: currentPlayer?.status ?? status,
      declineReason: currentPlayer?.declineReason,
      updatedAt: currentPlayer?.updatedAt ?? new Date().toISOString(),
    })
  }),
]
