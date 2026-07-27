/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-FR-21.1.2
 * HOCFRONT-25 — fetchTeam
 */

import type {Club} from '@/entities/club/model'
import type {GameEvent} from '@/entities/event'
import type {
  CreateTeamPayload,
  RosterMember,
  StaffContactRequest,
  StaffContactRequestPayload,
  Team,
  TeamInvite,
  TeamRole,
  TeamsFilterParams,
  TrainingLineupAssignment,
} from '@/entities/team/model'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-3.1.1 - Список команд
 */
export function fetchTeams(filters: TeamsFilterParams = {}): Promise<Team[]> {
  const params = new URLSearchParams()
  if (filters.leagueId) params.set('leagueId', filters.leagueId)
  if (filters.q) params.set('q', filters.q)
  if (filters.playerId) params.set('playerId', filters.playerId)
  if (filters.city) params.set('city', filters.city)
  if (filters.skillLevel) params.set('skillLevel', filters.skillLevel)

  const query = params.toString()
  return apiRequest<Team[]>(`/teams${query ? `?${query}` : ''}`)
}

/**
 * HOCFRONT-25 / TASK-04-03 — Публичный профиль команды
 */
export function fetchTeam(teamId: string): Promise<Team> {
  return apiRequest<Team>(`/teams/${teamId}`)
}

/**
 * @spec SPEC-FR-3.1.1 - Создать команду
 */
export function createTeam(payload: CreateTeamPayload): Promise<Team> {
  return apiRequest<Team>('/teams', {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-3.2.1 - Получить состав команды
 */
export function fetchTeamRoster(teamId: string): Promise<RosterMember[]> {
  return apiRequest<RosterMember[]>(`/teams/${teamId}/roster`)
}

/**
 * @spec SPEC-FR-3.2.2 - Изменить статус участника
 */
export function updateRosterMemberStatus(
  teamId: string,
  userId: string,
  rosterStatus: RosterMember['rosterStatus'],
): Promise<RosterMember> {
  return apiRequest<RosterMember>(`/teams/${teamId}/roster/${userId}`, {
    method: 'PATCH',
    body: {rosterStatus},
  })
}

/**
 * @spec SPEC-FR-21.1.5 - Изменить роль участника команды
 */
export function updateTeamMemberRole(
  teamId: string,
  userId: string,
  teamRole: TeamRole,
): Promise<RosterMember> {
  return apiRequest<RosterMember>(`/teams/${teamId}/roles/${userId}`, {
    method: 'PATCH',
    body: {teamRole},
  })
}

/**
 * @spec SPEC-FR-3.1.2 - Добавить игрока в команду
 */
export function addTeamMember(teamId: string, userId: string): Promise<RosterMember> {
  return apiRequest<RosterMember>(`/teams/${teamId}/members`, {
    method: 'POST',
    body: {userId},
  })
}

/**
 * @spec SPEC-FR-21.1.2 - Пригласить незарегистрированного игрока по email
 */
export function inviteTeamMemberByEmail(teamId: string, email: string): Promise<TeamInvite> {
  return apiRequest<TeamInvite>(`/teams/${teamId}/invites`, {
    method: 'POST',
    body: {email},
  })
}

/** @spec SPEC-FR-21.1.2 - Получить историю email-инвайтов команды */
export function fetchTeamInvites(teamId: string): Promise<TeamInvite[]> {
  return apiRequest<TeamInvite[]>(`/teams/${teamId}/invites`)
}

/** @spec SPEC-FR-24.3.2 - Тренировки команды для раскладки */
export function fetchTeamTrainingEvents(teamId: string): Promise<GameEvent[]> {
  return apiRequest<GameEvent[]>(`/teams/${teamId}/training-events`)
}

/** HOCFRONT-25 — календарь команды (игры + тренировки) */
export function fetchTeamCalendarEvents(teamId: string): Promise<GameEvent[]> {
  return apiRequest<GameEvent[]>(`/teams/${teamId}/calendar`)
}

/** @spec SPEC-FR-21.1.6 - Получить раскладку тренировки */
export function fetchTrainingLineup(
  teamId: string,
  eventId: string,
): Promise<TrainingLineupAssignment[]> {
  return apiRequest<TrainingLineupAssignment[]>(`/teams/${teamId}/training-lineup/${eventId}`)
}

/** @spec SPEC-FR-21.1.6 - Сохранить раскладку тренировки */
export function updateTrainingLineup(
  teamId: string,
  eventId: string,
  assignments: TrainingLineupAssignment[],
): Promise<TrainingLineupAssignment[]> {
  return apiRequest<TrainingLineupAssignment[]>(`/teams/${teamId}/training-lineup/${eventId}`, {
    method: 'PUT',
    body: assignments,
  })
}

/** @spec SPEC-FR-24.4.3 - Профиль клуба для выбранной команды */
export function fetchTeamClubProfile(teamId: string): Promise<Club | null> {
  return apiRequest<Club | null>(`/teams/${teamId}/club-profile`)
}

/** HOCFRONT-25 / TASK-04-05 — заявка в штаб команды (MVP без мессенджера) */
export function submitStaffContactRequest(
  teamId: string,
  payload: StaffContactRequestPayload,
): Promise<StaffContactRequest> {
  return apiRequest<StaffContactRequest>(`/teams/${teamId}/staff-contact`, {
    method: 'POST',
    body: payload,
  })
}
