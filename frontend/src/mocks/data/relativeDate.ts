/**
 * SPEC-FR-4.1.1 — даты сидов относительно «сегодня».
 *
 * Фиксированные ISO-строки в моках протухают: событие уезжает в прошлое,
 * выпадает из каталога предстоящих и роняет тесты каталога, радара и smoke.
 * Считаем даты от текущего момента, сохраняя расстановку сидов.
 */

const HOUR_MS = 60 * 60 * 1000

/** `+03:00` → смещение в миллисекундах. */
function parseUtcOffset(utcOffset: string): number {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(utcOffset)
  if (!match) throw new Error(`Некорректное смещение зоны: ${utcOffset}`)
  const [, sign, hours, minutes] = match
  const magnitude = Number(hours) * HOUR_MS + Number(minutes) * 60 * 1000
  return sign === '-' ? -magnitude : magnitude
}

/**
 * Дата в календаре указанной зоны, сдвинутая на `dayOffset` дней, со временем `time`.
 * Результат не зависит от таймзоны машины, на которой считается.
 *
 * @example relativeDate(4, '16:00') // послезавтра+2 в 16:00 по Москве
 * @example relativeDate(8, '20:00', '+05:00') // через 8 дней в 20:00 по Екатеринбургу
 */
export function relativeDate(dayOffset: number, time: string, utcOffset = '+03:00'): string {
  const zoneNow = new Date(Date.now() + parseUtcOffset(utcOffset))
  const day = new Date(
    Date.UTC(zoneNow.getUTCFullYear(), zoneNow.getUTCMonth(), zoneNow.getUTCDate() + dayOffset),
  )
  const month = String(day.getUTCMonth() + 1).padStart(2, '0')
  const date = String(day.getUTCDate()).padStart(2, '0')
  return `${day.getUTCFullYear()}-${month}-${date}T${time}:00${utcOffset}`
}

/**
 * Ближайший будущий день недели (0 — воскресенье, 6 — суббота) со временем `time`.
 * Нужен сидам, у которых день недели — часть смысла (лиговая суббота).
 * Всегда возвращает дату на 1–7 дней вперёд, никогда сегодняшнюю.
 */
export function nextWeekday(weekday: number, time: string, utcOffset = '+03:00'): string {
  const zoneNow = new Date(Date.now() + parseUtcOffset(utcOffset))
  const daysAhead = (weekday - zoneNow.getUTCDay() + 7) % 7 || 7
  return relativeDate(daysAhead, time, utcOffset)
}
