/**
 * HOCFRONT-28CAL-G/H — API окон возможностей и запросов вратарям
 */

import type {
  AvailabilityWindow,
  CreateAvailabilityWindowPayload,
  GoalieRequest,
} from '@/entities/calendar/model/types'
import {apiRequest} from '@/shared/api/client'

export function fetchAvailabilityWindows(userId?: string): Promise<AvailabilityWindow[]> {
  const params = new URLSearchParams()
  if (userId) params.set('userId', userId)
  const query = params.toString()
  return apiRequest<AvailabilityWindow[]>(`/availability-windows${query ? `?${query}` : ''}`)
}

export function createAvailabilityWindow(
  payload: CreateAvailabilityWindowPayload,
): Promise<AvailabilityWindow> {
  return apiRequest<AvailabilityWindow>('/availability-windows', {method: 'POST', body: payload})
}

export function patchAvailabilityWindow(
  id: string,
  partial: Partial<AvailabilityWindow>,
): Promise<AvailabilityWindow> {
  return apiRequest<AvailabilityWindow>(`/availability-windows/${id}`, {
    method: 'PATCH',
    body: partial,
  })
}

export function fetchGoalieRequests(userId?: string): Promise<GoalieRequest[]> {
  const params = new URLSearchParams()
  if (userId) params.set('userId', userId)
  const query = params.toString()
  return apiRequest<GoalieRequest[]>(`/goalie-requests${query ? `?${query}` : ''}`)
}

export function sendGoalieRequestsForEvent(eventId: string): Promise<{created: number}> {
  return apiRequest<{created: number}>('/goalie-requests', {
    method: 'POST',
    body: {eventId},
  })
}

export function respondGoalieRequest(
  requestId: string,
  status: 'accepted' | 'declined',
): Promise<GoalieRequest> {
  return apiRequest<GoalieRequest>(`/goalie-requests/${requestId}`, {
    method: 'PATCH',
    body: {status},
  })
}
