/**
 * SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.4.2
 * SPEC-UI-1.3, SPEC-UI-2.2
 */

import {Text} from '@gravity-ui/uikit'
import type {Arena} from '@/entities/arena/types'
import {ExternalBookingButton} from '@/features/arenas/ExternalBookingButton'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'
import {IceCard} from '@/shared/ui/IceCard'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

const BOOKING_MODE_LABELS = {
  slot_calendar: 'Слоты',
  external_portal: 'Портал',
} as const

/** @spec SPEC-FR-6.2.1 - Props карточки катка */
export interface RinkCardProps {
  /** @spec SPEC-FR-6.2.1 */
  arena: Arena
  /** @spec SPEC-FR-6.2.2 */
  onOpenDetails?: (arenaId: string) => void
  /** @spec SPEC-UI-2.2 */
  hasFreeSlot?: boolean
  selected?: boolean
}

/**
 * @spec SPEC-UI-2.2 - Ледовая карточка катка с лампой доступности
 * @spec SPEC-FR-6.2.1 - Карточка катка
 */
export function RinkCard({
  arena,
  onOpenDetails,
  hasFreeSlot,
  selected = false,
}: RinkCardProps) {
  const showSlotLamp = arena.bookingMode === 'slot_calendar' && hasFreeSlot !== undefined

  return (
    <IceCard padding="m" className={selected ? 'rink-card--selected' : undefined}>
      <div className="hockey-stack hockey-stack--gap-10">
        <div className="hockey-row hockey-row--gap-8 hockey-row--between">
          <Text variant="subheader-2">{arena.name}</Text>
          <div className="hockey-row hockey-row--gap-8">
            <EntityProfileBadge kind="arena" />
            <span className={`rink-card__mode rink-card__mode--${arena.bookingMode}`}>
              {BOOKING_MODE_LABELS[arena.bookingMode]}
            </span>
          </div>
        </div>
        {showSlotLamp && (
          <span
            className={`rink-slot-lamp${hasFreeSlot ? '' : ' rink-slot-lamp--busy'}`}
            aria-label={hasFreeSlot ? 'Есть свободные слоты' : 'Слоты заняты'}
          >
            <span className="rink-slot-lamp__dot" aria-hidden />
            {hasFreeSlot ? 'Слот свободен' : 'Занято'}
          </span>
        )}
        <Text color="secondary">{arena.address}</Text>
        {arena.metro && (
          <Text color="secondary">
            м. {arena.metro} · {arena.district}
          </Text>
        )}
        {arena.phone && <Text color="secondary">{arena.phone}</Text>}
        {arena.priceRange && (
          <ScoreboardText tone="accent">{arena.priceRange}</ScoreboardText>
        )}
        <Text color="secondary">Удобства: {arena.amenities.join(', ')}</Text>
        <SourceMetaBadge sourceMeta={arena.sourceMeta} />

        <div className="hockey-row hockey-row--gap-8">
          {arena.bookingMode === 'external_portal' && (
            <ExternalBookingButton arena={arena} size="s" />
          )}
          {onOpenDetails && (
            <HockeyButton
              view={selected ? 'action' : 'outlined'}
              size="s"
              onClick={() => onOpenDetails(arena.id)}
            >
              {selected ? 'Открыто' : 'Открыть'}
            </HockeyButton>
          )}
        </div>
      </div>
    </IceCard>
  )
}
