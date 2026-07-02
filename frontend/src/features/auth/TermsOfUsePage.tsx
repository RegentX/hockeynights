/**
 * SPEC-FR-2.1.1
 * Standalone-маршрут /terms: полноэкранное чтение условий.
 * «Свернуть» — history.back(); если истории нет — fallback на /.
 */

import {useLocation, useNavigate} from 'react-router-dom'
import {TermsOfUseDocument} from '@/features/auth/TermsOfUseDocument'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export function TermsOfUsePage() {
  const navigate = useNavigate()
  const location = useLocation()

  function collapseFullscreen() {
    if (location.key === 'default') {
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
          onClick={collapseFullscreen}
          data-testid={testId('auth', 'terms', 'btn', 'collapse')}
        >
          ← Свернуть
        </HockeyButton>
      </div>

      <div className="terms-page__card terms-surface" data-testid={testId('auth', 'terms', 'panel', 'card')}>
        <TermsOfUseDocument />
      </div>
    </div>
  )
}
