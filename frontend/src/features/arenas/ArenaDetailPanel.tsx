/**
 * SPEC-FR-6.1.1, SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1
 * SPEC-UI-2.2
 */

import {Button, Text} from '@gravity-ui/uikit'
import type {Arena} from '@/entities/arena/types'
import type {IceSlot} from '@/entities/arena/types'
import {ArenaBookingPanel} from '@/features/arenas/ArenaBookingPanel'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {testId} from '@/shared/testing/testId'

const MODE_LABELS = {
  slot_calendar: 'Слоты по времени',
  external_portal: 'Портал записи',
} as const

/** @spec SPEC-FR-6.2.1 */
export interface ArenaDetailPanelProps {
  arena: Arena
  slots: IceSlot[]
  hasFreeSlot?: boolean
  /** @spec SPEC-FR-6.2.1 - Закрыть деталь (без сброса фильтров) */
  onClose?: () => void
}

/**
 * @spec SPEC-FR-6.2.1 - Детальная панель выбранной арены
 */
export function ArenaDetailPanel({arena, slots, hasFreeSlot, onClose}: ArenaDetailPanelProps) {
  const freeCount = slots.filter((s) => s.status === 'free').length

  return (
    <div data-testid={testId('arenas', 'detail', 'panel', arena.id)}>
      <IceCard padding="m" className="arena-detail">
        <div className="arena-detail__head hockey-row hockey-row--between">
          <div>
            <Text variant="header-2" data-testid={testId('arenas', 'detail', 'text', 'name', arena.id)}>
              {arena.name}
            </Text>
            <Text color="secondary" data-testid={testId('arenas', 'detail', 'text', 'address', arena.id)}>
              {arena.address}
            </Text>
          </div>
          <div
            className="hockey-row hockey-row--gap-8"
            data-testid={testId('arenas', 'detail', 'badge', 'profile', arena.id)}
          >
            {onClose && (
              <Button
                view="flat"
                size="m"
                onClick={onClose}
                aria-label="Закрыть детали"
                data-testid={testId('arenas', 'detail', 'btn', 'close')}
              >
                ×
              </Button>
            )}
            <EntityProfileBadge kind="arena" />
          </div>
        </div>

        <div className="arena-detail__meta" data-testid={testId('arenas', 'detail', 'panel', 'meta', arena.id)}>
          <div className="hockey-row hockey-row--gap-8 hockey-mb-8">
            <span
              className={`arena-detail__mode arena-detail__mode--${arena.bookingMode}`}
              data-testid={testId('arenas', 'detail', 'badge', 'mode', arena.id)}
            >
              {MODE_LABELS[arena.bookingMode]}
            </span>
          </div>
          {arena.metro && (
            <Text color="secondary" data-testid={testId('arenas', 'detail', 'text', 'metro', arena.id)}>
              м. {arena.metro} · {arena.district}
            </Text>
          )}
          {arena.priceRange && (
            <ScoreboardText tone="accent" data-testid={testId('arenas', 'detail', 'text', 'price', arena.id)}>
              {arena.priceRange}
            </ScoreboardText>
          )}
          <Text color="secondary" data-testid={testId('arenas', 'detail', 'text', 'amenities', arena.id)}>
            Удобства: {arena.amenities.join(', ')}
          </Text>
          <div data-testid={testId('arenas', 'detail', 'badge', 'source', arena.id)}>
            <SourceMetaBadge sourceMeta={arena.sourceMeta} />
          </div>
          {arena.bookingMode === 'slot_calendar' && (
            <Text color="secondary" data-testid={testId('arenas', 'detail', 'text', 'free-slots', arena.id)}>
              Свободных слотов: {freeCount}
              {hasFreeSlot === false ? ' · сейчас всё занято' : ''}
            </Text>
          )}
        </div>

        <ArenaBookingPanel arena={arena} slots={slots} />
      </IceCard>
    </div>
  )
}
