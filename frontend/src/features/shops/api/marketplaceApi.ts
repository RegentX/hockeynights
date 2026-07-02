/**
 * SPEC-FR-9.3.1
 */

import type {MarketplaceFeedResponse, MarketplaceFilters} from '@/entities/shop/types'
import {apiRequest} from '@/shared/api/client'

function toQuery(filters: MarketplaceFilters): string {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.shopId) params.set('shopId', filters.shopId)
  if (filters.inStockOnly) params.set('inStockOnly', '1')
  if (filters.position) params.set('position', filters.position)
  if (filters.sort) params.set('sort', filters.sort)
  const query = params.toString()
  return query ? `?${query}` : ''
}

/** @spec SPEC-FR-9.3.1 - Лента маркетплейса с фильтрами */
export function fetchMarketplaceFeed(
  filters: MarketplaceFilters = {},
): Promise<MarketplaceFeedResponse> {
  return apiRequest<MarketplaceFeedResponse>(`/marketplace${toQuery(filters)}`)
}
