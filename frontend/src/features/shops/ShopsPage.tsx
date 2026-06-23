/**
 * SPEC-FR-9.1.1, SPEC-FR-9.3.1
 */

import {useQuery} from '@tanstack/react-query'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {PartnerCabinetBanner} from '@/features/partners/PartnerCabinetBanner'
import {MarketplacePage} from '@/features/shops/MarketplacePage'
import {testId} from '@/shared/testing/testId'

/**
 * @spec SPEC-FR-9.1.1 - Маркетплейс для игроков, тренеров и владельцев магазинов
 * @spec SPEC-FR-9.3.1 - Лента товаров
 */
export function ShopsPage() {
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const shopMembership = session?.user.partnerMemberships?.find((m) => m.kind === 'shop')

  return (
    <div className="hockey-stack hockey-stack--gap-16" data-testid={testId('shops', 'shops', 'page')}>
      {shopMembership && <PartnerCabinetBanner membership={shopMembership} />}
      <MarketplacePage />
    </div>
  )
}
