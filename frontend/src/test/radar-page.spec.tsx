/**
 * HOCFRONT-9 — «Поиск тренировок» с RSVP на лиговую игру.
 */

import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'
import {IceRadarPage} from '@/features/radar/IceRadarPage'
import {RADAR_LABEL} from '@/shared/config/navigationLabels'
import {resetMockRadarState} from '@/mocks/data/radar'
import {resetMockEventRsvp} from '@/mocks/data/eventRsvp'
import {renderWithProviders} from '@/test/render'

describe('Ice Radar page', () => {
  beforeEach(() => {
    resetMockRadarState()
    resetMockEventRsvp()
    window.localStorage.clear()
  })

  it('shows league game hero and team RSVP list', async () => {
    renderWithProviders(<IceRadarPage />)

    await waitFor(() => {
      expect(screen.getByText(RADAR_LABEL)).toBeInTheDocument()
      expect(screen.getByText('Ближайшая игра')).toBeInTheDocument()
      expect(screen.getByText(/Медведи САО vs Вымпел/i)).toBeInTheDocument()
      expect(screen.getByText('Кто идёт из команды')).toBeInTheDocument()
      expect(screen.getByText('Вратари')).toBeInTheDocument()
      expect(screen.getByText('Нападающие')).toBeInTheDocument()
    })
  })

  it('confirms attendance with Буду CTA', async () => {
    const user = userEvent.setup()
    renderWithProviders(<IceRadarPage />)

    await screen.findByText('Ближайшая игра')
    await user.click(screen.getByTestId('radar-league-rsvp-btn-confirm-event-league-sat'))

    await waitFor(() => {
      expect(screen.getByText('Вы идёте')).toBeInTheDocument()
    })
  })

  it('declines with preset reason and updates team list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<IceRadarPage />)

    await screen.findByText('Ближайшая игра')
    await user.click(screen.getByTestId('radar-league-rsvp-btn-decline-event-league-sat'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-work'))
    await user.click(screen.getByTestId('radar-decline-reason-btn-confirm'))

    await waitFor(() => {
      expect(screen.getByText('Вы не сможете')).toBeInTheDocument()
      expect(screen.getByText(/Работаю/)).toBeInTheDocument()
    })
  })

  it('shows other radar recommendations below league RSVP', async () => {
    renderWithProviders(<IceRadarPage />)

    await waitFor(() => {
      expect(screen.getByText('Другие ближайшие действия')).toBeInTheDocument()
      expect(screen.getByText('Свободный слот на Ходынке')).toBeInTheDocument()
    })
  })

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
