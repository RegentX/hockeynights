/**
 * HOCFRONT-28F / ORG-2 — статусы и метрики кабинета организатора
 */

import type {GameEvent} from '@/entities/event'
import {POSITION_LABELS} from '@/features/events/lib/eventLabels'
import {isUpcomingEvent} from '@/features/events/lib/isUpcomingEvent'

/** Бакеты фильтров списка «мои тренировки» */
export type OrganizerEventStatus = 'draft' | 'open' | 'full' | 'past' | 'cancelled'

export type OrganizerEventFilter = 'all' | OrganizerEventStatus

export const ORGANIZER_STATUS_LABELS: Record<OrganizerEventStatus, string> = {
  draft: 'Черновик',
  open: 'Набор',
  full: 'Заполнена',
  past: 'Прошедшая',
  cancelled: 'Отменена',
}

export const ORGANIZER_FILTER_LABELS: Record<OrganizerEventFilter, string> = {
  all: 'Все',
  draft: 'Черновики',
  open: 'Набор',
  full: 'Заполнены',
  past: 'Прошедшие',
  cancelled: 'Отменены',
}

export const ORGANIZER_FILTERS: OrganizerEventFilter[] = [
  'all',
  'draft',
  'open',
  'full',
  'past',
  'cancelled',
]

/** Черновики и отменённые не попадают в каталог игрока. */
export function isPlayerCatalogEvent(event: GameEvent): boolean {
  const life = event.lifecycleStatus ?? 'published'
  return life === 'published'
}

export function resolveOrganizerEventStatus(
  event: GameEvent,
  now: Date = new Date(),
): OrganizerEventStatus {
  if (event.lifecycleStatus === 'cancelled') return 'cancelled'
  if (event.lifecycleStatus === 'draft') return 'draft'
  if (!isUpcomingEvent(event.startsAt, now)) return 'past'
  if (event.registrationStatus === 'full') return 'full'
  return 'open'
}

export function eventFillPercent(event: GameEvent): number {
  const total = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  if (total <= 0) return 100
  const filled = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  return Math.min(100, Math.round((filled / total) * 100))
}

export function eventDeficitSummary(event: GameEvent): string {
  const deficits = event.requiredSlots
    .map((slot) => {
      const open = Math.max(slot.count - slot.filledCount, 0)
      if (open <= 0) return null
      return `${POSITION_LABELS[slot.position]} −${open}`
    })
    .filter(Boolean)
  if (deficits.length === 0) return 'Состав полный'
  return `Нужны: ${deficits.join(', ')}`
}

export function filterOrganizerEvents(
  events: GameEvent[],
  filter: OrganizerEventFilter,
  now: Date = new Date(),
): GameEvent[] {
  if (filter === 'all') return events
  return events.filter((event) => resolveOrganizerEventStatus(event, now) === filter)
}

/** Ближайшие сверху, прошедшие внизу; внутри группы — по startsAt ↑. */
export function sortOrganizerEvents(events: GameEvent[], now: Date = new Date()): GameEvent[] {
  return events.slice().sort((a, b) => {
    const aUp = isUpcomingEvent(a.startsAt, now) ? 0 : 1
    const bUp = isUpcomingEvent(b.startsAt, now) ? 0 : 1
    if (aUp !== bUp) return aUp - bUp
    return a.startsAt.localeCompare(b.startsAt)
  })
}

export function countOrganizerStatuses(
  events: GameEvent[],
  now: Date = new Date(),
): Record<OrganizerEventStatus, number> {
  const counts: Record<OrganizerEventStatus, number> = {
    draft: 0,
    open: 0,
    full: 0,
    past: 0,
    cancelled: 0,
  }
  for (const event of events) {
    counts[resolveOrganizerEventStatus(event, now)] += 1
  }
  return counts
}

export interface OrganizerRegistrationRow {
  id: string
  eventId: string
  eventTitle: string
  userId: string
  displayName: string
  status: 'going' | 'maybe' | 'not_going'
  updatedAt: string
}

/** Записи участников по событиям организатора (mock inbox). */
export function collectOrganizerRegistrations(events: GameEvent[]): OrganizerRegistrationRow[] {
  const rows: OrganizerRegistrationRow[] = []
  for (const event of events) {
    for (const entry of event.participation) {
      if (entry.status === 'not_going') continue
      rows.push({
        id: `${event.id}:${entry.userId}`,
        eventId: event.id,
        eventTitle: event.title,
        userId: entry.userId,
        displayName: entry.displayName ?? entry.userId,
        status: entry.status,
        updatedAt: entry.updatedAt,
      })
    }
  }
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
