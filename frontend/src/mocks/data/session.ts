/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 */

import type {
  HockeyProfile,
  NotificationPreferences,
  PrivacySettings,
  ProfileSettings,
  SubscriptionState,
  VerificationStatus,
} from '@/entities/profile'
import {DEFAULT_FIELD_PRIVACY, normalizePrivacySettings} from '@/entities/profile'
import type {PartnerMembership, Session, User} from '@/entities/user'
import {getAllowedPathPrefixes, getPersonaHomePath} from '@/features/access'
import {clearPendingLocalUser, getPendingRegistration} from '@/features/auth/lib/localAuthMemory'
import {getPersonaOnboardingPayload} from '@/mocks/data/personas'
import {mockPlayers} from '@/mocks/data/players'
import {canUseLocalStorage} from '@/shared/lib/canUseLocalStorage'

/** @spec SPEC-FR-2.1.1 - Mock пользователь по умолчанию */
export const mockUser: User = {
  id: 'user-001',
  displayName: 'Петров Иван Сергеевич',
  roles: ['player', 'captain'],
  city: 'Москва',
  createdAt: '2026-01-15T10:00:00Z',
}

/** @spec SPEC-FR-2.1.3 - Mock сессия */
const MOCK_SESSION_STORAGE_KEY = 'hockey-mock-session'

function loadPersistedSession(): Session | null {
  if (!canUseLocalStorage()) return null
  try {
    const raw = window.localStorage.getItem(MOCK_SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

function persistMockSession(session: Session): void {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(session))
}

function clearPersistedSession(): void {
  if (!canUseLocalStorage()) return
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
  fullName: 'Петров Иван Сергеевич',
  avatarUrl: 'https://placehold.co/400x560/1c3d5a/ffffff?text=%D0%9F%D0%98',
  city: 'Москва',
  district: 'САО',
  metro: 'Динамо',
  position: 'forward',
  skillLevel: 'theorist',
  stickHand: 'left',
  birthDate: '1981-11-19',
  heightCm: 185,
  weightKg: 92,
  playerIndex: 6,
  availability: ['weekday_evening', 'sunday_morning'],
  bio: 'Любитель, играю 2 раза в неделю',
  contacts: {
    phone: '+7 (999) 123-45-67',
    email: 'ivan.petrov@example.ru',
    telegram: '@petrov_hockey',
    maxMessenger: 'petrov.max',
  },
  profileCompleteness: 72,
  karmaScore: 74,
  achievements: ['10 игр подряд без пропусков', '3 SOS-выручки', '5 отзывов без no-show'],
  verificationStatus: 'verified',
  teamName: 'Медведи САО',
  teamLogoUrl: 'https://placehold.co/64x64/1a2f4a/ffffff?text=МС',
  teamIds: ['team-001'],
  participationHistory: [
    {
      eventId: 'event-002',
      eventTitle: 'Клубная тренировка: катание и передачи',
      eventDate: '2026-07-07T08:00:00+03:00',
      teamName: 'Медведи САО',
      role: 'player',
      confirmed: true,
      eventType: 'training',
      arenaName: 'Каток «Лужники»',
      durationMinutes: 90,
      note: 'Назначение пришло в командный чат — как после создания тренировки.',
      chatId: 'chat-1',
    },
    {
      eventId: 'event-001',
      eventTitle: 'Товарищеская игра — Медведи САО',
      eventDate: '2026-06-07T20:00:00+03:00',
      teamName: 'Медведи САО',
      role: 'player',
      confirmed: true,
      eventType: 'game',
      arenaName: 'Ледовый дворец на Ходынке',
      opponent: 'Вымпел',
      result: '3:2',
      durationMinutes: 90,
      note: 'Играл во второй пятёрке, +1 ассист.',
      chatId: 'chat-2',
    },
    {
      eventId: 'event-003',
      eventTitle: 'Открытый лёд',
      eventDate: '2026-05-28T18:00:00Z',
      role: 'player',
      confirmed: false,
      eventType: 'open_ice',
      arenaName: 'Ледовый дворец на Ходынке',
      durationMinutes: 60,
      note: 'RSVP ещё не подтверждён — слот можно освободить.',
      chatId: 'chat-6',
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
const defaultPrivacySettings: PrivacySettings = normalizePrivacySettings({
  profileVisibility: 'public',
  showContacts: false,
  showParticipationHistory: true,
  calendarVisibility: 'public',
  fields: {...DEFAULT_FIELD_PRIVACY},
  personalDataProcessingConsent: false,
})

/** @spec SPEC-FR-19.1.1 - Mock подписка (paid period до 15.08.2026) */
const defaultSubscriptionState: SubscriptionState = {
  planId: 'free',
  status: 'mock',
  currentPeriodEndsAt: '2026-08-15T23:59:59+03:00',
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
  clearPendingLocalUser()
  return mockSession
}

/**
 * @spec SPEC-FR-25.1.2 - Выбор демо-роли через mock API
 */
export function selectMockPersona(personaId: string): Session {
  const payload = getPersonaOnboardingPayload(personaId)
  if (!payload) {
    throw new Error(`Unknown persona: ${personaId}`)
  }

  const pending = getPendingRegistration()
  const displayName = pending?.displayName ?? payload.displayName
  const session = completeOnboarding(displayName, payload.roles, payload.partnerMemberships ?? [])

  mockProfile = {...mockProfile, fullName: displayName}

  mockSession = {
    ...session,
    personaId,
    homePath: getPersonaHomePath(session),
    allowedPathPrefixes: getAllowedPathPrefixes(session),
  }
  persistMockSession(mockSession)
  return mockSession
}

/** @spec SPEC-FR-2.1.1 - Сброс mock-сессии (выход) */
export function resetMockSession(): Session {
  mockUser.displayName = 'Петров Иван Сергеевич'
  mockUser.roles = ['player', 'captain']
  mockUser.partnerMemberships = undefined
  mockSession = {
    user: {...mockUser, partnerMemberships: undefined},
    isOnboarded: false,
    personaId: undefined,
    homePath: undefined,
    allowedPathPrefixes: undefined,
  }
  mockProfile = {
    ...mockProfile,
    fullName: 'Петров Иван Сергеевич',
    userId: 'user-001',
    avatarUrl: 'https://placehold.co/400x560/1c3d5a/ffffff?text=%D0%9F%D0%98',
    contacts: {
      phone: '+7 (999) 123-45-67',
      email: 'ivan.petrov@example.ru',
      telegram: '@petrov_hockey',
      maxMessenger: 'petrov.max',
    },
  }
  mockProfileSettings = {
    notificationPreferences: {...defaultNotificationPreferences},
    privacy: normalizePrivacySettings({
      profileVisibility: 'public',
      showContacts: false,
      showParticipationHistory: true,
      calendarVisibility: 'public',
      fields: {...DEFAULT_FIELD_PRIVACY},
      personalDataProcessingConsent: false,
    }),
    subscription: {...defaultSubscriptionState},
  }
  clearPersistedSession()
  clearPendingLocalUser()
  return mockSession
}

/**
 * @spec SPEC-FR-2.2.1 - Обновление Hockey ID
 */
export function updateMockProfile(profile: Partial<HockeyProfile>): HockeyProfile {
  mockProfile = {...mockProfile, ...profile}
  if (profile.avatarUrl === '') {
    delete mockProfile.avatarUrl
  }
  const playerIndex = mockPlayers.findIndex((item) => item.userId === mockProfile.userId)
  if (playerIndex >= 0) {
    mockPlayers[playerIndex] = {
      ...mockPlayers[playerIndex],
      ...mockProfile,
      displayName: mockProfile.fullName,
    }
    if (!mockProfile.avatarUrl) {
      delete mockPlayers[playerIndex].avatarUrl
    }
  }
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
  const merged = {
    ...mockProfileSettings.privacy,
    ...partial,
    fields: {
      ...mockProfileSettings.privacy.fields,
      ...partial.fields,
    },
  }
  if (
    partial.personalDataProcessingConsent === true &&
    !mockProfileSettings.privacy.personalDataProcessingConsent
  ) {
    merged.personalDataConsentAt = new Date().toISOString()
  }
  if (partial.personalDataProcessingConsent === false) {
    merged.personalDataConsentAt = undefined
  }
  mockProfileSettings = {
    ...mockProfileSettings,
    privacy: normalizePrivacySettings(merged),
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
