/**
 * Хелпер для построения уникальных data-testid.
 *
 * Формат: {scope}-{component}-{element}[-{qualifier}]
 *
 * @example testId('auth', 'login', 'btn', 'player') → 'auth-login-btn-player'
 * @example testId('leagues', 'standings', 'row', teamId) → 'leagues-standings-row-team-42'
 */
export function testId(...parts: (string | number | boolean | undefined | null)[]): string {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map((part) =>
      String(part)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .join('-')
}

/** Преобразует путь роута в slug для nav-link testid: `/players` → `players` */
export function routeToTestSlug(path: string): string {
  return path
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/:/g, '')
    || 'root'
}
