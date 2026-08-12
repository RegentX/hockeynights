/**
 * EPIC-08 / ORG-6 — демо-сценарии кабинета организатора тренировок
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {
  canAccessOrganizerCabinet,
  canOrganizeEvents,
  getPersonaHomePath,
  hasTrainingOrganizerRole,
} from '@/features/access'
import {isPlayerCatalogEvent} from '@/features/events'
import {mockEvents, resetMockEvents} from '@/mocks/data/events'
import {selectMockPersona} from '@/mocks/data/session'
import {ClubPartnerDashboard} from '@/pages/ClubPartnerDashboard'
import {CreateEventPage} from '@/pages/CreateEventPage'
import {EventsPage} from '@/pages/EventsPage'
import {OrganizerEventsPage} from '@/pages/OrganizerEventsPage'
import {routes} from '@/shared/const/appRoutes'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('ORG-6 organizer training demo', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockEvents()
  })

  it('persona training_organizer lands in cabinet and sees statuses + registrations', async () => {
    const user = userEvent.setup()
    const session = selectMockPersona('organizer')

    expect(hasTrainingOrganizerRole(session.user.roles)).toBe(true)
    expect(canOrganizeEvents(session.user.roles)).toBe(true)
    expect(getPersonaHomePath(session)).toBe(routes.eventsOrganizer)

    renderWithProviders(
      <Routes>
        <Route path={routes.eventsOrganizer} element={<OrganizerEventsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [routes.eventsOrganizer]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-page-page')).toBeInTheDocument()
      expect(screen.getByTestId('events-organizer-text-status-event-007')).toHaveTextContent(
        'Черновик',
      )
    })

    await user.click(screen.getByTestId('events-organizer-page-btn-tab-registrations'))
    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-regs-list')).toBeInTheDocument()
      expect(
        screen.getByTestId('events-organizer-regs-text-name-event-001-user-003'),
      ).toHaveTextContent('Козлов Дмитрий Александрович')
    })
  })

  it('hides drafts from player catalog', async () => {
    selectMockPersona('player')
    expect(isPlayerCatalogEvent(mockEvents.find((e) => e.id === 'event-007')!)).toBe(false)

    renderWithProviders(
      <Routes>
        <Route path={routes.events} element={<EventsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [routes.events]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-page-text-title')).toBeInTheDocument()
    })
    expect(screen.queryByText('Черновик: утренняя раскатка')).not.toBeInTheDocument()
  })

  it('publishes private_club training without paywall and shows club badge', async () => {
    const user = userEvent.setup()
    selectMockPersona('organizer')

    renderWithProviders(
      <Routes>
        <Route path={routes.eventsCreate} element={<CreateEventPage />} />
        <Route path={routes.eventsOrganizer} element={<OrganizerEventsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [`${routes.eventsCreate}?access=private_club`]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-panel')).toBeInTheDocument()
    })
    await user.type(screen.getByLabelText('Название'), 'ORG6 клубная тренировка')

    for (let i = 0; i < 6; i += 1) {
      await user.click(screen.getByTestId('events-create-form-btn-next'))
    }

    await screen.findByTestId('events-create-form-btn-submit')
    await user.click(screen.getByTestId('events-create-form-btn-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-text-success')).toHaveTextContent(
        'Только для клуба',
      )
    })
    expect(screen.queryByTestId('events-create-form-error-gate')).not.toBeInTheDocument()
  })

  it('club_admin reaches organizer cabinet from club dashboard', async () => {
    const session = selectMockPersona('club-admin')
    expect(canAccessOrganizerCabinet(session)).toBe(true)

    renderWithProviders(
      <Routes>
        <Route path={routes.partnerClub} element={<ClubPartnerDashboard />} />
        <Route path={routes.eventsOrganizer} element={<OrganizerEventsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/partner/clubs/club-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('clubs-dashboard-btn-organizer-club-001')).toBeInTheDocument()
    })
    expect(screen.getByTestId('clubs-dashboard-link-organizer-club-001')).toHaveAttribute(
      'href',
      routes.eventsOrganizer,
    )
    expect(screen.getByTestId('clubs-dashboard-link-create-private-club-001')).toHaveAttribute(
      'href',
      `${routes.eventsCreate}?access=private_club`,
    )
  })
})
