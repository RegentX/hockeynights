/**
 * SPEC-FR-9.3.1
 */

import {Button, Select, Switch, Text, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useState} from 'react'

import type {PlayerPosition} from '@/entities/common'
import type {MarketplaceFilters, MarketplaceSort} from '@/entities/shop'
import {fetchMarketplaceFeed} from '@/entities/shop'
import {MarketplaceProductCard} from '@/features/shops/ui/MarketplaceProductCard'
import {MarketplaceShopStrip} from '@/features/shops/ui/MarketplaceShopStrip'
import {testId} from '@/shared/testing/testId'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

const SORT_OPTIONS = [
  {value: 'recommended', content: 'Рекомендуемые'},
  {value: 'price_asc', content: 'Сначала дешевле'},
  {value: 'price_desc', content: 'Сначала дороже'},
]

const POSITION_OPTIONS = [
  {value: 'any', content: 'Любая позиция'},
  {value: 'forward', content: 'Нападающий'},
  {value: 'defense', content: 'Защитник'},
  {value: 'goalie', content: 'Вратарь'},
]

/**
 * @spec SPEC-FR-9.3.1 - Маркетплейс экипировки (лента товаров)
 */
export function MarketplacePage() {
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sort: 'recommended',
    inStockOnly: false,
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => ({...prev, q: searchInput.trim() || undefined}))
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const {data, isLoading, isFetching} = useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => fetchMarketplaceFeed(filters),
  })

  const listings = data?.listings ?? []
  const categories = data?.categories ?? []
  const spotlightShops = data?.spotlightShops ?? []

  function patchFilters(patch: Partial<MarketplaceFilters>) {
    setFilters((prev) => ({...prev, ...patch}))
  }

  return (
    <div
      className="marketplace hockey-stack hockey-stack--gap-20"
      data-testid={testId('shops', 'marketplace', 'page')}
    >
      <div className="marketplace__hero">
        <Text variant="header-1" data-testid={testId('shops', 'marketplace', 'text', 'title')}>
          Маркет экипировки
        </Text>
        <Text color="secondary" data-testid={testId('shops', 'marketplace', 'text', 'subtitle')}>
          Лента товаров от партнёрских магазинов — как маркетплейс, с приоритетом для продвигаемых
          продавцов.
        </Text>
      </div>

      <MarketplaceShopStrip
        shops={spotlightShops}
        activeShopId={filters.shopId}
        onSelectShop={(shopId) => patchFilters({shopId})}
      />

      <div className="marketplace__toolbar hockey-stack hockey-stack--gap-12">
        <TextInput
          placeholder="Поиск: коньки, клюшка, Bauer…"
          value={searchInput}
          onUpdate={setSearchInput}
          size="xl"
          hasClear
          data-testid={testId('shops', 'marketplace', 'field', 'search')}
        />

        <div
          className="marketplace__filters"
          data-testid={testId('shops', 'marketplace', 'filter')}
        >
          <div className="marketplace__chips">
            <Button
              view={!filters.category ? 'action' : 'outlined'}
              size="s"
              data-testid={testId('shops', 'marketplace', 'btn', 'category-all')}
              onClick={() => patchFilters({category: undefined})}
            >
              Все категории
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                view={filters.category === category ? 'action' : 'outlined'}
                size="s"
                data-testid={testId('shops', 'marketplace', 'btn', 'category', category)}
                onClick={() => patchFilters({category})}
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="marketplace__controls hockey-grid hockey-grid--cards-280">
            <Select
              label="Сортировка"
              value={[filters.sort ?? 'recommended']}
              onUpdate={(value) => patchFilters({sort: value[0] as MarketplaceSort})}
              options={SORT_OPTIONS}
              width="max"
              data-testid={testId('shops', 'marketplace', 'select', 'sort')}
            />
            <Select
              label="Для позиции"
              value={[filters.position ?? 'any']}
              onUpdate={(value) => {
                const next = value[0] as PlayerPosition | 'any'
                patchFilters({position: next === 'any' ? undefined : next})
              }}
              options={POSITION_OPTIONS}
              width="max"
              data-testid={testId('shops', 'marketplace', 'select', 'position')}
            />
            <div className="marketplace__switch">
              <Switch
                checked={Boolean(filters.inStockOnly)}
                onUpdate={(checked) => patchFilters({inStockOnly: checked})}
                data-testid={testId('shops', 'marketplace', 'toggle', 'in-stock')}
              />
              <Text data-testid={testId('shops', 'marketplace', 'text', 'in-stock-label')}>
                Только в наличии
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className="marketplace__feed-header hockey-row hockey-row--between">
        <Text
          variant="subheader-2"
          data-testid={testId('shops', 'marketplace', 'text', 'feed-count')}
        >
          {isFetching ? 'Обновляем ленту…' : `${listings.length} товаров`}
        </Text>
        {filters.shopId && (
          <Button
            view="outlined"
            size="s"
            data-testid={testId('shops', 'marketplace', 'btn', 'clear-shop-filter')}
            onClick={() => patchFilters({shopId: undefined})}
          >
            Сбросить фильтр магазина
          </Button>
        )}
      </div>

      {isLoading ? (
        <div data-testid={testId('shops', 'marketplace', 'loader')}>
          <ScoreboardLoader label="Загрузка маркетплейса" />
        </div>
      ) : listings.length === 0 ? (
        <div className="marketplace__empty" data-testid={testId('shops', 'marketplace', 'empty')}>
          <Text
            variant="subheader-2"
            data-testid={testId('shops', 'marketplace', 'text', 'empty-title')}
          >
            Ничего не нашли
          </Text>
          <Text
            color="secondary"
            data-testid={testId('shops', 'marketplace', 'text', 'empty-hint')}
          >
            Попробуйте другой запрос или снимите фильтры.
          </Text>
        </div>
      ) : (
        <div className="marketplace__grid" data-testid={testId('shops', 'marketplace', 'list')}>
          {listings.map((listing) => (
            <MarketplaceProductCard key={listing.offer.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
