/**
 * SPEC-FR-2.1.1
 */

import type {ReactNode} from 'react'

export interface LoginLayoutProps {
  children: ReactNode
}

/** @spec SPEC-FR-2.1.1 - Стартовый экран входа */
export function LoginLayout({children}: LoginLayoutProps) {
  return <div className="login-layout">{children}</div>
}
