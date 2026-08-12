/** HOCFRONT-30 — единое представление личности пользователя в шапке и профиле. */

/**
 * Инициалы для аватара.
 * «Иван Петров» → «ИП»
 * «Петров Иван Сергеевич» (фамилия имя отчество) → «ПИ»
 */
export function getProfileInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '🏒'
  if (parts.length === 1) return parts[0][0]?.toLocaleUpperCase('ru-RU') ?? '🏒'
  // ФИО из 3+ частей: фамилия + имя; иначе первая и последняя части
  const secondIndex = parts.length >= 3 ? 1 : parts.length - 1
  const first = parts[0][0]?.toLocaleUpperCase('ru-RU') ?? ''
  const second = parts[secondIndex][0]?.toLocaleUpperCase('ru-RU') ?? ''
  return `${first}${second}` || '🏒'
}

/**
 * Короткая гео-строка профиля: только город.
 * HOCFRONT-22 — район и метро убраны с публичной страницы игрока и краткой карточки.
 */
export function formatProfileLocation({city}: {city?: string}): string {
  return city?.trim() ?? ''
}

/** Возраст в полных годах на указанную дату (по умолчанию — сегодня). */
export function getAgeYears(birthDate: string, now = new Date()): number | null {
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1
  return age >= 0 ? age : null
}

function pluralizeYears(age: number): string {
  const mod10 = age % 10
  const mod100 = age % 100
  if (mod100 >= 11 && mod100 <= 14) return 'лет'
  if (mod10 === 1) return 'год'
  if (mod10 >= 2 && mod10 <= 4) return 'года'
  return 'лет'
}

/** «44 года, 19 ноября 1981» */
export function formatBirthMeta(birthDate?: string, now = new Date()): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return ''
  const age = getAgeYears(birthDate, now)
  if (age == null) return ''
  const dateLabel = birth.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${age} ${pluralizeYears(age)}, ${dateLabel}`
}

export {
  clampPlayerIndex,
  getPlayerIndexLevel,
  getPlayerLevelLabel,
  PLAYER_INDEX_LEVELS,
  type PlayerIndex,
  playerIndexFromSkillLevel,
  type PlayerIndexSkillLevel,
  skillLevelFromPlayerIndex,
} from './playerIndexLevels'
