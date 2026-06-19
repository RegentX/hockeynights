/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {Link} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface PartnerAccessHintProps {
  kind: 'league' | 'shop'
}

/** @spec SPEC-FR-1.3.7 - Подсказка для демо кабинета партнёра */
export function PartnerAccessHint({kind}: PartnerAccessHintProps) {
  const label = kind === 'shop' ? 'магазина' : 'лиги'

  return (
    <IceCard padding="m" className="partner-cabinet-banner partner-cabinet-banner--hint">
      <div className="hockey-stack hockey-stack--gap-8">
        <Text variant="subheader-2">Демо кабинета {label}</Text>
        <Text color="secondary">
          На странице входа отметьте «Представитель {label}» — в меню появится пункт «Партнёр», откроется кабинет
          с товарами, расписанием и аналитикой.
        </Text>
        <Link to="/">
          <HockeyButton view="outlined" size="s">Войти как представитель {label}</HockeyButton>
        </Link>
      </div>
    </IceCard>
  )
}
