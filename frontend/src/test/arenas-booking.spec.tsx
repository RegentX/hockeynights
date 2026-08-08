/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1, SPEC-FR-6.4.2
 * SPEC-UI-2.2, SPEC-UI-3.1, SPEC-UI-3.2, SPEC-UI-3.3
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {http, HttpResponse} from 'msw'
import {Route, Routes} from 'react-router'
import {describe, expect, it} from 'vitest'

import {ArenaDetailsPage} from '@/pages/ArenaDetailsPage'
import {ArenasPage} from '@/pages/ArenasPage'
import {routes} from '@/shared/const/appRoutes'
import {server} from '@/test/msw-server'
import {renderWithProviders} from '@/test/render'

function renderArenasApp(initialEntry = '/arenas') {
  return renderWithProviders(
    <Routes>
      <Route path={routes.arenas} element={<ArenasPage />} />
      <Route path={routes.arenaDetails} element={<ArenaDetailsPage />} />
    </Routes>,
    {routerProps: {initialEntries: [initialEntry]}},
  )
}

describe('Arenas map and booking modes', () => {
  /** @spec SPEC-FR-6.1.1 */
  it('renders interactive map with arena pins', async () => {
    const user = userEvent.setup()
    renderArenasApp()

    await user.click(await screen.findByTestId('arenas-filters-btn-view-map'))

    await waitFor(() => {
      expect(
        screen.getByRole('application', {name: 'Карта площадок для аренды льда · Москва'}),
      ).toBeInTheDocument()
      expect(screen.getAllByText(/OpenStreetMap/i).length).toBeGreaterThan(0)
      expect(screen.getByText(/Москва и ближнее Подмосковье/i)).toBeInTheDocument()
      expect(screen.getAllByText('Слоты по времени').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Запись через портал').length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.3.1 */
  it('shows slot calendar on arena details page', async () => {
    renderArenasApp('/arenas/arena-001')

    await waitFor(() => {
      expect(screen.getByTestId('arenas-details-page-arena-001')).toBeInTheDocument()
      expect(screen.getByText('Свободное время')).toBeInTheDocument()
      expect(screen.getAllByText(/Свободно/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.2.2 */
  it('shows portal booking on external_portal arena page', async () => {
    renderArenasApp('/arenas/arena-002')

    await waitFor(() => {
      expect(screen.getByTestId('arenas-details-page-arena-002')).toBeInTheDocument()
      expect(screen.getByRole('button', {name: 'Оставить заявку на лёд'})).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-6.2.1, SPEC-UI-2.2 - Клик по карточке открывает страницу арены */
  it('navigates to arena details page from list card', async () => {
    const user = userEvent.setup()
    renderArenasApp()

    const cards = await screen.findAllByRole('button', {name: /Каток «Лужники»/i})
    const rinkCard = cards.find((el) => el.classList.contains('rink-card')) as HTMLElement
    expect(rinkCard).toBeTruthy()
    await user.click(rinkCard)

    await waitFor(() => {
      expect(screen.getByTestId('arenas-details-page-arena-002')).toBeInTheDocument()
      expect(screen.getByRole('button', {name: 'Оставить заявку на лёд'})).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-6.2.1, SPEC-UI-2.2 - Клик по маркеру открывает страницу арены */
  it('navigates to arena details page from map pin', async () => {
    const user = userEvent.setup()
    renderArenasApp()

    await user.click(await screen.findByTestId('arenas-filters-btn-view-map'))

    const khodynkaPin = await screen.findByRole('button', {
      name: /Ледовый дворец на Ходынке, Слоты по времени/i,
    })
    await user.click(khodynkaPin)

    await waitFor(() => {
      expect(screen.getByTestId('arenas-details-page-arena-001')).toBeInTheDocument()
      expect(screen.getByText('Свободное время')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-6.1.2, SPEC-UI-2.2 - Поиск по названию/метро */
  it('filters arenas by search query', async () => {
    const user = userEvent.setup()
    renderArenasApp()

    const search = await screen.findByPlaceholderText('Название, метро, район, город…')
    await user.type(search, 'ВДНХ')

    await waitFor(() => {
      expect(screen.queryByText(/Ходынке/i)).not.toBeInTheDocument()
      expect(screen.getAllByText(/Открытый каток ВДНХ/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.1.2, SPEC-UI-3.2 - Пустое состояние с кнопкой сброса */
  it('shows empty state with reset button when nothing matches', async () => {
    const user = userEvent.setup()
    renderArenasApp()

    const search = await screen.findByPlaceholderText('Название, метро, район, город…')
    await user.type(search, 'qwerty-каток-не-существует')

    const emptyState = await screen.findByText(/По выбранным фильтрам ледовые арены не найдены/i)
    const resetButton = within(emptyState.parentElement as HTMLElement).getByRole('button', {
      name: /Сбросить фильтры/i,
    })
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Название, метро, район, город…')).toHaveValue('')
      expect(screen.getAllByText(/Ходынке/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.2.1 - Со страницы арены можно вернуться в каталог */
  it('returns to catalog from arena details page', async () => {
    const user = userEvent.setup()
    renderArenasApp('/arenas/arena-001')

    await screen.findByTestId('arenas-details-page-arena-001')
    await user.click(screen.getByTestId('arenas-details-btn-back'))

    await waitFor(() => {
      expect(screen.getByTestId('arenas-page')).toBeInTheDocument()
      expect(screen.getByTestId('arenas-rink-card-arena-001')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-6.1.2 - Ошибка загрузки → fallback с повтором */
  it('shows error fallback with retry on API failure', async () => {
    server.use(
      http.get('*/mock-api/v1/arenas', () => HttpResponse.json({message: 'boom'}, {status: 500})),
    )

    renderArenasApp()

    const retry = await screen.findByRole('button', {name: /Повторить/i})
    expect(screen.getByText(/Не удалось загрузить ледовые арены/i)).toBeInTheDocument()
    expect(retry).toBeInTheDocument()
  })
})
