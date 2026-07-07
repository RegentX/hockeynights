/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 */

import type {PartnerModerationStatus, SkillLevel, SourceMeta, SyncStatus} from '@/entities/common'

/** @spec SPEC-FR-7.1.1 - Любительская лига */
export interface League {
  /** @spec SPEC-FR-7.1.1 */
  id: string
  /** @spec SPEC-FR-7.1.2 */
  name: string
  /** @spec SPEC-FR-7.1.2 */
  region: string
  /** @spec SPEC-FR-7.1.2 */
  level?: SkillLevel
  /** @spec SPEC-FR-7.1.2 */
  websiteUrl?: string
  /** @spec SPEC-FR-7.1.2 */
  integrationStatus: SyncStatus
  /** @spec SPEC-FR-7.2.2 */
  sourceMeta: SourceMeta
  /** @spec SPEC-FR-11.1.2 */
  visible?: boolean
  /** @spec SPEC-FR-24.5.3 */
  description?: string
  /** @spec SPEC-FR-24.5.3 */
  contactEmail?: string
  /** @spec SPEC-FR-24.5.3 */
  contactPhone?: string
  /** @spec SPEC-FR-24.5.3 */
  rulesSummary?: string
  /** @spec SPEC-FR-24.5.3 */
  recruitingStatus?: 'open' | 'closed' | 'waitlist'
  /** @spec SPEC-FR-24.7.9 */
  moderationStatus?: PartnerModerationStatus
}

/** @spec SPEC-FR-7.2.1 - Строка турнирной таблицы */
export interface LeagueStanding {
  /** @spec SPEC-FR-7.2.1 */
  leagueId: string
  /** @spec SPEC-FR-7.2.1 */
  teamName: string
  /** @spec SPEC-FR-7.2.1 */
  gamesPlayed: number
  /** @spec SPEC-FR-7.2.1 */
  wins: number
  /** @spec SPEC-FR-7.2.1 */
  losses: number
  /** @spec SPEC-FR-7.2.1 */
  points: number
}

/** @spec SPEC-FR-7.2.1 - Матч в расписании лиги */
export interface LeagueScheduleItem {
  /** @spec SPEC-FR-7.2.1 */
  id: string
  /** @spec SPEC-FR-7.2.1 */
  leagueId: string
  /** @spec SPEC-FR-7.2.1 */
  homeTeam: string
  /** @spec SPEC-FR-7.2.1 */
  awayTeam: string
  /** @spec SPEC-FR-7.2.1 */
  startsAt: string
  /** @spec SPEC-FR-7.2.1 */
  arenaName?: string
  /** @spec SPEC-FR-24.5.5 */
  homeScore?: number
  /** @spec SPEC-FR-24.5.5 */
  awayScore?: number
  /** @spec SPEC-FR-24.5.5 */
  status?: 'scheduled' | 'completed' | 'cancelled'
}

/** @spec SPEC-FR-24.5.4 - Payload заявки команды */
export interface LeagueApplicationPayload {
  seasonId: string
  divisionId?: string
  teamId?: string
  teamName: string
  captainName: string
  contactEmail: string
}

/** @spec SPEC-FR-24.5.4 - Сезон лиги */
export interface LeagueSeason {
  id: string
  leagueId: string
  name: string
  status: 'draft' | 'active' | 'completed'
}

/** @spec SPEC-FR-24.5.4 - Дивизион внутри сезона */
export interface LeagueDivision {
  id: string
  leagueId: string
  seasonId: string
  name: string
  level: SkillLevel
}

/** @spec SPEC-FR-24.5.4 - Заявка команды в лигу */
export type LeagueApplicationStatus = 'pending' | 'approved' | 'rejected' | 'waitlist'

export interface LeagueTeamApplication {
  id: string
  leagueId: string
  seasonId: string
  divisionId?: string
  teamName: string
  captainName: string
  contactEmail: string
  teamId?: string
  status: LeagueApplicationStatus
  reviewComment?: string
  createdAt: string
}

/** @spec SPEC-FR-24.5.6 - Публикация лиги */
export interface LeaguePost {
  id: string
  leagueId: string
  title: string
  body: string
  pinned: boolean
  publishedAt: string
}

/** @spec SPEC-FR-24.5.7 - Аналитика лиги */
export interface LeagueAnalytics {
  leagueId: string
  profileViews: number
  applicationsTotal: number
  applicationsPending: number
  applicationsApproved: number
  topDivisionName?: string
  conversionRate: number
}

/** @spec SPEC-FR-24.5.5 - Результат импорта расписания */
export interface LeagueScheduleImportResult {
  leagueId: string
  source: 'csv' | 'api'
  importedCount: number
  skippedCount: number
  message?: string
}
