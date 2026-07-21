/**
 * HOCFRONT-20 - Тесты панели фильтров списка игроков
 * SPEC-FR-2.3.1, SPEC-FR-2.3.2
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'

import {PlayersPage} from '@/pages/PlayersPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('PlayersPage filters', () => {
  beforeEach(() => {
    clearTestStorage()
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
      expect(screen.getByText('Артур Лебедев')).toBeInTheDocument()
    })

    const nameField = screen.getByLabelText('Имя')
    await user.type(nameField, 'Артур')

    await waitFor(() => {
      expect(screen.getByText('Артур Лебедев')).toBeInTheDocument()
      expect(screen.queryByText('Алексей Смирнов')).not.toBeInTheDocument()
    })

    const resetButton = await screen.findByTestId('players-player-filters-btn-reset')
    expect(resetButton).toBeInTheDocument()

    await user.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText('Алексей Смирнов')).toBeInTheDocument()
      expect(screen.getByText('Артур Лебедев')).toBeInTheDocument()
    })
  })

  it('фильтрует только подтверждённых игроков', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Сергей Волков')).toBeInTheDocument()
    })

    const verifiedCheckbox = screen.getByLabelText('Только подтверждённые')
    await user.click(verifiedCheckbox)

    await waitFor(() => {
      expect(screen.queryByText('Сергей Волков')).not.toBeInTheDocument()
      expect(screen.getByText('Алексей Смирнов')).toBeInTheDocument()
      expect(screen.getByText('Артур Лебедев')).toBeInTheDocument()
    })
  })

  it('показывает пустое состояние с кнопкой сброса при отсутствии совпадений', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayersPage />)

    await waitFor(() => {
      expect(screen.getByText('Игроки')).toBeInTheDocument()
    })

    const nameField = screen.getByLabelText('Имя')
    await user.type(nameField, 'НесуществующийИгрок')

    const emptyState = await screen.findByTestId('players-players-page-empty')
    expect(within(emptyState).getByText('Пустая сетка')).toBeInTheDocument()
    expect(within(emptyState).getByText('Сбросить фильтры')).toBeInTheDocument()
  })
})
