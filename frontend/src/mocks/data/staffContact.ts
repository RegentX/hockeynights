/**
 * HOCFRONT-25 / TASK-04-05 — mock заявки «Связаться со штабом»
 */

import type {StaffContactRequest, StaffContactRequestPayload} from '@/entities/team'

export let mockStaffContactRequests: StaffContactRequest[] = []

export function createMockStaffContactRequest(
  teamId: string,
  payload: StaffContactRequestPayload,
): StaffContactRequest {
  const request: StaffContactRequest = {
    id: `staff-contact-${Date.now()}`,
    teamId,
    name: payload.name.trim(),
    email: payload.email.trim(),
    message: payload.message.trim(),
    createdAt: new Date().toISOString(),
  }
  mockStaffContactRequests = [request, ...mockStaffContactRequests]
  return request
}

export function resetMockStaffContactRequests(): void {
  mockStaffContactRequests = []
}
