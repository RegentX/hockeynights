/**
 * SPEC-FR-24.7.5
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {fetchShopCatalogState, importShopCatalog} from '@/entities/shop'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const STATUS_LABELS: Record<string, string> = {
  synced: 'Синхронизирован',
  stale: 'Устарел',
  partial: 'Частичный импорт',
  failed: 'Ошибка',
  mock: 'Ручной каталог',
}

export interface ShopCatalogImportPanelProps {
  shopId: string
}

/** @spec SPEC-FR-24.7.5 - Импорт и статус каталога */
export function ShopCatalogImportPanel({shopId}: ShopCatalogImportPanelProps) {
  const queryClient = useQueryClient()

  const {data: state} = useQuery({
    queryKey: ['shop-catalog-state', shopId],
    queryFn: () => fetchShopCatalogState(shopId),
  })

  const importMutation = useMutation({
    mutationFn: (source: 'feed' | 'api' | 'csv') => importShopCatalog(shopId, source),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['shop-catalog-state', shopId]})
      void queryClient.invalidateQueries({queryKey: ['product-offers', shopId]})
    },
  })

  return (
    <div
      className="partner-dashboard__section hockey-stack hockey-stack--gap-12"
      data-testid={testId('shops', shopId, 'import', 'panel')}
    >
      <Text variant="subheader-2" data-testid={testId('shops', shopId, 'import', 'text', 'title')}>
        Импорт каталога
      </Text>
      {state && (
        <div
          className="partner-dashboard__stats"
          data-testid={testId('shops', shopId, 'import', 'panel', 'status')}
        >
          <Text data-testid={testId('shops', shopId, 'import', 'text', 'status')}>
            Статус: {STATUS_LABELS[state.status] ?? state.status} · {state.productCount} позиций
          </Text>
          <Text color="secondary" data-testid={testId('shops', shopId, 'import', 'text', 'source')}>
            Источник: {state.source}
            {state.lastSyncedAt
              ? ` · обновлено ${new Date(state.lastSyncedAt).toLocaleString('ru-RU')}`
              : ''}
          </Text>
          {state.errorMessage && (
            <Text color="danger" data-testid={testId('shops', shopId, 'import', 'text', 'error')}>
              {state.errorMessage}
            </Text>
          )}
        </div>
      )}

      <div
        className="partner-dashboard__tabs"
        data-testid={testId('shops', shopId, 'import', 'nav')}
      >
        <HockeyButton
          size="s"
          view="outlined"
          loading={importMutation.isPending && importMutation.variables === 'feed'}
          data-testid={testId('shops', shopId, 'import', 'btn', 'feed')}
          onClick={() => importMutation.mutate('feed')}
        >
          Импорт feed
        </HockeyButton>
        <HockeyButton
          size="s"
          view="outlined"
          loading={importMutation.isPending && importMutation.variables === 'api'}
          data-testid={testId('shops', shopId, 'import', 'btn', 'api')}
          onClick={() => importMutation.mutate('api')}
        >
          Импорт API
        </HockeyButton>
        <HockeyButton
          size="s"
          view="outlined"
          loading={importMutation.isPending && importMutation.variables === 'csv'}
          data-testid={testId('shops', shopId, 'import', 'btn', 'csv')}
          onClick={() => importMutation.mutate('csv')}
        >
          Импорт CSV
        </HockeyButton>
      </div>

      {importMutation.data && (
        <Text color="secondary" data-testid={testId('shops', shopId, 'import', 'text', 'result')}>
          {importMutation.data.message ??
            `Импортировано ${importMutation.data.importedCount} позиций`}
        </Text>
      )}
    </div>
  )
}
