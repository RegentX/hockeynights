/**
 * SPEC-FR-24.5.4, SPEC-FR-24.5.6, SPEC-FR-24.5.7
 */

import type {
  LeagueAnalytics,
  LeagueDivision,
  LeaguePost,
  LeagueScheduleImportResult,
  LeagueSeason,
  LeagueTeamApplication,
} from '@/entities/league'
import {addMockScheduleItem} from '@/mocks/data/leagues'

export const mockLeagueSeasons: LeagueSeason[] = [
  {id: 'season-001', leagueId: 'league-001', name: '2026 Summer', status: 'active'},
]

export const mockLeagueDivisions: LeagueDivision[] = [
  {
    id: 'div-001',
    leagueId: 'league-001',
    seasonId: 'season-001',
    name: 'Division A',
    level: 'amateur',
  },
  {
    id: 'div-002',
    leagueId: 'league-001',
    seasonId: 'season-001',
    name: 'Division B',
    level: 'advanced',
  },
]

export let mockLeagueApplications: LeagueTeamApplication[] = [
  {
    id: 'app-001',
    leagueId: 'league-001',
    seasonId: 'season-001',
    divisionId: 'div-001',
    teamName: 'Медведи САО',
    captainName: 'Иван Петров',
    contactEmail: 'captain@example.com',
    teamId: 'team-001',
    status: 'pending',
    createdAt: '2026-06-12T10:00:00Z',
  },
  {
    id: 'app-002',
    leagueId: 'league-001',
    seasonId: 'season-001',
    divisionId: 'div-002',
    teamName: 'Ледовые Волки',
    captainName: 'Алексей Смирнов',
    contactEmail: 'wolves@example.com',
    status: 'approved',
    reviewComment: 'Команда допущена в Division B',
    createdAt: '2026-06-08T14:00:00Z',
  },
]

export let mockLeaguePosts: LeaguePost[] = [
  {
    id: 'post-001',
    leagueId: 'league-001',
    title: 'Набор команд на летний сезон',
    body: 'Принимаем заявки до 1 июля. Минимум 12 игроков в заявке.',
    pinned: true,
    publishedAt: '2026-06-01T09:00:00Z',
  },
]

export const mockLeagueAnalytics: Record<string, LeagueAnalytics> = {
  'league-001': {
    leagueId: 'league-001',
    profileViews: 1240,
    applicationsTotal: 8,
    applicationsPending: 3,
    applicationsApproved: 4,
    topDivisionName: 'Division A',
    conversionRate: 6.4,
  },
}

export function getMockLeagueSeasons(leagueId: string): LeagueSeason[] {
  return mockLeagueSeasons.filter((s) => s.leagueId === leagueId)
}

export function getMockLeagueDivisions(leagueId: string, seasonId?: string): LeagueDivision[] {
  return mockLeagueDivisions.filter(
    (d) => d.leagueId === leagueId && (!seasonId || d.seasonId === seasonId),
  )
}

export function getMockLeagueApplications(leagueId: string): LeagueTeamApplication[] {
  return mockLeagueApplications.filter((a) => a.leagueId === leagueId)
}

export function updateMockLeagueApplication(
  leagueId: string,
  applicationId: string,
  patch: Pick<LeagueTeamApplication, 'status' | 'reviewComment'>,
): LeagueTeamApplication | undefined {
  const index = mockLeagueApplications.findIndex(
    (a) => a.leagueId === leagueId && a.id === applicationId,
  )
  if (index === -1) return undefined
  mockLeagueApplications[index] = {...mockLeagueApplications[index], ...patch}
  return mockLeagueApplications[index]
}

export function addMockLeaguePost(
  leagueId: string,
  payload: Pick<LeaguePost, 'title' | 'body' | 'pinned'>,
): LeaguePost {
  const post: LeaguePost = {
    id: `post-${Date.now()}`,
    leagueId,
    title: payload.title,
    body: payload.body,
    pinned: payload.pinned,
    publishedAt: new Date().toISOString(),
  }
  mockLeaguePosts = [post, ...mockLeaguePosts]
  return post
}

export function getMockLeaguePosts(leagueId: string): LeaguePost[] {
  return mockLeaguePosts.filter((p) => p.leagueId === leagueId)
}

export function getMockLeagueAnalytics(leagueId: string): LeagueAnalytics {
  return (
    mockLeagueAnalytics[leagueId] ?? {
      leagueId,
      profileViews: 0,
      applicationsTotal: 0,
      applicationsPending: 0,
      applicationsApproved: 0,
      conversionRate: 0,
    }
  )
}

export function addMockLeagueApplication(
  leagueId: string,
  payload: {
    seasonId: string
    divisionId?: string
    teamId?: string
    teamName: string
    captainName: string
    contactEmail: string
  },
): LeagueTeamApplication | {error: string} {
  const duplicate = mockLeagueApplications.find(
    (a) =>
      a.leagueId === leagueId &&
      a.seasonId === payload.seasonId &&
      (a.teamId === payload.teamId || a.teamName === payload.teamName) &&
      a.status !== 'rejected',
  )
  if (duplicate) {
    return {error: 'Заявка этой команды уже подана на сезон'}
  }

  const application: LeagueTeamApplication = {
    id: `app-${Date.now()}`,
    leagueId,
    seasonId: payload.seasonId,
    divisionId: payload.divisionId,
    teamId: payload.teamId,
    teamName: payload.teamName,
    captainName: payload.captainName,
    contactEmail: payload.contactEmail,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  mockLeagueApplications = [application, ...mockLeagueApplications]

  const analytics = mockLeagueAnalytics[leagueId]
  if (analytics) {
    mockLeagueAnalytics[leagueId] = {
      ...analytics,
      applicationsTotal: analytics.applicationsTotal + 1,
      applicationsPending: analytics.applicationsPending + 1,
    }
  }

  return application
}

export function getMockTeamLeagueApplication(
  leagueId: string,
  teamId: string,
): LeagueTeamApplication | undefined {
  return mockLeagueApplications.find((a) => a.leagueId === leagueId && a.teamId === teamId)
}

const DEFAULT_CSV_MATCHES = [
  {
    homeTeam: 'Сокол Юг',
    awayTeam: 'Буран',
    startsAt: '2026-07-12T20:00:00+03:00',
    arenaName: 'Ледовый дворец на Ходынке',
  },
  {
    homeTeam: 'Медведи САО',
    awayTeam: 'Сокол Юг',
    startsAt: '2026-07-19T20:30:00+03:00',
    arenaName: 'Каток «Лужники»',
  },
]

/** @spec SPEC-FR-24.5.5 - Импорт расписания из CSV */
export function importMockLeagueScheduleCsv(
  leagueId: string,
  csvText?: string,
): LeagueScheduleImportResult {
  const lines = (csvText ?? '').trim().split('\n').filter(Boolean)
  const rows =
    lines.length > 1
      ? lines.slice(1).map((line) => {
          const [homeTeam, awayTeam, startsAt, arenaName] = line.split(',').map((v) => v.trim())
          return {homeTeam, awayTeam, startsAt, arenaName}
        })
      : DEFAULT_CSV_MATCHES

  let importedCount = 0
  let skippedCount = 0

  for (const row of rows) {
    if (!row.homeTeam || !row.awayTeam || !row.startsAt) {
      skippedCount += 1
      continue
    }
    addMockScheduleItem(leagueId, {
      homeTeam: row.homeTeam,
      awayTeam: row.awayTeam,
      startsAt: row.startsAt,
      arenaName: row.arenaName,
      status: 'scheduled',
    })
    importedCount += 1
  }

  return {
    leagueId,
    source: 'csv',
    importedCount,
    skippedCount,
    message:
      importedCount > 0
        ? `Импортировано ${importedCount} матчей`
        : 'Не удалось импортировать матчи — проверьте формат CSV',
  }
}
