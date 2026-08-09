/**
 * EPIC-08 / ICE — договорённости с аренами → inbox + календарь организатора
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockIceBookings} from '@/mocks/data/external-flows'
import {selectMockPersona} from '@/mocks/data/session'
import {CreateEventPage} from '@/pages/CreateEventPage'
import {OrganizerEventsPage} from '@/pages/OrganizerEventsPage'
import {routes} from '@/shared/const/appRoutes'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('ICE organizer arena agreements', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockIceBookings()
    selectMockPersona('organizer')
  })

  it('shows booking inbox with status, price, phone and chat', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.eventsOrganizer} element={<OrganizerEventsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [routes.eventsOrganizer]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-agreements-panel')).toBeInTheDocument()
      expect(
        screen.getByTestId('events-agreements-row-agreement-booking-org-ready-001'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('events-agreements-row-agreement-booking-org-draft-001'),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('events-agreements-row-agreement-booking-org-ready-001'))

    await waitFor(() => {
      expect(
        screen.getByTestId('events-agreements-panel-detail-agreement-booking-org-ready-001'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('events-agreements-text-detail-price-agreement-booking-org-ready-001'),
      ).toHaveTextContent('12')
      expect(
        screen.getByTestId('events-agreements-text-detail-phone-agreement-booking-org-ready-001'),
      ).toHaveTextContent('+7 (495) 000-00-01')
      expect(
        screen.getByTestId('events-agreements-btn-chat-agreement-booking-org-ready-001'),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('events-agreements-link-create-agreement-booking-org-ready-001'),
      ).toHaveAttribute(
        'href',
        expect.stringContaining('agreementId=agreement-booking-org-ready-001'),
      )
    })
  })

  it('shows month calendar grid in organizer cabinet', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.eventsOrganizer} element={<OrganizerEventsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [routes.eventsOrganizer]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-page-btn-tab-calendar')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('events-organizer-page-btn-tab-calendar'))

    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-page-panel-calendar')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-shell-page')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-shell-panel-month-layout')).toBeInTheDocument()
    })
  })

  it('picks ready agreement on place step and publishes training', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.eventsCreate} element={<CreateEventPage />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [
            `${routes.eventsCreate}?agreementId=agreement-booking-org-ready-001&bookingId=booking-org-ready-001&arenaId=arena-001&startsAt=2026-08-22T10:00:00%2B03:00&endsAt=2026-08-22T11:30:00%2B03:00`,
          ],
        },
      },
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-panel')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('events-create-form-btn-step-basics'))
    await user.type(screen.getByLabelText('Название'), 'Тренировка с договорённым льдом')
    await user.click(screen.getByTestId('events-create-form-btn-next'))

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-panel-agreements')).toBeInTheDocument()
    })
    await user.click(
      screen.getByTestId('events-create-form-btn-pick-agreement-agreement-booking-org-ready-001'),
    )

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByTestId('events-create-form-btn-next'))
    }

    await user.click(screen.getByTestId('events-create-form-btn-step-access'))
    await user.click(screen.getByTestId('events-create-form-btn-step-publish'))
    await user.click(screen.getByTestId('events-create-form-btn-draft'))

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-text-success')).toHaveTextContent('Черновик')
    })
  })
})
