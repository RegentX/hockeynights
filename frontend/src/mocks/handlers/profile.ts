/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4, SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import {http, HttpResponse} from 'msw'

import type {PlayerPosition, SkillLevel} from '@/entities/common/types'
import type {
  HockeyProfile,
  NotificationPreferences,
  PrivacySettings,
  SubscriptionState,
} from '@/entities/profile/types'
import {buildPublicPlayerView, mockPlayers} from '@/mocks/data/players'
import {
  mockProfile,
  mockProfileSettings,
  updateMockNotificationPreferences,
  updateMockPrivacySettings,
  updateMockProfile,
  updateMockSubscriptionState,
  updateMockVerificationStatus,
} from '@/mocks/data/session'

/** @spec SPEC-FR-2.3.2 - Query params фильтра игроков */
interface PlayersQuery {
  position?: PlayerPosition
  skillLevel?: SkillLevel
  district?: string
  goalieOnly?: string
}

/**
 * @spec SPEC-FR-2.2.1 - Handlers профиля и списка игроков
 */
export const profileHandlers = [
  http.get('/mock-api/v1/profile/me', () => {
    return HttpResponse.json(mockProfile)
  }),

  http.put('/mock-api/v1/profile/me', async ({request}) => {
    const body = (await request.json()) as Partial<HockeyProfile>
    const updated = updateMockProfile(body)
    return HttpResponse.json(updated)
  }),

  http.get('/mock-api/v1/profile/settings', () => {
    return HttpResponse.json(mockProfileSettings)
  }),

  http.patch('/mock-api/v1/profile/notification-preferences', async ({request}) => {
    const body = (await request.json()) as Partial<NotificationPreferences>
    const updated = updateMockNotificationPreferences(body)
    return HttpResponse.json(updated)
  }),

  http.patch('/mock-api/v1/profile/privacy', async ({request}) => {
    const body = (await request.json()) as Partial<PrivacySettings>
    const updated = updateMockPrivacySettings(body)
    return HttpResponse.json(updated)
  }),

  http.post('/mock-api/v1/subscription-intents', async ({request}) => {
    const body = (await request.json()) as Partial<SubscriptionState>
    const updated = updateMockSubscriptionState({
      ...body,
      status: 'mock',
    })
    return HttpResponse.json(updated)
  }),

  http.post('/mock-api/v1/verification-requests', async () => {
    updateMockVerificationStatus('pending')
    return HttpResponse.json({
      requestId: `verify-${Date.now()}`,
      status: 'pending',
      method: 'manual_profile_review',
    })
  }),

  http.patch('/mock-api/v1/verification-requests/:requestId', async ({request}) => {
    const body = (await request.json()) as {status?: HockeyProfile['verificationStatus']}
    const nextStatus = body.status ?? 'verified'
    updateMockVerificationStatus(nextStatus)
    return HttpResponse.json({
      requestId: `verify-${Date.now()}`,
      status: nextStatus,
    })
  }),

  http.get('/mock-api/v1/players', ({request}) => {
    const url = new URL(request.url)
    const query: PlayersQuery = {
      position: url.searchParams.get('position') as PlayerPosition | undefined,
      skillLevel: url.searchParams.get('skillLevel') as SkillLevel | undefined,
      district: url.searchParams.get('district') ?? undefined,
      goalieOnly: url.searchParams.get('goalieOnly') ?? undefined,
    }

    let result = [...mockPlayers]

    if (query.position) {
      result = result.filter((p) => p.position === query.position)
    }
    if (query.skillLevel) {
      result = result.filter((p) => p.skillLevel === query.skillLevel)
    }
    if (query.district) {
      result = result.filter((p) => p.district === query.district)
    }
    if (query.goalieOnly === 'true') {
      result = result.filter((p) => p.position === 'goalie')
    }

    return HttpResponse.json(result)
  }),

  http.get('/mock-api/v1/players/:userId', ({params}) => {
    const view = buildPublicPlayerView(params.userId as string)
    if (!view) {
      return HttpResponse.json({message: 'Player not found'}, {status: 404})
    }
    return HttpResponse.json(view)
  }),
]
