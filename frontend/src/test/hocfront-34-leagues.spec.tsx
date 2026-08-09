/**
 * HOCFRONT-34 — реформа раздела «Лиги»: каталог с поиском/фильтрами,
 * отдельная страница лиги, виджет «Моя лига».
 */

import {screen, waitFor} from '@testing-library/react'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {LeagueDetailsPage} from '@/pages/LeagueDetailsPage'
import {LeaguesPage} from '@/pages/LeaguesPage'
import {routes} from '@/shared/const/appRoutes'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-34 Leagues reform', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  it('filters catalog by region Москва / Россия via URL', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues?region=russia']}},
    )

    await waitFor(() => {
      expect(screen.queryByTestId('leagues-card-card-league-001')).not.toBeInTheDocument()
      expect(screen.getByTestId('leagues-card-card-league-004')).toBeInTheDocument()
    })
  })

  it('filters catalog by search query', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues?q=Уральская']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('leagues-card-card-league-005')).toBeInTheDocument()
      expect(screen.queryByTestId('leagues-card-card-league-001')).not.toBeInTheDocument()
    })
  })

  it('opens a dedicated league page with profile, standings and schedule', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
        <Route path={routes.leagueDetails} element={<LeagueDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues/league-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('leagues-details-page-league-001')).toBeInTheDocument()
      expect(screen.getByTestId('leagues-profile-panel-league-001')).toBeInTheDocument()
      expect(screen.getByRole('table', {name: /Турнирная таблица/i})).toBeInTheDocument()
      expect(screen.getAllByText('Медведи САО').length).toBeGreaterThan(0)
    })
  })

  it('shows an empty state when filters match nothing, with a reset action', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues?q=несуществующая-лига-xyz']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('leagues-page-empty')).toBeInTheDocument()
      expect(screen.getByTestId('leagues-page-btn-reset')).toBeInTheDocument()
    })
  })

  it('shows the "My league" widget for a player whose team is linked to a league', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('leagues-my-league-card-league-001')).toBeInTheDocument()
      expect(screen.getAllByText(/Медведи САО/).length).toBeGreaterThan(0)
      expect(screen.getByTestId('leagues-my-league-text-rank-league-001')).toBeInTheDocument()
    })
  })
})
