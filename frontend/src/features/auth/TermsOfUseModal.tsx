/**
 * SPEC-FR-2.1.1
 * Модальное окно с условиями использования (как в мессенджерах при регистрации).
 */

import {useState} from 'react'
import {Dialog, Icon} from '@gravity-ui/uikit'
import {ArrowsExpand, ChevronsCollapseFromLines} from '@gravity-ui/icons'
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
  const [expanded, setExpanded] = useState(false)

  function handleClose() {
    setExpanded(false)
    onClose()
  }

  function handleAccept() {
    onAccept?.()
    handleClose()
  }

  function toggleExpanded() {
    setExpanded((value) => !value)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      size="l"
      contentOverflow="auto"
      className={`terms-modal${expanded ? ' terms-modal--expanded' : ''}`}
      modalClassName={expanded ? 'terms-modal__overlay--expanded' : undefined}
      data-testid={testId('auth', 'terms', 'modal')}
    >
      <Dialog.Header
        caption="Перед регистрацией ознакомьтесь с правилами"
        insertAfter={
          <button
            type="button"
            className="terms-modal__expand-btn"
            onClick={toggleExpanded}
            aria-label={expanded ? 'Свернуть окно' : 'Открыть на весь экран'}
            aria-pressed={expanded}
            data-testid={testId('auth', 'terms', 'btn', expanded ? 'collapse' : 'expand')}
          >
            <Icon data={expanded ? ChevronsCollapseFromLines : ArrowsExpand} size={16} />
          </button>
        }
        data-testid={testId('auth', 'terms', 'text', 'modal-caption')}
      />
      <Dialog.Body>
        <div className="terms-modal__scroll" data-testid={testId('auth', 'terms', 'panel', 'scroll')}>
          <TermsOfUseDocument embedded />
        </div>
      </Dialog.Body>
      <Dialog.Footer data-testid={testId('auth', 'terms', 'panel', 'modal-footer')}>
        <HockeyButton
          view="flat"
          size="m"
          onClick={handleClose}
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
