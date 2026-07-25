/**
 * HOCFRONT-25 — локальные YYYY-MM-DDTHH:mm без Safari Date.parse pitfalls
 */

/** Разбирает `YYYY-MM-DDTHH:mm` на date / time для нативных пикеров */
export function splitDateTimeLocal(value: string): {date: string; time: string} {
  if (!value) return {date: '', time: ''}
  const [date = '', timePart = ''] = value.split('T')
  return {date, time: timePart.slice(0, 5)}
}

export function joinDateTimeLocal(date: string, time: string): string {
  if (!date || !time) return ''
  return `${date}T${time}`
}

function parseLocalParts(value: string): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) return null
  return {year, month, day, hour, minute}
}

/** Конвертация локального `YYYY-MM-DDTHH:mm` в ISO для API */
export function localDateTimeToIso(value: string): string {
  const parts = parseLocalParts(value)
  if (!parts) return ''
  const parsed = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}

export function addMinutesToLocalDateTime(value: string, minutes: number): string {
  const parts = parseLocalParts(value)
  if (!parts) return ''
  const parsed = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0)
  parsed.setMinutes(parsed.getMinutes() + minutes)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

export function defaultLocalDateTimePlusDays(days: number, hour = 19, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
