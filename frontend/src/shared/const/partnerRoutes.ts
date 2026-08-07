/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 * HOCFRONT-25 — кабинет клуба
 */

import type {PartnerMembership} from '@/shared/types/user'

/** @spec SPEC-FR-1.3.7 - Demo partner entities */
export const DEMO_PARTNER_MEMBERSHIPS: PartnerMembership[] = [
  {kind: 'league', entityId: 'league-001', entityName: 'Ночная Хоккейная Лига (НХЛ)'},
  {kind: 'shop', entityId: 'shop-001', entityName: 'Pro-Hockey Москва'},
  {kind: 'club', entityId: 'club-001', entityName: 'ХК Медведи'},
]

export function partnerCabinetPath(membership: PartnerMembership): string {
  if (membership.kind === 'shop') return `/partner/shops/${membership.entityId}`
  if (membership.kind === 'club') return `/partner/clubs/${membership.entityId}`
  return `/partner/leagues/${membership.entityId}`
}

export function partnerCabinetLabel(membership: PartnerMembership): string {
  if (membership.kind === 'shop') return 'Кабинет магазина'
  if (membership.kind === 'club') return 'Кабинет клуба'
  return 'Кабинет лиги'
}
