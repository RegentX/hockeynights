/**
 * EPIC-08 / ORG-1 — роль training_organizer и доступ к кабинету
 */

import {describe, expect, it} from 'vitest'

import {
  canAccessOrganizerCabinet,
  canOrganizeEvents,
  describeSessionPersona,
  getPersonaHomePath,
  hasTrainingOrganizerRole,
  isPlayerOnlySession,
} from '@/features/access'
import {PERSONA_PRESETS} from '@/features/auth/lib/personaPresets'
import {routes} from '@/shared/const/appRoutes'
import type {UserRole} from '@/shared/types/common'
import type {PartnerMembership, Session} from '@/shared/types/user'

function makeSession(roles: UserRole[], partnerMemberships: PartnerMembership[] = []): Session {
  return {
    isOnboarded: true,
    user: {
      id: 'user-org',
      displayName: 'Org',
      roles,
      city: 'Москва',
      createdAt: '2026-01-01T00:00:00Z',
      partnerMemberships,
    },
  }
}

describe('ORG-1 training organizer access', () => {
  it('treats training_organizer and legacy organizer as the same role family', () => {
    expect(hasTrainingOrganizerRole(['training_organizer'])).toBe(true)
    expect(hasTrainingOrganizerRole(['organizer'])).toBe(true)
    expect(hasTrainingOrganizerRole(['player'])).toBe(false)
  })

  it('allows cabinet for training_organizer, club_admin, captain, coach, admin', () => {
    for (const role of [
      'training_organizer',
      'organizer',
      'club_admin',
      'captain',
      'coach',
      'admin',
    ] as UserRole[]) {
      expect(canOrganizeEvents([role])).toBe(true)
      expect(canAccessOrganizerCabinet(makeSession([role]))).toBe(true)
    }
  })

  it('denies cabinet for player-only session', () => {
    expect(canOrganizeEvents(['player'])).toBe(false)
    expect(canOrganizeEvents(['goalie'])).toBe(false)
    expect(canAccessOrganizerCabinet(makeSession(['player']))).toBe(false)
    expect(isPlayerOnlySession(['player'])).toBe(true)
    expect(isPlayerOnlySession(['training_organizer'])).toBe(false)
    expect(isPlayerOnlySession(['club_admin'])).toBe(false)
  })

  it('routes training_organizer persona home to organizer cabinet', () => {
    const preset = PERSONA_PRESETS.find((item) => item.id === 'organizer')!
    expect(preset.title).toBe('Организатор тренировок')
    expect(preset.payload.roles).toContain('training_organizer')
    expect(getPersonaHomePath(makeSession(['training_organizer']))).toBe(routes.eventsOrganizer)
    expect(describeSessionPersona(makeSession(['training_organizer']))).toBe(
      'Организатор тренировок',
    )
    expect(describeSessionPersona(makeSession(['organizer']))).toBe('Организатор тренировок')
  })

  it('keeps club_admin home on partner workspace, not organizer cabinet', () => {
    const clubAdmin = makeSession(
      ['club_admin'],
      [{kind: 'club', entityId: 'club-001', entityName: 'Медведи'}],
    )
    expect(canOrganizeEvents(clubAdmin.user.roles)).toBe(true)
    expect(getPersonaHomePath(clubAdmin)).not.toBe(routes.eventsOrganizer)
  })
})
