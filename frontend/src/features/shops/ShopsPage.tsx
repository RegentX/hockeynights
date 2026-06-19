/**
 * SPEC-FR-9.1.1, SPEC-FR-9.3.1
 */

import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {shouldUsePartnerWorkspace} from '@/features/partners/sessionPersona'
import {PartnerAccessHint} from '@/features/partners/PartnerAccessHint'
import {PartnerCabinetBanner} from '@/features/partners/PartnerCabinetBanner'
import {fetchProductOffers, fetchShops} from '@/features/shops/api/shopsApi'
import {MarketplacePage} from '@/features/shops/MarketplacePage'
import {ProductOffersList} from '@/features/shops/ProductOffersList'
import {ShopCard} from '@/features/shops/ShopCard'
import {ShopProfilePanel} from '@/features/shops/ShopProfilePanel'

/** @spec SPEC-FR-9.1.1 - Каталог магазинов для партнёра */
function PartnerShopsDirectory() {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const shopMembership = session?.user.partnerMemberships?.find((m) => m.kind === 'shop')

  const {data: shops = [], isLoading} = useQuery({
    queryKey: ['shops'],
    queryFn: fetchShops,
  })

  const selectedShop = shops.find((s) => s.id === selectedShopId)

  const {data: offers = []} = useQuery({
    queryKey: ['product-offers', selectedShopId],
    queryFn: () => fetchProductOffers(selectedShopId ?? undefined),
    enabled: Boolean(selectedShopId),
  })

  return (
    <div className="hockey-stack hockey-stack--gap-16">
      <Text variant="header-1">Каталог магазинов</Text>

      {shopMembership ? (
        <PartnerCabinetBanner membership={shopMembership} />
      ) : (
        <PartnerAccessHint kind="shop" />
      )}

      {isLoading && <Text>Загрузка магазинов...</Text>}

      <div className="hockey-grid hockey-grid--cards-300">
        {shops.map((shop) => (
          <div key={shop.id} onClick={() => setSelectedShopId(shop.id)}>
            <ShopCard shop={shop} onSelect={setSelectedShopId} />
          </div>
        ))}
      </div>

      {selectedShopId && selectedShop && (
        <div className="hockey-stack hockey-stack--gap-16">
          <ShopProfilePanel shop={selectedShop} />
          <div>
            <Text variant="subheader-2">Товарные предложения</Text>
            <div className="hockey-mt-12">
              <ProductOffersList offers={offers} shopName={selectedShop.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * @spec SPEC-FR-9.1.1 - Страница магазинов / маркетплейс
 * @spec SPEC-FR-9.3.1 - Лента товаров для игроков и тренеров
 */
export function ShopsPage() {
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  if (shouldUsePartnerWorkspace(session)) {
    return <PartnerShopsDirectory />
  }

  return <MarketplacePage />
}
