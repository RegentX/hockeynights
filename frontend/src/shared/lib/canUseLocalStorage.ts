/** Безопасная проверка доступности localStorage (SSR, Node 26+ vitest). */
export function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage != null
  } catch {
    return false
  }
}
