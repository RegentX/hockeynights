/** Безопасная проверка доступности localStorage (SSR, jsdom, Node 26 + vitest). */
export function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}
