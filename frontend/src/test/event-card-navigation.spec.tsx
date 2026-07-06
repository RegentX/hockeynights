import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router-dom'
import {describe, expect, it} from 'vitest'

import {EventCard} from '@/features/events/ui/EventCard'
import {mockEvents} from '@/mocks/data/events'
import {renderWithProviders} from '@/test/render'

describe('EventCard navigation', () => {
  it('opens training details by tap on card', async () => {
    const user = userEvent.setup()
    const training = mockEvents.find((event) => event.id === 'event-005')
    if (!training) throw new Error('training event-005 not found in mocks')

    renderWithProviders(
      <Routes>
        <Route path="/" element={<EventCard event={training} />} />
        <Route path="/events/trainings/:eventId" element={<div>Детальная тренировка</div>} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    await user.click(screen.getByTestId('events-card-card-event-005'))
    expect(await screen.findByText('Детальная тренировка')).toBeInTheDocument()
  })
})
