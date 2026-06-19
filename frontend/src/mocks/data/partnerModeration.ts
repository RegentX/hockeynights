/**
 * SPEC-FR-24.7.9
 */

import type {PartnerModerationItem, PartnerModerationKind} from '@/entities/admin/types'
import type {PartnerModerationStatus} from '@/entities/common/types'
import {mockLeagues} from '@/mocks/data/leagues'
import {mockProductOffers, mockShops} from '@/mocks/data/shops'

function itemId(kind: PartnerModerationKind, entityId: string): string {
  return `${kind}:${entityId}`
}

/** @spec SPEC-FR-24.7.9 - Очередь модерации партнёрского контента */
export function getPartnerModerationQueue(): PartnerModerationItem[] {
  const items: PartnerModerationItem[] = []

  for (const league of mockLeagues) {
    if (league.moderationStatus === 'pending_review') {
      items.push({
        id: itemId('league_profile', league.id),
        kind: 'league_profile',
        entityId: league.id,
        title: league.name,
        subtitle: 'Профиль лиги',
        moderationStatus: league.moderationStatus,
        submittedAt: league.sourceMeta.updatedAt,
      })
    }
  }

  for (const shop of mockShops) {
    if (shop.moderationStatus === 'pending_review') {
      items.push({
        id: itemId('shop_profile', shop.id),
        kind: 'shop_profile',
        entityId: shop.id,
        title: shop.name,
        subtitle: 'Профиль магазина',
        moderationStatus: shop.moderationStatus,
        submittedAt: shop.sourceMeta.updatedAt,
      })
    }
  }

  for (const product of mockProductOffers) {
    if (product.moderationStatus === 'pending_review') {
      const shop = mockShops.find((s) => s.id === product.shopId)
      items.push({
        id: itemId('shop_product', product.id),
        kind: 'shop_product',
        entityId: product.id,
        parentId: product.shopId,
        title: product.title,
        subtitle: shop ? `Товар · ${shop.name}` : 'Товар магазина',
        moderationStatus: product.moderationStatus,
        submittedAt: new Date().toISOString(),
      })
    }
  }

  return items
}

/** @spec SPEC-FR-24.7.9 - Решение по модерации */
export function moderatePartnerContent(
  kind: PartnerModerationKind,
  entityId: string,
  status: PartnerModerationStatus,
): PartnerModerationItem | undefined {
  if (kind === 'league_profile') {
    const league = mockLeagues.find((l) => l.id === entityId)
    if (!league) return undefined
    league.moderationStatus = status
    league.sourceMeta = {...league.sourceMeta, updatedAt: new Date().toISOString()}
    return {
      id: itemId(kind, entityId),
      kind,
      entityId,
      title: league.name,
      subtitle: 'Профиль лиги',
      moderationStatus: status,
      submittedAt: league.sourceMeta.updatedAt,
    }
  }

  if (kind === 'shop_profile') {
    const shop = mockShops.find((s) => s.id === entityId)
    if (!shop) return undefined
    shop.moderationStatus = status
    shop.sourceMeta = {...shop.sourceMeta, updatedAt: new Date().toISOString()}
    return {
      id: itemId(kind, entityId),
      kind,
      entityId,
      title: shop.name,
      subtitle: 'Профиль магазина',
      moderationStatus: status,
      submittedAt: shop.sourceMeta.updatedAt,
    }
  }

  const product = mockProductOffers.find((p) => p.id === entityId)
  if (!product) return undefined
  product.moderationStatus = status
  const shop = mockShops.find((s) => s.id === product.shopId)
  return {
    id: itemId(kind, entityId),
    kind,
    entityId,
    parentId: product.shopId,
    title: product.title,
    subtitle: shop ? `Товар · ${shop.name}` : 'Товар магазина',
    moderationStatus: status,
    submittedAt: new Date().toISOString(),
  }
}
