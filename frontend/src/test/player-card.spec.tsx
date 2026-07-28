/**
 * HOCFRONT-21
 * SPEC-FR-2.3.1
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {delay, http, HttpResponse} from 'msw'
import {Route, Routes} from 'react-router-dom'
import {beforeEach, describe, expect, it} from 'vitest'

import {getMockPlayerFavorites, resetMockPlayerFavorites} from '@/mocks/data/playerFavorites'
import {mockPlayers} from '@/mocks/data/players'
import {clearTestStorage} from '@/test/clearTestStorage'
import {server} from '@/test/msw-server'
import {renderWithProviders} from '@/test/render'
import {PlayerCard} from '@/widgets/PlayerCard'

function findPlayer(userId: string) {
  const player = mockPlayers.find((p) => p.userId === userId)
  if (!player) throw new Error(`player ${userId} not found in mocks`)
  return player
}

async function waitFavoriteReady(userId: string) {
  const button = screen.getByTestId(`players-player-card-btn-favorite-${userId}`)
  await waitFor(() => {
    expect(button).not.toBeDisabled()
  })
  return button
}

describe('HOCFRONT-21 PlayerCard', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockPlayerFavorites()
  })

  it('renders position, skill level, verified badge, team and city', async () => {
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
      'Подтверждён',
    )
    expect(screen.getByTestId('players-player-card-text-team-user-002')).toHaveTextContent(
      'Медведи САО',
    )
    expect(screen.getByTestId('players-player-card-text-city-user-002')).toHaveTextContent('Москва')
    await waitFavoriteReady('user-002')
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

  it('shows favorite pressed for players already in favorites', async () => {
    const player = findPlayer('user-002')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    const button = await waitFavoriteReady('user-002')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps favorite button disabled and does not patch while favorites are loading', async () => {
    let releaseFavorites: (() => void) | undefined
    const favoritesGate = new Promise<void>((resolve) => {
      releaseFavorites = resolve
    })

    server.use(
      http.get('*/mock-api/v1/players/favorites', async () => {
        await favoritesGate
        return HttpResponse.json(getMockPlayerFavorites())
      }),
    )

    const player = findPlayer('user-003')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    const button = screen.getByTestId('players-player-card-btn-favorite-user-003')
    expect(button).toBeDisabled()
    expect(button).not.toHaveAttribute('aria-pressed')
    expect(getMockPlayerFavorites().playerIds).toEqual(['user-002'])

    releaseFavorites?.()
    await waitFavoriteReady('user-003')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(getMockPlayerFavorites().playerIds).toEqual(['user-002'])
  })

  it('toggles favorite without navigating away and keeps existing favorites', async () => {
    const user = userEvent.setup()
    const favoritePlayer = findPlayer('user-002')
    const otherPlayer = findPlayer('user-003')
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <>
              <PlayerCard player={favoritePlayer} />
              <PlayerCard player={otherPlayer} />
            </>
          }
        />
        <Route
          path="/players/:userId"
          element={<div data-testid="public-player-profile">Hockey ID</div>}
        />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    const favoriteButton = await waitFavoriteReady('user-002')
    const otherButton = await waitFavoriteReady('user-003')
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    expect(otherButton).toHaveAttribute('aria-pressed', 'false')

    await user.click(otherButton)

    await waitFor(() => {
      expect(otherButton).toHaveAttribute('aria-pressed', 'true')
    })
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    expect(getMockPlayerFavorites().playerIds).toEqual(
      expect.arrayContaining(['user-002', 'user-003']),
    )
    expect(screen.queryByTestId('public-player-profile')).not.toBeInTheDocument()
  })

  it('rolls back optimistic favorite state when PATCH fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.patch('*/mock-api/v1/players/favorites', async () => {
        await delay(20)
        return HttpResponse.json({message: 'boom'}, {status: 500})
      }),
    )

    const player = findPlayer('user-003')
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PlayerCard player={player} />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    const button = await waitFavoriteReady('user-003')
    await user.click(button)

    await waitFor(() => {
      expect(
        screen.getByTestId('players-player-card-text-favorite-error-user-003'),
      ).toBeInTheDocument()
    })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(getMockPlayerFavorites().playerIds).toEqual(['user-002'])
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
