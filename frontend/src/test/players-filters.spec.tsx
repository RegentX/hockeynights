/**
 * HOCFRONT-20 - Тесты панели фильтров списка игроков
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {delay, http, HttpResponse} from 'msw'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {PlayersPage} from '@/pages/PlayersPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {server} from '@/test/msw-server'
import {renderWithProviders} from '@/test/render'

function mockMatchMedia(matchesMobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchesMobile && query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

async function selectOption(testIdValue: string, optionLabel: string) {
  const user = userEvent.setup()
  await user.click(screen.getByTestId(testIdValue))
  const option = await screen.findByRole('option', {name: optionLabel})
  await user.click(option)
}

describe('PlayersPage filters', () => {
  beforeEach(() => {
    clearTestStorage()
    mockMatchMedia(false)
  })

  it('отображает панель фильтров со всеми полями HOCFRONT-20', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByTestId('players-player-filters-panel')).toBeInTheDocument()
    })

    const form = screen.getByTestId('players-player-filters-form')
    expect(within(form).getByLabelText('Имя')).toBeInTheDocument()
    expect(within(form).getByText('Амплуа')).toBeInTheDocument()
    expect(within(form).getByText('Уровень')).toBeInTheDocument()
    expect(within(form).getByLabelText('Район')).toBeInTheDocument()
    expect(within(form).getByText('Команда')).toBeInTheDocument()
    expect(within(form).getByText('Город')).toBeInTheDocument()
    expect(within(form).getByText('Только подтверждённые')).toBeInTheDocument()
    expect(within(form).getByText('Только вратари')).toBeInTheDocument()
  })

  it('фильтрует по имени и отображает кнопку сброса', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })

    const nameField = screen.getByLabelText('Имя')
    await user.type(nameField, 'Артур')

    await waitFor(
      () => {
        expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
        expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      },
      {timeout: 3000},
    )

    const resetButton = await screen.findByTestId('players-player-filters-btn-reset')
    expect(resetButton).toBeInTheDocument()

    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })
  })

  it('фильтрует только подтверждённых игроков', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Волков Сергей Николаевич')).toBeInTheDocument()
    })

    const verifiedCheckbox = screen.getByLabelText('Только подтверждённые')
    await user.click(verifiedCheckbox)

    await waitFor(() => {
      expect(screen.queryByText('Волков Сергей Николаевич')).not.toBeInTheDocument()
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })
  })

  it('снимает verified без оставшихся активных фильтров', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    const verifiedCheckbox = screen.getByLabelText('Только подтверждённые')
    await user.click(verifiedCheckbox)

    await waitFor(() => {
      expect(screen.getByTestId('players-players-page-text-active-count')).toHaveTextContent(
        'Активных фильтров: 1',
      )
      expect(screen.getByTestId('players-player-filters-btn-reset')).toBeInTheDocument()
    })

    await user.click(verifiedCheckbox)

    await waitFor(() => {
      expect(screen.queryByTestId('players-players-page-text-active-count')).not.toBeInTheDocument()
      expect(screen.queryByTestId('players-player-filters-btn-reset')).not.toBeInTheDocument()
    })
  })

  it('фильтрует по команде', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    await selectOption('players-player-filters-select-team', 'Медведи САО')

    await waitFor(() => {
      expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      expect(screen.queryByText('Лебедев Артур Олегович')).not.toBeInTheDocument()
      expect(screen.getByText('Козлов Дмитрий Александрович')).toBeInTheDocument()
      expect(screen.getByText('Волков Сергей Николаевич')).toBeInTheDocument()
    })
  })

  it('фильтрует по городу', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
    })

    await selectOption('players-player-filters-select-city', 'Санкт-Петербург')

    await waitFor(() => {
      expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
      expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      expect(screen.queryByText('Козлов Дмитрий Александрович')).not.toBeInTheDocument()
    })
  })

  it('фильтрует по амплуа и уровню', async () => {
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    await selectOption('players-player-filters-select-position', 'Вратарь')
    await selectOption('players-player-filters-select-skill-level', 'Практик')

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      expect(screen.queryByText('Морозов Никита Алексеевич')).not.toBeInTheDocument()
      expect(screen.queryByText('Козлов Дмитрий Александрович')).not.toBeInTheDocument()
    })
  })

  it('на mobile сворачивает фильтры и поддерживает aria-expanded', async () => {
    mockMatchMedia(true)
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    const toggle = await screen.findByTestId('players-player-filters-btn-toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls')
    expect(screen.queryByTestId('players-player-filters-form')).not.toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByTestId('players-player-filters-form')).toBeInTheDocument()
  })

  it('показывает индикатор загрузки при refetch со stale-данными', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
    })

    server.use(
      http.get('/mock-api/v1/players', async () => {
        await delay(300)
        return HttpResponse.json([
          {
            userId: 'user-006',
            displayName: 'Лебедев Артур Олегович',
            fullName: 'Лебедев Артур Олегович',
            city: 'Санкт-Петербург',
            position: 'forward',
            skillLevel: 'amateur',
            stickHand: 'right',
            availability: [],
            profileCompleteness: 72,
            karmaScore: 80,
            verificationStatus: 'verified',
          },
        ])
      }),
    )

    const nameField = screen.getByLabelText('Имя')
    await user.type(nameField, 'Артур')

    await waitFor(
      () => {
        expect(screen.getByTestId('players-players-page-progress')).toHaveClass(
          'players-page__progress--active',
        )
        expect(screen.getByText('Смирнов Алексей Дмитриевич')).toBeInTheDocument()
      },
      {timeout: 3000},
    )

    await waitFor(
      () => {
        expect(screen.getByText('Лебедев Артур Олегович')).toBeInTheDocument()
        expect(screen.queryByText('Смирнов Алексей Дмитриевич')).not.toBeInTheDocument()
      },
      {timeout: 3000},
    )
  })

  it('показывает пустое состояние с кнопкой сброса при отсутствии совпадений', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Игроки')).toBeInTheDocument()
    })

    const nameField = screen.getByLabelText('Имя')
    await user.type(nameField, 'НесуществующийИгрок')

    const emptyState = await screen.findByTestId('players-players-page-empty', {}, {timeout: 3000})
    expect(within(emptyState).getByText('Пустая сетка')).toBeInTheDocument()
    expect(
      within(emptyState).getByText('Игроки не найдены по выбранным фильтрам.'),
    ).toBeInTheDocument()
    expect(within(emptyState).getByText('Сбросить фильтры')).toBeInTheDocument()
  })
})
