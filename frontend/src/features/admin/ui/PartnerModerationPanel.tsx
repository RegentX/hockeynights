/**
 * SPEC-FR-24.7.9
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {fetchPartnerModerationQueue, moderatePartnerItem} from '@/entities/admin'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const KIND_LABELS: Record<string, string> = {
  league_profile: 'Профиль лиги',
  shop_profile: 'Профиль магазина',
  shop_product: 'Товар',
}

/** @spec SPEC-FR-24.7.9 - Очередь модерации партнёрского контента */
export function PartnerModerationPanel() {
  const queryClient = useQueryClient()

  const {data: items = [], isLoading} = useQuery({
    queryKey: ['admin-partner-moderation'],
    queryFn: fetchPartnerModerationQueue,
  })

  const moderateMutation = useMutation({
    mutationFn: ({itemId, status}: {itemId: string; status: 'published' | 'rejected'}) =>
      moderatePartnerItem(itemId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['admin-partner-moderation']})
      void queryClient.invalidateQueries({queryKey: ['shops']})
      void queryClient.invalidateQueries({queryKey: ['leagues']})
      void queryClient.invalidateQueries({queryKey: ['product-offers']})
    },
  })

  if (isLoading) {
    return (
      <Text color="secondary" data-testid={testId('admin', 'moderation', 'loader')}>
        Загрузка очереди модерации…
      </Text>
    )
  }

  if (items.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('admin', 'moderation', 'empty')}>
        Нет материалов на проверке.
      </Text>
    )
  }

  return (
    <div
      className="partner-dashboard__section hockey-stack hockey-stack--gap-12"
      data-testid={testId('admin', 'moderation', 'panel')}
    >
      <ul className="partner-dashboard__list" data-testid={testId('admin', 'moderation', 'list')}>
        {items.map((item) => (
          <li
            key={item.id}
            className="partner-dashboard__list-item partner-dashboard__list-item--stack"
            data-testid={testId('admin', 'moderation', 'item', item.id)}
          >
            <div>
              <Text data-testid={testId('admin', 'moderation', 'text', 'title', item.id)}>
                {item.title}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('admin', 'moderation', 'text', 'kind', item.id)}
              >
                {KIND_LABELS[item.kind] ?? item.kind}
                {item.subtitle ? ` · ${item.subtitle}` : ''}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('admin', 'moderation', 'text', 'status', item.id)}
              >
                Статус: {item.moderationStatus}
              </Text>
            </div>
            <div className="partner-dashboard__tabs">
              <HockeyButton
                size="s"
                view="action"
                loading={moderateMutation.isPending}
                data-testid={testId('admin', 'moderation', 'btn', 'publish', item.id)}
                onClick={() => moderateMutation.mutate({itemId: item.id, status: 'published'})}
              >
                Опубликовать
              </HockeyButton>
              <HockeyButton
                size="s"
                view="outlined"
                data-testid={testId('admin', 'moderation', 'btn', 'reject', item.id)}
                onClick={() => moderateMutation.mutate({itemId: item.id, status: 'rejected'})}
              >
                Отклонить
              </HockeyButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
