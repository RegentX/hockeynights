/**
 * HOCFRONT-28B — метаданные карточки события (дата, места, цена)
 */

import type {PlayerPosition} from '@/entities/common'
import type {GameEvent} from '@/entities/event'

const WEEKDAY_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'] as const

export function formatEventWeekdayDate(startsAt: string): string {
  const start = new Date(startsAt)
  const weekday = WEEKDAY_SHORT[start.getDay()] ?? ''
  const date = start.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'})
  return `${weekday}, ${date}`
}

export function formatEventDurationMinutes(startsAt: string, endsAt: string): number {
  const minutes = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000)
  return Math.max(minutes, 0)
}

export function formatEventPriceRub(pricePerPlayer: number | undefined): string {
  if (pricePerPlayer === undefined) return 'Цена не указана'
  if (pricePerPlayer <= 0) return 'Бесплатно'
  return `${pricePerPlayer.toLocaleString('ru-RU')} ₽`
}

export function countOpenSlots(event: GameEvent): {open: number; total: number} {
  const total = event.requiredSlots.reduce((acc, slot) => acc + slot.count, 0)
  const filled = event.requiredSlots.reduce((acc, slot) => acc + slot.filledCount, 0)
  return {open: Math.max(total - filled, 0), total}
}

export function countOpenSlotsForPosition(
  event: GameEvent,
  position: PlayerPosition | undefined,
): number | null {
  if (!position || position === 'any') return null
  const slot = event.requiredSlots.find((item) => item.position === position)
  if (!slot) return null
  return Math.max(slot.count - slot.filledCount, 0)
}

export function registrationStatusLabel(
  status: 'going' | 'maybe' | 'not_going' | undefined,
  registrationStatus: GameEvent['registrationStatus'],
): string {
  if (status === 'going') return 'Вы записаны'
  if (status === 'maybe') return 'В листе ожидания'
  if (registrationStatus === 'full') return 'Мест нет'
  return 'Можно записаться'
}
