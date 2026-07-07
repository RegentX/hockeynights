/**
 * SPEC-FR-9.1.3
 */

import {Button, Text} from '@gravity-ui/uikit'

import type {Shop} from '@/entities/shop'
import {testId} from '@/shared/testing/testId'
import {MockExternalFlowDialog} from '@/shared/ui/MockExternalFlowDialog'

/** @spec SPEC-FR-9.1.3 - Props mock-портала магазина */
export interface MockShopPortalModalProps {
  /** @spec SPEC-FR-9.1.3 */
  open: boolean
  /** @spec SPEC-FR-9.1.3 */
  onClose: () => void
  /** @spec SPEC-FR-9.1.2 */
  shop: Shop
}

/**
 * @spec SPEC-FR-9.1.3 - Mock-превью сайта магазина
 */
export function MockShopPortalModal({open, onClose, shop}: MockShopPortalModalProps) {
  return (
    <MockExternalFlowDialog
      open={open}
      onClose={onClose}
      flowType="shop_portal"
      partnerName={shop.name}
      externalUrl={shop.websiteUrl}
      footer={
        <Button
          view="action"
          data-testid={testId('shops', 'portal-modal', 'btn', 'close', shop.id)}
          onClick={onClose}
        >
          Закрыть
        </Button>
      }
    >
      <div
        className="hockey-stack hockey-stack--gap-8"
        data-testid={testId('shops', 'portal-modal', 'panel', shop.id)}
      >
        <Text data-testid={testId('shops', 'portal-modal', 'text', 'city', shop.id)}>
          {shop.city ?? 'Москва'}
        </Text>
        <Text
          color="secondary"
          data-testid={testId('shops', 'portal-modal', 'text', 'categories', shop.id)}
        >
          Категории: {shop.categories.join(', ') || 'не указаны'}
        </Text>
        <Text
          color="secondary"
          data-testid={testId('shops', 'portal-modal', 'text', 'status', shop.id)}
        >
          Статус: {shop.partnerStatus}
        </Text>
        <Text
          color="secondary"
          data-testid={testId('shops', 'portal-modal', 'text', 'hint', shop.id)}
        >
          Mock-каталог экипировки. В Phase 2 — переход на партнёрский сайт или API feed.
        </Text>
      </div>
    </MockExternalFlowDialog>
  )
}
