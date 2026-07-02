/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import {http, HttpResponse} from 'msw'

import {markNotificationRead, mockNotifications} from '@/mocks/data/notifications'
import {mockUser} from '@/mocks/data/session'

/** @spec SPEC-FR-10.1.1 - Handlers уведомлений */
export const notificationHandlers = [
  http.get('/mock-api/v1/notifications', () => {
    const items = mockNotifications.filter((n) => n.userId === mockUser.id)
    return HttpResponse.json(items)
  }),

  http.patch('/mock-api/v1/notifications/:notificationId/read', ({params}) => {
    const updated = markNotificationRead(params.notificationId as string)
    if (!updated) {
      return HttpResponse.json({message: 'Notification not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),
]
