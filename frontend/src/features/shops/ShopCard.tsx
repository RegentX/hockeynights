/**
 * SPEC-FR-9.1.1, SPEC-FR-9.1.2, SPEC-FR-9.1.3, SPEC-FR-11.2.2
 */

import {useState} from 'react'
import {Button, Card, Label, Text} from '@gravity-ui/uikit'
import type {Shop} from '@/entities/shop/types'
import {MockShopPortalModal} from '@/features/shops/MockShopPortalModal'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'

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
      <Card view="outlined" className="hockey-panel">
        <div className="hockey-stack hockey-stack--gap-8">
          <div className="hockey-row hockey-row--gap-8 hockey-row--between">
            <Text variant="subheader-2">{shop.name}</Text>
            <EntityProfileBadge kind="shop" />
          </div>
          {shop.city && <Text color="secondary">{shop.city}</Text>}
          <Label size="s">{shop.partnerStatus}</Label>
          <Text color="secondary">{shop.categories.join(' · ')}</Text>
          <SourceMetaBadge sourceMeta={shop.sourceMeta} />
          <Button
            view="outlined"
            onClick={(e) => {
              e.stopPropagation()
              setPortalOpen(true)
            }}
          >
            Сайт магазина (mock)
          </Button>
        </div>
      </Card>
      <MockShopPortalModal
        open={portalOpen}
        onClose={() => setPortalOpen(false)}
        shop={shop}
      />
    </>
  )
}
