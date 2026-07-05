/**
 * SPEC-FR-7.1.1, SPEC-FR-7.1.2, SPEC-FR-7.2.1, SPEC-FR-7.2.2
 * SPEC-FR-8.1.1, SPEC-FR-8.2.1, SPEC-FR-9.1.1, SPEC-FR-9.2.1
 * SPEC-FR-10.1.1, SPEC-FR-10.1.2, SPEC-FR-11.1.1, SPEC-FR-11.1.2
 * SPEC-FR-11.2.1, SPEC-FR-11.2.2, SPEC-FR-13.1.1, SPEC-FR-13.1.2, SPEC-FR-13.1.3
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.3, SPEC-FR-14.1.4
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 * TASK-QA-02
 */

import {screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vitest'

import type {SourceStatusItem} from '@/entities/admin/types'
import type {CheckoutIntent, IceBookingRequest} from '@/entities/external-flow/types'
import type {CreateFeedbackPayload, Feedback, KarmaInfo} from '@/entities/feedback/types'
import type {
  Highlight,
  HighlightAnnotation,
  HighlightComment,
  HighlightDetail,
} from '@/entities/highlight/types'
import type {IqAttemptResult, IqLeaderboardRow, IqTest} from '@/entities/iq/types'
import type {League, LeagueScheduleItem, LeagueStanding} from '@/entities/league/types'
import type {Notification} from '@/entities/notification/types'
import type {RadarRecommendation} from '@/entities/radar/types'
import type {ProductOffer, Shop} from '@/entities/shop/types'
import {AdminDashboard} from '@/features/admin/AdminDashboard'
import {EventsPage} from '@/features/events/EventsPage'
import {FeedbackPage} from '@/features/feedback/FeedbackPage'
import {HighlightsPage} from '@/features/highlights/HighlightsPage'
import {IqTestsPage} from '@/features/iq/IqTestsPage'
import {LeaguesPage} from '@/features/leagues/LeaguesPage'
import {NotificationsPage} from '@/features/notifications/NotificationsPage'
import {ShopsPage} from '@/features/shops/ShopsPage'
import {resetMockHighlightsState} from '@/mocks/data/highlights'
import {resetMockRadarState} from '@/mocks/data/radar'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {mockApiGet, mockApiPatch, mockApiPost} from '@/test/api'
import {renderWithProviders} from '@/test/render'

describe('TASK-QA-02 mock API smoke', () => {
  beforeEach(() => {
    resetMockRadarState()
    resetMockHighlightsState()
  })

  /** @spec SPEC-FR-7.1.1 */
  it('GET /leagues returns league list', async () => {
    const leagues = await mockApiGet<League[]>('/leagues')
    expect(leagues.length).toBeGreaterThan(0)
    expect(leagues[0].sourceMeta.source).toBeTruthy()
  })

  /** @spec SPEC-FR-7.2.1 */
  it('GET /leagues/{id}/standings and /schedule return data', async () => {
    const leagues = await mockApiGet<League[]>('/leagues')
    const standings = await mockApiGet<LeagueStanding[]>(`/leagues/${leagues[0].id}/standings`)
    const schedule = await mockApiGet<LeagueScheduleItem[]>(`/leagues/${leagues[0].id}/schedule`)
    expect(standings.length).toBeGreaterThan(0)
    expect(schedule.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-8.1.1 */
  it('POST /feedback creates feedback for event participant', async () => {
    const payload: CreateFeedbackPayload = {
      eventId: 'event-003',
      toUserId: 'user-002',
      attendanceRating: 'confirmed',
      skillMatchRating: 'matched',
      behaviorRating: 'positive',
    }
    const feedback = await mockApiPost<Feedback>('/feedback', payload)
    expect(feedback.id).toBeTruthy()
    expect(feedback.eventId).toBe('event-003')
  })

  /** @spec SPEC-FR-8.2.1 */
  it('GET /players/{userId}/karma returns karma info', async () => {
    const karma = await mockApiGet<KarmaInfo>('/players/user-002/karma')
    expect(karma.karmaScore).toBeGreaterThan(0)
    expect(karma.hint.toLowerCase()).toContain('вспомогательн')
  })

  /** @spec SPEC-FR-9.1.1 */
  it('GET /shops returns shop list', async () => {
    const shops = await mockApiGet<Shop[]>('/shops')
    expect(shops.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-9.2.1 */
  it('GET /product-offers returns offers with external URLs', async () => {
    const offers = await mockApiGet<ProductOffer[]>('/product-offers')
    expect(offers.length).toBeGreaterThan(0)
    expect(offers[0].externalUrl).toMatch(/^https?:\/\//)
  })

  /** @spec SPEC-FR-10.1.1 */
  it('GET /notifications returns user notifications', async () => {
    const notifications = await mockApiGet<Notification[]>('/notifications')
    expect(notifications.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-10.1.2 */
  it('PATCH /notifications/{id}/read marks notification read', async () => {
    const notifications = await mockApiGet<Notification[]>('/notifications')
    const unread = notifications.find((n) => !n.readAt)
    expect(unread).toBeDefined()
    const updated = await mockApiPatch<Notification>(`/notifications/${unread!.id}/read`)
    expect(updated.readAt).toBeTruthy()
  })

  /** @spec SPEC-FR-11.2.1 */
  it('GET /admin/sources returns source statuses', async () => {
    const sources = await mockApiGet<SourceStatusItem[]>('/admin/sources')
    expect(sources.length).toBeGreaterThan(0)
    expect(sources[0].sourceMeta.syncStatus).toBeTruthy()
  })

  /** @spec SPEC-FR-13.1.1 */
  it('GET /iq-tests returns Hockey IQ catalog', async () => {
    const tests = await mockApiGet<IqTest[]>('/iq-tests')
    expect(tests.length).toBeGreaterThan(0)
    expect(tests[0].questionCount).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-13.1.2 */
  it('POST /iq-attempts returns scored result', async () => {
    const result = await mockApiPost<IqAttemptResult>('/iq-attempts', {
      testId: 'iq-test-001',
      userId: 'user-001',
      answers: [{questionId: 'q-001', optionId: 'b'}],
    })
    expect(result.maxScore).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-13.1.3 */
  it('GET /iq-leaderboard returns ranking', async () => {
    const rows = await mockApiGet<IqLeaderboardRow[]>('/iq-leaderboard')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows[0].rank).toBe(1)
  })

  /** @spec SPEC-FR-15.1.1 */
  it('GET /radar/recommendations returns active recommendations', async () => {
    const items = await mockApiGet<RadarRecommendation[]>('/radar/recommendations')
    expect(items.length).toBeGreaterThanOrEqual(10)
    expect(items[0].targetRoute).toMatch(/^\//)
  })

  /** @spec SPEC-FR-14.1.1 */
  it('GET /highlights returns highlight catalog', async () => {
    const items = await mockApiGet<Highlight[]>('/highlights')
    expect(items.length).toBeGreaterThanOrEqual(10)
    expect(items[0].uploadStatus).toBe('mock')
  })

  /** @spec SPEC-FR-14.1.1 */
  it('GET /highlights/{id} returns detail with annotations and comments', async () => {
    const items = await mockApiGet<Highlight[]>('/highlights')
    const detail = await mockApiGet<HighlightDetail>(`/highlights/${items[0].id}`)
    expect(detail.annotations.length).toBeGreaterThan(0)
    expect(detail.comments.length).toBeGreaterThan(0)
  })

  /** @spec SPEC-FR-14.1.1, SPEC-FR-14.1.4 */
  it('POST /highlights creates mock upload', async () => {
    const created = await mockApiPost<Highlight>('/highlights', {
      title: 'Smoke highlight',
      eventId: 'event-001',
      teamId: 'team-001',
      authorUserId: 'user-001',
    })
    expect(created.uploadStatus).toBe('mock')
    expect(created.mockPreviewUrl).toMatch(/^mock:\/\//)
  })

  /** @spec SPEC-FR-14.1.2 */
  it('POST /highlights/{id}/annotations adds annotation', async () => {
    const annotation = await mockApiPost<HighlightAnnotation>('/highlights/hl-001/annotations', {
      timestampMs: 1000,
      type: 'text',
      payload: {x: 10, y: 20, text: 'Smoke'},
      authorUserId: 'user-001',
    })
    expect(annotation.highlightId).toBe('hl-001')
  })

  /** @spec SPEC-FR-14.1.3 */
  it('POST /highlights/{id}/comments adds comment', async () => {
    const comment = await mockApiPost<HighlightComment>('/highlights/hl-001/comments', {
      authorUserId: 'user-001',
      authorDisplayName: 'Иван Петров',
      tag: 'tip',
      text: 'Smoke comment',
    })
    expect(comment.tag).toBe('tip')
  })

  /** @spec SPEC-FR-15.1.3 */
  it('PATCH /radar/recommendations/{id} dismisses recommendation', async () => {
    const items = await mockApiGet<RadarRecommendation[]>('/radar/recommendations')
    const target = items.find((r) => r.priority === 'low') ?? items[items.length - 1]
    const updated = await mockApiPatch<RadarRecommendation>(`/radar/recommendations/${target.id}`, {
      action: 'dismiss',
    })
    expect(updated.dismissedAt).toBeTruthy()
    const remaining = await mockApiGet<RadarRecommendation[]>('/radar/recommendations')
    expect(remaining.find((r) => r.id === target.id)).toBeUndefined()
  })

  /** @spec SPEC-FR-11.1.1 */
  it('POST /admin/leagues creates manual league', async () => {
    const league = await mockApiPost<League>('/admin/leagues', {
      name: 'Smoke Test League',
      city: 'Москва',
    })
    expect(league.id).toBeTruthy()
    expect(league.integrationStatus).toBe('manual')
  })

  /** @spec SPEC-FR-6.4.2 */
  it('POST /ice-booking-requests creates mock booking', async () => {
    const booking = await mockApiPost<IceBookingRequest>('/ice-booking-requests', {
      arenaId: 'arena-001',
      slotId: 'slot-001',
      contactPhone: '+7 999 000-00-00',
    })
    expect(booking.confirmationCode).toMatch(/^ICE-/)
  })

  /** @spec SPEC-FR-9.2.3 */
  it('POST /checkout-intents creates mock checkout', async () => {
    const intent = await mockApiPost<CheckoutIntent>('/checkout-intents', {offerId: 'offer-001'})
    expect(intent.externalUrl).toMatch(/^https?:\/\//)
  })

  /** @spec SPEC-FR-11.1.2 */
  it('PATCH /admin/entities/{id}/visibility hides entity', async () => {
    const leagues = await mockApiGet<League[]>('/leagues')
    const target = leagues[leagues.length - 1]
    const result = await mockApiPatch<{entityId: string; visible: boolean}>(
      `/admin/entities/${target.id}/visibility`,
      {entityType: 'league', visible: false},
    )
    expect(result.visible).toBe(false)
    const visibleLeagues = await mockApiGet<League[]>('/leagues')
    expect(visibleLeagues.find((l) => l.id === target.id)).toBeUndefined()
  })
})

describe('TASK-QA-02 UI smoke', () => {
  beforeEach(() => {
    resetMockRadarState()
    resetMockHighlightsState()
  })

  /** @spec SPEC-FR-7.1.2, SPEC-UI-2.7 */
  it('LeaguesPage loads league cards and standings board', async () => {
    renderWithProviders(<LeaguesPage />)
    await waitFor(() => {
      expect(screen.getByText('Любительские лиги')).toBeInTheDocument()
      expect(screen.getAllByText(/Ночная Хоккейная Лига|НХЛ/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText('Профиль лиги').length).toBeGreaterThan(0)
      expect(screen.getByRole('table', {name: /Турнирная таблица/i})).toBeInTheDocument()
      expect(screen.getAllByText('Медведи САО').length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-8.1.2 */
  it('FeedbackPage loads feedback form for participants', async () => {
    renderWithProviders(<FeedbackPage />)
    await waitFor(() => {
      expect(screen.getByText('Feedback после игры')).toBeInTheDocument()
      expect(screen.getByText('Post-game feedback')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-10.1.1 */
  it('NotificationsPage loads notification center', async () => {
    renderWithProviders(<NotificationsPage />)
    await waitFor(() => {
      expect(screen.getByText('Уведомления')).toBeInTheDocument()
      expect(screen.getByText('Изменение состава')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-9.1.2, SPEC-FR-9.3.1 */
  it('ShopsPage loads marketplace feed', async () => {
    renderWithProviders(<ShopsPage />)
    await waitFor(() => {
      expect(screen.getByText('Маркет экипировки')).toBeInTheDocument()
      expect(screen.getByText('Pro-Hockey Москва')).toBeInTheDocument()
      expect(screen.getByText('Коньки Bauer Supreme')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-11.1.1 */
  it('AdminDashboard loads entity form and source table', async () => {
    renderWithProviders(<AdminDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Админка справочников')).toBeInTheDocument()
      expect(screen.getByText('Добавить запись')).toBeInTheDocument()
      expect(screen.getByText('Ледовый дворец на Ходынке')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-13.1.1 */
  it('IqTestsPage loads Hockey IQ screen', async () => {
    renderWithProviders(<IqTestsPage />)
    await waitFor(() => {
      expect(screen.getByText('Hockey IQ')).toBeInTheDocument()
      expect(screen.getByText(/Офсайд и игра в зоне/i)).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-15.1.1, SPEC-UI-6.5, HOCFRONT-9 */
  it('EventsPage loads league RSVP hero inside training section', async () => {
    renderWithProviders(<EventsPage />)
    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
      expect(screen.getByTestId('events-page-panel-league-rsvp')).toBeInTheDocument()
      expect(screen.getByText('Список тренировок')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-14.1.1, SPEC-UI-6.3, SPEC-UI-6.4 */
  it('HighlightsPage loads video board and mock upload notice', async () => {
    renderWithProviders(<HighlightsPage />)
    await waitFor(() => {
      expect(screen.getByText('Highlight Analysis')).toBeInTheDocument()
      expect(screen.getAllByText('Phase 1 mock upload').length).toBeGreaterThan(0)
      expect(screen.getByText('Разбор команды')).toBeInTheDocument()
    })
  })
})
