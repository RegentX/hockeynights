/**
 * SPEC-FR-9.1.1, SPEC-FR-9.3.1
 */

import {useSessionAccess} from '@/features/access'
import {PartnerCabinetBanner} from '@/features/partners'
import {MarketplacePage} from '@/pages/MarketplacePage'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-FR-9.1.1 - Маркетплейс для игроков, тренеров и владельцев магазинов
 * @spec SPEC-FR-9.3.1 - Лента товаров
 */
export function ShopsPage() {
  const {session} = useSessionAccess()
  const shopMembership = session?.user.partnerMemberships?.find((m) => m.kind === 'shop')

  return (
    <div
      className="hockey-stack hockey-stack--gap-20"
      data-testid={testId('shops', 'shops', 'page')}
    >
      {shopMembership && <PartnerCabinetBanner membership={shopMembership} />}
      <MarketplacePage />
    </div>
  )
}
