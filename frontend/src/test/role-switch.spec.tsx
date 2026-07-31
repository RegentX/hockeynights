/**
 * Смена демо-роли из меню профиля → страница выбора → новая роль.
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router-dom'
import {beforeEach, describe, expect, it} from 'vitest'

import {resetMockSession, selectMockPersona} from '@/mocks/data/session'
import {MockLoginPage} from '@/pages/auth'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('role switch flow', () => {
  beforeEach(() => {
    resetMockSession()
    clearTestStorage()
    selectMockPersona('captain')
  })

  it('switches persona from role selection page and updates display name', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/" element={<MockLoginPage />} />
        <Route path="/profile" element={<div data-testid="profile-page">Profile</div>} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
      expect(screen.getByText(/Сергей Капитанов/)).toBeInTheDocument()
      expect(screen.getByTestId('auth-persona-btn-captain')).toHaveClass('persona-card--current')
    })

    await user.click(screen.getByTestId('auth-persona-btn-player'))

    await waitFor(() => {
      expect(screen.getByTestId('profile-page')).toBeInTheDocument()
    })
    expect(window.localStorage.getItem('hockey-mock-session')).toContain('"personaId":"player"')
    expect(window.localStorage.getItem('hockey-mock-session')).toContain(
      '"displayName":"Иван Петров"',
    )
  })
})
