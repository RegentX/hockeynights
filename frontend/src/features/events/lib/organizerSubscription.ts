/**
 * HOCFRONT-28 / TASK-05-09 — mock paid до 15.08, далее — planId.
 */

/** До этой даты публикация public_open доступна без реального эквайринга. */
export const MOCK_PAID_UNTIL_ISO = '2026-08-15T23:59:59+03:00'

export function isMockPaidPeriod(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(MOCK_PAID_UNTIL_ISO).getTime()
}

/** Активная подписка организатора или mock paid period. */
export function hasOrganizerPublishAccess(
  planId: string | undefined,
  now: Date = new Date(),
): boolean {
  if (isMockPaidPeriod(now)) return true
  return planId === 'player_plus' || planId === 'team_pro'
}
