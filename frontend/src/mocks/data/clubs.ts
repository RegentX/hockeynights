/**
 * SPEC-FR-24.4.3
 */

import type {Club} from '@/entities/club/types'

/** @spec SPEC-FR-24.4.3 - Mock клубы с несколькими составами и штабом */
export const mockClubs: Club[] = [
  {
    id: 'club-001',
    name: 'ХК Медведи',
    city: 'Москва',
    description: 'Клуб объединяет любительский и продвинутый составы, тренерский штаб и менеджмент.',
    homeArenaId: 'arena-001',
    leagueIds: ['league-001', 'league-002'],
    teamIds: ['team-001'],
    squads: [
      {
        id: 'squad-001',
        name: 'Медведи САО',
        level: 'amateur',
        teamId: 'team-001',
        season: '2026 Summer',
      },
      {
        id: 'squad-002',
        name: 'Медведи Pro',
        level: 'advanced',
        season: '2026 Summer',
      },
    ],
    staff: [
      {userId: 'user-005', displayName: 'Михаил Орлов', role: 'head_coach'},
      {userId: 'user-006', displayName: 'Артем Шестаков', role: 'assistant_coach'},
      {userId: 'user-007', displayName: 'Елена Соколова', role: 'team_admin'},
    ],
  },
]

/** @spec SPEC-FR-24.4.3 - Получить клуб по teamId */
export function findMockClubByTeamId(teamId: string): Club | undefined {
  return mockClubs.find((club) => club.teamIds.includes(teamId))
}
