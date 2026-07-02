/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.3, SPEC-FR-14.1.4
 */

import {http, HttpResponse} from 'msw'

import type {
  CreateAnnotationPayload,
  CreateCommentPayload,
  CreateHighlightPayload,
} from '@/entities/highlight/types'
import {
  createMockAnnotation,
  createMockComment,
  createMockHighlight,
  getHighlightDetail,
  mockHighlights,
} from '@/mocks/data/highlights'

/** @spec SPEC-FR-14.1.1 - Handlers Highlight Analysis */
export const highlightHandlers = [
  http.get('/mock-api/v1/highlights', () => {
    return HttpResponse.json(mockHighlights)
  }),

  http.get('/mock-api/v1/highlights/:highlightId', ({params}) => {
    const detail = getHighlightDetail(params.highlightId as string)
    if (!detail) {
      return HttpResponse.json({message: 'Highlight not found'}, {status: 404})
    }
    return HttpResponse.json(detail)
  }),

  http.post('/mock-api/v1/highlights', async ({request}) => {
    const payload = (await request.json()) as CreateHighlightPayload
    const highlight = createMockHighlight(payload)
    return HttpResponse.json(highlight)
  }),

  http.post('/mock-api/v1/highlights/:highlightId/annotations', async ({params, request}) => {
    const payload = (await request.json()) as CreateAnnotationPayload
    const annotation = createMockAnnotation(params.highlightId as string, payload)
    if (!annotation) {
      return HttpResponse.json({message: 'Highlight not found'}, {status: 404})
    }
    return HttpResponse.json(annotation)
  }),

  http.post('/mock-api/v1/highlights/:highlightId/comments', async ({params, request}) => {
    const payload = (await request.json()) as CreateCommentPayload
    const comment = createMockComment(params.highlightId as string, payload)
    if (!comment) {
      return HttpResponse.json({message: 'Highlight not found'}, {status: 404})
    }
    return HttpResponse.json(comment)
  }),
]
