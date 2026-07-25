/**
 * SPEC-FR-3.1.1, SPEC-FR-3.1.2, SPEC-FR-3.2.1, SPEC-FR-3.2.2
 * SPEC-FR-21.1.1, SPEC-FR-21.1.2, SPEC-FR-21.1.5
 * SPEC-FR-24.4.1, SPEC-FR-24.4.2
 */

import type {PlayerPosition, SkillLevel} from '@/shared/types/common'
import type {TeamRole} from '@/shared/types/team'

export type {TeamRole} from '@/shared/types/team'

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
  /** HOCFRONT-25 / TASK-04-02 — краткое описание для карточки */
  shortDescription?: string
  /** HOCFRONT-25 / TASK-04-02 — логотип / логовище */
  logoUrl?: string
  /** @spec SPEC-FR-3.1.2 */
  memberIds: string[]
  /** @spec SPEC-FR-24.4.2 - Привязка к лиге (клубное лицо Phase 1) */
  leagueId?: string
  /** @spec SPEC-FR-24.4.2 - Домашняя арена */
  homeArenaId?: string
  /** HOCFRONT-25 — клуб, к которому относится команда */
  clubId?: string
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
  rosterStatus: 'active' | 'bench' | 'invited' | 'declined' | 'removed'
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
  /** HOCFRONT-25 — краткое описание карточки */
  shortDescription?: string
  /** @spec SPEC-FR-24.4.2 */
  leagueId?: string
  /** @spec SPEC-FR-24.4.2 */
  homeArenaId?: string
  /** Логотип / фото команды (URL или data URL) */
  logoUrl?: string
  /** Игроки, приглашённые при создании */
  playerIds?: string[]
  /** Тренеры / штаб при создании */
  coachIds?: string[]
  /** Создать группу в мессенджере (по умолчанию true) */
  createMessengerChat?: boolean
  /** Публичный чат, доступный в поиске (по умолчанию true) */
  messengerChatPublic?: boolean
}

/** @spec SPEC-FR-3.1.1 - Параметры фильтра списка команд */
export interface TeamsFilterParams {
  leagueId?: string
  q?: string
  playerId?: string
  city?: string
  skillLevel?: SkillLevel
}

/** HOCFRONT-25 — статус приглашения в команду */
export type TeamInviteStatus = 'sent' | 'received' | 'accepted' | 'declined' | 'expired'

/** @spec SPEC-FR-21.1.2 - Приглашение в команду (зарегистрированный или email) */
export interface TeamInvite {
  id: string
  teamId: string
  /** Email для незарегистрированных */
  email?: string
  /** Зарегистрированный игрок */
  userId?: string
  displayName?: string
  invitedByUserId: string
  status: TeamInviteStatus
  createdAt: string
  updatedAt?: string
}

/** @spec SPEC-FR-21.1.6, SPEC-FR-24.3.2 - Раскладка на тренировке */
export interface TrainingLineupAssignment {
  eventId: string
  userId: string
  position: PlayerPosition
  side: 'red' | 'white' | 'bench' | 'backlog'
  line?: number
}

/** HOCFRONT-25 — статус согласования раскладки перед тренировкой */
export type LineupApprovalStatus = 'draft' | 'pending_coach' | 'approved' | 'rejected' | 'published'

/** HOCFRONT-25 — назначение игрока в черновике тренировки */
export interface TrainingDraftAssignment {
  userId: string
  displayName: string
  position: PlayerPosition
  side: 'red' | 'white' | 'bench'
  line?: number
}

/** HOCFRONT-25 — черновик тренировки + раскладка (ожидает тренера / публикацию) */
export interface TrainingLineupDraft {
  id: string
  clubId: string
  teamId: string
  title: string
  startsAt: string
  endsAt: string
  arenaId: string
  status: LineupApprovalStatus
  createdByUserId: string
  createdByIsCoach: boolean
  approvedByUserId?: string
  rejectedReason?: string
  note?: string
  assignments: TrainingDraftAssignment[]
  eventId?: string
  createdAt: string
  updatedAt: string
}

/** HOCFRONT-25 — создание черновика тренировки с раскладкой */
export interface CreateTrainingLineupDraftPayload {
  teamId: string
  title: string
  startsAt: string
  endsAt: string
  arenaId: string
  assignments: TrainingDraftAssignment[]
  note?: string
}
