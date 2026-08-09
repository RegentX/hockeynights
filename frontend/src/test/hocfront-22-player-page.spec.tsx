/**
 * HOCFRONT-22 — публичная страница игрока `/players/:id`
 */

import {screen, waitFor} from '@testing-library/react'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockSession} from '@/mocks/data/session'
import {PublicPlayerProfilePage} from '@/pages/PublicPlayerProfilePage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

function renderPlayerPage(userId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/players/:userId" element={<PublicPlayerProfilePage />} />
    </Routes>,
    {routerProps: {initialEntries: [`/players/${userId}`]}},
  )
}

describe('HOCFRONT-22 страница игрока', () => {
  beforeEach(() => {
    clearTestStorage()
    resetMockSession()
  })

  it('показывает публичную информацию, команду, избранное и календарь без района/метро', async () => {
    renderPlayerPage('user-002')

    await waitFor(() => {
      expect(screen.getByTestId('players-public-player-profile-page-user-002')).toBeInTheDocument()
    })

    expect(screen.getByTestId('players-public-info-card-user-002')).toBeInTheDocument()
    expect(screen.getByTestId('players-public-info-text-city-user-002')).toHaveTextContent('Москва')
    expect(screen.getByTestId('players-public-info-text-city-user-002')).not.toHaveTextContent(
      'СЗАО',
    )
    expect(screen.queryByTestId('players-player-card-text-metro-user-002')).not.toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-text-city-user-002')).toHaveTextContent('Москва')
    expect(screen.getByTestId('players-player-card-text-city-user-002')).not.toHaveTextContent(
      'СЗАО',
    )

    expect(screen.getByTestId('players-public-player-profile-section-team')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('players-player-teams-list-user-002')).toBeInTheDocument()
    })
    expect(screen.getByTestId('players-player-teams-link-team-002')).toHaveAttribute(
      'href',
      '/teams/team-002',
    )

    expect(
      screen.getByTestId('players-public-player-profile-section-favorites'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('players-public-player-profile-card-favorites-private'),
    ).toBeInTheDocument()

    expect(screen.getByTestId('players-public-player-profile-section-calendar')).toBeInTheDocument()
    expect(screen.getByTestId('players-schedule-preview-text-title')).toHaveTextContent(
      'Календарь игрока',
    )
  })

  it('на своей странице показывает полный список избранного', async () => {
    renderPlayerPage('user-001')

    await waitFor(() => {
      expect(screen.getByTestId('players-public-player-profile-page-user-001')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByTestId('favorites-profile-section-page')).toBeInTheDocument()
    })
    expect(
      screen.queryByTestId('players-public-player-profile-card-favorites-private'),
    ).not.toBeInTheDocument()
  })
})
