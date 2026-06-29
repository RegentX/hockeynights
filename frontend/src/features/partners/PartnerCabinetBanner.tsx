/**
 * SPEC-FR-24.5.3, SPEC-FR-24.7.3
 */

import {Link} from 'react-router-dom'
import {Text} from '@gravity-ui/uikit'
import type {PartnerMembership} from '@/entities/user/types'
import {partnerCabinetLabel, partnerCabinetPath} from '@/features/partners/constants'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export interface PartnerCabinetBannerProps {
  membership: PartnerMembership
}

/** @spec SPEC-FR-24.7.3 - Баннер входа в кабинет партнёра */
export function PartnerCabinetBanner({membership}: PartnerCabinetBannerProps) {
  const isShop = membership.kind === 'shop'

  return (
    <IceCard padding="m" className="partner-cabinet-banner">
      <div
        className="partner-cabinet-banner__inner hockey-row hockey-row--between hockey-row--wrap"
        data-testid={testId('partners', 'cabinet-banner', 'panel', membership.kind, membership.entityId)}
      >
        <div className="hockey-stack hockey-stack--gap-8">
          <Text
            variant="subheader-2"
            data-testid={testId('partners', 'cabinet-banner', 'text', 'title', membership.kind, membership.entityId)}
          >
            {partnerCabinetLabel(membership)}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('partners', 'cabinet-banner', 'text', 'name', membership.kind, membership.entityId)}
          >
            {membership.entityName}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('partners', 'cabinet-banner', 'text', 'hint', membership.kind, membership.entityId)}
          >
            {isShop
              ? 'Добавляйте товары, импортируйте каталог, настраивайте промо и смотрите аналитику.'
              : 'Принимайте заявки команд, ведите расписание, публикуйте новости и смотрите аналитику.'}
          </Text>
        </div>
        <Link
          to={partnerCabinetPath(membership)}
          data-testid={testId('partners', 'cabinet-banner', 'link', 'cabinet', membership.kind, membership.entityId)}
        >
          <HockeyButton
            view="action"
            data-testid={testId('partners', 'cabinet-banner', 'btn', 'open', membership.kind, membership.entityId)}
          >
            Открыть кабинет →
          </HockeyButton>
        </Link>
      </div>
    </IceCard>
  )
}
