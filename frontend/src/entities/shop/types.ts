/**
 * SPEC-FR-9.1.1, SPEC-FR-9.1.2, SPEC-FR-9.2.1, SPEC-FR-9.2.2, SPEC-FR-11.2.2
 */

import type {
  PartnerModerationStatus,
  PlayerPosition,
  SkillLevel,
  SourceMeta,
} from '@/entities/common/types'

/** @spec SPEC-FR-9.1.1 - Магазин экипировки */
export interface Shop {
  /** @spec SPEC-FR-9.1.1 */
  id: string
  /** @spec SPEC-FR-9.1.2 */
  name: string
  /** @spec SPEC-FR-9.1.2 */
  city?: string
  /** @spec SPEC-FR-9.1.2 */
  websiteUrl: string
  /** @spec SPEC-FR-9.1.2 */
  categories: string[]
  /** @spec SPEC-FR-9.1.2 */
  partnerStatus: 'mock' | 'partner' | 'external'
  /** @spec SPEC-FR-11.2.2 */
  sourceMeta: SourceMeta
  /** @spec SPEC-FR-11.1.2 */
  visible?: boolean
  /** @spec SPEC-FR-24.7.3 */
  description?: string
  /** @spec SPEC-FR-24.7.3 */
  contactEmail?: string
  /** @spec SPEC-FR-24.7.3 */
  contactPhone?: string
  /** @spec SPEC-FR-24.7.3 */
  deliveryInfo?: string
  /** @spec SPEC-FR-24.7.3 */
  pickupInfo?: string
  /** @spec SPEC-FR-24.7.9 */
  moderationStatus?: PartnerModerationStatus
  /** @spec SPEC-FR-9.3.1 - Тариф продвижения в ленте маркетплейса */
  adTier?: 'premium' | 'boosted' | 'standard'
  /** @spec SPEC-FR-9.3.1 - Приоритет внутри тарифа */
  adPriority?: number
}
export interface ProductOffer {
  /** @spec SPEC-FR-9.2.1 */
  id: string
  /** @spec SPEC-FR-9.2.1 */
  shopId: string
  /** @spec SPEC-FR-9.2.1 */
  title: string
  /** @spec SPEC-FR-9.2.1 */
  category: string
  /** @spec SPEC-FR-9.2.1 */
  price: number
  /** @spec SPEC-FR-9.2.1 */
  currency: 'RUB'
  /** @spec SPEC-FR-9.2.1 */
  availability: 'in_stock' | 'out_of_stock' | 'unknown'
  /** @spec SPEC-FR-9.2.2 */
  externalUrl: string
  /** @spec SPEC-FR-24.7.4 */
  recommendedPositions?: PlayerPosition[]
  /** @spec SPEC-FR-24.7.4 */
  recommendedLevels?: SkillLevel[]
  /** @spec SPEC-FR-24.7.4 */
  imageUrl?: string
  /** @spec SPEC-FR-24.7.9 */
  moderationStatus?: PartnerModerationStatus
}

/** @spec SPEC-FR-24.7.4 - Payload создания/редактирования товара */
export interface ShopProductPayload {
  title: string
  category: string
  price: number
  currency?: 'RUB'
  availability: ProductOffer['availability']
  externalUrl: string
  recommendedPositions?: PlayerPosition[]
  recommendedLevels?: SkillLevel[]
  imageUrl?: string
}

/** @spec SPEC-FR-20.1.2 - Состояние синхронизации каталога */
export type CatalogSyncStatus = 'synced' | 'stale' | 'partial' | 'failed' | 'mock'

/** @spec SPEC-FR-24.7.5 - Статус partner-каталога */
export interface ShopCatalogSyncState {
  shopId: string
  status: CatalogSyncStatus
  productCount: number
  lastSyncedAt?: string
  errorMessage?: string
  source: 'manual' | 'feed' | 'api' | 'csv'
}

/** @spec SPEC-FR-24.7.5 - Задача импорта каталога */
export interface ShopCatalogImportJob {
  id: string
  shopId: string
  source: 'feed' | 'api' | 'csv'
  status: CatalogSyncStatus
  importedCount: number
  startedAt: string
  finishedAt?: string
  message?: string
}

/** @spec SPEC-FR-24.7.7 - Лид магазина */
export interface ShopLead {
  id: string
  shopId: string
  type: 'product_click' | 'checkout_intent' | 'external_redirect' | 'save'
  productId?: string
  productTitle?: string
  userPosition?: PlayerPosition
  createdAt: string
}

/** @spec SPEC-FR-24.7.8 - Аналитика магазина */
export interface ShopAnalytics {
  shopId: string
  profileViews: number
  productClicks: number
  checkoutIntents: number
  externalRedirects: number
  ctrPercent: number
  topCategory?: string
  topPosition?: PlayerPosition
}

/** @spec SPEC-FR-24.7.6 - Промо-подборка магазина */
export interface ShopPromo {
  id: string
  shopId: string
  title: string
  subtitle?: string
  discountPercent?: number
  targetPositions?: PlayerPosition[]
  active: boolean
}

/** @spec SPEC-FR-9.3.1 - Сортировка ленты маркетплейса */
export type MarketplaceSort = 'recommended' | 'price_asc' | 'price_desc'

/** @spec SPEC-FR-9.3.1 - Фильтры маркетплейса */
export interface MarketplaceFilters {
  q?: string
  category?: string
  shopId?: string
  inStockOnly?: boolean
  position?: PlayerPosition
  sort?: MarketplaceSort
}

/** @spec SPEC-FR-9.3.1 - Продвигаемый магазин в полосе ленты */
export interface MarketplaceShopSpotlight {
  shop: Shop
  promoTitle?: string
  promoDiscount?: number
}

/** @spec SPEC-FR-9.3.1 - Товар в ленте с контекстом магазина */
export interface MarketplaceProductListing {
  offer: ProductOffer
  shopId: string
  shopName: string
  shopCity?: string
  shopAdTier: NonNullable<Shop['adTier']>
  shopAdPriority: number
  isPromoted: boolean
  promoDiscount?: number
}

/** @spec SPEC-FR-9.3.1 - Ответ ленты маркетплейса */
export interface MarketplaceFeedResponse {
  spotlightShops: MarketplaceShopSpotlight[]
  listings: MarketplaceProductListing[]
  categories: string[]
}
