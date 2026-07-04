/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.3.1
 */

import {http, HttpResponse} from 'msw'
import {arenaHasFreeSlots, mockArenas, mockIceSlots} from '@/mocks/data/arenas'

/** @spec SPEC-FR-6.1.2 - Handlers арен и слотов */
export const arenaHandlers = [
  http.get('/mock-api/v1/arenas', ({request}) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')?.trim().toLowerCase()
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
      result = result.filter(
        (a) => a.bookingMode === 'slot_calendar' && arenaHasFreeSlots(a.id),
      )
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

  http.get('/mock-api/v1/arenas/:arenaId/slots', ({params}) => {
    const slots = mockIceSlots.filter((s) => s.arenaId === params.arenaId)
    return HttpResponse.json(slots)
  }),
]
