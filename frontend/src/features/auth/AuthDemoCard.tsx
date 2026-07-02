/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Карточка демо-доступа на экране входа.
 */

import {Text} from '@gravity-ui/uikit'

import {DEMO_EMAIL, DEMO_PASSWORD} from '@/features/auth/demoCredentials'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface AuthDemoCardProps {
  onApply: () => void
}

export function AuthDemoCard({onApply}: AuthDemoCardProps) {
  return (
    <div className="auth-demo-card" data-testid={testId('auth', 'login', 'card', 'demo')}>
      <div
        className="auth-demo-card__header"
        data-testid={testId('auth', 'login', 'panel', 'demo-header')}
      >
        <span
          className="auth-demo-card__badge"
          data-testid={testId('auth', 'login', 'text', 'demo-badge')}
        >
          Демо
        </span>
        <Text
          color="secondary"
          className="auth-demo-card__label"
          data-testid={testId('auth', 'login', 'text', 'demo-label')}
        >
          Быстрый доступ без регистрации
        </Text>
      </div>
      <div
        className="auth-demo-card__credentials"
        data-testid={testId('auth', 'login', 'panel', 'demo-credentials')}
      >
        <div className="auth-demo-card__field">
          <span className="auth-demo-card__field-label">Email</span>
          <code
            className="auth-demo-card__value"
            data-testid={testId('auth', 'login', 'text', 'demo-email')}
          >
            {DEMO_EMAIL}
          </code>
        </div>
        <div className="auth-demo-card__field">
          <span className="auth-demo-card__field-label">Пароль</span>
          <code
            className="auth-demo-card__value"
            data-testid={testId('auth', 'login', 'text', 'demo-password')}
          >
            {DEMO_PASSWORD}
          </code>
        </div>
      </div>
      <HockeyButton
        view="outlined"
        size="m"
        className="auth-demo-card__apply"
        onClick={onApply}
        data-testid={testId('auth', 'login', 'btn', 'apply-demo')}
      >
        Подставить демо-данные
      </HockeyButton>
    </div>
  )
}
