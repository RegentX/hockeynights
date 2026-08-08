/**
 * HOCFRONT-28 / TASK-05-05 — запись на тренировку
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {mockEvents} from '@/mocks/data/events'
import {TrainingDetailsPage} from '@/pages/TrainingDetailsPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-28 training registration', () => {
  beforeEach(() => {
    clearTestStorage()
    // reset participation on open training
    const open = mockEvents.find((event) => event.id === 'event-002')
    if (open) open.participation = []
    const full = mockEvents.find((event) => event.id === 'event-005')
    if (full) full.participation = []
  })

  it('joins an open training and then cancels', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/events/trainings/:eventId" element={<TrainingDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/events/trainings/event-002']}},
    )

    await screen.findByTestId('events-training-page-page-event-002')
    await user.click(screen.getByTestId('events-training-registration-btn-join-event-002'))

    await waitFor(() => {
      expect(
        screen.getByTestId('events-training-registration-text-status-event-002'),
      ).toHaveTextContent('Вы записаны')
    })

    await user.click(screen.getByTestId('events-training-registration-btn-cancel-event-002'))

    await waitFor(() => {
      expect(
        screen.getByTestId('events-training-registration-btn-join-event-002'),
      ).toBeInTheDocument()
    })
  })

  it('offers waitlist when training is full', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/events/trainings/:eventId" element={<TrainingDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/events/trainings/event-005']}},
    )

    await screen.findByTestId('events-training-page-page-event-005')
    expect(
      screen.getByTestId('events-training-registration-btn-waitlist-event-005'),
    ).toBeInTheDocument()

    await user.click(screen.getByTestId('events-training-registration-btn-waitlist-event-005'))

    await waitFor(() => {
      expect(
        screen.getByTestId('events-training-registration-text-status-event-005'),
      ).toHaveTextContent(/ожидания/)
    })
  })
})
