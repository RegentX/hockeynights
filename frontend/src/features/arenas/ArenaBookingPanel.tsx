/**
 * SPEC-FR-6.2.2, SPEC-FR-6.3.1, SPEC-FR-6.4.2
 */

import {Text} from '@gravity-ui/uikit'

import type {Arena} from '@/entities/arena/types'
import type {IceSlot} from '@/entities/arena/types'
import {ExternalBookingButton} from '@/features/arenas/ExternalBookingButton'
import {SlotCalendar} from '@/features/arenas/SlotCalendar'
import {testId} from '@/shared/testing/testId'

/** @spec SPEC-FR-6.2.2 */
export interface ArenaBookingPanelProps {
  arena: Arena
  slots: IceSlot[]
}

/**
 * @spec SPEC-FR-6.2.2 - Разные механизмы записи по типу площадки
 */
export function ArenaBookingPanel({arena, slots}: ArenaBookingPanelProps) {
  if (arena.bookingMode === 'slot_calendar') {
    return (
      <div
        className="arena-booking arena-booking--slots"
        data-testid={testId('arenas', 'booking', 'panel', 'slots', arena.id)}
      >
        <div className="arena-booking__head">
          <Text
            variant="subheader-2"
            data-testid={testId('arenas', 'booking', 'text', 'title', arena.id)}
          >
            Запись по слотам
          </Text>
          <Text
            color="secondary"
            data-testid={testId('arenas', 'booking', 'text', 'subtitle', arena.id)}
          >
            Выбери свободное время — заявка уйдёт в mock-мастер с привязкой к слоту.
          </Text>
        </div>
        <SlotCalendar slots={slots} arena={arena} />
      </div>
    )
  }

  return (
    <div
      className="arena-booking arena-booking--portal"
      data-testid={testId('arenas', 'booking', 'panel', 'portal', arena.id)}
    >
      <div className="arena-booking__head">
        <Text
          variant="subheader-2"
          data-testid={testId('arenas', 'booking', 'text', 'title', arena.id)}
        >
          Запись через портал
        </Text>
        <Text
          color="secondary"
          data-testid={testId('arenas', 'booking', 'text', 'subtitle', arena.id)}
        >
          У этой площадки нет публичного календаря слотов — отправь общую заявку или перейди на
          внешний портал в Phase 2.
        </Text>
      </div>
      {arena.phone && (
        <Text data-testid={testId('arenas', 'booking', 'text', 'phone', arena.id)}>
          Телефон: <strong>{arena.phone}</strong>
        </Text>
      )}
      <ExternalBookingButton arena={arena} label="Оставить заявку на лёд" />
    </div>
  )
}
