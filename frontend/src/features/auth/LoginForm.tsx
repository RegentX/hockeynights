/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Форма входа (email + пароль).
 */

import {useState} from 'react'
import {useMutation} from '@tanstack/react-query'
import {TextInput} from '@gravity-ui/uikit'
import {Link} from 'react-router-dom'
import {AuthDemoCard} from '@/features/auth/AuthDemoCard'
import {loginWithCredentials} from '@/features/auth/api/sessionApi'
import {DEMO_EMAIL, DEMO_PASSWORD} from '@/features/auth/demoCredentials'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({onSuccess}: LoginFormProps) {
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: loginWithCredentials,
    onSuccess: () => {
      setError(null)
      onSuccess()
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось войти')
    },
  })

  function applyDemoCredentials() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  function handleSubmit() {
    setError(null)
    loginMutation.mutate({email: email.trim(), password})
  }

  return (
    <section
      className="auth-form"
      aria-label="Вход"
      data-testid={testId('auth', 'login', 'panel', 'form')}
    >
      <header className="auth-form__header" data-testid={testId('auth', 'login', 'panel', 'header')}>
        <h2 className="auth-form__title" data-testid={testId('auth', 'login', 'text', 'title')}>
          Вход в аккаунт
        </h2>
        <p className="auth-form__subtitle" data-testid={testId('auth', 'login', 'text', 'hint')}>
          Используйте демо-доступ или локальный аккаунт, созданный при регистрации.
        </p>
      </header>

      <AuthDemoCard onApply={applyDemoCredentials} />

      <div className="auth-form__fields" data-testid={testId('auth', 'login', 'panel', 'fields')}>
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onUpdate={setEmail}
          size="l"
          data-testid={testId('auth', 'login', 'field', 'email')}
        />
        <TextInput
          label="Пароль"
          type="password"
          autoComplete="current-password"
          value={password}
          onUpdate={setPassword}
          size="l"
          data-testid={testId('auth', 'login', 'field', 'password')}
        />
      </div>

      {error && (
        <div className="auth-alert auth-alert--error" data-testid={testId('auth', 'login', 'text', 'error')}>
          {error}
        </div>
      )}

      <HockeyButton
        view="action"
        size="l"
        loading={loginMutation.isPending}
        onClick={handleSubmit}
        data-testid={testId('auth', 'login', 'btn', 'submit')}
      >
        Войти
      </HockeyButton>

      <p className="auth-form__footer" data-testid={testId('auth', 'login', 'panel', 'footer')}>
        <span className="auth-form__subtitle">Нет аккаунта? </span>
        <Link
          to="/register"
          className="auth-form__switch-link"
          data-testid={testId('auth', 'login', 'link', 'register')}
        >
          Зарегистрироваться
        </Link>
        <span className="auth-form__footer-sep"> · </span>
        <Link
          to="/terms"
          className="auth-form__switch-link"
          data-testid={testId('auth', 'login', 'link', 'terms')}
        >
          Условия использования
        </Link>
      </p>
    </section>
  )
}
