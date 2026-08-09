/**
 * SPEC-FR-2.2.4, SPEC-FR-18.1.1
 * HOCFRONT-30 — профиль в шапке + краткая инфа с кнопкой «Подробнее»
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
      expect(screen.getByTestId('app-header-profile-text-name')).toHaveTextContent('Иван Петров')
    })
    expect(screen.getByTestId('app-header-profile-icon-avatar')).toHaveTextContent('ИП')
    expect(screen.getByTestId('app-header-profile-btn-menu')).toHaveAttribute(
      'aria-label',
      'Профиль: Иван Петров',
    )
    await waitFor(() => {
      expect(screen.getByTestId('app-header-profile-text-meta')).toHaveTextContent(
        'Нападение · Любитель',
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
      expect(screen.getByTestId('app-header-profile-icon-avatar')).toHaveTextContent('ИП')
    })
    await user.click(screen.getByTestId('app-header-profile-btn-menu'))

    await waitFor(() => {
      expect(screen.getByText('Мой профиль')).toBeInTheDocument()
    })
    expect(screen.getByText('Как видят другие')).toBeInTheDocument()
    expect(screen.getByText('Выйти')).toBeInTheDocument()
  })

  it('строит инициалы из ФИО', () => {
    expect(getProfileInitials('Иван Петров')).toBe('ИП')
    expect(getProfileInitials('  алексей  смирнов  сергеевич')).toBe('АС')
    expect(getProfileInitials('')).toBe('🏒')
  })
})

describe('HOCFRONT-30 краткая инфа профиля', () => {
  beforeEach(() => {
    resetMockSession()
  })

  it('открывает подробности только по кнопке «Подробнее»', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HockeyProfileForm />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-profile-summary-card')).toBeInTheDocument()
    })
    expect(screen.getByTestId('profile-profile-hub-tabs-tab-about')).toHaveTextContent('О себе')
    expect(screen.getByTestId('profile-profile-summary-text-full-name')).toHaveTextContent(
      'Иван Петров',
    )
    expect(screen.getByTestId('profile-profile-summary-text-location')).toHaveTextContent('Москва')
    expect(screen.getByTestId('profile-profile-summary-text-events-count')).toHaveTextContent('2')
    expect(screen.getByTestId('profile-profile-summary-text-events-label')).toHaveTextContent(
      'игр подтверждено',
    )
    expect(screen.getByTestId('profile-profile-summary-link-public-view')).toHaveAttribute(
      'href',
      '/players/user-001',
    )
    expect(screen.queryByTestId('profile-profile-about-section-card')).not.toBeInTheDocument()
    expect(
      screen.getByTestId('profile-profile-about-section-card-history-preview'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('profile-participation-history-list')).toBeInTheDocument()

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
      screen.getByTestId('profile-participation-history-link-invite-event-002'),
    ).toHaveAttribute('href', '/events/trainings/event-002')
    expect(screen.getByTestId('profile-participation-history-link-chat-event-002')).toHaveAttribute(
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
    expect(screen.getByTestId('profile-participation-history-link-chat-event-001')).toHaveAttribute(
      'href',
      '/messenger?chatId=chat-2',
    )

    const detailsBtn = screen.getByTestId('profile-profile-summary-btn-details')
    expect(detailsBtn).toHaveAttribute('aria-expanded', 'false')
    await user.click(detailsBtn)

    await waitFor(() => {
      expect(screen.getByTestId('profile-profile-about-section-card')).toBeInTheDocument()
    })
    expect(screen.getByTestId('profile-profile-summary-btn-details')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(
      screen.queryByTestId('profile-profile-about-section-card-history-preview'),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('ФИО')).toHaveValue('Иван Петров')
    expect(screen.getByText('История участия')).toBeInTheDocument()
    expect(screen.getByTestId('profile-profile-about-section-btn-save')).toBeInTheDocument()

    await user.click(screen.getByTestId('profile-profile-summary-btn-details'))
    await waitFor(() => {
      expect(screen.queryByTestId('profile-profile-about-section-card')).not.toBeInTheDocument()
    })
    expect(
      screen.getByTestId('profile-profile-about-section-card-history-preview'),
    ).toBeInTheDocument()
  })
})
