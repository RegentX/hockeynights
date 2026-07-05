/**
 * SPEC-FR-24.7.6
 */

import {Button, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import {createShopPromo, fetchShopPromos} from '@/features/shops/api/shopsApi'
import {testId} from '@/shared/testing/testId'

export interface ShopPromoManagerProps {
  shopId: string
}

/** @spec SPEC-FR-24.7.6 - Промо-подборки магазина */
export function ShopPromoManager({shopId}: ShopPromoManagerProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')

  const {data: promos = []} = useQuery({
    queryKey: ['shop-promos', shopId],
    queryFn: () => fetchShopPromos(shopId),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createShopPromo(shopId, {
        title,
        subtitle: subtitle || undefined,
        discountPercent: 10,
        targetPositions: ['goalie'],
        active: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['shop-promos', shopId]})
      setTitle('')
      setSubtitle('')
    },
  })

  return (
    <div
      className="partner-dashboard__section hockey-stack hockey-stack--gap-12"
      data-testid={testId('shops', shopId, 'promos', 'panel')}
    >
      <Text variant="subheader-2" data-testid={testId('shops', shopId, 'promos', 'text', 'title')}>
        Промо-подборки
      </Text>

      <ul
        className="partner-dashboard__list"
        data-testid={testId('shops', shopId, 'promos', 'list')}
      >
        {promos.map((promo) => (
          <li
            key={promo.id}
            className="partner-dashboard__list-item"
            data-testid={testId('shops', shopId, 'promos', 'item', promo.id)}
          >
            <div>
              <Text data-testid={testId('shops', shopId, 'promos', 'text', 'title', promo.id)}>
                {promo.title}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('shops', shopId, 'promos', 'text', 'meta', promo.id)}
              >
                {promo.subtitle ?? ''}
                {promo.discountPercent ? ` · −${promo.discountPercent}%` : ''}
                {promo.active ? ' · активна' : ' · выключена'}
              </Text>
            </div>
          </li>
        ))}
      </ul>

      <div
        className="partner-dashboard__form hockey-stack hockey-stack--gap-8"
        data-testid={testId('shops', shopId, 'promos', 'form')}
      >
        <TextInput
          label="Заголовок"
          value={title}
          data-testid={testId('shops', shopId, 'promos', 'field', 'title')}
          onUpdate={setTitle}
        />
        <TextInput
          label="Подзаголовок"
          value={subtitle}
          data-testid={testId('shops', shopId, 'promos', 'field', 'subtitle')}
          onUpdate={setSubtitle}
        />
        <Button
          view="action"
          size="s"
          disabled={!title.trim()}
          loading={createMutation.isPending}
          data-testid={testId('shops', shopId, 'promos', 'btn', 'create')}
          onClick={() => createMutation.mutate()}
        >
          Создать промо
        </Button>
      </div>
    </div>
  )
}
