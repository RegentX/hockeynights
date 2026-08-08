/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import {Label, Text} from '@gravity-ui/uikit'

import type {Notification} from '@/entities/notification'
import {MarkNotificationReadButton} from '@/features/notifications'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'

/** @spec SPEC-FR-10.1.1 - Props центра уведомлений */
export interface NotificationCenterProps {
  /** @spec SPEC-FR-10.1.1 */
  notifications: Notification[]
}

const TYPE_LABELS: Record<Notification['type'], string> = {
  sos: 'SOS',
  roster: 'Состав',
  response: 'Отклик',
  event_reminder: 'Событие',
  goalie_request: 'Вратарь',
}

/**
 * @spec SPEC-FR-10.1.1 - Список in-app уведомлений
 * @spec SPEC-FR-10.1.2 - Действие mark as read
 */
export function NotificationCenter({notifications}: NotificationCenterProps) {
  if (notifications.length === 0) {
    return (
      <EmptyNetState
        title="Нет уведомлений"
        copy="Когда появится активность по SOS, составу или событиям — она будет здесь."
        testIdPrefix="notifications"
        data-testid={testId('notifications', 'center', 'empty')}
      />
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('notifications', 'center', 'list')}
    >
      {notifications.map((notification) => (
        <IceCard
          key={notification.id}
          padding="m"
          className={notification.readAt ? undefined : 'ice-card--selected'}
          data-testid={testId('notifications', 'center', 'card', notification.id)}
        >
          <div className="hockey-row hockey-row--gap-12 hockey-row--between">
            <div className="hockey-stack hockey-stack--gap-4">
              <div className="hockey-row hockey-row--gap-8 hockey-row--center">
                <Label
                  size="s"
                  data-testid={testId('notifications', 'center', 'badge', 'type', notification.id)}
                >
                  {TYPE_LABELS[notification.type]}
                </Label>
                <Text
                  variant="subheader-2"
                  data-testid={testId('notifications', 'center', 'text', 'title', notification.id)}
                >
                  {notification.title}
                </Text>
              </div>
              <Text
                data-testid={testId('notifications', 'center', 'text', 'body', notification.id)}
              >
                {notification.body}
              </Text>
              <Text
                color="secondary"
                variant="caption-2"
                data-testid={testId('notifications', 'center', 'text', 'time', notification.id)}
              >
                {new Date(notification.createdAt).toLocaleString('ru-RU')}
              </Text>
            </div>
            {!notification.readAt && (
              <MarkNotificationReadButton notificationId={notification.id} />
            )}
          </div>
        </IceCard>
      ))}
    </div>
  )
}
