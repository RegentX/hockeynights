/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {Text} from '@gravity-ui/uikit'
import {Link} from 'react-router'

import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

export interface PartnerAccessHintProps {
  kind: 'league' | 'shop'
}

/** @spec SPEC-FR-1.3.7 - Подсказка для демо кабинета партнёра */
export function PartnerAccessHint({kind}: PartnerAccessHintProps) {
  const label = kind === 'shop' ? 'магазина' : 'лиги'

  return (
    <IceCard padding="m" className="partner-cabinet-banner partner-cabinet-banner--hint">
      <div
        className="hockey-stack hockey-stack--gap-8"
        data-testid={testId('partners', 'access-hint', 'panel', kind)}
      >
        <Text
          variant="subheader-2"
          data-testid={testId('partners', 'access-hint', 'text', 'title', kind)}
        >
          Демо кабинета {label}
        </Text>
        <Text
          color="secondary"
          data-testid={testId('partners', 'access-hint', 'text', 'hint', kind)}
        >
          На странице входа отметьте «Представитель {label}» — в меню появится пункт «Партнёр»,
          откроется кабинет с товарами, расписанием и аналитикой.
        </Text>
        <Link to="/" data-testid={testId('partners', 'access-hint', 'link', 'login', kind)}>
          <HockeyButton
            view="outlined"
            size="s"
            data-testid={testId('partners', 'access-hint', 'btn', 'login', kind)}
          >
            Войти как представитель {label}
          </HockeyButton>
        </Link>
      </div>
    </IceCard>
  )
}
