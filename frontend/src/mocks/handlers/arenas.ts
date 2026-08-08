/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 * HOCFRONT-32 — city filter, listings, cabinet PATCH
 */

import {http, HttpResponse} from 'msw'

import type {
  ArenaCityRegion,
  CreateIceListingPayload,
  UpdateArenaPayload,
  UpdateIceListingPayload,
} from '@/entities/arena'
import {resolveArenaCityRegion} from '@/entities/arena'
import {arenaHasFreeSlots, mockArenas, mockIceSlots, updateMockArena} from '@/mocks/data/arenas'
import {
  createMockIceListing,
  getMockIceListings,
  updateMockIceListing,
} from '@/mocks/data/iceListings'
import {mockUser} from '@/mocks/data/session'

/** @spec SPEC-FR-6.1.2 - Handlers арен и слотов */
export const arenaHandlers = [
  http.get('/mock-api/v1/arenas', ({request}) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.trim().toLowerCase()
    const cityRegion = url.searchParams.get('cityRegion') as ArenaCityRegion | null
    const district = url.searchParams.get('district')
    const metro = url.searchParams.get('metro')
    const amenity = url.searchParams.get('amenity')
    const hasFreeSlots = url.searchParams.get('hasFreeSlots') === 'true'
    const bookingMode = url.searchParams.get('bookingMode')

    let result = mockArenas.filter((a) => a.visible !== false)

    if (query) {
      result = result.filter((a) => {
        const haystack = [a.name, a.metro, a.district, a.city, a.address]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(query)
      })
    }
    if (cityRegion === 'moscow' || cityRegion === 'moscow_oblast') {
      result = result.filter((a) => resolveArenaCityRegion(a.city) === cityRegion)
    }
    if (district) {
      result = result.filter((a) => a.district === district)
    }
    if (metro) {
      result = result.filter((a) => a.metro === metro)
    }
    if (amenity) {
      result = result.filter((a) => a.amenities.includes(amenity))
    }
    if (bookingMode === 'external_portal' || bookingMode === 'slot_calendar') {
      result = result.filter((a) => a.bookingMode === bookingMode)
    }
    if (hasFreeSlots) {
      result = result.filter((a) => a.bookingMode === 'slot_calendar' && arenaHasFreeSlots(a.id))
    }

    return HttpResponse.json(result)
  }),

  http.get('/mock-api/v1/arenas/:arenaId', ({params}) => {
    const arena = mockArenas.find((a) => a.id === params.arenaId)
    if (!arena) {
      return HttpResponse.json({message: 'Arena not found'}, {status: 404})
    }
    return HttpResponse.json(arena)
  }),

  http.patch('/mock-api/v1/arenas/:arenaId', async ({params, request}) => {
    const body = (await request.json()) as UpdateArenaPayload
    const updated = updateMockArena(params.arenaId as string, body)
    if (!updated) {
      return HttpResponse.json({message: 'Arena not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/arenas/:arenaId/slots', ({params}) => {
    const slots = mockIceSlots.filter((s) => s.arenaId === params.arenaId)
    return HttpResponse.json(slots)
  }),

  http.get('/mock-api/v1/arenas/:arenaId/listings', ({params, request}) => {
    const url = new URL(request.url)
    const publicOnly = url.searchParams.get('publicOnly') === 'true'
    const listings = getMockIceListings({
      arenaId: params.arenaId as string,
      status: publicOnly ? 'published' : undefined,
    })
    return HttpResponse.json(listings)
  }),

  http.get('/mock-api/v1/ice-listings', ({request}) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const listings = getMockIceListings({
      status:
        status === 'draft' || status === 'published' || status === 'archived' ? status : undefined,
    })
    return HttpResponse.json(listings)
  }),

  http.post('/mock-api/v1/ice-listings', async ({request}) => {
    const body = (await request.json()) as CreateIceListingPayload
    if (!body.arenaId || !body.title?.trim() || !body.startsAt || !body.endsAt) {
      return HttpResponse.json({message: 'Invalid listing payload'}, {status: 400})
    }
    const listing = createMockIceListing(body, mockUser.id)
    return HttpResponse.json(listing, {status: 201})
  }),

  http.patch('/mock-api/v1/ice-listings/:listingId', async ({params, request}) => {
    const body = (await request.json()) as UpdateIceListingPayload
    const updated = updateMockIceListing(params.listingId as string, body)
    if (!updated) {
      return HttpResponse.json({message: 'Listing not found'}, {status: 404})
    }
    return HttpResponse.json(updated)
  }),
]
