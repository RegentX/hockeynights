/**
 * SPEC-FR-24.7.9
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Text} from '@gravity-ui/uikit'
import {fetchPartnerModerationQueue, moderatePartnerItem} from '@/features/admin/api/adminApi'

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
    return <Text color="secondary">Загрузка очереди модерации…</Text>
  }

  if (items.length === 0) {
    return <Text color="secondary">Нет материалов на проверке.</Text>
  }

  return (
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12">
      <ul className="partner-dashboard__list">
        {items.map((item) => (
          <li key={item.id} className="partner-dashboard__list-item partner-dashboard__list-item--stack">
            <div>
              <Text>{item.title}</Text>
              <Text color="secondary">
                {KIND_LABELS[item.kind] ?? item.kind}
                {item.subtitle ? ` · ${item.subtitle}` : ''}
              </Text>
              <Text color="secondary">Статус: {item.moderationStatus}</Text>
            </div>
            <div className="partner-dashboard__tabs">
              <Button
                size="s"
                view="action"
                loading={moderateMutation.isPending}
                onClick={() => moderateMutation.mutate({itemId: item.id, status: 'published'})}
              >
                Опубликовать
              </Button>
              <Button
                size="s"
                view="outlined"
                onClick={() => moderateMutation.mutate({itemId: item.id, status: 'rejected'})}
              >
                Отклонить
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
