/** HOCFRONT-5 — дефолтные демо-учётные данные Phase 1 */
export const DEMO_EMAIL = 'demo@hockey.local'
export const DEMO_PASSWORD = 'demo123'

export const DEMO_CREDENTIALS_HINT = `Для демо используйте ${DEMO_EMAIL} / ${DEMO_PASSWORD}`

export function isDemoCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
}
