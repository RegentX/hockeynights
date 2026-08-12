/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-FR-21.1.2
 * SPEC-FR-21.1.5
 * HOCFRONT-25 — расширенный каталог команд для фильтров
 */

import type {RosterMember, Team, TeamInvite, TeamInviteStatus, TeamRole} from '@/entities/team'

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
    logoUrl: 'https://placehold.co/64x64/1a2f4a/ffffff?text=МС',
    memberIds: ['user-001', 'user-003', 'user-004', 'user-005', 'user-006'],
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
    logoUrl: 'https://placehold.co/64x64/0d253f/ffffff?text=СЮ',
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
    logoUrl: 'https://placehold.co/64x64/163a5c/ffffff?text=БЛ',
    memberIds: ['user-004'],
    homeArenaId: 'arena-003',
  },
]

/** @spec SPEC-FR-3.2.1 - Mock состав */
export let mockRoster: RosterMember[] = [
  {
    teamId: 'team-001',
    userId: 'user-001',
    displayName: 'Петров Иван Сергеевич',
    position: 'forward',
    teamRole: 'owner',
    rosterStatus: 'active',
    joinedAt: '2026-01-10T10:00:00Z',
  },
  {
    teamId: 'team-001',
    userId: 'user-003',
    displayName: 'Козлов Дмитрий Александрович',
    position: 'defense',
    teamRole: 'player',
    rosterStatus: 'active',
    joinedAt: '2026-01-12T10:00:00Z',
  },
  {
    teamId: 'team-001',
    userId: 'user-004',
    displayName: 'Волков Сергей Николаевич',
    position: 'forward',
    teamRole: 'player',
    rosterStatus: 'bench',
    joinedAt: '2026-02-01T10:00:00Z',
  },
  {
    teamId: 'team-001',
    userId: 'user-005',
    displayName: 'Орлов Михаил Викторович',
    position: 'defense',
    teamRole: 'coach',
    rosterStatus: 'active',
    joinedAt: '2026-01-08T10:00:00Z',
  },
  {
    teamId: 'team-002',
    userId: 'user-002',
    displayName: 'Смирнов Алексей Дмитриевич',
    position: 'goalie',
    teamRole: 'owner',
    rosterStatus: 'active',
    joinedAt: '2026-02-10T10:00:00Z',
  },
  {
    teamId: 'team-002',
    userId: 'user-003',
    displayName: 'Козлов Дмитрий Александрович',
    position: 'defense',
    teamRole: 'player',
    rosterStatus: 'active',
    joinedAt: '2026-02-12T10:00:00Z',
  },
  {
    teamId: 'team-003',
    userId: 'user-004',
    displayName: 'Волков Сергей Николаевич',
    position: 'forward',
    teamRole: 'owner',
    rosterStatus: 'active',
    joinedAt: '2026-03-01T10:00:00Z',
  },
]

/** @spec SPEC-FR-21.1.2 - Приглашения в команду (игроки + email) */
export let mockTeamInvites: TeamInvite[] = [
  {
    id: 'invite-seed-received',
    teamId: 'team-001',
    userId: 'user-006',
    displayName: 'Белов Артём Игоревич',
    invitedByUserId: 'user-001',
    status: 'received',
    createdAt: '2026-07-10T12:00:00Z',
    updatedAt: '2026-07-10T12:05:00Z',
  },
  {
    id: 'invite-seed-declined',
    teamId: 'team-001',
    userId: 'user-007',
    displayName: 'Новиков Павел Андреевич',
    invitedByUserId: 'user-001',
    status: 'declined',
    createdAt: '2026-07-08T09:00:00Z',
    updatedAt: '2026-07-09T18:20:00Z',
  },
]

// Синхронизируем seed-приглашения с составом
mockRoster = [
  ...mockRoster,
  {
    teamId: 'team-001',
    userId: 'user-006',
    displayName: 'Белов Артём Игоревич',
    position: 'forward',
    teamRole: 'player',
    rosterStatus: 'invited',
    joinedAt: '2026-07-10T12:00:00Z',
  },
  {
    teamId: 'team-001',
    userId: 'user-007',
    displayName: 'Новиков Павел Андреевич',
    position: 'goalie',
    teamRole: 'player',
    rosterStatus: 'declined',
    joinedAt: '2026-07-08T09:00:00Z',
  },
]

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
    updatedAt: new Date().toISOString(),
  }
  mockTeamInvites = [invite, ...mockTeamInvites.filter((item) => item.email !== invite.email)]
  return invite
}

/** HOCFRONT-25 — приглашение зарегистрированного игрока */
export function createMockRegisteredTeamInvite(
  teamId: string,
  player: {userId: string; displayName: string},
  invitedByUserId = 'user-001',
  status: TeamInviteStatus = 'sent',
): TeamInvite {
  const now = new Date().toISOString()
  const invite: TeamInvite = {
    id: `invite-${player.userId}-${Date.now()}`,
    teamId,
    userId: player.userId,
    displayName: player.displayName,
    invitedByUserId,
    status,
    createdAt: now,
    updatedAt: now,
  }
  mockTeamInvites = [
    invite,
    ...mockTeamInvites.filter((item) => !(item.teamId === teamId && item.userId === player.userId)),
  ]
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
