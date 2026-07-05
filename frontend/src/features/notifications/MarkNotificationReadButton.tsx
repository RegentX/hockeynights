/**
 * SPEC-FR-10.1.2
 */

import {Button} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'

import {markNotificationAsRead} from '@/features/notifications/api/notificationsApi'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-10.1.2 - Props кнопки */
export interface MarkNotificationReadButtonProps {
  /** @spec SPEC-FR-10.1.2 */
  notificationId: string
}

/**
 * @spec SPEC-FR-10.1.2 - Отметить уведомление прочитанным
 */
export function MarkNotificationReadButton({notificationId}: MarkNotificationReadButtonProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => markNotificationAsRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['notifications']})
    },
  })

  return (
    <Button
      size="s"
      view="flat"
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
      data-testid={testId('notifications', 'mark-read', 'btn', 'read', notificationId)}
    >
      Прочитано
    </Button>
  )
}
