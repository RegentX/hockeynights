/**
 * TASK-05-02 — в основном списке только будущие события.
 */

/** True, если старт события ещё не прошёл (локальная полуночь текущего дня не важна — сравниваем с now). */
export function isUpcomingEvent(startsAt: string, now: Date = new Date()): boolean {
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return false
  return start.getTime() >= now.getTime()
}
