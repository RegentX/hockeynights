/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchNotifications} from '@/features/notifications/api/notificationsApi'
import {NotificationCenter} from '@/features/notifications/NotificationCenter'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-FR-10.1.1 - Страница уведомлений
 */
export function NotificationsPage() {
  const {data: notifications = [], isLoading} = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div className="hockey-stack hockey-stack--gap-16" data-testid={testId('notifications', 'page', 'page')}>
      <Text variant="header-1" data-testid={testId('notifications', 'page', 'text', 'title')}>
        Уведомления
      </Text>
      {unreadCount > 0 && (
        <Text color="secondary" data-testid={testId('notifications', 'page', 'text', 'unread-count')}>
          Непрочитанных: {unreadCount}
        </Text>
      )}
      {isLoading && (
        <Text data-testid={testId('notifications', 'page', 'loader')}>Загрузка...</Text>
      )}
      <NotificationCenter notifications={notifications} />
    </div>
  )
}
