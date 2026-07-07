/**
 * SPEC-FR-2.1.1
 * Чекбокс принятия условий — компактная однострочная разметка.
 */

import {Checkbox} from '@gravity-ui/uikit'
import {Link} from 'react-router-dom'

import {testId} from '@/shared/testing/testId'

export interface TermsAcceptanceFieldProps {
  checked: boolean
  onUpdate: (checked: boolean) => void
}

export function TermsAcceptanceField({checked, onUpdate}: TermsAcceptanceFieldProps) {
  return (
    <div className="auth-terms-field" data-testid={testId('auth', 'register', 'panel', 'terms')}>
      <Checkbox
        className="auth-terms-field__checkbox"
        checked={checked}
        onUpdate={onUpdate}
        content={
          <span className="auth-terms-field__label">
            Я принимаю{' '}
            <Link
              to="/terms"
              className="auth-terms-field__link"
              data-testid={testId('auth', 'register', 'link', 'terms')}
            >
              условия использования
            </Link>
          </span>
        }
        data-testid={testId('auth', 'register', 'checkbox', 'terms')}
      />
    </div>
  )
}
