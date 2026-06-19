/**
 * SPEC-FR-24.7.6
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Text, TextInput} from '@gravity-ui/uikit'
import {createShopPromo, fetchShopPromos} from '@/features/shops/api/shopsApi'

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
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12">
      <Text variant="subheader-2">Промо-подборки</Text>

      <ul className="partner-dashboard__list">
        {promos.map((promo) => (
          <li key={promo.id} className="partner-dashboard__list-item">
            <div>
              <Text>{promo.title}</Text>
              <Text color="secondary">
                {promo.subtitle ?? ''}
                {promo.discountPercent ? ` · −${promo.discountPercent}%` : ''}
                {promo.active ? ' · активна' : ' · выключена'}
              </Text>
            </div>
          </li>
        ))}
      </ul>

      <div className="partner-dashboard__form hockey-stack hockey-stack--gap-8">
        <TextInput label="Заголовок" value={title} onUpdate={setTitle} />
        <TextInput label="Подзаголовок" value={subtitle} onUpdate={setSubtitle} />
        <Button
          view="action"
          size="s"
          disabled={!title.trim()}
          loading={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          Создать промо
        </Button>
      </div>
    </div>
  )
}
