/**
 * SPEC-FR-24.7.5
 */

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {Button, Text} from '@gravity-ui/uikit'
import {fetchShopCatalogState, importShopCatalog} from '@/features/shops/api/shopsApi'

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
    <div className="partner-dashboard__section hockey-stack hockey-stack--gap-12">
      <Text variant="subheader-2">Импорт каталога</Text>
      {state && (
        <div className="partner-dashboard__stats">
          <Text>
            Статус: {STATUS_LABELS[state.status] ?? state.status} · {state.productCount} позиций
          </Text>
          <Text color="secondary">
            Источник: {state.source}
            {state.lastSyncedAt
              ? ` · обновлено ${new Date(state.lastSyncedAt).toLocaleString('ru-RU')}`
              : ''}
          </Text>
          {state.errorMessage && <Text color="danger">{state.errorMessage}</Text>}
        </div>
      )}

      <div className="partner-dashboard__tabs">
        <Button
          size="s"
          view="outlined"
          loading={importMutation.isPending && importMutation.variables === 'feed'}
          onClick={() => importMutation.mutate('feed')}
        >
          Импорт feed
        </Button>
        <Button
          size="s"
          view="outlined"
          loading={importMutation.isPending && importMutation.variables === 'api'}
          onClick={() => importMutation.mutate('api')}
        >
          Импорт API
        </Button>
        <Button
          size="s"
          view="outlined"
          loading={importMutation.isPending && importMutation.variables === 'csv'}
          onClick={() => importMutation.mutate('csv')}
        >
          Импорт CSV
        </Button>
      </div>

      {importMutation.data && (
        <Text color="secondary">
          {importMutation.data.message ?? `Импортировано ${importMutation.data.importedCount} позиций`}
        </Text>
      )}
    </div>
  )
}
