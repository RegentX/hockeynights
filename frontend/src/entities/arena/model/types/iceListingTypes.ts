/**
 * HOCFRONT-32B — объявление льда
 */

export type IceListingStatus = 'draft' | 'published' | 'archived'

export interface IceListing {
  id: string
  arenaId: string
  ownerUserId: string
  title: string
  startsAt: string
  endsAt: string
  priceRub?: number
  contactPhone?: string
  contactNote?: string
  status: IceListingStatus
  createdAt: string
  updatedAt: string
}

export interface CreateIceListingPayload {
  arenaId: string
  title: string
  startsAt: string
  endsAt: string
  priceRub?: number
  contactPhone?: string
  contactNote?: string
  status?: IceListingStatus
}

export interface UpdateIceListingPayload {
  title?: string
  startsAt?: string
  endsAt?: string
  priceRub?: number
  contactPhone?: string
  contactNote?: string
  status?: IceListingStatus
}

export interface UpdateArenaPayload {
  name?: string
  phone?: string
  websiteUrl?: string
  bookingUrl?: string
  address?: string
  city?: string
  district?: string
  metro?: string
  priceRange?: string
  visible?: boolean
}
