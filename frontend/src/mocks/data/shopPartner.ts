/**
 * SPEC-FR-24.7.5, SPEC-FR-24.7.6, SPEC-FR-24.7.7, SPEC-FR-24.7.8
 */

import type {
  ShopAnalytics,
  ShopCatalogImportJob,
  ShopCatalogSyncState,
  ShopLead,
  ShopProductPayload,
  ShopPromo,
} from '@/entities/shop/types'
import {addMockShopProduct, mockProductOffers} from '@/mocks/data/shops'

export const mockShopCatalogState: Record<string, ShopCatalogSyncState> = {
  'shop-001': {
    shopId: 'shop-001',
    status: 'synced',
    productCount: 2,
    lastSyncedAt: '2026-06-10T08:00:00Z',
    source: 'manual',
  },
  'shop-002': {
    shopId: 'shop-002',
    status: 'stale',
    productCount: 1,
    lastSyncedAt: '2026-05-20T08:00:00Z',
    errorMessage: 'Feed устарел более 14 дней',
    source: 'feed',
  },
}

export let mockShopImportJobs: ShopCatalogImportJob[] = []

export const mockShopLeads: ShopLead[] = [
  {
    id: 'lead-001',
    shopId: 'shop-001',
    type: 'product_click',
    productId: 'offer-001',
    productTitle: 'Коньки Bauer Supreme',
    userPosition: 'forward',
    createdAt: '2026-06-18T11:00:00Z',
  },
  {
    id: 'lead-002',
    shopId: 'shop-001',
    type: 'checkout_intent',
    productId: 'offer-002',
    productTitle: 'Клюшка CCM Ribcor',
    userPosition: 'defense',
    createdAt: '2026-06-17T19:30:00Z',
  },
  {
    id: 'lead-003',
    shopId: 'shop-001',
    type: 'external_redirect',
    productTitle: 'Каталог Pro-Hockey',
    createdAt: '2026-06-16T09:15:00Z',
  },
]

export let mockShopPromos: ShopPromo[] = [
  {
    id: 'promo-001',
    shopId: 'shop-001',
    title: 'Комплект вратаря',
    subtitle: 'Краги + щитки со скидкой',
    discountPercent: 10,
    targetPositions: ['goalie'],
    active: true,
  },
  {
    id: 'promo-002',
    shopId: 'shop-003',
    title: 'Сезон вратаря',
    subtitle: 'Скидка на маски и щитки',
    discountPercent: 15,
    targetPositions: ['goalie'],
    active: true,
  },
]

export const mockShopAnalytics: Record<string, ShopAnalytics> = {
  'shop-001': {
    shopId: 'shop-001',
    profileViews: 890,
    productClicks: 214,
    checkoutIntents: 37,
    externalRedirects: 52,
    ctrPercent: 24.0,
    topCategory: 'коньки',
    topPosition: 'forward',
  },
}

const FEED_PREVIEW_PRODUCTS: ShopProductPayload[] = [
  {
    title: 'Шлем CCM Tacks',
    category: 'защита',
    price: 18900,
    availability: 'in_stock',
    externalUrl: 'https://prohockey.example.ru/ccm-tacks',
    recommendedPositions: ['forward', 'defense'],
  },
  {
    title: 'Коньки TRUE TF9',
    category: 'коньки',
    price: 52900,
    availability: 'in_stock',
    externalUrl: 'https://prohockey.example.ru/true-tf9',
    recommendedPositions: ['forward'],
  },
]

export function getMockShopCatalogState(shopId: string): ShopCatalogSyncState {
  return (
    mockShopCatalogState[shopId] ?? {
      shopId,
      status: 'mock',
      productCount: mockProductOffers.filter((p) => p.shopId === shopId).length,
      source: 'manual',
    }
  )
}

export function runMockShopCatalogImport(
  shopId: string,
  source: ShopCatalogImportJob['source'],
): ShopCatalogImportJob {
  const job: ShopCatalogImportJob = {
    id: `import-${Date.now()}`,
    shopId,
    source,
    status: source === 'csv' ? 'partial' : 'synced',
    importedCount: 0,
    startedAt: new Date().toISOString(),
  }

  if (source === 'feed' || source === 'api') {
    for (const product of FEED_PREVIEW_PRODUCTS) {
      addMockShopProduct(shopId, product)
      job.importedCount += 1
    }
    job.message = `Импортировано ${job.importedCount} позиций из partner ${source}`
  } else if (source === 'csv') {
    job.importedCount = 1
    addMockShopProduct(shopId, {
      title: 'Наколенники Bauer',
      category: 'защита',
      price: 7900,
      availability: 'unknown',
      externalUrl: 'https://prohockey.example.ru/bauer-knee',
    })
    job.message = 'CSV импорт частичный: 1 позиция без фото'
    job.status = 'partial'
  }

  job.finishedAt = new Date().toISOString()
  mockShopImportJobs = [job, ...mockShopImportJobs]

  const productCount = mockProductOffers.filter((p) => p.shopId === shopId).length
  mockShopCatalogState[shopId] = {
    shopId,
    status: job.status,
    productCount,
    lastSyncedAt: job.finishedAt,
    source,
    errorMessage: job.status === 'partial' ? job.message : undefined,
  }

  return job
}

export function getMockShopLeads(shopId: string): ShopLead[] {
  return mockShopLeads.filter((l) => l.shopId === shopId)
}

export function getMockShopAnalytics(shopId: string): ShopAnalytics {
  return (
    mockShopAnalytics[shopId] ?? {
      shopId,
      profileViews: 0,
      productClicks: 0,
      checkoutIntents: 0,
      externalRedirects: 0,
      ctrPercent: 0,
    }
  )
}

export function getMockShopPromos(shopId: string): ShopPromo[] {
  return mockShopPromos.filter((p) => p.shopId === shopId)
}

export function addMockShopPromo(
  shopId: string,
  payload: Omit<ShopPromo, 'id' | 'shopId'>,
): ShopPromo {
  const promo: ShopPromo = {id: `promo-${Date.now()}`, shopId, ...payload}
  mockShopPromos = [promo, ...mockShopPromos]
  return promo
}
