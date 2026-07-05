/**
 * SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.4.2
 * SPEC-UI-1.3, SPEC-UI-2.2
 */

import {Text} from '@gravity-ui/uikit'
import {forwardRef} from 'react'

import type {Arena} from '@/entities/arena/types'
import {ExternalBookingButton} from '@/features/arenas/ExternalBookingButton'
import {testId} from '@/shared/testing/testId'
import {EntityProfileBadge} from '@/shared/ui/EntityProfileBadge'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

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
  /** @spec SPEC-FR-6.2.2 - Активная карточка (синхронизирована с картой) */
  selected?: boolean
}

function formatFreshness(updatedAt: string): string {
  const updated = new Date(updatedAt)
  if (Number.isNaN(updated.getTime())) return ''
  return updated.toLocaleDateString('ru-RU', {day: '2-digit', month: 'short'})
}

/**
 * @spec SPEC-UI-2.2 - Ледовая карточка катка с лампой доступности
 * @spec SPEC-FR-6.2.1 - Карточка катка
 * @spec SPEC-FR-6.2.2 - Кликабельная карточка, открывающая детали
 */
export const RinkCard = forwardRef<HTMLDivElement, RinkCardProps>(function RinkCard(
  {arena, onOpenDetails, hasFreeSlot, selected = false},
  ref,
) {
  const showSlotLamp = arena.bookingMode === 'slot_calendar' && hasFreeSlot !== undefined
  const handleSelect = onOpenDetails ? () => onOpenDetails(arena.id) : undefined
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!handleSelect) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }
  const freshness = formatFreshness(arena.sourceMeta.updatedAt)
  const ctaLabel = selected
    ? 'Открыто'
    : arena.bookingMode === 'slot_calendar'
      ? 'Подробнее'
      : 'Забронировать'

  return (
    <IceCard
      ref={ref}
      padding="m"
      className={[
        'rink-card',
        selected ? 'rink-card--selected' : '',
        handleSelect ? 'rink-card--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role={handleSelect ? 'button' : undefined}
      tabIndex={handleSelect ? 0 : undefined}
      aria-pressed={handleSelect ? selected : undefined}
      onClick={handleSelect}
      onKeyDown={handleSelect ? handleKeyDown : undefined}
      data-testid={testId('arenas', 'rink', 'card', arena.id)}
    >
      <div className="hockey-stack hockey-stack--gap-10">
        <div className="hockey-row hockey-row--gap-8 hockey-row--between">
          <Text
            variant="subheader-2"
            data-testid={testId('arenas', 'rink', 'text', 'name', arena.id)}
          >
            {arena.name}
          </Text>
          <div className="hockey-row hockey-row--gap-8">
            <div data-testid={testId('arenas', 'rink', 'badge', 'profile', arena.id)}>
              <EntityProfileBadge kind="arena" />
            </div>
            <span
              className={`rink-card__mode rink-card__mode--${arena.bookingMode}`}
              data-testid={testId('arenas', 'rink', 'badge', 'mode', arena.id)}
            >
              {BOOKING_MODE_LABELS[arena.bookingMode]}
            </span>
          </div>
        </div>
        {showSlotLamp && (
          <span
            className={`rink-slot-lamp${hasFreeSlot ? '' : ' rink-slot-lamp--busy'}`}
            aria-label={hasFreeSlot ? 'Есть свободные слоты' : 'Слоты заняты'}
            data-testid={testId('arenas', 'rink', 'badge', 'slot-lamp', arena.id)}
          >
            <span className="rink-slot-lamp__dot" aria-hidden />
            {hasFreeSlot ? 'Слот свободен' : 'Занято'}
          </span>
        )}
        <Text color="secondary" data-testid={testId('arenas', 'rink', 'text', 'address', arena.id)}>
          {arena.address}
        </Text>
        {arena.metro && (
          <Text color="secondary" data-testid={testId('arenas', 'rink', 'text', 'metro', arena.id)}>
            м. {arena.metro}
            {arena.district ? ` · ${arena.district}` : ''}
          </Text>
        )}
        {arena.phone && (
          <Text color="secondary" data-testid={testId('arenas', 'rink', 'text', 'phone', arena.id)}>
            {arena.phone}
          </Text>
        )}
        {arena.priceRange && (
          <ScoreboardText
            tone="accent"
            data-testid={testId('arenas', 'rink', 'text', 'price', arena.id)}
          >
            {arena.priceRange}
          </ScoreboardText>
        )}
        <Text
          color="secondary"
          data-testid={testId('arenas', 'rink', 'text', 'amenities', arena.id)}
        >
          Удобства: {arena.amenities.join(', ')}
        </Text>
        <div
          className="hockey-row hockey-row--gap-8 hockey-row--between"
          data-testid={testId('arenas', 'rink', 'badge', 'source', arena.id)}
        >
          <SourceMetaBadge sourceMeta={arena.sourceMeta} />
          {freshness && (
            <Text
              color="secondary"
              data-testid={testId('arenas', 'rink', 'text', 'freshness', arena.id)}
            >
              Обновлено {freshness}
            </Text>
          )}
        </div>

        <div className="hockey-row hockey-row--gap-8">
          {arena.bookingMode === 'external_portal' && (
            <ExternalBookingButton arena={arena} size="s" label="Заявка на лёд" />
          )}
          {handleSelect && (
            <HockeyButton
              view={selected ? 'action' : 'outlined'}
              size="s"
              onClick={(e) => {
                e.stopPropagation()
                handleSelect()
              }}
              data-testid={testId('arenas', 'rink', 'btn', 'open', arena.id)}
            >
              {ctaLabel}
            </HockeyButton>
          )}
        </div>
      </div>
    </IceCard>
  )
})
