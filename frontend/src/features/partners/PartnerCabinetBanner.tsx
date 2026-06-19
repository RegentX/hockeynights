/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {Link} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import type {PartnerMembership} from '@/entities/user/types'
import {partnerCabinetLabel, partnerCabinetPath} from '@/features/partners/constants'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'

export interface PartnerCabinetBannerProps {
  membership: PartnerMembership
}

/** @spec SPEC-FR-24.7.3 - Баннер входа в кабинет партнёра */
export function PartnerCabinetBanner({membership}: PartnerCabinetBannerProps) {
  const isShop = membership.kind === 'shop'

  return (
    <IceCard padding="m" className="partner-cabinet-banner">
      <div className="partner-cabinet-banner__inner hockey-row hockey-row--between hockey-row--wrap">
        <div className="hockey-stack hockey-stack--gap-8">
          <Text variant="subheader-2">{partnerCabinetLabel(membership)}</Text>
          <Text color="secondary">{membership.entityName}</Text>
          <Text color="secondary">
            {isShop
              ? 'Добавляйте товары, импортируйте каталог, настраивайте промо и смотрите аналитику.'
              : 'Принимайте заявки команд, ведите расписание, публикуйте новости и смотрите аналитику.'}
          </Text>
        </div>
        <Link to={partnerCabinetPath(membership)}>
          <HockeyButton view="action">Открыть кабинет →</HockeyButton>
        </Link>
      </div>
    </IceCard>
  )
}
