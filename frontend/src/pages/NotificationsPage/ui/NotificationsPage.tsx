/**
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'

import {fetchNotifications} from '@/entities/notification'
import {testId} from '@/shared/testing/testId'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryState} from '@/shared/ui/QueryState'
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
      className="hockey-stack hockey-stack--gap-20"
      data-testid={testId('notifications', 'page', 'page')}
    >
      <PageHeader
        title="Уведомления"
        testIdPrefix="notifications"
        subtitle="Важные сигналы по SOS, составу и событиям"
      />
      {!isLoading && !isError && unreadCount > 0 && (
        <Text
          color="secondary"
          data-testid={testId('notifications', 'page', 'text', 'unread-count')}
        >
          Непрочитанных: {unreadCount}
        </Text>
      )}

      <QueryState
        isLoading={isLoading}
        isError={isError}
        loadingLabel="Загрузка уведомлений"
        errorTitle="Не удалось загрузить уведомления"
        onRetry={() => void refetch()}
        testIdPrefix="notifications"
      >
        <NotificationCenter notifications={notifications} />
      </QueryState>
    </div>
  )
}
