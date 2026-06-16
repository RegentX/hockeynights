/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import type {Notification} from '@/entities/notification/types'

/** @spec SPEC-FR-10.1.1 - Mock уведомления */
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-001',
    type: 'sos',
    title: 'Goalkeeper SOS',
    body: 'Нужен вратарь на игру «Медведи САО» 07.06 в 20:00',
    relatedEntityId: 'req-001',
    createdAt: '2026-06-05T11:30:00Z',
  },
  {
    id: 'notif-002',
    userId: 'user-001',
    type: 'roster',
    title: 'Изменение состава',
    body: 'Сергей Волков отметил участие как «под вопросом»',
    relatedEntityId: 'event-001',
    createdAt: '2026-06-05T10:15:00Z',
  },
  {
    id: 'notif-003',
    userId: 'user-001',
    type: 'event_reminder',
    title: 'Ближайшее событие',
    body: 'Тренировка завтра в 08:00 на «Лужники»',
    relatedEntityId: 'event-002',
    readAt: '2026-06-05T09:00:00Z',
    createdAt: '2026-06-04T18:00:00Z',
  },
  {
    id: 'notif-004',
    userId: 'user-001',
    type: 'response',
    title: 'Новый отклик на SOS',
    body: 'Алексей Смирнов откликнулся на запрос вратаря',
    relatedEntityId: 'resp-001',
    createdAt: '2026-06-05T11:05:00Z',
  },
  {
    id: 'notif-005',
    userId: 'user-001',
    type: 'event_reminder',
    title: 'Напоминание: игра сегодня',
    body: 'Игра «Медведи САО» сегодня в 20:00, отметь участие.',
    relatedEntityId: 'event-001',
    createdAt: '2026-06-07T17:30:00Z',
  },
  {
    id: 'notif-006',
    userId: 'user-001',
    type: 'event_reminder',
    title: 'Напоминание: тренировка утром',
    body: 'Тренировка завтра в 08:00, не забудь форму.',
    relatedEntityId: 'event-002',
    createdAt: '2026-06-16T21:00:00Z',
  },
]

/**
 * @spec SPEC-FR-10.1.2 - Отметить прочитанным
 */
export function markNotificationRead(notificationId: string): Notification | undefined {
  const index = mockNotifications.findIndex((n) => n.id === notificationId)
  if (index === -1) return undefined
  mockNotifications[index] = {
    ...mockNotifications[index],
    readAt: new Date().toISOString(),
  }
  return mockNotifications[index]
}
