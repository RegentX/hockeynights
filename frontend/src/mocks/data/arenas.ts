/**
 * SPEC-FR-6.1.1, SPEC-FR-6.2.1, SPEC-FR-6.3.1, SPEC-FR-6.3.2
 */

import type {Arena, CreateIceSlotPayload, IceSlot, UpdateIceSlotPayload} from '@/entities/arena'
import {arenaHasFreeSlots as hasFreeSlotsForArena} from '@/entities/arena/lib/arenaSlots'

const mockSource = {
  source: 'mock' as const,
  updatedAt: '2026-06-05T10:00:00Z',
  syncStatus: 'mock' as const,
}

const partnerSource = {
  source: 'partner_api' as const,
  updatedAt: '2026-06-05T11:30:00Z',
  syncStatus: 'synced' as const,
  sourceUrl: 'https://partner-ice.example.ru/api',
}

/** @spec SPEC-FR-6.1.1 - Mock арены Москвы */
export let mockArenas: Arena[] = [
  {
    id: 'arena-001',
    name: 'Ледовый дворец на Ходынке',
    city: 'Москва',
    address: 'Москва, Ходынский бульвар, 3',
    district: 'САО',
    metro: 'ЦСКА',
    latitude: 55.7901,
    longitude: 37.5342,
    amenities: ['parking', 'shower', 'skate_sharpening'],
    phone: '+7 (495) 000-00-01',
    websiteUrl: 'https://example-arena.ru',
    bookingUrl: 'https://example-arena.ru/booking',
    bookingMode: 'slot_calendar',
    priceRange: '12000-22000 RUB/час',
    sourceMeta: partnerSource,
    visible: true,
  },
  {
    id: 'arena-002',
    name: 'Каток «Лужники»',
    city: 'Москва',
    address: 'Москва, Лужники, 24',
    district: 'ЦАО',
    metro: 'Спортивная',
    latitude: 55.7158,
    longitude: 37.5536,
    amenities: ['parking', 'rental', 'cafe'],
    phone: '+7 (495) 000-00-02',
    websiteUrl: 'https://luzhniki.example.ru',
    bookingUrl: 'https://luzhniki.example.ru/book',
    bookingMode: 'external_portal',
    priceRange: '8000-15000 RUB/час',
    sourceMeta: mockSource,
    visible: true,
  },
  {
    id: 'arena-003',
    name: 'Ледовый комплекс «Мытищи Арена»',
    city: 'Мытищи',
    address: 'Мытищи, Олимпийский проспект, 46',
    district: 'Мытищи',
    metro: 'Медведково',
    latitude: 55.9102,
    longitude: 37.7365,
    amenities: ['parking', 'shower'],
    phone: '+7 (495) 000-00-03',
    bookingUrl: 'https://mytishchi.example.ru/book',
    bookingMode: 'slot_calendar',
    priceRange: '6000-12000 RUB/час',
    sourceMeta: mockSource,
    visible: true,
  },
  {
    id: 'arena-004',
    name: 'Открытый каток ВДНХ',
    city: 'Москва',
    address: 'Москва, проспект Мира, 119',
    district: 'СВАО',
    metro: 'ВДНХ',
    latitude: 55.8293,
    longitude: 37.6322,
    amenities: ['rental', 'cafe'],
    phone: '+7 (495) 000-00-04',
    websiteUrl: 'https://vdnh-rink.example.ru',
    bookingUrl: 'https://vdnh-rink.example.ru/reserve',
    bookingMode: 'external_portal',
    priceRange: '1500-3000 RUB/сеанс',
    sourceMeta: mockSource,
    visible: true,
  },
]

/**
 * @spec SPEC-FR-11.1.1 - Добавить арену
 */
export function addMockArena(arena: Arena): Arena {
  mockArenas = [...mockArenas, arena]
  return arena
}

/**
 * @spec SPEC-FR-11.1.2 - Скрыть арену
 */
export function setArenaVisibility(arenaId: string, visible: boolean): void {
  mockArenas = mockArenas.map((a) => (a.id === arenaId ? {...a, visible} : a))
}

/** HOCFRONT-32D — обновить поля арены */
export function updateMockArena(arenaId: string, patch: Partial<Arena>): Arena | undefined {
  const index = mockArenas.findIndex((a) => a.id === arenaId)
  if (index === -1) return undefined
  const next = {...mockArenas[index], ...patch}
  mockArenas = mockArenas.map((a, i) => (i === index ? next : a))
  return next
}

function createSeedIceSlots(): IceSlot[] {
  return [
    {
      id: 'slot-001',
      arenaId: 'arena-001',
      startsAt: '2026-06-06T19:00:00+03:00',
      endsAt: '2026-06-06T20:30:00+03:00',
      price: 15000,
      status: 'free',
      bookingUrl: 'https://example-arena.ru/booking/slot-001',
      sourceMeta: partnerSource,
    },
    {
      id: 'slot-002',
      arenaId: 'arena-001',
      startsAt: '2026-06-07T08:00:00+03:00',
      endsAt: '2026-06-07T09:30:00+03:00',
      price: 12000,
      status: 'booked',
      sourceMeta: partnerSource,
    },
    {
      id: 'slot-004',
      arenaId: 'arena-001',
      startsAt: '2026-06-06T22:00:00+03:00',
      endsAt: '2026-06-06T23:30:00+03:00',
      price: 14000,
      status: 'free',
      bookingUrl: 'https://example-arena.ru/booking/slot-004',
      sourceMeta: partnerSource,
    },
    {
      id: 'slot-005',
      arenaId: 'arena-001',
      startsAt: '2026-06-08T18:00:00+03:00',
      endsAt: '2026-06-08T19:30:00+03:00',
      price: 16000,
      status: 'free',
      bookingUrl: 'https://example-arena.ru/booking/slot-005',
      sourceMeta: partnerSource,
    },
    {
      id: 'slot-006',
      arenaId: 'arena-003',
      startsAt: '2026-06-06T21:00:00+03:00',
      endsAt: '2026-06-06T22:30:00+03:00',
      price: 9000,
      status: 'free',
      bookingUrl: 'https://mytishchi.example.ru/book/slot-006',
      sourceMeta: mockSource,
    },
    {
      id: 'slot-007',
      arenaId: 'arena-003',
      startsAt: '2026-06-07T07:00:00+03:00',
      endsAt: '2026-06-07T08:30:00+03:00',
      price: 7000,
      status: 'booked',
      sourceMeta: mockSource,
    },
    {
      id: 'slot-008',
      arenaId: 'arena-003',
      startsAt: '2026-06-09T20:00:00+03:00',
      endsAt: '2026-06-09T21:30:00+03:00',
      price: 8500,
      status: 'free',
      bookingUrl: 'https://mytishchi.example.ru/book/slot-008',
      sourceMeta: mockSource,
    },
  ]
}

/** @spec SPEC-FR-6.3.1 - Mock слоты льда */
export let mockIceSlots: IceSlot[] = createSeedIceSlots()

export function resetMockIceSlots(): void {
  mockIceSlots = createSeedIceSlots()
}

export function getMockIceSlots(arenaId?: string): IceSlot[] {
  const result = arenaId
    ? mockIceSlots.filter((slot) => slot.arenaId === arenaId)
    : [...mockIceSlots]
  return result.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** HOCFRONT-32 — создать слот расписания */
export function createMockIceSlot(payload: CreateIceSlotPayload): IceSlot {
  const slot: IceSlot = {
    id: `slot-${Date.now()}`,
    arenaId: payload.arenaId,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    price: payload.price,
    status: payload.status ?? 'free',
    bookingUrl: payload.bookingUrl,
    sourceMeta: {
      source: 'mock',
      updatedAt: new Date().toISOString(),
      syncStatus: 'mock',
    },
  }
  mockIceSlots = [...mockIceSlots, slot]
  return slot
}

/** HOCFRONT-32 — обновить слот расписания */
export function updateMockIceSlot(
  slotId: string,
  patch: UpdateIceSlotPayload,
): IceSlot | undefined {
  const index = mockIceSlots.findIndex((slot) => slot.id === slotId)
  if (index === -1) return undefined
  const current = mockIceSlots[index]
  const next: IceSlot = {
    ...current,
    ...patch,
    sourceMeta: {
      ...current.sourceMeta,
      updatedAt: new Date().toISOString(),
    },
  }
  mockIceSlots = mockIceSlots.map((slot, i) => (i === index ? next : slot))
  return next
}

/** @spec SPEC-FR-6.3.1 - Есть ли свободные слоты у арены */
export function arenaHasFreeSlots(arenaId: string): boolean {
  return hasFreeSlotsForArena(arenaId, mockIceSlots)
}
