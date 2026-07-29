/**
 * SPEC-FR-2.2.4, SPEC-FR-18.1.1
 * HOCFRONT-30 — профиль в шапке + краткая инфа с кнопкой «Подробнее»
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockSession} from '@/mocks/data/session'
import {HockeyProfileForm} from '@/pages/ProfilePage'
import {getProfileInitials} from '@/shared/lib/profileIdentity'
import {HeaderProfile} from '@/widgets/HeaderProfile'

import {renderWithProviders} from './render'

describe('HOCFRONT-30 профиль в навбаре', () => {
  beforeEach(() => {
    resetMockSession()
  })

  it('показывает ФИО игрока и кнопку входа в профиль', async () => {
    renderWithProviders(<HeaderProfile />)

    await waitFor(() => {
      expect(screen.getByTestId('app-header-profile-text-name')).toHaveTextContent('Иван Петров')
    })
    expect(screen.getByTestId('app-header-profile-icon-avatar')).toHaveTextContent('ИП')
    expect(screen.getByTestId('app-header-profile-link-identity')).toHaveAttribute(
      'href',
      '/profile',
    )
    expect(screen.getByTestId('app-header-profile-link-open')).toHaveAttribute('href', '/profile')
    expect(screen.getByTestId('app-header-profile-btn-open')).toHaveTextContent('В профиль')
    await waitFor(() => {
      expect(screen.getByTestId('app-header-profile-text-meta')).toHaveTextContent(
        'Нападение · Любитель',
      )
    })
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
