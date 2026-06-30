/**
 * HOCFRONT-5 — mock-вход с демо-учётными данными и карточками ролей.
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it} from 'vitest'
import {LoginModal} from '@/features/auth/LoginModal'
import {DEMO_CREDENTIALS_HINT, DEMO_EMAIL, DEMO_PASSWORD} from '@/features/auth/demoCredentials'
import {resetMockSession} from '@/mocks/data/session'
import {renderWithProviders} from '@/test/render'

describe('LoginModal demo auth', () => {
  beforeEach(() => {
    resetMockSession()
    window.localStorage.clear()
  })

  it('rejects invalid credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginModal />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'wrong@example.com')
    await user.clear(screen.getByLabelText('Пароль'))
    await user.type(screen.getByLabelText('Пароль'), 'bad-password')
    await user.click(screen.getByRole('button', {name: 'Продолжить'}))

    await waitFor(() => {
      expect(screen.getByText(DEMO_CREDENTIALS_HINT)).toBeInTheDocument()
    })
    expect(screen.queryByText('Выберите демо-роль')).not.toBeInTheDocument()
  })

  it('shows persona cards after valid demo credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginModal />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), DEMO_EMAIL)
    await user.clear(screen.getByLabelText('Пароль'))
    await user.type(screen.getByLabelText('Пароль'), DEMO_PASSWORD)
    await user.click(screen.getByRole('button', {name: 'Продолжить'}))

    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
      expect(screen.getByTestId('auth-login-btn-player')).toBeInTheDocument()
      expect(screen.getByTestId('auth-login-btn-admin')).toBeInTheDocument()
    })
  })

  it('persists selected persona after refresh', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginModal />)

    await user.click(screen.getByRole('button', {name: 'Продолжить'}))
    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('auth-login-btn-shop-partner'))

    await waitFor(() => {
      expect(window.localStorage.getItem('hockey-mock-session')).toContain('"isOnboarded":true')
      expect(window.localStorage.getItem('hockey-mock-session')).toContain('shop-001')
    })
  })
})
