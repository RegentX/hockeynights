/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchNotifications} from '@/entities/notification'
import {testId} from '@/shared/testing/testId'
import {QueryErrorState} from '@/shared/ui/QueryErrorState'
import {NotificationCenter} from '@/widgets/NotificationCenter'

/**
 * @spec SPEC-FR-10.1.1 - Страница уведомлений
 */
export function NotificationsPage() {
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('notifications', 'page', 'page')}
    >
      <Text variant="header-1" data-testid={testId('notifications', 'page', 'text', 'title')}>
        Уведомления
      </Text>
      {unreadCount > 0 && (
        <Text
          color="secondary"
          data-testid={testId('notifications', 'page', 'text', 'unread-count')}
        >
          Непрочитанных: {unreadCount}
        </Text>
      )}
      {isLoading && (
        <Text data-testid={testId('notifications', 'page', 'loader')}>Загрузка...</Text>
      )}
      {isError && !isLoading ? (
        <QueryErrorState
          title="Не удалось загрузить уведомления"
          onRetry={() => refetch()}
          testIdPrefix="notifications"
          data-testid={testId('notifications', 'page', 'error')}
        />
      ) : (
        <NotificationCenter notifications={notifications} />
      )}
    </div>
  )
}
