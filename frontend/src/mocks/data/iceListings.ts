/**
 * HOCFRONT-32B — mock объявления льда
 */

import type {CreateIceListingPayload, IceListing, UpdateIceListingPayload} from '@/entities/arena'
import {mockUser} from '@/mocks/data/session'

function createSeedListings(): IceListing[] {
  return [
    {
      id: 'listing-001',
      arenaId: 'arena-001',
      ownerUserId: 'user-arena-001',
      title: 'Свободный лёд вечер пятницы',
      startsAt: '2026-08-15T20:00:00+03:00',
      endsAt: '2026-08-15T21:30:00+03:00',
      priceRub: 16000,
      contactPhone: '+7 (495) 000-00-01',
      contactNote: 'Пишите в WhatsApp',
      status: 'published',
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-01T10:00:00Z',
    },
    {
      id: 'listing-002',
      arenaId: 'arena-001',
      ownerUserId: 'user-arena-001',
      title: 'Черновик: утренний лёд',
      startsAt: '2026-08-20T08:00:00+03:00',
      endsAt: '2026-08-20T09:00:00+03:00',
      priceRub: 12000,
      status: 'draft',
      createdAt: '2026-08-02T10:00:00Z',
      updatedAt: '2026-08-02T10:00:00Z',
    },
    {
      id: 'listing-003',
      arenaId: 'arena-003',
      ownerUserId: 'user-001',
      title: 'Мытищи — слот на выходные',
      startsAt: '2026-08-16T18:00:00+03:00',
      endsAt: '2026-08-16T19:30:00+03:00',
      priceRub: 9000,
      contactPhone: '+7 (495) 000-00-03',
      status: 'published',
      createdAt: '2026-08-03T10:00:00Z',
      updatedAt: '2026-08-03T10:00:00Z',
    },
  ]
}

export let mockIceListings: IceListing[] = createSeedListings()

export function resetMockIceListings(): void {
  mockIceListings = createSeedListings()
}

export function getMockIceListings(options?: {
  arenaId?: string
  status?: IceListing['status']
  statuses?: IceListing['status'][]
}): IceListing[] {
  let result = [...mockIceListings]
  if (options?.arenaId) {
    result = result.filter((item) => item.arenaId === options.arenaId)
  }
  if (options?.status) {
    result = result.filter((item) => item.status === options.status)
  }
  if (options?.statuses) {
    result = result.filter((item) => options.statuses!.includes(item.status))
  }
  return result.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export function createMockIceListing(
  payload: CreateIceListingPayload,
  ownerUserId = mockUser.id,
): IceListing {
  const now = new Date().toISOString()
  const listing: IceListing = {
    id: `listing-${Date.now()}`,
    arenaId: payload.arenaId,
    ownerUserId,
    title: payload.title.trim(),
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    priceRub: payload.priceRub,
    contactPhone: payload.contactPhone,
    contactNote: payload.contactNote,
    status: payload.status ?? 'draft',
    createdAt: now,
    updatedAt: now,
  }
  mockIceListings = [...mockIceListings, listing]
  return listing
}

export function updateMockIceListing(
  listingId: string,
  patch: UpdateIceListingPayload,
): IceListing | undefined {
  const index = mockIceListings.findIndex((item) => item.id === listingId)
  if (index === -1) return undefined
  const current = mockIceListings[index]
  const next: IceListing = {
    ...current,
    ...patch,
    title: patch.title?.trim() ?? current.title,
    updatedAt: new Date().toISOString(),
  }
  mockIceListings = mockIceListings.map((item, i) => (i === index ? next : item))
  return next
}

export function arenaHasPublishedListings(arenaId: string): boolean {
  return mockIceListings.some((item) => item.arenaId === arenaId && item.status === 'published')
}
