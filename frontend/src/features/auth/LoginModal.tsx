/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-2.1.3
 * HOCFRONT-5 — mock-вход: учётные данные → карточки ролей.
 */

import {useState} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Card, Text, TextInput} from '@gravity-ui/uikit'
import {Link, useNavigate} from 'react-router-dom'
import {
  fetchSession,
  loginWithCredentials,
  submitOnboarding,
} from '@/features/auth/api/sessionApi'
import {
  DEMO_CREDENTIALS_HINT,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from '@/features/auth/demoCredentials'
import {PERSONA_PRESETS, type PersonaPreset} from '@/features/auth/personaPresets'
import {resolvePostLoginPath} from '@/features/auth/resolvePostLoginPath'
import {describeSessionPersona} from '@/features/partners/sessionPersona'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

type LoginStep = 'credentials' | 'personas'

export interface LoginModalProps {
  /** Уже вошли — показываем только выбор роли */
  isSwitching?: boolean
}

export function LoginModal({isSwitching = false}: LoginModalProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<LoginStep>(isSwitching ? 'personas' : 'credentials')
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [authError, setAuthError] = useState<string | null>(null)

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  const loginMutation = useMutation({
    mutationFn: loginWithCredentials,
    onSuccess: () => {
      setAuthError(null)
      setStep('personas')
    },
    onError: () => {
      setAuthError(DEMO_CREDENTIALS_HINT)
    },
  })

  const onboardingMutation = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: (nextSession, variables) => {
      queryClient.setQueryData(['session'], nextSession)
      void queryClient.invalidateQueries({queryKey: ['session']})
      navigate(resolvePostLoginPath(variables), {replace: true})
    },
  })

  function handleCredentialsSubmit() {
    setAuthError(null)
    loginMutation.mutate({email: email.trim(), password})
  }

  function selectPersona(preset: PersonaPreset) {
    onboardingMutation.mutate(preset.payload)
  }

  return (
    <Card view="filled" className="hockey-form-shell hockey-form-shell--640 login-modal" data-testid={testId('auth', 'login', 'page')}>
      <div className="hockey-panel hockey-panel--24 hockey-stack hockey-stack--gap-16">
        <Text variant="header-1" data-testid={testId('auth', 'login', 'text', 'title')}>
          Hockey Nights
        </Text>

        <Text
          color="secondary"
          className="login-modal__demo-banner"
          data-testid={testId('auth', 'login', 'text', 'demo-banner')}
        >
          Демо-вход. Реальная регистрация появится после backend.
        </Text>

        {isSwitching && session?.isOnboarded && (
          <>
            <Text color="secondary" data-testid={testId('auth', 'login', 'text', 'switching-hint')}>
              Сейчас вы вошли как <strong>{session.user.displayName}</strong> (
              {describeSessionPersona(session)}). Выберите другую роль ниже.
            </Text>
            <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
              <Link to="/profile" data-testid={testId('auth', 'login', 'link', 'continue')}>
                <HockeyButton view="outlined" size="s" data-testid={testId('auth', 'login', 'btn', 'continue')}>
                  Продолжить в приложении
                </HockeyButton>
              </Link>
              {step === 'personas' && (
                <HockeyButton
                  view="flat"
                  size="s"
                  onClick={() => setStep('credentials')}
                  data-testid={testId('auth', 'login', 'btn', 'edit-credentials')}
                >
                  Сменить учётные данные
                </HockeyButton>
              )}
            </div>
          </>
        )}

        {step === 'credentials' ? (
          <section
            className="login-modal__credentials"
            aria-label="Вход / регистрация"
            data-testid={testId('auth', 'login', 'panel', 'credentials')}
          >
            <Text variant="subheader-2" data-testid={testId('auth', 'login', 'text', 'credentials-title')}>
              Вход / регистрация
            </Text>
            <Text color="secondary" data-testid={testId('auth', 'login', 'text', 'credentials-hint')}>
              Демо-аккаунт: <strong>{DEMO_EMAIL}</strong> · пароль <strong>{DEMO_PASSWORD}</strong>
            </Text>

            <TextInput
              label="Email"
              type="email"
              value={email}
              onUpdate={setEmail}
              size="l"
              data-testid={testId('auth', 'login', 'field', 'email')}
            />
            <TextInput
              label="Пароль"
              type="password"
              value={password}
              onUpdate={setPassword}
              size="l"
              data-testid={testId('auth', 'login', 'field', 'password')}
            />

            {authError && (
              <Text color="danger" data-testid={testId('auth', 'login', 'text', 'error')}>
                {authError}
              </Text>
            )}

            <HockeyButton
              view="action"
              size="l"
              loading={loginMutation.isPending}
              onClick={handleCredentialsSubmit}
              data-testid={testId('auth', 'login', 'btn', 'submit-credentials')}
            >
              Продолжить
            </HockeyButton>
          </section>
        ) : (
          <section
            className="login-modal__personas"
            aria-label="Выбор роли"
            data-testid={testId('auth', 'login', 'panel', 'personas')}
          >
            <Text variant="subheader-2" data-testid={testId('auth', 'login', 'text', 'personas-title')}>
              Выберите демо-роль
            </Text>
            <Text
              color="secondary"
              data-testid={testId('auth', 'login', 'text', 'personas-hint')}
            >
              Каждая карточка открывает свой режим интерфейса. Выбор сохранится после обновления страницы.
            </Text>

            <div className="persona-card-grid" data-testid={testId('auth', 'login', 'grid', 'personas')}>
              {PERSONA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="persona-card"
                  aria-label={`${preset.title}. ${preset.description}. ${preset.destination}`}
                  disabled={onboardingMutation.isPending}
                  onClick={() => selectPersona(preset)}
                  data-testid={testId('auth', 'login', 'btn', preset.id)}
                >
                  <span className="persona-card__icon" aria-hidden>
                    {preset.icon}
                  </span>
                  <span className="persona-card__title">{preset.title}</span>
                  <span className="persona-card__description">{preset.description}</span>
                  <span className="persona-card__destination">→ {preset.destination}</span>
                </button>
              ))}
            </div>

            {!isSwitching && (
              <HockeyButton
                view="flat"
                size="s"
                onClick={() => setStep('credentials')}
                data-testid={testId('auth', 'login', 'btn', 'back-credentials')}
              >
                Назад к входу
              </HockeyButton>
            )}
          </section>
        )}

        {step === 'credentials' && isSwitching && (
          <HockeyButton
            view="outlined"
            size="m"
            onClick={() => setStep('personas')}
            data-testid={testId('auth', 'login', 'btn', 'show-personas')}
          >
            Перейти к выбору роли
          </HockeyButton>
        )}
      </div>
    </Card>
  )
}
