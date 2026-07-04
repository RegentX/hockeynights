/**
 * Auth — вход, регистрация и выбор демо-роли.
 */

import {screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Route, Routes} from 'react-router-dom'
import {beforeEach, describe, expect, it} from 'vitest'

import {DEMO_EMAIL} from '@/features/auth/demoCredentials'
import {LOCAL_AUTH_MEMORY_KEY} from '@/features/auth/localAuthMemory'
import {TermsOfUsePage} from '@/features/auth/TermsOfUsePage'
import {resetMockSession} from '@/mocks/data/session'
import {AuthPage} from '@/pages/auth/ui/AuthPage'
import {clearTestStorage} from '@/test/clearTestStorage'
import {renderWithProviders} from '@/test/render'

describe('AuthPage login', () => {
  beforeEach(() => {
    resetMockSession()
    clearTestStorage()
  })

  it('rejects invalid credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'wrong@example.com')
    await user.clear(screen.getByLabelText('Пароль'))
    await user.type(screen.getByLabelText('Пароль'), 'bad-password')
    await user.click(screen.getByRole('button', {name: 'Войти'}))

    await waitFor(() => {
      expect(screen.getByText(/Аккаунт не найден/i)).toBeInTheDocument()
    })
    expect(screen.queryByText('Выберите демо-роль')).not.toBeInTheDocument()
  })

  it('shows persona cards after valid demo credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    await user.click(screen.getByRole('button', {name: 'Подставить демо-данные'}))
    await user.click(screen.getByRole('button', {name: 'Войти'}))

    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
      expect(screen.getByTestId('auth-persona-btn-player')).toBeInTheDocument()
      expect(screen.getByTestId('auth-persona-btn-admin')).toBeInTheDocument()
    })
  })

  it('persists selected persona after refresh', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />)

    await user.click(screen.getByRole('button', {name: 'Войти'}))
    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('auth-persona-btn-shop-partner'))

    await waitFor(() => {
      expect(window.localStorage.getItem('hockey-mock-session')).toContain('"isOnboarded":true')
      expect(window.localStorage.getItem('hockey-mock-session')).toContain(
        '"personaId":"shop-partner"',
      )
      expect(window.localStorage.getItem('hockey-mock-session')).toContain('shop-001')
    })
  })

  it('logs in with a locally registered account', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />, {routerProps: {initialEntries: ['/register']}})

    await user.type(screen.getByLabelText('Имя'), 'Локальный Игрок')
    await user.type(screen.getByLabelText('Email'), 'local@hockey.local')
    await user.type(screen.getByLabelText('Пароль'), 'secret12')
    await user.type(screen.getByLabelText('Подтверждение пароля'), 'secret12')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', {name: 'Зарегистрироваться'}))

    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('auth-login-btn-back-credentials'))
    await user.click(screen.getByTestId('auth-shell-tab-login'))
    await waitFor(() => {
      expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument()
    })

    await user.clear(screen.getByLabelText('Email'))
    await user.type(screen.getByLabelText('Email'), 'local@hockey.local')
    await user.clear(screen.getByLabelText('Пароль'))
    await user.type(screen.getByLabelText('Пароль'), 'secret12')
    await user.click(screen.getByRole('button', {name: 'Войти'}))

    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
    })
    expect(window.localStorage.getItem(LOCAL_AUTH_MEMORY_KEY)).toContain('local@hockey.local')
  })
})

describe('AuthPage register', () => {
  beforeEach(() => {
    resetMockSession()
    clearTestStorage()
  })

  it('shows registration form on /register route', () => {
    renderWithProviders(<AuthPage />, {routerProps: {initialEntries: ['/register']}})
    expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
    expect(screen.getByLabelText('Имя')).toBeInTheDocument()
    expect(screen.getByLabelText('Подтверждение пароля')).toBeInTheDocument()
    expect(screen.getByText(/localStorage/i)).toBeInTheDocument()
  })

  it('validates registration fields before submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />, {routerProps: {initialEntries: ['/register']}})

    await user.click(screen.getByRole('button', {name: 'Зарегистрироваться'}))

    await waitFor(() => {
      expect(screen.getByText('Введите имя (не менее 2 символов)')).toBeInTheDocument()
    })
  })

  it('registers new account and opens persona selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />, {routerProps: {initialEntries: ['/register']}})

    await user.type(screen.getByLabelText('Имя'), 'Новый Игрок')
    await user.type(screen.getByLabelText('Email'), 'new@hockey.local')
    await user.type(screen.getByLabelText('Пароль'), 'secret12')
    await user.type(screen.getByLabelText('Подтверждение пароля'), 'secret12')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', {name: 'Зарегистрироваться'}))

    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
      expect(window.localStorage.getItem(LOCAL_AUTH_MEMORY_KEY)).toContain('new@hockey.local')
    })
  })

  it('requires accepting terms before registration', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />, {routerProps: {initialEntries: ['/register']}})

    expect(screen.getByTestId('auth-register-link-terms')).toHaveAttribute('href', '/terms')

    await user.type(screen.getByLabelText('Имя'), 'Читатель Условий')
    await user.type(screen.getByLabelText('Email'), 'terms@hockey.local')
    await user.type(screen.getByLabelText('Пароль'), 'secret12')
    await user.type(screen.getByLabelText('Подтверждение пароля'), 'secret12')

    await user.click(screen.getByRole('button', {name: 'Зарегистрироваться'}))
    expect(screen.getByText('Примите условия использования')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', {name: 'Зарегистрироваться'}))
    await waitFor(() => {
      expect(screen.getByText('Выберите демо-роль')).toBeInTheDocument()
    })
  })

  it('opens terms page from registration and returns back', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <Routes>
        <Route path="/register" element={<AuthPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
      </Routes>,
      {routerProps: {initialEntries: ['/register']}},
    )

    await user.click(screen.getByTestId('auth-register-link-terms'))
    await waitFor(() => {
      expect(screen.getByTestId('auth-terms-page')).toBeInTheDocument()
      expect(screen.getByText('1. Введение')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('auth-terms-btn-collapse'))

    await waitFor(() => {
      expect(screen.getByText('Создать аккаунт')).toBeInTheDocument()
    })
  })

  it('rejects demo email on registration', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthPage />, {routerProps: {initialEntries: ['/register']}})

    await user.type(screen.getByLabelText('Имя'), 'Дубликат')
    await user.type(screen.getByLabelText('Email'), DEMO_EMAIL)
    await user.type(screen.getByLabelText('Пароль'), 'secret12')
    await user.type(screen.getByLabelText('Подтверждение пароля'), 'secret12')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', {name: 'Зарегистрироваться'}))

    await waitFor(() => {
      expect(
        screen.getByText('Этот email уже зарегистрирован. Войдите в аккаунт.'),
      ).toBeInTheDocument()
    })
  })
})
