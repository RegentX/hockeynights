/**
 * SPEC-FR-9.1.1, SPEC-FR-9.1.2, SPEC-FR-9.2.1, SPEC-FR-9.2.2
 */

import type {ProductOffer, Shop, ShopProductPayload} from '@/entities/shop/types'

const mockSource = {
  source: 'mock' as const,
  updatedAt: '2026-06-05T12:00:00Z',
  syncStatus: 'mock' as const,
}

/** @spec SPEC-FR-9.1.1 - Mock магазины */
export let mockShops: Shop[] = [
  {
    id: 'shop-001',
    name: 'Pro-Hockey Москва',
    city: 'Москва',
    websiteUrl: 'https://prohockey.example.ru',
    categories: ['коньки', 'клюшки', 'защита'],
    partnerStatus: 'partner',
    sourceMeta: mockSource,
    visible: true,
    description:
      'Официальный партнёр HockeyNights: коньки, клюшки и защита для любителей и продвинутых игроков.',
    contactEmail: 'partner@prohockey.example.ru',
    contactPhone: '+7 495 000-00-01',
    deliveryInfo: 'Доставка по Москве и МО, 1–2 дня',
    pickupInfo: 'Самовывоз: м. Динамо',
    moderationStatus: 'published',
    adTier: 'premium',
    adPriority: 100,
  },
  {
    id: 'shop-002',
    name: 'IceGear',
    city: 'Москва',
    websiteUrl: 'https://icegear.example.ru',
    categories: ['форма', 'аксессуары', 'вратарская'],
    partnerStatus: 'external',
    sourceMeta: mockSource,
    visible: true,
    adTier: 'standard',
    adPriority: 10,
  },
  {
    id: 'shop-003',
    name: 'Goalie Pro',
    city: 'Москва',
    websiteUrl: 'https://goaliepro.example.ru',
    categories: ['вратарская', 'защита', 'аксессуары'],
    partnerStatus: 'partner',
    sourceMeta: mockSource,
    visible: true,
    description: 'Специализация на вратарской экипировке и сервисе.',
    moderationStatus: 'published',
    adTier: 'boosted',
    adPriority: 60,
  },
]

/** @spec SPEC-FR-9.2.1 - Mock товары */
export const mockProductOffers: ProductOffer[] = [
  {
    id: 'offer-001',
    shopId: 'shop-001',
    title: 'Коньки Bauer Supreme',
    category: 'коньки',
    price: 45900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://prohockey.example.ru/bauer-supreme',
    recommendedPositions: ['forward', 'defense'],
    recommendedLevels: ['amateur', 'advanced'],
    imageUrl: 'https://placehold.co/400x400/png?text=Bauer',
    moderationStatus: 'published',
  },
  {
    id: 'offer-pending-001',
    shopId: 'shop-001',
    title: 'Шлем CCM Tacks (на модерации)',
    category: 'защита',
    price: 18900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://prohockey.example.ru/ccm-tacks-helmet',
    recommendedPositions: ['forward', 'defense', 'goalie'],
    imageUrl: 'https://placehold.co/120x120/png?text=CCM',
    moderationStatus: 'pending_review',
  },
  {
    id: 'offer-002',
    shopId: 'shop-001',
    title: 'Клюшка CCM Ribcor',
    category: 'клюшки',
    price: 12900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://prohockey.example.ru/ccm-ribcor',
    recommendedPositions: ['forward'],
    recommendedLevels: ['beginner', 'amateur'],
    imageUrl: 'https://placehold.co/400x400/png?text=Ribcor',
    moderationStatus: 'published',
  },
  {
    id: 'offer-004',
    shopId: 'shop-001',
    title: 'Нагрудник Bauer Pro',
    category: 'защита',
    price: 21900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://prohockey.example.ru/bauer-pro-shoulder',
    recommendedPositions: ['forward', 'defense'],
    imageUrl: 'https://placehold.co/400x400/png?text=Shoulder',
    moderationStatus: 'published',
  },
  {
    id: 'offer-005',
    shopId: 'shop-001',
    title: 'Коньки TRUE TF9',
    category: 'коньки',
    price: 38900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://prohockey.example.ru/true-tf9',
    recommendedPositions: ['forward', 'defense'],
    imageUrl: 'https://placehold.co/400x400/png?text=TRUE',
    moderationStatus: 'published',
  },
  {
    id: 'offer-006',
    shopId: 'shop-002',
    title: 'Джерси команды на заказ',
    category: 'форма',
    price: 4500,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://icegear.example.ru/custom-jersey',
    recommendedPositions: ['forward', 'defense', 'goalie'],
    imageUrl: 'https://placehold.co/400x400/png?text=Jersey',
    moderationStatus: 'published',
  },
  {
    id: 'offer-003',
    shopId: 'shop-002',
    title: 'Вратарские краги Vaughn',
    category: 'вратарская',
    price: 28900,
    currency: 'RUB',
    availability: 'out_of_stock',
    externalUrl: 'https://icegear.example.ru/vaughn-gloves',
    recommendedPositions: ['goalie'],
    imageUrl: 'https://placehold.co/400x400/png?text=Vaughn',
    moderationStatus: 'published',
  },
  {
    id: 'offer-007',
    shopId: 'shop-003',
    title: 'Щитки вратаря Brians',
    category: 'вратарская',
    price: 34900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://goaliepro.example.ru/brians-pads',
    recommendedPositions: ['goalie'],
    recommendedLevels: ['advanced', 'league'],
    imageUrl: 'https://placehold.co/400x400/png?text=Pads',
    moderationStatus: 'published',
  },
  {
    id: 'offer-008',
    shopId: 'shop-003',
    title: 'Маска CCM Axis',
    category: 'вратарская',
    price: 52900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://goaliepro.example.ru/ccm-axis',
    recommendedPositions: ['goalie'],
    imageUrl: 'https://placehold.co/400x400/png?text=Mask',
    moderationStatus: 'published',
  },
  {
    id: 'offer-009',
    shopId: 'shop-003',
    title: 'Клюшка вратаря Bauer',
    category: 'клюшки',
    price: 9900,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://goaliepro.example.ru/bauer-goalie-stick',
    recommendedPositions: ['goalie'],
    imageUrl: 'https://placehold.co/400x400/png?text=Goalie+Stick',
    moderationStatus: 'published',
  },
  {
    id: 'offer-010',
    shopId: 'shop-002',
    title: 'Шнурки воскованные Pro',
    category: 'аксессуары',
    price: 890,
    currency: 'RUB',
    availability: 'in_stock',
    externalUrl: 'https://icegear.example.ru/laces',
    imageUrl: 'https://placehold.co/400x400/png?text=Laces',
    moderationStatus: 'published',
  },
]

/**
 * @spec SPEC-FR-11.1.1 - Добавить магазин
 */
export function addMockShop(shop: Shop): Shop {
  mockShops = [...mockShops, shop]
  return shop
}

/**
 * @spec SPEC-FR-11.1.2 - Скрыть магазин
 */
export function setShopVisibility(shopId: string, visible: boolean): void {
  mockShops = mockShops.map((s) => (s.id === shopId ? {...s, visible} : s))
}

/** @spec SPEC-FR-24.7.3 - Обновить партнёрский профиль магазина */
export function updateMockShopProfile(shopId: string, patch: Partial<Shop>): Shop | undefined {
  const index = mockShops.findIndex((s) => s.id === shopId)
  if (index === -1) return undefined
  mockShops[index] = {
    ...mockShops[index],
    ...patch,
    moderationStatus: patch.moderationStatus ?? 'pending_review',
    sourceMeta: {
      ...mockShops[index].sourceMeta,
      updatedAt: new Date().toISOString(),
      syncStatus: 'manual',
    },
  }
  return mockShops[index]
}

/** @spec SPEC-FR-24.7.4 - Добавить товар магазина */
export function addMockShopProduct(shopId: string, payload: ShopProductPayload): ProductOffer {
  const product: ProductOffer = {
    id: `offer-${Date.now()}`,
    shopId,
    currency: 'RUB',
    moderationStatus: 'pending_review',
    ...payload,
  }
  mockProductOffers.unshift(product)
  return product
}

/** @spec SPEC-FR-24.7.4 - Обновить товар магазина */
export function updateMockShopProduct(
  shopId: string,
  productId: string,
  patch: Partial<ShopProductPayload>,
): ProductOffer | undefined {
  const index = mockProductOffers.findIndex((p) => p.shopId === shopId && p.id === productId)
  if (index === -1) return undefined
  mockProductOffers[index] = {
    ...mockProductOffers[index],
    ...patch,
    moderationStatus: 'pending_review',
  }
  return mockProductOffers[index]
}
