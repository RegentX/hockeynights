/**
 * HOCFRONT-28F / ORG-2-3 — кабинет организатора: статусы, табы, регистрации
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'

import {selectMockPersona} from '@/mocks/data/session'
import {OrganizerEventsPage} from '@/pages/OrganizerEventsPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-28F organizer workspace', () => {
  beforeEach(() => {
    clearTestStorage()
    selectMockPersona('organizer')
  })

  it('shows trainings with status filters and fill metrics', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OrganizerEventsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-page-page')).toBeInTheDocument()
      expect(screen.getByTestId('events-agreements-panel')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('events-organizer-page-btn-tab-trainings'))
    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-card')).toBeInTheDocument()
      expect(screen.getByTestId('events-organizer-text-status-event-007')).toHaveTextContent(
        'Черновик',
      )
      expect(screen.getByTestId('events-organizer-text-fill-event-001')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('events-organizer-btn-filter-draft'))
    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-row-event-007')).toBeInTheDocument()
      expect(screen.queryByTestId('events-organizer-row-event-001')).not.toBeInTheDocument()
    })
  })

  it('switches to registrations and profile tabs', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OrganizerEventsPage />)

    await screen.findByTestId('events-organizer-page-btn-tab-registrations')
    await user.click(screen.getByTestId('events-organizer-page-btn-tab-registrations'))

    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-regs-panel')).toBeInTheDocument()
      expect(screen.getByTestId('events-organizer-regs-list')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('events-organizer-page-btn-tab-profile'))
    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-page-panel-profile')).toBeInTheDocument()
      expect(screen.getByTestId('events-organizer-page-text-profile-name')).toHaveTextContent(
        'Мария Организаторова',
      )
    })
  })
})
