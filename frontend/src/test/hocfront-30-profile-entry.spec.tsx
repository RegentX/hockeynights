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
    expect(screen.getByTestId('profile-profile-summary-text-full-name')).toHaveTextContent(
      'Иван Петров',
    )
    expect(screen.getByTestId('profile-profile-summary-text-location')).toHaveTextContent(
      'Москва · САО · м. Динамо',
    )
    expect(screen.getByText(/Заполненность профиля/i)).toBeInTheDocument()
    expect(screen.getByTestId('profile-profile-summary-link-public-view')).toHaveAttribute(
      'href',
      '/players/user-001',
    )
    expect(screen.queryByTestId('profile-profile-about-section-card')).not.toBeInTheDocument()

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
    expect(screen.getByLabelText('ФИО')).toHaveValue('Иван Петров')
    expect(screen.getByText('История участия')).toBeInTheDocument()
    expect(screen.getByTestId('profile-profile-about-section-btn-save')).toBeInTheDocument()

    await user.click(screen.getByTestId('profile-profile-summary-btn-details'))
    await waitFor(() => {
      expect(screen.queryByTestId('profile-profile-about-section-card')).not.toBeInTheDocument()
    })
  })
})
