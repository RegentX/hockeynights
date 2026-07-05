/**
 * Хелпер для построения уникальных data-testid.
 *
 * Формат: `{scope}-{component}-{element}[-{qualifier}]`
 *
 * Обязательно для каждой новой/изменённой UI-фичи (см. `.cursor/rules/frontend-data-testid.mdc`):
 * - корень страницы/модалки: `page` или `panel`
 * - интерактив: `btn`, `link`, `field`, `checkbox`, `select`
 * - состояния: `loader`, `empty`, `error`, `text`
 * - списки: `list` + `row`/`card` с id или index
 *
 * @example testId('auth', 'login', 'btn', 'submit') → 'auth-login-btn-submit'
 * @example testId('arenas', 'page', 'card', arenaId) → 'arenas-page-card-arena-001'
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
  return path.replace(/^\//, '').replace(/\//g, '-').replace(/:/g, '') || 'root'
}
