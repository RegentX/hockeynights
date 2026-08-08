/**
 * HOCFRONT-28CAL-G — окна возможностей
 */

export type AvailabilityRoleHint = 'goalie' | 'player' | 'any'

export interface AvailabilityWindow {
  id: string
  userId: string
  roleHint: AvailabilityRoleHint
  startsAt: string
  endsAt: string
  districts: string[]
  maxTravelKm?: number
  priceFrom?: number
  priceTo?: number
  note?: string
  active: boolean
}

export interface CreateAvailabilityWindowPayload {
  roleHint: AvailabilityRoleHint
  startsAt: string
  endsAt: string
  districts: string[]
  maxTravelKm?: number
  priceFrom?: number
  priceTo?: number
  note?: string
}

export interface GoalieRequest {
  id: string
  eventId: string
  eventTitle: string
  organizerUserId: string
  targetUserId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  startsAt: string
  arenaName?: string
  pricePerPlayer?: number
}
