/**
 * SPEC-FR-5.1.1, SPEC-FR-5.1.2, SPEC-FR-5.1.3, SPEC-FR-5.2.1, SPEC-FR-5.2.2, SPEC-FR-5.2.3
 */

import {apiRequest} from '@/shared/api/client'

import type {CreateRecruitmentPayload, RecruitmentRequest, RecruitmentResponse} from '../model'

/** @spec SPEC-FR-5.2.1 - Фильтр запросов */
export interface RecruitmentFilters {
  goalieOnly?: boolean
}

/**
 * @spec SPEC-FR-5.2.1 - Список запросов добора
 */
export function fetchRecruitmentRequests(
  filters: RecruitmentFilters = {},
): Promise<RecruitmentRequest[]> {
  const params = new URLSearchParams()
  if (filters.goalieOnly) params.set('goalieOnly', 'true')
  const query = params.toString()
  return apiRequest<RecruitmentRequest[]>(`/recruitment-requests${query ? `?${query}` : ''}`)
}

/**
 * @spec SPEC-FR-5.1.1 - Создать запрос добора
 */
export function createRecruitmentRequest(
  payload: CreateRecruitmentPayload,
): Promise<RecruitmentRequest> {
  return apiRequest<RecruitmentRequest>('/recruitment-requests', {
    method: 'POST',
    body: payload,
  })
}

/**
 * @spec SPEC-FR-5.2.3 - Отклики на запрос
 */
export function fetchRecruitmentResponses(requestId: string): Promise<RecruitmentResponse[]> {
  return apiRequest<RecruitmentResponse[]>(`/recruitment-requests/${requestId}/responses`)
}

/**
 * @spec SPEC-FR-5.2.2 - Откликнуться на запрос
 */
export function respondToRecruitment(
  requestId: string,
  message?: string,
  displayName?: string,
): Promise<RecruitmentResponse> {
  return apiRequest<RecruitmentResponse>(`/recruitment-requests/${requestId}/responses`, {
    method: 'POST',
    body: {message, displayName},
  })
}

/**
 * @spec SPEC-FR-5.2.3 - Подтвердить или отклонить отклик
 */
export function reviewRecruitmentResponse(
  responseId: string,
  status: 'accepted' | 'declined',
): Promise<RecruitmentResponse> {
  return apiRequest<RecruitmentResponse>(`/recruitment-responses/${responseId}`, {
    method: 'PATCH',
    body: {status},
  })
}
