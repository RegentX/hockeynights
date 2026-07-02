/**
 * SPEC-FR-2.1.1
 * Мини-страница условий использования (отдельный маршрут /terms).
 */

import {useNavigate} from 'react-router-dom'
import {TermsOfUseDocument} from '@/features/auth/TermsOfUseDocument'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export function TermsOfUsePage() {
  const navigate = useNavigate()

  return (
    <div className="terms-page" data-testid={testId('auth', 'terms', 'page')}>
      <div className="terms-page__toolbar" data-testid={testId('auth', 'terms', 'panel', 'toolbar')}>
        <HockeyButton
          view="flat"
          size="s"
          onClick={() => navigate(-1)}
          data-testid={testId('auth', 'terms', 'btn', 'collapse')}
        >
          ← Свернуть
        </HockeyButton>
      </div>

      <div className="terms-page__card" data-testid={testId('auth', 'terms', 'panel', 'card')}>
        <TermsOfUseDocument />
      </div>
    </div>
  )
}
