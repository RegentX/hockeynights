/**
 * HOCFRONT-32 — ледовые арены: каталог, listings, кабинет
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {canManageArena} from '@/features/access'
import {mockIceBookings, resetMockIceBookings} from '@/mocks/data/external-flows'
import {mockIceListings, resetMockIceListings} from '@/mocks/data/iceListings'
import {completeOnboarding, selectMockPersona} from '@/mocks/data/session'
import {ArenaDetailsPage} from '@/pages/ArenaDetailsPage'
import {ArenaPartnerDashboard} from '@/pages/ArenaPartnerDashboard'
import {ArenasPage} from '@/pages/ArenasPage'
import {routes} from '@/shared/const/appRoutes'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-32 Arenas reform', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockIceListings()
    resetMockIceBookings()
  })

  it('filters catalog by city region Москва / Подмосковье via URL', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.arenas} element={<ArenasPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/arenas?city=moscow_oblast']}},
    )

    await waitFor(() => {
      expect(screen.queryByTestId('arenas-rink-card-arena-001')).not.toBeInTheDocument()
      expect(screen.getByTestId('arenas-rink-card-arena-003')).toBeInTheDocument()
    })
  })

  it('opens arena details page and shows published listings', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.arenas} element={<ArenasPage />} />
        <Route path={routes.arenaDetails} element={<ArenaDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/arenas/arena-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('arenas-details-page-arena-001')).toBeInTheDocument()
      expect(screen.getByTestId('arenas-detail-panel-arena-001')).toBeInTheDocument()
      expect(screen.getByTestId('arenas-listings-panel-arena-001')).toBeInTheDocument()
      expect(screen.getByText('Свободный лёд вечер пятницы')).toBeInTheDocument()
      expect(screen.queryByText('Черновик: утренний лёд')).not.toBeInTheDocument()
    })
  })

  it('redirects legacy ?arenaId= deep-link to arena page', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.arenas} element={<ArenasPage />} />
        <Route path={routes.arenaDetails} element={<ArenaDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/arenas?arenaId=arena-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('arenas-details-page-arena-001')).toBeInTheDocument()
    })
  })

  it('allows arena partner to manage cabinet and publish listing', async () => {
    const user = userEvent.setup()
    const session = selectMockPersona('arena-partner')
    expect(canManageArena(session, 'arena-001')).toBe(true)
    expect(canManageArena(session, 'arena-002')).toBe(false)

    renderWithProviders(
      <Routes>
        <Route path={routes.partnerArena} element={<ArenaPartnerDashboard />} />
      </Routes>,
      {routerProps: {initialEntries: ['/partner/arenas/arena-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('arenas-partner-page-arena-001')).toBeInTheDocument()
      expect(screen.getByTestId('arenas-partner-tab-listings')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('arenas-partner-tab-listings'))

    await waitFor(() => {
      expect(screen.getByTestId('arenas-partner-btn-publish-listing-002')).toBeInTheDocument()
    })

    const draft = mockIceListings.find((item) => item.id === 'listing-002')
    expect(draft?.status).toBe('draft')

    await user.click(screen.getByTestId('arenas-partner-btn-publish-listing-002'))

    await waitFor(() => {
      expect(
        screen.getByTestId('arenas-partner-text-listing-status-listing-002'),
      ).toHaveTextContent('Опубликовано')
    })
  })

  it('publishes a new listing from cabinet form in one step', async () => {
    const user = userEvent.setup()
    selectMockPersona('arena-partner')

    renderWithProviders(
      <Routes>
        <Route path={routes.partnerArena} element={<ArenaPartnerDashboard />} />
        <Route path={routes.arenaDetails} element={<ArenaDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/partner/arenas/arena-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('arenas-partner-tab-listings')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('arenas-partner-tab-listings'))

    await waitFor(() => {
      expect(screen.getByTestId('arenas-partner-btn-publish-now')).toBeInTheDocument()
      expect(screen.getByTestId('arenas-partner-btn-template-friday')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('arenas-partner-btn-template-friday'))
    await user.click(screen.getByTestId('arenas-partner-btn-publish-now'))

    await waitFor(() => {
      expect(screen.getByTestId('arenas-partner-text-listing-success')).toBeInTheDocument()
      expect(
        mockIceListings.some(
          (item) => item.title === 'Свободный лёд · пятница вечер' && item.status === 'published',
        ),
      ).toBe(true)
    })
  })

  it('denies cabinet for player without arena membership', async () => {
    completeOnboarding('Игрок', ['player'], [])

    renderWithProviders(
      <Routes>
        <Route path={routes.partnerArena} element={<ArenaPartnerDashboard />} />
      </Routes>,
      {routerProps: {initialEntries: ['/partner/arenas/arena-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('arenas-partner-error-access-denied')).toBeInTheDocument()
    })
  })

  it('shows booking inbox and confirms a request', async () => {
    const user = userEvent.setup()
    selectMockPersona('arena-partner')

    renderWithProviders(
      <Routes>
        <Route path={routes.partnerArena} element={<ArenaPartnerDashboard />} />
      </Routes>,
      {routerProps: {initialEntries: ['/partner/arenas/arena-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('arenas-partner-tab-bookings')).toBeInTheDocument()
      expect(screen.getByTestId('arenas-partner-bookings-row-booking-seed-001')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('arenas-partner-bookings-row-booking-seed-001'))
    await user.click(
      screen.getByTestId('arenas-partner-bookings-btn-status-confirmed-booking-seed-001'),
    )

    await waitFor(() => {
      expect(mockIceBookings.find((item) => item.id === 'booking-seed-001')?.status).toBe(
        'confirmed',
      )
      expect(
        screen.getByTestId('arenas-partner-bookings-badge-status-booking-seed-001'),
      ).toHaveTextContent('Подтверждено')
    })
  })
})
