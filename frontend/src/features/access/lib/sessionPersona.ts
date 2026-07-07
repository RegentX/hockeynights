/**
 * SPEC-FR-1.3.7, SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {routes} from '@/shared/const/appRoutes'
import {partnerCabinetPath} from '@/shared/const/partnerRoutes'
import type {UserRole} from '@/shared/types/common'
import type {Session} from '@/shared/types/user'

const PLAYER_PERSONA_ROLES: UserRole[] = ['player', 'goalie', 'captain', 'coach']

/** Роли, при которых показывается Hockey ID игрока/тренера */
export function hasPlayerPersona(roles: UserRole[]): boolean {
  return roles.some((role) => PLAYER_PERSONA_ROLES.includes(role))
}

/** Партнёрский кабинет — основной интерфейс, без Hockey ID игрока */
export function shouldUsePartnerWorkspace(session: Session | undefined): boolean {
  if (!session?.isOnboarded) return false
  if (session.user.roles.includes('admin')) return false
  const hasPartner = (session.user.partnerMemberships?.length ?? 0) > 0
  if (!hasPartner) return false
  return !hasPlayerPersona(session.user.roles)
}

export function getPrimaryPartnerPath(session: Session): string {
  const membership = session.user.partnerMemberships?.[0]
  return membership ? partnerCabinetPath(membership) : routes.partner
}

/** Человекочитаемая подпись текущей демо-персоны */
export function describeSessionPersona(session: Session): string {
  if (session.user.roles.includes('admin')) return 'Администратор'
  const partner = session.user.partnerMemberships?.[0]
  if (partner?.kind === 'league') return 'Представитель лиги'
  if (partner?.kind === 'shop') return 'Представитель магазина'
  if (session.user.roles.includes('coach')) return 'Тренер'
  if (session.user.roles.includes('captain')) return 'Капитан'
  if (session.user.roles.includes('goalie')) return 'Вратарь'
  if (session.user.roles.includes('organizer')) return 'Организатор'
  return 'Игрок'
}
