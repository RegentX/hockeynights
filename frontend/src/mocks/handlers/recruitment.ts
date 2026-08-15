/**
 * SPEC-FR-5.1.1, SPEC-FR-5.1.2, SPEC-FR-5.1.3, SPEC-FR-5.2.1, SPEC-FR-5.2.2, SPEC-FR-5.2.3
 */

import {http, HttpResponse} from 'msw'

import type {CreateRecruitmentPayload} from '@/entities/recruitment'
import {
  createMockRecruitment,
  createMockResponse,
  mockRecruitmentRequests,
  mockRecruitmentResponses,
  updateMockResponseStatus,
} from '@/mocks/data/recruitment'

/** @spec SPEC-FR-5.1.1 - Handlers recruitment и SOS */
export const recruitmentHandlers = [
  http.get('/mock-api/v1/recruitment-requests', ({request}) => {
    const url = new URL(request.url)
    const goalieOnly = url.searchParams.get('goalieOnly') === 'true'
    let result = mockRecruitmentRequests.filter((r) => r.status === 'open')
    if (goalieOnly) {
      result = result.filter((r) => r.isGoalkeeperSos)
    }
    return HttpResponse.json(result)
  }),

  http.post('/mock-api/v1/recruitment-requests', async ({request}) => {
    const body = (await request.json()) as CreateRecruitmentPayload
    const created = createMockRecruitment(body)
    return HttpResponse.json(created)
  }),

  http.get('/mock-api/v1/recruitment-requests/:requestId/responses', ({params}) => {
    const responses = mockRecruitmentResponses.filter((r) => r.requestId === params.requestId)
    return HttpResponse.json(responses)
  }),

  http.post('/mock-api/v1/recruitment-requests/:requestId/responses', async ({params, request}) => {
    const body = (await request.json()) as {message?: string; displayName?: string}
    const created = createMockResponse(
      params.requestId as string,
      'user-002',
      body.displayName ?? 'Смирнов Алексей Дмитриевич',
      body.message,
    )
    return HttpResponse.json(created)
  }),

  http.patch('/mock-api/v1/recruitment-responses/:responseId', async ({params, request}) => {
    const body = (await request.json()) as {status: 'accepted' | 'declined'}
    const updated = updateMockResponseStatus(params.responseId as string, body.status)
    if (!updated) {
      return HttpResponse.json({message: 'Response not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),
]
