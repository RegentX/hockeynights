/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.3, SPEC-FR-14.1.4
 */

import type {
  CreateAnnotationPayload,
  CreateCommentPayload,
  CreateHighlightPayload,
  Highlight,
  HighlightAnnotation,
  HighlightComment,
  HighlightDetail,
} from '@/entities/highlight/types'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-14.1.1 - Каталог mock-моментов
 */
export function fetchHighlights(): Promise<Highlight[]> {
  return apiRequest<Highlight[]>('/highlights')
}

/**
 * @spec SPEC-FR-14.1.1 - Детали момента с разметкой и комментариями
 */
export function fetchHighlight(highlightId: string): Promise<HighlightDetail> {
  return apiRequest<HighlightDetail>(`/highlights/${highlightId}`)
}

/**
 * @spec SPEC-FR-14.1.1, SPEC-FR-14.1.4 - Mock-загрузка момента
 */
export function createHighlight(payload: CreateHighlightPayload): Promise<Highlight> {
  return apiRequest<Highlight>('/highlights', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-14.1.2 - Добавить разметку
 */
export function addHighlightAnnotation(
  highlightId: string,
  payload: CreateAnnotationPayload,
): Promise<HighlightAnnotation> {
  return apiRequest<HighlightAnnotation>(`/highlights/${highlightId}/annotations`, {
    method: 'POST',
    body: payload,
  })
}

/**
 * @spec SPEC-FR-14.1.3 - Добавить комментарий
 */
export function addHighlightComment(
  highlightId: string,
  payload: CreateCommentPayload,
): Promise<HighlightComment> {
  return apiRequest<HighlightComment>(`/highlights/${highlightId}/comments`, {
    method: 'POST',
    body: payload,
  })
}
