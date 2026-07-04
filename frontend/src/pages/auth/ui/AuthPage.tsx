/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-25.1.1, SPEC-FR-25.1.2
 * Страница входа, регистрации и выбора демо-роли.
 */

import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {AuthShell} from '@/features/auth/AuthShell'
import {LoginForm} from '@/features/auth/LoginForm'
import {PersonaSelection} from '@/features/auth/PersonaSelection'
import {RegisterForm} from '@/features/auth/RegisterForm'
import {describeSessionPersona} from '@/features/partners/sessionPersona'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

type AuthStep = 'credentials' | 'personas'

export interface AuthPageProps {
  /** Уже вошли — можно переключить роль */
  isSwitching?: boolean
}

export function AuthPage({isSwitching = false}: AuthPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isRegisterRoute = location.pathname === '/register'
  const [step, setStep] = useState<AuthStep>(isSwitching ? 'personas' : 'credentials')

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  function handleAuthSuccess() {
    setStep('personas')
  }

  function goToCredentialsStep() {
    setStep('credentials')
    navigate(isRegisterRoute ? '/register' : '/', {replace: true})
  }

  function goToPersonasStep() {
    setStep('personas')
    navigate(isRegisterRoute ? '/register' : '/', {replace: true})
  }

  return (
    <AuthShell
      mode={step === 'personas' ? 'personas' : isRegisterRoute ? 'register' : 'login'}
      showModeTabs={step === 'credentials' && !isSwitching}
      wide={step === 'personas'}
    >
      <div data-testid={testId('auth', 'page', 'panel', 'main')}>
        {isSwitching && session?.isOnboarded && (
          <div
            className="hockey-stack hockey-stack--gap-12"
            data-testid={testId('auth', 'page', 'panel', 'switching')}
          >
            <Text color="secondary" data-testid={testId('auth', 'page', 'text', 'switching-hint')}>
              Сейчас вы вошли как <strong>{session.user.displayName}</strong> (
              {describeSessionPersona(session)}). Выберите другую роль ниже.
            </Text>
            <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
              <Link to="/profile" data-testid={testId('auth', 'page', 'link', 'continue')}>
                <HockeyButton view="outlined" size="s" data-testid={testId('auth', 'page', 'btn', 'continue')}>
                  Продолжить в приложении
                </HockeyButton>
              </Link>
              {step === 'personas' && (
                <HockeyButton
                  view="flat"
                  size="s"
                  onClick={goToCredentialsStep}
                  data-testid={testId('auth', 'page', 'btn', 'edit-credentials')}
                >
                  Сменить учётные данные
                </HockeyButton>
              )}
            </div>
          </div>
        )}

        {step === 'credentials' ? (
          isRegisterRoute ? (
            <RegisterForm onSuccess={handleAuthSuccess} />
          ) : (
            <LoginForm onSuccess={handleAuthSuccess} />
          )
        ) : (
          <PersonaSelection
            isSwitching={isSwitching}
            onBackToCredentials={goToCredentialsStep}
          />
        )}

        {step === 'credentials' && isSwitching && (
          <HockeyButton
            view="outlined"
            size="m"
            onClick={goToPersonasStep}
            data-testid={testId('auth', 'page', 'btn', 'show-personas')}
          >
            Перейти к выбору роли
          </HockeyButton>
        )}
      </div>
    </AuthShell>
  )
}
