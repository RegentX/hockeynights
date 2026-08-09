/**
 * SPEC-NFR-10 — сбой загрузки должен объясняться и позволять повторить.
 *
 * До этих правок упавший запрос выглядел как «ничего не найдено»
 * (списки), «сущность не найдена» (детальные страницы), бесконечный
 * лоадер (кабинеты) или редирект на вход (RequireAuth).
 */

import {screen, waitFor} from '@testing-library/react'
import {http, HttpResponse} from 'msw'
import {Route, Routes} from 'react-router'
import {describe, expect, it} from 'vitest'

import {LeaguesPage} from '@/pages/LeaguesPage'
import {PlayersPage} from '@/pages/PlayersPage'
import {TeamProfilePage} from '@/pages/TeamProfilePage'
import {TeamsPage} from '@/pages/TeamsPage'
import {routes} from '@/shared/const/appRoutes'
import {server} from '@/test/msw-server'
import {renderWithProviders} from '@/test/render'

/** Запрос падает так же, как при недоступном API */
function failRoute(path: string) {
  server.use(http.get(path, () => HttpResponse.json({message: 'boom'}, {status: 500})))
}

describe('Состояния ошибки загрузки', () => {
  it('TeamsPage показывает ошибку, а не «команды не найдены»', async () => {
    failRoute('/mock-api/v1/teams')
    renderWithProviders(<TeamsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('teams-teams-page-error')).toBeInTheDocument()
    })
    expect(screen.getByText('Не удалось загрузить команды')).toBeInTheDocument()
    // «Команды не найдены» ввело бы в заблуждение: дело не в фильтрах
    expect(screen.queryByTestId('teams-teams-page-empty')).not.toBeInTheDocument()
    expect(screen.getByTestId('teams-query-error-btn-retry')).toBeInTheDocument()
  })

  it('PlayersPage показывает ошибку вместо пустой сетки', async () => {
    failRoute('/mock-api/v1/players')
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByTestId('players-players-page-error')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('players-players-page-empty')).not.toBeInTheDocument()
  })

  it('LeaguesPage показывает ошибку вместо «лиг не найдено»', async () => {
    failRoute('/mock-api/v1/leagues')
    renderWithProviders(<LeaguesPage />)

    await waitFor(() => {
      expect(screen.getByTestId('leagues-page-error')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('leagues-page-empty')).not.toBeInTheDocument()
  })

  it('TeamProfilePage при сбое предлагает повтор, а не «команда не найдена»', async () => {
    failRoute('/mock-api/v1/teams/:teamId')
    renderWithProviders(
      <Routes>
        <Route path={routes.teamProfile} element={<TeamProfilePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/teams/team-001']}},
    )

    await waitFor(() => {
      expect(screen.getByTestId('teams-profile-error')).toBeInTheDocument()
    })
    expect(screen.queryByText('Команда не найдена')).not.toBeInTheDocument()
  })

  it('TeamProfilePage на 404 по-прежнему говорит «команда не найдена»', async () => {
    server.use(
      http.get('/mock-api/v1/teams/:teamId', () =>
        HttpResponse.json({message: 'Team not found'}, {status: 404}),
      ),
    )
    renderWithProviders(
      <Routes>
        <Route path={routes.teamProfile} element={<TeamProfilePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/teams/team-does-not-exist']}},
    )

    await waitFor(() => {
      expect(screen.getByText('Команда не найдена')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('teams-profile-error')).not.toBeInTheDocument()
  })
})
