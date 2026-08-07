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

/** Короткая гео-строка профиля: «Москва · САО · м. Динамо». */
export function formatProfileLocation({
  city,
  district,
  metro,
}: {
  city?: string
  district?: string
  metro?: string
}): string {
  return [city, district, metro ? `м. ${metro}` : '']
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' · ')
}
