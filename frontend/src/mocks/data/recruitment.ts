/**
 * SPEC-FR-5.1.1, SPEC-FR-5.1.2, SPEC-FR-5.1.3, SPEC-FR-5.2.1, SPEC-FR-5.2.2, SPEC-FR-5.2.3
 */

import type {
  CreateRecruitmentPayload,
  RecruitmentRequest,
  RecruitmentResponse,
} from '@/entities/recruitment'
import {mockEvents} from '@/mocks/data/events'

/** @spec SPEC-FR-5.1.1 - Mock запросы добора */
export let mockRecruitmentRequests: RecruitmentRequest[] = [
  {
    id: 'req-001',
    eventId: 'event-001',
    eventTitle: 'Товарищеская игра — Медведи САО',
    requestedPosition: 'goalie',
    skillLevel: 'amateur',
    isGoalkeeperSos: true,
    district: 'САО',
    price: 0,
    comment: 'Срочно нужен вратарь на вечернюю игру!',
    status: 'open',
    startsAt: '2026-06-07T20:00:00+03:00',
  },
]

/** @spec SPEC-FR-5.2.2 - Mock отклики */
export let mockRecruitmentResponses: RecruitmentResponse[] = [
  {
    id: 'resp-001',
    requestId: 'req-001',
    userId: 'user-002',
    displayName: 'Алексей Смирнов',
    message: 'Готов выйти, есть своя форма',
    status: 'pending',
    createdAt: '2026-06-05T11:00:00Z',
  },
]

/**
 * @spec SPEC-FR-5.1.1 - Создать запрос добора
 */
export function createMockRecruitment(payload: CreateRecruitmentPayload): RecruitmentRequest {
  const event = mockEvents.find((e) => e.id === payload.eventId)
  const request: RecruitmentRequest = {
    id: `req-${Date.now()}`,
    ...payload,
    eventTitle: event?.title,
    startsAt: event?.startsAt,
    status: 'open',
  }
  mockRecruitmentRequests = [...mockRecruitmentRequests, request]
  return request
}

/**
 * @spec SPEC-FR-5.2.2 - Создать отклик
 */
export function createMockResponse(
  requestId: string,
  userId: string,
  displayName: string,
  message?: string,
): RecruitmentResponse {
  const response: RecruitmentResponse = {
    id: `resp-${Date.now()}`,
    requestId,
    userId,
    displayName,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  mockRecruitmentResponses = [...mockRecruitmentResponses, response]
  return response
}

/**
 * @spec SPEC-FR-5.2.3 - Подтвердить или отклонить отклик
 */
export function updateMockResponseStatus(
  responseId: string,
  status: 'accepted' | 'declined',
): RecruitmentResponse | undefined {
  const index = mockRecruitmentResponses.findIndex((r) => r.id === responseId)
  if (index === -1) return undefined
  mockRecruitmentResponses[index] = {...mockRecruitmentResponses[index], status}
  if (status === 'accepted') {
    const req = mockRecruitmentRequests.find(
      (r) => r.id === mockRecruitmentResponses[index].requestId,
    )
    if (req) req.status = 'filled'
  }
  return mockRecruitmentResponses[index]
}
