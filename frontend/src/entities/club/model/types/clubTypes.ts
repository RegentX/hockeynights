/**
 * SPEC-FR-24.4.3 - Phase 2 сущность клуба
 */

/** @spec SPEC-FR-24.4.3 - Хоккейный клуб (Phase 2) */
export interface Club {
  id: string
  name: string
  city: string
  description?: string
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
}
