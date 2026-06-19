/**
 * SPEC-FR-9.3.1
 */

import {useState} from 'react'
import {Text} from '@gravity-ui/uikit'
import type {MarketplaceProductListing} from '@/entities/shop/types'
import {ExternalProductLink} from '@/features/shops/ExternalProductLink'

const TIER_LABELS = {
  premium: 'Топ',
  boosted: 'Реклама',
  standard: '',
} as const

export interface MarketplaceProductCardProps {
  listing: MarketplaceProductListing
}

/** @spec SPEC-FR-9.3.1 - Карточка товара в ленте маркетплейса */
export function MarketplaceProductCard({listing}: MarketplaceProductCardProps) {
  const {offer, shopName, shopAdTier, isPromoted, promoDiscount} = listing
  const [imgError, setImgError] = useState(false)
  const tierLabel = TIER_LABELS[shopAdTier]
  const showDiscount = promoDiscount && promoDiscount > 0
  const discountedPrice = showDiscount
    ? Math.round(offer.price * (1 - promoDiscount / 100))
    : offer.price

  return (
    <article
      className={`marketplace-card${isPromoted ? ` marketplace-card--${shopAdTier}` : ''}`}
    >
      <div className="marketplace-card__media">
        {offer.imageUrl && !imgError ? (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="marketplace-card__image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="marketplace-card__placeholder" aria-hidden>
            🏒
          </div>
        )}
        <div className="marketplace-card__badges">
          {tierLabel && <span className="marketplace-card__badge marketplace-card__badge--tier">{tierLabel}</span>}
          {showDiscount && (
            <span className="marketplace-card__badge marketplace-card__badge--sale">−{promoDiscount}%</span>
          )}
          {offer.availability === 'in_stock' && (
            <span className="marketplace-card__badge marketplace-card__badge--stock">В наличии</span>
          )}
        </div>
      </div>

      <div className="marketplace-card__body">
        <div className="marketplace-card__price-row">
          <Text variant="subheader-2" className="marketplace-card__price">
            {discountedPrice.toLocaleString('ru-RU')} ₽
          </Text>
          {showDiscount && (
            <Text color="secondary" className="marketplace-card__price-old">
              {offer.price.toLocaleString('ru-RU')} ₽
            </Text>
          )}
        </div>
        <Text className="marketplace-card__title">{offer.title}</Text>
        <Text color="secondary" variant="caption-1" className="marketplace-card__meta">
          {shopName} · {offer.category}
        </Text>
        <div className="marketplace-card__action">
          <ExternalProductLink offer={offer} shopName={shopName} compact />
        </div>
      </div>
    </article>
  )
}
