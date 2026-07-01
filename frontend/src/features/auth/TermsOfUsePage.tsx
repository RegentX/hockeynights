/**
 * SPEC-FR-2.1.1
 * Мини-страница условий использования (отдельный маршрут /terms).
 */

import {Link, useLocation, useNavigate} from 'react-router-dom'
import {TermsOfUseDocument} from '@/features/auth/TermsOfUseDocument'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

interface TermsLocationState {
  from?: 'login' | 'register'
}

export function TermsOfUsePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as TermsLocationState | null)?.from

  function handleBack() {
    if (from === 'register') {
      navigate('/register', {replace: true})
      return
    }
    if (from === 'login') {
      navigate('/', {replace: true})
      return
    }
    navigate(-1)
  }

  return (
    <div className="terms-page" data-testid={testId('auth', 'terms', 'page')}>
      <div className="terms-page__toolbar" data-testid={testId('auth', 'terms', 'panel', 'toolbar')}>
        <HockeyButton
          view="flat"
          size="s"
          onClick={handleBack}
          data-testid={testId('auth', 'terms', 'btn', 'back')}
        >
          ← Назад
        </HockeyButton>
        <div className="terms-page__toolbar-links">
          <Link
            to="/"
            className="terms-page__login-link"
            data-testid={testId('auth', 'terms', 'link', 'login')}
          >
            Вход
          </Link>
          <Link
            to="/register"
            className="terms-page__login-link"
            data-testid={testId('auth', 'terms', 'link', 'register')}
          >
            Регистрация
          </Link>
        </div>
      </div>

      <div className="terms-page__card" data-testid={testId('auth', 'terms', 'panel', 'card')}>
        <TermsOfUseDocument />
      </div>
    </div>
  )
}
