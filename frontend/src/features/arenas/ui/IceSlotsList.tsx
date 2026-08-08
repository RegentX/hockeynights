/**
 * SPEC-FR-6.3.1, SPEC-FR-6.3.2, SPEC-FR-6.4.2
 */

import {Text} from '@gravity-ui/uikit'

import type {Arena} from '@/entities/arena'
import type {IceSlot} from '@/entities/arena'
import {ExternalBookingButton} from '@/features/arenas/ui/ExternalBookingButton'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/** @spec SPEC-FR-6.3.1 - Props списка слотов */
export interface IceSlotsListProps {
  /** @spec SPEC-FR-6.3.1 */
  slots: IceSlot[]
  /** @spec SPEC-FR-6.4.2 */
  arena: Arena
}

/**
 * @spec SPEC-FR-6.3.1 - Mock-слоты льда
 * @spec SPEC-FR-6.4.2 - Mock-бронирование слота
 */
export function IceSlotsList({slots, arena}: IceSlotsListProps) {
  if (slots.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('arenas', 'slots', 'empty', arena.id)}>
        Слоты не найдены.
      </Text>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-8"
      data-testid={testId('arenas', 'slots', 'list', arena.id)}
    >
      {slots.map((slot) => (
        <IceCard key={slot.id} padding="s" data-testid={testId('arenas', 'slots', 'card', slot.id)}>
          <div className="hockey-stack hockey-stack--gap-6">
            <Text data-testid={testId('arenas', 'slots', 'text', 'time', slot.id)}>
              {new Date(slot.startsAt).toLocaleString('ru-RU')} —{' '}
              {new Date(slot.endsAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Text
              color="secondary"
              data-testid={testId('arenas', 'slots', 'text', 'status', slot.id)}
            >
              Статус: {slot.status}
              {slot.price ? ` · ${slot.price} RUB` : ''}
            </Text>
            <div data-testid={testId('arenas', 'slots', 'badge', 'source', slot.id)}>
              <SourceMetaBadge sourceMeta={slot.sourceMeta} />
            </div>
            {slot.status === 'free' && (
              <ExternalBookingButton
                arena={arena}
                slot={slot}
                label="Забронировать слот"
                size="s"
              />
            )}
          </div>
        </IceCard>
      ))}
    </div>
  )
}
