/**
 * HOCFRONT-28CAL-A/F — загрузка и фильтрация событий по scope/lens
 */

import {fetchClubCalendar} from '@/entities/club'
import type {AttendanceStatus, EventType} from '@/entities/common'
import type {GameEvent} from '@/entities/event'
import {fetchCalendar, fetchEvents} from '@/entities/event'
import {fetchTeamCalendarEvents} from '@/entities/team'
import {eventNeedsGoalie} from '@/features/events'

import {
  type CalendarUiState,
  endOfWeekSunday,
  localDateKey,
  parseDateKey,
  startOfWeekMonday,
} from './calendarState'

export async function loadCalendarEvents(state: CalendarUiState): Promise<GameEvent[]> {
  if (state.scope === 'team' && state.scopeId) {
    return fetchTeamCalendarEvents(state.scopeId)
  }
  if (state.scope === 'club' && state.scopeId) {
    return fetchClubCalendar(state.scopeId)
  }
  if (state.scope === 'player' && state.scopeId) {
    const events = await fetchEvents()
    return events.filter(
      (event) =>
        event.organizerUserId === state.scopeId ||
        event.participation.some(
          (entry) =>
            entry.userId === state.scopeId &&
            (entry.status === 'going' || entry.status === 'maybe'),
        ),
    )
  }

  return fetchCalendar({
    type: (state.type || undefined) as EventType | undefined,
    attendanceStatus: (state.status || undefined) as AttendanceStatus | undefined,
  })
}

export function filterCalendarEvents(
  events: GameEvent[],
  state: CalendarUiState,
  currentUserId: string,
): GameEvent[] {
  let next = events

  if (state.scope !== 'me' && state.type) {
    next = next.filter((event) => event.type === state.type)
  }

  if (state.scope !== 'me' && state.status) {
    next = next.filter((event) =>
      event.participation.some(
        (entry) => entry.userId === currentUserId && entry.status === state.status,
      ),
    )
  }

  if (state.mineOnly) {
    next = next.filter((event) =>
      event.participation.some(
        (entry) =>
          entry.userId === currentUserId && (entry.status === 'going' || entry.status === 'maybe'),
      ),
    )
  }

  if (state.needsGoalie || state.lens === 'goalie') {
    // goalie lens: open goalie slots OR already registered; needsGoalie chip is stricter
    if (state.needsGoalie) {
      next = next.filter((event) => eventNeedsGoalie(event))
    } else if (state.lens === 'goalie') {
      next = next.filter(
        (event) =>
          eventNeedsGoalie(event) ||
          event.participation.some(
            (entry) =>
              entry.userId === currentUserId &&
              (entry.status === 'going' || entry.status === 'maybe'),
          ),
      )
    }
  }

  if (state.lens === 'organizer') {
    next = next.filter((event) => event.organizerUserId === currentUserId)
  }

  if (state.lens === 'player' && state.scope === 'me' && !state.mineOnly && !state.needsGoalie) {
    // player lens default: keep catalog/calendar feed as-is (mine + upcoming from API)
  }

  if (state.range === 'today') {
    const today = localDateKey()
    next = next.filter((event) => localDateKey(new Date(event.startsAt)) === today)
  }

  if (state.range === 'week') {
    const anchor = parseDateKey(state.date) ?? new Date()
    const start = startOfWeekMonday(anchor)
    const end = endOfWeekSunday(anchor)
    end.setHours(23, 59, 59, 999)
    next = next.filter((event) => {
      const at = new Date(event.startsAt).getTime()
      return at >= start.getTime() && at <= end.getTime()
    })
  }

  return next.slice().sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export function eventFillRatio(event: GameEvent): number {
  const requiredTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  const filledTotal = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  return requiredTotal > 0 ? filledTotal / requiredTotal : 0
}
