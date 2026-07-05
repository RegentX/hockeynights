/**
 * SPEC-FR-11.1.1, SPEC-FR-11.1.2, SPEC-FR-11.2.1, SPEC-FR-11.2.2
 */

import type {AdminEntityType, SourceStatusItem} from '@/entities/admin/types'
import type {Arena} from '@/entities/arena/types'
import type {League} from '@/entities/league/types'
import type {Shop} from '@/entities/shop/types'
import {addMockArena, mockArenas, setArenaVisibility} from '@/mocks/data/arenas'
import {addMockLeague, mockLeagues, setLeagueVisibility} from '@/mocks/data/leagues'
import {addMockShop, mockShops, setShopVisibility} from '@/mocks/data/shops'

const mockSource = {
  source: 'manual' as const,
  updatedAt: new Date().toISOString(),
  syncStatus: 'manual' as const,
}

/**
 * @spec SPEC-FR-11.2.1 - Список статусов источников
 */
export function getSourceStatuses(): SourceStatusItem[] {
  const arenaItems: SourceStatusItem[] = mockArenas.map((a) => ({
    entityType: 'arena',
    entityId: a.id,
    entityName: a.name,
    sourceMeta: a.sourceMeta,
    visible: a.visible !== false,
  }))
  const leagueItems: SourceStatusItem[] = mockLeagues.map((l) => ({
    entityType: 'league',
    entityId: l.id,
    entityName: l.name,
    sourceMeta: l.sourceMeta,
    visible: l.visible !== false,
  }))
  const shopItems: SourceStatusItem[] = mockShops.map((s) => ({
    entityType: 'shop',
    entityId: s.id,
    entityName: s.name,
    sourceMeta: s.sourceMeta,
    visible: s.visible !== false,
  }))
  return [...arenaItems, ...leagueItems, ...shopItems]
}

/**
 * @spec SPEC-FR-11.1.1 - Создать арену
 */
export function createAdminArena(payload: {
  name: string
  city?: string
  websiteUrl?: string
}): Arena {
  const arena = addMockArena({
    id: `arena-${Date.now()}`,
    name: payload.name,
    city: payload.city ?? 'Москва',
    address: `${payload.city ?? 'Москва'}, адрес уточняется`,
    district: 'САО',
    bookingMode: 'external_portal',
    latitude: 55.75,
    longitude: 37.62,
    amenities: [],
    websiteUrl: payload.websiteUrl,
    sourceMeta: mockSource,
    visible: true,
  })
  return arena
}

/**
 * @spec SPEC-FR-11.1.1 - Создать лигу
 */
export function createAdminLeague(payload: {
  name: string
  city?: string
  websiteUrl?: string
}): League {
  return addMockLeague({
    id: `league-${Date.now()}`,
    name: payload.name,
    region: payload.city ?? 'Москва',
    websiteUrl: payload.websiteUrl,
    integrationStatus: 'manual',
    sourceMeta: mockSource,
    visible: true,
  })
}

/**
 * @spec SPEC-FR-11.1.1 - Создать магазин
 */
export function createAdminShop(payload: {name: string; city?: string; websiteUrl?: string}): Shop {
  return addMockShop({
    id: `shop-${Date.now()}`,
    name: payload.name,
    city: payload.city ?? 'Москва',
    websiteUrl: payload.websiteUrl ?? 'https://example.ru',
    categories: [],
    partnerStatus: 'mock',
    sourceMeta: mockSource,
    visible: true,
  })
}

/**
 * @spec SPEC-FR-11.1.2 - Изменить видимость
 */
export function setEntityVisibility(
  entityId: string,
  entityType: AdminEntityType,
  visible: boolean,
): boolean {
  if (entityType === 'arena') {
    setArenaVisibility(entityId, visible)
    return mockArenas.some((a) => a.id === entityId)
  }
  if (entityType === 'league') {
    setLeagueVisibility(entityId, visible)
    return mockLeagues.some((l) => l.id === entityId)
  }
  setShopVisibility(entityId, visible)
  return mockShops.some((s) => s.id === entityId)
}
