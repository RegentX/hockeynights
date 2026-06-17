/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4
 */

import {apiRequest} from '@/shared/api/client'
import type {
  HockeyProfile,
  NotificationPreferences,
  PrivacySettings,
  ProfileSettings,
  SubscriptionState,
  VerificationStatus,
} from '@/entities/profile/types'

/**
 * @spec SPEC-FR-2.2.1 - Получить Hockey ID
 */
export function fetchMyProfile(): Promise<HockeyProfile> {
  return apiRequest<HockeyProfile>('/profile/me')
}

/**
 * @spec SPEC-FR-2.2.1 - Обновить Hockey ID
 */
export function updateMyProfile(profile: Partial<HockeyProfile>): Promise<HockeyProfile> {
  return apiRequest<HockeyProfile>('/profile/me', {method: 'PUT', body: profile})
}

/** @spec SPEC-FR-18.1.1 - Получить настройки личного кабинета */
export function fetchProfileSettings(): Promise<ProfileSettings> {
  return apiRequest<ProfileSettings>('/profile/settings')
}

/** @spec SPEC-FR-18.1.3 - Обновить каналы уведомлений */
export function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>,
): Promise<ProfileSettings> {
  return apiRequest<ProfileSettings>('/profile/notification-preferences', {
    method: 'PATCH',
    body: preferences,
  })
}

/** @spec SPEC-FR-18.1.4 - Обновить приватность профиля */
export function updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<ProfileSettings> {
  return apiRequest<ProfileSettings>('/profile/privacy', {method: 'PATCH', body: settings})
}

/** @spec SPEC-FR-19.1.3 - Mock-переключение тарифа подписки */
export function updateSubscription(subscription: Partial<SubscriptionState>): Promise<ProfileSettings> {
  return apiRequest<ProfileSettings>('/subscription-intents', {method: 'POST', body: subscription})
}

/** @spec SPEC-FR-17.1.1 - Запустить проверку пользователя */
export function startVerificationRequest(): Promise<{requestId: string; status: VerificationStatus}> {
  return apiRequest<{requestId: string; status: VerificationStatus}>('/verification-requests', {
    method: 'POST',
  })
}

/** @spec SPEC-FR-17.1.1 - Обновить статус проверки пользователя */
export function updateVerificationRequest(
  requestId: string,
  status: VerificationStatus,
): Promise<{requestId: string; status: VerificationStatus}> {
  return apiRequest<{requestId: string; status: VerificationStatus}>(
    `/verification-requests/${requestId}`,
    {method: 'PATCH', body: {status}},
  )
}
