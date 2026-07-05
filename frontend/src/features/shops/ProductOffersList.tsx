/**
 * SPEC-FR-9.2.1, SPEC-FR-9.2.2, SPEC-FR-9.2.3
 */

import {Card, Label, Text} from '@gravity-ui/uikit'

import type {ProductOffer} from '@/entities/shop/types'
import {ExternalProductLink} from '@/features/shops/ExternalProductLink'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-9.2.1 - Props списка предложений */
export interface ProductOffersListProps {
  /** @spec SPEC-FR-9.2.1 */
  offers: ProductOffer[]
  /** @spec SPEC-FR-9.1.2 */
  shopName: string
}

const AVAILABILITY_LABELS: Record<ProductOffer['availability'], string> = {
  in_stock: 'В наличии',
  out_of_stock: 'Нет в наличии',
  unknown: 'Уточняйте',
}

/**
 * @spec SPEC-FR-9.2.1 - Список товарных предложений
 * @spec SPEC-FR-9.2.3 - Mock-checkout вместо внешней ссылки
 */
export function ProductOffersList({offers, shopName}: ProductOffersListProps) {
  if (offers.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('shops', 'product-offers', 'empty')}>
        Предложения не найдены
      </Text>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-12"
      data-testid={testId('shops', 'product-offers', 'list')}
    >
      {offers.map((offer) => (
        <Card
          key={offer.id}
          view="filled"
          className="hockey-panel"
          data-testid={testId('shops', 'product-offers', 'card', offer.id)}
        >
          <div className="hockey-row hockey-row--gap-12 hockey-row--between">
            <div className="hockey-stack hockey-stack--gap-4">
              <Text
                variant="subheader-2"
                data-testid={testId('shops', 'product-offers', 'text', 'title', offer.id)}
              >
                {offer.title}
              </Text>
              <Text
                color="secondary"
                data-testid={testId('shops', 'product-offers', 'text', 'category', offer.id)}
              >
                {offer.category}
              </Text>
              <Text data-testid={testId('shops', 'product-offers', 'text', 'price', offer.id)}>
                {offer.price.toLocaleString('ru-RU')} {offer.currency}
              </Text>
              <Label
                theme={offer.availability === 'in_stock' ? 'success' : 'warning'}
                size="s"
                data-testid={testId('shops', 'product-offers', 'badge', 'availability', offer.id)}
              >
                {AVAILABILITY_LABELS[offer.availability]}
              </Label>
            </div>
            <ExternalProductLink offer={offer} shopName={shopName} />
          </div>
        </Card>
      ))}
    </div>
  )
}
