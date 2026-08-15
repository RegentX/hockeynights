/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.4, SPEC-FR-8.2.1
 * SPEC-FR-17.1.1, SPEC-FR-18.1.3, SPEC-FR-18.1.4, SPEC-FR-19.1.1
 * SPEC-FR-24.1.4, SPEC-FR-24.2.3
 */

import type {PlayerPosition, SkillLevel} from '@/entities/common'

/** @spec SPEC-FR-18.1.4 - Кому видно поле профиля */
export type PrivacyAudience = 'public' | 'teams_only' | 'private'

/** Личные контакты (ПДн, 152-ФЗ) */
export interface ProfileContacts {
  phone?: string
  email?: string
  telegram?: string
  /** Мессенджер MAX */
  maxMessenger?: string
}

/** Приватность отдельных полей профиля */
export interface ProfileFieldPrivacy {
  birthDate: PrivacyAudience
  city: PrivacyAudience
  heightWeight: PrivacyAudience
  position: PrivacyAudience
  skillLevel: PrivacyAudience
  teams: PrivacyAudience
  bio: PrivacyAudience
  achievements: PrivacyAudience
  participationHistory: PrivacyAudience
  calendar: PrivacyAudience
  phone: PrivacyAudience
  email: PrivacyAudience
  telegram: PrivacyAudience
  maxMessenger: PrivacyAudience
}

/** @spec SPEC-FR-2.2.1 - Hockey ID профиль */
export interface HockeyProfile {
  /** @spec SPEC-FR-2.2.1 */
  userId: string
  /** @spec SPEC-FR-2.2.2 */
  fullName: string
  /** Аватар профиля (URL или data URL после загрузки) */
  avatarUrl?: string
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
  /** Дата рождения (YYYY-MM-DD) */
  birthDate?: string
  /** Рост, см */
  heightCm?: number
  /** Вес, кг */
  weightKg?: number
  /**
   * Игровой индекс (целое 3–9), связан с уровнем:
   * 3 дебютант … 9 мастер
   * Не путать с karmaScore
   */
  playerIndex?: number
  /** @spec SPEC-FR-2.2.2 */
  availability: string[]
  /** @spec SPEC-FR-2.2.2 */
  bio?: string
  /** Личные контакты — показываются только при настройках приватности */
  contacts?: ProfileContacts
  /** @spec SPEC-FR-2.2.4 */
  profileCompleteness: number
  /** @spec SPEC-FR-8.2.1 */
  karmaScore: number
  /** Микро-ачивки (простые текстовые бейджи) */
  achievements?: string[]
  /** @spec SPEC-FR-17.1.1 */
  verificationStatus?: VerificationStatus
  /** @spec SPEC-FR-2.3.1 - Основная команда игрока для отображения в карточке */
  teamName?: string
  /** Логотип основной команды */
  teamLogoUrl?: string
  /** @spec HOCFRONT-20 - Команды, в которых состоит игрок */
  teamIds?: string[]
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
  /** Тип события для раскрытой карточки */
  eventType?: 'game' | 'training' | 'open_ice'
  /** Арена проведения */
  arenaName?: string
  /** Соперник (для игр) */
  opponent?: string
  /** Итог матча / тренировки */
  result?: string
  /** Длительность в минутах */
  durationMinutes?: number
  /** Короткая заметка / контекст */
  note?: string
  /**
   * Чат, куда ушло приглашение (как после publish тренировки → team/event chat).
   * Deep-link: /messenger?chatId=
   */
  chatId?: string
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
  /** Какие контакты разрешено показать зрителю */
  visibleContacts?: ProfileContacts
  /** Какие поля профиля разрешено показать зрителю */
  visibleFields?: Partial<Record<keyof ProfileFieldPrivacy, boolean>>
  participationHistoryVisible: boolean
  participationHistory?: ParticipationRecord[]
  /** HOCFRONT-28CAL-D — можно ли показывать публичный календарь (going) */
  calendarVisible: boolean
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
  /** HOCFRONT-28CAL-D — видимость календаря на публичной странице */
  calendarVisibility: 'public' | 'teams_only' | 'private'
  /** Приватность отдельных полей (152-ФЗ) */
  fields: ProfileFieldPrivacy
  /**
   * Согласие на обработку персональных данных (152-ФЗ)
   * для хранения и выборочного отображения контактов
   */
  personalDataProcessingConsent: boolean
  personalDataConsentAt?: string
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
