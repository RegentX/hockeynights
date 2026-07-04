/**
 * SPEC-FR-25.6.1, SPEC-FR-25.6.2
 * RSVP команды на конкретную игру.
 */

import type {PlayerPosition} from '@/entities/common/types'

export type EventRsvpStatus = 'confirmed' | 'declined' | 'pending'

export interface EventRsvpPlayer {
  userId: string
  displayName: string
  position: PlayerPosition
  status: EventRsvpStatus
  declineReason?: string
  updatedAt?: string
}

export interface EventRsvpBoard {
  eventId: string
  teamId: string
  teamName: string
  leagueName: string
  opponentName: string
  startsAt: string
  arenaName: string
  players: EventRsvpPlayer[]
}

export interface UpdateEventRsvpPayload {
  status: EventRsvpStatus
  declineReason?: string
}
