/**
 * SPEC-FR-9.1.1, SPEC-FR-9.1.2, SPEC-FR-9.2.1, SPEC-FR-9.2.2
 */

import type {
  ProductOffer,
  Shop,
  ShopAnalytics,
  ShopCatalogImportJob,
  ShopCatalogSyncState,
  ShopLead,
  ShopProductPayload,
  ShopPromo,
} from '@/entities/shop/types'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-9.1.1 - Список магазинов
 */
export function fetchShops(): Promise<Shop[]> {
  return apiRequest<Shop[]>('/shops')
}

/**
 * @spec SPEC-FR-9.2.1 - Список товарных предложений
 */
export function fetchProductOffers(shopId?: string): Promise<ProductOffer[]> {
  const query = shopId ? `?shopId=${shopId}` : ''
  return apiRequest<ProductOffer[]>(`/product-offers${query}`)
}

/** @spec SPEC-FR-24.7.3 - Обновить партнёрский профиль магазина */
export function updateShopPartnerProfile(shopId: string, patch: Partial<Shop>): Promise<Shop> {
  return apiRequest<Shop>(`/shops/${shopId}/profile`, {method: 'PATCH', body: patch})
}

/** @spec SPEC-FR-24.7.4 - Добавить товар */
export function createShopProduct(
  shopId: string,
  payload: ShopProductPayload,
): Promise<ProductOffer> {
  return apiRequest<ProductOffer>(`/shops/${shopId}/products`, {method: 'POST', body: payload})
}

/** @spec SPEC-FR-24.7.4 - Обновить товар */
export function updateShopProduct(
  shopId: string,
  productId: string,
  patch: Partial<ShopProductPayload>,
): Promise<ProductOffer> {
  return apiRequest<ProductOffer>(`/shops/${shopId}/products/${productId}`, {
    method: 'PATCH',
    body: patch,
  })
}

/** @spec SPEC-FR-24.7.5 - Состояние синхронизации каталога */
export function fetchShopCatalogState(shopId: string): Promise<ShopCatalogSyncState> {
  return apiRequest<ShopCatalogSyncState>(`/shops/${shopId}/catalog-state`)
}

/** @spec SPEC-FR-24.7.5 - Импорт каталога */
export function importShopCatalog(
  shopId: string,
  source: ShopCatalogImportJob['source'],
): Promise<ShopCatalogImportJob> {
  return apiRequest<ShopCatalogImportJob>(`/shops/${shopId}/catalog-import`, {
    method: 'POST',
    body: {source},
  })
}

/** @spec SPEC-FR-24.7.7 - Лиды магазина */
export function fetchShopLeads(shopId: string): Promise<ShopLead[]> {
  return apiRequest<ShopLead[]>(`/shops/${shopId}/leads`)
}

/** @spec SPEC-FR-24.7.8 - Аналитика магазина */
export function fetchShopAnalytics(shopId: string): Promise<ShopAnalytics> {
  return apiRequest<ShopAnalytics>(`/shops/${shopId}/analytics`)
}

/** @spec SPEC-FR-24.7.6 - Промо-подборки */
export function fetchShopPromos(shopId: string): Promise<ShopPromo[]> {
  return apiRequest<ShopPromo[]>(`/shops/${shopId}/promos`)
}

/** @spec SPEC-FR-24.7.6 - Создать промо */
export function createShopPromo(
  shopId: string,
  payload: Omit<ShopPromo, 'id' | 'shopId'>,
): Promise<ShopPromo> {
  return apiRequest<ShopPromo>(`/shops/${shopId}/promos`, {method: 'POST', body: payload})
}
