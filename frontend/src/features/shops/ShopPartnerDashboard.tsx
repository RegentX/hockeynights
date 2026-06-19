/**
 * SPEC-FR-24.7.3, SPEC-FR-24.7.4
 */

import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Text, TextInput} from '@gravity-ui/uikit'
import type {Shop} from '@/entities/shop/types'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {fetchShops, updateShopPartnerProfile} from '@/features/shops/api/shopsApi'
import {ShopProductManager} from '@/features/shops/ShopProductManager'
import {ShopCatalogImportPanel} from '@/features/shops/ShopCatalogImportPanel'
import {ShopPromoManager} from '@/features/shops/ShopPromoManager'
import {ShopAnalyticsPanel} from '@/features/shops/ShopAnalyticsPanel'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'

type PartnerTab = 'profile' | 'products' | 'import' | 'promos' | 'analytics'

/** @spec SPEC-FR-24.7.3 - Кабинет партнёра магазина */
export function ShopPartnerDashboard() {
  const {shopId = ''} = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<PartnerTab>('products')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})
  const {data: shops = [], isLoading} = useQuery({queryKey: ['shops'], queryFn: fetchShops})
  const shop = shops.find((item) => item.id === shopId)

  const [draft, setDraft] = useState<Partial<Shop>>({})

  const canManage =
    session?.user.roles.includes('admin') ||
    session?.user.partnerMemberships?.some((m) => m.kind === 'shop' && m.entityId === shopId)

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<Shop>) => updateShopPartnerProfile(shopId, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['shops']})
      setStatusMessage('Профиль отправлен на модерацию. Изменения появятся после проверки.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль')
    },
  })

  if (isLoading || !shop) {
    return <ScoreboardLoader label="Загрузка кабинета магазина" />
  }

  const form = {...shop, ...draft}

  if (!canManage) {
    return (
      <IceCard padding="m">
        <Text>Кабинет доступен только представителю магазина. Выберите роль при входе.</Text>
        <Link to="/" className="hockey-mt-12">
          <HockeyButton view="outlined" size="s">Перейти к входу</HockeyButton>
        </Link>
      </IceCard>
    )
  }

  return (
    <div className="partner-dashboard hockey-stack hockey-stack--gap-16">
      <div className="partner-dashboard__header hockey-row hockey-row--between">
        <div>
          <Text variant="header-1">Кабинет магазина</Text>
          <Text color="secondary">{shop.name}</Text>
        </div>
        <EntityProfileBadge kind="shop" />
      </div>

      <div className="partner-dashboard__tabs">
        <Button view={tab === 'profile' ? 'action' : 'outlined'} size="s" onClick={() => setTab('profile')}>
          О магазине
        </Button>
        <Button view={tab === 'products' ? 'action' : 'outlined'} size="s" onClick={() => setTab('products')}>
          Товары
        </Button>
        <Button view={tab === 'import' ? 'action' : 'outlined'} size="s" onClick={() => setTab('import')}>
          Импорт
        </Button>
        <Button view={tab === 'promos' ? 'action' : 'outlined'} size="s" onClick={() => setTab('promos')}>
          Промо
        </Button>
        <Button view={tab === 'analytics' ? 'action' : 'outlined'} size="s" onClick={() => setTab('analytics')}>
          Аналитика
        </Button>
      </div>

      {tab === 'profile' && (
        <IceCard padding="m">
          <div className="partner-dashboard__form hockey-stack hockey-stack--gap-10">
            <Text variant="subheader-2">Публичный профиль</Text>
            <TextInput
              label="Описание"
              value={form.description ?? ''}
              onUpdate={(value) => setDraft((prev) => ({...prev, description: value}))}
            />
            <TextInput
              label="Email"
              value={form.contactEmail ?? ''}
              onUpdate={(value) => setDraft((prev) => ({...prev, contactEmail: value}))}
            />
            <TextInput
              label="Телефон"
              value={form.contactPhone ?? ''}
              onUpdate={(value) => setDraft((prev) => ({...prev, contactPhone: value}))}
            />
            <TextInput
              label="Доставка"
              value={form.deliveryInfo ?? ''}
              onUpdate={(value) => setDraft((prev) => ({...prev, deliveryInfo: value}))}
            />
            <TextInput
              label="Самовывоз"
              value={form.pickupInfo ?? ''}
              onUpdate={(value) => setDraft((prev) => ({...prev, pickupInfo: value}))}
            />
            <Text color="secondary">Статус модерации: {form.moderationStatus ?? 'draft'}</Text>
            <Button view="action" loading={saveMutation.isPending} onClick={() => saveMutation.mutate(draft)}>
              Сохранить профиль
            </Button>
            {statusMessage && <Text color="secondary">{statusMessage}</Text>}
          </div>
        </IceCard>
      )}

      {tab === 'products' && (
        <IceCard padding="m">
          <ShopProductManager shopId={shopId} />
        </IceCard>
      )}

      {tab === 'import' && (
        <IceCard padding="m">
          <ShopCatalogImportPanel shopId={shopId} />
        </IceCard>
      )}

      {tab === 'promos' && (
        <IceCard padding="m">
          <ShopPromoManager shopId={shopId} />
        </IceCard>
      )}

      {tab === 'analytics' && (
        <IceCard padding="m">
          <ShopAnalyticsPanel shopId={shopId} />
        </IceCard>
      )}

      <Link to="/shops">
        <HockeyButton view="outlined" size="s">← К каталогу магазинов</HockeyButton>
      </Link>
    </div>
  )
}
