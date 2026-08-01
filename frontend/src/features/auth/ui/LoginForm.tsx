/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Форма входа (email + пароль).
 */

import {useMutation, useQueryClient} from '@tanstack/react-query'
import {type FormEvent, useState} from 'react'
import {Link} from 'react-router'

import {authLogin, loginWithCredentials} from '@/entities/auth'
import {DEMO_EMAIL, DEMO_PASSWORD, isDemoCredentials} from '@/features/auth/lib/demoCredentials'
import {AuthDemoCard} from '@/features/auth/ui/AuthDemoCard'
import {AuthField} from '@/features/auth/ui/AuthField'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({onSuccess}: LoginFormProps) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: async (payload: {email: string; password: string}) => {
      if (isDemoCredentials(payload.email, payload.password)) {
        return {kind: 'demo' as const, data: await authLogin(payload)}
      }
      await loginWithCredentials(payload)
      return {kind: 'local' as const}
    },
    onSuccess: (result) => {
      setError(null)
      if (result.kind === 'demo') {
        queryClient.setQueryData(['auth-login'], result.data)
      } else {
        queryClient.removeQueries({queryKey: ['auth-login']})
      }
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
    <form
      className="auth-form"
      aria-label="Вход"
      onSubmit={handleSubmit}
      data-testid={testId('auth', 'login', 'panel', 'form')}
    >
      <header
        className="auth-form__header"
        data-testid={testId('auth', 'login', 'panel', 'header')}
      >
        <h2 className="auth-form__title" data-testid={testId('auth', 'login', 'text', 'title')}>
          Вход в аккаунт
        </h2>
        <p className="auth-form__subtitle" data-testid={testId('auth', 'login', 'text', 'hint')}>
          Используйте демо-доступ или локальный аккаунт, созданный при регистрации.
        </p>
      </header>

      <AuthDemoCard onApply={applyDemoCredentials} />

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
        <div
          className="auth-alert auth-alert--error"
          data-testid={testId('auth', 'login', 'text', 'error')}
        >
          {error}
        </div>
      )}

      <HockeyButton
        view="action"
        size="l"
        type="submit"
        loading={loginMutation.isPending}
        disabled={loginMutation.isPending}
        data-testid={testId('auth', 'login', 'btn', 'submit')}
      >
        Войти
      </HockeyButton>

      <p className="auth-form__footer" data-testid={testId('auth', 'login', 'panel', 'footer')}>
        <Link
          to="/terms"
          className="auth-form__switch-link"
          data-testid={testId('auth', 'login', 'link', 'terms')}
        >
          Условия использования
        </Link>
      </p>
    </form>
  )
}
