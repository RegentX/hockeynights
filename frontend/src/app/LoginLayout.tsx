/**
 * SPEC-FR-2.1.1
 */

import type {ReactNode} from 'react'
import {testId} from '@/shared/testing/testId'

export interface LoginLayoutProps {
  children: ReactNode
}

/** @spec SPEC-FR-2.1.1 - Стартовый экран входа */
export function LoginLayout({children}: LoginLayoutProps) {
  return (
    <div className="login-layout" data-testid={testId('app', 'login-layout', 'page')}>
      {children}
    </div>
  )
}
