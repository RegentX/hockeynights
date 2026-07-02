/**
 * SPEC-FR-6.1.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1, SPEC-FR-6.4.2
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'

import {ArenasPage} from '@/features/arenas/ArenasPage'
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
})
