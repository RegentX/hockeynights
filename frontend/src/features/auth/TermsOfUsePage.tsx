/**
 * SPEC-FR-2.1.1
 * Мини-страница условий использования (отдельный маршрут /terms).
 */

import {Link} from 'react-router-dom'
import {TermsOfUseDocument} from '@/features/auth/TermsOfUseDocument'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export function TermsOfUsePage() {
  return (
    <div className="terms-page" data-testid={testId('auth', 'terms', 'page')}>
      <div className="terms-page__toolbar" data-testid={testId('auth', 'terms', 'panel', 'toolbar')}>
        <Link to="/register" data-testid={testId('auth', 'terms', 'link', 'back-register')}>
          <HockeyButton view="flat" size="s" data-testid={testId('auth', 'terms', 'btn', 'back')}>
            ← Назад к регистрации
          </HockeyButton>
        </Link>
        <Link
          to="/"
          className="terms-page__login-link"
          data-testid={testId('auth', 'terms', 'link', 'login')}
        >
          Вход
        </Link>
      </div>

      <div className="terms-page__card" data-testid={testId('auth', 'terms', 'panel', 'card')}>
        <TermsOfUseDocument />
      </div>
    </div>
  )
}
