/**
 * SPEC-FR-6.2.1, SPEC-FR-6.2.2, SPEC-FR-6.4.2
 * SPEC-UI-1.3, SPEC-UI-2.2
 */

import {Text} from '@gravity-ui/uikit'
import {forwardRef} from 'react'

import type {Arena} from '@/entities/arena'
import {formatArenaAmenities} from '@/entities/arena'
import {FavoriteButton} from '@/features/favorites'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

const BOOKING_MODE_LABELS = {
  slot_calendar: 'Слоты',
  external_portal: 'Заявка',
} as const

/** @spec SPEC-FR-6.2.1 - Props карточки катка */
export interface RinkCardProps {
  /** @spec SPEC-FR-6.2.1 */
  arena: Arena
  /** @spec SPEC-FR-6.2.2 */
  onOpenDetails?: (arenaId: string) => void
  /** @spec SPEC-UI-2.2 */
  hasFreeSlot?: boolean
  /** HOCFRONT-32E — число опубликованных объявлений льда */
  publishedListingsCount?: number
  /** @spec SPEC-FR-6.2.2 - Активная карточка (синхронизирована с картой) */
  selected?: boolean
}

/**
 * @spec SPEC-UI-2.2 - Ледовая карточка катка с лампой доступности
 * @spec SPEC-FR-6.2.1 - Карточка катка
 * @spec SPEC-FR-6.2.2 - Кликабельная карточка, открывающая детали
 */
export const RinkCard = forwardRef<HTMLDivElement, RinkCardProps>(function RinkCard(
  {arena, onOpenDetails, hasFreeSlot, publishedListingsCount = 0, selected = false},
  ref,
) {
  const handleSelect = onOpenDetails ? () => onOpenDetails(arena.id) : undefined
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!handleSelect) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect()
    }
  }

  const amenities =
    arena.amenities.length > 0 ? formatArenaAmenities(arena.amenities) : 'Удобства не указаны'
  const metroLine = arena.metro
    ? `м. ${arena.metro}${arena.district ? ` · ${arena.district}` : ''}`
    : arena.district || 'Метро не указано'

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
      <div className="rink-card__inner">
        <div className="rink-card__body">
          <div className="hockey-row hockey-row--gap-8 hockey-row--between hockey-row--align-start">
            <Text
              variant="header-2"
              className="rink-card__title hockey-entity-title--compact"
              data-testid={testId('arenas', 'rink', 'text', 'name', arena.id)}
            >
              {arena.name}
            </Text>
            <div
              className="arena-meta-chips"
              data-testid={testId('arenas', 'rink', 'panel', 'chips', arena.id)}
            >
              <FavoriteButton
                type="arena"
                entityId={arena.id}
                title={arena.name}
                className="arena-meta-chip arena-meta-chip--favorite"
              />
              <span
                className={`arena-meta-chip arena-meta-chip--${arena.bookingMode === 'slot_calendar' ? 'slots' : 'portal'}`}
                data-testid={testId('arenas', 'rink', 'badge', 'mode', arena.id)}
              >
                {BOOKING_MODE_LABELS[arena.bookingMode]}
              </span>
            </div>
          </div>

          <div
            className="rink-card__status"
            data-testid={testId('arenas', 'rink', 'panel', 'status', arena.id)}
          >
            {arena.bookingMode === 'slot_calendar' ? (
              <span
                className={`rink-slot-lamp${hasFreeSlot ? '' : ' rink-slot-lamp--busy'}`}
                aria-label={
                  hasFreeSlot === undefined
                    ? 'Статус слотов неизвестен'
                    : hasFreeSlot
                      ? 'Есть свободные слоты'
                      : 'Слоты заняты'
                }
                data-testid={testId('arenas', 'rink', 'badge', 'slot-lamp', arena.id)}
              >
                <span className="rink-slot-lamp__dot" aria-hidden />
                {hasFreeSlot === undefined
                  ? 'Слоты уточняются'
                  : hasFreeSlot
                    ? 'Есть свободные слоты'
                    : 'Сейчас занято'}
              </span>
            ) : (
              <span
                className="rink-slot-lamp rink-slot-lamp--portal"
                data-testid={testId('arenas', 'rink', 'badge', 'portal-status', arena.id)}
              >
                Запись по заявке
              </span>
            )}
          </div>

          <Text
            color="secondary"
            className="rink-card__address"
            data-testid={testId('arenas', 'rink', 'text', 'address', arena.id)}
          >
            {arena.address}
          </Text>
          <Text
            color="secondary"
            className="rink-card__metro"
            data-testid={testId('arenas', 'rink', 'text', 'metro', arena.id)}
          >
            {metroLine}
          </Text>
          <div className="rink-card__price">
            {arena.priceRange ? (
              <ScoreboardText
                tone="accent"
                data-testid={testId('arenas', 'rink', 'text', 'price', arena.id)}
              >
                {arena.priceRange}
              </ScoreboardText>
            ) : (
              <Text
                color="secondary"
                data-testid={testId('arenas', 'rink', 'text', 'price-empty', arena.id)}
              >
                Цена по запросу
              </Text>
            )}
          </div>
          <Text
            color="secondary"
            className="rink-card__amenities"
            data-testid={testId('arenas', 'rink', 'text', 'amenities', arena.id)}
          >
            {amenities}
          </Text>
          <Text
            color="secondary"
            className="rink-card__listings-hint"
            data-testid={testId('arenas', 'rink', 'text', 'listings', arena.id)}
          >
            {publishedListingsCount > 0
              ? `Объявлений льда: ${publishedListingsCount}`
              : 'Нет объявлений льда'}
          </Text>
        </div>

        {handleSelect && (
          <div className="rink-card__footer">
            <HockeyButton
              view="outlined"
              size="s"
              onClick={(e) => {
                e.stopPropagation()
                handleSelect()
              }}
              data-testid={testId('arenas', 'rink', 'btn', 'open', arena.id)}
            >
              {selected ? 'Открыто' : 'Подробнее'}
            </HockeyButton>
          </div>
        )}
      </div>
    </IceCard>
  )
})
