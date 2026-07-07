/**
 * SPEC-FR-13.1.1, SPEC-FR-13.1.2, SPEC-FR-13.1.3
 */

import {http, HttpResponse} from 'msw'

import type {IqAttemptPayload} from '@/entities/iq'
import {
  evaluateMockIqAttempt,
  mockIqLeaderboard,
  mockIqQuestions,
  mockIqTests,
} from '@/mocks/data/iq'

/** @spec SPEC-FR-13.1.1 - Handlers Hockey IQ */
export const iqHandlers = [
  http.get('/mock-api/v1/iq-tests', () => {
    return HttpResponse.json(mockIqTests)
  }),

  http.get('/mock-api/v1/iq-tests/:testId/questions', ({params}) => {
    const questions = mockIqQuestions.filter((q) => q.testId === params.testId)
    return HttpResponse.json(questions)
  }),

  http.post('/mock-api/v1/iq-attempts', async ({request}) => {
    const payload = (await request.json()) as IqAttemptPayload
    const result = evaluateMockIqAttempt(payload)
    return HttpResponse.json(result)
  }),

  http.get('/mock-api/v1/iq-leaderboard', () => {
    return HttpResponse.json(mockIqLeaderboard)
  }),
]
