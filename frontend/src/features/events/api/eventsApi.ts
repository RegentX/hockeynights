/**
 * SPEC-FR-3.3.1, SPEC-FR-3.3.2, SPEC-FR-4.1.1, SPEC-FR-4.1.2, SPEC-FR-4.2.1, SPEC-FR-4.3.1
 */

import type {AttendanceStatus} from '@/entities/common/types'
import type {
  CalendarFilters,
  CreateEventPayload,
  GameEvent,
  RosterStatus,
} from '@/entities/event/types'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-4.1.1 - Список событий
 */
export function fetchEvents(): Promise<GameEvent[]> {
  return apiRequest<GameEvent[]>('/events')
}

/**
 * @spec SPEC-FR-4.1.1 - Создать событие
 */
export function createEvent(payload: CreateEventPayload): Promise<GameEvent> {
  return apiRequest<GameEvent>('/events', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-4.2.1 - Календарь пользователя
 * @spec SPEC-FR-4.2.2 - Фильтры календаря
 */
export function fetchCalendar(filters: CalendarFilters = {}): Promise<GameEvent[]> {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.attendanceStatus) params.set('attendanceStatus', filters.attendanceStatus)
  const query = params.toString()
  return apiRequest<GameEvent[]>(`/calendar${query ? `?${query}` : ''}`)
}

/**
 * @spec SPEC-FR-3.3.1 - Обновить посещаемость
 */
export function updateAttendance(
  eventId: string,
  status: AttendanceStatus,
  displayName?: string,
): Promise<GameEvent> {
  return apiRequest<GameEvent>(`/events/${eventId}/attendance`, {
    method: 'PATCH',
    body: {status, displayName},
  })
}

/**
 * @spec SPEC-FR-4.3.1 - Получить дефицит состава
 */
export function fetchRosterStatus(eventId: string): Promise<RosterStatus> {
  return apiRequest<RosterStatus>(`/events/${eventId}/roster-status`)
}
