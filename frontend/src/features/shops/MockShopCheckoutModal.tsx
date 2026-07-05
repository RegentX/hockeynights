/**
 * SPEC-FR-9.2.3, SPEC-FR-9.2.2
 */

import {Button, Text} from '@gravity-ui/uikit'
import {useMutation} from '@tanstack/react-query'
import {useState} from 'react'

import type {CheckoutIntent} from '@/entities/external-flow/types'
import type {ProductOffer} from '@/entities/shop/types'
import {createCheckoutIntent} from '@/features/external-flows/api/externalFlowsApi'
import {testId} from '@/shared/testing/testId'
import {MockExternalFlowDialog} from '@/shared/ui/MockExternalFlowDialog'

/** @spec SPEC-FR-9.2.3 - Props mock-checkout */
export interface MockShopCheckoutModalProps {
  /** @spec SPEC-FR-9.2.3 */
  open: boolean
  /** @spec SPEC-FR-9.2.3 */
  onClose: () => void
  /** @spec SPEC-FR-9.2.1 */
  offer: ProductOffer
  /** @spec SPEC-FR-9.1.2 */
  shopName: string
}

/**
 * @spec SPEC-FR-9.2.3 - Mock-переход к покупке на сайте магазина
 */
export function MockShopCheckoutModal({
  open,
  onClose,
  offer,
  shopName,
}: MockShopCheckoutModalProps) {
  const [result, setResult] = useState<CheckoutIntent | null>(null)

  const mutation = useMutation({
    mutationFn: createCheckoutIntent,
    onSuccess: (intent) => setResult(intent),
  })

  function handleClose() {
    setResult(null)
    mutation.reset()
    onClose()
  }

  return (
    <MockExternalFlowDialog
      open={open}
      onClose={handleClose}
      flowType="shop_checkout"
      partnerName={shopName}
      externalUrl={offer.externalUrl}
      footer={
        result ? (
          <Button
            view="action"
            data-testid={testId('shops', 'checkout-modal', 'btn', 'confirm', offer.id)}
            onClick={handleClose}
          >
            Понятно
          </Button>
        ) : (
          <>
            <Button
              view="flat"
              data-testid={testId('shops', 'checkout-modal', 'btn', 'cancel', offer.id)}
              onClick={handleClose}
            >
              Отмена
            </Button>
            <Button
              view="action"
              loading={mutation.isPending}
              data-testid={testId('shops', 'checkout-modal', 'btn', 'checkout', offer.id)}
              onClick={() => mutation.mutate({offerId: offer.id})}
            >
              Перейти к покупке (mock)
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId('shops', 'checkout-modal', 'panel', 'result', offer.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('shops', 'checkout-modal', 'text', 'result-title', offer.id)}
          >
            Переход подготовлен (mock)
          </Text>
          <Text data-testid={testId('shops', 'checkout-modal', 'text', 'result-offer', offer.id)}>
            {result.offerTitle} — {result.price.toLocaleString('ru-RU')} {result.currency}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('shops', 'checkout-modal', 'text', 'result-hint', offer.id)}
          >
            В Phase 2 откроется {result.externalUrl}. Сейчас покупка не выполняется.
          </Text>
        </div>
      ) : (
        <div
          className="hockey-stack hockey-stack--gap-8"
          data-testid={testId('shops', 'checkout-modal', 'panel', 'confirm', offer.id)}
        >
          <Text
            variant="subheader-2"
            data-testid={testId('shops', 'checkout-modal', 'text', 'title', offer.id)}
          >
            {offer.title}
          </Text>
          <Text data-testid={testId('shops', 'checkout-modal', 'text', 'price', offer.id)}>
            {offer.price.toLocaleString('ru-RU')} {offer.currency} · {offer.availability}
          </Text>
          <Text
            color="secondary"
            data-testid={testId('shops', 'checkout-modal', 'text', 'hint', offer.id)}
          >
            Подтвердите mock-переход на сайт партнёра для демонстрации сценария покупки.
          </Text>
        </div>
      )}
    </MockExternalFlowDialog>
  )
}
