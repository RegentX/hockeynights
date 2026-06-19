/**
 * SPEC-FR-9.3.1
 */

import {Text} from '@gravity-ui/uikit'
import type {MarketplaceShopSpotlight} from '@/entities/shop/types'

export interface MarketplaceShopStripProps {
  shops: MarketplaceShopSpotlight[]
  activeShopId?: string
  onSelectShop: (shopId: string | undefined) => void
}

const TIER_COPY = {
  premium: 'Премиум',
  boosted: 'Продвижение',
  standard: '',
} as const

/** @spec SPEC-FR-9.3.1 - Полоса продвигаемых магазинов */
export function MarketplaceShopStrip({shops, activeShopId, onSelectShop}: MarketplaceShopStripProps) {
  if (shops.length === 0) return null

  return (
    <section className="marketplace-strip" aria-label="Продвигаемые магазины">
      <div className="marketplace-strip__header">
        <Text variant="subheader-2">Магазины в приоритете</Text>
        <Text color="secondary" variant="caption-1">
          Партнёры с платным размещением показываются первыми в ленте
        </Text>
      </div>
      <div className="marketplace-strip__scroll">
        <button
          type="button"
          className={`marketplace-strip__chip${!activeShopId ? ' is-active' : ''}`}
          onClick={() => onSelectShop(undefined)}
        >
          Все магазины
        </button>
        {shops.map(({shop, promoTitle, promoDiscount}) => {
          const tier = shop.adTier ?? 'standard'
          return (
            <button
              key={shop.id}
              type="button"
              className={`marketplace-strip__card marketplace-strip__card--${tier}${
                activeShopId === shop.id ? ' is-active' : ''
              }`}
              onClick={() => onSelectShop(shop.id)}
            >
              <span className="marketplace-strip__card-tier">{TIER_COPY[tier]}</span>
              <span className="marketplace-strip__card-name">{shop.name}</span>
              <span className="marketplace-strip__card-meta">
                {shop.city ?? 'Онлайн'} · {shop.categories.slice(0, 2).join(', ')}
              </span>
              {promoTitle && (
                <span className="marketplace-strip__card-promo">
                  {promoTitle}
                  {promoDiscount ? ` −${promoDiscount}%` : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
