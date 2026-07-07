/**
 * SPEC-FR-6.3.1, SPEC-FR-6.3.2, SPEC-FR-6.4.2
 * SPEC-UI-2.2
 */

import {Text} from '@gravity-ui/uikit'
import {useMemo, useState} from 'react'

import type {Arena} from '@/entities/arena'
import type {IceSlot} from '@/entities/arena'
import {ExternalBookingButton} from '@/features/arenas/ui/ExternalBookingButton'
import {testId} from '@/shared/testing/testId'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/** @spec SPEC-FR-6.3.1 */
export interface SlotCalendarProps {
  slots: IceSlot[]
  arena: Arena
}

function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function timeRange(slot: IceSlot): string {
  const start = new Date(slot.startsAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const end = new Date(slot.endsAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${start}–${end}`
}

/**
 * @spec SPEC-FR-6.3.1 - Календарь временных слотов
 * @spec SPEC-FR-6.4.2 - Бронирование выбранного слота
 */
export function SlotCalendar({slots, arena}: SlotCalendarProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, IceSlot[]>()
    for (const slot of slots) {
      const key = dayKey(slot.startsAt)
      const list = map.get(key) ?? []
      list.push(slot)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [slots])

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null

  if (slots.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('arenas', 'slot-calendar', 'empty', arena.id)}>
        Свободные слоты не опубликованы.
      </Text>
    )
  }

  return (
    <div
      className="slot-calendar"
      data-testid={testId('arenas', 'slot-calendar', 'calendar', arena.id)}
    >
      {grouped.map(([day, daySlots]) => (
        <section
          key={day}
          className="slot-calendar__day"
          data-testid={testId('arenas', 'slot-calendar', 'panel', day)}
        >
          <div
            className="slot-calendar__day-label"
            data-testid={testId('arenas', 'slot-calendar', 'text', 'day', day)}
          >
            {day}
          </div>
          <div
            className="slot-calendar__grid"
            data-testid={testId('arenas', 'slot-calendar', 'list', day)}
          >
            {daySlots.map((slot) => {
              const selected = slot.id === selectedSlotId
              const disabled = slot.status !== 'free'
              return (
                <button
                  key={slot.id}
                  type="button"
                  className={[
                    'slot-calendar__chip',
                    selected ? 'slot-calendar__chip--selected' : '',
                    disabled ? 'slot-calendar__chip--busy' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => !disabled && setSelectedSlotId(slot.id)}
                  disabled={disabled}
                  aria-pressed={selected}
                  data-testid={testId('arenas', 'slot-calendar', 'slot', slot.id)}
                >
                  <ScoreboardText
                    data-testid={testId('arenas', 'slot-calendar', 'text', 'time', slot.id)}
                  >
                    {timeRange(slot)}
                  </ScoreboardText>
                  <span
                    className="slot-calendar__chip-status"
                    data-testid={testId('arenas', 'slot-calendar', 'text', 'status', slot.id)}
                  >
                    {slot.status === 'free' ? 'Свободно' : 'Занято'}
                  </span>
                  {slot.price && (
                    <span
                      className="slot-calendar__chip-price"
                      data-testid={testId('arenas', 'slot-calendar', 'text', 'price', slot.id)}
                    >
                      {slot.price} ₽
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {selectedSlot && selectedSlot.status === 'free' && (
        <div
          className="slot-calendar__booking"
          data-testid={testId('arenas', 'slot-calendar', 'panel', 'booking', arena.id)}
        >
          <Text
            data-testid={testId('arenas', 'slot-calendar', 'text', 'selected', selectedSlot.id)}
          >
            Выбран слот: {new Date(selectedSlot.startsAt).toLocaleString('ru-RU')}
            {selectedSlot.price ? ` · ${selectedSlot.price} RUB` : ''}
          </Text>
          <div data-testid={testId('arenas', 'slot-calendar', 'badge', 'source', selectedSlot.id)}>
            <SourceMetaBadge sourceMeta={selectedSlot.sourceMeta} />
          </div>
          <ExternalBookingButton arena={arena} slot={selectedSlot} label="Забронировать слот" />
        </div>
      )}
    </div>
  )
}
