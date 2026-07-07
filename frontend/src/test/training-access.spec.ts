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

  it('restricts club_only training to team members', () => {
    const training = mockEvents.find((event) => event.id === 'event-002')
    expect(training).toBeTruthy()
    expect(canViewTraining(training!, 'user-001', getUserTeamIds(mockTeams, 'user-001'))).toBe(true)
    expect(canViewTraining(training!, 'user-002', getUserTeamIds(mockTeams, 'user-002'))).toBe(
      false,
    )
  })
})
