/**
 * SPEC-FR-6.1.1, SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.3.1
 * SPEC-UI-2.2
 */

import {Text} from '@gravity-ui/uikit'
import type {Arena} from '@/entities/arena/types'
import type {IceSlot} from '@/entities/arena/types'
import {ArenaBookingPanel} from '@/features/arenas/ArenaBookingPanel'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'

const MODE_LABELS = {
  slot_calendar: 'Слоты по времени',
  external_portal: 'Портал записи',
} as const

/** @spec SPEC-FR-6.2.1 */
export interface ArenaDetailPanelProps {
  arena: Arena
  slots: IceSlot[]
  hasFreeSlot?: boolean
}

/**
 * @spec SPEC-FR-6.2.1 - Детальная панель выбранной арены
 */
export function ArenaDetailPanel({arena, slots, hasFreeSlot}: ArenaDetailPanelProps) {
  const freeCount = slots.filter((s) => s.status === 'free').length

  return (
    <IceCard padding="m" className="arena-detail">
      <div className="arena-detail__head hockey-row hockey-row--between">
        <div>
          <Text variant="header-2">{arena.name}</Text>
          <Text color="secondary">{arena.address}</Text>
        </div>
        <EntityProfileBadge kind="arena" />
      </div>

      <div className="arena-detail__meta">
        <div className="hockey-row hockey-row--gap-8 hockey-mb-8">
          <span className={`arena-detail__mode arena-detail__mode--${arena.bookingMode}`}>
            {MODE_LABELS[arena.bookingMode]}
          </span>
        </div>
        {arena.metro && (
          <Text color="secondary">
            м. {arena.metro} · {arena.district}
          </Text>
        )}
        {arena.priceRange && <ScoreboardText tone="accent">{arena.priceRange}</ScoreboardText>}
        <Text color="secondary">Удобства: {arena.amenities.join(', ')}</Text>
        <SourceMetaBadge sourceMeta={arena.sourceMeta} />
        {arena.bookingMode === 'slot_calendar' && (
          <Text color="secondary">
            Свободных слотов: {freeCount}
            {hasFreeSlot === false ? ' · сейчас всё занято' : ''}
          </Text>
        )}
      </div>

      <ArenaBookingPanel arena={arena} slots={slots} />
    </IceCard>
  )
}
