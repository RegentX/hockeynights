/**
 * SPEC-FR-24.4.3 - Phase 2 сущность клуба
 * HOCFRONT-25 — контакты и штаб для кабинета клуба
 */

/** @spec SPEC-FR-24.4.3 - Хоккейный клуб (Phase 2) */
export interface Club {
  id: string
  name: string
  city: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  homeArenaId?: string
  leagueIds?: string[]
  teamIds: string[]
  squads: ClubSquad[]
  staff: ClubStaffMember[]
}

/** @spec SPEC-FR-24.4.3 - Состав/команда внутри клуба */
export interface ClubSquad {
  id: string
  name: string
  level: 'amateur' | 'advanced' | 'youth' | 'women'
  teamId?: string
  season?: string
}

/** @spec SPEC-FR-24.4.3 - Сотрудник/штаб клуба */
export interface ClubStaffMember {
  userId: string
  displayName: string
  role: 'head_coach' | 'assistant_coach' | 'team_admin' | 'media' | 'manager'
  contactEmail?: string
  contactPhone?: string
}

/** HOCFRONT-25 — payload обновления публичного профиля клуба */
export interface UpdateClubPayload {
  name?: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  staff?: ClubStaffMember[]
}

/** HOCFRONT-25 — создание private_club тренировки */
export interface CreatePrivateClubTrainingPayload {
  title: string
  startsAt: string
  endsAt: string
  arenaId: string
  teamId?: string
  requiredSkillLevel?: import('@/shared/types/common').SkillLevel
}
