/**
 * SPEC-FR-9.3.1
 */

import {useEffect, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {Button, Select, Switch, Text, TextInput} from '@gravity-ui/uikit'
import type {MarketplaceFilters, MarketplaceSort} from '@/entities/shop/types'
import type {PlayerPosition} from '@/entities/common/types'
import {fetchMarketplaceFeed} from '@/features/shops/api/marketplaceApi'
import {MarketplaceProductCard} from '@/features/shops/MarketplaceProductCard'
import {MarketplaceShopStrip} from '@/features/shops/MarketplaceShopStrip'
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
    <div className="marketplace hockey-stack hockey-stack--gap-20">
      <div className="marketplace__hero">
        <Text variant="header-1">Маркет экипировки</Text>
        <Text color="secondary">
          Лента товаров от партнёрских магазинов — как маркетплейс, с приоритетом для продвигаемых продавцов.
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
        />

        <div className="marketplace__filters">
          <div className="marketplace__chips">
            <Button
              view={!filters.category ? 'action' : 'outlined'}
              size="s"
              onClick={() => patchFilters({category: undefined})}
            >
              Все категории
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                view={filters.category === category ? 'action' : 'outlined'}
                size="s"
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
            />
            <div className="marketplace__switch">
              <Switch
                checked={Boolean(filters.inStockOnly)}
                onUpdate={(checked) => patchFilters({inStockOnly: checked})}
              />
              <Text>Только в наличии</Text>
            </div>
          </div>
        </div>
      </div>

      <div className="marketplace__feed-header hockey-row hockey-row--between">
        <Text variant="subheader-2">
          {isFetching ? 'Обновляем ленту…' : `${listings.length} товаров`}
        </Text>
        {filters.shopId && (
          <Button view="outlined" size="s" onClick={() => patchFilters({shopId: undefined})}>
            Сбросить фильтр магазина
          </Button>
        )}
      </div>

      {isLoading ? (
        <ScoreboardLoader label="Загрузка маркетплейса" />
      ) : listings.length === 0 ? (
        <div className="marketplace__empty">
          <Text variant="subheader-2">Ничего не нашли</Text>
          <Text color="secondary">Попробуйте другой запрос или снимите фильтры.</Text>
        </div>
      ) : (
        <div className="marketplace__grid">
          {listings.map((listing) => (
            <MarketplaceProductCard key={listing.offer.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
