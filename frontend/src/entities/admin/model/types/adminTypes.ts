/**
 * SPEC-FR-11.1.1, SPEC-FR-11.1.2, SPEC-FR-11.2.1, SPEC-FR-11.2.2
 */

import type {PartnerModerationStatus, SourceMeta} from '@/entities/common'

/** @spec SPEC-FR-11.1.1 - Тип сущности админки */
export type AdminEntityType = 'arena' | 'league' | 'shop'

/** @spec SPEC-FR-11.2.1 - Статус источника данных */
export interface SourceStatusItem {
  /** @spec SPEC-FR-11.2.1 */
  entityType: AdminEntityType
  /** @spec SPEC-FR-11.2.1 */
  entityId: string
  /** @spec SPEC-FR-11.2.1 */
  entityName: string
  /** @spec SPEC-FR-11.2.2 */
  sourceMeta: SourceMeta
  /** @spec SPEC-FR-11.1.2 */
  visible: boolean
}

/** @spec SPEC-FR-11.1.1 - Payload создания сущности */
export interface CreateAdminEntityPayload {
  /** @spec SPEC-FR-11.1.1 */
  entityType: AdminEntityType
  /** @spec SPEC-FR-11.1.1 */
  name: string
  /** @spec SPEC-FR-11.1.1 */
  city?: string
  /** @spec SPEC-FR-11.1.1 */
  websiteUrl?: string
}

/** @spec SPEC-FR-24.7.9 - Элемент очереди модерации партнёров */
export type PartnerModerationKind = 'league_profile' | 'shop_profile' | 'shop_product'

export interface PartnerModerationItem {
  id: string
  kind: PartnerModerationKind
  entityId: string
  parentId?: string
  title: string
  subtitle?: string
  moderationStatus: PartnerModerationStatus
  submittedAt: string
}
