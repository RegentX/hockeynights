/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 */

import type {Session, User, PartnerMembership} from '@/entities/user/types'
import type {
  HockeyProfile,
  NotificationPreferences,
  PrivacySettings,
  ProfileSettings,
  SubscriptionState,
  VerificationStatus,
} from '@/entities/profile/types'

/** @spec SPEC-FR-2.1.1 - Mock пользователь по умолчанию */
export const mockUser: User = {
  id: 'user-001',
  displayName: 'Иван Петров',
  roles: ['player', 'captain'],
  city: 'Москва',
  createdAt: '2026-01-15T10:00:00Z',
}

/** @spec SPEC-FR-2.1.3 - Mock сессия */
const MOCK_SESSION_STORAGE_KEY = 'hockey-mock-session'

function loadPersistedSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(MOCK_SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function persistMockSession(session: Session): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(session))
}

function clearPersistedSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(MOCK_SESSION_STORAGE_KEY)
}

export let mockSession: Session = (() => {
  const persisted = loadPersistedSession()
  if (persisted) {
    mockUser.displayName = persisted.user.displayName
    mockUser.roles = persisted.user.roles
    mockUser.partnerMemberships = persisted.user.partnerMemberships
    return persisted
  }
  return {
    user: mockUser,
    isOnboarded: false,
  }
})()

/** @spec SPEC-FR-2.2.1 - Mock профиль */
export let mockProfile: HockeyProfile = {
  userId: 'user-001',
  fullName: 'Иван Петров',
  city: 'Москва',
  district: 'САО',
  metro: 'Динамо',
  position: 'forward',
  skillLevel: 'amateur',
  stickHand: 'left',
  availability: ['weekday_evening', 'sunday_morning'],
  preferredArenaIds: ['arena-001'],
  bio: 'Любитель, играю 2 раза в неделю',
  profileCompleteness: 72,
  karmaScore: 74,
  achievements: ['10 игр подряд без пропусков', '3 SOS-выручки', '5 отзывов без no-show'],
  verificationStatus: 'verified',
  participationHistory: [
    {
      eventId: 'event-001',
      eventTitle: 'Тренировка вторник',
      eventDate: '2026-06-10T19:00:00Z',
      teamName: 'Медведи САО',
      role: 'player',
      confirmed: true,
    },
    {
      eventId: 'event-002',
      eventTitle: 'Товарищеская игра',
      eventDate: '2026-06-07T20:30:00Z',
      teamName: 'Медведи САО',
      role: 'player',
      confirmed: true,
    },
    {
      eventId: 'event-003',
      eventTitle: 'Открытый лёд',
      eventDate: '2026-05-28T18:00:00Z',
      role: 'player',
      confirmed: false,
    },
  ],
}

/** @spec SPEC-FR-18.1.3 - Настройки уведомлений */
const defaultNotificationPreferences: NotificationPreferences = {
  inApp: true,
  email: true,
  push: false,
  maxMessenger: false,
  teamEvents: true,
  goalkeeperSos: true,
  eventReminders: true,
}

/** @spec SPEC-FR-18.1.4 - Настройки приватности */
const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  showContacts: false,
  showParticipationHistory: true,
}

/** @spec SPEC-FR-19.1.1 - Mock подписка */
const defaultSubscriptionState: SubscriptionState = {
  planId: 'free',
  status: 'mock',
  currentPeriodEndsAt: '2026-07-01T00:00:00Z',
  entitlements: ['basic_profile', 'team_chat_access'],
}

/** @spec SPEC-FR-18.1.1 - Сводные настройки профиля */
export let mockProfileSettings: ProfileSettings = {
  notificationPreferences: defaultNotificationPreferences,
  privacy: defaultPrivacySettings,
  subscription: defaultSubscriptionState,
}

/**
 * @spec SPEC-FR-2.1.2 - Обновление ролей после onboarding
 */
export function completeOnboarding(
  displayName: string,
  roles: User['roles'],
  partnerMemberships: PartnerMembership[] = [],
): Session {
  mockUser.displayName = displayName
  mockUser.roles = roles
  mockUser.partnerMemberships = partnerMemberships
  mockSession = {
    user: {...mockUser, roles, partnerMemberships},
    isOnboarded: true,
  }
  persistMockSession(mockSession)
  return mockSession
}

/** @spec SPEC-FR-2.1.1 - Сброс mock-сессии (выход) */
export function resetMockSession(): Session {
  mockUser.displayName = 'Иван Петров'
  mockUser.roles = ['player', 'captain']
  mockUser.partnerMemberships = undefined
  mockSession = {
    user: {...mockUser, partnerMemberships: undefined},
    isOnboarded: false,
  }
  clearPersistedSession()
  return mockSession
}

/**
 * @spec SPEC-FR-2.2.1 - Обновление Hockey ID
 */
export function updateMockProfile(profile: Partial<HockeyProfile>): HockeyProfile {
  mockProfile = {...mockProfile, ...profile}
  return mockProfile
}

/** @spec SPEC-FR-17.1.1 - Обновление статуса подтверждения */
export function updateMockVerificationStatus(status: VerificationStatus): HockeyProfile {
  mockProfile = {...mockProfile, verificationStatus: status}
  return mockProfile
}

/** @spec SPEC-FR-18.1.3 - Обновление уведомлений */
export function updateMockNotificationPreferences(
  partial: Partial<NotificationPreferences>,
): ProfileSettings {
  mockProfileSettings = {
    ...mockProfileSettings,
    notificationPreferences: {...mockProfileSettings.notificationPreferences, ...partial},
  }
  return mockProfileSettings
}

/** @spec SPEC-FR-18.1.4 - Обновление приватности */
export function updateMockPrivacySettings(partial: Partial<PrivacySettings>): ProfileSettings {
  mockProfileSettings = {
    ...mockProfileSettings,
    privacy: {...mockProfileSettings.privacy, ...partial},
  }
  return mockProfileSettings
}

/** @spec SPEC-FR-19.1.3 - Обновление mock подписки */
export function updateMockSubscriptionState(partial: Partial<SubscriptionState>): ProfileSettings {
  mockProfileSettings = {
    ...mockProfileSettings,
    subscription: {...mockProfileSettings.subscription, ...partial},
  }
  return mockProfileSettings
}
