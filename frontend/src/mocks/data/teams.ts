/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-FR-21.1.2
 * SPEC-FR-21.1.5
 * HOCFRONT-25 — расширенный каталог команд для фильтров
 */

import type {RosterMember, Team, TeamInvite, TeamRole} from '@/entities/team'

/** @spec SPEC-FR-3.1.1 - Mock команды */
export let mockTeams: Team[] = [
  {
    id: 'team-001',
    name: 'Медведи САО',
    city: 'Москва',
    skillLevel: 'amateur',
    captainUserId: 'user-001',
    ownerUserId: 'user-001',
    description:
      'Регулярные тренировки по вторникам и субботам. Любительский состав клуба ХК Медведи.',
    shortDescription: 'Любительский состав · вт / сб',
    logoUrl: '',
    memberIds: ['user-001', 'user-003', 'user-004', 'user-005'],
    leagueId: 'league-001',
    homeArenaId: 'arena-001',
    clubId: 'club-001',
  },
  {
    id: 'team-002',
    name: 'Соколы ЮАО',
    city: 'Москва',
    skillLevel: 'advanced',
    captainUserId: 'user-002',
    ownerUserId: 'user-002',
    description: 'Соревновательная команда Южного округа. Игры по воскресеньям.',
    shortDescription: 'Продвинутый уровень · вс',
    memberIds: ['user-002', 'user-003'],
    leagueId: 'league-002',
    homeArenaId: 'arena-002',
  },
  {
    id: 'team-003',
    name: 'Балтика',
    city: 'Санкт-Петербург',
    skillLevel: 'beginner',
    captainUserId: 'user-004',
    ownerUserId: 'user-004',
    description: 'Набор новичков на вечерние тренировки у Финского залива.',
    shortDescription: 'Новички · вечерние льды',
    memberIds: ['user-004'],
    homeArenaId: 'arena-003',
  },
]

/** @spec SPEC-FR-3.2.1 - Mock состав */
export let mockRoster: RosterMember[] = [
  {
    teamId: 'team-001',
    userId: 'user-001',
    displayName: 'Иван Петров',
    position: 'forward',
    teamRole: 'owner',
    rosterStatus: 'active',
    joinedAt: '2026-01-10T10:00:00Z',
  },
  {
    teamId: 'team-001',
    userId: 'user-003',
    displayName: 'Дмитрий Козлов',
    position: 'defense',
    teamRole: 'player',
    rosterStatus: 'active',
    joinedAt: '2026-01-12T10:00:00Z',
  },
  {
    teamId: 'team-001',
    userId: 'user-004',
    displayName: 'Сергей Волков',
    position: 'forward',
    teamRole: 'player',
    rosterStatus: 'bench',
    joinedAt: '2026-02-01T10:00:00Z',
  },
  {
    teamId: 'team-001',
    userId: 'user-005',
    displayName: 'Михаил Орлов',
    position: 'defense',
    teamRole: 'coach',
    rosterStatus: 'active',
    joinedAt: '2026-01-08T10:00:00Z',
  },
  {
    teamId: 'team-002',
    userId: 'user-002',
    displayName: 'Алексей Смирнов',
    position: 'goalie',
    teamRole: 'owner',
    rosterStatus: 'active',
    joinedAt: '2026-02-10T10:00:00Z',
  },
  {
    teamId: 'team-002',
    userId: 'user-003',
    displayName: 'Дмитрий Козлов',
    position: 'defense',
    teamRole: 'player',
    rosterStatus: 'active',
    joinedAt: '2026-02-12T10:00:00Z',
  },
  {
    teamId: 'team-003',
    userId: 'user-004',
    displayName: 'Сергей Волков',
    position: 'forward',
    teamRole: 'owner',
    rosterStatus: 'active',
    joinedAt: '2026-03-01T10:00:00Z',
  },
]

/** @spec SPEC-FR-21.1.2 - Email-приглашения в команду */
export let mockTeamInvites: TeamInvite[] = []

/**
 * @spec SPEC-FR-3.1.1 - Создать команду в mock store
 */
export function createMockTeam(team: Team): Team {
  mockTeams = [...mockTeams, team]
  return team
}

/**
 * @spec SPEC-FR-3.1.2 - Добавить игрока в состав
 */
export function addMockRosterMember(member: RosterMember): RosterMember {
  mockRoster = [
    ...mockRoster.filter((m) => !(m.teamId === member.teamId && m.userId === member.userId)),
    member,
  ]
  const team = mockTeams.find((t) => t.id === member.teamId)
  if (team && !team.memberIds.includes(member.userId)) {
    team.memberIds = [...team.memberIds, member.userId]
  }
  return member
}

/**
 * @spec SPEC-FR-3.2.2 - Обновить статус участника
 */
export function updateMockRosterStatus(
  teamId: string,
  userId: string,
  rosterStatus: RosterMember['rosterStatus'],
): RosterMember | undefined {
  const index = mockRoster.findIndex((m) => m.teamId === teamId && m.userId === userId)
  if (index === -1) return undefined
  mockRoster[index] = {...mockRoster[index], rosterStatus}
  return mockRoster[index]
}

/** @spec SPEC-FR-21.1.5 - Обновить роль участника команды */
export function updateMockTeamRole(
  teamId: string,
  userId: string,
  teamRole: TeamRole,
): RosterMember | undefined {
  const index = mockRoster.findIndex((m) => m.teamId === teamId && m.userId === userId)
  if (index === -1) return undefined
  mockRoster[index] = {...mockRoster[index], teamRole}
  return mockRoster[index]
}

/** @spec SPEC-FR-21.1.5 - Передать ownership другому участнику команды */
export function transferMockTeamOwnership(
  teamId: string,
  newOwnerUserId: string,
): RosterMember | undefined {
  const nextOwner = mockRoster.find((m) => m.teamId === teamId && m.userId === newOwnerUserId)
  if (!nextOwner) return undefined
  mockRoster = mockRoster.map((member) =>
    member.teamId === teamId && member.teamRole === 'owner' && member.userId !== newOwnerUserId
      ? {...member, teamRole: 'captain'}
      : member,
  )
  const updatedOwner = updateMockTeamRole(teamId, newOwnerUserId, 'owner')
  const team = mockTeams.find((item) => item.id === teamId)
  if (team) {
    team.ownerUserId = newOwnerUserId
    team.captainUserId = newOwnerUserId
  }
  return updatedOwner
}

/** @spec SPEC-FR-21.1.2 - Создать email-invite для незарегистрированного игрока */
export function createMockTeamInvite(
  teamId: string,
  email: string,
  invitedByUserId = 'user-001',
): TeamInvite {
  const invite: TeamInvite = {
    id: `invite-${Date.now()}`,
    teamId,
    email: email.trim().toLowerCase(),
    invitedByUserId,
    status: 'sent',
    createdAt: new Date().toISOString(),
  }
  mockTeamInvites = [invite, ...mockTeamInvites]
  return invite
}

/** @spec SPEC-FR-24.5.4 - Капитан/владелец может подать заявку в лигу */
export function canManageTeamAsCaptain(teamId: string, userId: string): boolean {
  const team = mockTeams.find((item) => item.id === teamId)
  if (!team) return false
  if (team.captainUserId === userId || team.ownerUserId === userId) return true
  const member = mockRoster.find((m) => m.teamId === teamId && m.userId === userId)
  return member?.teamRole === 'captain' || member?.teamRole === 'owner'
}
