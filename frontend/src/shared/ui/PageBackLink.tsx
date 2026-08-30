/**
 * SPEC-UI-2 — стандартная навигация «назад» на детальных страницах
 */

import {Link} from 'react-router'

import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface PageBackLinkProps {
  label: string
  /** Маршрут для Link; если не задан — используется onClick */
  to?: string
  onClick?: () => void
  testIdPrefix: string
  testIdSection?: string
}

/**
 * Кнопка «назад» в toolbar hub-страницы — как на публичном профиле игрока.
 */
export function PageBackLink({
  label,
  to,
  onClick,
  testIdPrefix,
  testIdSection = 'page',
}: PageBackLinkProps) {
  const button = (
    <HockeyButton
      view="outlined"
      size="s"
      onClick={to ? undefined : onClick}
      data-testid={testId(testIdPrefix, testIdSection, 'btn', 'back')}
    >
      {label}
    </HockeyButton>
  )

  return (
    <div
      className="page-hub__toolbar"
      data-testid={testId(testIdPrefix, testIdSection, 'nav', 'back')}
    >
      {to ? (
        <Link to={to} data-testid={testId(testIdPrefix, testIdSection, 'link', 'back')}>
          {button}
        </Link>
      ) : (
        button
      )}
    </div>
  )
}
