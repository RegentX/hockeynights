/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4, SPEC-FR-8.2.1
 * SPEC-FR-17.1.1, SPEC-FR-18.1.3, SPEC-FR-18.1.4, SPEC-FR-19.1.1
 * SPEC-FR-24.1.4, SPEC-FR-24.2.3
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
  /** @spec SPEC-FR-17.1.1 */
  verificationStatus?: VerificationStatus
  /** @spec SPEC-FR-2.2.5, SPEC-FR-24.1.4 */
  participationHistory?: ParticipationRecord[]
  /** @spec SPEC-FR-5.2.4, SPEC-FR-24.2.3 (goalie only) */
  goalieReliabilityScore?: number
}

/** @spec SPEC-FR-24.1.4 - Запись об участии в событии */
export interface ParticipationRecord {
  eventId: string
  eventTitle: string
  eventDate: string
  teamName?: string
  role: 'player' | 'goalie' | 'coach'
  confirmed: boolean
}

/** @spec SPEC-FR-2.3.1 - Карточка игрока для списка */
export interface PlayerListItem extends HockeyProfile {
  /** @spec SPEC-FR-2.3.1 */
  displayName: string
  /** @spec SPEC-FR-2.3.1 */
  avatarUrl?: string
}

/** @spec SPEC-FR-24.1.3 - Публичный просмотр профиля игрока */
export interface PublicPlayerView {
  player: PlayerListItem
  visibility: 'full' | 'limited' | 'hidden'
  contactsVisible: boolean
  participationHistoryVisible: boolean
  participationHistory?: ParticipationRecord[]
}

/** @spec SPEC-FR-17.1.1 - Статус подтверждения пользователя */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

/** @spec SPEC-FR-18.1.3 - Каналы уведомлений в профиле */
export interface NotificationPreferences {
  inApp: boolean
  email: boolean
  push: boolean
  maxMessenger: boolean
  teamEvents: boolean
  goalkeeperSos: boolean
  eventReminders: boolean
}

/** @spec SPEC-FR-18.1.4 - Настройки видимости профиля */
export interface PrivacySettings {
  profileVisibility: 'public' | 'teams_only' | 'verified_only' | 'private'
  showContacts: boolean
  showParticipationHistory: boolean
}

/** @spec SPEC-FR-19.1.1 - Состояние mock-подписки */
export interface SubscriptionState {
  planId: 'free' | 'player_plus' | 'team_pro'
  status: 'active' | 'trial' | 'cancelled' | 'mock'
  currentPeriodEndsAt?: string
  entitlements: string[]
}

/** @spec SPEC-FR-18.1.1 - Настройки личного кабинета профиля */
export interface ProfileSettings {
  notificationPreferences: NotificationPreferences
  privacy: PrivacySettings
  subscription: SubscriptionState
}
