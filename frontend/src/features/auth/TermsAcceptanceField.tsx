/**
 * SPEC-FR-2.1.1
 * Чекбокс принятия условий — компактная однострочная разметка.
 */

import {useState, type MouseEvent} from 'react'
import {Checkbox} from '@gravity-ui/uikit'
import {Link} from 'react-router-dom'
import {TermsOfUseModal} from '@/features/auth/TermsOfUseModal'
import {testId} from '@/shared/testing/testId'

export interface TermsAcceptanceFieldProps {
  checked: boolean
  onUpdate: (checked: boolean) => void
}

export function TermsAcceptanceField({checked, onUpdate}: TermsAcceptanceFieldProps) {
  const [modalOpen, setModalOpen] = useState(false)

  function openTermsModal(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setModalOpen(true)
  }

  return (
    <div className="auth-terms-field" data-testid={testId('auth', 'register', 'panel', 'terms')}>
      <Checkbox
        className="auth-terms-field__checkbox"
        checked={checked}
        onUpdate={onUpdate}
        content={
          <span className="auth-terms-field__label">
            Я принимаю{' '}
            <button
              type="button"
              className="auth-terms-field__link"
              onClick={openTermsModal}
              data-testid={testId('auth', 'register', 'btn', 'open-terms')}
            >
              условия использования
            </button>
            <span className="auth-terms-field__sep" aria-hidden>
              ·
            </span>
            <Link
              to="/terms"
              className="auth-terms-field__link auth-terms-field__link--secondary"
              data-testid={testId('auth', 'register', 'link', 'read-terms-page')}
            >
              на странице
            </Link>
          </span>
        }
        data-testid={testId('auth', 'register', 'checkbox', 'terms')}
      />

      <TermsOfUseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAccept={() => onUpdate(true)}
      />
    </div>
  )
}
