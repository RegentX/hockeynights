/**
 * SPEC-FR-9.1.1, SPEC-FR-9.1.2, SPEC-FR-9.2.1, SPEC-FR-9.2.2
 */

import {http, HttpResponse} from 'msw'

import type {ShopProductPayload, ShopPromo} from '@/entities/shop'
import {buildMarketplaceFeed} from '@/mocks/data/marketplace'
import {canManagePartnerEntity} from '@/mocks/data/partners'
import {
  addMockShopPromo,
  getMockShopAnalytics,
  getMockShopCatalogState,
  getMockShopLeads,
  getMockShopPromos,
  runMockShopCatalogImport,
} from '@/mocks/data/shopPartner'
import {
  addMockShopProduct,
  mockProductOffers,
  mockShops,
  updateMockShopProduct,
  updateMockShopProfile,
} from '@/mocks/data/shops'

/** @spec SPEC-FR-9.1.1 - Handlers магазинов и предложений */
export const shopHandlers = [
  http.get('/mock-api/v1/marketplace', ({request}) => {
    const url = new URL(request.url)
    const filters = {
      q: url.searchParams.get('q') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      shopId: url.searchParams.get('shopId') ?? undefined,
      inStockOnly: url.searchParams.get('inStockOnly') === '1',
      position:
        (url.searchParams.get('position') as import('@/entities/common').PlayerPosition) ??
        undefined,
      sort:
        (url.searchParams.get('sort') as import('@/entities/shop').MarketplaceSort) ?? undefined,
    }
    return HttpResponse.json(buildMarketplaceFeed(filters))
  }),

  http.get('/mock-api/v1/shops', () => {
    const visible = mockShops.filter((s) => s.visible !== false)
    return HttpResponse.json(visible)
  }),

  http.get('/mock-api/v1/product-offers', ({request}) => {
    const url = new URL(request.url)
    const shopId = url.searchParams.get('shopId')
    let offers = mockProductOffers
    if (shopId) {
      offers = offers.filter((o) => o.shopId === shopId)
      if (!canManagePartnerEntity('shop', shopId)) {
        offers = offers.filter((o) => o.moderationStatus === 'published' || !o.moderationStatus)
      }
    } else {
      offers = offers.filter((o) => o.moderationStatus === 'published' || !o.moderationStatus)
    }
    return HttpResponse.json(offers)
  }),

  http.patch('/mock-api/v1/shops/:shopId/profile', async ({params, request}) => {
    const shopId = params.shopId as string
    if (!canManagePartnerEntity('shop', shopId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра магазина'}, {status: 403})
    }
    const body = (await request.json()) as Partial<(typeof mockShops)[number]>
    const updated = updateMockShopProfile(shopId, body)
    if (!updated) {
      return HttpResponse.json({message: 'Shop not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.post('/mock-api/v1/shops/:shopId/products', async ({params, request}) => {
    const shopId = params.shopId as string
    if (!canManagePartnerEntity('shop', shopId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра магазина'}, {status: 403})
    }
    const body = (await request.json()) as ShopProductPayload
    const product = addMockShopProduct(shopId, body)
    return HttpResponse.json(product)
  }),

  http.patch('/mock-api/v1/shops/:shopId/products/:productId', async ({params, request}) => {
    const shopId = params.shopId as string
    const productId = params.productId as string
    if (!canManagePartnerEntity('shop', shopId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра магазина'}, {status: 403})
    }
    const body = (await request.json()) as Partial<ShopProductPayload>
    const updated = updateMockShopProduct(shopId, productId, body)
    if (!updated) {
      return HttpResponse.json({message: 'Product not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/shops/:shopId/catalog-state', ({params}) => {
    const shopId = params.shopId as string
    return HttpResponse.json(getMockShopCatalogState(shopId))
  }),

  http.post('/mock-api/v1/shops/:shopId/catalog-import', async ({params, request}) => {
    const shopId = params.shopId as string
    if (!canManagePartnerEntity('shop', shopId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра магазина'}, {status: 403})
    }
    const body = (await request.json()) as {source: 'feed' | 'api' | 'csv'}
    const job = runMockShopCatalogImport(shopId, body.source)
    return HttpResponse.json(job)
  }),

  http.get('/mock-api/v1/shops/:shopId/leads', ({params}) => {
    const shopId = params.shopId as string
    if (!canManagePartnerEntity('shop', shopId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра магазина'}, {status: 403})
    }
    return HttpResponse.json(getMockShopLeads(shopId))
  }),

  http.get('/mock-api/v1/shops/:shopId/analytics', ({params}) => {
    const shopId = params.shopId as string
    if (!canManagePartnerEntity('shop', shopId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра магазина'}, {status: 403})
    }
    return HttpResponse.json(getMockShopAnalytics(shopId))
  }),

  http.get('/mock-api/v1/shops/:shopId/promos', ({params}) => {
    const shopId = params.shopId as string
    return HttpResponse.json(getMockShopPromos(shopId))
  }),

  http.post('/mock-api/v1/shops/:shopId/promos', async ({params, request}) => {
    const shopId = params.shopId as string
    if (!canManagePartnerEntity('shop', shopId)) {
      return HttpResponse.json({message: 'Недостаточно прав партнёра магазина'}, {status: 403})
    }
    const body = (await request.json()) as Omit<ShopPromo, 'id' | 'shopId'>
    const promo = addMockShopPromo(shopId, body)
    return HttpResponse.json(promo)
  }),
]
