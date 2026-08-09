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
  /** HOCFRONT-34C — региональное покрытие «Россия» для фильтра каталога */
  {
    id: 'league-004',
    name: 'Казанская любительская хоккейная лига',
    region: 'Казань',
    level: 'beginner',
    websiteUrl: 'https://kzn-hl.example.ru',
    integrationStatus: 'manual',
    sourceMeta: {...mockSource, source: 'manual', syncStatus: 'manual'},
    visible: true,
    description: 'Набор для начинающих: вечерние тренировки и товарищеские матчи по выходным.',
    recruitingStatus: 'open',
    moderationStatus: 'published',
  },
  {
    id: 'league-005',
    name: 'Уральская хоккейная лига',
    region: 'Екатеринбург',
    level: 'advanced',
    websiteUrl: 'https://ural-hl.example.ru',
    integrationStatus: 'stale',
    sourceMeta: {...mockSource, source: 'import', syncStatus: 'stale'},
    visible: true,
    description: 'Соревновательный дивизион для опытных составов, сезон октябрь–апрель.',
    recruitingStatus: 'waitlist',
    moderationStatus: 'published',
  },
  {
    id: 'league-006',
    name: 'Сибирская ночная лига',
    region: 'Новосибирск',
    level: 'amateur',
    integrationStatus: 'mock',
    sourceMeta: mockSource,
    visible: true,
    description: 'Любительская лига Новосибирска, три дивизиона по уровню.',
    recruitingStatus: 'closed',
    moderationStatus: 'published',
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
  {
    leagueId: 'league-004',
    teamName: 'Барсы Казань',
    gamesPlayed: 8,
    wins: 5,
    losses: 3,
    points: 10,
  },
  {
    leagueId: 'league-004',
    teamName: 'Ак Барс Любители',
    gamesPlayed: 8,
    wins: 3,
    losses: 5,
    points: 6,
  },
  {
    leagueId: 'league-005',
    teamName: 'Урал Старт',
    gamesPlayed: 10,
    wins: 7,
    losses: 3,
    points: 14,
  },
  {
    leagueId: 'league-005',
    teamName: 'Екатеринбург Найтс',
    gamesPlayed: 10,
    wins: 4,
    losses: 6,
    points: 8,
  },
  {
    leagueId: 'league-006',
    teamName: 'Сибирь Ночь',
    gamesPlayed: 6,
    wins: 4,
    losses: 2,
    points: 8,
  },
  {
    leagueId: 'league-006',
    teamName: 'Новосибирск Лайн',
    gamesPlayed: 6,
    wins: 2,
    losses: 4,
    points: 4,
  },
]

/** @spec SPEC-FR-7.2.1 - Mock расписание */
export let mockSchedule: LeagueScheduleItem[] = [
  {
    id: 'sched-001',
    leagueId: 'league-001',
    homeTeam: 'Медведи САО',
    awayTeam: 'Ледовые Волки',
    startsAt: '2026-08-02T20:00:00+03:00',
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
    startsAt: '2026-08-22T21:00:00+03:00',
    arenaName: 'Каток «Лужники»',
    status: 'scheduled',
  },
  {
    id: 'sched-003',
    leagueId: 'league-004',
    homeTeam: 'Барсы Казань',
    awayTeam: 'Ак Барс Любители',
    startsAt: '2026-08-25T19:30:00+03:00',
    arenaName: 'Татнефть Арена',
    status: 'scheduled',
  },
  {
    id: 'sched-004',
    leagueId: 'league-005',
    homeTeam: 'Урал Старт',
    awayTeam: 'Екатеринбург Найтс',
    startsAt: '2026-08-28T20:00:00+05:00',
    arenaName: 'Дворец спорта Уралец',
    status: 'scheduled',
  },
  {
    id: 'sched-005',
    leagueId: 'league-006',
    homeTeam: 'Сибирь Ночь',
    awayTeam: 'Новосибирск Лайн',
    startsAt: '2026-09-05T21:00:00+07:00',
    arenaName: 'ЛДС Сибирь',
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
