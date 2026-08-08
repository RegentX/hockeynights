import {describe, expect, it} from 'vitest'

import {canManageClubEntity} from '@/features/access/lib/clubAccess'
import {canViewTraining, getUserClubIds, getUserTeamIds} from '@/features/events/lib/trainingAccess'
import {mockEvents} from '@/mocks/data/events'
import {mockTeams} from '@/mocks/data/teams'
import type {Session} from '@/shared/types/user'

function makeSession(
  roles: Session['user']['roles'],
  partnerMemberships?: Session['user']['partnerMemberships'],
): Session {
  return {
    isOnboarded: true,
    user: {
      id: 'user-test',
      displayName: 'Test',
      roles,
      city: 'Москва',
      createdAt: '2026-01-01T00:00:00Z',
      partnerMemberships,
    },
  }
}

describe('trainingAccess', () => {
  it('allows public training for any user', () => {
    const training = mockEvents.find((event) => event.id === 'event-005')
    expect(training).toBeTruthy()
    expect(canViewTraining(training!, 'user-002', [])).toBe(true)
  })

  it('restricts limited training to allowed users', () => {
    const training = mockEvents.find((event) => event.id === 'event-004')
    expect(training).toBeTruthy()
    expect(canViewTraining(training!, 'user-001', getUserTeamIds(mockTeams, 'user-001'))).toBe(true)
    expect(canViewTraining(training!, 'user-002', getUserTeamIds(mockTeams, 'user-002'))).toBe(
      false,
    )
  })

  it('restricts private_club training to club / team members', () => {
    const training = mockEvents.find((event) => event.id === 'event-002')
    expect(training).toBeTruthy()
    expect(canViewTraining(training!, 'user-001', getUserTeamIds(mockTeams, 'user-001'))).toBe(true)
    expect(canViewTraining(training!, 'user-007', getUserTeamIds(mockTeams, 'user-007'))).toBe(
      false,
    )
  })

  it('allows private_club for members of any club team via userClubIds', () => {
    const training = mockEvents.find((event) => event.id === 'event-002')
    expect(training).toBeTruthy()
    expect(
      canViewTraining(training!, 'user-777', [], {
        userClubIds: ['club-001'],
      }),
    ).toBe(true)
    expect(
      canViewTraining(training!, 'user-777', [], {
        userClubIds: ['club-999'],
      }),
    ).toBe(false)
  })

  it('allows private_club training for club admin via canManageClub', () => {
    const training = mockEvents.find((event) => event.id === 'event-002')
    expect(training).toBeTruthy()
    expect(
      canViewTraining(training!, 'user-999', [], {
        canManageClub: true,
      }),
    ).toBe(true)
    expect(
      canViewTraining(training!, 'user-999', [], {
        canManageClub: false,
      }),
    ).toBe(false)
  })

  it('resolves club ids from team memberships', () => {
    expect(getUserClubIds(mockTeams, 'user-001')).toContain('club-001')
    expect(getUserClubIds(mockTeams, 'user-002')).toEqual([])
  })
})

describe('canManageClubEntity', () => {
  it('allows site admin for any clubId', () => {
    expect(canManageClubEntity(makeSession(['admin']), 'club-001')).toBe(true)
  })

  it('requires club membership even with club_admin role', () => {
    expect(canManageClubEntity(makeSession(['club_admin']), 'club-001')).toBe(false)
    expect(
      canManageClubEntity(
        makeSession(['club_admin'], [{kind: 'club', entityId: 'club-001', entityName: 'Медведи'}]),
        'club-001',
      ),
    ).toBe(true)
    expect(
      canManageClubEntity(
        makeSession(['club_admin'], [{kind: 'club', entityId: 'club-001', entityName: 'Медведи'}]),
        'club-999',
      ),
    ).toBe(false)
  })
})
