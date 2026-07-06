/**
 * SPEC-FR-24.7.1
 */

import {Text} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useState} from 'react'
import {Link} from 'react-router-dom'

import {fetchSession} from '@/entities/auth'
import type {Shop} from '@/entities/shop'
import {fetchShopPromos} from '@/entities/shop'
import {MockShopPortalModal} from '@/features/shops/ui/MockShopPortalModal'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'

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
      <div
        className="shop-profile hockey-stack hockey-stack--gap-12"
        data-testid={testId('shops', 'profile', 'panel', shop.id)}
      >
        <div className="shop-profile__header hockey-row hockey-row--between">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text
              variant="subheader-2"
              data-testid={testId('shops', 'profile', 'text', 'title', shop.id)}
            >
              Профиль магазина
            </Text>
            <Text
              color="secondary"
              data-testid={testId('shops', 'profile', 'text', 'name', shop.id)}
            >
              {shop.name}
            </Text>
          </div>
          <span data-testid={testId('shops', 'profile', 'badge', 'profile', shop.id)}>
            <EntityProfileBadge kind="shop" />
          </span>
        </div>

        <div className="shop-profile__info hockey-grid hockey-grid--2-cols">
          <div className="hockey-stack hockey-stack--gap-4">
            <Text
              color="secondary"
              variant="caption-1"
              data-testid={testId('shops', 'profile', 'text', 'city-label', shop.id)}
            >
              Город
            </Text>
            <Text data-testid={testId('shops', 'profile', 'text', 'city', shop.id)}>
              {shop.city || 'Москва'}
            </Text>
          </div>
          <div className="hockey-stack hockey-stack--gap-4">
            <Text
              color="secondary"
              variant="caption-1"
              data-testid={testId('shops', 'profile', 'text', 'status-label', shop.id)}
            >
              Статус
            </Text>
            <Text data-testid={testId('shops', 'profile', 'text', 'status', shop.id)}>
              {shop.partnerStatus === 'partner' ? 'Официальный партнёр' : 'Магазин экипировки'}
            </Text>
          </div>
        </div>

        <div className="shop-profile__categories">
          <Text
            color="secondary"
            variant="caption-1"
            className="hockey-mb-4"
            data-testid={testId('shops', 'profile', 'text', 'categories-label', shop.id)}
          >
            Категории
          </Text>
          <div
            className="hockey-row hockey-row--gap-4 hockey-row--wrap"
            data-testid={testId('shops', 'profile', 'list', 'categories', shop.id)}
          >
            {shop.categories.map((cat) => (
              <span
                key={cat}
                className="club-profile__chip"
                data-testid={testId('shops', 'profile', 'badge', 'category', shop.id, cat)}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {shop.description && (
          <Text
            color="secondary"
            data-testid={testId('shops', 'profile', 'text', 'description', shop.id)}
          >
            {shop.description}
          </Text>
        )}

        {activePromos.length > 0 && (
          <div
            className="shop-profile__promos hockey-stack hockey-stack--gap-8"
            data-testid={testId('shops', 'profile', 'list', 'promos', shop.id)}
          >
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                className="shop-profile__promo-banner"
                data-testid={testId('shops', 'profile', 'card', 'promo', shop.id, promo.id)}
              >
                <Text
                  variant="subheader-2"
                  data-testid={testId('shops', 'profile', 'text', 'promo-title', shop.id, promo.id)}
                >
                  {promo.title}
                </Text>
                {promo.subtitle && (
                  <Text
                    color="secondary"
                    data-testid={testId(
                      'shops',
                      'profile',
                      'text',
                      'promo-subtitle',
                      shop.id,
                      promo.id,
                    )}
                  >
                    {promo.subtitle}
                  </Text>
                )}
                {promo.discountPercent && (
                  <span
                    className="shop-profile__promo-badge"
                    data-testid={testId(
                      'shops',
                      'profile',
                      'badge',
                      'promo-discount',
                      shop.id,
                      promo.id,
                    )}
                  >
                    −{promo.discountPercent}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="shop-profile__actions hockey-row hockey-row--gap-8">
          {canManagePartner && (
            <Link
              to={`/partner/shops/${shop.id}`}
              data-testid={testId('shops', 'profile', 'link', 'cabinet', shop.id)}
            >
              <HockeyButton
                view="action"
                size="s"
                data-testid={testId('shops', 'profile', 'btn', 'cabinet', shop.id)}
              >
                Кабинет магазина
              </HockeyButton>
            </Link>
          )}
          <HockeyButton
            view={canManagePartner ? 'outlined' : 'action'}
            size="s"
            data-testid={testId('shops', 'profile', 'btn', 'catalog', shop.id)}
            onClick={() => setPortalOpen(true)}
          >
            Каталог партнёра
          </HockeyButton>
          {shop.websiteUrl && (
            <a
              href={shop.websiteUrl}
              target="_blank"
              rel="noreferrer"
              data-testid={testId('shops', 'profile', 'link', 'website', shop.id)}
            >
              <HockeyButton
                view="outlined"
                size="s"
                data-testid={testId('shops', 'profile', 'btn', 'website', shop.id)}
              >
                Перейти на сайт
              </HockeyButton>
            </a>
          )}
        </div>

        <MockShopPortalModal open={portalOpen} onClose={() => setPortalOpen(false)} shop={shop} />
      </div>
    </IceCard>
  )
}
