/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import type {PartnerMembership} from '@/entities/user'

/** @spec SPEC-FR-1.3.7 - Demo partner entities */
export const DEMO_PARTNER_MEMBERSHIPS: PartnerMembership[] = [
  {kind: 'league', entityId: 'league-001', entityName: 'Ночная Хоккейная Лига (НХЛ)'},
  {kind: 'shop', entityId: 'shop-001', entityName: 'Pro-Hockey Москва'},
]

export function partnerCabinetPath(membership: PartnerMembership): string {
  return membership.kind === 'shop'
    ? `/partner/shops/${membership.entityId}`
    : `/partner/leagues/${membership.entityId}`
}

export function partnerCabinetLabel(membership: PartnerMembership): string {
  return membership.kind === 'shop' ? 'Кабинет магазина' : 'Кабинет лиги'
}
