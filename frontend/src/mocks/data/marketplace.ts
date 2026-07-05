/**
 * SPEC-FR-9.3.1
 */

import type {
  MarketplaceFeedResponse,
  MarketplaceFilters,
  MarketplaceProductListing,
  Shop,
} from '@/entities/shop/types'
import {mockShopPromos} from '@/mocks/data/shopPartner'
import {mockProductOffers, mockShops} from '@/mocks/data/shops'

const TIER_WEIGHT: Record<NonNullable<Shop['adTier']>, number> = {
  premium: 300,
  boosted: 200,
  standard: 100,
}

function shopAdTier(shop: Shop): NonNullable<Shop['adTier']> {
  return shop.adTier ?? 'standard'
}

function shopAdPriority(shop: Shop): number {
  return shop.adPriority ?? 0
}

function isPromotedTier(tier: NonNullable<Shop['adTier']>): boolean {
  return tier === 'premium' || tier === 'boosted'
}

function activePromoForShop(shopId: string) {
  return mockShopPromos.find((promo) => promo.shopId === shopId && promo.active)
}

/** @spec SPEC-FR-9.3.1 - Сборка ленты маркетплейса */
export function buildMarketplaceFeed(filters: MarketplaceFilters = {}): MarketplaceFeedResponse {
  const visibleShops = mockShops.filter((shop) => shop.visible !== false)
  const shopMap = new Map(visibleShops.map((shop) => [shop.id, shop]))

  const publishedOffers = mockProductOffers.filter(
    (offer) =>
      shopMap.has(offer.shopId) &&
      (offer.moderationStatus === 'published' || !offer.moderationStatus),
  )

  const categories = [...new Set(publishedOffers.map((offer) => offer.category))].sort()

  const spotlightShops = visibleShops
    .filter((shop) => isPromotedTier(shopAdTier(shop)))
    .sort((a, b) => shopAdPriority(b) - shopAdPriority(a))
    .map((shop) => {
      const promo = activePromoForShop(shop.id)
      return {
        shop,
        promoTitle: promo?.title,
        promoDiscount: promo?.discountPercent,
      }
    })

  const query = filters.q?.trim().toLowerCase() ?? ''

  let listings: MarketplaceProductListing[] = publishedOffers.map((offer) => {
    const shop = shopMap.get(offer.shopId)!
    const tier = shopAdTier(shop)
    const promo = activePromoForShop(shop.id)
    return {
      offer,
      shopId: shop.id,
      shopName: shop.name,
      shopCity: shop.city,
      shopAdTier: tier,
      shopAdPriority: shopAdPriority(shop),
      isPromoted: isPromotedTier(tier),
      promoDiscount: promo?.discountPercent,
    }
  })

  if (query) {
    listings = listings.filter((item) => {
      const haystack = `${item.offer.title} ${item.offer.category} ${item.shopName}`.toLowerCase()
      return haystack.includes(query)
    })
  }

  if (filters.category) {
    listings = listings.filter((item) => item.offer.category === filters.category)
  }

  if (filters.shopId) {
    listings = listings.filter((item) => item.shopId === filters.shopId)
  }

  if (filters.inStockOnly) {
    listings = listings.filter((item) => item.offer.availability === 'in_stock')
  }

  if (filters.position) {
    listings = listings.filter((item) => {
      const positions = item.offer.recommendedPositions
      return (
        !positions?.length || positions.includes(filters.position!) || positions.includes('any')
      )
    })
  }

  const sort = filters.sort ?? 'recommended'
  listings.sort((a, b) => {
    if (sort === 'price_asc') return a.offer.price - b.offer.price
    if (sort === 'price_desc') return b.offer.price - a.offer.price

    const scoreA = TIER_WEIGHT[a.shopAdTier] + a.shopAdPriority
    const scoreB = TIER_WEIGHT[b.shopAdTier] + b.shopAdPriority
    if (scoreB !== scoreA) return scoreB - scoreA
    return a.offer.price - b.offer.price
  })

  return {spotlightShops, listings, categories}
}
