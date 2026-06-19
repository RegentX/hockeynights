/**
 * SPEC-FR-24.7.1
 */

import {useState} from 'react'
import {Link} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import type {Shop} from '@/entities/shop/types'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {MockShopPortalModal} from '@/features/shops/MockShopPortalModal'
import {fetchShopPromos} from '@/features/shops/api/shopsApi'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'

export interface ShopProfilePanelProps {
  shop: Shop
}

/**
 * @spec SPEC-FR-24.7.1 - Профиль хоккейного магазина
 */
export function ShopProfilePanel({shop}: ShopProfilePanelProps) {
  const [portalOpen, setPortalOpen] = useState(false)
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const canManagePartner =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'shop' && m.entityId === shop.id)

  const {data: promos = []} = useQuery({
    queryKey: ['shop-promos', shop.id],
    queryFn: () => fetchShopPromos(shop.id),
  })

  const activePromos = promos.filter((promo) => promo.active)

  return (
    <IceCard padding="m">
      <div className="shop-profile hockey-stack hockey-stack--gap-12">
        <div className="shop-profile__header hockey-row hockey-row--between">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text variant="subheader-2">Профиль магазина</Text>
            <Text color="secondary">{shop.name}</Text>
          </div>
          <EntityProfileBadge kind="shop" />
        </div>

        <div className="shop-profile__info hockey-grid hockey-grid--2-cols">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text color="secondary" variant="caption-1">Город</Text>
            <Text>{shop.city || 'Москва'}</Text>
          </div>
          <div className="hockey-stack hockey-stack--gap-4">
            <Text color="secondary" variant="caption-1">Статус</Text>
            <Text>{shop.partnerStatus === 'partner' ? 'Официальный партнёр' : 'Магазин экипировки'}</Text>
          </div>
        </div>

        <div className="shop-profile__categories">
          <Text color="secondary" variant="caption-1" className="hockey-mb-4">Категории</Text>
          <div className="hockey-row hockey-row--gap-4 hockey-row--wrap">
            {shop.categories.map((cat) => (
              <span key={cat} className="club-profile__chip">{cat}</span>
            ))}
          </div>
        </div>

        {shop.description && <Text color="secondary">{shop.description}</Text>}

        {activePromos.length > 0 && (
          <div className="shop-profile__promos hockey-stack hockey-stack--gap-8">
            {activePromos.map((promo) => (
              <div key={promo.id} className="shop-profile__promo-banner">
                <Text variant="subheader-2">{promo.title}</Text>
                {promo.subtitle && <Text color="secondary">{promo.subtitle}</Text>}
                {promo.discountPercent && (
                  <span className="shop-profile__promo-badge">−{promo.discountPercent}%</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="shop-profile__actions hockey-row hockey-row--gap-8">
          {canManagePartner && (
            <Link to={`/partner/shops/${shop.id}`}>
              <HockeyButton view="action" size="s">Кабинет магазина</HockeyButton>
            </Link>
          )}
          <HockeyButton view={canManagePartner ? 'outlined' : 'action'} size="s" onClick={() => setPortalOpen(true)}>
            Каталог партнёра
          </HockeyButton>
          {shop.websiteUrl && (
            <a href={shop.websiteUrl} target="_blank" rel="noreferrer">
              <HockeyButton view="outlined" size="s">
                Перейти на сайт
              </HockeyButton>
            </a>
          )}
        </div>

        <MockShopPortalModal
          open={portalOpen}
          onClose={() => setPortalOpen(false)}
          shop={shop}
        />
      </div>
    </IceCard>
  )
}
