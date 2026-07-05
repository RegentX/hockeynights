/**
 * HOCFRONT-9 — сценарий RSVP ближайшей игры в разделе "Игры и тренировки".
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'
import {EventsPage} from '@/features/events/EventsPage'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {resetMockEventRsvp} from '@/mocks/data/eventRsvp'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('Events page RSVP block', () => {
  beforeEach(() => {
    resetMockEventRsvp()
    clearTestStorage()
  })

  it('shows league game hero and team RSVP list', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
      expect(screen.getByText('Ближайшая игра')).toBeInTheDocument()
      expect(screen.getByTestId('radar-league-rsvp-text-matchup-event-league-sat')).toBeInTheDocument()
      expect(screen.getByText('Кто идёт из команды')).toBeInTheDocument()
      expect(screen.getByText('Вратари')).toBeInTheDocument()
      expect(screen.getByText('Нападающие')).toBeInTheDocument()
    })
  })

  it('confirms attendance with Буду CTA', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByText('Ближайшая игра')
    await user.click(screen.getByTestId('radar-league-rsvp-btn-confirm-event-league-sat'))

    await waitFor(() => {
      expect(screen.getByText('Вы идёте')).toBeInTheDocument()
    })
  })

  it('declines with preset reason and updates team list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByText('Ближайшая игра')
    await user.click(screen.getByTestId('radar-league-rsvp-btn-decline-event-league-sat'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-work'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-confirm'))

    await waitFor(() => {
      expect(screen.getByText('Вы не сможете')).toBeInTheDocument()
      expect(screen.getAllByText(/Работаю/).length).toBeGreaterThan(0)
    })
  })

  it('shows events list below league RSVP block', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText('Список тренировок')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(0)
    })
  })

  it('keeps trainings visible when nearest game block is collapsed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByText('Список тренировок')
    await user.click(screen.getByTestId('events-page-btn-nearest-game-toggle'))

    await waitFor(() => {
      expect(screen.getByText('Список тренировок')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(0)
    })
  })

  it('keeps trainings list when filters block is collapsed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByText('Список тренировок')
    const before = screen.getAllByTestId(/events-card-card-/).length

    await user.click(screen.getByTestId('events-page-btn-filters-toggle'))

    await waitFor(() => {
      expect(screen.getByText('Список тренировок')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBe(before)
    })
  })
})
