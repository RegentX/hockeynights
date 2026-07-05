/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 */

import type {
  League,
  LeagueAnalytics,
  LeagueApplicationPayload,
  LeagueDivision,
  LeaguePost,
  LeagueScheduleImportResult,
  LeagueScheduleItem,
  LeagueSeason,
  LeagueStanding,
  LeagueTeamApplication,
} from '@/entities/league/types'
import {apiRequest} from '@/shared/api/client'

/**
 * @spec SPEC-FR-7.1.1 - Список лиг
 */
export function fetchLeagues(): Promise<League[]> {
  return apiRequest<League[]>('/leagues')
}

/**
 * @spec SPEC-FR-7.1.2 - Карточка лиги
 */
export function fetchLeague(leagueId: string): Promise<League> {
  return apiRequest<League>(`/leagues/${leagueId}`)
}

/**
 * @spec SPEC-FR-7.2.1 - Таблица лиги
 */
export function fetchLeagueStandings(leagueId: string): Promise<LeagueStanding[]> {
  return apiRequest<LeagueStanding[]>(`/leagues/${leagueId}/standings`)
}

/**
 * @spec SPEC-FR-7.2.1 - Расписание лиги
 */
export function fetchLeagueSchedule(leagueId: string): Promise<LeagueScheduleItem[]> {
  return apiRequest<LeagueScheduleItem[]>(`/leagues/${leagueId}/schedule`)
}

/** @spec SPEC-FR-24.5.3 - Обновить партнёрский профиль лиги */
export function updateLeaguePartnerProfile(
  leagueId: string,
  patch: Partial<League>,
): Promise<League> {
  return apiRequest<League>(`/leagues/${leagueId}/profile`, {method: 'PATCH', body: patch})
}

/** @spec SPEC-FR-24.5.4 - Сезоны лиги */
export function fetchLeagueSeasons(leagueId: string): Promise<LeagueSeason[]> {
  return apiRequest<LeagueSeason[]>(`/leagues/${leagueId}/seasons`)
}

/** @spec SPEC-FR-24.5.4 - Дивизионы сезона */
export function fetchLeagueDivisions(
  leagueId: string,
  seasonId?: string,
): Promise<LeagueDivision[]> {
  const query = seasonId ? `?seasonId=${seasonId}` : ''
  return apiRequest<LeagueDivision[]>(`/leagues/${leagueId}/divisions${query}`)
}

/** @spec SPEC-FR-24.5.4 - Заявки команд */
export function fetchLeagueApplications(leagueId: string): Promise<LeagueTeamApplication[]> {
  return apiRequest<LeagueTeamApplication[]>(`/leagues/${leagueId}/applications`)
}

/** @spec SPEC-FR-24.5.4 - Заявка команды капитана */
export function fetchTeamLeagueApplication(
  leagueId: string,
  teamId: string,
): Promise<LeagueTeamApplication[]> {
  return apiRequest<LeagueTeamApplication[]>(`/leagues/${leagueId}/applications?teamId=${teamId}`)
}

/** @spec SPEC-FR-24.5.4 - Подать заявку в лигу */
export function submitLeagueApplication(
  leagueId: string,
  payload: LeagueApplicationPayload,
): Promise<LeagueTeamApplication> {
  return apiRequest<LeagueTeamApplication>(`/leagues/${leagueId}/applications`, {
    method: 'POST',
    body: payload,
  })
}

/** @spec SPEC-FR-24.5.4 - Решение по заявке */
export function reviewLeagueApplication(
  leagueId: string,
  applicationId: string,
  patch: Pick<LeagueTeamApplication, 'status' | 'reviewComment'>,
): Promise<LeagueTeamApplication> {
  return apiRequest<LeagueTeamApplication>(`/leagues/${leagueId}/applications/${applicationId}`, {
    method: 'PATCH',
    body: patch,
  })
}

/** @spec SPEC-FR-24.5.6 - Публикации лиги */
export function fetchLeaguePosts(leagueId: string): Promise<LeaguePost[]> {
  return apiRequest<LeaguePost[]>(`/leagues/${leagueId}/posts`)
}

/** @spec SPEC-FR-24.5.6 - Создать публикацию */
export function createLeaguePost(
  leagueId: string,
  payload: Pick<LeaguePost, 'title' | 'body' | 'pinned'>,
): Promise<LeaguePost> {
  return apiRequest<LeaguePost>(`/leagues/${leagueId}/posts`, {method: 'POST', body: payload})
}

/** @spec SPEC-FR-24.5.7 - Аналитика лиги */
export function fetchLeagueAnalytics(leagueId: string): Promise<LeagueAnalytics> {
  return apiRequest<LeagueAnalytics>(`/leagues/${leagueId}/analytics`)
}

/** @spec SPEC-FR-24.5.5 - Добавить матч */
export function createLeagueScheduleItem(
  leagueId: string,
  payload: Omit<LeagueScheduleItem, 'id' | 'leagueId'>,
): Promise<LeagueScheduleItem> {
  return apiRequest<LeagueScheduleItem>(`/leagues/${leagueId}/schedule`, {
    method: 'POST',
    body: payload,
  })
}

/** @spec SPEC-FR-24.5.5 - Обновить матч / счёт */
export function updateLeagueScheduleItem(
  leagueId: string,
  scheduleId: string,
  patch: Partial<LeagueScheduleItem>,
): Promise<LeagueScheduleItem> {
  return apiRequest<LeagueScheduleItem>(`/leagues/${leagueId}/schedule/${scheduleId}`, {
    method: 'PATCH',
    body: patch,
  })
}

/** @spec SPEC-FR-24.5.5 - Обновить строку таблицы */
export function updateLeagueStanding(
  leagueId: string,
  standing: LeagueStanding,
): Promise<LeagueStanding> {
  return apiRequest<LeagueStanding>(`/leagues/${leagueId}/standings`, {
    method: 'PATCH',
    body: standing,
  })
}

/** @spec SPEC-FR-24.5.5 - Импорт расписания CSV */
export function importLeagueSchedule(
  leagueId: string,
  csvText?: string,
): Promise<LeagueScheduleImportResult> {
  return apiRequest<LeagueScheduleImportResult>(`/leagues/${leagueId}/schedule-import`, {
    method: 'POST',
    body: {csvText},
  })
}
