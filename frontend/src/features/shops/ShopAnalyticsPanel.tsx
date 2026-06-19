/**
 * SPEC-FR-24.7.7, SPEC-FR-24.7.8
 */

import {useQuery} from '@tanstack/react-query'
import {Text} from '@gravity-ui/uikit'
import {fetchShopAnalytics, fetchShopLeads} from '@/features/shops/api/shopsApi'

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
    return <Text color="secondary">Загрузка аналитики…</Text>
  }

  return (
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12">
      <Text variant="subheader-2">Аналитика</Text>

      <div className="partner-dashboard__stats-grid">
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.profileViews}</Text>
          <Text color="secondary">Просмотры профиля</Text>
        </div>
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.productClicks}</Text>
          <Text color="secondary">Клики по товарам</Text>
        </div>
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.checkoutIntents}</Text>
          <Text color="secondary">Намерения покупки</Text>
        </div>
        <div className="partner-dashboard__stat">
          <Text variant="subheader-1">{analytics.ctrPercent}%</Text>
          <Text color="secondary">CTR каталога</Text>
        </div>
      </div>

      <Text color="secondary">
        Топ категория: {analytics.topCategory ?? '—'} · Топ позиция: {analytics.topPosition ?? '—'}
      </Text>

      <Text variant="subheader-2">Последние лиды</Text>
      <ul className="partner-dashboard__list">
        {leads.map((lead) => (
          <li key={lead.id} className="partner-dashboard__list-item">
            <div>
              <Text>{LEAD_LABELS[lead.type] ?? lead.type}</Text>
              <Text color="secondary">
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
