/**
 * SPEC-FR-9.1.1, SPEC-FR-9.1.2, SPEC-FR-9.1.3, SPEC-FR-11.2.2
 */

import {Button, Card, Label, Text} from '@gravity-ui/uikit'
import {useState} from 'react'

import type {Shop} from '@/entities/shop'
import {MockShopPortalModal} from '@/features/shops/ui/MockShopPortalModal'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/** @spec SPEC-FR-9.1.2 - Props карточки магазина */
export interface ShopCardProps {
  /** @spec SPEC-FR-9.1.2 */
  shop: Shop
  /** @spec SPEC-FR-9.2.1 */
  onSelect?: (shopId: string) => void
}

/**
 * @spec SPEC-FR-9.1.2 - Карточка магазина экипировки
 * @spec SPEC-FR-9.1.3 - Mock-портал сайта магазина
 */
export function ShopCard({shop}: ShopCardProps) {
  const [portalOpen, setPortalOpen] = useState(false)

  return (
    <>
      <Card
        view="outlined"
        className="hockey-panel"
        data-testid={testId('shops', 'shop-card', 'card', shop.id)}
      >
        <div className="hockey-stack hockey-stack--gap-8">
          <div className="hockey-row hockey-row--gap-8 hockey-row--between">
            <Text
              variant="header-2"
              data-testid={testId('shops', 'shop-card', 'text', 'name', shop.id)}
            >
              {shop.name}
            </Text>
            <span data-testid={testId('shops', 'shop-card', 'badge', 'profile', shop.id)}>
              <EntityProfileBadge kind="shop" />
            </span>
          </div>
          {shop.city && (
            <Text
              color="secondary"
              data-testid={testId('shops', 'shop-card', 'text', 'city', shop.id)}
            >
              {shop.city}
            </Text>
          )}
          <Label size="s" data-testid={testId('shops', 'shop-card', 'badge', 'status', shop.id)}>
            {shop.partnerStatus}
          </Label>
          <Text
            color="secondary"
            data-testid={testId('shops', 'shop-card', 'text', 'categories', shop.id)}
          >
            {shop.categories.join(' · ')}
          </Text>
          <span data-testid={testId('shops', 'shop-card', 'badge', 'source', shop.id)}>
            <SourceMetaBadge sourceMeta={shop.sourceMeta} />
          </span>
          <Button
            view="outlined"
            data-testid={testId('shops', 'shop-card', 'btn', 'portal', shop.id)}
            onClick={(e) => {
              e.stopPropagation()
              setPortalOpen(true)
            }}
          >
            Сайт магазина (mock)
          </Button>
        </div>
      </Card>
      <MockShopPortalModal open={portalOpen} onClose={() => setPortalOpen(false)} shop={shop} />
    </>
  )
}
