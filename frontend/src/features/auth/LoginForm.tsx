/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Форма входа (email + пароль).
 */

import {useState, type FormEvent} from 'react'
import {useMutation} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {AuthDemoCard} from '@/features/auth/AuthDemoCard'
import {AuthField} from '@/features/auth/AuthField'
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

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
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

      <form className="auth-form__submit" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__fields" data-testid={testId('auth', 'login', 'panel', 'fields')}>
          <AuthField
            label="Email"
            fieldId="auth-login-email"
            type="email"
            autoComplete="email"
            value={email}
            onUpdate={setEmail}
            testIdScope="login"
            testIdQualifier="email"
          />
          <AuthField
            label="Пароль"
            fieldId="auth-login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onUpdate={setPassword}
            testIdScope="login"
            testIdQualifier="password"
          />
        </div>

        {error && (
          <div className="auth-alert auth-alert--error" data-testid={testId('auth', 'login', 'text', 'error')}>
            {error}
          </div>
        )}

        <HockeyButton
          type="submit"
          view="action"
          size="l"
          loading={loginMutation.isPending}
          disabled={loginMutation.isPending}
          data-testid={testId('auth', 'login', 'btn', 'submit')}
        >
          Войти
        </HockeyButton>
      </form>

      <p className="auth-form__footer" data-testid={testId('auth', 'login', 'panel', 'footer')}>
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
