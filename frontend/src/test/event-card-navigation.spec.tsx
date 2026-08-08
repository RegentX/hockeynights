import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router'
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

  it('opens game details by tap on card', async () => {
    const user = userEvent.setup()
    const game = mockEvents.find((event) => event.id === 'event-001' && event.type === 'game')
    if (!game) throw new Error('game event-001 not found in mocks')

    renderWithProviders(
      <Routes>
        <Route path="/" element={<EventCard event={game} />} />
        <Route path="/events/games/:eventId" element={<div>Детальная игра</div>} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    await user.click(screen.getByTestId('events-card-card-event-001'))
    expect(await screen.findByText('Детальная игра')).toBeInTheDocument()
  })
})
