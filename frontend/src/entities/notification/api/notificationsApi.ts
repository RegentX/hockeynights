/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import {apiRequest} from '@/shared/api/client'

import type {Notification} from '../model'

/**
 * @spec SPEC-FR-10.1.1 - Список уведомлений
 */
export function fetchNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>('/notifications')
}

/**
 * @spec SPEC-FR-10.1.2 - Отметить прочитанным
 */
export function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return apiRequest<Notification>(`/notifications/${notificationId}/read`, {method: 'PATCH'})
}
