/**
 * SPEC-FR-24.7.4
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Checkbox, Select, Text, TextInput} from '@gravity-ui/uikit'
import type {PlayerPosition, SkillLevel} from '@/entities/common/types'
import type {ProductOffer, ShopProductPayload} from '@/entities/shop/types'
import {createShopProduct, fetchProductOffers, updateShopProduct} from '@/features/shops/api/shopsApi'
import {testId} from '@/shared/testing/testId'

const AVAILABILITY_OPTIONS = [
  {value: 'in_stock', content: 'В наличии'},
  {value: 'out_of_stock', content: 'Нет в наличии'},
  {value: 'unknown', content: 'Уточнять'},
]

const POSITION_OPTIONS: PlayerPosition[] = ['forward', 'defense', 'goalie']

const LEVEL_OPTIONS = [
  {value: 'beginner', content: 'Новичок'},
  {value: 'amateur', content: 'Любитель'},
  {value: 'advanced', content: 'Продвинутый'},
  {value: 'league', content: 'Лига'},
]

const EMPTY_FORM: ShopProductPayload = {
  title: '',
  category: '',
  price: 0,
  availability: 'in_stock',
  externalUrl: '',
  recommendedPositions: [],
  recommendedLevels: [],
  imageUrl: '',
}

export interface ShopProductManagerProps {
  shopId: string
}

/** @spec SPEC-FR-24.7.4 - Управление товарами магазина */
export function ShopProductManager({shopId}: ShopProductManagerProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ShopProductPayload>(EMPTY_FORM)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {data: products = []} = useQuery({
    queryKey: ['product-offers', shopId],
    queryFn: () => fetchProductOffers(shopId),
  })

  const createMutation = useMutation({
    mutationFn: (payload: ShopProductPayload) => createShopProduct(shopId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['product-offers', shopId]})
      setForm(EMPTY_FORM)
      setStatusMessage('Товар отправлен на модерацию и появится в каталоге после проверки.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({productId, patch}: {productId: string; patch: Partial<ShopProductPayload>}) =>
      updateShopProduct(shopId, productId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['product-offers', shopId]})
      setStatusMessage('Изменения сохранены, статус: на проверке.')
    },
  })

  function toggleAvailability(product: ProductOffer) {
    const next =
      product.availability === 'in_stock'
        ? 'out_of_stock'
        : product.availability === 'out_of_stock'
          ? 'unknown'
          : 'in_stock'
    updateMutation.mutate({productId: product.id, patch: {availability: next}})
  }

  function togglePosition(position: PlayerPosition, checked: boolean) {
    setForm((prev) => {
      const current = prev.recommendedPositions ?? []
      const next = checked ? [...current, position] : current.filter((p) => p !== position)
      return {...prev, recommendedPositions: next}
    })
  }

  return (
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12" data-testid={testId('shops', shopId, 'products', 'panel')}>
      <Text variant="subheader-2" data-testid={testId('shops', shopId, 'products', 'text', 'title')}>
        Товары магазина
      </Text>
      <Text color="secondary" data-testid={testId('shops', shopId, 'products', 'text', 'hint')}>
        Добавляй позиции вручную или импортируй каталог на вкладке «Импорт».
      </Text>

      <ul className="partner-dashboard__list" data-testid={testId('shops', shopId, 'products', 'list')}>
        {products.map((product) => (
          <li key={product.id} className="partner-dashboard__list-item" data-testid={testId('shops', shopId, 'products', 'item', product.id)}>
            <div className="hockey-row hockey-row--gap-12">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt=""
                  className="shop-product-thumb"
                  width={48}
                  height={48}
                  data-testid={testId('shops', shopId, 'products', 'cell', 'image', product.id)}
                />
              )}
              <div>
                <Text data-testid={testId('shops', shopId, 'products', 'text', 'title', product.id)}>
                  {product.title}
                </Text>
                <Text color="secondary" data-testid={testId('shops', shopId, 'products', 'text', 'meta', product.id)}>
                  {product.category} · {product.price.toLocaleString('ru-RU')} ₽ · {product.availability}
                  {product.recommendedPositions?.length
                    ? ` · ${product.recommendedPositions.join(', ')}`
                    : ''}
                  {product.moderationStatus ? ` · ${product.moderationStatus}` : ''}
                </Text>
              </div>
            </div>
            <Button
              size="s"
              view="outlined"
              data-testid={testId('shops', shopId, 'products', 'btn', 'toggle-availability', product.id)}
              onClick={() => toggleAvailability(product)}
            >
              Сменить наличие
            </Button>
          </li>
        ))}
      </ul>

      <div className="partner-dashboard__form hockey-stack hockey-stack--gap-8" data-testid={testId('shops', shopId, 'products', 'form')}>
        <Text variant="subheader-2" data-testid={testId('shops', shopId, 'products', 'text', 'form-title')}>
          Добавить товар
        </Text>
        <TextInput
          label="Название"
          value={form.title}
          data-testid={testId('shops', shopId, 'products', 'field', 'title')}
          onUpdate={(value) => setForm((prev) => ({...prev, title: value}))}
        />
        <TextInput
          label="Категория"
          value={form.category}
          data-testid={testId('shops', shopId, 'products', 'field', 'category')}
          onUpdate={(value) => setForm((prev) => ({...prev, category: value}))}
        />
        <TextInput
          label="Цена, ₽"
          value={String(form.price || '')}
          data-testid={testId('shops', shopId, 'products', 'field', 'price')}
          onUpdate={(value) => setForm((prev) => ({...prev, price: Number(value) || 0}))}
        />
        <TextInput
          label="Ссылка на карточку"
          value={form.externalUrl}
          data-testid={testId('shops', shopId, 'products', 'field', 'external-url')}
          onUpdate={(value) => setForm((prev) => ({...prev, externalUrl: value}))}
        />
        <TextInput
          label="URL изображения (mock)"
          value={form.imageUrl ?? ''}
          placeholder="https://placehold.co/120x120/png?text=Product"
          data-testid={testId('shops', shopId, 'products', 'field', 'image-url')}
          onUpdate={(value) => setForm((prev) => ({...prev, imageUrl: value}))}
        />
        <div>
          <Text variant="caption-1" color="secondary" data-testid={testId('shops', shopId, 'products', 'text', 'positions-label')}>
            Рекомендованные амплуа
          </Text>
          <div className="hockey-mt-8 hockey-row hockey-row--gap-12 hockey-row--wrap">
            {POSITION_OPTIONS.map((position) => (
              <Checkbox
                key={position}
                checked={form.recommendedPositions?.includes(position) ?? false}
                data-testid={testId('shops', shopId, 'products', 'checkbox', 'position', position)}
                onUpdate={(checked) => togglePosition(position, checked)}
                content={position}
              />
            ))}
          </div>
        </div>
        <Select
          label="Рекомендованный уровень"
          value={form.recommendedLevels?.[0] ? [form.recommendedLevels[0]] : []}
          options={LEVEL_OPTIONS}
          data-testid={testId('shops', shopId, 'products', 'select', 'level')}
          onUpdate={(value) =>
            setForm((prev) => ({
              ...prev,
              recommendedLevels: value[0] ? [value[0] as SkillLevel] : [],
            }))
          }
        />
        <Select
          label="Наличие"
          value={[form.availability]}
          options={AVAILABILITY_OPTIONS}
          data-testid={testId('shops', shopId, 'products', 'select', 'availability')}
          onUpdate={(value) =>
            setForm((prev) => ({...prev, availability: value[0] as ShopProductPayload['availability']}))
          }
        />
        <Button
          view="action"
          disabled={!form.title.trim() || !form.category.trim() || !form.externalUrl.trim()}
          loading={createMutation.isPending}
          data-testid={testId('shops', shopId, 'products', 'btn', 'add')}
          onClick={() => createMutation.mutate(form)}
        >
          Добавить товар
        </Button>
      </div>

      {statusMessage && (
        <Text color="secondary" data-testid={testId('shops', shopId, 'products', 'text', 'status-message')}>
          {statusMessage}
        </Text>
      )}
    </div>
  )
}
