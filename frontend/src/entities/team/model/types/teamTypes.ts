/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-FR-21.1.1, SPEC-FR-21.1.2, SPEC-FR-21.1.5
 * SPEC-FR-24.4.1, SPEC-FR-24.4.2
 */

import type {PlayerPosition, SkillLevel} from '@/entities/common'

/** @spec SPEC-FR-21.1.5 - Роли участника команды */
export type TeamRole = 'owner' | 'captain' | 'coach' | 'team_admin' | 'player'

/** @spec SPEC-FR-3.1.1 - Команда */
export interface Team {
  /** @spec SPEC-FR-3.1.1 */
  id: string
  /** @spec SPEC-FR-3.1.1 */
  name: string
  /** @spec SPEC-FR-3.1.1 */
  city: string
  /** @spec SPEC-FR-3.1.1 */
  skillLevel: SkillLevel
  /** @spec SPEC-FR-3.1.1 */
  captainUserId: string
  /** @spec SPEC-FR-21.1.5 */
  ownerUserId?: string
  /** @spec SPEC-FR-3.1.1 */
  description?: string
  /** @spec SPEC-FR-3.1.2 */
  memberIds: string[]
  /** @spec SPEC-FR-24.4.2 - Привязка к лиге (клубное лицо Phase 1) */
  leagueId?: string
  /** @spec SPEC-FR-24.4.2 - Домашняя арена */
  homeArenaId?: string
}

/** @spec SPEC-FR-3.2.1 - Участник состава */
export interface RosterMember {
  /** @spec SPEC-FR-3.2.1 */
  teamId: string
  /** @spec SPEC-FR-3.2.1 */
  userId: string
  /** @spec SPEC-FR-3.2.1 */
  displayName: string
  /** @spec SPEC-FR-3.2.1 */
  position: PlayerPosition
  /** @spec SPEC-FR-21.1.5 */
  teamRole?: TeamRole
  /** @spec SPEC-FR-3.2.2 */
  rosterStatus: 'active' | 'bench' | 'invited' | 'removed'
  /** @spec SPEC-FR-3.2.1 */
  joinedAt: string
}

/** @spec SPEC-FR-3.1.1 - Payload создания команды */
export interface CreateTeamPayload {
  /** @spec SPEC-FR-3.1.1 */
  name: string
  /** @spec SPEC-FR-3.1.1 */
  city: string
  /** @spec SPEC-FR-3.1.1 */
  skillLevel: SkillLevel
  /** @spec SPEC-FR-3.1.1 */
  description?: string
}

/** @spec SPEC-FR-21.1.2 - Email-приглашение незарегистрированному игроку */
export interface TeamInvite {
  id: string
  teamId: string
  email: string
  invitedByUserId: string
  status: 'sent' | 'accepted' | 'expired'
  createdAt: string
}

/** @spec SPEC-FR-21.1.6, SPEC-FR-24.3.2 - Раскладка на тренировке */
export interface TrainingLineupAssignment {
  eventId: string
  userId: string
  position: PlayerPosition
  side: 'red' | 'white' | 'bench' | 'backlog'
  line?: number
}
