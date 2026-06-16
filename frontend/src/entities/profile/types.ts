/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4, SPEC-FR-8.2.1
 */

import type { PlayerPosition, SkillLevel } from '@/entities/common/types'

/** @spec SPEC-FR-2.2.1 - Hockey ID профиль */
export interface HockeyProfile {
  /** @spec SPEC-FR-2.2.1 */
  userId: string
  /** @spec SPEC-FR-2.2.2 */
  fullName: string
  /** @spec SPEC-FR-2.2.2 */
  city: string
  /** @spec SPEC-FR-2.2.2 */
  district?: string
  /** @spec SPEC-FR-2.2.2 */
  metro?: string
  /** @spec SPEC-FR-2.2.2 */
  position: PlayerPosition
  /** @spec SPEC-FR-2.2.2 */
  skillLevel: SkillLevel
  /** @spec SPEC-FR-2.2.2 */
  stickHand?: 'left' | 'right' | 'unknown'
  /** @spec SPEC-FR-2.2.2 */
  availability: string[]
  /** @spec SPEC-FR-2.2.3 */
  preferredArenaIds: string[]
  /** @spec SPEC-FR-2.2.2 */
  bio?: string
  /** @spec SPEC-FR-2.2.4 */
  profileCompleteness: number
  /** @spec SPEC-FR-8.2.1 */
  karmaScore: number
  /** Микро-ачивки (простые текстовые бейджи) */
  achievements?: string[]
}

/** @spec SPEC-FR-2.3.1 - Карточка игрока для списка */
export interface PlayerListItem extends HockeyProfile {
  /** @spec SPEC-FR-2.3.1 */
  displayName: string
  /** @spec SPEC-FR-2.3.1 */
  avatarUrl?: string
}
