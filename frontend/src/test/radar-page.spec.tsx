/**
 * HOCFRONT-9 — сценарий RSVP ближайшей игры в разделе "Игры и тренировки".
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockEventRsvp} from '@/mocks/data/eventRsvp'
import {EventsPage} from '@/pages/EventsPage'
import {EVENTS_LABEL} from '@/shared/config/navigationLabels'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('Events page RSVP block', () => {
  beforeEach(() => {
    resetMockEventRsvp()
    clearTestStorage()
  })

  async function expandNearestGame(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByTestId('events-page-btn-nearest-game-toggle'))
    await screen.findByTestId('events-page-panel-league-rsvp')
  }

  it('keeps league RSVP collapsed by default (TASK-05-02)', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
      expect(screen.getByTestId('events-page-panel-nearest-game')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('events-page-panel-league-rsvp')).not.toBeInTheDocument()
  })

  it('shows league game hero and team RSVP list when expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText(EVENTS_LABEL)).toBeInTheDocument()
    })
    await expandNearestGame(user)

    expect(screen.getByText('Ближайшая игра')).toBeInTheDocument()
    expect(
      screen.getByTestId('radar-league-rsvp-text-matchup-event-league-sat'),
    ).toBeInTheDocument()
    expect(screen.getByText('Кто идёт из команды')).toBeInTheDocument()
    expect(screen.getByText('Вратари')).toBeInTheDocument()
    expect(screen.getByText('Нападающие')).toBeInTheDocument()
  })

  it('confirms attendance with Буду CTA', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await expandNearestGame(user)
    await user.click(screen.getByTestId('radar-league-rsvp-btn-confirm-event-league-sat'))

    await waitFor(() => {
      expect(screen.getByText('Вы идёте')).toBeInTheDocument()
    })
  })

  it('declines with preset reason and updates team list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await expandNearestGame(user)
    await user.click(screen.getByTestId('radar-league-rsvp-btn-decline-event-league-sat'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-work'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-confirm'))

    await waitFor(() => {
      expect(screen.getByText('Вы не сможете')).toBeInTheDocument()
      expect(screen.getAllByText(/Работаю/).length).toBeGreaterThan(0)
    })
  })

  it('shows upcoming trainings list without expanding league RSVP', async () => {
    renderWithProviders(<EventsPage />)

    await waitFor(() => {
      expect(screen.getByText('Список игр и тренировок')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(0)
    })
  })

  it('keeps trainings visible when nearest game block stays collapsed', async () => {
    renderWithProviders(<EventsPage />)

    await screen.findByText('Список игр и тренировок')

    await waitFor(() => {
      expect(screen.getByText('Список игр и тренировок')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBeGreaterThan(0)
      expect(screen.queryByTestId('events-page-panel-league-rsvp')).not.toBeInTheDocument()
    })
  })

  it('keeps trainings list when filters block is collapsed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EventsPage />)

    await screen.findByText('Список игр и тренировок')
    const before = screen.getAllByTestId(/events-card-card-/).length

    await user.click(screen.getByTestId('events-page-btn-filters-toggle'))

    await waitFor(() => {
      expect(screen.getByText('Список игр и тренировок')).toBeInTheDocument()
      expect(screen.getAllByTestId(/events-card-card-/).length).toBe(before)
    })
  })
})
