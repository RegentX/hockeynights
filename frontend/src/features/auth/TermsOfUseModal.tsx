/**
 * SPEC-FR-2.1.1
 * Модальное окно с условиями использования (как в мессенджерах при регистрации).
 */

import {Dialog} from '@gravity-ui/uikit'
import {TermsOfUseDocument} from '@/features/auth/TermsOfUseDocument'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {testId} from '@/shared/testing/testId'

export interface TermsOfUseModalProps {
  open: boolean
  onClose: () => void
  /** После прочтения — принять условия (регистрация) */
  onAccept?: () => void
}

export function TermsOfUseModal({open, onClose, onAccept}: TermsOfUseModalProps) {
  function handleAccept() {
    onAccept?.()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="l"
      className="terms-modal"
      data-testid={testId('auth', 'terms', 'modal')}
    >
      <Dialog.Header
        caption="Перед регистрацией ознакомьтесь с правилами"
        data-testid={testId('auth', 'terms', 'text', 'modal-caption')}
      />
      <Dialog.Body>
        <TermsOfUseDocument />
      </Dialog.Body>
      <Dialog.Footer data-testid={testId('auth', 'terms', 'panel', 'modal-footer')}>
        <HockeyButton
          view="flat"
          size="m"
          onClick={onClose}
          data-testid={testId('auth', 'terms', 'btn', 'close')}
        >
          Закрыть
        </HockeyButton>
        {onAccept && (
          <HockeyButton
            view="action"
            size="m"
            onClick={handleAccept}
            data-testid={testId('auth', 'terms', 'btn', 'accept')}
          >
            Принимаю условия
          </HockeyButton>
        )}
      </Dialog.Footer>
    </Dialog>
  )
}
