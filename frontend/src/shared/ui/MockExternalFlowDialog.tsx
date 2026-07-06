/**
 * SPEC-FR-6.4.1, SPEC-NFR-8
 */

import {Button, Dialog, Text} from '@gravity-ui/uikit'
import type {ReactNode} from 'react'

import type {MockExternalFlowType} from '@/entities/external-flow'
import {testId} from '@/shared/testing/testId'

const FLOW_LABELS: Record<MockExternalFlowType, string> = {
  ice_booking: 'Запись на лёд',
  shop_checkout: 'Покупка экипировки',
  shop_portal: 'Сайт магазина',
  league_portal: 'Сайт лиги',
}

/** @spec SPEC-FR-6.4.1 - Props mock-диалога внешнего сценария */
export interface MockExternalFlowDialogProps {
  /** @spec SPEC-FR-6.4.1 */
  open: boolean
  /** @spec SPEC-FR-6.4.1 */
  onClose: () => void
  /** @spec SPEC-FR-6.4.1 */
  flowType: MockExternalFlowType
  /** @spec SPEC-FR-6.4.1 */
  partnerName: string
  /** @spec SPEC-FR-6.4.1 */
  externalUrl?: string
  /** @spec SPEC-FR-6.4.1 */
  children: ReactNode
  /** @spec SPEC-FR-6.4.1 */
  footer?: ReactNode
  testIdPrefix?: string
}

/**
 * @spec SPEC-FR-6.4.1 - Оболочка mock-интерфейса внешнего партнёра
 * @spec SPEC-NFR-8 - Пояснение Phase 1 vs реальный портал
 */
export function MockExternalFlowDialog({
  open,
  onClose,
  flowType,
  partnerName,
  externalUrl,
  children,
  footer,
  testIdPrefix = 'shared',
}: MockExternalFlowDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="m"
      data-testid={testId(testIdPrefix, 'mock-external-flow-dialog', 'modal')}
    >
      <Dialog.Header
        caption={`Phase 1 mock · ${FLOW_LABELS[flowType]}`}
        data-testid={testId(testIdPrefix, 'mock-external-flow-dialog', 'header')}
      />
      <Dialog.Body>
        <div className="hockey-stack hockey-stack--gap-12">
          <Text
            variant="subheader-2"
            data-testid={testId(testIdPrefix, 'mock-external-flow-dialog', 'text', 'partner-name')}
          >
            {partnerName}
          </Text>
          <Text
            color="secondary"
            data-testid={testId(testIdPrefix, 'mock-external-flow-dialog', 'text', 'description')}
          >
            Это демо-интерфейс партнёрского сценария. В Phase 2 кнопка откроет реальный портал или
            partner API. Сейчас действие симулируется внутри приложения.
          </Text>
          {externalUrl && (
            <Text
              color="secondary"
              variant="caption-2"
              data-testid={testId(
                testIdPrefix,
                'mock-external-flow-dialog',
                'text',
                'external-url',
              )}
            >
              Целевой URL Phase 2: {externalUrl}
            </Text>
          )}
          <div data-testid={testId(testIdPrefix, 'mock-external-flow-dialog', 'panel', 'content')}>
            {children}
          </div>
        </div>
      </Dialog.Body>
      <Dialog.Footer data-testid={testId(testIdPrefix, 'mock-external-flow-dialog', 'footer')}>
        {footer ?? (
          <Button
            view="flat"
            onClick={onClose}
            data-testid={testId(testIdPrefix, 'mock-external-flow-dialog', 'btn', 'close')}
          >
            Закрыть
          </Button>
        )}
      </Dialog.Footer>
    </Dialog>
  )
}
