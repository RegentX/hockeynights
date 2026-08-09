/** HOCFRONT-30 — единое представление личности пользователя в шапке и профиле. */

/** Инициалы для аватара: «Иван Петров» → «ИП». */
export function getProfileInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  return parts || '🏒'
}

/**
 * Короткая гео-строка профиля: только город.
 * HOCFRONT-22 — район и метро убраны с публичной страницы игрока и краткой карточки.
 */
export function formatProfileLocation({city}: {city?: string}): string {
  return city?.trim() ?? ''
}
