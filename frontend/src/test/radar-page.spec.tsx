/**
 * SPEC-FR-15.1.1, SPEC-FR-15.1.2, SPEC-FR-15.1.3
 * SPEC-UI-6.5, SPEC-UI-6.6
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'
import {IceRadarPage} from '@/features/radar/IceRadarPage'
import {RADAR_LABEL} from '@/shared/config/navigationLabels'
import {resetMockRadarState} from '@/mocks/data/radar'
import {renderWithProviders} from '@/test/render'

describe('Ice Radar page', () => {
  beforeEach(() => {
    resetMockRadarState()
  })
  /** @spec SPEC-FR-15.1.1 */
  it('loads recommendations grouped by priority zones', async () => {
    renderWithProviders(<IceRadarPage />)

    await waitFor(() => {
      expect(screen.getByText(RADAR_LABEL)).toBeInTheDocument()
      expect(screen.getByText('Ближняя зона')).toBeInTheDocument()
      expect(screen.getAllByText(/Товарищеская игра/i).length).toBeGreaterThan(0)
      expect(screen.getByText('Свободный слот на Ходынке')).toBeInTheDocument()
    })
  })

  /** @spec SPEC-FR-15.1.2, SPEC-UI-6.6 */
  it('shows reason text next to CTA', async () => {
    renderWithProviders(<IceRadarPage />)

    await waitFor(() => {
      expect(screen.getByText('Нужен твой амплуа — вратарь')).toBeInTheDocument()
      expect(screen.getAllByRole('button', {name: 'Выйти на лёд'}).length).toBeGreaterThan(0)
    })
  })

  /** @spec SPEC-FR-15.1.3 */
  it('dismisses recommendation on hide click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<IceRadarPage />)

    const reason = await screen.findByText('Нужен твой амплуа — вратарь')
    const card = reason.closest('.radar-card')
    expect(card).toBeTruthy()

    await user.click(within(card!).getByRole('button', {name: 'Скрыть'}))

    await waitFor(() => {
      expect(screen.queryByText('Нужен твой амплуа — вратарь')).not.toBeInTheDocument()
    })
  })
})
