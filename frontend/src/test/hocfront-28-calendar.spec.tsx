/**
 * HOCFRONT-28CAL-A/B/C — CalendarShell product surface
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {describe, expect, it} from 'vitest'

import {CalendarPage} from '@/pages/CalendarPage'
import {routes} from '@/shared/const/appRoutes'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-28 Calendar', () => {
  it('renders shell with month/agenda toggle and restores URL state', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.calendar} element={<CalendarPage />} />
      </Routes>,
      {
        routerProps: {
          initialEntries: [
            `${routes.calendar}?view=agenda&date=2026-08-15&scope=team&scopeId=team-001`,
          ],
        },
      },
    )

    await waitFor(() => {
      expect(screen.getByTestId('calendar-shell-page')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-shell-text-title')).toHaveTextContent('Календарь команды')
      expect(screen.getByTestId('calendar-shell-btn-view-agenda')).toBeInTheDocument()
    })
  })

  it('switches between month and agenda and selects a day', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.calendar} element={<CalendarPage />} />
      </Routes>,
      {routerProps: {initialEntries: [`${routes.calendar}?date=2026-08-15`]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('calendar-month-panel')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('calendar-shell-btn-view-agenda'))
    await waitFor(() => {
      expect(screen.getByTestId('calendar-agenda-panel')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('calendar-shell-btn-view-month'))
    await waitFor(() => {
      expect(screen.getByTestId('calendar-month-grid')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('calendar-month-btn-day-2026-08-15'))
    await waitFor(() => {
      expect(screen.getByTestId('calendar-agenda-panel')).toBeInTheDocument()
    })
  })

  it('applies quick chips and reset', async () => {
    const user = userEvent.setup()
    clearTestStorage()
    renderWithProviders(
      <Routes>
        <Route path={routes.calendar} element={<CalendarPage />} />
      </Routes>,
      {routerProps: {initialEntries: [routes.calendar]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('calendar-chips-btn-needs-goalie')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('calendar-chips-btn-needs-goalie'))
    await waitFor(() => {
      expect(screen.getByTestId('calendar-chips-text-active')).toHaveTextContent('Фильтров: 1')
    })

    await user.click(screen.getByTestId('calendar-chips-btn-reset'))
    await waitFor(() => {
      expect(screen.queryByTestId('calendar-chips-text-active')).not.toBeInTheDocument()
    })
  })

  it('switches role lenses and shows goalie availability panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.calendar} element={<CalendarPage />} />
      </Routes>,
      {routerProps: {initialEntries: [`${routes.calendar}?lens=goalie`]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('calendar-shell-btn-lens-goalie')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-windows-panel')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('calendar-shell-btn-lens-organizer'))
    await waitFor(() => {
      expect(screen.queryByTestId('calendar-windows-panel')).not.toBeInTheDocument()
    })
  })
})
