import {canUseLocalStorage} from '@/shared/lib/canUseLocalStorage'

/** Безопасная очистка localStorage в тестах (jsdom, Node 26 + vitest). */
export function clearTestStorage(): void {
  if (!canUseLocalStorage()) return
  window.localStorage.clear()
}
