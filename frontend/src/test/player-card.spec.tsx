/**
 * HOCFRONT-21
 * SPEC-FR-2.3.1
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router-dom'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockPlayerFavorites} from '@/mocks/data/playerFavorites'
import {mockPlayers} from '@/mocks/data/players'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'
import {PlayerCard} from '@/widgets/PlayerCard'

function findPlayer(userId: string) {
  const player = mockPlayers.find((p) => p.userId === userId)
  if (!player) throw new Error(`player ${userId} not found in mocks`)
  return player
}

describe('HOCFRONT-21 PlayerCard', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockPlayerFavorites()
  })

  it('renders position, skill level, verified badge, team and city', () => {
    const player = findPlayer('user-002')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    expect(screen.getByTestId('players-player-card-badge-position-user-002')).toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-text-skill-user-002')).toHaveTextContent(
      'Продвинутый',
    )
    expect(screen.getByTestId('players-player-card-badge-verified-user-002')).toHaveTextContent(
      'Verified',
    )
    expect(screen.getByTestId('players-player-card-text-team-user-002')).toHaveTextContent(
      'Медведи САО',
    )
    expect(screen.getByTestId('players-player-card-text-city-user-002')).toHaveTextContent('Москва')
  })

  it('hides verified badge for pending players', () => {
    const player = findPlayer('user-004')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    expect(
      screen.queryByTestId('players-player-card-badge-verified-user-004'),
    ).not.toBeInTheDocument()
  })

  it('navigates to /players/:id on card click', async () => {
    const user = userEvent.setup()
    const player = findPlayer('user-002')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
        <Route
          path="/players/:userId"
          element={<div data-testid="public-player-profile">Hockey ID</div>}
        />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    await user.click(screen.getByTestId('players-player-card-link-user-002'))
    expect(await screen.findByTestId('public-player-profile')).toBeInTheDocument()
  })

  it('toggles favorite without navigating away', async () => {
    const user = userEvent.setup()
    const player = findPlayer('user-003')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
        <Route
          path="/players/:userId"
          element={<div data-testid="public-player-profile">Hockey ID</div>}
        />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    const button = screen.getByTestId('players-player-card-btn-favorite-user-003')
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await user.click(button)

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    expect(screen.queryByTestId('public-player-profile')).not.toBeInTheDocument()
  })

  it('does not render the link wrapper when linkable=false', () => {
    const player = findPlayer('user-002')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} linkable={false} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    expect(screen.queryByTestId('players-player-card-link-user-002')).not.toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-card-user-002')).toBeInTheDocument()
  })
})
