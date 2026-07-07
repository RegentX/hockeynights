/**
 * SPEC-FR-6.1.1, SPEC-FR-6.1.2, SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1, SPEC-FR-6.4.2
 * SPEC-UI-2.2, SPEC-UI-3.1, SPEC-UI-3.2, SPEC-UI-3.3
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {http, HttpResponse} from 'msw'
import {describe, expect, it} from 'vitest'

import {ArenasPage} from '@/pages/ArenasPage'
import {server} from '@/test/msw-server'
import {renderWithProviders} from '@/test/render'

describe('Arenas map and booking modes', () => {
  /** @spec SPEC-FR-6.1.1 */
  it('renders interactive map with arena pins', async () => {
    renderWithProviders(<ArenasPage />)

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
  it('shows slot calendar for slot_calendar arena', async () => {
    renderWithProviders(<ArenasPage />)

    await waitFor(() => {
      expect(screen.getByText('Запись по слотам')).toBeInTheDocument()
      expect(screen.getAllByText(/Свободно/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.2.2 */
  it('shows portal booking for external_portal arena', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArenasPage />)

    const luzhnikiPin = await screen.findByRole('button', {
      name: /Каток «Лужники», Запись через портал/i,
    })
    await user.click(luzhnikiPin)

    await waitFor(() => {
      expect(screen.getAllByText(/Каток «Лужники»/i).length).toBeGreaterThan(0)
      expect(screen.getByRole('button', {name: 'Оставить заявку на лёд'})).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-6.2.1, SPEC-UI-2.2 - Клик по карточке в списке открывает детали */
  it('selects arena from list and opens detail panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArenasPage />)

    const cards = await screen.findAllByRole('button', {name: /Каток «Лужники»/i})
    const rinkCard = cards.find((el) => el.classList.contains('rink-card')) as HTMLElement
    expect(rinkCard).toBeTruthy()
    await user.click(rinkCard)

    await waitFor(() => {
      expect(rinkCard).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', {name: 'Оставить заявку на лёд'})).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-6.2.1, SPEC-UI-2.2 - Клик по маркеру подсвечивает карточку в списке */
  it('selects arena from map and highlights the list card', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArenasPage />)

    const khodynkaPin = await screen.findByRole('button', {
      name: /Ледовый дворец на Ходынке, Слоты по времени/i,
    })
    await user.click(khodynkaPin)

    await waitFor(() => {
      const cards = screen.getAllByRole('button', {name: /Ледовый дворец на Ходынке/i})
      const rinkCard = cards.find((el) => el.classList.contains('rink-card')) as HTMLElement
      expect(rinkCard).toHaveAttribute('aria-pressed', 'true')
    })
  })

  /** @spec SPEC-FR-6.1.2, SPEC-UI-2.2 - Поиск по названию/метро */
  it('filters arenas by search query', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArenasPage />)

    const search = await screen.findByPlaceholderText('Название, метро, район')
    await user.type(search, 'ВДНХ')

    await waitFor(() => {
      expect(screen.queryByText(/Ходынке/i)).not.toBeInTheDocument()
      expect(screen.getAllByText(/Открытый каток ВДНХ/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.1.2, SPEC-UI-3.2 - Пустое состояние с кнопкой сброса */
  it('shows empty state with reset button when nothing matches', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArenasPage />)

    const search = await screen.findByPlaceholderText('Название, метро, район')
    await user.type(search, 'qwerty-каток-не-существует')

    const emptyState = await screen.findByText(/По выбранным фильтрам катки не найдены/i)
    const resetButton = within(emptyState.parentElement as HTMLElement).getByRole('button', {
      name: /Сбросить фильтры/i,
    })
    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Название, метро, район')).toHaveValue('')
      expect(screen.getAllByText(/Ходынке/i).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-6.1.2 - Выбранная арена сбрасывается, если она скрыта фильтром */
  it('clears hidden selection when filter hides selected arena', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArenasPage />)

    const khodynkaCard = (
      await screen.findAllByRole('button', {name: /Ледовый дворец на Ходынке/i})
    ).find((el) => el.classList.contains('rink-card')) as HTMLElement
    await user.click(khodynkaCard)
    await waitFor(() => expect(khodynkaCard).toHaveAttribute('aria-pressed', 'true'))

    const search = screen.getByPlaceholderText('Название, метро, район')
    await user.type(search, 'ВДНХ')

    await waitFor(() => {
      expect(screen.queryByText(/Ледовый дворец на Ходынке/i)).not.toBeInTheDocument()
      const rinkCards = screen
        .getAllByRole('button', {name: /Открытый каток ВДНХ/i})
        .filter((el) => el.classList.contains('rink-card')) as HTMLElement[]
      expect(rinkCards.length).toBeGreaterThan(0)
      const pressed = rinkCards.filter((card) => card.getAttribute('aria-pressed') === 'true')
      expect(pressed).toHaveLength(1)
    })
  })

  /** @spec SPEC-FR-6.2.1 - Закрытие детали не сбрасывает фильтры */
  it('closing detail panel keeps filters intact', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ArenasPage />)

    const search = await screen.findByPlaceholderText('Название, метро, район')
    await user.type(search, 'ВДНХ')

    const vdnhCard = (await screen.findAllByRole('button', {name: /Открытый каток ВДНХ/i})).find(
      (el) => el.classList.contains('rink-card'),
    ) as HTMLElement
    await user.click(vdnhCard)

    const closeButton = await screen.findByRole('button', {name: 'Закрыть детали'})
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Название, метро, район')).toHaveValue('ВДНХ')
      expect(screen.queryByText(/Ходынке/i)).not.toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-6.1.2 - Ошибка загрузки → fallback с повтором */
  it('shows error fallback with retry on API failure', async () => {
    server.use(
      http.get('*/mock-api/v1/arenas', () => HttpResponse.json({message: 'boom'}, {status: 500})),
    )

    renderWithProviders(<ArenasPage />)

    const retry = await screen.findByRole('button', {name: /Повторить/i})
    expect(screen.getByText(/Не удалось загрузить катки/i)).toBeInTheDocument()
    expect(retry).toBeInTheDocument()
  })
})
