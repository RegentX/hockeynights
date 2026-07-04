/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1, SPEC-FR-6.3.2
 */

import type {SourceMeta} from '@/entities/common/types'

/** @spec SPEC-FR-6.2.2 - Режим записи на площадке */
export type ArenaBookingMode = 'external_portal' | 'slot_calendar'

/** @spec SPEC-FR-6.1.1 - Ледовая арена */
export interface Arena {
  /** @spec SPEC-FR-6.1.1 */
  id: string
  /** @spec SPEC-FR-6.1.1 */
  name: string
  /** @spec SPEC-FR-6.1.1 */
  city: string
  /** @spec SPEC-FR-6.2.1 */
  address: string
  /** @spec SPEC-FR-6.1.2 */
  district?: string
  /** @spec SPEC-FR-6.1.2 */
  metro?: string
  /** @spec SPEC-FR-6.1.1 */
  latitude: number
  /** @spec SPEC-FR-6.1.1 */
  longitude: number
  /** @spec SPEC-FR-6.2.1 */
  amenities: string[]
  /** @spec SPEC-FR-6.2.1 */
  phone?: string
  /** @spec SPEC-FR-6.2.1 */
  websiteUrl?: string
  /** @spec SPEC-FR-6.2.2 */
  bookingUrl?: string
  /**
   * @spec SPEC-FR-6.2.2 - external_portal: заявка/портал без слотов;
   * slot_calendar: выбор временного слота
   */
  bookingMode: ArenaBookingMode
  /** @spec SPEC-FR-6.2.1 */
  priceRange?: string
  /** @spec SPEC-FR-6.3.2 */
  sourceMeta: SourceMeta
  /** @spec SPEC-FR-11.1.2 */
  visible?: boolean
}

/** @spec SPEC-FR-6.3.1 - Слот льда */
export interface IceSlot {
  /** @spec SPEC-FR-6.3.1 */
  id: string
  /** @spec SPEC-FR-6.3.1 */
  arenaId: string
  /** @spec SPEC-FR-6.3.1 */
  startsAt: string
  /** @spec SPEC-FR-6.3.1 */
  endsAt: string
  /** @spec SPEC-FR-6.3.1 */
  price?: number
  /** @spec SPEC-FR-6.3.1 */
  status: 'free' | 'booked' | 'unknown'
  /** @spec SPEC-FR-6.2.2 */
  bookingUrl?: string
  /** @spec SPEC-FR-6.3.2 */
  sourceMeta: SourceMeta
}

/** @spec SPEC-FR-6.1.2 - Фильтры арен */
export interface ArenaFilters {
  /** @spec SPEC-FR-6.1.2 */
  query?: string
  /** @spec SPEC-FR-6.1.2 */
  district?: string
  /** @spec SPEC-FR-6.1.2 */
  metro?: string
  /** @spec SPEC-FR-6.1.2 */
  amenity?: string
  /** @spec SPEC-FR-6.1.2 */
  hasFreeSlots?: boolean
  /** @spec SPEC-FR-6.1.2 */
  bookingMode?: ArenaBookingMode
}
