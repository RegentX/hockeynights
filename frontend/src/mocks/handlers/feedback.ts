/**
 * SPEC-FR-8.1.1, SPEC-FR-8.1.2, SPEC-FR-8.2.1, SPEC-FR-8.2.2
 */

import {http, HttpResponse} from 'msw'

import type {CreateFeedbackPayload} from '@/entities/feedback'
import {createMockFeedback, getMockKarma} from '@/mocks/data/feedback'
import {mockUser} from '@/mocks/data/session'

/** @spec SPEC-FR-8.1.1 - Handlers feedback и karma */
export const feedbackHandlers = [
  http.post('/mock-api/v1/feedback', async ({request}) => {
    const body = (await request.json()) as CreateFeedbackPayload
    try {
      const feedback = createMockFeedback(mockUser.id, body)
      return HttpResponse.json(feedback)
    } catch (error) {
      return HttpResponse.json(
        {message: error instanceof Error ? error.message : 'Feedback denied'},
        {status: 403},
      )
    }
  }),

  http.get('/mock-api/v1/players/:userId/karma', ({params}) => {
    const karma = getMockKarma(params.userId as string)
    return HttpResponse.json(karma)
  }),
]
