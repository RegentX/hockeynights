/**
 * HOCFRONT-25 — подписи ролей штаба клуба
 */

import type {ClubStaffMember} from '@/entities/club'

export const STAFF_ROLE_LABELS: Record<ClubStaffMember['role'], string> = {
  head_coach: 'Главный тренер',
  assistant_coach: 'Ассистент тренера',
  team_admin: 'Админ команды',
  media: 'Медиа',
  manager: 'Менеджер',
}

export const STAFF_ROLE_OPTIONS = (
  Object.entries(STAFF_ROLE_LABELS) as [ClubStaffMember['role'], string][]
).map(([value, content]) => ({value, content}))
