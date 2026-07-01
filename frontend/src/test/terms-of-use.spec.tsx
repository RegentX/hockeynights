/**
 * Мини-страница /terms
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'
import {Route, Routes} from 'react-router-dom'
import {TermsOfUsePage} from '@/features/auth/TermsOfUsePage'
import {AuthPage} from '@/pages/auth/ui/AuthPage'
import {renderWithProviders} from '@/test/render'

describe('TermsOfUsePage', () => {
  it('renders full terms document on /terms route', () => {
    renderWithProviders(<TermsOfUsePage />, {routerProps: {initialEntries: ['/terms']}})

    expect(screen.getByTestId('auth-terms-page')).toBeInTheDocument()
    expect(screen.getByText('Пользовательское соглашение Hockey Nights')).toBeInTheDocument()
    expect(screen.getByText('4. Сообщения и контент')).toBeInTheDocument()
    expect(screen.getByTestId('auth-terms-link-login')).toHaveAttribute('href', '/')
    expect(screen.getByTestId('auth-terms-link-register')).toHaveAttribute('href', '/register')
  })

  it('navigates back to login when opened from login flow', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/']}},
    )

    await user.click(screen.getByTestId('auth-login-link-terms'))
    expect(screen.getByTestId('auth-terms-page')).toBeInTheDocument()

    await user.click(screen.getByTestId('auth-terms-btn-back'))

    await waitFor(() => {
      expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
    })
  })

  it('navigates back to register when opened from registration flow', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<AuthPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>,
      {routerProps: {initialEntries: [{pathname: '/terms', state: {from: 'register'}}]}},
    )

    await user.click(screen.getByTestId('auth-terms-btn-back'))

    await waitFor(() => {
      expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
    })
  })
})
