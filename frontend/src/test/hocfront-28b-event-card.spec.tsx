/**
 * HOCFRONT-28B — EventCard v2
 */

import {screen, waitFor} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

import {EventCard} from '@/features/events/ui/EventCard'
import {mockEvents} from '@/mocks/data/events'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-28B EventCard v2', () => {
  it('shows date, rub price, arena, level, seats and CTA', async () => {
    const training = mockEvents.find((event) => event.id === 'event-001')
    if (!training) throw new Error('event-001 missing')

    renderWithProviders(<EventCard event={training} />)

    await waitFor(() => {
      expect(screen.getByTestId('events-card-text-weekday-event-001')).toBeInTheDocument()
      expect(screen.getByTestId('events-card-text-price-event-001')).toHaveTextContent('₽')
      expect(screen.getByTestId('events-card-text-price-event-001')).not.toHaveTextContent('RUB')
      expect(screen.getByTestId('events-card-text-arena-event-001')).toHaveTextContent(
        'Ледовый дворец на Ходынке',
      )
      expect(screen.getByTestId('events-card-text-datetime-event-001')).toHaveTextContent(
        'Любитель',
      )
      expect(screen.getByTestId('events-card-text-seats-event-001')).toHaveTextContent('Мест:')
      expect(screen.getByTestId('events-card-badge-access-event-001')).not.toHaveTextContent(
        'public_open',
      )
    })

    expect(
      screen.getByTestId('events-training-registration-btn-join-event-001'),
    ).toBeInTheDocument()
  })

  it('shows waitlist CTA when event is full', async () => {
    const full = mockEvents.find((event) => event.id === 'event-005')
    if (!full) throw new Error('event-005 missing')

    renderWithProviders(<EventCard event={{...full, participation: []}} />)

    await waitFor(() => {
      expect(
        screen.getByTestId('events-training-registration-btn-waitlist-event-005'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('events-card-text-status-event-005')).toHaveTextContent('Мест нет')
    })
  })
})
