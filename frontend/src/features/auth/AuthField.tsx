/**
 * Поле auth-формы: подпись сверху + единый отступ ввода.
 */

import {PasswordInput, TextInput} from '@gravity-ui/uikit'
import {testId} from '@/shared/testing/testId'

export interface AuthFieldProps {
  label: string
  fieldId: string
  value: string
  onUpdate: (value: string) => void
  type?: 'text' | 'email' | 'password'
  autoComplete?: string
  placeholder?: string
  testIdQualifier: string
  testIdScope?: 'login' | 'register'
}

export function AuthField({
  label,
  fieldId,
  value,
  onUpdate,
  type = 'text',
  autoComplete,
  placeholder,
  testIdQualifier,
  testIdScope = 'login',
}: AuthFieldProps) {
  return (
    <div className="auth-form-field">
      <label className="auth-form-field__label" htmlFor={fieldId}>
        {label}
      </label>
      {type === 'password' ? (
        <PasswordInput
          id={fieldId}
          size="l"
          value={value}
          onUpdate={onUpdate}
          autoComplete={autoComplete}
          placeholder={placeholder}
          hideCopyButton
          data-testid={testId('auth', testIdScope, 'field', testIdQualifier)}
        />
      ) : (
        <TextInput
          id={fieldId}
          size="l"
          type={type}
          value={value}
          onUpdate={onUpdate}
          autoComplete={autoComplete}
          placeholder={placeholder}
          data-testid={testId('auth', testIdScope, 'field', testIdQualifier)}
        />
      )}
    </div>
  )
}
