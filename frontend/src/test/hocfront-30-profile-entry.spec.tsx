/**
 * SPEC-FR-2.2.4, SPEC-FR-18.1.1
 * HOCFRONT-30 — профиль в шапке
 * Own profile «О себе» — публичная композиция + owner edit
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {resetMockSession} from '@/mocks/data/session'
import {HockeyProfileForm} from '@/pages/ProfilePage'
import {getProfileInitials} from '@/shared/lib/profileIdentity'
import {HeaderProfile} from '@/widgets/HeaderProfile'

import {renderWithProviders} from './render'

vi.mock('lottie-react', () => ({
  useLottie: () => ({
    View: <span data-testid="app-header-profile-lottie-stub" />,
    animationItem: null,
  }),
}))

describe('HOCFRONT-30 профиль в навбаре', () => {
  beforeEach(() => {
    resetMockSession()
  })

  it('показывает ФИО игрока и аватар в правом углу', async () => {
    renderWithProviders(<HeaderProfile />)

    await waitFor(() => {
      expect(screen.getByTestId('app-header-profile-text-name')).toHaveTextContent(
        'Петров Иван Сергеевич',
      )
    })
    expect(screen.getByTestId('app-header-profile-img-avatar')).toHaveAttribute(
      'src',
      expect.stringContaining('placehold.co'),
    )
    expect(screen.getByTestId('app-header-profile-btn-menu')).toHaveAttribute(
      'aria-label',
      'Профиль: Петров Иван Сергеевич',
    )
    await waitFor(() => {
      expect(screen.getByTestId('app-header-profile-text-meta')).toHaveTextContent(
        'Нападение · Теоретик',
      )
    })
  })

  it('открывает ВК-подобное меню профиля вместо «⋯»', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <HeaderProfile
        sessionMenuItems={[[{text: 'Выйти', action: () => {}, qa: 'app-shell-btn-logout'}]]}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('app-header-profile-img-avatar')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('app-header-profile-btn-menu'))

    await waitFor(() => {
      expect(screen.getByText('Мой профиль')).toBeInTheDocument()
    })
    expect(screen.getByText('Как видят другие')).toBeInTheDocument()
    expect(screen.getByText('Выйти')).toBeInTheDocument()
  })

  it('строит инициалы из ФИО', () => {
    expect(getProfileInitials('Петров Иван Сергеевич')).toBe('ПИ')
    expect(getProfileInitials('Иван Петров')).toBe('ИП')
    expect(getProfileInitials('  смирнов  алексей  дмитриевич')).toBe('СА')
    expect(getProfileInitials('')).toBe('🏒')
  })
})

describe('Own profile «О себе» как публичная композиция', () => {
  beforeEach(() => {
    resetMockSession()
  })

  it('показывает PlayerCard, секции и редактирование по кнопке', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HockeyProfileForm />)

    await waitFor(() => {
      expect(screen.getByTestId('players-player-card-card-user-001')).toBeInTheDocument()
    })
    expect(screen.getByTestId('profile-profile-hub-tabs-tab-about')).toHaveTextContent('О себе')
    expect(screen.getByTestId('players-player-card-text-name-user-001')).toHaveTextContent(
      'Петров Иван Сергеевич',
    )
    expect(screen.getByTestId('players-player-card-text-city-user-001')).toHaveTextContent('Москва')
    expect(screen.getByTestId('profile-profile-about-section-btn-public-view')).toHaveAttribute(
      'href',
      '/players/user-001',
    )
    expect(screen.queryByTestId('favorites-btn-toggle-player-user-001')).not.toBeInTheDocument()
    expect(screen.queryByTestId('players-player-card-text-team-user-001')).not.toBeInTheDocument()
    expect(screen.getByTestId('players-public-info-text-team-user-001-team-001')).toHaveTextContent(
      'Медведи САО (игровой номер: 01)',
    )
    expect(screen.getByTestId('players-public-info-img-team-logo-team-001')).toBeInTheDocument()
    expect(screen.getByTestId('players-public-info-link-team-team-001')).toHaveAttribute(
      'href',
      '/teams/team-001',
    )
    expect(screen.getByTestId('players-public-info-list-achievements-user-001')).toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-text-birth-user-001')).toBeInTheDocument()
    expect(screen.getByTestId('players-player-card-text-height-user-001')).toHaveTextContent(
      '185 см',
    )
    expect(screen.getByTestId('players-player-card-text-weight-user-001')).toHaveTextContent(
      '92 кг',
    )
    expect(screen.getByTestId('players-player-card-text-index-user-001')).toHaveTextContent('6')
    expect(screen.getByTestId('players-public-info-card-user-001')).toBeInTheDocument()
    expect(screen.getByTestId('profile-profile-about-section-card-history')).toBeInTheDocument()
    expect(screen.getByTestId('profile-participation-history-list')).toBeInTheDocument()
    expect(
      screen.queryByTestId('profile-profile-about-section-section-team'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('profile-profile-about-section-section-favorites'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('profile-profile-hub-tabs-tab-favorites')).toHaveTextContent(
      'Избранное',
    )
    expect(screen.getByTestId('profile-profile-about-section-section-calendar')).toBeInTheDocument()
    expect(screen.queryByTestId('profile-profile-about-section-card')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('profile-participation-history-btn-toggle-event-002'))
    await waitFor(() => {
      expect(
        screen.getByTestId('profile-participation-history-panel-details-event-002'),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByTestId('profile-participation-history-text-arena-event-002'),
    ).toHaveTextContent('Каток «Лужники»')
    expect(
      screen.getByTestId('profile-participation-history-btn-invite-event-002'),
    ).toHaveAttribute('href', '/events/trainings/event-002')
    expect(screen.getByTestId('profile-participation-history-btn-chat-event-002')).toHaveAttribute(
      'href',
      '/messenger?chatId=chat-1',
    )

    await user.click(screen.getByTestId('profile-participation-history-btn-toggle-event-001'))
    await waitFor(() => {
      expect(
        screen.getByTestId('profile-participation-history-panel-details-event-001'),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByTestId('profile-participation-history-text-opponent-event-001'),
    ).toHaveTextContent('Вымпел')
    expect(
      screen.getByTestId('profile-participation-history-text-result-event-001'),
    ).toHaveTextContent('3:2')
    expect(screen.getByTestId('profile-participation-history-btn-chat-event-001')).toHaveAttribute(
      'href',
      '/messenger?chatId=chat-2',
    )

    const editBtn = screen.getByTestId('profile-profile-about-section-btn-edit')
    expect(editBtn).toHaveAttribute('aria-expanded', 'false')
    await user.click(editBtn)

    await waitFor(() => {
      expect(screen.getByTestId('profile-profile-about-section-card')).toBeInTheDocument()
    })
    expect(screen.getByTestId('profile-profile-about-section-btn-edit')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    // Секции остаются видимыми при открытом редактировании
    expect(screen.getByTestId('profile-profile-about-section-card-history')).toBeInTheDocument()
    expect(screen.getByTestId('profile-profile-about-section-section-calendar')).toBeInTheDocument()
    expect(screen.getByLabelText('ФИО')).toHaveValue('Петров Иван Сергеевич')
    expect(screen.getByTestId('profile-profile-about-section-btn-save')).toBeInTheDocument()
    expect(
      screen.getByTestId('profile-profile-about-section-select-stick-hand'),
    ).toBeInTheDocument()

    const nameInput = screen.getByLabelText('ФИО')
    await user.clear(nameInput)
    await user.type(nameInput, 'Сидоров Пётр Иванович')
    await waitFor(() => {
      expect(screen.getByTestId('players-player-card-text-name-user-001')).toHaveTextContent(
        'Сидоров Пётр Иванович',
      )
    })

    await user.click(screen.getByTestId('profile-profile-about-section-btn-save'))
    await waitFor(() => {
      expect(screen.queryByTestId('profile-profile-about-section-card')).not.toBeInTheDocument()
    })
    expect(screen.getByTestId('players-player-card-text-name-user-001')).toHaveTextContent(
      'Сидоров Пётр Иванович',
    )
    expect(screen.getByTestId('profile-profile-about-section-card-history')).toBeInTheDocument()
  })
})
