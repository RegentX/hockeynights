/**
 * SPEC-FR-24.7.7, SPEC-FR-24.7.8
 */

import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchShopAnalytics, fetchShopLeads} from '@/features/shops/api/shopsApi'
import {testId} from '@/shared/testing/testId'

const LEAD_LABELS: Record<string, string> = {
  product_click: 'Клик по товару',
  checkout_intent: 'Намерение покупки',
  external_redirect: 'Переход на сайт',
  save: 'Сохранение',
}

export interface ShopAnalyticsPanelProps {
  shopId: string
}

/** @spec SPEC-FR-24.7.8 - Аналитика и лиды магазина */
export function ShopAnalyticsPanel({shopId}: ShopAnalyticsPanelProps) {
  const {data: analytics} = useQuery({
    queryKey: ['shop-analytics', shopId],
    queryFn: () => fetchShopAnalytics(shopId),
  })

  const {data: leads = []} = useQuery({
    queryKey: ['shop-leads', shopId],
    queryFn: () => fetchShopLeads(shopId),
  })

  if (!analytics) {
    return (
      <Text color="secondary" data-testid={testId('shops', shopId, 'analytics', 'loader')}>
        Загрузка аналитики…
      </Text>
    )
  }

  return (
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12" data-testid={testId('shops', shopId, 'analytics', 'panel')}>
      <Text variant="subheader-2" data-testid={testId('shops', shopId, 'analytics', 'text', 'title')}>
        Аналитика
      </Text>

      <div className="partner-dashboard__stats-grid" data-testid={testId('shops', shopId, 'analytics', 'list', 'stats')}>
        <div className="partner-dashboard__stat" data-testid={testId('shops', shopId, 'analytics', 'card', 'profile-views')}>
          <Text variant="subheader-1" data-testid={testId('shops', shopId, 'analytics', 'text', 'profile-views-value')}>
            {analytics.profileViews}
          </Text>
          <Text color="secondary" data-testid={testId('shops', shopId, 'analytics', 'text', 'profile-views-label')}>
            Просмотры профиля
          </Text>
        </div>
        <div className="partner-dashboard__stat" data-testid={testId('shops', shopId, 'analytics', 'card', 'product-clicks')}>
          <Text variant="subheader-1" data-testid={testId('shops', shopId, 'analytics', 'text', 'product-clicks-value')}>
            {analytics.productClicks}
          </Text>
          <Text color="secondary" data-testid={testId('shops', shopId, 'analytics', 'text', 'product-clicks-label')}>
            Клики по товарам
          </Text>
        </div>
        <div className="partner-dashboard__stat" data-testid={testId('shops', shopId, 'analytics', 'card', 'checkout-intents')}>
          <Text variant="subheader-1" data-testid={testId('shops', shopId, 'analytics', 'text', 'checkout-intents-value')}>
            {analytics.checkoutIntents}
          </Text>
          <Text color="secondary" data-testid={testId('shops', shopId, 'analytics', 'text', 'checkout-intents-label')}>
            Намерения покупки
          </Text>
        </div>
        <div className="partner-dashboard__stat" data-testid={testId('shops', shopId, 'analytics', 'card', 'ctr')}>
          <Text variant="subheader-1" data-testid={testId('shops', shopId, 'analytics', 'text', 'ctr-value')}>
            {analytics.ctrPercent}%
          </Text>
          <Text color="secondary" data-testid={testId('shops', shopId, 'analytics', 'text', 'ctr-label')}>
            CTR каталога
          </Text>
        </div>
      </div>

      <Text color="secondary" data-testid={testId('shops', shopId, 'analytics', 'text', 'top-summary')}>
        Топ категория: {analytics.topCategory ?? '—'} · Топ позиция: {analytics.topPosition ?? '—'}
      </Text>

      <Text variant="subheader-2" data-testid={testId('shops', shopId, 'analytics', 'text', 'leads-title')}>
        Последние лиды
      </Text>
      <ul className="partner-dashboard__list" data-testid={testId('shops', shopId, 'analytics', 'list', 'leads')}>
        {leads.map((lead) => (
          <li key={lead.id} className="partner-dashboard__list-item" data-testid={testId('shops', shopId, 'analytics', 'item', lead.id)}>
            <div>
              <Text data-testid={testId('shops', shopId, 'analytics', 'text', 'lead-type', lead.id)}>
                {LEAD_LABELS[lead.type] ?? lead.type}
              </Text>
              <Text color="secondary" data-testid={testId('shops', shopId, 'analytics', 'text', 'lead-meta', lead.id)}>
                {lead.productTitle ?? '—'}
                {lead.userPosition ? ` · ${lead.userPosition}` : ''}
                {' · '}
                {new Date(lead.createdAt).toLocaleString('ru-RU')}
              </Text>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
