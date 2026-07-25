import {describe, expect, it} from 'vitest'

import {canViewTraining, getUserTeamIds} from '@/features/events/lib/trainingAccess'
import {mockEvents} from '@/mocks/data/events'
import {mockTeams} from '@/mocks/data/teams'

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

  it('restricts private_club training to team members', () => {
    const training = mockEvents.find((event) => event.id === 'event-002')
    expect(training).toBeTruthy()
    expect(canViewTraining(training!, 'user-001', getUserTeamIds(mockTeams, 'user-001'))).toBe(true)
    expect(canViewTraining(training!, 'user-002', getUserTeamIds(mockTeams, 'user-002'))).toBe(
      false,
    )
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
})
