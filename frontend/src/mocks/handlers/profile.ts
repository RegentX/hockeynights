/**
 * SPEC-FR-2.2.1, SPEC-FR-2.2.2, SPEC-FR-2.2.3, SPEC-FR-2.2.4, SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import {http, HttpResponse} from 'msw'

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import type {PatchProfileFavoritesPayload} from '@/entities/favorites'
import type {
  HockeyProfile,
  NotificationPreferences,
  PrivacySettings,
  SubscriptionState,
} from '@/entities/profile'
import {getMockFavorites, updateMockFavorites} from '@/mocks/data/favorites'
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

/** @spec SPEC-FR-2.3.2, HOCFRONT-20 - Query params фильтра игроков */
interface PlayersQuery {
  q?: string
  position?: PlayerPosition
  skillLevel?: SkillLevel
  district?: string
  goalieOnly?: string
  verified?: string
  teamId?: string
  city?: string
}

/**
 * @spec SPEC-FR-2.2.1 - Handlers профиля и списка игроков
 */
export const profileHandlers = [
  http.get('/mock-api/v1/profile/favorites', () => {
    return HttpResponse.json(getMockFavorites())
  }),

  http.patch('/mock-api/v1/profile/favorites', async ({request}) => {
    const body = (await request.json()) as PatchProfileFavoritesPayload
    if (!Array.isArray(body.actions)) {
      return HttpResponse.json({message: 'actions array is required'}, {status: 400})
    }
    const updated = updateMockFavorites(body.actions)
    return HttpResponse.json(updated)
  }),

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
      q: url.searchParams.get('q') ?? undefined,
      position: url.searchParams.get('position') as PlayerPosition | undefined,
      skillLevel: url.searchParams.get('skillLevel') as SkillLevel | undefined,
      district: url.searchParams.get('district') ?? undefined,
      goalieOnly: url.searchParams.get('goalieOnly') ?? undefined,
      verified: url.searchParams.get('verified') ?? undefined,
      teamId: url.searchParams.get('teamId') ?? undefined,
      city: url.searchParams.get('city') ?? undefined,
    }

    let result = [...mockPlayers]

    if (query.q?.trim()) {
      const needle = query.q.trim().toLowerCase()
      result = result.filter((p) =>
        [p.displayName, p.fullName, p.city, p.district, p.metro]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle)),
      )
    }
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
    if (query.verified === 'true') {
      result = result.filter((p) => p.verificationStatus === 'verified')
    }
    if (query.teamId) {
      result = result.filter((p) => p.teamIds?.includes(query.teamId!))
    }
    if (query.city) {
      const needle = query.city.toLowerCase()
      result = result.filter((p) => p.city.toLowerCase().includes(needle))
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
