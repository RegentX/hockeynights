/**
 * HOCFRONT-28 — страница «Игры и тренировки»
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'

import {EventsPage} from '@/pages/EventsPage'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-28 EventsPage', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  it('shows type tabs and upcoming games + trainings', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
      expect(screen.getByTestId('events-page-btn-type-all')).toBeInTheDocument()
      expect(screen.getByText('Список игр и тренировок')).toBeInTheDocument()
    })

    expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(1)
    expect(screen.getByText('Товарищеская игра — Медведи САО')).toBeInTheDocument()
    expect(screen.getByText('Публичная тренировка 2-сторонка')).toBeInTheDocument()
  })

  it('filters catalog to trainings only', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByText('Список игр и тренировок')
    await user.click(screen.getByTestId('events-page-btn-type-training'))

    await waitFor(() => {
      expect(screen.queryByText('Товарищеская игра — Медведи САО')).not.toBeInTheDocument()
      expect(screen.getByText('Публичная тренировка 2-сторонка')).toBeInTheDocument()
    })
  })

  it('shows organizer cabinet and blocks public_open without subscription', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('events-organizer-card')).toBeInTheDocument()
      expect(screen.getByTestId('events-create-form-panel')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Название'), 'Открытая тренировка теста')
    await user.click(screen.getByTestId('events-create-form-btn-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('events-create-form-error-gate')).toBeInTheDocument()
    })
  })
})
