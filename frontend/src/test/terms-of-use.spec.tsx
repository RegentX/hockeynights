/**
 * Мини-страница /terms
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router-dom'
import {describe, expect, it} from 'vitest'

import {AuthPage} from '@/pages/auth/ui/AuthPage'
import {TermsOfUsePage} from '@/pages/TermsOfUsePage'
import {renderWithProviders} from '@/test/render'

describe('TermsOfUsePage', () => {
  it('renders full terms document on /terms route', () => {
    renderWithProviders(<TermsOfUsePage />, {routerProps: {initialEntries: ['/terms']}})

    expect(screen.getByTestId('auth-terms-page')).toBeInTheDocument()
    expect(screen.getByText('Пользовательское соглашение Hockey Nights')).toBeInTheDocument()
    expect(screen.getByText('4. Сообщения и контент')).toBeInTheDocument()
    expect(screen.getByTestId('auth-terms-btn-collapse')).toBeInTheDocument()
    expect(screen.queryByTestId('auth-terms-link-login')).not.toBeInTheDocument()
    expect(screen.queryByTestId('auth-terms-link-register')).not.toBeInTheDocument()
  })

  it('navigates back via history when opened from another route', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<AuthPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/register', '/terms']}},
    )

    await user.click(screen.getByTestId('auth-terms-btn-collapse'))

    await waitFor(() => {
      expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
    })
  })

  it('falls back to login when opened directly on /terms', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/terms']}},
    )

    await user.click(screen.getByTestId('auth-terms-btn-collapse'))

    await waitFor(() => {
      expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
    })
  })
})

describe('Terms navigation from auth forms', () => {
  it('opens standalone terms page from login link and collapses back', async () => {
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

    await user.click(screen.getByTestId('auth-terms-btn-collapse'))
    await waitFor(() => {
      expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
    })
  })
})
