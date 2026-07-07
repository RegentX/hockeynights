/**
 * SPEC-FR-24.7.3, SPEC-FR-24.7.4
 */

import {Button, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {fetchSession} from '@/entities/auth'
import type {Shop} from '@/entities/shop'
import {fetchShops, updateShopPartnerProfile} from '@/entities/shop'
import {
  ShopAnalyticsPanel,
  ShopCatalogImportPanel,
  ShopProductManager,
  ShopPromoManager,
} from '@/features/shops'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

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
    return (
      <div data-testid={testId('shops', shopId, 'dashboard', 'loader')}>
        <ScoreboardLoader label="Загрузка кабинета магазина" />
      </div>
    )
  }

  const form = {...shop, ...draft}

  if (!canManage) {
    return (
      <IceCard padding="m">
        <div data-testid={testId('shops', shopId, 'dashboard', 'panel', 'denied')}>
          <Text data-testid={testId('shops', shopId, 'dashboard', 'text', 'denied')}>
            Кабинет доступен только представителю магазина. Выберите роль при входе.
          </Text>
          <Link
            to="/"
            className="hockey-mt-12"
            data-testid={testId('shops', shopId, 'dashboard', 'link', 'login')}
          >
            <HockeyButton
              view="outlined"
              size="s"
              data-testid={testId('shops', shopId, 'dashboard', 'btn', 'login')}
            >
              Перейти к входу
            </HockeyButton>
          </Link>
        </div>
      </IceCard>
    )
  }

  return (
    <div
      className="partner-dashboard hockey-stack hockey-stack--gap-16"
      data-testid={testId('shops', shopId, 'dashboard', 'page')}
    >
      <div className="partner-dashboard__header hockey-row hockey-row--between">
        <div>
          <Text
            variant="header-1"
            data-testid={testId('shops', shopId, 'dashboard', 'text', 'title')}
          >
            Кабинет магазина
          </Text>
          <Text
            color="secondary"
            data-testid={testId('shops', shopId, 'dashboard', 'text', 'name')}
          >
            {shop.name}
          </Text>
        </div>
        <span data-testid={testId('shops', shopId, 'dashboard', 'badge', 'profile')}>
          <EntityProfileBadge kind="shop" />
        </span>
      </div>

      <div
        className="partner-dashboard__tabs"
        data-testid={testId('shops', shopId, 'dashboard', 'nav')}
      >
        <Button
          view={tab === 'profile' ? 'action' : 'outlined'}
          size="s"
          data-testid={testId('shops', shopId, 'dashboard', 'tab', 'profile')}
          onClick={() => setTab('profile')}
        >
          О магазине
        </Button>
        <Button
          view={tab === 'products' ? 'action' : 'outlined'}
          size="s"
          data-testid={testId('shops', shopId, 'dashboard', 'tab', 'products')}
          onClick={() => setTab('products')}
        >
          Товары
        </Button>
        <Button
          view={tab === 'import' ? 'action' : 'outlined'}
          size="s"
          data-testid={testId('shops', shopId, 'dashboard', 'tab', 'import')}
          onClick={() => setTab('import')}
        >
          Импорт
        </Button>
        <Button
          view={tab === 'promos' ? 'action' : 'outlined'}
          size="s"
          data-testid={testId('shops', shopId, 'dashboard', 'tab', 'promos')}
          onClick={() => setTab('promos')}
        >
          Промо
        </Button>
        <Button
          view={tab === 'analytics' ? 'action' : 'outlined'}
          size="s"
          data-testid={testId('shops', shopId, 'dashboard', 'tab', 'analytics')}
          onClick={() => setTab('analytics')}
        >
          Аналитика
        </Button>
      </div>

      {tab === 'profile' && (
        <IceCard padding="m">
          <div
            className="partner-dashboard__form hockey-stack hockey-stack--gap-10"
            data-testid={testId('shops', shopId, 'dashboard', 'form', 'profile')}
          >
            <Text
              variant="subheader-2"
              data-testid={testId('shops', shopId, 'dashboard', 'text', 'profile-title')}
            >
              Публичный профиль
            </Text>
            <TextInput
              label="Описание"
              value={form.description ?? ''}
              data-testid={testId('shops', shopId, 'dashboard', 'field', 'description')}
              onUpdate={(value) => setDraft((prev) => ({...prev, description: value}))}
            />
            <TextInput
              label="Email"
              value={form.contactEmail ?? ''}
              data-testid={testId('shops', shopId, 'dashboard', 'field', 'email')}
              onUpdate={(value) => setDraft((prev) => ({...prev, contactEmail: value}))}
            />
            <TextInput
              label="Телефон"
              value={form.contactPhone ?? ''}
              data-testid={testId('shops', shopId, 'dashboard', 'field', 'phone')}
              onUpdate={(value) => setDraft((prev) => ({...prev, contactPhone: value}))}
            />
            <TextInput
              label="Доставка"
              value={form.deliveryInfo ?? ''}
              data-testid={testId('shops', shopId, 'dashboard', 'field', 'delivery')}
              onUpdate={(value) => setDraft((prev) => ({...prev, deliveryInfo: value}))}
            />
            <TextInput
              label="Самовывоз"
              value={form.pickupInfo ?? ''}
              data-testid={testId('shops', shopId, 'dashboard', 'field', 'pickup')}
              onUpdate={(value) => setDraft((prev) => ({...prev, pickupInfo: value}))}
            />
            <Text
              color="secondary"
              data-testid={testId('shops', shopId, 'dashboard', 'text', 'moderation-status')}
            >
              Статус модерации: {form.moderationStatus ?? 'draft'}
            </Text>
            <Button
              view="action"
              loading={saveMutation.isPending}
              data-testid={testId('shops', shopId, 'dashboard', 'btn', 'save-profile')}
              onClick={() => saveMutation.mutate(draft)}
            >
              Сохранить профиль
            </Button>
            {statusMessage && (
              <Text
                color="secondary"
                data-testid={testId('shops', shopId, 'dashboard', 'text', 'status-message')}
              >
                {statusMessage}
              </Text>
            )}
          </div>
        </IceCard>
      )}

      {tab === 'products' && (
        <IceCard
          padding="m"
          data-testid={testId('shops', shopId, 'dashboard', 'panel', 'products')}
        >
          <ShopProductManager shopId={shopId} />
        </IceCard>
      )}

      {tab === 'import' && (
        <IceCard padding="m" data-testid={testId('shops', shopId, 'dashboard', 'panel', 'import')}>
          <ShopCatalogImportPanel shopId={shopId} />
        </IceCard>
      )}

      {tab === 'promos' && (
        <IceCard padding="m" data-testid={testId('shops', shopId, 'dashboard', 'panel', 'promos')}>
          <ShopPromoManager shopId={shopId} />
        </IceCard>
      )}

      {tab === 'analytics' && (
        <IceCard
          padding="m"
          data-testid={testId('shops', shopId, 'dashboard', 'panel', 'analytics')}
        >
          <ShopAnalyticsPanel shopId={shopId} />
        </IceCard>
      )}

      <Link to="/shops" data-testid={testId('shops', shopId, 'dashboard', 'link', 'back')}>
        <HockeyButton
          view="outlined"
          size="s"
          data-testid={testId('shops', shopId, 'dashboard', 'btn', 'back')}
        >
          ← К каталогу магазинов
        </HockeyButton>
      </Link>
    </div>
  )
}
