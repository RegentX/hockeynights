/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 */

import type {League, LeagueScheduleItem, LeagueStanding} from '@/entities/league'

const mockSource = {
  source: 'mock' as const,
  updatedAt: '2026-06-05T12:00:00Z',
  syncStatus: 'mock' as const,
}

/** @spec SPEC-FR-7.1.1 - Mock лиги */
export let mockLeagues: League[] = [
  {
    id: 'league-001',
    name: 'Ночная Хоккейная Лига (НХЛ)',
    region: 'Москва',
    level: 'amateur',
    websiteUrl: 'https://nhl-amateur.example.ru',
    integrationStatus: 'mock',
    sourceMeta: mockSource,
    visible: true,
    description:
      'Любительская лига Москвы: вечерние игры, несколько дивизионов, набор команд круглый год.',
    contactEmail: 'office@nhl-amateur.example.ru',
    contactPhone: '+7 495 111-22-33',
    rulesSummary: '6x6, периоды по 15 минут, минимум 12 игроков в заявке',
    recruitingStatus: 'open',
    moderationStatus: 'published',
  },
  {
    id: 'league-002',
    name: 'ЛХЛ-77',
    region: 'Москва',
    level: 'advanced',
    websiteUrl: 'https://lhl77.example.ru',
    integrationStatus: 'manual',
    sourceMeta: {...mockSource, source: 'manual', syncStatus: 'manual'},
    visible: true,
  },
  {
    id: 'league-003',
    name: 'СПбХЛ',
    region: 'Санкт-Петербург',
    level: 'amateur',
    websiteUrl: 'https://spbhl.example.ru',
    integrationStatus: 'stale',
    sourceMeta: {...mockSource, syncStatus: 'stale'},
    visible: true,
  },
]

/** @spec SPEC-FR-7.2.1 - Mock таблицы */
export const mockStandings: LeagueStanding[] = [
  {
    leagueId: 'league-001',
    teamName: 'Медведи САО',
    gamesPlayed: 12,
    wins: 8,
    losses: 4,
    points: 16,
  },
  {
    leagueId: 'league-001',
    teamName: 'Ледовые Волки',
    gamesPlayed: 12,
    wins: 7,
    losses: 5,
    points: 14,
  },
  {
    leagueId: 'league-001',
    teamName: 'Динамо Любители',
    gamesPlayed: 12,
    wins: 5,
    losses: 7,
    points: 10,
  },
  {leagueId: 'league-002', teamName: 'ХК Сокол', gamesPlayed: 10, wins: 6, losses: 4, points: 12},
]

/** @spec SPEC-FR-7.2.1 - Mock расписание */
export let mockSchedule: LeagueScheduleItem[] = [
  {
    id: 'sched-001',
    leagueId: 'league-001',
    homeTeam: 'Медведи САО',
    awayTeam: 'Ледовые Волки',
    startsAt: '2026-06-10T20:00:00+03:00',
    arenaName: 'Ледовый дворец на Ходынке',
    homeScore: 4,
    awayScore: 2,
    status: 'completed',
  },
  {
    id: 'sched-002',
    leagueId: 'league-001',
    homeTeam: 'Динамо Любители',
    awayTeam: 'Медведи САО',
    startsAt: '2026-06-17T21:00:00+03:00',
    arenaName: 'Каток «Лужники»',
    status: 'scheduled',
  },
]

/** @spec SPEC-FR-24.5.5 - Добавить матч в расписание */
export function addMockScheduleItem(
  leagueId: string,
  payload: Omit<LeagueScheduleItem, 'id' | 'leagueId'>,
): LeagueScheduleItem {
  const item: LeagueScheduleItem = {
    id: `sched-${Date.now()}`,
    leagueId,
    ...payload,
    status: payload.status ?? 'scheduled',
  }
  mockSchedule = [...mockSchedule, item]
  return item
}

/** @spec SPEC-FR-24.5.5 - Обновить матч / результат */
export function updateMockScheduleItem(
  leagueId: string,
  scheduleId: string,
  patch: Partial<LeagueScheduleItem>,
): LeagueScheduleItem | undefined {
  const index = mockSchedule.findIndex((s) => s.leagueId === leagueId && s.id === scheduleId)
  if (index === -1) return undefined
  mockSchedule[index] = {...mockSchedule[index], ...patch}
  return mockSchedule[index]
}

/** @spec SPEC-FR-24.5.5 - Обновить строку таблицы */
export function updateMockStanding(
  leagueId: string,
  teamName: string,
  patch: Partial<Omit<LeagueStanding, 'leagueId' | 'teamName'>>,
): LeagueStanding | undefined {
  const index = mockStandings.findIndex((s) => s.leagueId === leagueId && s.teamName === teamName)
  if (index === -1) return undefined
  const next = {...mockStandings[index], ...patch}
  if (patch.wins !== undefined || patch.losses !== undefined) {
    next.gamesPlayed = (next.wins ?? 0) + (next.losses ?? 0)
    next.points = (next.wins ?? 0) * 2
  }
  mockStandings[index] = next
  return mockStandings[index]
}

/**
 * @spec SPEC-FR-11.1.1 - Добавить лигу
 */
export function addMockLeague(league: League): League {
  mockLeagues = [...mockLeagues, league]
  return league
}

/**
 * @spec SPEC-FR-11.1.2 - Скрыть лигу
 */
export function setLeagueVisibility(leagueId: string, visible: boolean): void {
  mockLeagues = mockLeagues.map((l) => (l.id === leagueId ? {...l, visible} : l))
}

/** @spec SPEC-FR-24.5.3 - Обновить партнёрский профиль лиги */
export function updateMockLeagueProfile(
  leagueId: string,
  patch: Partial<League>,
): League | undefined {
  const index = mockLeagues.findIndex((l) => l.id === leagueId)
  if (index === -1) return undefined
  mockLeagues[index] = {
    ...mockLeagues[index],
    ...patch,
    moderationStatus: patch.moderationStatus ?? 'pending_review',
    sourceMeta: {
      ...mockLeagues[index].sourceMeta,
      updatedAt: new Date().toISOString(),
      syncStatus: 'manual',
    },
  }
  return mockLeagues[index]
}
