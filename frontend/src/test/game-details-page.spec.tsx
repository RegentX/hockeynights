import {screen, waitFor} from '@testing-library/react'
import {Route, Routes} from 'react-router'
import {describe, expect, it} from 'vitest'

import {LEAGUE_SATURDAY_EVENT_ID} from '@/entities/event'
import {GameDetailsPage} from '@/pages/GameDetailsPage'
import {renderWithProviders} from '@/test/render'

describe('GameDetailsPage', () => {
  it('opens game page by route and shows roster/registration blocks', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/events/games/:eventId" element={<GameDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [`/events/games/${LEAGUE_SATURDAY_EVENT_ID}`]}},
    )

    await waitFor(() => {
      expect(
        screen.getByTestId(`events-game-page-page-${LEAGUE_SATURDAY_EVENT_ID}`),
      ).toBeInTheDocument()
      expect(screen.getByText('Лига — Медведи САО vs Вымпел')).toBeInTheDocument()
      expect(screen.getByText('Контакты организатора')).toBeInTheDocument()
      expect(screen.getByText('Ваш ответ команде')).toBeInTheDocument()
      expect(
        screen.getByTestId(`radar-team-rsvp-response-btn-confirm-${LEAGUE_SATURDAY_EVENT_ID}`),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId(`radar-team-rsvp-response-btn-decline-${LEAGUE_SATURDAY_EVENT_ID}`),
      ).toBeInTheDocument()
    })
  })

  it('shows empty state for training id', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/events/games/:eventId" element={<GameDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/events/games/event-005']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('events-game-page-empty')).toBeInTheDocument()
      expect(screen.getByText('Игра не найдена')).toBeInTheDocument()
    })
  })
})
