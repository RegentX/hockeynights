/**
 * SPEC-FR-2.1.1, SPEC-FR-2.1.2, SPEC-FR-1.3.1, SPEC-FR-1.3.6
 * HOCFRONT-5 — страница mock-входа.
 */

import {useQuery} from '@tanstack/react-query'
import {fetchSession} from '@/features/auth/api/sessionApi'
import {LoginModal} from '@/features/auth/LoginModal'

/**
 * @spec SPEC-FR-2.1.1 - Mock-вход без реальной авторизации
 * @spec SPEC-FR-2.1.2 - Выбор ролей через карточки персон
 */
export function MockLoginPage() {
  const {data: session} = useQuery({queryKey: ['session'], queryFn: fetchSession})

  return <LoginModal isSwitching={Boolean(session?.isOnboarded)} />
}
