/**
 * SPEC-FR-11.1.1, SPEC-FR-11.1.2, SPEC-FR-11.2.1, SPEC-FR-11.2.2
 */

import {apiRequest} from '@/shared/api/client'
import type {AdminEntityType, CreateAdminEntityPayload, PartnerModerationItem, SourceStatusItem} from '@/entities/admin/types'
import type {PartnerModerationStatus} from '@/entities/common/types'
import type {Arena} from '@/entities/arena/types'
import type {League} from '@/entities/league/types'
import type {Shop} from '@/entities/shop/types'

/**
 * @spec SPEC-FR-11.1.1 - Создать сущность
 */
export function createAdminEntity(payload: CreateAdminEntityPayload): Promise<Arena | League | Shop> {
  const path =
    payload.entityType === 'arena' ? '/admin/arenas' :
    payload.entityType === 'league' ? '/admin/leagues' :
    '/admin/shops'
  return apiRequest(path, {method: 'POST', body: payload})
}

/**
 * @spec SPEC-FR-11.1.2 - Изменить видимость
 */
export function updateEntityVisibility(
  entityId: string,
  entityType: AdminEntityType,
  visible: boolean,
): Promise<{entityId: string; visible: boolean}> {
  return apiRequest(`/admin/entities/${entityId}/visibility`, {
    method: 'PATCH',
    body: {entityType, visible},
  })
}

/**
 * @spec SPEC-FR-11.2.1 - Статусы источников
 */
export function fetchSourceStatuses(): Promise<SourceStatusItem[]> {
  return apiRequest<SourceStatusItem[]>('/admin/sources')
}

/** @spec SPEC-FR-24.7.9 - Очередь модерации партнёров */
export function fetchPartnerModerationQueue(): Promise<PartnerModerationItem[]> {
  return apiRequest<PartnerModerationItem[]>('/admin/partner-moderation')
}

/** @spec SPEC-FR-24.7.9 - Решение по модерации */
export function moderatePartnerItem(
  itemId: string,
  status: PartnerModerationStatus,
): Promise<PartnerModerationItem> {
  return apiRequest<PartnerModerationItem>(`/admin/partner-moderation/${itemId}`, {
    method: 'PATCH',
    body: {status},
  })
}
