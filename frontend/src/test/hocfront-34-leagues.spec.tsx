/**
 * HOCFRONT-34 — реформа раздела «Лиги»: каталог с поиском/фильтрами,
 * отдельная страница лиги, виджет «Моя лига».
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('toggles a quick filter chip like on /arenas', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues']}},
    )

    await screen.findByTestId('leagues-card-card-league-004')
    await user.click(screen.getByTestId('leagues-filters-btn-chip-moscow'))

    await waitFor(() => {
      expect(screen.getByTestId('leagues-filters-btn-chip-moscow')).toHaveClass('is-active')
      expect(screen.queryByTestId('leagues-card-card-league-004')).not.toBeInTheDocument()
      expect(screen.getByTestId('leagues-card-card-league-001')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('leagues-filters-btn-chip-moscow'))
    await waitFor(() => {
      expect(screen.getByTestId('leagues-card-card-league-004')).toBeInTheDocument()
    })
  })

  it('opens the league page by clicking anywhere on the card, not only the button', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
        <Route path={routes.leagueDetails} element={<LeagueDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues']}},
    )

    const card = await screen.findByTestId('leagues-card-card-league-002')
    await user.click(card)

    await waitFor(() => {
      expect(screen.getByTestId('leagues-details-page-league-002')).toBeInTheDocument()
    })
  })

  it('keeps the website link as a subtle in-card link, separate from the card click', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
        <Route path={routes.leagueDetails} element={<LeagueDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/leagues']}},
    )

    const siteLink = await screen.findByTestId('leagues-card-btn-portal-league-001')
    expect(siteLink.className).toContain('league-card__site-link')

    await user.click(siteLink)

    // Клик по ссылке сайта открывает mock-портал, а не страницу лиги
    expect(screen.queryByTestId('leagues-details-page-league-001')).not.toBeInTheDocument()
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
