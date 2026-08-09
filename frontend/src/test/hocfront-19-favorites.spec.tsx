/**
 * HOCFRONT-19 — entity favorites API / MSW + deep-link query params
 */

import {screen, waitFor} from '@testing-library/react'
import {Route, Routes} from 'react-router'
import {beforeEach, describe, expect, it} from 'vitest'

import {
  addFavorite,
  buildFavoriteHref,
  favoriteKey,
  fetchFavorites,
  removeFavorite,
} from '@/entities/favorites'
import {resetMockEntityFavorites} from '@/mocks/data/entityFavorites'
import {LeagueDetailsPage} from '@/pages/LeagueDetailsPage'
import {LeaguesPage} from '@/pages/LeaguesPage'
import {MarketplacePage} from '@/pages/MarketplacePage'
import {TeamProfilePage} from '@/pages/TeamProfilePage'
import {routes} from '@/shared/const/appRoutes'
import {renderWithProviders} from '@/test/render'

describe('HOCFRONT-19 favorites API', () => {
  beforeEach(() => {
    resetMockEntityFavorites()
  })

  it('lists seeded favorites', async () => {
    const {items} = await fetchFavorites()
    expect(items.length).toBeGreaterThanOrEqual(2)
    expect(items.some((item) => item.type === 'arena')).toBe(true)
  })

  it('adds and removes by type+entityId key', async () => {
    const created = await addFavorite({
      type: 'team',
      entityId: 'team-001',
      title: 'Медведи',
    })
    expect(created.id).toBe(favoriteKey('team', 'team-001'))
    expect(created.href).toContain('/teams')

    const afterAdd = await fetchFavorites()
    expect(afterAdd.items.some((item) => item.id === created.id)).toBe(true)

    await removeFavorite(created.id)
    const afterRemove = await fetchFavorites()
    expect(afterRemove.items.some((item) => item.id === created.id)).toBe(false)
  })

  it('is idempotent on duplicate add', async () => {
    const first = await addFavorite({
      type: 'training',
      entityId: 'event-002',
      title: 'Клубная тренировка',
    })
    const second = await addFavorite({
      type: 'training',
      entityId: 'event-002',
      title: 'Клубная тренировка',
    })
    expect(second.id).toBe(first.id)
    const {items} = await fetchFavorites()
    expect(items.filter((item) => item.id === first.id)).toHaveLength(1)
  })

  it('buildFavoriteHref uses path/query deep-links for team/league/product', () => {
    expect(buildFavoriteHref('team', 'team-001')).toBe(`${routes.teams}/team-001`)
    expect(buildFavoriteHref('league', 'league-002')).toBe(`${routes.leagues}?leagueId=league-002`)
    expect(buildFavoriteHref('product', 'offer-001')).toBe(`${routes.shops}?productId=offer-001`)
  })
})

describe('HOCFRONT-19 favorite deep-links', () => {
  it('team favorite href opens TeamProfilePage at /teams/:id', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/teams/:teamId" element={<TeamProfilePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/teams/team-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('teams-profile-page-team-001')).toBeInTheDocument()
    })
  })

  it('LeaguesPage redirects legacy ?leagueId= deep-link to the league page', async () => {
    renderWithProviders(
      <Routes>
        <Route path={routes.leagues} element={<LeaguesPage />} />
        <Route path={routes.leagueDetails} element={<LeagueDetailsPage />} />
      </Routes>,
      {routerProps: {initialEntries: [`${routes.leagues}?leagueId=league-002`]}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('leagues-details-page-league-002')).toBeInTheDocument()
    })
  })

  it('MarketplacePage highlights product from ?productId=', async () => {
    renderWithProviders(<MarketplacePage />, {
      routerProps: {initialEntries: [`${routes.shops}?productId=offer-001`]},
    })

    await waitFor(() => {
      const card = screen.getByTestId('shops-marketplace-card-card-offer-001')
      expect(card).toHaveAttribute('data-highlighted', 'true')
    })
  })
})
