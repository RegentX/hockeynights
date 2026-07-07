/**
 * SPEC-FR-2.1.2, SPEC-FR-2.2.2, SPEC-FR-4.1.2, SPEC-FR-5.1.2, SPEC-FR-5.1.3
 * SPEC-FR-6.3.2, SPEC-FR-7.2.2, SPEC-FR-11.2.1, SPEC-FR-11.2.2, SPEC-FR-12.1.2
 */

/** @spec SPEC-FR-1.3.1 - Роли пользователя (ТЗ §2, SRS §1.3) */
export type UserRole =
  | 'player' // SPEC-FR-1.3.1
  | 'goalie' // SPEC-FR-1.3.2
  | 'captain' // SPEC-FR-1.3.3
  | 'organizer' // SPEC-FR-1.3.4
  | 'coach' // SPEC-FR-1.3.6
  | 'admin' // SPEC-FR-1.3.5

/** @spec SPEC-FR-2.2.2 - Уровень мастерства */
export type SkillLevel = 'beginner' | 'amateur' | 'advanced' | 'league' | 'unknown'

/** @spec SPEC-FR-2.2.2 - Амплуа игрока */
export type PlayerPosition = 'goalie' | 'defense' | 'forward' | 'any'

/** @spec SPEC-FR-3.3.1 - Статус участия в событии */
export type AttendanceStatus = 'going' | 'not_going' | 'maybe'

/** @spec SPEC-FR-4.1.2 - Тип события */
export type EventType = 'game' | 'training' | 'open_ice'

/** @spec SPEC-FR-11.2.1 - Статус синхронизации источника */
export type SyncStatus = 'mock' | 'manual' | 'synced' | 'failed' | 'stale'

/** @spec SPEC-FR-24.7.9 - Статус модерации партнёрского контента */
export type PartnerModerationStatus = 'draft' | 'pending_review' | 'published' | 'rejected'

/** @spec SPEC-FR-11.2.2 - Метаданные внешнего источника */
export interface SourceMeta {
  /** @spec SPEC-FR-11.2.2 */
  source: 'mock' | 'manual' | 'partner_api' | 'import' | 'external'
  /** @spec SPEC-FR-11.2.2 */
  sourceUrl?: string
  /** @spec SPEC-FR-11.2.2 */
  updatedAt: string
  /** @spec SPEC-FR-11.2.1 */
  syncStatus: SyncStatus
}
