/**
 * SPEC-FR-11.1.2
 */

import {Switch} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'

import type {AdminEntityType} from '@/entities/admin'
import {updateEntityVisibility} from '@/entities/admin'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-11.1.2 - Props переключателя видимости */
export interface VisibilityToggleProps {
  /** @spec SPEC-FR-11.1.2 */
  entityId: string
  /** @spec SPEC-FR-11.1.2 */
  entityType: AdminEntityType
  /** @spec SPEC-FR-11.1.2 */
  visible: boolean
}

/**
 * @spec SPEC-FR-11.1.2 - Скрыть или показать запись
 */
export function VisibilityToggle({entityId, entityType, visible}: VisibilityToggleProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (nextVisible: boolean) => updateEntityVisibility(entityId, entityType, nextVisible),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['admin-sources']})
      void queryClient.invalidateQueries({queryKey: ['arenas']})
      void queryClient.invalidateQueries({queryKey: ['leagues']})
      void queryClient.invalidateQueries({queryKey: ['shops']})
    },
  })

  return (
    <Switch
      checked={visible}
      disabled={mutation.isPending}
      data-testid={testId('admin', 'visibility', 'toggle', entityType, entityId)}
      onUpdate={(checked) => mutation.mutate(checked)}
    />
  )
}
