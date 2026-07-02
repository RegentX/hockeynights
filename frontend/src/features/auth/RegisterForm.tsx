/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Форма регистрации (mock Phase 1 + localAuthMemory).
 */

import {useState, type FormEvent} from 'react'
import {useMutation} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {AuthField} from '@/features/auth/AuthField'
import {registerAccount} from '@/features/auth/api/sessionApi'
import {TermsAcceptanceField} from '@/features/auth/TermsAcceptanceField'
import {
  type RegisterFormValues,
  validateRegisterForm,
} from '@/features/auth/registrationValidation'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export interface RegisterFormProps {
  onSuccess: () => void
}

const INITIAL_VALUES: RegisterFormValues = {
  displayName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  acceptTerms: false,
}

export function RegisterForm({onSuccess}: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES)
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useMutation({
    mutationFn: registerAccount,
    onSuccess: () => {
      setError(null)
      onSuccess()
    },
    onError: (err: Error) => {
      setError(err.message || 'Не удалось зарегистрироваться')
    },
  })

  function updateField<K extends keyof RegisterFormValues>(key: K, value: RegisterFormValues[K]) {
    setValues((prev) => ({...prev, [key]: value}))
  }

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()
    const validationError = validateRegisterForm(values)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    registerMutation.mutate({
      displayName: values.displayName.trim(),
      email: values.email.trim(),
      password: values.password,
    })
  }

  return (
    <form
      className="auth-form"
      aria-label="Регистрация"
      onSubmit={handleSubmit}
      data-testid={testId('auth', 'register', 'panel', 'form')}
    >
      <header className="auth-form__header" data-testid={testId('auth', 'register', 'panel', 'header')}>
        <h2 className="auth-form__title" data-testid={testId('auth', 'register', 'text', 'title')}>
          Создать аккаунт
        </h2>
        <p className="auth-form__subtitle" data-testid={testId('auth', 'register', 'text', 'hint')}>
          Профиль сохранится в локальной памяти браузера — позже перенесём на backend без смены UX.
        </p>
      </header>

      <div className="auth-alert auth-alert--info" data-testid={testId('auth', 'register', 'text', 'local-memory')}>
        Данные хранятся в <strong>localStorage</strong> и доступны только на этом устройстве.
      </div>

      <div className="auth-form__fields" data-testid={testId('auth', 'register', 'panel', 'fields')}>
        <AuthField
          label="Имя"
          fieldId="auth-register-display-name"
          autoComplete="name"
          value={values.displayName}
          onUpdate={(value) => updateField('displayName', value)}
          testIdScope="register"
          testIdQualifier="display-name"
        />
        <AuthField
          label="Email"
          fieldId="auth-register-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onUpdate={(value) => updateField('email', value)}
          testIdScope="register"
          testIdQualifier="email"
        />
        <AuthField
          label="Пароль"
          fieldId="auth-register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Не менее 6 символов"
          value={values.password}
          onUpdate={(value) => updateField('password', value)}
          testIdScope="register"
          testIdQualifier="password"
        />
        <AuthField
          label="Подтверждение пароля"
          fieldId="auth-register-password-confirm"
          type="password"
          autoComplete="new-password"
          value={values.passwordConfirm}
          onUpdate={(value) => updateField('passwordConfirm', value)}
          testIdScope="register"
          testIdQualifier="password-confirm"
        />

        <TermsAcceptanceField
          checked={values.acceptTerms}
          onUpdate={(checked) => updateField('acceptTerms', checked)}
        />
      </div>

      {error && (
        <div className="auth-alert auth-alert--error" data-testid={testId('auth', 'register', 'text', 'error')}>
          {error}
        </div>
      )}

      <HockeyButton
        view="action"
        size="l"
        type="submit"
        loading={registerMutation.isPending}
        data-testid={testId('auth', 'register', 'btn', 'submit')}
      >
        Зарегистрироваться
      </HockeyButton>

      <p className="auth-form__footer" data-testid={testId('auth', 'register', 'panel', 'footer')}>
        <span className="auth-form__subtitle">Уже есть аккаунт? </span>
        <Link
          to="/"
          className="auth-form__switch-link"
          data-testid={testId('auth', 'register', 'link', 'login')}
        >
          Войти
        </Link>
      </p>
    </form>
  )
}
