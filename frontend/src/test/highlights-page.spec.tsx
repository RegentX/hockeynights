/**
 * SPEC-FR-14.1.1, SPEC-FR-14.1.2, SPEC-FR-14.1.3, SPEC-FR-14.1.4
 * SPEC-UI-6.3, SPEC-UI-6.4
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'

import {HighlightsPage} from '@/features/highlights/HighlightsPage'
import {resetMockHighlightsState} from '@/mocks/data/highlights'
import {renderWithProviders} from '@/test/render'

describe('Highlight Analysis page', () => {
  beforeEach(() => {
    resetMockHighlightsState()
  })

  /** @spec SPEC-FR-14.1.1, SPEC-UI-6.3 */
  it('loads catalog and video board for selected highlight', async () => {
    renderWithProviders(<HighlightsPage />)

    await waitFor(() => {
      expect(screen.getByText('Highlight Analysis')).toBeInTheDocument()
      expect(screen.getAllByText('Контратака 2 в 1').length).toBeGreaterThan(0)
      expect(screen.getByText('Разбор команды')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-14.1.4, SPEC-UI-6.4 */
  it('shows Phase 1 mock upload notice', async () => {
    renderWithProviders(<HighlightsPage />)

    await waitFor(() => {
      expect(screen.getAllByText('Phase 1 mock upload').length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-14.1.3 */
  it('adds captain comment to highlight', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HighlightsPage />)

    await screen.findByText('Разбор команды')

    const commentField = screen.getByPlaceholderText('Комментарий капитана или тренера')
    await user.type(commentField, 'Отличный выбор позиции на контратаке')
    await user.click(screen.getByRole('button', {name: 'Оставить комментарий'}))

    await waitFor(() => {
      expect(screen.getByText('Отличный выбор позиции на контратаке')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-14.1.2 */
  it('adds annotation at current timestamp', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HighlightsPage />)

    const labelInput = await screen.findByPlaceholderText('Подпись / текст')
    const form = labelInput.closest('.annotation-layer__form')
    expect(form).toBeTruthy()
    await user.type(labelInput, 'Тестовая стрелка')
    await user.click(within(form as HTMLElement).getByRole('button', {name: 'Добавить'}))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Подпись / текст')).toHaveValue('')
    })
  })
})
