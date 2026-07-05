/**
 * SPEC-FR-21.1.6, SPEC-FR-21.1.7
 */

import type {TrainingLineupAssignment} from '@/entities/team/types'

/** @spec SPEC-FR-21.1.6 - Mock раскладки тренировок */
export let mockTrainingLineups: TrainingLineupAssignment[] = [
  {eventId: 'event-002', userId: 'user-001', position: 'forward', side: 'white', line: 1},
  {eventId: 'event-002', userId: 'user-003', position: 'defense', side: 'white', line: 1},
  {eventId: 'event-002', userId: 'user-004', position: 'forward', side: 'red', line: 2},
  {eventId: 'event-002', userId: 'user-005', position: 'defense', side: 'bench', line: 1},
]

export function getMockTrainingLineup(teamId: string, eventId: string): TrainingLineupAssignment[] {
  void teamId
  return mockTrainingLineups.filter((a) => a.eventId === eventId)
}

export function updateMockTrainingLineup(
  eventId: string,
  assignments: TrainingLineupAssignment[],
): TrainingLineupAssignment[] {
  mockTrainingLineups = [
    ...mockTrainingLineups.filter((a) => a.eventId !== eventId),
    ...assignments.map((a) => ({...a, eventId})),
  ]
  return mockTrainingLineups.filter((a) => a.eventId === eventId)
}
