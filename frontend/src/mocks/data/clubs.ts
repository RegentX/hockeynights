/**
 * SPEC-FR-24.4.3
 * HOCFRONT-25 — контакты клуба и обновление профиля
 */

import type {Club, UpdateClubPayload} from '@/entities/club'

/** @spec SPEC-FR-24.4.3 - Mock клубы с несколькими составами и штабом */
export let mockClubs: Club[] = [
  {
    id: 'club-001',
    name: 'ХК Медведи',
    city: 'Москва',
    description:
      'Клуб объединяет любительский и продвинутый составы, тренерский штаб и менеджмент.',
    contactEmail: 'office@medvedi.hockey',
    contactPhone: '+7 (495) 100-20-30',
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
      {
        userId: 'user-005',
        displayName: 'Михаил Орлов',
        role: 'head_coach',
        contactEmail: 'coach@medvedi.hockey',
        contactPhone: '+7 (999) 200-11-22',
      },
      {
        userId: 'user-006',
        displayName: 'Артем Шестаков',
        role: 'assistant_coach',
        contactEmail: 'assist@medvedi.hockey',
      },
      {
        userId: 'user-007',
        displayName: 'Елена Соколова',
        role: 'team_admin',
        contactEmail: 'admin@medvedi.hockey',
        contactPhone: '+7 (999) 200-33-44',
      },
    ],
  },
]

/** @spec SPEC-FR-24.4.3 - Получить клуб по teamId */
export function findMockClubByTeamId(teamId: string): Club | undefined {
  return mockClubs.find((club) => club.teamIds.includes(teamId))
}

export function findMockClubById(clubId: string): Club | undefined {
  return mockClubs.find((club) => club.id === clubId)
}

export function updateMockClub(clubId: string, patch: UpdateClubPayload): Club | undefined {
  const index = mockClubs.findIndex((club) => club.id === clubId)
  if (index === -1) return undefined
  mockClubs[index] = {
    ...mockClubs[index],
    ...patch,
    staff: patch.staff ?? mockClubs[index].staff,
  }
  mockClubs = [...mockClubs]
  return mockClubs[index]
}
